// The day-trading course. Every hands-on step is checked against the live practice terminal (see TermS in types.ts).
// All prices are simulated and the companies are fictional. This is education, not financial advice.
import type { Block, Course, DoStep, ExamQ, Lesson, QuizStep, ReadStep, Scenario, TermS } from './types';

const R = (title: string, ...body: Block[]): ReadStep => ({ type: 'read', title, body });
const Q = (title: string, question: string, options: string[], answer: number, explain: string): QuizStep => ({ type: 'quiz', title, question, options, answer, explain });
const D = (title: string, body: Block[], task: string, done: DoStep['done'], hint: string, success: string, extra: Partial<DoStep> = {}): DoStep => ({ type: 'do', title, body, task, done, hint, success, ...extra });

const up = (k: string) => (S: TermS, b: TermS) => (S.counts[k] || 0) > (b.counts[k] || 0);
const supportOf = (S: TermS) => S.levels.support[0] ?? S.last - 2 * S.atr;
const resistOf = (S: TermS) => S.levels.resistance[0] ?? S.last + 2 * S.atr;
const pos = (S: TermS) => S.positions[0];
const stopOrder = (S: TermS) => S.orders.find((o) => o.type === 'stop' && o.side === (pos(S)?.qty < 0 ? 'buy' : 'sell'));
const targetOrder = (S: TermS) => S.orders.find((o) => o.type === 'limit' && o.reduceOnly !== false && o.role === 'tp');
const riskPctOf = (S: TermS) => {
  const p = pos(S), s = stopOrder(S);
  if (!p || !s || s.stop === undefined) return null;
  return (Math.abs(p.qty) * Math.abs(p.avg - s.stop)) / S.equity;
};

const sc = (symbol: string, tf: Scenario['tf'], extra: Partial<Scenario> = {}): Scenario => ({ symbol, tf, ...extra });

const L1: Lesson = {
  id: 'trading-1', title: 'Reading candles and the chart', minutes: 12, summary: 'What a candle is, how to read it, and how to move around the chart.',
  scenario: sc('NOVA', '5m', { kind: 'up', indicators: ['vol'] }),
  steps: [
    R('Welcome to your practice terminal',
      'Everything in this app is **simulated**. The companies are made up and the prices are generated on your device, so you can practice with $100,000 of pretend money and no risk.',
      { warn: 'This is education, not financial advice. Real trading can lose real money, and most beginners lose money. Never trade money you cannot afford to lose.' },
      'This lesson card floats over a live chart. Read a step, then do the small task and the **Next** button unlocks.'),
    R('What is a candle?',
      'Each candle shows what the price did during one slice of time. On the **5m** timeframe, one candle is 5 minutes.',
      { list: ['The **body** is the thick part: it runs from the open price to the close price.', 'The thin lines (**wicks**) show the highest and lowest prices reached.', 'A **green** candle closed higher than it opened. A **red** candle closed lower.'] },
      { example: 'A candle opens at $100, rises to $103, dips to $99.50 and closes at $102. It is green, the body spans $100 to $102, the top wick reaches $103 and the bottom wick reaches $99.50.' }),
    Q('Check: reading a candle', 'A candle has a long upper wick and a small body that closed near its low. What does that tell you?', ['Buyers pushed price up, but sellers pushed it back down before the close', 'The price never moved', 'Volume was zero'], 0,
      'A long upper wick means price rose a lot but could not hold the gains. Sellers won that fight by the close.'),
    D('Change the timeframe', ['The buttons at the top (**1m 5m 15m 30m 1h 1D 1W**) change how much time each candle covers.', 'Smaller timeframes show more detail and more noise. Bigger ones show the bigger picture.'], 'Tap a different timeframe in the top bar.', up('tfChanges'), 'The row of small buttons next to the price at the top of the screen.', 'Nice. You can look at the same market through different time lenses.', { target: 'tf' }),
    D('Use the crosshair', ['The crosshair tool (the **✛** in the left toolbar) lets you point at any candle and read its exact Open, High, Low and Close in the line at the top of the chart.'], 'Select the crosshair tool, then drag across the chart.', (S, b) => (S.counts.crosshairUses || 0) > (b.counts.crosshairUses || 0), 'Tap the ✛ button on the far left, then drag your finger or Apple Pencil over the candles.', 'You can now inspect any single candle precisely.', { target: 'tools' }),
    D('Zoom in or out', ['Pinch with two fingers to zoom (on a computer, use the scroll wheel). Zoom out to see the trend, zoom in to see single candles.'], 'Zoom the chart in or out.', up('zooms'), 'Pinch two fingers together or apart on the chart. The FIT button on the left resets it.', 'Good. Zoom is how you move between detail and the big picture.', { target: 'chart' }),
    D('Scroll through time', ['Drag the chart sideways (with the move tool selected) to look at earlier candles. The newest candle is at the right edge.'], 'Drag the chart to scroll back in time.', (S) => S.scrolledBack, 'Turn the crosshair off with the ↖ tool, then drag the chart to the right.', 'Yes. You can read history to learn how a market behaved.', { target: 'chart' }),
    D('Watch the market move', ['The clock below the price shows the simulated time. Press **Step bar** to finish the current candle and watch a new one form. Do it three times.'], 'Press Step bar 3 times.', (S, b) => (S.counts.barsStepped || 0) >= (b.counts.barsStepped || 0) + 3, 'The Step bar button is in the top bar on the right.', 'That is replay in a nutshell: the market unfolds one candle at a time.', { target: 'step' }),
    Q('Check: timeframes', 'You want to see the overall direction of the last few months. Which timeframe is the best start?', ['1m', '1D', 'Either, they show exactly the same thing'], 1, 'Daily candles squeeze many days into one screen. Minute candles would need thousands of bars to cover the same time.'),
    D('Switch the chart style', ['The next buttons change the chart style: candles, OHLC bars, line, area. Candles are the most common for traders.'], 'Choose a different chart style, then pick candles again if you like.', up('chartTypeChanges'), 'Look for the four small icons to the right of the timeframes.', 'Same data, different look. Use whatever helps you see clearly.', { target: 'tf' }),
    R('What you learned', { list: ['A candle summarizes open, high, low and close for one slice of time.', 'Green closes higher than it opened, red closes lower.', 'Wicks show rejected prices.', 'Timeframes, zoom, scroll and the crosshair are how you explore a chart.'] }, 'Next: support and resistance, the price levels that matter most.'),
  ],
};

