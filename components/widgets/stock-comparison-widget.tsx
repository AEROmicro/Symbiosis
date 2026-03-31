'use client'
import { cn } from '@/lib/utils'

interface StockMetrics {
  symbol: string
  name: string
  ytd: number
  oneYear: number
  pe: number
  marketCap: string
  revGrowth: number
}

const STOCKS: StockMetrics[] = [
  { symbol: 'AAPL',  name: 'Apple',     ytd: -8.4,  oneYear:  14.2, pe: 28.5, marketCap: '$2.8T',  revGrowth:  2.1 },
  { symbol: 'MSFT',  name: 'Microsoft', ytd: -12.1, oneYear:   8.7, pe: 31.2, marketCap: '$2.6T',  revGrowth: 17.6 },
  { symbol: 'NVDA',  name: 'NVIDIA',    ytd: -18.7, oneYear:  42.5, pe: 35.8, marketCap: '$2.4T',  revGrowth: 94.2 },
]

const METRICS: { key: keyof StockMetrics; label: string; format: (v: StockMetrics[keyof StockMetrics]) => string; colorFn?: (v: StockMetrics[keyof StockMetrics]) => string }[] = [
  { key: 'ytd',       label: 'YTD %',       format: v => `${(v as number) > 0 ? '+' : ''}${(v as number).toFixed(1)}%`, colorFn: v => (v as number) >= 0 ? 'text-primary' : 'text-destructive' },
  { key: 'oneYear',   label: '1Y %',        format: v => `${(v as number) > 0 ? '+' : ''}${(v as number).toFixed(1)}%`, colorFn: v => (v as number) >= 0 ? 'text-primary' : 'text-destructive' },
  { key: 'pe',        label: 'P/E',         format: v => `${(v as number).toFixed(1)}x` },
  { key: 'marketCap', label: 'Mkt Cap',     format: v => v as string },
  { key: 'revGrowth', label: 'Rev Growth',  format: v => `${(v as number) > 0 ? '+' : ''}${(v as number).toFixed(1)}%`, colorFn: v => (v as number) >= 0 ? 'text-primary' : 'text-destructive' },
]

export function StockComparisonWidget() {
  return (
    <div className="flex flex-col h-full font-mono text-xs p-3 gap-2">
      {/* header row */}
      <div className="grid gap-x-2" style={{ gridTemplateColumns: '5rem repeat(3, 1fr)' }}>
        <div className="text-[9px] text-muted-foreground uppercase tracking-wide">Metric</div>
        {STOCKS.map(s => (
          <div key={s.symbol} className="text-center">
            <div className="text-primary font-semibold">{s.symbol}</div>
            <div className="text-[9px] text-muted-foreground truncate">{s.name}</div>
          </div>
        ))}
      </div>
      <div className="border-t border-border" />
      {/* metric rows */}
      <div className="flex-1 overflow-y-auto flex flex-col gap-0.5">
        {METRICS.map((m, i) => (
          <div
            key={m.key as string}
            className={cn(
              'grid gap-x-2 py-1.5 px-1 rounded items-center',
              i % 2 === 0 ? 'bg-muted/5' : '',
            )}
            style={{ gridTemplateColumns: '5rem repeat(3, 1fr)' }}
          >
            <div className="text-[10px] text-muted-foreground">{m.label}</div>
            {STOCKS.map(s => {
              const val = s[m.key]
              return (
                <div
                  key={s.symbol}
                  className={cn('text-center tabular-nums', m.colorFn ? m.colorFn(val) : 'text-foreground')}
                >
                  {m.format(val)}
                </div>
              )
            })}
          </div>
        ))}
      </div>
      <div className="text-[9px] text-muted-foreground border-t border-border pt-1">
        Side-by-side comparison · Static sample data
      </div>
    </div>
  )
}
