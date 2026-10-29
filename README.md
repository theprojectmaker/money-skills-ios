# Money Skills (money-skills-native)

Offline, iPad-first Expo app (SDK 57, Expo Router, TypeScript, react-native-svg) that teaches day trading on a practice terminal
plus nine money/life-skill courses with quizzes and calculators. **Everything is simulated on the device; no network calls.**
Educational only, not financial advice.

- `src/engine`: seeded market generator (46 fictional tickers, regimes, gaps, earnings jumps), timeframes, indicators, practice broker (market/limit/stop/stop-limit, brackets, shorts, leverage), risk maths.
- `src/content`: courses (`trading.ts` plus `life/*.ts`), step types read/look/quiz/do/calc. `npm run validate` checks them.
- `src/ui`: Chart (svg, batched candles, pan/pinch/wheel), terminal panels, coach card, calculators.
- Persistence: AsyncStorage key `moneyskills:v1`.

```
npm install
npm test            # engine, broker, lesson checkers
npm run typecheck
npx expo start --go # or: npx expo start --web --port 8130
```

Ship: see SHIP.md.
