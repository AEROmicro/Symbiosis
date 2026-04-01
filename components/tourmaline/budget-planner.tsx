'use client'

import { useState, useEffect, useMemo } from 'react'
import { PiggyBank, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { type ExpenseCategory } from './expense-tracker'

const CATEGORIES: ExpenseCategory[] = ['Food', 'Transport', 'Housing', 'Healthcare', 'Entertainment', 'Shopping', 'Utilities', 'Other']

type BudgetMap = Record<ExpenseCategory, number>

interface Expense {
  id: string
  amount: number
  category: ExpenseCategory
  date: string
}

const MONTH_LABELS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const SHORT_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function formatMoney(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
}

function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn('bg-card border border-border rounded-md p-4', className)}>{children}</div>
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-3">{children}</h2>
}

const EMPTY_BUDGET: BudgetMap = {
  Food: 0, Transport: 0, Housing: 0, Healthcare: 0,
  Entertainment: 0, Shopping: 0, Utilities: 0, Other: 0,
}

const STARTER_BUDGETS: BudgetMap = {
  Food: 400, Transport: 200, Housing: 1200, Healthcare: 100,
  Entertainment: 100, Shopping: 150, Utilities: 150, Other: 100,
}

function fiftyThirtyTwenty(income: number): BudgetMap {
  const needs = income * 0.5
  const wants = income * 0.3
  return {
    Housing:       Math.round(needs * 0.45),
    Food:          Math.round(needs * 0.25),
    Transport:     Math.round(needs * 0.15),
    Utilities:     Math.round(needs * 0.1),
    Healthcare:    Math.round(needs * 0.05),
    Entertainment: Math.round(wants * 0.35),
    Shopping:      Math.round(wants * 0.40),
    Other:         Math.round(wants * 0.25),
  }
}

