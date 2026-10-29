import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { COURSES } from '../content';
import type { Course, ExamQ } from '../content/types';
import { getState, setState, useStore } from '../store';
import { courseProgress, startLesson, leaveLesson } from '../lessons';
import { addXp, checkAchievements, levelOf } from '../progress';
import { Btn, Card, Chip, ProgressBar } from '../ui/kit';
import { C } from '../ui/theme';

export default function Learn() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const progress = useStore((s) => s.progress);
  const exams = useStore((s) => s.exams);
  const xp = useStore((s) => s.xp);
  const run = useStore((s) => s.lesson);
  const [open, setOpen] = useState<string | null>(null);
  const [exam, setExam] = useState<Course | null>(null);
  const lv = levelOf(xp);
  const cols = width >= 1000 ? 3 : width >= 640 ? 2 : 1;
  const course = COURSES.find((c) => c.id === open);

  const go = (courseId: string, lessonId: string) => {
    const c = COURSES.find((x) => x.id === courseId)!;
    startLesson(lessonId);
    router.push(c.kind === 'trading' ? '/' : '/lesson');
  };

  if (exam) return <Exam course={exam} onClose={() => setExam(null)} />;

  return (
    <ScrollView contentContainerStyle={{ padding: 18, alignItems: 'center' }} testID="learn">
      <View style={{ width: '100%', maxWidth: 1100, gap: 14 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          <View style={{ flex: 1 }}>
            <Text style={{ color: C.strong, fontSize: 26, fontWeight: '900' }}>Learn</Text>
            <Text style={{ color: C.muted }}>Short lessons, quizzes and hands-on practice. Works fully offline.</Text>
          </View>
          <Card style={{ padding: 10, minWidth: 170 }}>
            <Text style={{ color: C.warn, fontWeight: '900' }}>Level {lv.level} · {lv.title}</Text>
            <View style={{ marginVertical: 5 }}><ProgressBar pct={lv.pct} color={C.warn} /></View>
            <Text style={{ color: C.muted, fontSize: 11 }}>{lv.into} / {lv.need} XP to next level</Text>
          </Card>
        </View>
        {run && (
          <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 10, borderColor: C.accent }}>
            <Text style={{ color: C.strong, flex: 1 }}>You have a lesson in progress.</Text>
            <Btn small label="Resume" kind="primary" onPress={() => { const c = COURSES.find((x) => x.lessons.some((l) => l.id === run.id))!; router.push(c.kind === 'trading' ? '/' : '/lesson'); }} />
            <Btn small label="Stop" kind="ghost" onPress={leaveLesson} />
          </Card>
        )}
        {!course && (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 14 }}>
            {COURSES.map((c) => {
              const done = c.lessons.filter((l) => progress[l.id]?.done).length;
              const ex = exams[c.id];
              return (
                <Pressable key={c.id} testID={`course-${c.id}`} onPress={() => setOpen(c.id)} style={{ width: cols === 1 ? '100%' : `${100 / cols - 2}%`, flexGrow: 1 }}>
                  <Card style={{ borderColor: c.color + '99', gap: 8, minHeight: 190 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                      <Text style={{ fontSize: 34 }}>{c.icon}</Text>
                      <View style={{ flex: 1 }}>
                        <Text style={{ color: C.strong, fontSize: 17, fontWeight: '800' }}>{c.title}</Text>
                        <Text style={{ color: C.muted, fontSize: 12 }}>{c.level} · {c.lessons.length} lessons · ~{c.lessons.reduce((n, l) => n + l.minutes, 0)} min</Text>
                      </View>
                    </View>
                    <Text style={{ color: C.text, fontSize: 13 }}>{c.summary}</Text>
                    <View style={{ flex: 1 }} />
                    <ProgressBar pct={done / c.lessons.length} color={c.color} />
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text style={{ color: C.muted, fontSize: 12 }}>{done} / {c.lessons.length} done</Text>
                      {ex?.passed ? <Chip text="Exam passed" color={C.up} /> : <Chip text={c.kind === 'trading' ? 'Hands-on' : 'Calculators'} color={c.color} />}
                    </View>
                  </Card>
                </Pressable>
              );
            })}
          </View>
        )}
        {course && (
          <View style={{ gap: 12 }}>
            <Btn small label="◂ All courses" kind="ghost" onPress={() => setOpen(null)} style={{ alignSelf: 'flex-start' }} />
            <Card style={{ borderColor: course.color }}>
              <Text style={{ fontSize: 40 }}>{course.icon}</Text>
              <Text style={{ color: C.strong, fontSize: 24, fontWeight: '900' }}>{course.title}</Text>
              <Text style={{ color: C.text, marginVertical: 6 }}>{course.summary}</Text>
              {course.outcomes.map((o) => <Text key={o} style={{ color: C.muted, fontSize: 13 }}>✓ {o}</Text>)}
            </Card>
            {course.lessons.map((l, i) => {
              const p = progress[l.id];
              return (
                <Card key={l.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <View style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: p?.done ? C.up : C.panel2, alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ color: '#fff', fontWeight: '900' }}>{p?.done ? '✓' : i + 1}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: C.strong, fontWeight: '800', fontSize: 15 }}>{l.title}</Text>
                    <Text style={{ color: C.muted, fontSize: 12 }}>{l.summary} · {l.minutes} min · {l.steps.length} steps</Text>
                  </View>
                  <Btn testID={`start-${l.id}`} small kind={p?.done ? 'plain' : 'primary'} label={p?.done ? 'Redo' : p && p.step > 0 ? 'Continue' : 'Start'} onPress={() => { if (p?.done) startLesson(l.id, true), router.push(course.kind === 'trading' ? '/' : '/lesson'); else go(course.id, l.id); }} />
                </Card>
              );
            })}
            <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <Text style={{ fontSize: 28 }}>🏅</Text>
              <View style={{ flex: 1 }}>
                <Text style={{ color: C.strong, fontWeight: '800' }}>Final exam</Text>
                <Text style={{ color: C.muted, fontSize: 12 }}>{course.exam.questions.length} questions, pass at {course.exam.passPercent}%. {exams[course.id] ? `Best: ${exams[course.id].best}%` : ''}</Text>
              </View>
              <Btn testID="take-exam" small kind="primary" label={exams[course.id]?.passed ? 'Retake' : 'Take exam'} onPress={() => setExam(course)} />
            </Card>
          </View>
        )}
        <Text style={{ color: C.muted, fontSize: 11, textAlign: 'center', marginTop: 8 }}>Educational content, not financial, tax or legal advice. All market data in this app is simulated.</Text>
      </View>
    </ScrollView>
  );
}

