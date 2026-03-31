'use client'
import { cn } from '@/lib/utils'

interface AnalystRating {
  symbol: string
  name: string
  buy: number
  hold: number
  sell: number
  target: number
}

const RATINGS: AnalystRating[] = [
  { symbol: 'AAPL',  name: 'Apple',          buy: 28, hold: 12, sell: 3,  target: 210 },
  { symbol: 'MSFT',  name: 'Microsoft',       buy: 35, hold: 7,  sell: 1,  target: 480 },
  { symbol: 'NVDA',  name: 'NVIDIA',          buy: 40, hold: 5,  sell: 2,  target: 950 },
  { symbol: 'AMZN',  name: 'Amazon',          buy: 38, hold: 8,  sell: 1,  target: 230 },
  { symbol: 'GOOGL', name: 'Alphabet',        buy: 33, hold: 9,  sell: 2,  target: 200 },
  { symbol: 'META',  name: 'Meta',            buy: 36, hold: 6,  sell: 3,  target: 620 },
  { symbol: 'TSLA',  name: 'Tesla',           buy: 15, hold: 14, sell: 14, target: 280 },
  { symbol: 'JPM',   name: 'JPMorgan',        buy: 22, hold: 10, sell: 4,  target: 245 },
]

function consensus(r: AnalystRating): { label: string; cls: string } {
  const total = r.buy + r.hold + r.sell
  const buyPct = r.buy / total
  const sellPct = r.sell / total
  if (buyPct >= 0.6)  return { label: 'Strong Buy', cls: 'text-primary' }
  if (buyPct >= 0.4)  return { label: 'Buy',         cls: 'text-primary/80' }
  if (sellPct >= 0.4) return { label: 'Sell',        cls: 'text-destructive' }
  return { label: 'Hold', cls: 'text-yellow-400' }
}

export function AnalystRatingsWidget() {
  return (
    <div className="flex flex-col h-full font-mono text-xs">
      <div className="grid grid-cols-[3rem_1fr_4rem_4rem_4rem_5rem] gap-x-1 px-3 py-1 text-[9px] text-muted-foreground border-b border-border uppercase tracking-wide shrink-0">
        <span>Sym</span>
        <span>Name</span>
        <span className="text-center text-primary">Buy</span>
        <span className="text-center text-yellow-400">Hold</span>
        <span className="text-center text-destructive">Sell</span>
        <span className="text-right">Consensus</span>
      </div>
      <div className="flex-1 overflow-y-auto">
        {RATINGS.map((r, i) => {
          const c = consensus(r)
          return (
            <div
              key={r.symbol}
              className={cn(
                'grid grid-cols-[3rem_1fr_4rem_4rem_4rem_5rem] gap-x-1 px-3 py-1.5 border-b border-border/30 hover:bg-muted/10 transition-colors items-center',
                i % 2 === 0 ? '' : 'bg-muted/5'
              )}
            >
              <span className="text-primary font-semibold">{r.symbol}</span>
              <span className="text-muted-foreground truncate">{r.name}</span>
              <span className="text-center text-primary">{r.buy}</span>
              <span className="text-center text-yellow-400">{r.hold}</span>
              <span className="text-center text-destructive">{r.sell}</span>
              <span className={cn('text-right font-semibold', c.cls)}>{c.label}</span>
            </div>
          )
        })}
      </div>
      <div className="text-[9px] text-muted-foreground px-3 py-1 border-t border-border shrink-0">
        Wall Street analyst consensus · Static sample data
      </div>
    </div>
  )
}
