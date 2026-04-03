'use client'

import { useEffect, useState, useCallback } from 'react'
import { TrendingUp, TrendingDown, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CryptoEntry {
  rank: number
  symbol: string
  price: number | null
  change24h: number | null
  volume: string
  volumeRaw: number
  loading: boolean
}

type SortKey = 'VOLUME' | 'CHANGE' | 'PRICE'
type Filter = 'ALL' | 'GAINERS' | 'LOSERS'

// Top 20 by market cap — fetched from the real API
const SCREENER_COINS = [
  { rank: 1,  symbol: 'BTC',   yahooSymbol: 'BTC-USD'  },
  { rank: 2,  symbol: 'ETH',   yahooSymbol: 'ETH-USD'  },
  { rank: 3,  symbol: 'BNB',   yahooSymbol: 'BNB-USD'  },
  { rank: 4,  symbol: 'SOL',   yahooSymbol: 'SOL-USD'  },
  { rank: 5,  symbol: 'XRP',   yahooSymbol: 'XRP-USD'  },
  { rank: 6,  symbol: 'ADA',   yahooSymbol: 'ADA-USD'  },
  { rank: 7,  symbol: 'DOGE',  yahooSymbol: 'DOGE-USD' },
  { rank: 8,  symbol: 'TRX',   yahooSymbol: 'TRX-USD'  },
  { rank: 9,  symbol: 'AVAX',  yahooSymbol: 'AVAX-USD' },
  { rank: 10, symbol: 'LINK',  yahooSymbol: 'LINK-USD' },
  { rank: 11, symbol: 'DOT',   yahooSymbol: 'DOT-USD'  },
  { rank: 12, symbol: 'MATIC', yahooSymbol: 'MATIC-USD'},
  { rank: 13, symbol: 'LTC',   yahooSymbol: 'LTC-USD'  },
  { rank: 14, symbol: 'ATOM',  yahooSymbol: 'ATOM-USD' },
  { rank: 15, symbol: 'NEAR',  yahooSymbol: 'NEAR-USD' },
  { rank: 16, symbol: 'INJ',   yahooSymbol: 'INJ-USD'  },
  { rank: 17, symbol: 'ARB',   yahooSymbol: 'ARB-USD'  },
  { rank: 18, symbol: 'OP',    yahooSymbol: 'OP-USD'   },
  { rank: 19, symbol: 'SHIB',  yahooSymbol: 'SHIB-USD' },
  { rank: 20, symbol: 'UNI',   yahooSymbol: 'UNI-USD'  },
]

function fmtVol(usd: number): string {
  if (usd >= 1e9) return `$${(usd / 1e9).toFixed(1)}B`
  if (usd >= 1e6) return `$${(usd / 1e6).toFixed(0)}M`
  return `$${usd.toLocaleString()}`
}

export function CryptoScreenerWidget() {
  const [entries, setEntries] = useState<CryptoEntry[]>(() =>
    SCREENER_COINS.map(c => ({ ...c, price: null, change24h: null, volume: '–', volumeRaw: 0, loading: true }))
  )
  const [sortKey, setSortKey] = useState<SortKey>('PRICE')
  const [filter, setFilter] = useState<Filter>('ALL')
  const [fetching, setFetching] = useState(false)

  const fetchAll = useCallback(async () => {
    setFetching(true)
    const results = await Promise.allSettled(
      SCREENER_COINS.map(async (c) => {
        try {
          const res = await fetch(`/api/stock/${c.yahooSymbol}`)
          if (res.ok) {
            const d = await res.json()
            const volumeRaw = d.volume ? d.price * d.volume : 0
            return {
              rank: c.rank,
              symbol: c.symbol,
              price: d.price ?? null,
              change24h: d.changePercent ?? null,
              volumeRaw,
              volume: volumeRaw > 0 ? fmtVol(volumeRaw) : '–',
              loading: false,
            }
          }
        } catch { /* silent */ }
        return { rank: c.rank, symbol: c.symbol, price: null, change24h: null, volume: '–', volumeRaw: 0, loading: false }
      }),
    )
    const updated = results.map((r, i) =>
      r.status === 'fulfilled' ? r.value : { ...SCREENER_COINS[i], price: null, change24h: null, volume: '–', volumeRaw: 0, loading: false }
    )
    setEntries(updated)
    setFetching(false)
  }, [])

  useEffect(() => {
    fetchAll()
    const id = setInterval(fetchAll, 120_000)
    return () => clearInterval(id)
  }, [fetchAll])

  const filtered = entries.filter(e => {
    if (filter === 'GAINERS') return (e.change24h ?? 0) > 0
    if (filter === 'LOSERS')  return (e.change24h ?? 0) < 0
    return true
  })

  const sorted = [...filtered].sort((a, b) => {
    if (sortKey === 'VOLUME') return b.volumeRaw - a.volumeRaw
    if (sortKey === 'CHANGE') return Math.abs(b.change24h ?? 0) - Math.abs(a.change24h ?? 0)
    return (b.price ?? 0) - (a.price ?? 0)
  })

  return (
    <div className="p-4 flex flex-col gap-3 h-full overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between shrink-0">
        <div className="flex items-center gap-1.5">
          <TrendingUp className="w-3.5 h-3.5 text-primary" />
          <span className="font-mono text-xs font-semibold text-foreground">CRYPTO SCREENER</span>
        </div>
        <button
          onClick={fetchAll}
          disabled={fetching}
          className="flex items-center gap-1 font-mono text-[10px] text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
        >
          <RefreshCw className={cn('w-3 h-3', fetching && 'animate-spin')} />
          {fetching ? 'Updating…' : 'Live · 2m'}
        </button>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-1.5 shrink-0">
        {(['ALL', 'GAINERS', 'LOSERS'] as Filter[]).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              'px-2 py-0.5 rounded border font-mono text-[9px] leading-none transition-colors',
              filter === f
                ? 'bg-primary/20 border-primary/40 text-primary'
                : 'border-border text-muted-foreground hover:text-foreground',
            )}
          >
            {f}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-1.5">
          {(['VOLUME', 'CHANGE', 'PRICE'] as SortKey[]).map(s => (
            <button
              key={s}
              onClick={() => setSortKey(s)}
              className={cn(
                'px-2 py-0.5 rounded border font-mono text-[9px] leading-none transition-colors',
                sortKey === s
                  ? 'bg-primary/20 border-primary/40 text-primary'
                  : 'border-border text-muted-foreground hover:text-foreground',
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Column headers */}
      <div className="grid grid-cols-[1.5rem_3.5rem_6rem_5rem_5rem] gap-x-2 px-2 shrink-0">
        {['#', 'SYMBOL', 'PRICE', '24H%', 'VOLUME'].map(col => (
          <span key={col} className="font-mono text-[9px] text-muted-foreground uppercase leading-none">{col}</span>
        ))}
      </div>

      {/* Rows */}
      <div className="flex flex-col gap-0 flex-1">
        {sorted.map(e => {
          const pos = (e.change24h ?? 0) >= 0
          return (
            <div
              key={e.symbol}
              className="grid grid-cols-[1.5rem_3.5rem_6rem_5rem_5rem] gap-x-2 font-mono text-xs border-b border-border/30 py-1.5 px-2 hover:bg-muted/10 transition-colors"
            >
              <span className="text-muted-foreground text-[10px] tabular-nums">{e.rank}</span>
              <span className="text-primary font-semibold text-[10px]">{e.symbol}</span>
              <span className="text-foreground tabular-nums text-[10px]">
                {e.price !== null
                  ? `$${e.price.toLocaleString('en-US', { minimumFractionDigits: e.price < 1 ? 4 : e.price < 10 ? 3 : 2 })}`
                  : e.loading ? '…' : '–'}
              </span>
              <span className={cn('tabular-nums text-[10px] flex items-center gap-0.5', pos ? 'text-price-up' : 'text-price-down')}>
                {e.change24h !== null ? (
                  <>
                    {pos ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
                    {pos ? '+' : ''}{e.change24h.toFixed(1)}%
                  </>
                ) : (
                  <span className="text-muted-foreground">{e.loading ? '…' : '–'}</span>
                )}
              </span>
              <span className="text-muted-foreground tabular-nums text-[10px]">{e.volume}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

