'use client'

import { useState, useEffect } from 'react'
import { CreditCard, Plus, Trash2, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface ScoreEntry {
  id: string
  score: number
  date: string
  note: string
}

interface CreditData {
  entries: ScoreEntry[]
}

function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn('bg-card border border-border rounded-md p-4', className)}>{children}</div>
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-3">{children}</h2>
}

function getScoreColor(score: number): string {
  if (score >= 800) return 'text-green-400'
  if (score >= 740) return 'text-lime-400'
  if (score >= 670) return 'text-yellow-400'
  if (score >= 580) return 'text-orange-400'
  return 'text-red-400'
}

function getScoreLabel(score: number): string {
  if (score >= 800) return 'Exceptional'
  if (score >= 740) return 'Very Good'
  if (score >= 670) return 'Good'
  if (score >= 580) return 'Fair'
  return 'Poor'
}

function getScoreBarColor(score: number): string {
  if (score >= 800) return '#4ade80'
  if (score >= 740) return '#a3e635'
  if (score >= 670) return '#facc15'
  if (score >= 580) return '#fb923c'
  return '#f87171'
}

const SCORE_RANGES = [
  { label: 'Poor',      min: 300, max: 579, color: '#f87171' },
  { label: 'Fair',      min: 580, max: 669, color: '#fb923c' },
  { label: 'Good',      min: 670, max: 739, color: '#facc15' },
  { label: 'Very Good', min: 740, max: 799, color: '#a3e635' },
  { label: 'Exceptional',min: 800, max: 850, color: '#4ade80' },
]

const SCORE_FACTORS = [
  { label: 'Payment History',     pct: 35, desc: 'Always pay on time — even one missed payment can drop your score significantly.' },
  { label: 'Credit Utilization',  pct: 30, desc: 'Keep utilization below 30% of your credit limit. Lower is better.' },
  { label: 'Credit History Length',pct: 15, desc: 'Older accounts help. Avoid closing old cards you no longer use.' },
  { label: 'Credit Mix',          pct: 10, desc: 'Having a mix of credit types (cards, loans) shows you can manage different debts.' },
  { label: 'New Credit',          pct: 10, desc: 'Each hard inquiry can lower your score slightly. Avoid applying for too many cards at once.' },
]

function getTips(score: number): string[] {
  if (score >= 800) return [
    'Maintain your excellent habits — always pay on time.',
    'Keep credit utilization well below 10% for peak scores.',
    'Avoid unnecessary hard inquiries.',
    'Monitor your credit report annually for errors.',
    'Consider a credit monitoring service to catch fraud early.',
  ]
  if (score >= 740) return [
    'Push toward 800+ by reducing utilization to under 10%.',
    'Ensure every payment is on time every month.',
    'Keep old accounts open to maintain credit history length.',
    'Dispute any errors on your credit report.',
    'Diversify credit mix if you only have one type.',
  ]
  if (score >= 670) return [
    'Your biggest win: pay every bill on time, every month.',
    'Reduce your credit card balances — aim for under 30% utilization.',
    'Avoid applying for new credit accounts in the next 6-12 months.',
    'Check your credit report for errors at annualcreditreport.com.',
    'Keep credit cards open even if unused — closing hurts your utilization.',
    'Consider becoming an authorized user on a family member\'s old account.',
  ]
  if (score >= 580) return [
    'Your score is fair — consistent on-time payments will improve it quickly.',
    'Pay down high-interest credit card debt aggressively.',
    'Set up autopay to never miss a due date.',
    'Get a secured credit card if you have limited credit history.',
    'Request a credit limit increase to improve utilization ratio.',
    'Review your credit report for inaccuracies — dispute any you find.',
  ]
  return [
    'Focus on catching up on any past-due accounts immediately.',
    'Contact creditors to set up payment plans for collections.',
    'A secured credit card can help rebuild credit history.',
    'Even small consistent payments improve your score over time.',
    'Consider a credit-builder loan from a local credit union.',
    'Avoid payday loans and predatory lenders that won\'t help your score.',
  ]
}

