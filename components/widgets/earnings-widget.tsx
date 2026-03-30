'use client'
import { useState } from 'react'
import { cn } from '@/lib/utils'

interface Earning {
  ticker: string
  name: string
  date: string
  time: 'BMO' | 'AMC' | 'TAS'
  epsEst: number | null
  confirmed: boolean
}

const THIS_WEEK: Earning[] = [
  { ticker: 'JPM',  name: 'JPMorgan Chase',       date: 'Today',     time: 'BMO', epsEst: 4.11,  confirmed: true  },
  { ticker: 'WFC',  name: 'Wells Fargo',           date: 'Today',     time: 'BMO', epsEst: 1.24,  confirmed: true  },
  { ticker: 'DAL',  name: 'Delta Air Lines',       date: 'Today',     time: 'BMO', epsEst: 0.37,  confirmed: true  },
  { ticker: 'BLK',  name: 'BlackRock',             date: 'Tomorrow',  time: 'BMO', epsEst: 9.85,  confirmed: true  },
  { ticker: 'C',    name: 'Citigroup',             date: 'Tomorrow',  time: 'BMO', epsEst: 1.58,  confirmed: true  },
  { ticker: 'MS',   name: 'Morgan Stanley',        date: 'Wed Apr 16',time: 'BMO', epsEst: 2.31,  confirmed: false },
  { ticker: 'GS',   name: 'Goldman Sachs',         date: 'Wed Apr 16',time: 'BMO', epsEst: 8.56,  confirmed: true  },
  { ticker: 'ASML', name: 'ASML Holding',          date: 'Wed Apr 16',time: 'BMO', epsEst: 6.37,  confirmed: true  },
  { ticker: 'NFLX', name: 'Netflix',               date: 'Thu Apr 17',time: 'AMC', epsEst: 5.68,  confirmed: true  },
  { ticker: 'UNH',  name: 'UnitedHealth Group',    date: 'Thu Apr 17',time: 'BMO', epsEst: 7.29,  confirmed: true  },
  { ticker: 'TSM',  name: 'Taiwan Semiconductor',  date: 'Thu Apr 17',time: 'TAS', epsEst: 1.93,  confirmed: false },
  { ticker: 'USB',  name: 'U.S. Bancorp',          date: 'Fri Apr 18',time: 'BMO', epsEst: 0.99,  confirmed: false },
]

const NEXT_WEEK: Earning[] = [
  { ticker: 'NVDA', name: 'NVIDIA',                date: 'Mon Apr 21',time: 'AMC', epsEst: 5.57,  confirmed: false },
  { ticker: 'GOOG', name: 'Alphabet',              date: 'Tue Apr 22',time: 'AMC', epsEst: 2.01,  confirmed: true  },
  { ticker: 'MSFT', name: 'Microsoft',             date: 'Wed Apr 23',time: 'AMC', epsEst: 3.22,  confirmed: true  },
  { ticker: 'META', name: 'Meta Platforms',        date: 'Wed Apr 23',time: 'AMC', epsEst: 5.25,  confirmed: true  },
  { ticker: 'BA',   name: 'Boeing',                date: 'Wed Apr 23',time: 'BMO', epsEst: -2.84, confirmed: false },
  { ticker: 'AAPL', name: 'Apple',                 date: 'Thu Apr 24',time: 'AMC', epsEst: 1.62,  confirmed: true  },
  { ticker: 'AMZN', name: 'Amazon',                date: 'Thu Apr 24',time: 'AMC', epsEst: 1.37,  confirmed: true  },
  { ticker: 'MRK',  name: 'Merck',                 date: 'Thu Apr 24',time: 'BMO', epsEst: 2.14,  confirmed: false },
  { ticker: 'XOM',  name: 'ExxonMobil',            date: 'Fri Apr 25',time: 'BMO', epsEst: 2.11,  confirmed: false },
  { ticker: 'CVX',  name: 'Chevron',               date: 'Fri Apr 25',time: 'BMO', epsEst: 2.93,  confirmed: false },
  { ticker: 'CAT',  name: 'Caterpillar',           date: 'Fri Apr 25',time: 'BMO', epsEst: 5.18,  confirmed: true  },
  { ticker: 'T',    name: 'AT&T',                  date: 'Fri Apr 25',time: 'BMO', epsEst: 0.52,  confirmed: false },
]

const timeBadge: Record<string, string> = {
  BMO: 'bg-green-900/40 text-green-400 border-green-700/50',
  AMC: 'bg-amber-900/40 text-amber-400 border-amber-700/50',
  TAS: 'bg-muted/60 text-muted-foreground border-border',
}

export function EarningsWidget() {
  const [tab, setTab] = useState<'this' | 'next'>('this')
  const rows = tab === 'this' ? THIS_WEEK : NEXT_WEEK

  return (
    <div className="flex flex-col h-full font-mono text-xs">
      {/* tabs */}
      <div className="flex gap-1 px-3 pt-2 pb-1">
        {(['this', 'next'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              'px-2 py-0.5 rounded border text-[10px] transition-colors',
              tab === t
                ? 'bg-primary/20 text-primary border-primary/40'
                : 'border-border text-muted-foreground hover:text-foreground'
            )}
          >
            {t === 'this' ? 'This Week' : 'Next Week'}
          </button>
        ))}
      </div>

      {/* header */}
      <div className="grid grid-cols-[2.5rem_1fr_3.5rem_2rem_3.5rem_2.5rem] gap-x-1 px-3 py-1 text-[9px] text-muted-foreground border-b border-border uppercase tracking-wide">
        <span>Ticker</span>
        <span>Company</span>
        <span className="text-right">Date</span>
        <span className="text-center">Time</span>
        <span className="text-right">EPS Est</span>
        <span className="text-center">Conf</span>
      </div>

      <div className="flex-1 overflow-y-auto">
        {rows.map((r, i) => (
          <div
            key={r.ticker + i}
            className="grid grid-cols-[2.5rem_1fr_3.5rem_2rem_3.5rem_2.5rem] gap-x-1 px-3 py-1.5 border-b border-border/30 hover:bg-muted/10 transition-colors items-center"
          >
            <span className="text-primary font-semibold">{r.ticker}</span>
            <span className="text-muted-foreground truncate">{r.name}</span>
            <span className="text-right text-foreground">{r.date}</span>
            <span className="flex justify-center">
              <span className={cn('px-1 py-0.5 rounded border text-[8px] leading-none', timeBadge[r.time])}>
                {r.time}
              </span>
            </span>
            <span className={cn('text-right', r.epsEst != null && r.epsEst < 0 ? 'text-red-400' : 'text-foreground')}>
              {r.epsEst != null ? (r.epsEst > 0 ? `$${r.epsEst.toFixed(2)}` : `-$${Math.abs(r.epsEst).toFixed(2)}`) : '—'}
            </span>
            <span className="text-center">
              {r.confirmed
                ? <span className="text-green-400">✓</span>
                : <span className="text-muted-foreground">?</span>}
            </span>
          </div>
        ))}
      </div>

      <div className="text-[9px] text-muted-foreground px-3 py-1 border-t border-border">
        BMO = Before Market Open · AMC = After Close · TAS = Time As Scheduled
      </div>
    </div>
  )
}
