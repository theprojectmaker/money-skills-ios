import test from 'node:test';
import assert from 'node:assert/strict';
import { newAccount, placeOrder, onBar, closePosition, equityOf, protectPosition, cancelOrder, openOrders, statsOf, maxDrawdown, expireDayOrders, Env } from '../src/engine/account';

let px = 100;
const env = (m = 1): Env => ({ mark: () => px, spreadBps: () => 0, m });

test('market buy, mark to market, sell for profit', () => {
  const a = newAccount(10000);
  px = 100;
  assert.ok(placeOrder(a, { symbol: 'X', side: 'buy', type: 'market', qty: 50 }, env()).ok);
  assert.equal(a.cash, 5000);
  px = 110;
  assert.equal(equityOf(a, env()), 10500);
  assert.ok(closePosition(a, 'X', env(2)).ok);
  assert.equal(a.realized, 500);
  assert.equal(a.trades.length, 1);
  assert.equal(a.trades[0].pnl, 500);
  assert.equal(Object.keys(a.positions).length, 0);
});

test('spread: buy at ask, sell at bid', () => {
  const a = newAccount(10000);
  px = 100;
  const e: Env = { mark: () => px, spreadBps: () => 20, m: 1 };
  placeOrder(a, { symbol: 'X', side: 'buy', type: 'market', qty: 10 }, e);
  assert.ok(Math.abs(a.positions.X.avg - 100.1) < 1e-9);
  closePosition(a, 'X', e);
  assert.ok(a.trades[0].pnl < 0, 'a round trip at the same price loses the spread');
});

test('short selling profits when price falls', () => {
  const a = newAccount(10000, 2);
  px = 100;
  assert.ok(placeOrder(a, { symbol: 'X', side: 'sell', type: 'market', qty: 40 }, env()).ok);
  assert.equal(a.positions.X.qty, -40);
  px = 90;
  assert.equal(equityOf(a, env()), 10400);
  closePosition(a, 'X', env(2));
  assert.equal(a.trades[0].dir, 'short');
  assert.equal(a.trades[0].pnl, 400);
});

test('buying power: no leverage rejects an oversized order; leverage allows it', () => {
  px = 100;
  const a = newAccount(10000, 1);
  const r = placeOrder(a, { symbol: 'X', side: 'buy', type: 'market', qty: 101 }, env());
  assert.ok(!r.ok && /buying power/i.test(r.error!));
  assert.ok(placeOrder(a, { symbol: 'X', side: 'buy', type: 'market', qty: 100 }, env()).ok);
  const b = newAccount(10000, 4);
  assert.ok(placeOrder(b, { symbol: 'X', side: 'buy', type: 'market', qty: 300 }, env()).ok);
});

test('limit buy rests, then fills at the limit; gap down fills at the better open', () => {
  px = 100;
  const a = newAccount(10000);
  const r = placeOrder(a, { symbol: 'X', side: 'buy', type: 'limit', limit: 95, qty: 10 }, env());
  assert.ok(r.ok && r.order!.status === 'open');
  onBar(a, 'X', { o: 99, h: 100, l: 96, c: 97 }, env(2));
  assert.equal(a.orders[0].status, 'open');
  onBar(a, 'X', { o: 98, h: 98, l: 94, c: 96 }, env(3));
  assert.equal(a.orders[0].status, 'filled');
  assert.equal(a.positions.X.avg, 95);
  const b = newAccount(10000);
  placeOrder(b, { symbol: 'X', side: 'buy', type: 'limit', limit: 95, qty: 10 }, env());
  onBar(b, 'X', { o: 90, h: 92, l: 89, c: 91 }, env(2));
  assert.equal(b.positions.X.avg, 90, 'price improvement on a gap');
});

test('bracket: stop wins a same-bar tie, sibling is cancelled', () => {
  px = 100;
  const a = newAccount(10000);
  assert.ok(placeOrder(a, { symbol: 'X', side: 'buy', type: 'market', qty: 10, sl: 95, tp: 110 }, env()).ok);
  const open = openOrders(a);
  assert.equal(open.length, 2);
  onBar(a, 'X', { o: 100, h: 111, l: 94, c: 100 }, env(2));
  assert.equal(Object.keys(a.positions).length, 0);
  assert.equal(a.trades[0].exit, 95);
  assert.equal(a.trades[0].pnl, -50);
  assert.equal(a.trades[0].r, -1);
  assert.equal(openOrders(a).length, 0);
});

