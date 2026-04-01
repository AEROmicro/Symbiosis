'use client'

import { Scissors } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SplitEntry {
  symbol: string
  company: string
  ratio: string
  announced: string
  exDate: string
  status: 'UPCOMING' | 'RECENT'
}

const SPLITS: SplitEntry[] = [
  { symbol: 'NVDA',  company: 'NVIDIA',           ratio: '10:1',  announced: 'May 22, 2024',  exDate: 'Jun 10, 2024',  status: 'RECENT'   },
  { symbol: 'TSLA',  company: 'Tesla',             ratio: '3:1',   announced: 'Aug 05, 2022',  exDate: 'Aug 25, 2022',  status: 'RECENT'   },
  { symbol: 'AMZN',  company: 'Amazon',            ratio: '20:1',  announced: 'Mar 09, 2022',  exDate: 'Jun 06, 2022',  status: 'RECENT'   },
  { symbol: 'GOOGL', company: 'Alphabet',          ratio: '20:1',  announced: 'Feb 01, 2022',  exDate: 'Jul 18, 2022',  status: 'RECENT'   },
  { symbol: 'SHOP',  company: 'Shopify',           ratio: '10:1',  announced: 'Apr 11, 2022',  exDate: 'Jun 29, 2022',  status: 'RECENT'   },
  { symbol: 'CMG',   company: 'Chipotle',          ratio: '50:1',  announced: 'Mar 19, 2024',  exDate: 'Jun 26, 2024',  status: 'RECENT'   },
  { symbol: 'SMCI',  company: 'Super Micro',       ratio: '10:1',  announced: 'Sep 30, 2024',  exDate: 'Oct 01, 2024',  status: 'UPCOMING' },
  { symbol: 'PLTR',  company: 'Palantir',          ratio: '5:1',   announced: 'Nov 04, 2024',  exDate: 'Nov 15, 2024',  status: 'UPCOMING' },
]

export function StockSplitTrackerWidget() {
  return (
    <div className="p-4 flex flex-col gap-3 h-full overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between shrink-0">
        <div className="flex items-center gap-1.5">
          <Scissors className="w-3.5 h-3.5 text-primary" />
          <span className="font-mono text-xs font-semibold text-foreground">Stock Split Tracker</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="px-1.5 py-0.5 rounded border text-[9px] leading-none font-mono text-amber-400 bg-amber-900/20 border-amber-700/40">
            {SPLITS.filter(s => s.status === 'UPCOMING').length} Upcoming
          </span>
          <span className="px-1.5 py-0.5 rounded border text-[9px] leading-none font-mono text-cyan-400 bg-cyan-900/20 border-cyan-700/40">
            {SPLITS.filter(s => s.status === 'RECENT').length} Recent
          </span>
        </div>
      </div>

      {/* Column headers */}
      <div className="grid grid-cols-[3.5rem_1fr_3.5rem_5.5rem_5rem] gap-x-2 px-2 shrink-0">
        {['SYMBOL', 'COMPANY', 'RATIO', 'EX-DATE', 'STATUS'].map(col => (
          <span key={col} className="font-mono text-[9px] text-muted-foreground uppercase leading-none">{col}</span>
        ))}
      </div>

      {/* Rows */}
      <div className="flex flex-col flex-1">
        {SPLITS.map((s) => (
          <div
            key={`${s.symbol}-${s.exDate}`}
            className="grid grid-cols-[3.5rem_1fr_3.5rem_5.5rem_5rem] gap-x-2 items-center border-b border-border/30 py-1.5 px-2 hover:bg-muted/10 transition-colors"
          >
            <span className="font-mono text-[10px] text-primary font-semibold">{s.symbol}</span>
            <span className="font-mono text-[10px] text-muted-foreground truncate">{s.company}</span>
            <span className="font-mono text-[10px] text-foreground font-semibold tabular-nums">{s.ratio}</span>
            <span className="font-mono text-[10px] text-foreground tabular-nums">{s.exDate}</span>
            <span>
              <span className={cn(
                'px-1.5 py-0.5 rounded border text-[9px] leading-none font-semibold font-mono',
                s.status === 'UPCOMING'
                  ? 'text-amber-400 bg-amber-900/20 border-amber-700/40'
                  : 'text-cyan-400 bg-cyan-900/20 border-cyan-700/40'
              )}>
                {s.status}
              </span>
            </span>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="shrink-0 pt-1 border-t border-border/30">
        <span className="font-mono text-[10px] text-muted-foreground">
          Data shown for informational purposes only
        </span>
      </div>
    </div>
  )
}
