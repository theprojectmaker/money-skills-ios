import { test } from 'node:test';
import assert from 'node:assert/strict';
import { atr, mulberry32 } from '../src/engine/gen';
import { FUTURE, HIST, KIND_ORDER, makeScenario } from '../src/engine/scenarios';
import { LESSONS } from '../src/content/lessons';

test('lesson example charts are deterministic and well formed', () => {
  for (const k of KIND_ORDER) for (let s = 1; s <= 30; s++) {
    const a = makeScenario(k, s), b = makeScenario(k, s);
    assert.deepEqual(a.bars, b.bars);
    assert.equal(a.bars.length, HIST + FUTURE);
    for (const x of a.bars) assert.ok(x.h >= Math.max(x.o, x.c) && x.l <= Math.min(x.o, x.c) && x.l > 0, `${k}/${s}`);
  }
  assert.ok(atr(makeScenario('support', 5).bars, HIST) > 0);
  assert.ok(mulberry32(1)() !== mulberry32(2)());
});

test('every quiz answer points at a real option', () => {
  for (const l of LESSONS) for (const q of l.quiz) assert.ok(q.answer >= 0 && q.answer < q.options.length, l.id);
});

test('the terminal page is present and has no data relay address', () => {
  const page: string = require('../src/terminal/page.js');
  assert.ok(page.length > 500000 && page.includes('MYSTERY'));
  assert.ok(!page.includes('workers.dev') && !page.includes('script.google.com/macros'));
});
