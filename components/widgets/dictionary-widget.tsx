'use client'

import { useState, useMemo } from 'react'
import { Search, X } from 'lucide-react'
import { cn } from '@/lib/utils'

// ── Dictionary data ───────────────────────────────────────────────────────────

type Category = 'trading' | 'technical' | 'accounting' | 'finance' | 'acronym' | 'slang'

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

  // ── ADDITIONAL TRADING TERMS ─────────────────────────────────────────────────
  { term: 'Tape Reading', category: 'trading', definition: 'Analysing the order flow of a security in real time to gauge buying and selling pressure.' },
  { term: 'Level 2 Quotes', category: 'trading', definition: 'Real-time order book data showing all pending buy and sell orders at various price levels beyond the best bid/ask.' },
  { term: 'Market Depth', category: 'trading', definition: 'The supply and demand at different price levels; shows how much of an asset can be bought or sold at a given price.' },
  { term: 'Order Flow', category: 'trading', definition: 'The stream of buy and sell orders being submitted to the market; used by traders to gauge directional pressure.' },
  { term: 'Dark Pool', category: 'trading', definition: 'Private exchanges where large institutional investors can trade securities without displaying orders publicly.' },
  { term: 'Iceberg Order', category: 'trading', definition: 'A large order split into smaller visible portions to conceal the true order size from the market.' },
  { term: 'Market on Close (MOC)', category: 'trading', definition: 'An order to buy or sell a security at the closing price at the end of the trading day.' },
  { term: 'Market on Open (MOO)', category: 'trading', definition: 'An order to buy or sell a security at the opening price at the start of the trading day.' },
  { term: 'Fill or Kill (FOK)', category: 'trading', definition: 'An order that must be filled entirely and immediately; if not, it is cancelled.' },
  { term: 'Immediate or Cancel (IOC)', category: 'trading', definition: 'An order that must be filled immediately to whatever extent possible; unfilled portions are cancelled.' },
  { term: 'All or None (AON)', category: 'trading', definition: 'An order that must be filled in its entirety or not at all, though it does not need to execute immediately.' },
  { term: 'Trailing Stop', category: 'trading', definition: 'A stop-loss order that automatically moves with the price, locking in gains while limiting downside.' },
  { term: 'OCO Order', category: 'trading', definition: 'One Cancels the Other — two linked orders where executing one automatically cancels the other.' },
  { term: 'Bracket Order', category: 'trading', definition: 'A set of three orders (entry + profit target + stop-loss) placed simultaneously to manage a trade automatically.' },
  { term: 'Slippage', category: 'trading', definition: 'The difference between the expected price of a trade and the actual execution price, often caused by low liquidity.' },
  { term: 'Commission', category: 'trading', definition: 'A fee charged by a broker for executing a trade on behalf of the client.' },
  { term: 'Spread Trading', category: 'trading', definition: 'Simultaneously buying and selling related instruments to profit from the price difference between them.' },
  { term: 'Pairs Trading', category: 'trading', definition: 'A market-neutral strategy that buys one correlated security and shorts another to profit from relative price changes.' },
  { term: 'Mean Reversion', category: 'trading', definition: 'The theory that asset prices tend to return to their historical average over time.' },
  { term: 'Trend Following', category: 'trading', definition: 'A strategy that aims to profit by entering trades in the direction of established price trends.' },
  { term: 'Momentum Trading', category: 'trading', definition: 'Buying securities that have been rising and selling those that have been falling, expecting the trend to continue.' },
  { term: 'Carry Trade', category: 'trading', definition: 'Borrowing in a low-interest currency and investing in a high-interest currency to profit from the rate differential.' },
  { term: 'Contango', category: 'trading', definition: 'When futures prices are higher than the current spot price; the normal state for most commodity futures.' },
  { term: 'Backwardation', category: 'trading', definition: 'When futures prices are lower than the spot price; often signals near-term supply shortage.' },
  { term: 'Assignment', category: 'trading', definition: 'The exercise of an options contract by the buyer, obligating the seller to fulfil the contract terms.' },
  { term: 'Exercise', category: 'trading', definition: 'When the holder of an option chooses to act on their right to buy (call) or sell (put) the underlying asset.' },
  { term: 'Covered Call', category: 'trading', definition: 'Selling a call option on a stock you already own; generates income but caps upside potential.' },
  { term: 'Protective Put', category: 'trading', definition: 'Buying a put option on a stock you own to protect against downside losses; like insurance.' },
  { term: 'Straddle', category: 'trading', definition: 'Buying both a call and a put at the same strike price and expiry; profits from large moves in either direction.' },
  { term: 'Strangle', category: 'trading', definition: 'Like a straddle but with different strike prices; lower cost but requires a larger move to profit.' },
  { term: 'Iron Condor', category: 'trading', definition: 'An options strategy using four contracts to profit when a stock stays within a price range.' },
  { term: 'Iron Butterfly', category: 'trading', definition: 'An options strategy using four contracts to profit from low volatility when the stock stays near a target price.' },
  { term: 'Credit Spread', category: 'trading', definition: 'An options strategy that collects a net premium by selling a more expensive option and buying a cheaper one.' },
  { term: 'Debit Spread', category: 'trading', definition: 'An options strategy that costs a net premium; buying a more expensive option and selling a cheaper one to reduce cost.' },
  { term: 'Put/Call Ratio', category: 'trading', definition: 'The ratio of put options to call options traded; used as a sentiment indicator. High ratio = bearish sentiment.' },
  { term: 'Open Interest', category: 'trading', definition: 'The total number of outstanding options or futures contracts that have not been settled or closed.' },
  { term: 'Options Chain', category: 'trading', definition: 'A list of all available option contracts for a security, showing calls and puts at various strikes and expiries.' },
  { term: 'Gamma Squeeze', category: 'trading', definition: 'When market makers who sold call options must buy underlying shares to hedge as the price rises, accelerating the move.' },
  { term: 'Short Squeeze', category: 'trading', definition: 'When a heavily shorted stock rises, forcing short sellers to cover by buying shares, pushing the price even higher.' },
  { term: 'Capitulation', category: 'trading', definition: 'When investors give up and sell at any price during a sharp decline, often marking the bottom of a selloff.' },
  { term: 'Dead Cat Bounce', category: 'trading', definition: 'A brief, temporary recovery in price during a larger downtrend, followed by a continuation of the decline.' },
  { term: 'Wash Sale', category: 'trading', definition: 'Selling a security at a loss and repurchasing a substantially identical security within 30 days, disallowing the tax loss.' },
  { term: 'Tax Loss Harvesting', category: 'trading', definition: 'Selling investments at a loss to offset capital gains taxes on other profitable investments.' },
  { term: 'Overweight', category: 'trading', definition: 'An analyst recommendation indicating a stock is expected to outperform; investors should hold more than the benchmark.' },
  { term: 'Underweight', category: 'trading', definition: 'An analyst recommendation indicating a stock is expected to underperform; investors should hold less than the benchmark.' },
  { term: 'Price Target', category: 'trading', definition: 'An analyst\'s projection of a stock\'s future price, used to guide buy/sell recommendations.' },
  { term: 'Consensus Estimate', category: 'trading', definition: 'The average of all analyst earnings or revenue forecasts for a company.' },
  { term: 'Earnings Surprise', category: 'trading', definition: 'When a company\'s actual earnings differ from the consensus analyst estimate, either positively or negatively.' },
  { term: 'Guidance', category: 'trading', definition: 'Forward-looking statements from a company\'s management about expected future revenue, earnings, or other metrics.' },
  { term: 'Catalyst', category: 'trading', definition: 'An event or piece of news that is expected to cause a significant move in a stock\'s price.' },
  { term: 'Lock-Up Period', category: 'trading', definition: 'A period after an IPO during which insiders are restricted from selling their shares.' },
  { term: 'Ex-Dividend Date', category: 'trading', definition: 'The cut-off date to be eligible for a dividend; buyers after this date do not receive the next dividend payment.' },
  { term: 'Record Date', category: 'trading', definition: 'The date a company identifies shareholders who are entitled to receive a dividend.' },
  { term: 'Payment Date', category: 'trading', definition: 'The date on which a declared dividend is actually paid to eligible shareholders.' },
  { term: 'Tender Offer', category: 'trading', definition: 'A public offer to buy shares from shareholders at a specified price, usually at a premium.' },
  { term: 'Rights Issue', category: 'trading', definition: 'An offering that allows existing shareholders to buy additional shares at a discount before the public.' },
  { term: 'Delisting', category: 'trading', definition: 'The removal of a security from a stock exchange, either voluntarily or due to non-compliance.' },
  { term: 'Bankruptcy', category: 'trading', definition: 'A legal process for companies or individuals unable to repay debts; equity typically becomes worthless.' },
  { term: 'Reverse Merger', category: 'trading', definition: 'A private company acquires a publicly listed shell company to become publicly traded without a traditional IPO.' },

  // ── ADDITIONAL TECHNICAL ANALYSIS ────────────────────────────────────────────
  { term: 'Ichimoku Cloud', category: 'technical', definition: 'A comprehensive indicator system showing support/resistance, trend direction, and momentum using five lines.' },
  { term: 'Parabolic SAR', category: 'technical', definition: 'A trend-following indicator that places dots above or below price to signal potential reversals.' },
  { term: 'Keltner Channel', category: 'technical', definition: 'Volatility-based bands placed above and below an EMA, using ATR to determine channel width.' },
  { term: 'Donchian Channel', category: 'technical', definition: 'A channel formed by the highest high and lowest low over n periods; used to identify breakouts.' },
  { term: 'Price Action', category: 'technical', definition: 'A trading technique using only raw price movement on charts without lagging indicators.' },
  { term: 'Pin Bar', category: 'technical', definition: 'A candlestick with a long wick and small body, signalling a rejection of price and potential reversal.' },
  { term: 'Hammer', category: 'technical', definition: 'A bullish reversal candlestick with a small body and long lower wick, appearing at the bottom of a downtrend.' },
  { term: 'Shooting Star', category: 'technical', definition: 'A bearish reversal candlestick with a small body and long upper wick, appearing at the top of an uptrend.' },
  { term: 'Engulfing Pattern', category: 'technical', definition: 'A two-candle reversal pattern where the second candle\'s body completely engulfs the first.' },
  { term: 'Harami', category: 'technical', definition: 'A two-candle reversal pattern where a small candle is contained within the body of the previous larger candle.' },
  { term: 'Morning Star', category: 'technical', definition: 'A three-candle bullish reversal pattern: large red candle, small candle (gap down), large green candle.' },
  { term: 'Evening Star', category: 'technical', definition: 'A three-candle bearish reversal pattern: large green candle, small candle (gap up), large red candle.' },
  { term: 'Three White Soldiers', category: 'technical', definition: 'Three consecutive long bullish candles each closing near their high; a strong bullish reversal signal.' },
  { term: 'Three Black Crows', category: 'technical', definition: 'Three consecutive long bearish candles each closing near their low; a strong bearish reversal signal.' },
  { term: 'Dragonfly Doji', category: 'technical', definition: 'A doji with a long lower wick and no upper wick; suggests buyers pushed price back up from lows (bullish).' },
  { term: 'Gravestone Doji', category: 'technical', definition: 'A doji with a long upper wick and no lower wick; suggests sellers pushed price back down from highs (bearish).' },
  { term: 'Inside Bar', category: 'technical', definition: 'A candle whose high and low are completely within the prior candle\'s range; signals consolidation.' },
  { term: 'Outside Bar', category: 'technical', definition: 'A candle whose high and low exceed the prior candle\'s range on both sides; signals volatility expansion.' },
  { term: 'Volume Profile', category: 'technical', definition: 'A chart tool showing the amount of trading activity at specific price levels over a given time period.' },
  { term: 'Point of Control (POC)', category: 'technical', definition: 'The price level with the highest volume traded in a given period; often acts as a magnet or support/resistance.' },
  { term: 'Value Area', category: 'technical', definition: 'The price range in which 70% of the previous session\'s volume was traded, used in volume profile analysis.' },
  { term: 'Gap Fill', category: 'technical', definition: 'When a stock\'s price returns to close the gap created when the stock opened significantly higher or lower than the previous close.' },
  { term: 'Island Reversal', category: 'technical', definition: 'A reversal pattern where a group of candles is isolated by two gaps on either side.' },
  { term: 'Cup and Handle', category: 'technical', definition: 'A bullish continuation pattern resembling a cup with a small consolidation (handle) before a breakout.' },
  { term: 'Ascending Triangle', category: 'technical', definition: 'A bullish chart pattern with a flat upper resistance and rising lower trendline, typically resolving in a breakout upward.' },
  { term: 'Descending Triangle', category: 'technical', definition: 'A bearish chart pattern with a flat lower support and declining upper trendline, typically resolving in a breakdown.' },
  { term: 'Symmetrical Triangle', category: 'technical', definition: 'A chart pattern with converging trendlines; a neutral pattern that can break in either direction.' },
  { term: 'Wedge Pattern', category: 'technical', definition: 'Two converging trendlines both slanting in the same direction; a rising wedge is bearish, falling wedge is bullish.' },
  { term: 'Flag Pattern', category: 'technical', definition: 'A continuation pattern where price consolidates in a channel counter to the trend before resuming the original direction.' },
  { term: 'Pennant Pattern', category: 'technical', definition: 'Similar to a flag but with converging trendlines during consolidation; a short-term continuation pattern.' },
  { term: 'Wyckoff Method', category: 'technical', definition: 'A technical analysis framework describing market cycles as accumulation, markup, distribution, and markdown phases.' },
  { term: 'Accumulation Phase', category: 'technical', definition: 'A period where smart money buys a security before the general public realises a trend is starting.' },
  { term: 'Distribution Phase', category: 'technical', definition: 'A period where smart money sells into strength before a trend reversal, often near market tops.' },
  { term: 'Elder Ray', category: 'technical', definition: 'An indicator measuring the power of bulls and bears using Bull Power (high minus EMA) and Bear Power (low minus EMA).' },
  { term: 'Chaikin Money Flow', category: 'technical', definition: 'A momentum indicator measuring the amount of money flow volume over a period; positive = buying pressure.' },
  { term: 'Force Index', category: 'technical', definition: 'Combines price movement and volume to measure the power behind a move; created by Dr. Alexander Elder.' },
  { term: 'Hull Moving Average (HMA)', category: 'technical', definition: 'A fast and smooth moving average that nearly eliminates lag while maintaining curve smoothness.' },
  { term: 'Weighted Moving Average (WMA)', category: 'technical', definition: 'A moving average that assigns more weight to recent data points proportionally, unlike SMA.' },
  { term: 'DEMA', category: 'technical', definition: 'Double Exponential Moving Average — reduces lag by doubling the EMA and subtracting the EMA of the EMA.' },
  { term: 'TEMA', category: 'technical', definition: 'Triple Exponential Moving Average — further reduces lag using three layers of EMA calculation.' },
  { term: 'Supertrend', category: 'technical', definition: 'A trend-following indicator based on ATR that plots above or below price to signal trend direction.' },
  { term: 'Heikin Ashi', category: 'technical', definition: 'A charting technique using modified candlestick calculations to filter noise and identify trends more clearly.' },
  { term: 'Renko Chart', category: 'technical', definition: 'A chart type ignoring time and only plotting price moves of a set size; removes noise and highlights trends.' },
  { term: 'TRIX', category: 'technical', definition: 'Triple Smoothed Exponential Average oscillator; shows the percentage rate of change of a triple-smoothed EMA.' },
  { term: 'Aroon Indicator', category: 'technical', definition: 'Measures how long since the highest high and lowest low in a period; used to identify trend strength and direction.' },
  { term: 'True Strength Index (TSI)', category: 'technical', definition: 'A momentum oscillator using double-smoothed momentum; crosses above/below zero signal bullish/bearish bias.' },
  { term: 'Price Envelope', category: 'technical', definition: 'Bands placed a fixed percentage above and below a moving average; overbought above upper, oversold below lower.' },

  // ── ADDITIONAL ACCOUNTING TERMS ──────────────────────────────────────────────
  { term: 'Accrual Accounting', category: 'accounting', definition: 'Recording revenues and expenses when they are earned or incurred, not when cash changes hands.' },
  { term: 'Cash Basis Accounting', category: 'accounting', definition: 'Recording revenues and expenses only when cash is received or paid.' },
  { term: 'COGS (Cost of Goods Sold)', category: 'accounting', definition: 'Direct costs attributable to the production of goods sold; subtracted from revenue to find gross profit.' },
  { term: 'SG&A', category: 'accounting', definition: 'Selling, General, and Administrative expenses; operating costs not directly tied to production.' },
  { term: 'R&D Expense', category: 'accounting', definition: 'Money spent on research and development of new products or processes; expensed as incurred under GAAP.' },
  { term: 'Capital Expenditure (CapEx)', category: 'accounting', definition: 'Funds used to acquire or upgrade physical assets like equipment, property, or infrastructure.' },
  { term: 'OpEx (Operating Expenditure)', category: 'accounting', definition: 'Ongoing costs for running a business day-to-day, such as rent, utilities, wages, and maintenance.' },
  { term: 'Intangible Assets', category: 'accounting', definition: 'Non-physical assets with value, such as patents, trademarks, copyrights, brand recognition, and goodwill.' },
  { term: 'Tangible Assets', category: 'accounting', definition: 'Physical assets a company owns, such as machinery, buildings, vehicles, and inventory.' },
  { term: 'Impairment', category: 'accounting', definition: 'A reduction in the carrying value of an asset when its fair value falls below its book value permanently.' },
  { term: 'Write-Off', category: 'accounting', definition: 'Removing an asset from the balance sheet because it has no recoverable value.' },
  { term: 'Write-Down', category: 'accounting', definition: 'Reducing the book value of an asset to reflect a decline in value, but the asset still has some worth.' },
  { term: 'Mark-to-Market (MTM)', category: 'accounting', definition: 'Valuing an asset at its current market price rather than historical cost.' },
  { term: 'Historical Cost', category: 'accounting', definition: 'The original purchase price of an asset, used in traditional accounting without adjustment for market changes.' },
  { term: 'FIFO', category: 'accounting', definition: 'First In, First Out — inventory method assuming the oldest items are sold first, often resulting in higher profits in inflation.' },
  { term: 'LIFO', category: 'accounting', definition: 'Last In, First Out — inventory method assuming the newest items are sold first; can reduce taxable income.' },
  { term: 'Perpetual Inventory', category: 'accounting', definition: 'A system that continuously tracks inventory levels in real-time after every transaction.' },
  { term: 'Pro Forma', category: 'accounting', definition: 'Financial statements based on hypothetical scenarios or adjusted to exclude one-time items.' },
  { term: 'Non-GAAP Earnings', category: 'accounting', definition: 'Adjusted earnings that exclude items management deems unusual or non-recurring; often used by tech companies.' },
  { term: 'Restatement', category: 'accounting', definition: 'Revising previously reported financial statements to correct errors or misstatements.' },
  { term: 'Audit', category: 'accounting', definition: 'An independent examination of financial records to verify accuracy and compliance with accounting standards.' },
  { term: 'Days Sales Outstanding (DSO)', category: 'accounting', definition: 'Average number of days it takes a company to collect payment after a sale; lower is better.' },
  { term: 'Days Payable Outstanding (DPO)', category: 'accounting', definition: 'Average number of days a company takes to pay its suppliers; higher can indicate efficient cash management.' },
  { term: 'Cash Conversion Cycle (CCC)', category: 'accounting', definition: 'Days inventory outstanding + DSO − DPO; measures how efficiently a company converts inventory to cash.' },
  { term: 'Inventory Turnover', category: 'accounting', definition: 'COGS divided by average inventory; how many times inventory is sold and replaced in a period.' },
  { term: 'Asset Turnover', category: 'accounting', definition: 'Revenue divided by total assets; measures how efficiently a company uses assets to generate revenue.' },
  { term: 'Interest Coverage Ratio', category: 'accounting', definition: 'EBIT divided by interest expense; indicates a company\'s ability to pay interest on its debt.' },
  { term: 'Return on Invested Capital (ROIC)', category: 'accounting', definition: 'NOPAT divided by invested capital; measures how effectively a company uses capital to generate returns.' },
  { term: 'NOPAT', category: 'accounting', definition: 'Net Operating Profit After Tax — operating profit adjusted for taxes; used to calculate ROIC.' },
  { term: 'Economic Moat', category: 'accounting', definition: 'A company\'s sustainable competitive advantages that protect its profits from competition (term coined by Warren Buffett).' },
  { term: 'Debt-to-EBITDA', category: 'accounting', definition: 'Total debt divided by EBITDA; measures leverage and ability to pay off debt from operating earnings.' },
  { term: 'Altman Z-Score', category: 'accounting', definition: 'A formula using five financial ratios to predict the probability of corporate bankruptcy. Below 1.81 is distress zone.' },
  { term: 'Piotroski F-Score', category: 'accounting', definition: 'A 9-point scoring system rating a company\'s financial health based on profitability, leverage, and efficiency.' },
  { term: 'Deferred Revenue', category: 'accounting', definition: 'Money received before the goods/services are delivered; a liability until earned.' },
  { term: 'Deferred Tax Liability', category: 'accounting', definition: 'Taxes owed in the future due to temporary timing differences between accounting and tax recognition.' },
  { term: 'Minority Interest', category: 'accounting', definition: 'The portion of a subsidiary\'s equity not owned by the parent company.' },
  { term: 'Pension Liability', category: 'accounting', definition: 'The present value of future pension obligations a company owes to its employees.' },
  { term: 'Off-Balance Sheet', category: 'accounting', definition: 'Assets or liabilities not appearing on the main balance sheet but disclosed in footnotes.' },
  { term: 'Covenant', category: 'accounting', definition: 'Conditions in a loan agreement requiring the borrower to maintain certain financial ratios or restrict certain actions.' },
  { term: 'Bridge Financing', category: 'accounting', definition: 'Short-term funding used to bridge a gap until a company secures permanent financing.' },

  // ── ADDITIONAL FINANCE / VALUATION TERMS ─────────────────────────────────────
  { term: 'Gordon Growth Model', category: 'finance', definition: 'A stock valuation model assuming dividends grow at a constant rate: P = D₁ / (r − g).' },
  { term: 'CAPM', category: 'finance', definition: 'Capital Asset Pricing Model — determines expected return: E(r) = Rf + β(Rm − Rf).' },
  { term: 'Efficient Market Hypothesis (EMH)', category: 'finance', definition: 'Theory that asset prices fully reflect all available information, making it impossible to consistently beat the market.' },
  { term: 'Modern Portfolio Theory (MPT)', category: 'finance', definition: 'Framework by Markowitz showing how to construct a portfolio to maximise expected return for a given risk level.' },
  { term: 'Efficient Frontier', category: 'finance', definition: 'The set of portfolios offering the highest expected return for a defined level of risk.' },
  { term: 'Factor Investing', category: 'finance', definition: 'An investment approach targeting specific drivers of return such as value, momentum, quality, or size.' },
  { term: 'Smart Beta', category: 'finance', definition: 'Index strategies that weight securities based on factors other than market cap, such as volatility or dividends.' },
  { term: 'Quantitative Finance (Quant)', category: 'finance', definition: 'Using mathematical and statistical models to analyse financial markets and develop trading strategies.' },
  { term: 'Robo-Advisor', category: 'finance', definition: 'An automated digital financial planning service that uses algorithms to manage investments with minimal human oversight.' },
  { term: 'Family Office', category: 'finance', definition: 'A private wealth management firm serving ultra-high-net-worth families, handling investments, taxes, and estate planning.' },
  { term: 'Hedge Fund', category: 'finance', definition: 'A pooled investment vehicle using diverse and complex strategies (leverage, short selling, derivatives) to generate returns.' },
  { term: 'Mutual Fund', category: 'finance', definition: 'A pooled investment vehicle managed by professionals that invests in stocks, bonds, or other securities.' },
  { term: 'Closed-End Fund', category: 'finance', definition: 'A fund with a fixed number of shares that trades on an exchange, potentially at a discount or premium to NAV.' },
  { term: 'Load Fund', category: 'finance', definition: 'A mutual fund that charges a sales commission (front-end or back-end) when buying or selling shares.' },
  { term: 'No-Load Fund', category: 'finance', definition: 'A mutual fund that does not charge a sales commission; investors pay only the expense ratio.' },
  { term: 'Expense Ratio', category: 'finance', definition: 'The annual fee charged by a fund, expressed as a percentage of assets, covering management and operational costs.' },
  { term: 'Turnover Rate', category: 'finance', definition: 'The percentage of a fund\'s holdings replaced in a given year; high turnover can increase taxes and costs.' },
  { term: 'Greenshoe Option', category: 'finance', definition: 'An over-allotment option allowing underwriters to sell additional shares after an IPO to stabilise the price.' },
  { term: 'Hostile Takeover', category: 'finance', definition: 'An acquisition attempt opposed by the target company\'s board, often pursued through a direct offer to shareholders.' },
  { term: 'White Knight', category: 'finance', definition: 'A friendly acquirer brought in by a target company to prevent a hostile takeover.' },
  { term: 'Poison Pill', category: 'finance', definition: 'A defensive strategy allowing existing shareholders to buy more shares at a discount if a hostile bidder acquires a threshold stake.' },
  { term: 'Golden Parachute', category: 'finance', definition: 'Large financial compensation guaranteed to executives if the company is acquired and they are let go.' },
  { term: 'Proxy Fight', category: 'finance', definition: 'When activist shareholders solicit votes from other shareholders to replace board members or change company policy.' },
  { term: 'Activist Investor', category: 'finance', definition: 'An investor who buys a significant stake in a company to push for changes in management, strategy, or capital allocation.' },
  { term: 'Accretive', category: 'finance', definition: 'Describes an acquisition or transaction that increases the acquirer\'s earnings per share after completion.' },
  { term: 'Dilutive', category: 'finance', definition: 'Describes an acquisition or share issuance that decreases the acquirer\'s earnings per share.' },
  { term: 'Control Premium', category: 'finance', definition: 'The extra amount paid above market price to acquire a controlling stake in a company.' },
  { term: 'Minority Discount', category: 'finance', definition: 'A reduction in value applied to a minority stake because it lacks the ability to control the company.' },
  { term: 'Recapitalisation', category: 'finance', definition: 'Restructuring a company\'s capital structure, often by changing the mix of debt and equity.' },
  { term: 'LBO (Leveraged Buyout)', category: 'finance', definition: 'Acquiring a company using mostly borrowed money, with the target\'s assets often used as collateral.' },
  { term: 'MBO (Management Buyout)', category: 'finance', definition: 'A form of LBO where the existing management team purchases the company.' },
  { term: 'Spin-Off', category: 'finance', definition: 'When a parent company creates an independent company by distributing new shares of a subsidiary.' },
  { term: 'Carve-Out', category: 'finance', definition: 'A partial IPO of a subsidiary in which the parent retains a majority stake.' },
  { term: 'Divestitute', category: 'finance', definition: 'The partial or full disposal of a business unit or asset to raise capital or refocus operations.' },
  { term: 'Net Present Value (NPV)', category: 'finance', definition: 'The present value of future cash flows minus the initial investment; positive NPV indicates value creation.' },
  { term: 'Internal Rate of Return (IRR)', category: 'finance', definition: 'The discount rate that makes the NPV of a project equal to zero; used to evaluate capital projects.' },
  { term: 'Payback Period', category: 'finance', definition: 'The time needed for a project or investment to recover its initial cost from cash flows.' },
  { term: 'Terminal Value', category: 'finance', definition: 'The value of a business beyond the explicit forecast period in a DCF model.' },
  { term: 'Macro Investing', category: 'finance', definition: 'A strategy based on large-scale economic and political views across global markets.' },
  { term: 'Fundamental Analysis', category: 'finance', definition: 'Evaluating a security\'s intrinsic value by analysing financial statements, management, industry, and economic factors.' },
  { term: 'Technical Analysis', category: 'finance', definition: 'Evaluating a security\'s future price by analysing historical price action and volume patterns.' },
  { term: 'Value Investing', category: 'finance', definition: 'Buying securities that appear underpriced relative to intrinsic value; popularised by Benjamin Graham and Warren Buffett.' },
  { term: 'Growth Investing', category: 'finance', definition: 'Buying stocks of companies expected to grow faster than average, even if their current valuations are high.' },
  { term: 'Income Investing', category: 'finance', definition: 'Focusing on investments that generate regular income through dividends, interest, or rent.' },
  { term: 'Contrarian Investing', category: 'finance', definition: 'Going against prevailing market sentiment; buying when others are fearful and selling when others are greedy.' },
  { term: 'Passive Investing', category: 'finance', definition: 'Buying and holding index funds or ETFs to match market returns rather than trying to beat them.' },
  { term: 'Active Investing', category: 'finance', definition: 'Selecting individual securities or timing the market with the goal of outperforming a benchmark.' },
  { term: 'Event-Driven Strategy', category: 'finance', definition: 'An investment approach that profits from corporate events like mergers, spin-offs, earnings surprises, or restructurings.' },
  { term: 'Arbitrage Pricing Theory (APT)', category: 'finance', definition: 'A multi-factor model for asset pricing using several macroeconomic risk factors, an alternative to CAPM.' },
  { term: 'Fama-French Three Factor Model', category: 'finance', definition: 'Extends CAPM with size (small-cap premium) and value (book-to-market) factors to explain stock returns.' },
  { term: 'Swap', category: 'finance', definition: 'A derivative contract exchanging cash flows between two parties, such as interest rate or currency swaps.' },
  { term: 'Interest Rate Swap', category: 'finance', definition: 'An agreement to exchange fixed interest payments for floating ones (or vice versa) on a notional principal.' },
  { term: 'Currency Swap', category: 'finance', definition: 'An agreement to exchange principal and interest in one currency for principal and interest in another.' },
  { term: 'Total Return Swap', category: 'finance', definition: 'A derivative where one party receives total returns (capital gains + dividends) of an asset in exchange for a fixed payment.' },
  { term: 'Futures Contract', category: 'finance', definition: 'An agreement to buy or sell an asset at a predetermined price on a specified future date.' },
  { term: 'Forward Contract', category: 'finance', definition: 'A customised, private agreement to buy or sell an asset at a set price on a future date; traded OTC.' },
  { term: 'Mortgage-Backed Security (MBS)', category: 'finance', definition: 'A bond backed by a pool of home loans; pays investors from mortgage principal and interest payments.' },
  { term: 'Collateral', category: 'finance', definition: 'An asset pledged as security for a loan; if the borrower defaults, the lender can seize the collateral.' },
  { term: 'Leverage', category: 'finance', definition: 'Using borrowed capital to increase the potential return on investment, also amplifying potential losses.' },
  { term: 'Deleveraging', category: 'finance', definition: 'The process of reducing debt or financial leverage, often occurring after a credit crisis.' },
  { term: 'Stress Test', category: 'finance', definition: 'A simulation testing how a financial institution or portfolio performs under extreme economic scenarios.' },
  { term: 'Systemic Risk', category: 'finance', definition: 'The risk of collapse of an entire financial system or market, triggered by interconnected failures.' },
  { term: 'Idiosyncratic Risk', category: 'finance', definition: 'Risk specific to a particular company or sector, which can be reduced through diversification.' },
  { term: 'Systematic Risk', category: 'finance', definition: 'Market-wide risk that cannot be diversified away; includes interest rate changes, recessions, and geopolitical events.' },

  // ── ADDITIONAL ACRONYMS ──────────────────────────────────────────────────────
  { term: 'CAGR', category: 'acronym', definition: 'Compound Annual Growth Rate — the rate at which an investment grows annually over a period, assuming compounding.' },
  { term: 'ROE', category: 'acronym', definition: 'Return on Equity — net income divided by shareholders\' equity; measures profitability relative to equity.' },
  { term: 'ROA', category: 'acronym', definition: 'Return on Assets — net income divided by total assets; measures how efficiently assets generate profit.' },
  { term: 'ROIC', category: 'acronym', definition: 'Return on Invested Capital — how effectively a company uses capital to generate returns.' },
  { term: 'WACC', category: 'acronym', definition: 'Weighted Average Cost of Capital — the blended cost of debt and equity financing for a company.' },
  { term: 'CapEx', category: 'acronym', definition: 'Capital Expenditure — spending on acquiring or upgrading physical assets like property or equipment.' },
  { term: 'EBIT', category: 'acronym', definition: 'Earnings Before Interest and Taxes — a measure of a company\'s core profitability from operations.' },
  { term: 'EBITDA', category: 'acronym', definition: 'Earnings Before Interest, Taxes, Depreciation, and Amortisation — a proxy for operating cash flow.' },
  { term: 'EPS', category: 'acronym', definition: 'Earnings Per Share — net income divided by outstanding shares; key profitability metric.' },
  { term: 'P/E', category: 'acronym', definition: 'Price-to-Earnings — share price divided by EPS; how much investors pay per dollar of earnings.' },
  { term: 'P/B', category: 'acronym', definition: 'Price-to-Book — share price divided by book value per share.' },
  { term: 'P/S', category: 'acronym', definition: 'Price-to-Sales — market cap divided by annual revenue.' },
  { term: 'EV', category: 'acronym', definition: 'Enterprise Value — total value of a company including debt and subtracting cash.' },
  { term: 'DCF', category: 'acronym', definition: 'Discounted Cash Flow — a valuation method using projected future cash flows discounted to present value.' },
  { term: 'NPV', category: 'acronym', definition: 'Net Present Value — the value of future cash flows minus the initial investment in today\'s dollars.' },
  { term: 'IRR', category: 'acronym', definition: 'Internal Rate of Return — the discount rate that makes a project\'s NPV equal to zero.' },
  { term: 'TTM', category: 'acronym', definition: 'Trailing Twelve Months — the most recent 12 months of financial data.' },
  { term: 'YoY', category: 'acronym', definition: 'Year over Year — comparing a metric to the same period in the previous year.' },
  { term: 'QoQ', category: 'acronym', definition: 'Quarter over Quarter — comparing a metric to the previous quarter.' },
  { term: 'MoM', category: 'acronym', definition: 'Month over Month — comparing a metric to the previous month.' },
  { term: 'D/E', category: 'acronym', definition: 'Debt-to-Equity Ratio — total debt divided by shareholders\' equity; measures financial leverage.' },
  { term: 'IV', category: 'acronym', definition: 'Implied Volatility — the market\'s expectation of future volatility derived from option prices.' },
  { term: 'ATM', category: 'acronym', definition: 'At the Money — an option whose strike price equals the current market price of the underlying.' },
  { term: 'ITM', category: 'acronym', definition: 'In the Money — an option with intrinsic value (call: market > strike; put: market < strike).' },
  { term: 'OTM', category: 'acronym', definition: 'Out of the Money — an option with no intrinsic value.' },
  { term: 'DTE', category: 'acronym', definition: 'Days to Expiration — the number of calendar days until an options contract expires.' },
  { term: 'SMA', category: 'acronym', definition: 'Simple Moving Average — the arithmetic mean of a security\'s closing price over n periods.' },
  { term: 'EMA', category: 'acronym', definition: 'Exponential Moving Average — a moving average that gives more weight to recent data.' },
  { term: 'RSI', category: 'acronym', definition: 'Relative Strength Index — a momentum oscillator measuring the speed and change of price movements (0–100).' },
  { term: 'MACD', category: 'acronym', definition: 'Moving Average Convergence Divergence — a trend-following momentum indicator.' },
  { term: 'ATR', category: 'acronym', definition: 'Average True Range — a volatility indicator measuring average price range over a period.' },
  { term: 'VWAP', category: 'acronym', definition: 'Volume-Weighted Average Price — the average price of a security weighted by volume; a key intraday benchmark.' },
  { term: 'SaaS', category: 'acronym', definition: 'Software as a Service — cloud-based software subscription model; common metric is ARR (Annual Recurring Revenue).' },
  { term: 'ARR', category: 'acronym', definition: 'Annual Recurring Revenue — predictable yearly revenue from subscriptions; key SaaS metric.' },
  { term: 'MRR', category: 'acronym', definition: 'Monthly Recurring Revenue — predictable monthly revenue from subscriptions.' },
  { term: 'CLV / LTV', category: 'acronym', definition: 'Customer Lifetime Value — total revenue expected from a customer over the entire relationship.' },
  { term: 'CAC', category: 'acronym', definition: 'Customer Acquisition Cost — the cost to acquire one new customer, including marketing and sales spend.' },
  { term: 'NRR', category: 'acronym', definition: 'Net Revenue Retention — the percentage of revenue retained from existing customers including expansions minus churn.' },
  { term: 'GRM', category: 'acronym', definition: 'Gross Revenue Margin — total revenue minus COGS, divided by revenue; top-line profitability.' },
  { term: 'BEP', category: 'acronym', definition: 'Break-Even Point — the level of sales at which total revenue equals total costs; neither profit nor loss.' },
  { term: 'MOIC', category: 'acronym', definition: 'Multiple on Invested Capital — the total value received divided by the total invested; used in private equity.' },
  { term: 'CBOE', category: 'acronym', definition: 'Chicago Board Options Exchange — the world\'s largest options exchange.' },
  { term: 'CME', category: 'acronym', definition: 'Chicago Mercantile Exchange — a major global derivatives marketplace for futures and options.' },
  { term: 'ICE', category: 'acronym', definition: 'Intercontinental Exchange — a global network of exchanges and clearing houses for financial and commodity markets.' },
  { term: 'OI', category: 'acronym', definition: 'Open Interest — the total number of outstanding derivative contracts not yet settled.' },
  { term: 'PCR', category: 'acronym', definition: 'Put-Call Ratio — the number of puts traded divided by calls; a contrarian sentiment indicator.' },
  { term: 'GTC', category: 'acronym', definition: 'Good Till Cancelled — an order that remains active until filled or manually cancelled.' },
  { term: 'FOK', category: 'acronym', definition: 'Fill or Kill — an order that must be filled completely and immediately or cancelled.' },
  { term: 'IOC', category: 'acronym', definition: 'Immediate or Cancel — an order that must execute immediately; unfilled portion is cancelled.' },
  { term: 'CFA', category: 'acronym', definition: 'Chartered Financial Analyst — a globally recognised professional designation for investment analysis.' },
  { term: 'CPA', category: 'acronym', definition: 'Certified Public Accountant — a licensed accounting professional in the United States.' },
  { term: 'CFP', category: 'acronym', definition: 'Certified Financial Planner — a professional designation for financial planning expertise.' },
  { term: 'FRM', category: 'acronym', definition: 'Financial Risk Manager — a certification for risk management professionals.' },
  { term: 'CMT', category: 'acronym', definition: 'Chartered Market Technician — a designation for technical analysis expertise.' },
  { term: 'RIA', category: 'acronym', definition: 'Registered Investment Advisor — a firm or individual registered with the SEC to provide investment advice.' },
  { term: 'BD', category: 'acronym', definition: 'Broker-Dealer — a firm that buys and sells securities on behalf of clients and for its own account.' },
  { term: 'MSCI', category: 'acronym', definition: 'Morgan Stanley Capital International — provides equity, fixed income, and real estate indices used globally.' },
  { term: 'LSE', category: 'acronym', definition: 'London Stock Exchange — the primary stock exchange of the United Kingdom.' },
  { term: 'TSE', category: 'acronym', definition: 'Tokyo Stock Exchange — Japan\'s primary and largest stock exchange.' },
  { term: 'HKEX', category: 'acronym', definition: 'Hong Kong Exchanges and Clearing — the primary stock exchange of Hong Kong.' },
  { term: 'SSE', category: 'acronym', definition: 'Shanghai Stock Exchange — one of China\'s two major stock exchanges.' },
  { term: 'TSX', category: 'acronym', definition: 'Toronto Stock Exchange — Canada\'s largest stock exchange.' },
  { term: 'ASX', category: 'acronym', definition: 'Australian Securities Exchange — Australia\'s primary stock exchange.' },
  { term: 'BSE', category: 'acronym', definition: 'Bombay Stock Exchange — India\'s oldest and one of the largest stock exchanges.' },
  { term: 'NSE', category: 'acronym', definition: 'National Stock Exchange of India — India\'s largest stock exchange by volume.' },
  { term: 'KRX', category: 'acronym', definition: 'Korea Exchange — South Korea\'s only securities exchange.' },

  // ── SLANG ────────────────────────────────────────────────────────────────────
  { term: 'Bag Holder', category: 'slang', definition: 'An investor stuck holding a losing position long after they should have sold; "holding the bag" of losses.' },
  { term: 'Diamond Hands', category: 'slang', definition: 'Holding a position through extreme volatility and losses without selling; originally popularised on Reddit\'s WallStreetBets.' },
  { term: 'Paper Hands', category: 'slang', definition: 'Selling a position at the first sign of volatility or loss; the opposite of diamond hands.' },
  { term: 'Tendies', category: 'slang', definition: 'Slang for profits or gains, derived from "chicken tenders"; used humorously in retail trading communities.' },
  { term: 'To the Moon', category: 'slang', definition: 'Expectation that a stock or crypto will rise dramatically; often expressed with rocket emojis (🚀).' },
  { term: 'YOLO Trade', category: 'slang', definition: '"You Only Live Once" — an extremely high-risk, all-in trade; used to describe reckless trading on WallStreetBets.' },
  { term: 'Stonks', category: 'slang', definition: 'A deliberate misspelling of "stocks" used humorously; often paired with the "Stonks" meme image.' },
  { term: 'HODL', category: 'slang', definition: 'Originally a misspelling of "hold"; now means Hold On for Dear Life — refusing to sell despite market swings (crypto origin).' },
  { term: 'FUD', category: 'slang', definition: 'Fear, Uncertainty, and Doubt — negative news or sentiment (sometimes manufactured) spread to drive a price down.' },
  { term: 'FOMO', category: 'slang', definition: 'Fear of Missing Out — buying into a rising asset out of fear of missing profits; often leads to chasing tops.' },
  { term: 'Rekt', category: 'slang', definition: 'Suffering heavy financial losses on a trade; derived from "wrecked." "Got completely rekt shorting Tesla."' },
  { term: 'Ape', category: 'slang', definition: 'A retail investor, especially one who buys aggressively based on hype rather than analysis; used self-deprecatingly.' },
  { term: 'DD (Due Diligence)', category: 'slang', definition: 'Research done before a trade. "Read the DD before buying" = do your homework on a stock.' },
  { term: 'Whale', category: 'slang', definition: 'An investor with enormous capital whose trades can move markets; the opposite of a retail trader.' },
  { term: 'Shrimp / Plankton', category: 'slang', definition: 'Informal terms for very small retail investors with minimal capital.' },
  { term: 'Smart Money', category: 'slang', definition: 'Institutional investors, hedge funds, and insiders who are assumed to have superior information.' },
  { term: 'Dumb Money', category: 'slang', definition: 'Retail investors; the term implies they are less informed than institutions. Markets often fade dumb money extremes.' },
  { term: 'Pump and Dump', category: 'slang', definition: 'A scheme where a stock is artificially inflated through hype, then sold by insiders, leaving buyers with losses.' },
  { term: 'Meme Stock', category: 'slang', definition: 'A stock driven by social media hype and retail momentum rather than fundamentals (e.g., GameStop in 2021).' },
  { term: 'Rugpull', category: 'slang', definition: 'A scam where developers abandon a crypto project and take investor funds; the rug is "pulled" from under buyers.' },
  { term: 'Moonshot', category: 'slang', definition: 'An extremely high-risk, high-reward investment that could multiply value many times over.' },
  { term: 'Permabull', category: 'slang', definition: 'A person who is always bullish regardless of market conditions; permanently optimistic.' },
  { term: 'Permabear', category: 'slang', definition: 'A person who is always bearish regardless of market conditions; permanently pessimistic or doom-and-gloom.' },
  { term: 'The Fed', category: 'slang', definition: 'The US Federal Reserve; colloquially referenced as the driver of market conditions via interest rate decisions.' },
  { term: 'Printer Goes Brrr', category: 'slang', definition: 'A meme mocking central bank money printing (quantitative easing); implies inflation and currency debasement.' },
  { term: 'Buy the Dip', category: 'slang', definition: 'Purchasing a security after a price decline, expecting it to recover; popular strategy in bull markets.' },
  { term: 'Sell the Rip', category: 'slang', definition: 'Selling into strength after a price spike, expecting the move to reverse.' },
  { term: 'Bear Trap', category: 'slang', definition: 'A false signal that a market is heading lower, causing short sellers to enter positions before the price reverses upward.' },
  { term: 'Bull Trap', category: 'slang', definition: 'A false signal that a market is heading higher, causing buyers to enter before the price reverses downward.' },
  { term: 'Baggage', category: 'slang', definition: 'Shares bought at a much higher price than the current market value; the emotional weight of holding losers.' },
  { term: 'Catching a Falling Knife', category: 'slang', definition: 'Buying a stock in freefall expecting a bottom; highly risky as the decline may continue much further.' },
  { term: 'Choppy Market', category: 'slang', definition: 'A market with no clear trend, moving sideways with frequent small up and down moves.' },
  { term: 'Crack', category: 'slang', definition: 'A sudden sharp decline in a stock\'s price; "the stock cracked support."' },
  { term: 'Flush', category: 'slang', definition: 'A sudden sharp selloff that shakes out weak holders before a recovery; "we needed a flush before the reversal."' },
  { term: 'Squeeze', category: 'slang', definition: 'A forced buy (short squeeze) or sell (long squeeze) that causes rapid price movement.' },
  { term: 'Getting Stopped Out', category: 'slang', definition: 'When a stop-loss order is triggered, closing a trade with a loss.' },
  { term: 'Alpha Chad', category: 'slang', definition: 'Hyperbolic slang for an investor or trader who consistently generates exceptional returns.' },
  { term: 'Shill', category: 'slang', definition: 'Someone who promotes a stock or crypto for personal gain without disclosing their interest.' },
  { term: 'Baggie', category: 'slang', definition: 'Informal term for a bag holder; someone sitting on significant paper losses.' },
  { term: 'Going Parabolic', category: 'slang', definition: 'A stock or asset rising at an accelerating, near-vertical pace; unsustainable and usually precedes a sharp reversal.' },
  { term: 'Face Ripper Rally', category: 'slang', definition: 'An extremely sharp, unexpected rally that destroys short sellers — "rips their faces off."' },
  { term: 'Bleeding', category: 'slang', definition: 'Slowly losing money on a position over time as the price gradually declines.' },
  { term: 'Blood in the Streets', category: 'slang', definition: 'Extreme market panic and widespread losses; often cited as a time to buy contrarily.' },
  { term: 'Green Day / Red Day', category: 'slang', definition: 'Trader slang for a profitable day (green) or a losing day (red), referring to candle colours on charts.' },
  { term: 'Degen', category: 'slang', definition: 'Short for "degenerate gambler"; used self-referentially by high-risk traders who take outsized bets.' },
  { term: 'Retrace', category: 'slang', definition: 'A temporary reversal within a larger trend; "the stock retraced to the 50-day before continuing higher."' },
  { term: 'Crack and Rip', category: 'slang', definition: 'A stock drops sharply (crack) then reverses and surges higher (rip); often used to shake out weak hands.' },
  { term: 'Nuke', category: 'slang', definition: 'A sudden, severe market crash; "the market just got nuked after the CPI print."' },
  { term: 'Dump It', category: 'slang', definition: 'Aggressively sell a position, usually after a failed move or to take profits quickly.' },
  { term: 'Rip It', category: 'slang', definition: 'Aggressively buying into a rising move.' },
  { term: 'Kitchen Sink Quarter', category: 'slang', definition: 'When a company reports everything bad at once — maxing out write-downs and charges — to "clear the decks."' },
  { term: 'Risk-On', category: 'slang', definition: 'A market environment where investors are willing to take more risk, favouring equities, high-yield, and growth assets.' },
  { term: 'Risk-Off', category: 'slang', definition: 'A market environment where investors flee to safe assets like Treasuries, gold, and defensive stocks.' },
  { term: 'Flight to Safety', category: 'slang', definition: 'The movement of capital into safe-haven assets during times of market stress or geopolitical uncertainty.' },
  { term: 'Dry Powder', category: 'slang', definition: 'Cash or liquid assets held in reserve, ready to be deployed into investments at the right time.' },
  { term: 'Skin in the Game', category: 'slang', definition: 'Having a personal financial stake in an investment; aligned incentives between investor and manager.' },
  { term: 'Blowup', category: 'slang', definition: 'When a trader, fund, or company suffers catastrophic losses, often due to excessive leverage.' },
  { term: 'Pain Trade', category: 'slang', definition: 'The market move that causes the most pain to the most participants; often the direction nobody is positioned for.' },
  { term: 'Tape Bomb', category: 'slang', definition: 'An unexpected negative headline that immediately tanks a stock or the broader market.' },
  { term: 'Chasing', category: 'slang', definition: 'Buying a stock after it has already made a large move, fearing you\'ll miss more gains; usually a bad strategy.' },
  { term: 'Bagging', category: 'slang', definition: 'Making large, unrealised gains on a position — "I\'m bagging on NVDA calls."' },
  { term: 'Macro Headwinds', category: 'slang', definition: 'Economic or policy conditions working against stock performance, such as rising rates or slowing growth.' },
  { term: 'Macro Tailwinds', category: 'slang', definition: 'Economic or policy conditions that help boost stock performance, such as rate cuts or fiscal stimulus.' },
  { term: 'Unicorn', category: 'slang', definition: 'A private startup valued at over $1 billion; the term reflects how rare such valuations used to be.' },
  { term: 'Decacorn', category: 'slang', definition: 'A private startup valued at over $10 billion.' },
  { term: 'Zombie Company', category: 'slang', definition: 'A company that earns just enough to service its debt but cannot reduce it or grow; kept alive by low rates.' },
  { term: 'Value Trap', category: 'slang', definition: 'A stock that appears cheap on valuation metrics but continues to decline; cheap for a reason.' },
  { term: 'Rate Shock', category: 'slang', definition: 'The sudden impact on asset prices when interest rates rise faster than expected.' },
  { term: 'Sticky Inflation', category: 'slang', definition: 'Inflation that is slow to decrease even after monetary tightening; proves difficult for central banks to cool.' },
  { term: 'Soft Landing', category: 'slang', definition: 'When a central bank successfully slows inflation without triggering a recession.' },
  { term: 'Hard Landing', category: 'slang', definition: 'When tightening monetary policy causes a sharp economic downturn or recession.' },
  { term: 'Stagflation', category: 'slang', definition: 'The simultaneous combination of slow economic growth, high unemployment, and high inflation.' },
  { term: 'Taper Tantrum', category: 'slang', definition: 'A surge in bond yields and market volatility in response to a central bank signalling it will reduce asset purchases.' },
  { term: 'Market Maker', category: 'slang', definition: 'A firm or individual providing liquidity by continuously quoting buy and sell prices in a security.' },
  { term: 'Retail Investor', category: 'slang', definition: 'Individual, non-professional investors; contrasted with institutional players like funds and banks.' },
  { term: 'Institutional Investor', category: 'slang', definition: 'Large organisations — pension funds, mutual funds, insurers — that trade in very large volumes.' },
  { term: 'Degrossing', category: 'slang', definition: 'When a hedge fund reduces both long and short positions simultaneously to lower overall exposure.' },
  { term: 'Forced Selling', category: 'slang', definition: 'Selling driven by margin calls, redemptions, or risk limits — not by choice.' },
  { term: 'Liquidity Crunch', category: 'slang', definition: 'A period when cash and liquid assets are scarce, causing sharp market dislocations.' },
]

