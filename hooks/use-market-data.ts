'use client'

import useSWR from 'swr'

export interface MarketIndex {
  symbol: string
  price: number
  change: number
  marketState?: string
}

export interface MarketData {
  indices: MarketIndex[]
  marketState: string
  lastUpdated: string
}

const fetcher = (url: string) => fetch(url).then((r) => r.json())

/** Returns ms until the next likely market open (9:30 ET), capped at 4 hours. */
function msUntilNextOpen(): number {
  const now = new Date()
  // Convert to Eastern Time offset (ET = UTC-5 or UTC-4 during DST)
  const etOffset = isDST(now) ? -4 : -5
  const etNow = new Date(now.getTime() + etOffset * 3600 * 1000)
  const etHour = etNow.getUTCHours() + etNow.getUTCMinutes() / 60

  // Pre-market starts at 4:00 ET — check back then at the latest
  const nextCheckHour = etHour < 4 ? 4 : etHour < 9.5 ? 9.5 : 16
  const msLeft = (nextCheckHour - etHour) * 3600 * 1000
  // Clamp between 5 minutes and 4 hours
  return Math.min(Math.max(msLeft, 5 * 60 * 1000), 4 * 60 * 60 * 1000)
}

function isDST(date: Date): boolean {
  const jan = new Date(date.getFullYear(), 0, 1).getTimezoneOffset()
  const jul = new Date(date.getFullYear(), 6, 1).getTimezoneOffset()
  return date.getTimezoneOffset() < Math.max(jan, jul)
}

/**
 * Shared hook for /api/market data.
 * All components that call this hook share a single in-flight request (SWR deduplication).
 * Refresh rate adapts to market state:
 *   REGULAR  → every 60 s
 *   PRE/POST → every 3 min
 *   CLOSED   → smart back-off until next likely open
 */
export function useMarketData() {
  const { data, error, isLoading, isValidating, mutate } = useSWR<MarketData>(
    '/api/market',
    fetcher,
    {
      refreshInterval: (data) => {
        if (!data) return 60_000
        switch (data.marketState) {
          case 'REGULAR': return 60_000        // 1 min while open
          case 'PRE':
          case 'POST':    return 3 * 60_000    // 3 min pre/after-hours
          default:        return msUntilNextOpen() // smart back-off when closed
        }
      },
      revalidateOnFocus: false,
      dedupingInterval: 30_000,
      isPaused: () => typeof document !== 'undefined' && document.hidden,
    }
  )

  return {
    marketData: data ?? null,
    marketState: data?.marketState ?? 'CLOSED',
    indices: data?.indices ?? [],
    isLoading,
    isValidating,
    isError: !!error,
    refresh: mutate,
  }
}
