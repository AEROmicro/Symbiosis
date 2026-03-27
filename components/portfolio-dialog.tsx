'use client'

import { useEffect, useState } from 'react'
import { TrendingUp, TrendingDown, Briefcase, RefreshCw } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
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

export function PortfolioDialog() {
  const [open, setOpen] = useState(false)
  const [positions, setPositions] = useState<PositionData[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open) {
      fetchPortfolio()
    }
  }, [open])

  const fetchPortfolio = async () => {
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
            // Silent fail per position
          }
          return { ...entry, currentPrice: null, value: null, pnl: null, pnlPct: null }
        })
      )
      setPositions(posData)
    } finally {
      setLoading(false)
    }
  }

  const totalCost = positions.reduce((sum, p) => sum + p.shares * p.avgPrice, 0)
  const totalValue = positions.reduce(
    (sum, p) => sum + (p.value ?? p.shares * p.avgPrice),
    0
  )
  const totalPnl = totalValue - totalCost
  const totalPnlPct = totalCost > 0 ? (totalPnl / totalCost) * 100 : 0

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start text-xs font-mono"
        >
          <Briefcase className="w-3 h-3" />
          Portfolio
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl font-mono">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-primary" />
            Portfolio
          </DialogTitle>
          <DialogDescription>
            Your positions and live P&amp;L summary
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-muted rounded animate-pulse" />
            ))}
          </div>
        ) : positions.length === 0 ? (
          <div className="text-center text-muted-foreground p-6 text-sm">
            <p className="mb-2">No positions yet.</p>
            <p className="text-xs">
              Use{' '}
              <span className="text-primary">
                portfolio add &lt;SYMBOL&gt; &lt;SHARES&gt; &lt;PRICE|current&gt;
              </span>{' '}
              in the terminal to add a position.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="space-y-2">
              {positions.map((pos) => {
                const isPositive = (pos.pnl ?? 0) >= 0
                return (
                  <div
                    key={pos.symbol}
                    className={cn(
                      'flex items-center justify-between p-3 rounded-md border',
                      isPositive
                        ? 'border-primary/20 bg-primary/5'
                        : 'border-destructive/20 bg-destructive/5'
                    )}
                  >
                    <div>
                      <div className="font-semibold text-sm">{pos.symbol}</div>
                      <div className="text-xs text-muted-foreground">
                        {pos.shares} share{pos.shares !== 1 ? 's' : ''} @{' '}
                        ${pos.avgPrice.toFixed(2)}
                      </div>
                    </div>
                    <div className="text-right">
                      {pos.currentPrice !== null ? (
                        <>
                          <div className="text-sm font-bold">
                            ${pos.value!.toFixed(2)}
                          </div>
                          <div
                            className={cn(
                              'flex items-center gap-1 text-xs font-semibold justify-end',
                              isPositive ? 'text-primary' : 'text-destructive'
                            )}
                          >
                            {isPositive ? (
                              <TrendingUp className="w-3 h-3" />
                            ) : (
                              <TrendingDown className="w-3 h-3" />
                            )}
                            {pos.pnl! >= 0 ? '+' : ''}${pos.pnl!.toFixed(2)} (
                            {pos.pnlPct! >= 0 ? '+' : ''}
                            {pos.pnlPct!.toFixed(2)}%)
                          </div>
                        </>
                      ) : (
                        <div className="text-xs text-muted-foreground">
                          Price unavailable
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            <div
              className={cn(
                'p-3 rounded-md border',
                totalPnl >= 0
                  ? 'border-primary/30 bg-primary/10'
                  : 'border-destructive/30 bg-destructive/10'
              )}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Total Value</span>
                <span className="font-bold">${totalValue.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs text-muted-foreground">Total P&amp;L</span>
                <span
                  className={cn(
                    'font-semibold text-sm flex items-center gap-1',
                    totalPnl >= 0 ? 'text-primary' : 'text-destructive'
                  )}
                >
                  {totalPnl >= 0 ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  {totalPnl >= 0 ? '+' : ''}${totalPnl.toFixed(2)} (
                  {totalPnlPct >= 0 ? '+' : ''}
                  {totalPnlPct.toFixed(2)}%)
                </span>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs font-mono"
              onClick={fetchPortfolio}
              disabled={loading}
            >
              <RefreshCw className="w-3 h-3" />
              Refresh Prices
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
