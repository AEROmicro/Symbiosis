'use client'

import { useStockData } from '@/hooks/use-stock-data'
import { TrendingUp, TrendingDown, X, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StockCardProps {
  symbol: string
  onRemove: (symbol: string) => void
  onClick: (symbol: string) => void
  isSelected: boolean
  refreshInterval?: number
}

export function StockCard({ symbol, onRemove, onClick, isSelected, refreshInterval = 3000 }: StockCardProps) {
  const { stock, isLoading, isError, refresh } = useStockData(symbol, refreshInterval)

  if (isLoading) {
    return (
      <div className="group relative border border-border bg-card rounded-md p-4 animate-pulse">
        <div className="flex items-center justify-between mb-3">
          <div className="h-5 w-16 bg-muted rounded" />
          <div className="h-4 w-4 bg-muted rounded" />
        </div>
        <div className="h-8 w-24 bg-muted rounded mb-2" />
        <div className="h-4 w-20 bg-muted rounded" />
      </div>
    )
  }

  if (isError || !stock) {
    return (
      <div className="group relative border border-destructive/50 bg-destructive/10 rounded-md p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="font-bold text-destructive">{symbol}</span>
          <button
            onClick={(e) => { e.stopPropagation(); onRemove(symbol) }}
            className="text-muted-foreground hover:text-destructive transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <p className="text-xs text-destructive">Failed to load</p>
        <button 
          onClick={(e) => { e.stopPropagation(); refresh() }}
          className="text-xs text-muted-foreground hover:text-primary mt-2 flex items-center gap-1"
        >
          <RefreshCw className="w-3 h-3" /> Retry
        </button>
      </div>
    )
  }

  const isPositive = stock.change >= 0

  return (
    <div
      onClick={() => onClick(symbol)}
      className={cn(
        "group relative border bg-card rounded-md p-4 cursor-pointer transition-all duration-200",
        "hover:border-primary/50 hover:shadow-[0_0_15px_color-mix(in_oklch,var(--primary)_10%,transparent)]",
        isSelected 
          ? "border-primary shadow-[0_0_20px_color-mix(in_oklch,var(--primary)_15%,transparent)]" 
          : "border-border"
      )}
    >
      {/* Remove button */}
      <button
        onClick={(e) => { e.stopPropagation(); onRemove(symbol) }}
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all"
      >
        <X className="w-4 h-4" />
      </button>

      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <span className="font-bold text-foreground">{stock.symbol}</span>
        <span className="text-xs text-muted-foreground truncate max-w-[120px]">
          {stock.name}
        </span>
      </div>

      {/* Price */}
      <div className="text-2xl font-bold text-foreground mb-1 tabular-nums">
        ${stock.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </div>

      {/* Change */}
      <div className={cn(
        "flex items-center gap-1 text-sm font-medium",
        isPositive ? "text-primary" : "text-destructive"
      )}>
        {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
        <span className="tabular-nums">
          {isPositive ? '+' : ''}{stock.change.toFixed(2)} ({isPositive ? '+' : ''}{stock.changePercent.toFixed(2)}%)
        </span>
      </div>

      {/* Live indicator */}
      <div className="absolute bottom-2 right-2 flex items-center gap-1 text-[10px] text-muted-foreground">
        <span className={cn(
          "w-1.5 h-1.5 rounded-full",
          isPositive ? "bg-primary" : "bg-destructive",
          "animate-pulse"
        )} />
        LIVE
      </div>
    </div>
  )
}
