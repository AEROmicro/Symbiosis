'use client'

import { useState, useEffect, useMemo } from 'react'
import { cn } from '@/lib/utils'
import { EXCHANGES, getMarketState } from '@/lib/exchanges'

// Exchanges to display — covers all major global regions
const SESSION_EXCHANGES = [
  'NYSE',    // New York (US) — includes PRE / POST
  'TSX',     // Toronto (CA) — includes PRE / POST
  'LSE',     // London (UK)
  'XETRA',   // Frankfurt (DE)
  'TSE',     // Tokyo (JP)
  'HKEX',    // Hong Kong (HK)
  'BSE',     // Mumbai (IN)
  'ASX',     // Sydney (AU)
]

type SessionState = 'PRE' | 'REGULAR' | 'POST' | 'CLOSED'

interface ExchangeRow {
  id: string
  name: string
  flag: string
  region: string
  state: SessionState
}

function stateLabel(s: SessionState) {
  switch (s) {
    case 'PRE':     return 'Pre-Market'
    case 'REGULAR': return 'Open'
    case 'POST':    return 'After Hours'
    default:        return 'Closed'
  }
}

function stateDot(s: SessionState) {
  switch (s) {
    case 'PRE':     return 'bg-yellow-400 animate-pulse'
    case 'REGULAR': return 'bg-emerald-400 animate-pulse'
    case 'POST':    return 'bg-orange-400 animate-pulse'
    default:        return 'bg-muted-foreground/40'
  }
}

function stateBadge(s: SessionState) {
  switch (s) {
    case 'PRE':     return 'text-yellow-400  border-yellow-400/30  bg-yellow-400/10'
    case 'REGULAR': return 'text-emerald-400 border-emerald-400/30 bg-emerald-400/10'
    case 'POST':    return 'text-orange-400  border-orange-400/30  bg-orange-400/10'
    default:        return 'text-muted-foreground border-border bg-muted/20'
  }
}

function localTime(timezone: string): string {
  try {
    return new Intl.DateTimeFormat('en-GB', {
      timeZone: timezone,
      hour:     '2-digit',
      minute:   '2-digit',
      hour12:   false,
    }).format(new Date())
  } catch {
    return '--:--'
  }
}

export function MarketSessionWidget() {
  // Re-render every 30 s so local times and states stay fresh
  const [, setTick] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 30_000)
    return () => clearInterval(id)
  }, [])

  const rows: ExchangeRow[] = useMemo(() => {
    return SESSION_EXCHANGES.map(id => {
      const ex = EXCHANGES.find(e => e.id === id)
      if (!ex) return null
      return {
        id:     ex.id,
        name:   ex.name,
        flag:   ex.flag,
        region: ex.region,
        state:  getMarketState(ex),
      }
    }).filter(Boolean) as ExchangeRow[]
    // Empty dep array is intentional: the `setTick` state update above triggers
    // a full re-render every 30 s, which causes this memo to re-run because
    // getMarketState() calls `new Date()` internally (no captured deps to cache).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const openCount = rows.filter(r => r.state === 'REGULAR').length

  return (
    <div className="flex flex-col h-full p-3 gap-3 overflow-auto">
      {/* Summary bar */}
      <div className="flex items-center justify-between shrink-0">
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-mono">
          Global Sessions
        </span>
        <span className={cn(
          'text-[10px] font-bold font-mono px-2 py-0.5 rounded border',
          openCount > 0
            ? 'text-emerald-400 border-emerald-400/30 bg-emerald-400/10'
            : 'text-muted-foreground border-border bg-muted/20'
        )}>
          {openCount} / {rows.length} open
        </span>
      </div>

      {/* Exchange rows */}
      <div className="flex flex-col gap-1.5">
        {rows.map(row => (
          <div
            key={row.id}
            className="flex items-center gap-2.5 px-2.5 py-2 rounded-md border border-border/60 bg-card/40"
          >
            {/* Status dot */}
            <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', stateDot(row.state))} />

            {/* Flag + name */}
            <span className="text-base leading-none shrink-0">{row.flag}</span>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-medium text-foreground truncate leading-tight">{row.name}</p>
              <p className="text-[9px] text-muted-foreground font-mono truncate">{row.region}</p>
            </div>

            {/* Local time */}
            <span className="text-[10px] font-mono text-muted-foreground tabular-nums shrink-0">
              {localTime(EXCHANGES.find(e => e.id === row.id)?.timezone ?? 'UTC')}
            </span>

            {/* Session badge */}
            <span className={cn(
              'text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border shrink-0 font-mono',
              stateBadge(row.state),
            )}>
              {stateLabel(row.state)}
            </span>
          </div>
        ))}
      </div>

      <p className="text-[9px] text-muted-foreground/40 font-mono text-center mt-auto shrink-0">
        Updates every 30 s · local clock calculation
      </p>
    </div>
  )
}
