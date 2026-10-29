// The simulation controller: advances the clock, feeds minute bars to the practice broker, and applies terminal actions.
import { getState, setState, patchTerm, bump, toast, newTerm, TermState, ChartType, Tool, PickField } from './store';
import { BY_SYMBOL } from './engine/universe';
import { minutesFor, SESSION_MIN, TOTAL_MIN, dayOf, findRegimeDay } from './engine/generator';
import { aggFor, windowAt, Tf, TF_MINUTES, Bars } from './engine/series';
import { atr, swingLevels, IndicatorId } from './engine/indicators';
import { Env, onBar, placeOrder, closePosition, cancelOrder, protectPosition, expireDayOrders, sampleCurve, equityOf, openOrders, OrderReq } from './engine/account';
import type { Drawing, Scenario, TermS } from './content/types';
import { addXp } from './progress';

export const envFor = (t: TermState, m = t.cursor): Env => ({
  mark: (s) => minutesFor(s, t.season).c[Math.min(m, TOTAL_MIN - 1)],
  spreadBps: (s) => BY_SYMBOL[s]?.spreadBps ?? 2,
  m,
});

// ---- bars cache (several components ask for the same window each render) -------------------------------------
let barsKey = '';
let barsVal: Bars | null = null;
export function barsFor(t: TermState): Bars {
  const key = `${t.symbol}|${t.tf}|${t.cursor}|${t.season}`;
  if (key !== barsKey || !barsVal) {
    barsVal = windowAt(t.symbol, t.tf, t.cursor, t.season);
    barsKey = key;
  }
  return barsVal;
}

// ---- clock --------------------------------------------------------------------------------------------------
/** Move the sim clock forward `n` minutes, filling working orders bar by bar. Returns minutes actually advanced. */
export function advance(n: number): number {
  const t = getState().term;
  const last = Math.min(TOTAL_MIN - 1, t.cursor + Math.max(1, Math.floor(n)));
  const steps = last - t.cursor;
  if (steps <= 0) {
    if (t.playing) patchTerm({ playing: false });
    toast('This simulated year is over. Start a new season in Profile to keep practicing.');
    return 0;
  }
  const a = t.account;
  const closedBefore = a.trades.length;
  const md: Record<string, ReturnType<typeof minutesFor>> = {};
  for (let m = t.cursor + 1; m <= last; m++) {
    const syms = new Set<string>();
    for (const p of Object.keys(a.positions)) syms.add(p);
    for (const o of a.orders) if (o.status === 'open') syms.add(o.symbol);
    const env = envFor(t, m);
    for (const s of syms) {
      const d = (md[s] ??= minutesFor(s, t.season));
      onBar(a, s, { o: d.o[m], h: d.h[m], l: d.l[m], c: d.c[m] }, env);
    }
    const k = m - dayOf(m) * SESSION_MIN;
    if (k === SESSION_MIN - 1) {
      expireDayOrders(a);
      sampleCurve(a, equityOf(a, env));
    } else if (k % 60 === 0) sampleCurve(a, equityOf(a, env));
  }
  const reachedEnd = last >= TOTAL_MIN - 1;
  patchTerm({ cursor: last, ...(reachedEnd ? { playing: false } : {}) });
  bump('minutesAdvanced', steps);
  tradesClosed(closedBefore);
  return steps;
}

function tradesClosed(before: number) {
  const s = getState();
  const a = s.term.account;
  if (a.trades.length <= before) return;
  const fresh = a.trades.slice(before);
  bump('tradesClosed', fresh.length);
  if (s.term.sandbox) return;
  for (const tr of fresh) {
    addXp(tr.pnl > 0 ? 15 : 5, tr.pnl > 0 ? 'Trade closed in profit' : 'Trade closed');
    if (tr.pnl > 0) bump('winningTrades');
  }
  toast(fresh.map((f) => `${f.symbol} ${f.dir} closed ${f.pnl >= 0 ? '+' : '-'}$${Math.abs(f.pnl).toFixed(2)}${f.r !== undefined ? ` (${f.r}R)` : ''}`).join('  |  '));
}

