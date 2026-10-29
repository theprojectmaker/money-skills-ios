import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, Text, View, useWindowDimensions } from 'react-native';
import Chart from '../Chart';
import Ticket from './Ticket';
import { BottomPanel, IndicatorMenu, SymbolSearch, Watchlist, quoteOf } from './Panels';
import Coach from '../Coach';
import { Btn, Seg, mono } from '../kit';
import { C } from '../theme';
import { bump, getState, patchTerm, setState, useStore } from '../../store';
import { advance, barsFor, deleteDrawing, addDrawing, enterSandbox, exitSandbox, nextDay, setChartType, setPick, setSymbol, setTf, setTicket, setTool, setView, stepBar, toggleIndicator, undoDrawing, clearDrawings, cancelById } from '../../sim';
import { computeAll, INDICATORS, IndicatorId } from '../../engine/indicators';
import { swingLevels } from '../../engine/indicators';
import { TIMEFRAMES, fmtClock, fmtDate } from '../../engine/series';
import { equityOf, money, openOrders } from '../../engine/account';
import { envFor } from '../../sim';
import { BY_SYMBOL } from '../../engine/universe';
import { Sheet } from '../kit';
import type { Tool } from '../../store';

const TOOLS: { id: Tool; icon: string; label: string }[] = [
  { id: 'cursor', icon: '↖', label: 'Move' },
  { id: 'cross', icon: '✛', label: 'Crosshair' },
  { id: 'trend', icon: '╱', label: 'Trend line' },
  { id: 'hline', icon: '─', label: 'Horizontal line' },
  { id: 'fib', icon: 'Fib', label: 'Fibonacci' },
  { id: 'rect', icon: '▭', label: 'Rectangle' },
];

const REPLAYS: { label: string; kind: 'up' | 'down' | 'range' | 'volatile' | 'earnings' }[] = [
  { label: 'Trending up', kind: 'up' }, { label: 'Trending down', kind: 'down' }, { label: 'Choppy range', kind: 'range' },
  { label: 'Volatile swings', kind: 'volatile' }, { label: 'Earnings-style gap day', kind: 'earnings' },
];

