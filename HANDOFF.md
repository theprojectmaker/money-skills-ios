# Money Skills: handoff (2026-11-04, rebuilt from scratch)

The first version froze on a real iPad (chart gestures + a global store re-rendering everything). This is a ground-up rewrite
with no gestures, no Modal, and state kept local to each screen.

- Predict (src/app/index.tsx): chart stops at day 70, user buys / shorts / stays out with an ATR stop and reward:risk, then 40 bars play out
  at normal / fast / skip speed; result in R, recap and a lesson link. Seven scenario kinds, textbook outcome ~65% (src/engine/scenarios.ts).
- Trade (src/app/trade.tsx): endless simulated stock (5 tickers), play/pause/step, risk-based sizing, stop/target, session review.
- Learn (src/content/lessons.ts): 10 lessons, real chart examples, 3-question checks with explanations.
- Tools: position size, expectancy, compound growth, debt payoff.
- Engine: src/engine (gen, scenarios, broker, live). `npm test` runs 7 tests; `npm run typecheck`.

Not verified on a device. Web-tested only (Predict round, Trade at 15 bars/s with ~16 ms max lag, lesson + quiz, tools, portrait layout).
Removed from v1: indicator panel, drawing tools, replay sandbox, life-skills courses (still in git history before commit "Rebuild").
