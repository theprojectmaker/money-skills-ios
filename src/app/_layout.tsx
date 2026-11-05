import React, { useEffect } from 'react';
import { Pressable, ScrollView, Text, View, useWindowDimensions } from 'react-native';
import { Slot, useGlobalSearchParams, usePathname, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { load, set, useStore } from '../store';
import Terminal from '../terminal/Terminal';
import { C } from '../ui/theme';
import { Button, H, Label, P } from '../ui/kit';

const TABS = [
  { path: '/', label: 'Predict' },
  { path: '/trade', label: 'Trade' },
  { path: '/learn', label: 'Learn' },
  { path: '/tools', label: 'Tools' },
];

class Boundary extends React.Component<{ children: React.ReactNode }, { err: string | null }> {
  state = { err: null as string | null };
  static getDerivedStateFromError(e: unknown) { return { err: String((e as Error)?.message ?? e) }; }
  render() {
    if (!this.state.err) return this.props.children;
    return (
      <View style={{ flex: 1, backgroundColor: C.bg, padding: 32, justifyContent: 'center', gap: 14 }}>
        <H>Something broke on this screen</H>
        <P dim>{this.state.err}</P>
        <Button label="Try again" kind="solid" onPress={() => this.setState({ err: null })} />
      </View>
    );
  }
}

function Welcome() {
  return (
    <ScrollView style={{ flex: 1, backgroundColor: C.bg }} contentContainerStyle={{ padding: 32, paddingTop: 80, maxWidth: 640, alignSelf: 'center', gap: 18 }}>
      <Label>Money Skills</Label>
      <H size={34}>Learn to trade by predicting, then watching what happens.</H>
      <P dim>Predict shows you a chart that stops part-way. Read it with real charting tools, take a position or stay out, then speed through what happened next. Trade is a full practice terminal with real stocks and a made-up market, always with pretend money.</P>
      <P dim>Predict charts are invented and work with no connection. In Trade, real stocks like Apple need internet, their prices can be delayed or wrong, and the SIM stocks always work offline. This is education, not financial advice, and no setup works every time. Most real beginners lose money, so learn the risk rules first.</P>
      <Button label="Start" kind="solid" testID="accept" onPress={() => set({ seen: true })} style={{ marginTop: 8 }} />
    </ScrollView>
  );
}

function Shell() {
  const path = usePathname();
  const router = useRouter();
  const params = useGlobalSearchParams<{ kind?: string }>();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const ready = useStore((s) => s.ready);
  const seen = useStore((s) => s.seen);
  const rail = width >= 600;

  useEffect(() => { void load(); }, []);

  if (!ready) return <View style={{ flex: 1, backgroundColor: C.bg }} />;
  if (!seen) return <View style={{ flex: 1, backgroundColor: C.bg, paddingTop: insets.top }}><Welcome /></View>;

  const onPredict = path === '/' || path === '/index';
  const onTrade = path.startsWith('/trade');
  const active = (t: string) => (t === '/' ? onPredict : path.startsWith(t) || (t === '/learn' && path.startsWith('/lesson')));
  const nav = TABS.map((t) => {
    const on = active(t.path);
    return (
      <Pressable
        key={t.path}
        testID={`nav-${t.label.toLowerCase()}`}
        accessibilityRole="button"
        onPress={() => router.navigate(t.path as never)}
        style={{
          flex: rail ? undefined : 1, minHeight: 56, justifyContent: 'center', alignItems: 'center',
          borderLeftWidth: rail ? 2 : 0, borderLeftColor: on ? C.blue : 'transparent', borderTopWidth: rail ? 0 : 2, borderTopColor: on ? C.blue : 'transparent',
          backgroundColor: on ? C.raised : 'transparent',
        }}
      >
        <Text style={{ color: on ? '#fff' : C.mute, fontWeight: '600', fontSize: 12 }}>{t.label}</Text>
      </Pressable>
    );
  });

  return (
    <View style={{ flex: 1, flexDirection: rail ? 'row' : 'column', backgroundColor: C.bg, paddingTop: insets.top }}>
      {rail && <View style={{ width: 68, backgroundColor: C.bg, borderRightWidth: 1, borderRightColor: C.line, paddingTop: 6 }}>{nav}</View>}
      <View style={{ flex: 1, paddingBottom: rail ? insets.bottom : 0 }}>
        <View style={{ flex: 1 }}>
          <Boundary><Slot /></Boundary>
          <Terminal visible={onPredict || onTrade} mode={onTrade ? 'trade' : 'predict'} kind={params.kind ?? null} />
        </View>
      </View>
      {!rail && <View style={{ flexDirection: 'row', backgroundColor: C.surface, borderTopWidth: 1, borderTopColor: C.line, paddingBottom: insets.bottom }}>{nav}</View>}
    </View>
  );
}

export default function Layout() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <Shell />
    </SafeAreaProvider>
  );
}
