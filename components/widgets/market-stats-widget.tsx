'use client'

import { useEffect, useState } from 'react'
import { TrendingUp, TrendingDown, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface MarketIndex {
  symbol: string
  price: number
  change: number
}

interface MarketStats {
  indices: MarketIndex[]
  marketState: string
  lastUpdated: string
}

export function MarketStatsWidget() {
  const [stats, setStats] = useState<MarketStats | null>(null)
  const [loading, setLoading] = useState(false)

  const fetchStats = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/market')
      if (res.ok) setStats(await res.json())
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
    const id = setInterval(fetchStats, 30_000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="p-4 flex flex-col gap-3 h-full">
      {/* Status bar */}
      {stats && (
        <div className="flex items-center justify-between text-xs shrink-0">
          <span className={cn(
            'font-semibold',
            stats.marketState === 'REGULAR' ? 'text-primary' :
            stats.marketState === 'PRE'     ? 'text-yellow-500' :
            stats.marketState === 'POST'    ? 'text-orange-500' : 'text-muted-foreground',
          )}>
            {stats.marketState === 'REGULAR' ? 'OPEN' :
             stats.marketState === 'PRE'     ? 'PRE-MARKET' :
             stats.marketState === 'POST'    ? 'AFTER-HOURS' : 'CLOSED'}
          </span>
          <span className="text-muted-foreground">{new Date(stats.lastUpdated).toLocaleTimeString()}</span>
        </div>
      )}

      {/* Index grid */}
      <div className="flex-1">
        {loading && !stats ? (
          <div className="grid grid-cols-2 gap-2">
            {[...Array(6)].map((_, i) => <div key={i} className="h-16 bg-muted rounded animate-pulse" />)}
          </div>
        ) : stats ? (
          <div className="grid grid-cols-2 gap-2">
            {stats.indices.map((idx) => {
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
                  <div className={cn('flex items-center gap-0.5 mt-0.5', pos ? 'text-primary' : 'text-destructive')}>
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

      <Button variant="outline" size="sm" className="w-full text-xs font-mono shrink-0" onClick={fetchStats} disabled={loading}>
        <RefreshCw className="w-3 h-3" />
        Refresh
      </Button>
    </div>
  )
}
