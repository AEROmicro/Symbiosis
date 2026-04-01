'use client'

import { useMemo, useState, useEffect } from 'react'
import { useStockData } from '@/hooks/use-stock-data'
import { TrendingUp, TrendingDown, X, RefreshCw } from 'lucide-react'
import { cn, getCurrencySymbol } from '@/lib/utils'
import { resolveExchange, getMarketState, EXCHANGES } from '@/lib/exchanges'

interface StockCardProps {
  symbol: string
  onRemove: (symbol: string) => void
  onClick: (symbol: string) => void
  isSelected: boolean
  refreshInterval?: number
}

export function StockCard({ symbol, onRemove, onClick, isSelected, refreshInterval = 3000 }: StockCardProps) {
  const { stock, isLoading, isError, refresh } = useStockData(symbol, refreshInterval)

  // Tick every 60 s so the session badge reflects local time even between polls
  const [tick, setTick] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 60_000)
    return () => clearInterval(id)
  }, [])

  // Resolve the exchange once per stock load
  const resolvedEx = useMemo(() => (stock ? resolveExchange(stock.exchange) : null), [stock])

  // Effective market state — always derived from the local exchange clock so
  // indices (^IXIC, ^GSPC, etc.) and any symbol whose API returns "CLOSED"
  // still get the correct PRE / REGULAR / POST badge without an extra round-trip.
  const effectiveMarketState = useMemo(() => {
    if (!stock) return null
    const ex = resolvedEx ?? EXCHANGES.find(e => e.id === 'NYSE')!
    return getMarketState(ex)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stock, resolvedEx, tick])

  // Effective price/change — uses pre/post market data when that session is active
  const effectivePrice =
    effectiveMarketState === 'PRE'  && (stock?.preMarketPrice  ?? null) != null ? stock!.preMarketPrice!  :
    effectiveMarketState === 'POST' && (stock?.postMarketPrice ?? null) != null ? stock!.postMarketPrice! :
    stock?.price ?? 0

  const effectiveChange =
    effectiveMarketState === 'PRE'  && (stock?.preMarketChange  ?? null) != null ? stock!.preMarketChange!  :
    effectiveMarketState === 'POST' && (stock?.postMarketChange ?? null) != null ? stock!.postMarketChange! :
    stock?.change ?? 0

  const effectiveChangePercent =
    effectiveMarketState === 'PRE'  && (stock?.preMarketChangePercent  ?? null) != null ? stock!.preMarketChangePercent!  :
    effectiveMarketState === 'POST' && (stock?.postMarketChangePercent ?? null) != null ? stock!.postMarketChangePercent! :
    stock?.changePercent ?? 0

  if (isLoading) {
    return (
      <div className="group relative border border-border bg-card/40 rounded-xl p-4 animate-pulse">
        <div className="h-4 w-16 bg-muted rounded mb-3" />
        <div className="h-8 w-32 bg-muted rounded mb-2" />
        <div className="h-4 w-24 bg-muted rounded" />
      </div>
    )
  }

  if (isError || !stock) {
    return (
      <div className="group relative border border-destructive/20 bg-destructive/5 rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="font-bold text-destructive font-mono tracking-tighter">{symbol}</span>
          <button
            onClick={(e) => { e.stopPropagation(); onRemove(symbol) }}
            className="text-muted-foreground hover:text-destructive transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <p className="text-[10px] text-destructive/60 uppercase tracking-widest font-mono">Sync Error</p>
        <button 
          onClick={(e) => { e.stopPropagation(); refresh() }}
          className="text-[10px] text-muted-foreground hover:text-foreground mt-2 flex items-center gap-1 font-mono uppercase"
        >
          <RefreshCw className="w-3 h-3" /> Retry
        </button>
      </div>
    )
  }

  const isPositive = effectiveChange >= 0
  const sym = getCurrencySymbol(stock.currency)

  return (
    <div
      onClick={() => onClick(symbol)}
      className={cn(
        "group relative border rounded-xl p-4 cursor-pointer transition-all duration-300",
        "bg-card/40 backdrop-blur-sm",
        "hover:bg-primary/[0.02] hover:border-border/60",
        isSelected 
          ? "border-primary/50 bg-primary/[0.03]" 
          : "border-border"
      )}
      style={isSelected ? { boxShadow: '0 0 25px color-mix(in oklch, var(--primary) 10%, transparent)' } : undefined}
    >
      {/* Remove button - Hidden until hover */}
      <button
        onClick={(e) => { e.stopPropagation(); onRemove(symbol) }}
        className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all z-10"
      >
        <X className="w-4 h-4" />
      </button>

      {/* Symbol & Name */}
      <div className="flex flex-col mb-1">
        <div className="flex items-center gap-1.5">
          <span className={cn(
            "text-sm font-bold tracking-tighter font-mono",
            isPositive ? "text-price-up" : "text-price-down"
          )}>
            {stock.symbol}
          </span>
          {effectiveMarketState === 'PRE' ? (
            <span className="text-[8px] font-bold uppercase tracking-wider text-yellow-500 border border-yellow-500/30 bg-yellow-500/10 px-1 rounded">PRE</span>
          ) : effectiveMarketState === 'POST' ? (
            <span className="text-[8px] font-bold uppercase tracking-wider text-orange-400 border border-orange-400/30 bg-orange-400/10 px-1 rounded">AH</span>
          ) : effectiveMarketState === 'REGULAR' ? (
            <span className="text-[8px] font-bold uppercase tracking-wider text-primary border border-primary/30 bg-primary/10 px-1 rounded">LIVE</span>
          ) : null}
        </div>
        <span className="text-[10px] text-muted-foreground uppercase tracking-[0.12em] font-mono truncate max-w-[140px]">
          {stock.name}
        </span>
      </div>

      {/* Big Price */}
      <div className="text-2xl font-bold text-foreground tracking-tighter font-mono tabular-nums mb-1">
        {sym}{effectivePrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </div>

      {/* Change row */}
      <div className={cn(
        "flex items-center gap-1.5 text-[11px] font-mono font-medium tracking-tight",
        isPositive ? "text-price-up" : "text-price-down"
      )}>
        {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
        <span className="tabular-nums">
          {isPositive ? '+' : ''}{effectiveChange.toFixed(2)} 
          <span className="ml-1.5 opacity-60 text-[10px]">
            ({isPositive ? '+' : ''}{effectiveChangePercent.toFixed(2)}%)
          </span>
        </span>
      </div>

      {/* Minimalist Live Pulse */}
      <div className="absolute bottom-3 right-3 flex items-center gap-1.5">
        <span className={cn(
          "w-1 h-1 rounded-full",
          isPositive ? "bg-price-up" : "bg-price-down",
          "animate-pulse"
        )} />
        <span className="text-[8px] text-muted-foreground/40 font-bold tracking-[0.2em] font-mono uppercase">Live</span>
      </div>
    </div>
  )
}
