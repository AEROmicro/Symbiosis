'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

interface Market {
  name: string
  region: string
  timezone: string
  openHour: number
  openMinute: number
  closeHour: number
  closeMinute: number
  isOpen: boolean
}

function checkOpen(openH: number, openM: number, closeH: number, closeM: number, tz: string): boolean {
  const now = new Date()
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    hour: 'numeric',
    minute: 'numeric',
    hour12: false,
    weekday: 'short',
  }).formatToParts(now)

  const hour    = parseInt(parts.find(p => p.type === 'hour')?.value    ?? '0')
  const minute  = parseInt(parts.find(p => p.type === 'minute')?.value  ?? '0')
  const weekday = parts.find(p => p.type === 'weekday')?.value ?? 'Mon'

  if (weekday === 'Sat' || weekday === 'Sun') return false

  const cur   = hour * 60 + minute
  const open  = openH * 60 + openM
  const close = closeH * 60 + closeM
  return cur >= open && cur < close
}

const MARKET_DEFS = [
  { name: 'NYSE / NASDAQ', region: 'New York',  timezone: 'America/New_York', openHour: 9,  openMinute: 30, closeHour: 16, closeMinute: 0  },
  { name: 'London (LSE)',  region: 'London',    timezone: 'Europe/London',    openHour: 8,  openMinute: 0,  closeHour: 16, closeMinute: 30 },
  { name: 'Tokyo (TSE)',   region: 'Tokyo',     timezone: 'Asia/Tokyo',       openHour: 9,  openMinute: 0,  closeHour: 15, closeMinute: 30 },
  { name: 'Frankfurt',     region: 'Frankfurt', timezone: 'Europe/Berlin',    openHour: 9,  openMinute: 0,  closeHour: 17, closeMinute: 30 },
  { name: 'Sydney (ASX)',  region: 'Sydney',    timezone: 'Australia/Sydney', openHour: 10, openMinute: 0,  closeHour: 16, closeMinute: 0  },
]

export function MarketHoursWidget() {
  const [markets, setMarkets] = useState<Market[]>([])

  useEffect(() => {
    const update = () =>
      setMarkets(
        MARKET_DEFS.map(m => ({
          ...m,
          isOpen: checkOpen(m.openHour, m.openMinute, m.closeHour, m.closeMinute, m.timezone),
        })),
      )
    update()
    const id = setInterval(update, 60_000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="p-4 space-y-2 h-full overflow-y-auto">
      {markets.map(m => (
        <div
          key={m.name}
          className={cn(
            'flex items-center justify-between px-3 py-2 rounded border text-xs',
            m.isOpen ? 'border-primary/30 bg-primary/5' : 'border-border bg-card',
          )}
        >
          <div className="flex items-center gap-2">
            <span className={cn('w-2 h-2 rounded-full shrink-0', m.isOpen ? 'bg-primary animate-pulse' : 'bg-muted-foreground')} />
            <div>
              <div className="font-semibold text-foreground">{m.name}</div>
              <div className="text-muted-foreground">{m.region}</div>
            </div>
          </div>
          <div className="text-right">
            <div className={cn('font-semibold', m.isOpen ? 'text-primary' : 'text-muted-foreground')}>
              {m.isOpen ? 'OPEN' : 'CLOSED'}
            </div>
            <div className="text-muted-foreground">
              {String(m.openHour).padStart(2,'0')}:{String(m.openMinute).padStart(2,'0')}–{String(m.closeHour).padStart(2,'0')}:{String(m.closeMinute).padStart(2,'0')}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
