// The lesson format. Courses are plain TypeScript data (with small `done` functions), no imports besides types.
import type { Account, Order, Trade } from '../engine/account';
import type { Regime } from '../engine/generator';
import type { Tf } from '../engine/series';
import type { IndicatorId } from '../engine/indicators';
import type { CalcId } from '../calc/calcs';

/** One paragraph is a plain string. Inline **bold**, *italic* and `code` are rendered. */
export type Block =
  | string
  | { list: string[] }
  | { steps: string[] }
  | { tip: string }
  | { warn: string }
  | { example: string }
  | { rule: string }
  | { table: { head: string[]; rows: string[][] } };

/** Where a trading lesson starts: a fictional stock at a spot in the simulated year. */
export type Scenario = {
  symbol: string;
  tf: Tf;
  kind?: Regime | 'earnings'; // start inside a stretch like this (found by scanning the generated data)
  day?: number; // otherwise start on this trading day
  minute?: number; // minutes after the 9:30 open (default 150)
  balance?: number; // sandbox account size (default 100000)
  indicators?: IndicatorId[];
  leverage?: number;
};

export type Drawing = { id: number; tool: 'trend' | 'hline' | 'fib' | 'rect'; t1: number; p1: number; t2?: number; p2?: number };

export type Ticket = {
  side: 'buy' | 'sell';
  type: 'market' | 'limit' | 'stop' | 'stoplimit';
  qty: number;
  limit?: number;
  stop?: number;
  sl?: number;
  tp?: number;
  riskPct?: number;
};

/** What a hands-on step's `done(S, base)` may look at. Read only. `base` is S as it was when the step began. */
export type TermS = {
  symbol: string;
  tf: Tf;
  chartType: string;
  indicators: IndicatorId[];
  drawings: Drawing[];
  positions: { symbol: string; qty: number; avg: number }[];
  orders: Order[]; // open orders only
  trades: Trade[]; // closed trades
  ticket: Ticket;
  cursor: number;
  equity: number;
  cash: number;
  startBalance: number;
  last: number; // latest price of the shown symbol
  atr: number; // 14-bar ATR of the shown chart
  levels: { support: number[]; resistance: number[] }; // nearest first
  counts: Record<string, number>; // ordersPlaced, tfChanges, symbolChanges, drawingsCreated, barsStepped, crosshairUses, zooms, indicatorsAdded, journalNotes ...
  zoomSpan: number; // bars visible
  scrolledBack: boolean;
  watchlist: string[];
};

export type ReadStep = { type: 'read'; title: string; body: Block[] };
export type LookStep = { type: 'look'; title: string; body: Block[]; target?: string };
export type QuizStep = { type: 'quiz'; title: string; body?: Block[]; question: string; options: string[]; answer: number; explain: string };
/** Hands-on step on the live practice chart (trading courses only). Next unlocks when done() is true. */
export type DoStep = {
  type: 'do';
  title: string;
  body: Block[];
  task: string; // one imperative sentence in the "Your turn" bar
  done: (S: TermS, base: TermS) => boolean;
  hint?: string;
  success?: string;
  target?: string; // which control to pulse: 'tf' | 'symbol' | 'indicators' | 'tools' | 'ticket' | 'step' | 'chart' | 'positions' | 'orders' | 'journal'
  scenario?: Scenario; // switch the sandbox to this setup when the step begins
};
/** Interactive calculator step (works in every course). `out` = the inputs plus the results by key. */
export type CalcStep = {
  type: 'calc';
  title: string;
  body: Block[];
  calc: CalcId;
  preset?: Record<string, number>; // starting values for the sliders
  task: string;
  done: (out: Record<string, number>) => boolean;
  hint?: string;
  success?: string;
};
export type Step = ReadStep | LookStep | QuizStep | DoStep | CalcStep;

export type Lesson = {
  id: string; // kebab-case, prefixed by the course id, e.g. 'budget-1'
  title: string;
  minutes: number;
  summary: string;
  scenario?: Scenario; // trading lessons: starting setup
  steps: Step[];
};

export type ExamQ = { q: string; options: string[]; answer: number; explain: string };

export type Course = {
  id: string; // e.g. 'trading', 'budgeting'
  kind: 'trading' | 'life';
  title: string;
  icon: string; // one emoji
  color: string; // hex accent
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  summary: string;
  outcomes: string[]; // 4 to 6 bullets
  lessons: Lesson[];
  exam: { passPercent: number; questions: ExamQ[] };
};

export type SessionAccount = Account;
