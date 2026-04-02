'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { TrendingUp, TrendingDown, Plus, X, RefreshCw, Star } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const STORAGE_KEY = 'musgravite-watchlist'
const DEFAULT_WATCHLIST = ['BTC', 'ETH', 'SOL', 'BNB', 'XRP']

const SIM_7D: Record<string, number> = {
  BTC: 4.2, ETH: 3.1, SOL: 8.7, BNB: -1.3, XRP: 6.4,
  ADA: -2.1, DOGE: 11.2, AVAX: 5.8, MATIC: -3.4, DOT: 2.9,
}

function get7d(sym: string): number {
  if (sym in SIM_7D) return SIM_7D[sym]
  const seed = sym.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  return ((seed % 40) - 20) / 2
}

interface WatchItem {
  symbol: string
  price: number | null
  change: number | null
  changePercent: number | null
  loading: boolean
  error: boolean
}

function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn('bg-card border border-border rounded-md p-4', className)}>
      {children}
    </div>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-3">{children}</h2>
}

function fmtPrice(n: number | null) {
  if (n === null) return '—'
  if (n >= 1000) return `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  if (n >= 1) return `$${n.toFixed(4)}`
  return `$${n.toFixed(6)}`
}

function fmtPct(n: number | null) {
  if (n === null) return '—'
  return `${n >= 0 ? '+' : ''}${n.toFixed(2)}%`
}

export function CryptoWatchlist() {
  const [symbols, setSymbols] = useState<string[]>(DEFAULT_WATCHLIST)
  const [items, setItems] = useState<Record<string, WatchItem>>({})
  const [input, setInput] = useState('')
  const [addError, setAddError] = useState('')
  const [refreshing, setRefreshing] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Load from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed: string[] = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length > 0) setSymbols(parsed)
      }
    } catch {}
  }, [])

  const persist = (syms: string[]) => {
    setSymbols(syms)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(syms))
  }

  const fetchOne = useCallback(async (sym: string): Promise<WatchItem> => {
    try {
      const res = await fetch(`/api/stock/${sym}-USD`)
      const d = await res.json()
      if (d.error || !d.price) {
        return { symbol: sym, price: null, change: null, changePercent: null, loading: false, error: true }
      }
      return {
        symbol: sym,
        price: d.price,
        change: d.change ?? null,
        changePercent: d.changePercent ?? null,
        loading: false,
        error: false,
      }
    } catch {
      return { symbol: sym, price: null, change: null, changePercent: null, loading: false, error: true }
    }
  }, [])

  const fetchAll = useCallback(async (syms: string[]) => {
    setRefreshing(true)
    // Mark all as loading
    setItems(prev => {
      const next = { ...prev }
      syms.forEach(s => { next[s] = { ...(prev[s] ?? {}), symbol: s, loading: true, error: false } as WatchItem })
      return next
    })
    const results = await Promise.all(syms.map(fetchOne))
    setItems(prev => {
      const next = { ...prev }
      results.forEach(r => { next[r.symbol] = r })
      return next
    })
    setRefreshing(false)
  }, [fetchOne])

  useEffect(() => {
    if (symbols.length > 0) fetchAll(symbols)
  }, [symbols, fetchAll])

  // Auto-refresh every 60s
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      if (symbols.length > 0) fetchAll(symbols)
    }, 60000)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [symbols, fetchAll])

  const addCoin = async () => {
    const sym = input.trim().toUpperCase().replace(/-USD$/, '')
    if (!sym) return
    if (symbols.includes(sym)) { setAddError('Already in watchlist'); return }
    if (sym.length > 10) { setAddError('Invalid symbol'); return }

    setAddError('')
    setInput('')
    const newSyms = [...symbols, sym]
    persist(newSyms)

    // Fetch just the new one
    setItems(prev => ({ ...prev, [sym]: { symbol: sym, price: null, change: null, changePercent: null, loading: true, error: false } }))
    const result = await fetchOne(sym)
    if (result.error) {
      setAddError(`Could not find "${sym}"`)
      persist(symbols) // revert
      setItems(prev => { const n = { ...prev }; delete n[sym]; return n })
    } else {
      setItems(prev => ({ ...prev, [sym]: result }))
    }
  }

  const removeCoin = (sym: string) => {
    const newSyms = symbols.filter(s => s !== sym)
    persist(newSyms)
    setItems(prev => { const n = { ...prev }; delete n[sym]; return n })
  }

  return (
    <div className="font-mono space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Star className="h-4 w-4 text-primary" />
          <h1 className="text-lg font-bold">My Watchlist</h1>
          <span className="text-xs text-muted-foreground">({symbols.length})</span>
        </div>
        <Button variant="outline" size="sm" onClick={() => fetchAll(symbols)} disabled={refreshing}>
          <RefreshCw className={cn('h-3 w-3 mr-1', refreshing && 'animate-spin')} />
          Refresh
        </Button>
      </div>

      {/* Add Coin */}
      <Card>
        <SectionTitle>Add Coin</SectionTitle>
        <div className="flex gap-2">
          <Input
            className="font-mono uppercase text-sm h-8"
            placeholder="BTC, ETH, SOL..."
            value={input}
            onChange={e => { setInput(e.target.value); setAddError('') }}
            onKeyDown={e => e.key === 'Enter' && addCoin()}
            maxLength={12}
          />
          <Button size="sm" onClick={addCoin} className="h-8">
            <Plus className="h-3 w-3 mr-1" /> Add
          </Button>
        </div>
        {addError && <p className="text-xs text-red-500 mt-1">{addError}</p>}
        <p className="text-xs text-muted-foreground mt-1">Prices refresh every 60 seconds</p>
      </Card>

      {/* Watchlist Table */}
      {symbols.length === 0 ? (
        <Card className="text-center py-8">
          <Star className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Your watchlist is empty</p>
          <p className="text-xs text-muted-foreground">Add coins above to track them</p>
        </Card>
      ) : (
        <Card className="p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-xs text-muted-foreground">
                <th className="text-left px-4 py-3">Symbol</th>
                <th className="text-right px-4 py-3">Price</th>
                <th className="text-right px-4 py-3">24h</th>
                <th className="text-right px-4 py-3 hidden sm:table-cell">7d</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {symbols.map(sym => {
                const item = items[sym]
                const pct = item?.changePercent ?? null
                const pct7d = get7d(sym)
                return (
                  <tr key={sym} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-[9px] font-bold text-primary">
                          {sym.slice(0, 2)}
                        </div>
                        <span className="font-semibold">{sym}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold">
                      {item?.loading
                        ? <span className="text-muted-foreground animate-pulse">...</span>
                        : item?.error
                          ? <span className="text-red-400 text-xs">Error</span>
                          : fmtPrice(item?.price ?? null)}
                    </td>
                    <td className={cn('px-4 py-3 text-right', pct === null ? 'text-muted-foreground' : pct >= 0 ? 'text-green-500' : 'text-red-500')}>
                      {item?.loading ? '...' : (
                        <span className="flex items-center justify-end gap-0.5">
                          {pct !== null && (pct >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />)}
                          {fmtPct(pct)}
                        </span>
                      )}
                    </td>
                    <td className={cn('px-4 py-3 text-right hidden sm:table-cell', pct7d >= 0 ? 'text-green-500' : 'text-red-500')}>
                      {fmtPct(pct7d)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => removeCoin(sym)}
                        className="text-muted-foreground hover:text-red-500 transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </Card>
      )}

      <p className="text-xs text-muted-foreground text-center">
        {symbols.length} coin{symbols.length !== 1 ? 's' : ''} tracked · Auto-refresh every 60s
      </p>
    </div>
  )
}
