'use client'

import { useEffect, useState } from 'react'
import { TrendingUp, TrendingDown, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const COMMODITIES = [
  { apiSymbol: 'GC%3DF',  name: 'Gold',          unit: '/oz'    },
  { apiSymbol: 'SI%3DF',  name: 'Silver',         unit: '/oz'    },
  { apiSymbol: 'CL%3DF',  name: 'Crude Oil WTI',  unit: '/bbl'   },
  { apiSymbol: 'NG%3DF',  name: 'Natural Gas',    unit: '/MMBtu' },
  { apiSymbol: 'HG%3DF',  name: 'Copper',         unit: '/lb'    },
  { apiSymbol: 'ZW%3DF',  name: 'Wheat',          unit: '/bu'    },
]

interface CommodityPrice {
  name: string
  unit: string
  price: number | null
  change: number | null
}

export function CommoditiesWidget() {
  const [prices, setPrices] = useState<CommodityPrice[]>(
    COMMODITIES.map(c => ({ name: c.name, unit: c.unit, price: null, change: null })),
  )
  const [loading, setLoading] = useState(false)

  const fetchPrices = async () => {
    setLoading(true)
    const updated = await Promise.all(
      COMMODITIES.map(async (c) => {
        try {
          const res = await fetch(`/api/stock/${c.apiSymbol}`)
          if (res.ok) {
            const data = await res.json()
            return { name: c.name, unit: c.unit, price: data.price ?? null, change: data.changePercent ?? null }
          }
        } catch {
          // silent
        }
        return { name: c.name, unit: c.unit, price: null, change: null }
      }),
    )
    setPrices(updated)
    setLoading(false)
  }

  useEffect(() => {
    fetchPrices()
    const id = setInterval(fetchPrices, 120_000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="p-4 flex flex-col gap-3 h-full">
      <div className="flex-1 space-y-2 overflow-y-auto">
        {prices.map((c) => {
          const pos = (c.change ?? 0) >= 0
          return (
            <div
              key={c.name}
              className="flex items-center justify-between text-xs font-mono px-3 py-2 rounded border border-border bg-card"
            >
              <div>
                <div className="font-semibold text-foreground">{c.name}</div>
                <div className="text-muted-foreground text-[10px]">{c.unit}</div>
              </div>
              <div className="text-right">
                {c.price !== null ? (
                  <>
                    <div className="font-bold tabular-nums">
                      ${c.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    <div className={cn('flex items-center gap-0.5 justify-end text-[10px]', pos ? 'text-primary' : 'text-destructive')}>
                      {pos ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
                      {pos ? '+' : ''}{c.change?.toFixed(2)}%
                    </div>
                  </>
                ) : (
                  <div className="text-muted-foreground">{loading ? '…' : '–'}</div>
                )}
              </div>
            </div>
          )
        })}
      </div>
      <Button
        variant="outline"
        size="sm"
        className="w-full text-xs font-mono shrink-0"
        onClick={fetchPrices}
        disabled={loading}
      >
        <RefreshCw className="w-3 h-3" />
        Refresh
      </Button>
    </div>
  )
}
