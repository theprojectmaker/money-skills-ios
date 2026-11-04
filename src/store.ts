// Tiny persisted store. Only discrete events write to it (a finished round, a closed trade, a lesson score),
// never timers or gestures, so the app cannot be flooded with re-renders.
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSyncExternalStore } from 'react';
import type { Trade } from './engine/live';

export type PredictStats = {
  rounds: number; wins: number; losses: number; passes: number; totalR: number; streak: number; best: number;
  byKind: Record<string, { n: number; r: number }>;
};
export type State = {
  ready: boolean; seen: boolean;
  predict: PredictStats;
  learn: Record<string, number>; // lesson id -> best quiz score (0..1)
  trades: Trade[];
  sessions: number;
};

const blank = (): State => ({
  ready: false, seen: false,
  predict: { rounds: 0, wins: 0, losses: 0, passes: 0, totalR: 0, streak: 0, best: 0, byKind: {} },
  learn: {}, trades: [], sessions: 0,
});

let state = blank();
const listeners = new Set<() => void>();
const KEY = 'moneyskills:v2';
let timer: ReturnType<typeof setTimeout> | null = null;

export const getState = () => state;
export function set(patch: Partial<State>) {
  state = { ...state, ...patch };
  listeners.forEach((l) => { try { l(); } catch { /* a bad listener must not stop the rest */ } });
  if (!state.ready) return;
  if (timer) clearTimeout(timer);
  timer = setTimeout(() => { void save(); }, 400);
}
export function useStore<T>(pick: (s: State) => T): T {
  return useSyncExternalStore(
    (l) => { listeners.add(l); return () => { listeners.delete(l); }; },
    () => pick(state),
    () => pick(state),
  );
}

async function save() {
  try {
    const { ready, ...rest } = state;
    void ready;
    await AsyncStorage.setItem(KEY, JSON.stringify({ ...rest, trades: rest.trades.slice(-150) }));
  } catch { /* storage unavailable: the app still works for this session */ }
}

export async function load() {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (raw) {
      const d = JSON.parse(raw);
      const b = blank();
      state = { ...b, ...d, predict: { ...b.predict, ...(d.predict || {}) }, ready: true };
      listeners.forEach((l) => l());
      return;
    }
  } catch { /* fall through to a fresh start */ }
  state = { ...blank(), ready: true };
  listeners.forEach((l) => l());
}

export function recordRound(kind: string, r: number | null) {
  const p = state.predict;
  const k = p.byKind[kind] || { n: 0, r: 0 };
  if (r === null) {
    set({ predict: { ...p, rounds: p.rounds + 1, passes: p.passes + 1, streak: p.streak, byKind: { ...p.byKind, [kind]: { n: k.n + 1, r: k.r } } } });
    return;
  }
  const win = r > 0;
  const streak = win ? p.streak + 1 : 0;
  set({
    predict: {
      ...p, rounds: p.rounds + 1, wins: p.wins + (win ? 1 : 0), losses: p.losses + (win ? 0 : 1),
      totalR: Math.round((p.totalR + r) * 100) / 100, streak, best: Math.max(p.best, streak),
      byKind: { ...p.byKind, [kind]: { n: k.n + 1, r: Math.round((k.r + r) * 100) / 100 } },
    },
  });
}
