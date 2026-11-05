// Extra stock data sources for networks that block the relay and Yahoo: CNBC and Nasdaq, turned into the relay's answer shape.
// Both are unofficial and US-focused. A symbol or request a source cannot serve throws NoData, which moves on without resting the source.
export class NoData extends Error { isNoData = true; }

export type Get = (url: string, headers?: Record<string, string>) => Promise<{ status: number; text: string }>;
type Row = number[]; // [time, open, high, low, close, volume]

const money = (v: unknown) => { const n = parseFloat(String(v ?? '').replace(/[$,%\s]/g, '')); return Number.isFinite(n) ? n : null; };
export const plainStock = (s: string) => /^[A-Z]{1,6}(-[A-Z])?$/.test(s) && !s.endsWith('-USD');

/** Eastern time offset in seconds for a UTC moment: US daylight time runs from the second Sunday of March to the first Sunday of November, 2 AM. */
export function easternOffset(sec: number): number {
  const d = new Date(sec * 1000), y = d.getUTCFullYear();
  const sunday = (month: number, nth: number) => { const first = new Date(Date.UTC(y, month, 1)).getUTCDay(); return 1 + ((7 - first) % 7) + (nth - 1) * 7; };
  const start = Date.UTC(y, 2, sunday(2, 2), 7) / 1000, end = Date.UTC(y, 10, sunday(10, 1), 6) / 1000;
  return sec >= start && sec < end ? -14400 : -18000;
}

/** Combines finer bars into `sec`-long bars on round clock times. */
export function combine(rows: Row[], sec: number): Row[] {
  const out: Row[] = [];
  for (const r of rows) {
    const t = Math.floor(r[0] / sec) * sec, last = out[out.length - 1];
    if (last && last[0] === t) { last[2] = Math.max(last[2], r[2]); last[3] = Math.min(last[3], r[3]); last[4] = r[4]; last[5] += r[5]; }
    else out.push([t, r[1], r[2], r[3], r[4], r[5]]);
  }
  return out;
}

const SECONDS: Record<string, number> = { '1m': 60, '2m': 120, '5m': 300, '15m': 900, '30m': 1800, '60m': 3600, '90m': 5400, '1h': 3600 };

/** The relay's chart answer for a US stock. */
function chartAnswer(symbol: string, name: string, exchange: string, rows: Row[], interval: string, daily: boolean, nowSec: number) {
  if (!rows.length) throw new NoData('no bars');
  const lastT = rows[rows.length - 1][0];
  const off = easternOffset(lastT);
  const dayStart = Math.floor((lastT + off) / 86400) * 86400 - off;
  const start = dayStart + 34200, end = dayStart + 57600;
  let prevClose: number | null = null;
  for (let i = rows.length - 1; i >= 0; i--) if (rows[i][0] < dayStart) { prevClose = rows[i][4]; break; }
  if (daily && rows.length > 1) prevClose = rows[rows.length - 2][4];
  return {
    ok: true, symbol, name, currency: 'USD', exchange, type: 'EQUITY', tz: 'America/New_York', gmtoffset: off,
    price: rows[rows.length - 1][4], prevClose, dayHigh: null, dayLow: null, volume: null, time: lastT,
    state: nowSec >= start && nowSec < end ? 'REGULAR' : 'CLOSED', regular: { start, end }, interval, candles: rows,
  };
}

// ---- CNBC ------------------------------------------------------------------------------------------------------------------
const CNBC_UA = 'Mozilla/5.0 (iPad; CPU OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1';
const cnbcSymbol = (s: string) => s.replace('-', '.');

