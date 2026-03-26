export const runtime = 'edge';
import { NextResponse } from 'next/server'

// Market indices and their Yahoo Finance symbols
const MARKET_SYMBOLS = {
  'S&P 500': '^GSPC',
  'NASDAQ': '^IXIC',
  'DOW': '^DJI',
  'Russell 2000': '^RUT',
  'BTC': 'BTC-USD',
  'ETH': 'ETH-USD',
  'GOLD': 'GC=F',
  'OIL': 'CL=F',
  'VIX': '^VIX',
  '10Y Yield': '^TNX',
  '30Y Yield': '^TYX',
  'EUR/USD': 'EURUSD=X',
  'GBP/USD': 'GBPUSD=X',
  'USD/JPY': 'USDJPY=X',
  'USD/CAD': 'USDCAD=X',
  'AUD/USD': 'AUDUSD=X',
  'USD/CHF': 'USDCHF=X',
}

async function fetchMarketData(name: string, symbol: string) {
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=1d`
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      next: { revalidate: 5 }
    })

    if (!response.ok) return null

    const data = await response.json()
    const result = data.chart?.result?.[0]
    if (!result) return null

    const meta = result.meta
    const price = meta.regularMarketPrice ?? meta.previousClose
    const previousClose = meta.previousClose ?? meta.chartPreviousClose
    const change = ((price - previousClose) / previousClose) * 100

    return {
      symbol: name,
      price: Number(price.toFixed(2)),
      change: Number(change.toFixed(2)),
      marketState: meta.marketState
    }
  } catch {
    return null
  }
}

export async function GET() {
  const results = await Promise.all(
    Object.entries(MARKET_SYMBOLS).map(([name, symbol]) => 
      fetchMarketData(name, symbol)
    )
  )

  const marketData = results.filter(Boolean)
  
  // Get market state from S&P 500
  const spData = marketData.find(d => d?.symbol === 'S&P 500')
  const marketState = spData?.marketState || 'CLOSED'

  return NextResponse.json({
    indices: marketData,
    marketState,
    lastUpdated: new Date()
  })
}
