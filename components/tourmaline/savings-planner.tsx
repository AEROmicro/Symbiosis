'use client'

import { useState, useEffect, useMemo } from 'react'
import { Plus, Trash2, Pencil, Check, X, PiggyBank, Target, Percent } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const STORAGE_KEY = 'tourmaline-savings-goals-v2'
const EXPENSES_KEY = 'tourmaline-expenses'

interface SavingsGoal {
  id: string
  name: string
  target: number
  current: number
  monthlyContrib: number
  annualRate: number
  createdAt: string
}

interface Expense {
  amount: number
  date: string
}

function fmt(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
}

function fmtD(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(n)
}

function projectedValue(current: number, monthly: number, annualRate: number, months: number): number {
  if (annualRate === 0) return current + monthly * months
  const r = annualRate / 100 / 12
  return current * Math.pow(1 + r, months) + monthly * ((Math.pow(1 + r, months) - 1) / r)
}

function monthsToGoal(current: number, target: number, monthly: number, annualRate: number): number {
  if (monthly <= 0) return Infinity
  if (annualRate === 0) return Math.ceil((target - current) / monthly)
  const r = annualRate / 100 / 12
  if (r === 0) return Math.ceil((target - current) / monthly)
  const n = Math.log((monthly + (target - current) * r) / (monthly - 0)) / Math.log(1 + r)
  return Math.ceil(isFinite(n) && n > 0 ? n : (target - current) / monthly)
}

function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn('bg-card border border-border rounded-md p-4', className)}>{children}</div>
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-3">{children}</h2>
}

const EMPTY_FORM = { name: '', target: '', current: '', monthlyContrib: '', annualRate: '4.5' }

