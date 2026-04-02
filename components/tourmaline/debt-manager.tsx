'use client'

import { useState, useEffect, useMemo } from 'react'
import { Plus, Trash2, TrendingDown, CreditCard, Home, GraduationCap, Banknote } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const STORAGE_KEY = 'tourmaline-debts'

type DebtType = 'credit_card' | 'loan' | 'mortgage' | 'student'

interface Debt {
  id: string
  name: string
  balance: number
  interestRate: number
  minimumPayment: number
  type: DebtType
}

interface PayoffResult {
  id: string
  name: string
  months: number
  totalInterest: number
  payoffDate: string
}

const TYPE_LABELS: Record<DebtType, string> = {
  credit_card: 'Credit Card',
  loan: 'Loan',
  mortgage: 'Mortgage',
  student: 'Student',
}

const TYPE_ICONS: Record<DebtType, React.ComponentType<{ className?: string }>> = {
  credit_card: CreditCard,
  loan: Banknote,
  mortgage: Home,
  student: GraduationCap,
}

function fmt(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
}

function calcPayoff(debts: Debt[], extraPayment: number, method: 'avalanche' | 'snowball'): PayoffResult[] {
  if (debts.length === 0) return []
  const sorted = [...debts].sort((a, b) =>
    method === 'avalanche' ? b.interestRate - a.interestRate : a.balance - b.balance,
  )
  const balances = sorted.map(d => ({ ...d, remaining: d.balance, totalInterest: 0 }))
  let months = 0
  const results: PayoffResult[] = []
  const maxMonths = 600

  while (balances.some(d => d.remaining > 0) && months < maxMonths) {
    months++
    let snowball = extraPayment
    for (const d of balances) {
      if (d.remaining <= 0) continue
      const interest = (d.remaining * (d.interestRate / 100)) / 12
      d.totalInterest += interest
      d.remaining += interest
      const payment = Math.min(d.minimumPayment + snowball, d.remaining)
      d.remaining -= payment
      if (snowball > 0) snowball = Math.max(0, snowball - (payment - d.minimumPayment))
      if (d.remaining <= 0.01) {
        d.remaining = 0
        const payoffDate = new Date()
        payoffDate.setMonth(payoffDate.getMonth() + months)
        results.push({
          id: d.id,
          name: d.name,
          months,
          totalInterest: d.totalInterest,
          payoffDate: payoffDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        })
        snowball += d.minimumPayment
      }
    }
  }
  return results
}

function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn('bg-card border border-border rounded-md p-4', className)}>{children}</div>
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-3">{children}</h2>
}

const EMPTY_FORM = { name: '', balance: '', interestRate: '', minimumPayment: '', type: 'credit_card' as DebtType }

