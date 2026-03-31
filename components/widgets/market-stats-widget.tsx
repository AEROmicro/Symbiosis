'use client'

import { TrendingUp, TrendingDown, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useMarketData } from '@/hooks/use-market-data'

export function MarketStatsWidget() {
  const { marketData, isLoading, refresh } = useMarketData()

  return (
    <div className="p-4 flex flex-col gap-3 h-full">
      {/* Status bar */}
      {marketData && (
        <div className="flex items-center justify-between text-xs shrink-0">
          <span className={cn(
            'font-semibold',
            marketData.marketState === 'REGULAR' ? 'text-primary' :
            marketData.marketState === 'PRE'     ? 'text-yellow-500' :
            marketData.marketState === 'POST'    ? 'text-orange-500' : 'text-muted-foreground',
          )}>
            {marketData.marketState === 'REGULAR' ? 'OPEN' :
             marketData.marketState === 'PRE'     ? 'PRE-MARKET' :
             marketData.marketState === 'POST'    ? 'AFTER-HOURS' : 'CLOSED'}
          </span>
          <span className="text-muted-foreground">{new Date(marketData.lastUpdated).toLocaleTimeString()}</span>
        </div>
      )}

      {/* Index grid */}
      <div className="flex-1 overflow-y-auto">
        {isLoading && !marketData ? (
          <div className="grid grid-cols-2 gap-2">
            {[...Array(6)].map((_, i) => <div key={i} className="h-16 bg-muted rounded animate-pulse" />)}
          </div>
        ) : marketData ? (
          <div className="grid grid-cols-2 gap-2">
            {marketData.indices.map((idx) => {
              const pos = idx.change >= 0
              return (
                <div
                  key={idx.symbol}
                  className={cn(
                    'p-2 rounded border text-xs',
                    pos ? 'border-primary/20 bg-primary/5' : 'border-destructive/20 bg-destructive/5',
                  )}
                >
                  <div className="text-muted-foreground font-semibold truncate">{idx.symbol}</div>
                  <div className="text-sm font-bold tabular-nums mt-0.5">
                    {idx.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <div className={cn('flex items-center gap-0.5 mt-0.5', pos ? 'text-price-up' : 'text-price-down')}>
                    {pos ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {pos ? '+' : ''}{idx.change.toFixed(2)}%
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">Failed to load market data.</p>
        )}
      </div>

      <Button variant="outline" size="sm" className="w-full text-xs font-mono shrink-0" onClick={() => refresh()} disabled={isLoading}>
        <RefreshCw className="w-3 h-3" />
        Refresh
      </Button>
    </div>
  )
}
