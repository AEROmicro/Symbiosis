'use client'

import { useState, useEffect, useMemo } from 'react'
import { Plus, Trash2, TrendingUp, TrendingDown, PieChart } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const STORAGE_KEY = 'tourmaline-investments'

type AssetClass = 'stocks' | 'etf' | 'crypto' | 'bonds' | 'real_estate' | 'cash'

interface Investment {
  id: string
  symbol: string
  name: string
  shares: number
  purchasePrice: number
  currentValue: number
  assetClass: AssetClass
}

const CLASS_LABELS: Record<AssetClass, string> = {
  stocks: 'Stocks',
  etf: 'ETFs',
  crypto: 'Crypto',
  bonds: 'Bonds',
  real_estate: 'Real Estate',
  cash: 'Cash',
}

const CLASS_COLORS: Record<AssetClass, string> = {
  stocks: 'bg-blue-500',
  etf: 'bg-purple-500',
  crypto: 'bg-orange-500',
  bonds: 'bg-green-500',
  real_estate: 'bg-yellow-500',
  cash: 'bg-slate-400',
}

function fmt(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(n)
}

function fmtCompact(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
}

function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn('bg-card border border-border rounded-md p-4', className)}>{children}</div>
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-3">{children}</h2>
}

const EMPTY_FORM = {
  symbol: '',
  name: '',
  shares: '',
  purchasePrice: '',
  currentValue: '',
  assetClass: 'stocks' as AssetClass,
}

