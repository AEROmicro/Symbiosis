'use client'

import useSWR from 'swr'
import type { StockData } from '@/lib/stock-types'

const fetcher = async (url: string) => {
  const res = await fetch(url)
  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.error || 'Failed to fetch stock data')
  }
  return res.json()
}

/**
 * Returns the polling interval for a single stock based on its market state.
 *   REGULAR  → openInterval (default 60 s)
 *   PRE/POST → 3 × openInterval (slower during extended hours)
 *   CLOSED   → 0 (no polling — market is closed for this stock)
 */
function stockRefreshInterval(data: StockData | undefined, openInterval: number): number {
  if (!data) return openInterval
  switch (data.marketState) {
    case 'REGULAR': return openInterval
    case 'PRE':
    case 'POST':    return openInterval * 3
    default:        return 0  // market closed — stop polling
  }
}

export function useStockData(symbol: string | null, openInterval = 60_000) {
  const { data, error, isLoading, mutate } = useSWR<StockData>(
    symbol ? `/api/stock/${symbol}` : null,
    fetcher,
    {
      refreshInterval: (data) => stockRefreshInterval(data, openInterval),
      revalidateOnFocus: false,
      dedupingInterval: 30_000,
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
        // Use the most active market state across all stocks in the batch
        const states = data.map((s) => s.marketState)
        if (states.includes('REGULAR')) return openInterval
        if (states.some((s) => s === 'PRE' || s === 'POST')) return openInterval * 3
        return 0 // all markets closed — stop polling
      },
      revalidateOnFocus: false,
      dedupingInterval: 30_000,
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

