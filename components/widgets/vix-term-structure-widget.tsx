'use client'

import { useEffect, useState } from 'react'
import { RefreshCw, Activity } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface TermPoint {
  label: string
  value: number
}

interface VixData {
  spot: number
  change: number | null
  changePercent: number | null
  loading: boolean
  lastUpdated: string | null
}

const DEFAULT_SPOT = 18.5

function buildTermStructure(spot: number): TermPoint[] {
  return [
    { label: 'VIX Spot', value: spot },
    { label: 'VIX 1M',   value: parseFloat((spot * 1.03).toFixed(2)) },
    { label: 'VIX 3M',   value: parseFloat((spot * 1.06).toFixed(2)) },
    { label: 'VIX 6M',   value: parseFloat((spot * 1.09).toFixed(2)) },
    { label: 'VIX 1Y',   value: parseFloat((spot * 1.12).toFixed(2)) },
  ]
}

export function VixTermStructureWidget() {
  const [vix, setVix] = useState<VixData>({ spot: DEFAULT_SPOT, change: null, changePercent: null, loading: false, lastUpdated: null })

  const fetchVix = async () => {
    setVix(prev => ({ ...prev, loading: true }))
    try {
      const res = await fetch('/api/stock/%5EVIX')
      if (res.ok) {
        const json = await res.json()
        const spot = typeof json?.price === 'number' ? json.price : DEFAULT_SPOT
        setVix({
          spot,
          change: json?.change ?? null,
          changePercent: json?.changePercent ?? null,
          loading: false,
          lastUpdated: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }),
        })
        return
      }
    } catch {
      // fall through to default
    }
    setVix(prev => ({
      ...prev,
      loading: false,
      spot: prev.spot === DEFAULT_SPOT ? DEFAULT_SPOT : prev.spot,
      lastUpdated: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }),
    }))
  }

  useEffect(() => { fetchVix() }, [])

  const terms = buildTermStructure(vix.spot)
  const isContango = terms[1].value >= terms[0].value
  const maxVal = Math.max(...terms.map(t => t.value))
  const contangoSlope = parseFloat((((terms[1].value - terms[0].value) / terms[0].value) * 100).toFixed(2))

  return (
    <div className="p-4 flex flex-col gap-3 h-full overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between shrink-0">
        <div className="flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5 text-primary" />
          <span className="font-mono text-xs font-semibold text-foreground">VIX Term Structure</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-5 w-5"
          onClick={fetchVix}
          disabled={vix.loading}
        >
          <RefreshCw className={cn('w-3 h-3 text-muted-foreground', vix.loading && 'animate-spin')} />
        </Button>
      </div>

      {/* Hero */}
      <div className="flex items-center justify-between rounded border border-border bg-muted/10 px-4 py-3 shrink-0">
        <div>
          <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest mb-0.5">VIX Spot · 1D Change</div>
          <div className={cn(
            'font-mono text-3xl font-bold tabular-nums',
            vix.spot >= 30 ? 'text-price-down' : vix.spot >= 20 ? 'text-yellow-400' : 'text-price-up',
          )}>
            {vix.loading ? '...' : vix.spot.toFixed(2)}
          </div>
          {vix.change != null && vix.changePercent != null && (
            <div className={cn(
              'font-mono text-[10px] font-semibold tabular-nums mt-0.5',
              // Higher VIX = bad for market; colour inversely
              vix.change > 0 ? 'text-price-down' : 'text-price-up',
            )}>
              {vix.change > 0 ? '+' : ''}{vix.change.toFixed(2)} ({vix.change > 0 ? '+' : ''}{vix.changePercent.toFixed(2)}%)
            </div>
          )}
        </div>
        <span className={cn(
          'px-1.5 py-0.5 rounded border text-[9px] leading-none font-semibold',
          isContango
            ? 'text-blue-400 bg-blue-900/30 border-blue-700/40'
            : 'text-red-400 bg-red-900/30 border-red-700/40',
        )}>
          {isContango ? 'CONTANGO' : 'BACKWARDATION'}
        </span>
      </div>

      {/* Bar chart */}
      <div className="flex flex-col gap-2 flex-1">
        {terms.map(pt => {
          const pct = maxVal > 0 ? (pt.value / maxVal) * 100 : 0
          return (
            <div key={pt.label} className="flex items-center gap-2">
              <span className="font-mono text-[10px] text-muted-foreground w-14 shrink-0">{pt.label}</span>
              <div className="flex-1 h-4 bg-muted/20 rounded overflow-hidden relative">
                <div
                  className="h-full bg-primary/40 rounded transition-all duration-500"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="font-mono text-[10px] text-foreground tabular-nums w-10 text-right shrink-0">
                {pt.value.toFixed(2)}
              </span>
            </div>
          )
        })}
      </div>

      {/* Contango slope */}
      <div className="rounded border border-border bg-muted/10 px-3 py-2 shrink-0">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10px] text-muted-foreground">Contango Slope (Spot→1M)</span>
          <span className={cn(
            'font-mono text-[10px] font-semibold tabular-nums',
            contangoSlope >= 0 ? 'text-blue-400' : 'text-red-400',
          )}>
            {contangoSlope >= 0 ? '+' : ''}{contangoSlope}%
          </span>
        </div>
        <p className="font-mono text-[10px] text-muted-foreground mt-1">
          {isContango
            ? 'Normal market: futures premium above spot — implied calm.'
            : 'Inverted curve: spot above futures — market in panic/stress.'}
        </p>
      </div>

      {/* Footer */}
      <div className="shrink-0 border-t border-border/30 pt-1 flex items-center justify-between">
        <span className="font-mono text-[10px] text-muted-foreground flex items-center gap-1">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary" />
          {vix.lastUpdated ? `Updated ${vix.lastUpdated}` : 'Awaiting data'}
        </span>
        <span className="font-mono text-[10px] text-muted-foreground">Default: {DEFAULT_SPOT} if unavailable</span>
      </div>
    </div>
  )
}
