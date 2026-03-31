'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { useMultipleStocks } from '@/hooks/use-stock-data'

const SECTORS = [
  { name: 'Technology',    ticker: 'XLK'  },
  { name: 'Healthcare',    ticker: 'XLV'  },
  { name: 'Finance',       ticker: 'XLF'  },
  { name: 'Energy',        ticker: 'XLE'  },
  { name: 'Consumer',      ticker: 'XLY'  },
  { name: 'Industrial',    ticker: 'XLI'  },
  { name: 'Utilities',     ticker: 'XLU'  },
  { name: 'Materials',     ticker: 'XLB'  },
  { name: 'Real Estate',   ticker: 'XLRE' },
  { name: 'Communication', ticker: 'XLC'  },
]

const TICKERS = SECTORS.map(s => s.ticker)

function changeColor(change: number | null): string {
  if (change === null) return 'bg-muted'
  if (change >=  2) return 'bg-green-600/80'
  if (change >=  0) return 'bg-green-500/40'
  if (change >= -2) return 'bg-red-500/40'
  return 'bg-red-600/80'
}

export function HeatmapWidget() {
  const { stocks, isLoading } = useMultipleStocks(TICKERS, 30_000)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  useEffect(() => {
    if (stocks.length > 0) setLastUpdated(new Date())
  }, [stocks])

  const sectors = SECTORS.map(s => {
    const stock = stocks.find(d => d.symbol === s.ticker)
    return { ...s, change: stock?.changePercent ?? null }
  })

  const secAgo = lastUpdated ? Math.round((Date.now() - lastUpdated.getTime()) / 1000) : null

  return (
    <div className="p-4 h-full flex flex-col gap-2">
      <div className="grid grid-cols-2 gap-2 flex-1 min-h-0">
        {sectors.map((s) => (
          <div
            key={s.ticker}
            className={cn(
              'flex flex-col items-center justify-center p-3 rounded border border-border/50 text-xs font-mono',
              isLoading ? 'animate-pulse' : '',
              changeColor(s.change),
            )}
          >
            <div className="font-semibold text-foreground text-center leading-tight">{s.name}</div>
            <div className="text-[10px] text-muted-foreground mt-0.5">{s.ticker}</div>
            {s.change !== null && (
              <div className={cn(
                'font-bold mt-1',
                s.change >= 0 ? 'text-green-300' : 'text-red-300',
              )}>
                {s.change >= 0 ? '+' : ''}{s.change.toFixed(2)}%
              </div>
            )}
          </div>
        ))}
      </div>
      {/* Live indicator */}
      <div className="flex items-center justify-end gap-1.5 shrink-0 text-[10px] font-mono text-muted-foreground">
        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
        {isLoading ? 'updating…' : secAgo !== null ? `updated ${secAgo}s ago` : 'live'}
      </div>
    </div>
  )
}

