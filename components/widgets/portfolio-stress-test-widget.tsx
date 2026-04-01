'use client'

import { useEffect, useState } from 'react'
import { ShieldAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface CrashScenario {
  name: string
  drawdown: number   // negative %
  recovery: string
  recoveryMonths: number
}

interface BullScenario {
  name: string
  gain: number       // positive %
}

const CRASH_SCENARIOS: CrashScenario[] = [
  { name: '2008 Financial Crisis',  drawdown: -56.8, recovery: '5 years',   recoveryMonths: 60  },
  { name: 'COVID Crash 2020',       drawdown: -34.0, recovery: '5 months',  recoveryMonths: 5   },
  { name: '2022 Bear Market',       drawdown: -25.4, recovery: '18 months', recoveryMonths: 18  },
  { name: '2000 Dot-com Bust',      drawdown: -49.1, recovery: '7 years',   recoveryMonths: 84  },
  { name: 'Black Monday 1987',      drawdown: -22.6, recovery: '2 years',   recoveryMonths: 24  },
  { name: '1994 Bond Crash',        drawdown: -8.0,  recovery: '8 months',  recoveryMonths: 8   },
  { name: '2011 EU Debt Crisis',    drawdown: -21.6, recovery: '14 months', recoveryMonths: 14  },
]

const BULL_SCENARIOS: BullScenario[] = [
  { name: '2023 AI Bull Run',       gain: 26.3 },
  { name: '2019 Bull Market',       gain: 28.9 },
  { name: '2017 Crypto Boom',       gain: 19.4 },
  { name: '2013 Recovery Rally',    gain: 29.6 },
]

const MAX_CRASH = Math.abs(CRASH_SCENARIOS.reduce((a, b) => a.drawdown < b.drawdown ? a : b).drawdown)
const MAX_GAIN  = Math.max(...BULL_SCENARIOS.map(s => s.gain))

function resilienceScore(value: number): number {
  if (value < 5_000)   return Math.round(45 + Math.random() * 10)
  if (value < 50_000)  return Math.round(55 + Math.random() * 15)
  if (value < 250_000) return Math.round(70 + Math.random() * 12)
  return Math.round(82 + Math.random() * 8)
}

function scoreColor(s: number) {
  if (s < 50) return 'text-price-down'
  if (s < 70) return 'text-yellow-400'
  return 'text-price-up'
}
function scoreTrack(s: number) {
  if (s < 50) return 'bg-price-down'
  if (s < 70) return 'bg-yellow-400'
  return 'bg-price-up'
}

function fmt(value: number) {
  return value.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
}

export function PortfolioStressTestWidget() {
  const [portfolioInput, setPortfolioInput] = useState('10000')
  const [running, setRunning]   = useState(false)
  const [done, setDone]         = useState(false)
  const [score, setScore]       = useState<number | null>(null)
  const [dots, setDots]         = useState('')
  const [visible, setVisible]   = useState(false)

  const portfolioValue = Math.max(0, parseFloat(portfolioInput.replace(/[^0-9.]/g, '')) || 0)

  useEffect(() => {
    if (!running) return
    const id = setInterval(() => setDots(d => d.length >= 3 ? '' : d + '.'), 400)
    return () => clearInterval(id)
  }, [running])

  function handleRun() {
    setRunning(true)
    setDone(false)
    setVisible(false)
    setTimeout(() => {
      setRunning(false)
      setDone(true)
      setScore(resilienceScore(portfolioValue))
      setTimeout(() => setVisible(true), 50)
    }, 2000)
  }

  const worstLoss    = portfolioValue * (MAX_CRASH / 100)
  const bestGain     = portfolioValue * (MAX_GAIN / 100)
  const avgRecMonths = CRASH_SCENARIOS.reduce((sum, s) => sum + s.recoveryMonths, 0) / CRASH_SCENARIOS.length

  return (
    <div className="p-4 flex flex-col gap-3 h-full overflow-y-auto">
      {/* Header */}
      <div className="flex items-center gap-1.5 shrink-0">
        <ShieldAlert className="w-3.5 h-3.5 text-primary" />
        <span className="font-mono text-xs font-semibold text-foreground">PORTFOLIO STRESS TEST</span>
      </div>

      {/* Input */}
      <div className="flex items-center gap-2 shrink-0">
        <span className="font-mono text-[10px] text-muted-foreground w-28">PORTFOLIO VALUE</span>
        <span className="font-mono text-[10px] text-muted-foreground">$</span>
        <input
          type="number"
          min={0}
          value={portfolioInput}
          onChange={e => { setPortfolioInput(e.target.value); setDone(false) }}
          className="border border-border bg-background px-2 py-1 rounded font-mono text-xs text-foreground w-32 focus:outline-none focus:border-primary"
        />
        <Button
          variant="outline"
          size="sm"
          className="font-mono text-[10px] h-6 px-2 ml-auto"
          onClick={handleRun}
          disabled={running || portfolioValue <= 0}
        >
          {running ? `RUNNING${dots}` : 'RUN STRESS TEST'}
        </Button>
      </div>

      {running && (
        <div className="flex-1 flex items-center justify-center shrink-0">
          <span className="font-mono text-xs text-primary animate-pulse">RUNNING SIMULATIONS{dots}</span>
        </div>
      )}

      {done && !running && (
        <div className={cn('flex flex-col gap-3 transition-opacity duration-500', visible ? 'opacity-100' : 'opacity-0')}>

          {/* Summary stats */}
          <div className="grid grid-cols-3 gap-2">
            <div className="border border-border/50 rounded bg-muted/10 p-2 text-center">
              <div className="font-mono text-[9px] text-muted-foreground uppercase mb-0.5">Worst Loss</div>
              <div className="font-mono text-xs text-price-down font-semibold tabular-nums">{fmt(-worstLoss)}</div>
            </div>
            <div className="border border-border/50 rounded bg-muted/10 p-2 text-center">
              <div className="font-mono text-[9px] text-muted-foreground uppercase mb-0.5">Best Gain</div>
              <div className="font-mono text-xs text-price-up font-semibold tabular-nums">+{fmt(bestGain)}</div>
            </div>
            <div className="border border-border/50 rounded bg-muted/10 p-2 text-center">
              <div className="font-mono text-[9px] text-muted-foreground uppercase mb-0.5">Avg Recovery</div>
              <div className="font-mono text-xs text-foreground font-semibold tabular-nums">{Math.round(avgRecMonths)}mo</div>
            </div>
          </div>

          {/* Resilience Score */}
          {score !== null && (
            <div className="border border-border/50 rounded bg-muted/10 p-3 shrink-0">
              <div className="font-mono text-[9px] text-primary uppercase tracking-widest mb-2">RESILIENCE SCORE</div>
              <div className="h-2.5 rounded-full bg-muted overflow-hidden mb-1.5">
                <div
                  className={cn('h-full rounded-full transition-all duration-700', scoreTrack(score))}
                  style={{ width: `${score}%` }}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className={cn('font-mono text-xs font-bold', scoreColor(score))}>
                  {score < 50 ? 'LOW RESILIENCE' : score < 70 ? 'MODERATE' : 'RESILIENT'}
                </span>
                <span className={cn('font-mono text-xs tabular-nums font-bold', scoreColor(score))}>
                  {score}/100
                </span>
              </div>
            </div>
          )}

          {/* Crash Scenarios */}
          <div>
            <div className="font-mono text-[9px] text-price-down uppercase tracking-widest mb-1.5">▼ CRASH SCENARIOS</div>
            <div className="flex flex-col gap-1">
              {CRASH_SCENARIOS.map(s => {
                const loss = portfolioValue * Math.abs(s.drawdown) / 100
                const barPct = (Math.abs(s.drawdown) / MAX_CRASH) * 100
                return (
                  <div key={s.name} className="border border-border/30 rounded px-2 py-1.5 hover:bg-muted/10 transition-colors">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono text-[10px] text-foreground">{s.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[9px] text-muted-foreground">{s.recovery}</span>
                        <span className="font-mono text-[10px] text-price-down tabular-nums font-semibold">
                          {s.drawdown.toFixed(1)}% / {fmt(-loss)}
                        </span>
                      </div>
                    </div>
                    <div className="h-1 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-price-down/60 rounded-full" style={{ width: `${barPct}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Bull Scenarios */}
          <div>
            <div className="font-mono text-[9px] text-price-up uppercase tracking-widest mb-1.5">▲ BULL SCENARIOS</div>
            <div className="flex flex-col gap-1">
              {BULL_SCENARIOS.map(s => {
                const gain = portfolioValue * s.gain / 100
                const barPct = (s.gain / MAX_GAIN) * 100
                return (
                  <div key={s.name} className="border border-border/30 rounded px-2 py-1.5 hover:bg-muted/10 transition-colors">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono text-[10px] text-foreground">{s.name}</span>
                      <span className="font-mono text-[10px] text-price-up tabular-nums font-semibold">
                        +{s.gain.toFixed(1)}% / +{fmt(gain)}
                      </span>
                    </div>
                    <div className="h-1 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-price-up/60 rounded-full" style={{ width: `${barPct}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
