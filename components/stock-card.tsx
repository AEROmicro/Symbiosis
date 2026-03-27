'use client'

import { useStockData } from '@/hooks/use-stock-data'
import { TrendingUp, TrendingDown, X, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'

export function StockCard({ symbol, onRemove, onClick, isSelected, refreshInterval = 3000 }) {
  const { stock, isLoading, isError, refresh } = useStockData(symbol, refreshInterval)

  if (isLoading) return <div className="p-4 border border-white/5 bg-black/40 rounded-xl animate-pulse h-32" />

  if (isError || !stock) return (
    <div className="p-4 border border-rose-500/20 bg-rose-500/5 rounded-xl">
      <button onClick={() => onRemove(symbol)} className="float-right"><X size={14}/></button>
      <span className="text-rose-400 font-mono text-xs">Error: {symbol}</span>
    </div>
  )

  const isPositive = (stock?.change ?? 0) >= 0

  return (
    <div
      onClick={() => onClick(symbol)}
      className={cn(
        "group relative border rounded-xl p-4 cursor-pointer transition-all duration-300 bg-black/40 backdrop-blur-sm",
        isSelected ? "border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.1)]" : "border-white/5"
      )}
    >
      <div className="flex flex-col mb-1">
        <span className={cn("text-sm font-bold font-mono", isPositive ? "text-emerald-400" : "text-rose-400")}>
          ^{stock?.symbol}
        </span>
        <span className="text-[10px] text-white/30 font-mono uppercase truncate">
          {stock?.name ?? 'Loading...'}
        </span>
      </div>

      <div className="text-2xl font-bold text-white font-mono tabular-nums mb-1">
        ${stock?.price?.toLocaleString(undefined, { minimumFractionDigits: 2 }) ?? '0.00'}
      </div>

      <div className={cn("flex items-center gap-1.5 text-[11px] font-mono", isPositive ? "text-emerald-400" : "text-rose-400")}>
        {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
        <span>{isPositive ? '+' : ''}{stock?.change?.toFixed(2) ?? '0.00'}</span>
        <span className="opacity-60 text-[10px]">({stock?.changePercent?.toFixed(2) ?? '0.00'}%)</span>
      </div>
    </div>
  )
}
