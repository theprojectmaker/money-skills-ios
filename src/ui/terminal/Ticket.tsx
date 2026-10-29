import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useStore } from '../../store';
import { barsFor, envFor, setPick, setTicket, submitTicket } from '../../sim';
import { buyingPower, equityOf, money } from '../../engine/account';
import { positionSize, riskReward, dollarsAtRisk } from '../../engine/risk';
import { BY_SYMBOL } from '../../engine/universe';
import { Btn, Label, NumField, Seg, mono } from '../kit';
import { C } from '../theme';

export default function Ticket() {
  const t = useStore((s) => s.term);
  const k = t.ticket;
  const bars = barsFor(t);
  const last = bars.c[bars.n - 1];
  const env = envFor(t);
  const eq = equityOf(t.account, env);
  const bp = buyingPower(t.account, env);
  const entryRef = k.type === 'limit' || k.type === 'stoplimit' ? k.limit ?? last : last;
  const buy = k.side === 'buy';
  const needLimit = k.type === 'limit' || k.type === 'stoplimit';
  const needStop = k.type === 'stop' || k.type === 'stoplimit';
  const maxQty = Math.max(0, Math.floor(bp / (last * 1.001)));
  const riskUsd = k.sl ? dollarsAtRisk(k.qty || 0, entryRef, k.sl) : 0;
  const rr = k.sl && k.tp ? riskReward(entryRef, k.sl, k.tp) : 0;
  const pickBtn = (f: 'limit' | 'stop' | 'sl' | 'tp') => (
    <Pressable
      testID={`pick-${f}`}
      onPress={() => setPick(t.pick === f ? null : f)}
      accessibilityLabel={`Pick ${f} price on the chart`}
      style={{ paddingHorizontal: 6, paddingVertical: 4, borderRadius: 4, backgroundColor: t.pick === f ? C.warn : C.panel }}
    >
      <Text style={{ color: t.pick === f ? '#000' : C.accent2, fontWeight: '800', fontSize: 11 }}>{t.pick === f ? 'TAP CHART' : '⌖ pick'}</Text>
    </Pressable>
  );
  const round = (v: number) => Math.round(v * 100) / 100;
  return (
    <View style={{ gap: 10 }} testID="ticket">
      <Seg value={k.side} onChange={(side) => setTicket({ side })} options={[{ v: 'buy', label: 'BUY', color: C.up }, { v: 'sell', label: 'SELL / SHORT', color: C.down }]} testID="side" />
      <Seg small value={k.type} onChange={(type) => { setTicket({ type }); setPick(null); }} options={[{ v: 'market', label: 'Market' }, { v: 'limit', label: 'Limit' }, { v: 'stop', label: 'Stop' }, { v: 'stoplimit', label: 'Stop-Lmt' }]} testID="otype" />
      <View style={{ flexDirection: 'row', gap: 8, alignItems: 'flex-end' }}>
        <View style={{ flex: 1 }}>
          <NumField testID="qty" label="Shares" value={k.qty} onChange={(v) => setTicket({ qty: Math.floor(v ?? 0) })} />
        </View>
        {[10, 50, 100].map((q) => (
          <Pressable key={q} onPress={() => setTicket({ qty: q })} style={{ paddingHorizontal: 8, minHeight: 40, justifyContent: 'center', borderRadius: 6, borderWidth: 1, borderColor: C.border2 }}>
            <Text style={{ color: C.text, fontWeight: '700' }}>{q}</Text>
          </Pressable>
        ))}
        <Pressable onPress={() => setTicket({ qty: maxQty })} style={{ paddingHorizontal: 8, minHeight: 40, justifyContent: 'center', borderRadius: 6, borderWidth: 1, borderColor: C.border2 }}>
          <Text style={{ color: C.text, fontWeight: '700' }}>Max</Text>
        </Pressable>
      </View>
      {needLimit && <NumField testID="limit" label="Limit price" prefix="$" value={k.limit} onChange={(v) => setTicket({ limit: v })} right={pickBtn('limit')} placeholder={last.toFixed(2)} />}
      {needStop && <NumField testID="stop" label="Stop price" prefix="$" value={k.stop} onChange={(v) => setTicket({ stop: v })} right={pickBtn('stop')} placeholder={last.toFixed(2)} />}
      <View style={{ height: 1, backgroundColor: C.border }} />
      <Label>Protect the trade (optional)</Label>
      <NumField testID="sl" label="Stop-loss" prefix="$" value={k.sl} onChange={(v) => setTicket({ sl: v })} right={pickBtn('sl')} placeholder={buy ? 'below your entry' : 'above your entry'} />
      <NumField testID="tp" label="Take-profit" prefix="$" value={k.tp} onChange={(v) => setTicket({ tp: v })} right={pickBtn('tp')} placeholder={buy ? 'above your entry' : 'below your entry'} />
      <View style={{ flexDirection: 'row', gap: 8, alignItems: 'flex-end' }}>
        <View style={{ flex: 1 }}>
          <NumField testID="riskpct" label="Risk % of account" suffix="%" value={k.riskPct} onChange={(v) => setTicket({ riskPct: v })} placeholder="1" />
        </View>
        <Btn
          small
          label="Size by risk"
          testID="size-by-risk"
          onPress={() => {
            if (!k.sl) return;
            setTicket({ qty: positionSize(eq, k.riskPct ?? 1, entryRef, k.sl) });
          }}
          disabled={!k.sl}
        />
      </View>
      <View style={{ backgroundColor: C.panel2, borderRadius: 6, padding: 10, gap: 3 }}>
        <Line a="Last price" b={'$' + last.toFixed(2)} />
        <Line a="Est. value" b={money((k.qty || 0) * entryRef)} />
        <Line a="Buying power" b={money(bp)} />
        {k.sl ? <Line a="Risk if stopped out" b={`${money(riskUsd)}  (${eq > 0 ? ((riskUsd / eq) * 100).toFixed(2) : 0}%)`} warn /> : null}
        {rr ? <Line a="Reward : risk" b={rr.toFixed(2) + ' : 1'} /> : null}
        <Text style={{ color: C.muted, fontSize: 10, marginTop: 4 }}>{BY_SYMBOL[t.symbol]?.name}. Simulated spread {BY_SYMBOL[t.symbol]?.spreadBps} bps.</Text>
      </View>
      <Btn testID="submit" kind={buy ? 'up' : 'down'} label={`${buy ? 'BUY' : 'SELL'} ${k.qty || 0} ${t.symbol}${k.type !== 'market' ? ' (' + k.type + ')' : ''}`} onPress={() => { submitTicket(); }} />
      <Text style={{ color: C.muted, fontSize: 10 }}>{round(0) === 0 ? 'Practice money only. Nothing here is real.' : ''}</Text>
    </View>
  );
}

function Line({ a, b, warn }: { a: string; b: string; warn?: boolean }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
      <Text style={{ color: C.muted, fontSize: 12 }}>{a}</Text>
      <Text style={{ color: warn ? C.warn : C.text, fontSize: 12, fontFamily: mono }}>{b}</Text>
    </View>
  );
}
