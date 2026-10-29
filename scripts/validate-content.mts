// Run: npx tsx scripts/validate-content.ts   (exit code 1 on errors)
import { CALC_BY_ID, evaluate } from '../src/calc/calcs.ts';
import type { TermS, Course } from '../src/content/types';
import { newAccount } from '../src/engine/account.ts';

const files = process.argv.slice(2);
const COURSES: Course[] = [];
const errs: string[] = [];
const warn: string[] = [];
const err = (m: string) => errs.push(m);
const ids = new Set<string>();

const mock: TermS = {
  symbol: 'NOVA', tf: '5m', chartType: 'candles', indicators: [], drawings: [], positions: [], orders: [], trades: [],
  ticket: { side: 'buy', type: 'market', qty: 0 }, cursor: 100, equity: 100000, cash: 100000, startBalance: 100000, last: 100, atr: 1,
  levels: { support: [], resistance: [] }, counts: {}, zoomSpan: 90, scrolledBack: false, watchlist: [],
};

async function load() {
  if (files.length) for (const f of files) COURSES.push((await import("../src/content/" + f)).default);
  else COURSES.push(...(await import("../src/content")).COURSES);
}
await load();
for (const c of COURSES) {
  if (ids.has(c.id)) err('duplicate course id ' + c.id);
  ids.add(c.id);
  if (c.outcomes.length < 4 || c.outcomes.length > 6) err(`${c.id}: outcomes should be 4-6`);
  if (c.lessons.length < 3) err(`${c.id}: needs at least 3 lessons`);
  if (c.exam.questions.length < 10) err(`${c.id}: exam needs at least 10 questions`);
  c.exam.questions.forEach((q, i) => {
    if (q.options.length < 3) err(`${c.id} exam q${i}: needs 3+ options`);
    if (!(q.answer >= 0 && q.answer < q.options.length)) err(`${c.id} exam q${i}: answer out of range`);
    if (!q.explain) err(`${c.id} exam q${i}: needs an explanation`);
  });
  const ans = c.exam.questions.map((q) => q.answer);
  if (ans.length >= 10 && new Set(ans).size < 3) warn.push(`${c.id}: exam answers barely vary`);
  for (const l of c.lessons) {
    if (ids.has(l.id)) err('duplicate lesson id ' + l.id);
    ids.add(l.id);
    if (!l.id.startsWith(c.id.slice(0, 4))) warn.push(`${l.id}: id should start with the course id`);
    if (l.steps.length < 7) err(`${l.id}: needs at least 7 steps (has ${l.steps.length})`);
    const last = l.steps[l.steps.length - 1];
    if (last.type !== 'read') warn.push(`${l.id}: last step should be a read recap`);
    if (!l.steps.some((s) => s.type === 'quiz')) err(`${l.id}: needs a quiz step`);
    if (c.kind === 'trading' && !l.steps.some((s) => s.type === 'do')) err(`${l.id}: trading lessons need a do step`);
    if (c.kind === 'life' && !l.steps.some((s) => s.type === 'calc')) warn.push(`${l.id}: life lessons should usually have a calc step`);
    if (c.kind === 'life' && l.steps.some((s) => s.type === 'do')) err(`${l.id}: life lessons cannot use do steps`);
    let run = 0;
    l.steps.forEach((s, i) => {
      run = s.type === 'read' ? run + 1 : 0;
      if (run > 3) warn.push(`${l.id}: more than 3 read steps in a row at step ${i + 1}`);
      if (!s.title) err(`${l.id} step ${i + 1}: no title`);
      if (s.type === 'quiz') {
        if (s.options.length < 2 || !(s.answer >= 0 && s.answer < s.options.length)) err(`${l.id} step ${i + 1}: bad quiz answer`);
        if (!s.explain) err(`${l.id} step ${i + 1}: quiz needs explain`);
      }
      if (s.type === 'do') {
        try { s.done(mock, mock); } catch (e) { err(`${l.id} step ${i + 1}: done() throws on an empty state: ${e}`); }
        if (!s.task) err(`${l.id} step ${i + 1}: do needs a task`);
      }
      if (s.type === 'calc') {
        const def = CALC_BY_ID[s.calc];
        if (!def) { err(`${l.id} step ${i + 1}: unknown calculator ${s.calc}`); return; }
        for (const k of Object.keys(s.preset ?? {})) if (!def.fields.some((f) => f.key === k)) err(`${l.id} step ${i + 1}: preset key ${k} not a field of ${s.calc}`);
        try { s.done(evaluate(s.calc, s.preset ?? {})); } catch (e) { err(`${l.id} step ${i + 1}: calc done() throws: ${e}`); }
        // a calc task that is already satisfied by the preset values would be a free pass
        try { if (s.done(evaluate(s.calc, s.preset ?? {}))) warn.push(`${l.id} step ${i + 1}: calc task is already true at the preset values`); } catch { /* reported above */ }
      }
    });
  }
}
void newAccount;
const steps = COURSES.reduce((n, c) => n + c.lessons.reduce((m, l) => m + l.steps.length, 0), 0);
console.log(`${COURSES.length} courses, ${COURSES.reduce((n, c) => n + c.lessons.length, 0)} lessons, ${steps} steps`);
warn.forEach((w) => console.log('warn: ' + w));
errs.forEach((e) => console.log('ERROR: ' + e));
process.exit(errs.length ? 1 : 0);
