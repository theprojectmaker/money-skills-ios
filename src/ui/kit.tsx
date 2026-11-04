// Plain building blocks. Square corners, hairline rules, tabular numerals: closer to a printed ledger than an app kit.
import React from 'react';
import { Pressable, Text, TextStyle, View, ViewStyle, StyleProp } from 'react-native';
import { C, mono } from './theme';

export function Label({ children, style }: { children: React.ReactNode; style?: StyleProp<TextStyle> }) {
  return <Text style={[{ color: C.faint, fontSize: 11, fontWeight: '600', letterSpacing: 1.2, textTransform: 'uppercase' }, style]}>{children}</Text>;
}

export function H({ children, size = 22, style }: { children: React.ReactNode; size?: number; style?: StyleProp<TextStyle> }) {
  return <Text style={[{ color: C.text, fontSize: size, fontWeight: '700', letterSpacing: -0.3, lineHeight: size * 1.2 }, style]}>{children}</Text>;
}

export function P({ children, style, dim }: { children: React.ReactNode; style?: StyleProp<TextStyle>; dim?: boolean }) {
  return <Text style={[{ color: dim ? C.mute : C.text, fontSize: 15, lineHeight: 23 }, style]}>{children}</Text>;
}

export function Num({ children, style, size = 15 }: { children: React.ReactNode; style?: StyleProp<TextStyle>; size?: number }) {
  return <Text style={[{ color: C.text, fontFamily: mono, fontSize: size, fontVariant: ['tabular-nums'] }, style]}>{children}</Text>;
}

export function Rule({ style }: { style?: StyleProp<ViewStyle> }) {
  return <View style={[{ height: 1, backgroundColor: C.line }, style]} />;
}

export function Button(p: { label: string; onPress?: () => void; kind?: 'solid' | 'line' | 'up' | 'down' | 'quiet'; disabled?: boolean; small?: boolean; style?: StyleProp<ViewStyle>; testID?: string }) {
  const kind = p.kind ?? 'line';
  const bg = kind === 'solid' ? C.text : kind === 'up' ? C.up : kind === 'down' ? C.down : 'transparent';
  const fg = kind === 'solid' ? C.ink : kind === 'up' || kind === 'down' ? '#08130e' : C.text;
  return (
    <Pressable
      testID={p.testID}
      accessibilityRole="button"
      onPress={p.disabled ? undefined : p.onPress}
      hitSlop={6}
      style={({ pressed }) => [
        {
          backgroundColor: bg, borderWidth: kind === 'quiet' ? 0 : 1, borderColor: kind === 'line' ? C.lineStrong : bg,
          paddingHorizontal: p.small ? 12 : 18, minHeight: p.small ? 36 : 48, justifyContent: 'center', alignItems: 'center',
          borderRadius: 3, opacity: p.disabled ? 0.35 : pressed ? 0.7 : 1,
        },
        p.style,
      ]}
    >
      <Text style={{ color: fg, fontWeight: '700', fontSize: p.small ? 13 : 15, letterSpacing: 0.2 }}>{p.label}</Text>
    </Pressable>
  );
}

/** A row of mutually exclusive options. Selected one is filled; no rounded pills. */
export function Choice<T extends string | number>(p: { value: T; options: { v: T; label: string }[]; onChange: (v: T) => void; testID?: string }) {
  return (
    <View style={{ flexDirection: 'row', borderWidth: 1, borderColor: C.lineStrong, borderRadius: 3, overflow: 'hidden' }}>
      {p.options.map((o, i) => {
        const on = o.v === p.value;
        return (
          <Pressable
            key={String(o.v)}
            testID={p.testID ? `${p.testID}-${o.v}` : undefined}
            accessibilityRole="button"
            onPress={() => p.onChange(o.v)}
            style={{ flex: 1, minHeight: 44, alignItems: 'center', justifyContent: 'center', backgroundColor: on ? C.text : 'transparent', borderLeftWidth: i ? 1 : 0, borderLeftColor: C.lineStrong, paddingHorizontal: 6 }}
          >
            <Text style={{ color: on ? C.ink : C.mute, fontWeight: '700', fontSize: 14 }}>{o.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function Stepper(p: { label: string; value: number; min: number; max: number; step: number; unit?: string; decimals?: number; onChange: (v: number) => void; testID?: string }) {
  const d = p.decimals ?? 1;
  const bump = (dir: number) => p.onChange(Math.max(p.min, Math.min(p.max, Math.round((p.value + dir * p.step) * 100) / 100)));
  const btn = (t: string, dir: number, id: string) => (
    <Pressable testID={p.testID ? `${p.testID}-${id}` : undefined} accessibilityRole="button" accessibilityLabel={`${p.label} ${id}`} onPress={() => bump(dir)} hitSlop={6}
      style={({ pressed }) => ({ width: 44, height: 44, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: C.lineStrong, borderRadius: 3, opacity: pressed ? 0.6 : 1 })}>
      <Text style={{ color: C.text, fontSize: 22, lineHeight: 24 }}>{t}</Text>
    </Pressable>
  );
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
      <Text style={{ color: C.mute, fontSize: 14 }}>{p.label}</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        {btn('−', -1, 'minus')}
        <Num style={{ minWidth: 64, textAlign: 'center' }}>{p.value.toFixed(d)}{p.unit ?? ''}</Num>
        {btn('+', 1, 'plus')}
      </View>
    </View>
  );
}

export function Stat({ label, value, tone }: { label: string; value: string; tone?: 'up' | 'down' | 'amber' }) {
  const color = tone === 'up' ? C.up : tone === 'down' ? C.down : tone === 'amber' ? C.amber : C.text;
  return (
    <View style={{ flex: 1, minWidth: 70 }}>
      <Label>{label}</Label>
      <Num size={18} style={{ color, marginTop: 4 }}>{value}</Num>
    </View>
  );
}

export function Row({ children, gap = 10, style }: { children: React.ReactNode; gap?: number; style?: StyleProp<ViewStyle> }) {
  return <View style={[{ flexDirection: 'row', alignItems: 'center', gap }, style]}>{children}</View>;
}

/** Key facts as aligned left/right lines. */
export function Facts({ rows }: { rows: [string, string, ('up' | 'down' | 'amber')?][] }) {
  return (
    <View>
      {rows.map(([k, v, tone], i) => (
        <View key={i} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 7, borderTopWidth: i ? 1 : 0, borderTopColor: C.line }}>
          <Text style={{ color: C.mute, fontSize: 14 }}>{k}</Text>
          <Num style={{ color: tone === 'up' ? C.up : tone === 'down' ? C.down : tone === 'amber' ? C.amber : C.text }}>{v}</Num>
        </View>
      ))}
    </View>
  );
}
