// The practice broker: pure functions over a plain-object Account (so it saves to disk as JSON).
// Prices come from the simulated one-minute bars. Fills are conservative: stops fill before targets in the
// same bar, gaps fill at the open price, market orders pay half the spread.
export type Side = 'buy' | 'sell';
export type OrderType = 'market' | 'limit' | 'stop' | 'stoplimit';

export type OrderReq = {
  symbol: string;
  side: Side;
  type: OrderType;
  qty: number;
  limit?: number;
  stop?: number;
  tif?: 'day' | 'gtc';
  sl?: number; // bracket stop-loss price
  tp?: number; // bracket take-profit price
  note?: string;
};

export type Order = {
  id: number;
  symbol: string;
  side: Side;
  type: OrderType;
  qty: number;
  limit?: number;
  stop?: number;
  tif: 'day' | 'gtc';
  status: 'open' | 'filled' | 'cancelled' | 'rejected';
  createdM: number;
  filledM?: number;
  fillPrice?: number;
  group?: number; // OCO group: when one fills the others are cancelled
  role?: 'entry' | 'sl' | 'tp';
  reduceOnly?: boolean;
  sl?: number;
  tp?: number;
  note?: string;
  reason?: string;
};

export type Position = { symbol: string; qty: number; avg: number; openM: number; riskPerShare?: number };
export type Trade = {
  id: number;
  symbol: string;
  dir: 'long' | 'short';
  qty: number;
  entry: number;
  exit: number;
  openM: number;
  closeM: number;
  pnl: number;
  r?: number;
  note?: string;
  emotion?: string;
  setup?: string;
};
export type Fill = { id: number; orderId: number; symbol: string; side: Side; qty: number; price: number; m: number };

export type Account = {
  startBalance: number;
  cash: number;
  positions: Record<string, Position>;
  orders: Order[];
  trades: Trade[];
  fills: Fill[];
  nextId: number;
  leverage: number;
  commission: number; // dollars per fill
  realized: number;
  curve: number[]; // equity samples for the analytics chart
};

export type Env = { mark: (symbol: string) => number; spreadBps: (symbol: string) => number; m: number };

export function newAccount(startBalance = 100000, leverage = 1, commission = 0): Account {
  return { startBalance, cash: startBalance, positions: {}, orders: [], trades: [], fills: [], nextId: 1, leverage, commission, realized: 0, curve: [startBalance] };
}

const round2 = (x: number) => Math.round(x * 100) / 100;
export const money = (x: number) => (x < 0 ? '-' : '') + '$' + Math.abs(x).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function equityOf(a: Account, env: Pick<Env, 'mark'>): number {
  let e = a.cash;
  for (const p of Object.values(a.positions)) e += p.qty * env.mark(p.symbol);
  return e;
}
export function grossExposure(a: Account, env: Pick<Env, 'mark'>): number {
  let g = 0;
  for (const p of Object.values(a.positions)) g += Math.abs(p.qty) * env.mark(p.symbol);
  return g;
}
export function openPnl(p: Position, mark: number): number {
  return (mark - p.avg) * p.qty;
}
export function buyingPower(a: Account, env: Pick<Env, 'mark'>): number {
  return Math.max(0, equityOf(a, env) * a.leverage - grossExposure(a, env));
}

const askOf = (px: number, bps: number) => px * (1 + bps / 20000);
const bidOf = (px: number, bps: number) => px * (1 - bps / 20000);

function position(a: Account, symbol: string): Position | undefined {
  return a.positions[symbol];
}
const signedQty = (side: Side, qty: number) => (side === 'buy' ? qty : -qty);

/** Would filling this order at `price` leave the account over its exposure limit? Reducing orders always pass. */
function exposureError(a: Account, o: { symbol: string; side: Side; qty: number }, price: number, env: Env): string | null {
  const pos = position(a, o.symbol);
  const cur = pos ? pos.qty : 0;
  const next = cur + signedQty(o.side, o.qty);
  if (Math.abs(next) <= Math.abs(cur) && Math.sign(next) * Math.sign(cur) >= 0) return null;
  const eq = equityOf(a, env);
  const others = grossExposure(a, env) - Math.abs(cur) * env.mark(o.symbol);
  const after = others + Math.abs(next) * price;
  if (after > eq * a.leverage + 0.01) {
    const room = Math.max(0, eq * a.leverage - others);
    const maxQty = Math.max(0, Math.floor(room / price));
    return `Not enough buying power. You can take about ${maxQty} shares of ${o.symbol} at this price.`;
  }
  return null;
}

