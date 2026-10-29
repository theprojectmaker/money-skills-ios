# Money Skills: handoff (2026-10-29)

Built: offline iPad-first Expo SDK 57 app. 29 unit tests pass (generator, indicators vs slow maths, broker, lesson checkers), `tsc` clean, `expo export --platform ios` bundles, content validator clean (10 courses, 37 lessons, 341 steps).
Browser-pane verified: terminal, order + stop pick on chart, hands-on lesson check (size to 1% risk), calc slider step, replay sandbox, portrait tablet layout, persistence across reload.

Not done / honest gaps
- Never run on a real iPad or in Expo Go (no device here). Pinch/Pencil use RN responder events; web wheel/mouse verified only.
- Chart: no dragging of existing drawings or order lines (tap to select/delete; tap-to-pick prices instead). 4 drawing tools only.
- Indicators fixed-parameter (SMA 20/50, EMA 9/21, Bollinger 20,2, RSI 14, MACD 12/26/9, VWAP, Volume).
- Trading course trading-1..10 hands-on steps are tested by unit tests with synthetic states, plus one lesson played by hand in the pane; the other nine were not clicked through end to end.
- Exam answer order shuffles at runtime; trading exam bank skews to option 0 in source only.
- Ship pipeline files exist (.github/workflows/ios-testflight.yml, eas.json) but need the steps in SHIP.md (eas init, credentials, repo, EXPO_TOKEN, first interactive submit). Nothing pushed, no repo created.
