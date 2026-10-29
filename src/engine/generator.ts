// Procedural market: seeded random walks with regimes (trend / range / volatile), opening gaps,
// earnings-style jumps, volatility clustering and a U-shaped intraday volume profile.
// Output is one-minute bars for a fixed trading calendar; coarser timeframes are aggregated from them.
import { hashString, makeRng } from './rng';
import { BY_SYMBOL, Stock } from './universe';

export const SESSION_MIN = 390; // 9:30 -> 16:00
export const DAYS = 260; // ~1 trading year of history + room to play forward
export const TOTAL_MIN = DAYS * SESSION_MIN;
export type Regime = 'up' | 'down' | 'range' | 'volatile';

// Day 0 is a Monday. Times are exchange-local clock times stored as if UTC (the app never reads the device clock).
const START_UTC = Date.UTC(2025, 9, 6); // a fictional calendar
export function dayDate(day: number): number {
  const weeks = Math.floor(day / 5);
  return START_UTC + (weeks * 7 + (day % 5)) * 86400000;
}
export function minuteTime(m: number): number {
  const day = Math.floor(m / SESSION_MIN);
  const k = m - day * SESSION_MIN;
  return dayDate(day) + (570 + k) * 60000;
}
export const dayOf = (m: number) => Math.floor(m / SESSION_MIN);
export const minOfDay = (m: number) => m - dayOf(m) * SESSION_MIN;

export type MinuteData = {
  symbol: string;
  o: Float64Array;
  h: Float64Array;
  l: Float64Array;
  c: Float64Array;
  v: Float64Array;
  regimeByDay: Regime[];
  earningsDays: number[];
  gapByDay: Float64Array;
};

function pickRegime(r: ReturnType<typeof makeRng>, prev: Regime): Regime {
  const x = r.next();
  if (prev === 'range') return x < 0.4 ? 'up' : x < 0.7 ? 'down' : x < 0.85 ? 'volatile' : 'range';
  if (prev === 'volatile') return x < 0.35 ? 'up' : x < 0.7 ? 'down' : 'range';
  return x < 0.45 ? 'range' : x < 0.62 ? (prev === 'up' ? 'down' : 'up') : x < 0.8 ? prev : x < 0.9 ? 'volatile' : 'range';
}