export default function Terminal() {
  const term = useStore((s) => s.term);
  const lesson = useStore((s) => s.lesson);
  const { width, height } = useWindowDimensions();
  const wide = width >= 1000;
  const [rightTab, setRightTab] = useState<'trade' | 'watch'>('trade');
  const [showRight, setShowRight] = useState(false);
  const [showBottom, setShowBottom] = useState(true);
  const [search, setSearch] = useState(false);
  const [indMenu, setIndMenu] = useState(false);
  const [replay, setReplay] = useState(false);
  const bars = barsFor(term);
  const comp = useMemo(() => computeAll(bars, term.indicators), [bars, term.indicators]);
  const levels = useMemo(() => (lesson && term.sandbox ? swingLevels(bars) : null), [bars, lesson, term.sandbox]);
  const q = quoteOf(term.symbol, term.cursor, term.season);
  const a = term.account;
  const env = envFor(term);
  const eq = equityOf(a, env);
  const pnl = eq - a.startBalance;

  // sim clock
  const carry = useRef(0);
  useEffect(() => {
    if (!term.playing) return;
    const id = setInterval(() => {
      carry.current += getState().term.speed * 0.25;
      const whole = Math.floor(carry.current);
      if (whole >= 1) { carry.current -= whole; advance(whole); }
    }, 250);
    return () => clearInterval(id);
  }, [term.playing]);
  useEffect(() => () => { if (getState().term.playing) patchTerm({ playing: false }); }, []);

  const drawings = term.drawings[term.symbol] ?? [];
  const bottomH = showBottom ? (wide ? 210 : 180) : 34;
  const rightW = wide ? 330 : Math.min(360, width - 60);
  const showSide = wide || showRight;
  const when = bars.t[bars.n - 1] ?? 0;
  const open = openOrders(a, term.symbol);
  const subIds = INDICATORS.map((i) => ({ id: i.id, label: i.label, hint: i.hint }));

  const sideBody = (
    <View style={{ width: rightW, backgroundColor: C.panel, borderLeftWidth: 1, borderLeftColor: C.border }}>
      <View style={{ flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: C.border }}>
        {([['trade', 'Trade'], ['watch', 'Watchlist']] as const).map(([k, l]) => (
          <Pressable key={k} testID={`rtab-${k}`} onPress={() => setRightTab(k)} style={{ flex: 1, paddingVertical: 11, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: rightTab === k ? C.accent : 'transparent' }}>
            <Text style={{ color: rightTab === k ? C.strong : C.muted, fontWeight: '800' }}>{l}</Text>
          </Pressable>
        ))}
      </View>
      <ScrollView contentContainerStyle={{ padding: 12 }} keyboardShouldPersistTaps="handled">
        {rightTab === 'trade' ? <Ticket /> : <Watchlist onSearch={() => setSearch(true)} />}
      </ScrollView>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      {term.sandbox === 'replay' && (
        <View style={{ backgroundColor: C.warnSoft, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, paddingVertical: 6 }}>
          <Text style={{ color: C.warn, fontWeight: '800', fontSize: 12 }}>REPLAY PRACTICE: a separate account. Your real practice account is untouched.</Text>
          <Btn small label="Exit replay" onPress={() => exitSandbox()} />
        </View>
      )}
      {/* top bar */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8, paddingHorizontal: 10, paddingVertical: 6, backgroundColor: C.panel, borderBottomWidth: 1, borderBottomColor: C.border }}>
        <Pressable testID="symbol-btn" onPress={() => setSearch(true)} style={{ paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6, backgroundColor: C.panel2, borderWidth: 1, borderColor: C.border2 }}>
          <Text style={{ color: C.strong, fontWeight: '900', fontSize: 15 }}>{term.symbol} <Text style={{ color: C.muted, fontSize: 11, fontWeight: '600' }}>{BY_SYMBOL[term.symbol]?.name.replace(' (simulated index)', '').slice(0, 20)}</Text></Text>
        </Pressable>
        <View>
          <Text testID="price" style={{ color: C.strong, fontFamily: mono, fontSize: 16, fontWeight: '800' }}>{q.last.toFixed(2)}</Text>
          <Text style={{ color: q.chg >= 0 ? C.up : C.down, fontFamily: mono, fontSize: 11 }}>{q.chg >= 0 ? '+' : ''}{q.chg.toFixed(2)} ({q.pct.toFixed(2)}%)</Text>
        </View>
        <Seg small value={term.tf} onChange={setTf} options={TIMEFRAMES.map((t) => ({ v: t, label: t }))} testID="tf" />
        <Seg small value={term.chartType} onChange={setChartType} options={[{ v: 'candles', label: '🕯' }, { v: 'bars', label: '𝍢' }, { v: 'line', label: '〰' }, { v: 'area', label: '◿' }]} testID="ctype" />
        <Btn small testID="ind-btn" label={`Indicators${term.indicators.length ? ' · ' + term.indicators.length : ''}`} onPress={() => setIndMenu(true)} />
        <View style={{ flex: 1 }} />
        <Text style={{ color: C.muted, fontSize: 11 }}>{fmtDate(when).slice(0, 6)} {fmtClock(when)} <Text style={{ color: C.warn }}>SIMULATED</Text></Text>
        <Btn small testID="play" kind={term.playing ? 'warn' : 'primary'} label={term.playing ? '❚❚ Pause' : '▶ Play'} onPress={() => patchTerm({ playing: !term.playing })} />
        <Seg small value={term.speed} onChange={(speed) => patchTerm({ speed })} options={[1, 5, 15, 60].map((v) => ({ v, label: v + '×' }))} testID="speed" />
        <Btn small testID="step" label="Step bar ▸" onPress={() => { patchTerm({ playing: false }); stepBar(); }} />
        <Btn small testID="nextday" label="Next day ▸▸" onPress={() => { patchTerm({ playing: false }); nextDay(); }} />
        {!term.sandbox && <Btn small testID="replay-btn" label="⏪ Replay" onPress={() => setReplay(true)} />}
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={{ color: C.muted, fontSize: 10 }}>{term.sandbox ? 'Practice account' : 'Account'}</Text>
          <Text testID="equity" style={{ color: C.strong, fontFamily: mono, fontWeight: '800' }}>{money(eq)} <Text style={{ color: pnl >= 0 ? C.up : C.down, fontSize: 11 }}>{pnl >= 0 ? '+' : ''}{money(pnl)}</Text></Text>
        </View>
        {!wide && <Btn small label={showRight ? 'Hide panel' : 'Trade ▸'} onPress={() => setShowRight(!showRight)} />}
      </View>

      <View style={{ flex: 1, flexDirection: 'row' }}>
        {/* tools */}
        <View style={{ width: 52, backgroundColor: C.panel, borderRightWidth: 1, borderRightColor: C.border, alignItems: 'center', paddingVertical: 6, gap: 4 }}>
          {TOOLS.map((t) => (
            <Pressable key={t.id} testID={`tool-${t.id}`} accessibilityLabel={t.label} onPress={() => { setTool(term.tool === t.id ? 'cursor' : t.id); setPick(null); }} style={{ width: 42, height: 42, borderRadius: 8, alignItems: 'center', justifyContent: 'center', backgroundColor: term.tool === t.id ? C.active : 'transparent' }}>
              <Text style={{ color: term.tool === t.id ? '#fff' : C.text, fontSize: t.icon.length > 2 ? 12 : 20, fontWeight: '700' }}>{t.icon}</Text>
            </Pressable>
          ))}
          <View style={{ height: 1, width: 30, backgroundColor: C.border, marginVertical: 4 }} />
          <Pressable testID="tool-undo" accessibilityLabel="Undo drawing" onPress={undoDrawing} style={{ width: 42, height: 38, alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: C.text, fontSize: 18 }}>↶</Text></Pressable>
          <Pressable testID="tool-delete" accessibilityLabel="Delete selected drawing" onPress={() => (term.selected !== null ? deleteDrawing(term.selected) : clearDrawings())} style={{ width: 42, height: 38, alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: term.selected !== null ? C.down : C.muted, fontSize: 18 }}>🗑</Text></Pressable>
          <Pressable testID="zoom-reset" accessibilityLabel="Reset zoom" onPress={() => setView({ offset: 0, span: 90 })} style={{ width: 42, height: 38, alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: C.text, fontSize: 11, fontWeight: '800' }}>FIT</Text></Pressable>
        </View>

        <View style={{ flex: 1 }}>
          <View style={{ flex: 1 }} testID="chart-area">
            <Chart
              bars={bars}
              comp={comp}
              indicators={term.indicators}
              chartType={term.chartType}
              view={term.view}
              onView={setView}
              drawings={drawings}
              selected={term.selected}
              tool={term.tool}
              pick={term.pick}
              positions={Object.values(a.positions).filter((p) => p.symbol === term.symbol)}
              orders={open}
              levelsToShow={levels}
              onSelect={(id) => patchTerm({ selected: id })}
              onDraw={(d) => { addDrawing(d); if (term.tool !== 'hline') setTool('cursor'); }}
              onPickPrice={(price) => {
                const f = term.pick;
                if (!f) return;
                setTicket({ [f]: Math.round(price * 100) / 100 } as any);
                setPick(null);
                bump('pricesPicked');
              }}
              onCancelOrder={cancelById}
              onEvent={(n) => bump(n === 'zoom' ? 'zooms' : n === 'pan' ? 'pans' : 'crosshairUses')}
            />
            {lesson ? <Coach /> : null}
          </View>
          <Pressable onPress={() => setShowBottom(!showBottom)} style={{ height: 0 }} />
          <BottomPanelWrap h={bottomH} open={showBottom} toggle={() => setShowBottom(!showBottom)} />
        </View>

        {showSide && (wide ? sideBody : <View style={{ position: 'absolute', right: 0, top: 0, bottom: 0, shadowColor: '#000', shadowOpacity: 0.5, shadowRadius: 12 }}>{sideBody}</View>)}
      </View>

      <SymbolSearch visible={search} onClose={() => setSearch(false)} />
      <IndicatorMenu visible={indMenu} onClose={() => setIndMenu(false)} items={subIds} active={term.indicators} onToggle={(id) => toggleIndicator(id as IndicatorId)} />
      <Sheet visible={replay} onClose={() => setReplay(false)} title="Replay a simulated session" width={460}>
        <Text style={{ color: C.text, marginBottom: 10, fontSize: 13 }}>Pick a kind of market for {term.symbol}. You get a separate $100,000 practice account and step through it candle by candle. Your main account stays untouched.</Text>
        {REPLAYS.map((r) => (
          <Btn key={r.kind} label={r.label} style={{ marginBottom: 8 }} testID={`replay-${r.kind}`} onPress={() => {
            enterSandbox('replay', { symbol: term.symbol, tf: '5m', kind: r.kind, indicators: ['vol'] });
            bump('replaysStarted');
            setReplay(false);
          }} />
        ))}
      </Sheet>
      <ToastBar />
    </View>
  );
}

