import React, { useEffect } from 'react';
import { Pressable, ScrollView, Text, View, useWindowDimensions } from 'react-native';
import { Slot, usePathname, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { load, set, useStore } from '../store';
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
      <P dim>Each round shows you a chart that stops part-way. You decide: buy, sell short, or stay out. Then the next weeks play out fast, and you see how your decision and your risk would have done.</P>
      <P dim>Everything here is simulated on your device. The companies, prices and charts are invented, and nothing needs a connection. This is education, not financial advice, and no setup works every time. Most real beginners lose money, so learn the risk rules first.</P>
      <Button label="Start" kind="solid" testID="accept" onPress={() => set({ seen: true })} style={{ marginTop: 8 }} />
    </ScrollView>
  );
}

function Shell() {
  const path = usePathname();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const ready = useStore((s) => s.ready);
  const seen = useStore((s) => s.seen);
  const rail = width >= 760;

  useEffect(() => { void load(); }, []);

  if (!ready) return <View style={{ flex: 1, backgroundColor: C.bg }} />;
  if (!seen) return <View style={{ flex: 1, backgroundColor: C.bg, paddingTop: insets.top }}><Welcome /></View>;

  const active = (t: string) => (t === '/' ? path === '/' || path === '/index' : path.startsWith(t) || (t === '/learn' && path.startsWith('/lesson')));
  const nav = TABS.map((t) => {
    const on = active(t.path);
    return (
      <Pressable
        key={t.path}
        testID={`nav-${t.label.toLowerCase()}`}
        accessibilityRole="button"
        onPress={() => router.navigate(t.path as never)}
        style={{
          flex: rail ? undefined : 1, paddingVertical: rail ? 14 : 12, paddingHorizontal: rail ? 14 : 0, alignItems: rail ? 'flex-start' : 'center',
          borderLeftWidth: rail ? 3 : 0, borderLeftColor: on ? C.text : 'transparent', borderTopWidth: rail ? 0 : 2, borderTopColor: on ? C.text : 'transparent',
        }}
      >
        <Text style={{ color: on ? C.text : C.faint, fontWeight: '700', fontSize: 14, letterSpacing: 0.3 }}>{t.label}</Text>
      </Pressable>
    );
  });

  return (
    <View style={{ flex: 1, flexDirection: rail ? 'row' : 'column', backgroundColor: C.bg, paddingTop: insets.top }}>
      {rail && (
        <View style={{ width: 112, backgroundColor: C.surface, borderRightWidth: 1, borderRightColor: C.line, paddingTop: 22 }}>
          <Text style={{ color: C.text, fontWeight: '800', fontSize: 15, letterSpacing: -0.2, paddingHorizontal: 16, marginBottom: 18, lineHeight: 18 }}>Money{'\n'}Skills</Text>
          {nav}
        </View>
      )}
      <View style={{ flex: 1 }}><Boundary><Slot /></Boundary></View>
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
