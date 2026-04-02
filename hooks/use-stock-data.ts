import useSWR from 'swr'
import { useMemo } from 'react'
import type { StockData } from '@/lib/stock-types'
import { resolveExchange, getMarketState, EXCHANGES } from '@/lib/exchanges'

const fetcher = async (url: string) => {
  const res = await fetch(url)
  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.error || 'Failed to fetch stock data')
  }
  return res.json()
}

/**
 * Overrides `change` and `changePercent` on a StockData object to use
 * today's open price as the baseline:
 *
 *   change        = price − open
 *   changePercent = (change / open) × 100
 *
 * Falls back to `previousClose` when open is unavailable (e.g. pre-market).
 */
function applyDayChange(data: StockData): StockData {
  const openBaseline     = data.open > 0 ? data.open : null
  const fallbackBaseline = data.previousClose > 0 ? data.previousClose : null
  const baseline         = openBaseline ?? fallbackBaseline
  if (baseline == null || data.price <= 0) return data

  const change = data.price - baseline
  const changePercent = (change / baseline) * 100

  return {
    ...data,
    change: Number(change.toFixed(2)),
    changePercent: Number(changePercent.toFixed(2)),
  }
}

/**
 * Returns the SWR polling interval for a stock based on its current session.
 *
 *   REGULAR            → openInterval          (user-configured, default 1 s)
 *   PRE / POST         → openInterval × 5      (extended hours, less volatile)
 *   CLOSED (API)       → re-derive from local exchange clock:
 *       if manually PRE/POST  → openInterval × 5
 *       if manually REGULAR   → openInterval
 *       if genuinely CLOSED   → 15 min  (keeps SWR alive so session transitions
 *                                        are picked up without a page refresh)
 *
 * We never return 0: stopping SWR entirely would mean the app stays stale
 * forever when the market reopens while the tab is already open.
 */
function stockRefreshInterval(data: StockData | undefined, openInterval: number): number {
  if (!data) return openInterval
  switch (data.marketState) {
    case 'REGULAR': return openInterval
    case 'PRE':
    case 'POST':    return openInterval * 5
    default: {
      const ex = resolveExchange(data.exchange)
      // Unknown exchange — assume NYSE/US hours so the refresh interval stays
      // active rather than falling back to the 15-minute closed-market cadence.
      const nyseFallback = EXCHANGES.find(e => e.id === 'NYSE')!
      const effectiveEx = ex ?? nyseFallback
      const state = getMarketState(effectiveEx)
      if (state === 'REGULAR')               return openInterval
      if (state === 'PRE' || state === 'POST') return openInterval * 5
      return 15 * 60_000   // genuinely closed — re-check every 15 min
    }
  }
}

export function useStockData(symbol: string | null, openInterval = 60_000) {
  const { data, error, isLoading, mutate } = useSWR<StockData>(
    symbol ? `/api/stock/${symbol}` : null,
    fetcher,
    {
      refreshInterval:   (data) => stockRefreshInterval(data, openInterval),
      revalidateOnFocus: false,
      // Keep deduping short so rapid re-renders don't pile up requests but
      // the 1-second refresh interval still produces real fetches.
      dedupingInterval:  2_000,
      isPaused: () => typeof document !== 'undefined' && document.hidden,
    }
  )

  // Apply open-based calculation so change/changePercent reflect intraday move from today's open.
  const stock = useMemo(() => (data ? applyDayChange(data) : undefined), [data])

  return {
    stock,
    isLoading,
    isError: error,
    refresh: mutate
  }
}

export function useMultipleStocks(symbols: string[], openInterval = 60_000) {
  const { data, error, isLoading, mutate } = useSWR<StockData[]>(
    symbols.length > 0 ? ['stocks', ...symbols] : null,
    async () => {
      const results = await Promise.all(
        symbols.map(async (symbol) => {
          const res = await fetch(`/api/stock/${symbol}`)
          if (!res.ok) return null
          return res.json()
        })
      )
      return results.filter(Boolean) as StockData[]
    },
    {
      refreshInterval: (data) => {
        if (!data || data.length === 0) return openInterval
        const states = data.map((s) => s.marketState)
        if (states.includes('REGULAR'))                          return openInterval
        if (states.some((s) => s === 'PRE' || s === 'POST'))    return openInterval * 5
        // All Yahoo states CLOSED — consult local exchange clocks
        const nyseFallback = EXCHANGES.find(e => e.id === 'NYSE')!
        const manualStates = data.map((s) => {
          const ex = resolveExchange(s.exchange) ?? nyseFallback
          return getMarketState(ex)
        })
        if (manualStates.includes('REGULAR'))                           return openInterval
        if (manualStates.some((s) => s === 'PRE' || s === 'POST'))     return openInterval * 5
        return 15 * 60_000
      },
      revalidateOnFocus: false,
      dedupingInterval:  2_000,
      isPaused: () => typeof document !== 'undefined' && document.hidden,
    }
  )

  return {
    stocks: (data || []).map(applyDayChange),
    isLoading,
    isError: error,
    refresh: mutate
  }
}

