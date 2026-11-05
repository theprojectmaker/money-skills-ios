// Real stock data for the terminal, fetched natively (no browser CORS rules) so that a filtered Wi-Fi only has to allow ONE source:
// the Worker relay, either Yahoo host, CNBC or Nasdaq. The last good route is tried first (also after a restart), and routes that fail
// rest for a minute. When nothing answers, the last saved chart for that symbol is returned and marked stale.
import AsyncStorage from '@react-native-async-storage/async-storage';
import { cnbcCall, Get, nasdaqCall, NoData } from './sources';

const UA = 'Mozilla/5.0 (iPad; CPU OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1';
const ROUTE_MS = 5000;
const REST_MS = 60000;
const BEST_KEY = 'terminal:route';

export type Route = { name: string; label: string; call: (op: string, p: Record<string, string>, get: Get) => Promise<string> };

const query = (p: Record<string, string>) => Object.keys(p).map((k) => `${encodeURIComponent(k)}=${encodeURIComponent(p[k])}`).join('&');

const relayRoute = (name: string, label: string, base: string): Route => ({
  name, label,
  call: async (op, p, get) => {
    const r = await get(`${base}/${op}?${query(p)}`);
    if (r.status === 429 || r.status >= 500) throw new Error('route busy');
    const body = JSON.parse(r.text);                 // a filter's "blocked" page is HTML and lands here
    if (typeof body !== 'object' || body === null || body.ok === undefined) throw new Error('not an answer');
    return r.text;
  },
});
const yahooRoute = (name: string, label: string, host: string): Route => ({
  name, label,
  call: async (op, p, get) => {
    const url = op === 'chart' ? `https://${host}/v8/finance/chart/${encodeURIComponent(p.symbol)}?interval=${p.interval}&range=${p.range}&includePrePost=${p.prepost === '1'}&events=div%2Csplit`
      : op === 'spark' ? `https://${host}/v8/finance/spark?symbols=${p.symbols.split(',').map(encodeURIComponent).join(',')}&range=1d&interval=5m`
      : `https://${host}/v1/finance/search?q=${encodeURIComponent(p.q)}&quotesCount=10&newsCount=0&listsCount=0`;
    const r = await get(url, { 'User-Agent': UA, Accept: 'application/json' });
    if (r.status === 429 || r.status >= 500) throw new Error('route busy');
    const body = JSON.parse(r.text);
    if (typeof body !== 'object' || body === null) throw new Error('not an answer');
    return JSON.stringify(op === 'chart' ? normalizeChart(body) : op === 'spark' ? normalizeSpark(body) : normalizeSearch(body));
  },
});
const sourceRoute = (name: string, label: string, fn: typeof cnbcCall): Route => ({
  name, label,
  call: (op, p, get) => fn(op, p, async (url, headers) => {
    const r = await get(url, headers);
    if (r.status === 429 || r.status >= 500 || r.status === 403) throw new Error('route busy');
    return r;
  }),
});

export const ROUTES: Route[] = [
  relayRoute('worker', 'Paper Trader relay', 'https://papertrader-data.greatneck.workers.dev'),
  yahooRoute('yahoo1', 'Yahoo Finance', 'query1.finance.yahoo.com'),
  yahooRoute('yahoo2', 'Yahoo Finance (second address)', 'query2.finance.yahoo.com'),
  sourceRoute('cnbc', 'CNBC', cnbcCall),
  sourceRoute('nasdaq', 'Nasdaq', nasdaqCall),
];

// ---- Yahoo's answers in the relay's shape (same rules as paper-trader/worker/src/index.js) ------------------------------------
const num = (v: unknown): number | null => (typeof v === 'number' && isFinite(v) ? v : null);

function marketState(meta: any, nowSec: number) {
  const p = meta && meta.currentTradingPeriod;
  if (!p) return 'CLOSED';
  const within = (x: any) => x && nowSec >= x.start && nowSec < x.end;
  if (within(p.regular)) return 'REGULAR';
  if (within(p.pre)) return 'PRE';
  if (within(p.post)) return 'POST';
  return 'CLOSED';
}

