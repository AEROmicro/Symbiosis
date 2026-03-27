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
      <div className="group relative border border-white/5 bg-black/40 rounded-xl p-4 animate-pulse">
        <div className="h-4 w-16 bg-white/10 rounded mb-3" />
        <div className="h-8 w-32 bg-white/10 rounded mb-2" />
        <div className="h-4 w-24 bg-white/10 rounded" />
      </div>
    )
  }

  if (isError || !stock) {
    return (
      <div className="group relative border border-rose-500/20 bg-rose-500/5 rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="font-bold text-rose-400 font-mono tracking-tighter">^{symbol}</span>
          <button
            onClick={(e) => { e.stopPropagation(); onRemove(symbol) }}
            className="text-white/20 hover:text-rose-400 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <p className="text-[10px] text-rose-400/60 uppercase tracking-widest font-mono">Sync Error</p>
        <button 
          onClick={(e) => { e.stopPropagation(); refresh() }}
          className="text-[10px] text-white/40 hover:text-white mt-2 flex items-center gap-1 font-mono uppercase"
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
        "group relative border rounded-xl p-4 cursor-pointer transition-all duration-300",
        "bg-black/40 backdrop-blur-sm",
        "hover:bg-white/[0.02] hover:border-white/20",
        isSelected 
          ? "border-emerald-500/50 shadow-[0_0_25px_rgba(16,185,129,0.1)] bg-white/[0.03]" 
          : "border-white/5"
      )}
    >
      {/* Remove button - Hidden until hover */}
      <button
        onClick={(e) => { e.stopPropagation(); onRemove(symbol) }}
        className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 text-white/20 hover:text-rose-500 transition-all z-10"
      >
        <X className="w-4 h-4" />
      </button>

      {/* Symbol & Name */}
      <div className="flex flex-col mb-1">
        <span className={cn(
          "text-sm font-bold tracking-tighter font-mono",
          isPositive ? "text-emerald-400" : "text-rose-400"
        )}>
          ^{stock.symbol}
        </span>
        <span className="text-[10px] text-white/30 uppercase tracking-[0.12em] font-mono truncate max-w-[140px]">
          {stock.name}
        </span>
      </div>

      {/* Big Price */}
      <div className="text-2xl font-bold text-white tracking-tighter font-mono tabular-nums mb-1">
        ${stock.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </div>

      {/* Fixed Daily Change (Calculated by our API) */}
      <div className={cn(
        "flex items-center gap-1.5 text-[11px] font-mono font-medium tracking-tight",
        isPositive ? "text-emerald-400" : "text-rose-400"
      )}>
        {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
        <span className="tabular-nums">
          {isPositive ? '+' : ''}{stock.change.toFixed(2)} 
          <span className="ml-1.5 opacity-60 text-[10px]">
            ({isPositive ? '+' : ''}{stock.changePercent.toFixed(2)}%)
          </span>
        </span>
      </div>

      {/* Minimalist Live Pulse */}
      <div className="absolute bottom-3 right-3 flex items-center gap-1.5">
        <span className={cn(
          "w-1 h-1 rounded-full",
          isPositive ? "bg-emerald-500" : "bg-rose-500",
          "animate-pulse"
        )} />
        <span className="text-[8px] text-white/10 font-bold tracking-[0.2em] font-mono uppercase">Live</span>
      </div>
    </div>
  )
}
