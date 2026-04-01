'use client'

import { useMemo, useState, useEffect } from 'react'
import { useMultipleStocks } from '@/hooks/use-stock-data'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { cn, getCurrencySymbol } from '@/lib/utils'
import { resolveExchange, getMarketState, EXCHANGES } from '@/lib/exchanges'
import type { StockData } from '@/lib/stock-types'

interface WatchlistCompactProps {
  watchedStocks: string[]
  selectedStock: string | null
  onSelectStock: (symbol: string) => void
  refreshInterval?: number
}

/** Derive the effective session-aware price / change for a single stock. */
function effectiveValues(stock: StockData) {
  const ex    = resolveExchange(stock.exchange) ?? EXCHANGES.find(e => e.id === 'NYSE')!
  const state = getMarketState(ex)

  const price =
    state === 'PRE'  && stock.preMarketPrice  != null ? stock.preMarketPrice  :
    state === 'POST' && stock.postMarketPrice != null ? stock.postMarketPrice :
    stock.price

  const pct =
    state === 'PRE'  && stock.preMarketChangePercent  != null ? stock.preMarketChangePercent  :
    state === 'POST' && stock.postMarketChangePercent != null ? stock.postMarketChangePercent :
    stock.changePercent

  return { price, pct, state }
}

export function WatchlistCompactWidget({
  watchedStocks,
  selectedStock,
  onSelectStock,
  refreshInterval = 3000,
}: WatchlistCompactProps) {
  const { stocks, isLoading } = useMultipleStocks(watchedStocks, refreshInterval)

  // 60-second tick so state badges stay accurate between API polls
  const [tick, setTick] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 60_000)
    return () => clearInterval(id)
  }, [])

  const rows = useMemo(() => {
    return watchedStocks.map(sym => {
      const stock = stocks.find(s => s.symbol === sym)
      if (!stock) return { sym, stock: null, price: null, pct: null, state: null }
      const { price, pct, state } = effectiveValues(stock)
      return { sym, stock, price, pct, state }
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stocks, watchedStocks, tick])

  if (watchedStocks.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground text-xs p-4 text-center">
        No stocks in watchlist. Add symbols from the toolbar above.
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full overflow-auto">
      {/* Header */}
      <div className="grid grid-cols-[1fr_auto_auto] gap-x-3 px-3 pt-2.5 pb-1 text-[9px] uppercase tracking-widest text-muted-foreground font-mono border-b border-border/50 shrink-0">
        <span>Symbol</span>
        <span className="text-right">Price</span>
        <span className="text-right">Chg 1D</span>
      </div>

      {/* Rows */}
      <div className="flex-1 overflow-y-auto divide-y divide-border/30">
        {rows.map(({ sym, stock, price, pct, state }) => {
          const isSelected = sym === selectedStock
          const isPos      = (pct ?? 0) >= 0
          const sym_       = getCurrencySymbol(stock?.currency)

          return (
            <button
              key={sym}
              onClick={() => onSelectStock(sym)}
              className={cn(
                'w-full grid grid-cols-[1fr_auto_auto] gap-x-3 px-3 py-2 text-left',
                'transition-colors hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
                isSelected && 'bg-primary/10 border-l-2 border-primary pl-[10px]',
              )}
            >
              {/* Symbol + session badge */}
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="text-[11px] font-bold font-mono text-foreground truncate">{sym}</span>
                {state === 'PRE' && (
                  <span className="text-[7px] font-bold px-1 rounded border text-yellow-400 border-yellow-400/30 bg-yellow-400/10 shrink-0">PRE</span>
                )}
                {state === 'POST' && (
                  <span className="text-[7px] font-bold px-1 rounded border text-orange-400 border-orange-400/30 bg-orange-400/10 shrink-0">AH</span>
                )}
                {state === 'REGULAR' && (
                  <span className="text-[7px] font-bold px-1 rounded border text-emerald-400 border-emerald-400/30 bg-emerald-400/10 shrink-0">●</span>
                )}
              </div>

              {/* Price */}
              <span className="text-[11px] font-mono tabular-nums text-right text-foreground">
                {isLoading || price == null
                  ? <span className="text-muted-foreground">—</span>
                  : `${sym_}${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                }
              </span>

              {/* Change % */}
              <span className={cn(
                'text-[11px] font-mono tabular-nums text-right flex items-center justify-end gap-0.5',
                isLoading || pct == null
                  ? 'text-muted-foreground'
                  : isPos ? 'text-emerald-400' : 'text-red-400',
              )}>
                {isLoading || pct == null ? '—' : (
                  <>
                    {isPos
                      ? <TrendingUp className="w-2.5 h-2.5" />
                      : <TrendingDown className="w-2.5 h-2.5" />
                    }
                    {isPos ? '+' : ''}{pct.toFixed(2)}%
                  </>
                )}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
