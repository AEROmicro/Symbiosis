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

  const ev = (name: string, impact: 'HIGH' | 'MED' | 'LOW', days: number, description: string): CalendarEvent =>
    ({ name, impact, date: addDays(days), description })

  return [
    ev('FOMC Meeting',           'HIGH', 3,  'Federal Open Market Committee rate decision'),
    ev('CPI Release',            'HIGH', 6,  'Consumer Price Index — inflation gauge'),
    ev('Non-Farm Payrolls',      'HIGH', 9,  'Monthly jobs report from BLS'),
    ev('GDP (Preliminary)',      'HIGH', 14, 'Advance estimate of quarterly GDP growth'),
    ev('PPI Release',            'MED',  7,  'Producer Price Index — wholesale inflation'),
    ev('Retail Sales',           'MED',  11, 'Monthly consumer spending report'),
    ev('ISM Manufacturing PMI',  'MED',  2,  'Purchasing Managers Index for manufacturing'),
    ev('Initial Jobless Claims', 'MED',  4,  'Weekly new unemployment benefit filings'),
    ev('Housing Starts',         'LOW',  13, 'New residential construction data'),
    ev('Industrial Production',  'LOW',  16, 'Output from factories, mines and utilities'),
    ev('Consumer Confidence',    'LOW',  18, 'Conference Board consumer sentiment index'),
    ev('Durable Goods Orders',   'MED',  20, 'Long-lasting manufactured goods orders'),
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
