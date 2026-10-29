import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { getState, setState, bump, useStore } from '../../store';
import { barsFor, cancelById, closeSymbol, envFor, setProtection, setSymbol } from '../../sim';
import { equityOf, maxDrawdown, money, openOrders, statsOf } from '../../engine/account';
import { BY_SYMBOL, SECTORS, UNIVERSE } from '../../engine/universe';
import { dayOf, minutesFor, SESSION_MIN } from '../../engine/generator';
import { fmtClock } from '../../engine/series';
import { minuteTime } from '../../engine/generator';
import { Btn, Chip, Label, NumField, Sheet, mono } from '../kit';
import { C } from '../theme';
import { addXp } from '../../progress';

const th = { color: C.muted, fontSize: 11, fontWeight: '700' as const };
const td = { color: C.text, fontSize: 12, fontFamily: mono };

export function quoteOf(symbol: string, cursor: number, season: number) {
  const d = minutesFor(symbol, season);
  const last = d.c[cursor];
  const day = dayOf(cursor);
  const prev = day === 0 ? d.o[0] : d.c[day * SESSION_MIN - 1];
  return { last, chg: last - prev, pct: ((last - prev) / prev) * 100 };
}

export function Watchlist({ onSearch }: { onSearch: () => void }) {
  const t = useStore((s) => s.term);
  const list = useStore((s) => s.watchlist);
  return (
    <View testID="watchlist" style={{ gap: 2 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingBottom: 6 }}>
        <Label>Watchlist (simulated)</Label>
        <Pressable onPress={onSearch}><Text style={{ color: C.accent2, fontWeight: '800' }}>+ Add</Text></Pressable>
      </View>
      {list.map((sym) => {
        const q = quoteOf(sym, t.cursor, t.season);
        const on = sym === t.symbol;
        return (
          <Pressable key={sym} onPress={() => setSymbol(sym)} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 8, borderRadius: 6, backgroundColor: on ? C.active : 'transparent' }}>
            <View style={{ flex: 1 }}>
              <Text style={{ color: C.strong, fontWeight: '800' }}>{sym}</Text>
              <Text style={{ color: C.muted, fontSize: 10 }} numberOfLines={1}>{BY_SYMBOL[sym]?.name}</Text>
            </View>
            <Text style={{ color: C.text, fontFamily: mono, width: 70, textAlign: 'right' }}>{q.last.toFixed(2)}</Text>
            <Text style={{ color: q.chg >= 0 ? C.up : C.down, fontFamily: mono, width: 64, textAlign: 'right' }}>{q.chg >= 0 ? '+' : ''}{q.pct.toFixed(2)}%</Text>
            <Pressable hitSlop={10} onPress={() => setState((s) => ({ watchlist: s.watchlist.filter((x) => x !== sym) }))}><Text style={{ color: C.muted, marginLeft: 8 }}>✕</Text></Pressable>
          </Pressable>
        );
      })}
    </View>
  );
}

export function SymbolSearch({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const [q, setQ] = useState('');
  const [sector, setSector] = useState<string>('All');
  const t = useStore((s) => s.term);
  const list = useStore((s) => s.watchlist);
  const rows = useMemo(() => UNIVERSE.filter((s) => (sector === 'All' || s.sector === sector) && (q === '' || (s.symbol + ' ' + s.name).toLowerCase().includes(q.toLowerCase()))), [q, sector]);
  return (
    <Sheet visible={visible} onClose={onClose} title="Symbol search" width={600} testID="symbol-search">
      <Text style={{ color: C.warn, fontSize: 12, marginBottom: 8 }}>All companies here are fictional and every price is simulated on this device.</Text>
      <TextInput testID="search-input" value={q} onChangeText={setQ} placeholder="Search a ticker or name" placeholderTextColor={C.muted} autoCapitalize="none"
        style={{ backgroundColor: C.bg, color: C.strong, borderRadius: 6, borderWidth: 1, borderColor: C.border2, padding: 10, marginBottom: 10 }} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8 }}>
        {['All', ...SECTORS].map((s) => (
          <Pressable key={s} onPress={() => setSector(s)} style={{ marginRight: 6, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, backgroundColor: sector === s ? C.accent : C.panel2 }}>
            <Text style={{ color: sector === s ? '#fff' : C.muted, fontSize: 12, fontWeight: '700' }}>{s}</Text>
          </Pressable>
        ))}
      </ScrollView>
      {rows.map((s) => {
        const qt = quoteOf(s.symbol, t.cursor, t.season);
        const inList = list.includes(s.symbol);
        return (
          <Pressable key={s.symbol} testID={`pick-${s.symbol}`} onPress={() => { setSymbol(s.symbol); onClose(); }} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: C.border }}>
            <Text style={{ color: C.strong, fontWeight: '800', width: 62 }}>{s.symbol}</Text>
            <Text style={{ color: C.text, flex: 1, fontSize: 13 }} numberOfLines={1}>{s.name}</Text>
            <Text style={{ color: C.muted, fontSize: 11, width: 100 }}>{s.sector}</Text>
            <Text style={{ color: qt.chg >= 0 ? C.up : C.down, fontFamily: mono, width: 70, textAlign: 'right' }}>{qt.last.toFixed(2)}</Text>
            <Pressable hitSlop={10} onPress={() => setState((st) => ({ watchlist: inList ? st.watchlist.filter((x) => x !== s.symbol) : [...st.watchlist, s.symbol] }))}>
              <Text style={{ color: inList ? C.warn : C.muted, fontSize: 18, marginLeft: 12 }}>{inList ? '★' : '☆'}</Text>
            </Pressable>
          </Pressable>
        );
      })}
    </Sheet>
  );
}

