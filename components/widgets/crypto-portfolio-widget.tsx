'use client'

import { useState, useEffect } from 'react'
import { Plus, Trash2, TrendingUp, TrendingDown, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'

const STORAGE_KEY = 'widget-crypto-portfolio'

interface Holding {
  id: string
  coin: string
  amount: number
  buyPrice: number
  currentPrice: number | null
}

const COINS = ['BTC', 'ETH', 'SOL', 'BNB', 'XRP', 'ADA', 'DOGE', 'MATIC', 'AVAX', 'DOT']

export function CryptoPortfolioWidget() {
  const [holdings, setHoldings] = useState<Holding[]>([])
  const [showAdd, setShowAdd] = useState(false)
  const [coin, setCoin] = useState('BTC')
  const [amount, setAmount] = useState('')
  const [buyPrice, setBuyPrice] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) setHoldings(JSON.parse(saved))
    } catch {}
  }, [])

  const persist = (data: Holding[]) => {
    setHoldings(data)
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)) } catch {}
  }

  const fetchPrices = async (list: Holding[]) => {
    if (list.length === 0) return
    setLoading(true)
    const unique = [...new Set(list.map(h => h.coin))]
    const priceMap: Record<string, number | null> = {}
    await Promise.all(unique.map(async (c) => {
      try {
        const res = await fetch(`/api/stock/${c}-USD`)
        if (res.ok) {
          const d = await res.json()
          priceMap[c] = d.price ?? null
        }
      } catch { priceMap[c] = null }
    }))
    setHoldings(prev => prev.map(h => ({ ...h, currentPrice: priceMap[h.coin] ?? h.currentPrice })))
    setLoading(false)
  }

  useEffect(() => {
    if (holdings.length > 0) fetchPrices(holdings)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const addHolding = () => {
    const amt = parseFloat(amount)
    const bp = parseFloat(buyPrice)
    if (!coin || isNaN(amt) || isNaN(bp) || amt <= 0) return
    const updated = [...holdings, { id: String(Date.now()), coin, amount: amt, buyPrice: bp, currentPrice: null }]
    persist(updated)
    setAmount(''); setBuyPrice(''); setShowAdd(false)
    fetchPrices(updated)
  }

  const totalValue = holdings.reduce((s, h) => s + (h.currentPrice ?? h.buyPrice) * h.amount, 0)
  const totalCost = holdings.reduce((s, h) => s + h.buyPrice * h.amount, 0)
  const totalPnl = totalValue - totalCost
  const pctPnl = totalCost > 0 ? (totalPnl / totalCost) * 100 : 0

  return (
    <div className="p-4 flex flex-col gap-3 h-full font-mono text-xs">
      <div className="flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Crypto Portfolio</span>
        <button onClick={() => fetchPrices(holdings)} disabled={loading} className="text-muted-foreground hover:text-foreground transition-colors">
          <RefreshCw className={cn('w-3 h-3', loading && 'animate-spin')} />
        </button>
      </div>

      {holdings.length > 0 && (
        <div className="grid grid-cols-2 gap-2">
          <div className="border border-border rounded-sm p-2">
            <div className="text-[9px] text-muted-foreground uppercase">Value</div>
            <div className="font-bold tabular-nums">${totalValue.toLocaleString('en-US', { maximumFractionDigits: 2 })}</div>
          </div>
          <div className="border border-border rounded-sm p-2">
            <div className="text-[9px] text-muted-foreground uppercase">P&amp;L</div>
            <div className={cn('font-bold tabular-nums flex items-center gap-0.5', totalPnl >= 0 ? 'text-green-500' : 'text-destructive')}>
              {totalPnl >= 0 ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
              {totalPnl >= 0 ? '+' : ''}{pctPnl.toFixed(1)}%
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto space-y-1.5 min-h-0">
        {holdings.length === 0 && !showAdd && (
          <div className="text-muted-foreground text-center py-4 text-[10px]">No holdings. Add a position.</div>
        )}
        {holdings.map(h => {
          const cp = h.currentPrice ?? h.buyPrice
          const pnl = (cp - h.buyPrice) * h.amount
          const pct = h.buyPrice > 0 ? ((cp - h.buyPrice) / h.buyPrice) * 100 : 0
          return (
            <div key={h.id} className="flex items-center justify-between border border-border rounded-sm px-2 py-1.5">
              <div>
                <div className="font-semibold">{h.coin}</div>
                <div className="text-[9px] text-muted-foreground tabular-nums">{h.amount} @ ${h.buyPrice.toFixed(2)}</div>
              </div>
              <div className="text-right flex items-center gap-2">
                <div>
                  <div className="tabular-nums">${(cp * h.amount).toFixed(2)}</div>
                  <div className={cn('text-[9px] tabular-nums', pnl >= 0 ? 'text-green-500' : 'text-destructive')}>
                    {pnl >= 0 ? '+' : ''}{pct.toFixed(1)}%
                  </div>
                </div>
                <button onClick={() => persist(holdings.filter(x => x.id !== h.id))} className="text-muted-foreground/40 hover:text-destructive">
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {showAdd ? (
        <div className="space-y-1.5 border border-primary/30 rounded-sm p-2 bg-primary/5 shrink-0">
          <div className="grid grid-cols-3 gap-1.5">
            <select value={coin} onChange={e => setCoin(e.target.value)}
              className="col-span-1 h-7 px-1.5 text-xs font-mono bg-background border border-border rounded-sm text-foreground focus:outline-none">
              {COINS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <input className="h-7 px-1.5 text-xs font-mono bg-background border border-border rounded-sm text-foreground focus:outline-none focus:border-primary/60 placeholder:text-muted-foreground/50"
              placeholder="Amount" type="number" min="0" step="any" value={amount} onChange={e => setAmount(e.target.value)} />
            <input className="h-7 px-1.5 text-xs font-mono bg-background border border-border rounded-sm text-foreground focus:outline-none focus:border-primary/60 placeholder:text-muted-foreground/50"
              placeholder="Buy $" type="number" min="0" step="any" value={buyPrice} onChange={e => setBuyPrice(e.target.value)} />
          </div>
          <div className="flex gap-1.5">
            <button onClick={addHolding} className="flex-1 h-6 text-[10px] bg-primary text-primary-foreground rounded-sm hover:bg-primary/90">Add</button>
            <button onClick={() => setShowAdd(false)} className="h-6 px-3 text-[10px] border border-border rounded-sm text-muted-foreground hover:text-foreground">Cancel</button>
          </div>
        </div>
      ) : (
        <button onClick={() => setShowAdd(true)} className="shrink-0 h-7 w-full text-[10px] border border-border rounded-sm text-muted-foreground hover:border-primary/60 hover:text-foreground transition-colors flex items-center justify-center gap-1">
          <Plus className="w-3 h-3" />Add Position
        </button>
      )}
    </div>
  )
}
