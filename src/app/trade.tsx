// Trade: a fast practice market. Pick a stock, press play, and trade it with risk-based position sizing.
import React, { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, Text, View, useWindowDimensions } from 'react-native';
import Chart, { ChartLine } from '../ui/Chart';
import { Button, Choice, Facts, H, Label, Num, P, Rule, Row, Stat, Stepper } from '../ui/kit';
import { C, money, pct, price, rText } from '../ui/theme';
import { MAX_BARS, Market, Session, TICKERS, Ticker, summarize } from '../engine/live';
import { set, getState } from '../store';

const WINDOW = 90;
const newSession = (t: Ticker) => new Session(new Market(t, Math.floor(Math.random() * 1e9)));

export default function Trade() {
  const { width } = useWindowDimensions();
  const wide = width >= 900;
  const [ticker, setTicker] = useState<Ticker>(TICKERS[0]);
  const ses = useRef<Session>(newSession(TICKERS[0]));
  const [, bump] = useState(0);
  const refresh = () => bump((n) => n + 1);
  const [running, setRunning] = useState(false);
  const [speed, setSpeed] = useState<'2' | '6' | '15'>('6');
  const [riskPct, setRiskPct] = useState<'0.5' | '1' | '2'>('1');
  const [stopAtr, setStopAtr] = useState(1.5);
  const [rr, setRr] = useState<'1' | '2' | '3' | 'none'>('2');
  const [msg, setMsg] = useState<string | null>(null);
  const [ended, setEnded] = useState(false);
  const saved = useRef(0);

  const s = ses.current;

  // one timer while running; fractional bars carry over so slow speeds stay smooth
  useEffect(() => {
    if (!running) return;
    let carry = 0;
    const id = setInterval(() => {
      carry += Number(speed) / 10;
      const n = Math.min(3, Math.floor(carry));
      if (n < 1) return;
      carry -= n;
      try {
        for (let i = 0; i < n; i++) { if (ses.current.over) break; ses.current.step(); }
      } finally {
        if (ses.current.over) { setRunning(false); setEnded(true); }
        refresh();
      }
    }, 100);
    return () => clearInterval(id);
  }, [running, speed]);

  // closed trades go to the permanent record once, whenever the count grows
  useEffect(() => {
    const t = s.trades;
    if (t.length > saved.current) {
      const fresh = t.slice(saved.current);
      saved.current = t.length;
      set({ trades: [...getState().trades, ...fresh].slice(-150) });
    }
  });

  const pick = (t: Ticker) => {
    setRunning(false);
    setTicker(t);
    ses.current = newSession(t);
    saved.current = 0;
    setEnded(false);
    setMsg(null);
    refresh();
  };
  const restart = () => pick(ticker);

  const last = s.market.last;
  const prev = s.market.bars[s.market.bars.length - 2];
  const chg = last.c - prev.c;
  const rrN = rr === 'none' ? null : Number(rr);
  const size = s.sizeFor(Number(riskPct), stopAtr);
  const p = s.pos;
  const dir = p ? (p.side === 'long' ? 1 : -1) : 0;
  const openPnl = p ? (last.c - p.plan.entry) * dir * p.qty : 0;
  const openR = p ? ((last.c - p.plan.entry) * dir) / (Math.abs(p.plan.entry - p.initialStop) || 1) : 0;
  const sum = summarize(s.trades);
  const eq = s.equity();

  const place = (side: 'long' | 'short') => {
    const e = s.open(side, Number(riskPct), stopAtr, rrN);
    setMsg(e);
    refresh();
  };

  const lines: ChartLine[] = [];
  if (p) {
    lines.push({ price: p.plan.entry, color: C.text, label: p.side === 'long' ? 'LONG' : 'SHORT' });
    lines.push({ price: p.plan.stop, color: C.down, label: 'STOP' });
    if (p.plan.target !== null) lines.push({ price: p.plan.target, color: C.up, label: 'TARGET' });
  }
  const bars = s.market.bars;
  const first = Math.max(0, bars.length - WINDOW);

  const top = (
    <View style={{ borderBottomWidth: 1, borderBottomColor: C.line }}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 8, paddingVertical: 10 }}>
        {TICKERS.map((t) => {
          const on = t.sym === ticker.sym;
          return (
            <Pressable key={t.sym} testID={`tk-${t.sym}`} accessibilityRole="button" onPress={() => pick(t)}
              style={{ paddingHorizontal: 14, paddingVertical: 9, borderWidth: 1, borderColor: on ? C.text : C.lineStrong, backgroundColor: on ? C.text : 'transparent', borderRadius: 3 }}>
              <Text style={{ color: on ? C.ink : C.text, fontWeight: '800', fontSize: 14 }}>{t.sym}</Text>
              <Text style={{ color: on ? C.ink : C.faint, fontSize: 11 }}>{t.blurb}</Text>
            </Pressable>
          );
        })}
      </ScrollView>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, paddingHorizontal: 20, paddingBottom: 12, flexWrap: 'wrap' }}>
        <View><Label>{ticker.name}</Label><Num size={24}>{price(last.c)}</Num></View>
        <View><Label>Change</Label><Num size={16} style={{ color: chg >= 0 ? C.up : C.down }}>{chg >= 0 ? '+' : ''}{chg.toFixed(2)}</Num></View>
        <View><Label>Day</Label><Num size={16}>{bars.length - 120}</Num></View>
        <View style={{ flex: 1 }} />
        <Button label={running ? 'Pause' : 'Play'} kind={running ? 'line' : 'solid'} small onPress={() => { if (!ended) setRunning((r) => !r); }} testID="play" />
        <Button label="Step" small onPress={() => { if (!ended) { s.step(); refresh(); } }} testID="step" />
        <View style={{ width: 170 }}><Choice value={speed} onChange={setSpeed} testID="spd" options={[{ v: '2', label: 'Slow' }, { v: '6', label: 'Med' }, { v: '15', label: 'Fast' }]} /></View>
      </View>
    </View>
  );

  const ticket = (
    <View style={{ gap: 16 }}>
      <View>
        <Label>Account (simulated)</Label>
        <Num size={26} style={{ marginTop: 2 }}>{money(eq, 2)}</Num>
        <Num size={13} style={{ color: eq >= s.start ? C.up : C.down }}>{eq >= s.start ? '+' : ''}{money(eq - s.start, 2)} this session</Num>
      </View>
      <Rule />
      {p ? (
        <View style={{ gap: 12 }}>
          <Label>Open position</Label>
          <Facts rows={[
            [p.side === 'long' ? 'Long' : 'Short', `${p.qty} sh @ ${price(p.plan.entry)}`],
            ['Open profit', money(openPnl, 2), openPnl >= 0 ? 'up' : 'down'],
            ['In R', rText(openR), openR >= 0 ? 'up' : 'down'],
            ['Stop', price(p.plan.stop), 'down'],
            ['Target', p.plan.target ? price(p.plan.target) : 'none', 'up'],
          ]} />
          <Row>
            <Button label="Close now" kind="solid" onPress={() => { s.close(); refresh(); }} style={{ flex: 1 }} testID="close" />
            <Button label="Stop to breakeven" small onPress={() => { s.breakeven(); refresh(); }} style={{ flex: 1 }} />
          </Row>
        </View>
      ) : (
        <View style={{ gap: 14 }}>
          <Label>New trade</Label>
          <View style={{ gap: 6 }}><Text style={{ color: C.mute, fontSize: 14 }}>Risk per trade</Text><Choice value={riskPct} onChange={setRiskPct} testID="risk" options={[{ v: '0.5', label: '0.5%' }, { v: '1', label: '1%' }, { v: '2', label: '2%' }]} /></View>
          <Stepper label="Stop distance (ATR)" value={stopAtr} min={0.5} max={4} step={0.5} onChange={setStopAtr} testID="tstop" />
          <View style={{ gap: 6 }}><Text style={{ color: C.mute, fontSize: 14 }}>Target</Text><Choice value={rr} onChange={setRr} testID="trr" options={[{ v: '1', label: '1R' }, { v: '2', label: '2R' }, { v: '3', label: '3R' }, { v: 'none', label: 'None' }]} /></View>
          <Facts rows={[
            ['Shares', String(size.qty)],
            ['Risk if stopped', money(size.riskCash, 2)],
            ['Position value', money(size.qty * last.c)],
          ]} />
          <Row>
            <Button label="Buy" kind="up" onPress={() => place('long')} style={{ flex: 1 }} testID="buy" disabled={ended} />
            <Button label="Sell short" kind="down" onPress={() => place('short')} style={{ flex: 1 }} testID="sell" disabled={ended} />
          </Row>
          {msg ? <P dim style={{ color: C.amber, fontSize: 13 }}>{msg}</P> : null}
        </View>
      )}
      <Rule />
      <View style={{ gap: 8 }}>
        <Label>Session record</Label>
        {s.trades.length ? (
          <>
            <Row style={{ gap: 12 }}>
              <Stat label="Trades" value={String(sum.n)} />
              <Stat label="Win rate" value={pct(sum.winRate)} />
              <Stat label="Expectancy" value={rText(sum.expectancy)} tone={sum.expectancy >= 0 ? 'up' : 'down'} />
            </Row>
            {s.trades.slice(-6).reverse().map((t, i) => (
              <Row key={i} style={{ justifyContent: 'space-between' }}>
                <Text style={{ color: C.mute, fontSize: 13 }}>{t.side === 'long' ? 'Long' : 'Short'} {t.qty} · {t.reason}</Text>
                <Num size={13} style={{ color: t.r >= 0 ? C.up : C.down }}>{rText(t.r)}  {money(t.pnl)}</Num>
              </Row>
            ))}
          </>
        ) : <P dim style={{ fontSize: 13 }}>No closed trades yet. Max drawdown so far {pct(s.maxDd, 1)}.</P>}
        {ended || s.trades.length >= 3 ? (
          <P dim style={{ fontSize: 13, lineHeight: 20 }}>{review(sum, s.maxDd)}</P>
        ) : null}
        <Button label={ended ? 'Start a new session' : 'Restart session'} kind="quiet" onPress={restart} />
      </View>
    </View>
  );

  const chart = <Chart bars={bars} count={bars.length} first={first} slots={WINDOW + 8} lines={lines} volume minHeight={wide ? 0 : 320} />;
  if (wide) {
    return (
      <View style={{ flex: 1, flexDirection: 'row' }}>
        <View style={{ flex: 1 }}>{top}{chart}</View>
        <View style={{ width: 360, flexShrink: 0, backgroundColor: C.surface, borderLeftWidth: 1, borderLeftColor: C.line }}><ScrollView contentContainerStyle={{ padding: 20 }}>{ticket}</ScrollView></View>
      </View>
    );
  }
  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 40 }}>
      {top}
      <View style={{ height: 320 }}>{chart}</View>
      <View style={{ padding: 20, backgroundColor: C.surface }}>{ticket}</View>
    </ScrollView>
  );
}

/** A plain-spoken read of the session, built from expectancy rather than from the account balance. */
function review(sum: ReturnType<typeof summarize>, dd: number): string {
  if (!sum.n) return 'Close a few trades to get a review of how you traded.';
  const parts: string[] = [];
  parts.push(`Across ${sum.n} trades you averaged ${rText(sum.expectancy)} per trade (win rate ${pct(sum.winRate)}, average win ${rText(sum.avgWin)}, average loss ${rText(sum.avgLoss)}).`);
  if (sum.expectancy > 0) parts.push('Positive expectancy is the only thing that matters over many trades, but a few trades prove very little.');
  else parts.push('Negative expectancy: your losses are costing more than your wins pay. Look at whether you cut winners short or let losers run past the stop.');
  if (dd > 0.08) parts.push(`Your worst drawdown was ${pct(dd, 1)}. Risking less per trade keeps a bad run survivable.`);
  if (sum.n >= 3 && sum.avgLoss < -1.3) parts.push('Average loss is bigger than 1R, which usually means stops were moved or ignored.');
  return parts.join(' ');
}
void MAX_BARS;