export function normalizeChart(raw: any, nowSec = Math.floor(Date.now() / 1000)) {
  const result = raw?.chart?.result?.[0];
  if (!result) return { ok: false, error: raw?.chart?.error?.description || 'No data for that symbol.' };
  const meta = result.meta || {};
  const q = result.indicators?.quote?.[0] || {};
  const ts: number[] = result.timestamp || [];
  const candles: number[][] = [];
  for (let i = 0; i < ts.length; i++) {
    const o = num(q.open?.[i]), h = num(q.high?.[i]), l = num(q.low?.[i]), c = num(q.close?.[i]);
    if (o === null || h === null || l === null || c === null) continue;
    candles.push([ts[i], o, h, l, c, num(q.volume?.[i]) || 0]);
  }
  const periods = meta.currentTradingPeriod || {};
  return {
    ok: true, symbol: meta.symbol, name: meta.longName || meta.shortName || meta.symbol, currency: meta.currency || 'USD',
    exchange: meta.fullExchangeName || meta.exchangeName || '', type: meta.instrumentType || '', tz: meta.exchangeTimezoneName || 'UTC',
    gmtoffset: num(meta.gmtoffset) || 0,
    price: num(meta.regularMarketPrice) !== null ? meta.regularMarketPrice : candles.length ? candles[candles.length - 1][4] : null,
    prevClose: num(meta.chartPreviousClose) !== null ? meta.chartPreviousClose : num(meta.previousClose),
    dayHigh: num(meta.regularMarketDayHigh), dayLow: num(meta.regularMarketDayLow), volume: num(meta.regularMarketVolume),
    time: num(meta.regularMarketTime) || (candles.length ? candles[candles.length - 1][0] : nowSec),
    state: marketState(meta, nowSec),
    regular: periods.regular ? { start: periods.regular.start, end: periods.regular.end } : null,
    interval: meta.dataGranularity || '', candles,
  };
}

export function normalizeSpark(raw: any) {
  const quotes: any[] = [];
  for (const key of Object.keys(raw || {})) {
    const e = raw[key];
    if (!e || !Array.isArray(e.close)) continue;
    const closes = e.close.filter((v: unknown) => num(v) !== null);
    const price = num(e.fulldayPrice) !== null ? e.fulldayPrice : closes.length ? closes[closes.length - 1] : null;
    const prev = num(e.chartPreviousClose) !== null ? e.chartPreviousClose : num(e.previousClose);
    const change = price !== null && prev ? price - prev : null;
    quotes.push({
      symbol: e.symbol || key, price, prevClose: prev, change, changePct: change !== null && prev ? (change / prev) * 100 : null,
      time: e.timestamp?.length ? e.timestamp[e.timestamp.length - 1] : null, spark: closes.slice(-60),
    });
  }
  return { ok: true, quotes };
}

export function normalizeSearch(raw: any) {
  const results = (raw?.quotes || [])
    .filter((x: any) => x?.symbol && /^[A-Za-z0-9.^=\-]{1,18}$/.test(x.symbol) && x.isYahooFinance !== false)
    .map((x: any) => ({ symbol: x.symbol, name: x.longname || x.shortname || x.symbol, exchange: x.exchDisp || x.exchange || '', type: x.quoteType || x.typeDisp || '' }))
    .slice(0, 10);
  return { ok: true, results };
}

// ---- Routing -----------------------------------------------------------------------------------------------------------------
export type Deps = { fetchImpl?: typeof fetch; now?: () => number; storage?: Pick<typeof AsyncStorage, 'getItem' | 'setItem'>; routes?: Route[] };

function makeGet(fetchImpl: typeof fetch): Get {
  return async (url, headers) => {
    const ctl = new AbortController();
    const timer = setTimeout(() => ctl.abort(), ROUTE_MS);
    try {
      const res = await fetchImpl(url, { signal: ctl.signal, headers: headers ?? {} });
      return { status: res.status, text: await res.text() };
    } finally {
      clearTimeout(timer);
    }
  };
}

