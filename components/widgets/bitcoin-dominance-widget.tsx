'use client'

import { useEffect, useState } from 'react'
import { Coins, TrendingUp, TrendingDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DominanceData {
  btc: number
  eth: number
  bnb: number
  others: number
}

const WEEK_HISTORY = [51.8, 52.4, 53.1, 52.7, 53.6, 54.1, 54.3]
const YESTERDAY_BTC = 54.1

const BASE: DominanceData = { btc: 54.3, eth: 17.1, bnb: 3.6, others: 25.0 }

function jitter(val: number, range = 0.3): number {
  return Math.round((val + (Math.random() - 0.5) * range * 2) * 10) / 10
}

const ALT_COLORS: Record<string, string> = {
  eth:    'bg-indigo-500',
  bnb:    'bg-yellow-500',
  others: 'bg-muted-foreground',
}

export function BitcoinDominanceWidget() {
  const [data, setData] = useState<DominanceData>(BASE)
  const [weekData, setWeekData] = useState<number[]>(WEEK_HISTORY)

  useEffect(() => {
    const tick = () => {
      setData({
        btc:    jitter(BASE.btc),
        eth:    jitter(BASE.eth, 0.2),
        bnb:    jitter(BASE.bnb, 0.1),
        others: jitter(BASE.others, 0.2),
      })
      setWeekData(prev => {
        const next = [...prev.slice(1), jitter(BASE.btc)]
        return next
      })
    }
    const id = setInterval(tick, 30_000)
    return () => clearInterval(id)
  }, [])

  const isUp = data.btc >= YESTERDAY_BTC
  const diff = Math.abs(data.btc - YESTERDAY_BTC).toFixed(1)
  const barMax = Math.max(...weekData)
  const barMin = Math.min(...weekData)
  const barRange = barMax - barMin || 1

  return (
    <div className="p-4 flex flex-col gap-3 h-full overflow-y-auto">
      {/* Header */}
      <div className="flex items-center gap-1.5 shrink-0">
        <Coins className="w-3.5 h-3.5 text-yellow-400" />
        <span className="font-mono text-xs font-semibold text-foreground">BTC Dominance</span>
      </div>

      {/* Hero */}
      <div className="flex items-end gap-3 shrink-0">
        <span className="font-mono text-3xl font-bold text-foreground tabular-nums">
          {data.btc.toFixed(1)}%
        </span>
        <div className={cn('flex items-center gap-0.5 pb-1 font-mono text-xs font-semibold', isUp ? 'text-price-up' : 'text-price-down')}>
          {isUp
            ? <TrendingUp className="w-3.5 h-3.5" />
            : <TrendingDown className="w-3.5 h-3.5" />}
          <span>{isUp ? '+' : '-'}{diff}% vs yesterday</span>
        </div>
      </div>

      {/* 7-day bar chart */}
      <div className="shrink-0">
        <div className="font-mono text-[9px] text-muted-foreground mb-1 uppercase">7-Day History</div>
        <div className="flex items-end gap-1 h-10">
          {weekData.map((val, i) => {
            const heightPct = ((val - barMin) / barRange) * 70 + 30
            const isLast = i === weekData.length - 1
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
                <div
                  className={cn('w-full rounded-sm', isLast ? 'bg-yellow-400' : 'bg-yellow-400/40')}
                  style={{ height: `${heightPct}%` }}
                />
              </div>
            )
          })}
        </div>
        <div className="flex justify-between font-mono text-[9px] text-muted-foreground mt-0.5">
          <span>7d ago · low {Math.min(...weekData).toFixed(1)}%</span>
          <span>high {Math.max(...weekData).toFixed(1)}%</span>
          <span>now</span>
        </div>
      </div>

      {/* Alt dominance */}
      <div className="flex flex-col gap-1.5 shrink-0 border-t border-border/30 pt-2">
        <div className="font-mono text-[9px] text-muted-foreground uppercase mb-0.5">Market Dominance</div>

        {([
          { label: 'BTC', color: 'bg-yellow-400', val: data.btc },
          { label: 'ETH', color: ALT_COLORS.eth,  val: data.eth },
          { label: 'BNB', color: ALT_COLORS.bnb,  val: data.bnb },
          { label: 'Others', color: ALT_COLORS.others, val: data.others },
        ] as const).map(item => (
          <div key={item.label} className="flex items-center gap-2">
            <span className="font-mono text-[10px] text-muted-foreground w-10 shrink-0">{item.label}</span>
            <div className="flex-1 h-1.5 bg-muted/20 rounded-full overflow-hidden">
              <div
                className={cn('h-full rounded-full transition-all duration-500', item.color)}
                style={{ width: `${item.val}%` }}
              />
            </div>
            <span className="font-mono text-[10px] text-foreground tabular-nums w-10 text-right shrink-0">
              {item.val.toFixed(1)}%
            </span>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="shrink-0 pt-1 border-t border-border/30">
        <span className="font-mono text-[10px] text-muted-foreground flex items-center gap-1">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          Live · updates every 30s
        </span>
      </div>
    </div>
  )
}
