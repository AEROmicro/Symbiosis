'use client'

import { useMemo } from 'react'
import { cn } from '@/lib/utils'

interface CalendarEvent {
  name: string
  impact: 'HIGH' | 'MED' | 'LOW'
  date: Date
  description: string
}

function buildEvents(): CalendarEvent[] {
  const now = new Date()
  const addDays = (d: number) => { const dt = new Date(now); dt.setDate(dt.getDate() + d); return dt }

  // Generate realistic upcoming events offset from today
  return [
    { name: 'FOMC Meeting',           impact: 'HIGH', date: addDays(3),  description: 'Federal Open Market Committee rate decision' },
    { name: 'CPI Release',            impact: 'HIGH', date: addDays(6),  description: 'Consumer Price Index — inflation gauge' },
    { name: 'Non-Farm Payrolls',      impact: 'HIGH', date: addDays(9),  description: 'Monthly jobs report from BLS' },
    { name: 'GDP (Preliminary)',      impact: 'HIGH', date: addDays(14), description: 'Advance estimate of quarterly GDP growth' },
    { name: 'PPI Release',            impact: 'MED',  date: addDays(7),  description: 'Producer Price Index — wholesale inflation' },
    { name: 'Retail Sales',           impact: 'MED',  date: addDays(11), description: 'Monthly consumer spending report' },
    { name: 'ISM Manufacturing PMI',  impact: 'MED',  date: addDays(2),  description: 'Purchasing Managers Index for manufacturing' },
    { name: 'Initial Jobless Claims', impact: 'MED',  date: addDays(4),  description: 'Weekly new unemployment benefit filings' },
    { name: 'Housing Starts',         impact: 'LOW',  date: addDays(13), description: 'New residential construction data' },
    { name: 'Industrial Production',  impact: 'LOW',  date: addDays(16), description: 'Output from factories, mines and utilities' },
    { name: 'Consumer Confidence',    impact: 'LOW',  date: addDays(18), description: 'Conference Board consumer sentiment index' },
    { name: 'Durable Goods Orders',   impact: 'MED',  date: addDays(20), description: 'Long-lasting manufactured goods orders' },
  ].sort((a, b) => a.date.getTime() - b.date.getTime())
}

const IMPACT_COLORS: Record<'HIGH' | 'MED' | 'LOW', string> = {
  HIGH: 'text-red-500 border-red-500/30 bg-red-500/5',
  MED:  'text-yellow-500 border-yellow-500/30 bg-yellow-500/5',
  LOW:  'text-primary border-primary/30 bg-primary/5',
}

export function EconomicCalendarWidget() {
  const events = useMemo(buildEvents, [])

  return (
    <div className="p-4 h-full overflow-y-auto space-y-2">
      {events.map((ev, i) => (
        <div
          key={i}
          className={cn('flex items-start justify-between p-2 rounded border text-xs', IMPACT_COLORS[ev.impact])}
        >
          <div className="flex-1 min-w-0 pr-2">
            <div className="font-semibold text-foreground truncate">{ev.name}</div>
            <div className="text-muted-foreground mt-0.5 text-[10px] leading-snug line-clamp-1">{ev.description}</div>
          </div>
          <div className="text-right shrink-0">
            <div className="font-bold">
              {ev.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </div>
            <div className={cn('font-semibold text-[10px]')}>
              {ev.impact}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
