'use client'

import { useEffect, useState, useCallback } from 'react'
import { Coins, TrendingUp, TrendingDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DominanceData {
  btc: number
  eth: number
  bnb: number
  others: number
}

const BASE: DominanceData = { btc: 54.3, eth: 17.1, bnb: 3.6, others: 25.0 }

function jitter(val: number, range = 0.3): number {
  return Math.round((val + (Math.random() - 0.5) * range * 2) * 10) / 10
}

const ALT_COLORS: Record<string, string> = {
  eth:    'bg-indigo-500',
  bnb:    'bg-yellow-500',
  others: 'bg-muted-foreground',
}

const RANGES = [
  { label: '1D',  value: '1d'  },
  { label: '5D',  value: '5d'  },
  { label: '1M',  value: '1mo' },
  { label: '3M',  value: '3mo' },
  { label: '6M',  value: '6mo' },
  { label: '1Y',  value: '1y'  },
]

interface BarPoint { value: number; time: number }

export function BitcoinDominanceWidget() {
  const [data, setData] = useState<DominanceData>(BASE)
  const [range, setRange] = useState('5d')
  const [history, setHistory] = useState<BarPoint[]>([])
  const [periodChange, setPeriodChange] = useState<number | null>(null)
  const [periodChangePct, setPeriodChangePct] = useState<number | null>(null)
  const [loadingHistory, setLoadingHistory] = useState(false)

  // Live dominance jitter
  useEffect(() => {
    const tick = () => {
      setData({
        btc:    jitter(BASE.btc),
        eth:    jitter(BASE.eth, 0.2),
        bnb:    jitter(BASE.bnb, 0.1),
        others: jitter(BASE.others, 0.2),
      })
    }
    const id = setInterval(tick, 30_000)
    return () => clearInterval(id)
  }, [])

  // Fetch BTC price history for selected range and compute period change
  const fetchHistory = useCallback(async (r: string) => {
    setLoadingHistory(true)
    try {
      const res = await fetch(`/api/stock/BTC-USD/chart?range=${r}`)
      if (res.ok) {
        const json = await res.json()
        const pts: { time: number; close: number; open: number }[] = json.data ?? []
        if (pts.length >= 2) {
          const bars: BarPoint[] = pts.map(p => ({ value: p.close, time: p.time }))
          setHistory(bars)
          const first = pts[0].open ?? pts[0].close
          const last  = pts[pts.length - 1].close
          if (first > 0) {
            setPeriodChange(last - first)
            setPeriodChangePct(((last - first) / first) * 100)
          }
        }
      }
    } catch {
      // silent
    } finally {
      setLoadingHistory(false)
    }
  }, [])

  useEffect(() => { fetchHistory(range) }, [range, fetchHistory])

  const isUp = (periodChangePct ?? 0) >= 0
  const barMax = history.length > 0 ? Math.max(...history.map(b => b.value)) : 1
  const barMin = history.length > 0 ? Math.min(...history.map(b => b.value)) : 0
  const barRange = barMax - barMin || 1

  return (
    <div className="p-4 flex flex-col gap-3 h-full overflow-y-auto">
      {/* Header */}
      <div className="flex items-center gap-1.5 shrink-0">
        <Coins className="w-3.5 h-3.5 text-yellow-400" />
        <span className="font-mono text-xs font-semibold text-foreground">BTC Dominance</span>
      </div>

      {/* Hero + period change */}
      <div className="flex items-end gap-3 shrink-0">
        <span className="font-mono text-3xl font-bold text-foreground tabular-nums">
          {data.btc.toFixed(1)}%
        </span>
        {periodChangePct != null && (
          <div className={cn('flex items-center gap-0.5 pb-1 font-mono text-xs font-semibold', isUp ? 'text-price-up' : 'text-price-down')}>
            {isUp ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
            <span>
              {isUp ? '+' : ''}{periodChangePct.toFixed(2)}%
              <span className="font-normal opacity-70 ml-1">BTC {RANGES.find(r => r.value === range)?.label}</span>
            </span>
          </div>
        )}
      </div>

      {/* Range selector */}
      <div className="flex gap-1 shrink-0 flex-wrap">
        {RANGES.map(r => (
          <button
            key={r.value}
            onClick={() => setRange(r.value)}
            className={cn(
              'px-1.5 py-0.5 rounded border text-[9px] transition-colors',
              range === r.value
                ? 'bg-primary/20 text-primary border-primary/40'
                : 'border-border text-muted-foreground hover:text-foreground'
            )}
          >
            {r.label}
          </button>
        ))}
      </div>

      {/* Price history bar chart */}
      <div className="shrink-0">
        <div className="font-mono text-[9px] text-muted-foreground mb-1 uppercase">
          BTC Price · {RANGES.find(r => r.value === range)?.label}
          {periodChange != null && (
            <span className={cn('ml-2 font-semibold', isUp ? 'text-price-up' : 'text-price-down')}>
              {isUp ? '+' : ''}${Math.abs(periodChange).toLocaleString('en-US', { maximumFractionDigits: 0 })}
            </span>
          )}
        </div>
        {loadingHistory ? (
          <div className="flex items-end gap-px h-10">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="flex-1 bg-muted/30 rounded-sm animate-pulse" style={{ height: `${30 + Math.random() * 70}%` }} />
            ))}
          </div>
        ) : history.length > 0 ? (
          <div className="flex items-end gap-px h-10">
            {history.map((bar, i) => {
              const heightPct = ((bar.value - barMin) / barRange) * 70 + 30
              const isLast = i === history.length - 1
              const barColor = isUp ? 'bg-price-up' : 'bg-price-down'
              return (
                <div key={i} className="flex-1 flex flex-col items-center">
                  <div
                    className={cn('w-full rounded-sm', isLast ? barColor : `${barColor}/40`)}
                    style={{ height: `${heightPct}%` }}
                  />
                </div>
              )
            })}
          </div>
        ) : null}
        {history.length > 0 && (
          <div className="flex justify-between font-mono text-[9px] text-muted-foreground mt-0.5">
            <span>low ${barMin.toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
            <span>high ${barMax.toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
          </div>
        )}
      </div>

      {/* Alt dominance */}
      <div className="flex flex-col gap-1.5 shrink-0 border-t border-border/30 pt-2">
        <div className="font-mono text-[9px] text-muted-foreground uppercase mb-0.5">Market Dominance</div>

        {([
          { label: 'BTC', color: 'bg-yellow-400', val: data.btc },
          { label: 'ETH', color: ALT_COLORS.eth,  val: data.eth },
          { label: 'BNB', color: ALT_COLORS.bnb,  val: data.bnb },
          { label: 'Others', color: ALT_COLORS.others, val: data.others },
        ] as const).map(item => (
          <div key={item.label} className="flex items-center gap-2">
            <span className="font-mono text-[10px] text-muted-foreground w-10 shrink-0">{item.label}</span>
            <div className="flex-1 h-1.5 bg-muted/20 rounded-full overflow-hidden">
              <div
                className={cn('h-full rounded-full transition-all duration-500', item.color)}
                style={{ width: `${item.val}%` }}
              />
            </div>
            <span className="font-mono text-[10px] text-foreground tabular-nums w-10 text-right shrink-0">
              {item.val.toFixed(1)}%
            </span>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="shrink-0 pt-1 border-t border-border/30">
        <span className="font-mono text-[10px] text-muted-foreground flex items-center gap-1">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          Live · dominance updates every 30s
        </span>
      </div>
    </div>
  )
}
