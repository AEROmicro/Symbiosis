'use client'

import { useState } from 'react'
import { useStockData } from '@/hooks/use-stock-data'
import { PriceChart } from '@/components/price-chart'
import { FullscreenChart } from '@/components/fullscreen-chart'
import { TrendingUp, TrendingDown, Activity, BarChart3, DollarSign, Clock } from 'lucide-react'
import { cn, getCurrencySymbol } from '@/lib/utils'

interface StockDetailProps {
  symbol: string
  refreshInterval?: number
}

export function StockDetail({ symbol, refreshInterval = 15000 }: StockDetailProps) {
  const { stock, isLoading } = useStockData(symbol, refreshInterval)
  const [fullscreenOpen, setFullscreenOpen] = useState(false)

  if (isLoading) {
    return (
      <div className="flex flex-col h-full space-y-2 p-2">
        <div className="flex-none border border-border bg-card rounded-md p-4 animate-pulse">
          <div className="h-6 w-24 bg-muted rounded mb-3" />
          <div className="h-10 w-32 bg-muted rounded" />
        </div>
        <div className="flex-1 bg-muted rounded-md animate-pulse" />
      </div>
    )
  }

  if (!stock) {
    return (
      <div className="flex items-center justify-center h-full border border-border bg-card rounded-md p-6 text-center">
        <p className="text-muted-foreground">Select a stock to view details</p>
      </div>
    )
  }

  const isPositive = stock.change >= 0
  const sym = getCurrencySymbol(stock.currency)

  const coreStats = [
    { label: 'Open',      value: `${sym}${stock.open.toFixed(2)}`,         icon: Clock },
    { label: 'Prev Close',value: `${sym}${stock.previousClose.toFixed(2)}`,icon: DollarSign },
    { label: 'Day High',  value: `${sym}${stock.high.toFixed(2)}`,         icon: TrendingUp },
    { label: 'Day Low',   value: `${sym}${stock.low.toFixed(2)}`,          icon: TrendingDown },
    { label: 'Volume',    value: formatNumber(stock.volume),                icon: BarChart3 },
    { label: 'Avg Volume',value: formatNumber(stock.avgVolume),             icon: Activity },
  ]

  return (
    <div className="flex flex-col h-full w-full overflow-hidden space-y-2">
      
      <div className="flex-none border border-border bg-card rounded-md overflow-hidden">
        
        {/* Header Card */}
        <div className="p-3 border-b border-border">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-3">
              <span className="text-xl font-bold text-foreground">{stock.symbol}</span>
              <span className={cn(
                "px-2 py-0.5 text-[10px] font-bold tracking-wider border rounded",
                stock.marketState === 'REGULAR' 
                  ? "bg-primary/10 border-primary/30 text-primary" 
                  : stock.marketState === 'PRE' || stock.marketState === 'POST'
                  ? "bg-yellow-500/10 border-yellow-500/30 text-yellow-500"
                  : "bg-muted border-border text-muted-foreground"
              )}>
                {stock.marketState === 'REGULAR' ? 'LIVE' : stock.marketState === 'PRE' ? 'PRE' : stock.marketState === 'POST' ? 'AH' : 'CLOSED'}
              </span>
              <span className="text-xs text-muted-foreground">{stock.exchange}</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              {stock.marketState === 'REGULAR' ? 'Market Open' : stock.marketState === 'PRE' ? 'Pre-Market' : stock.marketState === 'POST' ? 'After Hours' : 'Market Closed'}
            </div>
          </div>
          <p className="text-xs text-muted-foreground mb-2">{stock.name}</p>

          <div className="flex items-end gap-3">
            <span className="text-3xl font-bold text-foreground tabular-nums leading-none">
              {sym}{stock.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <div className={cn(
              "flex items-center gap-1 text-sm font-medium",
              isPositive ? "text-primary" : "text-destructive"
            )}>
              {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              <span className="tabular-nums">
                {isPositive ? '+' : ''}{stock.change.toFixed(2)} ({isPositive ? '+' : ''}{stock.changePercent.toFixed(2)}%)
              </span>
            </div>
          </div>
        </div>

        {/* Daily Range Bar */}
        {stock.high > 0 && stock.low > 0 && stock.high !== stock.low && (
          <div className="px-3 py-2 border-b border-border bg-muted/10">
            <div className="flex items-center justify-between text-[10px] uppercase text-muted-foreground mb-1.5">
              <span>Day Range</span>
              <span className="tabular-nums">
                {sym}{stock.low.toFixed(2)} – {sym}{stock.high.toFixed(2)}
              </span>
            </div>
            <div className="relative h-1.5 bg-muted rounded-full overflow-hidden">
              <div 
                className="absolute left-0 top-0 h-full bg-gradient-to-r from-destructive via-yellow-500 to-primary rounded-full opacity-80"
                style={{ width: '100%' }}
              />
              <div 
                className="absolute top-1/2 -translate-y-1/2 w-2 h-2 bg-foreground rounded-full border border-background shadow-md"
                style={{ left: `calc(${((stock.price - stock.low) / (stock.high - stock.low)) * 100}% - 4px)` }}
              />
            </div>
          </div>
        )}

        {/* Quick Stats Row */}
        <div className="hidden sm:grid grid-cols-3 lg:grid-cols-6 border-b border-border">
          {coreStats.map((stat) => (
            <div 
              key={stat.label} 
              className="p-2 border-r border-border last:border-r-0 hover:bg-muted/30 transition-colors"
            >
              <div className="flex items-center gap-1 text-[10px] uppercase text-muted-foreground mb-0.5">
                <stat.icon className="w-3 h-3" />
                {stat.label}
              </div>
              <div className="text-xs font-semibold text-foreground tabular-nums">
                {stat.value}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chart area */}
      <div className="flex-1 min-h-0 w-full relative bg-card border border-border rounded-md overflow-hidden">
        <PriceChart
          symbol={symbol}
          currency={stock.currency}
          onExpand={() => setFullscreenOpen(true)}
        />
      </div>

      {/* Advanced chart — fullscreen via Dialog portal (same as blueprint) */}
      <FullscreenChart
        symbol={symbol}
        open={fullscreenOpen}
        onClose={() => setFullscreenOpen(false)}
      />
    </div>
  )
}

function formatNumber(num: number): string {
  if (!num) return 'N/A'
  if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`
  if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`
  if (num >= 1e3) return `${(num / 1e3).toFixed(1)}K`
  return num.toLocaleString()
}
