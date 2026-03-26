'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

interface TerminalHeaderProps {
  marketState?: string
}

function getMarketStateDisplay(state: string): { label: string; color: string; pulse: boolean } {
  switch (state) {
    case 'REGULAR':
      return { label: 'OPEN', color: 'text-primary', pulse: true }
    case 'PRE':
      return { label: 'PRE-MARKET', color: 'text-yellow-500', pulse: true }
    case 'POST':
      return { label: 'AFTER-HOURS', color: 'text-orange-500', pulse: true }
    case 'CLOSED':
    default:
      return { label: 'CLOSED', color: 'text-muted-foreground', pulse: false }
  }
}

export function TerminalHeader({ marketState = 'CLOSED' }: TerminalHeaderProps) {
  const [time, setTime] = useState<string>('')
  const [etTime, setEtTime] = useState<string>('')
  const [date, setDate] = useState<string>('')

  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      setTime(now.toLocaleTimeString('en-US', { hour12: false }))
      setDate(now.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
      }))
      // Show ET time for market reference
      setEtTime(now.toLocaleTimeString('en-US', { 
        hour12: false, 
        timeZone: 'America/New_York',
        hour: '2-digit',
        minute: '2-digit'
      }) + ' ET')
    }
    updateTime()
    const interval = setInterval(updateTime, 1000)
    return () => clearInterval(interval)
  }, [])

  const stateDisplay = getMarketStateDisplay(marketState)

  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-primary font-bold text-xl tracking-tight">
            <span className="text-primary/80">{'>'}</span>
            <span className="text-primary">_</span>
            <span className="ml-2">Symbiosis</span>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground font-mono">
            <span className="px-2 py-0.5 bg-primary/10 border border-primary/30 rounded text-primary">
              v4 Petrichor
            </span>
          </div>
        </div>

        {/* Status Indicators */}
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 text-xs">
            <span className="flex items-center gap-1.5">
              <span className={cn(
                "w-2 h-2 rounded-full",
                stateDisplay.pulse ? "animate-pulse" : "",
                stateDisplay.color === 'text-primary' ? "bg-primary" : 
                stateDisplay.color === 'text-yellow-500' ? "bg-yellow-500" :
                stateDisplay.color === 'text-orange-500' ? "bg-orange-500" : "bg-muted-foreground"
              )} />
              <span className={cn(stateDisplay.color)}>
                {marketState === 'REGULAR' ? 'LIVE' : stateDisplay.label}
              </span>
            </span>
            <span className="text-muted-foreground">|</span>
            <span className="text-muted-foreground">NYSE: {stateDisplay.label}</span>
            <span className="text-muted-foreground/60 text-[10px]">({etTime})</span>
          </div>
          
          {/* Time Display */}
          <div className="text-right font-mono">
            <div className="text-sm text-primary tabular-nums">{time}</div>
            <div className="text-xs text-muted-foreground">{date}</div>
          </div>
        </div>
      </div>

      {/* Scanline effect */}
      <div className="h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
    </header>
  )
}
