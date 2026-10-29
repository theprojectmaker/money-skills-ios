// Lesson runtime: which lesson/step is active, progress, XP, and the sandbox for hands-on trading lessons.
import { getState, setState, bump, toast } from './store';
import { LESSON_BY_ID, COURSES } from './content';
import { addXp, checkAchievements } from './progress';
import { buildS, enterSandbox, exitSandbox, retargetSandbox } from './sim';
import type { Step } from './content/types';

export function lessonInfo(id: string) {
  return LESSON_BY_ID[id];
}
export function stepOf(): Step | null {
  const run = getState().lesson;
  if (!run) return null;
  return LESSON_BY_ID[run.id]?.lesson.steps[run.step] ?? null;
}

function enterStep(i: number) {
  const run = getState().lesson;
  if (!run) return;
  const { lesson } = LESSON_BY_ID[run.id];
  const step = lesson.steps[i];
  if (step.type === 'do' && step.scenario) retargetSandbox(step.scenario);
  setState((s) => ({ lesson: s.lesson ? { ...s.lesson, step: i, stepDone: step.type === 'read' || step.type === 'look', attempts: 0, base: buildS() } : null }));
  setState((s) => ({ progress: { ...s.progress, [run.id]: { step: i, done: s.progress[run.id]?.done ?? false, stepsDone: s.progress[run.id]?.stepsDone ?? [] } } }));
}

export function startLesson(id: string, restart = false) {
  const info = LESSON_BY_ID[id];
  if (!info) return;
  const { lesson, course } = info;
  const saved = getState().progress[id];
  const start = !restart && saved && !saved.done ? Math.min(saved.step, lesson.steps.length - 1) : 0;
  if (course.kind === 'trading') {
    const sc = lesson.scenario ?? { symbol: 'NOVA', tf: '5m' as const };
    enterSandbox('lesson', sc);
  } else if (getState().term.sandbox) exitSandbox();
  setState(() => ({ lesson: { id, step: start, stepDone: false, base: null, attempts: 0, startedAt: Date.now() } }));
  enterStep(start);
}

export function markStepDone() {
  setState((s) => (s.lesson && !s.lesson.stepDone ? { lesson: { ...s.lesson, stepDone: true } } : {}));
}

export function nextStep() {
  const run = getState().lesson;
  if (!run) return;
  const { lesson } = LESSON_BY_ID[run.id];
  const prog = getState().progress[run.id];
  if (!prog?.stepsDone.includes(run.step)) {
    setState((s) => ({ progress: { ...s.progress, [run.id]: { ...(s.progress[run.id] ?? { step: 0, done: false, stepsDone: [] }), stepsDone: [...(s.progress[run.id]?.stepsDone ?? []), run.step] } } }));
    addXp(5);
  }
  if (run.step + 1 >= lesson.steps.length) return finishLesson();
  enterStep(run.step + 1);
}
export function prevStep() {
  const run = getState().lesson;
  if (run && run.step > 0) enterStep(run.step - 1);
}

function finishLesson() {
  const run = getState().lesson;
  if (!run) return;
  const was = getState().progress[run.id]?.done;
  setState((s) => ({
    progress: { ...s.progress, [run.id]: { ...(s.progress[run.id] ?? { step: 0, stepsDone: [] }), step: 0, done: true } },
    lesson: null,
  }));
  if (getState().term.sandbox === 'lesson') exitSandbox();
  if (!was) {
    addXp(50, 'Lesson complete');
    toast('Lesson complete! +50 XP');
  }
  checkAchievements();
}

export function leaveLesson() {
  if (getState().term.sandbox === 'lesson') exitSandbox();
  setState(() => ({ lesson: null }));
}

export function courseProgress(courseId: string) {
  const c = COURSES.find((x) => x.id === courseId)!;
  const p = getState().progress;
  const done = c.lessons.filter((l) => p[l.id]?.done).length;
  return { done, total: c.lessons.length, pct: done / c.lessons.length };
}
export function nextLessonOf(courseId: string) {
  const c = COURSES.find((x) => x.id === courseId)!;
  const p = getState().progress;
  return c.lessons.find((l) => !p[l.id]?.done) ?? c.lessons[0];
}
void bump;
