'use client'
import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface RiskData {
  varDollar: number
  varPct: number
  beta: number
  sharpe: number
  maxDrawdown: number
  volatility: number
  corrSpy: number
  sortino: number
  calmar: number
  avgWinLoss: number
  winRate: number
}

const BASE: RiskData = {
  varDollar:   8_420,
  varPct:       1.68,
  beta:          1.14,
  sharpe:        1.43,
  maxDrawdown:  -4.21,
  volatility:   18.7,
  corrSpy:       0.87,
  sortino:       2.11,
  calmar:        1.78,
  avgWinLoss:    1.42,
  winRate:      58.3,
}

function jit(v: number, r: number) {
  return Math.round((v + (Math.random() - 0.5) * r) * 100) / 100
}

function randomize(b: RiskData): RiskData {
  return {
    varDollar:   Math.round(b.varDollar + (Math.random() - 0.5) * 200),
    varPct:      jit(b.varPct, 0.04),
    beta:        jit(b.beta, 0.02),
    sharpe:      jit(b.sharpe, 0.04),
    maxDrawdown: jit(b.maxDrawdown, 0.1),
    volatility:  jit(b.volatility, 0.2),
    corrSpy:     jit(b.corrSpy, 0.02),
    sortino:     jit(b.sortino, 0.04),
    calmar:      jit(b.calmar, 0.03),
    avgWinLoss:  jit(b.avgWinLoss, 0.02),
    winRate:     jit(b.winRate, 0.1),
  }
}

// Generate a simple equity curve for the month (30 data points)
function genCurve(): number[] {
  const pts: number[] = [100]
  for (let i = 1; i < 30; i++) {
    const prev = pts[i - 1]
    pts.push(Math.round((prev + (Math.random() - 0.42) * 0.8) * 100) / 100)
  }
  return pts
}

function SparkLine({ data }: { data: number[] }) {
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const W = 200, H = 32
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * W
    const y = H - ((v - min) / range) * H
    return `${x.toFixed(1)},${y.toFixed(1)}`
  }).join(' ')
  const last = data[data.length - 1]
  const color = last >= data[0] ? '#4ade80' : '#f87171'
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-8" preserveAspectRatio="none">
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" />
    </svg>
  )
}

interface MetricRowProps {
  label: string
  value: string
  color?: string
}
function MetricRow({ label, value, color }: MetricRowProps) {
  return (
    <div className="flex items-center justify-between px-2.5 py-1.5 rounded bg-muted/20 border border-border/50">
      <span className="text-muted-foreground">{label}</span>
      <span className={cn('font-semibold tabular-nums', color ?? 'text-foreground')}>{value}</span>
    </div>
  )
}

export function RiskMetricsWidget() {
  const [data, setData] = useState<RiskData>(BASE)
  const [curve, setCurve] = useState<number[]>(() => genCurve())
  const [lastUpdated, setLastUpdated] = useState('')

  useEffect(() => {
    const update = () => {
      setData(randomize(BASE))
      setLastUpdated(new Date().toLocaleTimeString())
    }
    update()
    const id = setInterval(update, 30_000)
    return () => clearInterval(id)
  }, [])

  const betaColor    = data.beta > 1   ? 'text-red-400'   : 'text-green-400'
  const sharpeColor  = data.sharpe > 1 ? 'text-green-400' : data.sharpe > 0.5 ? 'text-amber-400' : 'text-red-400'
  const sortinoColor = data.sortino > 1.5 ? 'text-green-400' : 'text-amber-400'
  const drawColor    = data.maxDrawdown < -5 ? 'text-red-400' : 'text-amber-400'

  return (
    <div className="flex flex-col h-full font-mono text-xs p-3 gap-1.5">
      {/* Equity curve sparkline */}
      <div className="px-1 pb-1 border-b border-border">
        <div className="text-[9px] text-muted-foreground mb-0.5">MTD Equity Curve</div>
        <SparkLine data={curve} />
      </div>

      <div className="flex-1 overflow-y-auto flex flex-col gap-1">
        <MetricRow
          label="VaR (95%, 1-day)"
          value={`-$${data.varDollar.toLocaleString()} / -${data.varPct.toFixed(2)}%`}
          color="text-red-400"
        />
        <MetricRow label="Portfolio Beta"    value={data.beta.toFixed(2)}         color={betaColor}   />
        <MetricRow label="Sharpe Ratio"      value={data.sharpe.toFixed(2)}        color={sharpeColor} />
        <MetricRow label="Max Drawdown (MTD)"value={`${data.maxDrawdown.toFixed(2)}%`} color={drawColor} />
        <MetricRow label="Volatility (30D ann.)" value={`${data.volatility.toFixed(1)}%`} />
        <MetricRow label="Correlation to SPY" value={data.corrSpy.toFixed(2)} />
        <MetricRow label="Sortino Ratio"     value={data.sortino.toFixed(2)}       color={sortinoColor} />
        <MetricRow label="Calmar Ratio"      value={data.calmar.toFixed(2)} />
        <MetricRow label="Avg Win / Loss"    value={`${data.avgWinLoss.toFixed(2)}×`} />
        <MetricRow
          label="Win Rate"
          value={`${data.winRate.toFixed(1)}%`}
          color={data.winRate >= 50 ? 'text-green-400' : 'text-red-400'}
        />
      </div>

      {lastUpdated && (
        <div className="text-[9px] text-muted-foreground pt-1 border-t border-border text-right">
          Updated {lastUpdated}
        </div>
      )}
    </div>
  )
}
