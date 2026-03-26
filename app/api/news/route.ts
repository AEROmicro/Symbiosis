import { NextResponse } from 'next/server'

export const runtime = 'edge'

interface NewsArticle {
  title: string
  publisher: string
  link: string
  publishedAt: string
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const symbol = searchParams.get('symbol')

  const query = symbol ? symbol.toUpperCase() : 'stock market'
  const count = 8

  try {
    // Use Yahoo Finance search API which includes news results
    const url = `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(query)}&newsCount=${count}&enableFuzzyQuery=false`
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json',
      },
    })

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch news' }, { status: 502 })
    }

    const data = await response.json()
    const rawNews: Array<{
      title?: string
      publisher?: string
      link?: string
      providerPublishTime?: number
    }> = data.news ?? []

    if (rawNews.length === 0) {
      return NextResponse.json({ articles: [], symbol: symbol ?? null })
    }

    const articles: NewsArticle[] = rawNews.map((item) => {
      const ts = item.providerPublishTime
      const date = ts ? new Date(ts * 1000) : new Date()
      return {
        title: item.title ?? 'No title',
        publisher: item.publisher ?? 'Unknown',
        link: item.link ?? '',
        publishedAt: date.toISOString(),
      }
    })

    return NextResponse.json({ articles, symbol: symbol ?? null })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch news' }, { status: 500 })
  }
}
