import type { Course } from '../types';

const course: Course = {
  id: 'investing',
  kind: 'life',
  title: 'Investing Basics',
  icon: '📈',
  color: '#2E9E6B',
  level: 'Beginner',
  summary: `Learn how investing works, why risk and time matter, and how to avoid the classic mistakes, in plain words and with round numbers.`,
  outcomes: [
    `Explain the difference between stocks, bonds and cash`,
    `Describe what an index fund is and why spreading money around lowers risk`,
    `See how time, fees and inflation change what your money can do`,
    `Explain dollar-cost averaging and when NOT to invest`,
    `Stay calm and stick to a plan when markets drop`,
  ],
  lessons: [
    {
      id: 'investing-1',
      title: `Stocks, bonds, cash and funds`,
      minutes: 9,
      summary: `What you can put money into, and why holding only one thing is risky.`,
      steps: [
        {
          type: 'read',
          title: `Before we start`,
          body: [
            `Investing means putting money into something that might grow, **knowing it might also shrink**. Saving is safer but grows slowly. Investing can grow faster but there is no guarantee.`,
            { warn: `This course is for learning only. It is NOT financial or tax advice. Nobody here knows your situation. Rules and products differ by country and change over time, so check official sources and talk to a trusted adult or a licensed professional before you invest real money.` },
            `All the people, companies and numbers in this course are made up. Growth rates are "assumed" examples to show the arithmetic, never predictions.`,
          ],
        },
        {
          type: 'read',
          title: `Three basic building blocks`,
          body: [
            `**Cash** is money in a bank account. It is steady and easy to reach, but it grows slowly.`,
            `**A stock** is a tiny slice of ownership in a company. If the company does well the slice can become worth more. If it does badly the slice can lose value, even all of it.`,
            `**A bond** is a loan you make to a company or government. They promise to pay interest and give your money back on a date. Usually calmer than stocks, but it is a promise, and promises can be broken.`,
            { table: { head: [`Type`, `Usually grows`, `Ups and downs`, `You are...`], rows: [[`Cash`, `Slowly`, `Very small`, `A saver`], [`Bonds`, `Moderately`, `Medium`, `A lender`], [`Stocks`, `Faster over long times`, `Large`, `A part owner`]] } },
          ],
        },
        {
          type: 'quiz',
          title: `Quick check: who are you?`,
          question: `When you buy a stock in a fictional company called Brightleaf Bakery, what do you own?`,
          options: [`A loan the bakery must repay with interest`, `A small slice of ownership in the bakery`, `A guarantee that you will earn money`],
          answer: 1,
          explain: `A stock is a slice of ownership. Lending money is what a bond does. Nothing about a stock is guaranteed, its value can rise or fall.`,
        },
        {
          type: 'read',
          title: `Why not just pick one great stock?`,
          body: [
            `Imagine Priya puts all of her $1,000 into Brightleaf Bakery. If the bakery closes, she may lose nearly everything. Even good companies can have bad years.`,
            `**Diversification** means spreading your money across many different things so one failure cannot sink you. It is the investing version of not putting all your eggs in one basket.`,
            { rule: `Diversification lowers the damage from any one mistake. It does not remove risk, and it cannot stop the whole market from falling.` },
          ],
        },
        {
          type: 'read',
          title: `Index funds: a basket in one purchase`,
          body: [
            `A **fund** pools money from many people to buy lots of investments at once. An **index fund** simply copies a list (an index) of many companies, for example hundreds of the biggest ones in a country.`,
            `When you buy a broad index fund you own a tiny piece of every company on its list with one purchase. That is instant diversification, and the costs are usually low because no one is hunting for winners.`,
            { tip: `Many beginners' guides talk about broad, low-cost index funds because they are simple. That is an idea to research, not a recommendation for you. Compare options using official and independent sources.` },
          ],
        },
        {
          type: 'calc',
          title: `Cash has a hidden enemy`,
          body: [
            `Prices tend to rise over time, called **inflation**. If cash sits still, each dollar buys less later. The calculator shows what $10,000 of cash today would buy in the future, measured in today's dollars, if prices rise 3% a year (an assumed number).`,
            { tip: `Inflation is one reason people invest for goals many years away. Cash is still the right place for money you need soon.` },
          ],
          calc: 'inflation',
          preset: { amount: 10000, years: 5, inflation: 3 },
          task: `Slide Years up until the lost buying power is more than $3,000.`,
          done: (o) => o.lost > 3000,
          hint: `Try somewhere around 15 years.`,
          success: `After 15 years at 3%, the same $10,000 only buys about $6,400 worth of today's goods. Waiting costs something too.`,
        },
        {
          type: 'read',
          title: `Risk and reward travel together`,
          body: [
            `In general, investments with the chance of higher growth also carry a higher chance of losing money. Anyone who offers high growth with no risk is either mistaken or lying (we cover this in the Scams course).`,
            `Over many years, stocks have historically grown faster than cash, but with some terrible years along the way. History is not a promise about the future.`,
          ],
        },
        {
          type: 'quiz',
          title: `Spot the sensible idea`,
          question: `Sam has $2,000 to invest for many years. Which approach spreads risk the best?`,
          options: [`All of it in the one company Sam likes most`, `All of it in whatever went up the most last month`, `A broad index fund that holds hundreds of companies`],
          answer: 2,
          explain: `A broad index fund spreads money over many companies. Putting everything in one company, or chasing last month's winner, concentrates risk.`,
        },
        {
          type: 'read',
          title: `What you learned`,
          body: [
            { list: [
              `Cash is steady but slow, bonds are loans, stocks are slices of ownership`,
              `Diversification spreads risk so one failure hurts less`,
              `An index fund holds many companies in one purchase`,
              `Inflation slowly shrinks what idle cash can buy`,
              `Higher possible growth always comes with higher risk`,
            ] },
          ],
        },
      ],
    },
    {
      id: 'investing-2',
      title: `Risk, time and fees`,
      minutes: 10,
      summary: `Why time horizon matters, how small yearly fees add up, and how to handle falling markets.`,
      steps: [
        {
          type: 'read',
          title: `The time horizon idea`,
          body: [
            `Your **time horizon** is how long until you need the money. Markets can bounce around wildly over one year, and still have a very different story over twenty.`,
            `That is why the same investment can be sensible for a goal 20 years away and a bad idea for a goal 6 months away.`,
            { table: { head: [`Goal`, `Time away`, `Sensible home (general idea)`], rows: [[`Phone upgrade`, `4 months`, `Cash savings`], [`Used car`, `3 years`, `Mostly cash and safe options`], [`Retirement`, `40 years`, `Can handle ups and downs`]] } },
          ],
        },
        {
          type: 'read',
          title: `Never invest money you need soon`,
          body: [
            `Suppose Jordan invests $1,500 meant for next month's rent and the market drops 20% that very week. Now only $1,200 is left, and rent is still $1,500.`,
            { rule: `Only invest money you will not need for years, after you have an emergency cushion in cash. Money you need soon belongs in a safe, boring place.` },
          ],
        },
        {
          type: 'quiz',
          title: `Where does this money belong?`,
          question: `Maya needs $800 for a school trip in 5 months. What is the sensible plan?`,
          options: [`Put it in a high-risk stock hoping to turn it into $1,500`, `Keep it in a savings account where it is safe`, `Lend it to a friend of a friend who promises double`],
          answer: 1,
          explain: `Money with a short deadline should stay safe. A drop right before you need it can't be undone, and promises of doubling are a scam warning sign.`,
        },
        {
          type: 'read',
          title: `Fees: the quiet leak`,
          body: [
            `Funds charge a yearly fee called an **expense ratio**, shown as a percent of what you hold. A 1% fee on $10,000 costs $100 every year, win or lose.`,
            { example: `Assume $10,000 grows 6% a year for 30 years: about $57,400. Charge a 1% yearly fee (so it grows 5%): about $43,200. The fee ate roughly $14,000, a quarter of the result.` },
            { tip: `Before buying any fund, look up its expense ratio. Lower is not automatically better in every case, but you should always know the number.` },
          ],
        },
        {
          type: 'calc',
          title: `Feel the fee`,
          body: [
            `Here is a plan: $1,000 to start and $200 a month for 30 years. We assumed 7% growth before costs. A fund charges 1.5% a year, so only about 5.5% reaches you. Watch how the end balance changes. These are assumed numbers, not predictions.`,
          ],
          calc: 'compound',
          preset: { principal: 1000, monthly: 200, rate: 7, years: 30 },
          task: `Set the growth rate to 5.5% and read the new ending balance.`,
          done: (o) => o.rate === 5.5 && o.years === 30,
          hint: `Drag Yearly growth rate down to 5.5.`,
          success: `The balance dropped from about $252,000 to about $188,000, roughly $64,000 lost to that fee alone. Small percentages compound too.`,
        },
        {
          type: 'read',
          title: `Markets fall, and that is normal`,
          body: [
            `Stock prices drop sometimes, even big drops. A fall of 50% needs a rise of 100% to get back, because you are climbing from a smaller number: $100 becomes $50, and $50 must double to return to $100.`,
            `People get hurt most by selling in panic after a fall, locking in the loss, and then missing the recovery. Others get hurt by buying because everyone is excited about something that already shot up.`,
          ],
        },
        {
          type: 'quiz',
          title: `Emotions test`,
          question: `A fund you own drops 15% in a month, and you do not need the money for 20 years. What is the more thoughtful first step?`,
          options: [`Sell everything right away to stop the pain`, `Check your plan and ask if anything about your goal has changed`, `Borrow money to buy more because it must bounce back`],
          answer: 1,
          explain: `If the goal and time horizon have not changed, a drop alone is rarely a reason to act. Never borrow to invest, because a bounce back is not guaranteed.`,
        },
        {
          type: 'read',
          title: `A handy shortcut: the rule of 72`,
          body: [
            `A quick mental trick: divide 72 by the yearly growth rate to estimate years to double. At an assumed 6%, 72 / 6 = 12 years. At 3%, 24 years.`,
            `It also works for costs: with 3% inflation, prices double in about 24 years.`,
          ],
        },
        {
          type: 'read',
          title: `What you learned`,
          body: [
            { list: [
              `Time horizon: money needed soon stays safe, money for far-off goals can ride out ups and downs`,
              `Never invest money you will need in the near future`,
              `Fees are charged every year and compound against you`,
              `A fall of 50% needs a rise of 100% to recover`,
              `Panic selling and chasing excitement are common mistakes`,
            ] },
          ],
        },
      ],
    },
    {
      id: 'investing-3',
      title: `Building a calm plan`,
      minutes: 10,
      summary: `Dollar-cost averaging, setting goals, and a simple checklist before you invest.`,
      steps: [
        {
          type: 'read',
          title: `Timing the market is a trap`,
          body: [
            `Many people try to buy at the very bottom and sell at the very top. Almost nobody manages it repeatedly, not even full-time professionals. Guessing wrong in either direction is costly.`,
            `A calmer idea is to invest a fixed amount on a regular schedule, whatever the news says.`,
          ],
        },
        {
          type: 'read',
          title: `Dollar-cost averaging`,
          body: [
            `**Dollar-cost averaging** means investing the same dollar amount at regular times, like $100 on the first of each month.`,
            { example: `Fictional fund price: month 1 is $10, month 2 is $5, month 3 is $10. $100 buys 10, then 20, then 10 shares: 40 shares for $300. Your average cost is $7.50 per share, lower than the simple average price of about $8.33.` },
            { warn: `It is not magic. It does not stop losses if prices keep falling. Its real value is turning a scary decision into a boring habit.` },
          ],
        },
        {
          type: 'quiz',
          title: `Check the example`,
          question: `You invest $50 a month. The price per share is $10 in month 1 and $5 in month 2. How many shares do you own after 2 months?`,
          options: [`10 shares`, `15 shares`, `20 shares`],
          answer: 1,
          explain: `$50 buys 5 shares at $10, and $50 buys 10 shares at $5. That is 15 shares for $100.`,
        },
        {
          type: 'read',
          title: `Start with a goal`,
          body: [
            `Before choosing anything, write down: what is this money for, and when do I need it? A goal with a date tells you how much risk makes sense.`,
            `Then find the monthly amount needed. The savings goal calculator works backwards from the target. Assumed growth is shown to teach the arithmetic, so test it with low numbers too, including zero growth.`,
          ],
        },
        {
          type: 'calc',
          title: `Make the goal fit`,
          body: [
            `Lena wants $5,000 in 3 years at an assumed 4% growth, which needs about $131 a month. That is more than she can afford. She can't change the goal, but she can give it more time.`,
          ],
          calc: 'goal',
          preset: { goal: 5000, years: 3, rate: 4 },
          task: `Raise Years until the monthly amount is under $100.`,
          done: (o) => o.monthly < 100,
          hint: `Try 5 years.`,
          success: `More time lowers the monthly amount. Time is often the most powerful lever you have.`,
        },
        {
          type: 'read',
          title: `Pay off the dangerous stuff first`,
          body: [
            `Credit card debt can charge 20% or more interest. Paying it off is a sure return of that size, which no investment can safely promise. A usual order of thinking: emergency cushion, high-interest debt, then investing for the long term.`,
            { tip: `Some employers or schools offer retirement plans with matching contributions. That is a bonus worth asking about. Check official sources for how it works where you live.` },
          ],
        },
        {
          type: 'quiz',
          title: `What comes first?`,
          question: `Dev has no emergency savings and owes $1,200 on a card charging 24% interest. What order makes the most sense?`,
          options: [`Put all spare cash into stocks first`, `Build a small cushion and pay the expensive debt before investing`, `Ignore the debt, since stocks always grow more than 24%`],
          answer: 1,
          explain: `Paying off 24% debt is a guaranteed gain, and a cushion protects you from selling investments at a bad time. Stocks do not always grow 24%.`,
        },
        {
          type: 'read',
          title: `Your pre-investing checklist`,
          body: [
            { steps: [
              `Do I have a small emergency cushion in cash?`,
              `Is any high-interest debt paid off or under control?`,
              `Do I know the goal, the date, and the monthly amount?`,
              `Do I understand what I am buying, and its fees?`,
              `Am I diversified, and can I live with a 30% drop without panic?`,
              `Is a trusted adult or licensed professional helping me check this?`,
            ] },
          ],
        },
        {
          type: 'read',
          title: `What you learned`,
          body: [
            { list: [
              `Dollar-cost averaging builds a habit instead of trying to time the market`,
              `Start from a goal and a date, then work out the monthly amount`,
              `Expensive debt and a cushion usually come before investing`,
              `Use the checklist before putting real money in`,
              `No lesson here is advice. Check official sources and ask a professional`,
            ] },
          ],
        },
      ],
    },
  ],
  exam: {
    passPercent: 70,
    questions: [
      { q: `Which of these is a loan you make to a company or government?`, options: [`A stock`, `A cash savings jar`, `A bond`], answer: 2, explain: `A bond is a loan. A stock is ownership, and cash is just money held in an account.` },
      { q: `What does diversification do?`, options: [`Spreads risk so one failure hurts less`, `Guarantees profits`, `Removes all market risk`], answer: 0, explain: `Spreading money out reduces the damage from any single failure, but it cannot remove the risk of the whole market falling.` },
      { q: `What is an index fund?`, options: [`A fund that copies a list of many companies`, `A guaranteed savings plan`, `A single stock chosen by experts`], answer: 0, explain: `An index fund tracks a list of companies, giving you a tiny share of all of them in one purchase.` },
      { q: `You will need $600 for a laptop in 3 months. Where should it stay?`, options: [`In a risky stock`, `Lent to an online stranger for a bonus`, `In a safe savings place`], answer: 2, explain: `Money with a short deadline needs to be safe, because markets can fall right before you need it.` },
      { q: `A fund charges a 1% expense ratio. On $20,000, what is the yearly fee?`, options: [`$20`, `$200`, `$2,000`], answer: 1, explain: `1% of $20,000 is $200, charged each year whether the fund did well or not.` },
      { q: `Using the rule of 72, about how long to double at an assumed 8% growth?`, options: [`9 years`, `6 years`, `12 years`], answer: 0, explain: `72 / 8 = 9 years. It is a quick estimate, and real growth is never steady.` },
      { q: `A stock falls from $100 to $50. What rise is needed to get back to $100?`, options: [`50%`, `75%`, `100%`], answer: 2, explain: `$50 has to double to reach $100, which is a 100% rise. Losses need bigger gains to recover.` },
      { q: `Ravi invests $100 a month. Prices are $10, $20, $10 in three months. How many shares does he own?`, options: [`20 shares`, `25 shares`, `30 shares`], answer: 1, explain: `$100 buys 10, then 5, then 10 shares. The total is 25 shares for $300.` },
      { q: `Your fund drops 20% but your goal is 25 years away and nothing has changed. What is usually wise?`, options: [`Panic sell now`, `Review your plan calmly before acting`, `Borrow to buy more`], answer: 1, explain: `Selling in a panic locks in a loss. Borrowing to invest adds risk. Check the plan first.` },
      { q: `Which statement is the most honest?`, options: [`This fund is guaranteed to return 10% a year`, `Higher possible growth comes with higher risk of loss`, `Experts can always tell when to buy and sell`], answer: 1, explain: `Risk and reward travel together. Anyone promising a guaranteed high return is a red flag.` },
      { q: `Priya holds $1,000 of cash for 15 years while prices rise about 3% a year. What most likely happens?`, options: [`It buys less than it does today`, `It buys more than today`, `Nothing changes`], answer: 0, explain: `With inflation, each dollar buys less over time, so idle cash slowly loses buying power.` },
      { q: `Which comes first for someone with 24% credit card debt and no cushion?`, options: [`Invest everything in stocks`, `Open a second credit card`, `Build a small cushion and deal with the debt`], answer: 2, explain: `Expensive debt and no safety net make investing riskier. Paying down 24% interest is a sure gain.` },
    ],
  },
};

export default course;
