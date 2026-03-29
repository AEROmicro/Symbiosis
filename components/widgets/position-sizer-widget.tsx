'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface Result {
  shares: number
  positionSize: number
  riskAmount: number
  rewardAmount: number | null
  rr: number | null
}

function calculate(
  accountSize: number,
  riskPct: number,
  entryPrice: number,
  stopPrice: number,
  targetPrice: number | null,
): Result | null {
  if (!accountSize || !riskPct || !entryPrice || !stopPrice) return null
  if (entryPrice === stopPrice) return null

  const riskAmount = (accountSize * riskPct) / 100
  const riskPerShare = Math.abs(entryPrice - stopPrice)
  const shares = Math.floor(riskAmount / riskPerShare)
  const positionSize = shares * entryPrice

  let rewardAmount: number | null = null
  let rr: number | null = null
  if (targetPrice !== null && targetPrice !== entryPrice) {
    rewardAmount = shares * Math.abs(targetPrice - entryPrice)
    rr = rewardAmount / riskAmount
  }

  return { shares, positionSize, riskAmount, rewardAmount, rr }
}

export function PositionSizerWidget() {
  const [accountSize, setAccountSize] = useState('')
  const [riskPct, setRiskPct] = useState('1')
  const [entryPrice, setEntryPrice] = useState('')
  const [stopPrice, setStopPrice] = useState('')
  const [targetPrice, setTargetPrice] = useState('')

  const result = calculate(
    parseFloat(accountSize),
    parseFloat(riskPct),
    parseFloat(entryPrice),
    parseFloat(stopPrice),
    targetPrice ? parseFloat(targetPrice) : null,
  )

  const fmt = (n: number) =>
    n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  return (
    <div className="p-3 flex flex-col gap-3 h-full overflow-y-auto font-mono text-xs">
      {/* Inputs */}
      <div className="space-y-2">
        <div className="space-y-1">
          <label className="text-[10px] uppercase tracking-wider text-muted-foreground">Account Size ($)</label>
          <Input
            type="number"
            placeholder="e.g. 10000"
            value={accountSize}
            onChange={e => setAccountSize(e.target.value)}
            className="h-7 text-xs font-mono"
          />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] uppercase tracking-wider text-muted-foreground">Risk per Trade (%)</label>
          <Input
            type="number"
            placeholder="e.g. 1"
            value={riskPct}
            onChange={e => setRiskPct(e.target.value)}
            className="h-7 text-xs font-mono"
          />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] uppercase tracking-wider text-muted-foreground">Entry Price ($)</label>
          <Input
            type="number"
            placeholder="e.g. 150.00"
            value={entryPrice}
            onChange={e => setEntryPrice(e.target.value)}
            className="h-7 text-xs font-mono"
          />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] uppercase tracking-wider text-muted-foreground">Stop Loss ($)</label>
          <Input
            type="number"
            placeholder="e.g. 145.00"
            value={stopPrice}
            onChange={e => setStopPrice(e.target.value)}
            className="h-7 text-xs font-mono"
          />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] uppercase tracking-wider text-muted-foreground">Target Price ($) — optional</label>
          <Input
            type="number"
            placeholder="e.g. 160.00"
            value={targetPrice}
            onChange={e => setTargetPrice(e.target.value)}
            className="h-7 text-xs font-mono"
          />
        </div>
      </div>

      {/* Results */}
      {result ? (
        <div className="space-y-1.5 border border-border rounded p-3 bg-card">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Result</div>
          <Row label="Shares" value={result.shares.toString()} />
          <Row label="Position Size" value={`$${fmt(result.positionSize)}`} />
          <Row label="Risk Amount" value={`$${fmt(result.riskAmount)}`} accent="destructive" />
          {result.rewardAmount !== null && (
            <Row label="Reward Amount" value={`$${fmt(result.rewardAmount)}`} accent="positive" />
          )}
          {result.rr !== null && (
            <Row
              label="Risk:Reward"
              value={`1 : ${result.rr.toFixed(2)}`}
              accent={result.rr >= 2 ? 'positive' : result.rr >= 1 ? 'neutral' : 'destructive'}
            />
          )}
        </div>
      ) : (
        <div className="text-[10px] text-muted-foreground text-center py-2">
          Fill in the fields above to calculate position size
        </div>
      )}

      <Button
        variant="outline"
        size="sm"
        className="w-full text-xs font-mono mt-auto shrink-0"
        onClick={() => {
          setAccountSize('')
          setRiskPct('1')
          setEntryPrice('')
          setStopPrice('')
          setTargetPrice('')
        }}
      >
        Clear
      </Button>
    </div>
  )
}

function Row({
  label,
  value,
  accent,
}: {
  label: string
  value: string
  accent?: 'positive' | 'destructive' | 'neutral'
}) {
  return (
    <div className="flex justify-between items-center text-xs font-mono">
      <span className="text-muted-foreground">{label}</span>
      <span
        className={cn(
          'tabular-nums font-semibold',
          accent === 'positive'    ? 'text-primary'     :
          accent === 'destructive' ? 'text-destructive' :
          accent === 'neutral'     ? 'text-yellow-500'  :
          'text-foreground',
        )}
      >
        {value}
      </span>
    </div>
  )
}
