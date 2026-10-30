// The price chart, drawn with react-native-svg. Only the visible window of bars is rendered, and the candles of one
// colour are batched into single paths, so panning thousands of bars stays smooth. Touch, Apple Pencil and mouse
// all arrive as responder events: drag to pan, pinch (or wheel) to zoom, tools draw, a tap can pick an order price.
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { PanResponder, Platform, Pressable, Text, View, LayoutChangeEvent } from 'react-native';
import Svg, { Circle, G, Line, Path, Rect, Text as SText } from 'react-native-svg';
import { C } from './theme';
import { Bars, fmtAxis, fmtClock, fmtDate } from '../engine/series';
import { Computed, INDICATORS, IndicatorId } from '../engine/indicators';
import type { Drawing } from '../content/types';
import type { ChartType, PickField, Tool, View as ViewState } from '../store';
import type { Order, Position } from '../engine/account';
import { fmtPrice } from '../engine/risk';

const AXIS_W = 62;
const TIME_H = 22;
const RIGHT_PAD = 6; // empty bars to the right of the newest bar
const MIN_SPAN = 12;

export type ChartProps = {
  bars: Bars;
  comp: Computed;
  indicators: IndicatorId[];
  chartType: ChartType;
  view: ViewState;
  onView: (v: Partial<ViewState>) => void;
  drawings: Drawing[];
  selected: number | null;
  tool: Tool;
  pick: PickField;
  positions: Position[];
  orders: Order[];
  levelsToShow?: { support: number[]; resistance: number[] } | null;
  onSelect: (id: number | null) => void;
  onDraw: (d: Omit<Drawing, 'id'>) => void;
  onPickPrice: (price: number) => void;
  onCancelOrder: (id: number) => void;
  onEvent: (name: string) => void;
};

const niceStep = (range: number, target: number) => {
  const raw = range / Math.max(2, target);
  const p = Math.pow(10, Math.floor(Math.log10(raw)));
  const f = raw / p;
  return (f < 1.5 ? 1 : f < 3 ? 2 : f < 7 ? 5 : 10) * p;
};

function segPath(xs: number[], ys: Float64Array | number[], from: number, to: number, mapY: (v: number) => number): string {
  let d = '';
  let pen = false;
  for (let i = from; i <= to; i++) {
    const v = ys[i];
    if (Number.isNaN(v)) { pen = false; continue; }
    d += (pen ? 'L' : 'M') + xs[i - from].toFixed(1) + ',' + mapY(v).toFixed(1);
    pen = true;
  }
  return d;
}

