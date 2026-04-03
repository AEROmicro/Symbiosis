import { NextRequest, NextResponse } from 'next/server'
import type { PortfolioEntry } from '@/lib/stock-types'

interface AlpacaPosition {
  symbol: string
  qty: string
  avg_entry_price: string
  asset_class: string
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  if (!body) return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })

  const { apiKey, apiSecret, environment } = body as {
    apiKey?: string
    apiSecret?: string
    environment?: 'paper' | 'live'
  }

  if (!apiKey || !apiSecret) {
    return NextResponse.json({ error: 'apiKey and apiSecret are required' }, { status: 400 })
  }

  const baseUrl =
    environment === 'live'
      ? 'https://api.alpaca.markets'
      : 'https://paper-api.alpaca.markets'

  let alpacaRes: Response
  try {
    alpacaRes = await fetch(`${baseUrl}/v2/positions`, {
      headers: {
        'APCA-API-KEY-ID': apiKey,
        'APCA-API-SECRET-KEY': apiSecret,
      },
    })
  } catch {
    return NextResponse.json(
      { error: 'Failed to reach Alpaca API. Check your network connection.' },
      { status: 502 },
    )
  }

  if (!alpacaRes.ok) {
    const text = await alpacaRes.text().catch(() => alpacaRes.statusText)
    return NextResponse.json(
      { error: `Alpaca API error (${alpacaRes.status}): ${text}` },
      { status: alpacaRes.status },
    )
  }

  const positions: AlpacaPosition[] = await alpacaRes.json()

  const entries: Array<PortfolioEntry & { source: string }> = positions.map(pos => ({
    symbol: pos.symbol,
    shares: parseFloat(pos.qty),
    avgPrice: parseFloat(pos.avg_entry_price),
    addedAt: new Date().toISOString(),
    source: 'alpaca',
  }))

  return NextResponse.json(entries)
}
