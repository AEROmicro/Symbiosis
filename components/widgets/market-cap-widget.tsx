'use client'
import { cn } from '@/lib/utils'

interface MarketCapEntry {
  rank: number
  symbol: string
  name: string
  marketCap: string
  marketCapNum: number
  change1d: number
}

const LEADERBOARD: MarketCapEntry[] = [
  { rank: 1,  symbol: 'AAPL',  name: 'Apple',          marketCap: '$2.84T',  marketCapNum: 2840, change1d: -0.8  },
  { rank: 2,  symbol: 'MSFT',  name: 'Microsoft',      marketCap: '$2.61T',  marketCapNum: 2610, change1d: -1.2  },
  { rank: 3,  symbol: 'NVDA',  name: 'NVIDIA',         marketCap: '$2.40T',  marketCapNum: 2400, change1d: -2.1  },
  { rank: 4,  symbol: 'AMZN',  name: 'Amazon',         marketCap: '$2.18T',  marketCapNum: 2180, change1d:  0.5  },
  { rank: 5,  symbol: 'GOOGL', name: 'Alphabet',       marketCap: '$1.97T',  marketCapNum: 1970, change1d: -0.4  },
  { rank: 6,  symbol: 'META',  name: 'Meta Platforms', marketCap: '$1.42T',  marketCapNum: 1420, change1d:  1.1  },
  { rank: 7,  symbol: 'BRK.B', name: 'Berkshire',      marketCap: '$1.07T',  marketCapNum: 1070, change1d:  0.2  },
  { rank: 8,  symbol: 'TSLA',  name: 'Tesla',          marketCap: '$856B',   marketCapNum:  856, change1d: -3.4  },
  { rank: 9,  symbol: 'AVGO',  name: 'Broadcom',       marketCap: '$818B',   marketCapNum:  818, change1d: -1.8  },
  { rank: 10, symbol: 'JPM',   name: 'JPMorgan',       marketCap: '$724B',   marketCapNum:  724, change1d:  0.7  },
]

export function MarketCapWidget() {
  const maxCap = LEADERBOARD[0].marketCapNum

  return (
    <div className="flex flex-col h-full font-mono text-xs">
      <div className="grid grid-cols-[1.5rem_3rem_1fr_4rem_4rem] gap-x-1 px-3 py-1 text-[9px] text-muted-foreground border-b border-border uppercase tracking-wide shrink-0">
        <span>#</span>
        <span>Sym</span>
        <span>Company</span>
        <span className="text-right">Mkt Cap</span>
        <span className="text-right">1D %</span>
      </div>
      <div className="flex-1 overflow-y-auto">
        {LEADERBOARD.map((entry, i) => (
          <div
            key={entry.symbol}
            className={cn(
              'px-3 py-1.5 border-b border-border/30 hover:bg-muted/10 transition-colors',
              i % 2 === 0 ? '' : 'bg-muted/5'
            )}
          >
            <div className="grid grid-cols-[1.5rem_3rem_1fr_4rem_4rem] gap-x-1 items-center mb-1">
              <span className="text-muted-foreground">{entry.rank}</span>
              <span className="text-primary font-semibold">{entry.symbol}</span>
              <span className="text-muted-foreground truncate">{entry.name}</span>
              <span className="text-right text-foreground">{entry.marketCap}</span>
              <span className={cn('text-right font-semibold', entry.change1d >= 0 ? 'text-primary' : 'text-destructive')}>
                {entry.change1d >= 0 ? '+' : ''}{entry.change1d.toFixed(1)}%
              </span>
            </div>
            {/* mini bar */}
            <div className="h-0.5 bg-muted/20 rounded overflow-hidden">
              <div
                className="h-full bg-primary/40 rounded"
                style={{ width: `${(entry.marketCapNum / maxCap) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="text-[9px] text-muted-foreground px-3 py-1 border-t border-border shrink-0">
        Top 10 by market cap · Static sample data
      </div>
    </div>
  )
}