export function BudgetPlanner() {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())
  const [budgets, setBudgets] = useState<Record<string, BudgetMap>>({})
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [incomeInput, setIncomeInput] = useState('')
  const [editing, setEditing] = useState(false)
  const [draftBudget, setDraftBudget] = useState<BudgetMap>({ ...EMPTY_BUDGET })

  const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`

  useEffect(() => {
    try {
      const b = localStorage.getItem('tourmaline-budgets')
      if (b) setBudgets(JSON.parse(b))
      const e = localStorage.getItem('tourmaline-expenses')
      if (e) setExpenses(JSON.parse(e))
    } catch {}
  }, [])

  useEffect(() => {
    const current = budgets[monthKey] || EMPTY_BUDGET
    setDraftBudget({ ...current })
  }, [month, year, budgets, monthKey])

  const persistBudgets = (data: Record<string, BudgetMap>) => {
    setBudgets(data)
    localStorage.setItem('tourmaline-budgets', JSON.stringify(data))
  }

  const saveBudget = () => {
    const updated = { ...budgets, [monthKey]: draftBudget }
    persistBudgets(updated)
    setEditing(false)
  }

  const applyTemplate = (template: BudgetMap) => {
    setDraftBudget(template)
    setEditing(true)
  }

  const currentBudget = budgets[monthKey] || EMPTY_BUDGET

  // Spending for selected month
  const monthSpending = useMemo(() => {
    const totals: Record<string, number> = {}
    expenses.filter(e => e.date.startsWith(monthKey)).forEach(e => {
      totals[e.category] = (totals[e.category] || 0) + e.amount
    })
    return totals
  }, [expenses, monthKey])

  const totalBudget = Object.values(currentBudget).reduce((s, v) => s + v, 0)
  const totalSpent = Object.values(monthSpending).reduce((s, v) => s + v, 0)
  const totalRemaining = totalBudget - totalSpent

  const navigateMonth = (dir: number) => {
    const d = new Date(year, month + dir, 1)
    setYear(d.getFullYear())
    setMonth(d.getMonth())
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
          <PiggyBank className="size-5 text-primary" />
          Budget Planner
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">Manage your monthly spending limits</p>
      </div>

      {/* Month Selector */}
      <div className="flex items-center gap-3">
        <Button variant="outline" size="icon-sm" onClick={() => navigateMonth(-1)}>
          <ChevronLeft className="size-4" />
        </Button>
        <span className="text-sm font-semibold text-foreground w-36 text-center">
          {MONTH_LABELS[month]} {year}
        </span>
        <Button variant="outline" size="icon-sm" onClick={() => navigateMonth(1)}>
          <ChevronRight className="size-4" />
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="ml-auto text-xs h-8"
          onClick={() => setEditing(v => !v)}
        >
          {editing ? 'Cancel' : 'Edit Budget'}
        </Button>
      </div>

      {/* Templates */}
      {editing && (
        <Card>
          <SectionTitle>Budget Templates</SectionTitle>
          <div className="flex flex-wrap gap-2 mb-3">
            <Button size="sm" variant="outline" className="text-xs h-8" onClick={() => applyTemplate(STARTER_BUDGETS)}>
              Starter Budget
            </Button>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                placeholder="Monthly income"
                value={incomeInput}
                onChange={e => setIncomeInput(e.target.value)}
                className="h-8 text-xs w-36"
              />
              <Button
                size="sm"
                variant="outline"
                className="text-xs h-8"
                onClick={() => {
                  const inc = parseFloat(incomeInput)
                  if (inc > 0) applyTemplate(fiftyThirtyTwenty(inc))
                }}
              >
                50/30/20 Rule
              </Button>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">50% Needs · 30% Wants · 20% Savings</p>
        </Card>
      )}

      {/* Total Summary */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total Budget', value: totalBudget, color: 'text-foreground' },
          { label: 'Total Spent', value: totalSpent, color: totalSpent > totalBudget && totalBudget > 0 ? 'text-red-400' : 'text-orange-400' },
          { label: 'Remaining', value: Math.abs(totalRemaining), color: totalRemaining < 0 ? 'text-red-400' : 'text-green-400' },
        ].map(({ label, value, color }) => (
          <Card key={label} className="p-3">
            <p className="text-xs text-muted-foreground mb-1">{label}</p>
            <p className={cn('text-lg font-bold tabular-nums', color)}>{formatMoney(value)}</p>
          </Card>
        ))}
      </div>

      {/* Category Budgets */}
      <Card>
        <SectionTitle>Category Budgets</SectionTitle>
        <div className="space-y-4">
          {CATEGORIES.map(cat => {
            const budget = editing ? draftBudget[cat] : currentBudget[cat]
            const spent = monthSpending[cat] || 0
            const pct = budget > 0 ? Math.min(100, (spent / budget) * 100) : 0
            const barColor = pct >= 100 ? 'bg-red-500' : pct >= 80 ? 'bg-yellow-500' : 'bg-green-500'
            const textColor = pct >= 100 ? 'text-red-400' : pct >= 80 ? 'text-yellow-400' : 'text-green-400'

            return (
              <div key={cat}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-foreground">{cat}</span>
                  {editing ? (
                    <Input
                      type="number"
                      value={draftBudget[cat] || ''}
                      onChange={e => setDraftBudget(d => ({ ...d, [cat]: parseFloat(e.target.value) || 0 }))}
                      className="h-6 text-xs w-24 text-right font-mono"
                      placeholder="0"
                      min="0"
                    />
                  ) : (
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-muted-foreground tabular-nums">{formatMoney(spent)}</span>
                      <span className="text-muted-foreground">/</span>
                      <span className="text-foreground tabular-nums">{budget > 0 ? formatMoney(budget) : '—'}</span>
                      {budget > 0 && <span className={cn('tabular-nums font-semibold', textColor)}>{Math.round(pct)}%</span>}
                    </div>
                  )}
                </div>
                {!editing && (
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    {budget > 0 ? (
                      <div className={cn('h-full rounded-full transition-all', barColor)} style={{ width: `${pct}%` }} />
                    ) : (
                      <div className="h-full bg-muted-foreground/20 rounded-full" style={{ width: `${Math.min(100, spent > 0 ? 100 : 0)}%` }} />
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
        {editing && (
          <Button onClick={saveBudget} size="sm" className="mt-4 w-full text-xs">Save Budget for {SHORT_MONTHS[month]} {year}</Button>
        )}
      </Card>
    </div>
  )
}
