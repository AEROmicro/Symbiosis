'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

const MARKET_ZONES = [
  { name: 'New York', tz: 'America/New_York', open: 9,  close: 16 },
  { name: 'London',   tz: 'Europe/London',    open: 8,  close: 16 },
  { name: 'Tokyo',    tz: 'Asia/Tokyo',        open: 9,  close: 15 },
]

function getZoneInfo(tz: string) {
  const now = new Date()
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: tz, hour: '2-digit', minute: '2-digit',
    second: '2-digit', hour12: false, weekday: 'short',
  }).formatToParts(now)
  const hour    = parseInt(parts.find(p => p.type === 'hour')?.value    ?? '0')
  const minute  = parseInt(parts.find(p => p.type === 'minute')?.value  ?? '0')
  const second  = parseInt(parts.find(p => p.type === 'second')?.value  ?? '0')
  const weekday = parts.find(p => p.type === 'weekday')?.value ?? 'Mon'
  return { hour, minute, second, weekday }
}

export function AnalogClockWidget() {
  const [time, setTime] = useState<Date | null>(null)

  useEffect(() => {
    setTime(new Date())
    const id = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  if (!time) return null

  const s = time.getSeconds()
  const m = time.getMinutes()
  const h = time.getHours() % 12

  const secDeg  = s * 6
  const minDeg  = m * 6 + s * 0.1
  const hourDeg = h * 30 + m * 0.5

  const cx = 60, cy = 60
  const pt = (deg: number, len: number) => {
    const rad = (deg - 90) * Math.PI / 180
    return { x: cx + len * Math.cos(rad), y: cy + len * Math.sin(rad) }
  }

  const secPt  = pt(secDeg,  48)
  const minPt  = pt(minDeg,  40)
  const hourPt = pt(hourDeg, 27)

  return (
    <div className="p-4 h-full flex flex-col gap-3 overflow-y-auto">
      {/* Analog face */}
      <div className="flex justify-center shrink-0">
        <svg width="120" height="120" viewBox="0 0 120 120" aria-label="Analog clock">
          {/* Outer ring */}
          <circle cx={cx} cy={cy} r="56" fill="none" stroke="var(--border)" strokeWidth="1.5" />
          <circle cx={cx} cy={cy} r="56" fill="none" stroke="var(--primary)" strokeWidth="0.5" opacity="0.25" />

          {/* Tick marks */}
          {[...Array(60)].map((_, i) => {
            const isHour = i % 5 === 0
            const p1 = pt(i * 6, isHour ? 43 : 49)
            const p2 = pt(i * 6, 53)
            return (
              <line
                key={i}
                x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
                stroke={isHour ? 'var(--primary)' : 'var(--border)'}
                strokeWidth={isHour ? '2' : '0.8'}
              />
            )
          })}

          {/* Hour numbers */}
          {([12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] as const).map((n, i) => {
            const p = pt(i * 30, 36)
            return (
              <text
                key={n}
                x={p.x} y={p.y}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="7"
                fill="var(--muted-foreground)"
                fontFamily="monospace"
              >
                {n}
              </text>
            )
          })}

          {/* Hour hand */}
          <line x1={cx} y1={cy} x2={hourPt.x} y2={hourPt.y}
            stroke="var(--foreground)" strokeWidth="3.5" strokeLinecap="round" />

          {/* Minute hand */}
          <line x1={cx} y1={cy} x2={minPt.x} y2={minPt.y}
            stroke="var(--foreground)" strokeWidth="2" strokeLinecap="round" />

          {/* Second hand */}
          <line x1={cx} y1={cy} x2={secPt.x} y2={secPt.y}
            stroke="var(--primary)" strokeWidth="1" strokeLinecap="round" />

          {/* Center cap */}
          <circle cx={cx} cy={cy} r="4" fill="var(--primary)" />
          <circle cx={cx} cy={cy} r="2" fill="var(--background)" />
        </svg>
      </div>

      {/* Digital readout */}
      <div className="text-center shrink-0">
        <div className="text-2xl font-mono font-bold text-primary tracking-widest tabular-nums">
          {time.toLocaleTimeString('en-US', { hour12: false })}
        </div>
        <div className="text-xs text-muted-foreground mt-0.5 font-mono">
          {time.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
        </div>
      </div>

      {/* Market timezone rows */}
      <div className="space-y-1.5 shrink-0">
        {MARKET_ZONES.map((z) => {
          const { hour, minute, second, weekday } = getZoneInfo(z.tz)
          const isWeekend = weekday === 'Sat' || weekday === 'Sun'
          const isOpen    = !isWeekend && hour >= z.open && hour < z.close
          const timeStr   = `${String(hour).padStart(2,'0')}:${String(minute).padStart(2,'0')}:${String(second).padStart(2,'0')}`
          return (
            <div
              key={z.name}
              className="flex items-center justify-between text-xs font-mono border border-border rounded px-2.5 py-1.5"
            >
              <div className="flex items-center gap-2">
                <span className={cn(
                  'w-1.5 h-1.5 rounded-full shrink-0',
                  isOpen ? 'bg-primary animate-pulse' : 'bg-muted-foreground',
                )} />
                <span className="text-muted-foreground">{z.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="tabular-nums text-foreground">{timeStr}</span>
                <span className={cn('text-[9px] font-semibold uppercase', isOpen ? 'text-primary' : 'text-muted-foreground')}>
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
