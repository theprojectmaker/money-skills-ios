// Offline calculators. Pure functions: the Tools screen and the lesson "calc" steps both use these definitions.
// Everything here is educational arithmetic with the numbers the learner types in. It is not a forecast.
import { positionSize, riskReward, breakEvenWinRate, dollarsAtRisk } from '../engine/risk';

export type CalcField = { key: string; label: string; unit?: '$' | '%' | 'yrs' | 'mo' | 'hrs' | 'x' | ''; min: number; max: number; step: number; def: number; hint?: string };
export type CalcRow = { label: string; value: string; strong?: boolean; tone?: 'good' | 'bad' | 'warn' };
export type CalcResult = { rows: CalcRow[]; out: Record<string, number>; series?: number[]; seriesLabel?: string; note?: string };
export type CalcDef = { id: CalcId; title: string; blurb: string; fields: CalcField[]; compute: (v: Record<string, number>) => CalcResult };
export type CalcId = 'compound' | 'loan' | 'budget' | 'position' | 'rr' | 'tax' | 'freelance' | 'pricing' | 'goal' | 'inflation';

export const usd = (x: number, dp = 0) =>
  (x < 0 ? '-' : '') + '$' + Math.abs(x).toLocaleString('en-US', { minimumFractionDigits: dp, maximumFractionDigits: dp });
const pct = (x: number, dp = 1) => x.toFixed(dp) + '%';

/** Future value with monthly contributions and monthly compounding. */
export function compoundGrowth(principal: number, monthly: number, ratePct: number, years: number) {
  const r = ratePct / 100 / 12;
  const n = Math.round(years * 12);
  let bal = principal;
  const series: number[] = [bal];
  for (let i = 1; i <= n; i++) {
    bal = bal * (1 + r) + monthly;
    if (i % 12 === 0) series.push(bal);
  }
  const contributed = principal + monthly * n;
  return { final: bal, contributed, interest: bal - contributed, series };
}

/** Months to pay off a loan with a fixed payment; Infinity if the payment never beats the interest. */
export function loanPayoff(balance: number, aprPct: number, payment: number) {
  const r = aprPct / 100 / 12;
  if (balance <= 0) return { months: 0, totalInterest: 0, totalPaid: 0, never: false };
  if (payment <= balance * r + 1e-9) return { months: Infinity, totalInterest: Infinity, totalPaid: Infinity, never: true };
  let bal = balance, months = 0, paid = 0;
  while (bal > 0.005 && months < 1200) {
    const interest = bal * r;
    const pay = Math.min(payment, bal + interest);
    bal = bal + interest - pay;
    paid += pay;
    months++;
  }
  return { months, totalInterest: paid - balance, totalPaid: paid, never: false };
}

/** Simplified, ROUNDED tax brackets for teaching only (single filer, standard deduction). Not real tax advice. */
const TOY_BRACKETS: [number, number][] = [[11000, 0.1], [45000, 0.12], [95000, 0.22], [190000, 0.24], [Infinity, 0.32]];
export function toyTax(gross: number, deduction = 14000) {
  const taxable = Math.max(0, gross - deduction);
  let tax = 0, prev = 0, marginal = 0;
  for (const [cap, rate] of TOY_BRACKETS) {
    if (taxable > prev) { tax += (Math.min(taxable, cap) - prev) * rate; marginal = rate; }
    prev = cap;
  }
  return { taxable, tax, marginal, effective: gross > 0 ? tax / gross : 0 };
}

