'use client'

import { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, Wallet, Target, FileText, PiggyBank, DollarSign, BarChart2, Banknote, PieChart } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface NetWorthData {
  savings: number
  investments: number
  property: number
  otherAssets: number
  creditCards: number
  loans: number
  mortgage: number
  otherLiabilities: number
}

interface Expense {
  id: string
  amount: number
  category: string
  description: string
  date: string
}

interface Bill {
  id: string
  name: string
  amount: number
  status: 'active' | 'paused'
}

interface Goal {
  id: string
  name: string
  current: number
  target: number
}

interface Investment {
  id: string
  currentValue: number
  purchasePrice: number
  shares: number
}

interface Debt {
  id: string
  name: string
  balance: number
  interestRate: number
  type: string
}

interface SavingsGoal {
  id: string
  name: string
  current: number
  target: number
}

const EMPTY_NW: NetWorthData = {
  savings: 0, investments: 0, property: 0, otherAssets: 0,
  creditCards: 0, loans: 0, mortgage: 0, otherLiabilities: 0,
}

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function formatMoney(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
}

function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn('bg-card border border-border rounded-md p-4', className)}>
      {children}
    </div>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-3">{children}</h2>
}

export function Overview() {
  const [nw, setNw] = useState<NetWorthData>(EMPTY_NW)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState<NetWorthData>(EMPTY_NW)
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [bills, setBills] = useState<Bill[]>([])
  const [goals, setGoals] = useState<Goal[]>([])
  const [budgets, setBudgets] = useState<Record<string, number>>({})
  const [investments, setInvestments] = useState<Investment[]>([])
  const [debts, setDebts] = useState<Debt[]>([])
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([])

  useEffect(() => {
    try {
      const saved = localStorage.getItem('tourmaline-networth')
      if (saved) { const d = JSON.parse(saved); setNw(d); setDraft(d) }
      const expSaved = localStorage.getItem('tourmaline-expenses')
      if (expSaved) setExpenses(JSON.parse(expSaved))
      const billsSaved = localStorage.getItem('tourmaline-bills')
      if (billsSaved) setBills(JSON.parse(billsSaved))
      const goalsSaved = localStorage.getItem('tourmaline-goals')
      if (goalsSaved) setGoals(JSON.parse(goalsSaved))
      const budgetsSaved = localStorage.getItem('tourmaline-budgets')
      if (budgetsSaved) {
        // tourmaline-budgets stores all months keyed by YYYY-MM
        const allBudgets = JSON.parse(budgetsSaved)
        const currentKey = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`
        setBudgets(allBudgets[currentKey] || {})
      }
      const invSaved = localStorage.getItem('tourmaline-investments')
      if (invSaved) setInvestments(JSON.parse(invSaved))
      const debtsSaved = localStorage.getItem('tourmaline-debts')
      if (debtsSaved) setDebts(JSON.parse(debtsSaved))
      const savingsSaved = localStorage.getItem('tourmaline-savings-goals-v2')
      if (savingsSaved) setSavingsGoals(JSON.parse(savingsSaved))
    } catch {}
  }, [])

  const saveNw = () => {
    setNw(draft)
    localStorage.setItem('tourmaline-networth', JSON.stringify(draft))
    setEditing(false)
  }

  const totalAssets = nw.savings + nw.investments + nw.property + nw.otherAssets
  const totalLiabilities = nw.creditCards + nw.loans + nw.mortgage + nw.otherLiabilities
  const netWorth = totalAssets - totalLiabilities

  // Current month expenses
  const now = new Date()
  const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const monthExpenses = expenses.filter(e => e.date.startsWith(thisMonth))
  const totalSpent = monthExpenses.reduce((s, e) => s + e.amount, 0)
  const totalBudget = Object.values(budgets).reduce((s, v) => s + v, 0)

  // Build 6-month spending data
  const monthlySpending: number[] = []
  const monthlyLabels: string[] = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    monthlyLabels.push(MONTH_LABELS[d.getMonth()])
    monthlySpending.push(expenses.filter(e => e.date.startsWith(key)).reduce((s, e) => s + e.amount, 0))
  }
  const maxSpending = Math.max(...monthlySpending, 1)

  // Upcoming bills (active)
  const activeBills = bills.filter(b => b.status === 'active')
  const upcomingCount = activeBills.length

  // Goals progress
  const activeGoals = goals.length
  const budgetCompliance = totalBudget > 0 ? Math.max(0, Math.min(100, Math.round((1 - totalSpent / totalBudget) * 100))) : null

  const nwColor = netWorth >= 0 ? 'text-green-400' : 'text-red-400'

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
          <BarChart2 className="size-5 text-primary" />
          Overview
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">Your complete financial picture</p>
      </div>

      {/* Net Worth */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <SectionTitle>Net Worth</SectionTitle>
          <Button size="sm" variant="outline" onClick={() => { setDraft(nw); setEditing(v => !v) }} className="text-xs h-7">
            {editing ? 'Cancel' : 'Edit'}
          </Button>
        </div>
        <div className={cn('text-4xl font-bold tabular-nums mb-4', nwColor)}>
          {formatMoney(netWorth)}
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground text-xs uppercase tracking-wider mb-1">Total Assets</p>
            <p className="text-green-400 font-semibold">{formatMoney(totalAssets)}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs uppercase tracking-wider mb-1">Total Liabilities</p>
            <p className="text-red-400 font-semibold">{formatMoney(totalLiabilities)}</p>
          </div>
        </div>

        {editing && (
          <div className="mt-4 border-t border-border pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-green-400 uppercase tracking-wider mb-2 font-semibold">Assets</p>
              {(['savings', 'investments', 'property', 'otherAssets'] as const).map(key => (
                <div key={key} className="flex items-center gap-2 mb-2">
                  <label className="text-xs text-muted-foreground w-28 capitalize">
                    {key === 'otherAssets' ? 'Other Assets' : key.charAt(0).toUpperCase() + key.slice(1)}
                  </label>
                  <Input
                    type="number"
                    value={draft[key] || ''}
                    onChange={e => setDraft(d => ({ ...d, [key]: parseFloat(e.target.value) || 0 }))}
                    className="h-7 text-xs font-mono"
                    placeholder="0"
                  />
                </div>
              ))}
            </div>
            <div>
              <p className="text-xs text-red-400 uppercase tracking-wider mb-2 font-semibold">Liabilities</p>
              {(['creditCards', 'loans', 'mortgage', 'otherLiabilities'] as const).map(key => (
                <div key={key} className="flex items-center gap-2 mb-2">
                  <label className="text-xs text-muted-foreground w-28 capitalize">
                    {key === 'creditCards' ? 'Credit Cards' : key === 'otherLiabilities' ? 'Other' : key.charAt(0).toUpperCase() + key.slice(1)}
                  </label>
                  <Input
                    type="number"
                    value={draft[key] || ''}
                    onChange={e => setDraft(d => ({ ...d, [key]: parseFloat(e.target.value) || 0 }))}
                    className="h-7 text-xs font-mono"
                    placeholder="0"
                  />
                </div>
              ))}
            </div>
            <div className="sm:col-span-2">
              <Button onClick={saveNw} size="sm" className="w-full text-xs">Save Net Worth</Button>
            </div>
          </div>
        )}
      </Card>

      {/* Monthly Summary */}
      <Card>
        <SectionTitle>Monthly Summary — {MONTH_LABELS[now.getMonth()]} {now.getFullYear()}</SectionTitle>
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>Spent</span>
              <span>{formatMoney(totalSpent)}</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className={cn('h-full rounded-full transition-all', totalBudget > 0 && totalSpent > totalBudget ? 'bg-red-500' : 'bg-primary')}
                style={{ width: totalBudget > 0 ? `${Math.min(100, (totalSpent / totalBudget) * 100)}%` : '0%' }}
              />
            </div>
          </div>
          {totalBudget > 0 && (
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Budget</span>
              <span className="text-foreground">{formatMoney(totalBudget)}</span>
            </div>
          )}
          {totalBudget > 0 && (
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Remaining</span>
              <span className={totalBudget - totalSpent >= 0 ? 'text-green-400' : 'text-red-400'}>
                {formatMoney(Math.abs(totalBudget - totalSpent))} {totalBudget - totalSpent < 0 ? 'over' : 'left'}
              </span>
            </div>
          )}
          {totalBudget === 0 && (
            <p className="text-xs text-muted-foreground">Set budgets in the Budget section to see compliance</p>
          )}
        </div>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Spent This Month', value: formatMoney(totalSpent), icon: DollarSign, color: 'text-orange-400' },
          { label: 'Budget Compliance', value: budgetCompliance !== null ? `${budgetCompliance}%` : 'N/A', icon: PiggyBank, color: 'text-green-400' },
          { label: 'Active Bills', value: String(upcomingCount), icon: FileText, color: 'text-blue-400' },
          { label: 'Active Goals', value: String(activeGoals), icon: Target, color: 'text-purple-400' },
        ].map(({ label, value, icon: Icon, color }) => (
          <Card key={label} className="p-3">
            <div className="flex items-center gap-2 mb-1">
              <Icon className={cn('size-3.5', color)} />
              <span className="text-xs text-muted-foreground">{label}</span>
            </div>
            <div className={cn('text-xl font-bold tabular-nums', color)}>{value}</div>
          </Card>
        ))}
      </div>

      {/* 6-Month Spending Trend */}
      <Card>
        <SectionTitle>6-Month Spending Trend</SectionTitle>
        {monthlySpending.every(v => v === 0) ? (
          <p className="text-xs text-muted-foreground">No expense data yet. Add expenses to see your trend.</p>
        ) : (
          <div className="flex items-end gap-2 h-28">
            {monthlySpending.map((val, i) => {
              const heightPct = maxSpending > 0 ? (val / maxSpending) * 100 : 0
              const isCurrentMonth = i === 5
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[9px] text-muted-foreground tabular-nums">{val > 0 ? `$${Math.round(val / 100) / 10}k` : ''}</span>
                  <div className="w-full flex flex-col justify-end" style={{ height: '80px' }}>
                    <div
                      className={cn('w-full rounded-sm transition-all', isCurrentMonth ? 'bg-primary' : 'bg-primary/40')}
                      style={{ height: `${Math.max(heightPct, val > 0 ? 4 : 0)}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-muted-foreground">{monthlyLabels[i]}</span>
                </div>
              )
            })}
          </div>
        )}
      </Card>

      {/* Goals Summary */}
      {goals.length > 0 && (
        <Card>
          <SectionTitle>Goals Progress</SectionTitle>
          <div className="space-y-3">
            {goals.slice(0, 4).map(goal => {
              const pct = goal.target > 0 ? Math.min(100, (goal.current / goal.target) * 100) : 0
              return (
                <div key={goal.id}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-foreground truncate">{goal.name}</span>
                    <span className="text-muted-foreground shrink-0 ml-2">{Math.round(pct)}%</span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      )}
    </div>
  )
}
