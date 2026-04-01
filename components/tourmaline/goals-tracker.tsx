'use client'

import { useState, useEffect } from 'react'
import { Plus, Trash2, Target, Plane, Home, Car, GraduationCap, TrendingUp, Umbrella, Star, PlusCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

type GoalCategory = 'Emergency Fund' | 'Vacation' | 'Home' | 'Car' | 'Education' | 'Retirement' | 'Other'

interface Goal {
  id: string
  name: string
  target: number
  current: number
  targetDate: string
  category: GoalCategory
}

const GOAL_CATEGORIES: GoalCategory[] = ['Emergency Fund', 'Vacation', 'Home', 'Car', 'Education', 'Retirement', 'Other']

const CAT_META: Record<GoalCategory, { icon: React.ComponentType<{ className?: string }>; color: string; bg: string }> = {
  'Emergency Fund': { icon: Umbrella,      color: 'text-green-400',  bg: 'bg-green-400' },
  'Vacation':       { icon: Plane,         color: 'text-blue-400',   bg: 'bg-blue-400' },
  'Home':           { icon: Home,          color: 'text-purple-400', bg: 'bg-purple-400' },
  'Car':            { icon: Car,           color: 'text-orange-400', bg: 'bg-orange-400' },
  'Education':      { icon: GraduationCap, color: 'text-yellow-400', bg: 'bg-yellow-400' },
  'Retirement':     { icon: TrendingUp,    color: 'text-pink-400',   bg: 'bg-pink-400' },
  'Other':          { icon: Star,          color: 'text-cyan-400',   bg: 'bg-cyan-400' },
}

function formatMoney(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
}

function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn('bg-card border border-border rounded-md p-4', className)}>{children}</div>
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-3">{children}</h2>
}

