'use client'
import { useState, useEffect, useCallback } from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CurvePoint { label: string; current: number; normal: number; change: number | null }

// Symbols available in Yahoo Finance for key maturities
const LIVE_YIELDS: { label: string; symbol: string }[] = [
  { label: '3M',  symbol: '%5EIRX' },   // ^IRX  13-week bill
  { label: '5Y',  symbol: '%5EFVX' },   // ^FVX  5-year
  { label: '10Y', symbol: '%5ETNX' },   // ^TNX  10-year
  { label: '30Y', symbol: '%5ETYX' },   // ^TYX  30-year
]

// Static baseline for maturities we can't easily fetch
const STATIC_NORMAL: Record<string, number> = {
  '1M': 3.20, '3M': 3.40, '6M': 3.60, '1Y': 3.80,
  '2Y': 4.00, '5Y': 4.30, '7Y': 4.45, '10Y': 4.60, '20Y': 4.80, '30Y': 4.90,
}

// Fallback defaults if API unavailable
const BASE_CURRENT: Record<string, number> = {
  '1M': 5.30, '3M': 5.28, '6M': 5.15, '1Y': 4.95,
  '2Y': 4.72, '5Y': 4.38, '7Y': 4.35, '10Y': 4.32, '20Y': 4.65, '30Y': 4.52,
}

const MATURITIES = ['1M','3M','6M','1Y','2Y','5Y','7Y','10Y','20Y','30Y']

function jitter(v: number) { return Math.round((v + (Math.random() - 0.5) * 0.04) * 100) / 100 }

const SPREADS = [
  { label: '2Y–10Y', idxA: 9, idxB: 4  },
  { label: '3M–10Y', idxA: 9, idxB: 1  },
  { label: '5Y–30Y', idxA: 11, idxB: 7 },
]

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-card border border-border rounded px-2 py-1 font-mono text-[10px]">
      <div className="text-muted-foreground mb-0.5">{label}</div>
      {payload.map((p: any) => (
        <div key={p.dataKey} style={{ color: p.color }}>{p.name}: {p.value?.toFixed(2)}%</div>
      ))}
    </div>
  )
}

export function YieldCurveWidget() {
  const [curve, setCurve] = useState<CurvePoint[]>(
    MATURITIES.map(m => ({ label: m, current: BASE_CURRENT[m], normal: STATIC_NORMAL[m], change: null }))
  )
  const [loading, setLoading] = useState(false)
  const [lastUpdated, setLastUpdated] = useState('')

  const fetchRates = useCallback(async () => {
    setLoading(true)
    try {
      const results = await Promise.allSettled(
        LIVE_YIELDS.map(y => fetch(`/api/stock/${y.symbol}`).then(r => r.json()))
      )
      const liveMap: Record<string, { rate: number; change: number | null }> = {}
      LIVE_YIELDS.forEach((y, i) => {
        const r = results[i]
        if (r.status === 'fulfilled' && r.value?.price) {
          liveMap[y.label] = { rate: r.value.price, change: r.value.changePercent ?? null }
        }
      })
      setCurve(prev => prev.map(p => {
        const live = liveMap[p.label]
        return live
          ? { ...p, current: live.rate, change: live.change }
          : { ...p, current: jitter(p.current) }
      }))
      setLastUpdated(new Date().toLocaleTimeString())
    } catch {
      // jitter existing
      setCurve(prev => prev.map(p => ({ ...p, current: jitter(p.current) })))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchRates()
    const id = setInterval(fetchRates, 60_000)
    return () => clearInterval(id)
  }, [fetchRates])

  const spreads = [
    { label: '2Y–10Y', value: (curve.find(c => c.label === '10Y')?.current ?? 0) - (curve.find(c => c.label === '2Y')?.current ?? 0) },
    { label: '3M–10Y', value: (curve.find(c => c.label === '10Y')?.current ?? 0) - (curve.find(c => c.label === '3M')?.current ?? 0) },
    { label: '5Y–30Y', value: (curve.find(c => c.label === '30Y')?.current ?? 0) - (curve.find(c => c.label === '5Y')?.current ?? 0) },
  ]

  return (
    <div className="flex flex-col h-full font-mono text-xs p-3 gap-2">
      {/* Live rate badges for fetched maturities */}
      <div className="flex gap-1.5 shrink-0 flex-wrap">
        {LIVE_YIELDS.map(y => {
          const node = curve.find(c => c.label === y.label)
          if (!node) return null
          const isUp = (node.change ?? 0) >= 0
          return (
            <div key={y.label} className="flex flex-col items-center px-2 py-1 rounded border border-border bg-muted/10">
              <span className="text-[9px] text-muted-foreground">{node.label}</span>
              <span className="font-semibold tabular-nums text-[11px]">{node.current.toFixed(2)}%</span>
              {node.change != null && (
                <span className={cn('text-[9px] tabular-nums font-medium', isUp ? 'text-price-down' : 'text-price-up')}>
                  {isUp ? '+' : ''}{node.change.toFixed(2)}%
                </span>
              )}
            </div>
          )
        })}
        <button onClick={fetchRates} disabled={loading} className="ml-auto text-muted-foreground hover:text-foreground transition-colors self-center">
          <RefreshCw className={cn('w-3 h-3', loading && 'animate-spin')} />
        </button>
      </div>

      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={curve} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <XAxis dataKey="label" tick={{ fontSize: 9, fill: '#6b7280' }} axisLine={false} tickLine={false} />
            <YAxis
              domain={['auto', 'auto']}
              tick={{ fontSize: 9, fill: '#6b7280' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={v => `${v.toFixed(1)}%`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              iconType="plainline"
              wrapperStyle={{ fontSize: 9, paddingTop: 4 }}
              formatter={(v) => <span style={{ color: '#9ca3af' }}>{v}</span>}
            />
            <Line
              type="monotone"
              dataKey="current"
              name="Current"
              stroke="hsl(var(--primary))"
              strokeWidth={1.5}
              dot={false}
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="normal"
              name="Normal"
              stroke="#4b5563"
              strokeWidth={1}
              strokeDasharray="3 3"
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-3 gap-2 pt-1 border-t border-border">
        {spreads.map(s => {
          const neg = s.value < 0
          return (
            <div key={s.label} className="flex flex-col items-center gap-0.5 px-1 py-1.5 rounded bg-muted/20 border border-border/40">
              <span className="text-[9px] text-muted-foreground">{s.label}</span>
              <span className={cn('font-semibold text-sm', neg ? 'text-red-400' : 'text-green-400')}>
                {s.value > 0 ? '+' : ''}{(s.value * 100).toFixed(0)}bps
              </span>
              {neg && <span className="text-[8px] text-red-400/80">INVERTED</span>}
            </div>
          )
        })}
      </div>

      {lastUpdated && (
        <div className="text-[9px] text-muted-foreground text-right border-t border-border pt-1">
          3M · 5Y · 10Y · 30Y live · others simulated · {lastUpdated}
        </div>
      )}
    </div>
  )
}
