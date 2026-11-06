import { test } from 'node:test';
import assert from 'node:assert/strict';

test('the terminal page has the Predict rounds and the whole course library', () => {
  const page: string = require('../src/terminal/page.js');
  for (const text of ['MYSTERY', 'TradingView Academy', 'Roadmap']) assert.ok(page.includes(text), text);
  assert.ok(!page.includes('script.google.com/macros'));
});
