import type { Course } from '../types';

const course: Course = {
  id: 'sidebiz',
  kind: 'life',
  title: 'Side Business and Freelancing',
  icon: '🚀',
  color: '#f97316',
  level: 'Beginner',
  summary: 'Learn how to test an idea cheaply, count your real costs and time, and keep your money organised if you start earning on the side.',
  outcomes: [
    'Spot a problem real people will pay to solve, and test it with 3 real customers before spending money',
    'Tell revenue, costs and profit apart, and count your own time as a cost',
    'Work out the hourly rate you need using billable hours, costs and a tax set-aside',
    'Budget your time so a side project does not burn you out',
    'Keep simple records and separate personal money from business money',
    'Set money aside for taxes and plan a realistic first month',
  ],
  lessons: [
    {
      id: 'sidebiz-1',
      title: 'Find a problem people will pay for',
      minutes: 9,
      summary: 'Start with a real need, test it with 3 customers, and learn the difference between revenue, costs and profit.',
      steps: [
        {
          type: 'read',
          title: 'An honest start',
          body: [
            `A side business is any way of earning money outside a regular job or school. Walking dogs, designing logos, tutoring, baking for a market stall and fixing bikes all count.`,
            `Here is the honest part first: **most side projects earn little at first**, and some earn nothing. You spend time before you get paid, and there are costs and taxes to think about. Nobody can promise you an income, and this course will not either.`,
            { tip: `What a side project *can* give you is skills, a small amount of extra money if it goes well, and a cheap way to learn what you like. Treat the first few months as practice.` },
          ],
        },
        {
          type: 'read',
          title: 'Start with a problem, not a product',
          body: [
            `Beginners often start with "I love making candles, so I will sell candles." A stronger start is a problem: **something people already pay for, or already complain about.**`,
            {
              list: [
                `Ask yourself: what do people around me pay for, or wish someone would do? (Walk the dog, fix a slow laptop, help with maths homework.)`,
                `Look for a problem you can solve with skills you already have.`,
                `Prefer problems that come back every week or month. Repeat customers are worth much more than one-off ones.`,
              ],
            },
            {
              example: `Tomas is 15. Three neighbours work late and their dogs wait all day. That is a real, repeating problem. "I will walk your dog for $10, three times a week" is a clear offer. "I like dogs" is only a feeling.`,
            },
          ],
        },
        {
          type: 'quiz',
          title: 'Which idea is stronger?',
          question: `Which idea starts from a real problem?`,
          options: [
            `"I will sell hand-painted phone cases because I enjoy painting."`,
            `"Two of my neighbours keep asking who can mow their lawns on weekends, so I will offer lawn mowing."`,
            `"I will make a mobile app, because apps make money."`,
          ],
          answer: 1,
          explain: `Idea 2 starts from people who have already shown a need. The others start from what the seller likes, or from a guess that something will sell. Liking your work matters, but a need that already exists is what makes people pay.`,
        },
        {
          type: 'read',
          title: 'Test with 3 real customers before you spend',
          body: [
            `Before you buy equipment, print flyers or build a website, find **3 real people who say yes to paying you**. Not friends who say "great idea!" but people who hand over money, even a small deposit, or at least commit to a date.`,
            {
              steps: [
                `Describe your offer in one sentence with a price.`,
                `Ask 3 people who actually have the problem. Listen to what they say, including the objections.`,
                `If at least one pays or books, do the first job with what you already own.`,
                `Spend money on better tools only after the jobs show it is worth it.`,
              ],
            },
            { warn: `Compliments are free and prove nothing. "That sounds cool" is not a customer. Only a yes with money or a booked date counts.` },
          ],
        },
        {
          type: 'quiz',
          title: 'Spend now or test first?',
          question: `Priya wants to sell custom logos. She is about to buy a $300 drawing tablet. What is the smarter first move?`,
          options: [
            `Buy the tablet now so she looks professional.`,
            `Order business cards and a banner first.`,
            `Offer logos to 3 real people for a small fee, using the mouse and free software she already has.`,
          ],
          answer: 2,
          explain: `Testing with 3 real customers costs almost nothing and tells her whether anyone will pay. If three people say yes, the tablet becomes a smart investment. If they all say no, she just saved $300.`,
        },
        {
          type: 'read',
          title: 'Revenue, costs and profit',
          body: [
            `Three words you must keep apart:`,
            {
              table: {
                head: ['Word', 'Meaning', 'Example'],
                rows: [
                  ['Revenue', 'All the money customers pay you', '$200'],
                  ['Costs', 'What you spent to earn it', '$30'],
                  ['Profit', 'Revenue minus costs', '$170'],
                ],
              },
            },
            { rule: `Profit = revenue - costs. Revenue is not yours to keep. Profit is.` },
            `Now count your time. Tomas earns $200 a month from 20 walks and spends about $30 on bags, treats and a lead. But each walk takes 45 minutes, so 20 walks is 15 hours. His $170 profit works out to about **$11 an hour**. That is still fine for a first job, but it is worth knowing.`,
          ],
        },
        {
          type: 'calc',
          title: 'Make a stall profitable',
          body: [
            `Marcus bakes cookies for a weekend market stall. Each cookie costs $4 to make. The stall fee and packaging are **$150 a month** of fixed costs. He sells about 60 cookies a month.`,
            `Right now he prices at a 20% margin, which is about $5 a cookie, and loses money. Try a higher margin or more sales. Watch how the monthly profit changes.`,
          ],
          calc: 'pricing',
          preset: { cost: 4, margin: 20, fixed: 150, units: 60 },
          task: `Change the margin or the items sold so the monthly profit is at least $100.`,
          done: (o) => o.profit >= 100,
          hint: `Raising the margin to about 50% means a price near $8. Remember that customers must be willing to pay it, so test your price with real people.`,
          success: `Notice that profit grew either through a higher price or more sales. In real life both are limited by what customers will pay and by your time.`,
        },
        {
          type: 'read',
          title: 'Check the rules where you live',
          body: [
            `Rules differ by place. There can be minimum ages for certain jobs, permits or licences (for example for food, driving or working with children), and tax rules about when you must report income.`,
            { warn: `Before you start, talk to a parent or another trusted adult and check your local rules. A quick call or an official government website can save you from fines or trouble later.` },
          ],
        },
        {
          type: 'quiz',
          title: 'Spot the profit',
          question: `A tutor earns $300 in a month and spends $60 on printing and a small ad. What is the profit?`,
          options: [`$360`, `$240`, `$60`],
          answer: 1,
          explain: `Profit is revenue minus costs: $300 - $60 = $240. The $300 is revenue, and the $60 is what it cost to earn it. Do not forget to compare profit with the hours worked.`,
        },
        {
          type: 'read',
          title: 'What you learned',
          body: [
            {
              list: [
                `Most side projects earn little at first. Treat early months as practice.`,
                `Start from a real problem that repeats, not from what you merely like.`,
                `Test with 3 real customers who say yes with money or a booked date before you spend.`,
                `Profit = revenue - costs. Count your time too.`,
                `Rules for age, licences and taxes differ by place: check with an adult.`,
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'sidebiz-2',
      title: 'Your hourly rate and your time',
      minutes: 10,
      summary: 'Work out what you must charge per hour, why billable hours are fewer than worked hours, and how to avoid burning out.',
      steps: [
        {
          type: 'read',
          title: 'Why "what feels fair" is risky',
          body: [
            `New freelancers often pick a number that feels fair, like $15 an hour. The problem: that number ignores costs, taxes, and the hours you work but cannot bill.`,
            `A better way is to work **backwards** from the money you want to keep.`,
            {
              steps: [
                `Decide the yearly take-home income you want.`,
                `Add the money you will owe in taxes (set aside a percentage).`,
                `Add yearly business costs, like software, supplies and phone.`,
                `Divide by the hours you can truly bill to customers.`,
              ],
            },
          ],
        },
        {
          type: 'read',
          title: 'Worked hours are not billable hours',
          body: [
            `Priya, a student logo designer, works 10 hours in a week. Only 6 of them are spent designing for a paying customer. The rest is emails, finding clients, quotes, fixing files and waiting for replies.`,
            { example: `10 hours worked, 6 billable. If she earns $120 for the week, that is $20 per billable hour but only **$12 for every hour she worked**.` },
            `So when you plan a rate, use billable hours, not all hours. A weekly 20 hours of work may only have 10 to 14 billable hours at the start.`,
            { tip: `Also count weeks off: holidays, exams and sick days. Nobody bills 52 weeks a year.` },
          ],
        },
        {
          type: 'quiz',
          title: 'Real hourly pay',
          question: `Priya earns $120 for a week in which she worked 10 hours in total. What is her real pay per worked hour?`,
          options: [`$20`, `$12`, `$6`],
          answer: 1,
          explain: `$120 divided by 10 hours worked is $12 an hour. Only dividing by billable hours (6) would give $20, which hides all the unpaid work behind it.`,
        },
        {
          type: 'calc',
          title: 'Find the rate you need',
          body: [
            `Sam is a tutor who wants to keep some real money but only has limited hours. He sets a yearly take-home goal, small business costs, a tax set-aside and a number of billable hours per week.`,
            `At his starting numbers he would need to charge over $100 an hour, which is probably more than students will pay. Adjust the sliders to reach a rate students might accept.`,
          ],
          calc: 'freelance',
          preset: { target: 30000, expenses: 1000, taxPct: 20, hours: 8, weeksOff: 6 },
          task: `Keep the take-home target at $20,000 or more and bring the minimum hourly rate down to $45 or less.`,
          done: (o) => o.target >= 20000 && o.rate <= 45,
          hint: `You have two honest levers: take more billable hours (but that costs your free time) or aim for a smaller target while the business is young.`,
          success: `Notice what it took. A modest goal plus 12 to 14 billable hours a week gets the rate into a believable range. Rates only work if customers will really pay them.`,
        },
        {
          type: 'read',
          title: 'Budget your time like money',
          body: [
            `Time is the other thing you spend. A side project sits on top of school or work, sleep, friends and rest.`,
            {
              list: [
                `Write down your fixed hours (school, job, sleep, family) before you decide how many hours the side project gets.`,
                `Start small: 4 to 6 hours a week is a lot for many students.`,
                `Block those hours on a calendar, and keep at least one full day off.`,
                `Say no to a job when your week is full. A late or sloppy job costs you a customer.`,
              ],
            },
            { warn: `Burnout is real. If you stop sleeping, skip meals or dread every message from a customer, the project is costing more than it gives. Slow down and talk to someone.` },
          ],
        },
        {
          type: 'read',
          title: 'The cheap-rate trap',
          body: [
            `If you price far too low to win jobs, you work more hours for the same money, which burns you out faster. A low price also attracts customers who haggle the most.`,
            `A better plan: charge a fair rate, deliver well, and ask happy customers to recommend you. Raise your rate after a few successful jobs.`,
            { tip: `If a customer says your price is too high, you can offer a smaller package at a lower price instead of cutting your hourly rate.` },
          ],
        },
        {
          type: 'quiz',
          title: 'Choose the healthy plan',
          question: `Lena has exams in two weeks and already works 25 hours a week at school. A client asks for a rush job. What is the healthiest reply?`,
          options: [
            `Say yes, and stay up all night to finish.`,
            `Say yes to avoid disappointing the client, then work out the details later.`,
            `Politely say you cannot fit it in right now, and offer a date after exams.`,
          ],
          answer: 2,
          explain: `Taking on too much leads to poor work, stress and lost customers. Offering a later date is honest and professional, and many clients will wait for someone who does good work.`,
        },
        {
          type: 'read',
          title: 'A realistic first year',
          body: [
            `Many side businesses make only a little money in the first year, and some stop. That is normal, and the skills stay with you: talking to customers, managing time and tracking money.`,
            `Do not quit school or a steady job on the hope of income that has not arrived yet. Grow slowly, and let the earnings prove themselves first.`,
          ],
        },
        {
          type: 'read',
          title: 'What you learned',
          body: [
            {
              list: [
                `Work backwards: take-home goal + taxes + costs, divided by billable hours.`,
                `Worked hours are more than billable hours. Plan with billable ones, and count weeks off.`,
                `Budget your time first. Protect sleep, school and one day off.`,
                `Pricing too low means more hours for the same money.`,
                `Do not rely on side income that has not arrived yet.`,
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'sidebiz-3',
      title: 'Records, taxes and your first month',
      minutes: 11,
      summary: 'Keep simple records, separate your money, set aside tax, pay yourself, and plan a calm first month.',
      steps: [
        {
          type: 'read',
          title: 'Keep business money apart',
          body: [
            `The easiest habit to start is also one of the most useful: **keep business money separate from personal money.**`,
            {
              list: [
                `If you are a minor, ask a parent or guardian to help you open a suitable account where money for the project is kept.`,
                `Pay business costs from that account only, and put customer payments into it.`,
                `Move money to yourself on purpose (see "pay yourself" later in this lesson).`,
              ],
            },
            `When everything is mixed together, you cannot tell if the project is making money, and you cannot prove your income if someone asks.`,
          ],
        },
        {
          type: 'read',
          title: 'Simple records beat perfect records',
          body: [
            `You do not need fancy software. A notebook or a spreadsheet with a few columns is enough.`,
            {
              table: {
                head: ['Date', 'What', 'Money in', 'Money out'],
                rows: [
                  ['Mar 2', 'Dog walk for Mrs. Lee', '$10', ''],
                  ['Mar 3', 'Poop bags', '', '$4'],
                  ['Mar 5', 'Dog walk for Mr. Cruz', '$10', ''],
                ],
              },
            },
            { tip: `Keep receipts, photos of receipts, or screenshots of payments. Add a line every time money moves, and add up each month.` },
          ],
        },
        {
          type: 'quiz',
          title: 'Why separate the money?',
          question: `Why is it smart to keep business and personal money in separate places?`,
          options: [
            `So you can clearly see whether the project makes a profit, and prove your income if asked.`,
            `Because it makes your income smaller on paper.`,
            `It is not important when the amounts are small.`,
          ],
          answer: 0,
          explain: `Separate money means clean records and honest numbers. It does not change how much you earn, and small projects benefit the most because a few dollars of confusion can hide the whole picture.`,
        },
        {
          type: 'read',
          title: 'Taxes: set a share aside',
          body: [
            `In many places, money you earn from self-employment is income, and you may owe tax on it. Nobody takes tax out of your payment automatically, so **you** must set money aside. Rules and thresholds differ by country and age, and small earnings may be treated differently, so check locally with an adult or a tax office.`,
            { rule: `A simple habit: when a payment arrives, move a set share (many people start with 20% to 30%) into a separate "taxes" pot, and do not touch it.` },
            `If it turns out you owe less, you keep the extra. If you owe more, you are ready. Either way, you avoid a nasty surprise.`,
            { warn: `The calculator below is a rounded teaching model, not tax advice. It leaves out payroll tax, state tax and credits. Always check official sources for your place.` },
          ],
        },
        {
          type: 'calc',
          title: 'See how tax grows with income',
          body: [
            `The teaching estimator uses simplified brackets and a flat $14,000 deduction. Low income might owe nothing. As income rises, more of it is taxed.`,
            `Start at a low income and slowly slide it up. Watch the estimated tax and the effective rate.`,
          ],
          calc: 'tax',
          preset: { gross: 12000 },
          task: `Move the yearly income up until the estimated tax reaches $1,000 or more.`,
          done: (o) => o.tax >= 1000,
          hint: `Tax only starts after the deduction, so the first part of the income owes nothing. Try a gross income around $25,000.`,
          success: `See how the effective rate stays far below the marginal rate. A set-aside of 20% to 30% usually covers this simple model and leaves room for items the model ignores.`,
        },
        {
          type: 'quiz',
          title: 'A payment arrives',
          question: `Maya gets paid $200 by a customer. She has decided to set aside 25% for taxes. How much goes into her tax pot?`,
          options: [`$25`, `$20`, `$50`],
          answer: 2,
          explain: `25% of $200 is $50. Doing it the moment the money arrives is easier than trying to find $50 later, when it has been spent.`,
        },
        {
          type: 'read',
          title: 'Pay yourself on purpose',
          body: [
            `Once a month, after costs and tax set-aside, decide how much you will move to your personal money. This is your "pay". Leave a cushion in the business account for the next month's costs.`,
            { example: `Marcus's stall earned $480 this month. Costs were $150, tax pot got $100. He keeps $230. He pays himself $150 and leaves $80 as a buffer for next month's stall fee.` },
          ],
        },
        {
          type: 'calc',
          title: 'Plan the pay you take',
          body: [
            `Marcus takes $800 a month into his personal budget from the stall plus a weekend job. Using the budget planner, he wants to build a small cushion.`,
            `Right now needs and wants take almost everything. Trim the wants so he saves at least 20% of the $800.`,
          ],
          calc: 'budget',
          preset: { income: 800, needs: 300, wants: 450 },
          task: `Lower the wants so the saving rate is 20% or higher.`,
          done: (o) => o.rate >= 20,
          hint: `20% of $800 is $160. So needs plus wants must stay at $640 or less.`,
          success: `Paying yourself a set amount and saving from it first gives you a cushion even when the project has a slow month.`,
        },
        {
          type: 'read',
          title: 'Your first-month plan',
          body: [
            {
              steps: [
                `Week 1: pick one problem and one clear offer with a price. Check local rules with an adult.`,
                `Week 2: ask 3 real people. Take a deposit or a booked date if you can.`,
                `Week 3: do the first jobs with what you own. Write every cost and payment in your sheet.`,
                `Week 4: add it up. Revenue, costs, profit, hours worked, and a tax pot. Decide: continue, change, or stop.`,
              ],
            },
            { tip: `Stopping can be the right answer. If the numbers do not work, you learned something at a small cost.` },
          ],
        },
        {
          type: 'quiz',
          title: 'End of month one',
          question: `After month one, Devon made $60 profit but spent 30 hours on the project. What is the smartest next step?`,
          options: [
            `Ignore the hours and celebrate the profit.`,
            `Quit school activities to work more.`,
            `Look at the numbers honestly: $2 an hour. Decide whether to raise prices, cut unpaid work, or move on.`,
          ],
          answer: 2,
          explain: `$60 divided by 30 hours is $2 an hour. Early months are often low, but the numbers tell you what to change. Ignoring hours hides the problem; sacrificing other things for it is risky.`,
        },
        {
          type: 'read',
          title: 'What you learned',
          body: [
            {
              list: [
                `Keep business and personal money separate. Ask an adult for help if you are a minor.`,
                `A simple sheet of money in and money out is enough.`,
                `Set aside a share for taxes the moment money arrives, and check local rules.`,
                `Pay yourself a set amount, and leave a buffer.`,
                `Run a first-month plan, then decide: continue, change or stop.`,
              ],
            },
          ],
        },
      ],
    },
  ],
  exam: {
    passPercent: 70,
    questions: [
      {
        q: `What is the best starting point for a side business idea?`,
        options: [`Something you enjoy, whether or not anyone needs it`, `A real, repeating problem that people already pay for or complain about`, `The idea that looks the most impressive online`],
        answer: 1,
        explain: `Real problems come with real buyers. Enjoying the work is a bonus, but a need that already exists is what makes people pay.`,
      },
      {
        q: `Before spending on tools, what should you do first?`,
        options: [`Find 3 real people who will commit to paying or booking`, `Wait until you feel completely ready`, `Buy the best equipment so the work looks professional`],
        answer: 0,
        explain: `Three real yeses cost almost nothing to collect and tell you whether the idea is worth money. Compliments do not count; payments or booked dates do.`,
      },
      {
        q: `A tutor earns $400 in a month and spends $70 on materials. What is the profit?`,
        options: [`$470`, `$70`, `$330`],
        answer: 2,
        explain: `Profit = revenue - costs = $400 - $70 = $330. Remember to also divide by hours if you want to know your real hourly pay.`,
      },
      {
        q: `Which statement about revenue and profit is true?`,
        options: [`Revenue is the money you keep; profit is the money customers pay`, `Revenue is all the money customers pay; profit is what is left after costs`, `They mean the same thing`],
        answer: 1,
        explain: `Revenue is the total coming in. Profit is revenue minus the costs of earning it. A project can have high revenue and tiny profit.`,
      },
      {
        q: `Dara wants $30,000 take-home per year. Which items should she add before choosing an hourly rate?`,
        options: [`Only the cost of her phone`, `Nothing; $30,000 divided by hours is enough`, `Taxes to set aside, business costs, and weeks off`, `Only the taxes`],
        answer: 2,
        explain: `Take-home is after tax, so she needs to earn more than that before tax, plus the business's costs. Then divide by billable hours, which depend on weeks off.`,
      },
      {
        q: `Which is the best reason to keep business money in a separate account?`,
        options: [`It shows clearly whether the project makes a profit`, `It lets you hide income`, `It is required for any amount, however small`],
        answer: 0,
        explain: `Clean separation gives honest numbers and easier records. It never changes what you must report, and some rules do depend on place, so check locally.`,
      },
      {
        q: `Priya worked 12 hours in a week but billed only 8 of them, earning $240. What is her pay per billable hour?`,
        options: [`$20`, `$12`, `$30`, `$8`],
        answer: 2,
        explain: `$240 divided by 8 billable hours is $30. But per worked hour it is only $20. Both numbers matter: the first helps you set rates, the second shows your real pay.`,
      },
      {
        q: `Which is the most sensible way to plan tax on self-employment income?`,
        options: [`Wait until the end of the year and hope there is money left`, `Assume you owe nothing`, `Move a set share of each payment into a separate pot and check local rules`, `Spend it all and borrow later`],
        answer: 2,
        explain: `Setting aside money as it arrives means you are ready, and any extra is a bonus. Nobody can promise you owe nothing, since rules differ by place and age.`,
      },
      {
        q: `A customer offers $100 for a job that will cost you $120 in materials alone. What is your best response?`,
        options: [`Accept, because the customer is happy`, `Decline or renegotiate, since you would lose money on it`, `Accept and hide the loss in your records`],
        answer: 1,
        explain: `Revenue below costs means a loss even before counting your time. Politely renegotiating or declining protects the business, and a fair customer will understand.`,
      },
      {
        q: `Why is it risky to quit a steady job or stop school activities because of early side income?`,
        options: [`Because side projects always fail`, `Because side income often starts small and uneven, and is not guaranteed`, `Because tax rules forbid it`, `Because customers dislike it`],
        answer: 1,
        explain: `Early income is usually small and unpredictable. Let the project prove itself over many months before making big life changes.`,
      },
      {
        q: `A market-stall baker sells 80 cookies at $5 each. Each cookie costs $2 to make. The stall fee is $100. What is the monthly profit?`,
        options: [`$140`, `$300`, `$240`],
        answer: 0,
        explain: `Revenue is 80 x $5 = $400. Cookie costs are 80 x $2 = $160 and the fee is $100. Profit = $400 - $160 - $100 = $140.`,
      },
      {
        q: `At the end of month one, a project made a small profit but took far too many hours. What should you do?`,
        options: [`Ignore the hours`, `Compare profit to hours honestly, then decide to raise prices, cut unpaid work, or stop`, `Work even more hours to double the profit`],
        answer: 1,
        explain: `Dividing profit by hours shows your real hourly pay. The numbers tell you what to change. Stopping early can be a good, low-cost decision.`,
      },
    ],
  },
};

export default course;
