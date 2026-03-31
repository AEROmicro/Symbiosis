'use client'

import { useCallback, useEffect, useState } from 'react'
import { TrendingUp, TrendingDown, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { PortfolioEntry } from '@/lib/stock-types'

const PORTFOLIO_STORAGE_KEY = 'symbiosis-portfolio'

interface PositionData extends PortfolioEntry {
  currentPrice: number | null
  value: number | null
  pnl: number | null
  pnlPct: number | null
}

export function PortfolioWidget() {
  const [positions, setPositions] = useState<PositionData[]>([])
  const [loading, setLoading] = useState(false)

  const fetchPortfolio = useCallback(async () => {
    setLoading(true)
    try {
      const stored = localStorage.getItem(PORTFOLIO_STORAGE_KEY)
      const entries: PortfolioEntry[] = stored ? JSON.parse(stored) : []

      const posData = await Promise.all(
        entries.map(async (entry) => {
          try {
            const res = await fetch(`/api/stock/${entry.symbol}`)
            if (res.ok) {
              const data = await res.json()
              const cost = entry.shares * entry.avgPrice
              const value = entry.shares * data.price
              const pnl = value - cost
              const pnlPct = cost > 0 ? (pnl / cost) * 100 : 0
              return { ...entry, currentPrice: data.price, value, pnl, pnlPct }
            }
          } catch {
            // silent
          }
          return { ...entry, currentPrice: null, value: null, pnl: null, pnlPct: null }
        }),
      )
      setPositions(posData)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchPortfolio() }, [fetchPortfolio])

  useEffect(() => {
    const id = setInterval(fetchPortfolio, 60_000)
    return () => clearInterval(id)
  }, [fetchPortfolio])

  const totalCost  = positions.reduce((s, p) => s + p.shares * p.avgPrice, 0)
  const totalValue = positions.reduce((s, p) => s + (p.value ?? p.shares * p.avgPrice), 0)
  const totalPnl   = totalValue - totalCost
  const totalPnlPct = totalCost > 0 ? (totalPnl / totalCost) * 100 : 0

  return (
    <div className="p-4 flex flex-col gap-3 h-full overflow-hidden">
      {loading && positions.length === 0 ? (
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-12 bg-muted rounded animate-pulse" />
          ))}
        </div>
      ) : positions.length === 0 ? (
        <div className="text-center text-muted-foreground text-xs py-4">
          <p className="mb-1">No positions yet.</p>
          <p>Use <span className="text-primary">portfolio add SYMBOL SHARES PRICE</span> in the terminal.</p>
        </div>
      ) : (
        <>
          {/* Summary */}
          <div className={cn(
            'p-3 rounded border text-xs shrink-0',
            totalPnl >= 0 ? 'border-price-up/30 bg-price-up/10' : 'border-price-down/30 bg-price-down/10',
          )}>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Value</span>
              <span className="font-bold">${totalValue.toFixed(2)}</span>
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-muted-foreground">Total P&amp;L</span>
              <span className={cn('font-semibold flex items-center gap-1', totalPnl >= 0 ? 'text-price-up' : 'text-price-down')}>
                {totalPnl >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {totalPnl >= 0 ? '+' : ''}${totalPnl.toFixed(2)} ({totalPnlPct >= 0 ? '+' : ''}{totalPnlPct.toFixed(2)}%)
              </span>
            </div>
          </div>

          {/* Positions */}
          <div className="flex-1 overflow-y-auto space-y-2">
            {positions.map((pos) => {
              const isPositive = (pos.pnl ?? 0) >= 0
              return (
                <div
                  key={pos.symbol}
                  className={cn(
                    'flex justify-between p-2 rounded border text-xs',
                    isPositive ? 'border-price-up/20 bg-price-up/5' : 'border-price-down/20 bg-price-down/5',
                  )}
                >
                  <div>
                    <div className="font-semibold">{pos.symbol}</div>
                    <div className="text-muted-foreground">{pos.shares}sh @ ${pos.avgPrice.toFixed(2)}</div>
                  </div>
                  <div className="text-right">
                    {pos.currentPrice !== null ? (
                      <>
                        <div className="font-bold">${pos.value!.toFixed(2)}</div>
                        <div className={cn('flex items-center gap-0.5 justify-end', isPositive ? 'text-price-up' : 'text-price-down')}>
                          {isPositive ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
                          {pos.pnl! >= 0 ? '+' : ''}${pos.pnl!.toFixed(2)}
                        </div>
                      </>
                    ) : (
                      <div className="text-muted-foreground">–</div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          <Button variant="outline" size="sm" className="w-full text-xs font-mono shrink-0" onClick={fetchPortfolio} disabled={loading}>
            <RefreshCw className="w-3 h-3" />
            Refresh
          </Button>
        </>
      )}
    </div>
  )
}
