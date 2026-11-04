// A deliberately small broker: one position, a stop and a target, filled bar by bar. When one bar touches both the
// stop and the target we cannot know which came first, so the stop wins. That is the honest, conservative reading.
import type { Bar } from './gen';

export type Side = 'long' | 'short';
export type Plan = { side: Side; entry: number; stop: number; target: number | null };
export type Exit = { i: number; price: number; reason: 'target' | 'stop' | 'time' };
export type Result = { exit: Exit | null; r: number; mfe: number; mae: number };

export const riskOf = (p: Plan) => Math.abs(p.entry - p.stop);
const dirOf = (s: Side) => (s === 'long' ? 1 : -1);

export function planFor(side: Side, entry: number, atrValue: number, stopAtr: number, rr: number | null): Plan {
  const risk = Math.max(0.01, atrValue * stopAtr);
  const d = dirOf(side);
  return {
    side, entry: Math.round(entry * 100) / 100,
    stop: Math.round((entry - d * risk) * 100) / 100,
    target: rr === null ? null : Math.round((entry + d * risk * rr) * 100) / 100,
  };
}

/** Does this one bar close out the plan? Returns the exit price and reason, or null. */
export function checkBar(p: Plan, b: Bar): { price: number; reason: 'target' | 'stop' } | null {
  if (p.side === 'long') {
    if (b.o <= p.stop) return { price: b.o, reason: 'stop' };
    if (p.target !== null && b.o >= p.target) return { price: b.o, reason: 'target' };
    if (b.l <= p.stop) return { price: p.stop, reason: 'stop' };
    if (p.target !== null && b.h >= p.target) return { price: p.target, reason: 'target' };
  } else {
    if (b.o >= p.stop) return { price: b.o, reason: 'stop' };
    if (p.target !== null && b.o <= p.target) return { price: b.o, reason: 'target' };
    if (b.h >= p.stop) return { price: p.stop, reason: 'stop' };
    if (p.target !== null && b.l <= p.target) return { price: p.target, reason: 'target' };
  }
  return null;
}

/** Run a plan over bars[from, end). With no exit, `r` is the open mark at the last bar's close. */
export function resolve(bars: Bar[], from: number, end: number, p: Plan): Result {
  const risk = riskOf(p) || 1;
  const d = dirOf(p.side);
  let mfe = 0, mae = 0;
  const to = Math.min(end, bars.length);
  for (let i = from; i < to; i++) {
    const b = bars[i];
    const hit = checkBar(p, b);
    mfe = Math.max(mfe, ((d === 1 ? b.h : b.l) - p.entry) * d / risk);
    mae = Math.min(mae, ((d === 1 ? b.l : b.h) - p.entry) * d / risk);
    if (hit) return { exit: { i, price: hit.price, reason: hit.reason }, r: round(((hit.price - p.entry) * d) / risk), mfe: round(mfe), mae: round(mae) };
  }
  if (to > from) {
    const last = bars[to - 1].c;
    return { exit: null, r: round(((last - p.entry) * d) / risk), mfe: round(mfe), mae: round(mae) };
  }
  return { exit: null, r: 0, mfe: 0, mae: 0 };
}

const round = (x: number) => Math.round(x * 100) / 100;

/** Final result once the whole window is shown: an unfilled plan closes at the last close. */
export function settle(bars: Bar[], from: number, p: Plan): { r: number; exit: Exit } {
  const res = resolve(bars, from, bars.length, p);
  if (res.exit) return { r: res.r, exit: res.exit };
  const i = bars.length - 1;
  return { r: res.r, exit: { i, price: bars[i].c, reason: 'time' } };
}

/** The chance you must win to break even at a given reward:risk, e.g. 2R needs one win in three. */
export const breakevenWinRate = (rr: number) => 1 / (1 + rr);
