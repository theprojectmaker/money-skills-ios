// Indicators over a Bars window. NaN marks "not enough data yet".
import type { Bars } from './series';

export type IndicatorId = 'vol' | 'sma20' | 'sma50' | 'ema9' | 'ema21' | 'bb' | 'vwap' | 'rsi' | 'macd';
export const INDICATORS: { id: IndicatorId; label: string; pane: 'overlay' | 'sub'; hint: string }[] = [
  { id: 'vol', label: 'Volume', pane: 'sub', hint: 'How many shares traded in each bar' },
  { id: 'sma20', label: 'SMA 20', pane: 'overlay', hint: 'Simple average of the last 20 closes' },
  { id: 'sma50', label: 'SMA 50', pane: 'overlay', hint: 'Simple average of the last 50 closes' },
  { id: 'ema9', label: 'EMA 9', pane: 'overlay', hint: 'Fast average that reacts quickly' },
  { id: 'ema21', label: 'EMA 21', pane: 'overlay', hint: 'Medium average that reacts more slowly' },
  { id: 'bb', label: 'Bollinger 20,2', pane: 'overlay', hint: 'A band two standard deviations around the SMA 20' },
  { id: 'vwap', label: 'VWAP', pane: 'overlay', hint: 'Volume-weighted average price for the day' },
  { id: 'rsi', label: 'RSI 14', pane: 'sub', hint: 'Momentum from 0 to 100; above 70 stretched up, below 30 stretched down' },
  { id: 'macd', label: 'MACD 12,26,9', pane: 'sub', hint: 'Difference of two EMAs, with a signal line and histogram' },
];

export function sma(src: ArrayLike<number>, len: number): Float64Array {
  const out = new Float64Array(src.length).fill(NaN);
  let sum = 0;
  for (let i = 0; i < src.length; i++) {
    sum += src[i];
    if (i >= len) sum -= src[i - len];
    if (i >= len - 1) out[i] = sum / len;
  }
  return out;
}

export function ema(src: ArrayLike<number>, len: number): Float64Array {
  const out = new Float64Array(src.length).fill(NaN);
  const k = 2 / (len + 1);
  let prev = NaN;
  let sum = 0;
  for (let i = 0; i < src.length; i++) {
    if (i < len - 1) { sum += src[i]; continue; }
    if (i === len - 1) { sum += src[i]; prev = sum / len; out[i] = prev; continue; }
    prev = src[i] * k + prev * (1 - k);
    out[i] = prev;
  }
  return out;
}

/** Wilder's RSI. */
export function rsi(src: ArrayLike<number>, len = 14): Float64Array {
  const out = new Float64Array(src.length).fill(NaN);
  if (src.length <= len) return out;
  let g = 0, l = 0;
  for (let i = 1; i <= len; i++) {
    const d = src[i] - src[i - 1];
    if (d >= 0) g += d; else l -= d;
  }
  g /= len; l /= len;
  out[len] = l === 0 ? 100 : 100 - 100 / (1 + g / l);
  for (let i = len + 1; i < src.length; i++) {
    const d = src[i] - src[i - 1];
    g = (g * (len - 1) + (d > 0 ? d : 0)) / len;
    l = (l * (len - 1) + (d < 0 ? -d : 0)) / len;
    out[i] = l === 0 ? 100 : 100 - 100 / (1 + g / l);
  }
  return out;
}

export function macd(src: ArrayLike<number>, fast = 12, slow = 26, sig = 9) {
  const f = ema(src, fast), s = ema(src, slow);
  const line = new Float64Array(src.length).fill(NaN);
  for (let i = 0; i < src.length; i++) if (!Number.isNaN(f[i]) && !Number.isNaN(s[i])) line[i] = f[i] - s[i];
  // signal = EMA of the valid part of the line
  const first = line.findIndex((x) => !Number.isNaN(x));
  const signal = new Float64Array(src.length).fill(NaN);
  if (first >= 0) {
    const part = ema(Array.from(line.subarray(first)), sig);
    for (let i = 0; i < part.length; i++) signal[first + i] = part[i];
  }
  const hist = new Float64Array(src.length).fill(NaN);
  for (let i = 0; i < src.length; i++) if (!Number.isNaN(line[i]) && !Number.isNaN(signal[i])) hist[i] = line[i] - signal[i];
  return { line, signal, hist };
}

