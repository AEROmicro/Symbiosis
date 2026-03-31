'use client'
import { cn } from '@/lib/utils'

interface IpoEntry {
  company: string
  ticker: string
  date: string
  priceRange: string
  exchange: string
}

const UPCOMING_IPOS: IpoEntry[] = [
  { company: 'CoreWeave',        ticker: 'CRWV', date: 'Mar 28, 2025', priceRange: '$47–$55', exchange: 'NASDAQ' },
  { company: 'Klarna',           ticker: 'KLAR', date: 'Apr 15, 2025', priceRange: '$55–$62', exchange: 'NYSE'   },
  { company: 'Cerebras Systems', ticker: 'CBRS', date: 'Apr 22, 2025', priceRange: '$28–$34', exchange: 'NASDAQ' },
  { company: 'StubHub',          ticker: 'STUB', date: 'May 06, 2025', priceRange: '$18–$22', exchange: 'NYSE'   },
  { company: 'Chime Financial',  ticker: 'CHYM', date: 'May 14, 2025', priceRange: '$20–$26', exchange: 'NASDAQ' },
  { company: 'Medline',          ticker: 'MDLN', date: 'May 21, 2025', priceRange: '$22–$28', exchange: 'NYSE'   },
  { company: 'Panera Brands',    ticker: 'PNRA', date: 'Jun 03, 2025', priceRange: '$16–$20', exchange: 'NASDAQ' },
  { company: 'Starlink',         ticker: 'STLK', date: 'TBD',         priceRange: 'TBD',      exchange: 'NYSE'   },
]

const exchangeBadge: Record<string, string> = {
  NASDAQ: 'bg-blue-900/40 text-blue-400 border-blue-700/50',
  NYSE:   'bg-purple-900/40 text-purple-400 border-purple-700/50',
}

export function IpoCalendarWidget() {
  return (
    <div className="flex flex-col h-full font-mono text-xs">
      {/* header */}
      <div className="grid grid-cols-[1fr_2.5rem_5rem_4rem_4rem] gap-x-1 px-3 py-1 text-[9px] text-muted-foreground border-b border-border uppercase tracking-wide shrink-0">
        <span>Company</span>
        <span>Tkr</span>
        <span className="text-right">Date</span>
        <span className="text-right">Price Rng</span>
        <span className="text-center">Exch</span>
      </div>
      <div className="flex-1 overflow-y-auto">
        {UPCOMING_IPOS.map((ipo, i) => (
          <div
            key={ipo.ticker}
            className={cn(
              'grid grid-cols-[1fr_2.5rem_5rem_4rem_4rem] gap-x-1 px-3 py-1.5 border-b border-border/30 hover:bg-muted/10 transition-colors items-center',
              i % 2 === 0 ? '' : 'bg-muted/5'
            )}
          >
            <span className="text-foreground truncate">{ipo.company}</span>
            <span className="text-primary font-semibold">{ipo.ticker}</span>
            <span className="text-right text-muted-foreground text-[10px]">{ipo.date}</span>
            <span className="text-right text-foreground">{ipo.priceRange}</span>
            <span className="flex justify-center">
              <span className={cn('px-1 py-0.5 rounded border text-[8px] leading-none', exchangeBadge[ipo.exchange] ?? 'bg-muted/40 text-muted-foreground border-border')}>
                {ipo.exchange}
              </span>
            </span>
          </div>
        ))}
      </div>
      <div className="text-[9px] text-muted-foreground px-3 py-1 border-t border-border shrink-0">
        Upcoming IPO listings · Static data for illustration
      </div>
    </div>
  )
}
