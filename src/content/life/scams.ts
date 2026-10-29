import type { Course } from '../types';

const course: Course = {
  id: 'scams',
  kind: 'life',
  title: 'Scam and Risk Awareness',
  icon: '🛡️',
  color: '#D9534F',
  level: 'Beginner',
  summary: `Learn the tricks scammers use, how to check what is real, what to do if you get caught, and how to think clearly about risk.`,
  outcomes: [
    `Recognize the warning signs: urgency, secrecy, pressure and too-good-to-be-true offers`,
    `Spot phishing, texting scams and impersonation, and verify safely`,
    `Do the math on "guaranteed return" promises and see why they fail`,
    `Know what to do if you were scammed`,
    `Protect accounts with unique passwords and two-factor sign-in, and weigh probability against impact`,
  ],
  lessons: [
    {
      id: 'scams-1',
      title: `How scams work`,
      minutes: 9,
      summary: `The pressure tricks behind almost every scam, and how to check before you act.`,
      steps: [
        {
          type: 'read',
          title: `Anyone can be fooled`,
          body: [
            `Scammers are not stupid people targeting stupid people. They are professionals who study how people think when they are rushed, scared or hopeful. Smart, careful people get fooled too. The goal of this course is to build habits, not to make you feel afraid.`,
            { warn: `This course is general education. It is NOT legal or financial advice. Laws and reporting offices differ by country, so check official sources and ask a trusted adult.` },
          ],
        },
        {
          type: 'read',
          title: `The five warning signs`,
          body: [
            { steps: [
              `**Urgency**: "Act now," "last chance," "your account closes in one hour."`,
              `**Secrecy**: "Don't tell anyone," "your parents will not understand."`,
              `**Pressure**: they keep calling or messaging, make you feel guilty or scared.`,
              `**Odd payment**: gift cards, wire transfers, crypto, or cash by courier. These are hard to undo.`,
              `**Too good to be true**: huge prizes, guaranteed profits, secret methods.`,
            ] },
            { rule: `A real offer survives waiting a day and asking someone you trust. A scam needs you to rush and stay quiet.` },
          ],
        },
        {
          type: 'quiz',
          title: `Spot the red flag`,
          question: `A message says: "You won a prize! Pay a $40 fee in gift cards within 2 hours and tell nobody." Which is the biggest warning sign?`,
          options: [`The message is short`, `The prize is mentioned`, `Urgency, secrecy and a gift-card payment all at once`],
          answer: 2,
          explain: `Urgency, secrecy and payment by gift card are three classic signs together. Real prizes do not require fees in gift cards.`,
        },
        {
          type: 'read',
          title: `Phishing, smishing and fake calls`,
          body: [
            `**Phishing** is a fake email trying to make you click a link or share a password. **Smishing** is the same by text message. **Vishing** is by phone call.`,
            `Typical lines: "Your package is stuck, pay a small fee," "unusual login on your account," "your bank needs to verify you."`,
            { tip: `Hints it is fake: a link that does not match the real website, small spelling mistakes in the address, a sender you do not expect, and any message asking for a code, password or payment.` },
          ],
        },
        {
          type: 'read',
          title: `Impersonation and how to verify`,
          body: [
            `Scammers pretend to be banks, delivery companies, tech support, government offices, your boss, a school, or even a family member in trouble. They can fake the name on a caller ID or the look of a logo.`,
            `**Verify on your own terms:** stop, do not click or call back using their details. Open the official website or app by typing the address yourself, or call the number printed on your card or on the official site. Ask a trusted adult.`,
            { warn: `Real banks and agencies do not ask you to move money to a "safe account," read out a one-time code, or pay with gift cards.` },
          ],
        },
        {
          type: 'quiz',
          title: `What would you do?`,
          question: `A text says your bank account is locked, with a link to "fix it now". What is the safest move?`,
          options: [`Click the link quickly before the account closes`, `Reply STOP so they remove you`, `Ignore the link, then open your bank's official app or call the number on your card`],
          answer: 2,
          explain: `Never use the link in a surprise message. Go to the official app or number yourself. Even replying can confirm that your number is active.`,
        },
        {
          type: 'read',
          title: `Do the math on "guaranteed" gains`,
          body: [
            `Suppose someone promises "30% profit every month, guaranteed." That sounds small, 30%, but it repeats. 1.3 multiplied 12 times is about 23. So $1,000 would become about **$23,000 in one year**, and in two years about $540,000.`,
            `Honest investments have no guaranteed rate like that. Even the most generous growth rates people dream about are far lower. Let's see what 15% a year, the top of our calculator's slider, really does to $1,000.`,
          ],
        },
        {
          type: 'calc',
          title: `Reality check`,
          body: [
            `Put in $1,000 with no monthly additions, an assumed growth of 15% a year, for one year. That rate is already much higher than almost anyone can count on. Compare the answer to what the scammer claimed.`,
          ],
          calc: 'compound',
          preset: { principal: 1000, monthly: 200, rate: 6, years: 20 },
          task: `Set Add every month to 0, Yearly growth rate to 15, and Years to 1.`,
          done: (o) => o.monthly === 0 && o.rate === 15 && o.years === 1,
          hint: `Three sliders: monthly to 0, rate to 15, years to 1.`,
          success: `About $1,160 after a year, nowhere near $23,000. A promise that is 20 times bigger than this is not real.`,
        },
        {
          type: 'read',
          title: `What you learned`,
          body: [
            { list: [
              `Scams lean on urgency, secrecy, pressure, odd payments and too-good offers`,
              `Phishing (email), smishing (text) and vishing (phone) all try to hurry you`,
              `Caller names and logos can be faked, so verify using official sources you find yourself`,
              `Real institutions never ask for gift cards or one-time codes`,
              `Guaranteed high returns fail basic math`,
            ] },
          ],
        },
      ],
    },
    {
      id: 'scams-2',
      title: `Investment, crypto and relationship scams`,
      minutes: 10,
      summary: `How money scams are dressed up, and the honest numbers that expose them.`,
      steps: [
        {
          type: 'read',
          title: `The "guaranteed return" machine`,
          body: [
            `Fake investment schemes usually promise high, steady returns with "no risk." Real investments rise and fall, and no honest person can promise a fixed high gain.`,
            `Many are **Ponzi schemes**: the operator pays early customers with money from newer customers. It looks real while new people keep joining, and collapses when they stop. The early payouts are bait to bring in more victims.`,
          ],
        },
        {
          type: 'read',
          title: `More costumes the same trick wears`,
          body: [
            { table: { head: [`Type`, `How it looks`, `The giveaway`], rows: [
              [`Crypto "double your coins"`, `A famous person says send coins, get twice back`, `Real people never double what you send`],
              [`Romance`, `Online friend, quick "love", then a money emergency`, `They never meet in person, and then ask for money`],
              [`Giveaway`, `Win a phone or gift cards`, `You pay a "fee" or share your login`],
              [`Fake job`, `Easy pay, you buy equipment first`, `You pay before you earn`],
              [`Recovery`, `They offer to get your lost money back for a fee`, `A second scam on the same victim`],
              [`Hype posts`, `"This penny stock is about to explode"`, `Groups push prices up to sell to you`],
            ] } },
          ],
        },
        {
          type: 'quiz',
          title: `Which one is it?`,
          question: `An online friend you have never met in person says they are stuck abroad and need $300 in gift cards, and promises to repay you double next month. What is this?`,
          options: [`A romance or friendship scam`, `A normal loan`, `A bank error`],
          answer: 0,
          explain: `Money requests from someone you never met, with gift cards and an emotional story, are a classic romance scam. Stop sending money and tell a trusted adult.`,
        },
        {
          type: 'read',
          title: `Why people fall for it`,
          body: [
            `Scams use real human feelings: **hope** (get rich), **fear** (lose your account), **kindness** (help a friend), **loneliness** (a new friend who cares), and **fear of missing out** (everyone else is joining).`,
            `Notice the feeling. If a message makes your heart race, treat that as a signal to slow down, not to speed up.`,
          ],
        },
        {
          type: 'read',
          title: `How honest growth looks`,
          body: [
            `Honest long-term investing is slow, bumpy and boring. As a teaching example, imagine saving $200 a month, starting with $1,000, with an assumed 6% yearly growth. That assumption is not a promise, since markets can do much worse or better.`,
            `The next calculator shows how long even that steady plan takes to reach $50,000. A "program" that promises $50,000 in a few weeks is either lying or about to take your money.`,
          ],
        },
        {
          type: 'quiz',
          title: `Believe it or not`,
          question: `Which of these is the most believable claim from a real, honest advisor?`,
          options: [`"Guaranteed 20% a month with no risk"`, `"Investments can lose value, and past results do not predict the future"`, `"Send me your account password so I can grow it for you"`],
          answer: 1,
          explain: `Honest advisors admit that risk exists. Guaranteed returns and password requests are classic scam lines.`,
        },
        {
          type: 'calc',
          title: `How long is honest?`,
          body: [
            `Keep $1,000 start, $200 a month and the 6% assumed growth. The calculator starts at 5 years. Raise Years until the balance reaches $50,000.`,
          ],
          calc: 'compound',
          preset: { principal: 1000, monthly: 200, rate: 6, years: 5 },
          task: `Raise Years until the ending balance is $50,000 or more.`,
          done: (o) => o.final >= 50000,
          hint: `Somewhere around 14 years.`,
          success: `Roughly 14 years of steady saving. Real wealth takes years, which is why "$50,000 in a month" is a lie.`,
        },
        {
          type: 'read',
          title: `Hard-to-undo payments`,
          body: [
            `Scammers love gift cards, wire transfers, crypto and cash apps because once you pay, getting the money back is very hard. Credit cards and some bank payments have stronger dispute rights, but the rules differ by country, so check official sources.`,
            { tip: `If anyone insists you pay in an unusual way, that alone is a reason to stop and ask a trusted adult.` },
          ],
        },
        {
          type: 'quiz',
          title: `Payment red flag`,
          question: `A "seller" of a rare game says they only accept payment by gift card codes sent by text. What should you do?`,
          options: [`Pay quickly before it sells out`, `Walk away from this seller, since this payment method is a classic scam sign`, `Pay half now and half later`],
          answer: 1,
          explain: `Gift card payment is the number one sign of a scam. Use a protected payment method with a seller you can verify, or skip the deal.`,
        },
        {
          type: 'read',
          title: `What you learned`,
          body: [
            { list: [
              `Ponzi-style schemes pay early members with newer members' money and collapse`,
              `Romance, giveaway, fake job and recovery scams use feelings to hurry you`,
              `Honest investing is slow and can lose money, so nobody can promise big returns`,
              `Gift cards, wires and crypto payments are hard to undo and a common scam request`,
              `Slow down whenever your heart starts racing`,
            ] },
          ],
        },
      ],
    },
    {
      id: 'scams-3',
      title: `Protecting yourself and thinking about risk`,
      minutes: 10,
      summary: `What to do if you get caught, how to lock down your accounts, and how to weigh risks sensibly.`,
      steps: [
        {
          type: 'read',
          title: `If you think you were scammed`,
          body: [
            `First, it is not your fault. Scammers are skilled. Shame is their best friend because it keeps victims quiet. Act quickly and calmly:`,
            { steps: [
              `**Stop contact.** Do not reply, do not send more money, even if they threaten you.`,
              `**Tell a trusted adult** right away. Telling someone is the most important step.`,
              `**Call your bank or card company** using the number on your card. Ask about freezing or reversing a payment.`,
              `**Change passwords** for any account that was involved, and turn on two-factor sign-in.`,
              `**Keep evidence**: screenshots, messages, account names.`,
              `**Report it** to your country's official fraud or consumer protection office and the website or app where it happened.`,
            ] },
            { warn: `Beware of "recovery agents" who contact you offering to get your money back for a fee. That is usually a second scam.` },
          ],
        },
        {
          type: 'quiz',
          title: `First move`,
          question: `After realizing you sent money to a scammer, what is the best first move?`,
          options: [`Send more money to unlock what you already sent`, `Stop contact, tell a trusted adult and call your bank`, `Say nothing and hope it goes away`],
          answer: 1,
          explain: `Stop, tell someone and contact your bank fast, since speed can matter. Sending more money is how scammers keep going.`,
        },
        {
          type: 'read',
          title: `Passwords and two-factor sign-in`,
          body: [
            `Use a **different password for every important account**. If one site leaks yours, scammers try it everywhere else. Long passphrases of several random words beat short complicated ones. A password manager can remember them for you.`,
            `**Two-factor sign-in** asks for a second proof, such as a code from an app, a security key, or a prompt on your phone. Even if your password leaks, the thief is blocked.`,
            { rule: `Never share a one-time code, password or recovery phrase with anyone, including someone claiming to be support.` },
          ],
        },
        {
          type: 'read',
          title: `Thinking about risk: probability and impact`,
          body: [
            `Every choice has two questions. **How likely is it to go wrong** (probability)? **How bad would it be if it did** (impact)?`,
            { table: { head: [``, `Low impact`, `High impact`], rows: [[`Likely`, `Annoying: handle it`, `Avoid or fix quickly`], [`Unlikely`, `Ignore or accept`, `Protect against it`]] } },
            `A rare event with huge impact, such as losing all your savings to one scam, still deserves protection. A common event with small impact, like a $2 fee, you can just accept.`,
            { rule: `Never risk money you cannot afford to lose. If a loss would hurt your rent, food or safety, it should not be at risk.` },
          ],
        },
        {
          type: 'quiz',
          title: `Probability or impact?`,
          question: `A stranger offers a "once in a lifetime" chance that has a small chance of paying off, but you would need to put in your whole rent money. What is the sensible view?`,
          options: [`The chance is small, so the impact doesn't matter`, `A huge impact is too risky when you cannot afford the loss`, `Everything is fine if they say it is guaranteed`],
          answer: 1,
          explain: `Even an unlikely loss is unacceptable if it would be devastating. Never risk money you need.`,
        },
        {
          type: 'read',
          title: `Pushy "easy credit" and costly debt`,
          body: [
            `Scammers and predatory lenders also use debt. Offers like "guaranteed approval, no checks, pay a fee first" can lock you into very high interest. A real lender never asks for an upfront fee before giving a loan.`,
            `Look at how interest works with a fictional $1,000 loan at 36% yearly interest. That is about $30 of interest each month. If you pay only $40, almost all of it just covers interest.`,
          ],
        },
        {
          type: 'calc',
          title: `Escape the debt trap`,
          body: [
            `A loan of $1,000 charges 36% a year. A $40 monthly payment barely dents the balance. Raise the payment until the loan is paid off in 18 months or less.`,
          ],
          calc: 'loan',
          preset: { balance: 1000, apr: 36, payment: 40 },
          task: `Raise Monthly payment until the debt is paid off within 18 months.`,
          done: (o) => o.never === 0 && o.months <= 18,
          hint: `A payment around $75 does it.`,
          success: `Higher payments beat the interest, but notice how much extra the interest costs. Costly loans are a risk to avoid, not a shortcut.`,
        },
        {
          type: 'quiz',
          title: `Account safety check`,
          question: `Which is the strongest account protection?`,
          options: [`The same short password everywhere`, `A different long password for each important account plus two-factor sign-in`, `Sharing your password with your best friend`],
          answer: 1,
          explain: `Unique passwords stop one leak from spreading, and two-factor sign-in blocks thieves who learn a password.`,
        },
        {
          type: 'read',
          title: `What you learned`,
          body: [
            { list: [
              `If scammed: stop contact, tell a trusted adult, call your bank, change passwords, keep evidence, report`,
              `It is not your fault, and shame helps only the scammer`,
              `Use unique long passwords and two-factor sign-in, and never share codes`,
              `Weigh both probability and impact, and never risk what you can't afford to lose`,
              `Be wary of upfront fees and pressure around loans`,
            ] },
          ],
        },
      ],
    },
  ],
  exam: {
    passPercent: 70,
    questions: [
      { q: `Which is a classic warning sign of a scam?`, options: [`A clear, calm explanation with time to decide`, `A demand to act in the next hour and tell nobody`, `A request to use the official website`], answer: 1, explain: `Urgency and secrecy are the pressure tricks scammers rely on.` },
      { q: `What is smishing?`, options: [`A scam by text message`, `A scam by email`, `A scam by mail`], answer: 0, explain: `Smishing is phishing delivered by SMS text. Phishing is by email, and vishing is by phone.` },
      { q: `A caller says they are from your bank and asks for a code just texted to you. What do you do?`, options: [`Read the code, since they know your name`, `Hang up, then call the number on your card`, `Ask them to call back from a different number`], answer: 1, explain: `Never share one-time codes. Hang up and contact the bank using a number you trust.` },
      { q: `Someone promises 30% profit every month, guaranteed. About how much would $1,000 become in a year if that were true?`, options: [`About $1,360`, `About $4,000`, `About $23,000`], answer: 2, explain: `1.3 multiplied 12 times is about 23, so a $1,000 start would reach about $23,000. That impossibility is a sign of fraud.` },
      { q: `What is a Ponzi scheme?`, options: [`Paying old investors with money from new ones`, `A savings plan run by a bank`, `A fund that copies an index`], answer: 0, explain: `Ponzi schemes recycle new members' money to pay earlier ones, and they collapse when new money slows.` },
      { q: `Which payment request is the biggest red flag?`, options: [`Paying by gift card codes to a stranger`, `Paying a store at checkout`, `Paying a bill through your own bank`], answer: 0, explain: `Gift cards are almost impossible to recover and are the scammers' favorite payment method.` },
      { q: `With a saving plan of $1,000 start plus $200 a month at an assumed 6%, how long does reaching $50,000 take?`, options: [`A few weeks`, `About 14 years`, `Exactly 2 years`], answer: 1, explain: `Honest saving takes years. That's why "big money in weeks" is a lie.` },
      { q: `You think you fell for a scam. What is the best first step?`, options: [`Stop contact and tell a trusted adult`, `Send them more money to fix it`, `Delete everything and stay quiet`], answer: 0, explain: `Stopping contact and telling someone stops further damage. Keep evidence rather than deleting it.` },
      { q: `Someone offers to recover your lost money for an upfront fee. What is most likely?`, options: [`A helpful professional`, `A government service`, `A second scam`], answer: 2, explain: `Recovery offers that charge upfront are often scams targeting people already scammed.` },
      { q: `Why use a different password for each important account?`, options: [`So one leaked password can't open all your accounts`, `Because websites require it by law`, `So you never need two-factor sign-in`], answer: 0, explain: `If one site is hacked, thieves try the same password elsewhere. Unique passwords stop that chain.` },
      { q: `Which event deserves protection even though it is unlikely?`, options: [`Losing a $1 coupon`, `Losing all of your savings`, `A small snack price rise`], answer: 1, explain: `High impact deserves care even at low probability. Weigh both probability and impact.` },
      { q: `Which money rule best summarizes safe risk-taking?`, options: [`Borrow to chase a sure win`, `Never risk money you can't afford to lose`, `Risk more when a deal is urgent`], answer: 1, explain: `If a loss would damage your essentials, that money must not be at risk. Urgency is a warning, not a reason.` },
    ],
  },
};

export default course;
