import type { Course } from '../types';

const course: Course = {
  id: 'pricing',
  kind: 'life',
  title: 'Pricing and Negotiation',
  icon: '🏷️',
  color: '#8b5cf6',
  level: 'Intermediate',
  summary: 'Learn to set prices from costs and value, avoid underpricing, understand what discounts really cost, and negotiate calmly with a plan.',
  outcomes: [
    'Build a price from costs (cost-plus) and check it against the value customers get',
    'Tell margin from markup and avoid mixing them up',
    'Use anchoring and good / better / best tiers honestly',
    'Work out what a discount really costs in extra sales',
    'Prepare a walk-away number before any negotiation',
    'Ask for what you want with a reason, trade instead of giving in, and stay polite and firm',
  ],
  lessons: [
    {
      id: 'pricing-1',
      title: 'Cost-plus, margin and value',
      minutes: 9,
      summary: 'Build a price from your costs, understand margin versus markup, and think about the value your customer gets.',
      steps: [
        {
          type: 'read',
          title: 'Start with your true cost',
          body: [
            `A price is not just a guess. It starts with knowing what one item or job really costs you.`,
            `Jen bakes cupcakes for a market stall. For one cupcake she pays about $1.50 for ingredients and $0.50 for the box. She also pays a $60 monthly stall fee. Her **cost per cupcake** is $2.00 before the stall fee. Her **fixed cost** is the $60.`,
            {
              list: [
                `**Variable costs** change with each item: ingredients, boxes.`,
                `**Fixed costs** are the same however many you sell: stall fee, software, a phone plan.`,
                `**Your time** is a cost too. If you earn nothing for the hours, you are working for free.`,
              ],
            },
            { tip: `Beginners forget small costs: delivery, payment fees, packaging, wasted batches. Write everything down for a month to find them.` },
          ],
        },
        {
          type: 'read',
          title: 'Margin or markup?',
          body: [
            `Two ways to talk about "profit on the price" get mixed up all the time.`,
            { rule: `Markup = profit / cost. Margin = profit / price. Margin is always the smaller number.` },
            {
              table: {
                head: ['Cost', 'Price', 'Profit', 'Markup', 'Margin'],
                rows: [
                  ['$6', '$12', '$6', '100%', '50%'],
                  ['$6', '$9', '$3', '50%', '33%'],
                  ['$6', '$7.50', '$1.50', '25%', '20%'],
                ],
              },
            },
            `The calculator in this course uses **margin**: price = cost / (1 - margin). A 50% margin means price is twice the cost.`,
            { warn: `If someone says "I mark up 50%" and someone else says "I make a 50% margin", they are describing very different prices. Always ask which one.` },
          ],
        },
        {
          type: 'quiz',
          title: 'Markup in disguise',
          question: `An item costs $10 and you sell it for $20. What are the markup and the margin?`,
          options: [`Markup 50%, margin 100%`, `Markup 100%, margin 50%`, `Markup 100%, margin 100%`],
          answer: 1,
          explain: `Profit is $10. Markup = 10/10 = 100% of cost. Margin = 10/20 = 50% of price. Margin can never reach 100% unless the cost is zero.`,
        },
        {
          type: 'read',
          title: 'Cost-plus versus value',
          body: [
            `**Cost-plus pricing** adds a margin to your cost. It is simple and protects you from losing money. But it ignores what the customer is willing to pay.`,
            `**Value-based pricing** asks: how much is this worth to the customer?`,
            {
              example: `Two designers each spend 5 hours making a logo. One designs for a school club that has no money. The other designs for a new bakery that will print the logo on 1,000 boxes. The work is the same, but the bakery gets more value, so a higher price can be fair. You still need to be honest and give the bakery something good.`,
            },
            `Use cost-plus to find your **floor**, the lowest price that still works. Use value to find how far above the floor customers will go.`,
          ],
        },
        {
          type: 'quiz',
          title: 'What is the floor?',
          question: `What does the cost-plus price tell you?`,
          options: [
            `The most you could ever charge.`,
            `The lowest sensible price, below which you lose money or earn too little.`,
            `Exactly what every customer will pay.`,
          ],
          answer: 1,
          explain: `Cost-plus gives a floor. Customers decide what they will pay, which can be above it. Never go below the floor for long, or the business stops making sense.`,
        },
        {
          type: 'calc',
          title: 'Set the margin',
          body: [
            `Ben sells hand-printed tote bags. Each bag costs $8 to make. Fixed costs are $300 a month (a market table and printing supplies). He sells about 80 bags a month.`,
            `At a 20% margin the price is only $10 and he loses money. Change the margin so Ben earns a real monthly profit.`,
          ],
          calc: 'pricing',
          preset: { cost: 8, margin: 20, fixed: 300, units: 80 },
          task: `Pick a margin so the monthly profit is at least $200.`,
          done: (o) => o.profit >= 200,
          hint: `You need about $6.25 profit per bag. Try a margin in the mid 40s.`,
          success: `Now check the new price against value: will your market customers pay it? If not, lower costs or find extra value (nicer packaging, personal names).`,
        },
        {
          type: 'read',
          title: 'Break-even',
          body: [
            `**Break-even** is the number of sales where profit is exactly zero. Divide fixed costs by profit per item.`,
            { example: `Ben's fixed costs are $300 and each bag earns about $6.50 after the new price. Break-even = 300 / 6.5, about 47 bags. Every bag after that is real profit.` },
            `If break-even looks higher than you can realistically sell, change something: raise the price, lower costs, or cut fixed costs.`,
          ],
        },
        {
          type: 'quiz',
          title: 'Break-even check',
          question: `Fixed costs are $120 a month and each item earns $4 profit. How many items must you sell to break even?`,
          options: [`24`, `30`, `48`],
          answer: 1,
          explain: `$120 divided by $4 is 30 items. Below 30 you lose money, and each item after 30 adds $4 of profit.`,
        },
        {
          type: 'read',
          title: 'What you learned',
          body: [
            {
              list: [
                `Know your true cost: variable, fixed and your own time.`,
                `Margin = profit / price. Markup = profit / cost. Margin is always smaller.`,
                `Cost-plus gives a floor. Value decides how far above it you can go.`,
                `Break-even = fixed costs / profit per item.`,
                `Always check a new price against what real customers will pay.`,
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'pricing-2',
      title: 'Anchoring, tiers and discounts',
      minutes: 10,
      summary: 'See how the first number shapes judgement, offer honest good / better / best options, and learn what a discount really costs.',
      steps: [
        {
          type: 'read',
          title: 'Anchoring',
          body: [
            `People judge prices by comparison. The first number they see becomes an **anchor**.`,
            { example: `A tutoring page that shows "$60 per hour (standard)" first and then "$45 for a monthly package" makes $45 feel like a deal. If the first number shown were $25, the same $45 would feel expensive.` },
            `Used honestly, anchoring just shows context: what the full price is, what the bundle saves. Used dishonestly, it invents fake "original prices" nobody ever paid.`,
            { warn: `Never show a fake "was" price. It is deceptive, and in many places it is against consumer rules.` },
          ],
        },
        {
          type: 'read',
          title: 'Good, better, best',
          body: [
            `Offering three options often helps people choose, and many pick the middle one. It also lets customers with different budgets say yes.`,
            {
              table: {
                head: ['Option', 'What they get', 'Price'],
                rows: [
                  ['Good', '1 logo, 2 revisions', '$80'],
                  ['Better', '3 logo ideas, 4 revisions, colour guide', '$150'],
                  ['Best', 'All of Better + social media set', '$220'],
                ],
              },
            },
            { tip: `Make each step feel clearly different. Do not hide the cheapest option or make it useless on purpose. Customers notice, and trust is worth more than a quick sale.` },
          ],
        },
        {
          type: 'quiz',
          title: 'Honest tiers',
          question: `Which is the honest way to use good / better / best?`,
          options: [
            `Make "Good" so poor nobody could want it.`,
            `Make each tier genuinely different in value, and let the customer choose.`,
            `Hide the cheapest tier so people cannot see it.`,
          ],
          answer: 1,
          explain: `Tiers work because people can see real differences and choose. Tricks that mislead customers may win one sale but lose the relationship.`,
        },
        {
          type: 'read',
          title: 'The cost of underpricing',
          body: [
            `Pricing too low feels safe, but it hurts in three ways:`,
            {
              list: [
                `You earn less per hour and burn out faster.`,
                `Customers may think low price means low quality.`,
                `It is hard to raise prices later on the same customers.`,
              ],
            },
            `If every sale barely covers costs, one slow month turns into a loss.`,
          ],
        },
        {
          type: 'quiz',
          title: 'Spot the problem',
          question: `A dog-walker charges $6 per walk. Each walk takes 45 minutes plus 15 minutes of travel. About what does she really earn per hour of her time?`,
          options: [`$8 per hour`, `$4 per hour`, `$6 per hour`],
          answer: 2,
          explain: `Each walk uses 60 minutes in total, so $6 per walk is $6 per hour, before costs like treats and bags. If she also counts time for messages, it is even lower. Count travel and admin time when you set a price.`,
        },
        {
          type: 'read',
          title: 'Discounts cost more than they look',
          body: [
            `A discount is a price cut, and a price cut takes a much bigger bite out of profit than of price.`,
            { example: `A cap costs you $6 and sells for $10, profit $4. A 20% discount makes the price $8 and profit $2. A 20% price cut halved your profit, so you must sell **twice as many** just to earn the same total.` },
            {
              table: {
                head: ['Price', 'Cost', 'Profit each', 'Sales needed to earn $400'],
                rows: [
                  ['$10', '$6', '$4', '100'],
                  ['$8 (20% off)', '$6', '$2', '200'],
                  ['$7 (30% off)', '$6', '$1', '400'],
                ],
              },
            },
            `Discounts can be sensible for clearing old stock or rewarding a repeat customer. Just do the arithmetic first.`,
          ],
        },
        {
          type: 'calc',
          title: 'What does a sale need?',
          body: [
            `A market-stall seller buys a mug for $9. Normally it sells for $18. During a big sale she cuts the price to $12, which is only a 25% margin. Fixed costs are $300 a month.`,
            `At 80 sales a month the sale loses money. How many sales does she need?`,
          ],
          calc: 'pricing',
          preset: { cost: 9, margin: 25, fixed: 300, units: 80 },
          task: `Keep the 25% margin (or lower) and raise the items sold until the monthly profit is at least $300.`,
          done: (o) => o.margin <= 25 && o.profit >= 300,
          hint: `Each mug now earns $3. Profit = 3 x sales - 300. How many sales do you need to reach $300?`,
          success: `She needs 200 sales a month. Many shops cannot sell that many, so deep discounts are risky unless they bring a lot of new buyers.`,
        },
        {
          type: 'read',
          title: 'When to raise prices',
          body: [
            `Raise prices when:`,
            {
              list: [
                `You are booked solid or have a waiting list.`,
                `Your costs went up (materials, fees).`,
                `Customers rarely push back on your price.`,
                `Your skills and results have clearly improved.`,
              ],
            },
            `Be clear and kind: give existing customers notice, say why, and apply the new price to new work. A small, steady rise is easier to accept than one huge jump.`,
          ],
        },
        {
          type: 'quiz',
          title: 'Raise or not?',
          question: `A tutor has 12 students, a waiting list of 5, and gets no complaints about price. What does this suggest?`,
          options: [
            `Her price may be a little low, and a small raise for new students is reasonable.`,
            `She should cut the price to attract even more students.`,
            `She should stop tutoring.`,
          ],
          answer: 0,
          explain: `A waiting list means demand is higher than her time. That is a classic sign that the price can go up a bit, especially for new students. Check your local rules and agreements about notice if you have contracts.`,
        },
        {
          type: 'read',
          title: 'What you learned',
          body: [
            {
              list: [
                `The first number acts as an anchor. Show honest context and never fake an original price.`,
                `Good / better / best tiers help people choose if each tier is truly different.`,
                `Underpricing means more hours, more burnout and less trust.`,
                `A 20% discount can cut profit by half or more: work out the extra sales needed.`,
                `Raise prices when demand beats your time, with kind notice.`,
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'pricing-3',
      title: 'Negotiating calmly',
      minutes: 10,
      summary: 'Prepare a walk-away number, ask with a reason, listen, trade rather than give in, and stay polite and firm.',
      steps: [
        {
          type: 'read',
          title: 'Know your walk-away number',
          body: [
            `Negotiation is two people trying to reach a deal that both can accept. Preparation matters more than clever lines.`,
            `Before you talk, decide your **walk-away number**: the worst deal you would still accept. Below it, you say no.`,
            `Your walk-away number should be based on your **best alternative**. (Experts call this a BATNA, short for "best alternative to a negotiated agreement.") In plain words: what will you do if this deal does not happen?`,
            {
              example: `Aiko is offered $12 an hour for a part-time job. Her other option is a $14 job two bus stops further. Her walk-away is about $14 minus the bus cost. Without this thinking she might accept $12 out of nerves.`,
            },
            { tip: `A strong alternative lets you stay calm. A weak one means you should prepare extra, or improve it before you start.` },
          ],
        },
        {
          type: 'read',
          title: 'Ask with a reason',
          body: [
            `Ask for what you want, clearly, with a reason. Not a threat, a reason.`,
            { example: `"I would like to charge $40 an hour for this project. The work needs about 15 hours of specialist design, and my last three projects at this price were delivered on time." ` },
            `Then **stop talking**. Silence feels uncomfortable, and beginners fill it by lowering the number. Count to five in your head. Let the other person respond.`,
          ],
        },
        {
          type: 'quiz',
          title: 'Which opening is better?',
          question: `Which opening is better when asking for a rate?`,
          options: [
            `"I know it's a lot, sorry, but could you maybe pay $50? If not, it's fine."`,
            `"Whatever you can pay is fine."`,
            `"My rate for this project is $50 an hour. That covers my design time and two revisions."`,
          ],
          answer: 2,
          explain: `The third opening is clear, polite, includes a reason and does not apologise. The first two give away your position before the other person has even answered.`,
        },
        {
          type: 'read',
          title: 'Listen, then trade',
          body: [
            `After you ask, **listen**. Ask a follow-up question: "What would work on your side?" Often the person's real worry is a deadline, a budget limit or a risk, not the number itself.`,
            `When they push back, do not just give. **Trade.** Every concession should get something in return.`,
            {
              list: [
                `"I can do $45 an hour if you commit to ten hours up front."`,
                `"I can take two revisions off the price, if you want to keep the lower rate."`,
                `"We can start in a month if the budget is tight, at the current price."`,
              ],
            },
            { rule: `Never give a concession for free. Say "if you... then I..." and let the other person earn it.` },
          ],
        },
        {
          type: 'read',
          title: 'Polite and firm',
          body: [
            `Being polite and being firm are not opposites.`,
            {
              list: [
                `Be warm: thank them, use their name, smile in your voice.`,
                `Be clear: repeat your number and reason without raising your voice.`,
                `Be ready to leave kindly: "I understand. That is below what I can do. Thank you for your time, and if things change, I would be glad to talk."`,
              ],
            },
            { warn: `Never lie in a negotiation, for example about another offer you do not have. It can be found out, and you lose trust and sometimes legal protections.` },
          ],
        },
        {
          type: 'quiz',
          title: 'A client pushes back',
          question: `A client says "Your price is too high. Can you do it for $30 instead of $45?" What is the best reply?`,
          options: [
            `"OK, $30."`,
            `"I can't do $30, but I could do $38 if I use a simpler design, or $45 for the full version. Which do you prefer?"`,
            `"That's rude, goodbye."`,
          ],
          answer: 1,
          explain: `The second reply keeps the relationship, trades something (scope) for a price, and gives a choice. Accepting at once teaches the client that your first price is not your real one.`,
        },
        {
          type: 'calc',
          title: 'Find your floor rate',
          body: [
            `Mia is a freelance photographer. She wants to keep $36,000 a year, but cannot realistically bill more than about 30 hours a week or take fewer than 4 weeks off.`,
            `At her starting setup she would need a huge hourly rate. A client has offered $45 an hour. Find a setup where $45 an hour would still work.`,
          ],
          calc: 'freelance',
          preset: { target: 36000, expenses: 4000, taxPct: 30, hours: 15, weeksOff: 6 },
          task: `Keep the target at $36,000 or more, at least 4 weeks off, and a minimum rate of $45 or less. Keep billable hours under 1,500 a year.`,
          done: (o) => o.target >= 36000 && o.weeksOff >= 4 && o.rate <= 45 && o.hours <= 1500,
          hint: `Try raising weekly billable hours to about 28 while taking 4 weeks off. Notice what that does to your free time.`,
          success: `Now you know your floor. If the client offers less than the floor you worked out, you are not being picky by saying no. You are protecting your time.`,
        },
        {
          type: 'read',
          title: 'Sample scripts',
          body: [
            `Here are two short scripts you can adapt. Say them in your own words.`,
            { example: `**Asking for a raise.** "Thank you for meeting me. Since I started six months ago I have taken on the opening shift and trained two new people. I would like to ask for a raise to $14 an hour. Can we talk about that?" Then stop and listen.` },
            { example: `**Quoting a freelance rate.** "For this project I charge $45 an hour, about 12 hours in all. That covers drafts and two revisions. If the budget is tight, I can adjust what is included. What would work for you?"` },
            { tip: `Practise out loud with someone you trust. A calm voice is a skill, and it improves with a few rehearsals.` },
          ],
        },
        {
          type: 'quiz',
          title: 'Walk-away number',
          question: `Why is your walk-away number useful?`,
          options: [`It tells you the lowest deal you would accept, so you can say no calmly instead of out of fear.`, `It is the number you always open with.`, `It makes the other person nervous.`],
          answer: 0,
          explain: `Your walk-away is your private floor based on your best alternative. You do not announce it. Knowing it keeps you from agreeing to a deal that is worse than your options.`,
        },
        {
          type: 'read',
          title: 'What you learned',
          body: [
            {
              list: [
                `Decide your walk-away number from your best alternative before you talk.`,
                `Ask for what you want with a reason, then stay quiet and listen.`,
                `Trade concessions: "if you... then I...", never give for free.`,
                `Be polite and firm. Do not lie, and leave kindly if needed.`,
                `Practise scripts for raises and freelance rates.`,
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
        q: `An item costs $8 to make and sells for $20. What is the profit per item?`,
        options: [`$8`, `$12`, `$20`],
        answer: 1,
        explain: `Profit = price - cost = $20 - $8 = $12. That is a markup of 150% (12/8) and a margin of 60% (12/20).`,
      },
      {
        q: `A cost of $5 and a price of $10. Which statement is correct?`,
        options: [`Markup 100%, margin 50%`, `Markup 50%, margin 100%`, `Markup 50%, margin 50%`],
        answer: 0,
        explain: `Profit is $5. Markup = 5/5 = 100%, margin = 5/10 = 50%. Margin is always smaller than markup.`,
      },
      {
        q: `What does cost-plus pricing give you?`,
        options: [`The highest price a customer would pay`, `A fair price decided by competitors`, `A floor: the lowest price that still earns what you need`],
        answer: 2,
        explain: `Cost-plus ignores what customers value, so it works as a floor, not a ceiling.`,
      },
      {
        q: `Two designers do the same 5-hour logo job. One client will print it on 1,000 products; the other is a small hobby club. What does value-based pricing suggest?`,
        options: [`Charge both exactly the same, always`, `The first client may reasonably pay more, because the work is worth more to them`, `Charge the hobby club double`],
        answer: 1,
        explain: `Value-based pricing looks at what the work is worth to each customer. It must stay honest and the better price should come with better service.`,
      },
      {
        q: `Fixed costs are $200 a month and each item brings $5 profit. What is the break-even number of items?`,
        options: [`20`, `100`, `40`, `200`],
        answer: 2,
        explain: `$200 / $5 = 40 items. After 40 sales, every extra item adds $5 profit.`,
      },
      {
        q: `A shop sells a $10 item that costs $6. It offers a 20% discount. How does the profit per item change?`,
        options: [`It drops from $4 to $2, half`, `It drops from $4 to $3.20`, `It stays the same`],
        answer: 0,
        explain: `20% off $10 gives $8. $8 - $6 = $2. A 20% price cut halved the profit, so you must sell about twice as many to earn the same total.`,
      },
      {
        q: `What is the most honest use of anchoring?`,
        options: [`Showing a fake "original" price that nobody ever paid`, `Showing the standard price next to a bundle price, with the real saving`, `Hiding the final price until checkout`],
        answer: 1,
        explain: `Showing a true full price for context helps customers judge. Fake original prices are deceptive and may break consumer rules.`,
      },
      {
        q: `Which is a sign that it may be time to raise your prices?`,
        options: [`You have no customers at all`, `You are fully booked with a waiting list and few complaints about price`, `Your competitors closed`, `Your rent fell`],
        answer: 1,
        explain: `Demand above your capacity suggests the price can go up a little. Give notice and explain why.`,
      },
      {
        q: `What is a walk-away number (based on your best alternative)?`,
        options: [`The worst deal you would still accept, based on what you would do if no deal happens`, `The price you open with`, `The average of all prices`],
        answer: 0,
        explain: `It is your private floor. If an offer is below it, you decline politely. It keeps you from agreeing out of fear.`,
      },
      {
        q: `A client says your quote is too high. What is the best reply?`,
        options: [`Cut the price straight away`, `Get angry and leave`, `Offer a trade: a smaller scope at a lower price, or the full scope at the quote`, `Say you will think about it and never reply`],
        answer: 2,
        explain: `A trade protects your value while giving the client a real choice. Giving in with no return teaches them to push every time.`,
      },
      {
        q: `You ask for a raise and your boss says nothing for several seconds. What should you do?`,
        options: [`Immediately lower your request`, `Stay calm and quiet, and let them answer`, `Say you will quit tomorrow`],
        answer: 1,
        explain: `Silence is normal while people think. Filling it by lowering your ask gives away money. Wait, then listen to their answer.`,
      },
      {
        q: `Which statement is true about honesty in negotiation?`,
        options: [`Lying about a rival offer is a good trick`, `You may invent costs to justify a higher price`, `Lies can be found out and cost you trust, so use real reasons and real alternatives`],
        answer: 2,
        explain: `Real reasons are persuasive enough and keep your reputation safe. A lie, once caught, makes everything else you say less believable.`,
      },
    ],
  },
};

export default course;
