// A read-only candlestick chart. It has no gestures on purpose: nothing here can capture touches or flood the
// app with updates. Candles of one colour are drawn as a single path each, so a redraw is a handful of nodes.
import React, { useMemo, useState } from 'react';
import { LayoutChangeEvent, View } from 'react-native';
import Svg, { Circle, G, Line, Path, Rect, Text as SText } from 'react-native-svg';
import type { Bar } from '../engine/gen';
import { sma } from '../engine/gen';
import { C, mono } from './theme';

export type ChartLine = { price: number; color: string; label?: string; dash?: boolean };
export type ChartMark = { i: number; price: number; color: string; text?: string };

export type ChartProps = {
  bars: Bar[];
  count: number; // how many bars from the start are shown
  slots: number; // horizontal room, in bars
  first?: number; // index of the first shown bar (default 0)
  lines?: ChartLine[];
  marks?: ChartMark[];
  divider?: number; // draw a vertical rule before this bar index
  average?: number; // moving average period to overlay
  volume?: boolean;
  minHeight?: number;
};

const AXIS = 58;
const f2 = (x: number) => x.toFixed(2);

function niceStep(range: number): number {
  const raw = range / 5;
  if (!(raw > 0) || !Number.isFinite(raw)) return 0;
  const mag = Math.pow(10, Math.floor(Math.log10(raw)));
  const f = raw / mag;
  return (f < 1.5 ? 1 : f < 3 ? 2 : f < 7 ? 5 : 10) * mag;
}

