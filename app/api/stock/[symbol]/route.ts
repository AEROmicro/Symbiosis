import { NextResponse } from 'next/server'

// Fetch comprehensive stock data from Yahoo Finance
async function fetchYahooFinanceData(symbol: string) {
  try {
    // Fetch quote data for more details
    const quoteUrl = `https://query1.finance.yahoo.com/v10/finance/quoteSummary/${encodeURIComponent(symbol)}?modules=price,summaryDetail,defaultKeyStatistics`
    
    const quoteResponse = await fetch(quoteUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      next: { revalidate: 10 }
    })

    if (!quoteResponse.ok) {
      // Fallback to chart API
      return fetchChartData(symbol)
    }

    const quoteData = await quoteResponse.json()
    const result = quoteData.quoteSummary?.result?.[0]
    
    if (!result) {
      return fetchChartData(symbol)
    }

    const price = result.price || {}
    const summary = result.summaryDetail || {}
    const keyStats = result.defaultKeyStatistics || {}

    const currentPrice = price.regularMarketPrice?.raw ?? price.preMarketPrice?.raw ?? 0
    const previousClose = price.regularMarketPreviousClose?.raw ?? currentPrice
    const change = price.regularMarketChange?.raw ?? 0
    const changePercent = price.regularMarketChangePercent?.raw ?? 0

    return {
      symbol: price.symbol || symbol.toUpperCase(),
      name: price.shortName || price.longName || symbol.toUpperCase(),
      price: Number(currentPrice.toFixed(2)),
      change: Number(change.toFixed(2)),
      changePercent: Number((changePercent * 100).toFixed(2)),
      high: Number((price.regularMarketDayHigh?.raw ?? currentPrice).toFixed(2)),
      low: Number((price.regularMarketDayLow?.raw ?? currentPrice).toFixed(2)),
      open: Number((price.regularMarketOpen?.raw ?? previousClose).toFixed(2)),
      previousClose: Number(previousClose.toFixed(2)),
      volume: price.regularMarketVolume?.raw ?? 0,
      avgVolume: summary.averageVolume?.raw ?? 0,
      marketCap: formatMarketCap(price.marketCap?.raw),
      currency: price.currency || 'USD',
      exchange: price.exchangeName || price.exchange || 'N/A',
      marketState: price.marketState || 'CLOSED',
      
      // Extended data
      fiftyTwoWeekHigh: Number((summary.fiftyTwoWeekHigh?.raw ?? 0).toFixed(2)),
      fiftyTwoWeekLow: Number((summary.fiftyTwoWeekLow?.raw ?? 0).toFixed(2)),
      fiftyDayAvg: Number((summary.fiftyDayAverage?.raw ?? 0).toFixed(2)),
      twoHundredDayAvg: Number((summary.twoHundredDayAverage?.raw ?? 0).toFixed(2)),
      peRatio: summary.trailingPE?.raw ? Number(summary.trailingPE.raw.toFixed(2)) : null,
      forwardPE: summary.forwardPE?.raw ? Number(summary.forwardPE.raw.toFixed(2)) : null,
      eps: keyStats.trailingEps?.raw ? Number(keyStats.trailingEps.raw.toFixed(2)) : null,
      beta: summary.beta?.raw ? Number(summary.beta.raw.toFixed(2)) : null,
      dividendYield: summary.dividendYield?.raw ? Number((summary.dividendYield.raw * 100).toFixed(2)) : null,
      dividendRate: summary.dividendRate?.raw ? Number(summary.dividendRate.raw.toFixed(2)) : null,
      exDividendDate: summary.exDividendDate?.fmt || null,
      earningsDate: keyStats.nextFundamentalDataDate?.fmt || null,
      targetPrice: summary.targetMeanPrice?.raw ? Number(summary.targetMeanPrice.raw.toFixed(2)) : null,
      
      lastUpdated: new Date()
    }
  } catch (error) {
    console.error(`Error fetching data for ${symbol}:`, error)
    return fetchChartData(symbol)
  }
}

// Fallback to chart data
async function fetchChartData(symbol: string) {
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=1d`
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      next: { revalidate: 10 }
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

    const todayHigh = quote?.high?.filter((h: number | null) => h !== null).slice(-1)[0] ?? price
    const todayLow = quote?.low?.filter((l: number | null) => l !== null).slice(-1)[0] ?? price
    const todayOpen = quote?.open?.filter((o: number | null) => o !== null)[0] ?? previousClose
    const volume = quote?.volume?.reduce((a: number, b: number | null) => a + (b ?? 0), 0) ?? 0

    return {
      symbol: meta.symbol,
      name: meta.shortName || meta.longName || meta.symbol,
      price: Number(price.toFixed(2)),
      change: Number(change.toFixed(2)),
      changePercent: Number(changePercent.toFixed(2)),
      high: Number(todayHigh.toFixed(2)),
      low: Number(todayLow.toFixed(2)),
      open: Number(todayOpen.toFixed(2)),
      previousClose: Number(previousClose.toFixed(2)),
      volume: volume,
      avgVolume: 0,
      marketCap: formatMarketCap(meta.marketCap),
      currency: meta.currency || 'USD',
      exchange: meta.exchangeName || meta.exchange,
      marketState: meta.marketState,
      fiftyTwoWeekHigh: 0,
      fiftyTwoWeekLow: 0,
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
      lastUpdated: new Date()
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
