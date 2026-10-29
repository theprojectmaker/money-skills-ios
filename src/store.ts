// One small external store for the whole app, saved to the device (AsyncStorage). Nothing is ever sent anywhere.
import { useSyncExternalStore } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Account, newAccount } from './engine/account';
import type { Tf } from './engine/series';
import type { IndicatorId } from './engine/indicators';
import type { Drawing, Ticket } from './content/types';
import { DEFAULT_WATCHLIST } from './engine/universe';
import { SESSION_MIN } from './engine/generator';

export type ChartType = 'candles' | 'bars' | 'line' | 'area';
export type Tool = 'cursor' | 'cross' | 'trend' | 'hline' | 'fib' | 'rect';
export type PickField = 'limit' | 'stop' | 'sl' | 'tp' | null;

export type View = { offset: number; span: number }; // bars scrolled back from the newest bar; bars visible

export type TermState = {
  symbol: string;
  tf: Tf;
  chartType: ChartType;
  indicators: IndicatorId[];
  drawings: Record<string, Drawing[]>;
  cursor: number; // sim minute index the clock is at
  season: number;
  account: Account;
  rev: number; // bumped when the account is changed in place
  ticket: Ticket;
  pick: PickField;
  tool: Tool;
  selected: number | null; // selected drawing id
  playing: boolean;
  speed: number; // sim minutes per second
  view: View;
  sandbox: null | 'lesson' | 'replay';
  nextDrawingId: number;
};

export type JournalEntry = { note: string; emotion?: string; setup?: string };
export type LessonRun = { id: string; step: number; stepDone: boolean; base: any | null; attempts: number; startedAt: number };

export type State = {
  ready: boolean;
  term: TermState;
  stash: TermState | null; // the main practice session while a lesson or replay sandbox is showing
  watchlist: string[];
  journal: Record<number, JournalEntry>;
  progress: Record<string, { step: number; done: boolean; stepsDone: number[] }>;
  exams: Record<string, { best: number; passed: boolean; tries: number }>;
  xp: number;
  streak: { day: string; count: number; best: number };
  achievements: Record<string, number>;
  counts: Record<string, number>;
  lesson: LessonRun | null;
  calcSaved: Record<string, Record<string, number>>;
  settings: { name: string; haptics: boolean; disclaimerSeen: boolean; startBalance: number; leverage: number; commission: number; compact: boolean };
  toast: { id: number; text: string } | null;
};

export const DEFAULT_TICKET: Ticket = { side: 'buy', type: 'market', qty: 10 };

export function newTerm(season = 1, cursor = 205 * SESSION_MIN + 30, balance = 100000, leverage = 1, commission = 0): TermState {
  return {
    symbol: 'NOVA', tf: '5m', chartType: 'candles', indicators: ['vol'], drawings: {}, cursor, season,
    account: newAccount(balance, leverage, commission), rev: 0, ticket: { ...DEFAULT_TICKET }, pick: null, tool: 'cursor', selected: null,
    playing: false, speed: 1, view: { offset: 0, span: 90 }, sandbox: null, nextDrawingId: 1,
  };
}

const initial = (): State => ({
  ready: false,
  term: newTerm(),
  stash: null,
  watchlist: [...DEFAULT_WATCHLIST],
  journal: {},
  progress: {},
  exams: {},
  xp: 0,
  streak: { day: '', count: 0, best: 0 },
  achievements: {},
  counts: {},
  lesson: null,
  calcSaved: {},
  settings: { name: '', haptics: true, disclaimerSeen: false, startBalance: 100000, leverage: 1, commission: 0, compact: false },
  toast: null,
});

let state: State = initial();
const listeners = new Set<() => void>();
export const getState = () => state;
export function setState(fn: (s: State) => Partial<State> | void) {
  const patch = fn(state);
  state = patch ? { ...state, ...patch } : { ...state };
  listeners.forEach((l) => l());
  schedulePersist();
}
export function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}
export function useStore<T>(selector: (s: State) => T): T {
  return useSyncExternalStore(subscribe, () => selector(state), () => selector(state));
}

/** Change the active term in place (new object so subscribers re-render). */
export function patchTerm(p: Partial<TermState> | ((t: TermState) => Partial<TermState> | void)) {
  setState((s) => {
    const part = typeof p === 'function' ? p(s.term) : p;
    return { term: { ...s.term, ...(part || {}), rev: s.term.rev + 1 } };
  });
}
export function bump(key: string, by = 1) {
  state = { ...state, counts: { ...state.counts, [key]: (state.counts[key] || 0) + by } };
  listeners.forEach((l) => l());
}
let toastId = 1;
export function toast(text: string) {
  const id = toastId++;
  setState(() => ({ toast: { id, text } }));
  setTimeout(() => {
    if (state.toast?.id === id) setState(() => ({ toast: null }));
  }, 3200);
}

// ---- persistence -------------------------------------------------------------------------------------------
const KEY = 'moneyskills:v1';
let timer: any = null;
function schedulePersist() {
  if (!state.ready) return;
  if (timer) clearTimeout(timer);
  timer = setTimeout(save, 700);
}
function persistable() {
  const main = state.stash ?? state.term;
  const { playing, ...rest } = main;
  return {
    v: 1,
    term: { ...rest, playing: false, sandbox: null, pick: null, tool: 'cursor' },
    watchlist: state.watchlist, journal: state.journal, progress: state.progress, exams: state.exams, xp: state.xp,
    streak: state.streak, achievements: state.achievements, calcSaved: state.calcSaved, settings: state.settings,
    counts: state.counts,
    lesson: state.lesson ? { ...state.lesson, base: null } : null,
  };
}
export async function save() {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(persistable()));
  } catch {
    /* storage unavailable: the app still works for this session */
  }
}
export async function load() {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (raw) {
      const d = JSON.parse(raw);
      const base = initial();
      const term: TermState = { ...newTerm(), ...d.term, playing: false, sandbox: null };
      state = {
        ...base, ...d, term, stash: null, ready: true,
        settings: { ...base.settings, ...(d.settings || {}) },
        lesson: null, // an interrupted lesson restarts from its saved step when the learner re-opens it
        toast: null,
      };
    } else state = { ...state, ready: true };
  } catch {
    state = { ...state, ready: true };
  }
  listeners.forEach((l) => l());
}
export async function wipeAll() {
  try {
    await AsyncStorage.removeItem(KEY);
  } catch {}
  state = { ...initial(), ready: true };
  listeners.forEach((l) => l());
}
