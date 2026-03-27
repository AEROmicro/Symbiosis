export const runtime = 'edge';
import { NextResponse } from 'next/server'

function n(v: number | null | undefined, decimals = 2): number {
  if (v == null || isNaN(v)) return 0
  return Number(v.toFixed(decimals))
}

async function fetchYahooFinanceData(symbol: string) {
  try {
    const fields = [
      'symbol', 'shortName', 'regularMarketPrice',
      'regularMarketPreviousClose', 'regularMarketOpen',
      'regularMarketDayHigh', 'regularMarketDayLow',
      'regularMarketVolume', 'averageDailyVolume3Month',
      'regularMarketState', 'fullExchangeName', 'currency',
      'marketCap', 'fiftyTwoWeekHigh', 'fiftyTwoWeekLow',
      'fiftyTwoWeekChangePercent', 'fiftyDayAverage',
      'twoHundredDayAverage', 'trailingPE', 'forwardPE',
      'epsTrailingTwelveMonths', 'beta',
      'trailingAnnualDividendYield', 'trailingAnnualDividendRate',
      'dividendDate', 'earningsTimestamp', 'targetMeanPrice',
    ].join(',')

    const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${encodeURIComponent(symbol)}&fields=${fields}`

    const response = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      cache: 'no-store',
    })

    if (!response.ok) return fetchChartData(symbol)

    const data = await response.json()
    const q = data.quoteResponse?.result?.[0]
    if (!q) return fetchChartData(symbol)

    // --- MANUAL CALCULATION BLOCK ---
    // We ignore q.regularMarketChange because Yahoo is sending YTD points instead of Daily points
    const currentPrice = q.regularMarketPrice
    const prevClose = q.regularMarketPreviousClose

    const manualChange = currentPrice - prevClose
    const manualChangePercent = (manualChange / prevClose) * 100
    // --------------------------------

    const marketCapRaw = q.marketCap
    let marketCapStr = 'N/A'
    if (marketCapRaw >= 1e12) marketCapStr = `$${(marketCapRaw / 1e12).toFixed(2)}T`
    else if (marketCapRaw >= 1e9) marketCapStr = `$${(marketCapRaw / 1e9).toFixed(2)}B`
    else if (marketCapRaw >= 1e6) marketCapStr = `$${(marketCapRaw / 1e6).toFixed(2)}M`
    else if (marketCapRaw) marketCapStr = `$${marketCapRaw.toLocaleString()}`

    return {
      symbol: q.symbol || symbol.toUpperCase(),
      name: q.shortName || symbol.toUpperCase(),
      price: n(currentPrice),
      change: n(manualChange),
      changePercent: n(manualChangePercent),
      high: n(q.regularMarketDayHigh),
      low: n(q.regularMarketDayLow),
      open: n(q.regularMarketOpen),
      previousClose: n(q.regularMarketPreviousClose),
      volume: q.regularMarketVolume ?? 0,
      avgVolume: q.averageDailyVolume3Month ?? 0,
      marketCap: marketCapStr,
      currency: q.currency || 'USD',
      exchange: q.fullExchangeName || '',
      marketState: q.marketState || 'CLOSED',
      fiftyTwoWeekHigh: n(q.fiftyTwoWeekHigh),
      fiftyTwoWeekLow: n(q.fiftyTwoWeekLow),
      fiftyTwoWeekChangePercent: q.fiftyTwoWeekChangePercent != null ? n(q.fiftyTwoWeekChangePercent) : null,
      fiftyDayAvg: n(q.fiftyDayAverage),
      twoHundredDayAvg: n(q.twoHundredDayAverage),
      peRatio: q.trailingPE != null ? n(q.trailingPE) : null,
      forwardPE: q.forwardPE != null ? n(q.forwardPE) : null,
      eps: q.epsTrailingTwelveMonths != null ? n(q.epsTrailingTwelveMonths) : null,
      beta: q.beta != null ? n(q.beta) : null,
      dividendYield: q.trailingAnnualDividendYield != null ? n(q.trailingAnnualDividendYield * 100, 4) : null,
      dividendRate: q.trailingAnnualDividendRate != null ? n(q.trailingAnnualDividendRate) : null,
      exDividendDate: q.dividendDate ? new Date(q.dividendDate * 1000).toISOString().split('T')[0] : null,
      earningsDate: q.earningsTimestamp ? new Date(q.earningsTimestamp * 1000).toISOString().split('T')[0] : null,
      targetPrice: q.targetMeanPrice != null ? n(q.targetMeanPrice) : null,
      lastUpdated: new Date(),
    }
  } catch (error) {
    return fetchChartData(symbol)
  }
}

async function fetchChartData(symbol: string) {
  try {
    // 1d interval, 2d range gives us today and yesterday specifically
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=2d`

    const response = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      cache: 'no-store'
    })

    const data = await response.json()
    const meta = data.chart?.result?.[0]?.meta
    if (!meta) return null

    const price = meta.regularMarketPrice
    const prevClose = meta.chartPreviousClose

    return {
      symbol: meta.symbol,
      name: meta.shortName || meta.symbol,
      price: n(price),
      change: n(price - prevClose),
      changePercent: n(((price - prevClose) / prevClose) * 100),
      high: n(meta.regularMarketDayHigh ?? price),
      low: n(meta.regularMarketDayLow ?? price),
      open: n(meta.regularMarketOpen ?? prevClose),
      previousClose: n(prevClose),
      volume: meta.regularMarketVolume ?? 0,
      avgVolume: 0,
      marketCap: 'N/A',
      currency: meta.currency || 'USD',
      exchange: meta.exchangeName || '',
      marketState: meta.marketState || 'CLOSED',
      fiftyTwoWeekHigh: n(meta.fiftyTwoWeekHigh ?? price),
      fiftyTwoWeekLow: n(meta.fiftyTwoWeekLow ?? price),
      fiftyTwoWeekChangePercent: null,
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

export async function GET(request: Request, { params }: { params: Promise<{ symbol: string }> }) {
  const { symbol } = await params
  const stockData = await fetchYahooFinanceData(symbol.toUpperCase().trim())
  if (!stockData) return NextResponse.json({ error: 'Not Found' }, { status: 404 })
  return NextResponse.json(stockData)
}
