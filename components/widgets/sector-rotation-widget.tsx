'use client'
import { useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, Cell, ResponsiveContainer } from 'recharts'
import { cn } from '@/lib/utils'

interface SectorRow { ticker: string; name: string; d1: number; w1: number; m1: number }

const SECTORS: SectorRow[] = [
  { ticker: 'XLK',  name: 'Technology',        d1:  1.24, w1:  3.81, m1:  8.42 },
  { ticker: 'XLF',  name: 'Financials',         d1:  0.87, w1:  1.23, m1:  4.11 },
  { ticker: 'XLV',  name: 'Health Care',        d1: -0.32, w1: -0.88, m1:  1.05 },
  { ticker: 'XLE',  name: 'Energy',             d1:  0.15, w1: -1.47, m1: -3.22 },
  { ticker: 'XLI',  name: 'Industrials',        d1:  0.56, w1:  2.04, m1:  5.67 },
  { ticker: 'XLB',  name: 'Materials',          d1: -0.44, w1: -0.62, m1:  0.88 },
  { ticker: 'XLRE', name: 'Real Estate',        d1: -1.12, w1: -2.34, m1: -4.56 },
  { ticker: 'XLC',  name: 'Comm. Services',     d1:  0.99, w1:  2.77, m1:  6.33 },
  { ticker: 'XLY',  name: 'Cons. Discretionary',d1:  0.43, w1:  1.11, m1:  2.98 },
  { ticker: 'XLP',  name: 'Cons. Staples',      d1: -0.18, w1:  0.44, m1:  1.21 },
  { ticker: 'XLU',  name: 'Utilities',          d1: -0.77, w1: -1.88, m1: -2.45 },
]

type Period = '1D' | '1W' | '1M'

const perfKey: Record<Period, 'name' | 'd1' | 'w1' | 'm1'> = { '1D': 'd1', '1W': 'w1', '1M': 'm1' }

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null
  const d = payload[0].payload as SectorRow & { value: number }
  return (
    <div className="bg-card border border-border rounded px-2 py-1 font-mono text-[10px]">
      <div className="text-muted-foreground">{d.name}</div>
      <div className={d.value >= 0 ? 'text-green-400' : 'text-red-400'}>
        {d.value >= 0 ? '+' : ''}{d.value.toFixed(2)}%
      </div>
    </div>
  )
}

export function SectorRotationWidget() {
  const [period, setPeriod] = useState<Period>('1D')

  const key = perfKey[period]
  const chartData = SECTORS.map(s => ({ ...s, value: s[key] as number }))
    .sort((a, b) => b.value - a.value)

  return (
    <div className="flex flex-col h-full font-mono text-xs p-3 gap-2">
      <div className="flex gap-1">
        {(['1D', '1W', '1M'] as Period[]).map(p => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={cn(
              'px-2 py-0.5 rounded border text-[10px] transition-colors',
              period === p
                ? 'bg-primary/20 text-primary border-primary/40'
                : 'border-border text-muted-foreground hover:text-foreground'
            )}
          >
            {p}
          </button>
        ))}
      </div>

      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 0, right: 36, left: 4, bottom: 0 }}
            barSize={10}
          >
            <XAxis
              type="number"
              tick={{ fontSize: 8, fill: '#6b7280' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={v => `${v}%`}
              domain={['auto', 'auto']}
            />
            <YAxis
              type="category"
              dataKey="ticker"
              tick={{ fontSize: 9, fill: '#9ca3af', fontFamily: 'monospace' }}
              axisLine={false}
              tickLine={false}
              width={36}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
            <Bar dataKey="value" radius={[0, 2, 2, 0]} isAnimationActive={false}>
              {chartData.map((entry, i) => (
                <Cell
                  key={i}
                  fill={entry.value >= 0 ? 'rgb(74 222 128 / 0.8)' : 'rgb(248 113 113 / 0.8)'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
