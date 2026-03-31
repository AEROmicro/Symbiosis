'use client'
import { useState, useEffect, useCallback } from 'react'
import { Plus, Trash2, CheckCircle2, Circle, Flame, BarChart3 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Habit {
  id: string
  name: string
  color: string
  completions: string[] // ISO date strings 'YYYY-MM-DD'
}

const STORAGE_KEY = 'symbiosis-habits'

const COLORS = [
  'bg-primary/70',
  'bg-price-up/70',
  'bg-blue-500/70',
  'bg-yellow-500/70',
  'bg-purple-500/70',
  'bg-pink-500/70',
  'bg-orange-500/70',
  'bg-cyan-500/70',
]

function today(): string {
  return new Date().toISOString().split('T')[0]
}

function dateOf(daysAgo: number): string {
  const d = new Date()
  d.setDate(d.getDate() - daysAgo)
  return d.toISOString().split('T')[0]
}

function streak(completions: string[]): number {
  const set = new Set(completions)
  let s = 0
  let d = new Date()
  // If not done today yet, start counting from yesterday
  if (!set.has(today())) {
    d.setDate(d.getDate() - 1)
  }
  while (true) {
    const iso = d.toISOString().split('T')[0]
    if (!set.has(iso)) break
    s++
    d.setDate(d.getDate() - 1)
  }
  return s
}

function load(): Habit[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : defaultHabits()
  } catch { return defaultHabits() }
}

function defaultHabits(): Habit[] {
  return [
    { id: '1', name: 'Read market news',     color: COLORS[0], completions: [] },
    { id: '2', name: 'Exercise 30 min',      color: COLORS[1], completions: [] },
    { id: '3', name: 'Review portfolio',     color: COLORS[2], completions: [] },
    { id: '4', name: 'Meditate 10 min',      color: COLORS[3], completions: [] },
  ]
}

