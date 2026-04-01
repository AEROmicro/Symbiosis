'use client'

import { useState, useEffect, useMemo } from 'react'
import { Plus, Trash2, CheckCircle2, Circle, FileText, AlertTriangle, Home, Zap, Shield, Tv, Landmark, HelpCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

type BillCategory = 'Housing' | 'Utilities' | 'Insurance' | 'Subscriptions' | 'Loans' | 'Other'
type BillFrequency = 'Monthly' | 'Quarterly' | 'Annual'
type BillStatus = 'active' | 'paused'

interface Bill {
  id: string
  name: string
  amount: number
  dueDay: number
  category: BillCategory
  frequency: BillFrequency
  status: BillStatus
  paidMonths: string[]
}

const BILL_CATEGORIES: BillCategory[] = ['Housing', 'Utilities', 'Insurance', 'Subscriptions', 'Loans', 'Other']

const CAT_META: Record<BillCategory, { icon: React.ComponentType<{ className?: string }>; color: string }> = {
  Housing:       { icon: Home,      color: 'text-purple-400' },
  Utilities:     { icon: Zap,       color: 'text-cyan-400' },
  Insurance:     { icon: Shield,    color: 'text-green-400' },
  Subscriptions: { icon: Tv,        color: 'text-pink-400' },
  Loans:         { icon: Landmark,  color: 'text-orange-400' },
  Other:         { icon: HelpCircle, color: 'text-gray-400' },
}

function formatMoney(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(n)
}

function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn('bg-card border border-border rounded-md p-4', className)}>{children}</div>
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-3">{children}</h2>
}

