'use client'

import { useState } from 'react'
import { BookOpen, ChevronRight, Calculator, TrendingUp, Clock, ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced'

interface Topic {
  id: string
  title: string
  description: string
  difficulty: Difficulty
  readTime: number
  icon: string
  content: { heading: string; body: string }[]
}

const TOPICS: Topic[] = [
  {
    id: 'credit-score',
    title: 'Understanding Your Credit Score',
    description: 'Learn how credit scores work, what affects them, and why they matter.',
    difficulty: 'Beginner',
    readTime: 4,
    icon: '📊',
    content: [
      { heading: 'What Is a Credit Score?', body: 'A credit score is a three-digit number between 300 and 850 that represents your creditworthiness — essentially, how likely you are to repay debts on time. Lenders use this number to decide whether to approve you for loans, credit cards, or mortgages, and at what interest rate. The most widely used model is the FICO Score, developed by Fair Isaac Corporation.' },
      { heading: 'How Is It Calculated?', body: 'Your score is made up of five factors: Payment History (35%) — the single most important factor. Even one missed payment can drop your score significantly. Credit Utilization (30%) — how much of your available credit you\'re using. Keeping this below 30% is ideal; below 10% is excellent. Length of Credit History (15%) — older accounts signal stability. Avoid closing your oldest credit cards. Credit Mix (10%) — having a mix of revolving credit (cards) and installment loans (auto, mortgage) shows you can handle different debt types. New Credit (10%) — each hard inquiry from a credit application can drop your score a few points temporarily.' },
      { heading: 'Score Ranges Explained', body: 'Scores are grouped into ranges: 300–579 is Poor (very difficult to get approved), 580–669 is Fair (may get approved but with higher rates), 670–739 is Good (most lenders will approve you), 740–799 is Very Good (you\'ll qualify for better rates), and 800–850 is Exceptional (you get the best rates available). Even going from 620 to 740 can save you tens of thousands of dollars in mortgage interest over 30 years.' },
      { heading: 'How to Check Your Score', body: 'You\'re entitled to a free credit report every year from all three bureaus (Equifax, Experian, TransUnion) at AnnualCreditReport.com — this is the official, government-mandated site. Many banks and credit cards now offer free FICO Score monitoring in your account dashboard. Apps like Credit Karma show your VantageScore, which is slightly different from FICO but still a useful indicator of your credit health.' },
      { heading: 'Common Credit Score Myths', body: 'Myth: Checking your own credit hurts your score. False — that\'s a soft inquiry and doesn\'t affect your score. Only hard inquiries from credit applications do. Myth: Carrying a balance helps your score. False — paying in full each month is ideal and saves you interest. Myth: Closing credit cards improves your score. Often false — closing cards reduces your available credit limit, which can increase your utilization ratio and actually lower your score.' },
    ],
  },
  {
    id: '50-30-20',
    title: 'The 50/30/20 Budgeting Rule',
    description: 'A simple framework to allocate your income for needs, wants, and savings.',
    difficulty: 'Beginner',
    readTime: 3,
    icon: '📐',
    content: [
      { heading: 'What Is the 50/30/20 Rule?', body: 'The 50/30/20 rule is a straightforward budgeting framework popularized by Senator Elizabeth Warren in her book "All Your Worth." It suggests dividing your after-tax income into three broad categories: 50% for needs, 30% for wants, and 20% for savings and debt repayment. Its simplicity makes it one of the most popular budgeting methods for beginners.' },
      { heading: '50% — Needs', body: 'Needs are expenses you can\'t avoid: rent or mortgage, groceries, utilities, transportation to work, minimum loan payments, and insurance. If your needs exceed 50% of income, you\'ll need to find ways to reduce fixed costs — perhaps getting a roommate, moving to a less expensive area, or refinancing debt. This is the category most people struggle with in high cost-of-living cities.' },
      { heading: '30% — Wants', body: 'Wants are the things that improve your quality of life but aren\'t essential: dining out, subscriptions (Netflix, Spotify), gym memberships, vacations, new clothes, hobbies, and entertainment. This category is where most lifestyle inflation happens. When your income grows, resist the urge to immediately expand your wants — redirect that extra income to savings first.' },
      { heading: '20% — Savings & Debt Repayment', body: 'This 20% should go toward building your financial future: emergency fund contributions, retirement accounts (401k, IRA), investments, and paying down high-interest debt above minimums. Financial advisors often recommend prioritizing in this order: emergency fund first (3-6 months of expenses), then employer 401k match (it\'s free money), then high-interest debt, then additional retirement contributions.' },
      { heading: 'Adapting the Rule to Your Life', body: 'The 50/30/20 rule is a guideline, not a law. In expensive cities, needs might realistically be 60-65% of income — that\'s okay, but it means cutting wants or finding ways to earn more. If you have high debt, you might allocate more than 20% to debt repayment temporarily. The key insight is having a framework that ensures you\'re saving something every month and not spending blindly.' },
    ],
  },
  {
    id: 'tax-basics',
    title: 'Tax Basics: W-2, 1099, and Deductions',
    description: 'Understand the difference between employee and self-employed taxes, and how deductions work.',
    difficulty: 'Beginner',
    readTime: 5,
    icon: '🧾',
    content: [
      { heading: 'W-2 vs 1099: What\'s the Difference?', body: 'A W-2 is the tax form you receive if you\'re an employee. Your employer withholds federal and state income taxes, Social Security (6.2%), and Medicare (1.45%) from each paycheck. A 1099-NEC is issued to freelancers, contractors, and self-employed workers. Nobody withholds taxes for you — you\'re responsible for paying all taxes yourself, including both the employee AND employer portions of Social Security and Medicare (totaling 15.3%, called self-employment tax). This is why freelancers should set aside 25-30% of every payment for taxes.' },
      { heading: 'Understanding Tax Brackets', body: 'The US uses a progressive tax system — you don\'t pay the same rate on all your income. For 2024, single filers pay 10% on income up to $11,600, 12% on the next portion up to $47,150, and so on up to 37% on income over $609,350. Critically, if you earn $50,000, you\'re NOT paying 22% on all of it — you pay 10% on the first $11,600, 12% on the next chunk, and 22% only on the amount above $47,150. Your effective tax rate will always be lower than your marginal rate.' },
      { heading: 'Standard vs Itemized Deductions', body: 'Every taxpayer gets to reduce their taxable income by either the standard deduction or itemized deductions, whichever is larger. For 2024, the standard deduction is $14,600 for single filers and $29,200 for married filing jointly. Itemized deductions include mortgage interest, state and local taxes (SALT, capped at $10,000), charitable contributions, and certain medical expenses. Most people take the standard deduction — only itemize if your deductions exceed the standard amount.' },
      { heading: 'Above-the-Line Deductions', body: 'Some deductions reduce your income before you even get to the standard vs itemized question. These "above-the-line" deductions include: contributions to a traditional IRA (up to $7,000 in 2024), student loan interest (up to $2,500), contributions to an HSA (Health Savings Account), and self-employment taxes. Contributing to a pre-tax 401k through your employer also reduces your taxable income dollar-for-dollar, up to $23,000 in 2024.' },
      { heading: 'Tax Credits vs Deductions', body: 'Deductions reduce your taxable income; credits reduce your actual tax bill — credits are more valuable dollar-for-dollar. A $1,000 deduction saves you $220 if you\'re in the 22% bracket. A $1,000 tax credit saves you $1,000 regardless of bracket. Important credits include the Child Tax Credit, Earned Income Tax Credit (EITC) for lower-income workers, Education Credits (American Opportunity and Lifetime Learning), and the Retirement Savings Contributions Credit (Saver\'s Credit).' },
    ],
  },
  {
    id: 'emergency-fund',
    title: 'Building an Emergency Fund',
    description: 'Why you need one, how much to save, and where to keep it.',
    difficulty: 'Beginner',
    readTime: 3,
    icon: '🛡️',
    content: [
      { heading: 'What Is an Emergency Fund?', body: 'An emergency fund is cash set aside for unexpected, necessary expenses: job loss, medical emergency, major car repair, home repair, or any other financial shock. It\'s not for vacations, sales, or planned purchases. The whole point is that when life throws a curveball, you don\'t need to go into debt — you have a financial buffer that lets you handle the problem without panic.' },
      { heading: 'How Much Should You Save?', body: 'The standard recommendation is 3-6 months of essential living expenses (not income). If you have a stable job, a working spouse, and low fixed costs, 3 months may suffice. If you\'re self-employed, in a volatile industry, have dependents, or have health issues, aim for 6-12 months. Start with a mini-goal of $1,000 — this alone prevents most people from going deeper into debt when small emergencies hit.' },
      { heading: 'Where to Keep It', body: 'Your emergency fund should be liquid (accessible immediately) and safe (not in the stock market). High-yield savings accounts (HYSAs) are ideal — they currently earn 4-5% APY while keeping your money FDIC insured and accessible. Don\'t keep it in a checking account (you\'ll spend it) or a brokerage account (markets can drop 40% right when you need the money). The slightly lower return of a savings account vs. investing is the "insurance premium" you pay for this financial safety net.' },
      { heading: 'Building It When Money Is Tight', body: 'Even if you can only save $25/week, that\'s $1,300 in a year. Automate a transfer to your savings account on payday — you can\'t spend what you don\'t see. Consider temporarily cutting discretionary spending, selling unused items, or taking on extra income. Tax refunds are an excellent way to jumpstart or fully fund an emergency fund. Once it\'s funded, resist the urge to "borrow" from it for non-emergencies.' },
    ],
  },
  {
    id: 'debt-payoff',
    title: 'Debt Avalanche vs Debt Snowball',
    description: 'Two proven strategies for paying off multiple debts. Which is right for you?',
    difficulty: 'Intermediate',
    readTime: 4,
    icon: '⚡',
    content: [
      { heading: 'Why Your Payoff Strategy Matters', body: 'If you have multiple debts — credit cards, student loans, car loan, personal loan — you need a strategy beyond just paying minimums. Paying only minimums keeps you in debt for decades and costs you a fortune in interest. Having a clear attack plan ensures you\'re making progress and staying motivated. The two most effective methods are the Debt Avalanche and Debt Snowball.' },
      { heading: 'The Debt Avalanche Method', body: 'With the avalanche method, you list your debts from highest to lowest interest rate and put all extra money toward the highest-rate debt while paying minimums on everything else. Once that\'s paid off, you roll its payment to the next highest-rate debt. This is mathematically optimal — you pay the least total interest and get out of debt fastest. The downside: high-interest debts are often large (like student loans), so it can take a long time before you see a debt fully eliminated, which can be demotivating.' },
      { heading: 'The Debt Snowball Method', body: 'With the snowball method (popularized by Dave Ramsey), you list debts from smallest to largest balance, regardless of interest rate, and attack the smallest first. Once that\'s gone, you roll that payment to the next smallest. It feels slower mathematically but creates powerful psychological wins early — eliminating a debt entirely feels great. Research shows many people stick with the snowball method better precisely because of these early victories, and a method you stick to beats the "optimal" method you abandon.' },
      { heading: 'Which Method to Choose?', body: 'The avalanche is better if you\'re disciplined and your largest balance is also your highest-rate debt. The snowball is better if you need motivational wins to stay on track, or if your high-interest debts are also large. A hybrid approach: use the avalanche for high-rate credit cards (often small balances anyway), then snowball for larger low-rate debts. The most important thing is to start. Any extra dollar above minimums accelerates your debt-free date dramatically.' },
      { heading: 'Debt Consolidation & Refinancing', body: 'If your credit has improved since you took on debt, consider refinancing to a lower interest rate. Balance transfer credit cards sometimes offer 0% APR for 12-21 months — if you can pay off the balance in that window, it\'s essentially an interest-free loan. Personal loans can consolidate multiple high-rate credit cards into one lower-rate payment. Student loan refinancing can lower rates but may forfeit federal loan protections like income-driven repayment and forgiveness programs.' },
    ],
  },
  {
    id: 'investing-basics',
    title: 'How to Invest for Beginners',
    description: 'The fundamentals of investing: stocks, bonds, index funds, and where to start.',
    difficulty: 'Beginner',
    readTime: 5,
    icon: '📈',
    content: [
      { heading: 'Why You Need to Invest', body: 'Inflation erodes the purchasing power of cash — money sitting in a checking account loses roughly 2-3% of its real value per year. Investing allows your money to grow faster than inflation. The stock market has historically returned about 10% per year on average (7% after inflation). Thanks to compound interest, even modest investments grow dramatically over decades. Someone who invests $300/month from age 25 to 65 at 7% ends up with over $700,000 — while someone who starts at 35 ends up with only about $340,000.' },
      { heading: 'Stocks vs Bonds', body: 'Stocks represent ownership shares in companies. They offer higher long-term returns but are volatile — they can drop 50% in a recession. Bonds are essentially loans to governments or companies that pay regular interest; they\'re more stable but with lower returns. A typical investment portfolio contains a mix of both — more stocks when you\'re young (time to recover from dips), shifting toward more bonds as you approach retirement. This is called asset allocation.' },
      { heading: 'Index Funds: The Best Starting Point', body: 'Instead of picking individual stocks, most experts recommend low-cost index funds that track broad market indices like the S&P 500. A single S&P 500 index fund instantly diversifies you across 500 of the largest US companies. Vanguard, Fidelity, and Schwab all offer index funds with expense ratios under 0.05% — you keep nearly all your returns. Warren Buffett famously said that for most investors, a simple S&P 500 index fund will outperform nearly any actively managed fund over time.' },
      { heading: 'Dollar-Cost Averaging', body: 'Dollar-cost averaging means investing a fixed amount on a regular schedule (say, $200 every month) regardless of market conditions. When prices are high, you buy fewer shares; when prices are low, you automatically buy more. This removes the impossible task of "timing the market" and enforces investment discipline. It\'s the natural result of investing through a 401k — contributions come out of each paycheck automatically.' },
      { heading: 'Where to Actually Start', body: 'If your employer offers a 401k with any matching, contribute at least enough to get the full match — it\'s an immediate 50-100% return. Then open a Roth IRA (if income-eligible) at Vanguard, Fidelity, or Schwab and invest in a target-date fund or S&P 500 index fund. After maxing those, use a taxable brokerage account. The sequence: 1) 401k match, 2) High-interest debt payoff, 3) Roth IRA, 4) Max 401k, 5) Taxable brokerage.' },
    ],
  },
  {
    id: 'apr-interest',
    title: 'Understanding APR and Interest',
    description: 'How interest is calculated, what APR really means, and how to minimize what you pay.',
    difficulty: 'Intermediate',
    readTime: 4,
    icon: '💳',
    content: [
      { heading: 'What Is APR?', body: 'APR stands for Annual Percentage Rate — it\'s the yearly cost of borrowing money, expressed as a percentage. Credit cards typically have APRs of 20-30%. A personal loan might be 10-25%. A mortgage might be 6-8%. Auto loans typically run 5-15%. The APR on savings accounts is called APY (Annual Percentage Yield) and represents what you earn. The key insight: a higher APR on debt is bad; a higher APY on savings is good.' },
      { heading: 'How Credit Card Interest Works', body: 'Credit cards charge daily interest. If your APR is 24%, your daily rate is 24% ÷ 365 = 0.0658% per day. If you carry a $1,000 balance, you pay about $0.66 in interest every single day. The best way to avoid all credit card interest: pay your full statement balance every month. If you do this, you effectively get a 30-day interest-free loan on every purchase plus earn rewards — making credit cards a net positive. Only carry a balance if it\'s unavoidable; pay it down as aggressively as possible.' },
      { heading: 'Compound Interest: The Double-Edged Sword', body: 'Compound interest means earning (or paying) interest on your interest. A savings account earning 5% APY on $10,000: after year 1 you have $10,500. Year 2, you earn 5% on $10,500, getting $11,025. Over 20 years, that $10,000 becomes $26,533 without adding anything. But compounding also works against you with debt — a $5,000 credit card balance at 24% APR, paying only the minimum, could take 15+ years to pay off and cost $7,000+ in interest.' },
      { heading: 'The Real Cost of Minimum Payments', body: 'Credit card companies set minimum payments intentionally low to maximize the interest you pay over time. A $3,000 balance at 20% APR with a $60 minimum payment takes 11 years to pay off and costs $4,745 total — $1,745 in pure interest. Paying $200/month instead eliminates the debt in 18 months and costs only $3,260 total. The difference is $1,485 in savings by paying $140 more per month. Always pay more than the minimum.' },
    ],
  },
  {
    id: 'retirement-accounts',
    title: 'Retirement Accounts: 401k, IRA, Roth',
    description: 'The different types of retirement accounts, their tax advantages, and when to use each.',
    difficulty: 'Intermediate',
    readTime: 5,
    icon: '🏦',
    content: [
      { heading: 'Why Use Retirement Accounts?', body: 'Retirement accounts offer significant tax advantages that dramatically boost long-term wealth. In a regular brokerage account, you pay taxes on dividends, capital gains, and income every year. Retirement accounts either defer this tax (traditional) or eliminate it entirely on growth (Roth). The difference in after-tax wealth after 30-40 years can be hundreds of thousands of dollars. This is why "maxing your retirement accounts" is almost always the right financial move before investing in taxable accounts.' },
      { heading: 'Traditional 401k and IRA', body: 'With a traditional (pre-tax) retirement account, contributions reduce your taxable income today — you\'re investing pre-tax dollars. The money grows tax-deferred, and you pay income taxes when you withdraw in retirement. The bet: you\'ll be in a lower tax bracket in retirement than now. In 2024, you can contribute up to $23,000 to a 401k ($30,500 if 50+) and up to $7,000 to a traditional IRA ($8,000 if 50+). Many employers match 401k contributions — always contribute at least enough to capture the full match.' },
      { heading: 'Roth 401k and Roth IRA', body: 'Roth accounts use after-tax dollars — you pay taxes on contributions now, but withdrawals in retirement are completely tax-free, including all the growth. The bet: you\'ll be in a higher tax bracket in retirement (or tax rates will rise). Roth IRAs have income limits: for 2024, the ability to contribute phases out for single filers between $146,000-$161,000 and married filers between $230,000-$240,000. Roth accounts also have no required minimum distributions (RMDs), making them excellent for estate planning.' },
      { heading: 'Which to Choose: Roth vs Traditional?', body: 'General guidance: if you\'re early in your career with a low income, choose Roth (you\'re in a low tax bracket now; tax-free growth is extremely valuable over 40 years). If you\'re in peak earning years with a high income, traditional may be better (reduce taxes today). Many people benefit from having both — tax diversification means you can choose which account to pull from in retirement to minimize taxes. A common strategy: contribute to traditional 401k to get the employer match, then Roth IRA to max it out.' },
      { heading: 'HSA: The Triple Tax Advantage', body: 'Health Savings Accounts (HSAs) are arguably the most tax-advantaged account available — contributions are pre-tax, growth is tax-free, and withdrawals for medical expenses are tax-free. In 2024, contribution limits are $4,150 for individuals and $8,300 for families. After age 65, you can withdraw for any reason (paying ordinary income tax, like a traditional IRA). The strategy: pay current medical expenses out-of-pocket, invest your HSA contributions, and let it grow for decades — then use it tax-free in retirement for medical costs (which are substantial).' },
    ],
  },
  {
    id: 'pay-stub',
    title: 'How to Read a Pay Stub',
    description: 'Understand every line on your paycheck — gross pay, net pay, taxes, and deductions.',
    difficulty: 'Beginner',
    readTime: 3,
    icon: '📋',
    content: [
      { heading: 'Gross Pay vs Net Pay', body: 'Your pay stub shows gross pay (what you earned before anything is taken out) and net pay (your "take-home" pay after all deductions). The difference between these two can be surprisingly large — often 25-35% of gross pay. Understanding where all that money goes is the first step to financial literacy. "Why is my paycheck so much less than my salary?" is one of the most common questions — your pay stub answers it.' },
      { heading: 'Federal Income Tax Withholding', body: 'Federal income tax is withheld based on your W-4 form. The W-4 tells your employer how much to withhold. If you claim too many allowances, you may owe taxes at filing time. Claim too few and you get a refund (but you\'ve been giving the government an interest-free loan). The goal is to come as close to zero as possible — neither owing a big amount nor getting a large refund. Adjust your W-4 after major life events: marriage, having a child, second job, etc.' },
      { heading: 'FICA: Social Security and Medicare', body: 'FICA taxes are the most consistent deductions. Social Security takes 6.2% of your wages up to $168,600 in 2024. Medicare takes 1.45% on all wages, plus an additional 0.9% on wages over $200,000. These aren\'t optional and fund your future Social Security and Medicare benefits. Your employer also pays matching FICA taxes on your behalf — this is why self-employed people pay "self-employment tax" of 15.3% (both the employee and employer portions).' },
      { heading: 'Pre-Tax vs Post-Tax Deductions', body: 'Pre-tax deductions (401k contributions, health insurance premiums, HSA contributions, FSA contributions, transit benefits) reduce your taxable income — they come out before federal and state income taxes are calculated. This makes them very tax-efficient. Post-tax deductions (Roth 401k contributions, life insurance above the employer-covered amount, garnishments) come out after taxes are calculated. Understanding this distinction helps you appreciate the real value of employer-sponsored benefits.' },
    ],
  },
  {
    id: 'improve-credit',
    title: 'Improving Your Credit Score Fast',
    description: 'Actionable strategies to raise your credit score in 30-90 days.',
    difficulty: 'Beginner',
    readTime: 3,
    icon: '⬆️',
    content: [
      { heading: 'The Fastest Win: Reduce Utilization', body: 'Credit utilization — the percentage of your credit limit you\'re using — is 30% of your score and can change month to month. If you have a $10,000 credit limit and a $4,000 balance (40% utilization), paying that down to $2,000 (20%) can raise your score 20-40 points within one billing cycle. Ask for a credit limit increase (without actually spending more) — if approved, your utilization ratio drops instantly. Ideal utilization is below 10% for maximum score benefit.' },
      { heading: 'Dispute Errors on Your Credit Report', body: '20-25% of credit reports contain errors significant enough to affect your score. Get your free reports from AnnualCreditReport.com (Equifax, Experian, TransUnion). Look for accounts you don\'t recognize (possible identity theft), incorrect late payments, wrong balances, duplicate accounts, or accounts that should have aged off (most negative items fall off after 7 years; bankruptcies after 10). Dispute errors online with each bureau — they must investigate within 30 days. Correcting a major error can dramatically boost your score.' },
      { heading: 'Become an Authorized User', body: 'If a family member or trusted friend has a credit card account with a high credit limit, low utilization, and long history, ask to be added as an authorized user. You don\'t even need to use the card. Their positive account history gets added to your credit report, potentially boosting your score significantly. This works especially well if you have a thin credit file or are rebuilding after past credit problems. Make sure the primary cardholder has excellent habits — their negative activity would hurt you too.' },
      { heading: 'Never Miss a Payment', body: 'Payment history is 35% of your score. A single missed payment — even one day late after the billing cycle ends — can drop your score 50-100 points and stays on your report for 7 years. Set up autopay for at least the minimum payment on every account so you never miss a due date. If you did miss a payment, call the creditor and ask if they\'ll offer a goodwill removal — especially if you have an otherwise clean history and the miss was recent.' },
    ],
  },
  {
    id: 'credit-report',
    title: 'Understanding Your Credit Report',
    description: 'What\'s on your credit report, how to read it, and what it means for your financial life.',
    difficulty: 'Beginner',
    readTime: 4,
    icon: '📑',
    content: [
      { heading: 'What Is a Credit Report?', body: 'Your credit report is a detailed history of how you\'ve used credit over your lifetime. It\'s maintained by three major credit bureaus: Equifax, Experian, and TransUnion. Each bureau may have slightly different information since not all creditors report to all three. Your credit score is calculated from your credit report — it\'s the numerical summary of the detailed history in the report. You can have different scores from different bureaus if their data differs.' },
      { heading: 'What\'s on Your Credit Report', body: 'Personal information: name, addresses, Social Security number, employers. Credit accounts: every credit card, loan, or line of credit you\'ve opened, with balance, limit, payment history, and open/close dates. Public records: bankruptcies, tax liens (though tax liens were removed from reports in 2018). Collections: accounts sent to collection agencies. Inquiries: hard inquiries from credit applications (stay for 2 years) and soft inquiries (don\'t affect score).' },
      { heading: 'How Long Things Stay on Your Report', body: 'Most negative items stay for 7 years: late payments, collections, charge-offs, repossessions, foreclosures. Chapter 13 bankruptcy stays for 7 years; Chapter 7 for 10 years. Hard inquiries stay for 2 years but only affect your score for about one year. Positive information — accounts in good standing — often stays much longer and helps your score. Closed accounts with positive history can stay for up to 10 years.' },
      { heading: 'The FCRA: Your Rights', body: 'The Fair Credit Reporting Act (FCRA) gives you important rights. You can get a free report annually from each bureau at AnnualCreditReport.com. You can dispute inaccurate information — bureaus must investigate within 30 days. You can place a security freeze (blocks new credit applications — free and recommended if you\'ve been a victim of identity theft). You can place a fraud alert (requires lenders to verify your identity before extending credit). These are powerful tools; use them if needed.' },
    ],
  },
  {
    id: 'compound-interest',
    title: 'The Power of Compound Interest',
    description: 'How compounding works and why starting early is the most powerful financial decision you can make.',
    difficulty: 'Beginner',
    readTime: 3,
    icon: '🚀',
    content: [
      { heading: 'What Is Compound Interest?', body: 'Simple interest earns returns only on your principal. Compound interest earns returns on your principal plus all previously earned interest. The difference seems small initially but becomes enormous over time. Einstein allegedly called compound interest the "eighth wonder of the world" (the quote is likely apocryphal, but the sentiment is accurate). It\'s the mathematical mechanism that makes long-term investing so powerful and long-term debt so destructive.' },
      { heading: 'The Rule of 72', body: 'A simple mental math shortcut: divide 72 by your expected annual return to find how many years it takes to double your money. At 6% return: 72 ÷ 6 = 12 years to double. At 8%: 9 years. At 10%: 7.2 years. At 24% credit card APR (working against you): 72 ÷ 24 = 3 years for debt to double. This simple rule vividly illustrates why high-interest debt is so dangerous and why consistent long-term investing is so powerful.' },
      { heading: 'The Cost of Waiting', body: 'Consider two investors: Alice invests $5,000/year from age 22-32 (10 years, $50,000 total) then stops. Bob invests $5,000/year from age 32-65 (33 years, $165,000 total) and never stops. At age 65 with a 7% return, Alice has about $602,000 and Bob has about $641,000. Despite investing more than three times as much money, Bob barely beats Alice — because compound interest rewards time above all else. Starting 10 years earlier makes an extraordinary difference.' },
      { heading: 'Practical Compounding Applications', body: 'Retirement accounts: compound growth is tax-deferred or tax-free, making the compounding even more powerful. High-yield savings accounts compound interest daily, then credit it monthly — more frequent compounding means slightly more earnings. Dividend reinvestment: automatically reinvesting dividends buys more shares, which pay more dividends, which buy more shares — a virtuous compounding cycle. The key habit: start as early as possible, never stop, and never withdraw early (breaking the compounding chain).' },
    ],
  },
]

interface QuickCalcResult {
  compound: { future: number; totalContributions: number; interest: number } | null
  loan: { payment: number; totalPaid: number; totalInterest: number } | null
  savings: { required: number; monthly: number } | null
}

function formatMoney(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
}

function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn('bg-card border border-border rounded-md p-4', className)}>{children}</div>
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-3">{children}</h2>
}

