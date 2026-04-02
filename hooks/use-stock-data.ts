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

// ---------------------------------------------------------------------------
// Day-open cache
// ---------------------------------------------------------------------------
// Maps symbol → { date: string (YYYY-MM-DD), open: number }.
// The open price is fixed for the entire trading day, so we cache it here to:
//   1. Provide a stable change-calculation baseline across every poll cycle.
//   2. Preserve the day's open after market close so the final intraday change
//      is always computed correctly even if Yahoo returns open=0 later.
//   3. Auto-expire on a new calendar date so yesterday's open is never
//      accidentally used for the next trading day.
// ---------------------------------------------------------------------------
const dayOpenCache = new Map<string, { date: string; open: number }>()

// Use Eastern Time to derive the trading date. This avoids the UTC-midnight
// rollover at 7 PM ET (during after-hours trading), ensuring the cached open
// stays valid for the entire trading session including pre- and after-hours.
function getTradingDate(): string {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date()).split('/').reverse().join('-') // → YYYY-MM-DD
}

/**
 * Returns the best open price for a symbol for today:
 * - If Yahoo returned a valid open (> 0), cache and return it.
 * - Otherwise fall back to today's cached value (covers after-hours / pre-market
 *   polls where regularMarketOpen temporarily becomes 0).
 * - If nothing is cached for today, return the raw value from the API.
 */
function getCachedOpen(symbol: string, freshOpen: number): number {
  const today = getTradingDate()
  const cached = dayOpenCache.get(symbol)

  if (freshOpen > 0) {
    // Always refresh the cache with a valid value from the API.
    dayOpenCache.set(symbol, { date: today, open: freshOpen })
    return freshOpen
  }

  // Fresh open is 0 / invalid — use today's cached value when available.
  if (cached && cached.date === today && cached.open > 0) {
    return cached.open
  }

  return freshOpen // nothing useful cached; surface the API value as-is
}

/**
 * Overrides `change` and `changePercent` on a StockData object to use the
 * cached daily open as the baseline, guaranteeing consistency:
 *   - During REGULAR hours: same open used on every poll → no drift.
 *   - At close: closing price – open = full intraday change.
 *   - `data.open` is also updated to the cached value so the "Open" stat in
 *     the UI always reflects the true day open, even if Yahoo briefly returns
 *     0 between sessions.
 *   - Pre/post market: `stock.change` falls back to 0 when open=0 but that
 *     field is unused by the UI (it displays preMarketChange / postMarketChange
 *     instead), so the fallback is harmless.
 */
function applyDayOpen(data: StockData): StockData {
  const cachedOpen = getCachedOpen(data.symbol, data.open)
  if (cachedOpen <= 0 || data.price <= 0) return data

  const change = data.price - cachedOpen
  const changePercent = (change / cachedOpen) * 100

  return {
    ...data,
    open: cachedOpen,
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

  // Apply cached day-open so change/changePercent are stable across every poll.
  const stock = useMemo(() => (data ? applyDayOpen(data) : undefined), [data])

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
    stocks: (data || []).map(applyDayOpen),
    isLoading,
    isError: error,
    refresh: mutate
  }
}

