'use client'

import { useState, useMemo } from 'react'
import { Search, X } from 'lucide-react'
import { cn } from '@/lib/utils'

// ── Formula data ──────────────────────────────────────────────────────────────

type FormulaCategory = 'technical' | 'valuation' | 'risk' | 'portfolio' | 'accounting' | 'options'

interface Formula {
  name: string
  formula: string      // LaTeX-style plain-text formula representation
  description: string
  category: FormulaCategory
  variables?: string   // brief variable legend
}

const FORMULAS: Formula[] = [
  // ── TECHNICAL INDICATORS ────────────────────────────────────────────────────
  {
    name: 'Simple Moving Average (SMA)',
    category: 'technical',
    formula: 'SMA = (P₁ + P₂ + … + Pₙ) / n',
    description: 'Average closing price over n periods.',
    variables: 'P = closing price, n = number of periods',
  },
  {
    name: 'Exponential Moving Average (EMA)',
    category: 'technical',
    formula: 'EMAₜ = Pₜ × k + EMAₜ₋₁ × (1 − k)\nk = 2 / (n + 1)',
    description: 'Weighted moving average giving more weight to recent prices.',
    variables: 'P = price, k = smoothing factor, n = periods',
  },
  {
    name: 'Relative Strength Index (RSI)',
    category: 'technical',
    formula: 'RSI = 100 − 100 / (1 + RS)\nRS = Avg Gain / Avg Loss',
    description: 'Momentum oscillator measuring speed of price changes (0–100). >70 overbought, <30 oversold.',
    variables: 'RS = relative strength, periods typically 14',
  },
  {
    name: 'MACD Line',
    category: 'technical',
    formula: 'MACD = EMA(12) − EMA(26)\nSignal = EMA(9) of MACD\nHistogram = MACD − Signal',
    description: 'Trend-following momentum indicator showing relationship between two EMAs.',
  },
  {
    name: 'Bollinger Bands',
    category: 'technical',
    formula: 'Upper = SMA(n) + k × σ\nLower = SMA(n) − k × σ',
    description: 'Volatility bands placed above and below a moving average.',
    variables: 'σ = std deviation of price, k = 2 (typical), n = 20 (typical)',
  },
  {
    name: 'Average True Range (ATR)',
    category: 'technical',
    formula: 'TR = max(H−L, |H−C_prev|, |L−C_prev|)\nATR = SMA(TR, n)',
    description: 'Measures market volatility as average of True Range over n periods.',
    variables: 'H = high, L = low, C_prev = previous close',
  },
  {
    name: 'Stochastic Oscillator %K',
    category: 'technical',
    formula: '%K = (C − L₁₄) / (H₁₄ − L₁₄) × 100\n%D = SMA(%K, 3)',
    description: 'Compares closing price to price range over 14 periods.',
    variables: 'C = close, L₁₄ = 14-period low, H₁₄ = 14-period high',
  },
  {
    name: 'On-Balance Volume (OBV)',
    category: 'technical',
    formula: 'OBVₜ = OBVₜ₋₁ + V   if C > C_prev\nOBVₜ = OBVₜ₋₁ − V   if C < C_prev',
    description: 'Cumulative volume indicator showing buying and selling pressure.',
    variables: 'V = volume, C = close',
  },
  {
    name: 'Williams %R',
    category: 'technical',
    formula: '%R = (H_n − C) / (H_n − L_n) × −100',
    description: 'Momentum indicator ranging from −100 to 0. Above −20 overbought, below −80 oversold.',
    variables: 'H_n = highest high over n periods, L_n = lowest low',
  },
  {
    name: 'Commodity Channel Index (CCI)',
    category: 'technical',
    formula: 'CCI = (TP − SMA(TP, n)) / (0.015 × MD)\nTP = (H + L + C) / 3',
    description: 'Identifies cyclical trends. Values above +100 or below −100 are notable.',
    variables: 'TP = typical price, MD = mean deviation',
  },
  {
    name: 'Rate of Change (ROC)',
    category: 'technical',
    formula: 'ROC = (Cₜ − Cₜ₋ₙ) / Cₜ₋ₙ × 100',
    description: 'Measures the percentage change in price over n periods.',
    variables: 'C = close price, n = look-back period',
  },
  {
    name: 'Money Flow Index (MFI)',
    category: 'technical',
    formula: 'TP = (H + L + C) / 3\nMF = TP × Volume\nMFI = 100 − 100 / (1 + PMF/NMF)',
    description: 'Volume-weighted RSI. >80 overbought, <20 oversold.',
    variables: 'PMF = positive money flow, NMF = negative money flow',
  },
  {
    name: 'VWAP',
    category: 'technical',
    formula: 'VWAP = Σ(TP × V) / ΣV',
    description: 'Volume-Weighted Average Price — benchmark for intraday trading.',
    variables: 'TP = typical price, V = volume',
  },
  {
    name: 'Pivot Point',
    category: 'technical',
    formula: 'PP = (H + L + C) / 3\nR1 = 2×PP − L\nS1 = 2×PP − H',
    description: 'Support and resistance levels derived from previous session OHLC.',
    variables: 'H = prev high, L = prev low, C = prev close',
  },
  {
    name: 'Parabolic SAR',
    category: 'technical',
    formula: 'SAR_next = SAR + AF × (EP − SAR)\nAF starts at 0.02, max 0.20',
    description: 'Trailing stop-and-reverse indicator for trend direction.',
    variables: 'AF = acceleration factor, EP = extreme point',
  },

  // ── VALUATION ───────────────────────────────────────────────────────────────
  {
    name: 'Price-to-Earnings (P/E)',
    category: 'valuation',
    formula: 'P/E = Market Price per Share / EPS',
    description: 'How much investors pay per dollar of earnings.',
    variables: 'EPS = earnings per share',
  },
  {
    name: 'Price-to-Book (P/B)',
    category: 'valuation',
    formula: 'P/B = Market Price per Share / Book Value per Share\nBVPS = (Total Assets − Total Liabilities) / Shares',
    description: 'Compares market value to accounting book value.',
  },
  {
    name: 'Price-to-Sales (P/S)',
    category: 'valuation',
    formula: 'P/S = Market Cap / Annual Revenue',
    description: 'Useful for unprofitable companies or comparison across sectors.',
  },
  {
    name: 'EV/EBITDA',
    category: 'valuation',
    formula: 'EV/EBITDA = Enterprise Value / EBITDA\nEV = Market Cap + Debt − Cash',
    description: 'Capital-structure-neutral valuation multiple.',
  },
  {
    name: 'Enterprise Value (EV)',
    category: 'valuation',
    formula: 'EV = Market Cap + Total Debt + Preferred Stock − Cash − Cash Equivalents',
    description: 'Total theoretical takeover price; more complete than market cap alone.',
  },
  {
    name: 'Dividend Discount Model (DDM)',
    category: 'valuation',
    formula: 'P = D₁ / (r − g)',
    description: 'Intrinsic value based on future dividend payments (Gordon Growth Model).',
    variables: 'D₁ = next dividend, r = required return, g = dividend growth rate',
  },
  {
    name: 'Discounted Cash Flow (DCF)',
    category: 'valuation',
    formula: 'DCF = Σ [FCFₜ / (1 + r)ᵗ] + TV / (1 + r)ⁿ\nTV = FCFₙ × (1 + g) / (r − g)',
    description: 'Intrinsic value from projecting future free cash flows discounted to present.',
    variables: 'FCF = free cash flow, r = discount rate, g = terminal growth, TV = terminal value',
  },
  {
    name: 'Earnings per Share (EPS)',
    category: 'valuation',
    formula: 'EPS = (Net Income − Preferred Dividends) / Weighted Avg Shares Outstanding',
    description: 'Profit attributed to each outstanding share of common stock.',
  },
  {
    name: 'Dividend Yield',
    category: 'valuation',
    formula: 'Dividend Yield = Annual Dividend per Share / Market Price per Share × 100',
    description: 'Return from dividends relative to the current share price.',
  },
  {
    name: 'PEG Ratio',
    category: 'valuation',
    formula: 'PEG = P/E Ratio / Annual EPS Growth Rate',
    description: 'P/E adjusted for growth; PEG < 1 may indicate undervaluation.',
  },

  // ── RISK METRICS ────────────────────────────────────────────────────────────
  {
    name: 'Beta (β)',
    category: 'risk',
    formula: 'β = Cov(rₛ, rₘ) / Var(rₘ)',
    description: 'Sensitivity of a stock\'s returns relative to the market. β>1 = more volatile.',
    variables: 'rₛ = stock return, rₘ = market return',
  },
  {
    name: 'Sharpe Ratio',
    category: 'risk',
    formula: 'Sharpe = (Rₚ − Rᶠ) / σₚ',
    description: 'Risk-adjusted return; higher is better. Measures excess return per unit of risk.',
    variables: 'Rₚ = portfolio return, Rᶠ = risk-free rate, σₚ = std deviation of portfolio',
  },
  {
    name: 'Sortino Ratio',
    category: 'risk',
    formula: 'Sortino = (Rₚ − Rᶠ) / σ_downside',
    description: 'Like Sharpe but penalises only downside volatility.',
    variables: 'σ_downside = std deviation of negative returns only',
  },
  {
    name: 'Value at Risk (VaR)',
    category: 'risk',
    formula: 'VaR(95%) = μ − 1.645 × σ\nVaR(99%) = μ − 2.326 × σ',
    description: 'Maximum expected loss over a period at a given confidence level (parametric).',
    variables: 'μ = mean return, σ = std deviation',
  },
  {
    name: 'Maximum Drawdown (MDD)',
    category: 'risk',
    formula: 'MDD = (Trough Value − Peak Value) / Peak Value × 100',
    description: 'Largest peak-to-trough decline; measures worst-case loss.',
  },
  {
    name: 'Calmar Ratio',
    category: 'risk',
    formula: 'Calmar = Annualised Return / |Maximum Drawdown|',
    description: 'Risk-adjusted return using maximum drawdown as the risk measure.',
  },
  {
    name: 'Information Ratio',
    category: 'risk',
    formula: 'IR = (Rₚ − Rᵦ) / Tracking Error\nTracking Error = σ(Rₚ − Rᵦ)',
    description: 'Active return per unit of active risk vs. a benchmark.',
    variables: 'Rᵦ = benchmark return',
  },
  {
    name: 'Capital Asset Pricing Model (CAPM)',
    category: 'risk',
    formula: 'E(r) = Rᶠ + β × (Rₘ − Rᶠ)',
    description: 'Expected return of an asset given its systematic risk.',
    variables: 'E(r) = expected return, Rₘ − Rᶠ = market risk premium',
  },
  {
    name: 'Standard Deviation (σ)',
    category: 'risk',
    formula: 'σ = √[ Σ(xᵢ − μ)² / (n − 1) ]',
    description: 'Measure of dispersion of returns around the mean; used as volatility proxy.',
  },

  // ── PORTFOLIO ───────────────────────────────────────────────────────────────
  {
    name: 'Portfolio Return',
    category: 'portfolio',
    formula: 'Rₚ = Σ wᵢ × rᵢ',
    description: 'Weighted average of individual asset returns.',
    variables: 'wᵢ = weight of asset i, rᵢ = return of asset i',
  },
  {
    name: 'Portfolio Variance',
    category: 'portfolio',
    formula: 'σₚ² = Σᵢ Σⱼ wᵢ wⱼ Cov(rᵢ, rⱼ)',
    description: 'Captures diversification benefit — correlation between assets matters.',
  },
  {
    name: 'Compound Annual Growth Rate (CAGR)',
    category: 'portfolio',
    formula: 'CAGR = (Ending Value / Beginning Value)^(1/n) − 1',
    description: 'Smoothed annual growth rate over the investment horizon.',
    variables: 'n = number of years',
  },
  {
    name: 'Kelly Criterion',
    category: 'portfolio',
    formula: 'f* = (bp − q) / b\nq = 1 − p',
    description: 'Optimal fraction of capital to risk on a single trade to maximise growth.',
    variables: 'p = win probability, b = net odds (win/loss ratio)',
  },
  {
    name: 'Position Size (Risk-Based)',
    category: 'portfolio',
    formula: 'Shares = (Account × Risk%) / (Entry − Stop)',
    description: 'Number of shares to trade given a fixed dollar risk per trade.',
    variables: 'Risk% = max % of account to risk',
  },
  {
    name: 'Risk-Reward Ratio',
    category: 'portfolio',
    formula: 'R:R = (Target − Entry) / (Entry − Stop)',
    description: 'Ratio of potential profit to potential loss on a trade.',
  },
  {
    name: 'Cost Basis (Avg)',
    category: 'portfolio',
    formula: 'Avg Cost = Total Cost Paid / Total Shares Held',
    description: 'Average price paid per share across multiple purchases.',
  },
  {
    name: 'Return on Investment (ROI)',
    category: 'portfolio',
    formula: 'ROI = (Current Value − Cost Basis) / Cost Basis × 100',
    description: 'Percentage gain or loss relative to the original investment.',
  },

  // ── ACCOUNTING / FUNDAMENTAL ─────────────────────────────────────────────────
  {
    name: 'Gross Profit Margin',
    category: 'accounting',
    formula: 'GPM = (Revenue − COGS) / Revenue × 100',
    description: 'Percentage of revenue remaining after direct production costs.',
    variables: 'COGS = cost of goods sold',
  },
  {
    name: 'Operating Margin',
    category: 'accounting',
    formula: 'Operating Margin = EBIT / Revenue × 100',
    description: 'Earnings from operations as a percentage of revenue.',
    variables: 'EBIT = earnings before interest and taxes',
  },
  {
    name: 'Net Profit Margin',
    category: 'accounting',
    formula: 'NPM = Net Income / Revenue × 100',
    description: 'Bottom-line profit as a percentage of total revenue.',
  },
  {
    name: 'Return on Equity (ROE)',
    category: 'accounting',
    formula: 'ROE = Net Income / Shareholders\' Equity × 100',
    description: 'Profitability generated with shareholders\' capital. Also: ROE = NPM × Asset Turnover × Leverage',
  },
  {
    name: 'Return on Assets (ROA)',
    category: 'accounting',
    formula: 'ROA = Net Income / Total Assets × 100',
    description: 'How efficiently a company uses its assets to generate profit.',
  },
  {
    name: 'Return on Invested Capital (ROIC)',
    category: 'accounting',
    formula: 'ROIC = NOPAT / Invested Capital\nNOPAT = EBIT × (1 − Tax Rate)',
    description: 'After-tax return generated on total invested capital.',
    variables: 'NOPAT = net operating profit after tax',
  },
  {
    name: 'Current Ratio',
    category: 'accounting',
    formula: 'Current Ratio = Current Assets / Current Liabilities',
    description: 'Liquidity measure; >1 means company can cover short-term debts.',
  },
  {
    name: 'Quick Ratio (Acid Test)',
    category: 'accounting',
    formula: 'Quick Ratio = (Current Assets − Inventory) / Current Liabilities',
    description: 'Stricter liquidity measure excluding inventory.',
  },
  {
    name: 'Debt-to-Equity (D/E)',
    category: 'accounting',
    formula: 'D/E = Total Debt / Shareholders\' Equity',
    description: 'Financial leverage ratio; higher D/E = more debt-dependent.',
  },
  {
    name: 'Interest Coverage Ratio',
    category: 'accounting',
    formula: 'ICR = EBIT / Interest Expense',
    description: 'Ability to pay interest on debt. Ratio <1.5 may signal distress.',
  },
  {
    name: 'Free Cash Flow (FCF)',
    category: 'accounting',
    formula: 'FCF = Operating Cash Flow − Capital Expenditures',
    description: 'Cash available to the company after maintaining or expanding its asset base.',
  },
  {
    name: 'EBITDA',
    category: 'accounting',
    formula: 'EBITDA = Net Income + Interest + Taxes + Depreciation + Amortization',
    description: 'Proxy for operating cash flow; removes non-cash and financing charges.',
  },
  {
    name: 'Inventory Turnover',
    category: 'accounting',
    formula: 'Inventory Turnover = COGS / Average Inventory',
    description: 'How many times a company sells and replenishes its inventory per year.',
  },
  {
    name: 'Asset Turnover',
    category: 'accounting',
    formula: 'Asset Turnover = Revenue / Average Total Assets',
    description: 'Revenue generated per dollar of assets; measures efficiency.',
  },
  {
    name: 'Altman Z-Score',
    category: 'accounting',
    formula: 'Z = 1.2×X₁ + 1.4×X₂ + 3.3×X₃ + 0.6×X₄ + 1.0×X₅\nX₁=WC/TA, X₂=RE/TA, X₃=EBIT/TA, X₄=MVE/TL, X₅=S/TA',
    description: 'Bankruptcy probability score. Z<1.81 distress, Z>2.99 safe.',
    variables: 'WC=working capital, TA=total assets, RE=retained earnings, MVE=market value equity, TL=total liabilities, S=sales',
  },

  // ── OPTIONS ─────────────────────────────────────────────────────────────────
  {
    name: 'Black-Scholes Call Price',
    category: 'options',
    formula: 'C = S×N(d₁) − K×e^(−rT)×N(d₂)\nd₁ = [ln(S/K) + (r + σ²/2)T] / (σ√T)\nd₂ = d₁ − σ√T',
    description: 'Theoretical fair price of a European call option.',
    variables: 'S=spot, K=strike, r=risk-free rate, T=time to expiry, σ=implied vol, N=CDF',
  },
  {
    name: 'Put-Call Parity',
    category: 'options',
    formula: 'C + PV(K) = P + S\nPV(K) = K × e^(−rT)',
    description: 'Arbitrage relationship between call price, put price, and underlying.',
  },
  {
    name: 'Delta (Δ)',
    category: 'options',
    formula: 'Δ_call = N(d₁)\nΔ_put = N(d₁) − 1',
    description: 'Rate of change of option price with respect to the underlying price (0 to 1).',
  },
  {
    name: 'Gamma (Γ)',
    category: 'options',
    formula: 'Γ = N\'(d₁) / (S × σ × √T)',
    description: 'Rate of change of Delta; how fast delta moves as the stock price changes.',
    variables: 'N\'(d₁) = standard normal PDF evaluated at d₁',
  },
  {
    name: 'Theta (Θ) – Time Decay',
    category: 'options',
    formula: 'Θ ≈ −(S × N\'(d₁) × σ) / (2√T) − r×K×e^(−rT)×N(d₂)',
    description: 'Rate at which an option loses value per day due to time passing.',
  },
  {
    name: 'Vega (ν)',
    category: 'options',
    formula: 'ν = S × N\'(d₁) × √T',
    description: 'Sensitivity of option price to a 1% change in implied volatility.',
  },
  {
    name: 'Implied Volatility (IV) – approx',
    category: 'options',
    formula: 'IV ≈ (C / S) × √(2π / T)',
    description: 'Market\'s implied expected volatility; derived by inverting Black-Scholes.',
    variables: 'C = market option price, S = spot price, T = time to expiry',
  },

  // ── NEW TECHNICAL ────────────────────────────────────────────────────────────
  {
    name: 'Ichimoku Cloud',
    category: 'technical',
    formula: 'Tenkan-sen = (H₉ + L₉) / 2\nKijun-sen = (H₂₆ + L₂₆) / 2\nSenkou A = (Tenkan + Kijun) / 2\nSenkou B = (H₅₂ + L₅₂) / 2',
    description: 'Multi-component Japanese indicator showing support, resistance, momentum and trend direction.',
    variables: 'H/L = highest/lowest over n periods, values plotted 26 periods ahead',
  },
  {
    name: 'Chaikin Money Flow (CMF)',
    category: 'technical',
    formula: 'MFV = [(C − L) − (H − C)] / (H − L) × V\nCMF = Σ(MFV, n) / Σ(V, n)',
    description: 'Volume-weighted measure of buying and selling pressure over n periods. Positive = accumulation.',
    variables: 'C=close, H=high, L=low, V=volume, n=20 typical',
  },
  {
    name: 'Donchian Channel',
    category: 'technical',
    formula: 'Upper = Highest High over n periods\nLower = Lowest Low over n periods\nMid = (Upper + Lower) / 2',
    description: 'Breakout channel showing n-period price extremes. Breakout above upper = bullish signal.',
    variables: 'n = 20 periods typical',
  },

  // ── NEW VALUATION ────────────────────────────────────────────────────────────
  {
    name: 'Price-to-Free-Cash-Flow (P/FCF)',
    category: 'valuation',
    formula: 'P/FCF = Market Cap / Free Cash Flow\nFCF = Operating CF − CapEx',
    description: 'Values the company based on actual cash generation rather than accounting earnings.',
  },
  {
    name: 'Graham Number',
    category: 'valuation',
    formula: 'Graham Number = √(22.5 × EPS × BVPS)',
    description: 'Benjamin Graham\'s estimate of a stock\'s intrinsic value. Price below this may indicate undervaluation.',
    variables: 'EPS = earnings per share, BVPS = book value per share',
  },
  {
    name: 'Revenue Growth Rate',
    category: 'valuation',
    formula: 'Growth = (Revenue_current − Revenue_prior) / Revenue_prior × 100',
    description: 'Year-over-year or quarter-over-quarter revenue growth; key metric for growth stock valuation.',
  },

  // ── NEW RISK ─────────────────────────────────────────────────────────────────
  {
    name: 'Treynor Ratio',
    category: 'risk',
    formula: 'Treynor = (Rₚ − Rᶠ) / β',
    description: 'Risk-adjusted return using beta (systematic risk) instead of total volatility.',
    variables: 'Rₚ = portfolio return, Rᶠ = risk-free rate, β = portfolio beta',
  },
  {
    name: 'Omega Ratio',
    category: 'risk',
    formula: 'Ω(L) = ∫_L^∞ [1 − F(r)] dr / ∫_{-∞}^L F(r) dr',
    description: 'Ratio of probability-weighted gains above threshold L to probability-weighted losses below L.',
    variables: 'F(r) = return CDF, L = minimum acceptable return threshold',
  },
  {
    name: 'Conditional VaR (CVaR)',
    category: 'risk',
    formula: 'CVaR(α) = E[Loss | Loss > VaR(α)]\nCVaR(95%) ≈ μ − σ × φ(1.645) / 0.05',
    description: 'Expected loss given that the loss exceeds the VaR threshold. Also called Expected Shortfall.',
    variables: 'φ = standard normal PDF, α = confidence level',
  },

  // ── NEW PORTFOLIO ─────────────────────────────────────────────────────────────
  {
    name: 'Rebalancing Drift',
    category: 'portfolio',
    formula: 'Drift = |Current Weight − Target Weight|\nRebalance when Drift > threshold (e.g., 5%)',
    description: 'Measures how far portfolio weights have moved from targets; triggers rebalancing.',
  },
  {
    name: 'Annualised Volatility',
    category: 'portfolio',
    formula: 'σ_annual = σ_daily × √252\nσ_daily = std(daily log returns)',
    description: 'Scales daily return standard deviation to an annual figure assuming 252 trading days.',
  },
  {
    name: 'Tracking Error',
    category: 'portfolio',
    formula: 'TE = σ(Rₚ − Rᵦ)\nTE_annual = TE_daily × √252',
    description: 'Standard deviation of the difference between portfolio and benchmark returns.',
    variables: 'Rᵦ = benchmark return',
  },

  // ── NEW ACCOUNTING ────────────────────────────────────────────────────────────
  {
    name: 'Net Debt',
    category: 'accounting',
    formula: 'Net Debt = Total Debt − Cash & Cash Equivalents',
    description: 'Measures financial leverage net of liquid assets; negative net debt = net cash position.',
  },
  {
    name: 'Days Sales Outstanding (DSO)',
    category: 'accounting',
    formula: 'DSO = (Accounts Receivable / Revenue) × Days\nDays = 365 (annual) or 90 (quarterly)',
    description: 'Average days to collect payment after a sale. Lower DSO indicates faster cash collection.',
  },

  // ── NEW OPTIONS ───────────────────────────────────────────────────────────────
  {
    name: 'Rho (ρ)',
    category: 'options',
    formula: 'ρ_call = K × T × e^(−rT) × N(d₂)\nρ_put = −K × T × e^(−rT) × N(−d₂)',
    description: 'Sensitivity of option price to a 1% change in the risk-free interest rate.',
  },
  {
    name: 'Max Pain (Options)',
    category: 'options',
    formula: 'Max Pain = Strike where total $ loss to option buyers is maximised\nΣ_calls = Σ max(S − Kᵢ, 0) × OI_call\nΣ_puts = Σ max(Kᵢ − S, 0) × OI_put',
    description: 'The price at which the most options expire worthless, often a price magnet near expiry.',
    variables: 'Kᵢ = strike price, OI = open interest, S = settlement price',
  },
]