const DIFF_COLORS: Record<Difficulty, string> = {
  Beginner: 'text-green-400 bg-green-400/10 border-green-400/20',
  Intermediate: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
  Advanced: 'text-red-400 bg-red-400/10 border-red-400/20',
}

export function LearnHub() {
  const [tab, setTab] = useState<'topics' | 'calculators'>('topics')
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null)
  const [filterDiff, setFilterDiff] = useState<'All' | Difficulty>('All')

  // Compound interest calc
  const [ciPrincipal, setCiPrincipal] = useState('')
  const [ciMonthly, setCiMonthly] = useState('')
  const [ciRate, setCiRate] = useState('')
  const [ciYears, setCiYears] = useState('')

  // Loan payment calc
  const [loanAmount, setLoanAmount] = useState('')
  const [loanRate, setLoanRate] = useState('')
  const [loanYears, setLoanYears] = useState('')

  // Savings target calc
  const [stTarget, setStTarget] = useState('')
  const [stYears, setStYears] = useState('')
  const [stRate, setStRate] = useState('')

  const compoundResult = (() => {
    const p = parseFloat(ciPrincipal) || 0
    const m = parseFloat(ciMonthly) || 0
    const r = (parseFloat(ciRate) || 0) / 100 / 12
    const n = (parseFloat(ciYears) || 0) * 12
    if (n <= 0 || (p === 0 && m === 0)) return null
    const future = p * Math.pow(1 + r, n) + (r > 0 ? m * (Math.pow(1 + r, n) - 1) / r : m * n) // m*n = simple sum when r=0
    const totalContributions = p + m * n
    return { future, totalContributions, interest: future - totalContributions }
  })()

  const loanResult = (() => {
    const p = parseFloat(loanAmount) || 0
    const r = (parseFloat(loanRate) || 0) / 100 / 12
    const n = (parseFloat(loanYears) || 0) * 12
    if (p <= 0 || n <= 0) return null
    const payment = r > 0 ? p * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1) : p / n
    return { payment, totalPaid: payment * n, totalInterest: payment * n - p }
  })()

  const savingsResult = (() => {
    const target = parseFloat(stTarget) || 0
    const years = parseFloat(stYears) || 0
    const rate = (parseFloat(stRate) || 0) / 100 / 12
    const n = years * 12
    if (target <= 0 || n <= 0) return null
    const required = rate > 0 ? target * rate / (Math.pow(1 + rate, n) - 1) : target / n
    return { required, monthly: required }
  })()

  const visibleTopics = filterDiff === 'All' ? TOPICS : TOPICS.filter(t => t.difficulty === filterDiff)

  if (selectedTopic) {
    return (
      <div className="space-y-5">
        <button
          onClick={() => setSelectedTopic(null)}
          className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground text-sm transition-colors"
        >
          <ArrowLeft className="size-4" /> Back to Topics
        </button>
        <div className="flex items-center gap-3">
          <span className="text-3xl">{selectedTopic.icon}</span>
          <div>
            <h1 className="text-xl font-bold text-foreground">{selectedTopic.title}</h1>
            <div className="flex items-center gap-3 mt-1">
              <span className={cn('text-[10px] px-2 py-0.5 rounded border font-semibold', DIFF_COLORS[selectedTopic.difficulty])}>
                {selectedTopic.difficulty}
              </span>
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="size-3" /> {selectedTopic.readTime} min read
              </span>
            </div>
          </div>
        </div>
        <div className="space-y-5">
          {selectedTopic.content.map((section, i) => (
            <Card key={i}>
              <h3 className="text-sm font-semibold text-primary mb-2">{section.heading}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{section.body}</p>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
          <BookOpen className="size-5 text-primary" />
          Learn Hub
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">Financial education and calculators</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border">
        {(['topics', 'calculators'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              'px-4 py-2 text-sm font-medium border-b-2 transition-colors capitalize',
              tab === t ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
            )}
          >
            {t === 'topics' ? 'Topics' : 'Calculators'}
          </button>
        ))}
      </div>

      {tab === 'topics' && (
        <>
          {/* Difficulty filter */}
          <div className="flex gap-2 flex-wrap">
            {(['All', 'Beginner', 'Intermediate', 'Advanced'] as const).map(d => (
              <button
                key={d}
                onClick={() => setFilterDiff(d)}
                className={cn(
                  'text-xs px-3 py-1 rounded-md border transition-colors',
                  filterDiff === d
                    ? 'bg-primary/10 border-primary/30 text-primary'
                    : 'border-border text-muted-foreground hover:text-foreground'
                )}
              >
                {d}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {visibleTopics.map(topic => (
              <button
                key={topic.id}
                onClick={() => setSelectedTopic(topic)}
                className="text-left p-4 bg-card border border-border rounded-md hover:border-primary/30 hover:bg-card/80 transition-all group"
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl shrink-0">{topic.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors leading-snug">{topic.title}</p>
                      <ChevronRight className="size-4 text-muted-foreground group-hover:text-primary shrink-0 mt-0.5 transition-colors" />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{topic.description}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={cn('text-[10px] px-1.5 py-0.5 rounded border', DIFF_COLORS[topic.difficulty])}>
                        {topic.difficulty}
                      </span>
                      <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                        <Clock className="size-2.5" /> {topic.readTime} min
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </>
      )}

      {tab === 'calculators' && (
        <div className="space-y-5">
          {/* Compound Interest */}
          <Card>
            <SectionTitle>Compound Interest Calculator</SectionTitle>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
              <div>
                <label className="text-[10px] text-muted-foreground">Initial Amount</label>
                <Input type="number" value={ciPrincipal} onChange={e => setCiPrincipal(e.target.value)} className="h-8 text-xs mt-1 font-mono" placeholder="10000" min="0" />
              </div>
              <div>
                <label className="text-[10px] text-muted-foreground">Monthly Contribution</label>
                <Input type="number" value={ciMonthly} onChange={e => setCiMonthly(e.target.value)} className="h-8 text-xs mt-1 font-mono" placeholder="200" min="0" />
              </div>
              <div>
                <label className="text-[10px] text-muted-foreground">Annual Rate (%)</label>
                <Input type="number" value={ciRate} onChange={e => setCiRate(e.target.value)} className="h-8 text-xs mt-1 font-mono" placeholder="7" min="0" step="0.1" />
              </div>
              <div>
                <label className="text-[10px] text-muted-foreground">Years</label>
                <Input type="number" value={ciYears} onChange={e => setCiYears(e.target.value)} className="h-8 text-xs mt-1 font-mono" placeholder="30" min="0" />
              </div>
            </div>
            {compoundResult && (
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-muted/30 rounded p-2 text-center">
                  <p className="text-[10px] text-muted-foreground">Future Value</p>
                  <p className="text-base font-bold text-green-400 tabular-nums">{formatMoney(compoundResult.future)}</p>
                </div>
                <div className="bg-muted/30 rounded p-2 text-center">
                  <p className="text-[10px] text-muted-foreground">Total Contributed</p>
                  <p className="text-base font-bold text-foreground tabular-nums">{formatMoney(compoundResult.totalContributions)}</p>
                </div>
                <div className="bg-muted/30 rounded p-2 text-center">
                  <p className="text-[10px] text-muted-foreground">Interest Earned</p>
                  <p className="text-base font-bold text-primary tabular-nums">{formatMoney(compoundResult.interest)}</p>
                </div>
              </div>
            )}
          </Card>

          {/* Loan Payment */}
          <Card>
            <SectionTitle>Loan Payment Calculator</SectionTitle>
            <div className="grid grid-cols-3 gap-2 mb-3">
              <div>
                <label className="text-[10px] text-muted-foreground">Loan Amount</label>
                <Input type="number" value={loanAmount} onChange={e => setLoanAmount(e.target.value)} className="h-8 text-xs mt-1 font-mono" placeholder="25000" min="0" />
              </div>
              <div>
                <label className="text-[10px] text-muted-foreground">Annual Rate (%)</label>
                <Input type="number" value={loanRate} onChange={e => setLoanRate(e.target.value)} className="h-8 text-xs mt-1 font-mono" placeholder="6.5" min="0" step="0.1" />
              </div>
              <div>
                <label className="text-[10px] text-muted-foreground">Loan Term (Years)</label>
                <Input type="number" value={loanYears} onChange={e => setLoanYears(e.target.value)} className="h-8 text-xs mt-1 font-mono" placeholder="5" min="0" />
              </div>
            </div>
            {loanResult && (
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-muted/30 rounded p-2 text-center">
                  <p className="text-[10px] text-muted-foreground">Monthly Payment</p>
                  <p className="text-base font-bold text-foreground tabular-nums">{formatMoney(loanResult.payment)}</p>
                </div>
                <div className="bg-muted/30 rounded p-2 text-center">
                  <p className="text-[10px] text-muted-foreground">Total Paid</p>
                  <p className="text-base font-bold text-orange-400 tabular-nums">{formatMoney(loanResult.totalPaid)}</p>
                </div>
                <div className="bg-muted/30 rounded p-2 text-center">
                  <p className="text-[10px] text-muted-foreground">Total Interest</p>
                  <p className="text-base font-bold text-red-400 tabular-nums">{formatMoney(loanResult.totalInterest)}</p>
                </div>
              </div>
            )}
          </Card>

          {/* Savings Target */}
          <Card>
            <SectionTitle>Savings Target Calculator</SectionTitle>
            <p className="text-xs text-muted-foreground mb-3">How much do I need to save per month to reach a goal?</p>
            <div className="grid grid-cols-3 gap-2 mb-3">
              <div>
                <label className="text-[10px] text-muted-foreground">Target Amount</label>
                <Input type="number" value={stTarget} onChange={e => setStTarget(e.target.value)} className="h-8 text-xs mt-1 font-mono" placeholder="50000" min="0" />
              </div>
              <div>
                <label className="text-[10px] text-muted-foreground">Time (Years)</label>
                <Input type="number" value={stYears} onChange={e => setStYears(e.target.value)} className="h-8 text-xs mt-1 font-mono" placeholder="5" min="0" step="0.5" />
              </div>
              <div>
                <label className="text-[10px] text-muted-foreground">Expected Return (%)</label>
                <Input type="number" value={stRate} onChange={e => setStRate(e.target.value)} className="h-8 text-xs mt-1 font-mono" placeholder="5" min="0" step="0.1" />
              </div>
            </div>
            {savingsResult && (
              <div className="bg-muted/30 rounded p-3 text-center">
                <p className="text-xs text-muted-foreground">Monthly Savings Required</p>
                <p className="text-2xl font-bold text-primary tabular-nums mt-1">{formatMoney(savingsResult.monthly)}</p>
                <p className="text-xs text-muted-foreground mt-1">to reach {formatMoney(parseFloat(stTarget))} in {stYears} years</p>
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  )
}
