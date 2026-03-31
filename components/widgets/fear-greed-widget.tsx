'use client'

import { useEffect, useState } from 'react'
import { RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface FearGreedData {
  score: number       // 0 – 100
  label: string
  vix: number | null
  spyChange: number | null
}

function scoreToLabel(score: number): string {
  if (score <= 20) return 'Extreme Fear'
  if (score <= 40) return 'Fear'
  if (score <= 60) return 'Neutral'
  if (score <= 80) return 'Greed'
  return 'Extreme Greed'
}

function scoreToColor(score: number): string {
  if (score <= 20) return 'text-red-500'
  if (score <= 40) return 'text-orange-500'
  if (score <= 60) return 'text-yellow-500'
  if (score <= 80) return 'text-lime-500'
  return 'text-primary'
}

function scoreToTrackColor(score: number): string {
  if (score <= 20) return 'bg-red-500'
  if (score <= 40) return 'bg-orange-500'
  if (score <= 60) return 'bg-yellow-500'
  if (score <= 80) return 'bg-lime-500'
  return 'bg-primary'
}

// Derive a simplified Fear & Greed score from VIX and SPY daily change.
// VIX > 30 ≈ fear, VIX < 15 ≈ greed. SPY down ≈ fear, up ≈ greed.
function deriveScore(vix: number, spyChange: number): number {
  // VIX component: 0 (high VIX = fear) → 100 (low VIX = greed)
  // Clamp VIX between 10 and 50
  const vixClamped = Math.min(50, Math.max(10, vix))
  const vixScore = ((50 - vixClamped) / 40) * 100

  // SPY momentum component: clamp daily change between -5% and +5%
  const spyClamped = Math.min(5, Math.max(-5, spyChange))
  const spyScore = ((spyClamped + 5) / 10) * 100

  // Weighted average: VIX 60%, SPY momentum 40%
  return Math.round(vixScore * 0.6 + spyScore * 0.4)
}

export function FearGreedWidget() {
  const [data, setData] = useState<FearGreedData | null>(null)
  const [loading, setLoading] = useState(false)

  const fetchData = async () => {
    setLoading(true)
    try {
      const [vixRes, spyRes] = await Promise.all([
        fetch('/api/stock/%5EVIX'),
        fetch('/api/stock/SPY'),
      ])
      const vixData = vixRes.ok ? await vixRes.json() : null
      const spyData = spyRes.ok ? await spyRes.json() : null

      const vix: number | null = vixData?.price ?? null
      const spyChange: number | null = spyData?.changePercent ?? null

      const score =
        vix !== null && spyChange !== null
          ? deriveScore(vix, spyChange)
          : 50

      setData({ score, label: scoreToLabel(score), vix, spyChange })
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  useEffect(() => {
    const id = setInterval(fetchData, 60_000)
    return () => clearInterval(id)
  }, [])

  const score = data?.score ?? 50
  const label = data?.label ?? 'Neutral'
  const color = scoreToColor(score)
  const trackColor = scoreToTrackColor(score)

  return (
    <div className="p-4 flex flex-col gap-4 h-full">
      {/* Gauge bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-[10px] font-mono text-muted-foreground">
          <span>FEAR</span>
          <span>NEUTRAL</span>
          <span>GREED</span>
        </div>
        <div className="relative h-3 rounded-full bg-muted overflow-hidden">
          <div
            className={cn('h-full rounded-full transition-all duration-500', trackColor)}
            style={{ width: `${score}%` }}
          />
        </div>
        <div className="text-right text-[10px] font-mono text-muted-foreground">
          {score}/100
        </div>
      </div>

      {/* Score label */}
      <div className="text-center">
        <div className={cn('text-2xl font-bold font-mono tabular-nums', color)}>
          {score}
        </div>
        <div className={cn('text-sm font-semibold mt-0.5', color)}>{label}</div>
        <div className="text-[10px] text-muted-foreground mt-1 font-mono">
          Fear &amp; Greed Index
        </div>
      </div>

      {/* Inputs */}
      <div className="space-y-1.5 text-xs font-mono">
        <div className="flex justify-between border border-border rounded px-3 py-1.5">
          <span className="text-muted-foreground">VIX</span>
          <span className="text-foreground tabular-nums">
            {data?.vix != null ? data.vix.toFixed(2) : '–'}
          </span>
        </div>
        <div className="flex justify-between border border-border rounded px-3 py-1.5">
          <span className="text-muted-foreground">SPY Chg</span>
          <span
            className={cn(
              'tabular-nums',
              (data?.spyChange ?? 0) >= 0 ? 'text-price-up' : 'text-price-down',
            )}
          >
            {data?.spyChange != null
              ? `${data.spyChange >= 0 ? '+' : ''}${data.spyChange.toFixed(2)}%`
              : '–'}
          </span>
        </div>
      </div>

      <div className="mt-auto">
        <Button
          variant="outline"
          size="sm"
          className="w-full text-xs font-mono"
          onClick={fetchData}
          disabled={loading}
        >
          <RefreshCw className="w-3 h-3" />
          Refresh
        </Button>
      </div>
    </div>
  )
}