const L2: Lesson = {
  id: 'trading-2', title: 'Support and resistance', minutes: 14, summary: 'Find price levels where the market keeps turning, and draw them.',
  scenario: sc('CLDY', '15m', { kind: 'range', indicators: ['vol'] }),
  steps: [
    R('Levels the market remembers',
      '**Support** is a price level where falling prices have repeatedly stopped and bounced. **Resistance** is a level where rising prices have repeatedly stalled.',
      'Why do they exist? Many traders remember the same prices and place orders there. Buyers wait near support. Sellers wait near resistance.',
      { rule: 'Levels are zones, not exact lines. Price often pokes through by a little before turning.' }),
    D('Draw your first horizontal line', ['Choose the **─** horizontal line tool, then tap the chart at a price where the market has bounced up at least twice. The chart already shows faint dotted guide lines at levels found in the data.'], 'Draw a horizontal line near a support or resistance level.',
      (S) => S.drawings.some((d) => d.tool === 'hline' && [...S.levels.support, ...S.levels.resistance].some((l) => Math.abs(d.p1 - l) <= Math.max(0.8 * S.atr, S.last * 0.003))),
      'Tap the ─ tool, then tap the chart right on one of the dotted green or red guide lines.', 'Your line sits on a level the market has respected.', { target: 'tools' }),
    Q('Check: what is support?', 'Price has bounced up from $50 three times. What is $50 most likely called?', ['Resistance', 'Support', 'A moving average'], 1, 'A floor that held several times is support. If it finally breaks, it often turns into resistance.'),
    R('Breakouts and role reversal',
      'When price closes decisively through a level, that is a **breakout**. Old support that breaks often becomes new resistance (and the other way around).',
      { warn: 'Many breakouts fail ("fakeouts"). Waiting for a close beyond the level, or for volume to rise, filters some of them, but nothing is certain.' }),
    D('Draw a second line', ['Strong levels have several touches. Add one more horizontal line on the other side of the price (a support below if you drew resistance, or the reverse).'], 'Draw a second horizontal line at another level.', (S) => S.drawings.filter((d) => d.tool === 'hline').length >= 2, 'Pick the ─ tool again and tap a second level.', 'Two levels give you a trading range.', { target: 'tools' }),
    D('Find the range', ['Step the market forward and watch what price does at your lines.'], 'Press Step bar 5 times and watch how price reacts near your levels.', (S, b) => (S.counts.barsStepped || 0) >= (b.counts.barsStepped || 0) + 5, 'Use the Step bar button in the top bar.', 'Notice which lines held and which did not. That is real market behaviour, even though the data is simulated.', { target: 'step' }),
    Q('Check: using levels', 'Which idea uses support sensibly?', ['Buy right at support with a stop-loss just below it', 'Buy support with no stop because it always holds', 'Sell every time price touches support'], 0, 'Support gives you a place to define risk: if it breaks, you are wrong and you exit with a small loss.'),
    R('What you learned', { list: ['Support is a floor, resistance is a ceiling.', 'Levels are zones, and they come from repeated touches.', 'Broken levels often flip roles.', 'A level is most useful because it tells you where your idea is wrong.'] }),
  ],
};

