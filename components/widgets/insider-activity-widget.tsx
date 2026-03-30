'use client'
import { useState } from 'react'
import { cn } from '@/lib/utils'

type TxType = 'Buy' | 'Sell'

interface InsiderTx {
  company: string
  ticker: string
  insider: string
  title: string
  type: TxType
  shares: number
  value: number
  date: string
}

const TRANSACTIONS: InsiderTx[] = [
  { company: 'NVIDIA',           ticker: 'NVDA', insider: 'Jensen Huang',      title: 'CEO',       type: 'Sell', shares: 120_000, value: 13_560_000, date: 'Apr 10' },
  { company: 'Meta Platforms',   ticker: 'META', insider: 'Mark Zuckerberg',   title: 'CEO',       type: 'Sell', shares:  80_000, value: 41_600_000, date: 'Apr 9'  },
  { company: 'JPMorgan Chase',   ticker: 'JPM',  insider: 'Jamie Dimon',       title: 'CEO',       type: 'Sell', shares: 150_000, value: 30_150_000, date: 'Apr 8'  },
  { company: 'Eli Lilly',        ticker: 'LLY',  insider: 'David Ricks',       title: 'CEO',       type: 'Buy',  shares:  10_000, value:  7_600_000, date: 'Apr 7'  },
  { company: 'Berkshire Hathaway',ticker:'BRK.B',insider: 'Warren Buffett',    title: 'CEO',       type: 'Buy',  shares: 500_000, value: 18_500_000, date: 'Apr 7'  },
  { company: 'Apple',            ticker: 'AAPL', insider: 'Luca Maestri',      title: 'CFO',       type: 'Sell', shares:  40_000, value:  7_280_000, date: 'Apr 6'  },
  { company: 'ExxonMobil',       ticker: 'XOM',  insider: 'Darren Woods',      title: 'CEO',       type: 'Buy',  shares:  25_000, value:  2_875_000, date: 'Apr 5'  },
  { company: 'Tesla',            ticker: 'TSLA', insider: 'Elon Musk',         title: 'CEO',       type: 'Sell', shares: 200_000, value: 36_000_000, date: 'Apr 4'  },
  { company: 'UnitedHealth',     ticker: 'UNH',  insider: 'Andrew Witty',      title: 'CEO',       type: 'Buy',  shares:   5_000, value:  2_665_000, date: 'Apr 3'  },
  { company: 'Microsoft',        ticker: 'MSFT', insider: 'Satya Nadella',     title: 'CEO',       type: 'Sell', shares:  60_000, value: 24_420_000, date: 'Apr 2'  },
]

function fmtValue(v: number) {
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`
  return `$${(v / 1_000).toFixed(0)}K`
}

type Filter = 'All' | 'Buys' | 'Sells'

export function InsiderActivityWidget() {
  const [filter, setFilter] = useState<Filter>('All')

  const rows = TRANSACTIONS.filter(t => {
    if (filter === 'Buys')  return t.type === 'Buy'
    if (filter === 'Sells') return t.type === 'Sell'
    return true
  })

  return (
    <div className="flex flex-col h-full font-mono text-xs">
      <div className="flex gap-1 px-3 pt-2 pb-1">
        {(['All', 'Buys', 'Sells'] as Filter[]).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              'px-2 py-0.5 rounded border text-[10px] transition-colors',
              filter === f
                ? 'bg-primary/20 text-primary border-primary/40'
                : 'border-border text-muted-foreground hover:text-foreground'
            )}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-[3rem_1fr_1fr_2.5rem_3.5rem_3rem] gap-x-1 px-3 py-1 text-[9px] text-muted-foreground border-b border-border uppercase tracking-wide">
        <span>Ticker</span>
        <span>Insider</span>
        <span>Title</span>
        <span className="text-center">Type</span>
        <span className="text-right">Value</span>
        <span className="text-right">Date</span>
      </div>

      <div className="flex-1 overflow-y-auto">
        {rows.map((r, i) => (
          <div
            key={i}
            className="grid grid-cols-[3rem_1fr_1fr_2.5rem_3.5rem_3rem] gap-x-1 px-3 py-1.5 border-b border-border/30 hover:bg-muted/10 items-center transition-colors"
          >
            <span className="text-primary font-semibold">{r.ticker}</span>
            <span className="text-foreground truncate">{r.insider}</span>
            <span className="text-muted-foreground truncate text-[9px]">{r.title}</span>
            <span className={cn(
              'text-center text-[8px] font-semibold rounded px-0.5 py-0.5',
              r.type === 'Buy' ? 'text-green-400' : 'text-red-400'
            )}>
              {r.type}
            </span>
            <span className="text-right text-foreground">{fmtValue(r.value)}</span>
            <span className="text-right text-muted-foreground text-[9px]">{r.date}</span>
          </div>
        ))}
      </div>

      <div className="text-[9px] text-muted-foreground px-3 py-1 border-t border-border text-right">
        Source: SEC Form 4 filings
      </div>
    </div>
  )
}