export function BottomPanel({ height }: { height: number }) {
  const t = useStore((s) => s.term);
  const [tab, setTab] = useState<'positions' | 'orders' | 'history' | 'journal' | 'stats'>('positions');
  const [protect, setProtect] = useState<string | null>(null);
  const [sl, setSl] = useState<number | undefined>();
  const [tp, setTp] = useState<number | undefined>();
  const a = t.account;
  const env = envFor(t);
  const positions = Object.values(a.positions);
  const orders = openOrders(a);
  const trades = [...a.trades].reverse();
  const tabs: [typeof tab, string][] = [['positions', `Positions (${positions.length})`], ['orders', `Orders (${orders.length})`], ['history', `History (${a.trades.length})`], ['journal', 'Journal'], ['stats', 'Stats']];
  const eq = equityOf(a, env);
  return (
    <View testID="bottom-panel" style={{ height, backgroundColor: C.panel, borderTopWidth: 1, borderTopColor: C.border }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: C.border }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flex: 1 }}>
          {tabs.map(([k, l]) => (
            <Pressable key={k} testID={`tab-${k}`} onPress={() => { setTab(k); if (k === 'stats') bump('statsViewed'); }} style={{ paddingHorizontal: 14, paddingVertical: 9, borderBottomWidth: 2, borderBottomColor: tab === k ? C.accent : 'transparent' }}>
              <Text style={{ color: tab === k ? C.strong : C.muted, fontWeight: '700', fontSize: 12 }}>{l}</Text>
            </Pressable>
          ))}
        </ScrollView>
        <Text style={{ color: C.muted, fontSize: 11, marginRight: 12 }}>Equity <Text style={{ color: C.strong, fontFamily: mono }}>{money(eq)}</Text>  Cash <Text style={{ color: C.strong, fontFamily: mono }}>{money(a.cash)}</Text></Text>
      </View>
      <ScrollView contentContainerStyle={{ padding: 8 }}>
        {tab === 'positions' && (positions.length === 0 ? <Empty text="No open positions. Place an order in the Trade panel." /> : positions.map((p) => {
          const mark = env.mark(p.symbol);
          const pnl = (mark - p.avg) * p.qty;
          return (
            <View key={p.symbol} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 6, gap: 10 }}>
              <Text style={{ color: C.strong, fontWeight: '800', width: 54 }}>{p.symbol}</Text>
              <Chip text={p.qty > 0 ? 'LONG' : 'SHORT'} color={p.qty > 0 ? C.up : C.down} />
              <Text style={[td, { width: 70 }]}>{Math.abs(p.qty)} sh</Text>
              <Text style={[td, { width: 90 }]}>avg {p.avg.toFixed(2)}</Text>
              <Text style={[td, { width: 90 }]}>last {mark.toFixed(2)}</Text>
              <Text style={[td, { width: 100, color: pnl >= 0 ? C.up : C.down }]}>{pnl >= 0 ? '+' : ''}{money(pnl)}</Text>
              <Btn small label="Stop/Target" onPress={() => { setProtect(p.symbol); setSl(undefined); setTp(undefined); }} />
              <Btn small kind="warn" label="Close" testID={`close-${p.symbol}`} onPress={() => closeSymbol(p.symbol)} />
            </View>
          );
        }))}
        {tab === 'orders' && (orders.length === 0 ? <Empty text="No working orders." /> : orders.map((o) => (
          <View key={o.id} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 6, gap: 10 }}>
            <Text style={{ color: C.strong, fontWeight: '800', width: 54 }}>{o.symbol}</Text>
            <Chip text={o.side.toUpperCase()} color={o.side === 'buy' ? C.up : C.down} />
            <Text style={[td, { width: 90 }]}>{o.role === 'sl' ? 'stop-loss' : o.role === 'tp' ? 'take-profit' : o.type}</Text>
            <Text style={[td, { width: 70 }]}>{o.qty} sh</Text>
            <Text style={[td, { width: 100 }]}>@ {(o.stop ?? o.limit ?? 0).toFixed(2)}</Text>
            <Btn small label="Cancel" onPress={() => cancelById(o.id)} />
          </View>
        )))}
        {tab === 'history' && (trades.length === 0 ? <Empty text="Closed trades show up here." /> : trades.map((tr) => (
          <View key={tr.id} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 5, gap: 10 }}>
            <Text style={{ color: C.strong, fontWeight: '800', width: 54 }}>{tr.symbol}</Text>
            <Chip text={tr.dir.toUpperCase()} color={tr.dir === 'long' ? C.up : C.down} />
            <Text style={[td, { width: 60 }]}>{tr.qty} sh</Text>
            <Text style={[td, { width: 130 }]}>{tr.entry.toFixed(2)} → {tr.exit.toFixed(2)}</Text>
            <Text style={[td, { width: 100, color: tr.pnl >= 0 ? C.up : C.down }]}>{tr.pnl >= 0 ? '+' : ''}{money(tr.pnl)}</Text>
            <Text style={[td, { width: 50 }]}>{tr.r !== undefined ? tr.r + 'R' : ''}</Text>
            <Text style={[td, { color: C.muted }]}>{fmtClock(minuteTime(tr.closeM))}</Text>
          </View>
        )))}
        {tab === 'journal' && <Journal />}
        {tab === 'stats' && <Stats />}
      </ScrollView>
      <Sheet visible={!!protect} onClose={() => setProtect(null)} title={`Stop and target for ${protect ?? ''}`} width={420}>
        <Text style={{ color: C.text, marginBottom: 10, fontSize: 13 }}>Attach a stop-loss and/or a take-profit to the whole position. They cancel each other when one fills.</Text>
        <View style={{ gap: 10 }}>
          <NumField label="Stop-loss price" prefix="$" value={sl} onChange={setSl} />
          <NumField label="Take-profit price" prefix="$" value={tp} onChange={setTp} />
          <Btn kind="primary" label="Attach" onPress={() => { if (protect && (sl || tp)) { setProtection(protect, sl, tp); setProtect(null); } }} />
        </View>
      </Sheet>
    </View>
  );
}