const L3: Lesson = {
  id: 'trading-3', title: 'Trends and moving averages', minutes: 14, summary: 'Spot an uptrend or downtrend and smooth it with a moving average.',
  scenario: sc('ARCN', '15m', { kind: 'up', indicators: ['vol'] }),
  steps: [
    R('What is a trend?',
      'An **uptrend** is a series of higher highs and higher lows. A **downtrend** is lower highs and lower lows. A **range** has neither.',
      { rule: '"The trend is your friend" means trades in the direction of the trend tend to be easier than fighting it. It is a tendency, not a guarantee.' }),
    D('Draw a trend line', ['Select the **╱** trend line tool and drag along the rising lows (in an uptrend) or falling highs. A trend line connects at least two swing points.'], 'Draw a trend line along the lows or highs.', up('drawing_trend'), 'Choose the ╱ tool and drag (or tap two points) on the chart.', 'A trend line shows the path price has been following.', { target: 'tools' }),
    Q('Check: higher highs', 'Price keeps making higher highs and higher lows. That is a…', ['Downtrend', 'Uptrend', 'Range'], 1, 'Both the peaks and the dips are climbing: an uptrend.'),
    R('Moving averages smooth the noise',
      'A **simple moving average (SMA)** is the average of the last N closes. An SMA 20 uses the last 20 candles. Because it averages, it lags behind price, but it makes the trend easier to see.',
      'An **exponential moving average (EMA)** gives more weight to recent candles, so it reacts faster.'),
    D('Add the SMA 20', ['Open **Indicators** and switch on **SMA 20**. Watch how the line follows the price at a smoother pace.'], 'Add SMA 20 to the chart.', (S) => S.indicators.includes('sma20'), 'Tap the Indicators button in the top bar, then tick SMA 20.', 'The orange line is the 20-candle average.', { target: 'indicators' }),
    D('Add a fast EMA', ['Now add **EMA 9** as well. Fast average above slow average, and price above both, is a classic sign of an uptrend.'], 'Add EMA 9 as well.', (S) => S.indicators.includes('ema9') && S.indicators.includes('sma20'), 'Open Indicators again and tick EMA 9.', 'Two averages now frame the trend.', { target: 'indicators' }),
    Q('Check: lag', 'Why do moving averages "lag"?', ['They use past prices, so they can only react after price has moved', 'They are always wrong', 'They predict the future'], 0, 'They are built from history. That is both their strength (smooth) and weakness (late).'),
    D('Zoom out to see the trend', ['Trends are easiest to see from a distance. Zoom the chart out to show far more candles.'], 'Zoom out so the trend is clearer.', (S, b) => S.zoomSpan > Math.max(b.zoomSpan, 90) + 20, 'Pinch two fingers together, or scroll the wheel down on a computer.', 'From here the shape of the trend is clearer.', { target: 'chart' }),
    R('What you learned', { list: ['Trends are higher highs and lows (up) or lower highs and lows (down).', 'Trend lines connect swing points.', 'SMAs and EMAs smooth price; EMAs react faster.', 'Averages lag, so use them to understand direction, not to predict.'] }),
  ],
};

const L4: Lesson = {
  id: 'trading-4', title: 'Risk management and position sizing', minutes: 16, summary: 'Decide how much to risk first, then work out how many shares to buy.',
  scenario: sc('BANX', '5m', { kind: 'range', indicators: ['vol'] }),
  steps: [
    R('Risk first, profit second',
      'Beginners ask "how much can I make?". Professionals ask "how much can I lose if I am wrong?".',
      { rule: 'Risk a small fixed percent of your account on each trade, often 0.5% to 1%. With 1% risk, ten losses in a row cost only about 10%, so you survive to keep learning.' }),
    R('The position-size formula',
      '**Shares = (account × risk %) ÷ (entry price − stop price)**',
      { example: 'Account $100,000, risk 1% = $1,000. You plan to buy at $50 with a stop at $48. Risk per share = $2. Shares = $1,000 ÷ $2 = **500 shares**. If the stop hits, you lose about $1,000, which is 1%.' }),
    Q('Check: do the math', 'Account $50,000, risk 1%, entry $20, stop $19. How many shares?', ['250', '500', '1,000'], 1, '1% of $50,000 is $500. Risk per share is $1. So 500 shares.'),
    D('Buy with a stop-loss', ['Use the **Trade** panel on the right. Choose BUY, then use the **⌖ pick** button beside Stop-loss and tap a spot on the chart just below recent lows. Then type **Risk % = 1** and press **Size by risk** to fill in the share count. Finally press BUY.'],
      'Buy shares with a stop-loss so that you risk about 1% of the account.',
      (S) => { const r = riskPctOf(S); return r !== null && r >= 0.004 && r <= 0.013; },
      'Set the stop below the current price, press Size by risk, then BUY. The stop-loss order is created automatically with your buy.', 'You risked about 1%. That is the habit that keeps accounts alive.', { target: 'ticket' }),
    R('Position size is not "how many I can afford"',
      'A cheap stock does not mean you should buy thousands of shares. A tight stop lets you hold more shares for the same dollar risk; a wide stop means fewer shares. Risk, not price, decides size.'),
    D('Watch your trade play out', ['Let the market run and see what your stop does. Press **Play** or step bars until the position closes or you have seen ten bars.'], 'Advance the market ten bars (or until the trade closes).', (S, b) => (S.counts.barsStepped || 0) >= (b.counts.barsStepped || 0) + 10 || S.trades.length > b.trades.length, 'Use Step bar several times, or press Play with a faster speed.', 'Whatever happened, the damage was capped at about 1%.', { target: 'step' }),
    Q('Check: wide or tight', 'You use the same dollar risk. A wider stop means…', ['More shares', 'Fewer shares', 'The same shares'], 1, 'More distance per share means fewer shares are needed to reach your dollar risk.'),
    R('What you learned', { list: ['Decide the dollar risk first (a small % of the account).', 'Shares = risk dollars ÷ (entry − stop).', 'Risk decides size, not the share price.', 'Small risk per trade keeps one loss from ruining you.'] }),
  ],
};

