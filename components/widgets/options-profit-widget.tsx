'use client'

import { useState, useMemo } from 'react'
import { cn } from '@/lib/utils'

export function OptionsProfitWidget() {
  const [type, setType] = useState<'call' | 'put'>('call')
  const [stockPrice, setStockPrice] = useState('150')
  const [strikePrice, setStrikePrice] = useState('155')
  const [premium, setPremium] = useState('3.50')
  const [contracts, setContracts] = useState('1')

  const result = useMemo(() => {
    const s = parseFloat(stockPrice)
    const k = parseFloat(strikePrice)
    const p = parseFloat(premium)
    const c = parseInt(contracts) || 1
    if ([s, k, p].some(isNaN) || s <= 0 || k <= 0 || p <= 0) return null

    const multiplier = 100 * c
    const totalPremium = p * multiplier
    const breakeven = type === 'call' ? k + p : k - p
    const maxLoss = -totalPremium

    // P&L table for ±20% price range
    const step = s * 0.04
    const prices: number[] = []
    for (let i = -5; i <= 5; i++) {
      prices.push(Math.round((s + i * step) * 100) / 100)
    }

    const pnlTable = prices.map(price => {
      let intrinsic = 0
      if (type === 'call') intrinsic = Math.max(0, price - k)
      else intrinsic = Math.max(0, k - price)
      const pnl = (intrinsic - p) * multiplier
      return { price, pnl }
    })

    return { breakeven, maxLoss, totalPremium, pnlTable }
  }, [type, stockPrice, strikePrice, premium, contracts])

  const fmt = (n: number) => `$${Math.abs(n).toLocaleString('en-US', { maximumFractionDigits: 0 })}`

  return (
    <div className="p-4 flex flex-col gap-3 h-full font-mono text-xs">
      <div className="flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Options P&amp;L</span>
        <div className="flex gap-1">
          {(['call', 'put'] as const).map(t => (
            <button key={t} onClick={() => setType(t)}
              className={cn('px-2 py-0.5 rounded text-[9px] uppercase font-semibold transition-colors',
                type === t ? (t === 'call' ? 'bg-green-500/20 text-green-500 border border-green-500/40' : 'bg-destructive/20 text-destructive border border-destructive/40')
                  : 'border border-border text-muted-foreground hover:text-foreground')}>
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-1.5">
        {[
          { label: 'Stock Price ($)', val: stockPrice, set: setStockPrice },
          { label: 'Strike Price ($)', val: strikePrice, set: setStrikePrice },
          { label: 'Premium Paid ($)', val: premium, set: setPremium, step: '0.01' },
          { label: 'Contracts', val: contracts, set: setContracts, step: '1', min: '1' },
        ].map(({ label, val, set, step, min }) => (
          <div key={label}>
            <label className="text-[9px] text-muted-foreground uppercase block mb-0.5">{label}</label>
            <input type="number" min={min ?? '0'} step={step ?? 'any'} value={val} onChange={e => set(e.target.value)}
              className="w-full h-7 px-2 text-xs font-mono bg-background border border-border rounded-sm text-foreground focus:outline-none focus:border-primary/60 tabular-nums" />
          </div>
        ))}
      </div>

      {result && (
        <>
          <div className="grid grid-cols-2 gap-1.5">
            <div className="border border-border rounded-sm p-2">
              <div className="text-[9px] text-muted-foreground">Breakeven</div>
              <div className="font-bold tabular-nums">${result.breakeven.toFixed(2)}</div>
            </div>
            <div className="border border-destructive/40 bg-destructive/5 rounded-sm p-2">
              <div className="text-[9px] text-muted-foreground">Max Loss</div>
              <div className="font-bold text-destructive tabular-nums">-{fmt(result.totalPremium)}</div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto min-h-0">
            <div className="text-[9px] text-muted-foreground uppercase tracking-wider mb-1">P&amp;L at Expiry</div>
            <div className="space-y-0.5">
              {result.pnlTable.map(row => (
                <div key={row.price} className="flex items-center justify-between border border-border/40 rounded-sm px-2 py-0.5">
                  <span className="text-muted-foreground tabular-nums">${row.price.toFixed(2)}</span>
                  <span className={cn('font-semibold tabular-nums', row.pnl >= 0 ? 'text-green-500' : 'text-destructive')}>
                    {row.pnl >= 0 ? '+' : '-'}{fmt(row.pnl)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
