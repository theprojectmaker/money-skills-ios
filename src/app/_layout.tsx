import React, { useEffect } from 'react';
import { Pressable, Text, View, useWindowDimensions, ActivityIndicator, Platform } from 'react-native';
import { Slot, usePathname, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { load, setState, useStore, getState, subscribe, save } from '../store';
import { checkAchievements, levelOf, touchStreak } from '../progress';
import { C } from '../ui/theme';
import { Btn, Sheet } from '../ui/kit';
import { ToastBar } from '../ui/terminal/Terminal';
import * as sim from '../sim';
import * as lessons from '../lessons';
import * as store from '../store';

// Test hook for the browser preview only.
if (Platform.OS === 'web' && typeof window !== 'undefined' && __DEV__) (window as any).__ms = { sim, lessons, store };

const TABS = [
  { path: '/', label: 'Trade', icon: '📈' },
  { path: '/learn', label: 'Learn', icon: '🎓' },
  { path: '/tools', label: 'Tools', icon: '🧮' },
  { path: '/profile', label: 'Profile', icon: '🏆' },
];

function Shell() {
  const path = usePathname();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const ready = useStore((s) => s.ready);
  const xp = useStore((s) => s.xp);
  const streak = useStore((s) => s.streak.count);
  const seen = useStore((s) => s.settings.disclaimerSeen);
  const rail = width >= 700;
  const lv = levelOf(xp);

  useEffect(() => {
    load().then(() => touchStreak());
    const off = subscribe(() => checkAchievementsSoon());
    const onHide = () => { save(); };
    if (Platform.OS === 'web' && typeof document !== 'undefined') document.addEventListener('visibilitychange', onHide);
    return () => { off(); if (Platform.OS === 'web' && typeof document !== 'undefined') document.removeEventListener('visibilitychange', onHide); };
  }, []);

  if (!ready) return <View style={{ flex: 1, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center' }}><ActivityIndicator color={C.accent} /></View>;

  const active = (p: string) => (p === '/' ? path === '/' || path === '/index' : path.startsWith(p) || (p === '/learn' && path.startsWith('/lesson')));
  const nav = TABS.map((t) => (
    <Pressable key={t.path} testID={`nav-${t.label.toLowerCase()}`} onPress={() => router.push(t.path as any)} accessibilityLabel={t.label}
      style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: rail ? 12 : 6, flex: rail ? undefined : 1, backgroundColor: active(t.path) ? C.active : 'transparent', borderRadius: rail ? 10 : 0, marginVertical: rail ? 2 : 0 }}>
      <Text style={{ fontSize: 22 }}>{t.icon}</Text>
      <Text style={{ color: active(t.path) ? '#fff' : C.muted, fontSize: 10, fontWeight: '700', marginTop: 2 }}>{t.label}</Text>
    </Pressable>
  ));

  return (
    <View style={{ flex: 1, flexDirection: rail ? 'row' : 'column', backgroundColor: C.bg, paddingTop: insets.top }}>
      {rail && (
        <View style={{ width: 72, backgroundColor: C.panel, borderRightWidth: 1, borderRightColor: C.border, paddingVertical: 8, paddingHorizontal: 6 }}>
          {nav}
          <View style={{ flex: 1 }} />
          <View style={{ alignItems: 'center', paddingBottom: 8 }} testID="level-chip">
            <Text style={{ color: C.warn, fontWeight: '900' }}>Lv {lv.level}</Text>
            <Text style={{ color: C.muted, fontSize: 10 }}>🔥 {streak}</Text>
          </View>
        </View>
      )}
      <View style={{ flex: 1 }}><Slot /></View>
      {!rail && <View style={{ flexDirection: 'row', backgroundColor: C.panel, borderTopWidth: 1, borderTopColor: C.border, paddingBottom: insets.bottom }}>{nav}</View>}
      <Sheet visible={!seen} onClose={() => {}} title="Before you start" width={520} testID="disclaimer">
        <Text style={{ color: C.text, fontSize: 15, lineHeight: 23, marginBottom: 10 }}>
          Money Skills is for <Text style={{ fontWeight: '800', color: C.strong }}>education and practice</Text>. It is not financial, tax or legal advice, and it never promises profits.
        </Text>
        <Text style={{ color: C.text, fontSize: 15, lineHeight: 23, marginBottom: 10 }}>
          Every company, price and chart is <Text style={{ fontWeight: '800', color: C.strong }}>simulated on your device</Text>. Nothing is real market data, and the app works fully offline. Your progress is saved only on this iPad.
        </Text>
        <Text style={{ color: C.text, fontSize: 15, lineHeight: 23, marginBottom: 14 }}>Real trading and investing can lose money, and most beginners lose money. Never risk money you cannot afford to lose.</Text>
        <Btn testID="accept" kind="primary" label="I understand, let's go" onPress={() => setState((s) => ({ settings: { ...s.settings, disclaimerSeen: true } }))} />
      </Sheet>
      {path !== '/' && <ToastBar />}
    </View>
  );
}

let soon: any = null;
function checkAchievementsSoon() {
  if (soon) return;
  soon = setTimeout(() => { soon = null; if (getState().ready) checkAchievements(); }, 400);
}

export default function Layout() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <Shell />
    </SafeAreaProvider>
  );
}