function getDaysRemaining(targetDate: string): number {
  const target = new Date(targetDate + 'T12:00:00')
  const now = new Date()
  return Math.max(0, Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
}

function getMonthlyContribution(current: number, target: number, targetDate: string): number {
  const now = new Date()
  const end = new Date(targetDate + 'T12:00:00')
  if (end <= now) return 0
  // Calculate fractional months using actual year/month difference
  const months = (end.getFullYear() - now.getFullYear()) * 12 + (end.getMonth() - now.getMonth()) + (end.getDate() - now.getDate()) / 30
  const remaining = Math.max(0, target - current)
  return months > 0 ? remaining / months : remaining
}

const EMPTY_FORM = { name: '', target: '', current: '', targetDate: '', category: 'Emergency Fund' as GoalCategory }

export function GoalsTracker() {
  const [goals, setGoals] = useState<Goal[]>([])
  const [form, setForm] = useState({ ...EMPTY_FORM })
  const [showAdd, setShowAdd] = useState(false)
  const [contribution, setContribution] = useState<Record<string, string>>({})

  useEffect(() => {
    try {
      const saved = localStorage.getItem('tourmaline-goals')
      if (saved) setGoals(JSON.parse(saved))
    } catch {}
  }, [])

  const persist = (data: Goal[]) => {
    setGoals(data)
    localStorage.setItem('tourmaline-goals', JSON.stringify(data))
  }

  const addGoal = () => {
    const target = parseFloat(form.target)
    const current = parseFloat(form.current) || 0
    if (!form.name.trim() || !target || target <= 0 || !form.targetDate) return
    const goal: Goal = {
      id: `${Date.now()}-${Math.random()}`,
      name: form.name.trim(),
      target,
      current,
      targetDate: form.targetDate,
      category: form.category,
    }
    persist([...goals, goal])
    setForm({ ...EMPTY_FORM })
    setShowAdd(false)
  }

  const deleteGoal = (id: string) => persist(goals.filter(g => g.id !== id))

  const addContribution = (id: string) => {
    const amount = parseFloat(contribution[id] || '0')
    if (!amount || amount <= 0) return
    persist(goals.map(g => g.id !== id ? g : { ...g, current: g.current + amount }))
    setContribution(c => ({ ...c, [id]: '' }))
  }

  const totalSaved = goals.reduce((s, g) => s + g.current, 0)
  const totalTarget = goals.reduce((s, g) => s + g.target, 0)

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Target className="size-5 text-primary" />
            Financial Goals
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">Track progress toward your goals</p>
        </div>
        <Button size="sm" className="text-xs h-8" onClick={() => setShowAdd(v => !v)}>
          <Plus className="size-3.5 mr-1" /> Add Goal
        </Button>
      </div>

      {/* Summary */}
      {goals.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          <Card className="p-3">
            <p className="text-xs text-muted-foreground mb-1">Total Saved</p>
            <p className="text-lg font-bold text-green-400 tabular-nums">{formatMoney(totalSaved)}</p>
          </Card>
          <Card className="p-3">
            <p className="text-xs text-muted-foreground mb-1">Total Target</p>
            <p className="text-lg font-bold text-foreground tabular-nums">{formatMoney(totalTarget)}</p>
          </Card>
          <Card className="p-3">
            <p className="text-xs text-muted-foreground mb-1">Overall</p>
            <p className="text-lg font-bold text-primary tabular-nums">
              {totalTarget > 0 ? `${Math.round((totalSaved / totalTarget) * 100)}%` : '0%'}
            </p>
          </Card>
        </div>
      )}

      {/* Add Goal Form */}
      {showAdd && (
        <Card>
          <SectionTitle>New Goal</SectionTitle>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <Input
              placeholder="Goal name"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className="text-xs h-8 font-mono"
            />
            <Input
              type="number"
              placeholder="Target amount"
              value={form.target}
              onChange={e => setForm(f => ({ ...f, target: e.target.value }))}
              className="text-xs h-8 font-mono"
              min="0"
            />
            <Input
              type="number"
              placeholder="Already saved"
              value={form.current}
              onChange={e => setForm(f => ({ ...f, current: e.target.value }))}
              className="text-xs h-8 font-mono"
              min="0"
            />
            <Input
              type="date"
              placeholder="Target date"
              value={form.targetDate}
              onChange={e => setForm(f => ({ ...f, targetDate: e.target.value }))}
              className="text-xs h-8 font-mono"
            />
            <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v as GoalCategory }))}>
              <SelectTrigger className="h-8 text-xs font-mono">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="font-mono text-xs">
                {GOAL_CATEGORIES.map(c => <SelectItem key={c} value={c} className="text-xs">{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2 mt-3">
            <Button onClick={addGoal} size="sm" className="text-xs h-8">Create Goal</Button>
            <Button onClick={() => setShowAdd(false)} variant="outline" size="sm" className="text-xs h-8">Cancel</Button>
          </div>
        </Card>
      )}

      {/* Goals List */}
      {goals.length === 0 ? (
        <Card>
          <p className="text-xs text-muted-foreground py-4 text-center">No goals yet. Create your first financial goal above.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {goals.map(goal => {
            const meta = CAT_META[goal.category]
            const Icon = meta.icon
            const pct = goal.target > 0 ? Math.min(100, (goal.current / goal.target) * 100) : 0
            const days = getDaysRemaining(goal.targetDate)
            const monthly = getMonthlyContribution(goal.current, goal.target, goal.targetDate)
            const remaining = Math.max(0, goal.target - goal.current)
            const isComplete = pct >= 100

            return (
              <Card key={goal.id} className={cn('relative group', isComplete && 'border-green-500/40')}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={cn('size-8 rounded-md flex items-center justify-center', meta.bg + '/20')}>
                      <Icon className={cn('size-4', meta.color)} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{goal.name}</p>
                      <p className="text-[10px] text-muted-foreground">{goal.category}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteGoal(goal.id)}
                    className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-400 transition-opacity"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>

                {/* Progress */}
                <div className="mb-3">
                  <div className="flex justify-between text-xs mb-1">
                    <span className={cn('font-semibold tabular-nums', meta.color)}>{formatMoney(goal.current)}</span>
                    <span className="text-muted-foreground tabular-nums">{formatMoney(goal.target)}</span>
                  </div>
                  <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className={cn('h-full rounded-full transition-all', isComplete ? 'bg-green-400' : meta.bg)}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                    <span>{Math.round(pct)}% complete</span>
                    {!isComplete && <span>{formatMoney(remaining)} to go</span>}
                    {isComplete && <span className="text-green-400 font-semibold">🎉 Goal reached!</span>}
                  </div>
                </div>

                {/* Stats */}
                {!isComplete && (
                  <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                    <div className="bg-muted/30 rounded p-2">
                      <p className="text-muted-foreground text-[10px]">Days Left</p>
                      <p className={cn('font-semibold', days < 30 ? 'text-red-400' : days < 90 ? 'text-yellow-400' : 'text-foreground')}>
                        {days > 365 ? `${Math.floor(days / 365)}y ${Math.floor((days % 365) / 30)}m` : days > 30 ? `${Math.floor(days / 30)}m ${days % 30}d` : `${days} days`}
                      </p>
                    </div>
                    <div className="bg-muted/30 rounded p-2">
                      <p className="text-muted-foreground text-[10px]">Monthly Needed</p>
                      <p className="font-semibold text-foreground tabular-nums">{formatMoney(monthly)}</p>
                    </div>
                  </div>
                )}

                {/* Add Contribution */}
                {!isComplete && (
                  <div className="flex gap-1.5">
                    <Input
                      type="number"
                      placeholder="Add savings"
                      value={contribution[goal.id] || ''}
                      onChange={e => setContribution(c => ({ ...c, [goal.id]: e.target.value }))}
                      className="h-7 text-xs font-mono flex-1"
                      min="0"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs px-2"
                      onClick={() => addContribution(goal.id)}
                    >
                      <PlusCircle className="size-3 mr-1" /> Add
                    </Button>
                  </div>
                )}
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
