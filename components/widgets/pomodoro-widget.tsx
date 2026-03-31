'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import { Play, Pause, RotateCcw, SkipForward, Coffee, Brain, Timer } from 'lucide-react'
import { cn } from '@/lib/utils'

type Phase = 'work' | 'short' | 'long'

const PHASES: Record<Phase, { label: string; duration: number; color: string; icon: React.ReactNode }> = {
  work:  { label: 'Focus',       duration: 25 * 60, color: 'text-price-down',   icon: <Brain className="w-3.5 h-3.5" /> },
  short: { label: 'Short Break', duration:  5 * 60, color: 'text-price-up',     icon: <Coffee className="w-3.5 h-3.5" /> },
  long:  { label: 'Long Break',  duration: 15 * 60, color: 'text-primary',      icon: <Timer className="w-3.5 h-3.5" /> },
}

function pad(n: number) { return n.toString().padStart(2, '0') }

function fmt(seconds: number) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${pad(m)}:${pad(s)}`
}

// Circular progress: full circle circumference at r=42 ≈ 263.9
const RADIUS = 42
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

export function PomodoroWidget() {
  const [phase, setPhase] = useState<Phase>('work')
  const [remaining, setRemaining] = useState(PHASES.work.duration)
  const [running, setRunning] = useState(false)
  const [sessions, setSessions] = useState(0) // completed work sessions
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const total = PHASES[phase].duration

  const tick = useCallback(() => {
    setRemaining(prev => {
      if (prev <= 1) {
        setRunning(false)
        if (intervalRef.current) clearInterval(intervalRef.current)
        // auto-advance: work → short (every 4th session → long)
        setPhase(p => {
          if (p === 'work') {
            const nextSessions = sessions + 1
            setSessions(nextSessions)
            return nextSessions % 4 === 0 ? 'long' : 'short'
          }
          return 'work'
        })
        return 0
      }
      return prev - 1
    })
  }, [sessions])

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(tick, 1000)
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [running, tick])

  // Reset remaining when phase changes (but not when timer is already at 0 from auto-advance)
  const prevPhaseRef = useRef<Phase>(phase)
  useEffect(() => {
    if (prevPhaseRef.current !== phase) {
      setRemaining(PHASES[phase].duration)
      prevPhaseRef.current = phase
    }
  }, [phase])

  const reset = () => {
    setRunning(false)
    setRemaining(PHASES[phase].duration)
  }

  const skip = () => {
    setRunning(false)
    setPhase(p => {
      if (p === 'work') return (sessions + 1) % 4 === 0 ? 'long' : 'short'
      return 'work'
    })
  }

  const pct = remaining / total
  const strokeDashoffset = CIRCUMFERENCE * pct
  const { color, label, icon } = PHASES[phase]

  return (
    <div className="flex flex-col h-full font-mono text-xs p-3 gap-3">
      {/* Phase selector */}
      <div className="flex items-center gap-1 shrink-0">
        {(Object.keys(PHASES) as Phase[]).map(p => (
          <button
            key={p}
            onClick={() => { setRunning(false); setPhase(p) }}
            className={cn(
              'flex-1 py-0.5 rounded border text-[10px] transition-colors capitalize',
              phase === p
                ? 'bg-primary/20 border-primary/40 text-primary'
                : 'border-border text-muted-foreground hover:text-foreground'
            )}
          >
            {p === 'work' ? 'Focus' : p === 'short' ? 'Short' : 'Long'}
          </button>
        ))}
      </div>

      {/* Timer ring */}
      <div className="flex-1 flex flex-col items-center justify-center gap-3">
        <div className="relative">
          <svg width="110" height="110" viewBox="0 0 100 100" className="-rotate-90">
            {/* Track */}
            <circle cx="50" cy="50" r={RADIUS} fill="none" stroke="currentColor" strokeWidth="6"
              className="text-muted/30" />
            {/* Progress */}
            <circle
              cx="50" cy="50" r={RADIUS}
              fill="none"
              stroke="currentColor"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={CIRCUMFERENCE - strokeDashoffset}
              className={cn('transition-all duration-1000', color)}
            />
          </svg>
          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={cn('text-2xl font-bold tabular-nums leading-none', color)}>
              {fmt(remaining)}
            </span>
            <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground mt-1">
              {icon}
              {label}
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={reset}
            className="p-1.5 border border-border rounded hover:border-primary hover:text-primary transition-colors text-muted-foreground"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setRunning(r => !r)}
            className={cn(
              'px-4 py-1.5 rounded border font-semibold text-[11px] transition-colors flex items-center gap-1.5',
              running
                ? 'border-yellow-500/40 bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20'
                : 'border-price-up/40 bg-price-up/10 text-price-up hover:bg-price-up/20'
            )}
          >
            {running ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            {running ? 'Pause' : 'Start'}
          </button>
          <button
            onClick={skip}
            className="p-1.5 border border-border rounded hover:border-primary hover:text-primary transition-colors text-muted-foreground"
          >
            <SkipForward className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Session counter */}
      <div className="flex items-center justify-between shrink-0 text-[10px] text-muted-foreground border-t border-border pt-2">
        <span>Sessions today</span>
        <div className="flex items-center gap-1">
          {Array.from({ length: Math.max(sessions, 4) }, (_, i) => (
            <span
              key={i}
              className={cn(
                'w-3 h-3 rounded-full border',
                i < sessions
                  ? 'bg-primary border-primary'
                  : 'bg-muted/20 border-border'
              )}
            />
          ))}
          <span className="ml-1 text-primary font-semibold">{sessions}</span>
        </div>
      </div>
    </div>
  )
}
