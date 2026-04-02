'use client'

import { useState, useEffect, useCallback } from 'react'
import { TrendingUp, TrendingDown, X, BarChart2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

const AVAILABLE = [
  { symbol: 'BTC', name: 'Bitcoin',    rank: 1,  high52: 73750, low52: 38500 },
  { symbol: 'ETH', name: 'Ethereum',   rank: 2,  high52: 4070,  low52: 1520  },
  { symbol: 'BNB', name: 'BNB',        rank: 3,  high52: 720,   low52: 210   },
  { symbol: 'SOL', name: 'Solana',     rank: 4,  high52: 210,   low52: 60    },
  { symbol: 'XRP', name: 'XRP',        rank: 5,  high52: 0.93,  low52: 0.44  },
  { symbol: 'ADA', name: 'Cardano',    rank: 6,  high52: 0.82,  low52: 0.24  },
  { symbol: 'AVAX', name: 'Avalanche', rank: 7,  high52: 59,    low52: 9     },
  { symbol: 'DOGE', name: 'Dogecoin',  rank: 8,  high52: 0.22,  low52: 0.06  },
  { symbol: 'MATIC', name: 'Polygon',  rank: 9,  high52: 1.22,  low52: 0.40  },
  { symbol: 'DOT', name: 'Polkadot',   rank: 10, high52: 12.8,  low52: 3.8   },
  { symbol: 'LINK', name: 'Chainlink', rank: 11, high52: 22,    low52: 5.4   },
  { symbol: 'UNI', name: 'Uniswap',    rank: 12, high52: 15.6,  low52: 3.9   },
  { symbol: 'LTC', name: 'Litecoin',   rank: 13, high52: 114,   low52: 50    },
  { symbol: 'ATOM', name: 'Cosmos',    rank: 14, high52: 14.5,  low52: 5.2   },
]

const MCAP_LABELS: Record<string, string> = {
  BTC: '$1.27T', ETH: '$432B', BNB: '$88B', SOL: '$79B', XRP: '$64B',
  ADA: '$18B', AVAX: '$14B', DOGE: '$22B', MATIC: '$9B', DOT: '$10B',
  LINK: '$14B', UNI: '$8B', LTC: '$8B', ATOM: '$9B',
}

const COLORS = ['text-blue-400', 'text-purple-400', 'text-emerald-400']
const BAR_COLORS = ['bg-blue-400', 'bg-purple-400', 'bg-emerald-400']

interface SlotData {
  symbol: string
  price: number | null
  change: number | null
  changePercent: number | null
  loading: boolean
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

function PriceBar({ value, max, colorClass }: { value: number; max: number; colorClass: string }) {
  const pct = max > 0 ? Math.max(4, (value / max) * 100) : 4
  return (
    <div className="h-4 bg-muted rounded overflow-hidden">
      <div className={cn('h-full rounded transition-all duration-500', colorClass)} style={{ width: `${pct}%` }} />
    </div>
  )
}

export function CryptoCompare() {
  const [slots, setSlots] = useState<(string | null)[]>(['BTC', 'ETH', null])
  const [data, setData] = useState<Record<string, SlotData>>({})

  const fetchSymbol = useCallback(async (sym: string): Promise<SlotData> => {
    try {
      const res = await fetch(`/api/stock/${sym}-USD`)
      const d = await res.json()
      if (d.error || !d.price) return { symbol: sym, price: null, change: null, changePercent: null, loading: false }
      return { symbol: sym, price: d.price, change: d.change ?? null, changePercent: d.changePercent ?? null, loading: false }
    } catch {
      return { symbol: sym, price: null, change: null, changePercent: null, loading: false }
    }
  }, [])

  useEffect(() => {
    const toFetch = slots.filter((s): s is string => s !== null && !(s in data))
    if (toFetch.length === 0) return
    toFetch.forEach(sym => {
      setData(prev => ({ ...prev, [sym]: { symbol: sym, price: null, change: null, changePercent: null, loading: true } }))
      fetchSymbol(sym).then(result => setData(prev => ({ ...prev, [sym]: result })))
    })
  }, [slots, data, fetchSymbol])

  const setSlot = (idx: number, sym: string | null) => {
    setSlots(prev => { const n = [...prev]; n[idx] = sym; return n })
  }

  const clearSlot = (idx: number) => setSlot(idx, null)

  const activeSyms = slots.filter((s): s is string => s !== null)
  const prices = activeSyms.map(s => data[s]?.price ?? 0)
  const maxPrice = Math.max(...prices.filter(p => p > 0), 1)

  return (
    <div className="font-mono space-y-4">
      <div className="flex items-center gap-2">
        <BarChart2 className="h-4 w-4 text-primary" />
        <h1 className="text-lg font-bold">Compare Cryptos</h1>
        <span className="text-xs text-muted-foreground">Up to 3 at once</span>
      </div>

      {/* Slot Selectors */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {slots.map((sym, idx) => (
          <Card key={idx} className={cn('relative', sym && 'border-primary/30')}>
            <div className="flex items-center justify-between mb-2">
              <span className={cn('text-xs font-bold', COLORS[idx])}>Slot {idx + 1}</span>
              {sym && (
                <button onClick={() => clearSlot(idx)} className="text-muted-foreground hover:text-red-500 transition-colors">
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
            <select
              className="w-full bg-muted border border-border rounded px-2 py-1 text-sm font-mono"
              value={sym ?? ''}
              onChange={e => setSlot(idx, e.target.value || null)}
            >
              <option value="">— Select —</option>
              {AVAILABLE.filter(a => !slots.includes(a.symbol) || a.symbol === sym).map(a => (
                <option key={a.symbol} value={a.symbol}>{a.symbol} – {a.name}</option>
              ))}
            </select>
            {sym && data[sym] && (
              <div className="mt-2">
                <p className="text-lg font-bold">{data[sym].loading ? '...' : fmtPrice(data[sym].price)}</p>
                <p className={cn('text-xs', (data[sym].changePercent ?? 0) >= 0 ? 'text-green-500' : 'text-red-500')}>
                  {fmtPct(data[sym].changePercent)}
                </p>
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* Comparison Table */}
      {activeSyms.length > 0 && (
        <Card>
          <SectionTitle>Side-by-Side Metrics</SectionTitle>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-muted-foreground border-b border-border">
                  <th className="text-left py-2 pr-4">Metric</th>
                  {activeSyms.map((s, i) => (
                    <th key={s} className={cn('text-right py-2 px-2', COLORS[i])}>{s}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                <tr>
                  <td className="py-2 pr-4 text-muted-foreground">Price</td>
                  {activeSyms.map(s => (
                    <td key={s} className="py-2 px-2 text-right font-semibold">
                      {data[s]?.loading ? '...' : fmtPrice(data[s]?.price ?? null)}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-2 pr-4 text-muted-foreground">24h Change</td>
                  {activeSyms.map(s => {
                    const pct = data[s]?.changePercent ?? null
                    return (
                      <td key={s} className={cn('py-2 px-2 text-right', pct === null ? 'text-muted-foreground' : pct >= 0 ? 'text-green-500' : 'text-red-500')}>
                        <span className="flex items-center justify-end gap-0.5">
                          {pct !== null && (pct >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />)}
                          {fmtPct(pct)}
                        </span>
                      </td>
                    )
                  })}
                </tr>
                <tr>
                  <td className="py-2 pr-4 text-muted-foreground">Market Cap Rank</td>
                  {activeSyms.map(s => {
                    const info = AVAILABLE.find(a => a.symbol === s)
                    return <td key={s} className="py-2 px-2 text-right">#{info?.rank ?? '—'}</td>
                  })}
                </tr>
                <tr>
                  <td className="py-2 pr-4 text-muted-foreground">Market Cap</td>
                  {activeSyms.map(s => (
                    <td key={s} className="py-2 px-2 text-right text-muted-foreground">{MCAP_LABELS[s] ?? '—'}</td>
                  ))}
                </tr>
                <tr>
                  <td className="py-2 pr-4 text-muted-foreground">52w High</td>
                  {activeSyms.map(s => {
                    const info = AVAILABLE.find(a => a.symbol === s)
                    return <td key={s} className="py-2 px-2 text-right text-green-500">{info ? fmtPrice(info.high52) : '—'}</td>
                  })}
                </tr>
                <tr>
                  <td className="py-2 pr-4 text-muted-foreground">52w Low</td>
                  {activeSyms.map(s => {
                    const info = AVAILABLE.find(a => a.symbol === s)
                    return <td key={s} className="py-2 px-2 text-right text-red-500">{info ? fmtPrice(info.low52) : '—'}</td>
                  })}
                </tr>
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Bar Chart */}
      {activeSyms.length > 1 && prices.some(p => p > 0) && (
        <Card>
          <SectionTitle>Relative Price (USD)</SectionTitle>
          <div className="space-y-3">
            {activeSyms.map((s, i) => {
              const p = data[s]?.price ?? 0
              return (
                <div key={s} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className={COLORS[i]}>{s}</span>
                    <span className="text-muted-foreground">{fmtPrice(p || null)}</span>
                  </div>
                  <PriceBar value={p} max={maxPrice} colorClass={BAR_COLORS[i]} />
                </div>
              )
            })}
          </div>
          <p className="text-xs text-muted-foreground mt-2">Bar length proportional to current USD price</p>
        </Card>
      )}

      {activeSyms.length === 0 && (
        <Card className="text-center py-8">
          <BarChart2 className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Select coins above to compare them</p>
        </Card>
      )}
    </div>
  )
}