test('bracket take-profit hits and cancels the stop', () => {
  px = 100;
  const a = newAccount(10000);
  placeOrder(a, { symbol: 'X', side: 'buy', type: 'market', qty: 10, sl: 95, tp: 110 }, env());
  onBar(a, 'X', { o: 101, h: 112, l: 100, c: 111 }, env(2));
  assert.equal(a.trades[0].exit, 110);
  assert.equal(a.trades[0].r, 2);
  assert.equal(openOrders(a).length, 0);
});

test('stop gap fills at the open, not the stop', () => {
  px = 100;
  const a = newAccount(10000);
  placeOrder(a, { symbol: 'X', side: 'buy', type: 'market', qty: 10, sl: 95 }, env());
  onBar(a, 'X', { o: 90, h: 91, l: 88, c: 89 }, env(2));
  assert.equal(a.trades[0].exit, 90);
});

test('stop orders on the wrong side are rejected; bad qty rejected', () => {
  px = 100;
  const a = newAccount(10000);
  assert.ok(!placeOrder(a, { symbol: 'X', side: 'sell', type: 'stop', stop: 105, qty: 1 }, env()).ok);
  assert.ok(!placeOrder(a, { symbol: 'X', side: 'buy', type: 'market', qty: 0 }, env()).ok);
  assert.ok(!placeOrder(a, { symbol: 'X', side: 'buy', type: 'market', qty: 1.5 }, env()).ok);
  assert.ok(!placeOrder(a, { symbol: 'X', side: 'buy', type: 'market', qty: 1, sl: 105 }, env()).ok);
});

test('protectPosition adds linked exits, partial close shrinks them', () => {
  px = 100;
  const a = newAccount(10000);
  placeOrder(a, { symbol: 'X', side: 'buy', type: 'market', qty: 20 }, env());
  assert.ok(protectPosition(a, 'X', 95, 112, env()).ok);
  assert.equal(openOrders(a).length, 2);
  placeOrder(a, { symbol: 'X', side: 'sell', type: 'market', qty: 5 }, env(2));
  assert.ok(openOrders(a).every((o) => o.qty === 15));
  assert.equal(a.trades.length, 1);
  assert.ok(cancelOrder(a, openOrders(a)[0].id));
});

test('flipping long to short in one order realizes P&L and opens the rest', () => {
  px = 100;
  const a = newAccount(10000, 2);
  placeOrder(a, { symbol: 'X', side: 'buy', type: 'market', qty: 10 }, env());
  px = 105;
  placeOrder(a, { symbol: 'X', side: 'sell', type: 'market', qty: 15 }, env(2));
  assert.equal(a.trades[0].pnl, 50);
  assert.equal(a.positions.X.qty, -5);
});

test('day orders expire, gtc brackets stay; stats and drawdown', () => {
  px = 100;
  const a = newAccount(10000);
  placeOrder(a, { symbol: 'X', side: 'buy', type: 'limit', limit: 90, qty: 1 }, env());
  placeOrder(a, { symbol: 'X', side: 'buy', type: 'market', qty: 1, sl: 90 }, env());
  expireDayOrders(a);
  assert.equal(openOrders(a).length, 1);
  const s = statsOf([{ pnl: 100 } as any, { pnl: -50 } as any, { pnl: 200 } as any]);
  assert.equal(s.winRate, 2 / 3);
  assert.equal(s.profitFactor, 6);
  assert.ok(Math.abs(maxDrawdown([100, 120, 90, 130]) - 0.25) < 1e-9);
});

test('account survives a JSON round trip', () => {
  px = 100;
  const a = newAccount(10000);
  placeOrder(a, { symbol: 'X', side: 'buy', type: 'market', qty: 10, sl: 95, tp: 110 }, env());
  const b = JSON.parse(JSON.stringify(a));
  onBar(b, 'X', { o: 101, h: 112, l: 100, c: 111 }, env(2));
  assert.equal(b.trades.length, 1);
});
