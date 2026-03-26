export interface StockData {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  high: number
  low: number
  open: number
  previousClose: number
  volume: number
  avgVolume: number
  marketCap: string
  currency: string
  exchange: string
  marketState: 'PRE' | 'REGULAR' | 'POST' | 'CLOSED' | string
  
  // Extended data
  fiftyTwoWeekHigh: number
  fiftyTwoWeekLow: number
  fiftyTwoWeekChangePercent: number | null
  fiftyDayAvg: number
  twoHundredDayAvg: number
  peRatio: number | null
  forwardPE: number | null
  eps: number | null
  beta: number | null
  dividendYield: number | null
  dividendRate: number | null
  exDividendDate: string | null
  earningsDate: string | null
  targetPrice: number | null
  
  lastUpdated: Date
}

export interface TerminalLog {
  id: string
  timestamp: Date
  type: 'info' | 'success' | 'error' | 'warning' | 'system'
  message: string
  showTimestamp?: boolean
}

export interface ChartDataPoint {
  time: number
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export interface PortfolioEntry {
  symbol: string
  shares: number
  avgPrice: number
  addedAt: string // ISO date string
}

// Popular stocks for quick add buttons
export const POPULAR_STOCKS = [
  'AAPL', 'GOOGL', 'MSFT', 'AMZN', 'TSLA', 'META', 'NVDA', 'AMD'
]
