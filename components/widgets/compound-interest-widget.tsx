'use client'

import { useState, useMemo } from 'react'
import { cn } from '@/lib/utils'

const FREQ_OPTIONS = [
  { label: 'Annual', value: 1 },
  { label: 'Semi-Annual', value: 2 },
  { label: 'Quarterly', value: 4 },
  { label: 'Monthly', value: 12 },
  { label: 'Daily', value: 365 },
]

export function CompoundInterestWidget() {
  const [principal, setPrincipal] = useState('10000')
  const [rate, setRate] = useState('7')
  const [freq, setFreq] = useState(12)
  const [years, setYears] = useState('10')
  const [monthly, setMonthly] = useState('100')

  const result = useMemo(() => {
    const p = parseFloat(principal)
    const r = parseFloat(rate) / 100
    const n = freq
    const t = parseFloat(years)
    const m = parseFloat(monthly) || 0
    if ([p, r, n, t].some(isNaN) || p < 0 || r <= 0 || t <= 0) return null

    // Future value of principal
    const fvPrincipal = p * Math.pow(1 + r / n, n * t)

    // Future value of monthly contributions (convert to per-period)
    let fvContribs = 0
    if (m > 0) {
      const rPerMonth = r / 12
      const totalMonths = t * 12
      fvContribs = m * ((Math.pow(1 + rPerMonth, totalMonths) - 1) / rPerMonth)
    }

    const futureValue = fvPrincipal + fvContribs
    const totalContribs = p + m * t * 12
    const totalInterest = futureValue - totalContribs

    return { futureValue, totalContribs, totalInterest }
  }, [principal, rate, freq, years, monthly])

  const fmt = (n: number) => `$${n.toLocaleString('en-US', { maximumFractionDigits: 0 })}`

  return (
    <div className="p-4 flex flex-col gap-3 h-full font-mono text-xs">
      <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Compound Interest</span>

      <div className="space-y-1.5">
        {[
          { label: 'Principal ($)', val: principal, set: setPrincipal },
          { label: 'Annual Rate (%)', val: rate, set: setRate, step: '0.1' },
          { label: 'Years', val: years, set: setYears },
          { label: 'Monthly Contribution ($)', val: monthly, set: setMonthly },
        ].map(({ label, val, set, step }) => (
          <div key={label} className="flex items-center justify-between gap-2">
            <label className="text-[9px] text-muted-foreground uppercase tracking-wider shrink-0 w-36">{label}</label>
            <input type="number" min="0" step={step ?? '1'} value={val} onChange={e => set(e.target.value)}
              className="flex-1 min-w-0 h-7 px-2 text-xs font-mono bg-background border border-border rounded-sm text-foreground focus:outline-none focus:border-primary/60 tabular-nums" />
          </div>
        ))}
        <div className="flex items-center justify-between gap-2">
          <label className="text-[9px] text-muted-foreground uppercase tracking-wider shrink-0 w-36">Compounding</label>
          <select value={freq} onChange={e => setFreq(Number(e.target.value))}
            className="flex-1 min-w-0 h-7 px-2 text-xs font-mono bg-background border border-border rounded-sm text-foreground focus:outline-none">
            {FREQ_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      </div>

      {result ? (
        <div className="flex-1 space-y-2">
          <div className="grid grid-cols-1 gap-1.5">
            {[
              { label: 'Future Value', value: fmt(result.futureValue), highlight: true },
              { label: 'Total Contributions', value: fmt(result.totalContribs) },
              { label: 'Total Interest Earned', value: fmt(result.totalInterest), color: 'text-green-500' },
            ].map(({ label, value, highlight, color }) => (
              <div key={label} className={cn('border rounded-sm px-3 py-2 flex items-center justify-between', highlight ? 'border-primary/40 bg-primary/5' : 'border-border')}>
                <span className="text-muted-foreground">{label}</span>
                <span className={cn('font-bold tabular-nums', highlight && 'text-primary', color)}>{value}</span>
              </div>
            ))}
          </div>

          {result.totalContribs > 0 && (
            <div className="border border-border rounded-sm p-2 space-y-1">
              <div className="text-[9px] text-muted-foreground uppercase">Growth breakdown</div>
              <div className="h-2.5 bg-border rounded-full overflow-hidden flex">
                <div className="h-full bg-primary/50" style={{ width: `${(result.totalContribs / result.futureValue) * 100}%` }} />
                <div className="h-full bg-green-500/60" style={{ width: `${(result.totalInterest / result.futureValue) * 100}%` }} />
              </div>
              <div className="flex justify-between text-[9px] text-muted-foreground">
                <span><span className="inline-block w-2 h-2 rounded-sm bg-primary/50 mr-1" />Contributions</span>
                <span><span className="inline-block w-2 h-2 rounded-sm bg-green-500/60 mr-1" />Interest</span>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-muted-foreground text-[10px] text-center flex-1">Enter valid values to calculate</div>
      )}
    </div>
  )
}