function addTrade(a: Account, t: Omit<Trade, 'id'>) {
  a.trades.push({ id: a.nextId++, ...t });
}

function applyFill(a: Account, o: Order, qty: number, price: number, env: Env) {
  const sgn = signedQty(o.side, qty);
  const pos = position(a, o.symbol);
  a.cash -= sgn * price + a.commission;
  a.fills.push({ id: a.nextId++, orderId: o.id, symbol: o.symbol, side: o.side, qty, price, m: env.m });
  let remaining = qty;
  if (pos && Math.sign(pos.qty) !== Math.sign(sgn)) {
    const closeQty = Math.min(Math.abs(pos.qty), qty);
    const dir = pos.qty > 0 ? 'long' : 'short';
    const pnl = (price - pos.avg) * closeQty * Math.sign(pos.qty) - a.commission;
    const r = pos.riskPerShare ? ((price - pos.avg) * Math.sign(pos.qty)) / pos.riskPerShare : undefined;
    addTrade(a, { symbol: o.symbol, dir, qty: closeQty, entry: pos.avg, exit: price, openM: pos.openM, closeM: env.m, pnl: round2(pnl), r: r === undefined ? undefined : Math.round(r * 100) / 100 });
    a.realized += pnl;
    pos.qty += Math.sign(sgn) * closeQty;
    remaining -= closeQty;
    if (pos.qty === 0) delete a.positions[o.symbol];
  }
  if (remaining > 0) {
    const cur = position(a, o.symbol);
    if (cur) {
      cur.avg = (cur.avg * Math.abs(cur.qty) + price * remaining) / (Math.abs(cur.qty) + remaining);
      cur.qty += Math.sign(sgn) * remaining;
    } else {
      a.positions[o.symbol] = { symbol: o.symbol, qty: Math.sign(sgn) * remaining, avg: price, openM: env.m };
    }
  }
  o.status = 'filled';
  o.filledM = env.m;
  o.fillPrice = price;
  syncExits(a, o.symbol);
}

/** Exit orders may never be bigger than the position and die when it is flat. */
function syncExits(a: Account, symbol: string) {
  const pos = position(a, symbol);
  const size = pos ? Math.abs(pos.qty) : 0;
  for (const x of a.orders) {
    if (x.status !== 'open' || x.symbol !== symbol || !x.reduceOnly) continue;
    const wrongWay = !pos || (pos.qty > 0 && x.side === 'buy') || (pos.qty < 0 && x.side === 'sell');
    if (size === 0 || wrongWay) { x.status = 'cancelled'; x.reason = 'position closed'; }
    else if (x.qty > size) x.qty = size;
  }
}

function cancelGroup(a: Account, group: number | undefined, except: number) {
  if (group === undefined) return;
  for (const x of a.orders) if (x.status === 'open' && x.group === group && x.id !== except) { x.status = 'cancelled'; x.reason = 'other side of the bracket filled'; }
}

function spawnBracket(a: Account, o: Order, qty: number, avgPrice: number) {
  if (o.sl === undefined && o.tp === undefined) return;
  const exitSide: Side = o.side === 'buy' ? 'sell' : 'buy';
  const group = a.nextId++;
  const pos = position(a, o.symbol);
  if (pos && o.sl !== undefined) pos.riskPerShare = Math.abs(avgPrice - o.sl);
  if (o.sl !== undefined)
    a.orders.push({ id: a.nextId++, symbol: o.symbol, side: exitSide, type: 'stop', stop: o.sl, qty, tif: 'gtc', status: 'open', createdM: o.filledM ?? 0, group, role: 'sl', reduceOnly: true });
  if (o.tp !== undefined)
    a.orders.push({ id: a.nextId++, symbol: o.symbol, side: exitSide, type: 'limit', limit: o.tp, qty, tif: 'gtc', status: 'open', createdM: o.filledM ?? 0, group, role: 'tp', reduceOnly: true });
}

export type PlaceResult = { ok: boolean; error?: string; order?: Order };

