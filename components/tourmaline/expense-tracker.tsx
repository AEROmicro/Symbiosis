'use client'

import { useState, useEffect, useMemo } from 'react'
import { Plus, Trash2, Download, Filter, UtensilsCrossed, Car, Home, HeartPulse, Film, ShoppingBag, Zap, Circle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export type ExpenseCategory = 'Food' | 'Transport' | 'Housing' | 'Healthcare' | 'Entertainment' | 'Shopping' | 'Utilities' | 'Other'

export interface Expense {
  id: string
  amount: number
  category: ExpenseCategory
  description: string
  date: string
}

const CATEGORIES: ExpenseCategory[] = ['Food', 'Transport', 'Housing', 'Healthcare', 'Entertainment', 'Shopping', 'Utilities', 'Other']

const CATEGORY_META: Record<ExpenseCategory, { color: string; bg: string; icon: React.ComponentType<{ className?: string }> }> = {
  Food:          { color: 'text-orange-400',  bg: 'bg-orange-400',  icon: UtensilsCrossed },
  Transport:     { color: 'text-blue-400',    bg: 'bg-blue-400',    icon: Car },
  Housing:       { color: 'text-purple-400',  bg: 'bg-purple-400',  icon: Home },
  Healthcare:    { color: 'text-green-400',   bg: 'bg-green-400',   icon: HeartPulse },
  Entertainment: { color: 'text-pink-400',    bg: 'bg-pink-400',    icon: Film },
  Shopping:      { color: 'text-yellow-400',  bg: 'bg-yellow-400',  icon: ShoppingBag },
  Utilities:     { color: 'text-cyan-400',    bg: 'bg-cyan-400',    icon: Zap },
  Other:         { color: 'text-gray-400',    bg: 'bg-gray-400',    icon: Circle },
}

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function formatMoney(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(n)
}

function today() {
  return new Date().toISOString().split('T')[0]
}

function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn('bg-card border border-border rounded-md p-4', className)}>{children}</div>
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-3">{children}</h2>
}

