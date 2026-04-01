'use client'

import { useEffect, useState } from 'react'
import { BarChart2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface RegionData {
  flag: string
  label: string
  current: number
}

const US_WEEKLY_BASE = [42, 28, 15, -8, -22, 5, 38, 51]

const REGION_BASE: RegionData[] = [
  { flag: '🇺🇸', label: 'US',    current: 51 },
  { flag: '🇪🇺', label: 'EU',    current: 12 },
  { flag: '🇨🇳', label: 'China', current: -18 },
]

function jitterVal(v: number, range = 3): number {
  return Math.round(v + (Math.random() - 0.5) * range * 2)
}

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v))
}

const BAR_MAX = 80

export function EconomicSurpriseIndexWidget() {
  const [usWeekly, setUsWeekly] = useState<number[]>(US_WEEKLY_BASE)
  const [regions, setRegions] = useState<RegionData[]>(REGION_BASE)

  useEffect(() => {
    const id = setInterval(() => {
      setUsWeekly(prev => prev.map(v => clamp(jitterVal(v, 2), -60, 80)))
      setRegions(prev => prev.map(r => ({ ...r, current: clamp(jitterVal(r.current, 2), -60, 80) })))
    }, 60_000)
    return () => clearInterval(id)
  }, [])

  const currentESI = usWeekly[usWeekly.length - 1]
  const isPositive = currentESI >= 0

  // Beats / Misses this "week" based on sign of last 4 bars
  const last4 = usWeekly.slice(-4)
  const beats  = last4.filter(v => v > 0).length
  const misses = last4.filter(v => v < 0).length

  return (
    <div className="p-4 flex flex-col gap-3 h-full overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between shrink-0">
        <div className="flex items-center gap-1.5">
          <BarChart2 className="w-3.5 h-3.5 text-primary" />
          <span className="font-mono text-xs font-semibold text-foreground">ECONOMIC SURPRISE INDEX</span>
        </div>
        <span className="font-mono text-[9px] text-muted-foreground">60s refresh</span>
      </div>

      {/* Current US ESI hero */}
      <div className="flex items-end justify-between shrink-0">
        <div>
          <div className={cn('font-mono text-3xl font-bold tabular-nums', isPositive ? 'text-price-up' : 'text-price-down')}>
            {isPositive ? '+' : ''}{currentESI}
          </div>
          <div className={cn('font-mono text-[10px] mt-0.5 uppercase tracking-wider font-semibold', isPositive ? 'text-price-up' : 'text-price-down')}>
            {isPositive ? '▲ POSITIVE SURPRISE' : '▼ NEGATIVE SURPRISE'}
          </div>
        </div>
        <div className="text-right">
          <div className="font-mono text-[9px] text-muted-foreground">BEATS / MISSES</div>
          <div className="font-mono text-xs text-foreground tabular-nums">
            <span className="text-price-up">{beats}</span>
            <span className="text-muted-foreground mx-1">/</span>
            <span className="text-price-down">{misses}</span>
            <span className="text-muted-foreground ml-1 text-[9px]">last 4 wks</span>
          </div>
        </div>
      </div>

      {/* Bar chart – 8 weekly bars */}
      <div className="shrink-0">
        <div className="font-mono text-[9px] text-muted-foreground mb-1.5 uppercase">🇺🇸 US — Weekly ESI</div>
        <div className="relative flex items-center gap-1" style={{ height: 80 }}>
          {/* Zero line */}
          <div className="absolute left-0 right-0 border-t border-border/60" style={{ top: '50%' }} />
          {usWeekly.map((val, i) => {
            const pct = Math.abs(val) / BAR_MAX
            const barH = Math.round(pct * 36)
            const isPos = val >= 0
            return (
              <div key={i} className="flex-1 flex flex-col items-center justify-center h-full gap-0">
                {isPos ? (
                  <>
                    <div className="flex-1" />
                    <div
                      className="w-full rounded-sm bg-price-up/70"
                      style={{ height: barH }}
                      title={`Week ${i + 1}: +${val}`}
                    />
                    <div className="h-[40px]" />
                  </>
                ) : (
                  <>
                    <div className="h-[40px]" />
                    <div
                      className="w-full rounded-sm bg-price-down/70"
                      style={{ height: barH }}
                      title={`Week ${i + 1}: ${val}`}
                    />
                    <div className="flex-1" />
                  </>
                )}
              </div>
            )
          })}
        </div>
        <div className="flex justify-between font-mono text-[8px] text-muted-foreground mt-0.5 px-0.5">
          <span>W1</span><span>W2</span><span>W3</span><span>W4</span>
          <span>W5</span><span>W6</span><span>W7</span><span>W8</span>
        </div>
      </div>

      {/* Region rows */}
      <div className="flex flex-col gap-1.5 shrink-0">
        <div className="font-mono text-[9px] text-muted-foreground uppercase">Regional ESI</div>
        {regions.map(r => {
          const isPos = r.current >= 0
          const barPct = Math.min(Math.abs(r.current) / BAR_MAX * 100, 100)
          return (
            <div key={r.label} className="flex items-center gap-2 border border-border/40 rounded px-2 py-1.5 bg-muted/10">
              <span className="text-sm leading-none">{r.flag}</span>
              <span className="font-mono text-[10px] text-muted-foreground w-9">{r.label}</span>
              <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className={cn('h-full rounded-full transition-all duration-500', isPos ? 'bg-price-up/70' : 'bg-price-down/70')}
                  style={{ width: `${barPct}%` }}
                />
              </div>
              <span className={cn('font-mono text-[10px] tabular-nums w-8 text-right font-semibold', isPos ? 'text-price-up' : 'text-price-down')}>
                {isPos ? '+' : ''}{r.current}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