export function HabitTrackerWidget() {
  const [habits, setHabits] = useState<Habit[]>([])
  const [newName, setNewName] = useState('')
  const [adding, setAdding] = useState(false)
  const [colorIdx, setColorIdx] = useState(0)
  const [mounted, setMounted] = useState(false)

  // Load from localStorage on mount
  useEffect(() => {
    setHabits(load())
    setMounted(true)
  }, [])

  // Persist on change
  useEffect(() => {
    if (mounted) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(habits))
    }
  }, [habits, mounted])

  const toggle = useCallback((id: string, date: string) => {
    setHabits(prev => prev.map(h => {
      if (h.id !== id) return h
      const has = h.completions.includes(date)
      return {
        ...h,
        completions: has
          ? h.completions.filter(d => d !== date)
          : [...h.completions, date],
      }
    }))
  }, [])

  const addHabit = useCallback(() => {
    const name = newName.trim()
    if (!name) return
    setHabits(prev => [...prev, {
      id: Date.now().toString(),
      name,
      color: COLORS[colorIdx % COLORS.length],
      completions: [],
    }])
    setNewName('')
    setAdding(false)
    setColorIdx(i => i + 1)
  }, [newName, colorIdx])

  const remove = useCallback((id: string) => {
    setHabits(prev => prev.filter(h => h.id !== id))
  }, [])

  // Last 7 days for the mini calendar
  const days = Array.from({ length: 7 }, (_, i) => dateOf(6 - i))
  const dayLabels = days.map(d => new Date(d + 'T12:00').toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 1))

  const todayStr = today()
  const todayDone = habits.filter(h => h.completions.includes(todayStr)).length

  if (!mounted) return null

  return (
    <div className="flex flex-col h-full font-mono text-xs">
      {/* Header */}
      <div className="flex items-center justify-between px-3 pt-2 pb-1 shrink-0">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-3.5 h-3.5 text-primary" />
          <span className="text-[10px] uppercase tracking-wide text-muted-foreground">Habit Tracker</span>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
          <span className="text-price-up font-semibold">{todayDone}/{habits.length}</span>
          <span>today</span>
        </div>
      </div>

      {/* Day header */}
      <div className="grid px-3 pb-1 shrink-0" style={{ gridTemplateColumns: '1fr repeat(7, 1.5rem)' }}>
        <span className="text-[9px] text-muted-foreground">Habit</span>
        {dayLabels.map((l, i) => (
          <span key={i} className={cn(
            'text-center text-[9px]',
            days[i] === todayStr ? 'text-primary font-bold' : 'text-muted-foreground'
          )}>
            {l}
          </span>
        ))}
      </div>

      {/* Habits list */}
      <div className="flex-1 overflow-y-auto">
        {habits.map(h => {
          const s = streak(h.completions)
          const doneToday = h.completions.includes(todayStr)
          return (
            <div
              key={h.id}
              className="group grid items-center px-3 py-1.5 border-b border-border/30 hover:bg-muted/10 transition-colors"
              style={{ gridTemplateColumns: '1fr repeat(7, 1.5rem) 2.5rem' }}
            >
              {/* Name + streak */}
              <div className="flex items-center gap-1.5 min-w-0 mr-1">
                <span className={cn('w-2 h-2 rounded-full shrink-0', h.color)} />
                <span
                  className={cn('truncate', doneToday ? 'text-foreground' : 'text-muted-foreground')}
                  title={h.name}
                >
                  {h.name}
                </span>
                {s > 0 && (
                  <span className="flex items-center gap-0.5 text-[9px] text-orange-400 shrink-0">
                    <Flame className="w-2.5 h-2.5" />
                    {s}
                  </span>
                )}
              </div>

              {/* Day checkboxes */}
              {days.map(d => {
                const done = h.completions.includes(d)
                const isToday = d === todayStr
                return (
                  <button
                    key={d}
                    onClick={() => toggle(h.id, d)}
                    className="flex justify-center items-center"
                    title={d}
                  >
                    {done ? (
                      <span className={cn('w-4 h-4 rounded-full flex items-center justify-center', h.color)}>
                        <span className="text-white text-[8px] font-bold">✓</span>
                      </span>
                    ) : (
                      <span className={cn(
                        'w-4 h-4 rounded-full border',
                        isToday ? 'border-primary/60 bg-primary/5' : 'border-border/40'
                      )} />
                    )}
                  </button>
                )
              })}

              {/* Delete */}
              <button
                onClick={() => remove(h.id)}
                className="opacity-0 group-hover:opacity-100 flex justify-center text-muted-foreground hover:text-price-down transition-all"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          )
        })}

        {/* Add habit form */}
        {adding ? (
          <div className="flex items-center gap-1 px-3 py-1.5 border-b border-border/30">
            <input
              autoFocus
              value={newName}
              onChange={e => setNewName(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') addHabit(); if (e.key === 'Escape') setAdding(false) }}
              placeholder="Habit name…"
              className="flex-1 bg-background border border-border rounded px-2 py-0.5 text-[11px] focus:outline-none focus:border-primary"
            />
            <button onClick={addHabit} className="px-2 py-0.5 border border-price-up/40 bg-price-up/10 text-price-up rounded text-[10px] hover:bg-price-up/20 transition-colors">
              Add
            </button>
            <button onClick={() => setAdding(false)} className="px-2 py-0.5 border border-border rounded text-[10px] text-muted-foreground hover:text-foreground transition-colors">
              ✕
            </button>
          </div>
        ) : (
          <button
            onClick={() => setAdding(true)}
            className="w-full flex items-center gap-1.5 px-3 py-2 text-muted-foreground hover:text-foreground hover:bg-muted/10 transition-colors text-[10px]"
          >
            <Plus className="w-3 h-3" />
            Add habit
          </button>
        )}
      </div>

      <div className="text-[9px] text-muted-foreground px-3 py-1 border-t border-border shrink-0">
        Streaks · Last 7 days · Saved locally
      </div>
    </div>
  )
}
