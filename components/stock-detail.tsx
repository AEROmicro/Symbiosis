'use client'

import { useStockData } from '@/hooks/use-stock-data'
import { PriceChart } from '@/components/price-chart'
import { TrendingUp, TrendingDown, Activity, BarChart3, DollarSign, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StockDetailProps {
  symbol: string
  refreshInterval?: number
}

export function StockDetail({ symbol, refreshInterval = 15000 }: StockDetailProps) {
  const { stock, isLoading } = useStockData(symbol, refreshInterval)

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="border border-border bg-card rounded-md p-6 animate-pulse">
          <div className="h-8 w-32 bg-muted rounded mb-4" />
          <div className="h-12 w-40 bg-muted rounded mb-6" />
        </div>
        <div className="h-64 bg-muted rounded animate-pulse" />
      </div>
    )
  }

  if (!stock) {
    return (
      <div className="border border-border bg-card rounded-md p-6 text-center">
        <p className="text-muted-foreground">Select a stock to view details</p>
      </div>
    )
  }

  const isPositive = stock.change >= 0

  // Calculate 52-week position
  const fiftyTwoWeekRange = stock.fiftyTwoWeekHigh - stock.fiftyTwoWeekLow
  const pricePosition = fiftyTwoWeekRange > 0 
    ? ((stock.price - stock.fiftyTwoWeekLow) / fiftyTwoWeekRange) * 100 
    : 50

  const coreStats = [
    { label: 'Open', value: `$${stock.open.toFixed(2)}`, icon: Clock },
    { label: 'Prev Close', value: `$${stock.previousClose.toFixed(2)}`, icon: DollarSign },
    { label: 'Day High', value: `$${stock.high.toFixed(2)}`, icon: TrendingUp },
    { label: 'Day Low', value: `$${stock.low.toFixed(2)}`, icon: TrendingDown },
    { label: 'Volume', value: formatNumber(stock.volume), icon: BarChart3 },
    { label: 'Avg Volume', value: formatNumber(stock.avgVolume), icon: Activity },
  ]

  return (
    <div className="space-y-4">
      {/* Header Card */}
      <div className="border border-border bg-card rounded-md overflow-hidden">
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-3">
              <span className="text-2xl font-bold text-foreground">{stock.symbol}</span>
              <span className={cn(
                "px-2 py-0.5 text-xs border rounded",
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
          <p className="text-sm text-muted-foreground mb-4">{stock.name}</p>

          <div className="flex items-end gap-4">
            <span className="text-4xl font-bold text-foreground tabular-nums">
              ${stock.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <div className={cn(
              "flex items-center gap-1 text-lg font-medium pb-1",
              isPositive ? "text-primary" : "text-destructive"
            )}>
              {isPositive ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
              <span className="tabular-nums">
                {isPositive ? '+' : ''}{stock.change.toFixed(2)} ({isPositive ? '+' : ''}{stock.changePercent.toFixed(2)}%)
              </span>
            </div>
          </div>
        </div>

        {/* 52-Week Range */}
        {stock.fiftyTwoWeekLow > 0 && stock.fiftyTwoWeekHigh > 0 && (
          <div className="px-4 py-3 border-b border-border bg-muted/20">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
              <span>52-Week Range</span>
              <span className="tabular-nums">
                ${stock.fiftyTwoWeekLow.toFixed(2)} - ${stock.fiftyTwoWeekHigh.toFixed(2)}
              </span>
            </div>
            <div className="relative h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="absolute left-0 top-0 h-full bg-gradient-to-r from-destructive via-yellow-500 to-primary rounded-full"
                style={{ width: '100%' }}
              />
              <div 
                className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-foreground rounded-full border-2 border-background shadow-lg"
                style={{ left: `calc(${pricePosition}% - 6px)` }}
              />
            </div>
          </div>
        )}

        {/* Quick Stats Row */}
        <div className="grid grid-cols-3 lg:grid-cols-6 border-b border-border">
          {coreStats.map((stat) => (
            <div 
              key={stat.label} 
              className="p-3 border-r border-border last:border-r-0 hover:bg-muted/30 transition-colors"
            >
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                <stat.icon className="w-3 h-3" />
                {stat.label}
              </div>
              <div className="text-sm font-semibold text-foreground tabular-nums">
                {stat.value}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Price Chart */}
      <PriceChart symbol={symbol} />

      {/* Moving Averages */}
      {(stock.fiftyDayAvg > 0 || stock.twoHundredDayAvg > 0) && (
        <div className="border border-border bg-card rounded-md overflow-hidden">
          <div className="px-4 py-3 border-b border-border bg-muted/20">
            <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
              <Activity className="w-3 h-3 text-primary" />
              Moving Averages
            </div>
          </div>
          <div className="grid grid-cols-2 divide-x divide-border">
            {stock.fiftyDayAvg > 0 && (
              <div className="p-4">
                <div className="text-xs text-muted-foreground mb-1">50-Day MA</div>
                <div className="text-lg font-semibold tabular-nums">${stock.fiftyDayAvg.toFixed(2)}</div>
                <div className={cn(
                  "text-xs tabular-nums",
                  stock.price > stock.fiftyDayAvg ? "text-primary" : "text-destructive"
                )}>
                  {stock.price > stock.fiftyDayAvg ? 'Above' : 'Below'} ({((stock.price - stock.fiftyDayAvg) / stock.fiftyDayAvg * 100).toFixed(2)}%)
                </div>
              </div>
            )}
            {stock.twoHundredDayAvg > 0 && (
              <div className="p-4">
                <div className="text-xs text-muted-foreground mb-1">200-Day MA</div>
                <div className="text-lg font-semibold tabular-nums">${stock.twoHundredDayAvg.toFixed(2)}</div>
                <div className={cn(
                  "text-xs tabular-nums",
                  stock.price > stock.twoHundredDayAvg ? "text-primary" : "text-destructive"
                )}>
                  {stock.price > stock.twoHundredDayAvg ? 'Above' : 'Below'} ({((stock.price - stock.twoHundredDayAvg) / stock.twoHundredDayAvg * 100).toFixed(2)}%)
                </div>
              </div>
            )}
          </div>
        </div>
      )}
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