export function createRelay({ fetchImpl = fetch, now = Date.now, storage = AsyncStorage, routes = ROUTES }: Deps = {}) {
  const get = makeGet(fetchImpl);
  let best = 0, loadedBest = false;
  const restUntil = routes.map(() => 0);
  const lastSave = new Map<string, number>();

  const cacheKey = (op: string, p: Record<string, string>) =>
    op === 'chart' ? `terminal:c:${p.symbol}|${p.interval}|${p.range}` : op === 'spark' ? `terminal:s:${p.symbols}` : '';

  async function remember(key: string, text: string) {
    if (!key || !text.startsWith('{"ok":true')) return;
    const t = now();
    if (t - (lastSave.get(key) || 0) < 120000) return;     // charts poll every few seconds; saving a couple of times an hour per range is plenty
    lastSave.set(key, t);
    try { await storage.setItem(key, text); } catch { /* the cache is a bonus */ }
  }

  return async function relay(op: string, params: Record<string, string>): Promise<string> {
    if (op !== 'chart' && op !== 'spark' && op !== 'search' && op !== 'health') throw new Error('Unknown request.');
    if (op === 'health') return '{"ok":true}';
    if (!loadedBest) {
      loadedBest = true;
      try {
        const saved = await storage.getItem(BEST_KEY);
        const i = routes.findIndex((r) => r.name === saved);
        if (i >= 0) best = i;
      } catch { /* start from the first */ }
    }
    const t = now();
    const order = routes.map((_, i) => i).filter((i) => restUntil[i] <= t).sort((a, b) => (a === best ? -1 : b === best ? 1 : a - b));
    const key = cacheKey(op, params);
    for (const i of order) {
      try {
        const text = await routes[i].call(op, params, get);
        if (i !== best) { best = i; storage.setItem(BEST_KEY, routes[i].name).catch(() => {}); }
        restUntil[i] = 0;
        void remember(key, text);
        return text;
      } catch (err) {
        if (!(err as NoData)?.isNoData) restUntil[i] = now() + REST_MS;
      }
    }
    // Nothing answered: rest briefly so the next poll is instant, then try every route again.
    if (restUntil.every((u) => u > now())) { const soon = now() + 15000; for (let i = 0; i < restUntil.length; i++) restUntil[i] = Math.min(restUntil[i], soon); }
    if (key) {
      try {
        const saved = await storage.getItem(key);
        if (saved) return '{"_stale":true,' + saved.slice(1);
      } catch { /* no saved copy */ }
    }
    throw new Error('This network is blocking the stock data sources. Open Tools, then Connection, to see which ones.');
  };
}

export type CheckResult = { label: string; ok: boolean; detail: string };

/** Tools > Connection: asks each source for Apple's chart, and reports what this network allows. */
export async function checkRoutes({ fetchImpl = fetch, routes = ROUTES }: Pick<Deps, 'fetchImpl' | 'routes'> = {}): Promise<CheckResult[]> {
  const get = makeGet(fetchImpl);
  const results = await Promise.all(routes.map(async (r): Promise<CheckResult> => {
    const t = Date.now();
    try {
      const body = JSON.parse(await r.call('chart', { symbol: 'AAPL', interval: '5m', range: '1d' }, get));
      if (body.ok && body.candles?.length) return { label: r.label, ok: true, detail: `Works: Apple at ${Number(body.price).toFixed(2)}, ${((Date.now() - t) / 1000).toFixed(1)}s` };
      return { label: r.label, ok: false, detail: 'Answered, but with no prices' };
    } catch (e) {
      const msg = String((e as Error)?.message ?? e);
      return { label: r.label, ok: false, detail: /abort/i.test(msg) ? 'Blocked or too slow (no answer in 5s)' : /JSON|Unexpected|not an answer/i.test(msg) ? 'Blocked (a filter page came back)' : /busy/.test(msg) ? 'Refused or busy' : 'Blocked (could not connect)' };
    }
  }));
  let internet: CheckResult;
  try {
    const r = await get('https://www.apple.com/library/test/success.html');
    internet = { label: 'General internet (apple.com)', ok: r.status === 200, detail: r.status === 200 ? 'Works' : `Status ${r.status}` };
  } catch { internet = { label: 'General internet (apple.com)', ok: false, detail: 'Could not connect' }; }
  return [internet, ...results];
}
