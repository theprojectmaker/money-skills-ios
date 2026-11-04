// Predict: read the chart, make a call with a stop and a target, then watch the future play out.
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ScrollView, Text, View, useWindowDimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Chart, { ChartLine, ChartMark } from '../ui/Chart';
import { Button, Choice, Facts, H, Label, Num, P, Rule, Row, Stat, Stepper } from '../ui/kit';
import { C, money, pct, price, rText } from '../ui/theme';
import { atr } from '../engine/gen';
import { FUTURE, HIST, KINDS, KIND_ORDER, KindId, makeScenario, pickKind } from '../engine/scenarios';
import { breakevenWinRate, planFor, resolve, settle, Side } from '../engine/broker';
import { recordRound, useStore } from '../store';

type Call = Side | 'pass';
const ACCOUNT = 10000;
const RISK_PCT = 1;

const fresh = (only: KindId | null) => ({ n: Date.now(), kind: pickKind(Math.random, only), seed: Math.floor(Math.random() * 1e9) });

export default function Predict() {
  const params = useLocalSearchParams<{ kind?: string }>();
  const only = (KIND_ORDER as string[]).includes(params.kind ?? '') ? (params.kind as KindId) : null;
  const router = useRouter();
  const { width } = useWindowDimensions();
  const wide = width >= 900;
  const stats = useStore((s) => s.predict);

  const [round, setRound] = useState(() => fresh(only));
  const [call, setCall] = useState<Call>('long');
  const [stopAtr, setStopAtr] = useState(1.5);
  const [rr, setRr] = useState(2);
  const [avg, setAvg] = useState(false);
  const [phase, setPhase] = useState<'setup' | 'reveal' | 'done'>('setup');
  const [count, setCount] = useState(HIST);
  const [speed, setSpeed] = useState<'1' | '4' | 'skip'>('1');
  const recorded = useRef(0);

  // a new filter from the Learn tab starts a fresh round of that kind
  useEffect(() => {
    setRound(fresh(only));
    setPhase('setup');
    setCount(HIST);
  }, [only]);

  const sc = useMemo(() => makeScenario(round.kind, round.seed), [round]);
  const total = HIST + FUTURE;
  const A = useMemo(() => atr(sc.bars, HIST), [sc]);
  const entry = sc.bars[HIST - 1].c;
  const plan = call === 'pass' ? null : planFor(call, entry, A, stopAtr, rr);
  const live = plan && phase !== 'setup' ? resolve(sc.bars, HIST, count, plan) : null;

  // the reveal clock: one interval, cleared whenever the phase or speed changes
  useEffect(() => {
    if (phase !== 'reveal') return;
    if (speed === 'skip') { setCount(total); return; }
    const id = setInterval(() => setCount((c) => Math.min(total, c + 1)), speed === '1' ? 320 : 85);
    return () => clearInterval(id);
  }, [phase, speed, total]);

  useEffect(() => {
    if (phase === 'reveal' && count >= total) setPhase('done');
  }, [phase, count, total]);

  const final = useMemo(() => (plan ? settle(sc.bars, HIST, plan) : null), [sc, plan?.side, plan?.stop, plan?.target]);
  const longAlt = useMemo(() => settle(sc.bars, HIST, planFor('long', entry, A, stopAtr, rr)), [sc, stopAtr, rr]);
  const shortAlt = useMemo(() => settle(sc.bars, HIST, planFor('short', entry, A, stopAtr, rr)), [sc, stopAtr, rr]);
  const full = useMemo(() => (plan ? resolve(sc.bars, HIST, total, plan) : null), [sc, plan?.side, plan?.stop, plan?.target]);

  useEffect(() => {
    if (phase !== 'done' || recorded.current === round.n) return;
    recorded.current = round.n;
    recordRound(round.kind, final ? final.r : null);
  }, [phase, round, final]);

  const start = () => { setCount(HIST + 1); setPhase('reveal'); };
  const next = () => { setRound(fresh(only)); setPhase('setup'); setCount(HIST); setSpeed('1'); };
  const replay = () => { setPhase('setup'); setCount(HIST); setSpeed('1'); };

  const lines: ChartLine[] = [];
  const marks: ChartMark[] = [];
  if (plan) {
    lines.push({ price: plan.entry, color: C.text, label: 'ENTRY' });
    lines.push({ price: plan.stop, color: C.down, label: 'STOP' });
    if (plan.target !== null) lines.push({ price: plan.target, color: C.up, label: 'TARGET' });
    if (phase !== 'setup') marks.push({ i: HIST - 1, price: plan.entry, color: C.text });
    const ex = live?.exit;
    if (ex) marks.push({ i: ex.i, price: ex.price, color: ex.reason === 'target' ? C.up : C.down, text: ex.reason === 'target' ? 'Target' : 'Stopped' });
  }

  const risked = ACCOUNT * (RISK_PCT / 100);
  const tp = rr;
  const winRate = stats.wins + stats.losses ? stats.wins / (stats.wins + stats.losses) : 0;
  const k = KINDS[round.kind];

  const strip = (
    <View style={{ flexDirection: 'row', gap: 14, paddingHorizontal: 20, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: C.line }}>
      <Stat label="Rounds" value={String(stats.rounds)} />
      <Stat label="Win rate" value={stats.wins + stats.losses ? pct(winRate) : '--'} />
      <Stat label="Total" value={rText(stats.totalR)} tone={stats.totalR > 0 ? 'up' : stats.totalR < 0 ? 'down' : undefined} />
      <Stat label="Streak" value={String(stats.streak)} />
    </View>
  );

  const setupPanel = (
    <View style={{ gap: 18 }}>
      <View style={{ gap: 6 }}>
        <Label>Round {stats.rounds + 1}</Label>
        <H size={24}>Where does it go from here?</H>
        <P dim>The chart stops at the dashed line. Make a call, set your exit points, then reveal the next {FUTURE} bars.</P>
      </View>
      <Choice value={call} onChange={setCall} testID="call" options={[{ v: 'long', label: 'Buy' }, { v: 'short', label: 'Sell short' }, { v: 'pass', label: 'Stay out' }]} />
      {call !== 'pass' ? (
        <View style={{ gap: 12 }}>
          <Stepper label="Stop distance (ATR)" value={stopAtr} min={0.5} max={4} step={0.5} testID="stop" onChange={setStopAtr} />
          <Stepper label="Reward to risk" value={rr} min={1} max={4} step={0.5} unit=":1" testID="rr" onChange={setRr} />
          <Rule />
          {plan ? (
            <Facts rows={[
              ['Entry', price(plan.entry)],
              ['Stop', price(plan.stop), 'down'],
              ['Target', plan.target ? price(plan.target) : '--', 'up'],
              ['Risk if stopped', money(risked) + ' (1R)'],
              ['Win rate to break even', pct(breakevenWinRate(tp))],
            ]} />
          ) : null}
        </View>
      ) : (
        <P dim>Staying out is a real decision. After the reveal you will see what buying or selling would have done.</P>
      )}
      <Row style={{ justifyContent: 'space-between' }}>
        <Text style={{ color: C.mute, fontSize: 14 }}>20-bar average line</Text>
        <Choice value={avg ? 'on' : 'off'} onChange={(v) => setAvg(v === 'on')} options={[{ v: 'off', label: 'Off' }, { v: 'on', label: 'On' }]} testID="avg" />
      </Row>
      <View style={{ gap: 6, borderLeftWidth: 2, borderLeftColor: C.lineStrong, paddingLeft: 12 }}>
        <Label>Before you decide</Label>
        <P dim style={{ fontSize: 14, lineHeight: 21 }}>Which way has price been heading? Is it sitting at a level where it has turned before? Are the recent bars big or small compared with earlier ones? If the picture is unclear, staying out is allowed.</P>
      </View>
      <Button label={call === 'pass' ? 'Stay out and reveal' : 'Place trade and reveal'} kind="solid" onPress={start} testID="reveal" />
    </View>
  );

  const revealPanel = (
    <View style={{ gap: 16 }}>
      <Label>Playing out</Label>
      <Row style={{ gap: 14, alignItems: 'flex-end' }}>
        <View><Label>Bar</Label><Num size={22}>{count - HIST}/{FUTURE}</Num></View>
        {live ? <View><Label>{live.exit ? 'Closed' : 'Open'}</Label><Num size={22} style={{ color: live.r > 0 ? C.up : live.r < 0 ? C.down : C.text }}>{rText(live.r)}</Num></View> : <View><Label>Position</Label><Num size={22}>None</Num></View>}
      </Row>
      {live?.exit ? <P dim>{live.exit.reason === 'target' ? 'Your target was hit.' : 'Your stop was hit.'} The rest of the window plays out so you can see what followed.</P> : null}
      <Choice value={speed} onChange={setSpeed} testID="speed" options={[{ v: '1', label: 'Normal' }, { v: '4', label: 'Fast' }, { v: 'skip', label: 'Skip to end' }]} />
    </View>
  );

  const feedback: string[] = [];
  if (phase === 'done') {
    const bias = k.bias;
    if (call === 'pass') {
      const best = bias === 'long' ? longAlt : bias === 'short' ? shortAlt : null;
      if (bias === 'none') feedback.push('There was no readable edge here. Staying out is the correct call on a chart like this.');
      else if (best) feedback.push(`The textbook ${bias === 'long' ? 'buy' : 'short'} would have returned ${rText(best.r)} with your settings. ${best.r > 0 ? 'Passing is fine when the picture is unclear, but this one was worth a small, defined-risk try.' : 'You saved yourself a loss here.'}`);
    } else if (full) {
      if (bias === 'none') feedback.push('There was no real setup. Every trade here was a coin flip with costs, which is why patient traders skip charts like this.');
      else if (call === bias) feedback.push(sc.plays ? 'You traded with the pattern and it worked.' : 'You traded the pattern correctly and it failed. That happens roughly one time in three, and the stop kept the damage to one R.');
      else feedback.push('You traded against the textbook read. That can work, but you need a reason you could write down.');
      if (full.exit?.reason === 'stop' && full.mfe >= 1) feedback.push(`Price went ${full.mfe.toFixed(1)}R in your favour before it turned. A nearer target, or moving the stop to breakeven once ahead, would have banked something.`);
      if (full.r > 0 && full.mae <= -0.8) feedback.push('You came close to being stopped out before it worked. A stop that is too tight gets hit by normal noise.');
    }
  }

  const donePanel = (
    <View style={{ gap: 16 }}>
      <View>
        <Label>Result</Label>
        {final ? (
          <>
            <Num size={34} style={{ color: final.r > 0 ? C.up : final.r < 0 ? C.down : C.text, marginTop: 2 }}>{rText(final.r)}</Num>
            <P dim>{final.exit.reason === 'target' ? `Target hit after ${final.exit.i - HIST + 1} bars.` : final.exit.reason === 'stop' ? `Stopped out after ${final.exit.i - HIST + 1} bars.` : 'Neither level was hit. Closed at the end of the window.'} {money(final.r * risked)} on a {money(ACCOUNT)} account risking {RISK_PCT}%.</P>
          </>
        ) : (
          <>
            <H size={26} style={{ marginTop: 2 }}>You stayed out</H>
            <Facts rows={[['Buy would have made', rText(longAlt.r), longAlt.r > 0 ? 'up' : 'down'], ['Short would have made', rText(shortAlt.r), shortAlt.r > 0 ? 'up' : 'down']]} />
          </>
        )}
      </View>
      <Rule />
      <View style={{ gap: 6 }}>
        <Label>The chart was</Label>
        <H size={18}>{k.name}</H>
        <P dim style={{ fontSize: 14, lineHeight: 21 }}>{k.setup}</P>
      </View>
      <View style={{ gap: 6 }}>
        <Label>{sc.plays || round.kind === 'chop' ? 'What happened' : 'What happened (the less likely outcome)'}</Label>
        <P style={{ fontSize: 14, lineHeight: 21 }}>{sc.plays ? k.plays : k.fails}</P>
      </View>
      {feedback.map((f, i) => <P key={i} style={{ fontSize: 14, lineHeight: 21, color: C.amber }}>{f}</P>)}
      <Row style={{ flexWrap: 'wrap' }}>
        <Button label="Next round" kind="solid" onPress={next} testID="next" style={{ flexGrow: 1 }} />
        <Button label="Same chart again" onPress={replay} style={{ flexGrow: 1 }} />
      </Row>
      <Button label={`Lesson: ${LESSON_NAMES[k.lesson] ?? 'Review'}`} kind="quiet" onPress={() => router.navigate(`/lesson?id=${k.lesson}` as never)} />
    </View>
  );

  const panel = phase === 'setup' ? setupPanel : phase === 'reveal' ? revealPanel : donePanel;
  const chart = (
    <Chart bars={sc.bars} count={phase === 'setup' ? HIST : count} slots={total} divider={HIST} lines={lines} marks={marks} average={avg ? 20 : undefined} volume minHeight={wide ? 0 : 340} />
  );

  if (wide) {
    return (
      <View style={{ flex: 1, flexDirection: 'row' }}>
        <View style={{ flex: 1 }}>{strip}{chart}</View>
        <View style={{ width: 380, flexShrink: 0, backgroundColor: C.surface, borderLeftWidth: 1, borderLeftColor: C.line }}><ScrollView contentContainerStyle={{ padding: 22 }}>{panel}</ScrollView></View>
      </View>
    );
  }
  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 40 }}>
      {strip}
      <View style={{ height: 340 }}>{chart}</View>
      <View style={{ padding: 20, backgroundColor: C.surface }}>{panel}</View>
    </ScrollView>
  );
}

const LESSON_NAMES: Record<string, string> = {
  trend: 'Reading a trend', levels: 'Support and resistance', entries: 'Entries that work and fail', indicators: 'Averages, volume and gaps', psychology: 'Your mind is the risk',
};
