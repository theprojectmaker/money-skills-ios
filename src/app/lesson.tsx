import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useStore } from '../store';
import { LESSON_BY_ID } from '../content';
import { leaveLesson } from '../lessons';
import StepView from '../ui/StepView';
import { Btn } from '../ui/kit';
import { C } from '../ui/theme';

/** Full-page player for the life-skills lessons (trading lessons run on top of the terminal instead). */
export default function LessonPage() {
  const run = useStore((s) => s.lesson);
  const router = useRouter();
  const info = run ? LESSON_BY_ID[run.id] : null;
  if (!run || !info) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 }}>
        <Text style={{ color: C.text }}>No lesson is open.</Text>
        <Btn label="Back to courses" kind="primary" onPress={() => router.replace('/learn')} />
      </View>
    );
  }
  return (
    <ScrollView contentContainerStyle={{ alignItems: 'center', padding: 20 }} testID="lesson-page">
      <View style={{ width: '100%', maxWidth: 760, gap: 14 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Text style={{ fontSize: 28 }}>{info.course.icon}</Text>
          <View style={{ flex: 1 }}>
            <Text style={{ color: info.course.color, fontWeight: '800', fontSize: 12 }}>{info.course.title.toUpperCase()}</Text>
            <Text style={{ color: C.strong, fontWeight: '900', fontSize: 20 }}>{info.lesson.title}</Text>
          </View>
          <Btn small label="Exit" kind="ghost" onPress={() => { leaveLesson(); router.replace('/learn'); }} />
        </View>
        <View style={{ backgroundColor: C.panel, borderRadius: 14, borderWidth: 1, borderColor: C.border, padding: 18 }}>
          <StepView big />
        </View>
        <Text style={{ color: C.muted, fontSize: 11 }}>Educational only, not financial, tax or legal advice. Numbers in examples are made up.</Text>
      </View>
    </ScrollView>
  );
}
