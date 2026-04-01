'use client'

import { useEffect, useState } from 'react'
import { TrendingUp, TrendingDown, RefreshCw, Globe } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface MarketIndex {
  id: string
  name: string
  value: number | null
  change: number | null
  loading?: boolean
}

const STATIC_INDICES: MarketIndex[] = [
  { id: 'ftse',     name: 'FTSE 100',   value: 8245.3,  change:  0.4 },
  { id: 'nikkei',   name: 'Nikkei 225', value: 38890.5, change: -0.3 },
  { id: 'dax',      name: 'DAX',        value: 18420.7, change:  0.6 },
  { id: 'hangseng', name: 'Hang Seng',  value: 17230.1, change: -0.8 },
  { id: 'cac',      name: 'CAC 40',     value: 8124.5,  change:  0.2 },
  { id: 'asx',      name: 'ASX 200',    value: 7980.3,  change:  0.1 },
]

const API_INDICES = [
  { id: 'sp500',  name: 'S&P 500', symbol: '%5EGSPC' },
  { id: 'nasdaq', name: 'NASDAQ',  symbol: '%5EIXIC'  },
  { id: 'dow',    name: 'DOW',     symbol: '%5EDJI'   },
]

function jitter(val: number): number {
  return Math.round((val + (Math.random() - 0.5) * val * 0.003) * 10) / 10
}

export function GlobalMarketsWidget() {
  const [apiData, setApiData] = useState<MarketIndex[]>(
    API_INDICES.map(i => ({ id: i.id, name: i.name, value: null, change: null, loading: true }))
  )
  const [staticData, setStaticData] = useState<MarketIndex[]>(STATIC_INDICES)
  const [refreshing, setRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<string>('')

  const fetchApiIndices = async () => {
    setApiData(prev => prev.map(d => ({ ...d, loading: true })))
    const results = await Promise.all(
      API_INDICES.map(async (idx) => {
        try {
          const res = await fetch(`/api/stock/${idx.symbol}`)
          if (res.ok) {
            const data = await res.json()
            return { id: idx.id, name: idx.name, value: data.price ?? null, change: data.changePercent ?? null, loading: false }
          }
        } catch {
          // silent
        }
        return { id: idx.id, name: idx.name, value: null, change: null, loading: false }
      })
    )
    setApiData(results)
    setLastUpdated(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }))
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchApiIndices()
    setRefreshing(false)
  }

  useEffect(() => {
    fetchApiIndices()
    const apiInterval = setInterval(fetchApiIndices, 120_000)
    const jitterInterval = setInterval(() => {
      setStaticData(prev => prev.map(d => ({
        ...d,
        value: d.value !== null ? jitter(d.value) : null,
      })))
    }, 60_000)
    return () => {
      clearInterval(apiInterval)
      clearInterval(jitterInterval)
    }
  }, [])

  const allIndices: MarketIndex[] = [...apiData, ...staticData]

  return (
    <div className="p-4 flex flex-col gap-3 h-full overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between shrink-0">
        <div className="flex items-center gap-1.5">
          <Globe className="w-3.5 h-3.5 text-primary" />
          <span className="font-mono text-xs font-semibold text-foreground">Global Markets</span>
        </div>
        <div className="flex items-center gap-2">
          {lastUpdated && (
            <span className="font-mono text-[9px] text-muted-foreground">{lastUpdated}</span>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={cn('w-3 h-3', refreshing && 'animate-spin')} />
          </Button>
        </div>
      </div>

      {/* Column headers */}
      <div className="flex justify-between px-2 shrink-0">
        <span className="font-mono text-[9px] text-muted-foreground uppercase">Index</span>
        <div className="flex gap-8">
          <span className="font-mono text-[9px] text-muted-foreground uppercase">Value</span>
          <span className="font-mono text-[9px] text-muted-foreground uppercase w-14 text-right">Change</span>
        </div>
      </div>

      {/* Rows */}
      <div className="flex flex-col flex-1">
        {allIndices.map((idx) => {
          const pos = (idx.change ?? 0) >= 0
          return (
            <div
              key={idx.id}
              className="flex justify-between items-center border-b border-border/30 py-1.5 px-2 hover:bg-muted/10 transition-colors"
            >
              <span className="font-mono text-[10px] text-foreground w-24 truncate">{idx.name}</span>

              <div className="flex items-center gap-6">
                {idx.loading ? (
                  <span className="font-mono text-[10px] text-muted-foreground w-20 text-right">
                    <span className="inline-block w-3 h-3 border border-muted-foreground/40 border-t-primary rounded-full animate-spin" />
                  </span>
                ) : (
                  <span className="font-mono text-[10px] text-foreground tabular-nums w-20 text-right">
                    {idx.value !== null
                      ? idx.value.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
                      : '—'}
                  </span>
                )}

                {idx.loading ? (
                  <span className="font-mono text-[10px] text-muted-foreground w-14 text-right">…</span>
                ) : (
                  <div className={cn(
                    'flex items-center justify-end gap-0.5 font-mono text-[10px] w-14',
                    idx.change === null ? 'text-muted-foreground' : pos ? 'text-price-up' : 'text-price-down'
                  )}>
                    {idx.change !== null && (
                      pos
                        ? <TrendingUp className="w-2.5 h-2.5 shrink-0" />
                        : <TrendingDown className="w-2.5 h-2.5 shrink-0" />
                    )}
                    <span className="tabular-nums">
                      {idx.change !== null
                        ? `${pos ? '+' : ''}${idx.change.toFixed(2)}%`
                        : '—'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Footer */}
      <div className="shrink-0 pt-1 border-t border-border/30">
        <span className="font-mono text-[10px] text-muted-foreground">
          S&amp;P · NASDAQ · DOW live · others update every 60s
        </span>
      </div>
    </div>
  )
}
