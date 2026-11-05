import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRelay, normalizeChart, normalizeSpark } from '../src/terminal/relay';

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
