// The trading course: short pages, real chart examples, and a quiz that explains every answer.
import type { KindId } from '../engine/scenarios';

export type ChartSpec = { kind: KindId; seed: number; full?: boolean; average?: boolean; levels?: boolean; caption: string };
export type Page = { h: string; p: string[]; bullets?: string[]; chart?: ChartSpec; rule?: string };
export type Quiz = { q: string; options: string[]; answer: number; why: string };
export type Lesson = { id: string; n: number; title: string; blurb: string; minutes: number; pages: Page[]; quiz: Quiz[]; practice?: KindId };

export const LESSONS: Lesson[] = [
  {
    id: 'basics', n: 1, title: 'Reading a chart', blurb: 'What every candle tells you, and what it does not.', minutes: 5,
    pages: [
      { h: 'One candle, four prices', p: [
        'Each candle is one slice of time: a day on these charts. The thick body runs from the open to the close. The thin lines, the wicks, reach the highest and lowest price traded in that slice.',
        'Green means the close was above the open. Red means it closed lower. A long wick tells you price went somewhere and was pushed back.',
      ], chart: { kind: 'uptrend', seed: 11, caption: 'Seventy days of candles. The bars along the bottom are volume: how many shares changed hands.' } },
      { h: 'What a chart cannot tell you', p: [
        'A chart is a record of what already happened. It does not know the news tomorrow, and no pattern on it is a promise.',
        'What it does give you is a map of where buyers and sellers acted before, how fast price moves, and how far it usually travels. That is enough to plan a trade with a defined risk, which is the whole skill.',
      ], rule: 'You are never predicting the future. You are choosing a risk and a place to be wrong.' },
      { h: 'Volume and the average', p: [
        'Volume shows how many people took part. A move on heavy volume is more believable than the same move on thin volume.',
        'The amber line, when you turn it on in Predict, is the 20-bar moving average: the mean of the last 20 closes. It smooths noise so the direction is easier to see.',
      ], chart: { kind: 'uptrend', seed: 11, average: true, caption: 'The moving average rises with the trend and acts as a rough floor on dips.' } },
    ],
    quiz: [
      { q: 'A candle has a long upper wick and closes near its low. What happened?', options: ['Price rose and held its gains', 'Price rose a lot but sellers pushed it back down by the close', 'Nothing, wicks are noise'], answer: 1, why: 'The wick shows how high price went. A close near the low means sellers won the bar after buyers tried first.' },
      { q: 'What does a green candle mean?', options: ['Price rose over the whole day', 'The close was above the open', 'Price will rise tomorrow'], answer: 1, why: 'Colour compares the close with the open of that bar only. It says nothing about the future.' },
      { q: 'Why does volume matter?', options: ['It shows how many people took part in a move', 'It predicts the next price', 'It is the same as price'], answer: 0, why: 'Heavy volume means broad participation, so the move is more likely to be real.' },
    ],
  },
  {
    id: 'trend', n: 2, title: 'Reading a trend', blurb: 'Higher highs, higher lows, and when a pullback is a gift.', minutes: 6, practice: 'uptrend',
    pages: [
      { h: 'What makes an uptrend', p: [
        'An uptrend is a sequence of higher highs and higher lows. Price pushes up, backs off, then pushes past the old high. Each dip is shallower than the climb that came before it.',
        'A downtrend is the mirror image: lower highs and lower lows.',
      ], chart: { kind: 'uptrend', seed: 21, caption: 'Each pullback ends above the previous one. That is the signature of buyers in control.' } },
      { h: 'Trading the pullback', p: [
        'Chasing a big green candle means buying after the move and putting your stop far away. Waiting for a dip into the rising average lets you buy cheaper, with a tighter stop under the last low.',
        'The setup works about as often as it fails; it pays because the winners are bigger than the losers.',
      ], chart: { kind: 'uptrend', seed: 21, full: true, average: true, caption: 'The same chart with the future revealed. Your Predict rounds train exactly this read.' } },
      { h: 'When the trend is over', p: [
        'A trend ends when price makes a lower low. Until then, a dip is a dip. You do not need to guess the top. You only need a stop below the last higher low and the discipline to take it.',
      ], rule: 'The trend is your friend until the structure breaks. Define the break before you enter.' },
    ],
    quiz: [
      { q: 'Which describes an uptrend?', options: ['Higher highs and higher lows', 'A green candle today', 'Price above its all-time low'], answer: 0, why: 'Structure defines the trend, not one candle.' },
      { q: 'Price pulls back to the rising average in an uptrend. A sensible plan is:', options: ['Buy with a stop under the last higher low', 'Sell short because it fell', 'Wait until it makes a new high, however far away'], answer: 0, why: 'You buy a dip inside the trend and let the last higher low define where you are wrong.' },
      { q: 'What signals the uptrend is breaking?', options: ['Three red candles', 'A lower low than the previous low', 'Lower volume'], answer: 1, why: 'A lower low breaks the pattern of higher lows. A few red candles alone do not.' },
    ],
  },
  {
    id: 'levels', n: 3, title: 'Support and resistance', blurb: 'The floors and ceilings where price keeps turning.', minutes: 5, practice: 'support',
    pages: [
      { h: 'Floors and ceilings', p: [
        'Support is a price where buyers have stepped in before, so falling price tends to pause or bounce there. Resistance is the same idea above price, where sellers have appeared.',
        'The more times a level has held, and the more recent it is, the more traders are watching it.',
      ], chart: { kind: 'support', seed: 31, levels: true, caption: 'The dotted lines mark the lowest low and highest high of the visible range.' } },
      { h: 'Levels fail too', p: [
        'Every level breaks eventually. When it does, the stop orders sitting just beyond it fire together and often push price further. That is why a stop sits a little past the level, not on it.',
        'A broken floor frequently turns into a ceiling. People who bought at the old floor are trying to get out at breakeven.',
      ], chart: { kind: 'support', seed: 33, full: true, levels: true, caption: 'Whether the level holds or breaks, the trade plan is the same: buy near it, stop just below.' } },
    ],
    quiz: [
      { q: 'Why place a stop slightly below support rather than exactly on it?', options: ['Price often wicks through a level before turning', 'It reduces commissions', 'It guarantees the level holds'], answer: 0, why: 'Levels are zones. Normal noise pokes through them, so the stop goes beyond the zone.' },
      { q: 'A support level has been tested four times. It is:', options: ['Certain to hold again', 'A level to watch, but each test weakens it', 'Meaningless'], answer: 1, why: 'Repeated tests use up the buyers waiting there. It stays useful but never certain.' },
      { q: 'After a floor breaks, it often becomes:', options: ['A ceiling', 'A stronger floor', 'Invisible'], answer: 0, why: 'Old buyers who are now underwater want out at breakeven, which creates selling at that price.' },
    ],
  },
  {
    id: 'risk', n: 4, title: 'Risk first', blurb: 'The size of the bet matters more than the idea.', minutes: 6,
    pages: [
      { h: 'Think in R', p: [
        '1R is the amount you lose if your stop is hit. If you risk $100 on a trade, then losing $100 is -1R and making $250 is +2.5R. Measuring in R lets you compare trades of any size.',
        'Every Predict round and Trade session in this app reports results in R for this reason.',
      ] },
      { h: 'Position size comes from your stop', p: [
        'Decide the loss you will accept first, then work out how many shares fit it. Shares = money at risk divided by the distance from entry to stop.',
        'Example: a $10,000 account, 1% risk, so $100. You buy at $50 with a stop at $48. The risk is $2 per share, so you buy 50 shares. A wide stop means fewer shares, never a bigger loss.',
      ], rule: 'Risk is set by the stop and the share count together. Never by how confident you feel.' },
      { h: 'Why small risks win', p: [
        'Ten losses in a row happen to every trader. At 1% risk, that costs about 9.6% of the account. At 10% risk the same streak costs about 65%.',
        'Losses also hurt more than they look: after losing 50%, you need a 100% gain just to get back. Keeping each loss small keeps you in the game long enough to learn.',
      ] },
    ],
    quiz: [
      { q: 'You risk 1% of $20,000, entry 40, stop 38. How many shares?', options: ['50', '100', '200'], answer: 1, why: '1% of $20,000 is $200. Risk per share is $2. $200 divided by $2 is 100 shares.' },
      { q: 'You want a wider stop. To keep the same risk you should:', options: ['Buy more shares', 'Buy fewer shares', 'Change nothing'], answer: 1, why: 'More distance to the stop means more loss per share, so fewer shares keeps the dollar risk constant.' },
      { q: 'After a 50% loss, the gain needed to break even is:', options: ['50%', '75%', '100%'], answer: 2, why: 'Half of $10,000 is $5,000, and getting back to $10,000 means doubling it.' },
    ],
  },
  {
    id: 'stops', n: 5, title: 'Stops and volatility', blurb: 'Putting the stop where you are actually wrong.', minutes: 5,
    pages: [
      { h: 'Why a stop at all', p: [
        'A stop-loss is an order that closes the trade at a price you chose in advance, while you were calm. Without one, the decision happens while you are watching a loss grow.',
      ] },
      { h: 'Measure the noise with ATR', p: [
        'ATR, the average true range, is how far a bar typically travels. If a stock moves 2 dollars a day on average, a stop 0.5 dollars away will be hit by routine noise.',
        'This app measures stop distance in ATR for that reason. About 1 to 2 ATR is a common range. Smaller gets hit by noise; much larger makes each share too expensive in risk.',
      ] },
      { h: 'Rules for stops', p: [],
        bullets: [
          'Place it where the idea is wrong, not where the loss feels comfortable.',
          'Never move it further away. Only toward profit.',
          'Gaps can jump past a stop. In the sim a gap fills you at the open price, as in real life.',
          'Moving to breakeven protects the trade once price has paid you, but it also gets you stopped on a normal retest.',
        ] },
    ],
    quiz: [
      { q: 'Your stop keeps getting hit by normal wiggles and then price continues your way. Most likely:', options: ['The stop is too tight for this stock’s volatility', 'The market is rigged', 'You should remove the stop'], answer: 0, why: 'A stop inside the average noise gets tagged constantly. Size it from ATR and trade fewer shares.' },
      { q: 'Price is moving against you and nearing the stop. You:', options: ['Move the stop further away', 'Let it execute', 'Add to the position'], answer: 1, why: 'The stop was set when you were objective. Moving it away turns a planned loss into an open-ended one.' },
      { q: 'A stock gaps down through your stop overnight. You are filled:', options: ['At your stop price', 'At the open, which is worse than your stop', 'You are not filled'], answer: 1, why: 'A stop becomes a market order once triggered, so it fills wherever price opens.' },
    ],
  },
  {
    id: 'rr', n: 6, title: 'Reward, risk and win rate', blurb: 'You can be wrong most of the time and still profit.', minutes: 6,
    pages: [
      { h: 'The two numbers', p: [
        'Reward to risk is how many R you aim to make for each 1R you risk. Win rate is how often you win. Profit comes from both together, never from one.',
        'Expectancy is what you make per trade on average: win rate times average win, minus loss rate times average loss.',
      ], rule: 'Example: win 40% of the time, wins pay 2R, losses cost 1R. Expectancy = 0.4 x 2 - 0.6 x 1 = +0.2R per trade.' },
      { h: 'The break-even table', p: ['The win rate you need just to break even is 1 divided by (1 + reward to risk).'],
        bullets: ['1:1 needs 50% wins', '1.5:1 needs 40%', '2:1 needs 33%', '3:1 needs 25%'] },
      { h: 'A bigger target is not free', p: [
        'Pushing the target out raises the reward, but fewer trades reach it, so your win rate falls. There is no setting that is best for every setup. Test them: set 3:1 for ten Predict rounds, then 1:1, and compare your total R.',
      ] },
    ],
    quiz: [
      { q: 'You win 35% of trades, wins pay 3R, losses cost 1R. Expectancy per trade?', options: ['-0.30R', '+0.40R', '+1.05R'], answer: 1, why: '0.35 x 3 = 1.05, minus 0.65 x 1 = 0.65, leaves +0.40R.' },
      { q: 'At 2:1 reward to risk, the break-even win rate is about:', options: ['25%', '33%', '50%'], answer: 1, why: '1 divided by 3 is 33%. Win more than a third of the time and you profit.' },
      { q: 'Which is true?', options: ['Win rate alone decides profit', 'A high win rate with tiny wins and big losses can lose money', 'You must win more than half your trades'], answer: 1, why: 'A 90% win rate with wins of 0.1R and losses of 1.5R loses money. The size of wins and losses matters.' },
    ],
  },
  {
    id: 'entries', n: 7, title: 'Entries that work and fail', blurb: 'Pullbacks, breakouts, double tops, and false starts.', minutes: 7, practice: 'breakout',
    pages: [
      { h: 'Buying a breakout', p: [
        'A breakout is price moving through a level that has capped it before. Buyers who waited are now willing to pay more, and shorts are forced out. When it works, price accelerates.',
      ], chart: { kind: 'breakout', seed: 41, levels: true, caption: 'Higher lows pressing into a flat ceiling. This is a common setup, and it fails often.' } },
      { h: 'The false breakout', p: [
        'Many breakouts poke above the level, find no follow-through, and fall back. If you bought, you are trapped near the top. A stop just inside the old range limits the damage to 1R.',
        'This is why breakout trades should be small and why you should never feel certain.',
      ], chart: { kind: 'breakout', seed: 43, full: true, levels: true, caption: 'Run enough rounds and you will see both versions of this same chart.' } },
      { h: 'The double top', p: [
        'A double top forms when price rises, falls back, then returns to the same high and fails again. Sellers defended the level twice. Short traders place a stop just above the high.',
        'But the opposite also happens: the third push breaks through. The stop above the high is what keeps this from hurting.',
      ], chart: { kind: 'doubletop', seed: 45, levels: true, caption: 'Two rejections at one price. Warning sign, not a verdict.' } },
    ],
    quiz: [
      { q: 'You buy a breakout and price falls back below the old ceiling. The most sensible action:', options: ['Take your stop', 'Double your position to average down', 'Remove the stop and hope'], answer: 0, why: 'A close back inside the range means the idea failed. Your stop is the plan working.' },
      { q: 'A double top suggests:', options: ['Price must fall', 'Sellers defended a level twice, so a drop is more likely but not certain', 'Price will always break higher'], answer: 1, why: 'It tilts the odds. Always plan for the opposite outcome with a stop.' },
      { q: 'Compared with a pullback entry, a breakout entry usually has:', options: ['Less chance of failure', 'A bigger chance of a false start', 'No stop needed'], answer: 1, why: 'Breakouts fail often, so they reward smaller size and a stop just inside the old range.' },
    ],
  },
  {
    id: 'indicators', n: 8, title: 'Averages, volume and gaps', blurb: 'Tools that describe the chart. None of them predict it.', minutes: 5, practice: 'gap',
    pages: [
      { h: 'Indicators are summaries', p: [
        'A moving average, RSI, or MACD is arithmetic on past prices. It can make a trend easier to see, but it adds no information the candles did not already contain.',
        'Stacking many indicators usually just stacks the same signal. Pick one or two, learn how they behave, and judge them by results in R.',
      ] },
      { h: 'Gaps', p: [
        'A gap is a jump between one close and the next open, usually after news. Gap and go means the move continues. Gap fill means price drifts back to where the gap began. Both happen, so gap trades need a stop.',
      ], chart: { kind: 'gap', seed: 51, full: true, average: true, caption: 'A jump after a long climb. Which ending you get is about a coin flip weighted by context.' } },
    ],
    quiz: [
      { q: 'An indicator is best described as:', options: ['A forecast', 'A summary of past prices', 'A guaranteed signal'], answer: 1, why: 'Every indicator is calculated from prices that already happened.' },
      { q: 'A stock gaps up 5% on news. Which is safest to assume?', options: ['It will keep rising', 'It will fill the gap', 'Either could happen, so you need a stop'], answer: 2, why: 'Gaps resolve both ways. The stop handles the case you got wrong.' },
      { q: 'Adding a fifth indicator that all point the same way gives you:', options: ['Much more confirmation', 'Mostly the same information again', 'A guarantee'], answer: 1, why: 'Most indicators are built from the same closing prices, so they agree because they share inputs.' },
    ],
  },
  {
    id: 'psychology', n: 9, title: 'Your mind is the risk', blurb: 'FOMO, revenge trades, and the habit of overtrading.', minutes: 5, practice: 'chop',
    pages: [
      { h: 'The three classic leaks', p: [], bullets: [
        'FOMO: buying after a big run because you cannot stand watching it. Your stop ends up far away and your entry is the worst of the move.',
        'Revenge trading: opening a bigger trade right after a loss to win it back. This is how a 2% bad day becomes a 10% one.',
        'Overtrading: trading because you are bored. Each trade costs spread and attention, and most charts offer no edge.',
      ] },
      { h: 'Sometimes there is nothing to do', p: [
        'On a chart like this one, no trend and no clean levels, staying out is the correct trade. The best traders skip most days.',
      ], chart: { kind: 'chop', seed: 61, caption: 'Bars overlap, no direction. Look at your Predict record for these rounds: how often did you trade?' } },
      { h: 'Rules beat willpower', p: [
        'Write rules before the session: the most you will risk per trade, the most you will lose in a day, and the setups you will take. Then stop when you hit the limit. Rules are cheap when you are calm and priceless when you are not.',
      ] },
    ],
    quiz: [
      { q: 'After two losses you feel like doubling your size to catch up. This is:', options: ['Smart recovery', 'Revenge trading', 'Risk management'], answer: 1, why: 'Bigger size after losses raises the chance of a much bigger loss when your edge has not changed.' },
      { q: 'A chart has no trend and no levels. A disciplined trader:', options: ['Picks a side anyway', 'Stays out', 'Uses a wider stop'], answer: 1, why: 'No edge, no trade. Capital and attention are saved for clearer setups.' },
      { q: 'The best time to decide how much you will lose in a day is:', options: ['After the first loss', 'Before the session starts', 'Never, adapt as you go'], answer: 1, why: 'Rules made calmly in advance beat decisions made while you are down.' },
    ],
  },
  {
    id: 'review', n: 10, title: 'Review and the honest truth', blurb: 'How to find out whether you are getting better.', minutes: 5,
    pages: [
      { h: 'Keep score in R', p: [
        'Note each trade: the setup, the reason, the result in R, and one line on whether you followed your rules. The Trade tab keeps the numbers. The line about your rules you add yourself.',
        'After 20 or more trades, look at expectancy, average loss, and which setups pay. Ten trades is mostly luck.',
      ] },
      { h: 'The honest truth', p: [
        'Most people who trade with real money lose money, especially early. They risk too much, trade too often, and cut winners while holding losers.',
        'This app removes the cost of learning those lessons. But simulated trading is easier than the real thing: it has no fear, no money on the line, and perfect fills. Treat strong results here as proof you know the rules, not proof you will profit.',
      ], rule: 'If you ever trade real money, start with an amount you can afford to lose entirely.' },
    ],
    quiz: [
      { q: 'How many trades before an average-R result means much?', options: ['3', '10', '30 or more'], answer: 2, why: 'Small samples are dominated by luck. You need dozens of trades to see real expectancy.' },
      { q: 'Simulated results are best seen as:', options: ['A prediction of real profit', 'Proof you understand the rules and process', 'Irrelevant'], answer: 1, why: 'Practice builds process. It cannot reproduce the fear of losing real money.' },
      { q: 'Your average loss is 1.6R though every stop was set at 1R. What is likely?', options: ['Great execution', 'You moved or skipped some stops', 'Normal slippage'], answer: 1, why: 'Losses larger than planned point to broken rules, the most common source of blown accounts.' },
    ],
  },
];

export const byId = (id: string) => LESSONS.find((l) => l.id === id);