export function CreditScore() {
  const [data, setData] = useState<CreditData>({ entries: [] })
  const [scoreInput, setScoreInput] = useState('')
  const [noteInput, setNoteInput] = useState('')
  const [dateInput, setDateInput] = useState(new Date().toISOString().split('T')[0])

  useEffect(() => {
    try {
      const saved = localStorage.getItem('tourmaline-credit')
      if (saved) setData(JSON.parse(saved))
    } catch {}
  }, [])

  const persist = (d: CreditData) => {
    setData(d)
    localStorage.setItem('tourmaline-credit', JSON.stringify(d))
  }

  const addScore = () => {
    const score = parseInt(scoreInput)
    if (isNaN(score) || score < 300 || score > 850) return
    const entry: ScoreEntry = {
      id: `${Date.now()}`,
      score,
      date: dateInput,
      note: noteInput.trim(),
    }
    persist({ entries: [...data.entries, entry].sort((a, b) => a.date.localeCompare(b.date)) })
    setScoreInput('')
    setNoteInput('')
  }

  const deleteEntry = (id: string) => persist({ entries: data.entries.filter(e => e.id !== id) })

  const latest = data.entries.length > 0 ? data.entries[data.entries.length - 1] : null
  const previous = data.entries.length > 1 ? data.entries[data.entries.length - 2] : null
  const currentScore = latest?.score ?? 0
  const scoreDiff = latest && previous ? latest.score - previous.score : null

  // SVG gauge params
  const R = 80
  const cx = 110
  const cy = 100
  const startAngle = 180
  const endAngle = 0
  const totalRange = 850 - 300

  function scoreToAngle(score: number) {
    const pct = (score - 300) / totalRange
    return 180 - pct * 180
  }

  function polarToCart(angle: number, r: number) {
    const rad = (angle * Math.PI) / 180
    return { x: cx + r * Math.cos(rad), y: cy - r * Math.sin(rad) }
  }

  const gaugePct = currentScore > 0 ? (currentScore - 300) / totalRange : 0
  const gaugeColor = currentScore > 0 ? getScoreBarColor(currentScore) : '#374151'
  const needleAngle = currentScore > 0 ? scoreToAngle(currentScore) : 180
  const needleEnd = polarToCart(needleAngle, R - 10)
  const needleBase1 = polarToCart(needleAngle + 90, 5)
  const needleBase2 = polarToCart(needleAngle - 90, 5)

  const tips = getTips(currentScore || 650)

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
          <CreditCard className="size-5 text-primary" />
          Credit Score Tracker
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">Monitor and improve your credit score</p>
      </div>

      {/* Gauge */}
      <Card>
        <SectionTitle>Your Score</SectionTitle>
        <div className="flex flex-col items-center">
          <svg width="220" height="120" viewBox="0 0 220 120">
            {/* Background arc */}
            <path
              d={`M ${polarToCart(180, R).x} ${polarToCart(180, R).y} A ${R} ${R} 0 0 1 ${polarToCart(0, R).x} ${polarToCart(0, R).y}`}
              fill="none" stroke="#1f2937" strokeWidth="16" strokeLinecap="round"
            />
            {/* Colored score arc */}
            {currentScore > 0 && (
              <path
                d={`M ${polarToCart(180, R).x} ${polarToCart(180, R).y} A ${R} ${R} 0 ${gaugePct > 0.5 ? 1 : 0} 1 ${polarToCart(needleAngle, R).x} ${polarToCart(needleAngle, R).y}`}
                fill="none" stroke={gaugeColor} strokeWidth="16" strokeLinecap="round"
              />
            )}
            {/* Range color bands (thin) */}
            {SCORE_RANGES.map(range => {
              const a1 = scoreToAngle(range.min)
              const a2 = scoreToAngle(range.max)
              const large = Math.abs(a1 - a2) > 180 ? 1 : 0
              return (
                <path
                  key={range.label}
                  d={`M ${polarToCart(a1, R + 12).x} ${polarToCart(a1, R + 12).y} A ${R + 12} ${R + 12} 0 ${large} 1 ${polarToCart(a2, R + 12).x} ${polarToCart(a2, R + 12).y}`}
                  fill="none" stroke={range.color} strokeWidth="3" opacity="0.4"
                />
              )
            })}
            {/* Needle */}
            {currentScore > 0 && (
              <>
                <line
                  x1={cx} y1={cy}
                  x2={needleEnd.x} y2={needleEnd.y}
                  stroke={gaugeColor} strokeWidth="2.5" strokeLinecap="round"
                />
                <circle cx={cx} cy={cy} r="5" fill={gaugeColor} />
              </>
            )}
            {/* Score text */}
            <text x={cx} y={cy + 20} textAnchor="middle" fill="white" fontSize="24" fontWeight="bold" fontFamily="monospace">
              {currentScore > 0 ? currentScore : '—'}
            </text>
            {currentScore > 0 && (
              <text x={cx} y={cy + 35} textAnchor="middle" fill={gaugeColor} fontSize="11" fontFamily="monospace">
                {getScoreLabel(currentScore)}
              </text>
            )}
          </svg>

          {/* Range labels */}
          <div className="flex gap-2 flex-wrap justify-center mt-1">
            {SCORE_RANGES.map(r => (
              <div key={r.label} className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <div className="size-2 rounded-full" style={{ background: r.color }} />
                {r.label}
              </div>
            ))}
          </div>
        </div>

        {/* Log Score */}
        <div className="mt-4 border-t border-border pt-4">
          <p className="text-xs text-muted-foreground mb-2">Log a score entry</p>
          <div className="flex gap-2 flex-wrap">
            <Input
              type="number"
              placeholder="Score (300-850)"
              value={scoreInput}
              onChange={e => setScoreInput(e.target.value)}
              className="h-8 text-xs w-32 font-mono"
              min="300" max="850"
            />
            <Input
              type="date"
              value={dateInput}
              onChange={e => setDateInput(e.target.value)}
              className="h-8 text-xs w-36 font-mono"
            />
            <Input
              placeholder="Note (optional)"
              value={noteInput}
              onChange={e => setNoteInput(e.target.value)}
              className="h-8 text-xs flex-1 font-mono"
            />
            <Button size="sm" onClick={addScore} className="h-8 text-xs">
              <Plus className="size-3.5 mr-1" /> Log
            </Button>
          </div>
        </div>
      </Card>

      {/* Score change */}
      {scoreDiff !== null && (
        <div className={cn('flex items-center gap-2 text-sm px-3 py-2 rounded-md border',
          scoreDiff > 0 ? 'border-green-500/30 bg-green-500/5 text-green-400' :
          scoreDiff < 0 ? 'border-red-500/30 bg-red-500/5 text-red-400' :
          'border-border text-muted-foreground'
        )}>
          {scoreDiff > 0 ? <TrendingUp className="size-4" /> : scoreDiff < 0 ? <TrendingDown className="size-4" /> : <Minus className="size-4" />}
          <span>
            {scoreDiff > 0 ? `+${scoreDiff}` : scoreDiff} points since last entry
            {previous && <span className="text-muted-foreground ml-1 text-xs">({previous.score} → {latest?.score})</span>}
          </span>
        </div>
      )}

      {/* History */}
      {data.entries.length > 0 && (
        <Card>
          <SectionTitle>Score History</SectionTitle>
          <div className="space-y-2 max-h-52 overflow-y-auto">
            {[...data.entries].reverse().map(entry => (
              <div key={entry.id} className="flex items-center gap-3 text-xs group">
                <span className="text-muted-foreground w-24">{new Date(entry.date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                <span className={cn('font-bold text-sm tabular-nums w-12', getScoreColor(entry.score))}>{entry.score}</span>
                <span className="text-muted-foreground text-[10px] px-1.5 py-0.5 bg-muted rounded">{getScoreLabel(entry.score)}</span>
                {entry.note && <span className="text-muted-foreground flex-1 truncate">{entry.note}</span>}
                <button onClick={() => deleteEntry(entry.id)} className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-400 ml-auto">
                  <Trash2 className="size-3" />
                </button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Score Factors */}
      <Card>
        <SectionTitle>Credit Score Factors</SectionTitle>
        <div className="space-y-3">
          {SCORE_FACTORS.map(f => (
            <div key={f.label}>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-foreground">{f.label}</span>
                <span className="text-primary font-semibold">{f.pct}%</span>
              </div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden mb-1">
                <div className="h-full bg-primary/60 rounded-full" style={{ width: `${f.pct}%` }} />
              </div>
              <p className="text-[10px] text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Tips */}
      <Card>
        <SectionTitle>Tips to Improve Your Score</SectionTitle>
        <ul className="space-y-2">
          {tips.map((tip, i) => (
            <li key={i} className="flex gap-2 text-xs text-muted-foreground">
              <span className="text-primary shrink-0">{i + 1}.</span>
              <span>{tip}</span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  )
}
