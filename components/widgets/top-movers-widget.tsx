'use client'

import { useEffect, useState } from 'react'
import { TrendingUp, TrendingDown, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Mover {
  symbol: string
  price: number
  change: number
}

interface MarketData {
  indices: Mover[]
}

export function TopMoversWidget() {
  const [gainers, setGainers]       = useState<Mover[]>([])
  const [losers, setLosers]         = useState<Mover[]>([])
  const [loading, setLoading]       = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/market')
      if (!res.ok) throw new Error('fetch failed')
      const data: MarketData = await res.json()
      const sorted = [...data.indices].sort((a, b) => b.change - a.change)
      setGainers(sorted.filter(d => d.change > 0).slice(0, 4))
      setLosers([...sorted].reverse().filter(d => d.change < 0).slice(0, 4))
      setLastUpdated(new Date())
    } catch {
      // silent fail — stale data remains
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    const id = setInterval(fetchData, 30_000)
    return () => clearInterval(id)
  }, [])

  const MoverRow = ({ item, positive }: { item: Mover; positive: boolean }) => (
    <div className={cn(
      'flex items-center justify-between px-2 py-1.5 rounded text-xs border',
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

  if (loading && gainers.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <RefreshCw className="w-4 h-4 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="p-3 h-full flex flex-col gap-3 overflow-y-auto">
      {/* Gainers */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-1.5 text-xs text-primary font-mono font-semibold shrink-0">
          <TrendingUp className="w-3 h-3" />
          Top Gainers
        </div>
        {gainers.length === 0
          ? <p className="text-xs text-muted-foreground font-mono">No gainers found</p>
          : gainers.map(g => <MoverRow key={g.symbol} item={g} positive={true} />)
        }
      </div>

      {/* Losers */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-1.5 text-xs text-destructive font-mono font-semibold shrink-0">
          <TrendingDown className="w-3 h-3" />
          Top Losers
        </div>
        {losers.length === 0
          ? <p className="text-xs text-muted-foreground font-mono">No losers found</p>
          : losers.map(l => <MoverRow key={l.symbol} item={l} positive={false} />)
        }
      </div>

      {/* Footer */}
      {lastUpdated && (
        <div className="mt-auto flex items-center justify-between text-[10px] text-muted-foreground font-mono pt-1 border-t border-border shrink-0">
          <span>Updated {lastUpdated.toLocaleTimeString()}</span>
          <button
            onClick={fetchData}
            disabled={loading}
            className="hover:text-foreground transition-colors"
            aria-label="Refresh top movers"
          >
            <RefreshCw className={cn('w-3 h-3', loading && 'animate-spin')} />
          </button>
        </div>
      )}
    </div>
  )
}
