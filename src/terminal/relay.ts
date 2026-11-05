// Real stock data for the terminal, fetched natively (no browser CORS rules) so that a filtered Wi-Fi only has to allow ONE of these:
// the Worker relay or either Yahoo host. The last good route is tried first, routes that fail rest for a minute.
// When nothing answers, the last saved chart for that symbol is returned and marked stale, so the terminal still opens.
import AsyncStorage from '@react-native-async-storage/async-storage';

type Route = { name: string; url: (op: string, p: Record<string, string>) => string; direct: boolean };

const relayRoute = (name: string, base: string): Route => ({
  name, direct: false, url: (op, p) => `${base}/${op}?${new URLSearchParams(p).toString()}`,
});
const yahooRoute = (host: string): Route => ({
  name: host, direct: true,
  url: (op, p) => {
    if (op === 'chart') return `https://${host}/v8/finance/chart/${encodeURIComponent(p.symbol)}?interval=${p.interval}&range=${p.range}&includePrePost=${p.prepost === '1'}&events=div%2Csplit`;
    if (op === 'spark') return `https://${host}/v8/finance/spark?symbols=${p.symbols.split(',').map(encodeURIComponent).join(',')}&range=1d&interval=5m`;
    return `https://${host}/v1/finance/search?q=${encodeURIComponent(p.q)}&quotesCount=10&newsCount=0&listsCount=0`;
  },
});

export const ROUTES: Route[] = [
  relayRoute('worker', 'https://papertrader-data.greatneck.workers.dev'),
  yahooRoute('query1.finance.yahoo.com'),
  yahooRoute('query2.finance.yahoo.com'),
];
const UA = 'Mozilla/5.0 (iPad; CPU OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1';
const ROUTE_MS = 6000;
const REST_MS = 60000;

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

const fromYahoo = (op: string, raw: any) => (op === 'chart' ? normalizeChart(raw) : op === 'spark' ? normalizeSpark(raw) : normalizeSearch(raw));

// ---- Routing -----------------------------------------------------------------------------------------------------------------
export type Deps = { fetchImpl?: typeof fetch; now?: () => number; storage?: Pick<typeof AsyncStorage, 'getItem' | 'setItem'> };

export function createRelay({ fetchImpl = fetch, now = Date.now, storage = AsyncStorage }: Deps = {}) {
  let best = 0;
  const restUntil = ROUTES.map(() => 0);
  const lastSave = new Map<string, number>();

  async function tryRoute(route: Route, op: string, params: Record<string, string>): Promise<string> {
    const ctl = new AbortController();
    const timer = setTimeout(() => ctl.abort(), ROUTE_MS);
    try {
      const res = await fetchImpl(route.url(op, params), { signal: ctl.signal, headers: route.direct ? { 'User-Agent': UA, Accept: 'application/json' } : {} });
      const text = await res.text();
      if (res.status === 429 || res.status >= 500) throw new Error('route busy');
      const body = JSON.parse(text);                 // a filter's "blocked" page is HTML and lands here
      if (typeof body !== 'object' || body === null) throw new Error('not an answer');
      if (!route.direct && body.ok === undefined) throw new Error('not an answer');
      return route.direct ? JSON.stringify(fromYahoo(op, body)) : text;
    } finally {
      clearTimeout(timer);
    }
  }

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
    const t = now();
    const order = ROUTES.map((_, i) => i).filter((i) => restUntil[i] <= t).sort((a, b) => (a === best ? -1 : b === best ? 1 : a - b));
    const key = cacheKey(op, params);
    for (const i of order) {
      try {
        const text = await tryRoute(ROUTES[i], op, params);
        best = i;
        restUntil[i] = 0;
        void remember(key, text);
        return text;
      } catch {
        restUntil[i] = now() + REST_MS;
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
    throw new Error("Can't reach the price data on this network.");
  };
}
