'use client'

import { useEffect, useState, useCallback } from 'react'
import { Plus, X, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const STORAGE_KEY = 'symbiosis-world-clock-zones'

interface ZoneConfig {
  id: string
  timezone: string
  label: string
}

// Market sessions: [openHour, closeHour] in local time
const MARKET_SESSIONS: Record<string, { open: number; close: number; name: string }> = {
  'America/New_York':  { open: 9,  close: 16, name: 'NYSE' },
  'Europe/London':     { open: 8,  close: 16, name: 'LSE' },
  'Asia/Tokyo':        { open: 9,  close: 15, name: 'TSE' },
  'Asia/Hong_Kong':    { open: 9,  close: 16, name: 'HKEX' },
  'Asia/Shanghai':     { open: 9,  close: 15, name: 'SSE' },
  'Europe/Frankfurt':  { open: 9,  close: 17, name: 'XETRA' },
  'Asia/Singapore':    { open: 9,  close: 17, name: 'SGX' },
  'Australia/Sydney':  { open: 10, close: 16, name: 'ASX' },
}

const DEFAULT_ZONES: ZoneConfig[] = [
  { id: '1', timezone: 'America/New_York',  label: 'New York'  },
  { id: '2', timezone: 'Europe/London',     label: 'London'    },
  { id: '3', timezone: 'Asia/Tokyo',        label: 'Tokyo'     },
  { id: '4', timezone: 'Europe/Frankfurt',  label: 'Frankfurt' },
  { id: '5', timezone: 'Asia/Hong_Kong',    label: 'Hong Kong' },
  { id: '6', timezone: 'Australia/Sydney',  label: 'Sydney'    },
]

const AVAILABLE_ZONES = [
  { timezone: 'America/New_York',    label: 'New York'    },
  { timezone: 'America/Chicago',     label: 'Chicago'     },
  { timezone: 'America/Denver',      label: 'Denver'      },
  { timezone: 'America/Los_Angeles', label: 'Los Angeles' },
  { timezone: 'America/Toronto',     label: 'Toronto'     },
  { timezone: 'America/Sao_Paulo',   label: 'São Paulo'   },
  { timezone: 'Europe/London',       label: 'London'      },
  { timezone: 'Europe/Paris',        label: 'Paris'       },
  { timezone: 'Europe/Frankfurt',    label: 'Frankfurt'   },
  { timezone: 'Europe/Zurich',       label: 'Zurich'      },
  { timezone: 'Europe/Moscow',       label: 'Moscow'      },
  { timezone: 'Asia/Dubai',          label: 'Dubai'       },
  { timezone: 'Asia/Kolkata',        label: 'Mumbai'      },
  { timezone: 'Asia/Singapore',      label: 'Singapore'   },
  { timezone: 'Asia/Hong_Kong',      label: 'Hong Kong'   },
  { timezone: 'Asia/Shanghai',       label: 'Shanghai'    },
  { timezone: 'Asia/Tokyo',          label: 'Tokyo'       },
  { timezone: 'Asia/Seoul',          label: 'Seoul'       },
  { timezone: 'Australia/Sydney',    label: 'Sydney'      },
  { timezone: 'Pacific/Auckland',    label: 'Auckland'    },
]

function getZoneInfo(timezone: string, now: Date) {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
  const parts = formatter.formatToParts(now)
  const get = (type: string) => parts.find(p => p.type === type)?.value ?? ''
  const hour = parseInt(get('hour'))
  const weekday = get('weekday')
  const isWeekend = weekday === 'Sat' || weekday === 'Sun'
  const session = MARKET_SESSIONS[timezone]
  const marketOpen = !isWeekend && session ? hour >= session.open && hour < session.close : false

  return {
    time: `${get('hour')}:${get('minute')}:${get('second')}`,
    date: `${weekday} ${get('month')} ${get('day')}`,
    marketOpen,
    marketName: session?.name ?? null,
  }
}

export function WorldClockWidget() {
  const [zones, setZones] = useState<ZoneConfig[]>(DEFAULT_ZONES)
  const [now, setNow] = useState<Date | null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [selectedAdd, setSelectedAdd] = useState('')

  // Load saved zones
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length > 0) setZones(parsed)
      }
    } catch { /* ignore */ }
    setNow(new Date())
    const intervalId = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(intervalId)
  }, [])

  const saveZones = useCallback((newZones: ZoneConfig[]) => {
    setZones(newZones)
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(newZones)) } catch { /* ignore */ }
  }, [])

  function removeZone(id: string) {
    saveZones(zones.filter(z => z.id !== id))
  }

  function addZone() {
    if (!selectedAdd || zones.length >= 8) return
    const found = AVAILABLE_ZONES.find(z => z.timezone === selectedAdd)
    if (!found) return
    if (zones.some(z => z.timezone === selectedAdd)) return
    saveZones([...zones, { id: String(Date.now()), timezone: found.timezone, label: found.label }])
    setSelectedAdd('')
    setShowAdd(false)
  }

  if (!now) return null

  return (
    <div className="flex flex-col h-full p-3 gap-2">
      {/* Clock grid */}
      <div className="grid grid-cols-2 gap-2 flex-1">
        {zones.map(zone => {
          const { time, date, marketOpen, marketName } = getZoneInfo(zone.timezone, now)
          return (
            <div
              key={zone.id}
              className={cn(
                'relative border rounded-sm p-2.5 flex flex-col gap-0.5 group',
                marketOpen ? 'border-primary/40 bg-primary/5' : 'border-border bg-card/30',
              )}
            >
              <button
                onClick={() => removeZone(zone.id)}
                className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
              >
                <X className="w-2.5 h-2.5" />
              </button>
              <div className="flex items-center gap-1.5">
                <span
                  className={cn(
                    'w-1.5 h-1.5 rounded-full shrink-0',
                    marketOpen ? 'bg-primary animate-pulse' : 'bg-muted-foreground/40',
                  )}
                />
                <span className="text-[9px] font-mono text-muted-foreground uppercase tracking-wider truncate">
                  {zone.label}
                </span>
              </div>
              <div className={cn(
                'text-base font-mono font-bold tabular-nums leading-tight',
                marketOpen ? 'text-primary' : 'text-foreground',
              )}>
                {time}
              </div>
              <div className="text-[9px] font-mono text-muted-foreground">{date}</div>
              {marketName && (
                <div className={cn(
                  'text-[8px] font-mono uppercase tracking-wider',
                  marketOpen ? 'text-primary' : 'text-muted-foreground/50',
                )}>
                  {marketName} {marketOpen ? '● OPEN' : '○ CLOSED'}
                </div>
              )}
            </div>
          )
        })}

        {/* Add slot */}
        {zones.length < 8 && (
          <button
            onClick={() => setShowAdd(s => !s)}
            className="border border-dashed border-border rounded-sm p-2.5 flex flex-col items-center justify-center gap-1 text-muted-foreground hover:border-primary/40 hover:text-primary transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span className="text-[9px] font-mono uppercase tracking-wider">Add Zone</span>
          </button>
        )}
      </div>

      {/* Add zone dropdown */}
      {showAdd && (
        <div className="flex gap-2 shrink-0">
          <div className="relative flex-1">
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground pointer-events-none" />
            <select
              value={selectedAdd}
              onChange={e => setSelectedAdd(e.target.value)}
              className="w-full appearance-none bg-background/60 border border-border rounded-sm px-2.5 py-1.5 text-xs font-mono text-foreground focus:outline-none focus:border-primary/60 pr-7"
            >
              <option value="">Select timezone...</option>
              {AVAILABLE_ZONES.filter(z => !zones.some(zc => zc.timezone === z.timezone)).map(z => (
                <option key={z.timezone} value={z.timezone}>{z.label}</option>
              ))}
            </select>
          </div>
          <Button
            size="sm"
            className="h-7 px-3 text-xs font-mono rounded-sm"
            onClick={addZone}
            disabled={!selectedAdd}
          >
            Add
          </Button>
        </div>
      )}

      <div className="text-[9px] text-muted-foreground/50 font-mono text-center shrink-0">
        Hover clock to remove · Max 8 zones
      </div>
    </div>
  )
}
