'use client'

import { useEffect, useState } from 'react'
import { TrendingUp, TrendingDown, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const CRYPTOS = [
  { symbol: 'BTC-USD', name: 'Bitcoin'  },
  { symbol: 'ETH-USD', name: 'Ethereum' },
  { symbol: 'SOL-USD', name: 'Solana'   },
  { symbol: 'DOGE-USD', name: 'Dogecoin' },
  { symbol: 'ADA-USD',  name: 'Cardano'  },
  { symbol: 'XRP-USD',  name: 'XRP'      },
]

interface CryptoPrice {
  symbol: string
  name: string
  price: number | null
  change: number | null
}

export function CryptoWidget() {
  const [prices, setPrices] = useState<CryptoPrice[]>(
    CRYPTOS.map(c => ({ ...c, price: null, change: null })),
  )
  const [loading, setLoading] = useState(false)

  const fetchPrices = async () => {
    setLoading(true)
    const updated = await Promise.all(
      CRYPTOS.map(async (c) => {
        try {
          const res = await fetch(`/api/stock/${c.symbol}`)
          if (res.ok) {
            const data = await res.json()
            return { ...c, price: data.price, change: data.changePercent ?? null }
          }
        } catch {
          // silent
        }
        return { ...c, price: null, change: null }
      }),
    )
    setPrices(updated)
    setLoading(false)
  }

  useEffect(() => {
    fetchPrices()
    const id = setInterval(fetchPrices, 30_000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="p-4 flex flex-col gap-3 h-full">
      <div className="flex-1 space-y-2">
        {prices.map((c) => {
          const pos = (c.change ?? 0) >= 0
          return (
            <div
              key={c.symbol}
              className="flex items-center justify-between text-xs font-mono px-3 py-2 rounded border border-border bg-card"
            >
              <div>
                <div className="font-semibold text-foreground">{c.symbol.replace('-USD', '')}</div>
                <div className="text-muted-foreground text-[10px]">{c.name}</div>
              </div>
              <div className="text-right">
                {c.price !== null ? (
                  <>
                    <div className="font-bold tabular-nums">
                      ${c.price >= 1000
                        ? c.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                        : c.price.toFixed(4)}
                    </div>
                    <div className={cn('flex items-center gap-0.5 justify-end', pos ? 'text-primary' : 'text-destructive')}>
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
      <Button variant="outline" size="sm" className="w-full text-xs font-mono shrink-0" onClick={fetchPrices} disabled={loading}>
        <RefreshCw className="w-3 h-3" />
        Refresh
      </Button>
    </div>
  )
}
