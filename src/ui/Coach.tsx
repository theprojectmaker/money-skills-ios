import React, { useState } from 'react';
import { Pressable, ScrollView, Text, View, useWindowDimensions } from 'react-native';
import { useStore } from '../store';
import { LESSON_BY_ID } from '../content';
import { leaveLesson } from '../lessons';
import StepView from './StepView';
import { C } from './theme';

/** The floating lesson card that sits on top of the live practice chart. */
export default function Coach() {
  const run = useStore((s) => s.lesson);
  const { width, height } = useWindowDimensions();
  const [min, setMin] = useState(false);
  if (!run) return null;
  const info = LESSON_BY_ID[run.id];
  if (!info || info.course.kind !== 'trading') return null;
  const w = Math.min(width - 24, width > 1000 ? 400 : 360);
  return (
    <View
      testID="coach"
      style={{ position: 'absolute', left: 12, bottom: 12, width: w, maxHeight: Math.max(220, height * 0.62), backgroundColor: C.panel, borderRadius: 12, borderWidth: 1, borderColor: info.course.color, shadowColor: '#000', shadowOpacity: 0.5, shadowRadius: 16, overflow: 'hidden' }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', padding: 10, backgroundColor: info.course.color + '33', gap: 8 }}>
        <Text style={{ fontSize: 16 }}>{info.course.icon}</Text>
        <Text style={{ color: C.strong, fontWeight: '800', flex: 1 }} numberOfLines={1}>{info.lesson.title}</Text>
        <Pressable onPress={() => setMin(!min)} hitSlop={8}><Text style={{ color: C.text, fontSize: 18 }}>{min ? '▲' : '▼'}</Text></Pressable>
        <Pressable testID="leave-lesson" onPress={leaveLesson} hitSlop={8}><Text style={{ color: C.muted, fontSize: 16 }}>✕</Text></Pressable>
      </View>
      {!min && (
        <ScrollView contentContainerStyle={{ padding: 12 }} keyboardShouldPersistTaps="handled">
          <StepView />
        </ScrollView>
      )}
    </View>
  );
}
