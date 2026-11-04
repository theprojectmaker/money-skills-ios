// Predict-mode rounds. Each kind builds 70 bars of history and 40 bars of future. The textbook outcome happens
// about two times in three, so the player learns that a good setup is a probability and never a promise.
import { Bar, Seg, buildBars, mulberry32 } from './gen';

export type KindId = 'uptrend' | 'downtrend' | 'support' | 'breakout' | 'doubletop' | 'gap' | 'chop';
export const HIST = 70;
export const FUTURE = 40;
export const PLAY_ODDS = 0.65;

export type KindInfo = {
  id: KindId; name: string; bias: 'long' | 'short' | 'none'; lesson: string;
  setup: string; plays: string; fails: string;
};

export const KINDS: Record<KindId, KindInfo> = {
  uptrend: {
    id: 'uptrend', name: 'Pullback in an uptrend', bias: 'long', lesson: 'trend',
    setup: 'A steady run of higher highs and higher lows, then a few down days that stall near the rising average.',
    plays: 'Buyers stepped back in at the dip and the trend resumed. Buying weakness inside a strong trend is one of the most common setups.',
    fails: 'The dip kept going and broke the series of higher lows. The trend was over, and the stop did its job by getting you out early.',
  },
  downtrend: {
    id: 'downtrend', name: 'Bounce in a downtrend', bias: 'short', lesson: 'trend',
    setup: 'Lower highs and lower lows, then a weak bounce that stalls under the falling average.',
    plays: 'Sellers took control again at the bounce and price rolled over. The same logic as an uptrend pullback, flipped.',
    fails: 'The bounce turned into a real reversal and squeezed anyone short. Shorts have unlimited risk, so the stop matters even more.',
  },
  support: {
    id: 'support', name: 'Range, price at support', bias: 'long', lesson: 'levels',
    setup: 'Price has bounced between a floor and a ceiling several times and is back at the floor.',
    plays: 'The floor held a fourth time and price rose back into the range. Support is a place where buyers have appeared before.',
    fails: 'The floor broke. Every level eventually does, and a break often runs further because many stops sit just below it.',
  },
  breakout: {
    id: 'breakout', name: 'Pressing the ceiling', bias: 'long', lesson: 'entries',
    setup: 'Higher lows pushing into a flat ceiling that has capped price three times.',
    plays: 'Price cleared the ceiling and kept going. The old ceiling became support and the move had room to run.',
    fails: 'A false breakout: price poked above the ceiling, found no buyers, and fell back inside. Breakouts fail often, so size them small.',
  },
  doubletop: {
    id: 'doubletop', name: 'Second try at the high', bias: 'short', lesson: 'entries',
    setup: 'A big run up, a pullback, and a second push back to the same high.',
    plays: 'The second attempt failed at the same price and sellers took over. Two rejections at one level is a warning, never a certainty.',
    fails: 'Price pushed through the high and trended higher. A level that is tested twice is weaker than one tested once, and sometimes it simply breaks.',
  },
  gap: {
    id: 'gap', name: 'Gap up after a run', bias: 'long', lesson: 'indicators',
    setup: 'A long climb, then a jump at the open that leaves a hole in the chart.',
    plays: 'Gap and go: the jump marked a fresh wave of demand and price kept climbing without filling the hole.',
    fails: 'Gap fill: the excitement faded and price slid back to where the gap began. Late buyers at the open took the loss.',
  },
  chop: {
    id: 'chop', name: 'No clear picture', bias: 'none', lesson: 'psychology',
    setup: 'No trend, no clean levels, bars overlapping everywhere.',
    plays: 'Nothing readable happened. Price wandered without a reason.',
    fails: 'Nothing readable happened. Price wandered without a reason.',
  },
};
export const KIND_ORDER: KindId[] = ['uptrend', 'downtrend', 'support', 'breakout', 'doubletop', 'gap', 'chop'];

type Plan = { hist: Seg[]; plays: Seg[]; fails: Seg[] };
const neg = (s: Seg[]): Seg[] => s.map((x) => ({ ...x, m: -x.m, gap: x.gap ? -x.gap : undefined }));