const L5: Lesson = {
  id: 'trading-5', title: 'Stop losses', minutes: 14, summary: 'Place a stop-loss in a sensible spot and understand what it does.',
  scenario: sc('PETR', '15m', { kind: 'range', indicators: ['vol'] }),
  steps: [
    R('What a stop-loss is',
      'A **stop-loss** is an order that sells your position automatically if the price falls to a level you chose. It turns "I hope it comes back" into a plan with a known worst case.',
      { warn: 'A stop is not a perfect guarantee. If price gaps past your stop overnight, you can be filled at a worse price (this is called slippage).' }),
    R('Where should a stop go?',
      'Place it where your idea is proven wrong, not at a random round number. For a long trade bought near support, that is **just below support**.',
      { list: ['Too tight: normal wiggles knock you out.', 'Too wide: one loss is huge or you must shrink your size.', 'Leave some room, often a bit more than one ATR (typical bar range).'] }),
    D('Buy a small position', ['Buy 100 shares at market so we have something to protect. Set quantity 100 in the Trade panel and press BUY.'], 'Buy 100 shares (no stop yet).', (S) => !!pos(S) && pos(S).qty > 0, 'Enter 100 shares and press BUY.', 'You hold a position with no safety net. Let us fix that.', { target: 'ticket' }),
    D('Put the stop below support', ['In the bottom panel open **Positions** and tap **Stop/Target**. Enter a stop-loss price a little below the nearest support (the green dotted guide line). Then Attach.'],
      'Attach a stop-loss just below the nearest support level.',
      (S) => { const s = stopOrder(S); return !!s && s.stop !== undefined && s.stop < supportOf(S) && s.stop > supportOf(S) - 4 * S.atr; },
      'The stop must be below the green dotted line but not miles below it.', 'A stop under support: if the level fails, you are out with a defined loss.', { target: 'positions' }),
    Q('Check: stop placement', 'Where is the most logical stop for a long trade bought at support?', ['Exactly at the support price', 'A little below support', 'Above the entry'], 1, 'If price breaks through support, the idea is wrong. A stop slightly below avoids being shaken out by a touch of the level.'),
    D('Let it run', ['Advance the market and see whether support held.'], 'Advance 8 bars.', (S, b) => (S.counts.barsStepped || 0) >= (b.counts.barsStepped || 0) + 8 || S.trades.length > b.trades.length, 'Step bar a few times.', 'Either way you now know how a stop behaves.', { target: 'step' }),
    R('Never move your stop further away',
      'The one rule of stops: you may move a stop to **reduce** risk (for example up to break-even as the trade works), but never move it further from price because you "feel" it will recover. That is how small losses become big ones.'),
    R('What you learned', { list: ['A stop-loss caps your loss and removes in-the-moment emotion.', 'Place it where the idea is wrong, such as below support.', 'Gaps can fill you beyond the stop.', 'Never widen a stop to avoid taking a loss.'] }),
  ],
};

