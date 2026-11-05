import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRelay, normalizeChart, normalizeSpark } from '../src/terminal/relay';
import { easternOffset } from '../src/terminal/sources';

test('when everything else is blocked, CNBC gives the terminal a usable chart', async () => {
  const bar = (o: string, c: string, tradeTime: string, ms: number) => ({ open: o, high: '103', low: '99', close: c, volume: 5, tradeTime, tradeTimeinMills: ms });
  const cnbc = { barData: { companyName: 'Apple Inc.', exchange: 'NASDAQ', priceBars: [
    bar('100', '100.5', '20261105093000', Date.UTC(2026, 10, 5, 14, 30)),
    bar('100.5', '101', '20261105093100', Date.UTC(2026, 10, 5, 14, 31)),
    bar('101', '102', '20261105170000', Date.UTC(2026, 10, 5, 22, 0)),
  ] } };
  const fetchImpl = (async (url: string) => {
    if (!url.includes('cnbc.com')) throw new Error('blocked');
    return { status: 200, text: async () => JSON.stringify(cnbc) };
  }) as any;
  const store = { getItem: async () => null, setItem: async () => {} } as any;
  const body = JSON.parse(await createRelay({ fetchImpl, storage: store })('chart', { symbol: 'AAPL', interval: '5m', range: '1d' }));
  assert.equal(body.tz, 'America/New_York');
  assert.equal(body.gmtoffset, -18000);
  // the after-hours bar is dropped and the two minutes are combined into one 5m bar
  assert.deepEqual(body.candles, [[Date.UTC(2026, 10, 5, 14, 30) / 1000, 100, 103, 99, 101, 10]]);
});

test('crypto is never sent to the stock-only sources', async () => {
  const urls: string[] = [];
  const fetchImpl = (async (url: string) => { urls.push(url); throw new Error('blocked'); }) as any;
  const store = { getItem: async () => null, setItem: async () => {} } as any;
  await assert.rejects(createRelay({ fetchImpl, storage: store })('chart', { symbol: 'BTC-USD', interval: '5m', range: '1d' }));
  assert.ok(urls.length > 0 && urls.every((u) => !u.includes('cnbc') && !u.includes('nasdaq')));
});

test('Eastern offset follows daylight time', () => {
  assert.equal(easternOffset(Date.UTC(2026, 6, 1) / 1000), -14400);
  assert.equal(easternOffset(Date.UTC(2026, 10, 5) / 1000), -18000);
  assert.equal(easternOffset(Date.UTC(2026, 0, 5) / 1000), -18000);
});

const yahooChart = { chart: { result: [{ meta: { symbol: 'AAPL', regularMarketPrice: 101, gmtoffset: -18000, exchangeTimezoneName: 'America/New_York' }, timestamp: [1, 2], indicators: { quote: [{ open: [100, null], high: [102, 1], low: [99, 1], close: [101, 1], volume: [5, 1] }] } }] } };
const memory = () => { const m = new Map<string, string>(); return { getItem: async (k: string) => m.get(k) ?? null, setItem: async (k: string, v: string) => { m.set(k, v); } } as any; };
const reply = (status: number, body: unknown) => ({ status, text: async () => (typeof body === 'string' ? body : JSON.stringify(body)) }) as any;
const P = { symbol: 'AAPL', interval: '5m', range: '1d' };

test('Yahoo answers become the relay shape and bars with gaps are dropped', () => {
  const c: any = normalizeChart(yahooChart, 10);
  assert.equal(c.ok, true); assert.deepEqual(c.candles, [[1, 100, 102, 99, 101, 5]]); assert.equal(c.tz, 'America/New_York');
  assert.equal((normalizeChart({ chart: { error: { description: 'gone' } } }) as any).error, 'gone');
  const s: any = normalizeSpark({ AAPL: { symbol: 'AAPL', close: [1, null, 2], chartPreviousClose: 1, timestamp: [5] } });
  assert.deepEqual([s.quotes[0].price, s.quotes[0].change, s.quotes[0].changePct], [2, 1, 100]);
});

test('a blocked relay falls through to Yahoo, which is then tried first', async () => {
  const calls: string[] = [];
  const fetchImpl = (async (url: string) => {
    calls.push(url);
    return url.includes('workers.dev') ? reply(200, '<html>Blocked by your school</html>') : reply(200, yahooChart);
  }) as any;
  const relay = createRelay({ fetchImpl, storage: memory() });
  assert.equal(JSON.parse(await relay('chart', P)).symbol, 'AAPL');
  assert.ok(calls[0].includes('workers.dev') && calls[1].includes('query1'));
  calls.length = 0;
  await relay('chart', P);
  assert.equal(calls.length, 1); assert.ok(calls[0].includes('query1'));
});

test('a real "no such symbol" answer does not try other routes', async () => {
  let n = 0;
  const relay = createRelay({ fetchImpl: (async () => { n++; return reply(404, { ok: false, error: 'No data' }); }) as any, storage: memory() });
  assert.equal(JSON.parse(await relay('chart', P)).ok, false);
  assert.equal(n, 1);
});

test('with nothing reachable it serves the saved chart marked stale, or fails plainly', async () => {
  const storage = memory();
  let up = true;
  const fetchImpl = (async () => { if (!up) throw new Error('offline'); return reply(200, { ok: true, candles: [[1, 1, 1, 1, 1, 1]] }); }) as any;
  const relay = createRelay({ fetchImpl, storage });
  await relay('chart', P);
  await new Promise((r) => setTimeout(r, 5));
  up = false;
  const stale = await relay('chart', P);
  assert.ok(stale.startsWith('{"_stale":true')); assert.deepEqual(JSON.parse(stale).candles, [[1, 1, 1, 1, 1, 1]]);
  await assert.rejects(relay('chart', { ...P, symbol: 'MSFT' }));
  assert.equal(await relay('health', {}), '{"ok":true}');
});