function shuffle<T>(a: T[], seed: number): T[] {
  const r = [...a];
  let s = seed || 1;
  for (let i = r.length - 1; i > 0; i--) {
    s = (s * 1664525 + 1013904223) >>> 0;
    const j = s % (i + 1);
    [r[i], r[j]] = [r[j], r[i]];
  }
  return r;
}

function Exam({ course, onClose }: { course: Course; onClose: () => void }) {
  const tries = useStore((s) => s.exams[course.id]?.tries ?? 0);
  const qs = useMemo<ExamQ[]>(() => shuffle(course.exam.questions, tries + 7).map((q, i) => {
    const order = shuffle(q.options.map((_, k) => k), i + tries + 3);
    return { ...q, options: order.map((k) => q.options[k]), answer: order.indexOf(q.answer) };
  }), [course, tries]);
  const [i, setI] = useState(0);
  const [pick, setPick] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const q = qs[i];
  const pct = Math.round((score / qs.length) * 100);
  const finish = (finalScore: number) => {
    const p = Math.round((finalScore / qs.length) * 100);
    const passed = p >= course.exam.passPercent;
    const was = !!getState().exams[course.id]?.passed;
    setState((s) => ({ exams: { ...s.exams, [course.id]: { best: Math.max(s.exams[course.id]?.best ?? 0, p), passed: passed || !!s.exams[course.id]?.passed, tries: (s.exams[course.id]?.tries ?? 0) + 1 } } }));
    if (passed && !was) addXp(200, 'Exam passed');
    checkAchievements();
    setFinished(true);
  };
  return (
    <ScrollView contentContainerStyle={{ padding: 20, alignItems: 'center' }} testID="exam">
      <View style={{ width: '100%', maxWidth: 720, gap: 12 }}>
        <Btn small kind="ghost" label="◂ Leave exam" onPress={onClose} style={{ alignSelf: 'flex-start' }} />
        <Text style={{ color: C.strong, fontSize: 22, fontWeight: '900' }}>{course.icon} {course.title}: final exam</Text>
        {finished ? (
          <Card style={{ gap: 10 }}>
            <Text style={{ color: pct >= course.exam.passPercent ? C.up : C.warn, fontSize: 30, fontWeight: '900' }}>{pct}%</Text>
            <Text style={{ color: C.text }}>{pct >= course.exam.passPercent ? 'Passed! +200 XP the first time. Great work.' : `Not yet. You need ${course.exam.passPercent}%. Review the lessons and try again.`}</Text>
            <Btn kind="primary" label="Done" onPress={onClose} />
          </Card>
        ) : (
          <Card style={{ gap: 10 }}>
            <ProgressBar pct={i / qs.length} color={course.color} />
            <Text style={{ color: C.muted, fontSize: 12 }}>Question {i + 1} of {qs.length}</Text>
            <Text style={{ color: C.strong, fontSize: 17, fontWeight: '700' }}>{q.q}</Text>
            {q.options.map((o, k) => {
              const right = pick !== null && k === q.answer;
              const bad = pick === k && k !== q.answer;
              return (
                <Pressable key={k} testID={`eopt-${k}`} disabled={pick !== null} onPress={() => { setPick(k); if (k === q.answer) setScore((s) => s + 1); }}
                  style={{ padding: 12, borderRadius: 8, borderWidth: 1.5, borderColor: right ? C.up : bad ? C.down : C.border2, backgroundColor: right ? C.upSoft : bad ? C.downSoft : C.panel2 }}>
                  <Text style={{ color: C.text }}>{o}</Text>
                </Pressable>
              );
            })}
            {pick !== null && (
              <>
                <Text style={{ color: C.text }}>{q.explain}</Text>
                <Btn kind="primary" label={i + 1 === qs.length ? 'See result' : 'Next question'} onPress={() => { if (i + 1 === qs.length) finish(score); else { setI(i + 1); setPick(null); } }} />
              </>
            )}
          </Card>
        )}
      </View>
    </ScrollView>
  );
}
