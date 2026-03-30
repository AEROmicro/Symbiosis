'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Play, Pause, RotateCcw, Plus, Trash2, Bell } from 'lucide-react'
import { cn } from '@/lib/utils'

type TimerMode = 'stopwatch' | 'countdown'

interface Lap {
  id: number
  label: string
  elapsed: number
  delta: number
}

interface Alarm {
  id: number
  label: string
  targetMs: number
  triggered: boolean
}

function formatMs(ms: number): string {
  const totalSec = Math.floor(Math.abs(ms) / 1000)
  const h = Math.floor(totalSec / 3600)
  const m = Math.floor((totalSec % 3600) / 60)
  const s = totalSec % 60
  const cs = Math.floor((Math.abs(ms) % 1000) / 10)
  if (h > 0) return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.${String(cs).padStart(2, '0')}`
}

export function TimerWidget() {
  const [mode, setMode] = useState<TimerMode>('stopwatch')
  const [running, setRunning] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [countdownTarget, setCountdownTarget] = useState(60_000)  // 1 min default
  const [countdownInput, setCountdownInput] = useState('01:00')
  const [laps, setLaps] = useState<Lap[]>([])
  const [alarms, setAlarms] = useState<Alarm[]>([])
  const [alarmInput, setAlarmInput] = useState('')
  const [alarmLabel, setAlarmLabel] = useState('')
  const [showAlarms, setShowAlarms] = useState(false)
  const startRef = useRef<number | null>(null)
  const baseRef = useRef(0)
  const rafRef = useRef<number>(0)
  const lapCounter = useRef(1)

  const tick = useCallback(() => {
    if (startRef.current == null) return
    const now = Date.now()
    const delta = now - startRef.current
    setElapsed(baseRef.current + delta)
    rafRef.current = requestAnimationFrame(tick)
  }, [])

  const start = useCallback(() => {
    startRef.current = Date.now()
    setRunning(true)
    rafRef.current = requestAnimationFrame(tick)
  }, [tick])

  const pause = useCallback(() => {
    if (startRef.current != null) {
      baseRef.current += Date.now() - startRef.current
      startRef.current = null
    }
    cancelAnimationFrame(rafRef.current)
    setRunning(false)
  }, [])

  const reset = useCallback(() => {
    pause()
    baseRef.current = 0
    setElapsed(0)
    setLaps([])
    lapCounter.current = 1
  }, [pause])

  const lap = useCallback(() => {
    setLaps(prev => {
      const lastElapsed = prev[0]?.elapsed ?? 0
      return [{
        id: lapCounter.current++,
        label: `Lap ${lapCounter.current - 1}`,
        elapsed,
        delta: elapsed - lastElapsed,
      }, ...prev]
    })
  }, [elapsed])

  // Countdown auto-stop
  useEffect(() => {
    if (mode === 'countdown' && running && elapsed >= countdownTarget) {
      pause()
      setElapsed(countdownTarget)
    }
  }, [elapsed, mode, running, countdownTarget, pause])

  // Check alarms
  useEffect(() => {
    if (!running) return
    setAlarms(prev => prev.map(a => {
      if (!a.triggered && elapsed >= a.targetMs) {
        return { ...a, triggered: true }
      }
      return a
    }))
  }, [elapsed, running])

  const parseCountdown = (val: string): number => {
    const parts = val.split(':').map(Number)
    if (parts.length === 2) return ((parts[0] * 60) + parts[1]) * 1000
    if (parts.length === 3) return ((parts[0] * 3600) + (parts[1] * 60) + parts[2]) * 1000
    return 0
  }

  const applyCountdown = () => {
    const ms = parseCountdown(countdownInput)
    if (ms > 0) { setCountdownTarget(ms); reset() }
  }

  const addAlarm = () => {
    const ms = parseCountdown(alarmInput)
    if (ms > 0) {
      setAlarms(prev => [...prev, {
        id: Date.now(),
        label: alarmLabel || `Alarm at ${alarmInput}`,
        targetMs: ms,
        triggered: false,
      }])
      setAlarmInput('')
      setAlarmLabel('')
    }
  }

  const remaining = mode === 'countdown' ? Math.max(0, countdownTarget - elapsed) : elapsed
  const progress = mode === 'countdown' ? (elapsed / countdownTarget) : 0
  const isOvertime = mode === 'countdown' && elapsed >= countdownTarget

  return (
    <div className="flex flex-col h-full font-mono text-xs">
      {/* Mode tabs */}
      <div className="flex border-b border-border shrink-0">
        {(['stopwatch', 'countdown'] as TimerMode[]).map(m => (
          <button
            key={m}
            onClick={() => { reset(); setMode(m) }}
            className={cn(
              'flex-1 py-1.5 text-[10px] uppercase tracking-wider transition-colors',
              mode === m ? 'text-primary border-b-2 border-primary -mb-px' : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {m}
          </button>
        ))}
        <button
          onClick={() => setShowAlarms(p => !p)}
          className={cn(
            'px-3 py-1.5 transition-colors',
            showAlarms ? 'text-primary' : 'text-muted-foreground hover:text-foreground',
          )}
          title="Alarms"
        >
          <Bell className="w-3 h-3" />
        </button>
      </div>

      {showAlarms ? (
        /* ── Alarms panel ─────────────────────── */
        <div className="flex flex-col flex-1 overflow-hidden p-3 gap-2">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Alarms</p>
          <div className="flex gap-1.5">
            <input
              value={alarmLabel}
              onChange={e => setAlarmLabel(e.target.value)}
              placeholder="Label"
              className="flex-1 px-2 py-1 bg-muted/30 border border-border rounded text-xs font-mono focus:outline-none focus:ring-1 focus:ring-primary/50"
            />
            <input
              value={alarmInput}
              onChange={e => setAlarmInput(e.target.value)}
              placeholder="mm:ss"
              className="w-16 px-2 py-1 bg-muted/30 border border-border rounded text-xs font-mono focus:outline-none focus:ring-1 focus:ring-primary/50"
            />
            <button
              onClick={addAlarm}
              className="px-2 py-1 bg-primary/20 border border-primary/30 rounded text-primary hover:bg-primary/30 transition-colors"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto space-y-1">
            {alarms.length === 0 ? (
              <div className="text-muted-foreground text-center py-4">No alarms set</div>
            ) : alarms.map(a => (
              <div key={a.id} className={cn(
                'flex items-center justify-between px-2.5 py-2 rounded border',
                a.triggered ? 'border-primary/50 bg-primary/10 text-primary' : 'border-border bg-muted/10',
              )}>
                <div>
                  <div className="font-semibold">{a.label}</div>
                  <div className="text-muted-foreground text-[9px]">@ {formatMs(a.targetMs)}</div>
                </div>
                <div className="flex items-center gap-2">
                  {a.triggered && <span className="text-[9px] text-primary animate-pulse">TRIGGERED</span>}
                  <button onClick={() => setAlarms(prev => prev.filter(x => x.id !== a.id))}>
                    <Trash2 className="w-3 h-3 text-muted-foreground hover:text-destructive transition-colors" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* ── Main timer display ────────────────── */
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Big display */}
          <div className="flex flex-col items-center justify-center py-4 shrink-0">
            {mode === 'countdown' && (
              <div className="w-full px-4 mb-2">
                <div className="h-1 bg-muted/40 rounded-full overflow-hidden">
                  <div
                    className={cn('h-full rounded-full transition-all', isOvertime ? 'bg-destructive' : 'bg-primary')}
                    style={{ width: `${Math.min(100, progress * 100)}%` }}
                  />
                </div>
              </div>
            )}
            <div className={cn(
              'text-3xl font-bold tracking-widest tabular-nums',
              isOvertime ? 'text-destructive animate-pulse' : 'text-primary',
            )}>
              {formatMs(remaining)}
            </div>
            {mode === 'countdown' && (
              <div className="text-[9px] text-muted-foreground mt-1">
                {isOvertime ? 'TIME UP' : `of ${formatMs(countdownTarget)}`}
              </div>
            )}
          </div>

          {/* Countdown input */}
          {mode === 'countdown' && !running && (
            <div className="flex gap-1.5 px-3 pb-2 shrink-0">
              <input
                value={countdownInput}
                onChange={e => setCountdownInput(e.target.value)}
                placeholder="mm:ss or hh:mm:ss"
                className="flex-1 px-2 py-1 bg-muted/30 border border-border rounded text-xs font-mono focus:outline-none focus:ring-1 focus:ring-primary/50"
              />
              <button
                onClick={applyCountdown}
                className="px-2 py-1 bg-muted/40 border border-border rounded text-xs hover:bg-muted/60 transition-colors"
              >
                Set
              </button>
            </div>
          )}

          {/* Controls */}
          <div className="flex gap-2 px-3 pb-3 shrink-0">
            <button
              onClick={running ? pause : start}
              className={cn(
                'flex-1 flex items-center justify-center gap-1.5 py-2 rounded border font-semibold transition-colors text-xs',
                running
                  ? 'bg-primary/20 border-primary/40 text-primary hover:bg-primary/30'
                  : 'bg-primary/10 border-primary/30 text-primary hover:bg-primary/20',
              )}
            >
              {running ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
              {running ? 'Pause' : 'Start'}
            </button>
            {mode === 'stopwatch' && running && (
              <button
                onClick={lap}
                className="px-3 py-2 rounded border border-border text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors"
              >
                Lap
              </button>
            )}
            <button
              onClick={reset}
              className="px-3 py-2 rounded border border-border text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>

          {/* Lap list */}
          {laps.length > 0 && (
            <div className="flex-1 overflow-y-auto border-t border-border">
              <div className="flex items-center justify-between px-3 py-1.5 text-[9px] text-muted-foreground uppercase tracking-wider border-b border-border/50">
                <span>Lap</span>
                <span>Elapsed</span>
                <span>Split</span>
              </div>
              {laps.map((lap, i) => (
                <div
                  key={lap.id}
                  className={cn(
                    'flex items-center justify-between px-3 py-1 text-[10px]',
                    i === 0 ? 'text-primary' : 'text-foreground',
                  )}
                >
                  <span className="text-muted-foreground w-12">{lap.label}</span>
                  <span className="tabular-nums">{formatMs(lap.elapsed)}</span>
                  <span className={cn('tabular-nums', i === 0 ? 'text-primary' : 'text-muted-foreground')}>
                    +{formatMs(lap.delta)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
