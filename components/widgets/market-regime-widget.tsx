'use client'

import { cn } from '@/lib/utils'

interface RegimeData {
  regime: 'Bull' | 'Bear' | 'Sideways' | 'Volatile'
  vix: number
  ytd: number
  ma200: 'Above' | 'Below'
  ma50: 'Above' | 'Below'
  confidence: number
  breadth: number
}

const DATA: RegimeData = {
  regime: 'Bull',
  vix: 18.5,
  ytd: 3.2,
  ma200: 'Above',
  ma50: 'Above',
  confidence: 72,
  breadth: 63,
}

const REGIME_COLORS: Record<RegimeData['regime'], { badge: string; text: string; bg: string }> = {
  Bull:     { badge: 'border-green-500/40 bg-green-500/10 text-green-500', text: 'text-green-500', bg: 'bg-green-500' },
  Bear:     { badge: 'border-destructive/40 bg-destructive/10 text-destructive', text: 'text-destructive', bg: 'bg-destructive' },
  Sideways: { badge: 'border-amber-500/40 bg-amber-500/10 text-amber-500', text: 'text-amber-500', bg: 'bg-amber-500' },
  Volatile: { badge: 'border-purple-500/40 bg-purple-500/10 text-purple-500', text: 'text-purple-500', bg: 'bg-purple-500' },
}

export function MarketRegimeWidget() {
  const { regime, vix, ytd, ma200, ma50, confidence, breadth } = DATA
  const colors = REGIME_COLORS[regime]

  const indicators = [
    { label: 'VIX Level', value: vix.toFixed(1), status: vix < 20 ? 'Low' : vix < 30 ? 'Elevated' : 'High', statusColor: vix < 20 ? 'text-green-500' : vix < 30 ? 'text-amber-500' : 'text-destructive' },
    { label: 'YTD Return', value: `${ytd >= 0 ? '+' : ''}${ytd.toFixed(1)}%`, status: ytd >= 0 ? 'Positive' : 'Negative', statusColor: ytd >= 0 ? 'text-green-500' : 'text-destructive' },
    { label: '200-Day MA', value: ma200, status: ma200 === 'Above' ? 'Bullish' : 'Bearish', statusColor: ma200 === 'Above' ? 'text-green-500' : 'text-destructive' },
    { label: '50-Day MA',  value: ma50,  status: ma50  === 'Above' ? 'Bullish' : 'Bearish', statusColor: ma50  === 'Above' ? 'text-green-500' : 'text-destructive' },
    { label: '% Above 200MA', value: `${breadth}%`, status: breadth > 60 ? 'Broad' : breadth > 40 ? 'Mixed' : 'Narrow', statusColor: breadth > 60 ? 'text-green-500' : breadth > 40 ? 'text-amber-500' : 'text-destructive' },
  ]

  return (
    <div className="p-4 flex flex-col gap-3 h-full font-mono text-xs">
      <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Market Regime</span>

      <div className="flex items-center justify-between">
        <div className={cn('px-3 py-1.5 rounded border text-sm font-bold tracking-wide', colors.badge)}>
          {regime} Market
        </div>
        <div className="text-right">
          <div className="text-[9px] text-muted-foreground uppercase">Confidence</div>
          <div className={cn('font-bold tabular-nums', colors.text)}>{confidence}%</div>
        </div>
      </div>

      <div className="space-y-1">
        <div className="text-[9px] text-muted-foreground uppercase tracking-wider mb-1">Confidence Score</div>
        <div className="h-2.5 bg-border rounded-full overflow-hidden">
          <div className={cn('h-full rounded-full transition-all', colors.bg)} style={{ width: `${confidence}%` }} />
        </div>
        <div className="flex justify-between text-[9px] text-muted-foreground">
          <span>Bearish</span><span>Neutral</span><span>Bullish</span>
        </div>
      </div>

      <div className="flex-1 space-y-1.5">
        {indicators.map(ind => (
          <div key={ind.label} className="flex items-center justify-between border border-border rounded-sm px-2.5 py-1.5">
            <span className="text-muted-foreground">{ind.label}</span>
            <div className="text-right flex items-center gap-2">
              <span className="font-semibold tabular-nums">{ind.value}</span>
              <span className={cn('text-[9px]', ind.statusColor)}>{ind.status}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="text-[9px] text-muted-foreground shrink-0">Based on simulated market data · Not financial advice</div>
    </div>
  )
}