export function InvestmentTracker() {
  const [investments, setInvestments] = useState<Investment[]>([])
  const [form, setForm] = useState({ ...EMPTY_FORM })
  const [showAdd, setShowAdd] = useState(false)

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) setInvestments(JSON.parse(saved))
    } catch {}
  }, [])

  const persist = (data: Investment[]) => {
    setInvestments(data)
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)) } catch {}
  }

  const addInvestment = () => {
    const shares = parseFloat(form.shares)
    const pp = parseFloat(form.purchasePrice)
    const cv = parseFloat(form.currentValue)
    if (!form.symbol.trim() || isNaN(shares) || isNaN(pp) || isNaN(cv)) return
    persist([...investments, {
      id: String(Date.now()),
      symbol: form.symbol.trim().toUpperCase(),
      name: form.name.trim() || form.symbol.trim().toUpperCase(),
      shares, purchasePrice: pp, currentValue: cv, assetClass: form.assetClass,
    }])
    setForm({ ...EMPTY_FORM })
    setShowAdd(false)
  }

  const removeInvestment = (id: string) => persist(investments.filter(i => i.id !== id))

  const summary = useMemo(() => {
    const totalValue = investments.reduce((s, i) => s + i.currentValue, 0)
    const totalCost = investments.reduce((s, i) => s + (i.purchasePrice * i.shares), 0)
    const totalGain = totalValue - totalCost
    const pctReturn = totalCost > 0 ? (totalGain / totalCost) * 100 : 0
    return { totalValue, totalCost, totalGain, pctReturn }
  }, [investments])

  const allocation = useMemo(() => {
    const totals: Partial<Record<AssetClass, number>> = {}
    for (const inv of investments) {
      totals[inv.assetClass] = (totals[inv.assetClass] ?? 0) + inv.currentValue
    }
    return totals
  }, [investments])

  const totalValue = summary.totalValue

  return (
    <div className="space-y-4 font-mono">
      {/* Portfolio Summary */}
      <div className="grid grid-cols-3 gap-3">
        <Card>
          <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Portfolio Value</div>
          <div className="text-xl font-bold tabular-nums">{fmtCompact(summary.totalValue)}</div>
        </Card>
        <Card>
          <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Total Gain/Loss</div>
          <div className={cn('text-xl font-bold tabular-nums flex items-center gap-1', summary.totalGain >= 0 ? 'text-green-500' : 'text-destructive')}>
            {summary.totalGain >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            {fmt(Math.abs(summary.totalGain))}
          </div>
        </Card>
        <Card>
          <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Return</div>
          <div className={cn('text-xl font-bold tabular-nums', summary.pctReturn >= 0 ? 'text-green-500' : 'text-destructive')}>
            {summary.pctReturn >= 0 ? '+' : ''}{summary.pctReturn.toFixed(2)}%
          </div>
        </Card>
      </div>

      {/* Holdings */}
      <Card>
        <SectionTitle>Holdings</SectionTitle>
        {investments.length === 0 ? (
          <div className="text-xs text-muted-foreground text-center py-4">No investments added yet</div>
        ) : (
          <div className="space-y-2">
            {investments.map(inv => {
              const cost = inv.purchasePrice * inv.shares
              const gain = inv.currentValue - cost
              const pct = cost > 0 ? (gain / cost) * 100 : 0
              return (
                <div key={inv.id} className="flex items-center justify-between text-xs border border-border rounded-sm px-3 py-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold">{inv.symbol}</span>
                      <span className={cn('text-[9px] px-1.5 py-0.5 rounded-sm font-semibold text-white', CLASS_COLORS[inv.assetClass])}>{CLASS_LABELS[inv.assetClass]}</span>
                    </div>
                    <div className="text-[10px] text-muted-foreground">{inv.name} · {inv.shares} shares @ {fmt(inv.purchasePrice)}</div>
                  </div>
                  <div className="text-right flex items-center gap-2">
                    <div>
                      <div className="font-bold tabular-nums">{fmt(inv.currentValue)}</div>
                      <div className={cn('text-[10px] tabular-nums', gain >= 0 ? 'text-green-500' : 'text-destructive')}>
                        {gain >= 0 ? '+' : ''}{fmt(gain)} ({pct.toFixed(1)}%)
                      </div>
                    </div>
                    <button onClick={() => removeInvestment(inv.id)} className="text-muted-foreground/40 hover:text-destructive transition-colors ml-1">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {showAdd ? (
          <div className="mt-4 border border-primary/30 rounded-md p-3 space-y-2 bg-primary/5">
            <div className="text-[10px] text-primary uppercase tracking-widest">New Investment</div>
            <div className="grid grid-cols-2 gap-2">
              <Input className="h-8 text-xs font-mono" placeholder="Symbol (e.g. AAPL)" value={form.symbol} onChange={e => setForm(f => ({ ...f, symbol: e.target.value }))} />
              <Input className="h-8 text-xs font-mono" placeholder="Name (optional)" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <Input className="h-8 text-xs font-mono" placeholder="Shares" type="number" min="0" step="any" value={form.shares} onChange={e => setForm(f => ({ ...f, shares: e.target.value }))} />
              <Input className="h-8 text-xs font-mono" placeholder="Buy price ($)" type="number" min="0" step="any" value={form.purchasePrice} onChange={e => setForm(f => ({ ...f, purchasePrice: e.target.value }))} />
              <Input className="h-8 text-xs font-mono" placeholder="Current value ($)" type="number" min="0" step="any" value={form.currentValue} onChange={e => setForm(f => ({ ...f, currentValue: e.target.value }))} />
            </div>
            <select value={form.assetClass} onChange={e => setForm(f => ({ ...f, assetClass: e.target.value as AssetClass }))}
              className="w-full h-8 px-2 text-xs font-mono bg-background border border-border rounded-md text-foreground focus:outline-none">
              {(Object.keys(CLASS_LABELS) as AssetClass[]).map(c => <option key={c} value={c}>{CLASS_LABELS[c]}</option>)}
            </select>
            <div className="flex gap-2">
              <Button size="sm" className="flex-1 h-7 text-xs font-mono" onClick={addInvestment} disabled={!form.symbol || !form.shares || !form.purchasePrice || !form.currentValue}>
                <Plus className="w-3 h-3 mr-1" />Add Investment
              </Button>
              <Button size="sm" variant="ghost" className="h-7 px-3 text-xs font-mono border border-border" onClick={() => { setShowAdd(false); setForm({ ...EMPTY_FORM }) }}>Cancel</Button>
            </div>
          </div>
        ) : (
          <Button size="sm" variant="outline" className="w-full mt-3 h-7 text-xs font-mono" onClick={() => setShowAdd(true)}>
            <Plus className="w-3 h-3 mr-1" />Add Investment
          </Button>
        )}
      </Card>

      {/* Asset Allocation */}
      {Object.keys(allocation).length > 0 && (
        <Card>
          <div className="flex items-center gap-2 mb-3">
            <PieChart className="w-4 h-4 text-muted-foreground" />
            <SectionTitle>Asset Allocation</SectionTitle>
          </div>
          <div className="space-y-2">
            {(Object.keys(allocation) as AssetClass[]).map(cls => {
              const val = allocation[cls] ?? 0
              const pct = totalValue > 0 ? (val / totalValue) * 100 : 0
              return (
                <div key={cls} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className={cn('w-2.5 h-2.5 rounded-sm', CLASS_COLORS[cls])} />
                      <span>{CLASS_LABELS[cls]}</span>
                    </div>
                    <div className="text-right">
                      <span className="tabular-nums">{fmtCompact(val)}</span>
                      <span className="text-muted-foreground ml-2 tabular-nums">{pct.toFixed(1)}%</span>
                    </div>
                  </div>
                  <div className="h-1.5 bg-border rounded-full overflow-hidden">
                    <div className={cn('h-full rounded-full', CLASS_COLORS[cls])} style={{ width: `${pct}%` }} />
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
