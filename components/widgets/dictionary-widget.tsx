'use client'

import { useState, useMemo } from 'react'
import { Search, X } from 'lucide-react'
import { cn } from '@/lib/utils'

// ── Dictionary data ───────────────────────────────────────────────────────────

type Category = 'trading' | 'technical' | 'accounting' | 'finance' | 'acronym'

interface Term {
  term: string
  definition: string
  category: Category
}

const TERMS: Term[] = [
  // ── TRADING ─────────────────────────────────────────────────────────────────
  { term: 'Ask', category: 'trading', definition: 'The lowest price a seller is willing to accept for a security.' },
  { term: 'Bid', category: 'trading', definition: 'The highest price a buyer is willing to pay for a security.' },
  { term: 'Bid-Ask Spread', category: 'trading', definition: 'The difference between the bid and ask price; represents the transaction cost and liquidity of a security.' },
  { term: 'Bull Market', category: 'trading', definition: 'A market condition characterised by rising prices, typically a 20%+ gain from recent lows, driven by investor optimism.' },
  { term: 'Bear Market', category: 'trading', definition: 'A market condition characterised by falling prices, typically a 20%+ decline from recent highs, driven by pessimism.' },
  { term: 'Short Selling', category: 'trading', definition: 'Borrowing and selling a security you do not own, hoping to buy it back at a lower price and profit from the decline.' },
  { term: 'Margin', category: 'trading', definition: 'Borrowed money from a broker used to purchase securities, amplifying both potential gains and losses.' },
  { term: 'Margin Call', category: 'trading', definition: 'A broker\'s demand that an investor deposit additional funds because the account\'s equity has fallen below the required minimum.' },
  { term: 'Market Order', category: 'trading', definition: 'An order to buy or sell a security immediately at the best available current price.' },
  { term: 'Limit Order', category: 'trading', definition: 'An order to buy or sell a security at a specific price or better, not executed unless that price is reached.' },
  { term: 'Stop-Loss Order', category: 'trading', definition: 'An order to sell a security when it reaches a specified price, used to limit downside loss on a position.' },
  { term: 'Stop-Limit Order', category: 'trading', definition: 'Combines a stop order and a limit order — triggers at the stop price but only fills at the limit price or better.' },
  { term: 'Day Order', category: 'trading', definition: 'An order that expires at the end of the trading day if not executed.' },
  { term: 'GTC Order', category: 'trading', definition: 'Good Till Cancelled — an order that remains active until it is filled or manually cancelled.' },
  { term: 'Liquidity', category: 'trading', definition: 'How quickly and easily an asset can be bought or sold without significantly affecting its price.' },
  { term: 'Volatility', category: 'trading', definition: 'A statistical measure of the dispersion of returns for a security; higher volatility means higher risk and price swings.' },
  { term: 'Position', category: 'trading', definition: 'The amount of a security owned (long) or owed (short) by an investor.' },
  { term: 'Long Position', category: 'trading', definition: 'Owning a security with the expectation that its price will rise.' },
  { term: 'Short Position', category: 'trading', definition: 'Selling a borrowed security with the expectation its price will fall so you can buy it back cheaper.' },
  { term: 'Covering', category: 'trading', definition: 'Buying back a security to close out a short position.' },
  { term: 'Float', category: 'trading', definition: 'The number of shares of a company available for public trading, excluding insider and institutional locked-up shares.' },
  { term: 'Short Interest', category: 'trading', definition: 'The total number of shares that have been sold short but not yet covered or closed out.' },
  { term: 'Days to Cover', category: 'trading', definition: 'Short interest divided by average daily volume; indicates how long it would take short sellers to cover their positions.' },
  { term: 'Circuit Breaker', category: 'trading', definition: 'A regulatory mechanism that temporarily halts trading when a market index falls by a certain percentage in a single day.' },
  { term: 'After-Hours Trading', category: 'trading', definition: 'Trading that occurs after the regular market session closes, typically with lower volume and wider spreads.' },
  { term: 'Pre-Market Trading', category: 'trading', definition: 'Trading that occurs before the regular market opens, usually 4:00–9:30 AM ET.' },
  { term: 'Options', category: 'trading', definition: 'Contracts giving the buyer the right, but not the obligation, to buy (call) or sell (put) a security at a set price before expiry.' },
  { term: 'Call Option', category: 'trading', definition: 'An options contract that gives the holder the right to buy a security at the strike price before expiration.' },
  { term: 'Put Option', category: 'trading', definition: 'An options contract that gives the holder the right to sell a security at the strike price before expiration.' },
  { term: 'Strike Price', category: 'trading', definition: 'The fixed price at which the holder of an option can buy or sell the underlying security.' },
  { term: 'Premium', category: 'trading', definition: 'The price paid to purchase an options contract.' },
  { term: 'Expiration Date', category: 'trading', definition: 'The date on which an options or futures contract expires and becomes void.' },
  { term: 'In the Money (ITM)', category: 'trading', definition: 'An option with intrinsic value: a call is ITM when the market price is above the strike; a put is ITM when below.' },
  { term: 'Out of the Money (OTM)', category: 'trading', definition: 'An option with no intrinsic value: a call is OTM when the market price is below the strike; a put when above.' },
  { term: 'Implied Volatility (IV)', category: 'trading', definition: 'The market\'s forecast of a likely movement in a security\'s price, derived from option prices.' },
  { term: 'Hedge', category: 'trading', definition: 'An investment made to reduce the risk of adverse price movements in an asset.' },
  { term: 'Arbitrage', category: 'trading', definition: 'Simultaneously buying and selling the same asset in different markets to profit from a price difference.' },
  { term: 'Scalping', category: 'trading', definition: 'A trading strategy that involves making dozens or hundreds of trades per day to profit from small price changes.' },
  { term: 'Swing Trading', category: 'trading', definition: 'A style that seeks to capture gains over several days to weeks, using technical and fundamental analysis.' },
  { term: 'Gap Up / Gap Down', category: 'trading', definition: 'When a security opens significantly higher (gap up) or lower (gap down) than the previous close due to news or events.' },

  // ── TECHNICAL ANALYSIS ──────────────────────────────────────────────────────
  { term: 'Moving Average (MA)', category: 'technical', definition: 'The average of a security\'s price over a specific number of periods, smoothing out short-term fluctuations.' },
  { term: 'Simple Moving Average (SMA)', category: 'technical', definition: 'The unweighted arithmetic mean of a security\'s closing prices over N periods.' },
  { term: 'Exponential Moving Average (EMA)', category: 'technical', definition: 'A moving average that gives more weight to recent prices, making it more responsive to new information.' },
  { term: 'Relative Strength Index (RSI)', category: 'technical', definition: 'A momentum oscillator (0–100) measuring speed and magnitude of price changes. Above 70 = overbought; below 30 = oversold.' },
  { term: 'MACD', category: 'technical', definition: 'Moving Average Convergence Divergence — a trend-following momentum indicator showing the relationship between two EMAs.' },
  { term: 'Bollinger Bands', category: 'technical', definition: 'Bands plotted two standard deviations away from a simple moving average; wider bands indicate higher volatility.' },
  { term: 'Support Level', category: 'technical', definition: 'A price level where a downtrend tends to pause due to a concentration of demand.' },
  { term: 'Resistance Level', category: 'technical', definition: 'A price level where an uptrend tends to pause due to a concentration of supply.' },
  { term: 'Breakout', category: 'technical', definition: 'When a security\'s price moves above a resistance level or below a support level with increased volume.' },
  { term: 'Candlestick', category: 'technical', definition: 'A price chart displaying the open, high, low, and close (OHLC) for a security over a specific time period.' },
  { term: 'Doji', category: 'technical', definition: 'A candlestick pattern where open and close are nearly equal, signalling market indecision.' },
  { term: 'Head and Shoulders', category: 'technical', definition: 'A reversal chart pattern with three peaks — a higher middle peak (head) flanked by two lower peaks (shoulders).' },
  { term: 'Double Top / Double Bottom', category: 'technical', definition: 'Reversal patterns; a double top signals bearish reversal, a double bottom signals bullish reversal.' },
  { term: 'Fibonacci Retracement', category: 'technical', definition: 'Horizontal lines indicating potential support/resistance at key Fibonacci ratios (23.6%, 38.2%, 50%, 61.8%, 78.6%).' },
  { term: 'Volume', category: 'technical', definition: 'The total number of shares or contracts traded for a security during a given period.' },
  { term: 'On-Balance Volume (OBV)', category: 'technical', definition: 'A momentum indicator using volume flow to predict price changes; rising OBV = buying pressure.' },
  { term: 'Stochastic Oscillator', category: 'technical', definition: 'A momentum indicator comparing a closing price to a price range over time. Readings above 80 = overbought; below 20 = oversold.' },
  { term: 'Average True Range (ATR)', category: 'technical', definition: 'A measure of market volatility calculating the average range between high and low prices over N periods.' },
  { term: 'Death Cross', category: 'technical', definition: 'A bearish signal when the 50-day MA crosses below the 200-day MA.' },
  { term: 'Golden Cross', category: 'technical', definition: 'A bullish signal when the 50-day MA crosses above the 200-day MA.' },
  { term: 'Trend Line', category: 'technical', definition: 'A straight line connecting two or more price points; used to identify and confirm the direction of a trend.' },
  { term: 'Overbought', category: 'technical', definition: 'A condition where a security has risen so sharply that it may be due for a price correction or pullback.' },
  { term: 'Oversold', category: 'technical', definition: 'A condition where a security has fallen so sharply that it may be due for a bounce or rally.' },

  // ── ACCOUNTING ───────────────────────────────────────────────────────────────
  { term: 'Revenue', category: 'accounting', definition: 'Total income generated by a company from its business activities (sales of goods or services) before any expenses.' },
  { term: 'Gross Profit', category: 'accounting', definition: 'Revenue minus Cost of Goods Sold (COGS); the profit before operating expenses, interest, and taxes.' },
  { term: 'Operating Income', category: 'accounting', definition: 'Gross profit minus operating expenses (SG&A, R&D, depreciation); also called EBIT.' },
  { term: 'Net Income', category: 'accounting', definition: 'The company\'s total profit after all expenses, interest, taxes, and deductions. Also called the "bottom line."' },
  { term: 'EBITDA', category: 'accounting', definition: 'Earnings Before Interest, Taxes, Depreciation, and Amortisation; a measure of core operational profitability.' },
  { term: 'EBIT', category: 'accounting', definition: 'Earnings Before Interest and Taxes; equivalent to operating income.' },
  { term: 'EPS (Earnings Per Share)', category: 'accounting', definition: 'Net income divided by the number of outstanding shares; measures profitability on a per-share basis.' },
  { term: 'Diluted EPS', category: 'accounting', definition: 'EPS calculated including all potentially dilutive securities (options, warrants, convertibles).' },
  { term: 'Balance Sheet', category: 'accounting', definition: 'A financial statement showing a company\'s assets, liabilities, and shareholders\' equity at a specific point in time.' },
  { term: 'Income Statement', category: 'accounting', definition: 'A financial statement showing revenues, expenses, and profit/loss over a period of time. Also called P&L.' },
  { term: 'Cash Flow Statement', category: 'accounting', definition: 'A financial statement showing cash inflows and outflows from operating, investing, and financing activities.' },
  { term: 'Free Cash Flow (FCF)', category: 'accounting', definition: 'Operating cash flow minus capital expenditures; cash available to the company after maintaining/expanding assets.' },
  { term: 'Working Capital', category: 'accounting', definition: 'Current assets minus current liabilities; measures a company\'s short-term liquidity and operational efficiency.' },
  { term: 'Accounts Receivable (AR)', category: 'accounting', definition: 'Money owed to a company by customers for goods or services already delivered but not yet paid for.' },
  { term: 'Accounts Payable (AP)', category: 'accounting', definition: 'Money a company owes to its suppliers or creditors for goods and services received but not yet paid.' },
  { term: 'Depreciation', category: 'accounting', definition: 'The gradual reduction in the value of a tangible asset over its useful life, spread as an expense each year.' },
  { term: 'Amortisation', category: 'accounting', definition: 'Similar to depreciation, but applied to intangible assets (patents, goodwill, trademarks) over time.' },
  { term: 'Goodwill', category: 'accounting', definition: 'An intangible asset arising when a company acquires another for more than the fair value of its net assets.' },
  { term: 'Inventory', category: 'accounting', definition: 'Raw materials, work-in-progress, and finished goods a company holds for production or sale.' },
  { term: 'Shareholders\' Equity', category: 'accounting', definition: 'The residual interest in a company\'s assets after deducting liabilities; also called book value or net worth.' },
  { term: 'Retained Earnings', category: 'accounting', definition: 'Cumulative net income kept by the company rather than paid out as dividends.' },
  { term: 'Gross Margin', category: 'accounting', definition: 'Gross profit divided by revenue, expressed as a percentage; indicates production efficiency.' },
  { term: 'Operating Margin', category: 'accounting', definition: 'Operating income divided by revenue; shows how much profit is made from operations before interest and taxes.' },
  { term: 'Net Profit Margin', category: 'accounting', definition: 'Net income divided by revenue; the percentage of revenue that becomes profit after all expenses.' },
  { term: 'Return on Equity (ROE)', category: 'accounting', definition: 'Net income divided by shareholders\' equity; measures how effectively management uses equity to generate profits.' },
  { term: 'Return on Assets (ROA)', category: 'accounting', definition: 'Net income divided by total assets; measures how efficiently a company uses its assets to generate profit.' },
  { term: 'Debt-to-Equity Ratio (D/E)', category: 'accounting', definition: 'Total debt divided by shareholders\' equity; measures financial leverage and risk.' },
  { term: 'Current Ratio', category: 'accounting', definition: 'Current assets divided by current liabilities; measures a company\'s ability to pay short-term obligations.' },
  { term: 'Quick Ratio', category: 'accounting', definition: 'Like the current ratio but excludes inventory; (Cash + AR) / Current Liabilities. Also called the acid-test ratio.' },

  // ── FINANCE / VALUATION ──────────────────────────────────────────────────────
  { term: 'Market Capitalisation', category: 'finance', definition: 'Share price multiplied by total outstanding shares; represents the total market value of a company.' },
  { term: 'Enterprise Value (EV)', category: 'finance', definition: 'Market cap plus total debt minus cash; the theoretical total cost to acquire a company.' },
  { term: 'Price-to-Earnings (P/E)', category: 'finance', definition: 'Share price divided by EPS; indicates how much investors pay per dollar of earnings.' },
  { term: 'Forward P/E', category: 'finance', definition: 'P/E calculated using estimated future earnings rather than historical earnings.' },
  { term: 'Price-to-Book (P/B)', category: 'finance', definition: 'Share price divided by book value per share; compares market value to accounting value.' },
  { term: 'Price-to-Sales (P/S)', category: 'finance', definition: 'Market cap divided by annual revenue; useful for valuing companies with no profits.' },
  { term: 'EV/EBITDA', category: 'finance', definition: 'Enterprise value divided by EBITDA; a capital-structure-neutral valuation multiple used for comparisons.' },
  { term: 'Dividend', category: 'finance', definition: 'A portion of company profits paid to shareholders, typically quarterly, as cash or additional shares.' },
  { term: 'Dividend Yield', category: 'finance', definition: 'Annual dividend per share divided by the current share price, expressed as a percentage.' },
  { term: 'Beta', category: 'finance', definition: 'A measure of a stock\'s volatility relative to the overall market. Beta > 1 = more volatile than market; < 1 = less volatile.' },
  { term: 'Alpha', category: 'finance', definition: 'A measure of investment performance relative to a benchmark; positive alpha indicates outperformance.' },
  { term: 'Sharpe Ratio', category: 'finance', definition: 'Risk-adjusted return: (portfolio return − risk-free rate) / standard deviation. Higher = better return per unit of risk.' },
  { term: 'Diversification', category: 'finance', definition: 'Spreading investments across different assets, sectors, or geographies to reduce unsystematic risk.' },
  { term: 'Correlation', category: 'finance', definition: 'A statistical measure of how two assets move relative to each other, ranging from -1 (inverse) to +1 (identical).' },
  { term: 'Index Fund', category: 'finance', definition: 'A fund designed to replicate the performance of a specific market index (e.g., S&P 500) with low fees.' },
  { term: 'ETF (Exchange-Traded Fund)', category: 'finance', definition: 'A fund that tracks an index or basket of assets and trades on an exchange like a stock.' },
  { term: 'IPO (Initial Public Offering)', category: 'finance', definition: 'The first time a company offers its shares to the public on a stock exchange.' },
  { term: 'Secondary Offering', category: 'finance', definition: 'A sale of shares after the IPO, either by the company (dilutive) or existing shareholders (non-dilutive).' },
  { term: 'Stock Buyback', category: 'finance', definition: 'When a company repurchases its own shares, reducing supply and typically boosting EPS.' },
  { term: 'Stock Split', category: 'finance', definition: 'Dividing existing shares into multiple new shares, lowering the price per share without changing market cap.' },
  { term: 'Warrant', category: 'finance', definition: 'A security giving the holder the right to buy stock at a specific price before expiry; similar to a call option.' },
  { term: 'Yield Curve', category: 'finance', definition: 'A graph showing interest rates of bonds with equal credit quality but different maturities.' },
  { term: 'Inverted Yield Curve', category: 'finance', definition: 'When short-term rates are higher than long-term rates; historically a recession predictor.' },
  { term: 'Risk-Free Rate', category: 'finance', definition: 'The theoretical return on an investment with zero risk, typically represented by short-term government Treasury yields.' },
  { term: 'Discount Rate', category: 'finance', definition: 'The rate used to convert future cash flows into present value in a DCF analysis.' },
  { term: 'DCF (Discounted Cash Flow)', category: 'finance', definition: 'A valuation method estimating the value of an investment based on its expected future cash flows, discounted to present value.' },
  { term: 'WACC', category: 'finance', definition: 'Weighted Average Cost of Capital — the average rate a company pays to finance its assets, blending equity and debt costs.' },
  { term: 'Liquidity Risk', category: 'finance', definition: 'The risk that an asset cannot be bought or sold quickly enough in the market to prevent or minimise a loss.' },
  { term: 'Counterparty Risk', category: 'finance', definition: 'The risk that the other party in a financial transaction will default on their obligations.' },
  { term: 'Sector Rotation', category: 'finance', definition: 'The movement of investment capital from one industry sector to another as economic conditions change.' },

  // ── ACRONYMS ─────────────────────────────────────────────────────────────────
  { term: 'OHLCV', category: 'acronym', definition: 'Open, High, Low, Close, Volume — the five core data points used in price charting.' },
  { term: 'AUM', category: 'acronym', definition: 'Assets Under Management — the total market value of assets a fund or financial institution manages.' },
  { term: 'ROI', category: 'acronym', definition: 'Return on Investment — net profit divided by the cost of investment, expressed as a percentage.' },
  { term: 'NYSE', category: 'acronym', definition: 'New York Stock Exchange — the world\'s largest stock exchange by market capitalisation, based in New York.' },
  { term: 'NASDAQ', category: 'acronym', definition: 'National Association of Securities Dealers Automated Quotations — an American electronic stock exchange known for tech listings.' },
  { term: 'SEC', category: 'acronym', definition: 'Securities and Exchange Commission — the US government agency overseeing securities markets and protecting investors.' },
  { term: 'FINRA', category: 'acronym', definition: 'Financial Industry Regulatory Authority — a US non-governmental body that regulates member brokerage firms.' },
  { term: 'FDIC', category: 'acronym', definition: 'Federal Deposit Insurance Corporation — insures deposits at US banks up to $250,000 per account.' },
  { term: 'FOMC', category: 'acronym', definition: 'Federal Open Market Committee — the Fed body that sets US monetary policy, including the federal funds rate.' },
  { term: 'GDP', category: 'acronym', definition: 'Gross Domestic Product — the total monetary value of all goods and services produced within a country in a given period.' },
  { term: 'CPI', category: 'acronym', definition: 'Consumer Price Index — measures the average change in prices paid by consumers for goods and services (inflation).' },
  { term: 'PPI', category: 'acronym', definition: 'Producer Price Index — measures the average change in selling prices received by domestic producers for their output.' },
  { term: 'PCE', category: 'acronym', definition: 'Personal Consumption Expenditures — the Fed\'s preferred inflation gauge, measuring household spending on goods and services.' },
  { term: 'VIX', category: 'acronym', definition: 'CBOE Volatility Index — often called the "fear gauge"; measures expected volatility in the S&P 500 over the next 30 days.' },
  { term: 'SPX', category: 'acronym', definition: 'S&P 500 Index — a market-cap-weighted index of 500 large US companies; widely used as a benchmark for the US market.' },
  { term: 'DJI', category: 'acronym', definition: 'Dow Jones Industrial Average — a price-weighted index of 30 large, publicly traded US companies.' },
  { term: 'IXIC', category: 'acronym', definition: 'NASDAQ Composite Index — a market-cap-weighted index of all stocks listed on the NASDAQ exchange.' },
  { term: 'QE', category: 'acronym', definition: 'Quantitative Easing — a monetary policy where a central bank purchases securities to inject money into the economy.' },
  { term: 'QT', category: 'acronym', definition: 'Quantitative Tightening — the reverse of QE; a central bank reduces its balance sheet to reduce money supply.' },
  { term: 'IPO', category: 'acronym', definition: 'Initial Public Offering — when a private company first sells shares to the public on a stock exchange.' },
  { term: 'SPAC', category: 'acronym', definition: 'Special Purpose Acquisition Company — a "blank check" shell company that raises capital via IPO to acquire a private company.' },
  { term: 'M&A', category: 'acronym', definition: 'Mergers and Acquisitions — transactions where companies are combined (merger) or one purchases another (acquisition).' },
  { term: 'LBO', category: 'acronym', definition: 'Leveraged Buyout — the acquisition of a company using a significant amount of borrowed money (debt).' },
  { term: 'VC', category: 'acronym', definition: 'Venture Capital — financing provided to early-stage, high-growth-potential startups in exchange for equity.' },
  { term: 'PE', category: 'acronym', definition: 'Private Equity — investment in companies that are not publicly traded, typically involving buyouts or growth capital.' },
  { term: 'REIT', category: 'acronym', definition: 'Real Estate Investment Trust — a company owning income-generating real estate, required to distribute 90%+ of income.' },
  { term: 'MBS', category: 'acronym', definition: 'Mortgage-Backed Security — a type of asset-backed security secured by a pool of mortgages.' },
  { term: 'CDO', category: 'acronym', definition: 'Collateralised Debt Obligation — a structured financial product backed by a pool of loans and other assets.' },
  { term: 'CDS', category: 'acronym', definition: 'Credit Default Swap — a financial derivative that lets an investor "swap" credit risk with another party; acts like insurance on debt.' },
  { term: 'ABS', category: 'acronym', definition: 'Asset-Backed Security — a financial security backed by a pool of assets such as auto loans, credit card debt, or receivables.' },
  { term: 'YTD', category: 'acronym', definition: 'Year to Date — the period beginning January 1 of the current year up to the present date.' },
  { term: 'TTM', category: 'acronym', definition: 'Trailing Twelve Months — the past 12 consecutive months of financial data used to evaluate a company\'s performance.' },
  { term: 'NTM', category: 'acronym', definition: 'Next Twelve Months — forward-looking financial estimates for the coming 12-month period.' },
  { term: 'GAAP', category: 'acronym', definition: 'Generally Accepted Accounting Principles — the standard accounting rules and procedures used in the United States.' },
  { term: 'IFRS', category: 'acronym', definition: 'International Financial Reporting Standards — accounting standards used in over 140 countries outside the US.' },
  { term: 'T+2', category: 'acronym', definition: 'Trade plus 2 days — the settlement period for most US securities, meaning ownership transfers 2 business days after the trade.' },
  { term: 'ECB', category: 'acronym', definition: 'European Central Bank — the central bank for the Eurozone, responsible for monetary policy across member states.' },
  { term: 'BoE', category: 'acronym', definition: 'Bank of England — the UK\'s central bank, responsible for monetary policy and financial stability.' },
  { term: 'BoJ', category: 'acronym', definition: 'Bank of Japan — Japan\'s central bank, known for ultra-loose monetary policy and yield curve control.' },
  { term: 'FX', category: 'acronym', definition: 'Foreign Exchange — the global marketplace for trading national currencies against one another.' },
  { term: 'OTC', category: 'acronym', definition: 'Over the Counter — securities traded directly between parties without going through a formal exchange.' },
  { term: 'HFT', category: 'acronym', definition: 'High-Frequency Trading — algorithmic trading using powerful computers to transact a large number of orders at very fast speeds.' },
  { term: 'SaaS', category: 'acronym', definition: 'Software as a Service — a cloud-based software delivery model; a popular business model in tech stock analysis.' },
  { term: 'FCF', category: 'acronym', definition: 'Free Cash Flow — operating cash flow minus capital expenditures; cash left after maintaining/expanding operations.' },
  { term: 'NAV', category: 'acronym', definition: 'Net Asset Value — the value of a fund\'s assets minus its liabilities, often quoted per share.' },
  { term: 'PnL', category: 'acronym', definition: 'Profit and Loss — a financial statement (or trader\'s real-time account) showing gains and losses over a period.' },
]

