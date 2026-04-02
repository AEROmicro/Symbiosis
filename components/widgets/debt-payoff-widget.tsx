'use client'

import { useState, useMemo } from 'react'
import { cn } from '@/lib/utils'

export function DebtPayoffWidget() {
  const [balance, setBalance] = useState('5000')
  const [rate, setRate] = useState('19.99')
  const [payment, setPayment] = useState('200')

  const result = useMemo(() => {
    const b = parseFloat(balance)
    const r = parseFloat(rate) / 100 / 12
    const p = parseFloat(payment)
    if (isNaN(b) || isNaN(r) || isNaN(p) || b <= 0 || p <= 0) return null
    if (r > 0 && p <= b * r) return { months: Infinity, totalInterest: Infinity, totalPaid: Infinity }
    let remaining = b
    let totalInterest = 0
    let months = 0
    while (remaining > 0.01 && months < 600) {
      months++
      const interest = remaining * r
      totalInterest += interest
      remaining += interest
      remaining -= Math.min(p, remaining)
    }
    return { months, totalInterest, totalPaid: b + totalInterest }
  }, [balance, rate, payment])

  const formatMo = (n: number) => {
    if (!isFinite(n)) return '∞'
    const y = Math.floor(n / 12)
    const m = n % 12
    return y > 0 ? `${y}y ${m}m` : `${m}mo`
  }

  const fmt = (n: number) => isFinite(n) ? `$${n.toLocaleString('en-US', { maximumFractionDigits: 0 })}` : '∞'

  return (
    <div className="p-4 flex flex-col gap-3 h-full font-mono text-xs">
      <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Debt Payoff</span>

      <div className="space-y-2">
        {[
          { label: 'Balance ($)', val: balance, set: setBalance, placeholder: '5000' },
          { label: 'Interest Rate (%)', val: rate, set: setRate, placeholder: '19.99', step: '0.01' },
          { label: 'Monthly Payment ($)', val: payment, set: setPayment, placeholder: '200' },
        ].map(({ label, val, set, placeholder, step }) => (
          <div key={label}>
            <label className="text-[9px] text-muted-foreground uppercase tracking-wider block mb-0.5">{label}</label>
            <input type="number" min="0" step={step ?? '1'} value={val} onChange={e => set(e.target.value)}
              placeholder={placeholder}
              className="w-full h-7 px-2 text-xs font-mono bg-background border border-border rounded-sm text-foreground focus:outline-none focus:border-primary/60 tabular-nums" />
          </div>
        ))}
      </div>

      {result ? (
        result.months === Infinity ? (
          <div className="text-destructive text-xs">Payment too low — doesn't cover monthly interest.</div>
        ) : (
          <div className="space-y-2 flex-1">
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { label: 'Payoff Time', value: formatMo(result.months) },
                { label: 'Total Interest', value: fmt(result.totalInterest) },
                { label: 'Total Paid', value: fmt(result.totalPaid) },
              ].map(({ label, value }) => (
                <div key={label} className="border border-border rounded-sm p-2 text-center">
                  <div className="text-[9px] text-muted-foreground">{label}</div>
                  <div className={cn('font-bold tabular-nums mt-0.5', label === 'Total Interest' && 'text-destructive')}>{value}</div>
                </div>
              ))}
            </div>

            <div className="border border-border rounded-sm p-2 space-y-1">
              <div className="text-[9px] text-muted-foreground uppercase tracking-wider">Interest vs Principal</div>
              <div className="h-2.5 bg-border rounded-full overflow-hidden flex">
                {(() => {
                  const b = parseFloat(balance)
                  const total = result.totalPaid
                  const pPct = total > 0 ? (b / total) * 100 : 0
                  return (
                    <>
                      <div className="h-full bg-primary/60" style={{ width: `${pPct}%` }} />
                      <div className="h-full bg-destructive/60" style={{ width: `${100 - pPct}%` }} />
                    </>
                  )
                })()}
              </div>
              <div className="flex justify-between text-[9px] text-muted-foreground">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-primary/60 inline-block" />Principal</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-destructive/60 inline-block" />Interest</span>
              </div>
            </div>
          </div>
        )
      ) : (
        <div className="text-muted-foreground text-[10px] text-center">Enter values above to calculate</div>
      )}
    </div>
  )
}