export const CALCS: CalcDef[] = [
  {
    id: 'compound', title: 'Compound interest', blurb: 'See how steady saving and time grow money. Rates here are YOUR assumption, not a promise.',
    fields: [
      { key: 'principal', label: 'Starting amount', unit: '$', min: 0, max: 100000, step: 100, def: 1000 },
      { key: 'monthly', label: 'Add every month', unit: '$', min: 0, max: 5000, step: 25, def: 200 },
      { key: 'rate', label: 'Yearly growth rate (assumed)', unit: '%', min: 0, max: 15, step: 0.5, def: 6 },
      { key: 'years', label: 'Years', unit: 'yrs', min: 1, max: 50, step: 1, def: 20 },
    ],
    compute: (v) => {
      const g = compoundGrowth(v.principal, v.monthly, v.rate, v.years);
      return {
        rows: [
          { label: 'You put in', value: usd(g.contributed) },
          { label: 'Growth earned', value: usd(g.interest), tone: 'good' },
          { label: 'Balance at the end', value: usd(g.final), strong: true },
        ],
        out: { final: g.final, contributed: g.contributed, interest: g.interest, growthShare: g.final > 0 ? g.interest / g.final : 0 },
        series: g.series, seriesLabel: 'Balance by year',
        note: 'Real returns vary and can be negative in any year. This only shows the arithmetic.',
      };
    },
  },
  {
    id: 'loan', title: 'Debt payoff', blurb: 'How long a debt lasts at a given payment, and what the interest costs.',
    fields: [
      { key: 'balance', label: 'Balance owed', unit: '$', min: 100, max: 50000, step: 100, def: 3000 },
      { key: 'apr', label: 'Interest rate (APR)', unit: '%', min: 0, max: 36, step: 0.5, def: 22 },
      { key: 'payment', label: 'Monthly payment', unit: '$', min: 10, max: 2000, step: 5, def: 90 },
    ],
    compute: (v) => {
      const p = loanPayoff(v.balance, v.apr, v.payment);
      if (p.never) {
        return { rows: [{ label: 'Result', value: 'Never paid off', strong: true, tone: 'bad' }, { label: 'Why', value: 'The payment is smaller than the monthly interest', tone: 'bad' }], out: { months: Infinity, years: Infinity, totalInterest: Infinity, totalPaid: Infinity, never: 1 } };
      }
      return {
        rows: [
          { label: 'Time to pay off', value: `${p.months} months (${(p.months / 12).toFixed(1)} yrs)`, strong: true },
          { label: 'Total interest', value: usd(p.totalInterest), tone: 'bad' },
          { label: 'Total you pay', value: usd(p.totalPaid) },
        ],
        out: { months: p.months, years: p.months / 12, totalInterest: p.totalInterest, totalPaid: p.totalPaid, never: 0 },
      };
    },
  },
  {
    id: 'budget', title: 'Budget planner', blurb: 'Split one month of take-home pay into needs, wants and saving. A common starting guide is 50 / 30 / 20.',
    fields: [
      { key: 'income', label: 'Monthly take-home pay', unit: '$', min: 0, max: 20000, step: 50, def: 3200 },
      { key: 'needs', label: 'Needs (rent, food, bills, transport)', unit: '$', min: 0, max: 15000, step: 25, def: 1700 },
      { key: 'wants', label: 'Wants (fun, eating out, subscriptions)', unit: '$', min: 0, max: 10000, step: 25, def: 900 },
    ],
    compute: (v) => {
      const save = v.income - v.needs - v.wants;
      const rate = v.income > 0 ? (save / v.income) * 100 : 0;
      return {
        rows: [
          { label: 'Left to save', value: usd(save), strong: true, tone: save < 0 ? 'bad' : 'good' },
          { label: 'Saving rate', value: pct(rate), tone: rate >= 20 ? 'good' : rate >= 10 ? 'warn' : 'bad' },
          { label: 'Needs / wants share', value: `${v.income > 0 ? Math.round((v.needs / v.income) * 100) : 0}% / ${v.income > 0 ? Math.round((v.wants / v.income) * 100) : 0}%` },
          { label: 'Months to build a $1,000 cushion', value: save > 0 ? (1000 / save).toFixed(1) : 'never at this rate' },
        ],
        out: { save, rate, needsPct: v.income > 0 ? (v.needs / v.income) * 100 : 0, wantsPct: v.income > 0 ? (v.wants / v.income) * 100 : 0 },
      };
    },
  },
  {
    id: 'position', title: 'Position size', blurb: 'How many shares to buy so a stop-out costs only a set percent of your account.',
    fields: [
      { key: 'equity', label: 'Account size', unit: '$', min: 1000, max: 1000000, step: 1000, def: 100000 },
      { key: 'riskPct', label: 'Risk per trade', unit: '%', min: 0.1, max: 5, step: 0.1, def: 1 },
      { key: 'entry', label: 'Entry price', unit: '$', min: 1, max: 1000, step: 0.5, def: 50 },
      { key: 'stop', label: 'Stop-loss price', unit: '$', min: 1, max: 1000, step: 0.5, def: 48 },
    ],
    compute: (v) => {
      const qty = positionSize(v.equity, v.riskPct, v.entry, v.stop);
      const risk = dollarsAtRisk(qty, v.entry, v.stop);
      return {
        rows: [
          { label: 'Shares to buy', value: String(qty), strong: true },
          { label: 'Dollars at risk', value: usd(risk, 2), tone: 'warn' },
          { label: 'Position value', value: usd(qty * v.entry) },
          { label: 'Share of account', value: pct(v.equity > 0 ? ((qty * v.entry) / v.equity) * 100 : 0) },
        ],
        out: { qty, risk, value: qty * v.entry, share: v.equity > 0 ? (qty * v.entry) / v.equity : 0 },
      };
    },
  },
  {
    id: 'rr', title: 'Reward : risk', blurb: 'Compare what you could win with what you could lose, and the win rate you need to break even.',
    fields: [
      { key: 'entry', label: 'Entry price', unit: '$', min: 1, max: 1000, step: 0.5, def: 50 },
      { key: 'stop', label: 'Stop-loss price', unit: '$', min: 1, max: 1000, step: 0.5, def: 48 },
      { key: 'target', label: 'Target price', unit: '$', min: 1, max: 1000, step: 0.5, def: 56 },
    ],
    compute: (v) => {
      const rr = riskReward(v.entry, v.stop, v.target);
      const be = breakEvenWinRate(rr) * 100;
      return {
        rows: [
          { label: 'Reward : risk', value: `${rr.toFixed(2)} : 1`, strong: true, tone: rr >= 2 ? 'good' : rr >= 1 ? 'warn' : 'bad' },
          { label: 'Win rate needed to break even', value: pct(be) },
        ],
        out: { rr, breakEven: be },
      };
    },
  },
  {
    id: 'tax', title: 'Tax estimator (teaching version)', blurb: 'A rounded, simplified bracket model so you can see marginal versus effective tax. Real rules differ: check official sources.',
    fields: [{ key: 'gross', label: 'Yearly income before tax', unit: '$', min: 0, max: 300000, step: 1000, def: 52000 }],
    compute: (v) => {
      const t = toyTax(v.gross);
      return {
        rows: [
          { label: 'Taxable income (after a flat $14,000 deduction)', value: usd(t.taxable) },
          { label: 'Estimated tax', value: usd(t.tax) },
          { label: 'Effective rate (tax / income)', value: pct(t.effective * 100), strong: true },
          { label: 'Marginal rate (tax on the next dollar)', value: pct(t.marginal * 100) },
          { label: 'Left after this tax', value: usd(v.gross - t.tax) },
        ],
        out: { tax: t.tax, effective: t.effective * 100, marginal: t.marginal * 100, taxable: t.taxable, net: v.gross - t.tax },
        note: 'Teaching model with rounded brackets. It leaves out payroll tax, state tax and credits.',
      };
    },
  },
  {
    id: 'freelance', title: 'Freelance hourly rate', blurb: 'Work backwards from the income you want to the hourly rate you must charge.',
    fields: [
      { key: 'target', label: 'Take-home income you want per year', unit: '$', min: 10000, max: 200000, step: 1000, def: 48000 },
      { key: 'expenses', label: 'Business costs per year', unit: '$', min: 0, max: 50000, step: 100, def: 3000 },
      { key: 'taxPct', label: 'Set aside for taxes', unit: '%', min: 0, max: 45, step: 1, def: 25 },
      { key: 'hours', label: 'Billable hours per week', unit: 'hrs', min: 5, max: 50, step: 1, def: 20 },
      { key: 'weeksOff', label: 'Weeks off per year', unit: '', min: 0, max: 20, step: 1, def: 4 },
    ],
    compute: (v) => {
      const pretax = v.target / (1 - v.taxPct / 100) + v.expenses;
      const hours = v.hours * (52 - v.weeksOff);
      const rate = hours > 0 ? pretax / hours : 0;
      return {
        rows: [
          { label: 'Revenue you need', value: usd(pretax) },
          { label: 'Billable hours per year', value: String(Math.round(hours)) },
          { label: 'Minimum hourly rate', value: usd(rate, 2), strong: true },
        ],
        out: { revenue: pretax, hours, rate },
        note: 'Not every working hour can be billed. Selling, emailing and admin are unpaid, which is why billable hours are lower than hours worked.',
      };
    },
  },
  {
    id: 'pricing', title: 'Price and profit', blurb: 'Set a price from your costs and the margin you want, then see your break-even.',
    fields: [
      { key: 'cost', label: 'Cost to make one item', unit: '$', min: 0.5, max: 500, step: 0.5, def: 6 },
      { key: 'margin', label: 'Profit margin you want', unit: '%', min: 5, max: 90, step: 1, def: 50 },
      { key: 'fixed', label: 'Fixed costs per month', unit: '$', min: 0, max: 5000, step: 10, def: 200 },
      { key: 'units', label: 'Items you sell per month', unit: '', min: 1, max: 2000, step: 5, def: 120 },
    ],
    compute: (v) => {
      const price = v.cost / (1 - v.margin / 100);
      const unitProfit = price - v.cost;
      const be = unitProfit > 0 ? Math.ceil(v.fixed / unitProfit) : Infinity;
      const profit = unitProfit * v.units - v.fixed;
      return {
        rows: [
          { label: 'Price to charge', value: usd(price, 2), strong: true },
          { label: 'Profit per item (before fixed costs)', value: usd(unitProfit, 2) },
          { label: 'Break-even items per month', value: Number.isFinite(be) ? String(be) : 'n/a' },
          { label: 'Monthly profit at your sales', value: usd(profit), tone: profit >= 0 ? 'good' : 'bad' },
        ],
        out: { price, unitProfit, breakEven: be, profit },
      };
    },
  },
  {
    id: 'goal', title: 'Savings goal', blurb: 'Find the monthly amount that reaches a goal by a date, at a growth rate you choose.',
    fields: [
      { key: 'goal', label: 'Goal amount', unit: '$', min: 100, max: 500000, step: 100, def: 5000 },
      { key: 'years', label: 'Years to get there', unit: 'yrs', min: 0.5, max: 40, step: 0.5, def: 3 },
      { key: 'rate', label: 'Yearly growth rate (assumed)', unit: '%', min: 0, max: 12, step: 0.5, def: 4 },
    ],
    compute: (v) => {
      const r = v.rate / 100 / 12;
      const n = Math.round(v.years * 12);
      const monthly = r === 0 ? v.goal / n : (v.goal * r) / (Math.pow(1 + r, n) - 1);
      return {
        rows: [
          { label: 'Save each month', value: usd(monthly, 2), strong: true },
          { label: 'Total you put in', value: usd(monthly * n) },
          { label: 'Growth covers', value: usd(v.goal - monthly * n) },
        ],
        out: { monthly, contributed: monthly * n, n },
      };
    },
  },
  {
    id: 'inflation', title: 'Inflation and the rule of 72', blurb: 'Prices tend to creep up, so cash loses buying power. The rule of 72 estimates how long doubling takes.',
    fields: [
      { key: 'amount', label: 'Cash today', unit: '$', min: 100, max: 100000, step: 100, def: 10000 },
      { key: 'years', label: 'Years', unit: 'yrs', min: 1, max: 40, step: 1, def: 20 },
      { key: 'inflation', label: 'Yearly price rise (assumed)', unit: '%', min: 0, max: 12, step: 0.5, def: 3 },
    ],
    compute: (v) => {
      const buying = v.amount / Math.pow(1 + v.inflation / 100, v.years);
      return {
        rows: [
          { label: 'What that cash buys, in today\'s dollars', value: usd(buying), strong: true, tone: 'warn' },
          { label: 'Lost buying power', value: usd(v.amount - buying), tone: 'bad' },
          { label: 'Years for prices to double (72 / rate)', value: v.inflation > 0 ? (72 / v.inflation).toFixed(1) : 'never' },
        ],
        out: { buying, lost: v.amount - buying, doubling: v.inflation > 0 ? 72 / v.inflation : Infinity },
      };
    },
  },
];

export const CALC_BY_ID: Record<string, CalcDef> = Object.fromEntries(CALCS.map((c) => [c.id, c]));
export const defaults = (c: CalcDef): Record<string, number> => Object.fromEntries(c.fields.map((f) => [f.key, f.def]));
/** Inputs plus derived outputs, the object lesson `done` functions look at. */
export function evaluate(id: CalcId, values: Record<string, number>): Record<string, number> {
  const c = CALC_BY_ID[id];
  const v = { ...defaults(c), ...values };
  return { ...v, ...c.compute(v).out };
}
