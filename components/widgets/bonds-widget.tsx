'use client'

import { useEffect, useState } from 'react'
import { RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const BONDS = [
  { label: '3M',  apiSymbol: '%5EIRX', desc: '13-Wk T-Bill'   },
  { label: '5Y',  apiSymbol: '%5EFVX', desc: '5-Yr Treasury'   },
  { label: '10Y', apiSymbol: '%5ETNX', desc: '10-Yr Treasury'  },
  { label: '30Y', apiSymbol: '%5ETYX', desc: '30-Yr Treasury'  },
]

interface YieldData {
  label: string
  desc: string
  rate: number | null
  change: number | null
}

export function BondsWidget() {
  const [yields, setYields] = useState<YieldData[]>(
    BONDS.map(b => ({ label: b.label, desc: b.desc, rate: null, change: null })),
  )
  const [loading, setLoading] = useState(false)

  const fetchData = async () => {
    setLoading(true)
    const updated = await Promise.all(
      BONDS.map(async (b) => {
        try {
          const res = await fetch(`/api/stock/${b.apiSymbol}`)
          if (res.ok) {
            const data = await res.json()
            return { label: b.label, desc: b.desc, rate: data.price ?? null, change: data.changePercent ?? null }
          }
        } catch {
          // silent
        }
        return { label: b.label, desc: b.desc, rate: null, change: null }
      }),
    )
    setYields(updated)
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
    const id = setInterval(fetchData, 120_000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="p-4 flex flex-col gap-3 h-full">
      <div className="flex-1 space-y-2 overflow-y-auto">
        {yields.map((y) => (
          <div
            key={y.label}
            className="flex items-center justify-between text-xs font-mono px-3 py-2.5 rounded border border-border bg-card"
          >
            <div>
              <div className="font-semibold text-foreground">{y.label}</div>
              <div className="text-muted-foreground text-[10px]">{y.desc}</div>
            </div>
            <div className="text-right">
              {y.rate !== null ? (
                <>
                  <div className="font-bold tabular-nums">{y.rate.toFixed(3)}%</div>
                  <div className={cn('text-[10px] tabular-nums', (y.change ?? 0) >= 0 ? 'text-price-up' : 'text-price-down')}>
                    {y.change !== null
                      ? `${y.change >= 0 ? '+' : ''}${y.change.toFixed(2)} bps`
                      : '–'}
                  </div>
                </>
              ) : (
                <div className="text-muted-foreground">{loading ? '…' : '–'}</div>
              )}
            </div>
          </div>
        ))}
      </div>
      <div className="text-[10px] text-muted-foreground font-mono text-center shrink-0">
        US Treasury Yields
      </div>
      <Button
        variant="outline"
        size="sm"
        className="w-full text-xs font-mono shrink-0"
        onClick={fetchData}
        disabled={loading}
      >
        <RefreshCw className="w-3 h-3" />
        Refresh
      </Button>
    </div>
  )
}
