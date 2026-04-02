'use client'

import { useState, useEffect, useMemo } from 'react'
import { Plus, Trash2, Pencil, Check, X, Shield, Heart, Car, Home, Eye, Activity, Umbrella, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const STORAGE_KEY = 'tourmaline-insurance'

type PolicyType = 'health' | 'auto' | 'home' | 'life' | 'dental' | 'vision' | 'disability' | 'umbrella' | 'other'
type PolicyStatus = 'active' | 'paused'

interface InsurancePolicy {
  id: string
  name: string
  type: PolicyType
  provider: string
  monthlyPremium: number
  coverageAmount: number
  deductible: number
  renewalDate: string
  status: PolicyStatus
}

const TYPE_LABELS: Record<PolicyType, string> = {
  health:     'Health',
  auto:       'Auto',
  home:       'Home / Renters',
  life:       'Life',
  dental:     'Dental',
  vision:     'Vision',
  disability: 'Disability',
  umbrella:   'Umbrella',
  other:      'Other',
}

const TYPE_ICONS: Record<PolicyType, React.ComponentType<{ className?: string }>> = {
  health:     Heart,
  auto:       Car,
  home:       Home,
  life:       Shield,
  dental:     Activity,
  vision:     Eye,
  disability: Activity,
  umbrella:   Umbrella,
  other:      Shield,
}

const TYPE_COLORS: Record<PolicyType, string> = {
  health:     'text-red-400',
  auto:       'text-blue-400',
  home:       'text-amber-400',
  life:       'text-purple-400',
  dental:     'text-cyan-400',
  vision:     'text-teal-400',
  disability: 'text-orange-400',
  umbrella:   'text-indigo-400',
  other:      'text-muted-foreground',
}

const TYPE_BAR_COLORS: Record<PolicyType, string> = {
  health:     'bg-red-400',
  auto:       'bg-blue-400',
  home:       'bg-amber-400',
  life:       'bg-purple-400',
  dental:     'bg-cyan-400',
  vision:     'bg-teal-400',
  disability: 'bg-orange-400',
  umbrella:   'bg-indigo-400',
  other:      'bg-muted-foreground',
}

function fmt(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
}

function fmtD(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(n)
}

function daysUntilRenewal(renewalDate: string): number | null {
  if (!renewalDate) return null
  const renewal = new Date(renewalDate)
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  renewal.setHours(0, 0, 0, 0)
  return Math.round((renewal.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
}

function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn('bg-card border border-border rounded-md p-4', className)}>{children}</div>
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-3">{children}</h2>
}

const EMPTY_FORM = {
  name: '', type: 'health' as PolicyType, provider: '',
  monthlyPremium: '', coverageAmount: '', deductible: '', renewalDate: '',
}

export function InsuranceTracker() {
  const [policies, setPolicies] = useState<InsurancePolicy[]>([])
  const [form, setForm] = useState({ ...EMPTY_FORM })
  const [showAdd, setShowAdd] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({ ...EMPTY_FORM })

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) setPolicies(JSON.parse(saved))
    } catch {}
  }, [])

  const persist = (data: InsurancePolicy[]) => {
    setPolicies(data)
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)) } catch {}
  }

  const addPolicy = () => {
    const monthly = parseFloat(form.monthlyPremium)
    if (!form.name.trim() || isNaN(monthly) || monthly < 0) return
    persist([...policies, {
      id: crypto.randomUUID(),
      name: form.name.trim(),
      type: form.type,
      provider: form.provider.trim(),
      monthlyPremium: monthly,
      coverageAmount: parseFloat(form.coverageAmount) || 0,
      deductible: parseFloat(form.deductible) || 0,
      renewalDate: form.renewalDate,
      status: 'active',
    }])
    setForm({ ...EMPTY_FORM })
    setShowAdd(false)
  }

  const removePolicy = (id: string) => persist(policies.filter(p => p.id !== id))

  const toggleStatus = (id: string) => persist(policies.map(p =>
    p.id === id ? { ...p, status: p.status === 'active' ? 'paused' : 'active' } : p
  ))

  const startEdit = (p: InsurancePolicy) => {
    setEditingId(p.id)
    setEditForm({
      name: p.name, type: p.type, provider: p.provider,
      monthlyPremium: String(p.monthlyPremium),
      coverageAmount: String(p.coverageAmount),
      deductible: String(p.deductible),
      renewalDate: p.renewalDate,
    })
  }

  const saveEdit = (id: string) => {
    const monthly = parseFloat(editForm.monthlyPremium)
    if (!editForm.name.trim() || isNaN(monthly) || monthly < 0) return
    persist(policies.map(p => p.id === id ? {
      ...p,
      name: editForm.name.trim(),
      type: editForm.type,
      provider: editForm.provider.trim(),
      monthlyPremium: monthly,
      coverageAmount: parseFloat(editForm.coverageAmount) || 0,
      deductible: parseFloat(editForm.deductible) || 0,
      renewalDate: editForm.renewalDate,
    } : p))
    setEditingId(null)
  }

  const activePolicies = useMemo(() => policies.filter(p => p.status === 'active'), [policies])
  const totalMonthly = useMemo(() => activePolicies.reduce((s, p) => s + p.monthlyPremium, 0), [activePolicies])
  const totalCoverage = useMemo(() => activePolicies.reduce((s, p) => s + p.coverageAmount, 0), [activePolicies])

  const upcomingRenewals = useMemo(() =>
    activePolicies
      .map(p => ({ ...p, daysLeft: daysUntilRenewal(p.renewalDate) }))
      .filter(p => p.daysLeft !== null && p.daysLeft >= 0 && p.daysLeft <= 60)
      .sort((a, b) => (a.daysLeft ?? 0) - (b.daysLeft ?? 0)),
    [activePolicies]
  )

  return (
    <div className="space-y-4 font-mono">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
          <Shield className="size-5 text-primary" />
          Insurance Tracker
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">Manage your insurance policies in one place</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        <Card>
          <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Active Policies</div>
          <div className="text-2xl font-bold tabular-nums">{activePolicies.length}</div>
        </Card>
        <Card>
          <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Monthly Cost</div>
          <div className="text-2xl font-bold tabular-nums text-primary">{fmtD(totalMonthly)}</div>
        </Card>
        <Card>
          <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Annual Cost</div>
          <div className="text-2xl font-bold tabular-nums text-orange-400">{fmt(totalMonthly * 12)}</div>
        </Card>
      </div>

      {/* Renewal Alerts */}
      {upcomingRenewals.length > 0 && (
        <Card className="border-amber-500/30 bg-amber-500/5">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="size-4 text-amber-500" />
            <SectionTitle>Upcoming Renewals</SectionTitle>
          </div>
          <div className="space-y-2">
            {upcomingRenewals.map(p => {
              const Icon = TYPE_ICONS[p.type]
              return (
                <div key={p.id} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Icon className={cn('size-3.5', TYPE_COLORS[p.type])} />
                    <span className="font-semibold">{p.name}</span>
                    {p.provider && <span className="text-muted-foreground">· {p.provider}</span>}
                  </div>
                  <span className={cn('tabular-nums font-mono', (p.daysLeft ?? 0) <= 14 ? 'text-red-400' : 'text-amber-500')}>
                    {p.daysLeft === 0 ? 'Today' : `${p.daysLeft}d`}
                  </span>
                </div>
              )
            })}
          </div>
        </Card>
      )}

      {/* Policies List */}
      <Card>
        <SectionTitle>Policies</SectionTitle>
        {policies.length === 0 ? (
          <div className="text-xs text-muted-foreground text-center py-4">No policies added yet</div>
        ) : (
          <div className="space-y-3">
            {policies.map(p => {
              const Icon = TYPE_ICONS[p.type]
              const days = daysUntilRenewal(p.renewalDate)
              const isEditing = editingId === p.id

              if (isEditing) {
                return (
                  <div key={p.id} className="border border-primary/30 rounded-md p-3 space-y-2 bg-primary/5">
                    <div className="text-[10px] text-primary uppercase tracking-widest">Edit Policy</div>
                    <Input className="h-8 text-xs font-mono" placeholder="Policy name" value={editForm.name}
                      onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} autoFocus />
                    <div className="grid grid-cols-2 gap-2">
                      <select value={editForm.type} onChange={e => setEditForm(f => ({ ...f, type: e.target.value as PolicyType }))}
                        className="h-8 px-2 text-xs font-mono bg-background border border-border rounded-md text-foreground focus:outline-none">
                        {(Object.keys(TYPE_LABELS) as PolicyType[]).map(t => <option key={t} value={t}>{TYPE_LABELS[t]}</option>)}
                      </select>
                      <Input className="h-8 text-xs font-mono" placeholder="Provider" value={editForm.provider}
                        onChange={e => setEditForm(f => ({ ...f, provider: e.target.value }))} />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Input className="h-8 text-xs font-mono" placeholder="Monthly premium ($)" type="number" min="0" step="0.01"
                        value={editForm.monthlyPremium} onChange={e => setEditForm(f => ({ ...f, monthlyPremium: e.target.value }))} />
                      <Input className="h-8 text-xs font-mono" placeholder="Coverage amount ($)" type="number" min="0"
                        value={editForm.coverageAmount} onChange={e => setEditForm(f => ({ ...f, coverageAmount: e.target.value }))} />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Input className="h-8 text-xs font-mono" placeholder="Deductible ($)" type="number" min="0"
                        value={editForm.deductible} onChange={e => setEditForm(f => ({ ...f, deductible: e.target.value }))} />
                      <Input className="h-8 text-xs font-mono" type="date" value={editForm.renewalDate}
                        onChange={e => setEditForm(f => ({ ...f, renewalDate: e.target.value }))} />
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" className="flex-1 h-7 text-xs font-mono" onClick={() => saveEdit(p.id)}
                        disabled={!editForm.name || !editForm.monthlyPremium}>
                        <Check className="w-3 h-3 mr-1" />Save
                      </Button>
                      <Button size="sm" variant="ghost" className="h-7 px-3 text-xs font-mono border border-border"
                        onClick={() => setEditingId(null)}>Cancel</Button>
                    </div>
                  </div>
                )
              }

              return (
                <div key={p.id} className={cn('border rounded-sm p-3 space-y-1.5', p.status === 'paused' ? 'border-border opacity-60' : 'border-border')}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className={cn('size-4 shrink-0', p.status === 'paused' ? 'text-muted-foreground' : TYPE_COLORS[p.type])} />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-semibold">{p.name}</span>
                          {p.status === 'paused' && (
                            <span className="text-[9px] text-muted-foreground border border-border px-1 rounded">paused</span>
                          )}
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                          {TYPE_LABELS[p.type]}{p.provider ? ` · ${p.provider}` : ''}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => startEdit(p)} className="text-muted-foreground/40 hover:text-primary transition-colors">
                        <Pencil className="w-3 h-3" />
                      </button>
                      <button onClick={() => toggleStatus(p.id)} className="text-muted-foreground/40 hover:text-foreground transition-colors"
                        title={p.status === 'active' ? 'Pause policy' : 'Resume policy'}>
                        {p.status === 'active' ? <X className="w-3 h-3" /> : <Check className="w-3 h-3" />}
                      </button>
                      <button onClick={() => removePolicy(p.id)} className="text-muted-foreground/40 hover:text-destructive transition-colors">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-[10px] text-muted-foreground">
                    <span className="tabular-nums font-semibold text-foreground">{fmtD(p.monthlyPremium)}/mo</span>
                    {p.coverageAmount > 0 && <span>Coverage: {fmt(p.coverageAmount)}</span>}
                    {p.deductible > 0 && <span>Deductible: {fmt(p.deductible)}</span>}
                    {days !== null && (
                      <span className={cn(days <= 14 && days >= 0 ? 'text-red-400' : days <= 60 && days >= 0 ? 'text-amber-500' : '')}>
                        Renews: {days < 0
                          ? `${Math.abs(days)}d ago`
                          : days === 0 ? 'Today'
                          : new Date(p.renewalDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {showAdd ? (
          <div className="mt-4 border border-primary/30 rounded-md p-3 space-y-2 bg-primary/5">
            <div className="text-[10px] text-primary uppercase tracking-widest">New Policy</div>
            <Input className="h-8 text-xs font-mono" placeholder="Policy name (e.g. Blue Cross Health)" value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))} autoFocus />
            <div className="grid grid-cols-2 gap-2">
              <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as PolicyType }))}
                className="h-8 px-2 text-xs font-mono bg-background border border-border rounded-md text-foreground focus:outline-none">
                {(Object.keys(TYPE_LABELS) as PolicyType[]).map(t => <option key={t} value={t}>{TYPE_LABELS[t]}</option>)}
              </select>
              <Input className="h-8 text-xs font-mono" placeholder="Provider" value={form.provider}
                onChange={e => setForm(f => ({ ...f, provider: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Input className="h-8 text-xs font-mono" placeholder="Monthly premium ($)" type="number" min="0" step="0.01"
                value={form.monthlyPremium} onChange={e => setForm(f => ({ ...f, monthlyPremium: e.target.value }))} />
              <Input className="h-8 text-xs font-mono" placeholder="Coverage amount ($)" type="number" min="0"
                value={form.coverageAmount} onChange={e => setForm(f => ({ ...f, coverageAmount: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Input className="h-8 text-xs font-mono" placeholder="Deductible ($)" type="number" min="0"
                value={form.deductible} onChange={e => setForm(f => ({ ...f, deductible: e.target.value }))} />
              <Input className="h-8 text-xs font-mono" type="date" value={form.renewalDate}
                onChange={e => setForm(f => ({ ...f, renewalDate: e.target.value }))} />
            </div>
            <div className="flex gap-2">
              <Button size="sm" className="flex-1 h-7 text-xs font-mono" onClick={addPolicy} disabled={!form.name || !form.monthlyPremium}>
                <Plus className="w-3 h-3 mr-1" />Add Policy
              </Button>
              <Button size="sm" variant="ghost" className="h-7 px-3 text-xs font-mono border border-border"
                onClick={() => { setShowAdd(false); setForm({ ...EMPTY_FORM }) }}>Cancel</Button>
            </div>
          </div>
        ) : (
          <Button size="sm" variant="outline" className="w-full mt-3 h-7 text-xs font-mono" onClick={() => setShowAdd(true)}>
            <Plus className="w-3 h-3 mr-1" />Add Policy
          </Button>
        )}
      </Card>

      {/* Coverage Breakdown */}
      {activePolicies.length > 0 && (
        <Card>
          <SectionTitle>Coverage Breakdown</SectionTitle>
          <div className="space-y-2">
            {activePolicies.map(p => {
              const Icon = TYPE_ICONS[p.type]
              const pct = totalMonthly > 0 ? (p.monthlyPremium / totalMonthly) * 100 : 0
              return (
                <div key={p.id} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <Icon className={cn('size-3.5', TYPE_COLORS[p.type])} />
                      <span>{p.name}</span>
                    </div>
                    <span className="tabular-nums text-muted-foreground">{fmtD(p.monthlyPremium)}/mo · {pct.toFixed(0)}%</span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className={cn('h-full rounded-full', TYPE_BAR_COLORS[p.type])}
                      style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
          {totalCoverage > 0 && (
            <div className="mt-3 pt-3 border-t border-border flex justify-between text-xs">
              <span className="text-muted-foreground">Total Coverage</span>
              <span className="font-bold tabular-nums text-green-400">{fmt(totalCoverage)}</span>
            </div>
          )}
        </Card>
      )}

      <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
        <Shield className="w-3 h-3" />
        <span>Tip: Review your policies annually to ensure adequate coverage and competitive rates.</span>
      </div>
    </div>
  )
}