const CATEGORY_LABELS: Record<Category, string> = {
  trading: 'Trading',
  technical: 'Technical',
  accounting: 'Accounting',
  finance: 'Finance',
  acronym: 'Acronyms',
  slang: 'Slang',
}

const CATEGORY_COLORS: Record<Category, string> = {
  trading: 'text-blue-400 border-blue-400/30 bg-blue-400/10',
  technical: 'text-purple-400 border-purple-400/30 bg-purple-400/10',
  accounting: 'text-orange-400 border-orange-400/30 bg-orange-400/10',
  finance: 'text-green-400 border-green-400/30 bg-green-400/10',
  acronym: 'text-cyan-400 border-cyan-400/30 bg-cyan-400/10',
  slang: 'text-pink-400 border-pink-400/30 bg-pink-400/10',
}

const ALL_CATEGORIES: Array<Category | 'all'> = ['all', 'trading', 'technical', 'accounting', 'finance', 'acronym', 'slang']

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

  // Reset expanded entry whenever the category filter changes so a term from
  // one category cannot appear "open" when browsing a different category.
  const handleCategory = (cat: Category | 'all') => {
    setActiveCategory(cat)
    setExpanded(null)
  }

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
            placeholder={`Search ${TERMS.length}+ terms…`}
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
              onClick={() => handleCategory(cat)}
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
            // Use category+term as the unique key so duplicate term names across
            // categories don't collide in React's reconciler or in expanded state.
            const uid = `${t.category}:${t.term}`
            const isOpen = expanded === uid
            return (
              <div
                key={uid}
                className="border border-border/60 rounded bg-card/30 overflow-hidden"
              >
                <button
                  onClick={() => setExpanded(isOpen ? null : uid)}
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
