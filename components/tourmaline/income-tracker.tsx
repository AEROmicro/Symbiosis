'use client'

import { useState, useEffect, useMemo } from 'react'
import { Plus, Trash2, Download, TrendingUp, Briefcase, Building2, BarChart3, Gift, Circle, DollarSign } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export type IncomeCategory = 'Salary' | 'Freelance' | 'Investment' | 'Rental' | 'Gift' | 'Other'

export interface Income {
  id: string
  amount: number
  category: IncomeCategory
  description: string
  date: string
}

const CATEGORIES: IncomeCategory[] = ['Salary', 'Freelance', 'Investment', 'Rental', 'Gift', 'Other']

const CATEGORY_META: Record<IncomeCategory, { color: string; bg: string; icon: React.ComponentType<{ className?: string }> }> = {
  Salary:     { color: 'text-green-400',  bg: 'bg-green-400',  icon: Briefcase  },
  Freelance:  { color: 'text-blue-400',   bg: 'bg-blue-400',   icon: TrendingUp },
  Investment: { color: 'text-purple-400', bg: 'bg-purple-400', icon: BarChart3  },
  Rental:     { color: 'text-orange-400', bg: 'bg-orange-400', icon: Building2  },
  Gift:       { color: 'text-pink-400',   bg: 'bg-pink-400',   icon: Gift       },
  Other:      { color: 'text-gray-400',   bg: 'bg-gray-400',   icon: Circle     },
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

export function IncomeTracker() {
  const [income, setIncome] = useState<Income[]>([])
  const [form, setForm] = useState({ amount: '', category: 'Salary' as IncomeCategory, description: '', date: today() })
  const [filterMonth, setFilterMonth] = useState(MONTHS[0].value)
  const [filterCat, setFilterCat] = useState<'All' | IncomeCategory>('All')

  useEffect(() => {
    try {
      const saved = localStorage.getItem('tourmaline-income')
      if (saved) setIncome(JSON.parse(saved))
    } catch {}
  }, [])

  const persist = (data: Income[]) => {
    setIncome(data)
    localStorage.setItem('tourmaline-income', JSON.stringify(data))
  }

  const addIncome = () => {
    const amount = parseFloat(form.amount)
    if (!amount || amount <= 0 || !form.date) return
    const entry: Income = {
      id: `${Date.now()}-${Math.random()}`,
      amount,
      category: form.category,
      description: form.description.trim() || form.category,
      date: form.date,
    }
    persist([entry, ...income])
    setForm(f => ({ ...f, amount: '', description: '' }))
  }

  const deleteIncome = (id: string) => persist(income.filter(e => e.id !== id))

  const filtered = useMemo(() => {
    return income.filter(e => {
      const monthMatch = e.date.startsWith(filterMonth)
      const catMatch = filterCat === 'All' || e.category === filterCat
      return monthMatch && catMatch
    }).sort((a, b) => b.date.localeCompare(a.date))
  }, [income, filterMonth, filterCat])

  const catTotals = useMemo(() => {
    const totals: Record<string, number> = {}
    filtered.forEach(e => { totals[e.category] = (totals[e.category] || 0) + e.amount })
    return Object.entries(totals).sort((a, b) => b[1] - a[1])
  }, [filtered])

  const totalFiltered = filtered.reduce((s, e) => s + e.amount, 0)

  // 6-month trend
  const monthlyIncome: number[] = []
  const monthlyLabels: string[] = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    monthlyLabels.push(MONTH_LABELS[d.getMonth()])
    monthlyIncome.push(income.filter(e => e.date.startsWith(key)).reduce((s, e) => s + e.amount, 0))
  }
  const maxIncome = Math.max(...monthlyIncome, 1)

  // Group by date
  const grouped = useMemo(() => {
    const map: Record<string, Income[]> = {}
    filtered.forEach(e => { ;(map[e.date] = map[e.date] || []).push(e) })
    return Object.entries(map).sort((a, b) => b[0].localeCompare(a[0]))
  }, [filtered])

  const exportCSV = () => {
    const rows = [['Date', 'Category', 'Description', 'Amount']]
    filtered.forEach(e => rows.push([e.date, e.category, `"${e.description}"`, String(e.amount)]))
    const csv = rows.map(r => r.join(',')).join('\n')
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
    a.download = `income-${filterMonth}.csv`
    a.click()
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
          <DollarSign className="size-5 text-primary" />
          Income Tracker
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">Track your income sources</p>
      </div>

      {/* Add Income */}
      <Card>
        <SectionTitle>Add Income</SectionTitle>
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
          <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v as IncomeCategory }))}>
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
        <Button onClick={addIncome} size="sm" className="mt-2 h-8 text-xs w-full sm:w-auto">
          <Plus className="size-3.5 mr-1" /> Add Income
        </Button>
      </Card>

      {/* Category Breakdown */}
      {catTotals.length > 0 && (
        <Card>
          <SectionTitle>Category Breakdown</SectionTitle>
          <div className="space-y-2">
            {catTotals.map(([cat, total]) => {
              const meta = CATEGORY_META[cat as IncomeCategory]
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

      {/* 6-Month Trend */}
      {monthlyIncome.some(v => v > 0) && (
        <Card>
          <SectionTitle>6-Month Income Trend</SectionTitle>
          <div className="flex items-end gap-2 h-28">
            {monthlyIncome.map((val, i) => {
              const heightPct = maxIncome > 0 ? (val / maxIncome) * 100 : 0
              const isCurrentMonth = i === 5
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[9px] text-muted-foreground tabular-nums">{val > 0 ? `$${Math.round(val / 100) / 10}k` : ''}</span>
                  <div className="w-full flex flex-col justify-end" style={{ height: '80px' }}>
                    <div
                      className={cn('w-full rounded-sm transition-all', isCurrentMonth ? 'bg-green-500' : 'bg-green-500/40')}
                      style={{ height: `${Math.max(heightPct, val > 0 ? 4 : 0)}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-muted-foreground">{monthlyLabels[i]}</span>
                </div>
              )
            })}
          </div>
        </Card>
      )}

      {/* Filters + List */}
      <Card>
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <SectionTitle>Income Entries</SectionTitle>
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
            <Select value={filterCat} onValueChange={v => setFilterCat(v as 'All' | IncomeCategory)}>
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
          <p className="text-xs text-muted-foreground py-4 text-center">No income entries found. Add your first income entry above.</p>
        ) : (
          <div className="space-y-4 max-h-[520px] overflow-y-auto pr-1">
            {grouped.map(([date, items]) => (
              <div key={date}>
                <p className="text-xs text-muted-foreground mb-1.5 sticky top-0 bg-card py-0.5">
                  {new Date(date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                  <span className="ml-2 text-green-400">{formatMoney(items.reduce((s, e) => s + e.amount, 0))}</span>
                </p>
                <div className="space-y-1">
                  {items.map(entry => {
                    const meta = CATEGORY_META[entry.category]
                    const Icon = meta.icon
                    return (
                      <div key={entry.id} className="flex items-center gap-2 px-2 py-1.5 rounded bg-background/50 hover:bg-accent/30 group">
                        <div className={cn('size-6 rounded flex items-center justify-center shrink-0', meta.bg + '/20')}>
                          <Icon className={cn('size-3', meta.color)} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-foreground truncate">{entry.description}</p>
                          <p className={cn('text-[10px]', meta.color)}>{entry.category}</p>
                        </div>
                        <span className="text-xs font-semibold tabular-nums text-green-400">{formatMoney(entry.amount)}</span>
                        <button
                          onClick={() => deleteIncome(entry.id)}
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
