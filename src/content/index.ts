import type { Course, Lesson } from './types';
import trading from './trading';
import budgeting from './life/budgeting';
import compound from './life/compound';
import credit from './life/credit';
import investing from './life/investing';
import taxes from './life/taxes';
import scams from './life/scams';
import sidebiz from './life/sidebiz';
import pricing from './life/pricing';
import sales from './life/sales';

export const COURSES: Course[] = [trading, budgeting, compound, credit, investing, taxes, sidebiz, pricing, sales, scams];
export const COURSE_BY_ID: Record<string, Course> = Object.fromEntries(COURSES.map((c) => [c.id, c]));
export const LESSON_BY_ID: Record<string, { lesson: Lesson; course: Course }> = {};
for (const c of COURSES) for (const l of c.lessons) LESSON_BY_ID[l.id] = { lesson: l, course: c };
