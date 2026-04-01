'use client'
import { useState, useEffect, useCallback } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, Cell, ResponsiveContainer } from 'recharts'
import { TrendingUp, TrendingDown, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SectorRow { ticker: string; name: string; change: number | null }

const SECTOR_ETFS = [
  { ticker: 'XLK',  name: 'Technology'         },
  { ticker: 'XLF',  name: 'Financials'          },
  { ticker: 'XLV',  name: 'Health Care'         },
  { ticker: 'XLE',  name: 'Energy'              },
  { ticker: 'XLI',  name: 'Industrials'         },
  { ticker: 'XLB',  name: 'Materials'           },
  { ticker: 'XLRE', name: 'Real Estate'         },
  { ticker: 'XLC',  name: 'Comm. Services'      },
  { ticker: 'XLY',  name: 'Cons. Discretionary' },
  { ticker: 'XLP',  name: 'Cons. Staples'       },
  { ticker: 'XLU',  name: 'Utilities'           },
]

const RANGES = [
  { label: '1D',  value: '1d'  },
  { label: '5D',  value: '5d'  },
  { label: '1M',  value: '1mo' },
  { label: '3M',  value: '3mo' },
  { label: '6M',  value: '6mo' },
  { label: '1Y',  value: '1y'  },
]

async function fetchSectorChange(ticker: string, range: string): Promise<number | null> {
  try {
    const res = await fetch(`/api/stock/${ticker}/chart?range=${range}`)
    if (!res.ok) return null
    const json = await res.json()
    const data: { open: number; close: number }[] = json.data ?? []
    if (data.length < 2) return null
    const first = data[0].open ?? data[0].close
    const last  = data[data.length - 1].close
    if (!first || first === 0) return null
    return ((last - first) / first) * 100
  } catch {
    return null
  }
}

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null
  const d = payload[0].payload as SectorRow
  return (
    <div className="bg-card border border-border rounded px-2 py-1 font-mono text-[10px]">
      <div className="text-muted-foreground">{d.name}</div>
      <div className={d.change != null && d.change >= 0 ? 'text-green-400' : 'text-red-400'}>
        {d.change != null ? `${d.change >= 0 ? '+' : ''}${d.change.toFixed(2)}%` : '—'}
      </div>
    </div>
  )
}

export function SectorRotationWidget() {
  const [range, setRange] = useState('1d')
  const [sectors, setSectors] = useState<SectorRow[]>(
    SECTOR_ETFS.map(s => ({ ...s, change: null }))
  )
  const [loading, setLoading] = useState(false)

  const fetchAll = useCallback(async (r: string) => {
    setLoading(true)
    const results = await Promise.all(
      SECTOR_ETFS.map(async s => ({ ...s, change: await fetchSectorChange(s.ticker, r) }))
    )
    setSectors(results)
    setLoading(false)
  }, [])

  useEffect(() => { fetchAll(range) }, [range, fetchAll])

  const chartData = [...sectors]
    .filter(s => s.change != null)
    .sort((a, b) => (b.change ?? 0) - (a.change ?? 0))

  const best  = chartData[0]
  const worst = chartData[chartData.length - 1]

  return (
    <div className="flex flex-col h-full font-mono text-xs p-3 gap-2">
      {/* Range selector */}
      <div className="flex items-center gap-1 shrink-0">
        <div className="flex gap-1 flex-1 flex-wrap">
          {RANGES.map(r => (
            <button
              key={r.value}
              onClick={() => setRange(r.value)}
              className={cn(
                'px-2 py-0.5 rounded border text-[9px] transition-colors',
                range === r.value
                  ? 'bg-primary/20 text-primary border-primary/40'
                  : 'border-border text-muted-foreground hover:text-foreground'
              )}
            >
              {r.label}
            </button>
          ))}
        </div>
        <button onClick={() => fetchAll(range)} disabled={loading} className="text-muted-foreground hover:text-foreground transition-colors shrink-0 ml-1">
          <RefreshCw className={cn('w-3 h-3', loading && 'animate-spin')} />
        </button>
      </div>

      {/* Best/worst leaders */}
      {best && worst && !loading && (
        <div className="grid grid-cols-2 gap-1.5 shrink-0">
          <div className="flex items-center gap-1 px-2 py-1 rounded border border-price-up/20 bg-price-up/5">
            <TrendingUp className="w-3 h-3 text-price-up shrink-0" />
            <div className="min-w-0">
              <div className="text-[9px] text-muted-foreground truncate">{best.ticker}</div>
              <div className="text-price-up font-semibold tabular-nums text-[10px]">+{best.change!.toFixed(2)}%</div>
            </div>
          </div>
          <div className="flex items-center gap-1 px-2 py-1 rounded border border-price-down/20 bg-price-down/5">
            <TrendingDown className="w-3 h-3 text-price-down shrink-0" />
            <div className="min-w-0">
              <div className="text-[9px] text-muted-foreground truncate">{worst.ticker}</div>
              <div className="text-price-down font-semibold tabular-nums text-[10px]">{worst.change!.toFixed(2)}%</div>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 min-h-0">
        {loading ? (
          <div className="flex items-center justify-center h-full gap-2 text-muted-foreground">
            <RefreshCw className="w-3 h-3 animate-spin" />
            <span>Loading sector data…</span>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 0, right: 40, left: 4, bottom: 0 }}
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
              <Bar dataKey="change" radius={[0, 2, 2, 0]} isAnimationActive={false}>
                {chartData.map((entry, i) => (
                  <Cell
                    key={i}
                    fill={(entry.change ?? 0) >= 0 ? 'rgb(74 222 128 / 0.8)' : 'rgb(248 113 113 / 0.8)'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
