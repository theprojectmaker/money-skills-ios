import React, { useRef, useState } from 'react';
import { PanResponder, Pressable, Text, View } from 'react-native';
import { CALC_BY_ID, CalcField, CalcId, defaults } from '../calc/calcs';
import { Label, mono } from './kit';
import { C } from './theme';

const fmt = (f: CalcField, v: number) => {
  const s = f.step < 1 ? v.toFixed(1) : Math.round(v).toLocaleString('en-US');
  return f.unit === '$' ? '$' + s : f.unit === '%' ? s + '%' : f.unit === 'yrs' ? s + ' yrs' : f.unit === 'hrs' ? s + ' hrs' : s;
};

function Slider({ f, value, onChange }: { f: CalcField; value: number; onChange: (v: number) => void }) {
  const [w, setW] = useState(200);
  const ref = useRef({ w: 200, f, onChange });
  ref.current = { w, f, onChange };
  const set = (x: number) => {
    const { w, f, onChange } = ref.current;
    const raw = f.min + (Math.max(0, Math.min(w, x)) / w) * (f.max - f.min);
    const snapped = Math.round(raw / f.step) * f.step;
    onChange(Math.max(f.min, Math.min(f.max, Math.round(snapped * 1000) / 1000)));
  };
  const pr = useRef(PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderTerminationRequest: () => false,
    onPanResponderGrant: (e) => set(e.nativeEvent.locationX),
    onPanResponderMove: (e) => set(e.nativeEvent.locationX),
  })).current;
  const pct = (value - f.min) / (f.max - f.min);
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
      <Pressable accessibilityLabel={`Decrease ${f.label}`} onPress={() => onChange(Math.max(f.min, Math.round((value - f.step) * 1000) / 1000))} style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: C.panel2, alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: C.strong, fontSize: 20 }}>−</Text></Pressable>
      <View style={{ flex: 1, height: 36, justifyContent: 'center' }} onLayout={(e) => setW(e.nativeEvent.layout.width)} {...pr.panHandlers}>
        <View pointerEvents="none" style={{ height: 6, backgroundColor: C.border2, borderRadius: 3 }}>
          <View style={{ width: `${pct * 100}%`, height: 6, backgroundColor: C.accent, borderRadius: 3 }} />
        </View>
        <View pointerEvents="none" style={{ position: 'absolute', left: pct * (w - 22), width: 22, height: 22, borderRadius: 11, backgroundColor: '#fff', borderWidth: 3, borderColor: C.accent }} />
      </View>
      <Pressable accessibilityLabel={`Increase ${f.label}`} onPress={() => onChange(Math.min(f.max, Math.round((value + f.step) * 1000) / 1000))} style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: C.panel2, alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: C.strong, fontSize: 20 }}>+</Text></Pressable>
    </View>
  );
}

export default function Calc({ id, values, onChange }: { id: CalcId; values: Record<string, number>; onChange: (v: Record<string, number>) => void }) {
  const def = CALC_BY_ID[id];
  const v = { ...defaults(def), ...values };
  const res = def.compute(v);
  const series = res.series;
  const mx = series ? Math.max(...series, 1) : 1;
  return (
    <View testID={`calc-${id}`} style={{ backgroundColor: C.panel2, borderRadius: 10, borderWidth: 1, borderColor: C.border2, padding: 12, gap: 10 }}>
      <Text style={{ color: C.strong, fontWeight: '800', fontSize: 15 }}>🧮 {def.title}</Text>
      {def.fields.map((f) => (
        <View key={f.key}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Label>{f.label}</Label>
            <Text testID={`val-${f.key}`} style={{ color: C.strong, fontFamily: mono, fontWeight: '800' }}>{fmt(f, v[f.key])}</Text>
          </View>
          <Slider f={f} value={v[f.key]} onChange={(x) => onChange({ ...v, [f.key]: x })} />
        </View>
      ))}
      <View style={{ borderTopWidth: 1, borderTopColor: C.border, paddingTop: 8, gap: 4 }}>
        {res.rows.map((r) => (
          <View key={r.label} style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 10 }}>
            <Text style={{ color: C.muted, fontSize: 13, flex: 1 }}>{r.label}</Text>
            <Text style={{ color: r.tone === 'good' ? C.up : r.tone === 'bad' ? C.down : r.tone === 'warn' ? C.warn : C.strong, fontFamily: mono, fontWeight: r.strong ? '800' : '600', fontSize: r.strong ? 16 : 13 }}>{r.value}</Text>
          </View>
        ))}
      </View>
      {series && series.length > 1 && (
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', height: 56, gap: 2 }}>
          {series.map((s, i) => <View key={i} style={{ flex: 1, height: Math.max(2, (s / mx) * 54), backgroundColor: C.accent, opacity: 0.4 + 0.6 * (i / series.length), borderRadius: 2 }} />)}
        </View>
      )}
      {res.note ? <Text style={{ color: C.muted, fontSize: 11 }}>{res.note}</Text> : null}
    </View>
  );
}