export default function Chart(p: ChartProps) {
  const [size, setSize] = useState({ w: 640, h: 360 });
  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    const w = Math.floor(width), h = Math.floor(height);
    if (w > 0 && h > 0 && (w !== size.w || h !== size.h)) setSize({ w, h });
  };
  const { w, h } = size;
  const plotW = Math.max(40, w - AXIS);
  const first = p.first ?? 0;
  const last = Math.min(p.count, p.bars.length) - 1;
  const shown = Math.max(0, last - first + 1);
  const slot = plotW / Math.max(1, p.slots);
  const volH = p.volume ? Math.round(h * 0.14) : 0;
  const plotH = h - volH - 6;

  const avg = useMemo(() => (p.average ? sma(p.bars, p.average, p.count) : null), [p.bars, p.average, p.count]);

  const scene = useMemo(() => {
    if (shown <= 0) return null;
    let lo = Infinity, hi = -Infinity, vmax = 1;
    for (let i = first; i <= last; i++) {
      const b = p.bars[i];
      if (b.l < lo) lo = b.l;
      if (b.h > hi) hi = b.h;
      if (b.v > vmax) vmax = b.v;
    }
    for (const l of p.lines ?? []) { if (l.price < lo) lo = l.price; if (l.price > hi) hi = l.price; }
    const pad = Math.max((hi - lo) * 0.07, 0.01);
    lo -= pad; hi += pad;
    const span = hi - lo || 1;
    const y = (v: number) => 4 + ((hi - v) / span) * (plotH - 4);
    const x = (i: number) => (i - first) * slot + slot / 2;
    const bw = Math.max(1, slot * 0.62);
    let wickU = '', wickD = '', bodyU = '', bodyD = '', volU = '', volD = '';
    for (let i = first; i <= last; i++) {
      const b = p.bars[i];
      const cx = x(i);
      const up = b.c >= b.o;
      const top = y(Math.max(b.o, b.c)), bot = Math.max(y(Math.min(b.o, b.c)), top + 1);
      const wick = `M${cx.toFixed(1)} ${y(b.h).toFixed(1)}V${y(b.l).toFixed(1)}`;
      const body = `M${(cx - bw / 2).toFixed(1)} ${top.toFixed(1)}h${bw.toFixed(1)}V${bot.toFixed(1)}h${(-bw).toFixed(1)}Z`;
      if (up) { wickU += wick; bodyU += body; } else { wickD += wick; bodyD += body; }
      if (volH) {
        const vh = Math.max(1, (b.v / vmax) * (volH - 4));
        const r = `M${(cx - bw / 2).toFixed(1)} ${h - 2}v${(-vh).toFixed(1)}h${bw.toFixed(1)}v${vh.toFixed(1)}Z`;
        if (up) volU += r; else volD += r;
      }
    }
    const grid: { y: number; label: string }[] = [];
    const step = niceStep(span);
    if (step > 0) {
      const start = Math.ceil(lo / step) * step;
      for (let k = 0; k < 10; k++) {
        const v = start + k * step;
        if (v > hi) break;
        grid.push({ y: y(v), label: f2(v) });
      }
    }
    let avgPath = '';
    if (avg) {
      let pen = false;
      for (let i = first; i <= last; i++) {
        const v = avg[i];
        if (v === null || v === undefined) { pen = false; continue; }
        avgPath += (pen ? 'L' : 'M') + x(i).toFixed(1) + ' ' + y(v).toFixed(1);
        pen = true;
      }
    }
    return { y, x, grid, wickU, wickD, bodyU, bodyD, volU, volD, avgPath };
  }, [p.bars, p.lines, first, last, shown, slot, plotH, volH, avg, h]);

  const lastBar = shown > 0 ? p.bars[last] : null;

  return (
    <View style={{ flex: 1, minHeight: p.minHeight, backgroundColor: C.bg }} onLayout={onLayout}>
      {scene && lastBar ? (
        <Svg width={w} height={h} style={{ position: 'absolute', left: 0, top: 0 }}>
          {scene.grid.map((g, k) => (
            <G key={k}>
              <Line x1={0} x2={plotW} y1={g.y} y2={g.y} stroke={C.line} strokeWidth={1} />
              <SText x={plotW + 6} y={g.y + 4} fill={C.faint} fontSize={10} fontFamily={mono}>{g.label}</SText>
            </G>
          ))}
          <Line x1={plotW} x2={plotW} y1={0} y2={h} stroke={C.line} />
          {p.divider !== undefined && p.divider > first && (
            <Line x1={(p.divider - first) * slot} x2={(p.divider - first) * slot} y1={0} y2={h} stroke={C.lineStrong} strokeDasharray="3 4" />
          )}
          {volH > 0 && <><Path d={scene.volU} fill={C.up} opacity={0.35} /><Path d={scene.volD} fill={C.down} opacity={0.35} /></>}
          {scene.avgPath ? <Path d={scene.avgPath} stroke={C.amber} strokeWidth={1.4} fill="none" /> : null}
          <Path d={scene.wickU} stroke={C.up} strokeWidth={1} fill="none" />
          <Path d={scene.wickD} stroke={C.down} strokeWidth={1} fill="none" />
          <Path d={scene.bodyU} fill={C.up} />
          <Path d={scene.bodyD} fill={C.down} />
          {(p.lines ?? []).map((l, k) => {
            const yy = scene.y(l.price);
            return (
              <G key={'l' + k}>
                <Line x1={0} x2={plotW} y1={yy} y2={yy} stroke={l.color} strokeWidth={1.3} strokeDasharray={l.dash === false ? undefined : '6 4'} />
                {l.label ? (
                  <>
                    <Rect x={plotW} y={yy - 8} width={AXIS} height={16} fill={l.color} />
                    <SText x={plotW + 4} y={yy + 4} fill={C.ink} fontSize={10} fontWeight="bold" fontFamily={mono}>{l.label}</SText>
                  </>
                ) : null}
              </G>
            );
          })}
          {(p.marks ?? []).filter((m) => m.i >= first && m.i <= last).map((m, k) => (
            <G key={'m' + k}>
              <Circle cx={scene.x(m.i)} cy={scene.y(m.price)} r={5} fill="none" stroke={m.color} strokeWidth={2} />
              {m.text ? <SText x={Math.min(plotW - 60, scene.x(m.i) + 9)} y={scene.y(m.price) - 8} fill={m.color} fontSize={11} fontWeight="bold">{m.text}</SText> : null}
            </G>
          ))}
          <G>
            <Line x1={0} x2={plotW} y1={scene.y(lastBar.c)} y2={scene.y(lastBar.c)} stroke={lastBar.c >= lastBar.o ? C.up : C.down} strokeDasharray="2 3" opacity={0.7} />
            <Rect x={plotW} y={scene.y(lastBar.c) - 8} width={AXIS} height={16} fill={C.text} />
            <SText x={plotW + 4} y={scene.y(lastBar.c) + 4} fill={C.ink} fontSize={10} fontWeight="bold" fontFamily={mono}>{f2(lastBar.c)}</SText>
          </G>
        </Svg>
      ) : null}
    </View>
  );
}