function getDaysUntil(dueDay: number): number {
  const now = new Date()
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), dueDay)
  if (thisMonth < now) {
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, dueDay)
    return Math.ceil((nextMonth.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  }
  return Math.ceil((thisMonth.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
}

function currentMonthKey() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

const EMPTY_FORM = { name: '', amount: '', dueDay: '1', category: 'Housing' as BillCategory, frequency: 'Monthly' as BillFrequency, status: 'active' as BillStatus }

export function BillsTracker() {
  const [bills, setBills] = useState<Bill[]>([])
  const [form, setForm] = useState({ ...EMPTY_FORM })
  const [showAdd, setShowAdd] = useState(false)

  useEffect(() => {
    try {
      const saved = localStorage.getItem('tourmaline-bills')
      if (saved) setBills(JSON.parse(saved))
    } catch {}
  }, [])

  const persist = (data: Bill[]) => {
    setBills(data)
    localStorage.setItem('tourmaline-bills', JSON.stringify(data))
  }

  const addBill = () => {
    const amount = parseFloat(form.amount)
    const dueDay = parseInt(form.dueDay)
    if (!form.name.trim() || !amount || amount <= 0 || isNaN(dueDay) || dueDay < 1 || dueDay > 28) return
    const bill: Bill = {
      id: `${Date.now()}-${Math.random()}`,
      name: form.name.trim(),
      amount,
      dueDay,
      category: form.category,
      frequency: form.frequency,
      status: form.status,
      paidMonths: [],
    }
    persist([...bills, bill])
    setForm({ ...EMPTY_FORM })
    setShowAdd(false)
  }

  const deleteBill = (id: string) => persist(bills.filter(b => b.id !== id))

  const togglePaid = (id: string) => {
    const mk = currentMonthKey()
    persist(bills.map(b => {
      if (b.id !== id) return b
      const already = b.paidMonths.includes(mk)
      return { ...b, paidMonths: already ? b.paidMonths.filter(m => m !== mk) : [...b.paidMonths, mk] }
    }))
  }

  const toggleStatus = (id: string) => {
    persist(bills.map(b => b.id !== id ? b : { ...b, status: b.status === 'active' ? 'paused' : 'active' }))
  }

  const mk = currentMonthKey()
  const activeBills = bills.filter(b => b.status === 'active')
  const monthlyTotal = activeBills.reduce((s, b) => {
    if (b.frequency === 'Monthly') return s + b.amount
    if (b.frequency === 'Quarterly') return s + b.amount / 3
    return s + b.amount / 12
  }, 0)

  const sorted = useMemo(() =>
    [...bills].sort((a, b) => getDaysUntil(a.dueDay) - getDaysUntil(b.dueDay)),
    [bills]
  )

  const upcomingWeek = sorted.filter(b => b.status === 'active' && getDaysUntil(b.dueDay) <= 7)

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
            <FileText className="size-5 text-primary" />
            Bills & Subscriptions
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">Track recurring payments</p>
        </div>
        <Button size="sm" className="text-xs h-8" onClick={() => setShowAdd(v => !v)}>
          <Plus className="size-3.5 mr-1" /> Add Bill
        </Button>
      </div>

      {/* Add Bill Form */}
      {showAdd && (
        <Card>
          <SectionTitle>New Bill / Subscription</SectionTitle>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <Input
              placeholder="Name (e.g. Netflix)"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className="text-xs h-8 font-mono"
            />
            <Input
              type="number"
              placeholder="Amount"
              value={form.amount}
              onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
              className="text-xs h-8 font-mono"
              min="0"
              step="0.01"
            />
            <Input
              type="number"
              placeholder="Due day (1-28)"
              value={form.dueDay}
              onChange={e => setForm(f => ({ ...f, dueDay: e.target.value }))}
              className="text-xs h-8 font-mono"
              min="1"
              max="28"
            />
            <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v as BillCategory }))}>
              <SelectTrigger className="h-8 text-xs font-mono">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="font-mono text-xs">
                {BILL_CATEGORIES.map(c => <SelectItem key={c} value={c} className="text-xs">{c}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={form.frequency} onValueChange={v => setForm(f => ({ ...f, frequency: v as BillFrequency }))}>
              <SelectTrigger className="h-8 text-xs font-mono">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="font-mono text-xs">
                {(['Monthly', 'Quarterly', 'Annual'] as BillFrequency[]).map(f => (
                  <SelectItem key={f} value={f} className="text-xs">{f}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v as BillStatus }))}>
              <SelectTrigger className="h-8 text-xs font-mono">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="font-mono text-xs">
                <SelectItem value="active" className="text-xs">Active</SelectItem>
                <SelectItem value="paused" className="text-xs">Paused</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2 mt-3">
            <Button onClick={addBill} size="sm" className="text-xs h-8">Save Bill</Button>
            <Button onClick={() => setShowAdd(false)} variant="outline" size="sm" className="text-xs h-8">Cancel</Button>
          </div>
        </Card>
      )}

      {/* Monthly total */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="p-3">
          <p className="text-xs text-muted-foreground mb-1">Monthly Total</p>
          <p className="text-lg font-bold text-foreground tabular-nums">{formatMoney(monthlyTotal)}</p>
        </Card>
        <Card className="p-3">
          <p className="text-xs text-muted-foreground mb-1">Active Bills</p>
          <p className="text-lg font-bold text-foreground tabular-nums">{activeBills.length}</p>
        </Card>
        <Card className="p-3">
          <p className="text-xs text-muted-foreground mb-1">Due This Week</p>
          <p className={cn('text-lg font-bold tabular-nums', upcomingWeek.length > 0 ? 'text-yellow-400' : 'text-foreground')}>
            {upcomingWeek.length}
          </p>
        </Card>
      </div>

      {/* Upcoming this week */}
      {upcomingWeek.length > 0 && (
        <Card className="border-yellow-500/30 bg-yellow-500/5">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="size-4 text-yellow-400" />
            <SectionTitle>Due This Week</SectionTitle>
          </div>
          <div className="space-y-2">
            {upcomingWeek.map(b => {
              const days = getDaysUntil(b.dueDay)
              const paid = b.paidMonths.includes(mk)
              const { icon: Icon, color } = CAT_META[b.category]
              return (
                <div key={b.id} className="flex items-center gap-3 text-xs">
                  <Icon className={cn('size-4 shrink-0', color)} />
                  <span className="flex-1 text-foreground">{b.name}</span>
                  <span className={cn('font-semibold', days === 0 ? 'text-red-400' : 'text-yellow-400')}>
                    {days === 0 ? 'Today' : `${days}d`}
                  </span>
                  <span className="text-foreground tabular-nums">{formatMoney(b.amount)}</span>
                  <button
                    onClick={() => togglePaid(b.id)}
                    className={paid ? 'text-green-400' : 'text-muted-foreground hover:text-green-400'}
                  >
                    {paid ? <CheckCircle2 className="size-4" /> : <Circle className="size-4" />}
                  </button>
                </div>
              )
            })}
          </div>
        </Card>
      )}

      {/* All Bills */}
      <Card>
        <SectionTitle>All Bills</SectionTitle>
        {sorted.length === 0 ? (
          <p className="text-xs text-muted-foreground py-4 text-center">No bills added yet. Click "Add Bill" to get started.</p>
        ) : (
          <div className="space-y-2">
            {sorted.map(bill => {
              const days = getDaysUntil(bill.dueDay)
              const paid = bill.paidMonths.includes(mk)
              const { icon: Icon, color } = CAT_META[bill.category]
              const dueSoon = bill.status === 'active' && days <= 3
              return (
                <div
                  key={bill.id}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-md border text-xs group',
                    bill.status === 'paused' ? 'opacity-50 border-border' : dueSoon ? 'border-yellow-500/30 bg-yellow-500/5' : 'border-border hover:bg-accent/30'
                  )}
                >
                  <Icon className={cn('size-4 shrink-0', color)} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={cn('text-foreground', bill.status === 'paused' && 'line-through')}>{bill.name}</span>
                      <span className="text-muted-foreground/60 text-[10px]">{bill.frequency}</span>
                      {bill.status === 'paused' && <span className="text-[10px] text-muted-foreground bg-muted px-1 rounded">paused</span>}
                    </div>
                    <p className="text-muted-foreground text-[10px]">{bill.category} · Day {bill.dueDay}</p>
                  </div>
                  {bill.status === 'active' && (
                    <span className={cn('text-[10px] px-1.5 py-0.5 rounded font-semibold',
                      days <= 3 ? 'bg-red-500/20 text-red-400' :
                      days <= 7 ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-muted text-muted-foreground'
                    )}>
                      {days === 0 ? 'Today' : `${days}d`}
                    </span>
                  )}
                  <span className="text-foreground tabular-nums font-semibold">{formatMoney(bill.amount)}</span>
                  <button
                    onClick={() => togglePaid(bill.id)}
                    className={cn('transition-colors', paid ? 'text-green-400' : 'text-muted-foreground hover:text-green-400')}
                    title={paid ? 'Mark unpaid' : 'Mark paid'}
                  >
                    {paid ? <CheckCircle2 className="size-4" /> : <Circle className="size-4" />}
                  </button>
                  <button
                    onClick={() => toggleStatus(bill.id)}
                    className="opacity-0 group-hover:opacity-100 text-xs text-muted-foreground hover:text-foreground transition-opacity"
                    title={bill.status === 'active' ? 'Pause' : 'Activate'}
                  >
                    {bill.status === 'active' ? '⏸' : '▶'}
                  </button>
                  <button
                    onClick={() => deleteBill(bill.id)}
                    className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-400 transition-opacity"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </Card>
    </div>
  )
}