const L6: Lesson = {
  id: 'trading-6', title: 'Risk/reward and take-profit', minutes: 14, summary: 'Make sure potential winners are bigger than potential losers.',
  scenario: sc('TRON', '15m', { kind: 'up', indicators: ['vol'] }),
  steps: [
    R('Reward : risk',
      'If you risk $1 to try to make $2, the **reward-to-risk ratio** is 2 : 1. The bigger it is, the fewer wins you need.',
      { table: { head: ['Reward : risk', 'Win rate needed to break even'], rows: [['1 : 1', '50%'], ['2 : 1', '33%'], ['3 : 1', '25%']] } },
      'These are break-even rates before fees. Real results also depend on how often your setups actually work.'),
    Q('Check: the math', 'With a 2 : 1 reward : risk, roughly what win rate breaks even?', ['50%', '33%', '75%'], 1, 'Break-even win rate = 1 ÷ (1 + R). With R = 2 that is 1 ÷ 3 = 33%.'),
    D('Build a bracket trade', ['In the Trade panel pick BUY, set **Stop-loss** below recent support and **Take-profit** at a level at least **twice as far above** your entry as the stop is below. The panel shows the Reward : Risk. Then BUY.'],
      'Place a buy with both a stop-loss and a take-profit where reward is at least 2 times the risk.',
      (S) => { const p = pos(S), s = stopOrder(S), t = S.orders.find((o) => o.side === 'sell' && o.type === 'limit'); if (!p || !s || !t || s.stop === undefined || t.limit === undefined) return false; const risk = p.avg - s.stop; return risk > 0 && (t.limit - p.avg) / risk >= 1.9; },
      'Use the ⌖ pick buttons to tap stop and target on the chart; check the Reward : risk line shows 2 or more.', 'A bracket: one order defines entry, loss and goal.', { target: 'ticket' }),
    R('Targets belong at logical places', 'Good targets sit just before resistance or at a measured distance (like 2× your risk). Targets that cross a big resistance level often never fill.'),
    D('Run the clock', ['Advance the market until your bracket closes, or for 15 bars.'], 'Advance up to 15 bars.', (S, b) => S.trades.length > b.trades.length || (S.counts.barsStepped || 0) >= (b.counts.barsStepped || 0) + 15, 'Step bar or Play.', 'Check the History tab to see the R multiple of your trade.', { target: 'step' }),
    Q('Check: R multiples', 'A trade risked $200 and made $400. In R terms that is…', ['+0.5R', '+2R', '+4R'], 1, 'Profit ÷ initial risk = 400 ÷ 200 = 2R.'),
    R('What you learned', { list: ['Reward : risk compares what you can win with what you can lose.', 'Higher ratios need fewer winners to break even.', 'Brackets attach stop and target to the entry.', 'Place targets at logical levels, not wishes.'] }),
  ],
};

const L7: Lesson = {
  id: 'trading-7', title: 'Indicators: volume, RSI, MACD, VWAP, Bollinger', minutes: 16, summary: 'Add the standard indicators and learn what each one can and cannot tell you.',
  scenario: sc('VOLT', '5m', { kind: 'volatile', indicators: [] }),
  steps: [
    R('Indicators are tools, not oracles', 'Indicators are formulas computed from price and volume. They do not predict the future. They summarize the past in a way that makes certain things easier to see.', { warn: 'Stacking many indicators usually just says the same thing five times. Pick a few you understand.' }),
    D('Add Volume', ['**Volume** shows how many shares traded in each bar. A move on high volume has more participation behind it than a move on low volume.'], 'Add the Volume indicator.', (S) => S.indicators.includes('vol'), 'Indicators menu, tick Volume.', 'Volume bars now sit under the price.', { target: 'indicators' }),
    D('Add RSI', ['**RSI 14** measures momentum from 0 to 100. Above 70 is called overbought and below 30 oversold, but in a strong trend RSI can stay stretched for a long time.'], 'Add RSI 14.', (S) => S.indicators.includes('rsi'), 'Indicators menu, tick RSI 14.', 'RSI sits in its own pane.', { target: 'indicators' }),
    Q('Check: RSI', 'RSI reads 82. What is the safest conclusion?', ['Price must fall right now', 'Momentum is stretched; it is a caution, not a sell signal', 'Volume is high'], 1, 'Overbought can persist in strong trends. Treat it as a warning to be careful, not an order to act.'),
    D('Add MACD', ['**MACD** compares a fast and a slow EMA. When the MACD line crosses above its signal line, momentum is turning up; below, turning down. The bars show the gap (histogram).'], 'Add MACD.', (S) => S.indicators.includes('macd'), 'Indicators menu, tick MACD 12,26,9.', 'Now you have a second momentum view.', { target: 'indicators' }),
    D('Add VWAP', ['**VWAP** is the average price paid today, weighted by volume. Institutions use it as a benchmark. Price above VWAP means buyers are in control for the day. It restarts every morning and is only shown on intraday timeframes.'], 'Add VWAP.', (S) => S.indicators.includes('vwap'), 'Indicators menu, tick VWAP.', 'The yellow line is the volume-weighted average.', { target: 'indicators' }),
    D('Add Bollinger Bands', ['**Bollinger Bands** draw a band two standard deviations around the SMA 20. They widen when volatility rises and narrow when it falls.'], 'Add Bollinger 20,2.', (S) => S.indicators.includes('bb'), 'Indicators menu, tick Bollinger.', 'Bands show how stretched price is relative to recent volatility.', { target: 'indicators' }),
    Q('Check: what do bands show?', 'Bollinger Bands getting very narrow most directly signals…', ['Low recent volatility', 'A guaranteed breakout upward', 'High volume'], 0, 'Narrow bands mean price has been quiet. Volatility tends to come back, but not in a promised direction.'),
    D('See them react', ['Advance a few bars and watch how the indicators change.'], 'Step bar 5 times.', (S, b) => (S.counts.barsStepped || 0) >= (b.counts.barsStepped || 0) + 5, 'Use Step bar.', 'Indicators are live: they recompute with every candle.', { target: 'step' }),
    R('What you learned', { list: ['Volume: participation. RSI/MACD: momentum. VWAP: the day\'s average price. Bollinger: volatility.', 'Overbought/oversold is a caution, not a command.', 'Few, well-understood indicators beat many.', 'They describe the past; they do not predict.'] }),
  ],
};

