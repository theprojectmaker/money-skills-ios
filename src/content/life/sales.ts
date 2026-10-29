import type { Course } from '../types';

const course: Course = {
  id: 'sales',
  kind: 'life',
  title: 'Sales and Communication',
  icon: '🤝',
  color: '#0ea5e9',
  level: 'Intermediate',
  summary: 'Learn to understand customers first, answer price worries honestly, write short clear messages, and sell without pressure or lies.',
  outcomes: [
    'Ask good questions and understand a customer\'s need before you pitch',
    'Turn features into benefits the customer actually cares about',
    'Handle "it is too expensive" calmly and honestly',
    'Follow up politely without nagging, and write a short clear message',
    'Sell ethically: no lies, no pressure, and say no gracefully',
    'See what a loyal customer is worth in money terms',
  ],
  lessons: [
    {
      id: 'sales-1',
      title: 'Start with the customer\'s need',
      minutes: 9,
      summary: 'Ask good questions, listen, and turn features into benefits before you ever mention a price.',
      steps: [
        {
          type: 'read',
          title: 'Selling is helping, not pushing',
          body: [
            `Selling does not have to mean pressure. The best salespeople spend more time **listening** than talking. Their goal is to find out if what they offer really helps, and to say so honestly when it does not.`,
            `Picture two market-stall bakers. Baker A says "Buy my brownies! Best in town!" to everyone who walks past. Baker B asks, "Are you buying for a party, or just a treat?" and then suggests the right box. Baker B makes more sales and fewer people feel pushed.`,
            { tip: `A good rule: spend the first half of any sales conversation asking questions.` },
          ],
        },
        {
          type: 'read',
          title: 'Good questions',
          body: [
            `Good questions are **open** (they cannot be answered with just "yes" or "no") and curious.`,
            {
              list: [
                `"What are you hoping to get done?"`,
                `"What have you tried before? What worked, what did not?"`,
                `"When do you need it by?"`,
                `"What would a great result look like?"`,
                `"What budget did you have in mind?" (asked kindly, once you understand the need)`,
              ],
            },
            {
              example: `Priya, a student logo designer, talks to a bakery owner. Instead of listing her skills she asks: "What do you want customers to feel when they see your sign?" The owner says "warm and homemade". Now Priya knows what to design, and the owner feels heard.`,
            },
          ],
        },
        {
          type: 'quiz',
          title: 'Pick the better question',
          question: `Which question is the best for learning a customer's need?`,
          options: [
            `"Do you want to buy something?"`,
            `"What problem are you trying to solve with this?"`,
            `"Isn't this a great price?"`,
          ],
          answer: 1,
          explain: `Open questions invite the customer to explain. The first and last are yes/no questions that push the customer instead of learning from them.`,
        },
        {
          type: 'read',
          title: 'Features versus benefits',
          body: [
            `A **feature** is a fact about what you offer. A **benefit** is what the customer gets from it.`,
            {
              table: {
                head: ['Feature', 'Benefit'],
                rows: [
                  ['I walk dogs 3 times a week', 'Your dog is calm and you can work late without worry'],
                  ['The logo comes in 5 file types', 'You can use it on your sign, website and T-shirts'],
                  ['Cookies are baked fresh each morning', 'Your guests get something warm and fresh'],
                ],
              },
            },
            `Pick benefits that match what the customer told you. Do not invent benefits you cannot deliver.`,
            { warn: `Never claim results you cannot guarantee, like "you will double your sales". Promise only what you can honestly do.` },
          ],
        },
        {
          type: 'quiz',
          title: 'Feature or benefit?',
          question: `Which sentence is a benefit?`,
          options: [
            `"My tutoring sessions are 60 minutes long."`,
            `"I have a maths certificate."`,
            `"After four weeks you should feel more confident doing fractions on your own."`,
          ],
          answer: 2,
          explain: `The third sentence describes what the student gains. The first two are facts about the seller. Use "should" and avoid guarantees you cannot control.`,
        },
        {
          type: 'calc',
          title: 'How many sales do you need?',
          body: [
            `A cookie seller names a goal: $150 of monthly profit. Each box costs $3 to make and sells at a 50% margin, so the price is $6. Fixed costs are $150 a month, and she currently sells 30 boxes.`,
            `Use the calculator to see how many sales it takes. Then think: where will those extra customers come from? That is a job for asking questions and good follow-up, not for pressure.`,
          ],
          calc: 'pricing',
          preset: { cost: 3, margin: 50, fixed: 150, units: 30 },
          task: `Keep the price at $6 or less, and raise the boxes sold until the monthly profit is at least $150.`,
          done: (o) => o.profit >= 150 && o.price <= 6.01,
          hint: `Each box earns $3. You need profit of $150 after $150 of fixed costs, so total profit per month before fixed costs must reach $300.`,
          success: `That is 100 boxes a month, more than three times as many as now. Goals like this show why finding repeat customers matters more than a single big sale.`,
        },
        {
          type: 'read',
          title: 'Listening is a skill',
          body: [
            {
              list: [
                `Look at the person and put your phone away.`,
                `Do not interrupt. Count a short pause before you reply.`,
                `Repeat back what you heard: "So you need it before Friday, and the budget is tight. Did I get that right?"`,
                `Take a few notes. They show you care and keep you accurate.`,
              ],
            },
            `If you do not understand, ask. "Can you tell me more about that?" is always allowed.`,
          ],
        },
        {
          type: 'quiz',
          title: 'The pitch too early',
          question: `A customer says: "I just need something for my sister's birthday on Saturday." What should you do next?`,
          options: [
            `Start listing all your products and prices.`,
            `Ask: "Great, what does she like, and roughly what would you like to spend?"`,
            `Tell the customer the product is almost sold out.`,
          ],
          answer: 1,
          explain: `Two quick questions let you recommend something that fits. Listing everything overwhelms the customer, and fake scarcity is a pressure trick we want to avoid.`,
        },
        {
          type: 'read',
          title: 'What you learned',
          body: [
            {
              list: [
                `Selling is helping. Spend the first half asking questions.`,
                `Open questions uncover the real need.`,
                `Benefits answer "what is in it for me?". Only promise what you can deliver.`,
                `Listening means no interruptions, short pauses and repeating back.`,
                `Sales goals turn into unit numbers: know how many customers you need.`,
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'sales-2',
      title: '"Too expensive", follow-up and loyalty',
      minutes: 10,
      summary: 'Respond to price worries without caving, follow up politely, and see what keeping a customer is worth.',
      steps: [
        {
          type: 'read',
          title: 'What "too expensive" really means',
          body: [
            `When a customer says "That's too expensive," it rarely means one thing. It might mean:`,
            {
              list: [
                `"I do not see the value yet."`,
                `"I really do not have that much money."`,
                `"I need to compare with other options."`,
                `"I am not ready to decide."`,
              ],
            },
            `Do not react with an instant discount. First, ask: "Too expensive compared to what?" or "What price did you have in mind?" The answer tells you which problem you have.`,
          ],
        },
        {
          type: 'read',
          title: 'Calm answers',
          body: [
            {
              example: `**Customer:** "Hmm, $45 is more than I expected."\n**Tutor:** "I understand. What were you hoping to spend?"\n**Customer:** "About $30."\n**Tutor:** "I cannot do $30 for a full hour. I could do 40 minutes for $30, or the full hour for $45. Which fits you better?"`,
            },
            `Notice what the tutor did: listened, asked, offered a **real choice** and did not give the work away.`,
            { rule: `You can say no to a price and still be kind. You cannot work for free forever.` },
          ],
        },
        {
          type: 'quiz',
          title: 'The first reply',
          question: `A customer says "That's too expensive." What is the best first reply?`,
          options: [
            `"OK, I'll take half off."`,
            `"No, it isn't."`,
            `"I understand. What price did you have in mind, and what matters most to you?"`,
          ],
          answer: 2,
          explain: `Asking finds the real reason. Caving instantly loses money and signals your price was not real. Arguing makes the customer defensive.`,
        },
        {
          type: 'read',
          title: 'Honest follow-up',
          body: [
            `Many sales are lost because nobody follows up. Customers are busy; they forget.`,
            {
              list: [
                `Follow up once within a few days with something useful, not just "any news?".`,
                `Give the person a clear next step: "Shall I hold Saturday for you until Wednesday?"`,
                `Try again at most two or three times. If there is no reply, stop politely: "I will close this for now, and I am happy to help whenever you are ready."`,
              ],
            },
            { warn: `Do not spam or guilt-trip. "I guess you don't care about this" is pressure, not follow-up.` },
          ],
        },
        {
          type: 'quiz',
          title: 'Good follow-up',
          question: `Which follow-up message is best?`,
          options: [
            `"Hi, did you decide? You're missing out!"`,
            `"Hi Sam, quick note: I can hold Saturday 10am for your garden until Wednesday. Would you like me to keep it?"`,
            `"Why haven't you replied?"`,
          ],
          answer: 1,
          explain: `The second message is friendly, specific and easy to answer. The others use pressure or blame.`,
        },
        {
          type: 'read',
          title: 'What a loyal customer is worth',
          body: [
            `Finding a new customer takes time and effort. Keeping one is usually cheaper. A happy regular tends to buy again, and may tell friends.`,
            { example: `Lena runs a jam stall. A regular spends $12 a month on average and shops for 12 months, so that one regular is worth about **$144 in sales**. If she loses that customer to a bad experience, she has to find a new one just to stand still.` },
            `You keep customers by being reliable, doing what you promised, fixing mistakes quickly and saying thanks. No tricks.`,
          ],
        },
        {
          type: 'calc',
          title: 'The value of regulars',
          body: [
            `Lena sells jars that cost $6 to make at a 40% margin, so the price is $10. Fixed stall costs are $300 a month. She sells 60 jars now and loses money.`,
            `Regular customers each buy a few jars every month. Raise the sales to see how many regulars would make the stall pay.`,
          ],
          calc: 'pricing',
          preset: { cost: 6, margin: 40, fixed: 300, units: 60 },
          task: `Keep the margin at 40% or more and raise the jars sold until the monthly profit is at least $150.`,
          done: (o) => o.margin >= 40 && o.profit >= 150,
          hint: `Each jar earns $4. Profit = 4 x jars - 300. You need roughly 113 jars or more.`,
          success: `About 115 jars a month. If each regular buys 3 jars, that is roughly 38 regulars. Losing 5 of them to a careless mistake is a real hit.`,
        },
        {
          type: 'read',
          title: 'Fix mistakes fast',
          body: [
            `Everyone makes mistakes. A customer who gets a quick, honest fix often becomes more loyal than one who never had a problem.`,
            {
              steps: [
                `Say sorry plainly: "I am sorry, that is my mistake."`,
                `Fix it or offer a fair fix.`,
                `Check that they are happy.`,
                `Note what went wrong so it does not repeat.`,
              ],
            },
          ],
        },
        {
          type: 'quiz',
          title: 'The late delivery',
          question: `You promised a cake for Saturday but it will be a day late. What is the best thing to do?`,
          options: [
            `Say nothing and hope they do not notice.`,
            `Tell them now, apologise, and offer a fair fix like a discount or a delivery.`,
            `Blame the oven and refuse to talk about it.`,
          ],
          answer: 1,
          explain: `Honesty early gives the customer time to adapt. Silence or excuses damage trust, which is the most valuable asset a small seller has.`,
        },
        {
          type: 'read',
          title: 'What you learned',
          body: [
            {
              list: [
                `"Too expensive" has several meanings. Ask before you cut.`,
                `Offer real choices instead of free discounts.`,
                `Follow up once or twice with something useful, and stop politely.`,
                `A regular customer is worth far more than one sale.`,
                `Fix mistakes quickly and honestly.`,
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'sales-3',
      title: 'Clear messages and honest selling',
      minutes: 10,
      summary: 'Write short clear messages, sell without pressure or lies, and say no gracefully when a job is a bad fit.',
      steps: [
        {
          type: 'read',
          title: 'A short, clear message',
          body: [
            `Customers are busy. A message that is short and clear gets answered. Aim for four parts:`,
            {
              steps: [
                `A friendly greeting with their name.`,
                `Why you are writing, in one sentence.`,
                `What you offer, the price, and the next step.`,
                `A warm closing.`,
              ],
            },
            {
              example: `Hi Mr. Cruz,\nI saw you were looking for someone to mow your lawn on weekends. I can do it every Saturday morning for $25 a visit, including edging. If you like, I can do a first visit this Saturday and you pay only if you are happy. Would that work?\nThanks, Tomas`,
            },
            { tip: `Read your message aloud before sending. If it sounds rushed or confusing, cut words.` },
          ],
        },
        {
          type: 'read',
          title: 'Ethics: no lies, no pressure',
          body: [
            `You build a business on trust. Short-term tricks cost far more later.`,
            {
              list: [
                `**No lies.** Do not claim skills, reviews or results you do not have.`,
                `**No fake pressure.** "Only 2 left!" when it is false, or "Decide in 10 minutes or lose it" are tricks.`,
                `**No hiding costs.** Tell people the full price up front.`,
                `**Respect a no.** A clear no is an answer, not a challenge.`,
              ],
            },
            { warn: `Some places have laws against misleading advertising, especially when selling to children or about health. Ask an adult and check local rules.` },
          ],
        },
        {
          type: 'quiz',
          title: 'Ethical or not?',
          question: `Which is an ethical way to encourage a customer to book?`,
          options: [
            `"I have two openings this week. If you want one, tell me by Thursday so I can plan."`,
            `"Everyone else already booked. You'll regret it!"`,
            `"If you don't book now I'll tell your friends you were rude."`,
          ],
          answer: 0,
          explain: `The first is true and gives a real reason for a date. The others use guilt, fear or threats, which are pressure tricks.`,
        },
        {
          type: 'read',
          title: 'Saying no gracefully',
          body: [
            `Not every job is a good fit. A customer might want something outside your skills, below your price floor, or on a date you cannot make. Saying no protects your quality and your reputation.`,
            {
              example: `"Thank you for thinking of me. I am not able to take this on at that price or timeline. If you would like, I can suggest someone else, or help another time."`,
            },
            `Offering a referral or a later date is generous and keeps the relationship.`,
          ],
        },
        {
          type: 'quiz',
          title: 'A bad-fit job',
          question: `A customer wants a huge job done by tomorrow at a very low price, and you cannot do it well. What is the best response?`,
          options: [
            `Accept and rush it.`,
            `Accept and complain later.`,
            `Politely decline, explain why in one line, and offer a later date or a referral.`,
          ],
          answer: 2,
          explain: `A rushed, poor job damages your name and costs you time. A kind no keeps the door open for a better fit.`,
        },
        {
          type: 'calc',
          title: 'What unpaid time costs',
          body: [
            `Sam, a tutor, spends a lot of time chatting with people who never book, and only 10 hours a week are billable. He wants to keep $40,000 a year, pays $2,000 in costs, sets aside 25% for tax and takes 4 weeks off.`,
            `At 10 billable hours the minimum rate is far above what students pay. Saying no to bad fits and following up well helps fill the billable hours. Find a number of billable hours that brings the rate to a believable level.`,
          ],
          calc: 'freelance',
          preset: { target: 40000, expenses: 2000, taxPct: 25, hours: 10, weeksOff: 4 },
          task: `Keep the target at $40,000 and raise the billable hours until the minimum rate is $60 or less.`,
          done: (o) => o.target >= 40000 && o.rate <= 60,
          hint: `You need roughly 20 billable hours a week for a rate near $58.`,
          success: `The fewer hours you can bill, the higher each hour must cost. Time spent on the wrong customers is time you cannot bill.`,
        },
        {
          type: 'read',
          title: 'Keep every promise small and true',
          body: [
            `Reliable people stand out because many others forget. A few habits do most of the work:`,
            {
              list: [
                `Reply within a day, even if only to say "I will get back to you Thursday".`,
                `Confirm details in writing: what, when, how much.`,
                `Under-promise and over-deliver on time.`,
                `Say thank you after every job and ask if they are happy.`,
              ],
            },
          ],
        },
        {
          type: 'quiz',
          title: 'The best habit',
          question: `Which habit most helps you earn repeat customers?`,
          options: [
            `Doing what you promised, when you promised, and being honest about problems.`,
            `Offering the biggest discount every time.`,
            `Making the customer feel they must buy today.`,
          ],
          answer: 0,
          explain: `Trust brings customers back. Constant discounts shrink your profit, and pressure makes people avoid you next time.`,
        },
        {
          type: 'read',
          title: 'What you learned',
          body: [
            {
              list: [
                `A good message is short: greeting, reason, offer with price, and a next step.`,
                `Sell honestly: no lies, no fake pressure, no hidden costs.`,
                `Respect a no. Say no gracefully when a job is a bad fit.`,
                `Unpaid time raises the rate you need. Protect your billable hours.`,
                `Reliability and trust bring customers back.`,
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
        q: `What should you mostly do in the first part of a sales conversation?`,
        options: [`Talk about yourself`, `Ask questions and listen`, `State your lowest price`],
        answer: 1,
        explain: `Listening shows you what the customer needs, so you can offer something that truly fits instead of guessing.`,
      },
      {
        q: `Which is an open question?`,
        options: [`"What would a great result look like for you?"`, `"Do you want it blue?"`, `"Is that OK?"`],
        answer: 0,
        explain: `Open questions cannot be answered with a plain yes or no, so they invite the customer to explain what matters.`,
      },
      {
        q: `Which is a benefit rather than a feature?`,
        options: [`"The class has 12 lessons."`, `"I use a professional camera."`, `"You will have photos ready for your sign and website."`],
        answer: 2,
        explain: `Benefits describe what the customer gets. Features describe the product or seller. Use both, but lead with benefits that match the customer's need.`,
      },
      {
        q: `A customer says "That's too expensive." What is a good first move?`,
        options: [`Offer half off immediately`, `Ask what price they had in mind and what matters most`, `Tell them they are wrong`, `Stop talking to them`],
        answer: 1,
        explain: `"Too expensive" can mean many things. Asking reveals the real problem so you can offer a fair choice without simply cutting your price.`,
      },
      {
        q: `Each jar of jam earns $4 profit, and fixed costs are $200 a month. How many jars must be sold for a $120 monthly profit?`,
        options: [`50`, `80`, `30`],
        answer: 1,
        explain: `Profit = 4 x jars - 200. For $120 profit you need 4 x jars = 320, so 80 jars.`,
      },
      {
        q: `How should you follow up with someone who has not replied?`,
        options: [`Message them every hour`, `Send one or two friendly, useful messages, then stop politely`, `Tell them they are missing out`],
        answer: 1,
        explain: `Gentle follow-up helps busy people. Spamming or guilt-tripping damages trust and wastes your time.`,
      },
      {
        q: `A regular customer spends $15 a month and stays for 10 months. About how much is that customer worth in sales?`,
        options: [`$25`, `$150`, `$1,500`, `$15`],
        answer: 1,
        explain: `$15 x 10 months = $150. Remember that sales are not profit, but keeping customers is usually cheaper than finding new ones.`,
      },
      {
        q: `Which behaviour is NOT ethical selling?`,
        options: [`Giving the full price up front`, `Claiming "only 1 left!" when you have 50`, `Saying no to a job you cannot do well`],
        answer: 1,
        explain: `A false claim of scarcity is a lie used to pressure the customer. It can also break advertising rules in some places.`,
      },
      {
        q: `You make a mistake on an order. What is the best thing to do?`,
        options: [`Tell the customer quickly, apologise, and offer a fair fix`, `Hope they do not notice`, `Blame them`, `Delete their messages`],
        answer: 0,
        explain: `Quick, honest fixes often make customers more loyal than if nothing had gone wrong. Hiding problems destroys trust.`,
      },
      {
        q: `Which message is most likely to get a reply?`,
        options: [`A long story about your life with no price`, `A one-line "pls reply"`, `A short, friendly note with the offer, price and a clear next step`],
        answer: 2,
        explain: `Short, specific messages are easy to answer. Include what you offer, what it costs and what happens next.`,
      },
      {
        q: `A tutor can bill only 10 hours a week but needs $48,000 a year before tax and costs. Compared with 20 billable hours a week, the hourly rate needed is about...`,
        options: [`Twice as high`, `Half as high`, `The same`],
        answer: 0,
        explain: `The same yearly money from half the billable hours means each hour must pay about twice as much. This is why unpaid time matters.`,
      },
      {
        q: `A customer wants a big job tomorrow at a price below your costs. What should you do?`,
        options: [`Accept and hope`, `Politely decline, give a short reason, and suggest a later date or another seller`, `Accept and do poor work`, `Ignore the message`],
        answer: 1,
        explain: `A kind, clear no protects your quality, your income and your reputation, and leaves the door open for better fits.`,
      },
    ],
  },
};

export default course;
