import test from 'node:test';
import assert from 'node:assert/strict';
import { generateMinutes, minutesFor, TOTAL_MIN, SESSION_MIN, DAYS, dayOf, findRegimeDay } from '../src/engine/generator';
import { UNIVERSE } from '../src/engine/universe';
import { windowAt, aggFor, TIMEFRAMES } from '../src/engine/series';
import { sma, ema, rsi, macd, bollinger, vwap, swingLevels } from '../src/engine/indicators';
import { positionSize, riskReward, breakEvenWinRate } from '../src/engine/risk';

test('generator is deterministic and per-seed different', () => {
  const a = generateMinutes('NOVA', 1), b = generateMinutes('NOVA', 1), c = generateMinutes('NOVA', 2);
  assert.equal(a.c[12345], b.c[12345]);
  assert.notEqual(a.c[12345], c.c[12345]);
  assert.equal(a.c.length, TOTAL_MIN);
});

test('every ticker produces sane OHLC with no NaN and high>=low', () => {
  for (const s of UNIVERSE) {
    const d = minutesFor(s.symbol);
    for (let i = 0; i < TOTAL_MIN; i += 7) {
      assert.ok(d.l[i] > 0 && Number.isFinite(d.c[i]), s.symbol + ' bad price at ' + i);
      assert.ok(d.h[i] >= d.l[i] - 1e-9 && d.h[i] >= d.o[i] - 1e-9 && d.h[i] >= d.c[i] - 1e-9 && d.l[i] <= d.o[i] + 1e-9 && d.l[i] <= d.c[i] + 1e-9, s.symbol + ' ohlc at ' + i);
      assert.ok(d.v[i] > 0);
    }
  }
});

test('regimes, gaps and earnings jumps exist', () => {
  const d = minutesFor('BOLT');
  const set = new Set(d.regimeByDay);
  for (const r of ['up', 'down', 'range', 'volatile']) assert.ok(set.has(r as any), 'missing regime ' + r);
  assert.ok(d.earningsDays.length >= 3);
  const day = d.earningsDays[1];
  assert.ok(Math.abs(d.gapByDay[day]) >= 0.04, 'earnings gap should be large');
  assert.ok(findRegimeDay('NOVA', 'up') >= 0 || findRegimeDay('BOLT', 'up', 1, 4) >= 0);
});

test('daily volatility is realistic (0.5%..8%)', () => {
  for (const s of UNIVERSE) {
    const d = minutesFor(s.symbol);
    let sum = 0, n = 0;
    for (let day = 1; day < DAYS; day++) {
      const r = Math.log(d.c[(day + 1) * SESSION_MIN - 1] / d.c[day * SESSION_MIN - 1]);
      sum += r * r; n++;
    }
    const vol = Math.sqrt(sum / n);
    assert.ok(vol > 0.003 && vol < 0.09, `${s.symbol} daily vol ${vol}`);
  }
});

test('timeframes aggregate consistently with minutes', () => {
  const d = minutesFor('NOVA');
  for (const tf of TIMEFRAMES) {
    const a = aggFor('NOVA', tf);
    let vol = 0;
    for (let i = 0; i < a.n; i++) {
      vol += a.v[i];
      assert.ok(a.h[i] >= a.l[i]);
      assert.equal(a.o[i], d.o[a.startM[i]]);
      assert.equal(a.c[i], d.c[a.endM[i] - 1]);
    }
    let want = 0;
    for (let m = 0; m < TOTAL_MIN; m++) want += d.v[m];
    assert.ok(Math.abs(vol - want) / want < 1e-9, tf + ' volume mismatch');
  }
  assert.equal(aggFor('NOVA', '1D').n, DAYS);
  assert.equal(aggFor('NOVA', '5m').n, DAYS * 78);
});

test('window shows a partly formed last bar and never peeks past the cursor', () => {
  const cursor = 100 * SESSION_MIN + 7; // 7 minutes into a day: a 15m bar is half done
  const w = windowAt('NOVA', '15m', cursor);
  const d = minutesFor('NOVA');
  const s = 100 * SESSION_MIN;
  let hi = -Infinity;
  for (let m = s; m <= cursor; m++) hi = Math.max(hi, d.h[m]);
  assert.equal(w.h[w.n - 1], hi);
  assert.equal(w.c[w.n - 1], d.c[cursor]);
  assert.equal(dayOf(cursor), 100);
  const w1 = windowAt('NOVA', '1D', cursor);
  assert.equal(w1.c[w1.n - 1], d.c[cursor]);
});

test('SMA/EMA/RSI/MACD/Bollinger match slow reference maths', () => {
  const xs = Array.from({ length: 120 }, (_, i) => 100 + Math.sin(i / 5) * 5 + i * 0.1);
  const s = sma(xs, 10);
  assert.ok(Math.abs(s[50] - xs.slice(41, 51).reduce((a, b) => a + b, 0) / 10) < 1e-9);
  assert.ok(Number.isNaN(s[8]));
  const e = ema(xs, 9);
  let ref = xs.slice(0, 9).reduce((a, b) => a + b, 0) / 9;
  for (let i = 9; i <= 60; i++) ref = xs[i] * (2 / 10) + ref * (1 - 2 / 10);
  assert.ok(Math.abs(e[60] - ref) < 1e-9);
  const r = rsi(xs, 14);
  assert.ok(r[40] >= 0 && r[40] <= 100);
  assert.equal(rsi([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16], 14)[15], 100);
  const m = macd(xs);
  assert.ok(Math.abs(m.hist[100] - (m.line[100] - m.signal[100])) < 1e-12);
  const bb = bollinger(xs, 20, 2);
  assert.ok(bb.up[60] > bb.mid[60] && bb.lo[60] < bb.mid[60]);
  const sd = Math.sqrt(xs.slice(41, 61).reduce((a, x) => a + (x - bb.mid[60]) ** 2, 0) / 20);
  assert.ok(Math.abs(bb.up[60] - (bb.mid[60] + 2 * sd)) < 1e-9);
});

test('VWAP restarts each day and equals typical price for one bar', () => {
  const w = windowAt('NOVA', '5m', 50 * SESSION_MIN + 200);
  const v = vwap(w);
  const first = w.day.findIndex((d, i) => i > 0 && d !== w.day[i - 1]);
  assert.ok(Math.abs(v[first] - (w.h[first] + w.l[first] + w.c[first]) / 3) < 1e-9);
  assert.ok(Number.isNaN(vwap(windowAt('NOVA', '1D', 5000))[10]));
});

test('swing levels find support below and resistance above price', () => {
  const day = findRegimeDay('NOVA', 'range', 1, 6);
  const w = windowAt('NOVA', '15m', Math.max(day, 40) * SESSION_MIN + 3 * SESSION_MIN);
  const lv = swingLevels(w);
  for (const s of lv.support) assert.ok(s < w.c[w.n - 1]);
  for (const r of lv.resistance) assert.ok(r > w.c[w.n - 1]);
});

test('risk maths', () => {
  assert.equal(positionSize(100000, 1, 50, 48), 500);
  assert.equal(positionSize(100000, 1, 50, 50), 0);
  assert.equal(riskReward(50, 48, 56), 3);
  assert.equal(breakEvenWinRate(2), 1 / 3);
});
