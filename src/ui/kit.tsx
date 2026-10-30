import React, { useEffect, useState } from 'react';
import { Modal, Platform, Pressable, ScrollView, StyleProp, Text, TextInput, View, ViewStyle } from 'react-native';
import { C, R } from './theme';

export const mono = Platform.OS === 'web' ? 'Menlo, Consolas, ui-monospace, monospace' : Platform.OS === 'ios' ? 'Menlo' : 'monospace';

export function Btn(p: {
  label: string; onPress?: () => void; kind?: 'primary' | 'ghost' | 'up' | 'down' | 'warn' | 'plain'; small?: boolean; disabled?: boolean; style?: StyleProp<ViewStyle>; flex?: boolean; testID?: string;
}) {
  const kind = p.kind ?? 'plain';
  const bg = kind === 'primary' ? C.accent : kind === 'up' ? C.up : kind === 'down' ? C.down : kind === 'warn' ? C.warn : kind === 'ghost' ? 'transparent' : C.panel;
  const fg = kind === 'warn' ? '#000' : kind === 'plain' || kind === 'ghost' ? C.text : '#fff';
  return (
    <Pressable
      testID={p.testID}
      accessibilityRole="button"
      accessibilityLabel={p.label}
      onPress={p.disabled ? undefined : p.onPress}
      style={({ pressed }) => [
        {
          backgroundColor: bg, borderRadius: R.md, paddingHorizontal: p.small ? 10 : 16, paddingVertical: p.small ? 6 : 11, minHeight: p.small ? 32 : 42,
          justifyContent: 'center', alignItems: 'center', opacity: p.disabled ? 0.4 : pressed ? 0.75 : 1,
          borderWidth: kind === 'plain' || kind === 'ghost' ? 1 : 0, borderColor: C.border2,
        },
        p.flex ? { flex: 1 } : null,
        p.style,
      ]}
    >
      <Text style={{ color: fg, fontWeight: '700', fontSize: p.small ? 12 : 14 }}>{p.label}</Text>
    </Pressable>
  );
}

