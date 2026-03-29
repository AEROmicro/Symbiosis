'use client'

import { useEffect } from 'react'
import { RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useMarketData } from '@/hooks/use-market-data'

// Forex pair labels — items whose symbol contains '/' are FX pairs
const isFXPair = (symbol: string) => symbol.includes('/')

// Format price display — JPY pairs are quoted to 2dp, others to 4dp
function formatTickerPrice(symbol: string, price: number): string {
  if (symbol === 'USD/JPY' || symbol === 'USD/CAD' || symbol === 'USD/CHF') {
    return price.toLocaleString('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 3 })
  }
  if (isFXPair(symbol)) {
    return price.toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 4 })
  }
  return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export function MarketTicker({ onMarketStateChange }: { onMarketStateChange?: (state: string) => void }) {
  const { indices, marketState, isLoading, isError, refresh } = useMarketData()

  // Notify parent whenever the market state changes
  useEffect(() => {
    if (onMarketStateChange) onMarketStateChange(marketState)
  }, [marketState, onMarketStateChange])

  if (isLoading && indices.length === 0) {
    return (
      <div className="border-b border-border bg-card/30 py-2 px-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <RefreshCw className="w-3 h-3 animate-spin" />
          <span>Loading market data...</span>
        </div>
      </div>
    )
  }

  if (isError || indices.length === 0) {
    return (
      <div className="border-b border-border bg-card/30 py-2 px-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Market data temporarily unavailable</span>
          <button 
            onClick={() => refresh()}
            className="text-primary hover:text-primary/80 underline"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  // 2 copies for a seamless -50% translateX loop
  const tickerItems = [...indices, ...indices]
  // Scale duration so pixel speed stays consistent regardless of item count (~5s per item)
  const duration = Math.max(40, indices.length * 5)

  return (
    <div className="border-b border-border bg-card/50 overflow-hidden">
      <div
        className="flex w-max whitespace-nowrap py-1.5 hover:[animation-play-state:paused]"
        style={{ animation: `marquee ${duration}s linear infinite` }}
      >
        {tickerItems.map((item, i) => (
          <div 
            key={`${item.symbol}-${i}`} 
            className="flex items-center gap-2 px-4"
          >
            {/* Symbol — FX pairs get a subtle border, equities are plain */}
            <span className={cn(
              "font-bold text-xs tracking-wider text-primary",
              isFXPair(item.symbol) && "px-1 py-0.5 rounded border border-primary/30"
            )}>
              {item.symbol}
            </span>
            {/* Price */}
            <span className="text-foreground text-xs tabular-nums font-medium">
              {formatTickerPrice(item.symbol, item.price)}
            </span>
            {/* Change badge */}
            <span className={cn(
              "inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-semibold tabular-nums",
              item.change >= 0
                ? "bg-primary/15 text-primary"
                : "bg-destructive/15 text-destructive"
            )}>
              {item.change >= 0 ? '▲' : '▼'}
              {item.change >= 0 ? '+' : ''}{item.change.toFixed(2)}%
            </span>
            {/* Separator */}
            <span className="text-border/60 text-xs">·</span>
          </div>
        ))}
      </div>
    </div>
  )
}

