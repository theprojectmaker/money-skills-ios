// Tiny persisted store for the native screens: the welcome flag and lesson scores. The terminal keeps its own saved data.
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSyncExternalStore } from 'react';

export type State = { ready: boolean; seen: boolean; learn: Record<string, number> };

let state: State = { ready: false, seen: false, learn: {} };
const listeners = new Set<() => void>();
const KEY = 'moneyskills:v2';
const emit = () => listeners.forEach((l) => { try { l(); } catch { /* a bad listener must not stop the rest */ } });

export const getState = () => state;
export function set(patch: Partial<State>) {
  state = { ...state, ...patch };
  emit();
  const { seen, learn } = state;
  AsyncStorage.setItem(KEY, JSON.stringify({ seen, learn })).catch(() => {});
}
export function useStore<T>(pick: (s: State) => T): T {
  return useSyncExternalStore(
    (l) => { listeners.add(l); return () => { listeners.delete(l); }; },
    () => pick(state),
    () => pick(state),
  );
}
export async function load() {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (raw) {
      const d = JSON.parse(raw);
      state = { ready: true, seen: !!d.seen, learn: d.learn || {} };
      emit();
      return;
    }
  } catch { /* fall through to a fresh start */ }
  state = { ...state, ready: true };
  emit();
}
