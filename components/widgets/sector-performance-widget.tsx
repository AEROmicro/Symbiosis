'use client'

import { cn } from '@/lib/utils'

interface Sector {
  name: string
  ytd: number
  abbr: string
}

const SECTORS: Sector[] = [
  { name: 'Technology',           abbr: 'XLK', ytd: 12.4 },
  { name: 'Communication Svcs',   abbr: 'XLC', ytd:  8.7 },
  { name: 'Consumer Disc.',       abbr: 'XLY', ytd:  5.2 },
  { name: 'Financials',           abbr: 'XLF', ytd:  7.1 },
  { name: 'Industrials',          abbr: 'XLI', ytd:  4.8 },
  { name: 'Healthcare',           abbr: 'XLV', ytd:  2.3 },
  { name: 'Materials',            abbr: 'XLB', ytd:  1.6 },
  { name: 'Consumer Staples',     abbr: 'XLP', ytd: -0.9 },
  { name: 'Real Estate',          abbr: 'XLRE',ytd: -2.4 },
  { name: 'Utilities',            abbr: 'XLU', ytd: -1.2 },
  { name: 'Energy',               abbr: 'XLE', ytd: -5.3 },
]

export function SectorPerformanceWidget() {
  const sorted = [...SECTORS].sort((a, b) => b.ytd - a.ytd)
  const maxAbs = Math.max(...sorted.map(s => Math.abs(s.ytd)), 1)

  return (
    <div className="p-4 flex flex-col gap-2 h-full font-mono text-xs">
      <div className="flex items-center justify-between shrink-0">
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Sector Performance</span>
        <span className="text-[9px] text-muted-foreground">YTD</span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-1.5 min-h-0">
        {sorted.map(s => {
          const pos = s.ytd >= 0
          const barWidth = (Math.abs(s.ytd) / maxAbs) * 100
          return (
            <div key={s.abbr} className="space-y-0.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] truncate max-w-[130px]">{s.name}</span>
                <span className={cn('font-bold tabular-nums text-[10px]', pos ? 'text-green-500' : 'text-destructive')}>
                  {pos ? '+' : ''}{s.ytd.toFixed(1)}%
                </span>
              </div>
              <div className="h-1.5 bg-border rounded-full overflow-hidden">
                <div
                  className={cn('h-full rounded-full', pos ? 'bg-green-500/70' : 'bg-destructive/70')}
                  style={{ width: `${barWidth}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>

      <div className="text-[9px] text-muted-foreground shrink-0 flex items-center justify-between">
        <span>S&amp;P 500 Sectors</span>
        <span className="flex items-center gap-2">
          <span className="flex items-center gap-0.5"><span className="w-2 h-2 rounded-sm bg-green-500/70 inline-block" />Positive</span>
          <span className="flex items-center gap-0.5"><span className="w-2 h-2 rounded-sm bg-destructive/70 inline-block" />Negative</span>
        </span>
      </div>
    </div>
  )
}