export function placeOrder(a: Account, req: OrderReq, env: Env): PlaceResult {
  const fail = (error: string): PlaceResult => ({ ok: false, error });
  if (!Number.isFinite(req.qty) || req.qty <= 0 || Math.floor(req.qty) !== req.qty) return fail('Quantity must be a whole number of shares, at least 1.');
  const px = env.mark(req.symbol);
  if (!(px > 0)) return fail('No price for ' + req.symbol + ' yet.');
  const bps = env.spreadBps(req.symbol);
  const ask = askOf(px, bps), bid = bidOf(px, bps);
  const buy = req.side === 'buy';
  if ((req.type === 'limit' || req.type === 'stoplimit') && !(req.limit && req.limit > 0)) return fail('Enter a limit price.');
  if ((req.type === 'stop' || req.type === 'stoplimit') && !(req.stop && req.stop > 0)) return fail('Enter a stop price.');
  if (req.type === 'stop' && req.stop !== undefined) {
    if (buy && req.stop <= px) return fail('A buy stop must be above the current price (' + money(px) + '), or it would trigger at once.');
    if (!buy && req.stop >= px) return fail('A sell stop must be below the current price (' + money(px) + '), or it would trigger at once.');
  }
  if (req.sl !== undefined && req.sl > 0) {
    const ref = req.type === 'limit' && req.limit ? req.limit : px;
    if (buy && req.sl >= ref) return fail('For a buy, the stop-loss must be below your entry price.');
    if (!buy && req.sl <= ref) return fail('For a short sale, the stop-loss must be above your entry price.');
  }
  if (req.tp !== undefined && req.tp > 0) {
    const ref = req.type === 'limit' && req.limit ? req.limit : px;
    if (buy && req.tp <= ref) return fail('For a buy, the take-profit must be above your entry price.');
    if (!buy && req.tp >= ref) return fail('For a short sale, the take-profit must be below your entry price.');
  }
  const order: Order = {
    id: a.nextId++, symbol: req.symbol, side: req.side, type: req.type, qty: req.qty,
    limit: req.limit, stop: req.stop, tif: req.tif ?? (req.type === 'market' ? 'day' : 'day'), status: 'open', createdM: env.m,
    role: 'entry', sl: req.sl && req.sl > 0 ? req.sl : undefined, tp: req.tp && req.tp > 0 ? req.tp : undefined, note: req.note,
  };
  const marketable = req.type === 'market' || (req.type === 'limit' && ((buy && req.limit! >= ask) || (!buy && req.limit! <= bid)));
  if (marketable) {
    const price = req.type === 'limit' ? (buy ? Math.min(ask, req.limit!) : Math.max(bid, req.limit!)) : buy ? ask : bid;
    const err = exposureError(a, order, price, env);
    if (err) return fail(err);
    a.orders.push(order);
    applyFill(a, order, order.qty, price, env);
    spawnBracket(a, order, order.qty, price);
    return { ok: true, order };
  }
  const err = exposureError(a, order, req.type === 'limit' ? req.limit! : (req.stop ?? px), env);
  if (err) return fail(err);
  a.orders.push(order);
  return { ok: true, order };
}

/** Attach (or replace) a stop-loss and/or take-profit on an open position as a linked pair. */
export function protectPosition(a: Account, symbol: string, sl: number | undefined, tp: number | undefined, env: Env): PlaceResult {
  const pos = position(a, symbol);
  if (!pos) return { ok: false, error: 'No open position in ' + symbol + '.' };
  const px = env.mark(symbol);
  const long = pos.qty > 0;
  if (sl !== undefined && (long ? sl >= px : sl <= px)) return { ok: false, error: long ? 'A stop-loss on a long position must be below the current price.' : 'A stop-loss on a short position must be above the current price.' };
  if (tp !== undefined && (long ? tp <= px : tp >= px)) return { ok: false, error: long ? 'A take-profit on a long position must be above the current price.' : 'A take-profit on a short position must be below the current price.' };
  for (const x of a.orders) if (x.status === 'open' && x.symbol === symbol && x.reduceOnly) { x.status = 'cancelled'; x.reason = 'replaced'; }
  const group = a.nextId++;
  const side: Side = long ? 'sell' : 'buy';
  const qty = Math.abs(pos.qty);
  let first: Order | undefined;
  if (sl !== undefined) {
    first = { id: a.nextId++, symbol, side, type: 'stop', stop: sl, qty, tif: 'gtc', status: 'open', createdM: env.m, group, role: 'sl', reduceOnly: true };
    a.orders.push(first);
    pos.riskPerShare = Math.abs(pos.avg - sl);
  }
  if (tp !== undefined) {
    const o: Order = { id: a.nextId++, symbol, side, type: 'limit', limit: tp, qty, tif: 'gtc', status: 'open', createdM: env.m, group, role: 'tp', reduceOnly: true };
    a.orders.push(o);
    first = first ?? o;
  }
  return { ok: true, order: first };
}

