// The live practice market: an endless simulated stock that drifts through trends, ranges and wild stretches,
// plus a one-position account that sizes trades from risk, the way a real trader should.
import { Bar, atr, gauss, makeBar, mulberry32 } from './gen';
import { Plan, Side, checkBar, planFor, riskOf } from './broker';

export type Ticker = { sym: string; name: string; start: number; v: number; blurb: string };
export const TICKERS: Ticker[] = [
  { sym: 'NOVA', name: 'Nova Systems', start: 164, v: 0.011, blurb: 'Large, steady tech' },
  { sym: 'BRKR', name: 'Brickner Bank', start: 58, v: 0.007, blurb: 'Slow and orderly' },
  { sym: 'HALO', name: 'Halo Biotech', start: 31, v: 0.019, blurb: 'Jumpy, news-driven' },
  { sym: 'ORCA', name: 'Orca Energy', start: 92, v: 0.013, blurb: 'Cyclical swings' },
  { sym: 'VOLT', name: 'Voltline Motors', start: 211, v: 0.023, blurb: 'Fast and nervous' },
];

type Regime = { name: 'up' | 'down' | 'range' | 'wild'; drift: number; s: number; left: number };
export const WARMUP = 120;
export const MAX_BARS = 700;

export class Market {
  bars: Bar[] = [];
  private rng: () => number;
  private regime: Regime;
  private sinceNews = 0;
  constructor(public t: Ticker, seed: number) {
    this.rng = mulberry32(seed);
    this.regime = this.nextRegime();
    let prev = t.start;
    for (let i = 0; i < WARMUP; i++) { const b = this.make(prev); this.bars.push(b); prev = b.c; }
  }
  private nextRegime(): Regime {
    const r = this.rng();
    const left = 20 + Math.floor(this.rng() * 40);
    if (r < 0.32) return { name: 'up', drift: 0.32, s: 1, left };
    if (r < 0.64) return { name: 'down', drift: -0.32, s: 1, left };
    if (r < 0.88) return { name: 'range', drift: 0, s: 0.8, left };
    return { name: 'wild', drift: 0, s: 1.9, left: 8 + Math.floor(this.rng() * 10) };
  }
  private make(prev: number): Bar {
    if (this.regime.left <= 0) this.regime = this.nextRegime();
    this.regime.left--;
    this.sinceNews++;
    const v = this.t.v;
    let gap = 0;
    if (this.sinceNews > 45 && this.rng() < 0.04) { gap = (this.rng() < 0.5 ? -1 : 1) * (2.5 + this.rng() * 3) * v; this.sinceNews = 0; }
    const ret = this.regime.drift * v + gauss(this.rng) * v * this.regime.s;
    return makeBar(prev, ret, v, this.regime.s, gap, this.rng);
  }
  step(): Bar {
    const b = this.make(this.bars[this.bars.length - 1].c);
    this.bars.push(b);
    return b;
  }
  get last() { return this.bars[this.bars.length - 1]; }
}

export type Position = { side: Side; qty: number; plan: Plan; openedAt: number; initialStop: number };
export type Trade = {
  sym: string; side: Side; qty: number; entry: number; exit: number; r: number; pnl: number;
  reason: 'target' | 'stop' | 'manual'; bars: number;
};

const SPREAD = 0.0005;

export class Session {
  cash: number;
  pos: Position | null = null;
  trades: Trade[] = [];
  curve: number[] = [];
  peak: number;
  maxDd = 0;
  constructor(public market: Market, public start = 10000) {
    this.cash = start;
    this.peak = start;
    this.curve.push(start);
  }
  get index() { return this.market.bars.length - 1; }
  get atr() { return atr(this.market.bars, this.market.bars.length); }
  equity(): number {
    const p = this.pos;
    if (!p) return this.cash;
    const d = p.side === 'long' ? 1 : -1;
    return this.cash + (this.market.last.c - p.plan.entry) * d * p.qty;
  }
  /** Shares from risk: how many you may hold so that hitting the stop costs `riskPct` percent of the account. */
  sizeFor(riskPct: number, stopAtr: number): { qty: number; riskCash: number; perShare: number } {
    const perShare = Math.max(0.01, this.atr * stopAtr);
    const riskCash = this.equity() * (riskPct / 100);
    const maxByCash = Math.floor((this.equity() * 2) / Math.max(1, this.market.last.c));
    const qty = Math.max(0, Math.min(maxByCash, Math.floor(riskCash / perShare)));
    return { qty, riskCash, perShare };
  }
  open(side: Side, riskPct: number, stopAtr: number, rr: number | null): string | null {
    if (this.pos) return 'Close the current position first.';
    const { qty } = this.sizeFor(riskPct, stopAtr);
    if (qty < 1) return 'Too small to buy even one share at this risk. Raise the risk or tighten the stop.';
    const px = this.market.last.c * (1 + (side === 'long' ? SPREAD : -SPREAD));
    const plan = planFor(side, px, this.atr, stopAtr, rr);
    this.pos = { side, qty, plan, openedAt: this.index, initialStop: plan.stop };
    return null;
  }
  private finish(price: number, reason: Trade['reason']) {
    const p = this.pos;
    if (!p) return;
    const d = p.side === 'long' ? 1 : -1;
    const fill = reason === 'manual' ? price * (1 + (p.side === 'long' ? -SPREAD : SPREAD)) : price;
    const pnl = (fill - p.plan.entry) * d * p.qty;
    const risk = Math.abs(p.plan.entry - p.initialStop) || 1;
    this.cash += pnl;
    this.trades.push({
      sym: this.market.t.sym, side: p.side, qty: p.qty, entry: p.plan.entry, exit: Math.round(fill * 100) / 100,
      r: Math.round(((fill - p.plan.entry) * d / risk) * 100) / 100, pnl: Math.round(pnl * 100) / 100, reason,
      bars: this.index - p.openedAt,
    });
    this.pos = null;
  }
  close(): void { this.finish(this.market.last.c, 'manual'); this.mark(); }
  breakeven(): void { if (this.pos) this.pos.plan = { ...this.pos.plan, stop: this.pos.plan.entry }; }
  /** Advance one bar and let the stop or target act on it. */
  step(): void {
    const b = this.market.step();
    const p = this.pos;
    if (p && this.index > p.openedAt) {
      const hit = checkBar(p.plan, b);
      if (hit) this.finish(hit.price, hit.reason);
    }
    this.mark();
  }
  private mark() {
    const e = this.equity();
    this.curve.push(e);
    if (this.curve.length > 800) this.curve.shift();
    this.peak = Math.max(this.peak, e);
    this.maxDd = Math.max(this.maxDd, (this.peak - e) / this.peak);
  }
  get over() { return this.market.bars.length >= MAX_BARS; }
  risk() { return this.pos ? riskOf(this.pos.plan) : 0; }
}

export type Summary = { n: number; wins: number; winRate: number; avgWin: number; avgLoss: number; expectancy: number; totalR: number; pnl: number };
export function summarize(trades: { r: number; pnl: number }[]): Summary {
  const n = trades.length;
  const w = trades.filter((t) => t.r > 0), l = trades.filter((t) => t.r <= 0);
  const sum = (a: { r: number }[]) => a.reduce((x, t) => x + t.r, 0);
  const totalR = sum(trades);
  return {
    n, wins: w.length, winRate: n ? w.length / n : 0,
    avgWin: w.length ? sum(w) / w.length : 0, avgLoss: l.length ? sum(l) / l.length : 0,
    expectancy: n ? totalR / n : 0, totalR, pnl: trades.reduce((x, t) => x + t.pnl, 0),
  };
}
