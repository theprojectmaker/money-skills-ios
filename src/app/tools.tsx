// Calculators for the money maths behind trading and everyday saving. Inputs stay as the text you typed.
import React, { useState } from 'react';
import { ScrollView, Text, TextInput, View } from 'react-native';
import { Button, Choice, Facts, H, Label, P } from '../ui/kit';
import { checkRoutes, CheckResult } from '../terminal/relay';
import { C, mono, money, pct } from '../ui/theme';

function Field({ label, value, onChange, suffix, prefix }: { label: string; value: string; onChange: (v: string) => void; suffix?: string; prefix?: string }) {
  return (
    <View style={{ flex: 1, minWidth: 130 }}>
      <Label style={{ marginBottom: 6 }}>{label}</Label>
      <View style={{ flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: C.lineStrong, borderRadius: 3, paddingHorizontal: 10, minHeight: 46 }}>
        {prefix ? <Text style={{ color: C.faint, marginRight: 4 }}>{prefix}</Text> : null}
        <TextInput value={value} onChangeText={(t) => onChange(t.replace(/[^0-9.]/g, ''))} keyboardType="decimal-pad" selectionColor={C.amber}
          style={{ flex: 1, color: C.text, fontFamily: mono, fontSize: 16, paddingVertical: 8 }} />
        {suffix ? <Text style={{ color: C.faint, marginLeft: 4 }}>{suffix}</Text> : null}
      </View>
    </View>
  );
}
const n = (s: string) => { const v = parseFloat(s); return Number.isFinite(v) ? v : 0; };
const Fields = ({ children }: { children: React.ReactNode }) => <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 14 }}>{children}</View>;

function Sizing() {
  const [acct, setAcct] = useState('10000'), [risk, setRisk] = useState('1'), [entry, setEntry] = useState('50'), [stop, setStop] = useState('48');
  const cash = n(acct) * n(risk) / 100, per = Math.abs(n(entry) - n(stop));
  const sh = per > 0 ? Math.floor(cash / per) : 0;
  return (
    <View style={{ gap: 18 }}>
      <P dim>How many shares you may buy so that your stop costs exactly the amount you chose to risk.</P>
      <Fields><Field label="Account" prefix="$" value={acct} onChange={setAcct} /><Field label="Risk" suffix="%" value={risk} onChange={setRisk} /><Field label="Entry" prefix="$" value={entry} onChange={setEntry} /><Field label="Stop" prefix="$" value={stop} onChange={setStop} /></Fields>
      <Facts rows={[['Money at risk', money(cash, 2)], ['Risk per share', money(per, 2)], ['Shares', String(sh), 'amber'], ['Position value', money(sh * n(entry))], ['Share of account', n(acct) ? pct(sh * n(entry) / n(acct), 0) : '--']]} />
      {sh * n(entry) > n(acct) && n(acct) > 0 ? <P style={{ color: C.amber, fontSize: 14 }}>That position is larger than the whole account, so it needs borrowed money. A tighter risk or a closer stop makes it smaller.</P> : null}
    </View>
  );
}

function Edge() {
  const [win, setWin] = useState('40'), [aw, setAw] = useState('2'), [al, setAl] = useState('1');
  const w = n(win) / 100, e = w * n(aw) - (1 - w) * n(al);
  const be = n(aw) + n(al) > 0 ? n(al) / (n(aw) + n(al)) : 0;
  return (
    <View style={{ gap: 18 }}>
      <P dim>Expectancy is the average result per trade, in R. Positive means the system makes money over many trades.</P>
      <Fields><Field label="Win rate" suffix="%" value={win} onChange={setWin} /><Field label="Average win" suffix="R" value={aw} onChange={setAw} /><Field label="Average loss" suffix="R" value={al} onChange={setAl} /></Fields>
      <Facts rows={[['Expectancy per trade', (e >= 0 ? '+' : '') + e.toFixed(2) + 'R', e >= 0 ? 'up' : 'down'], ['Break-even win rate', pct(be, 0)], ['After 100 trades', (e * 100 >= 0 ? '+' : '') + (e * 100).toFixed(0) + 'R', e >= 0 ? 'up' : 'down']]} />
    </View>
  );
}