const UP: Plan = {
  hist: [{ n: 18, m: 0 }, { n: 34, m: 17 }, { n: 10, m: -6 }, { n: 8, m: 1 }],
  plays: [{ n: 10, m: 7 }, { n: 30, m: 12 }],
  fails: [{ n: 8, m: -5 }, { n: 32, m: -13 }],
};
const PLANS: Record<KindId, Plan> = {
  uptrend: UP,
  downtrend: { hist: neg(UP.hist), plays: neg(UP.plays), fails: neg(UP.fails) },
  support: {
    hist: [{ n: 10, m: 0 }, { n: 10, m: 4 }, { n: 10, m: -4 }, { n: 10, m: 4 }, { n: 10, m: -4 }, { n: 10, m: 4 }, { n: 10, m: -4 }],
    plays: [{ n: 12, m: 4.5 }, { n: 14, m: -1 }, { n: 14, m: 1.5 }],
    fails: [{ n: 6, m: -2.5 }, { n: 34, m: -10 }],
  },
  breakout: {
    hist: [{ n: 10, m: 4 }, { n: 10, m: -3.5 }, { n: 10, m: 3.5 }, { n: 10, m: -3 }, { n: 10, m: 3 }, { n: 10, m: -2.5 }, { n: 10, m: 2.5 }],
    plays: [{ n: 4, m: 3 }, { n: 36, m: 13 }],
    fails: [{ n: 4, m: 2.5 }, { n: 8, m: -4.5 }, { n: 28, m: -8 }],
  },
  doubletop: {
    hist: [{ n: 18, m: 0 }, { n: 22, m: 15 }, { n: 9, m: -6.5 }, { n: 11, m: 6.5 }, { n: 10, m: -1 }],
    plays: [{ n: 6, m: -3 }, { n: 34, m: -14 }],
    fails: [{ n: 5, m: 3 }, { n: 35, m: 11 }],
  },
  gap: {
    hist: [{ n: 69, m: 10 }, { n: 1, m: 0.5, gap: 3.5 }],
    plays: [{ n: 8, m: 4 }, { n: 32, m: 6 }],
    fails: [{ n: 8, m: -4.2 }, { n: 32, m: -6 }],
  },
  chop: { hist: [{ n: 70, m: 0 }], plays: [{ n: 40, m: 0 }], fails: [{ n: 40, m: 0 }] },
};

export type Scenario = {
  kind: KindId; seed: number; bars: Bar[]; split: number; plays: boolean; v: number;
};

export function makeScenario(kind: KindId, seed: number): Scenario {
  const rng = mulberry32(seed * 7919 + 13);
  const v = 0.0075 + rng() * 0.005;
  const start = Math.round((25 + rng() * 280) * 100) / 100;
  const plan = PLANS[kind];
  const plays = rng() < PLAY_ODDS;
  const J = () => 0.85 + rng() * 0.3;
  const jig = (segs: Seg[]): Seg[] => segs.map((x) => ({ ...x, m: x.m * J() }));
  let hist = jig(plan.hist);
  let fut = jig(plays ? plan.plays : plan.fails);
  if (kind === 'chop') {
    const wob = (n: number): Seg[] => Array.from({ length: n / 10 }, () => ({ n: 10, m: (rng() - 0.5) * 7, s: 1.1 }));
    hist = wob(HIST);
    fut = wob(FUTURE);
  }
  const bars = buildBars(start, [...hist, ...fut], v, rng);
  return { kind, seed, bars, split: HIST, plays, v };
}

export function pickKind(rng: () => number, only?: KindId | null): KindId {
  if (only) return only;
  return KIND_ORDER[Math.floor(rng() * KIND_ORDER.length)];
}

/** Highest high and lowest low of the visible history: the plain support and resistance levels. */
export function levels(bars: Bar[], end: number, lookback = 60): { support: number; resistance: number } {
  let lo = Infinity, hi = -Infinity;
  for (let i = Math.max(0, end - lookback); i < end; i++) { lo = Math.min(lo, bars[i].l); hi = Math.max(hi, bars[i].h); }
  return { support: lo, resistance: hi };
}