/** Finish the current bar of the shown timeframe, or the next whole bar if it is already finished. */
export function stepBar() {
  const t = getState().term;
  const a = aggFor(t.symbol, t.tf, t.season);
  let lo = 0, hi = a.n - 1, idx = 0;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (a.startM[mid] <= t.cursor) { idx = mid; lo = mid + 1; } else hi = mid - 1;
  }
  const target = t.cursor === a.endM[idx] - 1 ? (idx + 1 < a.n ? a.endM[idx + 1] - 1 : a.endM[idx] - 1) : a.endM[idx] - 1;
  advance(target - t.cursor);
  bump('barsStepped');
}
export function nextDay() {
  const t = getState().term;
  const target = (dayOf(t.cursor) + 1) * SESSION_MIN + 0; // first minute of the next session
  advance(target - t.cursor);
  bump('daysStepped');
}
export function toNextOpen() {
  nextDay();
}

// ---- terminal actions ---------------------------------------------------------------------------------------
export function setSymbol(symbol: string) {
  const t = getState().term;
  if (symbol === t.symbol) return;
  patchTerm({ symbol, selected: null, view: { offset: 0, span: t.view.span }, ticket: { ...t.ticket, limit: undefined, stop: undefined, sl: undefined, tp: undefined } });
  bump('symbolChanges');
}
export function setTf(tf: Tf) {
  const t = getState().term;
  if (tf === t.tf) return;
  const span = tf === '1D' || tf === '1W' ? 100 : 90;
  patchTerm({ tf, view: { offset: 0, span } });
  bump('tfChanges');
}
export function setChartType(chartType: ChartType) {
  patchTerm({ chartType });
  bump('chartTypeChanges');
}
export function toggleIndicator(id: IndicatorId) {
  const t = getState().term;
  const on = t.indicators.includes(id);
  patchTerm({ indicators: on ? t.indicators.filter((x) => x !== id) : [...t.indicators, id] });
  if (!on) bump('indicatorsAdded');
}
export function setTool(tool: Tool) {
  patchTerm({ tool, selected: null });
}
export function setPick(pick: PickField) {
  patchTerm({ pick });
}
export function setTicket(p: Partial<TermState['ticket']>) {
  patchTerm((t) => ({ ticket: { ...t.ticket, ...p } }));
}
export function setView(v: Partial<TermState['view']>) {
  patchTerm((t) => ({ view: { ...t.view, ...v } }));
}
export function addDrawing(d: Omit<Drawing, 'id'>) {
  const t = getState().term;
  const list = t.drawings[t.symbol] ?? [];
  const draw = { ...d, id: t.nextDrawingId } as Drawing;
  patchTerm({ drawings: { ...t.drawings, [t.symbol]: [...list, draw] }, nextDrawingId: t.nextDrawingId + 1, selected: draw.id });
  bump('drawingsCreated');
  bump('drawing_' + d.tool);
}
export function deleteDrawing(id: number) {
  const t = getState().term;
  patchTerm({ drawings: { ...t.drawings, [t.symbol]: (t.drawings[t.symbol] ?? []).filter((x) => x.id !== id) }, selected: null });
}
export function clearDrawings() {
  const t = getState().term;
  patchTerm({ drawings: { ...t.drawings, [t.symbol]: [] }, selected: null });
}
export function undoDrawing() {
  const t = getState().term;
  const list = t.drawings[t.symbol] ?? [];
  if (!list.length) return;
  patchTerm({ drawings: { ...t.drawings, [t.symbol]: list.slice(0, -1) }, selected: null });
}

export type ActionResult = { ok: boolean; error?: string };
function report(r: { ok: boolean; error?: string }, okText?: string): ActionResult {
  if (!r.ok) toast(r.error || 'Order rejected');
  else if (okText) toast(okText);
  return r;
}

