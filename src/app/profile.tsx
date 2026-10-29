import React, { useState } from 'react';
import { ScrollView, Text, TextInput, View } from 'react-native';
import { getState, newTerm, setState, toast, useStore, wipeAll } from '../store';
import { ACHIEVEMENTS, levelOf } from '../progress';
import { Btn, Card, NumField, ProgressBar, Seg } from '../ui/kit';
import { C } from '../ui/theme';
import { exitSandbox } from '../sim';
import { leaveLesson } from '../lessons';

export default function Profile() {
  const xp = useStore((s) => s.xp);
  const streak = useStore((s) => s.streak);
  const ach = useStore((s) => s.achievements);
  const settings = useStore((s) => s.settings);
  const [confirm, setConfirm] = useState<string | null>(null);
  const lv = levelOf(xp);
  const set = (p: Partial<typeof settings>) => setState((s) => ({ settings: { ...s.settings, ...p } }));
  const resetAccount = () => {
    leaveLesson();
    exitSandbox();
    setState((s) => {
      const t = newTerm(s.term.season, s.term.cursor, settings.startBalance, settings.leverage, settings.commission);
      return { term: { ...t, symbol: s.term.symbol, tf: s.term.tf, indicators: s.term.indicators } };
    });
    toast('Practice account reset');
  };
  const newSeason = () => {
    leaveLesson();
    exitSandbox();
    setState((s) => ({ term: { ...newTerm(s.term.season + 1, undefined, settings.startBalance, settings.leverage, settings.commission) } }));
    toast('New simulated season started: all charts are new');
  };
  return (
    <ScrollView contentContainerStyle={{ padding: 18, alignItems: 'center' }} testID="profile">
      <View style={{ width: '100%', maxWidth: 900, gap: 14 }}>
        <Text style={{ color: C.strong, fontSize: 26, fontWeight: '900' }}>Profile</Text>
        <Card style={{ gap: 8 }}>
          <Text style={{ color: C.warn, fontSize: 22, fontWeight: '900' }}>Level {lv.level} · {lv.title}</Text>
          <ProgressBar pct={lv.pct} color={C.warn} />
          <Text style={{ color: C.muted }}>{xp} XP total · {lv.need - lv.into} to the next level · 🔥 {streak.count}-day streak (best {streak.best})</Text>
        </Card>
        <Text style={{ color: C.strong, fontSize: 18, fontWeight: '800' }}>Achievements ({Object.keys(ach).length}/{ACHIEVEMENTS.length})</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
          {ACHIEVEMENTS.map((a) => {
            const on = !!ach[a.id];
            return (
              <View key={a.id} style={{ width: 210, backgroundColor: C.panel, borderRadius: 10, borderWidth: 1, borderColor: on ? C.warn : C.border, padding: 10, opacity: on ? 1 : 0.55 }}>
                <Text style={{ fontSize: 24 }}>{on ? a.icon : '🔒'}</Text>
                <Text style={{ color: C.strong, fontWeight: '800' }}>{a.title}</Text>
                <Text style={{ color: C.muted, fontSize: 12 }}>{a.how}</Text>
              </View>
            );
          })}
        </View>
        <Text style={{ color: C.strong, fontSize: 18, fontWeight: '800', marginTop: 6 }}>Practice account</Text>
        <Card style={{ gap: 12 }}>
          <NumField label="Starting balance (applies on reset)" prefix="$" value={settings.startBalance} onChange={(v) => set({ startBalance: Math.max(1000, v ?? 100000) })} width={240} />
          <View style={{ gap: 4 }}>
            <Text style={{ color: C.muted, fontSize: 12 }}>Leverage (borrowing to buy more than your cash). 1× means none.</Text>
            <Seg value={settings.leverage} onChange={(leverage) => { set({ leverage }); setState((s) => { s.term.account.leverage = leverage; return {}; }); }} options={[1, 2, 4].map((v) => ({ v, label: v + '×' }))} />
          </View>
          <View style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap' }}>
            {confirm === 'reset' ? <Btn kind="down" label="Really reset account?" onPress={() => { resetAccount(); setConfirm(null); }} /> : <Btn label="Reset practice account" onPress={() => setConfirm('reset')} />}
            {confirm === 'season' ? <Btn kind="down" label="Start new season (resets account)?" onPress={() => { newSeason(); setConfirm(null); }} /> : <Btn label="New simulated season" onPress={() => setConfirm('season')} />}
          </View>
          <Text style={{ color: C.muted, fontSize: 12 }}>A season is one full simulated year. A new season generates completely different charts for every fictional company.</Text>
        </Card>
        <Text style={{ color: C.strong, fontSize: 18, fontWeight: '800' }}>About you</Text>
        <Card style={{ gap: 10 }}>
          <Text style={{ color: C.muted, fontSize: 12 }}>Your name (shown only on this iPad)</Text>
          <TextInput value={settings.name} onChangeText={(name) => set({ name })} placeholder="Name" placeholderTextColor={C.muted} style={{ color: C.strong, backgroundColor: C.bg, borderColor: C.border2, borderWidth: 1, borderRadius: 6, padding: 10, maxWidth: 300 }} />
          {confirm === 'wipe' ? <Btn kind="down" label="Erase everything on this device?" onPress={async () => { await wipeAll(); setConfirm(null); }} /> : <Btn kind="ghost" label="Erase all progress and data" onPress={() => setConfirm('wipe')} />}
        </Card>
        <Card style={{ gap: 6 }}>
          <Text style={{ color: C.strong, fontWeight: '800' }}>About this app</Text>
          <Text style={{ color: C.text, fontSize: 13, lineHeight: 20 }}>Money Skills is educational. It is not financial, tax or legal advice and never promises profit. Every company, price and chart is simulated by a random-number generator on your device; no network is used and nothing leaves this iPad. Real markets behave differently, and real trading can lose money.</Text>
        </Card>
        <Text style={{ color: C.muted, fontSize: 11 }}>Season {getState().term.season} · v1.0.0</Text>
      </View>
    </ScrollView>
  );
}
