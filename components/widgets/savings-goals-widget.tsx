'use client'

import { useState, useEffect } from 'react'
import { Plus, Trash2, Pencil, Check, X, Target } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const STORAGE_KEY = 'symbiosis-savings-goals'

interface SavingsGoal {
  id: string
  name: string
  targetAmount: number
  currentAmount: number
  currency: string
  createdAt: string
}

const CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY', 'INR', 'BTC']

function formatAmount(amount: number, currency: string): string {
  if (currency === 'BTC') return `₿${amount.toLocaleString(undefined, { maximumFractionDigits: 6 })}`
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount)
  } catch {
    return `${currency} ${amount.toLocaleString()}`
  }
}

export function SavingsGoalsWidget() {
  const [goals, setGoals] = useState<SavingsGoal[]>([])
  const [showAdd, setShowAdd] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  // New goal form state
  const [newName, setNewName] = useState('')
  const [newTarget, setNewTarget] = useState('')
  const [newCurrent, setNewCurrent] = useState('')
  const [newCurrency, setNewCurrency] = useState('USD')

  // Inline edit state
  const [editCurrent, setEditCurrent] = useState('')

  // Load from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed)) setGoals(parsed)
      }
    } catch { /* ignore */ }
  }, [])

  function saveGoals(next: SavingsGoal[]) {
    setGoals(next)
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)) } catch { /* ignore */ }
  }

  function addGoal() {
    const target = parseFloat(newTarget)
    const current = parseFloat(newCurrent) || 0
    if (!newName.trim() || isNaN(target) || target <= 0) return
    const goal: SavingsGoal = {
      id: String(Date.now()),
      name: newName.trim(),
      targetAmount: target,
      currentAmount: Math.min(current, target),
      currency: newCurrency,
      createdAt: new Date().toISOString(),
    }
    saveGoals([...goals, goal])
    setNewName(''); setNewTarget(''); setNewCurrent(''); setNewCurrency('USD')
    setShowAdd(false)
  }

  function removeGoal(id: string) {
    saveGoals(goals.filter(g => g.id !== id))
  }

  function startEdit(goal: SavingsGoal) {
    setEditingId(goal.id)
    setEditCurrent(String(goal.currentAmount))
  }

  function saveEdit(id: string) {
    const val = parseFloat(editCurrent)
    if (isNaN(val) || val < 0) { setEditingId(null); return }
    saveGoals(goals.map(g => g.id === id ? { ...g, currentAmount: Math.min(val, g.targetAmount) } : g))
    setEditingId(null)
  }

  const totalSaved = goals.reduce((acc, g) => acc + g.currentAmount, 0)
  const totalTarget = goals.reduce((acc, g) => acc + g.targetAmount, 0)
  const overallPct = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0

  return (
    <div className="flex flex-col h-full p-3 gap-3">
      {/* Summary bar */}
      {goals.length > 0 && (
        <div className="shrink-0 border border-border rounded-sm px-3 py-2 bg-card/30">
          <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground mb-1.5">
            <span className="uppercase tracking-wider">Overall Progress</span>
            <span className="text-foreground tabular-nums">{overallPct.toFixed(1)}%</span>
          </div>
          <div className="h-1.5 bg-border rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${Math.min(overallPct, 100)}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[9px] font-mono text-muted-foreground/60 mt-1">
            <span>{goals.filter(g => g.currentAmount >= g.targetAmount).length} of {goals.length} complete</span>
          </div>
        </div>
      )}

      {/* Goals list */}
      <div className="flex-1 overflow-y-auto space-y-2 min-h-0">
        {goals.length === 0 && !showAdd && (
          <div className="flex flex-col items-center justify-center h-full gap-2 text-center">
            <Target className="w-8 h-8 text-muted-foreground/30" />
            <div className="text-xs text-muted-foreground font-mono">No savings goals yet</div>
            <div className="text-[10px] text-muted-foreground/60 font-mono">Create a goal to track your progress</div>
          </div>
        )}

        {goals.map(goal => {
          const pct = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0
          const complete = pct >= 100
          const isEditing = editingId === goal.id

          return (
            <div
              key={goal.id}
              className={cn(
                'border rounded-sm p-2.5 space-y-2',
                complete ? 'border-primary/40 bg-primary/5' : 'border-border bg-card/20',
              )}
            >
              {/* Goal header */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    {complete && <Check className="w-3 h-3 text-primary shrink-0" />}
                    <span className={cn(
                      'text-xs font-mono font-semibold truncate',
                      complete ? 'text-primary' : 'text-foreground',
                    )}>
                      {goal.name}
                    </span>
                  </div>
                  <div className="text-[10px] text-muted-foreground font-mono mt-0.5">
                    Target: {formatAmount(goal.targetAmount, goal.currency)}
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => startEdit(goal)}
                    className="text-muted-foreground/40 hover:text-primary transition-colors"
                    title="Update amount"
                  >
                    <Pencil className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => removeGoal(goal.id)}
                    className="text-muted-foreground/40 hover:text-destructive transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Progress bar */}
              <div className="space-y-1">
                <div className="h-2 bg-border rounded-full overflow-hidden">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all duration-500',
                      complete ? 'bg-primary' : pct > 75 ? 'bg-primary/80' : pct > 40 ? 'bg-primary/60' : 'bg-primary/40',
                    )}
                    style={{ width: `${Math.min(pct, 100)}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[9px] font-mono text-muted-foreground">
                  <span className={cn('tabular-nums', complete && 'text-primary')}>
                    {formatAmount(goal.currentAmount, goal.currency)}
                  </span>
                  <span className={cn('tabular-nums', complete ? 'text-primary' : '')}>
                    {pct.toFixed(1)}%
                  </span>
                </div>
              </div>

              {/* Inline edit */}
              {isEditing && (
                <div className="flex gap-1.5 mt-1">
                  <input
                    type="number"
                    min="0"
                    step="any"
                    className="flex-1 min-w-0 px-2 py-1 text-xs font-mono bg-background/60 border border-primary/40 rounded-sm text-foreground focus:outline-none"
                    value={editCurrent}
                    onChange={e => setEditCurrent(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') saveEdit(goal.id); if (e.key === 'Escape') setEditingId(null) }}
                    autoFocus
                  />
                  <button onClick={() => saveEdit(goal.id)} className="text-primary hover:text-primary/80 transition-colors">
                    <Check className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => setEditingId(null)} className="text-muted-foreground hover:text-foreground transition-colors">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Add goal form */}
      {showAdd && (
        <div className="shrink-0 border border-primary/30 rounded-sm p-2.5 space-y-2 bg-primary/5">
          <div className="text-[10px] text-primary font-mono uppercase tracking-widest">New Goal</div>
          <input
            className="w-full px-2 py-1.5 text-xs font-mono bg-background/60 border border-border rounded-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/60"
            placeholder="Goal name (e.g. Emergency Fund)"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            autoFocus
          />
          <div className="flex gap-1.5">
            <input
              className="flex-1 min-w-0 px-2 py-1.5 text-xs font-mono bg-background/60 border border-border rounded-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/60"
              placeholder="Target amount"
              type="number"
              min="0"
              step="any"
              value={newTarget}
              onChange={e => setNewTarget(e.target.value)}
            />
            <select
              value={newCurrency}
              onChange={e => setNewCurrency(e.target.value)}
              className="bg-background/60 border border-border rounded-sm px-1.5 py-1.5 text-xs font-mono text-foreground focus:outline-none focus:border-primary/60"
            >
              {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <input
            className="w-full px-2 py-1.5 text-xs font-mono bg-background/60 border border-border rounded-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/60"
            placeholder="Current saved amount (optional)"
            type="number"
            min="0"
            step="any"
            value={newCurrent}
            onChange={e => setNewCurrent(e.target.value)}
          />
          <div className="flex gap-1.5">
            <Button
              size="sm"
              className="flex-1 h-7 text-xs font-mono rounded-sm"
              onClick={addGoal}
              disabled={!newName.trim() || !newTarget}
            >
              <Plus className="w-3 h-3 mr-1" />
              Add Goal
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-7 px-3 text-xs font-mono rounded-sm border border-border"
              onClick={() => { setShowAdd(false); setNewName(''); setNewTarget(''); setNewCurrent('') }}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Add button */}
      {!showAdd && (
        <Button
          size="sm"
          variant="outline"
          className="w-full h-7 text-xs font-mono rounded-sm border-border hover:border-primary/60 shrink-0"
          onClick={() => setShowAdd(true)}
        >
          <Plus className="w-3 h-3 mr-1" />
          Add Goal
        </Button>
      )}
    </div>
  )
}