const CATEGORY_LABELS: Record<Category, string> = {
  trading: 'Trading',
  technical: 'Technical',
  accounting: 'Accounting',
  finance: 'Finance',
  acronym: 'Acronyms',
}

const CATEGORY_COLORS: Record<Category, string> = {
  trading: 'text-blue-400 border-blue-400/30 bg-blue-400/10',
  technical: 'text-purple-400 border-purple-400/30 bg-purple-400/10',
  accounting: 'text-orange-400 border-orange-400/30 bg-orange-400/10',
  finance: 'text-green-400 border-green-400/30 bg-green-400/10',
  acronym: 'text-cyan-400 border-cyan-400/30 bg-cyan-400/10',
}

const ALL_CATEGORIES: Array<Category | 'all'> = ['all', 'trading', 'technical', 'accounting', 'finance', 'acronym']

// ── Component ─────────────────────────────────────────────────────────────────

export function DictionaryWidget() {
  const [query, setQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState<Category | 'all'>('all')
  const [expanded, setExpanded] = useState<string | null>(null)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return TERMS.filter(t => {
      const matchCat = activeCategory === 'all' || t.category === activeCategory
      if (!matchCat) return false
      if (!q) return true
      return t.term.toLowerCase().includes(q) || t.definition.toLowerCase().includes(q)
    })
  }, [query, activeCategory])

  return (
    <div className="flex flex-col h-full font-mono text-xs">
      {/* Search bar */}
      <div className="flex-none px-3 pt-3 pb-2 space-y-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search 130+ terms…"
            className="w-full pl-7 pr-7 py-1.5 bg-muted/30 border border-border rounded text-xs font-mono placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Category filter pills */}
        <div className="flex gap-1 flex-wrap">
          {ALL_CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                'px-2 py-0.5 rounded border text-[9px] uppercase tracking-wider transition-colors',
                activeCategory === cat
                  ? cat === 'all'
                    ? 'bg-primary/20 border-primary/40 text-primary'
                    : CATEGORY_COLORS[cat as Category]
                  : 'border-border text-muted-foreground hover:text-foreground hover:bg-muted/30',
              )}
            >
              {cat === 'all' ? `All (${TERMS.length})` : CATEGORY_LABELS[cat as Category]}
            </button>
          ))}
        </div>
      </div>

      {/* Term list */}
      <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-1">
        {filtered.length === 0 ? (
          <div className="flex items-center justify-center h-20 text-muted-foreground text-xs">
            No terms match &quot;{query}&quot;
          </div>
        ) : (
          filtered.map(t => {
            const isOpen = expanded === t.term
            return (
              <div
                key={t.term}
                className="border border-border/60 rounded bg-card/30 overflow-hidden"
              >
                <button
                  onClick={() => setExpanded(isOpen ? null : t.term)}
                  className="w-full flex items-center justify-between px-2.5 py-1.5 hover:bg-muted/20 transition-colors text-left gap-2"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={cn(
                      'flex-none px-1.5 py-px rounded border text-[8px] uppercase tracking-wider hidden sm:inline-block',
                      CATEGORY_COLORS[t.category],
                    )}>
                      {CATEGORY_LABELS[t.category]}
                    </span>
                    <span className="font-semibold text-foreground truncate">{t.term}</span>
                  </div>
                  <span className={cn(
                    'flex-none text-muted-foreground text-[10px] transition-transform duration-150',
                    isOpen && 'rotate-180',
                  )}>▾</span>
                </button>
                {isOpen && (
                  <div className="px-2.5 pb-2 pt-0.5 text-muted-foreground leading-relaxed border-t border-border/40 bg-muted/10">
                    {t.definition}
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>

      {/* Footer count */}
      <div className="flex-none px-3 py-1.5 border-t border-border text-[9px] text-muted-foreground flex justify-between">
        <span>Showing {filtered.length} of {TERMS.length} terms</span>
        <span className="text-primary/50">SYMBIOSIS // DICT</span>
      </div>
    </div>
  )
}
