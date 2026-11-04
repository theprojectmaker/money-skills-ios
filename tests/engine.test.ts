import { test } from 'node:test';
import assert from 'node:assert/strict';
import { atr, mulberry32 } from '../src/engine/gen';
import { FUTURE, HIST, KIND_ORDER, makeScenario } from '../src/engine/scenarios';
import { checkBar, planFor, resolve, settle } from '../src/engine/broker';
import { Market, Session, TICKERS, summarize } from '../src/engine/live';

test('scenarios are deterministic and well formed', () => {
  for (const k of KIND_ORDER) for (let s = 1; s <= 30; s++) {
    const a = makeScenario(k, s), b = makeScenario(k, s);
    assert.deepEqual(a.bars, b.bars);
    assert.equal(a.bars.length, HIST + FUTURE);
    for (const x of a.bars) {
      assert.ok(x.h >= Math.max(x.o, x.c) && x.l <= Math.min(x.o, x.c), `${k}/${s} ohlc`);
      assert.ok(x.l > 0 && Number.isFinite(x.v));
    }
  }
});

test('textbook outcome happens about two thirds of the time', () => {
  let p = 0; const N = 600;
  for (let s = 0; s < N; s++) if (makeScenario('uptrend', s + 1000).plays) p++;
  assert.ok(p / N > 0.58 && p / N < 0.72, String(p / N));
});

test('uptrend plays out higher and fails lower, on average', () => {
  let up = 0, upN = 0, dn = 0, dnN = 0;
  for (let s = 1; s <= 200; s++) {
    const sc = makeScenario('uptrend', s);
    const d = sc.bars[sc.bars.length - 1].c / sc.bars[HIST - 1].c - 1;
    if (sc.plays) { up += d; upN++; } else { dn += d; dnN++; }
  }
  assert.ok(up / upN > 0.03 && dn / dnN < -0.03);
});

test('stop wins a tie and gaps fill at the open', () => {
  const plan = planFor('long', 100, 1, 1, 2); // stop 99, target 102
  assert.equal(plan.stop, 99); assert.equal(plan.target, 102);
  assert.deepEqual(checkBar(plan, { o: 100, h: 103, l: 98, c: 100, v: 1 }), { price: 99, reason: 'stop' });
  assert.deepEqual(checkBar(plan, { o: 97, h: 98, l: 96, c: 97, v: 1 }), { price: 97, reason: 'stop' });
  assert.deepEqual(checkBar(plan, { o: 103, h: 104, l: 102, c: 103, v: 1 }), { price: 103, reason: 'target' });
  const sp = planFor('short', 100, 1, 1, 2);
  assert.deepEqual(checkBar(sp, { o: 100, h: 101.5, l: 97, c: 100, v: 1 }), { price: 101, reason: 'stop' });
});

test('resolve reports R and an open mark', () => {
  const bars = [{ o: 100, h: 100, l: 100, c: 100, v: 1 }, { o: 100, h: 101.2, l: 99.5, c: 101, v: 1 }, { o: 101, h: 102.5, l: 100.8, c: 102, v: 1 }];
  const plan = planFor('long', 100, 1, 1, 2);
  const open = resolve(bars, 1, 2, plan);
  assert.equal(open.exit, null); assert.equal(open.r, 1);
  const hit = resolve(bars, 1, 3, plan);
  assert.equal(hit.exit?.reason, 'target'); assert.equal(hit.r, 2);
  assert.equal(settle(bars, 1, planFor('long', 100, 1, 1, null)).exit.reason, 'time');
});

test('atr is positive on generated data', () => {
  const sc = makeScenario('support', 5);
  assert.ok(atr(sc.bars, HIST) > 0);
  assert.ok(mulberry32(1)() !== mulberry32(2)());
});

test('live session sizes by risk and survives a long run', () => {
  const s = new Session(new Market(TICKERS[2], 42));
  const sz = s.sizeFor(1, 1.5);
  assert.ok(sz.qty >= 1 && Math.abs(sz.riskCash - 100) < 1e-9);
  assert.equal(s.open('long', 1, 1.5, 2), null);
  assert.ok(s.open('long', 1, 1.5, 2));
  let guard = 0;
  while (!s.over && guard++ < 1000) { s.step(); if (!s.pos && Math.random() < 0.1) s.open(Math.random() < 0.5 ? 'long' : 'short', 1, 1.5, 2); }
  assert.ok(s.over && s.trades.length > 0 && Number.isFinite(s.equity()));
  const sum = summarize(s.trades);
  assert.equal(sum.n, s.trades.length);
  for (const t of s.trades) assert.ok(Number.isFinite(t.r) && Number.isFinite(t.pnl));
});
