'use client'

import { useEffect, useState } from 'react'

interface TerminalHeaderProps {}

export function TerminalHeader({}: TerminalHeaderProps) {
  const [time, setTime] = useState<string>('')
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
    }
    updateTime()
    const interval = setInterval(updateTime, 1000)
    return () => clearInterval(interval)
  }, [])

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
              v5.2 Magnetar Basalt
            </span>
          </div>
        </div>

        {/* Status Indicators */}
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 text-xs">
            <span className="text-muted-foreground">REDEFINE THE LIMITS</span>
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

