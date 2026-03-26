'use client'

import { POPULAR_STOCKS } from '@/lib/stock-types'
import { Plus, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'

interface QuickActionsProps {
  onAddStock: (symbol: string) => void
  watchedStocks: string[]
}

// Stock name shortcuts for display
const STOCK_NAMES: Record<string, string> = {
  'AAPL': 'Apple',
  'GOOGL': 'Google',
  'MSFT': 'Microsoft',
  'AMZN': 'Amazon',
  'TSLA': 'Tesla',
  'META': 'Meta',
  'NVDA': 'NVIDIA',
  'AMD': 'AMD'
}

export function QuickActions({ onAddStock, watchedStocks }: QuickActionsProps) {
  const availableStocks = POPULAR_STOCKS.filter(s => !watchedStocks.includes(s))

  if (availableStocks.length === 0) return null

  return (
    <div className="border border-border bg-card rounded-md p-4">
      <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground mb-3">
        <TrendingUp className="w-3 h-3 text-primary" />
        Quick Add Popular Stocks
      </div>
      <div className="flex flex-wrap gap-2">
        {availableStocks.slice(0, 6).map((symbol) => (
          <button
            key={symbol}
            onClick={() => onAddStock(symbol)}
            className={cn(
              "group flex items-center gap-1.5 px-3 py-1.5 text-sm",
              "border border-border rounded-md",
              "hover:border-primary hover:bg-primary/5 transition-all",
              "text-foreground hover:text-primary"
            )}
          >
            <Plus className="w-3 h-3 opacity-50 group-hover:opacity-100" />
            <span className="font-medium">{symbol}</span>
            <span className="text-xs text-muted-foreground hidden sm:inline">
              {STOCK_NAMES[symbol]}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