export function SavingsPlanner() {
  const [goals, setGoals] = useState<SavingsGoal[]>([])
  const [form, setForm] = useState({ ...EMPTY_FORM })
  const [showAdd, setShowAdd] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editCurrent, setEditCurrent] = useState('')
  const [monthlyExpenses, setMonthlyExpenses] = useState(0)

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) setGoals(JSON.parse(saved))
      // Load expenses for emergency fund calc
      const expenses = localStorage.getItem(EXPENSES_KEY)
      if (expenses) {
        const parsed: Expense[] = JSON.parse(expenses)
        const now = new Date()
        const last3Months = parsed.filter(e => {
          const d = new Date(e.date)
          const diffMs = now.getTime() - d.getTime()
          return diffMs <= 90 * 24 * 60 * 60 * 1000
        })
        const total = last3Months.reduce((s, e) => s + e.amount, 0)
        setMonthlyExpenses(total / 3)
      }
    } catch {}
  }, [])

  const persist = (data: SavingsGoal[]) => {
    setGoals(data)
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)) } catch {}
  }

  const addGoal = () => {
    const target = parseFloat(form.target)
    const current = parseFloat(form.current) || 0
    const monthly = parseFloat(form.monthlyContrib) || 0
    const rate = parseFloat(form.annualRate) || 0
    if (!form.name.trim() || isNaN(target) || target <= 0) return
    persist([...goals, {
      id: String(Date.now()), name: form.name.trim(),
      target, current, monthlyContrib: monthly, annualRate: rate,
      createdAt: new Date().toISOString(),
    }])
    setForm({ ...EMPTY_FORM })
    setShowAdd(false)
  }

  const removeGoal = (id: string) => persist(goals.filter(g => g.id !== id))

  const saveEdit = (id: string) => {
    const val = parseFloat(editCurrent)
    if (!isNaN(val) && val >= 0) {
      persist(goals.map(g => g.id === id ? { ...g, current: val } : g))
    }
    setEditingId(null)
  }

  const totalMonthlyContrib = useMemo(() => goals.reduce((s, g) => s + g.monthlyContrib, 0), [goals])
  const emergencyFund3 = monthlyExpenses * 3
  const emergencyFund6 = monthlyExpenses * 6

  return (
    <div className="space-y-4 font-mono">
      {/* Emergency Fund Calculator */}
      {monthlyExpenses > 0 && (
        <Card>
          <div className="flex items-center gap-2 mb-3">
            <PiggyBank className="w-4 h-4 text-muted-foreground" />
            <SectionTitle>Emergency Fund Recommendation</SectionTitle>
          </div>
          <div className="text-xs text-muted-foreground mb-3">
            Based on avg monthly expenses of <span className="text-foreground font-semibold">{fmt(monthlyExpenses)}</span> from your expense tracker.
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="border border-border rounded-sm p-3">
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">3-Month Fund</div>
              <div className="text-lg font-bold tabular-nums text-amber-500">{fmt(emergencyFund3)}</div>
              <div className="text-[10px] text-muted-foreground">Minimum recommended</div>
            </div>
            <div className="border border-border rounded-sm p-3">
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">6-Month Fund</div>
              <div className="text-lg font-bold tabular-nums text-green-500">{fmt(emergencyFund6)}</div>
              <div className="text-[10px] text-muted-foreground">Ideal target</div>
            </div>
          </div>
        </Card>
      )}

      {/* Monthly Summary */}
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Total Savings Goals</div>
          <div className="text-2xl font-bold tabular-nums">{goals.length}</div>
        </Card>
        <Card>
          <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Monthly Savings</div>
          <div className="text-2xl font-bold tabular-nums text-primary">{fmt(totalMonthlyContrib)}</div>
        </Card>
      </div>

      {/* Goals List */}
      <Card>
        <SectionTitle>Savings Goals</SectionTitle>
        {goals.length === 0 ? (
          <div className="text-xs text-muted-foreground text-center py-4">No savings goals yet</div>
        ) : (
          <div className="space-y-4">
            {goals.map(g => {
              const pct = g.target > 0 ? Math.min((g.current / g.target) * 100, 100) : 0
              const remaining = Math.max(0, g.target - g.current)
              const months = g.current < g.target ? monthsToGoal(g.current, g.target, g.monthlyContrib, g.annualRate) : 0
              const interestEarned = g.annualRate > 0 && months > 0
                ? projectedValue(g.current, g.monthlyContrib, g.annualRate, months) - (g.current + g.monthlyContrib * months)
                : 0
              const complete = pct >= 100
              const isEditing = editingId === g.id

              return (
                <div key={g.id} className={cn('border rounded-sm p-3 space-y-2', complete ? 'border-primary/40 bg-primary/5' : 'border-border')}>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-1.5">
                        {complete && <Check className="w-3 h-3 text-primary" />}
                        <span className={cn('text-xs font-semibold', complete && 'text-primary')}>{g.name}</span>
                      </div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">
                        Target: {fmt(g.target)} · {fmtD(g.monthlyContrib)}/mo · {g.annualRate}% APY
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => { setEditingId(g.id); setEditCurrent(String(g.current)) }}
                        className="text-muted-foreground/40 hover:text-primary transition-colors">
                        <Pencil className="w-3 h-3" />
                      </button>
                      <button onClick={() => removeGoal(g.id)} className="text-muted-foreground/40 hover:text-destructive transition-colors">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  <div className="h-2 bg-border rounded-full overflow-hidden">
                    <div className={cn('h-full rounded-full transition-all', complete ? 'bg-primary' : 'bg-primary/60')}
                      style={{ width: `${pct}%` }} />
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground">
                    <span className="tabular-nums">{fmt(g.current)} saved</span>
                    <span className={cn('tabular-nums', complete && 'text-primary')}>{pct.toFixed(1)}%</span>
                  </div>

                  {!complete && (
                    <div className="flex gap-2 text-[10px] text-muted-foreground">
                      <span className="tabular-nums">{fmt(remaining)} remaining</span>
                      {isFinite(months) && months > 0 && (
                        <>
                          <span>·</span>
                          <span className="tabular-nums">{months} months to goal</span>
                        </>
                      )}
                      {interestEarned > 0.01 && (
                        <>
                          <span>·</span>
                          <span className="text-green-500 tabular-nums flex items-center gap-0.5">
                            <Percent className="w-2.5 h-2.5" />{fmtD(interestEarned)} interest
                          </span>
                        </>
                      )}
                    </div>
                  )}

                  {isEditing && (
                    <div className="flex gap-1.5">
                      <Input className="flex-1 h-7 text-xs font-mono" type="number" min="0" step="any"
                        value={editCurrent} onChange={e => setEditCurrent(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') saveEdit(g.id); if (e.key === 'Escape') setEditingId(null) }}
                        autoFocus />
                      <button onClick={() => saveEdit(g.id)} className="text-primary hover:text-primary/80">
                        <Check className="w-4 h-4" />
                      </button>
                      <button onClick={() => setEditingId(null)} className="text-muted-foreground hover:text-foreground">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {showAdd ? (
          <div className="mt-4 border border-primary/30 rounded-md p-3 space-y-2 bg-primary/5">
            <div className="text-[10px] text-primary uppercase tracking-widest">New Goal</div>
            <Input className="h-8 text-xs font-mono" placeholder="Goal name (e.g. Vacation Fund)" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} autoFocus />
            <div className="grid grid-cols-2 gap-2">
              <Input className="h-8 text-xs font-mono" placeholder="Target ($)" type="number" min="0" value={form.target} onChange={e => setForm(f => ({ ...f, target: e.target.value }))} />
              <Input className="h-8 text-xs font-mono" placeholder="Saved so far ($)" type="number" min="0" value={form.current} onChange={e => setForm(f => ({ ...f, current: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Input className="h-8 text-xs font-mono" placeholder="Monthly contrib ($)" type="number" min="0" value={form.monthlyContrib} onChange={e => setForm(f => ({ ...f, monthlyContrib: e.target.value }))} />
              <Input className="h-8 text-xs font-mono" placeholder="Annual rate (%, e.g. 4.5)" type="number" min="0" step="0.1" value={form.annualRate} onChange={e => setForm(f => ({ ...f, annualRate: e.target.value }))} />
            </div>
            <div className="flex gap-2">
              <Button size="sm" className="flex-1 h-7 text-xs font-mono" onClick={addGoal} disabled={!form.name || !form.target}>
                <Plus className="w-3 h-3 mr-1" />Add Goal
              </Button>
              <Button size="sm" variant="ghost" className="h-7 px-3 text-xs font-mono border border-border" onClick={() => { setShowAdd(false); setForm({ ...EMPTY_FORM }) }}>Cancel</Button>
            </div>
          </div>
        ) : (
          <Button size="sm" variant="outline" className="w-full mt-3 h-7 text-xs font-mono" onClick={() => setShowAdd(true)}>
            <Plus className="w-3 h-3 mr-1" />Add Goal
          </Button>
        )}
      </Card>
    </div>
  )
}
