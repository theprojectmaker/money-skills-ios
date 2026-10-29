import type { Course } from '../types';

const course: Course = {
  id: 'taxes',
  kind: 'life',
  title: 'Taxes Basics',
  icon: '🏛️',
  color: '#5B6EE1',
  level: 'Beginner',
  summary: `Understand why taxes exist, how your paycheck shrinks between gross and net, and why a raise never makes you poorer.`,
  outcomes: [
    `Explain what taxes pay for and the difference between gross and net pay`,
    `Read the main lines on a paycheck`,
    `Tell marginal rate from effective rate, and know why a raise never lowers take-home pay`,
    `Describe the standard deduction, filing a return and keeping records`,
    `Understand the basic ideas behind tax on investment gains and side income`,
  ],
  lessons: [
    {
      id: 'taxes-1',
      title: `Taxes, gross pay and net pay`,
      minutes: 8,
      summary: `Why taxes exist and what happens between the pay you are promised and the pay you receive.`,
      steps: [
        {
          type: 'read',
          title: `Before we start`,
          body: [
            `Taxes are money people and businesses pay to governments. This course teaches the **ideas**, using fictional people and round numbers.`,
            { warn: `This is NOT tax advice. Tax rules differ by country and change by year, and your own situation may be different. We say "in the US, for example" when we use real-world examples. Check official government sources or a licensed tax professional before making real decisions.` },
          ],
        },
        {
          type: 'read',
          title: `Why do taxes exist?`,
          body: [
            `Some things are too big or too shared for one person to buy: roads, public schools, fire departments, courts, military, parks, clean water systems, and help for people in need.`,
            `Taxes are how a community pays for those shared things. Common kinds include **income tax** (on money you earn), **sales tax** (added at the register), **property tax** (on land and buildings) and **payroll tax** (taken from paychecks for programs like retirement and health care benefits).`,
          ],
        },
        {
          type: 'quiz',
          title: `Name that tax`,
          question: `You buy a $20 shirt and $1.60 is added at the register. What kind of tax is that?`,
          options: [`Sales tax`, `Property tax`, `Payroll tax`],
          answer: 0,
          explain: `A tax added when you buy something is a sales tax. Property tax is on land and buildings, and payroll tax comes out of paychecks.`,
        },
        {
          type: 'read',
          title: `Gross versus net`,
          body: [
            `**Gross pay** is the amount you earn before anything is taken out. **Net pay** (take-home pay) is what actually lands in your bank account.`,
            { example: `Fictional worker Amara earns $3,000 gross in a month. Income tax withheld: $250. Payroll tax: about $230 (in the US, for example, roughly 7.65%). Health insurance she chose: $100. Net pay: $3,000 - $250 - $230 - $100 = **$2,420**.` },
            { tip: `Always plan your budget with net pay, not gross. Gross pay is not the money you can spend.` },
          ],
        },
        {
          type: 'read',
          title: `Reading a paycheck`,
          body: [
            { table: { head: [`Line`, `What it means`], rows: [[`Gross pay`, `Earnings before deductions`], [`Federal or national income tax`, `Withheld toward your yearly income tax`], [`State or local tax`, `Extra taxes, depending on where you live`], [`Payroll tax`, `Funds retirement and health programs (US examples)`], [`Benefits and retirement`, `Optional or chosen items such as health insurance`], [`Net pay`, `What you actually receive`]] } },
            `**Withholding** means your employer sends part of your pay to the government for you during the year. At tax time you find out if too much or too little was withheld. Too much gets refunded, too little means you owe.`,
          ],
        },
        {
          type: 'quiz',
          title: `Do the math`,
          question: `Noah's gross pay is $2,000. Taxes withheld total $300 and he chose $100 of other deductions. What is his net pay?`,
          options: [`$1,700`, `$1,600`, `$1,500`],
          answer: 1,
          explain: `$2,000 - $300 - $100 = $1,600. Net pay is gross pay minus everything taken out.`,
        },
        {
          type: 'calc',
          title: `Watch tax grow with income`,
          body: [
            `This teaching calculator uses a simplified, rounded model with a flat $14,000 deduction. It is NOT real tax math, so ignore the exact amounts and watch the pattern. Higher income means more tax in dollars.`,
          ],
          calc: 'tax',
          preset: { gross: 40000 },
          task: `Slide Yearly income up until the estimated tax is over $5,000.`,
          done: (o) => o.tax > 5000,
          hint: `Try somewhere around $58,000 to $60,000.`,
          success: `Tax dollars climb as income climbs. Next lesson shows why that does not mean a raise leaves you worse off.`,
        },
        {
          type: 'read',
          title: `Refunds are not free money`,
          body: [
            `A refund simply means too much was withheld during the year, so you gave the government an interest-free loan. A big refund is not a bonus. A big bill at tax time means too little was withheld.`,
            `Many people prefer a withholding that lands close to zero either way. How to adjust it depends on your country, so check official sources.`,
          ],
        },
        {
          type: 'quiz',
          title: `Refund thinking`,
          question: `A friend says: "I got a $900 refund, so I earned $900 extra!" What is the best reply?`,
          options: [`Yes, that is free money from the government`, `It was your own money, withheld earlier than needed`, `Refunds only happen if you broke a rule`],
          answer: 1,
          explain: `A refund returns money that was withheld in excess. It is your money coming back, not extra pay.`,
        },
        {
          type: 'read',
          title: `What you learned`,
          body: [
            { list: [
              `Taxes pay for shared things like roads, schools and emergency services`,
              `Income, sales, property and payroll taxes are common kinds`,
              `Gross pay is before deductions, net pay is what you take home`,
              `Withholding is tax sent for you during the year`,
              `A refund is your own money coming back, not a bonus`,
              `Always check official sources for the rules where you live`,
            ] },
          ],
        },
      ],
    },
    {
      id: 'taxes-2',
      title: `Marginal and effective rates`,
      minutes: 10,
      summary: `Why tax brackets do not work the way most people fear.`,
      steps: [
        {
          type: 'read',
          title: `The big myth`,
          body: [
            `Many people think: "If I earn more, I might move into a higher tax bracket and take home LESS than before." In an income tax with brackets, that does not happen.`,
            `Brackets work like **steps**. Only the money inside each step is taxed at that step's rate. Earning more only changes the rate on the **extra** dollars.`,
          ],
        },
        {
          type: 'read',
          title: `Two rates, two meanings`,
          body: [
            `**Marginal rate**: the tax rate on your next dollar of income, the top step you reach.`,
            `**Effective rate**: your total tax divided by your total income. It is the average, and always lower than the marginal rate when there are lower steps below.`,
            { example: `Our teaching model, income $52,000. After a flat $14,000 deduction, $38,000 is taxed. The first $11,000 at 10% = $1,100. The next $27,000 at 12% = $3,240. Total tax $4,340. Marginal rate is 12%. Effective rate is $4,340 / $52,000 = about 8.3%.` },
            { rule: `The teaching model is rounded and simplified, and real rules include many more details such as credits and other taxes. Use it to understand the shape, not to compute your own tax.` },
          ],
        },
        {
          type: 'quiz',
          title: `Which rate is which?`,
          question: `Your total tax was $5,000 on income of $50,000. Which statement is correct?`,
          options: [`Your marginal rate is 10%`, `Your effective rate is 10%`, `Both of your rates must be exactly 10%`],
          answer: 1,
          explain: `$5,000 / $50,000 = 10% is the effective (average) rate. The marginal rate is the rate on your next dollar and could be higher.`,
        },
        {
          type: 'calc',
          title: `Marginal high, effective low`,
          body: [
            `Find an income where the next dollar is taxed at 22% (marginal), but your overall average is still under 10% (effective). This shows how the lower steps keep the average down.`,
          ],
          calc: 'tax',
          preset: { gross: 40000 },
          task: `Set the income so the marginal rate is 22% while the effective rate is under 10%.`,
          done: (o) => o.marginal === 22 && o.effective < 10,
          hint: `The 22% step starts around $59,000 of income in this model. Stay just above it, below roughly $65,000.`,
          success: `Only the money above the step is taxed at 22%. Everything lower was taxed at the lower rates.`,
        },
        {
          type: 'read',
          title: `Why a raise never lowers take-home pay`,
          body: [
            `Suppose you earn $60,000 and get a $1,000 raise that pushes part of it into a higher step. Even if that extra $1,000 is taxed at 22%, you keep $780 of it. You are better off by $780, not worse off.`,
            { tip: `Real life has a few special cases, like benefits that phase out as income rises. That is different from the bracket system itself. Check official sources if you are near such a limit.` },
          ],
        },
        {
          type: 'quiz',
          title: `Raise or not?`,
          question: `Eli is offered a $2,000 raise, but the extra income would be taxed at a higher marginal rate of 24%. How much of the raise does Eli keep before other deductions?`,
          options: [`None, higher tax erases the raise`, `$1,520`, `$480`],
          answer: 1,
          explain: `24% of $2,000 is $480 in tax. So Eli keeps $1,520. Only the extra dollars face the higher rate.`,
        },
        {
          type: 'calc',
          title: `Prove it yourself`,
          body: [
            `Start at $60,000 income, where the model shows take-home pay (Left after this tax) of about $54,600. Raise your income until your take-home reaches $60,000 or more, and notice that every extra $1,000 of gross still adds hundreds of dollars to take-home pay.`,
          ],
          calc: 'tax',
          preset: { gross: 60000 },
          task: `Raise Yearly income until the amount left after tax is $60,000 or more.`,
          done: (o) => o.net >= 60000,
          hint: `You need roughly $67,000 gross in this model.`,
          success: `Net pay climbed the whole way. More gross income means more take-home pay, always, in this kind of system.`,
        },
        {
          type: 'read',
          title: `Deductions and credits`,
          body: [
            `A **deduction** lowers the income that is taxed. A **credit** lowers the tax itself, dollar for dollar, so it is usually more powerful than a deduction of the same size.`,
            `Example: a $1,000 deduction at a 12% marginal rate saves about $120. A $1,000 credit saves the full $1,000.`,
          ],
        },
        {
          type: 'read',
          title: `What you learned`,
          body: [
            { list: [
              `Brackets are steps: only the income inside each step gets that step's rate`,
              `Marginal rate = tax on the next dollar. Effective rate = total tax / total income`,
              `A raise can't make you take home less in a bracket system`,
              `A credit reduces the tax itself, a deduction reduces taxable income`,
              `Our calculator is a rounded teaching model, not tax math for real life`,
            ] },
          ],
        },
      ],
    },
    {
      id: 'taxes-3',
      title: `Filing, records, gains and side income`,
      minutes: 10,
      summary: `The practical habits that keep tax time calm, including investments and side jobs.`,
      steps: [
        {
          type: 'read',
          title: `Standard deduction and filing a return`,
          body: [
            `In the US, for example, most people get a **standard deduction**: a set amount of income that is simply not taxed. Some people choose to list their own deductions instead if that adds up to more.`,
            `A **tax return** is a yearly form where you report what you earned, what was already withheld, and settle the difference. Employers and banks send forms with the numbers you need. Whether you must file depends on your age, income and situation, so check official sources.`,
          ],
        },
        {
          type: 'quiz',
          title: `Why file?`,
          question: `Why might someone file a tax return even if they earned very little?`,
          options: [`To pay extra tax for fun`, `To get back money that was withheld from their pay`, `Because the form makes taxes disappear`],
          answer: 1,
          explain: `If tax was withheld but your income is low, filing is often how you get that money back. Always check the official rules for your case.`,
        },
        {
          type: 'read',
          title: `Keep your records`,
          body: [
            `Keep pay stubs, tax forms, receipts for anything you plan to deduct, and a copy of each return. Many places suggest keeping records for several years, so check the official guidance.`,
            { tip: `Make one folder, paper or digital, called "Taxes" and drop things in as they arrive. Future you will be grateful.` },
          ],
        },
        {
          type: 'read',
          title: `Tax on investment gains`,
          body: [
            `A **capital gain** is profit when you sell an investment for more than you paid. Generally, no gain is counted until you **sell**. A price rise on paper is not taxed yet.`,
            `In the US, for example, a gain on something held **one year or less** is generally taxed like ordinary income (short-term), while one held **longer than a year** often gets a lower rate (long-term). Details change often.`,
            { example: `Fictional: Mina buys $1,000 of a fund, and later sells it for $1,300. Her gain is $300, and that $300, not $1,300, is what gets taxed. If she sold for $800, she has a loss of $200, which may reduce her taxes in some systems.` },
            { warn: `Rules about gains, losses, retirement accounts and taxes on interest differ by country. Look up official guidance before you sell.` },
          ],
        },
        {
          type: 'quiz',
          title: `Gain check`,
          question: `Mina bought a fictional fund for $2,000 and sold it for $2,500. What is her capital gain?`,
          options: [`$2,500`, `$500`, `$2,000`],
          answer: 1,
          explain: `Gain = sale price - purchase price = $2,500 - $2,000 = $500. Only the gain is the profit that can be taxed.`,
        },
        {
          type: 'read',
          title: `Side income counts`,
          body: [
            `Money from a side gig (dog walking, tutoring, selling things you made) is generally income, even when no one sends you a form. In the US, for example, self-employed people often pay both halves of payroll tax, and usually must make payments during the year rather than all at once.`,
            { rule: `Set aside a share of every side-income payment for taxes as soon as it arrives. Many people start with about a quarter to a third until they learn their real number. Check official sources for your own figure.` },
            `Track what you earned and what you spent on the work. Costs that are really for the business may reduce the income that is taxed.`,
          ],
        },
        {
          type: 'calc',
          title: `Make room for the tax set-aside`,
          body: [
            `Kai's monthly take-home is $3,500, including side gig money. Needs are $1,700 and wants $1,500, so only $300 is saved. Trim wants so that a healthy part is kept: at least 20% of income saved, some of it earmarked for the tax bill.`,
          ],
          calc: 'budget',
          preset: { income: 3500, needs: 1700, wants: 1500 },
          task: `Lower Wants until the saving rate is at least 20%.`,
          done: (o) => o.rate >= 20,
          hint: `Wants near $1,100 does it.`,
          success: `Saving 20% gives you room for taxes, a cushion and goals. Plan taxes early, not at the deadline.`,
        },
        {
          type: 'quiz',
          title: `Side gig scenario`,
          question: `Sara earns $500 tutoring neighbors for cash. What is the best habit?`,
          options: [`Ignore it, since no form was sent`, `Keep a record and set some aside for taxes, then check the official rules`, `Spend it all right away`],
          answer: 1,
          explain: `Side income is generally taxable even without a form. Recording it and setting money aside avoids a nasty surprise.`,
        },
        {
          type: 'read',
          title: `What you learned`,
          body: [
            { list: [
              `A standard deduction leaves part of your income untaxed`,
              `Filing a return settles what was withheld versus what you owe`,
              `Keep records: pay stubs, forms, receipts and returns`,
              `Capital gains are taxed when you sell, and holding longer is often treated differently`,
              `Side income generally counts, so track it and set money aside`,
              `Rules vary by country and year, so use official sources`,
            ] },
          ],
        },
      ],
    },
  ],
  exam: {
    passPercent: 70,
    questions: [
      { q: `Which is a tax added to the price when you buy something?`, options: [`Sales tax`, `Property tax`, `Payroll tax`], answer: 0, explain: `Sales tax is added at the register. Property tax is on land and buildings, and payroll tax comes out of paychecks.` },
      { q: `What is net pay?`, options: [`Pay before deductions`, `The amount you promise to save`, `Pay after taxes and other deductions`], answer: 2, explain: `Net pay is what remains after taxes and other deductions, the amount you can really spend.` },
      { q: `Gross pay is $4,000. Deductions total $900. What is net pay?`, options: [`$3,000`, `$3,100`, `$4,900`], answer: 1, explain: `$4,000 - $900 = $3,100.` },
      { q: `Which budgeting number should you plan with?`, options: [`Net pay`, `Gross pay`, `Whatever your friend earns`], answer: 0, explain: `Net pay is what really reaches you, so plans built on gross pay overshoot.` },
      { q: `What does withholding mean?`, options: [`Your employer keeps your pay for a year`, `Part of your pay is sent to the government during the year`, `You skip a tax by hiding income`], answer: 1, explain: `Withholding sends part of each paycheck toward your tax during the year.` },
      { q: `Your total tax is $6,000 on $60,000 of income. What is your effective rate?`, options: [`6%`, `10%`, `60%`], answer: 1, explain: `$6,000 / $60,000 = 10%. The effective rate is total tax divided by total income.` },
      { q: `A raise pushes some of your income into a higher bracket. What happens to take-home pay?`, options: [`It goes down below what it was`, `It stays exactly the same`, `It still goes up, because only the extra dollars face the higher rate`], answer: 2, explain: `Brackets are steps. Only income in the higher step gets the higher rate, so net pay still rises.` },
      { q: `Which usually lowers your tax more for the same dollar amount?`, options: [`A $500 deduction`, `A $500 credit`, `Both are exactly the same`], answer: 1, explain: `A credit reduces the tax itself, dollar for dollar. A deduction only reduces the income being taxed.` },
      { q: `You received a $700 refund. What does it most likely mean?`, options: [`You earned $700 extra`, `The government owed you a prize`, `More was withheld than you owed`], answer: 2, explain: `A refund returns money that was withheld in excess. It is your own money.` },
      { q: `Ben sells a fictional fund for $1,800 that he bought for $1,500. What is the gain?`, options: [`$300`, `$1,500`, `$1,800`], answer: 0, explain: `$1,800 - $1,500 = $300. Only the profit is the gain.` },
      { q: `In the US, for example, what is the general idea behind short-term versus long-term gains?`, options: [`There is no difference`, `Selling sooner and later always costs the same`, `Holding longer than a year is often taxed at a lower rate`], answer: 2, explain: `Many tax systems treat longer-held investments more gently. Check official rules for your country and year.` },
      { q: `Tia earns $300 from a weekend side gig and gets no tax form. What is the best move?`, options: [`Track it and set some aside, then check the rules`, `Assume it doesn't count`, `Hide it in a drawer and forget`], answer: 0, explain: `Side income is generally taxable even without a form. Keep records and set money aside.` },
    ],
  },
};

export default course;
