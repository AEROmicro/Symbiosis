'use client'

import { useEffect, useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Trade {
  id: string
  symbol: string
  side: 'BUY' | 'SELL'
  price: number
  qty: number
  date: string
  notes: string
}

const TRADE_JOURNAL_KEY = 'symbiosis-trade-journal'

export function TradeJournalWidget() {
  const [trades, setTrades] = useState<Trade[]>([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ symbol: '', side: 'BUY' as 'BUY' | 'SELL', price: '', qty: '', date: new Date().toISOString().split('T')[0], notes: '' })

  useEffect(() => {
    try {
      const stored = localStorage.getItem(TRADE_JOURNAL_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed)) setTrades(parsed)
      }
    } catch { /* ignore */ }
  }, [])

  const persist = (next: Trade[]) => {
    setTrades(next)
    try { localStorage.setItem(TRADE_JOURNAL_KEY, JSON.stringify(next)) } catch { /* ignore */ }
  }

  const handleAdd = () => {
    const price = parseFloat(form.price)
    const qty = parseFloat(form.qty)
    if (!form.symbol.trim() || isNaN(price) || isNaN(qty) || price <= 0 || qty <= 0) return
    const trade: Trade = {
      id: Date.now().toString(),
      symbol: form.symbol.toUpperCase().trim(),
      side: form.side,
      price,
      qty,
      date: form.date,
      notes: form.notes,
    }
    persist([trade, ...trades])
    setForm({ symbol: '', side: 'BUY', price: '', qty: '', date: new Date().toISOString().split('T')[0], notes: '' })
    setShowForm(false)
  }

  const handleDelete = (id: string) => {
    persist(trades.filter(t => t.id !== id))
  }

  const totalPnl = trades.reduce((acc, t) => {
    const notional = t.price * t.qty
    return t.side === 'BUY' ? acc - notional : acc + notional
  }, 0)

  return (
    <div className="flex flex-col h-full font-mono text-xs">
      {/* toolbar */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">{trades.length} trade{trades.length !== 1 ? 's' : ''}</span>
          {trades.length > 0 && (
            <span className={cn('font-semibold', totalPnl >= 0 ? 'text-primary' : 'text-destructive')}>
              Net: {totalPnl >= 0 ? '+' : ''}${totalPnl.toFixed(2)}
            </span>
          )}
        </div>
        <button
          onClick={() => setShowForm(v => !v)}
          className="flex items-center gap-1 px-2 py-0.5 rounded border border-border hover:border-primary/50 hover:text-primary transition-colors text-muted-foreground"
        >
          <Plus className="w-3 h-3" />
          Add
        </button>
      </div>

      {/* add form */}
      {showForm && (
        <div className="grid grid-cols-2 gap-2 px-3 py-2 border-b border-border bg-muted/5 shrink-0">
          <input
            className="col-span-1 bg-background border border-border rounded px-2 py-1 text-xs font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
            placeholder="Symbol (e.g. AAPL)"
            value={form.symbol}
            onChange={e => setForm(f => ({ ...f, symbol: e.target.value }))}
          />
          <select
            className="col-span-1 bg-background border border-border rounded px-2 py-1 text-xs font-mono text-foreground focus:outline-none focus:border-primary/50"
            value={form.side}
            onChange={e => setForm(f => ({ ...f, side: e.target.value as 'BUY' | 'SELL' }))}
          >
            <option value="BUY">BUY</option>
            <option value="SELL">SELL</option>
          </select>
          <input
            className="bg-background border border-border rounded px-2 py-1 text-xs font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
            placeholder="Price"
            type="number"
            min="0"
            step="0.01"
            value={form.price}
            onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
          />
          <input
            className="bg-background border border-border rounded px-2 py-1 text-xs font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
            placeholder="Quantity"
            type="number"
            min="0"
            step="1"
            value={form.qty}
            onChange={e => setForm(f => ({ ...f, qty: e.target.value }))}
          />
          <input
            className="bg-background border border-border rounded px-2 py-1 text-xs font-mono text-foreground focus:outline-none focus:border-primary/50"
            type="date"
            value={form.date}
            onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
          />
          <input
            className="bg-background border border-border rounded px-2 py-1 text-xs font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
            placeholder="Notes (optional)"
            value={form.notes}
            onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
          />
          <button
            onClick={handleAdd}
            className="col-span-2 py-1 rounded border border-primary/50 bg-primary/10 text-primary hover:bg-primary/20 transition-colors text-xs font-mono"
          >
            Log Trade
          </button>
        </div>
      )}

      {/* table header */}
      <div className="grid grid-cols-[3rem_3rem_4rem_4rem_5rem_1fr_1.5rem] gap-x-1 px-3 py-1 text-[9px] text-muted-foreground border-b border-border uppercase tracking-wide shrink-0">
        <span>Sym</span>
        <span>Side</span>
        <span className="text-right">Price</span>
        <span className="text-right">Qty</span>
        <span className="text-right">Notional</span>
        <span>Date</span>
        <span />
      </div>

      <div className="flex-1 overflow-y-auto">
        {trades.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground text-xs">
            No trades logged yet
          </div>
        ) : (
          trades.map((t, i) => (
            <div
              key={t.id}
              className={cn(
                'grid grid-cols-[3rem_3rem_4rem_4rem_5rem_1fr_1.5rem] gap-x-1 px-3 py-1.5 border-b border-border/30 hover:bg-muted/10 transition-colors items-center',
                i % 2 === 0 ? '' : 'bg-muted/5'
              )}
            >
              <span className="text-primary font-semibold">{t.symbol}</span>
              <span className={cn('font-semibold', t.side === 'BUY' ? 'text-primary' : 'text-destructive')}>
                {t.side}
              </span>
              <span className="text-right text-foreground">${t.price.toFixed(2)}</span>
              <span className="text-right text-foreground">{t.qty}</span>
              <span className="text-right text-foreground">${(t.price * t.qty).toFixed(2)}</span>
              <span className="text-muted-foreground text-[10px]">{t.date}</span>
              <button
                onClick={() => handleDelete(t.id)}
                className="flex items-center justify-center hover:text-destructive transition-colors text-muted-foreground"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))
        )}
      </div>
      <div className="text-[9px] text-muted-foreground px-3 py-1 border-t border-border shrink-0">
        Stored locally · Net = SELL proceeds − BUY cost
      </div>
    </div>
  )
}
