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
      'regularMarketPreviousClose', 'regularMarketState'
    ].join(',')

    const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${encodeURIComponent(symbol)}&fields=${fields}`

    const response = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      cache: 'no-store', // FORCE Cloudflare to ignore cache for this test
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

    return {
      symbol: q.symbol || symbol.toUpperCase(),
      name: q.shortName || symbol.toUpperCase(),
      price: n(currentPrice),
      change: n(manualChange),           // Our calculated daily points
      changePercent: n(manualChangePercent), // Our calculated daily %
      marketState: q.marketState || 'CLOSED',
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
      marketState: meta.marketState || 'CLOSED',
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