export function generateMinutes(symbol: string, season = 1): MinuteData {
  const st: Stock = BY_SYMBOL[symbol];
  if (!st) throw new Error('Unknown simulated symbol ' + symbol);
  const rng = makeRng(hashString(symbol) ^ Math.imul(season, 0x9e3779b1));
  const o = new Float64Array(TOTAL_MIN),
    h = new Float64Array(TOTAL_MIN),
    l = new Float64Array(TOTAL_MIN),
    c = new Float64Array(TOTAL_MIN),
    v = new Float64Array(TOTAL_MIN);
  const regimeByDay: Regime[] = [];
  const gapByDay = new Float64Array(DAYS);
  const earningsDays: number[] = [];
  const earnPhase = rng.int(20, 60);
  const sigmaNorm = 1 / Math.sqrt(SESSION_MIN * 1.7);
  const uShape = new Float64Array(SESSION_MIN);
  for (let k = 0; k < SESSION_MIN; k++) uShape[k] = 1 + 1.3 * Math.exp(-k / 22) + 0.8 * Math.exp(-(SESSION_MIN - 1 - k) / 28);

  let price = st.base * rng.range(0.9, 1.1);
  let regime: Regime = 'range';
  let regimeLeft = 0;
  let vm = 1; // volatility multiplier (clustering)
  let rangeAnchor = Math.log(price);
  let rangeHalf = 0.04;
  let m = 0;

  for (let d = 0; d < DAYS; d++) {
    if (regimeLeft <= 0) {
      regime = pickRegime(rng, regime);
      regimeLeft = rng.int(regime === 'volatile' ? 3 : 5, regime === 'range' ? 22 : 16);
      if (regime === 'range') {
        rangeAnchor = Math.log(price);
        rangeHalf = st.vol * rng.range(1.6, 3.2);
      }
    }
    regimeLeft--;
    regimeByDay.push(regime);

    const earnings = d > 10 && (d - earnPhase) % 63 === 0;
    if (earnings) earningsDays.push(d);
    const targetVm = regime === 'volatile' ? 1.9 : regime === 'range' ? 0.8 : 1.05;
    vm = Math.max(0.5, 0.85 * vm + 0.15 * targetVm + 0.06 * rng.normal());
    const dayVm = vm * (earnings ? 2.2 : 1);

    let gap = rng.normal() * st.vol * 0.28 * (regime === 'volatile' ? 1.6 : 1);
    if (earnings) gap = (rng.next() < 0.5 ? -1 : 1) * rng.range(0.04, 0.12);
    gapByDay[d] = gap;
    price *= Math.exp(gap);
    if (regime === 'range') rangeAnchor += gap * 0.3;

    const trendDay = rng.next() < 0.28 ? (rng.next() < 0.5 ? 1 : -1) : 0;
    const dayDrift = regime === 'up' ? st.vol * 0.55 : regime === 'down' ? -st.vol * 0.55 : 0;
    const drift = (dayDrift + st.drift + trendDay * st.vol * 0.35) / SESSION_MIN;
    const sig = st.vol * dayVm * sigmaNorm;
    let lp = Math.log(price);

    for (let k = 0; k < SESSION_MIN; k++, m++) {
      const u = uShape[k];
      const open = Math.exp(lp);
      let hi = open,
        lo = open;
      for (let s = 0; s < 4; s++) {
        let pull = 0;
        if (regime === 'range') {
          const dev = lp - rangeAnchor;
          const edge = Math.abs(dev) / rangeHalf;
          pull = -0.012 * dev - (edge > 0.85 ? Math.sign(dev) * 0.0012 * (edge - 0.85) * 6 : 0);
        }
        lp += (drift + pull) / 4 + (sig * u * rng.normal()) / 2;
        const p = Math.exp(lp);
        if (p > hi) hi = p;
        if (p < lo) lo = p;
      }
      const close = Math.exp(lp);
      o[m] = open;
      c[m] = close;
      h[m] = hi;
      l[m] = lo;
      const move = Math.abs(Math.log(close / open)) / (st.vol * sigmaNorm * 2.2);
      v[m] = Math.max(
        100,
        Math.round(st.avgVol * u * (0.55 + move) * Math.exp(0.35 * rng.normal()) * (earnings ? 3 : 1) * (regime === 'volatile' ? 1.4 : 1)),
      );
    }
    price = Math.exp(lp);
    // keep a stock from going to zero or to the moon over a simulated year
    if (price < st.base * 0.25) {
      lp += 0.25;
      price = Math.exp(lp);
    }
    if (price > st.base * 5) {
      lp -= 0.25;
      price = Math.exp(lp);
    }
  }
  return { symbol, o, h, l, c, v, regimeByDay, earningsDays, gapByDay };
}

const cache = new Map<string, MinuteData>();
export function minutesFor(symbol: string, season = 1): MinuteData {
  const key = symbol + '#' + season;
  let d = cache.get(key);
  if (!d) {
    d = generateMinutes(symbol, season);
    cache.set(key, d);
    if (cache.size > 12) cache.delete(cache.keys().next().value as string);
  }
  return d;
}

/** First day (>= minDay) that begins a stretch of at least `len` days in the regime; -1 if none. */
export function findRegimeDay(symbol: string, regime: Regime, season = 1, len = 6, minDay = 25): number {
  const r = minutesFor(symbol, season).regimeByDay;
  for (let d = minDay; d < DAYS - len - 2; d++) {
    let ok = true;
    for (let j = 0; j < len; j++)
      if (r[d + j] !== regime) {
        ok = false;
        break;
      }
    if (ok) return d;
  }
  return -1;
}
