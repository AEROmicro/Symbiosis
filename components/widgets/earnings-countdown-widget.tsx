'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface EarningsEntry {
  symbol: string
  company: string
  date: string
}

const EARNINGS: EarningsEntry[] = [
  { symbol: 'AAPL',  company: 'Apple Inc.',       date: '2026-07-29' },
  { symbol: 'MSFT',  company: 'Microsoft Corp.',   date: '2026-07-22' },
  { symbol: 'GOOGL', company: 'Alphabet Inc.',     date: '2026-07-28' },
  { symbol: 'AMZN',  company: 'Amazon.com Inc.',   date: '2026-07-30' },
  { symbol: 'META',  company: 'Meta Platforms',    date: '2026-07-23' },
  { symbol: 'NVDA',  company: 'NVIDIA Corp.',      date: '2026-08-27' },
  { symbol: 'TSLA',  company: 'Tesla Inc.',        date: '2026-07-21' },
  { symbol: 'NFLX',  company: 'Netflix Inc.',      date: '2026-07-15' },
]

function daysUntil(dateStr: string): number {
  const target = new Date(dateStr + 'T12:00:00')
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
}

export function EarningsCountdownWidget() {
  const [now, setNow] = useState<Date | null>(null)

  useEffect(() => {
    setNow(new Date())
    const id = setInterval(() => setNow(new Date()), 60_000)
    return () => clearInterval(id)
  }, [])

  const entries = EARNINGS.map(e => ({ ...e, days: daysUntil(e.date) }))
    .sort((a, b) => a.days - b.days)

  const getDayColor = (days: number) => {
    if (days < 0) return 'text-muted-foreground'
    if (days < 7) return 'text-destructive'
    if (days < 30) return 'text-amber-500'
    return 'text-green-500'
  }

  const getDotColor = (days: number) => {
    if (days < 0) return 'bg-muted-foreground/40'
    if (days < 7) return 'bg-destructive'
    if (days < 30) return 'bg-amber-500'
    return 'bg-green-500'
  }

  const formatDate = (dateStr: string) =>
    new Date(dateStr + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

  return (
    <div className="p-4 flex flex-col gap-3 h-full font-mono text-xs">
      <div className="flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Earnings Countdown</span>
        {now && <span className="text-[9px] text-muted-foreground">{now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>}
      </div>

      <div className="flex-1 overflow-y-auto space-y-1.5 min-h-0">
        {entries.map(e => (
          <div key={e.symbol} className="flex items-center justify-between border border-border rounded-sm px-3 py-2">
            <div className="flex items-center gap-2">
              <div className={cn('w-1.5 h-1.5 rounded-full shrink-0', getDotColor(e.days))} />
              <div>
                <div className="font-bold">{e.symbol}</div>
                <div className="text-[9px] text-muted-foreground">{e.company}</div>
              </div>
            </div>
            <div className="text-right">
              <div className={cn('font-bold tabular-nums', getDayColor(e.days))}>
                {e.days < 0 ? 'Reported' : e.days === 0 ? 'Today' : `${e.days}d`}
              </div>
              <div className="text-[9px] text-muted-foreground">{formatDate(e.date)}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="shrink-0 flex items-center gap-3 text-[9px] text-muted-foreground">
        <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-destructive inline-block" />&lt;7d</span>
        <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block" />&lt;30d</span>
        <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />&gt;30d</span>
      </div>
    </div>
  )
}