export function DebtManager() {
  const [debts, setDebts] = useState<Debt[]>([])
  const [form, setForm] = useState({ ...EMPTY_FORM })
  const [showAdd, setShowAdd] = useState(false)
  const [method, setMethod] = useState<'avalanche' | 'snowball'>('avalanche')
  const [extraPayment, setExtraPayment] = useState('0')

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) setDebts(JSON.parse(saved))
    } catch {}
  }, [])

  const persist = (data: Debt[]) => {
    setDebts(data)
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)) } catch {}
  }

  const addDebt = () => {
    const balance = parseFloat(form.balance)
    const rate = parseFloat(form.interestRate)
    const min = parseFloat(form.minimumPayment)
    if (!form.name.trim() || isNaN(balance) || isNaN(rate) || isNaN(min)) return
    persist([...debts, { id: String(Date.now()), name: form.name.trim(), balance, interestRate: rate, minimumPayment: min, type: form.type }])
    setForm({ ...EMPTY_FORM })
    setShowAdd(false)
  }

  const removeDebt = (id: string) => persist(debts.filter(d => d.id !== id))

  const totalDebt = useMemo(() => debts.reduce((s, d) => s + d.balance, 0), [debts])
  const totalMinimum = useMemo(() => debts.reduce((s, d) => s + d.minimumPayment, 0), [debts])
  const payoffResults = useMemo(() => calcPayoff(debts, parseFloat(extraPayment) || 0, method), [debts, extraPayment, method])

  return (
    <div className="space-y-4 font-mono">
      {/* Summary */}
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Total Debt</div>
          <div className="text-2xl font-bold text-destructive tabular-nums">{fmt(totalDebt)}</div>
        </Card>
        <Card>
          <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Monthly Minimum</div>
          <div className="text-2xl font-bold tabular-nums">{fmt(totalMinimum)}</div>
        </Card>
      </div>

      {/* Debt List */}
      <Card>
        <SectionTitle>Debts</SectionTitle>
        {debts.length === 0 ? (
          <div className="text-xs text-muted-foreground text-center py-4">No debts added yet</div>
        ) : (
          <div className="space-y-3">
            {debts.map(d => {
              const Icon = TYPE_ICONS[d.type]
              const maxBar = Math.max(...debts.map(x => x.balance), 1)
              return (
                <div key={d.id} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className="w-3.5 h-3.5 text-muted-foreground" />
                      <div>
                        <div className="text-xs font-semibold">{d.name}</div>
                        <div className="text-[10px] text-muted-foreground">{TYPE_LABELS[d.type]} · {d.interestRate}% APR · Min {fmt(d.minimumPayment)}/mo</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-destructive tabular-nums">{fmt(d.balance)}</span>
                      <button onClick={() => removeDebt(d.id)} className="text-muted-foreground/40 hover:text-destructive transition-colors">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  <div className="h-1.5 bg-border rounded-full overflow-hidden">
                    <div className="h-full bg-destructive/60 rounded-full" style={{ width: `${(d.balance / maxBar) * 100}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {showAdd ? (
          <div className="mt-4 border border-primary/30 rounded-md p-3 space-y-2 bg-primary/5">
            <div className="text-[10px] text-primary uppercase tracking-widest">New Debt</div>
            <Input className="h-8 text-xs font-mono" placeholder="Debt name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            <div className="grid grid-cols-2 gap-2">
              <Input className="h-8 text-xs font-mono" placeholder="Balance ($)" type="number" min="0" value={form.balance} onChange={e => setForm(f => ({ ...f, balance: e.target.value }))} />
              <Input className="h-8 text-xs font-mono" placeholder="Interest (%)" type="number" min="0" step="0.01" value={form.interestRate} onChange={e => setForm(f => ({ ...f, interestRate: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Input className="h-8 text-xs font-mono" placeholder="Min. payment ($)" type="number" min="0" value={form.minimumPayment} onChange={e => setForm(f => ({ ...f, minimumPayment: e.target.value }))} />
              <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as DebtType }))}
                className="h-8 px-2 text-xs font-mono bg-background border border-border rounded-md text-foreground focus:outline-none">
                {(Object.keys(TYPE_LABELS) as DebtType[]).map(t => <option key={t} value={t}>{TYPE_LABELS[t]}</option>)}
              </select>
            </div>
            <div className="flex gap-2">
              <Button size="sm" className="flex-1 h-7 text-xs font-mono" onClick={addDebt} disabled={!form.name || !form.balance || !form.interestRate || !form.minimumPayment}>
                <Plus className="w-3 h-3 mr-1" />Add Debt
              </Button>
              <Button size="sm" variant="ghost" className="h-7 px-3 text-xs font-mono border border-border" onClick={() => { setShowAdd(false); setForm({ ...EMPTY_FORM }) }}>Cancel</Button>
            </div>
          </div>
        ) : (
          <Button size="sm" variant="outline" className="w-full mt-3 h-7 text-xs font-mono" onClick={() => setShowAdd(true)}>
            <Plus className="w-3 h-3 mr-1" />Add Debt
          </Button>
        )}
      </Card>

      {/* Payoff Calculator */}
      <Card>
        <SectionTitle>Payoff Calculator</SectionTitle>
        <div className="flex gap-2 mb-3">
          {(['avalanche', 'snowball'] as const).map(m => (
            <button key={m} onClick={() => setMethod(m)}
              className={cn('flex-1 py-1.5 text-xs font-mono rounded border transition-colors',
                method === m ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:border-primary/40')}>
              {m === 'avalanche' ? '⚡ Avalanche' : '❄️ Snowball'}
            </button>
          ))}
        </div>
        <div className="mb-3">
          <label className="text-[10px] text-muted-foreground uppercase tracking-wider block mb-1">Extra Monthly Payment</label>
          <Input className="h-8 text-xs font-mono" placeholder="0" type="number" min="0" value={extraPayment} onChange={e => setExtraPayment(e.target.value)} />
        </div>
        <div className="text-[10px] text-muted-foreground mb-2 uppercase tracking-wider">
          {method === 'avalanche' ? 'Highest rate paid first — minimizes total interest' : 'Lowest balance paid first — builds momentum'}
        </div>
        {payoffResults.length === 0 ? (
          <div className="text-xs text-muted-foreground text-center py-3">Add debts to see payoff plan</div>
        ) : (
          <div className="space-y-2">
            {payoffResults.map(r => (
              <div key={r.id} className="flex items-center justify-between text-xs border border-border rounded-sm px-3 py-2">
                <div>
                  <div className="font-semibold">{r.name}</div>
                  <div className="text-[10px] text-muted-foreground">{r.months} mo · {fmt(r.totalInterest)} interest</div>
                </div>
                <div className="text-right">
                  <div className="font-mono font-bold text-primary">{r.payoffDate}</div>
                </div>
              </div>
            ))}
            <div className="flex items-center justify-between text-xs pt-1 text-muted-foreground border-t border-border mt-2">
              <span>Total interest paid</span>
              <span className="font-bold text-destructive tabular-nums">{fmt(payoffResults.reduce((s, r) => s + r.totalInterest, 0))}</span>
            </div>
          </div>
        )}
      </Card>

      <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
        <TrendingDown className="w-3 h-3" />
        <span>Tip: Avalanche saves the most interest. Snowball provides psychological wins.</span>
      </div>
    </div>
  )
}
