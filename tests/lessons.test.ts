import test from 'node:test';
import assert from 'node:assert/strict';
import trading from '../src/content/trading';
import type { DoStep, TermS } from '../src/content/types';
import { newAccount, placeOrder, protectPosition, openOrders, equityOf, Env } from '../src/engine/account';
import { windowAt } from '../src/engine/series';
import { atr, swingLevels } from '../src/engine/indicators';
import { positionSize } from '../src/engine/risk';
import { findRegimeDay, SESSION_MIN, minutesFor } from '../src/engine/generator';

const doStep = (lesson: number, title: string) => trading.lessons[lesson - 1].steps.find((s) => s.type === 'do' && s.title === title) as DoStep;

function setup(symbol: string, regime: any, tf: any = '15m') {
  const day = findRegimeDay(symbol, regime, 1, 6, 30) + 4;
  const cursor = day * SESSION_MIN + 150;
  const md = minutesFor(symbol);
  const px = md.c[cursor];
  const env: Env = { mark: () => px, spreadBps: () => 2, m: cursor };
  const a = newAccount(100000, 4);
  const bars = windowAt(symbol, tf, cursor);
  const at = atr(bars)[bars.n - 1];
  const levels = swingLevels(bars);
  const mk = (): TermS => ({
    symbol, tf, chartType: 'candles', indicators: [], drawings: [], positions: Object.values(a.positions).map((p) => ({ symbol: p.symbol, qty: p.qty, avg: p.avg })),
    orders: openOrders(a), trades: a.trades, ticket: { side: 'buy', type: 'market', qty: 0 }, cursor, equity: equityOf(a, env), cash: a.cash, startBalance: 100000,
    last: px, atr: at, levels, counts: {}, zoomSpan: 90, scrolledBack: false, watchlist: [],
  });
  return { a, env, px, at, levels, mk };
}

test('lessons start inside the requested regime', () => {
  for (const l of trading.lessons) {
    const sc = l.scenario!;
    if (sc.kind && sc.kind !== 'earnings') assert.ok(findRegimeDay(sc.symbol, sc.kind, 1, sc.kind === 'volatile' ? 3 : 6, 30) >= 0, `${l.id}: no ${sc.kind} stretch for ${sc.symbol}`);
  }
});

test('size to risk 1% is detected; 5% and no-stop are not', () => {
  const step = doStep(4, 'Buy with a stop-loss');
  const t = setup('BANX', 'range', '5m');
  const base = t.mk();
  assert.equal(step.done(base, base), false);
  const stop = t.px - Math.max(t.at * 2, t.px * 0.004);
  const qty = positionSize(100000, 1, t.px, stop);
  assert.ok(placeOrder(t.a, { symbol: 'BANX', side: 'buy', type: 'market', qty, sl: stop }, t.env).ok);
  assert.equal(step.done(t.mk(), base), true);
  const t2 = setup('BANX', 'range', '5m');
  placeOrder(t2.a, { symbol: 'BANX', side: 'buy', type: 'market', qty: positionSize(100000, 5, t2.px, stop) , sl: stop }, t2.env);
  assert.equal(step.done(t2.mk(), base), false);
  const t3 = setup('BANX', 'range', '5m');
  placeOrder(t3.a, { symbol: 'BANX', side: 'buy', type: 'market', qty: 50 }, t3.env);
  assert.equal(step.done(t3.mk(), base), false);
});

test('stop below support is detected; stop above support is not', () => {
  const step = doStep(5, 'Put the stop below support');
  const t = setup('PETR', 'range');
  const base = t.mk();
  placeOrder(t.a, { symbol: 'PETR', side: 'buy', type: 'market', qty: 100 }, t.env);
  assert.equal(step.done(t.mk(), base), false);
  const sup = t.levels.support[0] ?? t.px - 2 * t.at;
  assert.ok(protectPosition(t.a, 'PETR', sup - 0.5 * t.at, undefined, t.env).ok);
  assert.equal(step.done(t.mk(), base), true);
  const u = setup('PETR', 'range');
  placeOrder(u.a, { symbol: 'PETR', side: 'buy', type: 'market', qty: 100 }, u.env);
  protectPosition(u.a, 'PETR', sup + 0.2 * u.at < u.px ? sup + 0.2 * u.at : u.px - 0.01, undefined, u.env);
  assert.equal(step.done(u.mk(), base), false);
});

test('2:1 bracket is detected; 1:1 is not', () => {
  const step = doStep(6, 'Build a bracket trade');
  const t = setup('TRON', 'up');
  const base = t.mk();
  const risk = t.at * 1.5;
  placeOrder(t.a, { symbol: 'TRON', side: 'buy', type: 'market', qty: 20, sl: t.px - risk, tp: t.px + risk * 2.2 }, t.env);
  assert.equal(step.done(t.mk(), base), true);
  const u = setup('TRON', 'up');
  placeOrder(u.a, { symbol: 'TRON', side: 'buy', type: 'market', qty: 20, sl: u.px - risk, tp: u.px + risk }, u.env);
  assert.equal(step.done(u.mk(), base), false);
});

test('final checklist trade needs stop, 2:1 and small risk', () => {
  const step = doStep(10, 'Place the checklist trade');
  const t = setup('MKTX', 'up');
  const base = t.mk();
  const stop = t.px - t.at * 1.5;
  const qty = positionSize(100000, 1, t.px, stop);
  placeOrder(t.a, { symbol: 'MKTX', side: 'buy', type: 'market', qty, sl: stop, tp: t.px + (t.px - stop) * 2.1 }, t.env);
  assert.equal(step.done(t.mk(), base), true);
  const u = setup('MKTX', 'up');
  placeOrder(u.a, { symbol: 'MKTX', side: 'buy', type: 'market', qty: qty * 3, sl: stop, tp: u.px + (u.px - stop) * 2.1 }, u.env);
  assert.equal(step.done(u.mk(), base), false);
});

test('every do-step is false on a fresh state (no free passes)', () => {
  const t = setup('NOVA', 'up');
  const s = t.mk();
  for (const l of trading.lessons) for (const st of l.steps) if (st.type === 'do') assert.equal(st.done(s, s), false, `${l.id} "${st.title}" passes with no action`);
});