export async function cnbcCall(op: string, p: Record<string, string>, get: Get, nowSec = Math.floor(Date.now() / 1000)): Promise<string> {
  const headers = { 'User-Agent': CNBC_UA, Accept: 'application/json' };
  if (op === 'spark') {
    const wanted = p.symbols.split(',').filter(plainStock);
    if (!wanted.length) throw new NoData('no stocks');
    const r = await get('https://quote.cnbc.com/quote-html-webservice/restQuote/symbolType/symbol?symbols=' + wanted.map(cnbcSymbol).map(encodeURIComponent).join('%7C') + '&requestMethod=itv&noform=1&partnerId=2&fund=1&exthrs=0&output=json&events=0', headers);
    const list = JSON.parse(r.text)?.FormattedQuoteResult?.FormattedQuote;
    if (!Array.isArray(list)) throw new Error('not an answer');
    const quotes = list.filter((q: any) => q.code === 0 && money(q.last) !== null).map((q: any) => {
      const price = money(q.last), prev = money(q.previous_day_closing), change = money(q.change), t = Date.parse(String(q.last_time || '').replace(/([+-]\d\d)(\d\d)$/, '$1:$2'));
      return { symbol: wanted.find((s) => cnbcSymbol(s) === q.symbol) || q.symbol, price, prevClose: prev, change, changePct: change !== null && prev ? (change / prev) * 100 : null, time: Number.isFinite(t) ? Math.floor(t / 1000) : null, spark: [] };
    });
    return JSON.stringify({ ok: true, quotes });
  }
  if (op !== 'chart' || !plainStock(p.symbol)) throw new NoData('unsupported');
  const daily = p.interval === '1d', weekly = p.interval === '1wk';
  const sec = SECONDS[p.interval];
  if (!daily && !weekly && !sec) throw new NoData('unsupported interval');
  const window = weekly ? '5Y' : daily ? '6M' : sec === 60 ? '1D' : '5D';
  const r = await get(`https://ts-api.cnbc.com/harmony/app/charts/${window}.json?symbol=${encodeURIComponent(cnbcSymbol(p.symbol))}`, headers);
  const body = JSON.parse(r.text);
  if (body?.status === 'ERROR') throw new NoData('unknown symbol');
  const bars = body?.barData?.priceBars;
  if (!Array.isArray(bars)) throw new Error('not an answer');
  let rows: Row[] = [];
  for (const b of bars) {
    const o = money(b.open), h = money(b.high), l = money(b.low), c = money(b.close), t = Math.floor(Number(b.tradeTimeinMills) / 1000);
    if (o === null || h === null || l === null || c === null || !t) continue;
    // tradeTime is New York local time (yyyymmddhhmmss): outside the regular session unless pre/post was asked for
    const hhmm = Number(String(b.tradeTime || '').slice(8, 12));
    if (!daily && !weekly && p.prepost !== '1' && (hhmm < 930 || hhmm >= 1600)) continue;
    rows.push([weekly ? t + 86400 : t, o, h, l, c, Number(b.volume) || 0]); // weekly bars are stamped Sunday; the chart's weeks start Monday
  }
  if (sec) rows = combine(rows, sec);
  if (daily) rows = rows.concat(await cnbcRecentDays(cnbcSymbol(p.symbol), rows.length ? rows[rows.length - 1][0] : 0, headers, get));
  return JSON.stringify(chartAnswer(p.symbol, body.barData.companyName || p.symbol, body.barData.exchange || 'CNBC', rows, p.interval, daily || weekly, nowSec));
}

/** CNBC's daily series ends a day or two behind, so the newest days are built from its 5-minute bars. */
async function cnbcRecentDays(symbol: string, lastDaily: number, headers: Record<string, string>, get: Get): Promise<Row[]> {
  try {
    const r = await get(`https://ts-api.cnbc.com/harmony/app/charts/5D.json?symbol=${encodeURIComponent(symbol)}`, headers);
    const days = new Map<string, Row>();
    for (const b of JSON.parse(r.text)?.barData?.priceBars ?? []) {
      const stamp = String(b.tradeTime || ''), hhmm = Number(stamp.slice(8, 12));
      const o = money(b.open), h = money(b.high), l = money(b.low), c = money(b.close), t = Math.floor(Number(b.tradeTimeinMills) / 1000);
      if (o === null || h === null || l === null || c === null || !t || hhmm < 930 || hhmm >= 1600) continue;
      const day = stamp.slice(0, 8), row = days.get(day);
      if (row) { row[2] = Math.max(row[2], h); row[3] = Math.min(row[3], l); row[4] = c; row[5] += Number(b.volume) || 0; }
      else days.set(day, [t, o, h, l, c, Number(b.volume) || 0]);
    }
    // a daily bar is stamped at midnight New York; anything starting more than a day after it is a newer session
    return [...days.values()].filter((row) => row[0] > lastDaily + 86400);
  } catch {
    return [];                                    // the older days are still worth showing
  }
}