const now = new Date()
const MONTHS = Array.from({ length: 12 }, (_, i) => {
  const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
  return { value: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`, label: `${MONTH_LABELS[d.getMonth()]} ${d.getFullYear()}` }
})

export function ExpenseTracker() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [form, setForm] = useState({ amount: '', category: 'Food' as ExpenseCategory, description: '', date: today() })
  const [filterMonth, setFilterMonth] = useState(MONTHS[0].value)
  const [filterCat, setFilterCat] = useState<'All' | ExpenseCategory>('All')

  useEffect(() => {
    try {
      const saved = localStorage.getItem('tourmaline-expenses')
      if (saved) setExpenses(JSON.parse(saved))
    } catch {}
  }, [])

  const persist = (data: Expense[]) => {
    setExpenses(data)
    localStorage.setItem('tourmaline-expenses', JSON.stringify(data))
  }

  const addExpense = () => {
    const amount = parseFloat(form.amount)
    if (!amount || amount <= 0 || !form.date) return
    const entry: Expense = {
      id: `${Date.now()}-${Math.random()}`,
      amount,
      category: form.category,
      description: form.description.trim() || form.category,
      date: form.date,
    }
    persist([entry, ...expenses])
    setForm(f => ({ ...f, amount: '', description: '' }))
  }

  const deleteExpense = (id: string) => persist(expenses.filter(e => e.id !== id))

  const filtered = useMemo(() => {
    return expenses.filter(e => {
      const monthMatch = e.date.startsWith(filterMonth)
      const catMatch = filterCat === 'All' || e.category === filterCat
      return monthMatch && catMatch
    }).sort((a, b) => b.date.localeCompare(a.date))
  }, [expenses, filterMonth, filterCat])

  // Category breakdown for filtered
  const catTotals = useMemo(() => {
    const totals: Record<string, number> = {}
    filtered.forEach(e => { totals[e.category] = (totals[e.category] || 0) + e.amount })
    return Object.entries(totals).sort((a, b) => b[1] - a[1])
  }, [filtered])
  const totalFiltered = filtered.reduce((s, e) => s + e.amount, 0)

  // Group by date
  const grouped = useMemo(() => {
    const map: Record<string, Expense[]> = {}
    filtered.forEach(e => { ;(map[e.date] = map[e.date] || []).push(e) })
    return Object.entries(map).sort((a, b) => b[0].localeCompare(a[0]))
  }, [filtered])

  const exportCSV = () => {
    const rows = [['Date', 'Category', 'Description', 'Amount']]
    filtered.forEach(e => rows.push([e.date, e.category, `"${e.description}"`, String(e.amount)]))
    const csv = rows.map(r => r.join(',')).join('\n')
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
    a.download = `expenses-${filterMonth}.csv`
    a.click()
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
          <ShoppingBag className="size-5 text-primary" />
          Expense Tracker
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">Track your daily spending</p>
      </div>

      {/* Add Expense */}
      <Card>
        <SectionTitle>Add Expense</SectionTitle>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <Input
            type="number"
            placeholder="Amount"
            value={form.amount}
            onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
            className="text-xs font-mono h-8"
            min="0"
            step="0.01"
          />
          <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v as ExpenseCategory }))}>
            <SelectTrigger className="h-8 text-xs font-mono">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="font-mono text-xs">
              {CATEGORIES.map(c => (
                <SelectItem key={c} value={c} className="text-xs">
                  <span className={CATEGORY_META[c].color}>{c}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            placeholder="Description"
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            className="text-xs font-mono h-8"
          />
          <Input
            type="date"
            value={form.date}
            onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
            className="text-xs font-mono h-8"
          />
        </div>
        <Button onClick={addExpense} size="sm" className="mt-2 h-8 text-xs w-full sm:w-auto">
          <Plus className="size-3.5 mr-1" /> Add Expense
        </Button>
      </Card>

      {/* Category Breakdown */}
      {catTotals.length > 0 && (
        <Card>
          <SectionTitle>Category Breakdown</SectionTitle>
          <div className="space-y-2">
            {catTotals.map(([cat, total]) => {
              const meta = CATEGORY_META[cat as ExpenseCategory]
              const Icon = meta.icon
              const pct = totalFiltered > 0 ? (total / totalFiltered) * 100 : 0
              return (
                <div key={cat} className="flex items-center gap-2 text-xs">
                  <Icon className={cn('size-3.5 shrink-0', meta.color)} />
                  <span className="w-24 text-muted-foreground">{cat}</span>
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div className={cn('h-full rounded-full', meta.bg)} style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-muted-foreground w-8 text-right">{Math.round(pct)}%</span>
                  <span className={cn('w-20 text-right tabular-nums', meta.color)}>{formatMoney(total)}</span>
                </div>
              )
            })}
            <div className="border-t border-border pt-2 flex justify-between text-xs font-semibold">
              <span className="text-muted-foreground">Total</span>
              <span className="text-foreground tabular-nums">{formatMoney(totalFiltered)}</span>
            </div>
          </div>
        </Card>
      )}

      {/* Filters + List */}
      <Card>
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <SectionTitle>Expenses</SectionTitle>
          <div className="flex flex-wrap gap-2 ml-auto">
            <Select value={filterMonth} onValueChange={setFilterMonth}>
              <SelectTrigger className="h-7 text-xs font-mono w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="font-mono text-xs">
                {MONTHS.map(m => (
                  <SelectItem key={m.value} value={m.value} className="text-xs">{m.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterCat} onValueChange={v => setFilterCat(v as 'All' | ExpenseCategory)}>
              <SelectTrigger className="h-7 text-xs font-mono w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="font-mono text-xs">
                <SelectItem value="All" className="text-xs">All Categories</SelectItem>
                {CATEGORIES.map(c => (
                  <SelectItem key={c} value={c} className="text-xs">{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {filtered.length > 0 && (
              <Button variant="outline" size="sm" onClick={exportCSV} className="h-7 text-xs gap-1">
                <Download className="size-3" /> CSV
              </Button>
            )}
          </div>
        </div>

        {grouped.length === 0 ? (
          <p className="text-xs text-muted-foreground py-4 text-center">No expenses found. Add your first expense above.</p>
        ) : (
          <div className="space-y-4 max-h-[520px] overflow-y-auto pr-1">
            {grouped.map(([date, items]) => (
              <div key={date}>
                <p className="text-xs text-muted-foreground mb-1.5 sticky top-0 bg-card py-0.5">
                  {new Date(date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                  <span className="ml-2 text-foreground">{formatMoney(items.reduce((s, e) => s + e.amount, 0))}</span>
                </p>
                <div className="space-y-1">
                  {items.map(exp => {
                    const meta = CATEGORY_META[exp.category]
                    const Icon = meta.icon
                    return (
                      <div key={exp.id} className="flex items-center gap-2 px-2 py-1.5 rounded bg-background/50 hover:bg-accent/30 group">
                        <div className={cn('size-6 rounded flex items-center justify-center shrink-0', meta.bg + '/20')}>
                          <Icon className={cn('size-3', meta.color)} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-foreground truncate">{exp.description}</p>
                          <p className={cn('text-[10px]', meta.color)}>{exp.category}</p>
                        </div>
                        <span className="text-xs font-semibold tabular-nums text-foreground">{formatMoney(exp.amount)}</span>
                        <button
                          onClick={() => deleteExpense(exp.id)}
                          className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-400 transition-opacity ml-1"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