export function cancelOrder(a: Account, id: number): boolean {
  const o = a.orders.find((x) => x.id === id && x.status === 'open');
  if (!o) return false;
  o.status = 'cancelled';
  o.reason = 'cancelled by you';
  return true;
}

export function closePosition(a: Account, symbol: string, env: Env): PlaceResult {
  const pos = position(a, symbol);
  if (!pos) return { ok: false, error: 'No open position in ' + symbol + '.' };
  return placeOrder(a, { symbol, side: pos.qty > 0 ? 'sell' : 'buy', type: 'market', qty: Math.abs(pos.qty) }, env);
}

/** Feed one finished minute bar for a symbol: working orders may fill. */
export function onBar(a: Account, symbol: string, bar: { o: number; h: number; l: number; c: number }, env: Env) {
  const half = env.spreadBps(symbol) / 20000;
  const list = a.orders.filter((x) => x.status === 'open' && x.symbol === symbol);
  for (const o of list) {
    if (o.status !== 'open') continue;
    const buy = o.side === 'buy';
    let price: number | null = null;
    if (o.type === 'limit') {
      if (buy) price = bar.o <= o.limit! ? bar.o : bar.l <= o.limit! ? o.limit! : null;
      else price = bar.o >= o.limit! ? bar.o : bar.h >= o.limit! ? o.limit! : null;
    } else if (o.type === 'stop') {
      if (buy) price = bar.o >= o.stop! ? bar.o * (1 + half) : bar.h >= o.stop! ? o.stop! * (1 + half) : null;
      else price = bar.o <= o.stop! ? bar.o * (1 - half) : bar.l <= o.stop! ? o.stop! * (1 - half) : null;
    } else if (o.type === 'stoplimit') {
      const trig = buy ? (bar.o >= o.stop! ? bar.o : bar.h >= o.stop! ? o.stop! : null) : bar.o <= o.stop! ? bar.o : bar.l <= o.stop! ? o.stop! : null;
      if (trig !== null) {
        if (buy ? trig <= o.limit! : trig >= o.limit!) price = trig;
        else { o.type = 'limit'; o.stop = undefined; }
      }
    }
    if (price === null) continue;
    const reducing = o.reduceOnly;
    if (!reducing) {
      const err = exposureError(a, o, price, { ...env, mark: (s) => (s === symbol ? bar.c : env.mark(s)) });
      if (err) { o.status = 'rejected'; o.reason = err; continue; }
    }
    const qty = reducing ? Math.min(o.qty, Math.abs(position(a, symbol)?.qty ?? 0)) : o.qty;
    if (qty <= 0) { o.status = 'cancelled'; continue; }
    applyFill(a, o, qty, price, { ...env });
    cancelGroup(a, o.group, o.id);
    if (o.role === 'entry') spawnBracket(a, o, qty, price);
  }
}

export function expireDayOrders(a: Account) {
  for (const o of a.orders) if (o.status === 'open' && o.tif === 'day') { o.status = 'cancelled'; o.reason = 'day order expired'; }
}

export function sampleCurve(a: Account, equity: number) {
  a.curve.push(round2(equity));
  if (a.curve.length > 4000) a.curve.splice(1, a.curve.length - 4000);
}

export function resetAccount(a: Account, startBalance = a.startBalance): Account {
  return newAccount(startBalance, a.leverage, a.commission);
}

export function openOrders(a: Account, symbol?: string): Order[] {
  return a.orders.filter((o) => o.status === 'open' && (!symbol || o.symbol === symbol));
}

export function statsOf(trades: Trade[]) {
  const n = trades.length;
  const wins = trades.filter((t) => t.pnl > 0);
  const losses = trades.filter((t) => t.pnl < 0);
  const gross = wins.reduce((s, t) => s + t.pnl, 0);
  const lossSum = losses.reduce((s, t) => s - t.pnl, 0);
  const avgWin = wins.length ? gross / wins.length : 0;
  const avgLoss = losses.length ? lossSum / losses.length : 0;
  const winRate = n ? wins.length / n : 0;
  return {
    n, winRate, avgWin, avgLoss,
    profitFactor: lossSum > 0 ? gross / lossSum : gross > 0 ? Infinity : 0,
    expectancy: n ? trades.reduce((s, t) => s + t.pnl, 0) / n : 0,
    net: trades.reduce((s, t) => s + t.pnl, 0),
  };
}

export function maxDrawdown(curve: number[]): number {
  let peak = -Infinity, dd = 0;
  for (const e of curve) {
    peak = Math.max(peak, e);
    if (peak > 0) dd = Math.max(dd, (peak - e) / peak);
  }
  return dd;
}
