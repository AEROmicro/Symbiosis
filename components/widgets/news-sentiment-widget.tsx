'use client'

import { useEffect, useState } from 'react'
import { RefreshCw, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface SentimentEntry {
  symbol: string
  score: number // 0–100
}

const INITIAL_SCORES: SentimentEntry[] = [
  { symbol: 'AAPL',  score: 72 },
  { symbol: 'TSLA',  score: 58 },
  { symbol: 'NVDA',  score: 85 },
  { symbol: 'AMZN',  score: 68 },
  { symbol: 'MSFT',  score: 74 },
  { symbol: 'META',  score: 61 },
  { symbol: 'GOOGL', score: 66 },
]

function clamp(v: number): number {
  return Math.min(100, Math.max(0, Math.round(v)))
}

function fluctuate(entries: SentimentEntry[]): SentimentEntry[] {
  return entries.map(e => ({
    ...e,
    score: clamp(e.score + (Math.random() * 10 - 5)),
  }))
}

function scoreLabel(score: number): { text: string; color: string } {
  if (score > 60) return { text: 'Bullish',  color: 'text-price-up'   }
  if (score < 40) return { text: 'Bearish',  color: 'text-price-down' }
  return              { text: 'Neutral',  color: 'text-yellow-400' }
}

function scoreBarColor(score: number): string {
  if (score > 60) return 'bg-price-up'
  if (score < 40) return 'bg-price-down'
  return 'bg-yellow-400'
}

export function NewsSentimentWidget() {
  const [entries, setEntries]      = useState<SentimentEntry[]>(INITIAL_SCORES)
  const [lastUpdated, setLastUpdated] = useState<string | null>(null)

  const refresh = () => {
    setEntries(prev => fluctuate(prev))
    setLastUpdated(
      new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
    )
  }

  useEffect(() => {
    setLastUpdated(
      new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
    )
    const id = setInterval(refresh, 300_000)
    return () => clearInterval(id)
  }, [])

  const avgScore = clamp(entries.reduce((s, e) => s + e.score, 0) / entries.length)
  const { text: avgLabel, color: avgColor } = scoreLabel(avgScore)

  return (
    <div className="p-4 flex flex-col gap-3 h-full overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between shrink-0">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          <span className="font-mono text-xs font-semibold text-foreground uppercase tracking-wide">
            AI News Sentiment
          </span>
        </div>
        <div className="flex items-center gap-2">
          {lastUpdated && (
            <span className="font-mono text-[9px] text-muted-foreground">{lastUpdated}</span>
          )}
          <Button variant="ghost" size="icon" className="h-5 w-5" onClick={refresh}>
            <RefreshCw className="w-3 h-3 text-muted-foreground" />
          </Button>
        </div>
      </div>

      {/* Market Sentiment aggregate */}
      <div className="rounded border border-border bg-muted/10 px-3 py-3 shrink-0">
        <div className="flex items-center justify-between mb-1.5">
          <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
            Market Sentiment
          </span>
          <div className="flex items-center gap-1.5">
            <span className={cn('font-mono text-sm font-bold tabular-nums', avgColor)}>
              {avgScore}
            </span>
            <span className={cn(
              'px-1.5 py-0.5 rounded border text-[9px] leading-none font-semibold border-current/30',
              avgColor,
            )}>
              {avgLabel}
            </span>
          </div>
        </div>
        <div className="h-2.5 w-full rounded-full bg-muted overflow-hidden">
          <div
            className={cn('h-full rounded-full transition-all duration-500', scoreBarColor(avgScore))}
            style={{ width: `${avgScore}%` }}
          />
        </div>
        <div className="flex justify-between font-mono text-[9px] text-muted-foreground mt-1">
          <span>0 Bearish</span>
          <span>50 Neutral</span>
          <span>100 Bullish</span>
        </div>
      </div>

      {/* Per-symbol rows */}
      <div className="flex flex-col flex-1 gap-1.5">
        {entries.map(e => {
          const { text: lbl, color } = scoreLabel(e.score)
          return (
            <div
              key={e.symbol}
              className="flex items-center gap-2 px-2 py-1.5 rounded border border-border/40 hover:bg-muted/10 transition-colors"
            >
              <span className="font-mono text-[10px] font-semibold text-primary w-12 shrink-0">
                {e.symbol}
              </span>
              <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className={cn('h-full rounded-full transition-all duration-500', scoreBarColor(e.score))}
                  style={{ width: `${e.score}%` }}
                />
              </div>
              <span className="font-mono text-[10px] tabular-nums text-foreground w-6 text-right shrink-0">
                {e.score}
              </span>
              <span className={cn(
                'px-1.5 py-0.5 rounded border text-[9px] leading-none font-semibold border-current/30 w-14 text-center shrink-0',
                color,
              )}>
                {lbl}
              </span>
            </div>
          )
        })}
      </div>

      {/* Footer */}
      <div className="shrink-0 border-t border-border/30 pt-1">
        <span className="font-mono text-[10px] text-muted-foreground flex items-center gap-1">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          Simulated · refreshes every 5 min
        </span>
      </div>
    </div>
  )
}
