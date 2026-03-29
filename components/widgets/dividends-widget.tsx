'use client'

import { useEffect, useState } from 'react'
import { RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const DIVIDEND_STOCKS = [
  { symbol: 'KO',   name: 'Coca-Cola'            },
  { symbol: 'JNJ',  name: 'Johnson & Johnson'    },
  { symbol: 'PG',   name: 'Procter & Gamble'     },
  { symbol: 'T',    name: 'AT&T'                 },
  { symbol: 'VZ',   name: 'Verizon'              },
  { symbol: 'MO',   name: 'Altria'               },
  { symbol: 'MMM',  name: '3M'                   },
  { symbol: 'XOM',  name: 'ExxonMobil'           },
]

interface DividendRow {
  symbol: string
  name: string
  price: number | null
  dividendYield: number | null
  dividendRate: number | null
  exDividendDate: string | null
}

export function DividendsWidget() {
  const [rows, setRows] = useState<DividendRow[]>(
    DIVIDEND_STOCKS.map(s => ({
      symbol: s.symbol,
      name: s.name,
      price: null,
      dividendYield: null,
      dividendRate: null,
      exDividendDate: null,
    })),
  )
  const [loading, setLoading] = useState(false)

  const fetchData = async () => {
    setLoading(true)
    const updated = await Promise.all(
      DIVIDEND_STOCKS.map(async (s) => {
        try {
          const res = await fetch(`/api/stock/${s.symbol}`)
          if (res.ok) {
            const data = await res.json()
            return {
              symbol: s.symbol,
              name: s.name,
              price: data.price ?? null,
              dividendYield: data.dividendYield ?? null,
              dividendRate: data.dividendRate ?? null,
              exDividendDate: data.exDividendDate ?? null,
            }
          }
        } catch {
          // silent
        }
        return { symbol: s.symbol, name: s.name, price: null, dividendYield: null, dividendRate: null, exDividendDate: null }
      }),
    )
    setRows(updated)
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
    const id = setInterval(fetchData, 300_000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="p-3 flex flex-col gap-3 h-full">
      <div className="flex-1 space-y-1.5 overflow-y-auto">
        {rows.map((r) => (
          <div
            key={r.symbol}
            className="text-xs font-mono px-3 py-2 rounded border border-border bg-card"
          >
            <div className="flex items-center justify-between mb-1">
              <div>
                <span className="font-semibold text-foreground">{r.symbol}</span>
                <span className="text-muted-foreground text-[10px] ml-1.5">{r.name}</span>
              </div>
              <span className="tabular-nums text-foreground">
                {r.price !== null ? `$${r.price.toFixed(2)}` : (loading ? '…' : '–')}
              </span>
            </div>
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-muted-foreground">
                Yield&nbsp;
                <span className={cn('font-semibold', r.dividendYield ? 'text-primary' : 'text-muted-foreground')}>
                  {r.dividendYield !== null ? `${r.dividendYield.toFixed(2)}%` : '–'}
                </span>
                {r.dividendRate !== null && (
                  <span className="text-muted-foreground ml-1">
                    (${r.dividendRate.toFixed(2)}/yr)
                  </span>
                )}
              </span>
              {r.exDividendDate && (
                <span className="text-muted-foreground">
                  Ex-div <span className="text-foreground">{r.exDividendDate}</span>
                </span>
              )}
            </div>
          </div>
        ))}
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
