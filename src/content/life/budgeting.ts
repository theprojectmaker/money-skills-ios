import type { Course } from '../types';

const course: Course = {
  id: 'budgeting',
  kind: 'life',
  title: 'Budgeting and Saving',
  icon: '🧾',
  color: '#2f9e6b',
  level: 'Beginner',
  summary: 'Learn to see where your money goes, pay yourself first, build a safety cushion and reach savings goals on a deadline.',
  outcomes: [
    'Track where your money goes and sort it into needs, wants and saving',
    'Use the 50/30/20 idea as a starting guide and adjust it to your real life',
    'Explain why paying yourself first works better than saving what is left',
    'Size an emergency fund and say where it should be kept',
    'Turn a vague wish into a goal with an amount, a deadline and a monthly number',
  ],
  lessons: [
    {
      id: 'budgeting-1',
      title: 'Where Your Money Really Goes',
      minutes: 9,
      summary: 'Track your money, sort it into needs, wants and saving, and meet the 50/30/20 idea.',
      steps: [
        {
          type: 'read',
          title: 'Money in, money out',
          body: [
            'A budget is just a plan for your money. It answers one question before the month starts: where should each dollar go?',
            'Two words to know. **Income** is money that comes in, like pay from a job or allowance. **Take-home pay** is what actually lands in your account after taxes and other deductions come out. A budget uses take-home pay, because that is the money you can really spend.',
            'An **expense** is money that goes out. Most people guess their spending wrong by a lot. The fix is simple: write it down for a while and let the numbers surprise you.',
            { tip: 'If you earn $3,000 before taxes but $2,500 reaches your account, your budget number is $2,500. Always plan with the smaller, real number.' },
          ],
        },
        {
          type: 'read',
          title: 'Needs, wants and saving',
          body: [
            'Every dollar can go in one of three buckets.',
            {
              table: {
                head: ['Bucket', 'What it means', 'Examples'],
                rows: [
                  ['Needs', 'Things you must pay to live and work', 'Rent, basic food, utilities, transport to work or school, minimum debt payments'],
                  ['Wants', 'Things that make life nicer but you could live without', 'Eating out, streaming, new clothes, games, hobbies'],
                  ['Saving', 'Money you keep for later', 'Emergency fund, trip fund, future you'],
                ],
              },
            },
            'The edges are fuzzy. A phone plan is a need for most people. The newest phone is a want. Groceries are a need. Delivery sushi every Friday is a want. Be honest, but do not feel guilty: wants are part of a real life.',
          ],
        },
        {
          type: 'quiz',
          title: 'Quick sort',
          question: 'Which of these is most clearly a want?',
          options: ['The rent on your home', 'A streaming subscription', 'The electricity bill'],
          answer: 1,
          explain: 'Rent and electricity are needs, since you must pay them to live. A streaming service is nice to have but you could live without it, so it is a want.',
        },
        {
          type: 'read',
          title: 'The 50/30/20 idea',
          body: [
            'A popular starting guide splits take-home pay like this: about **50%** to needs, **30%** to wants and **20%** to saving or paying off debt.',
            { example: 'Take-home pay: $3,000 a month. Needs: $1,500. Wants: $900. Saving: $600. The three add up to the full $3,000, so every dollar has a job.' },
            { rule: '50/30/20 is a starting guide, not a law. It was made for a typical situation, and your situation may differ.' },
            { warn: 'In expensive cities, rent alone can be more than 50% of take-home pay. If that is you, the guide does not mean you are failing. It means you start with a smaller saving slice and look for ways to grow it over time.' },
          ],
        },
        {
          type: 'calc',
          title: 'Try a plan',
          body: [
            'Here is a monthly plan where every dollar is spent and nothing is saved. Saving rate means the share of your take-home pay that you keep. Cutting wants is the quickest lever, because needs are hard to shrink.',
          ],
          calc: 'budget',
          preset: { income: 3000, needs: 1900, wants: 1100 },
          task: 'Adjust the plan so the saving rate is at least 15%.',
          done: (o) => o.rate >= 15,
          hint: 'Lower the wants slider. About $650 of wants leaves $450, which is 15% of $3,000.',
          success: 'Nice. You kept needs the same and found saving room by trimming wants.',
        },
        {
          type: 'read',
          title: 'Tracking without the pain',
          body: [
            'You do not need a fancy app. Try this for one month.',
            { steps: ['Write down or screenshot every purchase for 30 days.', 'At the end, put each one into needs, wants or saving.', 'Add up each bucket and divide by your take-home pay.', 'Look for one or two surprises, then decide what to change.'] },
            'Most of your money moves in the big three: housing, transport and food. Cutting a few small treats helps a little, but changing a big cost usually helps far more.',
          ],
        },
        {
          type: 'quiz',
          title: 'Reading a result',
          body: ['Maya has $2,000 take-home pay a month. Her needs cost $1,400.'],
          question: 'Under the 50/30/20 guide needs would be $1,000. What does Maya\'s number tell her?',
          options: ['She is breaking the law', 'She should stop saving completely', 'Her needs are 70%, so she may start with less saving and look for ways to cut costs or raise income'],
          answer: 2,
          explain: 'The guide is only a starting point. Maya\'s needs are 70% of take-home pay, so a small saving slice is realistic for now. The numbers show her where to work, which is the whole point of a budget.',
        },
        {
          type: 'quiz',
          title: 'Do the math',
          question: 'Your take-home pay is $2,400 a month. How much is the 20% saving slice?',
          options: ['$240', '$480', '$600'],
          answer: 1,
          explain: '20% means 20 out of every 100 dollars. $2,400 times 0.20 is $480. (10% would have been $240.)',
        },
        {
          type: 'read',
          title: 'What you learned',
          body: [
            {
              list: [
                'Plan with take-home pay, not the bigger number before taxes.',
                'Sort spending into needs, wants and saving to see the real picture.',
                '50/30/20 is a starting guide, not a rule. Adjust it to your life.',
                'Tracking for a month shows surprises, and big costs matter most.',
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'budgeting-2',
      title: 'Pay Yourself First and Build a Cushion',
      minutes: 9,
      summary: 'Save before you spend, and build an emergency fund so surprises do not become debt.',
      steps: [
        {
          type: 'read',
          title: 'Pay yourself first',
          body: [
            'Many people try to save what is left at the end of the month. The trouble is that there is usually nothing left. Spending quietly grows to fill whatever money you have.',
            '**Paying yourself first** flips the order: the moment you are paid, a set amount moves to savings. You then spend what remains.',
            { example: 'Leo gets $2,500 a month. Plan A: spend, then save what is left. Most months, $0 is left. Plan B: an automatic transfer of $150 moves to savings the day after payday. After a year he has $1,800 saved without needing much willpower.' },
            { tip: 'Automatic transfers beat good intentions. If you never see the money in your spending account, you do not miss it.' },
          ],
        },
        {
          type: 'read',
          title: 'Why a cushion matters',
          body: [
            'Life throws surprises: a broken phone, a car repair, a few weeks of lost work hours. An **emergency fund** is money set aside only for those surprises.',
            'Without one, surprises go on a credit card or a loan, and the interest makes the surprise bigger. With one, a bad week stays a bad week.',
            'A common path is two steps. First, a small starter fund, often $500 to $1,000. Then build toward about **3 to 6 months of needs**. This is a rule of thumb: people with unstable income or dependents often aim higher.',
          ],
        },
        {
          type: 'quiz',
          title: 'Is it an emergency?',
          question: 'Which one is a real emergency for an emergency fund?',
          options: ['Concert tickets just went on sale', 'A $600 car repair you need to get to work', 'Shoes are 40% off today'],
          answer: 1,
          explain: 'An emergency is unexpected, necessary and urgent. The car repair fits all three. Sales and tickets are wants, and they are best paid from your wants money or a separate fun fund.',
        },
        {
          type: 'read',
          title: 'Where to keep it',
          body: [
            'The goal for emergency money is not growth. It is being there, in full, the day you need it. That means three things: safe, easy to reach and kept apart from daily spending.',
            'A plain savings account usually fits. In the US, for example, deposits at insured banks are protected up to a limit, but protection rules differ by country, so check yours.',
            { warn: 'Do not keep your emergency fund in things that can drop in value, like stocks. Markets can fall right when you lose a job, which is when you need the cash.' },
          ],
        },
        {
          type: 'calc',
          title: 'Find the money',
          body: [
            'This plan saves only $200 a month. Paying yourself first means deciding the saving number first, then fitting wants around it.',
          ],
          calc: 'budget',
          preset: { income: 2800, needs: 1600, wants: 1000 },
          task: 'Trim the plan so you can save at least $500 a month.',
          done: (o) => o.save >= 500,
          hint: 'Drop wants to about $700. Keep needs the same.',
          success: 'That is $500 a month, or about $6,000 a year, from one decision.',
        },
        {
          type: 'read',
          title: 'How big is big enough?',
          body: [
            'Start from your monthly needs, not your income. Needs are what you would still have to pay if money got tight.',
            { example: 'Rani\'s needs cost $1,500 a month. Three months of needs is 3 x $1,500 = $4,500. Six months is $9,000. She starts with a $1,000 starter fund and works toward $4,500 first.' },
            'Use an emergency fund when you must, then refill it. It is a tool, not a trophy.',
          ],
        },
        {
          type: 'calc',
          title: 'Set the deadline',
          body: ['Use the Savings goal tool for Rani\'s $4,500 fund. For short goals like this one, keep growth at 0% since safe accounts pay little and the money must not be at risk.'],
          calc: 'goal',
          preset: { goal: 4500, years: 3, rate: 0 },
          task: 'Keep the $4,500 goal, but finish within 1.5 years or less.',
          done: (o) => o.goal >= 4500 && o.years <= 1.5,
          hint: 'Slide the years down to 1.5. The monthly amount rises to about $250.',
          success: 'A shorter deadline means a bigger monthly amount. You get to choose the trade.',
        },
        {
          type: 'quiz',
          title: 'Priya\'s problem',
          body: ['Priya says she wants to save but has $0 left every month, so she waits until she has extra.'],
          question: 'What is the best next step for Priya?',
          options: ['Set an automatic transfer on payday, even a small one like $25', 'Wait for a raise, then start', 'Stop tracking, since it is not helping'],
          answer: 0,
          explain: 'Waiting for extra money rarely works, because spending grows to match. A small automatic transfer builds the habit now, and she can raise it later.',
        },
        {
          type: 'read',
          title: 'What you learned',
          body: [
            {
              list: [
                'Paying yourself first means saving at the start, not the end.',
                'Automatic transfers beat willpower.',
                'An emergency fund covers unexpected, necessary, urgent costs, so surprises do not become debt.',
                'Aim for a starter fund, then about 3 to 6 months of needs.',
                'Keep it safe, easy to reach and separate from daily spending.',
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'budgeting-3',
      title: 'Goals With a Deadline',
      minutes: 9,
      summary: 'Turn a wish into an amount, a date and a monthly number, then build a plan you can stick to.',
      steps: [
        {
          type: 'read',
          title: 'A goal needs a number and a date',
          body: [
            '"I want to save more" is a wish. "I want $2,400 for a laptop by next June" is a goal. The difference is two numbers: an amount and a deadline.',
            'Once you have both, the rest is division: take the goal, divide by the number of months, and you know the monthly amount.',
          ],
        },
        {
          type: 'read',
          title: 'Do the division',
          body: [
            { example: 'Sam wants $1,200 for a trip in 12 months. $1,200 / 12 months = $100 a month. If he can only manage $75, he can either wait 16 months or lower the trip budget. Both are fine. The point is that now he knows.' },
            'Savings accounts may add a small amount of interest on top, but for goals under a few years, count on very little. Treat any growth as a bonus, not as part of the plan.',
          ],
        },
        {
          type: 'quiz',
          title: 'Which is a real goal?',
          question: 'Which one of these is a well-formed savings goal?',
          options: ['Be rich someday', 'Save more money', '$2,400 for a laptop by next June, which is $200 a month for 12 months'],
          answer: 2,
          explain: 'A good goal has a purpose, an amount and a deadline. The third one also turns into a monthly number you can act on. The first two cannot be measured.',
        },
        {
          type: 'calc',
          title: 'Plan the laptop',
          body: ['Right now the tool shows a $1,200 goal. Change it to the real laptop goal and pick a deadline that keeps the monthly amount around $100.'],
          calc: 'goal',
          preset: { goal: 1200, years: 2, rate: 0 },
          task: 'Set the goal to $2,400 or more, with a monthly amount of about $100 or less.',
          done: (o) => o.goal >= 2400 && o.monthly <= 101,
          hint: 'Move the goal to $2,400, then raise the years to 2 or more.',
          success: 'You matched the goal to what the monthly budget can handle.',
        },
        {
          type: 'read',
          title: 'Short goals and long goals',
          body: [
            'How you save depends on how soon you need the money.',
            {
              table: {
                head: ['Goal', 'Time until you need it', 'Where the money should live'],
                rows: [
                  ['Laptop, trip, gift', 'Under 3 years', 'Safe cash, such as a savings account'],
                  ['Car, moving costs', '3 to 5 years', 'Mostly safe, maybe a little risk'],
                  ['Far-off goals', 'Many years', 'Growth can help, with real risk of loss (see Compound Interest and Time)'],
                ],
              },
            },
            { rule: 'If you need the money soon, safety matters more than growth.' },
          ],
        },
        {
          type: 'quiz',
          title: 'Quick division',
          question: 'You want $3,000 in 15 months and expect no interest. How much per month?',
          options: ['$200', '$150', '$300'],
          answer: 0,
          explain: '$3,000 divided by 15 months is $200 a month. If $200 is too much, stretch the deadline: 20 months would need $150.',
        },
        {
          type: 'read',
          title: 'Make it stick',
          body: [
            'Most budgets fail not because of math but because they are too strict. Try these habits.',
            { list: ['Automate the monthly transfer on payday.', 'Give the goal its own named account so you can see it grow.', 'Keep a small fun-money line. A plan with zero joy gets dropped.', 'Check in once a month for ten minutes and adjust.'] },
            { tip: 'If you miss a month, do not scrap the plan. Note what happened and carry on.' },
          ],
        },
        {
          type: 'calc',
          title: 'A plan with room for fun',
          body: ['Build a monthly plan that saves at least 20% of take-home pay and still leaves at least $500 for wants. A budget you enjoy is one you keep.'],
          calc: 'budget',
          preset: { income: 3000, needs: 1800, wants: 1100 },
          task: 'Save at least 20% while keeping wants at $500 or more.',
          done: (o) => o.rate >= 20 && o.wants >= 500,
          hint: 'Set wants between $500 and $600 with needs at $1,800.',
          success: 'You balanced saving now with enjoying life now.',
        },
        {
          type: 'quiz',
          title: 'Off track',
          body: ['Dee overspent in March and put nothing toward her goal.'],
          question: 'What is the most helpful response?',
          options: ['Drop the goal, since the plan is clearly broken', 'Spend freely until next year', 'Note what caused it, adjust the plan and carry on in April'],
          answer: 2,
          explain: 'One off month is information, not failure. Looking at what caused it lets Dee fix the real problem, and starting again quickly matters more than a perfect record.',
        },
        {
          type: 'read',
          title: 'What you learned',
          body: [
            {
              list: [
                'A goal has a purpose, an amount and a deadline.',
                'Goal divided by months gives the monthly amount.',
                'Money needed soon should stay safe, even if growth is lower.',
                'A plan with some fun money is easier to keep.',
                'A missed month is a reason to adjust, not to quit.',
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
        q: 'What is take-home pay?',
        options: ['The money you actually receive after taxes and deductions', 'Your pay before any taxes', 'The extra money you have left over at the end of the month'],
        answer: 0,
        explain: 'Take-home pay is what lands in your account. Budgets should use it, since that is the money you can really spend.',
      },
      {
        q: 'Which item is the clearest example of a need?',
        options: ['A new video game', 'A monthly streaming subscription', 'Groceries for basic meals'],
        answer: 2,
        explain: 'Food is a need. Games and streaming are wants. The edges can be fuzzy, but basic food, shelter, utilities and transport to work are needs.',
      },
      {
        q: 'Take-home pay is $2,000 a month. Using the 50/30/20 guide, how much goes to needs?',
        options: ['$600', '$1,000', '$400'],
        answer: 1,
        explain: '50% of $2,000 is $1,000. The wants slice would be $600 and the saving slice $400.',
      },
      {
        q: 'What does the 50/30/20 guide best represent?',
        options: ['A legal minimum you must follow', 'A rule that works the same for every person', 'A flexible starting point to adjust to your own situation', 'A way to avoid paying taxes'],
        answer: 2,
        explain: 'It is a starting guide. In expensive areas needs may take more than 50%, and some people save more than 20%.',
      },
      {
        q: 'What does "pay yourself first" mean?',
        options: ['Spend on yourself before bills', 'Move money to savings as soon as you are paid, then spend the rest', 'Save whatever happens to be left at the end of the month'],
        answer: 1,
        explain: 'Paying yourself first makes saving the first step instead of the last. Money left at month end is often zero.',
      },
      {
        q: 'Which best describes an emergency fund?',
        options: ['Money for vacations and gifts', 'Money invested to grow as fast as possible', 'Money set aside for unexpected, necessary costs like a car repair or lost work hours'],
        answer: 2,
        explain: 'An emergency fund is for surprises. Its job is to be there when needed, so it should be safe and easy to reach.',
      },
      {
        q: 'Ben\'s monthly needs cost $1,200. About how big is a 3-month emergency fund?',
        options: ['$1,200', '$2,400', '$3,600', '$7,200'],
        answer: 2,
        explain: '3 months x $1,200 = $3,600. Six months would be $7,200. These are rules of thumb, and people with unstable income often aim higher.',
      },
      {
        q: 'Where is the best place for emergency money?',
        options: ['In stocks, so it grows faster', 'In a safe, easy-to-reach account kept apart from daily spending', 'In cash hidden at home, spread in many places'],
        answer: 1,
        explain: 'Emergency money needs to be there in full when needed. Stocks can fall at the same time you lose income, which is the worst moment to sell.',
      },
      {
        q: 'You want $1,800 in 18 months with no interest. How much should you save per month?',
        options: ['$50', '$90', '$100', '$180'],
        answer: 2,
        explain: '$1,800 divided by 18 months is $100 a month.',
      },
      {
        q: 'Jo takes home $2,500 and spends $2,000. What is Jo\'s saving rate?',
        options: ['20%', '25%', '5%'],
        answer: 0,
        explain: 'Jo saves $500. $500 divided by $2,500 is 0.20, so the saving rate is 20%.',
      },
      {
        q: 'Why is tracking your spending for a month useful?',
        options: ['It lets the bank lower your fees', 'It guarantees you will save more', 'It shows where your money actually goes, which is often different from what you guessed'],
        answer: 2,
        explain: 'Tracking gives facts to work with. It does not save money on its own, but it shows which costs matter.',
      },
      {
        q: 'Tia\'s first budget was very strict, with no money for fun. By month two she stopped using it. What is the most likely lesson?',
        options: ['Budgets never work', 'She should set it even stricter', 'Saving is only for wealthy people', 'A plan with some fun money is easier to stick with, so she should adjust it'],
        answer: 3,
        explain: 'Budgets usually fail when they ignore real life. Adding a small, planned wants amount makes a plan sustainable.',
      },
    ],
  },
};

export default course;