export function Seg<T extends string | number>(p: { value: T; options: { v: T; label: string; color?: string }[]; onChange: (v: T) => void; small?: boolean; testID?: string }) {
  return (
    <View style={{ flexDirection: 'row', backgroundColor: C.panel2, borderRadius: R.md, borderWidth: 1, borderColor: C.border, overflow: 'hidden' }}>
      {p.options.map((o) => {
        const on = o.v === p.value;
        return (
          <Pressable
            key={String(o.v)}
            testID={p.testID ? `${p.testID}-${o.v}` : undefined}
            onPress={() => p.onChange(o.v)}
            style={{ paddingHorizontal: p.small ? 9 : 12, paddingVertical: p.small ? 6 : 9, minHeight: p.small ? 32 : 40, justifyContent: 'center', backgroundColor: on ? o.color ?? C.active : 'transparent' }}
          >
            <Text style={{ color: on ? '#fff' : C.muted, fontWeight: '700', fontSize: p.small ? 12 : 13 }}>{o.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function Card(p: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[{ backgroundColor: C.panel, borderRadius: R.lg, borderWidth: 1, borderColor: C.border, padding: 16 }, p.style]}>{p.children}</View>;
}

export function Label({ children, style }: { children: React.ReactNode; style?: any }) {
  return <Text style={[{ color: C.muted, fontSize: 11, fontWeight: '700', letterSpacing: 0.4, textTransform: 'uppercase' }, style]}>{children}</Text>;
}

export function Chip({ text, color }: { text: string; color?: string }) {
  return (
    <View style={{ backgroundColor: (color ?? C.accent) + '33', borderRadius: 999, paddingHorizontal: 9, paddingVertical: 3 }}>
      <Text style={{ color: color ?? C.accent2, fontSize: 11, fontWeight: '700' }}>{text}</Text>
    </View>
  );
}

/** A number box that keeps what you typed (like "1.") while handing the parsed number up. */
export function NumField(p: {
  value: number | undefined; onChange: (v: number | undefined) => void; label?: string; prefix?: string; suffix?: string; placeholder?: string; width?: number; testID?: string; onFocus?: () => void; right?: React.ReactNode;
}) {
  const [text, setText] = useState(p.value === undefined ? '' : String(p.value));
  useEffect(() => {
    const parsed = text === '' ? undefined : parseFloat(text);
    if (parsed !== p.value && !(Number.isNaN(parsed) && p.value === undefined)) setText(p.value === undefined ? '' : String(p.value));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [p.value]);
  return (
    <View style={{ width: p.width }}>
      {p.label ? <Label style={{ marginBottom: 4 }}>{p.label}</Label> : null}
      <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: C.bg, borderRadius: R.md, borderWidth: 1, borderColor: C.border2, paddingHorizontal: 10, minHeight: 40 }}>
        {p.prefix ? <Text style={{ color: C.muted, marginRight: 4 }}>{p.prefix}</Text> : null}
        <TextInput
          testID={p.testID}
          value={text}
          onFocus={p.onFocus}
          placeholder={p.placeholder}
          placeholderTextColor={C.muted}
          keyboardType="decimal-pad"
          onChangeText={(t) => {
            const clean = t.replace(/[^0-9.]/g, '');
            setText(clean);
            const v = clean === '' ? undefined : parseFloat(clean);
            p.onChange(v === undefined || Number.isNaN(v) ? undefined : v);
          }}
          style={{ flex: 1, color: C.strong, fontFamily: mono, fontSize: 15, paddingVertical: 8, ...(Platform.OS === 'web' ? ({ outlineStyle: 'none' } as any) : {}) }}
        />
        {p.suffix ? <Text style={{ color: C.muted, marginLeft: 4 }}>{p.suffix}</Text> : null}
        {p.right}
      </View>
    </View>
  );
}

export function Sheet(p: { visible: boolean; onClose: () => void; title: string; children: React.ReactNode; width?: number; testID?: string }) {
  // backdrop and card are siblings (not nested Pressables) so taps inside the card are never swallowed on iOS
  return (
    <Modal visible={p.visible} transparent animationType="fade" onRequestClose={p.onClose} supportedOrientations={['portrait', 'landscape']}>
      <View style={{ flex: 1, backgroundColor: C.scrim, alignItems: 'center', justifyContent: 'center', padding: 20 }}>
        <Pressable onPress={p.onClose} style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }} accessibilityLabel="Dismiss" />
        <View
          testID={p.testID}
          style={{ width: '100%', maxWidth: p.width ?? 560, maxHeight: '88%', backgroundColor: C.panel, borderRadius: 12, borderWidth: 1, borderColor: C.border2, overflow: 'hidden' }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 14, borderBottomWidth: 1, borderBottomColor: C.border }}>
            <Text style={{ color: C.strong, fontSize: 16, fontWeight: '800' }}>{p.title}</Text>
            <Pressable onPress={p.onClose} hitSlop={12} accessibilityLabel="Close"><Text style={{ color: C.muted, fontSize: 20 }}>✕</Text></Pressable>
          </View>
          <ScrollView contentContainerStyle={{ padding: 14 }} keyboardShouldPersistTaps="handled">{p.children}</ScrollView>
        </View>
      </View>
    </Modal>
  );
}

export function Row({ children, gap = 8, style }: { children: React.ReactNode; gap?: number; style?: StyleProp<ViewStyle> }) {
  return <View style={[{ flexDirection: 'row', alignItems: 'center', gap }, style]}>{children}</View>;
}

export function ProgressBar({ pct, color = C.accent }: { pct: number; color?: string }) {
  return (
    <View style={{ height: 6, borderRadius: 3, backgroundColor: C.border, overflow: 'hidden' }}>
      <View style={{ width: `${Math.max(0, Math.min(100, pct * 100))}%`, height: 6, backgroundColor: color }} />
    </View>
  );
}

// Renders lesson blocks: paragraphs with bold, italic and code marks, lists, callout boxes and tables.
import type { Block } from '../content/types';
function Inline({ text, style }: { text: string; style?: any }) {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g).filter(Boolean);
  return (
    <Text style={[{ color: C.text, fontSize: 15, lineHeight: 23 }, style]}>
      {parts.map((s, i) =>
        s.startsWith('**') ? <Text key={i} style={{ fontWeight: '800', color: C.strong }}>{s.slice(2, -2)}</Text>
        : s.startsWith('`') ? <Text key={i} style={{ fontFamily: mono, backgroundColor: C.panel2, color: C.strong }}>{s.slice(1, -1)}</Text>
        : s.startsWith('*') ? <Text key={i} style={{ fontStyle: 'italic' }}>{s.slice(1, -1)}</Text>
        : s)}
    </Text>
  );
}
const callout = (icon: string, color: string, text: string, key: number) => (
  <View key={key} style={{ borderLeftWidth: 3, borderLeftColor: color, backgroundColor: color + '22', padding: 10, borderRadius: 6, marginVertical: 4 }}>
    <Inline text={`${icon} ${text}`} />
  </View>
);
export function Blocks({ blocks, size }: { blocks: Block[]; size?: number }) {
  return (
    <View style={{ gap: 9 }}>
      {blocks.map((b, i) => {
        if (typeof b === 'string') return <Inline key={i} text={b} style={size ? { fontSize: size, lineHeight: size * 1.5 } : undefined} />;
        if ('list' in b) return <View key={i} style={{ gap: 5 }}>{b.list.map((x, k) => <View key={k} style={{ flexDirection: 'row', gap: 8 }}><Text style={{ color: C.accent2 }}>•</Text><View style={{ flex: 1 }}><Inline text={x} /></View></View>)}</View>;
        if ('steps' in b) return <View key={i} style={{ gap: 5 }}>{b.steps.map((x, k) => <View key={k} style={{ flexDirection: 'row', gap: 8 }}><Text style={{ color: C.accent2, fontWeight: '800', width: 18 }}>{k + 1}.</Text><View style={{ flex: 1 }}><Inline text={x} /></View></View>)}</View>;
        if ('tip' in b) return callout('💡', C.up, b.tip, i);
        if ('warn' in b) return callout('⚠️', C.down, b.warn, i);
        if ('example' in b) return callout('🔢', C.accent2, b.example, i);
        if ('rule' in b) return callout('⭐', C.warn, b.rule, i);
        if ('table' in b)
          return (
            <View key={i} style={{ borderWidth: 1, borderColor: C.border2, borderRadius: 6, overflow: 'hidden' }}>
              <View style={{ flexDirection: 'row', backgroundColor: C.panel2 }}>
                {b.table.head.map((h, k) => <Text key={k} style={{ flex: 1, color: C.strong, fontWeight: '800', padding: 8, fontSize: 13 }}>{h}</Text>)}
              </View>
              {b.table.rows.map((r, ri) => (
                <View key={ri} style={{ flexDirection: 'row', borderTopWidth: 1, borderTopColor: C.border }}>
                  {r.map((c, k) => <Text key={k} style={{ flex: 1, color: C.text, padding: 8, fontSize: 13 }}>{c}</Text>)}
                </View>
              ))}
            </View>
          );
        return null;
      })}
    </View>
  );
}