const CATEGORY_LABELS: Record<FormulaCategory, string> = {
  technical:  'Technical',
  valuation:  'Valuation',
  risk:       'Risk',
  portfolio:  'Portfolio',
  accounting: 'Accounting',
  options:    'Options',
}

const CATEGORY_COLORS: Record<FormulaCategory, string> = {
  technical:  'text-purple-400 border-purple-400/30 bg-purple-400/10',
  valuation:  'text-blue-400 border-blue-400/30 bg-blue-400/10',
  risk:       'text-red-400 border-red-400/30 bg-red-400/10',
  portfolio:  'text-emerald-400 border-emerald-400/30 bg-emerald-400/10',
  accounting: 'text-orange-400 border-orange-400/30 bg-orange-400/10',
  options:    'text-cyan-400 border-cyan-400/30 bg-cyan-400/10',
}

const ALL_CATEGORIES: Array<FormulaCategory | 'all'> = [
  'all', 'technical', 'valuation', 'risk', 'portfolio', 'accounting', 'options',
]

// ── Component ─────────────────────────────────────────────────────────────────

export function FormulasWidget() {
  const [query, setQuery]             = useState('')
  const [activeCategory, setActiveCategory] = useState<FormulaCategory | 'all'>('all')
  const [expanded, setExpanded]       = useState<string | null>(null)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return FORMULAS.filter(f => {
      const matchCat = activeCategory === 'all' || f.category === activeCategory
      if (!matchCat) return false
      if (!q) return true
      return (
        f.name.toLowerCase().includes(q) ||
        f.formula.toLowerCase().includes(q) ||
        f.description.toLowerCase().includes(q)
      )
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
            placeholder={`Search ${FORMULAS.length}+ formulas…`}
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
                    : CATEGORY_COLORS[cat as FormulaCategory]
                  : 'border-border text-muted-foreground hover:text-foreground hover:bg-muted/30',
              )}
            >
              {cat === 'all' ? `All (${FORMULAS.length})` : CATEGORY_LABELS[cat as FormulaCategory]}
            </button>
          ))}
        </div>
      </div>

      {/* Formula list */}
      <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-1">
        {filtered.length === 0 ? (
          <div className="flex items-center justify-center h-20 text-muted-foreground text-xs">
            No formulas match &quot;{query}&quot;
          </div>
        ) : (
          filtered.map(f => {
            const isOpen = expanded === f.name
            return (
              <div
                key={f.name}
                className="border border-border/60 rounded bg-card/30 overflow-hidden"
              >
                <button
                  onClick={() => setExpanded(isOpen ? null : f.name)}
                  className="w-full flex items-center justify-between px-2.5 py-1.5 hover:bg-muted/20 transition-colors text-left gap-2"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={cn(
                      'flex-none px-1.5 py-px rounded border text-[8px] uppercase tracking-wider hidden sm:inline-block',
                      CATEGORY_COLORS[f.category],
                    )}>
                      {CATEGORY_LABELS[f.category]}
                    </span>
                    <span className="font-semibold text-foreground truncate">{f.name}</span>
                  </div>
                  <span className={cn(
                    'flex-none text-muted-foreground text-[10px] transition-transform duration-150',
                    isOpen && 'rotate-180',
                  )}>▾</span>
                </button>
                {isOpen && (
                  <div className="px-2.5 pb-2.5 pt-1 border-t border-border/40 bg-muted/10 space-y-2">
                    {/* Formula block */}
                    <pre className="text-[10px] leading-relaxed text-primary bg-primary/5 border border-primary/20 rounded px-2 py-1.5 overflow-x-auto whitespace-pre-wrap font-mono">
                      {f.formula}
                    </pre>
                    {/* Description */}
                    <p className="text-muted-foreground leading-relaxed text-[10px]">{f.description}</p>
                    {/* Variable legend */}
                    {f.variables && (
                      <p className="text-[9px] text-muted-foreground/70 leading-relaxed">
                        <span className="text-muted-foreground font-semibold">Variables: </span>
                        {f.variables}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>

      {/* Footer */}
      <div className="flex-none px-3 py-1.5 border-t border-border text-[9px] text-muted-foreground flex justify-between">
        <span>Showing {filtered.length} of {FORMULAS.length} formulas</span>
        <span className="text-primary/50">SYMBIOSIS // FORMULAS</span>
      </div>
    </div>
  )
}
