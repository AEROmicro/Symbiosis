'use client'

import { useEffect, useState } from 'react'
import { TrendingUp, TrendingDown, Activity } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
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

export function MarketStatsDialog() {
  const [stats, setStats] = useState<MarketStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (open) {
      fetchStats()
    }
  }, [open])

  const fetchStats = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/market')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch {
      // Silent fail
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start text-xs font-mono"
        >
          <Activity className="w-3 h-3" />
          Market Stats
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl font-mono">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-primary" />
            Market Overview
          </DialogTitle>
          <DialogDescription>
            Real-time indices and market statistics
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {loading ? (
            <div className="grid grid-cols-3 gap-2">
              {[...Array(9)].map((_, i) => (
                <div key={i} className="h-20 bg-muted rounded animate-pulse" />
              ))}
            </div>
          ) : stats ? (
            <>
              <div className="border border-border bg-card/50 rounded-md p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-muted-foreground">Market Status</span>
                  <span className={cn(
                    "text-xs font-semibold",
                    stats.marketState === 'REGULAR' ? "text-primary" :
                    stats.marketState === 'PRE' ? "text-yellow-500" :
                    stats.marketState === 'POST' ? "text-orange-500" :
                    "text-muted-foreground"
                  )}>
                    {stats.marketState === 'REGULAR' ? 'OPEN' :
                     stats.marketState === 'PRE' ? 'PRE-MARKET' :
                     stats.marketState === 'POST' ? 'AFTER-HOURS' :
                     'CLOSED'}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Last updated: {new Date(stats.lastUpdated).toLocaleTimeString()}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {stats.indices.map((index) => {
                  const isPositive = index.change >= 0
                  return (
                    <div
                      key={index.symbol}
                      className={cn(
                        "flex flex-col gap-1 p-3 rounded-md border",
                        isPositive ? "border-primary/20 bg-primary/5" : "border-destructive/20 bg-destructive/5"
                      )}
                    >
                      <div className="font-semibold text-xs text-muted-foreground">{index.symbol}</div>
                      <div className="text-lg font-bold tabular-nums">
                        {index.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                      <div className={cn(
                        "flex items-center gap-1 text-xs font-semibold",
                        isPositive ? "text-primary" : "text-destructive"
                      )}>
                        {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {isPositive ? '+' : ''}{index.change.toFixed(2)}%
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
          ) : (
            <div className="text-center text-muted-foreground p-6">
              Failed to load market data
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