function BottomPanelWrap({ h, open, toggle }: { h: number; open: boolean; toggle: () => void }) {
  if (!open) {
    return (
      <Pressable onPress={toggle} style={{ height: h, backgroundColor: C.panel, borderTopWidth: 1, borderTopColor: C.border, justifyContent: 'center', paddingHorizontal: 12 }}>
        <Text style={{ color: C.muted, fontWeight: '700', fontSize: 12 }}>▲ Positions · Orders · History · Journal · Stats</Text>
      </Pressable>
    );
  }
  return (
    <View>
      <BottomPanel height={h} />
      <Pressable onPress={toggle} style={{ position: 'absolute', right: 8, top: 5 }} hitSlop={8}><Text style={{ color: C.muted }}>▼</Text></Pressable>
    </View>
  );
}

export function ToastBar() {
  const t = useStore((s) => s.toast);
  if (!t) return null;
  return (
    <View pointerEvents="none" style={{ position: 'absolute', bottom: 18, left: 0, right: 0, alignItems: 'center' }}>
      <View testID="toast" style={{ backgroundColor: '#000c', borderRadius: 10, paddingHorizontal: 16, paddingVertical: 10, maxWidth: 640, borderWidth: 1, borderColor: C.border2 }}>
        <Text style={{ color: C.strong, fontWeight: '700' }}>{t.text}</Text>
      </View>
    </View>
  );
}
void setSymbol; void setState; void height_unused;
function height_unused() {}
