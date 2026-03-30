'use client'
import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { cn } from '@/lib/utils'

interface CurvePoint { label: string; current: number; normal: number }

const BASE_CURVE: CurvePoint[] = [
  { label: '1M',  current: 5.30, normal: 3.20 },
  { label: '3M',  current: 5.28, normal: 3.40 },
  { label: '6M',  current: 5.15, normal: 3.60 },
  { label: '1Y',  current: 4.95, normal: 3.80 },
  { label: '2Y',  current: 4.72, normal: 4.00 },
  { label: '5Y',  current: 4.38, normal: 4.30 },
  { label: '7Y',  current: 4.35, normal: 4.45 },
  { label: '10Y', current: 4.32, normal: 4.60 },
  { label: '20Y', current: 4.65, normal: 4.80 },
  { label: '30Y', current: 4.52, normal: 4.90 },
]

function jitter(v: number) { return Math.round((v + (Math.random() - 0.5) * 0.04) * 100) / 100 }

const SPREADS = [
  { label: '2Y–10Y', getValue: (c: CurvePoint[]) => c[7].current - c[4].current },
  { label: '3M–10Y', getValue: (c: CurvePoint[]) => c[7].current - c[1].current },
  { label: '5Y–30Y', getValue: (c: CurvePoint[]) => c[9].current - c[5].current },
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
  const [curve, setCurve] = useState<CurvePoint[]>(BASE_CURVE)
  const [lastUpdated, setLastUpdated] = useState('')

  useEffect(() => {
    const update = () => {
      setCurve(prev => prev.map(p => ({ ...p, current: jitter(p.current) })))
      setLastUpdated(new Date().toLocaleTimeString())
    }
    update()
    const id = setInterval(update, 60_000)
    return () => clearInterval(id)
  }, [])

  const spreads = SPREADS.map(s => ({ label: s.label, value: s.getValue(curve) }))

  return (
    <div className="flex flex-col h-full font-mono text-xs p-3 gap-2">
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
          Updated {lastUpdated}
        </div>
      )}
    </div>
  )
}
