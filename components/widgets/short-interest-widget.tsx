'use client'
import { cn } from '@/lib/utils'

interface ShortData {
  symbol: string
  name: string
  shortFloat: number
  shortRatio: number
  change: number
}

const SHORT_DATA: ShortData[] = [
  { symbol: 'GME',  name: 'GameStop',         shortFloat: 22.4, shortRatio: 3.2,  change: -1.8 },
  { symbol: 'AMC',  name: 'AMC Entertainment', shortFloat: 19.7, shortRatio: 2.8,  change:  0.4 },
  { symbol: 'BYND', name: 'Beyond Meat',       shortFloat: 38.1, shortRatio: 6.4,  change:  1.2 },
  { symbol: 'CVNA', name: 'Carvana',           shortFloat: 12.3, shortRatio: 2.1,  change: -0.6 },
  { symbol: 'RIVN', name: 'Rivian',            shortFloat: 15.6, shortRatio: 3.5,  change:  0.9 },
  { symbol: 'LCID', name: 'Lucid Group',       shortFloat: 17.9, shortRatio: 2.9,  change: -0.3 },
  { symbol: 'TSLA', name: 'Tesla',             shortFloat:  3.4, shortRatio: 0.8,  change: -0.2 },
  { symbol: 'PLTR', name: 'Palantir',          shortFloat:  6.1, shortRatio: 1.4,  change:  0.1 },
  { symbol: 'COIN', name: 'Coinbase',          shortFloat:  8.9, shortRatio: 1.6,  change:  0.5 },
]

function shortColor(pct: number): string {
  if (pct >= 20) return 'text-destructive'
  if (pct >= 10) return 'text-yellow-400'
  return 'text-primary'
}

export function ShortInterestWidget() {
  return (
    <div className="flex flex-col h-full font-mono text-xs">
      <div className="grid grid-cols-[3rem_1fr_4.5rem_4rem_4rem] gap-x-1 px-3 py-1 text-[9px] text-muted-foreground border-b border-border uppercase tracking-wide shrink-0">
        <span>Sym</span>
        <span>Name</span>
        <span className="text-right">Short %</span>
        <span className="text-right">S.Ratio</span>
        <span className="text-right">Δ</span>
      </div>
      <div className="flex-1 overflow-y-auto">
        {SHORT_DATA.sort((a, b) => b.shortFloat - a.shortFloat).map((s, i) => (
          <div
            key={s.symbol}
            className={cn(
              'grid grid-cols-[3rem_1fr_4.5rem_4rem_4rem] gap-x-1 px-3 py-1.5 border-b border-border/30 hover:bg-muted/10 transition-colors items-center',
              i % 2 === 0 ? '' : 'bg-muted/5'
            )}
          >
            <span className="text-primary font-semibold">{s.symbol}</span>
            <span className="text-muted-foreground truncate">{s.name}</span>
            <span className={cn('text-right font-semibold', shortColor(s.shortFloat))}>
              {s.shortFloat.toFixed(1)}%
            </span>
            <span className="text-right text-foreground">{s.shortRatio.toFixed(1)}</span>
            <span className={cn('text-right', s.change > 0 ? 'text-destructive' : s.change < 0 ? 'text-primary' : 'text-muted-foreground')}>
              {s.change > 0 ? '+' : ''}{s.change.toFixed(1)}%
            </span>
          </div>
        ))}
      </div>
      <div className="text-[9px] text-muted-foreground px-3 py-1 border-t border-border shrink-0">
        Short Float ≥20% <span className="text-destructive">■</span> ≥10% <span className="text-yellow-400">■</span> &lt;10% <span className="text-primary">■</span>
      </div>
    </div>
  )
}