// ---- Nasdaq ----------------------------------------------------------------------------------------------------------------
const NASDAQ = 'https://api.nasdaq.com/api/quote/';
const nasdaqHeaders = { 'User-Agent': CNBC_UA, Accept: 'application/json, text/plain, */*' };

async function nasdaqJson(path: string, symbol: string, get: Get): Promise<any> {
  for (const assetclass of ['stocks', 'etf']) {
    const r = await get(`${NASDAQ}${encodeURIComponent(symbol)}/${path}${path.includes('?') ? '&' : '?'}assetclass=${assetclass}`, nasdaqHeaders);
    const body = JSON.parse(r.text);
    if (body && 'data' in body && body.data) return body.data;
    if (!body || !('data' in body)) throw new Error('not an answer');
  }
  throw new NoData('unknown symbol');
}

export async function nasdaqCall(op: string, p: Record<string, string>, get: Get, nowSec = Math.floor(Date.now() / 1000)): Promise<string> {
  if (op === 'spark') {
    const wanted = p.symbols.split(',').filter(plainStock).slice(0, 16);
    if (!wanted.length) throw new NoData('no stocks');
    const got = await Promise.all(wanted.map(async (symbol) => {
      try {
        const d = (await nasdaqJson('info', symbol, get))?.primaryData;
        const price = money(d?.lastSalePrice), change = money(d?.netChange);
        if (price === null) return null;
        const prev = change !== null ? price - change : null;
        return { symbol, price, prevClose: prev, change, changePct: change !== null && prev ? (change / prev) * 100 : null, time: nowSec, spark: [] };
      } catch { return null; }
    }));
    const quotes = got.filter(Boolean);
    if (!quotes.length) throw new Error('not an answer');
    return JSON.stringify({ ok: true, quotes });
  }
  if (op !== 'chart' || !plainStock(p.symbol)) throw new NoData('unsupported');
  const symbol = p.symbol.replace('-', '.');
  if (p.interval === '1d' || p.interval === '1wk') {
    const today = new Date(nowSec * 1000).toISOString().slice(0, 10);
    const d = await nasdaqJson(`historical?fromdate=${Number(today.slice(0, 4)) - 10}-01-01&todate=${today}&limit=3000`, symbol, get);
    const rows: Row[] = [];
    for (const r of d?.tradesTable?.rows || []) {
      const [m, day, y] = String(r.date).split('/').map(Number);
      const o = money(r.open), h = money(r.high), l = money(r.low), c = money(r.close);
      if (!y || o === null || h === null || l === null || c === null) continue;
      rows.push([Date.UTC(y, m - 1, day) / 1000, o, h, l, c, money(r.volume) || 0]);
    }
    rows.reverse();
    return JSON.stringify(chartAnswer(p.symbol, symbol, 'Nasdaq', rows, p.interval, true, nowSec));
  }
  const sec = SECONDS[p.interval];
  if (!sec) throw new NoData('unsupported interval');
  const d = await nasdaqJson('chart?charttype=rs', symbol, get);
  const minutes: Row[] = [];
  for (const b of d?.chart || []) {
    // x is New York local time written as if it were UTC, and this source has one price and share count per minute
    const local = Math.floor(Number(b.x) / 1000);
    const c = Number(b.y);
    if (!local || !Number.isFinite(c)) continue;
    const t = local - easternOffset(local + 18000);
    const hhmm = Math.floor((local % 86400) / 60);
    if (p.prepost !== '1' && (hhmm < 570 || hhmm >= 960)) continue;
    minutes.push([t, c, c, c, c, Number(b.w) || 0]);
  }
  return JSON.stringify(chartAnswer(p.symbol, d?.company || symbol, 'Nasdaq', combine(minutes, sec), p.interval, false, nowSec));
}