const Empty = ({ text }: { text: string }) => <Text style={{ color: C.muted, padding: 12, fontSize: 13 }}>{text}</Text>;

const EMOTIONS = ['Calm', 'Confident', 'Anxious', 'Greedy', 'Fearful', 'Bored', 'Revenge'];
const SETUPS = ['Trend', 'Pullback', 'Breakout', 'Support bounce', 'Reversal', 'Other'];

function Journal() {
  const t = useStore((s) => s.term);
  const journal = useStore((s) => s.journal);
  const trades = [...t.account.trades].reverse().slice(0, 12);
  if (!trades.length) return <Empty text="Close a trade, then record why you took it and how you felt. Reviewing this is how traders improve." />;
  return (
    <View style={{ gap: 12 }}>
      {trades.map((tr) => {
        const key = t.sandbox ? 1e6 + tr.id : tr.id;
        const j = journal[key] ?? { note: '' };
        const set = (p: Partial<typeof j>) => {
          setState((s) => ({ journal: { ...s.journal, [key]: { ...(s.journal[key] ?? { note: '' }), ...p } } }));
        };
        return (
          <View key={tr.id} style={{ backgroundColor: C.panel2, borderRadius: 8, padding: 10, gap: 8 }}>
            <Text style={{ color: C.strong, fontWeight: '800' }}>{tr.symbol} {tr.dir} {tr.pnl >= 0 ? '+' : ''}{money(tr.pnl)} {tr.r !== undefined ? `(${tr.r}R)` : ''}</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
              {SETUPS.map((s) => <Tag key={s} text={s} on={j.setup === s} onPress={() => set({ setup: s })} />)}
            </View>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
              {EMOTIONS.map((s) => <Tag key={s} text={s} on={j.emotion === s} onPress={() => set({ emotion: s })} />)}
            </View>
            <TextInput
              testID={`note-${tr.id}`}
              defaultValue={j.note}
              placeholder="Why did I take this trade? What would I do differently?"
              placeholderTextColor={C.muted}
              multiline
              onEndEditing={(e) => {
                const text = e.nativeEvent.text;
                if (text.trim() && !j.note) { bump('journalNotes'); if (!t.sandbox) addXp(10, 'Journal note'); }
                set({ note: text });
              }}
              style={{ color: C.strong, backgroundColor: C.bg, borderRadius: 6, borderWidth: 1, borderColor: C.border2, padding: 8, minHeight: 56 }}
            />
          </View>
        );
      })}
    </View>
  );
}
const Tag = ({ text, on, onPress }: { text: string; on: boolean; onPress: () => void }) => (
  <Pressable onPress={onPress} style={{ paddingHorizontal: 9, paddingVertical: 5, borderRadius: 999, backgroundColor: on ? C.accent : C.panel, borderWidth: 1, borderColor: on ? C.accent : C.border2 }}>
    <Text style={{ color: on ? '#fff' : C.muted, fontSize: 11, fontWeight: '700' }}>{text}</Text>
  </Pressable>
);

