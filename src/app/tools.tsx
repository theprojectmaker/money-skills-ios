import React, { useState } from 'react';
import { Pressable, ScrollView, Text, View, useWindowDimensions } from 'react-native';
import { CALCS, CalcId, defaults } from '../calc/calcs';
import { setState, useStore } from '../store';
import Calc from '../ui/Calc';
import { C } from '../ui/theme';

export default function Tools() {
  const saved = useStore((s) => s.calcSaved);
  const [id, setId] = useState<CalcId>('compound');
  const { width } = useWindowDimensions();
  const def = CALCS.find((c) => c.id === id)!;
  const wide = width >= 800;
  return (
    <ScrollView contentContainerStyle={{ padding: 18, alignItems: 'center' }} testID="tools">
      <View style={{ width: '100%', maxWidth: 1000, gap: 14 }}>
        <Text style={{ color: C.strong, fontSize: 26, fontWeight: '900' }}>Calculators</Text>
        <Text style={{ color: C.muted }}>Offline tools for the numbers in the lessons. Results use only what you type in; growth rates are assumptions, not predictions.</Text>
        <View style={{ flexDirection: wide ? 'row' : 'column', gap: 14 }}>
          <View style={{ width: wide ? 260 : '100%', gap: 6, flexDirection: wide ? 'column' : 'row', flexWrap: 'wrap' }}>
            {CALCS.map((c) => (
              <Pressable key={c.id} testID={`calc-tab-${c.id}`} onPress={() => setId(c.id)} style={{ padding: 11, borderRadius: 8, backgroundColor: id === c.id ? C.active : C.panel, borderWidth: 1, borderColor: id === c.id ? C.accent : C.border }}>
                <Text style={{ color: C.strong, fontWeight: '800', fontSize: 13 }}>{c.title}</Text>
              </Pressable>
            ))}
          </View>
          <View style={{ flex: 1, gap: 10 }}>
            <Text style={{ color: C.text }}>{def.blurb}</Text>
            <Calc id={id} values={saved[id] ?? defaults(def)} onChange={(v) => setState((s) => ({ calcSaved: { ...s.calcSaved, [id]: v } }))} />
          </View>
        </View>
        <Text style={{ color: C.muted, fontSize: 11 }}>Educational only. Not financial, tax or legal advice.</Text>
      </View>
    </ScrollView>
  );
}
