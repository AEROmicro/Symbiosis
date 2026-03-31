'use client'

import useSWR from 'swr'
import { RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StockQuote {
  price: number
  change: number
  changePercent: number
  name?: string
}

const fetcher = (url: string) => fetch(url).then(r => r.json())

interface VolEntry {
  symbol: string
  label: string
  encodedSymbol: string
}

const VOL_INDICES: VolEntry[] = [
  { symbol: '^VIX',   label: 'CBOE VIX',    encodedSymbol: '%5EVIX'   },
  { symbol: '^VXN',   label: 'NASDAQ VIX',  encodedSymbol: '%5EVXN'   },
  { symbol: '^RVX',   label: 'Russell VIX', encodedSymbol: '%5ERVX'   },
  { symbol: '^VVIX',  label: 'VIX of VIX',  encodedSymbol: '%5EVVIX'  },
]

function vixLabel(vix: number): { text: string; cls: string } {
  if (vix >= 40) return { text: 'Extreme Fear',  cls: 'text-destructive' }
  if (vix >= 30) return { text: 'High Fear',     cls: 'text-orange-400'  }
  if (vix >= 20) return { text: 'Fear',          cls: 'text-yellow-400'  }
  if (vix >= 15) return { text: 'Neutral',       cls: 'text-foreground'  }
  return              { text: 'Complacent',      cls: 'text-primary'     }
}

function vixBarColor(vix: number): string {
  if (vix >= 40) return 'bg-destructive'
  if (vix >= 30) return 'bg-orange-500'
  if (vix >= 20) return 'bg-yellow-500'
  if (vix >= 15) return 'bg-foreground/50'
  return 'bg-primary'
}

function VolRow({ entry }: { entry: VolEntry }) {
  const { data, isLoading } = useSWR<StockQuote>(
    `/api/stock/${entry.encodedSymbol}`,
    fetcher,
    { refreshInterval: 30_000, dedupingInterval: 10_000 }
  )

  if (isLoading && !data) {
    return (
      <div className="px-3 py-2 border-b border-border/30 flex items-center gap-2">
        <span className="text-muted-foreground text-[10px]">{entry.label}</span>
        <RefreshCw className="w-3 h-3 animate-spin text-muted-foreground ml-auto" />
      </div>
    )
  }

  if (!data || data.price == null) {
    return (
      <div className="px-3 py-2 border-b border-border/30">
        <span className="text-muted-foreground text-[10px]">{entry.label} — unavailable</span>
      </div>
    )
  }

  const { text: label, cls } = vixLabel(data.price)
  const barPct = Math.min((data.price / 60) * 100, 100)

  return (
    <div className="px-3 py-2 border-b border-border/30 hover:bg-muted/10 transition-colors">
      <div className="flex items-center justify-between mb-1">
        <div>
          <span className="text-primary font-semibold">{entry.symbol}</span>
          <span className="text-muted-foreground text-[10px] ml-1.5">{entry.label}</span>
        </div>
        <div className="text-right">
          <span className="font-semibold tabular-nums">{data.price.toFixed(2)}</span>
          <span className={cn('text-[10px] ml-1.5 tabular-nums', data.change >= 0 ? 'text-destructive' : 'text-primary')}>
            {data.change >= 0 ? '+' : ''}{data.changePercent?.toFixed(2)}%
          </span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1.5 bg-muted/30 rounded overflow-hidden">
          <div
            className={cn('h-full rounded transition-all duration-500', vixBarColor(data.price))}
            style={{ width: `${barPct}%` }}
          />
        </div>
        <span className={cn('text-[10px] font-semibold shrink-0 w-24 text-right', cls)}>{label}</span>
      </div>
    </div>
  )
}

export function VolatilityWidget() {
  return (
    <div className="flex flex-col h-full font-mono text-xs">
      <div className="flex-1 overflow-y-auto">
        {VOL_INDICES.map(entry => (
          <VolRow key={entry.symbol} entry={entry} />
        ))}
      </div>
      <div className="text-[9px] text-muted-foreground px-3 py-1 border-t border-border shrink-0">
        VIX scale: &lt;15 Complacent · 15–20 Neutral · 20–30 Fear · 30+ High Fear · 40+ Extreme Fear
      </div>
    </div>
  )
}
