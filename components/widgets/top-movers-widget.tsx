'use client'

import { useState } from 'react'
import { TrendingUp, TrendingDown, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useMarketData } from '@/hooks/use-market-data'

interface Mover {
  symbol: string
  price: number
  change: number
}

export function TopMoversWidget() {
  const { indices, isLoading, refresh } = useMarketData()

  const sorted   = [...indices].sort((a, b) => b.change - a.change)
  const gainers  = sorted.filter(d => d.change > 0).slice(0, 4)
  const losers   = [...sorted].reverse().filter(d => d.change < 0).slice(0, 4)

  const MoverRow = ({ item, positive }: { item: Mover; positive: boolean }) => (
    <div className={cn(
      'flex flex-1 items-center justify-between px-2 rounded text-xs border',
      positive
        ? 'bg-primary/5 border-primary/15'
        : 'bg-destructive/5 border-destructive/15',
    )}>
      <div className="flex items-center gap-1.5 min-w-0">
        {positive
          ? <TrendingUp   className="w-3 h-3 text-primary shrink-0" />
          : <TrendingDown className="w-3 h-3 text-destructive shrink-0" />}
        <span className="font-semibold font-mono truncate">{item.symbol}</span>
      </div>
      <div className="text-right shrink-0 ml-2">
        <div className="tabular-nums font-mono text-foreground text-[11px]">
          {item.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
        <div className={cn('text-[10px] font-semibold tabular-nums', positive ? 'text-primary' : 'text-destructive')}>
          {positive ? '+' : ''}{item.change.toFixed(2)}%
        </div>
      </div>
    </div>
  )

  if (isLoading && indices.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <RefreshCw className="w-4 h-4 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="p-3 h-full flex flex-col gap-2 overflow-hidden">
      {/* Gainers */}
      <div className="flex flex-col flex-1 gap-1.5 min-h-0">
        <div className="flex items-center gap-1.5 text-xs text-primary font-mono font-semibold shrink-0">
          <TrendingUp className="w-3 h-3" />
          Top Gainers
        </div>
        <div className="flex flex-col flex-1 gap-1.5 min-h-0">
          {gainers.length === 0
            ? <p className="text-xs text-muted-foreground font-mono">No gainers found</p>
            : gainers.map(g => <MoverRow key={g.symbol} item={g} positive={true} />)
          }
        </div>
      </div>

      {/* Losers */}
      <div className="flex flex-col flex-1 gap-1.5 min-h-0">
        <div className="flex items-center gap-1.5 text-xs text-destructive font-mono font-semibold shrink-0">
          <TrendingDown className="w-3 h-3" />
          Top Losers
        </div>
        <div className="flex flex-col flex-1 gap-1.5 min-h-0">
          {losers.length === 0
            ? <p className="text-xs text-muted-foreground font-mono">No losers found</p>
            : losers.map(l => <MoverRow key={l.symbol} item={l} positive={false} />)
          }
        </div>
      </div>

      {/* Footer */}
      <div className="mt-auto flex items-center justify-end pt-1 border-t border-border shrink-0">
        <button
          onClick={() => refresh()}
          disabled={isLoading}
          className="text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Refresh top movers"
        >
          <RefreshCw className={cn('w-3 h-3', isLoading && 'animate-spin')} />
        </button>
      </div>
    </div>
  )
}

