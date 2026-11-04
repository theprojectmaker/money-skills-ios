import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { LESSONS } from '../content/lessons';
import { useStore } from '../store';
import { H, Label, Num, P, Rule } from '../ui/kit';
import { C, pct } from '../ui/theme';

export default function Learn() {
  const router = useRouter();
  const done = useStore((s) => s.learn);
  const n = LESSONS.filter((l) => done[l.id] !== undefined).length;
  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 28, paddingBottom: 60, maxWidth: 760, width: '100%', alignSelf: 'center' }}>
      <Label>Course</Label>
      <H size={30} style={{ marginTop: 6 }}>How to trade, in ten short lessons</H>
      <P dim style={{ marginTop: 8 }}>Each lesson is a few pages with real charts and a three-question check. Read one, then practise it in Predict. {n} of {LESSONS.length} complete.</P>
      <View style={{ height: 2, backgroundColor: C.line, marginTop: 20 }}>
        <View style={{ height: 2, width: `${(n / LESSONS.length) * 100}%`, backgroundColor: C.text }} />
      </View>
      <View style={{ marginTop: 8 }}>
        {LESSONS.map((l) => {
          const score = done[l.id];
          return (
            <View key={l.id}>
              <Pressable testID={`lesson-${l.id}`} accessibilityRole="button" onPress={() => router.navigate(`/lesson?id=${l.id}` as never)}
                style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: 16, paddingVertical: 18, opacity: pressed ? 0.6 : 1 })}>
                <Num size={22} style={{ width: 36, color: score !== undefined ? C.up : C.faint }}>{String(l.n).padStart(2, '0')}</Num>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: C.text, fontSize: 18, fontWeight: '700', letterSpacing: -0.2 }}>{l.title}</Text>
                  <Text style={{ color: C.mute, fontSize: 14, marginTop: 2 }}>{l.blurb}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Num size={12} style={{ color: C.faint }}>{l.minutes} min</Num>
                  {score !== undefined ? <Num size={12} style={{ color: C.up }}>quiz {pct(score)}</Num> : null}
                </View>
              </Pressable>
              <Rule />
            </View>
          );
        })}
      </View>
      <P dim style={{ marginTop: 24, fontSize: 13, lineHeight: 20 }}>Educational only, not financial advice. Nothing here promises profit.</P>
    </ScrollView>
  );
}
