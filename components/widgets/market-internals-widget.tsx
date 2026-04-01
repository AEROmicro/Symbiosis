'use client'

import { useEffect, useState } from 'react'
import { BarChart2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MarketInternals {
  tick:     number   // NYSE TICK
  trin:     number   // TRIN / Arms Index
  pcr:      number   // Put/Call Ratio
  upVol:    number   // Up Volume %
  advIss:   number   // Advancing Issues %
}

const INITIAL: MarketInternals = {
  tick:   342,
  trin:   0.85,
  pcr:    0.72,
  upVol:  58.3,
  advIss: 54.2,
}

function jitter(v: number, range: number, decimals = 0): number {
  const raw = v + (Math.random() * range * 2 - range)
  return parseFloat(raw.toFixed(decimals))
}

function fluctuate(d: MarketInternals): MarketInternals {
  return {
    tick:   jitter(d.tick,   50),
    trin:   jitter(d.trin,   0.05, 2),
    pcr:    jitter(d.pcr,    0.03, 2),
    upVol:  jitter(d.upVol,  1,    1),
    advIss: jitter(d.advIss, 1,    1),
  }
}

/* ── Derived conditions ── */

function tickCondition(tick: number): { label: string; color: string; bg: string; border: string } {
  if (tick > 100)  return { label: 'BULLISH',  color: 'text-price-up',   bg: 'bg-green-900/30',  border: 'border-green-700/40'  }
  if (tick < -100) return { label: 'BEARISH',  color: 'text-price-down', bg: 'bg-red-900/30',    border: 'border-red-700/40'    }
  return                 { label: 'NEUTRAL',  color: 'text-yellow-400', bg: 'bg-yellow-900/30', border: 'border-yellow-700/40' }
}

function trinCondition(trin: number): { label: string; color: string } {
  return trin < 1.0
    ? { label: 'Bullish', color: 'text-price-up'   }
    : { label: 'Bearish', color: 'text-price-down' }
}

function pcrCondition(pcr: number): { label: string; color: string } {
  if (pcr < 0.8)  return { label: 'Greedy', color: 'text-price-up'   }
  if (pcr > 1.2)  return { label: 'Fearful', color: 'text-price-down' }
  return                 { label: 'Neutral', color: 'text-yellow-400' }
}

function overallCondition(d: MarketInternals): { label: string; color: string; bg: string; border: string; desc: string } {
  let bullPoints = 0
  if (d.tick > 100)  bullPoints++
  if (d.trin < 1.0)  bullPoints++
  if (d.pcr  < 0.8)  bullPoints++
  if (d.upVol  > 50) bullPoints++
  if (d.advIss > 50) bullPoints++

  if (bullPoints >= 4) return {
    label: 'BULLISH',
    color: 'text-price-up',
    bg:    'bg-green-900/30',
    border:'border-green-700/40',
    desc:  'Broad market breadth is positive. Buyers in control.',
  }
  if (bullPoints <= 1) return {
    label: 'BEARISH',
    color: 'text-price-down',
    bg:    'bg-red-900/30',
    border:'border-red-700/40',
    desc:  'Internals deteriorating. Distribution underway.',
  }
  return {
    label: 'NEUTRAL',
    color: 'text-yellow-400',
    bg:    'bg-yellow-900/30',
    border:'border-yellow-700/40',
    desc:  'Mixed signals. Market consolidating — watch for confirmation.',
  }
}

export function MarketInternalsWidget() {
  const [data, setData] = useState<MarketInternals>(INITIAL)

  useEffect(() => {
    const id = setInterval(() => setData(prev => fluctuate(prev)), 30_000)
    return () => clearInterval(id)
  }, [])

  const overall  = overallCondition(data)
  const tickCond = tickCondition(data.tick)
  const trinCond = trinCondition(data.trin)
  const pcrCond  = pcrCondition(data.pcr)

  const tickColor  = data.tick  > 100 ? 'text-price-up' : data.tick < -100 ? 'text-price-down' : 'text-yellow-400'
  const trinColor  = trinCond.color
  const pcrColor   = pcrCond.color
  const upVolColor  = data.upVol  > 50 ? 'text-price-up' : 'text-price-down'
  const advIssColor = data.advIss > 50 ? 'text-price-up' : 'text-price-down'

  const rows: { label: string; value: React.ReactNode; badge?: React.ReactNode }[] = [
    {
      label: 'NYSE TICK',
      value: (
        <span className={cn('font-mono text-xs font-semibold tabular-nums', tickColor)}>
          {data.tick >= 0 ? '+' : ''}{data.tick}
        </span>
      ),
      badge: (
        <span className={cn('px-1.5 py-0.5 rounded border text-[9px] leading-none font-semibold', tickCond.color, tickCond.bg, tickCond.border)}>
          {tickCond.label}
        </span>
      ),
    },
    {
      label: 'NYSE TRIN',
      value: (
        <span className={cn('font-mono text-xs font-semibold tabular-nums', trinColor)}>
          {data.trin.toFixed(2)}
        </span>
      ),
      badge: (
        <span className={cn(
          'px-1.5 py-0.5 rounded border text-[9px] leading-none font-semibold border-current/30',
          trinColor,
        )}>
          {trinCond.label}
        </span>
      ),
    },
    {
      label: 'Put/Call Ratio',
      value: (
        <span className={cn('font-mono text-xs font-semibold tabular-nums', pcrColor)}>
          {data.pcr.toFixed(2)}
        </span>
      ),
      badge: (
        <span className={cn(
          'px-1.5 py-0.5 rounded border text-[9px] leading-none font-semibold border-current/30',
          pcrColor,
        )}>
          {pcrCond.label}
        </span>
      ),
    },
    {
      label: 'Up Volume %',
      value: (
        <span className={cn('font-mono text-xs font-semibold tabular-nums', upVolColor)}>
          {data.upVol.toFixed(1)}%
        </span>
      ),
    },
    {
      label: 'Advancing Issues %',
      value: (
        <span className={cn('font-mono text-xs font-semibold tabular-nums', advIssColor)}>
          {data.advIss.toFixed(1)}%
        </span>
      ),
    },
  ]

  return (
    <div className="p-4 flex flex-col gap-3 h-full overflow-y-auto">
      {/* Header */}
      <div className="flex items-center gap-1.5 shrink-0">
        <BarChart2 className="w-3.5 h-3.5 text-primary" />
        <span className="font-mono text-xs font-semibold text-foreground uppercase tracking-wide">
          Market Internals
        </span>
      </div>

      {/* Market Condition banner */}
      <div className={cn('rounded border px-3 py-3 shrink-0', overall.bg, overall.border)}>
        <div className="flex items-center justify-between mb-1">
          <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
            Market Condition
          </span>
          <span className={cn(
            'px-1.5 py-0.5 rounded border text-[9px] leading-none font-semibold border-current/30',
            overall.color,
          )}>
            {overall.label}
          </span>
        </div>
        <p className={cn('font-mono text-[10px]', overall.color)}>{overall.desc}</p>
      </div>

      {/* Metric rows */}
      <div className="flex flex-col gap-1.5 flex-1">
        {rows.map(row => (
          <div
            key={row.label}
            className="flex items-center justify-between rounded border border-border bg-muted/10 px-3 py-2 hover:bg-muted/20 transition-colors"
          >
            <span className="font-mono text-[10px] text-muted-foreground">{row.label}</span>
            <div className="flex items-center gap-2">
              {row.value}
              {row.badge}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="shrink-0 border-t border-border/30 pt-1">
        <span className="font-mono text-[10px] text-muted-foreground flex items-center gap-1">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
          Simulated · updates every 30s
        </span>
      </div>
    </div>
  )
}
