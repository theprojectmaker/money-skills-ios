// Position sizing and risk maths shared by the order ticket, the calculators and the lesson checkers.
export const riskDollars = (equity: number, riskPct: number) => (equity * riskPct) / 100;

/** Shares to buy so that hitting the stop loses about riskPct of equity. */
export function positionSize(equity: number, riskPct: number, entry: number, stop: number): number {
  const per = Math.abs(entry - stop);
  if (!(per > 0) || !(equity > 0) || !(riskPct > 0)) return 0;
  return Math.floor(riskDollars(equity, riskPct) / per);
}

export function riskReward(entry: number, stop: number, target: number): number {
  const risk = Math.abs(entry - stop);
  return risk > 0 ? Math.abs(target - entry) / risk : 0;
}

/** Win rate you need just to break even at a given reward:risk ratio. */
export const breakEvenWinRate = (rr: number) => (rr >= 0 ? 1 / (1 + rr) : 1);

export function expectancyR(winRate: number, rr: number): number {
  return winRate * rr - (1 - winRate);
}

/** Dollars at risk if `qty` shares stop out at `stop` from `entry`. */
export const dollarsAtRisk = (qty: number, entry: number, stop: number) => qty * Math.abs(entry - stop);

export function fmtPrice(p: number): string {
  if (!Number.isFinite(p)) return '-';
  return p >= 100 ? p.toFixed(2) : p >= 1 ? p.toFixed(2) : p.toFixed(4);
}
