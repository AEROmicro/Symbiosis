'use client'

import { useEffect, useState } from 'react'
import { Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MarketTime {
  name: string
  timezone: string
  openHour: number
  closeHour: number
}

const MARKET_TIMES: MarketTime[] = [
  { name: 'New York', timezone: 'America/New_York', openHour: 9, closeHour: 16 },
  { name: 'London',   timezone: 'Europe/London',    openHour: 8, closeHour: 16 },
  { name: 'Tokyo',    timezone: 'Asia/Tokyo',        openHour: 9, closeHour: 15 },
]

function getTimeInZone(timezone: string): { time: string; hour: number; weekday: string } {
  const now = new Date()
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    weekday: 'short',
  }).formatToParts(now)

  const hour   = parseInt(parts.find(p => p.type === 'hour')?.value   ?? '0')
  const minute = parts.find(p => p.type === 'minute')?.value  ?? '00'
  const second = parts.find(p => p.type === 'second')?.value  ?? '00'
  const weekday = parts.find(p => p.type === 'weekday')?.value ?? 'Mon'

  return { time: `${String(hour).padStart(2, '0')}:${minute}:${second}`, hour, weekday }
}

export function ClockWidget() {
  const [now, setNow] = useState<Date | null>(null)

  useEffect(() => {
    setNow(new Date())
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  if (!now) return null

  const localTime = now.toLocaleTimeString('en-US', { hour12: false })
  const localDate = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

  return (
    <div className="p-4 space-y-4 h-full">
      {/* Local clock */}
      <div className="text-center">
        <div className="text-3xl font-mono font-bold text-primary tracking-widest tabular-nums">
          {localTime}
        </div>
        <div className="text-xs text-muted-foreground mt-1">{localDate}</div>
      </div>

      {/* Market timezones */}
      <div className="space-y-2">
        {MARKET_TIMES.map((market) => {
          const { time, hour, weekday } = getTimeInZone(market.timezone)
          const isWeekend = weekday === 'Sat' || weekday === 'Sun'
          const isOpen = !isWeekend && hour >= market.openHour && hour < market.closeHour
          return (
            <div
              key={market.name}
              className="flex items-center justify-between text-xs font-mono border border-border rounded px-3 py-2"
            >
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    'w-1.5 h-1.5 rounded-full',
                    isOpen ? 'bg-primary animate-pulse' : 'bg-muted-foreground',
                  )}
                />
                <span className="text-muted-foreground">{market.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="tabular-nums text-foreground">{time}</span>
                <span
                  className={cn(
                    'text-[10px] font-semibold',
                    isOpen ? 'text-primary' : 'text-muted-foreground',
                  )}
                >
                  {isOpen ? 'OPEN' : 'CLOSED'}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
