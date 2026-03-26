'use client'

import { useEffect, useState } from 'react'
import { TrendingUp, TrendingDown, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TickerItem {
  symbol: string
  price: number
  change: number
}

interface MarketData {
  indices: TickerItem[]
  marketState: string
  lastUpdated: string
}

export function MarketTicker({ onMarketStateChange }: { onMarketStateChange?: (state: string) => void }) {
  const [items, setItems] = useState<TickerItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const fetchMarketData = async () => {
    try {
      const response = await fetch('/api/market')
      if (!response.ok) throw new Error('Failed to fetch')
      
      const data: MarketData = await response.json()
      setItems(data.indices)
      setError(false)
      
      if (onMarketStateChange) {
        onMarketStateChange(data.marketState)
      }
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMarketData()

    // Refresh every 15 seconds for more frequent market state updates
    const interval = setInterval(fetchMarketData, 15000)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="border-b border-border bg-card/30 py-2 px-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <RefreshCw className="w-3 h-3 animate-spin" />
          <span>Loading market data...</span>
        </div>
      </div>
    )
  }

  if (error || items.length === 0) {
    return (
      <div className="border-b border-border bg-card/30 py-2 px-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Market data temporarily unavailable</span>
          <button 
            onClick={fetchMarketData}
            className="text-primary hover:text-primary/80 underline"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  // Create multiple copies for seamless infinite loop
  const tickerItems = [...items, ...items, ...items, ...items]

  return (
    <div className="border-b border-border bg-card/30 overflow-hidden">
      <div className="flex animate-marquee whitespace-nowrap py-2 hover:[animation-play-state:paused]">
        {tickerItems.map((item, i) => (
          <div 
            key={`${item.symbol}-${i}`} 
            className="flex items-center gap-2 px-4 text-sm"
          >
            <span className="font-medium text-foreground">{item.symbol}</span>
            <span className="text-muted-foreground tabular-nums">
              {item.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className={cn(
              "flex items-center gap-0.5 tabular-nums text-xs",
              item.change >= 0 ? "text-primary" : "text-destructive"
            )}>
              {item.change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {item.change >= 0 ? '+' : ''}{item.change.toFixed(2)}%
            </span>
            <span className="text-border">│</span>
          </div>
        ))}
      </div>
    </div>
  )
}
