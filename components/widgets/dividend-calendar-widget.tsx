'use client'

import { useMemo } from 'react'
import { CalendarDays } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DividendEntry {
  symbol: string
  company: string
  exDate: string
  payDate: string
  yield: number
}

const DIVIDENDS: DividendEntry[] = [
  { symbol: 'JNJ',  company: 'Johnson & Johnson',  exDate: 'Feb 18', payDate: 'Mar 04', yield: 3.1 },
  { symbol: 'KO',   company: 'Coca-Cola',           exDate: 'Feb 14', payDate: 'Apr 01', yield: 3.2 },
  { symbol: 'T',    company: 'AT&T',                exDate: 'Jan 10', payDate: 'Feb 01', yield: 6.8 },
  { symbol: 'VZ',   company: 'Verizon',             exDate: 'Jan 08', payDate: 'Feb 03', yield: 6.6 },
  { symbol: 'ABBV', company: 'AbbVie',              exDate: 'Jan 14', payDate: 'Feb 14', yield: 3.9 },
  { symbol: 'PG',   company: 'Procter & Gamble',    exDate: 'Jan 18', payDate: 'Feb 15', yield: 2.4 },
  { symbol: 'MCD',  company: "McDonald's",          exDate: 'Feb 28', payDate: 'Mar 17', yield: 2.3 },
  { symbol: 'O',    company: 'Realty Income',       exDate: 'Jan 31', payDate: 'Feb 14', yield: 5.8 },
  { symbol: 'AVGO', company: 'Broadcom',            exDate: 'Mar 20', payDate: 'Mar 31', yield: 1.8 },
  { symbol: 'PFE',  company: 'Pfizer',              exDate: 'Jan 24', payDate: 'Mar 07', yield: 5.9 },
]

export function DividendCalendarWidget() {
  const today = useMemo(
    () => new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
    []
  )

  return (
    <div className="p-4 flex flex-col gap-3 h-full overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between shrink-0">
        <div className="flex items-center gap-1.5">
          <CalendarDays className="w-3.5 h-3.5 text-primary" />
          <span className="font-mono text-xs font-semibold text-foreground">Dividend Calendar</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="px-1.5 py-0.5 rounded border text-[9px] leading-none font-mono text-primary border-primary/40 bg-primary/10">
            Next 30 Days
          </span>
          <span className="font-mono text-[9px] text-muted-foreground">{today}</span>
        </div>
      </div>

      {/* Column headers */}
      <div className="grid grid-cols-[3.5rem_1fr_4rem_4rem_3.5rem] gap-x-2 px-2 shrink-0">
        {['SYMBOL', 'COMPANY', 'EX-DATE', 'PAY DATE', 'YIELD'].map(col => (
          <span key={col} className="font-mono text-[9px] text-muted-foreground uppercase leading-none">{col}</span>
        ))}
      </div>

      {/* Rows */}
      <div className="flex flex-col flex-1">
        {DIVIDENDS.map((d) => (
          <div
            key={d.symbol}
            className="grid grid-cols-[3.5rem_1fr_4rem_4rem_3.5rem] gap-x-2 items-center border-b border-border/30 py-1.5 px-2 hover:bg-muted/10 transition-colors"
          >
            <span className="font-mono text-[10px] text-primary font-semibold">{d.symbol}</span>
            <span className="font-mono text-[10px] text-muted-foreground truncate">{d.company}</span>
            <span className="font-mono text-[10px] text-foreground tabular-nums">{d.exDate}</span>
            <span className="font-mono text-[10px] text-foreground tabular-nums">{d.payDate}</span>
            <span className={cn(
              'font-mono text-[10px] tabular-nums font-semibold',
              d.yield >= 5 ? 'text-price-up' : 'text-foreground'
            )}>
              {d.yield.toFixed(1)}%
            </span>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="shrink-0 pt-1 border-t border-border/30">
        <span className="font-mono text-[10px] text-muted-foreground">
          Yields &gt;5% highlighted · Dates approximate
        </span>
      </div>
    </div>
  )
}
