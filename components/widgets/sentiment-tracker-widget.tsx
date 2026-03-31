'use client'
import { cn } from '@/lib/utils'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface SentimentData {
  symbol: string
  score: number
  trend: 'up' | 'down' | 'flat'
  bullish: number
  bearish: number
}

const SENTIMENT_DATA: SentimentData[] = [
  { symbol: 'AAPL',  score: 72, trend: 'up',   bullish: 68, bearish: 32 },
  { symbol: 'NVDA',  score: 81, trend: 'up',   bullish: 79, bearish: 21 },
  { symbol: 'TSLA',  score: 45, trend: 'down', bullish: 43, bearish: 57 },
  { symbol: 'META',  score: 63, trend: 'up',   bullish: 61, bearish: 39 },
  { symbol: 'AMZN',  score: 67, trend: 'flat', bullish: 64, bearish: 36 },
  { symbol: 'MSFT',  score: 75, trend: 'up',   bullish: 73, bearish: 27 },
  { symbol: 'GME',   score: 38, trend: 'down', bullish: 35, bearish: 65 },
  { symbol: 'BTC',   score: 58, trend: 'flat', bullish: 55, bearish: 45 },
]

function scoreColor(score: number): string {
  if (score >= 70) return 'text-primary'
  if (score >= 50) return 'text-yellow-400'
  return 'text-destructive'
}

export function SentimentTrackerWidget() {
  return (
    <div className="flex flex-col h-full font-mono text-xs">
      <div className="grid grid-cols-[3rem_3rem_3rem_1fr_3rem] gap-x-1 px-3 py-1 text-[9px] text-muted-foreground border-b border-border uppercase tracking-wide shrink-0">
        <span>Sym</span>
        <span className="text-right">Score</span>
        <span className="text-center">Trend</span>
        <span className="px-1">Bull/Bear Split</span>
        <span className="text-right">Bear%</span>
      </div>
      <div className="flex-1 overflow-y-auto">
        {SENTIMENT_DATA.map((s, i) => (
          <div
            key={s.symbol}
            className={cn(
              'grid grid-cols-[3rem_3rem_3rem_1fr_3rem] gap-x-1 px-3 py-1.5 border-b border-border/30 hover:bg-muted/10 transition-colors items-center',
              i % 2 === 0 ? '' : 'bg-muted/5'
            )}
          >
            <span className="text-primary font-semibold">{s.symbol}</span>
            <span className={cn('text-right font-semibold', scoreColor(s.score))}>{s.score}</span>
            <span className="flex justify-center">
              {s.trend === 'up' && <TrendingUp className="w-3 h-3 text-primary" />}
              {s.trend === 'down' && <TrendingDown className="w-3 h-3 text-destructive" />}
              {s.trend === 'flat' && <Minus className="w-3 h-3 text-muted-foreground" />}
            </span>
            {/* Bull/Bear bar */}
            <div className="px-1">
              <div className="flex h-2 rounded overflow-hidden border border-border/50">
                <div className="bg-primary/60" style={{ width: `${s.bullish}%` }} />
                <div className="bg-destructive/60" style={{ width: `${s.bearish}%` }} />
              </div>
              <div className="flex justify-between text-[8px] text-muted-foreground mt-0.5">
                <span className="text-primary">{s.bullish}%</span>
              </div>
            </div>
            <span className="text-right text-destructive text-[10px]">{s.bearish}%</span>
          </div>
        ))}
      </div>
      <div className="text-[9px] text-muted-foreground px-3 py-1 border-t border-border shrink-0">
        Social + news sentiment 0–100 · Static sample data
      </div>
    </div>
  )
}
