# Money Skills: handoff (2026-11-05)

Trade and Predict are one WKWebView (src/terminal/Terminal.tsx) running the TradingView-style terminal from tests/paper-trader, with real stocks and the SIM market.
Lightweight Charts draws the chart, so pan, pinch, axis scaling, crosshair, drawings and draggable order lines all come from that terminal.

Edit the terminal in tests/paper-trader/app/src/js (Predict: predict.js, predict-model.js; native hides and bridge: native.js; `NATIVE` in hosting.js guards the rest), then run
`node tools/build-native.mjs` there. It regenerates src/terminal/page.js here. Check it with the `money-terminal` launch entry; `?coarse` fakes a touch screen and gives the iPad layout.

- Predict: 70 bars shown, 40 hidden. Buy, short or stay out (1% risk bracket, lines draggable), then run at 1x, 2x, 5x, 10x or Max using the replay engine and its separate account. Recap and record in store key predictStats.
- Trade: real stocks (default AAPL) plus 45 made-up stocks (SIM1..SIM5 and 40 TICKER.SIM across sectors, own "Sim market" watchlist; regenerate prices cache with paper-trader tools/build-sim-checkpoints.mjs), pretend money. Price requests go page -> native shell (src/terminal/relay.ts): Worker relay, Yahoo query1 and query2, CNBC, then Nasdaq (src/terminal/sources.ts, US stocks only; Nasdaq intraday is today only), last good route first and remembered; Tools > Connection shows what a network allows; nothing reachable = last saved chart marked stale, then the SIM market on first load.
- Learn is the terminal's whole course library in the same web view: Roadmap, Academy missions, courses, exams, XP (19 courses, 95 missions, 302 lessons, 8.6 MB page). Leaving the tab closes a lesson; progress stays. Tools stay native.
- Saved data lives in localStorage, mirrored to AsyncStorage (terminal:v1) and restored only if localStorage is empty.

Tests: `npm test` here; `node --test test/predict-model.test.mjs` in paper-trader/app.
Verified in a browser only (iPad-size, touch layout simulated): round played end to end, tab switching, real mouse drawing and panning, no network requests.
Not verified on a device: real pinch and finger gestures in WKWebView, localStorage persistence, the AsyncStorage restore. Only the bot panel, account sync and full-screen button are hidden. Lesson charts are real symbols (often BTC-USD) and fall back to SIM1 when no source is reachable.
- page.js is required lazily after the first render (big bundled data at module scope can crash a real device at launch).
