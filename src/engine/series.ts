// Turns the one-minute data into chart timeframes and a "window" of the newest bars up to the sim clock.
import { dayOf, minOfDay, minuteTime, minutesFor, MinuteData, SESSION_MIN, TOTAL_MIN, DAYS } from './generator';

export type Tf = '1m' | '5m' | '15m' | '30m' | '1h' | '1D' | '1W';
export const TIMEFRAMES: Tf[] = ['1m', '5m', '15m', '30m', '1h', '1D', '1W'];
export const TF_MINUTES: Record<Tf, number> = { '1m': 1, '5m': 5, '15m': 15, '30m': 30, '1h': 60, '1D': SESSION_MIN, '1W': SESSION_MIN * 5 };

export type Agg = { n: number; startM: Int32Array; endM: Int32Array; o: Float64Array; h: Float64Array; l: Float64Array; c: Float64Array; v: Float64Array };

export function aggregate(d: MinuteData, tf: Tf): Agg {
  const size = TF_MINUTES[tf];
  let n = 0;
  const cap = tf === '1m' ? TOTAL_MIN : Math.ceil(TOTAL_MIN / Math.min(size, SESSION_MIN)) + DAYS;
  const startM = new Int32Array(cap), endM = new Int32Array(cap);
  const o = new Float64Array(cap), h = new Float64Array(cap), l = new Float64Array(cap), c = new Float64Array(cap), v = new Float64Array(cap);
  let curKey = -1;
  for (let m = 0; m < TOTAL_MIN; m++) {
    const day = dayOf(m);
    const k = m - day * SESSION_MIN;
    const key = tf === '1W' ? Math.floor(day / 5) : tf === '1D' ? day : day * 1000 + Math.floor(k / size);
    if (key !== curKey) {
      curKey = key;
      startM[n] = m;
      o[n] = d.o[m];
      h[n] = d.h[m];
      l[n] = d.l[m];
      c[n] = d.c[m];
      v[n] = d.v[m];
      endM[n] = m + 1;
      n++;
    } else {
      const i = n - 1;
      if (d.h[m] > h[i]) h[i] = d.h[m];
      if (d.l[m] < l[i]) l[i] = d.l[m];
      c[i] = d.c[m];
      v[i] += d.v[m];
      endM[i] = m + 1;
    }
  }
  return { n, startM: startM.subarray(0, n), endM: endM.subarray(0, n), o: o.subarray(0, n), h: h.subarray(0, n), l: l.subarray(0, n), c: c.subarray(0, n), v: v.subarray(0, n) };
}

const aggCache = new Map<string, Agg>();
export function aggFor(symbol: string, tf: Tf, season = 1): Agg {
  const key = `${symbol}#${season}#${tf}`;
  let a = aggCache.get(key);
  if (!a) {
    a = aggregate(minutesFor(symbol, season), tf);
    aggCache.set(key, a);
    if (aggCache.size > 24) aggCache.delete(aggCache.keys().next().value as string);
  }
  return a;
}

export type Bars = {
  n: number;
  t: Float64Array; // ms (exchange clock as UTC)
  day: Int32Array; // trading day index
  o: Float64Array; h: Float64Array; l: Float64Array; c: Float64Array; v: Float64Array;
  tf: Tf;
  symbol: string;
  cursor: number;
};

export const MAX_BARS = 3000;

/** The newest bars (at most MAX_BARS) known at sim minute `cursor`; the last one may be a partly formed bar. */
export function windowAt(symbol: string, tf: Tf, cursor: number, season = 1): Bars {
  const a = aggFor(symbol, tf, season);
  const md = minutesFor(symbol, season);
  // number of bars that have started by cursor
  let lo = 0, hi = a.n - 1, last = 0;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (a.startM[mid] <= cursor) { last = mid; lo = mid + 1; } else hi = mid - 1;
  }
  const count = Math.min(last + 1, MAX_BARS);
  const first = last + 1 - count;
  const t = new Float64Array(count), day = new Int32Array(count);
  const o = new Float64Array(count), h = new Float64Array(count), l = new Float64Array(count), c = new Float64Array(count), v = new Float64Array(count);
  for (let i = 0; i < count; i++) {
    const s = first + i;
    t[i] = minuteTime(a.startM[s]);
    day[i] = dayOf(a.startM[s]);
    o[i] = a.o[s]; h[i] = a.h[s]; l[i] = a.l[s]; c[i] = a.c[s]; v[i] = a.v[s];
  }
  // patch the forming bar from minutes we have actually "lived through"
  const li = count - 1;
  if (a.endM[last] - 1 > cursor) {
    const s = a.startM[last];
    let hh = md.h[s], ll = md.l[s], vv = 0;
    for (let m = s; m <= cursor; m++) {
      if (md.h[m] > hh) hh = md.h[m];
      if (md.l[m] < ll) ll = md.l[m];
      vv += md.v[m];
    }
    h[li] = hh; l[li] = ll; c[li] = md.c[cursor]; v[li] = vv;
  }
  return { n: count, t, day, o, h, l, c, v, tf, symbol, cursor };
}

export function lastPrice(symbol: string, cursor: number, season = 1): number {
  return minutesFor(symbol, season).c[cursor];
}

export function prevCloseOf(symbol: string, cursor: number, season = 1): number {
  const d = dayOf(cursor);
  if (d === 0) return minutesFor(symbol, season).o[0];
  return minutesFor(symbol, season).c[d * SESSION_MIN - 1];
}

export function dayOpenOf(symbol: string, cursor: number, season = 1): number {
  return minutesFor(symbol, season).o[dayOf(cursor) * SESSION_MIN];
}

export { dayOf, minOfDay };

export function fmtClock(ms: number): string {
  const d = new Date(ms);
  let h = d.getUTCHours();
  const m = d.getUTCMinutes();
  const ap = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${h}:${String(m).padStart(2, '0')} ${ap}`;
}
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export function fmtDate(ms: number): string {
  const d = new Date(ms);
  return `${MON[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
}
export function fmtAxis(ms: number, tf: Tf): string {
  const d = new Date(ms);
  return tf === '1D' || tf === '1W' ? `${MON[d.getUTCMonth()]} ${d.getUTCDate()}` : fmtClock(ms);
}
