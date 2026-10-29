// XP, levels, streaks and achievements. Everything is stored on the device.
import { getState, setState, toast, bump } from './store';

export const TITLES = ['Rookie', 'Apprentice', 'Saver', 'Planner', 'Trader', 'Strategist', 'Analyst', 'Veteran', 'Mentor', 'Master'];
/** Total XP needed to reach level n (n >= 1). */
export const xpForLevel = (n: number) => (n <= 1 ? 0 : Math.round(100 * Math.pow(n - 1, 1.5)));
export function levelOf(xp: number) {
  let n = 1;
  while (xp >= xpForLevel(n + 1)) n++;
  const lo = xpForLevel(n), hi = xpForLevel(n + 1);
  return { level: n, title: TITLES[Math.min(TITLES.length - 1, Math.floor((n - 1) / 2))], into: xp - lo, need: hi - lo, pct: (xp - lo) / (hi - lo) };
}

const dayKey = (d = new Date()) => `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
export function touchStreak(now = new Date()) {
  setState((s) => {
    const today = dayKey(now);
    if (s.streak.day === today) return;
    const y = new Date(now);
    y.setDate(y.getDate() - 1);
    const count = s.streak.day === dayKey(y) ? s.streak.count + 1 : 1;
    return { streak: { day: today, count, best: Math.max(s.streak.best, count) } };
  });
}

export function addXp(n: number, why?: string) {
  const before = levelOf(getState().xp).level;
  setState((s) => ({ xp: s.xp + n }));
  touchStreak();
  const after = levelOf(getState().xp);
  if (after.level > before) toast(`Level up! You are level ${after.level}: ${after.title}`);
  else if (why && n >= 25) toast(`+${n} XP  ${why}`);
}

export type Achievement = { id: string; title: string; how: string; icon: string; test: (s: ReturnType<typeof getState>) => boolean };
const lessonsDone = (s: ReturnType<typeof getState>) => Object.values(s.progress).filter((p) => p.done).length;
const done = (s: ReturnType<typeof getState>, id: string) => !!s.progress[id]?.done;
export const ACHIEVEMENTS: Achievement[] = [
  { id: 'first-lesson', icon: '🎓', title: 'First lesson', how: 'Finish any lesson', test: (s) => lessonsDone(s) >= 1 },
  { id: 'five-lessons', icon: '📚', title: 'Bookworm', how: 'Finish 5 lessons', test: (s) => lessonsDone(s) >= 5 },
  { id: 'twenty-lessons', icon: '🏫', title: 'Scholar', how: 'Finish 20 lessons', test: (s) => lessonsDone(s) >= 20 },
  { id: 'first-order', icon: '🧾', title: 'First order', how: 'Place an order in the practice terminal', test: (s) => (s.counts.ordersPlaced || 0) >= 1 },
  { id: 'first-trade', icon: '🔁', title: 'Round trip', how: 'Close your first trade', test: (s) => (s.counts.tradesClosed || 0) >= 1 },
  { id: 'first-win', icon: '🌱', title: 'In the green', how: 'Close a trade at a profit', test: (s) => (s.counts.winningTrades || 0) >= 1 },
  { id: 'stop-loss', icon: '🛑', title: 'Safety first', how: 'Place a trade with a stop-loss attached', test: (s) => (s.counts.ordersWithStop || 0) >= 1 },
  { id: 'short', icon: '🔻', title: 'Both directions', how: 'Open a short position', test: (s) => (s.counts.shortsOpened || 0) >= 1 },
  { id: 'ten-trades', icon: '🔟', title: 'Getting reps', how: 'Close 10 trades', test: (s) => (s.counts.tradesClosed || 0) >= 10 },
  { id: 'drawing', icon: '✏️', title: 'Chart artist', how: 'Draw on the chart', test: (s) => (s.counts.drawingsCreated || 0) >= 1 },
  { id: 'journal', icon: '📓', title: 'Journal keeper', how: 'Write 3 journal notes', test: (s) => (s.counts.journalNotes || 0) >= 3 },
  { id: 'replay', icon: '⏪', title: 'Time traveller', how: 'Practice in a replay session', test: (s) => (s.counts.replaysStarted || 0) >= 1 },
  { id: 'calc', icon: '🧮', title: 'Number cruncher', how: 'Finish a calculator task in a lesson', test: (s) => (s.counts.calcTasks || 0) >= 1 },
  { id: 'exam', icon: '🏅', title: 'Certified', how: 'Pass a course exam', test: (s) => Object.values(s.exams).some((e) => e.passed) },
  { id: 'streak3', icon: '🔥', title: 'On a roll', how: 'Practice 3 days in a row', test: (s) => s.streak.best >= 3 },
  { id: 'streak7', icon: '⚡', title: 'Week warrior', how: 'Practice 7 days in a row', test: (s) => s.streak.best >= 7 },
  { id: 'trading-done', icon: '📈', title: 'Day trading graduate', how: 'Finish every lesson in the trading course', test: (s) => [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].every((i) => done(s, 'trading-' + i)) },
  { id: 'level5', icon: '⭐', title: 'Level 5', how: 'Reach level 5', test: (s) => levelOf(s.xp).level >= 5 },
];

/** Call after state changes: unlocks any achievement whose test now passes. */
export function checkAchievements() {
  const s = getState();
  const fresh = ACHIEVEMENTS.filter((a) => !s.achievements[a.id] && a.test(s));
  if (!fresh.length) return;
  setState((st) => {
    const next = { ...st.achievements };
    for (const f of fresh) next[f.id] = Date.now();
    return { achievements: next, xp: st.xp + 20 * fresh.length };
  });
  toast(`Achievement unlocked: ${fresh.map((f) => f.title).join(', ')}  +${20 * fresh.length} XP`);
  void bump;
}