const L8: Lesson = {
  id: 'trading-8', title: 'Trading psychology', minutes: 14, summary: 'Fear, greed and FOMO decide more results than indicators. Practice staying calm.',
  scenario: sc('EVOL', '5m', { kind: 'volatile', indicators: ['vol'] }),
  steps: [
    R('The enemy is in the mirror', 'Most trading mistakes are emotional: fear makes you sell winners too early, greed makes you hold losers too long, **FOMO** (fear of missing out) makes you chase a price that already ran.', { rule: 'A plan made calmly beats a decision made while the candle is moving.'}),
    Q('Check: FOMO', 'A stock already jumped 6% and you feel you must buy now. What is the better move?', ['Buy immediately with a big size', 'Wait for a setup that fits your plan, and size normally', 'Double your size to catch up'], 1, 'Chasing usually means buying near the top with a far-away stop. If your plan has no entry here, there is no trade.'),
    D('Write the plan before trading', ['Before you click BUY, decide your stop and your target. In the Trade panel, fill in **Stop-loss** and **Take-profit** first.'], 'Fill in both a stop-loss and a take-profit in the ticket (you do not need to submit).', (S) => !!S.ticket.sl && !!S.ticket.tp, 'Use the ⌖ pick buttons, or type prices into the two protect fields.', 'A plan on the ticket before the order: that is discipline.', { target: 'ticket' }),
    D('Take the planned trade', ['Now submit it, with your size set so you risk no more than 1%.'], 'Submit the order with stop and target attached.', (S) => !!pos(S) && !!stopOrder(S) && !!S.orders.find((o) => o.type === 'limit'), 'Press BUY at the bottom of the Trade panel.', 'The order is in. Now your only job is to follow the plan.', { target: 'ticket' }),
    D('Do nothing', ['The hardest skill: let the stop and target do their work. Advance time without touching your orders.'], 'Advance 12 bars without cancelling the stop.', (S, b) => (S.counts.barsStepped || 0) >= (b.counts.barsStepped || 0) + 12 && (S.counts.ordersCancelled || 0) === (b.counts.ordersCancelled || 0), 'Press Step bar twelve times (or Play), and leave the orders alone.', 'You let the plan work. That is professional behaviour.', { target: 'step' }),
    Q('Check: revenge trading', 'After a loss you want to immediately win it back with a bigger trade. What is that called?', ['Revenge trading', 'Diversification', 'Hedging'], 0, 'Revenge trading is emotional and usually makes things worse. After a loss, a break is a valid position.'),
    R('Habits that help', { list: ['Set a daily loss limit (for example 2% of the account) and stop when you reach it.', 'Trade a small, repeatable set of setups.', 'Take breaks. Do not trade when tired, angry or in a hurry.', 'Judge decisions by process, not by one outcome.'] }),
    R('What you learned', { list: ['Emotion is the main cause of trading mistakes.', 'Write the plan (stop, target, size) before the order.', 'Let trades play out; do not widen stops.', 'Daily loss limits and breaks protect you.'] }),
  ],
};

