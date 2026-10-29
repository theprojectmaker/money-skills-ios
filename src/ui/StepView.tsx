import React, { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { bump, useStore } from '../store';
import { LESSON_BY_ID } from '../content';
import { buildS } from '../sim';
import { markStepDone, nextStep, prevStep } from '../lessons';
import { evaluate, defaults, CALC_BY_ID } from '../calc/calcs';
import { addXp, checkAchievements } from '../progress';
import { Blocks, Btn, ProgressBar } from './kit';
import Calc from './Calc';
import { C } from './theme';

/** The body of the active lesson step plus Back / Next. Used by the floating coach card and the full lesson page. */
export default function StepView({ big }: { big?: boolean }) {
  const run = useStore((s) => s.lesson);
  const term = useStore((s) => s.term);
  const counts = useStore((s) => s.counts);
  const saved = useStore((s) => s.calcSaved);
  const info = run ? LESSON_BY_ID[run.id] : null;
  const step = info && run ? info.lesson.steps[run.step] : null;
  const [picked, setPicked] = useState<number | null>(null);
  const [wrong, setWrong] = useState(0);
  const [vals, setVals] = useState<Record<string, number>>({});
  const [waited, setWaited] = useState(0);
  const sid = run ? `${run.id}#${run.step}` : '';

  useEffect(() => {
    setPicked(null); setWrong(0); setWaited(0);
    setVals(step && step.type === 'calc' ? { ...(step.preset ?? {}) } : {});
    const t = setInterval(() => setWaited((w) => w + 1), 1000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sid]);

  // hands-on check
  useEffect(() => {
    if (!run || !step || run.stepDone) return;
    try {
      if (step.type === 'do' && run.base && step.done(buildS(), run.base)) markStepDone();
      if (step.type === 'calc' && step.done(evaluate(step.calc, vals))) { markStepDone(); bump('calcTasks'); addXp(10); checkAchievements(); }
    } catch { /* a checker must never crash the lesson */ }
  }, [term, counts, vals, run?.stepDone, sid]);
  void saved;

  if (!run || !info || !step) return null;
  const total = info.lesson.steps.length;
  const size = big ? 17 : undefined;
  const last = run.step === total - 1;
  const canNext = run.stepDone;

  return (
    <View style={{ gap: 10, flexShrink: 1 }} testID="step-view">
      <ProgressBar pct={(run.step + 1) / total} color={info.course.color} />
      <Text style={{ color: C.strong, fontSize: big ? 22 : 16, fontWeight: '800' }}>{step.title}</Text>
      {step.type !== 'quiz' && <Blocks blocks={step.body} size={size} />}
      {step.type === 'quiz' && (
        <View style={{ gap: 8 }}>
          {step.body ? <Blocks blocks={step.body} size={size} /> : null}
          <Text style={{ color: C.strong, fontWeight: '700', fontSize: big ? 17 : 14 }}>{step.question}</Text>
          {step.options.map((o, i) => {
            const right = run.stepDone && i === step.answer;
            const bad = picked === i && i !== step.answer;
            return (
              <Pressable
                key={i}
                testID={`opt-${i}`}
                disabled={run.stepDone}
                onPress={() => {
                  setPicked(i);
                  if (i === step.answer) { markStepDone(); if (wrong === 0) { addXp(10); bump('quizFirstTry'); } }
                  else setWrong((w) => w + 1);
                }}
                style={{ padding: 11, borderRadius: 8, borderWidth: 1.5, borderColor: right ? C.up : bad ? C.down : C.border2, backgroundColor: right ? C.upSoft : bad ? C.downSoft : C.panel2 }}
              >
                <Text style={{ color: C.text, fontSize: big ? 16 : 14 }}>{o}</Text>
              </Pressable>
            );
          })}
          {picked !== null && picked !== step.answer && !run.stepDone && <Text style={{ color: C.warn }}>Not quite. Have another go.</Text>}
          {run.stepDone && <Text style={{ color: C.up }}>{step.explain}</Text>}
        </View>
      )}
      {step.type === 'calc' && (
        <View style={{ gap: 8 }}>
          <Calc id={step.calc} values={vals} onChange={setVals} />
        </View>
      )}
      {(step.type === 'do' || step.type === 'calc') && (
        <View testID="task-bar" style={{ backgroundColor: run.stepDone ? C.upSoft : C.accentSoft, borderRadius: 8, padding: 10, borderWidth: 1, borderColor: run.stepDone ? C.up : C.accent }}>
          <Text style={{ color: run.stepDone ? C.up : C.accent2, fontWeight: '800', fontSize: 11, letterSpacing: 0.5 }}>{run.stepDone ? 'DONE' : 'YOUR TURN'}</Text>
          <Text style={{ color: C.strong, fontSize: big ? 16 : 14, marginTop: 2 }}>{run.stepDone ? step.success ?? 'Nice work!' : step.task}</Text>
          {!run.stepDone && waited > 14 && step.hint ? <Text style={{ color: C.warn, marginTop: 6, fontSize: 13 }}>Hint: {step.hint}</Text> : null}
        </View>
      )}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <Btn small label="Back" kind="ghost" onPress={prevStep} disabled={run.step === 0} />
        <Text style={{ color: C.muted, fontSize: 12 }}>{run.step + 1} / {total}</Text>
        <View style={{ flex: 1 }} />
        {!canNext && (step.type === 'do' || step.type === 'calc') && waited > 40 && (
          <Pressable onPress={() => markStepDone()}><Text style={{ color: C.muted, textDecorationLine: 'underline', fontSize: 12 }}>I am stuck, skip</Text></Pressable>
        )}
        <Btn testID="next" kind="primary" small={!big} label={last ? 'Finish lesson ✓' : 'Next ▸'} disabled={!canNext} onPress={nextStep} />
      </View>
    </View>
  );
}
void ScrollView; void useRef; void CALC_BY_ID; void defaults;