export default function Chart(p: ChartProps) {
  const [size, setSize] = useState({ w: 800, h: 480 });
  const [cross, setCross] = useState<{ x: number; y: number } | null>(null);
  const [draft, setDraft] = useState<null | { t1: number; p1: number; t2?: number; p2?: number }>(null);
  const props = useRef(p);
  props.current = p;
  const sizeRef = useRef(size);
  sizeRef.current = size;
  const rootRef = useRef<View>(null);
  // pan/pinch live in the chart until the finger lifts, so the whole terminal is not re-rendered on every touch event
  const [live, setLiveState] = useState<ViewState | null>(null);
  const liveRef = useRef<ViewState | null>(null);
  const setLive = (v: ViewState | null) => { liveRef.current = v; setLiveState(v); };
  const curView = () => liveRef.current ?? props.current.view;
  const view = live ?? p.view;

  const { bars } = p;
  const n = bars.n;
  const subIds = p.indicators.filter((id) => INDICATORS.find((x) => x.id === id)?.pane === 'sub');
  const plotW = Math.max(50, size.w - AXIS_W);
  const subH = subIds.length ? Math.min(92, Math.floor((size.h * 0.46) / subIds.length)) : 0;
  const mainH = Math.max(80, size.h - TIME_H - subH * subIds.length);

  const span = Math.max(MIN_SPAN, Math.min(view.span, Math.max(MIN_SPAN, n + RIGHT_PAD)));
  const barW = plotW / span;
  const R = n - 1 - view.offset + RIGHT_PAD; // right edge (bar units)
  const L = R - span;
  const i0 = Math.max(0, Math.floor(L));
  const i1 = Math.min(n - 1, Math.ceil(R));
  const xOf = (i: number) => (i - L) * barW + barW / 2;

  // price range of what is on screen
  const { pMin, pMax } = useMemo(() => {
    let lo = Infinity, hi = -Infinity;
    for (let i = i0; i <= i1; i++) {
      if (bars.l[i] < lo) lo = bars.l[i];
      if (bars.h[i] > hi) hi = bars.h[i];
    }
    if (!Number.isFinite(lo)) { lo = 0; hi = 1; }
    const pad = Math.max((hi - lo) * 0.08, hi * 0.0005);
    return { pMin: lo - pad, pMax: hi + pad };
  }, [bars, i0, i1]);
  const yOf = (price: number) => ((pMax - price) / (pMax - pMin)) * mainH;
  const priceAt = (y: number) => pMax - (y / mainH) * (pMax - pMin);

  // time <-> index (with extrapolation past either end)
  const spacing = n > 1 ? (bars.t[n - 1] - bars.t[Math.max(0, n - 20)]) / Math.max(1, Math.min(19, n - 1)) || 60000 : 60000;
  const idxOfTime = (t: number) => {
    if (n === 0) return 0;
    if (t >= bars.t[n - 1]) return n - 1 + (t - bars.t[n - 1]) / spacing;
    if (t <= bars.t[0]) return (t - bars.t[0]) / spacing;
    let lo = 0, hi = n - 1;
    while (hi - lo > 1) { const mid = (lo + hi) >> 1; if (bars.t[mid] <= t) lo = mid; else hi = mid; }
    return lo + (t - bars.t[lo]) / (bars.t[hi] - bars.t[lo]);
  };
  const timeOfIdx = (i: number) => {
    if (i >= n - 1) return bars.t[n - 1] + (i - (n - 1)) * spacing;
    if (i <= 0) return bars.t[0] + i * spacing;
    const lo = Math.floor(i);
    return bars.t[lo] + (i - lo) * (bars.t[lo + 1] - bars.t[lo]);
  };
  const idxAtX = (x: number) => (x - barW / 2) / barW + L;

  // ---- gestures -------------------------------------------------------------------------------------------
  const g = useRef({ startView: p.view, startX: 0, startY: 0, moved: false, t0: 0, pinch: 0, pinchSpan: 0, drawing: false, last: { x: 0, y: 0 }, evZoom: false, evPan: false } as any);
  const mapPoint = (x: number, y: number) => {
    const pr = props.current;
    const sz = sizeRef.current;
    const pw = Math.max(50, sz.w - AXIS_W);
    const bw = pw / Math.max(MIN_SPAN, Math.min(curView().span, Math.max(MIN_SPAN, pr.bars.n + RIGHT_PAD)));
    return { x, y, bw };
  };
  const snapPrice = (xpx: number, ypx: number, rawPrice: number): number => {
    const pr = props.current;
    const i = Math.round(idxAtXRef(xpx));
    if (i < 0 || i >= pr.bars.n) return rawPrice;
    const cands = [pr.bars.o[i], pr.bars.h[i], pr.bars.l[i], pr.bars.c[i]];
    const best = cands.reduce((a, b) => (Math.abs(b - rawPrice) < Math.abs(a - rawPrice) ? b : a));
    return Math.abs(yOfRef(best) - ypx) < 12 ? best : rawPrice;
  };
  // refs to the latest mapping functions for the (once-created) responder
  const mapRef = useRef({ idxAtX, yOf, priceAt, timeOfIdx, mainH, plotW, barW, xOf, idxOfTime });
  mapRef.current = { idxAtX, yOf, priceAt, timeOfIdx, mainH, plotW, barW, xOf, idxOfTime };
  const idxAtXRef = (x: number) => mapRef.current.idxAtX(x);
  const yOfRef = (v: number) => mapRef.current.yOf(v);

  const pointAt = (x: number, y: number) => {
    const m = mapRef.current;
    const raw = m.priceAt(Math.max(0, Math.min(m.mainH, y)));
    const price = props.current.tool !== 'cursor' && props.current.tool !== 'cross' ? snapPrice(x, y, raw) : raw;
    return { t: m.timeOfIdx(m.idxAtX(x)), price };
  };

  const hitDrawing = (x: number, y: number): number | null => {
    const pr = props.current;
    const m = mapRef.current;
    let best: number | null = null, bestD = 14;
    for (const d of pr.drawings) {
      const x1 = m.xOf(m.idxOfTime(d.t1)), y1 = m.yOf(d.p1);
      const x2 = d.t2 !== undefined ? m.xOf(m.idxOfTime(d.t2)) : x1;
      const y2 = d.p2 !== undefined ? m.yOf(d.p2) : y1;
      let dist = 1e9;
      if (d.tool === 'hline') dist = Math.abs(y - y1);
      else if (d.tool === 'trend') {
        const dx = x2 - x1, dy = y2 - y1, len2 = dx * dx + dy * dy || 1;
        const t = Math.max(0, Math.min(1, ((x - x1) * dx + (y - y1) * dy) / len2));
        dist = Math.hypot(x - (x1 + t * dx), y - (y1 + t * dy));
      } else if (d.tool === 'rect') {
        const inside = x >= Math.min(x1, x2) && x <= Math.max(x1, x2) && y >= Math.min(y1, y2) && y <= Math.max(y1, y2);
        const edge = Math.min(Math.abs(x - x1), Math.abs(x - x2), Math.abs(y - y1), Math.abs(y - y2));
        dist = inside ? Math.min(edge, 10) : edge + 4;
      } else if (d.tool === 'fib') {
        const lvls = [0, 0.236, 0.382, 0.5, 0.618, 0.786, 1];
        for (const l of lvls) dist = Math.min(dist, Math.abs(y - m.yOf(d.p1 + (d.p2! - d.p1) * l)));
        if (x < Math.min(x1, x2) - 10) dist = 1e9;
      }
      if (dist < bestD) { bestD = dist; best = d.id; }
    }
    return best;
  };

  const responder = useMemo(() =>
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: (e) => {
        const pr = props.current;
        const ne = e.nativeEvent;
        const x = ne.locationX, y = ne.locationY;
        g.current = { startView: curView(), startX: x, startY: y, moved: false, t0: Date.now(), pinch: 0, pinchSpan: curView().span, drawing: false, last: { x, y }, evZoom: false, evPan: false } as any;
        const drawingTool = pr.tool === 'trend' || pr.tool === 'fib' || pr.tool === 'rect' || pr.tool === 'hline';
        if (drawingTool) {
          const pt = pointAt(x, y);
          if (pr.tool === 'hline') return;
          setDraftRef.current((d) => (d && d.t2 === undefined && d.t1 !== undefined ? d : { t1: pt.t, p1: pt.price }));
          g.current.drawing = true;
        }
        if (pr.tool === 'cross') setCross({ x, y });
      },
      onPanResponderMove: (e, gs) => {
        const pr = props.current;
        const ne = e.nativeEvent;
        const touches = (ne as any).touches as { locationX: number; locationY: number }[] | undefined;
        const st = g.current;
        if (touches && touches.length >= 2) {
          const dist = Math.hypot(touches[0].locationX - touches[1].locationX, touches[0].locationY - touches[1].locationY);
          if (!st.pinch) { st.pinch = dist; st.pinchSpan = curView().span; }
          else {
            const ns = Math.max(MIN_SPAN, Math.min(1500, Math.round(st.pinchSpan * (st.pinch / Math.max(20, dist)))));
            if (ns !== curView().span) { setLive({ ...curView(), span: ns }); if (!st.evZoom) { st.evZoom = true; pr.onEvent('zoom'); } }
          }
          st.moved = true;
          return;
        }
        const x = ne.locationX, y = ne.locationY;
        st.last = { x, y };
        if (Math.hypot(gs.dx, gs.dy) > 6) st.moved = true;
        if (pr.tool === 'cross') { setCross({ x, y }); pr.onEvent('crosshair'); return; }
        if (st.drawing) {
          const pt = pointAt(x, y);
          setDraftRef.current((d) => (d ? { ...d, t2: pt.t, p2: pt.price } : d));
          return;
        }
        // pan
        const bw = mapRef.current.barW;
        const shift = (gs.dx / bw) | 0;
        const maxBack = Math.max(0, props.current.bars.n - 10);
        const off = Math.max(-RIGHT_PAD + 1, Math.min(maxBack, st.startView.offset + shift));
        if (off !== curView().offset) { setLive({ ...curView(), offset: off }); if (!st.evPan) { st.evPan = true; pr.onEvent('pan'); } }
      },
      onPanResponderRelease: (e, gs) => {
        const pr = props.current;
        commitLive();
        const st = g.current;
        const ne = e.nativeEvent;
        const x = ne.locationX ?? st.last.x, y = ne.locationY ?? st.last.y;
        const isTap = !st.moved && Date.now() - st.t0 < 450;
        if (pr.tool === 'cross') { return; }
        if (pr.tool === 'hline') {
          if (isTap) { const pt = pointAt(x, y); pr.onDraw({ tool: 'hline', t1: pt.t, p1: pt.price }); }
          return;
        }
        if (st.drawing) {
          const d = draftRef.current;
          if (d && d.t2 !== undefined && st.moved) {
            pr.onDraw({ tool: pr.tool as 'trend' | 'fib' | 'rect', t1: d.t1, p1: d.p1, t2: d.t2, p2: d.p2 });
            setDraftRef.current(() => null);
          } else if (d && isTap) {
            // two-tap drawing: the first tap stored the start point, wait for the second tap
            if (d.t2 === undefined) {
              const pt = pointAt(x, y);
              if (Math.hypot(x - mapRef.current.xOf(mapRef.current.idxOfTime(d.t1)), y - mapRef.current.yOf(d.p1)) > 14) {
                pr.onDraw({ tool: pr.tool as 'trend' | 'fib' | 'rect', t1: d.t1, p1: d.p1, t2: pt.t, p2: pt.price });
                setDraftRef.current(() => null);
              }
            }
          }
          void gs;
          return;
        }
        if (isTap) {
          if (pr.pick) { pr.onPickPrice(pointAt(x, y).price); return; }
          const hit = hitDrawing(x, y);
          pr.onSelect(hit);
          if (hit === null) setCross(null);
        }
      },
      onPanResponderTerminate: () => { commitLive(); },
    }),
  // eslint-disable-next-line react-hooks/exhaustive-deps
  []);

  const commitLive = () => { const v = liveRef.current; if (v) { setLive(null); props.current.onView(v); } };

  // keep the draft setter/ref reachable from the once-created responder
  const draftRef = useRef(draft);
  draftRef.current = draft;
  const setDraftRef = useRef(setDraft);
  setDraftRef.current = (f: any) => setDraft((d) => { const v = typeof f === 'function' ? f(d) : f; draftRef.current = v; return v; });
  useEffect(() => { if (p.tool === 'cursor' || p.tool === 'cross' || p.tool === 'hline') setDraft(null); }, [p.tool]);

  // wheel zoom + hover crosshair on the web
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const el = (rootRef.current as any) as HTMLElement | null;
    if (!el || !el.addEventListener) return;
    const wheel = (ev: WheelEvent) => {
      ev.preventDefault();
      const pr = props.current;
      if (Math.abs(ev.deltaX) > Math.abs(ev.deltaY) || ev.shiftKey) {
        const shift = Math.round((ev.deltaX || ev.deltaY) / Math.max(4, mapRef.current.barW));
        pr.onView({ offset: Math.max(-RIGHT_PAD + 1, Math.min(Math.max(0, pr.bars.n - 10), pr.view.offset + shift)) });
        pr.onEvent('pan');
      } else {
        const f = ev.deltaY > 0 ? 1.12 : 1 / 1.12;
        pr.onView({ span: Math.max(MIN_SPAN, Math.min(1500, Math.round(pr.view.span * f))) });
        pr.onEvent('zoom');
      }
    };
    const move = (ev: MouseEvent) => {
      if (ev.buttons) return;
      const r = el.getBoundingClientRect();
      setCross({ x: ev.clientX - r.left, y: ev.clientY - r.top });
    };
    const leave = () => { if (props.current.tool !== 'cross') setCross(null); };
    el.addEventListener('wheel', wheel, { passive: false });
    el.addEventListener('mousemove', move);
    el.addEventListener('mouseleave', leave);
    return () => { el.removeEventListener('wheel', wheel); el.removeEventListener('mousemove', move); el.removeEventListener('mouseleave', leave); };
  }, []);

  // ---- drawing the picture -------------------------------------------------------------------------------------
  const xs: number[] = [];
  for (let i = i0; i <= i1; i++) xs.push(xOf(i));
  const up = p.chartType === 'candles' || p.chartType === 'bars';
  let wickU = '', wickD = '', bodyU = '', bodyD = '', line = '';
  const bw = Math.max(0.6, barW * 0.36);
  if (n > 0) {
    for (let i = i0; i <= i1; i++) {
      const x = xs[i - i0];
      const o = bars.o[i], h = bars.h[i], l = bars.l[i], c = bars.c[i];
      if (p.chartType === 'candles') {
        const yo = yOf(o), yc = yOf(c);
        const top = Math.min(yo, yc), bot = Math.max(yo, yc, top + 1);
        const wick = `M${x.toFixed(1)},${yOf(h).toFixed(1)}V${yOf(l).toFixed(1)}`;
        const body = `M${(x - bw).toFixed(1)},${top.toFixed(1)}H${(x + bw).toFixed(1)}V${bot.toFixed(1)}H${(x - bw).toFixed(1)}Z`;
        if (c >= o) { wickU += wick; bodyU += body; } else { wickD += wick; bodyD += body; }
      } else if (p.chartType === 'bars') {
        const s = `M${x.toFixed(1)},${yOf(h).toFixed(1)}V${yOf(l).toFixed(1)}M${(x - bw).toFixed(1)},${yOf(o).toFixed(1)}H${x.toFixed(1)}M${x.toFixed(1)},${yOf(c).toFixed(1)}H${(x + bw).toFixed(1)}`;
        if (c >= o) wickU += s; else wickD += s;
      }
    }
    if (p.chartType === 'line' || p.chartType === 'area') line = segPath(xs, bars.c, i0, i1, yOf);
  }
  const areaPath = line && i1 >= i0 ? `${line}L${xs[xs.length - 1].toFixed(1)},${mainH}L${xs[0].toFixed(1)},${mainH}Z` : '';

  // grid
  const step = niceStep(pMax - pMin, mainH / 55);
  const gridPrices: number[] = [];
  for (let v = Math.ceil(pMin / step) * step; v < pMax; v += step) gridPrices.push(v);
  const timeTicks: { x: number; label: string }[] = [];
  {
    const every = Math.max(1, Math.round(100 / barW));
    let prevDay = -1;
    for (let i = Math.ceil(i0 / every) * every; i <= i1; i += every) {
      const intraday = bars.tf !== '1D' && bars.tf !== '1W';
      const newDay = bars.day[i] !== prevDay;
      timeTicks.push({ x: xOf(i), label: intraday && newDay && prevDay !== -1 ? fmtAxis(bars.t[i], '1D') : fmtAxis(bars.t[i], bars.tf) });
      prevDay = bars.day[i];
    }
  }

  const lastC = n ? bars.c[n - 1] : 0;
  const lastUp = n ? bars.c[n - 1] >= bars.o[n - 1] : true;
  const lastY = yOf(lastC);

  const ov = (arr: Float64Array | undefined, color: string, w = 1.4) =>
    arr ? <Path d={segPath(xs, arr, i0, i1, yOf)} stroke={color} strokeWidth={w} fill="none" /> : null;

  // sub panes
  const subPanes = subIds.map((id, k) => {
    const top = mainH + k * subH;
    const inner = subH - 6;
    const Y = (v: number, lo: number, hi: number) => top + 3 + inner - ((v - lo) / (hi - lo || 1)) * inner;
    const label = INDICATORS.find((x) => x.id === id)!.label;
    let content: React.ReactNode = null;
    let rightLabel = '';
    if (id === 'vol') {
      let mx = 1;
      for (let i = i0; i <= i1; i++) mx = Math.max(mx, bars.v[i]);
      let dU = '', dD = '';
      for (let i = i0; i <= i1; i++) {
        const x = xs[i - i0], y = Y(bars.v[i], 0, mx);
        const r = `M${(x - bw).toFixed(1)},${(top + subH - 3).toFixed(1)}V${y.toFixed(1)}H${(x + bw).toFixed(1)}V${(top + subH - 3).toFixed(1)}Z`;
        if (bars.c[i] >= bars.o[i]) dU += r; else dD += r;
      }
      content = <><Path d={dU} fill={C.up} opacity={0.55} /><Path d={dD} fill={C.down} opacity={0.55} /></>;
      rightLabel = mx >= 1e6 ? (mx / 1e6).toFixed(1) + 'M' : mx >= 1e3 ? (mx / 1e3).toFixed(0) + 'K' : String(Math.round(mx));
    } else if (id === 'rsi' && p.comp.rsi) {
      const f = (v: number) => Y(v, 0, 100);
      content = (
        <>
          <Line x1={0} x2={plotW} y1={f(70)} y2={f(70)} stroke={C.border2} strokeDasharray="3 3" />
          <Line x1={0} x2={plotW} y1={f(30)} y2={f(30)} stroke={C.border2} strokeDasharray="3 3" />
          <Path d={segPath(xs, p.comp.rsi, i0, i1, f)} stroke="#a78bfa" strokeWidth={1.4} fill="none" />
        </>
      );
      const lv = p.comp.rsi[Math.min(n - 1, i1)];
      rightLabel = Number.isNaN(lv) ? '' : lv.toFixed(1);
    } else if (id === 'macd' && p.comp.macd) {
      const m = p.comp.macd;
      let lo = Infinity, hi = -Infinity;
      for (let i = i0; i <= i1; i++) for (const v of [m.line[i], m.signal[i], m.hist[i]]) if (!Number.isNaN(v)) { lo = Math.min(lo, v); hi = Math.max(hi, v); }
      if (!Number.isFinite(lo)) { lo = -1; hi = 1; }
      const ext = Math.max(Math.abs(lo), Math.abs(hi), 1e-9);
      const f = (v: number) => Y(v, -ext, ext);
      let hU = '', hD = '';
      for (let i = i0; i <= i1; i++) {
        const v = m.hist[i];
        if (Number.isNaN(v)) continue;
        const x = xs[i - i0];
        const r = `M${(x - bw).toFixed(1)},${f(0).toFixed(1)}V${f(v).toFixed(1)}H${(x + bw).toFixed(1)}V${f(0).toFixed(1)}Z`;
        if (v >= 0) hU += r; else hD += r;
      }
      content = (
        <>
          <Line x1={0} x2={plotW} y1={f(0)} y2={f(0)} stroke={C.border2} />
          <Path d={hU} fill={C.up} opacity={0.6} /><Path d={hD} fill={C.down} opacity={0.6} />
          <Path d={segPath(xs, m.line, i0, i1, f)} stroke="#2962ff" strokeWidth={1.3} fill="none" />
          <Path d={segPath(xs, m.signal, i0, i1, f)} stroke="#ff9800" strokeWidth={1.3} fill="none" />
        </>
      );
      const lv = m.hist[Math.min(n - 1, i1)];
      rightLabel = Number.isNaN(lv) ? '' : lv.toFixed(3);
    }
    return (
      <G key={id}>
        <Rect x={0} y={top} width={plotW} height={subH} fill="none" stroke={C.border} />
        {content}
        <SText x={6} y={top + 12} fill={C.chartText} fontSize={10}>{label}</SText>
        <SText x={plotW + 6} y={top + 12} fill={C.chartText} fontSize={10}>{rightLabel}</SText>
      </G>
    );
  });

  // drawings
  const shapes: React.ReactNode[] = [];
  const allDrawings = draft && draft.t2 !== undefined ? [...p.drawings, { id: -1, tool: p.tool as any, t1: draft.t1, p1: draft.p1, t2: draft.t2, p2: draft.p2 } as Drawing] : p.drawings;
  for (const d of allDrawings) {
    const x1 = xOf(idxOfTime(d.t1)), y1 = yOf(d.p1);
    const x2 = d.t2 !== undefined ? xOf(idxOfTime(d.t2)) : x1;
    const y2 = d.p2 !== undefined ? yOf(d.p2) : y1;
    const sel = d.id === p.selected;
    const col = sel ? '#ffffff' : '#f5a623';
    if (d.tool === 'hline') {
      shapes.push(<G key={d.id}><Line x1={0} x2={plotW} y1={y1} y2={y1} stroke={col} strokeWidth={sel ? 2 : 1.4} /><Rect x={plotW - 2} y={y1 - 8} width={AXIS_W + 2} height={16} fill={C.warn} /><SText x={plotW + 4} y={y1 + 4} fill="#000" fontSize={10}>{fmtPrice(d.p1)}</SText></G>);
    } else if (d.tool === 'trend') {
      shapes.push(<G key={d.id}><Line x1={x1} y1={y1} x2={x2} y2={y2} stroke={col} strokeWidth={sel ? 2.5 : 1.6} />{sel && <><Circle cx={x1} cy={y1} r={5} fill={col} /><Circle cx={x2} cy={y2} r={5} fill={col} /></>}</G>);
    } else if (d.tool === 'rect') {
      shapes.push(<Rect key={d.id} x={Math.min(x1, x2)} y={Math.min(y1, y2)} width={Math.abs(x2 - x1)} height={Math.abs(y2 - y1)} fill="rgba(41,98,255,0.15)" stroke={sel ? '#fff' : C.accent2} strokeWidth={sel ? 2 : 1.2} />);
    } else if (d.tool === 'fib') {
      const lv = [0, 0.236, 0.382, 0.5, 0.618, 0.786, 1];
      const cols = ['#868892', '#ef5350', '#f5a623', '#26a69a', '#2962ff', '#9c27b0', '#868892'];
      const left = Math.min(x1, x2);
      shapes.push(
        <G key={d.id}>
          <Line x1={x1} y1={y1} x2={x2} y2={y2} stroke={C.muted} strokeDasharray="4 4" />
          {lv.map((l, k) => {
            const pr = d.p1 + (d.p2! - d.p1) * l;
            const yy = yOf(pr);
            return (
              <G key={l}>
                <Line x1={left} x2={plotW} y1={yy} y2={yy} stroke={cols[k]} strokeWidth={sel ? 1.8 : 1} />
                <SText x={left + 4} y={yy - 3} fill={cols[k]} fontSize={10}>{`${l} (${fmtPrice(pr)})`}</SText>
              </G>
            );
          })}
        </G>,
      );
    }
  }

  // crosshair
  let crossEl: React.ReactNode = null;
  let legend = '';
  if (cross && n > 0 && cross.x < plotW && cross.y < size.h - TIME_H) {
    const i = Math.max(0, Math.min(n - 1, Math.round(idxAtX(cross.x))));
    const cx = xOf(i);
    const inMain = cross.y <= mainH;
    const price = inMain ? priceAt(cross.y) : null;
    crossEl = (
      <G>
        <Line x1={cx} x2={cx} y1={0} y2={size.h - TIME_H} stroke={C.crosshair} strokeDasharray="4 4" />
        {inMain && <Line x1={0} x2={plotW} y1={cross.y} y2={cross.y} stroke={C.crosshair} strokeDasharray="4 4" />}
        {price !== null && <><Rect x={plotW} y={cross.y - 9} width={AXIS_W} height={18} fill={C.label} /><SText x={plotW + 4} y={cross.y + 4} fill="#fff" fontSize={11}>{fmtPrice(price)}</SText></>}
        <Rect x={Math.max(0, Math.min(plotW - 120, cx - 60))} y={size.h - TIME_H} width={120} height={TIME_H} fill={C.label} />
        <SText x={Math.max(0, Math.min(plotW - 120, cx - 60)) + 6} y={size.h - 7} fill="#fff" fontSize={11}>{`${fmtDate(bars.t[i]).slice(0, 6)} ${fmtClock(bars.t[i])}`}</SText>
      </G>
    );
    legend = `O ${fmtPrice(bars.o[i])}  H ${fmtPrice(bars.h[i])}  L ${fmtPrice(bars.l[i])}  C ${fmtPrice(bars.c[i])}  Vol ${Math.round(bars.v[i]).toLocaleString()}`;
  } else if (n > 0) {
    const i = n - 1;
    legend = `O ${fmtPrice(bars.o[i])}  H ${fmtPrice(bars.h[i])}  L ${fmtPrice(bars.l[i])}  C ${fmtPrice(bars.c[i])}`;
  }

  // lines for positions, orders and (lesson) levels
  const lines: { y: number; color: string; text: string; id?: number; dash?: boolean }[] = [];
  for (const pos of p.positions) {
    const pnl = (lastC - pos.avg) * pos.qty;
    lines.push({ y: yOf(pos.avg), color: pos.qty > 0 ? C.up : C.down, text: `${pos.qty > 0 ? 'LONG' : 'SHORT'} ${Math.abs(pos.qty)} @ ${fmtPrice(pos.avg)}  ${pnl >= 0 ? '+' : '-'}$${Math.abs(pnl).toFixed(0)}` });
  }
  for (const o of p.orders) {
    const price = o.stop ?? o.limit ?? 0;
    const tag = o.role === 'sl' ? 'STOP LOSS' : o.role === 'tp' ? 'TARGET' : o.type === 'stop' ? 'STOP' : o.type === 'stoplimit' ? 'STOP-LMT' : 'LIMIT';
    lines.push({ y: yOf(price), color: o.role === 'sl' ? C.down : o.role === 'tp' ? C.up : C.warn, text: `${tag} ${o.side.toUpperCase()} ${o.qty} @ ${fmtPrice(price)}`, id: o.id, dash: true });
  }
  const lineEls = lines.filter((l) => l.y > -10 && l.y < mainH + 10);

  return (
    <View
      ref={rootRef}
      style={{ flex: 1, backgroundColor: C.bg, overflow: 'hidden' }}
      onLayout={(e: LayoutChangeEvent) => setSize({ w: Math.floor(e.nativeEvent.layout.width), h: Math.floor(e.nativeEvent.layout.height) })}
    >
      <Svg width={size.w} height={size.h} style={{ position: 'absolute', left: 0, top: 0 }}>
        <Rect x={0} y={0} width={size.w} height={size.h} fill={C.bg} />
        {gridPrices.map((v) => (
          <G key={v}>
            <Line x1={0} x2={plotW} y1={yOf(v)} y2={yOf(v)} stroke={C.grid} />
            <SText x={plotW + 6} y={yOf(v) + 4} fill={C.chartText} fontSize={10}>{fmtPrice(v)}</SText>
          </G>
        ))}
        {timeTicks.map((t, k) => (
          <G key={k}>
            <Line x1={t.x} x2={t.x} y1={0} y2={mainH + subH * subIds.length} stroke={C.grid} />
            <SText x={t.x - 18} y={size.h - 7} fill={C.chartText} fontSize={10}>{t.label}</SText>
          </G>
        ))}
        <Line x1={plotW} x2={plotW} y1={0} y2={size.h} stroke={C.border} />
        <Line x1={0} x2={size.w} y1={size.h - TIME_H} y2={size.h - TIME_H} stroke={C.border} />

        {p.levelsToShow && p.levelsToShow.support.slice(0, 2).map((v) => <Line key={'s' + v} x1={0} x2={plotW} y1={yOf(v)} y2={yOf(v)} stroke={C.up} strokeDasharray="2 5" opacity={0.7} />)}
        {p.levelsToShow && p.levelsToShow.resistance.slice(0, 2).map((v) => <Line key={'r' + v} x1={0} x2={plotW} y1={yOf(v)} y2={yOf(v)} stroke={C.down} strokeDasharray="2 5" opacity={0.7} />)}

        {p.indicators.includes('bb') && p.comp.bb && (
          <>
            <Path d={segPath(xs, p.comp.bb.up, i0, i1, yOf)} stroke="#2962ff" strokeWidth={1} fill="none" />
            <Path d={segPath(xs, p.comp.bb.lo, i0, i1, yOf)} stroke="#2962ff" strokeWidth={1} fill="none" />
            <Path d={segPath(xs, p.comp.bb.mid, i0, i1, yOf)} stroke="#ff9800" strokeWidth={1} fill="none" />
          </>
        )}
        {ov(p.comp.sma20, '#f5a623')}
        {ov(p.comp.sma50, '#e91e63')}
        {ov(p.comp.ema9, '#00bcd4')}
        {ov(p.comp.ema21, '#9c27b0')}
        {ov(p.comp.vwap, '#ffeb3b', 1.6)}

        {p.chartType === 'area' && areaPath ? <Path d={areaPath} fill={C.accent} opacity={0.14} /> : null}
        {line ? <Path d={line} stroke={C.accent2} strokeWidth={1.8} fill="none" /> : null}
        {up && (
          <>
            <Path d={wickU} stroke={C.up} strokeWidth={1} fill="none" />
            <Path d={wickD} stroke={C.down} strokeWidth={1} fill="none" />
            {p.chartType === 'candles' && <Path d={bodyU} fill={C.up} />}
            {p.chartType === 'candles' && <Path d={bodyD} fill={C.down} />}
          </>
        )}

        {lineEls.map((l, k) => (
          <Line key={k} x1={0} x2={plotW} y1={l.y} y2={l.y} stroke={l.color} strokeWidth={1.3} strokeDasharray={l.dash ? '6 4' : undefined} />
        ))}
        {shapes}

        {n > 0 && (
          <G>
            <Line x1={0} x2={plotW} y1={lastY} y2={lastY} stroke={lastUp ? C.up : C.down} strokeDasharray="2 3" opacity={0.8} />
            <Rect x={plotW} y={lastY - 9} width={AXIS_W} height={18} fill={lastUp ? C.up : C.down} />
            <SText x={plotW + 4} y={lastY + 4} fill="#fff" fontSize={11} fontWeight="bold">{fmtPrice(lastC)}</SText>
          </G>
        )}
        {subPanes}
        {crossEl}
        {draft && draft.t2 === undefined && <Circle cx={xOf(idxOfTime(draft.t1))} cy={yOf(draft.p1)} r={5} fill={C.warn} />}
        {draft && draft.t2 !== undefined && p.tool === 'trend' && (
          <Line x1={xOf(idxOfTime(draft.t1))} y1={yOf(draft.p1)} x2={xOf(idxOfTime(draft.t2))} y2={yOf(draft.p2!)} stroke={C.warn} strokeWidth={1.6} />
        )}
      </Svg>

      <View pointerEvents="none" style={{ position: 'absolute', left: 8, top: 6, right: AXIS_W + 8 }}>
        <Text style={{ color: C.text, fontSize: 11, fontFamily: Platform.OS === 'web' ? 'Menlo, Consolas, monospace' : undefined }}>{legend}</Text>
        {p.pick ? <Text style={{ color: C.warn, fontSize: 12, marginTop: 4, fontWeight: '700' }}>Tap the chart to set the {p.pick === 'sl' ? 'stop-loss' : p.pick === 'tp' ? 'take-profit' : p.pick} price</Text> : null}
        {(p.tool === 'trend' || p.tool === 'fib' || p.tool === 'rect') && <Text style={{ color: C.warn, fontSize: 12, marginTop: 4 }}>Drag on the chart (or tap two points) to draw</Text>}
        {p.tool === 'hline' && <Text style={{ color: C.warn, fontSize: 12, marginTop: 4 }}>Tap the chart to place a horizontal line</Text>}
      </View>

      {/* gesture layer sits under the order chips so they stay tappable */}
      <View style={{ position: 'absolute', left: 0, top: 0, width: plotW, height: size.h - TIME_H }} {...responder.panHandlers} />

      {lineEls.map((l, k) => (
        <View key={'c' + k} pointerEvents="box-none" style={{ position: 'absolute', left: 8, top: Math.max(0, Math.min(mainH - 20, l.y - 10)), flexDirection: 'row' }}>
          <View style={{ backgroundColor: l.color, paddingHorizontal: 7, paddingVertical: 2, borderRadius: 3, flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ color: '#fff', fontSize: 11, fontWeight: '700' }}>{l.text}</Text>
            {l.id !== undefined && (
              <Pressable onPress={() => p.onCancelOrder(l.id!)} hitSlop={10} accessibilityLabel="Cancel order">
                <Text style={{ color: '#fff', fontSize: 13, marginLeft: 8, fontWeight: '800' }}>✕</Text>
              </Pressable>
            )}
          </View>
        </View>
      ))}
    </View>
  );
}