const L9: Lesson = {
  id: 'trading-9', title: 'Building a trading journal', minutes: 12, summary: 'Record why you traded and how you felt. This is how you improve.',
  scenario: sc('GEAR', '5m', { kind: 'up', indicators: ['vol'] }),
  steps: [
    R('Why journal?', 'A journal turns experience into learning. Without one, you remember the exciting trades and forget the pattern behind your mistakes.', { list: ['Setup: why did you enter?', 'Plan: stop, target, size.', 'Result: P&L and R multiple.', 'Emotion: how did you feel?', 'Lesson: what would you do differently?'] }),
    D('Make a quick trade', ['Buy 50 shares, then close the position with the Close button in the Positions tab so we have a finished trade to write about.'], 'Open and then close a trade.', (S, b) => S.trades.length > b.trades.length, 'BUY 50, then bottom panel > Positions > Close.', 'You have a closed trade. Open the Journal tab next.', { target: 'positions' }),
    D('Write a journal note', ['Open the **Journal** tab at the bottom. Pick a setup tag and an emotion tag, and type one sentence about why you took the trade.'], 'Write a note about your trade in the Journal tab.', up('journalNotes'), 'Bottom panel > Journal. Type, then tap outside the box.', 'Saved. Review your journal weekly and look for patterns.', { target: 'journal' }),
    Q('Check: what to review', 'After 30 journal entries, what is most useful to look for?', ['Patterns: which setups and emotions lead to your best and worst trades', 'Only the biggest win', 'Nothing, just count the entries'], 0, 'Patterns across many trades tell you what to repeat and what to stop.'),
    D('Check your stats', ['The **Stats** tab shows win rate, average win, average loss, profit factor and drawdown.'], 'Open the Stats tab in the bottom panel.', up('statsViewed'), 'Tap Stats at the right of the bottom panel tabs.', 'Numbers beat feelings.', { target: 'positions' }),
    R('Key numbers', { table: { head: ['Number', 'Means'], rows: [['Win rate', 'Share of trades that made money'], ['Average win / loss', 'Size of typical winners and losers'], ['Profit factor', 'Total won ÷ total lost (above 1 is profitable)'], ['Max drawdown', 'Worst peak-to-trough drop']] } }),
    R('What you learned', { list: ['Journal the setup, plan, result and emotion.', 'Review for patterns, not single trades.', 'Win rate alone is meaningless without average win and loss.'] }),
  ],
};

const L10: Lesson = {
  id: 'trading-10', title: 'Common mistakes and a final trade', minutes: 14, summary: 'Spot the classic mistakes, then place one trade that follows every rule.',
  scenario: sc('MKTX', '15m', { kind: 'up', indicators: ['vol', 'sma20'] }),
  steps: [
    R('The classic mistakes', { list: ['Trading without a stop-loss.', 'Risking too much per trade.', 'Moving a stop away from price.', 'Chasing a move (FOMO).', 'Overtrading out of boredom.', 'Revenge trading after a loss.', 'Ignoring the trend and fighting it.', 'Never reviewing results.'] }),
    Q('Spot the mistake', 'A trader loses on a trade, then doubles the next position to win it back. This is…', ['Smart averaging', 'Revenge trading with oversized risk', 'Normal position sizing'], 1, 'Increasing size after a loss to "get even" is one of the fastest ways to blow up an account.'),
    Q('Spot the mistake 2', 'A trader has no stop and says "it will come back". What risk is the trader taking?', ['An unlimited, open-ended loss', 'No risk at all', 'A small fixed loss'], 0, 'Without a stop the loss is limited only by the trader\'s patience or margin call.'),
    R('Your final checklist', { steps: ['Is the market in an uptrend, downtrend or range?', 'Where is the nearest support and resistance?', 'Where is my stop (idea proven wrong)?', 'Is the reward at least 2× the risk?', 'What size risks 1% or less?', 'Am I calm, and have I written the plan?'] }),
    D('Place the checklist trade', ['Put it all together. Buy with a stop-loss below the nearest support, a take-profit at least 1.9× the risk away, and a position size that risks no more than about 1.3% of the account.'],
      'Place one trade that has a stop, a 2:1 target and risks 1.3% or less.',
      (S) => { const r = riskPctOf(S); const p = pos(S), s = stopOrder(S), t = S.orders.find((o) => o.side === 'sell' && o.type === 'limit'); if (!p || !s || !t || r === null || s.stop === undefined || t.limit === undefined) return false; const risk = p.avg - s.stop; return risk > 0 && (t.limit - p.avg) / risk >= 1.9 && r <= 0.013 && s.stop < p.avg; },
      'Use Size by risk after you pick stop and target. Check the Reward : risk line shows about 2 or more.', 'That is a complete, rule-following trade.', { target: 'ticket' }),
    D('Run it', ['Advance the market and let your plan decide the result.'], 'Advance up to 20 bars or until the trade closes.', (S, b) => S.trades.length > b.trades.length || (S.counts.barsStepped || 0) >= (b.counts.barsStepped || 0) + 20, 'Press Step bar, or Play at 15×.', 'Win or lose, you followed the process.', { target: 'step' }),
    Q('Final check', 'Which single habit protects an account the most?', ['Predicting the market', 'Risking a small fixed percent per trade with a stop', 'Trading as often as possible'], 1, 'You cannot control the outcome of a trade, but you can control how much any one trade can hurt you.'),
    R('What you learned', { list: ['Most blow-ups come from the same few mistakes.', 'A checklist before each trade keeps decisions calm.', 'Process over outcome.', 'Practice here for as long as you like. Real money is a separate, serious decision, and this app is not financial advice.'] }),
  ],
};

