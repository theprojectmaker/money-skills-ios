import React, { useMemo, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Chart, { ChartLine } from '../ui/Chart';
import { Button, H, Label, P, Rule, Row } from '../ui/kit';
import { C, pct } from '../ui/theme';
import { ChartSpec, LESSONS, Page, byId } from '../content/lessons';
import { HIST, FUTURE, levels, makeScenario } from '../engine/scenarios';
import { set, getState } from '../store';

function Example({ spec }: { spec: ChartSpec }) {
  const sc = useMemo(() => makeScenario(spec.kind, spec.seed), [spec.kind, spec.seed]);
  const count = spec.full ? HIST + FUTURE : HIST;
  const lines: ChartLine[] = useMemo(() => {
    if (!spec.levels) return [];
    const lv = levels(sc.bars, HIST);
    return [{ price: lv.resistance, color: C.down, label: 'RESIST' }, { price: lv.support, color: C.up, label: 'SUPPORT' }];
  }, [sc, spec.levels]);
  return (
    <View style={{ marginVertical: 16 }}>
      <View style={{ height: 300, borderWidth: 1, borderColor: C.line }}>
        <Chart bars={sc.bars} count={count} slots={HIST + FUTURE} divider={spec.full ? HIST : undefined} lines={lines} average={spec.average ? 20 : undefined} volume />
      </View>
      <Text style={{ color: C.mute, fontSize: 13, marginTop: 8, lineHeight: 19 }}>{spec.caption}</Text>
    </View>
  );
}

function PageView({ page }: { page: Page }) {
  return (
    <View style={{ gap: 14 }}>
      <H size={26}>{page.h}</H>
      {page.p.map((t, i) => <P key={i}>{t}</P>)}
      {page.chart ? <Example spec={page.chart} /> : null}
      {page.bullets ? (
        <View style={{ gap: 10 }}>
          {page.bullets.map((b, i) => (
            <Row key={i} style={{ alignItems: 'flex-start', gap: 12 }}>
              <View style={{ width: 6, height: 6, backgroundColor: C.amber, marginTop: 9 }} />
              <P style={{ flex: 1 }}>{b}</P>
            </Row>
          ))}
        </View>
      ) : null}
      {page.rule ? (
        <View style={{ borderLeftWidth: 3, borderLeftColor: C.amber, paddingLeft: 14, paddingVertical: 4 }}>
          <Text style={{ color: C.text, fontSize: 16, lineHeight: 24, fontWeight: '600' }}>{page.rule}</Text>
        </View>
      ) : null}
    </View>
  );
}

export default function LessonScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const router = useRouter();
  const lesson = byId(id ?? '') ?? LESSONS[0];
  const [step, setStep] = useState(0); // 0..pages-1 pages, then quiz questions, then result
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);

  const np = lesson.pages.length;
  const nq = lesson.quiz.length;
  const inPages = step < np;
  const qi = step - np;
  const finished = step >= np + nq;
  const total = np + nq;
  const idx = LESSONS.findIndex((l) => l.id === lesson.id);
  const nextLesson = LESSONS[idx + 1];

  const finish = (s: number) => {
    const best = Math.max(getState().learn[lesson.id] ?? 0, s / nq);
    set({ learn: { ...getState().learn, [lesson.id]: best } });
  };

  let body: React.ReactNode;
  let action: React.ReactNode;
  if (inPages) {
    body = <PageView page={lesson.pages[step]} />;
    action = <Button label={step === np - 1 ? 'Start the check' : 'Continue'} kind="solid" testID="continue" onPress={() => setStep(step + 1)} />;
  } else if (!finished) {
    const q = lesson.quiz[qi];
    body = (
      <View style={{ gap: 14 }}>
        <Label>Question {qi + 1} of {nq}</Label>
        <H size={24}>{q.q}</H>
        <View style={{ gap: 10, marginTop: 6 }}>
          {q.options.map((o, i) => {
            const chosen = picked === i;
            const right = picked !== null && i === q.answer;
            const wrong = chosen && i !== q.answer;
            return (
              <Button key={i} label={o} testID={`opt-${i}`} kind="line" disabled={picked !== null && !chosen && !right}
                onPress={() => { if (picked === null) { setPicked(i); if (i === q.answer) setScore((s) => s + 1); } }}
                style={{ alignItems: 'flex-start', paddingVertical: 12, borderColor: right ? C.up : wrong ? C.down : C.lineStrong }} />
            );
          })}
        </View>
        {picked !== null ? <P dim style={{ borderLeftWidth: 3, borderLeftColor: picked === q.answer ? C.up : C.down, paddingLeft: 12 }}>{picked === q.answer ? 'Correct. ' : 'Not quite. '}{q.why}</P> : null}
      </View>
    );
    action = picked !== null ? (
      <Button label={qi === nq - 1 ? 'See result' : 'Next question'} kind="solid" testID="continue" onPress={() => {
        if (qi === nq - 1) finish(score);
        setPicked(null);
        setStep(step + 1);
      }} />
    ) : null;
  } else {
    body = (
      <View style={{ gap: 14 }}>
        <Label>Check complete</Label>
        <H size={34}>{score} of {nq} correct</H>
        <P dim>{score === nq ? 'Clean sweep.' : 'Re-read the pages you missed, then try the check again. Learning the explanations matters more than the score.'} Your best is saved at {pct(Math.max(getState().learn[lesson.id] ?? 0, score / nq))}.</P>
        {lesson.practice ? <Button label="Practise this in Predict" kind="solid" testID="practise" onPress={() => router.navigate(`/?kind=${lesson.practice}` as never)} /> : null}
        <Row style={{ flexWrap: 'wrap' }}>
          <Button label="Retake the check" onPress={() => { setScore(0); setPicked(null); setStep(np); }} style={{ flexGrow: 1 }} />
          {nextLesson ? <Button label={`Next: ${nextLesson.title}`} onPress={() => { setStep(0); setScore(0); setPicked(null); router.navigate(`/lesson?id=${nextLesson.id}` as never); }} style={{ flexGrow: 1 }} /> : null}
        </Row>
        <Button label="All lessons" kind="quiet" onPress={() => router.navigate('/learn' as never)} />
      </View>
    );
    action = null;
  }

  return (
    <View style={{ flex: 1 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: C.line }}>
        <Button label="Lessons" kind="quiet" small onPress={() => router.navigate('/learn' as never)} />
        <Text style={{ color: C.mute, fontSize: 13 }}>{String(lesson.n).padStart(2, '0')}  {lesson.title}</Text>
        <View style={{ width: 70 }} />
      </View>
      <View style={{ flexDirection: 'row', height: 3, backgroundColor: C.line }}>
        <View style={{ width: `${Math.min(100, (step / total) * 100)}%`, backgroundColor: C.text }} />
      </View>
      <ScrollView contentContainerStyle={{ padding: 28, paddingBottom: 60, maxWidth: 760, width: '100%', alignSelf: 'center' }}>
        {body}
        {action ? <View style={{ marginTop: 28 }}>{action}</View> : null}
        {step > 0 && inPages ? <Button label="Back" kind="quiet" onPress={() => setStep(step - 1)} style={{ marginTop: 6 }} /> : null}
        <Rule style={{ marginTop: 36 }} />
      </ScrollView>
    </View>
  );
}
