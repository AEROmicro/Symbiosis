'use client'

import { useEffect, useState } from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CryptoEntry {
  rank: number
  symbol: string
  price: number
  change24h: number
  volume: string
  volumeRaw: number
}

type SortKey = 'VOLUME' | 'CHANGE' | 'PRICE'
type Filter = 'ALL' | 'GAINERS' | 'LOSERS'

const BASE_DATA: Omit<CryptoEntry, 'price'>[] = [
  { rank: 1,  symbol: 'BTC',   change24h:  2.3, volume: '$38.2B', volumeRaw: 38.2 },
  { rank: 2,  symbol: 'ETH',   change24h:  1.8, volume: '$18.5B', volumeRaw: 18.5 },
  { rank: 3,  symbol: 'BNB',   change24h: -0.5, volume: '$2.1B',  volumeRaw: 2.1  },
  { rank: 4,  symbol: 'SOL',   change24h:  5.2, volume: '$6.8B',  volumeRaw: 6.8  },
  { rank: 5,  symbol: 'XRP',   change24h:  0.8, volume: '$3.4B',  volumeRaw: 3.4  },
  { rank: 6,  symbol: 'ADA',   change24h: -1.2, volume: '$1.2B',  volumeRaw: 1.2  },
  { rank: 7,  symbol: 'DOGE',  change24h:  3.4, volume: '$2.9B',  volumeRaw: 2.9  },
  { rank: 8,  symbol: 'AVAX',  change24h: -2.1, volume: '$890M',  volumeRaw: 0.89 },
  { rank: 9,  symbol: 'DOT',   change24h:  0.9, volume: '$620M',  volumeRaw: 0.62 },
  { rank: 10, symbol: 'MATIC', change24h: -0.7, volume: '$540M',  volumeRaw: 0.54 },
]

const BASE_PRICES: Record<string, number> = {
  BTC:   67450,
  ETH:   3520,
  BNB:   590,
  SOL:   178,
  XRP:   0.62,
  ADA:   0.48,
  DOGE:  0.165,
  AVAX:  38.5,
  DOT:   8.2,
  MATIC: 0.89,
}

function jitter(base: number): number {
  const pct = (Math.random() - 0.5) * 0.004
  return parseFloat((base * (1 + pct)).toFixed(base < 1 ? 4 : base < 10 ? 3 : 2))
}

function buildData(): CryptoEntry[] {
  return BASE_DATA.map(d => ({
    ...d,
    price: jitter(BASE_PRICES[d.symbol]),
  }))
}

export function CryptoScreenerWidget() {
  const [entries, setEntries] = useState<CryptoEntry[]>(buildData)
  const [sortKey, setSortKey] = useState<SortKey>('VOLUME')
  const [filter, setFilter] = useState<Filter>('ALL')

  useEffect(() => {
    const id = setInterval(() => setEntries(buildData()), 15_000)
    return () => clearInterval(id)
  }, [])

  const filtered = entries.filter(e => {
    if (filter === 'GAINERS') return e.change24h > 0
    if (filter === 'LOSERS')  return e.change24h < 0
    return true
  })

  const sorted = [...filtered].sort((a, b) => {
    if (sortKey === 'VOLUME') return b.volumeRaw - a.volumeRaw
    if (sortKey === 'CHANGE') return Math.abs(b.change24h) - Math.abs(a.change24h)
    return b.price - a.price
  })

  return (
    <div className="p-4 flex flex-col gap-3 h-full overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between shrink-0">
        <div className="flex items-center gap-1.5">
          <TrendingUp className="w-3.5 h-3.5 text-primary" />
          <span className="font-mono text-xs font-semibold text-foreground">CRYPTO SCREENER</span>
        </div>
        <span className="font-mono text-[10px] text-muted-foreground flex items-center gap-1">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          Live · 15s
        </span>
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
        {sorted.map(e => (
          <div
            key={e.symbol}
            className="grid grid-cols-[1.5rem_3.5rem_6rem_5rem_5rem] gap-x-2 font-mono text-xs border-b border-border/30 py-1.5 px-2 hover:bg-muted/10 transition-colors"
          >
            <span className="text-muted-foreground text-[10px] tabular-nums">{e.rank}</span>
            <span className="text-primary font-semibold text-[10px]">{e.symbol}</span>
            <span className="text-foreground tabular-nums text-[10px]">
              ${e.price.toLocaleString('en-US', { minimumFractionDigits: e.price < 1 ? 4 : e.price < 10 ? 3 : 2 })}
            </span>
            <span className={cn('tabular-nums text-[10px] flex items-center gap-0.5', e.change24h >= 0 ? 'text-price-up' : 'text-price-down')}>
              {e.change24h >= 0 ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
              {e.change24h >= 0 ? '+' : ''}{e.change24h.toFixed(1)}%
            </span>
            <span className="text-muted-foreground tabular-nums text-[10px]">{e.volume}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
