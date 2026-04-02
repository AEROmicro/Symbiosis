'use client'

import { useState, useMemo } from 'react'
import { cn } from '@/lib/utils'

export function DripCalculatorWidget() {
  const [shares, setShares] = useState('100')
  const [sharePrice, setSharePrice] = useState('50')
  const [annualDividend, setAnnualDividend] = useState('2.00')
  const [priceGrowth, setPriceGrowth] = useState('5')
  const [years, setYears] = useState('10')

  const result = useMemo(() => {
    const s0 = parseFloat(shares)
    const p0 = parseFloat(sharePrice)
    const div = parseFloat(annualDividend)
    const g = parseFloat(priceGrowth) / 100
    const t = parseInt(years)
    if ([s0, p0, div, g, t].some(isNaN) || s0 <= 0 || p0 <= 0 || div < 0 || t <= 0) return null

    let sharesHeld = s0
    let currentPrice = p0
    let totalDividends = 0
    const table: { year: number; shares: number; price: number; value: number; dividends: number }[] = []

    for (let y = 1; y <= t; y++) {
      const annualDiv = sharesHeld * div
      totalDividends += annualDiv
      currentPrice = currentPrice * (1 + g)
      const newShares = currentPrice > 0 ? annualDiv / currentPrice : 0
      sharesHeld += newShares
      if (y % Math.max(1, Math.floor(t / 5)) === 0 || y === t) {
        table.push({ year: y, shares: sharesHeld, price: currentPrice, value: sharesHeld * currentPrice, dividends: totalDividends })
      }
    }

    // Without DRIP comparison
    const finalPriceNoDrip = p0 * Math.pow(1 + g, t)
    const noDripDividends = s0 * div * t
    const noDripValue = s0 * finalPriceNoDrip + noDripDividends
    const dripValue = sharesHeld * currentPrice

    return { sharesHeld, finalPrice: currentPrice, totalDividends, dripValue, noDripValue, noDripDividends, table }
  }, [shares, sharePrice, annualDividend, priceGrowth, years])

  const fmt = (n: number) => `$${n.toLocaleString('en-US', { maximumFractionDigits: 0 })}`

  return (
    <div className="p-4 flex flex-col gap-3 h-full font-mono text-xs">
      <span className="text-[10px] uppercase tracking-widest text-muted-foreground">DRIP Calculator</span>

      <div className="grid grid-cols-2 gap-1.5">
        {[
          { label: 'Initial Shares', val: shares, set: setShares },
          { label: 'Share Price ($)', val: sharePrice, set: setSharePrice },
          { label: 'Annual Div/Share ($)', val: annualDividend, set: setAnnualDividend, step: '0.01' },
          { label: 'Price Growth %/yr', val: priceGrowth, set: setPriceGrowth, step: '0.1' },
          { label: 'Years', val: years, set: setYears, step: '1' },
        ].map(({ label, val, set, step }) => (
          <div key={label}>
            <label className="text-[9px] text-muted-foreground uppercase block mb-0.5">{label}</label>
            <input type="number" min="0" step={step ?? 'any'} value={val} onChange={e => set(e.target.value)}
              className="w-full h-7 px-2 text-xs font-mono bg-background border border-border rounded-sm text-foreground focus:outline-none focus:border-primary/60 tabular-nums" />
          </div>
        ))}
      </div>

      {result && (
        <div className="flex-1 overflow-y-auto space-y-2 min-h-0">
          <div className="grid grid-cols-2 gap-1.5">
            <div className="border border-primary/40 bg-primary/5 rounded-sm p-2">
              <div className="text-[9px] text-muted-foreground">With DRIP</div>
              <div className="font-bold text-primary tabular-nums">{fmt(result.dripValue)}</div>
              <div className="text-[9px] text-muted-foreground tabular-nums">{result.sharesHeld.toFixed(2)} shares</div>
            </div>
            <div className="border border-border rounded-sm p-2">
              <div className="text-[9px] text-muted-foreground">Without DRIP</div>
              <div className="font-bold tabular-nums">{fmt(result.noDripValue)}</div>
              <div className="text-[9px] text-muted-foreground tabular-nums">{fmt(result.noDripDividends)} dividends</div>
            </div>
          </div>

          <div className="border border-green-500/30 bg-green-500/5 rounded-sm p-2 flex items-center justify-between">
            <span className="text-[9px] text-muted-foreground">DRIP advantage</span>
            <span className="font-bold text-green-500 tabular-nums">+{fmt(result.dripValue - result.noDripValue)}</span>
          </div>

          <div>
            <div className="text-[9px] text-muted-foreground uppercase tracking-wider mb-1">Growth Table</div>
            <div className="space-y-0.5">
              {result.table.map(row => (
                <div key={row.year} className="flex items-center justify-between border border-border/40 rounded-sm px-2 py-0.5">
                  <span className="text-muted-foreground">Yr {row.year}</span>
                  <span className="tabular-nums text-[9px] text-muted-foreground">{row.shares.toFixed(1)} sh</span>
                  <span className="font-semibold tabular-nums">{fmt(row.value)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