function Stats() {
  const t = useStore((s) => s.term);
  const st = statsOf(t.account.trades);
  const dd = maxDrawdown(t.account.curve);
  const cells: [string, string][] = [
    ['Closed trades', String(st.n)],
    ['Win rate', st.n ? (st.winRate * 100).toFixed(0) + '%' : '-'],
    ['Average win', money(st.avgWin)],
    ['Average loss', money(-st.avgLoss)],
    ['Profit factor', Number.isFinite(st.profitFactor) ? st.profitFactor.toFixed(2) : st.n ? '∞' : '-'],
    ['Expectancy / trade', money(st.expectancy)],
    ['Net realized', money(st.net)],
    ['Max drawdown', (dd * 100).toFixed(1) + '%'],
  ];
  const curve = t.account.curve.slice(-120);
  const lo = Math.min(...curve), hi = Math.max(...curve);
  return (
    <View style={{ flexDirection: 'row', gap: 16, flexWrap: 'wrap' }}>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, flex: 1, minWidth: 300 }}>
        {cells.map(([a, b]) => (
          <View key={a} style={{ backgroundColor: C.panel2, borderRadius: 6, padding: 10, minWidth: 130 }}>
            <Text style={{ color: C.muted, fontSize: 11 }}>{a}</Text>
            <Text style={{ color: C.strong, fontSize: 16, fontWeight: '800', fontFamily: mono }}>{b}</Text>
          </View>
        ))}
      </View>
      <View style={{ width: 260, height: 74, flexDirection: 'row', alignItems: 'flex-end', gap: 1, backgroundColor: C.panel2, borderRadius: 6, padding: 6 }}>
        {curve.map((v, i) => <View key={i} style={{ flex: 1, height: 4 + ((v - lo) / (hi - lo || 1)) * 56, backgroundColor: v >= t.account.startBalance ? C.up : C.down, opacity: 0.8 }} />)}
      </View>
    </View>
  );
}

export function IndicatorMenu({ visible, onClose, items, active, onToggle }: { visible: boolean; onClose: () => void; items: { id: string; label: string; hint: string }[]; active: string[]; onToggle: (id: string) => void }) {
  return (
    <Sheet visible={visible} onClose={onClose} title="Indicators" width={480} testID="indicator-menu">
      {items.map((i) => {
        const on = active.includes(i.id);
        return (
          <Pressable key={i.id} testID={`ind-${i.id}`} onPress={() => onToggle(i.id)} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: C.border, gap: 10 }}>
            <View style={{ width: 22, height: 22, borderRadius: 4, borderWidth: 2, borderColor: on ? C.accent : C.border2, backgroundColor: on ? C.accent : 'transparent', alignItems: 'center', justifyContent: 'center' }}>
              {on && <Text style={{ color: '#fff', fontWeight: '900' }}>✓</Text>}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: C.strong, fontWeight: '800' }}>{i.label}</Text>
              <Text style={{ color: C.muted, fontSize: 12 }}>{i.hint}</Text>
            </View>
          </Pressable>
        );
      })}
    </Sheet>
  );
}

void barsFor; void getState;