export function submitTicket(): ActionResult {
  const t = getState().term;
  const k = t.ticket;
  const req: OrderReq = { symbol: t.symbol, side: k.side, type: k.type, qty: Math.floor(k.qty || 0), limit: k.limit, stop: k.stop, sl: k.sl, tp: k.tp };
  if (k.type === 'market') { req.limit = undefined; req.stop = undefined; }
  if (k.type === 'limit') req.stop = undefined;
  if (k.type === 'stop') req.limit = undefined;
  const r = placeOrder(t.account, req, envFor(t));
  patchTerm({});
  if (r.ok) {
    bump('ordersPlaced');
    if (k.sl) bump('ordersWithStop');
    if (k.tp) bump('ordersWithTarget');
    if (k.type !== 'market') bump('pendingOrders');
    if ((t.account.positions[t.symbol]?.qty ?? 0) < 0) bump('shortsOpened');
    if (!t.sandbox) {
      addXp(r.order?.status === 'filled' ? 5 : 3, 'Order');
      if (!getState().achievements['first-order']) bump('firstOrderFlag');
    }
  }
  return report(r, r.ok ? (r.order?.status === 'filled' ? `${k.side === 'buy' ? 'Bought' : 'Sold'} ${req.qty} ${t.symbol} at $${(r.order.fillPrice ?? 0).toFixed(2)}` : `${k.type} order working`) : undefined);
}
export function closeSymbol(symbol: string): ActionResult {
  const t = getState().term;
  const before = t.account.trades.length;
  const r = closePosition(t.account, symbol, envFor(t));
  patchTerm({});
  if (r.ok) { bump('ordersPlaced'); bump('positionsClosedByHand'); tradesClosed(before); }
  return report(r);
}
export function cancelById(id: number) {
  const t = getState().term;
  if (cancelOrder(t.account, id)) { patchTerm({}); bump('ordersCancelled'); }
}
export function setProtection(symbol: string, sl?: number, tp?: number): ActionResult {
  const t = getState().term;
  const r = protectPosition(t.account, symbol, sl, tp, envFor(t));
  patchTerm({});
  if (r.ok) { bump('protectionsSet'); if (sl) bump('ordersWithStop'); if (tp) bump('ordersWithTarget'); }
  return report(r, r.ok ? 'Stop and target attached' : undefined);
}

// ---- sandboxes (lessons and replay) ---------------------------------------------------------------------------
export function scenarioCursor(s: Scenario, season = 1): number {
  let day = s.day ?? 120;
  if (s.kind === 'earnings') {
    const e = minutesFor(s.symbol, season).earningsDays.filter((d) => d > 30);
    day = e.length ? e[0] : day;
  } else if (s.kind) {
    const d = findRegimeDay(s.symbol, s.kind, season, s.kind === 'volatile' ? 3 : 6, 30);
    if (d >= 0) day = d + 4;
  }
  return Math.min(day, 255) * SESSION_MIN + (s.minute ?? 150);
}

export function enterSandbox(kind: 'lesson' | 'replay', s: Scenario) {
  setState((st) => {
    const main = st.stash ?? st.term;
    const set = st.settings;
    const t = newTerm(main.season, scenarioCursor(s, main.season), s.balance ?? set.startBalance, s.leverage ?? (kind === 'lesson' ? 4 : 1), 0);
    t.symbol = s.symbol;
    t.tf = s.tf;
    t.indicators = s.indicators ?? [];
    t.sandbox = kind;
    t.view = { offset: 0, span: s.tf === '1D' || s.tf === '1W' ? 100 : 90 };
    t.ticket = { side: 'buy', type: 'market', qty: 10 };
    return { stash: main, term: t };
  });
}
/** Re-point an already running sandbox at a new scenario (a lesson step with its own setup). */
export function retargetSandbox(s: Scenario) {
  const st = getState();
  if (!st.term.sandbox) return;
  enterSandbox(st.term.sandbox, s);
}
export function exitSandbox() {
  setState((st) => (st.stash ? { term: { ...st.stash, playing: false }, stash: null } : {}));
}

// ---- state for lesson checkers ----------------------------------------------------------------------------------
export function buildS(): TermS {
  const st = getState();
  const t = st.term;
  const bars = barsFor(t);
  const at = atr(bars);
  const a = t.account;
  const env = envFor(t);
  return {
    symbol: t.symbol, tf: t.tf, chartType: t.chartType, indicators: t.indicators, drawings: t.drawings[t.symbol] ?? [],
    positions: Object.values(a.positions).map((p) => ({ symbol: p.symbol, qty: p.qty, avg: p.avg })),
    orders: openOrders(a), trades: a.trades, ticket: t.ticket, cursor: t.cursor, equity: equityOf(a, env), cash: a.cash, startBalance: a.startBalance,
    last: bars.c[bars.n - 1], atr: at[bars.n - 1] || 0, levels: swingLevels(bars), counts: st.counts, zoomSpan: t.view.span,
    scrolledBack: t.view.offset > 1, watchlist: st.watchlist,
  };
}

export function fmtSimDate(t: TermState) {
  const b = barsFor({ ...t, tf: '1m' });
  return b.t[b.n - 1];
}
export const TFM = TF_MINUTES;
export const isTool = (t: Tool, x: Tool) => t === x;