const Z = (q: string, options: string[], answer: number, explain: string): ExamQ => ({ q, options, answer, explain });

const exam: ExamQ[] = [
  Z('A green candle means…', ['The close was above the open', 'The market is closed', 'Volume was high'], 0, 'Green = close higher than open for that slice of time.'),
  Z('A long lower wick usually shows…', ['Sellers pushed price down but buyers pushed it back up', 'No trading happened', 'A guaranteed rally'], 0, 'Price dipped and was rejected. Context decides what it means.'),
  Z('Support is…', ['A level where falling prices have repeatedly stopped', 'The highest price ever', 'An indicator line'], 0, 'A price floor that held several times.'),
  Z('An uptrend is…', ['Higher highs and higher lows', 'Lower highs and lower lows', 'Flat prices'], 0, 'Both peaks and dips are rising.'),
  Z('A moving average lags because…', ['It is calculated from past prices', 'It is broken', 'It uses future prices'], 0, 'It averages history.'),
  Z('Account $100,000, risk 1%, entry $40, stop $38. Shares?', ['250', '500', '1,000'], 1, '$1,000 ÷ $2 = 500.'),
  Z('Where should a long trade\'s stop usually go?', ['Where the idea is proven wrong', 'At your entry', 'At a random round number'], 0, 'The stop is the price that says "I was wrong".'),
  Z('Reward : risk of 3 : 1 breaks even at about what win rate?', ['25%', '50%', '75%'], 0, '1 ÷ (1 + 3) = 25%.'),
  Z('RSI of 85 means…', ['Momentum is stretched; be careful', 'Sell immediately', 'The company is cheap'], 0, 'It is a caution, not a command.'),
  Z('VWAP is…', ['The volume-weighted average price for the day', 'A type of order', 'A chart style'], 0, 'The day\'s average price weighted by volume.'),
  Z('FOMO stands for…', ['Fear of missing out', 'Fund of mutual options', 'Fast order market option'], 0, 'The urge to chase a move you missed.'),
  Z('Moving your stop further away after price approaches it is…', ['A common way small losses become big ones', 'Smart risk control', 'Required by the market'], 0, 'Only tighten stops, never widen them.'),
  Z('Revenge trading means…', ['Trading emotionally to win back a loss', 'Trading after the close', 'Selling short'], 0, 'It tends to increase size and risk at the worst time.'),
  Z('A trade risked $300 and made $600. That is…', ['+2R', '+0.5R', '+6R'], 0, '600 ÷ 300 = 2R.'),
  Z('Which is true about indicators?', ['They summarize past data and do not predict', 'They predict prices', 'More indicators are always better'], 0, 'They are descriptions of history.'),
  Z('What does a journal help you find?', ['Patterns in your own decisions', 'Next week\'s prices', 'Free money'], 0, 'Learning from your habits is the point.'),
  Z('If price gaps below your stop overnight, you…', ['May be filled worse than your stop', 'Are always filled at the stop', 'Cannot lose'], 0, 'Gaps skip prices, so fills can be worse.'),
  Z('This app\'s prices are…', ['Simulated on the device', 'Real-time market quotes', 'Delivered from a broker'], 0, 'Everything is generated offline. Nothing is real market data.'),
  Z('A fixed percent risk per trade helps because…', ['A string of losses cannot wipe you out quickly', 'It guarantees profit', 'It removes fees'], 0, 'It limits how fast the account can shrink.'),
  Z('Is this app financial advice?', ['No. It is education with simulated data', 'Yes, follow its signals', 'Only on weekdays'], 0, 'Nothing here is a recommendation to buy or sell anything.'),
];

const trading: Course = {
  id: 'trading', kind: 'trading', title: 'Day Trading Foundations', icon: '📈', color: '#2962ff', level: 'Beginner',
  summary: 'Learn to read charts, manage risk and keep a journal, by practicing with simulated data and pretend money.',
  outcomes: ['Read candles, support/resistance and trends', 'Size every trade to risk about 1%', 'Place stop-loss and take-profit orders', 'Use volume, RSI, MACD, VWAP and Bollinger sensibly', 'Spot the emotional traps that cost money', 'Keep a journal and read your own stats'],
  lessons: [L1, L2, L3, L4, L5, L6, L7, L8, L9, L10],
  exam: { passPercent: 70, questions: exam },
};
export default trading;
