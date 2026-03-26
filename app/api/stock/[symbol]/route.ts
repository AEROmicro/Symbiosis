export const runtime = 'edge';
import { NextResponse } from 'next/server'

function n(v: number | null | undefined, decimals = 2): number {
  if (v == null || isNaN(v)) return 0
  return Number(v.toFixed(decimals))
}

function nOrNull(v: number | null | undefined, decimals = 2): number | null {
  if (v == null || isNaN(v)) return null
  return Number(v.toFixed(decimals))
}

// Fetch comprehensive stock data from Yahoo Finance v7 quote API
async function fetchYahooFinanceData(symbol: string) {
  try {
    const fields = [
      'symbol', 'shortName', 'longName',
      'regularMarketPrice', 'regularMarketChange', 'regularMarketChangePercent',
      'regularMarketDayHigh', 'regularMarketDayLow', 'regularMarketOpen',
      'regularMarketPreviousClose', 'regularMarketVolume',
      'averageDailyVolume3Month',
      'marketCap',
      'fiftyTwoWeekHigh', 'fiftyTwoWeekLow',
      'fiftyDayAverage', 'twoHundredDayAverage',
      'trailingPE', 'forwardPE', 'epsTrailingTwelveMonths',
      'beta', 'trailingAnnualDividendYield', 'trailingAnnualDividendRate',
      'targetMeanPrice',
      'currency', 'fullExchangeName', 'marketState',
    ].join(',')

    const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${encodeURIComponent(symbol)}&fields=${fields}`

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json',
      },
      next: { revalidate: 10 },
    })

    if (!response.ok) return fetchChartData(symbol)

    const data = await response.json()
    const q = data.quoteResponse?.result?.[0]
    if (!q) return fetchChartData(symbol)

    const price = n(q.regularMarketPrice)
    const prevClose = n(q.regularMarketPreviousClose) || price

    return {
      symbol: q.symbol || symbol.toUpperCase(),
      name: q.shortName || q.longName || symbol.toUpperCase(),
      price,
      change: n(q.regularMarketChange),
      // v7 returns changePercent already as a percentage (e.g. 0.11 = 0.11%)
      changePercent: n(q.regularMarketChangePercent),
      high: n(q.regularMarketDayHigh) || price,
      low: n(q.regularMarketDayLow) || price,
      open: n(q.regularMarketOpen) || prevClose,
      previousClose: prevClose,
      volume: q.regularMarketVolume ?? 0,
      avgVolume: q.averageDailyVolume3Month ?? 0,
      marketCap: formatMarketCap(q.marketCap),
      currency: q.currency || 'USD',
      exchange: q.fullExchangeName || 'N/A',
      marketState: q.marketState || 'CLOSED',

      // Extended data — all direct fields, no .raw nesting
      fiftyTwoWeekHigh: n(q.fiftyTwoWeekHigh),
      fiftyTwoWeekLow: n(q.fiftyTwoWeekLow),
      fiftyDayAvg: n(q.fiftyDayAverage),
      twoHundredDayAvg: n(q.twoHundredDayAverage),
      peRatio: nOrNull(q.trailingPE),
      forwardPE: nOrNull(q.forwardPE),
      eps: nOrNull(q.epsTrailingTwelveMonths),
      beta: nOrNull(q.beta),
      // v7 returns dividendYield as a decimal (0.0044 = 0.44%)
      dividendYield: q.trailingAnnualDividendYield ? n(q.trailingAnnualDividendYield * 100) : null,
      dividendRate: nOrNull(q.trailingAnnualDividendRate),
      exDividendDate: null,
      earningsDate: null,
      targetPrice: nOrNull(q.targetMeanPrice),

      lastUpdated: new Date(),
    }
  } catch (error) {
    console.error(`Error fetching data for ${symbol}:`, error)
    return fetchChartData(symbol)
  }
}

// Fallback to chart data (1y range so we can derive 52-week high/low)
async function fetchChartData(symbol: string) {
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=1y`

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json',
      },
      next: { revalidate: 10 },
    })

    if (!response.ok) return null

    const data = await response.json()
    if (!data.chart?.result?.[0]) return null

    const result = data.chart.result[0]
    const meta = result.meta
    const quote = result.indicators?.quote?.[0]

    const price = meta.regularMarketPrice ?? meta.previousClose
    const previousClose = meta.previousClose ?? meta.chartPreviousClose
    const change = price - previousClose
    const changePercent = (change / previousClose) * 100

    // Use last bar for today's intraday values
    const highs: number[] = (quote?.high ?? []).filter((h: number | null) => h != null)
    const lows: number[]  = (quote?.low  ?? []).filter((l: number | null) => l != null)
    const opens: number[] = (quote?.open ?? []).filter((o: number | null) => o != null)
    const todayHigh = highs.slice(-1)[0] ?? price
    const todayLow  = lows.slice(-1)[0]  ?? price
    const todayOpen = opens[0]           ?? previousClose

    const volume = (quote?.volume ?? []).reduce((a: number, b: number | null) => a + (b ?? 0), 0)

    // Derive 52-week high/low from the full 1y history
    const fiftyTwoWeekHigh = highs.length ? n(Math.max(...highs)) : 0
    const fiftyTwoWeekLow  = lows.length  ? n(Math.min(...lows))  : 0

    return {
      symbol: meta.symbol,
      name: meta.shortName || meta.longName || meta.symbol,
      price: n(price),
      change: n(change),
      changePercent: n(changePercent),
      high: n(todayHigh),
      low: n(todayLow),
      open: n(todayOpen),
      previousClose: n(previousClose),
      volume,
      avgVolume: 0,
      marketCap: formatMarketCap(meta.marketCap),
      currency: meta.currency || 'USD',
      exchange: meta.exchangeName || meta.exchange || 'N/A',
      marketState: meta.marketState || 'CLOSED',
      fiftyTwoWeekHigh,
      fiftyTwoWeekLow,
      fiftyDayAvg: 0,
      twoHundredDayAvg: 0,
      peRatio: null,
      forwardPE: null,
      eps: null,
      beta: null,
      dividendYield: null,
      dividendRate: null,
      exDividendDate: null,
      earningsDate: null,
      targetPrice: null,
      lastUpdated: new Date(),
    }
  } catch {
    return null
  }
}

function formatMarketCap(value: number | undefined): string {
  if (!value) return 'N/A'
  if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`
  if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`
  if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`
  return `$${value.toLocaleString()}`
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ symbol: string }> }
) {
  const { symbol } = await params
  const upperSymbol = symbol.toUpperCase().trim()
  
  const stockData = await fetchYahooFinanceData(upperSymbol)
  
  if (!stockData) {
    return NextResponse.json(
      { error: `Unable to fetch data for '${upperSymbol}'. Please check the symbol and try again.` },
      { status: 404 }
    )
  }
  
  return NextResponse.json(stockData)
}
