export const runtime = 'edge';
export const dynamic = 'force-static';
export function generateStaticParams() { return [] }
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ symbol: string }> }
) {
  const { symbol } = await params
  const { searchParams } = new URL(request.url)
  const range = searchParams.get('range') || '1d'
  
  // Determine interval based on range
  const intervalMap: Record<string, string> = {
    '1d': '5m',
    '5d': '15m',
    '1mo': '1h',
    '3mo': '1d',
    '6mo': '1d',
    '1y': '1d',
    '5y': '1wk',
    'max': '1mo'
  }
  
  const interval = intervalMap[range] || '5m'
  
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=${interval}&range=${range}`
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      next: { revalidate: range === '1d' ? 60 : 300 }
    })

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch chart data' }, { status: 404 })
    }

    const data = await response.json()
    const result = data.chart?.result?.[0]
    
    if (!result) {
      return NextResponse.json({ error: 'No chart data available' }, { status: 404 })
    }

    const timestamps = result.timestamp || []
    const quote = result.indicators?.quote?.[0] || {}
    
    const rawData = timestamps.map((ts: number, i: number) => ({
      time: ts * 1000,
      open: quote.open?.[i] ?? null,
      high: quote.high?.[i] ?? null,
      low: quote.low?.[i] ?? null,
      close: quote.close?.[i] ?? null,
      volume: quote.volume?.[i] ?? null,
    })).filter((d: { close: number | null }) => d.close !== null)

    // Deduplicate by timestamp (Yahoo Finance can return duplicate timestamps)
    const seenTimes = new Set<number>()
    const chartData = rawData.filter((d: { time: number }) => {
      if (seenTimes.has(d.time)) return false
      seenTimes.add(d.time)
      return true
    })

    return NextResponse.json({
      symbol: result.meta.symbol,
      range,
      interval,
      data: chartData,
      previousClose: result.meta.previousClose,
      currentPrice: result.meta.regularMarketPrice
    })
  } catch (error) {
    console.error('Chart fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch chart data' }, { status: 500 })
  }
}
