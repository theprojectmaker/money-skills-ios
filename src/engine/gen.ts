// Seeded price generation. Everything here is simulated: no real company, no real prices.
export type Bar = { o: number; h: number; l: number; c: number; v: number };

export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function gauss(r: () => number): number {
  let u = r();
  if (u < 1e-9) u = 1e-9;
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * r());
}

const round2 = (x: number) => Math.round(x * 100) / 100;

/** One bar from the previous close. `ret` is the open-to-close log return, `v` the typical bar size. */
export function makeBar(prevClose: number, ret: number, v: number, s: number, gap: number, rng: () => number): Bar {
  const open = Math.max(1, prevClose * Math.exp(gap !== 0 ? gap : gauss(rng) * v * 0.12));
  const close = Math.max(1, open * Math.exp(ret));
  const hi = Math.max(open, close) * Math.exp(Math.abs(gauss(rng)) * v * 0.45 * s);
  const lo = Math.min(open, close) * Math.exp(-Math.abs(gauss(rng)) * v * 0.45 * s);
  const o = round2(open), c = round2(close);
  const volume = Math.round(1e6 * (0.7 + rng() * 0.6) * (1 + (2 * Math.abs(ret)) / v * 0.35));
  return { o, c, h: round2(Math.max(hi, o, c)), l: round2(Math.max(0.5, Math.min(lo, o, c))), v: volume };
}

/** A stretch of bars: `m` is the total log move in units of v over `n` bars; noise is bridged so it ends near the target. */
export type Seg = { n: number; m: number; s?: number; gap?: number };

export function buildBars(start: number, segs: Seg[], v: number, rng: () => number): Bar[] {
  const out: Bar[] = [];
  let prev = start;
  for (const seg of segs) {
    const s = seg.s ?? 1;
    const noise: number[] = [];
    for (let i = 0; i < seg.n; i++) noise.push(gauss(rng) * v * s);
    const mean = noise.reduce((a, b) => a + b, 0) / Math.max(1, seg.n);
    const jitter = (gauss(rng) * v * 0.6) / Math.max(1, seg.n);
    for (let i = 0; i < seg.n; i++) {
      const ret = (seg.m * v) / seg.n + (noise[i] - mean) + jitter;
      const bar = makeBar(prev, ret, v, s, i === 0 && seg.gap ? seg.gap * v : 0, rng);
      out.push(bar);
      prev = bar.c;
    }
  }
  return out;
}

/** Average true range of the `period` bars ending before index `end`. */
export function atr(bars: Bar[], end: number, period = 14): number {
  const to = Math.min(end, bars.length);
  const from = Math.max(1, to - period);
  let sum = 0, k = 0;
  for (let i = from; i < to; i++) {
    const b = bars[i], pc = bars[i - 1].c;
    sum += Math.max(b.h - b.l, Math.abs(b.h - pc), Math.abs(b.l - pc));
    k++;
  }
  return k ? sum / k : Math.max(0.01, bars[0] ? (bars[0].h - bars[0].l) : 1);
}

export function sma(bars: Bar[], period: number, upTo: number): (number | null)[] {
  const out: (number | null)[] = [];
  let sum = 0;
  for (let i = 0; i < upTo && i < bars.length; i++) {
    sum += bars[i].c;
    if (i >= period) sum -= bars[i - period].c;
    out.push(i >= period - 1 ? sum / period : null);
  }
  return out;
}
