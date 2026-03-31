export const runtime = 'edge'
import { NextResponse } from 'next/server'

export interface OptionContract {
  strike: number
  bid: number
  ask: number
  last: number
  volume: number
  openInterest: number
  impliedVolatility: number
  delta: number | null
  inTheMoney: boolean
  expiration: number
}

export interface OptionsChainResponse {
  symbol: string
  currentPrice: number
  expirationDates: number[]
  calls: OptionContract[]
  puts: OptionContract[]
  selectedExpiration: number
}

function mapContract(raw: Record<string, unknown>): OptionContract {
  return {
    strike:            Number(raw.strike)            || 0,
    bid:               Number(raw.bid)               || 0,
    ask:               Number(raw.ask)               || 0,
    last:              Number(raw.lastPrice)         || 0,
    volume:            Number(raw.volume)            || 0,
    openInterest:      Number(raw.openInterest)      || 0,
    impliedVolatility: Number(raw.impliedVolatility) || 0,
    delta:             raw.delta != null ? Number(raw.delta) : null,
    inTheMoney:        Boolean(raw.inTheMoney),
    expiration:        Number(raw.expiration)        || 0,
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ symbol: string }> }
) {
  const { symbol } = await params
  const { searchParams } = new URL(request.url)
  const dateParam = searchParams.get('date')

  try {
    const base = `https://query2.yahoo.com/v7/finance/options/${encodeURIComponent(symbol.toUpperCase())}`
    const url = dateParam ? `${base}?date=${dateParam}` : base

    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      next: { revalidate: 60 },
    })

    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to fetch options' }, { status: res.status })
    }

    const data = await res.json()
    const result = data.optionChain?.result?.[0]
    if (!result) {
      return NextResponse.json({ error: 'No options data' }, { status: 404 })
    }

    const options = result.options?.[0] ?? {}
    const calls: OptionContract[] = (options.calls ?? []).map(mapContract)
    const puts: OptionContract[]  = (options.puts  ?? []).map(mapContract)

    const response: OptionsChainResponse = {
      symbol:              result.underlyingSymbol ?? symbol.toUpperCase(),
      currentPrice:        result.quote?.regularMarketPrice ?? 0,
      expirationDates:     result.expirationDates ?? [],
      calls,
      puts,
      selectedExpiration:  result.expirationDates?.[0] ?? 0,
    }

    return NextResponse.json(response, {
      headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120' },
    })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
