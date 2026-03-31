'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { Plus, Trash2, TrendingUp, TrendingDown, Bell, BellOff, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const STORAGE_KEY = 'symbiosis-price-alerts'

interface PriceAlert {
  id: string
  symbol: string
  targetPrice: number
  direction: 'above' | 'below'
  currentPrice: number | null
  triggered: boolean
  createdAt: string
}

function formatPrice(price: number | null): string {
  if (price === null) return '—'
  return price.toFixed(2)
}

async function fetchPrice(symbol: string): Promise<number | null> {
  try {
    const res = await fetch(`/api/stock/${encodeURIComponent(symbol)}`)
    if (!res.ok) return null
    const data = await res.json()
    return data?.price ?? data?.regularMarketPrice ?? null
  } catch {
    return null
  }
}

export function PriceAlertsWidget() {
  const [alerts, setAlerts] = useState<PriceAlert[]>([])
  const [newSymbol, setNewSymbol] = useState('')
  const [newTarget, setNewTarget] = useState('')
  const [newDirection, setNewDirection] = useState<'above' | 'below'>('above')
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)
  const refreshTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Load from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed)) setAlerts(parsed)
      }
    } catch { /* ignore */ }
  }, [])

  const saveAlerts = useCallback((next: PriceAlert[]) => {
    setAlerts(next)
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)) } catch { /* ignore */ }
  }, [])

  const refreshPrices = useCallback(async (currentAlerts: PriceAlert[]) => {
    if (!currentAlerts.length) return
    setRefreshing(true)
    const symbols = [...new Set(currentAlerts.map(a => a.symbol))]
    const prices: Record<string, number | null> = {}
    await Promise.all(symbols.map(async s => { prices[s] = await fetchPrice(s) }))

    const updated = currentAlerts.map(alert => {
      const price = prices[alert.symbol]
      const triggered = price !== null && (
        alert.direction === 'above' ? price >= alert.targetPrice : price <= alert.targetPrice
      )
      return { ...alert, currentPrice: price, triggered }
    })
    saveAlerts(updated)
    setLastRefresh(new Date())
    setRefreshing(false)
  }, [saveAlerts])

  // Auto-refresh every 60s
  useEffect(() => {
    setAlerts(prev => {
      refreshPrices(prev)
      return prev
    })
    if (refreshTimerRef.current) clearInterval(refreshTimerRef.current)
    refreshTimerRef.current = setInterval(() => {
      setAlerts(prev => { refreshPrices(prev); return prev })
    }, 60_000)
    return () => { if (refreshTimerRef.current) clearInterval(refreshTimerRef.current) }
  }, [refreshPrices])

  async function addAlert() {
    const sym = newSymbol.trim().toUpperCase()
    const target = parseFloat(newTarget)
    if (!sym || isNaN(target) || target <= 0) return
    setLoading(true)
    const price = await fetchPrice(sym)
    const alert: PriceAlert = {
      id: String(Date.now()),
      symbol: sym,
      targetPrice: target,
      direction: newDirection,
      currentPrice: price,
      triggered: price !== null && (newDirection === 'above' ? price >= target : price <= target),
      createdAt: new Date().toISOString(),
    }
    const next = [...alerts, alert]
    saveAlerts(next)
    setNewSymbol('')
    setNewTarget('')
    setLoading(false)
  }

  function removeAlert(id: string) {
    saveAlerts(alerts.filter(a => a.id !== id))
  }

  return (
    <div className="flex flex-col h-full p-3 gap-3">
      {/* Add form */}
      <div className="flex gap-1.5 shrink-0">
        <input
          className="w-20 px-2 py-1.5 text-xs font-mono bg-background/60 border border-border rounded-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/60 uppercase"
          placeholder="SYMBOL"
          value={newSymbol}
          onChange={e => setNewSymbol(e.target.value.toUpperCase())}
          onKeyDown={e => { if (e.key === 'Enter') addAlert() }}
          maxLength={10}
        />
        <select
          value={newDirection}
          onChange={e => setNewDirection(e.target.value as 'above' | 'below')}
          className="bg-background/60 border border-border rounded-sm px-1.5 py-1.5 text-xs font-mono text-foreground focus:outline-none focus:border-primary/60"
        >
          <option value="above">≥</option>
          <option value="below">≤</option>
        </select>
        <input
          className="flex-1 min-w-0 px-2 py-1.5 text-xs font-mono bg-background/60 border border-border rounded-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/60"
          placeholder="Target price"
          type="number"
          min="0"
          step="0.01"
          value={newTarget}
          onChange={e => setNewTarget(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') addAlert() }}
        />
        <Button
          size="sm"
          variant="outline"
          className="h-7 px-2 rounded-sm border-border hover:border-primary/60 shrink-0"
          onClick={addAlert}
          disabled={loading || !newSymbol || !newTarget}
        >
          {loading ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
        </Button>
      </div>

      {/* Alerts list */}
      <div className="flex-1 overflow-y-auto space-y-1.5 min-h-0">
        {alerts.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-2 text-center">
            <Bell className="w-8 h-8 text-muted-foreground/30" />
            <div className="text-xs text-muted-foreground font-mono">No price alerts set</div>
            <div className="text-[10px] text-muted-foreground/60 font-mono">Add a symbol and target price above</div>
          </div>
        )}
        {alerts.map(alert => {
          const diff = alert.currentPrice !== null ? alert.currentPrice - alert.targetPrice : null
          const pct = diff !== null && alert.targetPrice > 0 ? (diff / alert.targetPrice) * 100 : null

          return (
            <div
              key={alert.id}
              className={cn(
                'flex items-center gap-2 border rounded-sm px-2.5 py-2 text-xs font-mono transition-colors',
                alert.triggered
                  ? 'border-primary/50 bg-primary/10'
                  : 'border-border bg-card/20',
              )}
            >
              {/* Trigger icon */}
              <div className="shrink-0">
                {alert.triggered
                  ? <Bell className="w-3 h-3 text-primary animate-pulse" />
                  : <BellOff className="w-3 h-3 text-muted-foreground/40" />
                }
              </div>

              {/* Symbol + direction */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-foreground">{alert.symbol}</span>
                  <span className={cn(
                    'text-[9px] uppercase tracking-wider px-1 rounded-sm',
                    alert.direction === 'above'
                      ? 'text-primary bg-primary/10'
                      : 'text-amber-400 bg-amber-400/10',
                  )}>
                    {alert.direction === 'above' ? '≥' : '≤'} {alert.targetPrice.toFixed(2)}
                  </span>
                </div>
                <div className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                  Now: <span className="text-foreground tabular-nums">${formatPrice(alert.currentPrice)}</span>
                  {pct !== null && (
                    <span className={cn(
                      'flex items-center gap-0.5',
                      pct >= 0 ? 'text-primary' : 'text-destructive',
                    )}>
                      {pct >= 0
                        ? <TrendingUp className="w-2.5 h-2.5" />
                        : <TrendingDown className="w-2.5 h-2.5" />
                      }
                      {Math.abs(pct).toFixed(1)}%
                    </span>
                  )}
                </div>
              </div>

              {/* Distance to target */}
              <div className="text-right shrink-0">
                {diff !== null && (
                  <div className={cn(
                    'text-[10px] tabular-nums',
                    alert.triggered
                      ? 'text-primary font-bold'
                      : Math.abs(diff / alert.targetPrice) < 0.02 ? 'text-amber-400' : 'text-muted-foreground',
                  )}>
                    {alert.triggered ? '✓ HIT' : `${diff >= 0 ? '+' : ''}${diff.toFixed(2)}`}
                  </div>
                )}
              </div>

              {/* Remove */}
              <button
                onClick={() => removeAlert(alert.id)}
                className="shrink-0 text-muted-foreground/40 hover:text-destructive transition-colors"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          )
        })}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between shrink-0 text-[10px] text-muted-foreground/60 font-mono">
        <span>{alerts.length} alert{alerts.length !== 1 ? 's' : ''}</span>
        <button
          className="flex items-center gap-1 hover:text-primary transition-colors"
          onClick={() => setAlerts(prev => { refreshPrices(prev); return prev })}
          disabled={refreshing}
        >
          <RefreshCw className={cn('w-2.5 h-2.5', refreshing && 'animate-spin')} />
          {lastRefresh ? `Updated ${lastRefresh.toLocaleTimeString()}` : 'Refresh prices'}
        </button>
      </div>
    </div>
  )
}