function Compound() {
  const [start, setStart] = useState('1000'), [add, setAdd] = useState('100'), [rate, setRate] = useState('7'), [yrs, setYrs] = useState('20');
  const r = n(rate) / 100 / 12, months = Math.round(n(yrs) * 12);
  let bal = n(start);
  for (let i = 0; i < Math.min(months, 1200); i++) bal = bal * (1 + r) + n(add);
  const put = n(start) + n(add) * Math.min(months, 1200);
  return (
    <View style={{ gap: 18 }}>
      <P dim>Growth at a steady yearly rate with a monthly deposit. Real returns are never steady, and these figures are not forecasts.</P>
      <Fields><Field label="Start" prefix="$" value={start} onChange={setStart} /><Field label="Monthly add" prefix="$" value={add} onChange={setAdd} /><Field label="Yearly rate" suffix="%" value={rate} onChange={setRate} /><Field label="Years" value={yrs} onChange={setYrs} /></Fields>
      <Facts rows={[['You put in', money(put)], ['Growth', money(bal - put), 'up'], ['End balance', money(bal), 'amber']]} />
    </View>
  );
}

function Payoff() {
  const [bal, setBal] = useState('3000'), [apr, setApr] = useState('24'), [pay, setPay] = useState('150');
  const r = n(apr) / 100 / 12;
  let b = n(bal), months = 0, interest = 0;
  while (b > 0.005 && months < 600) { const i = b * r; if (n(pay) <= i) { months = -1; break; } interest += i; b = b + i - n(pay); months++; }
  const bad = months === -1;
  return (
    <View style={{ gap: 18 }}>
      <P dim>How long a debt takes to clear at a fixed monthly payment, and what the interest costs you.</P>
      <Fields><Field label="Balance" prefix="$" value={bal} onChange={setBal} /><Field label="Interest (APR)" suffix="%" value={apr} onChange={setApr} /><Field label="Monthly payment" prefix="$" value={pay} onChange={setPay} /></Fields>
      {bad ? <P style={{ color: C.down }}>That payment does not even cover the monthly interest, so the balance never shrinks.</P>
        : <Facts rows={[['Months to clear', String(months), 'amber'], ['Total interest', money(interest), 'down'], ['Total paid', money(n(bal) + interest)]]} />}
    </View>
  );
}

function Connection() {
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState<CheckResult[] | null>(null);
  const run = () => { setRunning(true); checkRoutes().then(setResults, () => setResults([])).finally(() => setRunning(false)); };
  return (
    <View style={{ gap: 18 }}>
      <P dim>Shows which stock data sources this Wi-Fi allows. Real stocks in Trade need at least one of them to work. SIM stocks and Predict never need a connection.</P>
      <Button label={running ? 'Checking...' : results ? 'Check again' : 'Check this network'} kind="solid" disabled={running} testID="check-network" onPress={run} />
      {results ? (
        <View>
          {results.map((r, i) => (
            <View key={i} style={{ paddingVertical: 10, borderTopWidth: i ? 1 : 0, borderTopColor: C.line }}>
              <Text style={{ color: C.text, fontSize: 15, fontWeight: '600' }}>{r.label}</Text>
              <Text style={{ color: r.ok ? C.up : C.down, fontSize: 14, marginTop: 2 }}>{r.detail}</Text>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const CALCS = { size: Sizing, edge: Edge, grow: Compound, debt: Payoff, net: Connection };

export default function Tools() {
  const [which, setWhich] = useState<keyof typeof CALCS>('size');
  const Calc = CALCS[which];
  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 28, paddingBottom: 80, maxWidth: 760, width: '100%', alignSelf: 'center', gap: 20 }} keyboardShouldPersistTaps="handled">
      <View style={{ gap: 6 }}><Label>Tools</Label><H size={30}>Calculators</H></View>
      <Choice value={which} onChange={setWhich} testID="calc" options={[{ v: 'size', label: 'Position size' }, { v: 'edge', label: 'Edge' }, { v: 'grow', label: 'Growth' }, { v: 'debt', label: 'Debt' }, { v: 'net', label: 'Connection' }]} />
      <Calc />
      <P dim style={{ fontSize: 13, lineHeight: 20 }}>For learning only. Not financial advice.</P>
      <P dim style={{ fontSize: 13, lineHeight: 20 }}>Charts use TradingView Lightweight Charts (tradingview.com), open source under the Apache 2.0 license. Money Skills is not made by or connected with TradingView.</P>
    </ScrollView>
  );
}
