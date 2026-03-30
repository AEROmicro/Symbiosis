import useSWR from 'swr'
import type { StockData } from '@/lib/stock-types'
import { resolveExchange, getMarketState } from '@/lib/exchanges'

const fetcher = async (url: string) => {
  const res = await fetch(url)
  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.error || 'Failed to fetch stock data')
  }
  return res.json()
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
      if (!ex) return 15 * 60_000
      const state = getMarketState(ex)
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

  return {
    stock: data,
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
        const manualStates = data.map((s) => {
          const ex = resolveExchange(s.exchange)
          return ex ? getMarketState(ex) : 'CLOSED'
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
    stocks: data || [],
    isLoading,
    isError: error,
    refresh: mutate
  }
}

