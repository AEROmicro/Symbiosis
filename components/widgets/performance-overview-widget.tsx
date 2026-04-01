'use client'

import { useState, useEffect, useCallback } from 'react'
import { TrendingUp, TrendingDown, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PeriodResult {
  label: string
  range: string
  change: number | null
  loading: boolean
}

const PERIODS = [
  { label: '1D',  range: '1d'   },
  { label: '5D',  range: '5d'   },
  { label: '1M',  range: '1mo'  },
  { label: '3M',  range: '3mo'  },
  { label: '6M',  range: '6mo'  },
  { label: 'YTD', range: 'ytd'  },
  { label: '1Y',  range: '1y'   },
  { label: '5Y',  range: '5y'   },
]

async function fetchPeriodChange(symbol: string, range: string): Promise<number | null> {
  try {
    const res = await fetch(`/api/stock/${encodeURIComponent(symbol)}/chart?range=${range}`)
    if (!res.ok) return null
    const json = await res.json()
    const data: { open: number; close: number }[] = json.data ?? []
    if (data.length < 2) return null
    const first = data[0].open || data[0].close
    const last  = data[data.length - 1].close
    if (!first || first === 0) return null
    return ((last - first) / first) * 100
  } catch {
    return null
  }
}

interface PerformanceOverviewWidgetProps {
  symbol?: string
}

export function PerformanceOverviewWidget({ symbol: propSymbol = 'AAPL' }: PerformanceOverviewWidgetProps) {
  const [symbol, setSymbol] = useState(propSymbol)
  const [inputVal, setInputVal] = useState(propSymbol)
  const [results, setResults] = useState<PeriodResult[]>(
    PERIODS.map(p => ({ ...p, change: null, loading: false }))
  )
  const [globalLoading, setGlobalLoading] = useState(false)

  const fetchAll = useCallback(async (sym: string) => {
    setGlobalLoading(true)
    setResults(PERIODS.map(p => ({ ...p, change: null, loading: true })))

    const changes = await Promise.all(
      PERIODS.map(p => fetchPeriodChange(sym, p.range))
    )

    setResults(PERIODS.map((p, i) => ({ ...p, change: changes[i], loading: false })))
    setGlobalLoading(false)
  }, [])

  useEffect(() => { fetchAll(symbol) }, [symbol, fetchAll])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const s = inputVal.trim().toUpperCase()
    if (s && s !== symbol) setSymbol(s)
  }

  const maxAbs = Math.max(...results.map(r => Math.abs(r.change ?? 0)), 0.01)

  return (
    <div className="flex flex-col h-full font-mono text-xs p-3 gap-2">
      {/* Header */}
      <div className="flex items-center gap-2 shrink-0">
        <form onSubmit={handleSubmit} className="flex gap-1 flex-1">
          <input
            value={inputVal}
            onChange={e => setInputVal(e.target.value.toUpperCase())}
            className="bg-background border border-border rounded px-2 py-0.5 text-[11px] w-20 focus:outline-none focus:border-primary font-mono"
            placeholder="AAPL"
          />
          <button type="submit" className="px-1.5 py-0.5 border border-border rounded text-[9px] hover:border-primary hover:text-primary transition-colors">
            Go
          </button>
        </form>
        <button
          onClick={() => fetchAll(symbol)}
          disabled={globalLoading}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <RefreshCw className={cn('w-3 h-3', globalLoading && 'animate-spin')} />
        </button>
      </div>

      <div className="text-[10px] text-muted-foreground shrink-0">
        <span className="text-foreground font-semibold">{symbol}</span> · Performance by period
      </div>

      {/* Bars */}
      <div className="flex-1 overflow-y-auto flex flex-col gap-1.5">
        {results.map(r => {
          const pos = (r.change ?? 0) >= 0
          const barW = r.change != null ? Math.abs(r.change) / maxAbs * 100 : 0

          return (
            <div key={r.label} className="flex items-center gap-2">
              <span className="text-[10px] text-muted-foreground w-6 shrink-0 text-right">{r.label}</span>

              {r.loading ? (
                <div className="flex-1 h-5 bg-muted/20 rounded animate-pulse" />
              ) : r.change != null ? (
                <div className="flex-1 flex items-center gap-1.5">
                  {/* Bar (left = negative, right = positive, centered) */}
                  <div className="flex-1 flex items-center h-5">
                    <div className="w-1/2 flex justify-end">
                      {!pos && (
                        <div
                          className="h-3 rounded-l bg-price-down/70 transition-all duration-500"
                          style={{ width: `${barW}%` }}
                        />
                      )}
                    </div>
                    <div className="w-px h-3 bg-border mx-px shrink-0" />
                    <div className="w-1/2 flex justify-start">
                      {pos && (
                        <div
                          className="h-3 rounded-r bg-price-up/70 transition-all duration-500"
                          style={{ width: `${barW}%` }}
                        />
                      )}
                    </div>
                  </div>

                  {/* Value */}
                  <div className={cn('flex items-center gap-0.5 w-20 justify-end shrink-0', pos ? 'text-price-up' : 'text-price-down')}>
                    {pos ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
                    <span className="tabular-nums font-semibold">
                      {pos ? '+' : ''}{r.change.toFixed(2)}%
                    </span>
                  </div>
                </div>
              ) : (
                <span className="text-muted-foreground text-[9px] flex-1">—</span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