export function bollinger(src: ArrayLike<number>, len = 20, mult = 2) {
  const mid = sma(src, len);
  const up = new Float64Array(src.length).fill(NaN), lo = new Float64Array(src.length).fill(NaN);
  for (let i = len - 1; i < src.length; i++) {
    let s = 0;
    for (let j = i - len + 1; j <= i; j++) { const d = src[j] - mid[i]; s += d * d; }
    const sd = Math.sqrt(s / len);
    up[i] = mid[i] + mult * sd;
    lo[i] = mid[i] - mult * sd;
  }
  return { mid, up, lo };
}

/** VWAP that restarts every trading day (typical price x volume). Meaningless on daily bars, so NaN there. */
export function vwap(b: Bars): Float64Array {
  const out = new Float64Array(b.n).fill(NaN);
  if (b.tf === '1D' || b.tf === '1W') return out;
  let pv = 0, vv = 0, day = -1;
  for (let i = 0; i < b.n; i++) {
    if (b.day[i] !== day) { day = b.day[i]; pv = 0; vv = 0; }
    const tp = (b.h[i] + b.l[i] + b.c[i]) / 3;
    pv += tp * b.v[i]; vv += b.v[i];
    out[i] = vv > 0 ? pv / vv : tp;
  }
  return out;
}

export function atr(b: Bars, len = 14): Float64Array {
  const out = new Float64Array(b.n).fill(NaN);
  let prev = NaN;
  for (let i = 1; i < b.n; i++) {
    const tr = Math.max(b.h[i] - b.l[i], Math.abs(b.h[i] - b.c[i - 1]), Math.abs(b.l[i] - b.c[i - 1]));
    if (i < len) { prev = Number.isNaN(prev) ? tr : prev + tr; if (i === len - 1) { prev /= len - 1; out[i] = prev; } continue; }
    prev = (prev * (len - 1) + tr) / len;
    out[i] = prev;
  }
  return out;
}

export type Computed = {
  sma20?: Float64Array; sma50?: Float64Array; ema9?: Float64Array; ema21?: Float64Array;
  bb?: { mid: Float64Array; up: Float64Array; lo: Float64Array };
  vwap?: Float64Array; rsi?: Float64Array; macd?: { line: Float64Array; signal: Float64Array; hist: Float64Array };
};

export function computeAll(b: Bars, ids: IndicatorId[]): Computed {
  const out: Computed = {};
  const has = (x: IndicatorId) => ids.includes(x);
  if (has('sma20')) out.sma20 = sma(b.c, 20);
  if (has('sma50')) out.sma50 = sma(b.c, 50);
  if (has('ema9')) out.ema9 = ema(b.c, 9);
  if (has('ema21')) out.ema21 = ema(b.c, 21);
  if (has('bb')) out.bb = bollinger(b.c);
  if (has('vwap')) out.vwap = vwap(b);
  if (has('rsi')) out.rsi = rsi(b.c);
  if (has('macd')) out.macd = macd(b.c);
  return out;
}

/** Support and resistance guessed from swing highs and lows: levels the price touched several times. */
export function swingLevels(b: Bars, lookback = 300, tolPct = 0.0035): { support: number[]; resistance: number[] } {
  const n = b.n;
  const from = Math.max(2, n - lookback);
  const highs: number[] = [], lows: number[] = [];
  for (let i = from; i < n - 2; i++) {
    if (b.h[i] >= b.h[i - 1] && b.h[i] >= b.h[i - 2] && b.h[i] >= b.h[i + 1] && b.h[i] >= b.h[i + 2]) highs.push(b.h[i]);
    if (b.l[i] <= b.l[i - 1] && b.l[i] <= b.l[i - 2] && b.l[i] <= b.l[i + 1] && b.l[i] <= b.l[i + 2]) lows.push(b.l[i]);
  }
  const cluster = (pts: number[]) => {
    const sorted = [...pts].sort((x, y) => x - y);
    const groups: number[][] = [];
    for (const p of sorted) {
      const g = groups[groups.length - 1];
      if (g && Math.abs(p - g[g.length - 1]) / p <= tolPct) g.push(p); else groups.push([p]);
    }
    return groups.map((g) => ({ lvl: g.reduce((a, x) => a + x, 0) / g.length, touches: g.length })).filter((g) => g.touches >= 2);
  };
  const last = b.c[n - 1];
  const sup = cluster(lows).filter((g) => g.lvl < last).sort((a, z) => z.lvl - a.lvl).map((g) => g.lvl);
  const res = cluster(highs).filter((g) => g.lvl > last).sort((a, z) => a.lvl - z.lvl).map((g) => g.lvl);
  return { support: sup, resistance: res };
}
