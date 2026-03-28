export const runtime = 'edge';
export const dynamic = 'force-static';
import { NextRequest, NextResponse } from 'next/server'

export interface SearchResult {
  symbol: string
  name: string
  exchange: string
  type: string
}

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('q')?.trim()

  if (!query || query.length < 1) {
    return NextResponse.json({ results: [] })
  }

  try {
    const url = `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(query)}&lang=en-US&region=US&quotesCount=8&newsCount=0&enableFuzzyQuery=false&enableCb=false`

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json',
      },
      next: { revalidate: 30 },
    })

    if (!response.ok) {
      return NextResponse.json({ results: [] }, { status: response.status })
    }

    const data = await response.json()
    const quotes: Array<Record<string, string>> = data.quotes ?? []

    const results: SearchResult[] = quotes
      .filter((q) => q.quoteType === 'EQUITY' || q.quoteType === 'ETF' || q.quoteType === 'INDEX' || q.quoteType === 'MUTUALFUND' || q.quoteType === 'CRYPTOCURRENCY')
      .map((q) => ({
        symbol: q.symbol ?? '',
        name: q.shortname || q.longname || (q.symbol ?? ''),
        exchange: q.exchange ?? '',
        type: q.quoteType ?? '',
      }))
      .filter((r) => r.symbol)

    return NextResponse.json({ results })
  } catch {
    return NextResponse.json({ results: [] }, { status: 500 })
  }
}
