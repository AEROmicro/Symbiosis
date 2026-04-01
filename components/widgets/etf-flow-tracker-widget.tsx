'use client'

import { useEffect, useState } from 'react'
import { RefreshCw, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface EtfEntry {
  ticker: string
  name: string
  flow: number   // $M
  aum: number    // $B
  change: number // 1D %
}

const BASE_DATA: EtfEntry[] = [
  { ticker: 'SPY',  name: 'SPDR S&P 500 ETF',            flow:  842, aum: 548.3, change:  0.42 },
  { ticker: 'QQQ',  name: 'Invesco QQQ Trust',            flow:  234, aum: 234.7, change:  0.61 },
  { ticker: 'IWM',  name: 'iShares Russell 2000 ETF',     flow: -156, aum:  54.2, change: -0.38 },
  { ticker: 'GLD',  name: 'SPDR Gold Shares ETF',         flow:   89, aum:  66.1, change:  0.27 },
  { ticker: 'TLT',  name: 'iShares 20+ Year Treasury ETF',flow: -312, aum:  44.8, change: -0.83 },
  { ticker: 'XLF',  name: 'Financial Select Sector SPDR', flow:   67, aum:  41.5, change:  0.19 },
  { ticker: 'XLE',  name: 'Energy Select Sector SPDR',    flow:  -45, aum:  35.9, change: -0.22 },
  { ticker: 'ARKK', name: 'ARK Innovation ETF',           flow:  -23, aum:   6.4, change: -1.14 },
]

function jitter(val: number, range: number): number {
  return parseFloat((val + (Math.random() * range * 2 - range)).toFixed(2))
}

function applyJitter(data: EtfEntry[]): EtfEntry[] {
  return data.map(e => ({
    ...e,
    flow:   parseFloat((e.flow   + (Math.random() * 20 - 10)).toFixed(0)),
    change: parseFloat((e.change + (Math.random() * 0.1 - 0.05)).toFixed(2)),
    aum:    jitter(e.aum, 0.5),
  }))
}

export function EtfFlowTrackerWidget() {
  const [data, setData] = useState<EtfEntry[]>(BASE_DATA)

  useEffect(() => {
    const id = setInterval(() => setData(applyJitter(BASE_DATA)), 60_000)
    return () => clearInterval(id)
  }, [])

  const totalInflows  = data.filter(e => e.flow > 0).reduce((s, e) => s + e.flow, 0)
  const totalOutflows = data.filter(e => e.flow < 0).reduce((s, e) => s + e.flow, 0)

  return (
    <div className="p-4 flex flex-col gap-3 h-full overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between shrink-0">
        <div className="flex items-center gap-1.5">
          <TrendingUp className="w-3.5 h-3.5 text-primary" />
          <span className="font-mono text-xs font-semibold text-foreground">ETF Flow Tracker</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-5 w-5"
          onClick={() => setData(applyJitter(BASE_DATA))}
        >
          <RefreshCw className="w-3 h-3 text-muted-foreground" />
        </Button>
      </div>

      {/* Summary bar */}
      <div className="flex items-center gap-2 rounded border border-border bg-muted/10 px-3 py-2 shrink-0">
        <span className="font-mono text-[10px] text-muted-foreground">
          Total Inflows:
          <span className="text-price-up ml-1 font-semibold">
            +${totalInflows.toFixed(0)}M
          </span>
        </span>
        <span className="text-muted-foreground/40 text-[10px]">|</span>
        <span className="font-mono text-[10px] text-muted-foreground">
          Total Outflows:
          <span className="text-price-down ml-1 font-semibold">
            ${totalOutflows.toFixed(0)}M
          </span>
        </span>
      </div>

      {/* Column headers */}
      <div className="grid grid-cols-[3.5rem_1fr_4.5rem_3.5rem_4rem] gap-x-2 px-2 shrink-0">
        {['TICKER', 'FUND NAME', '1D FLOW', 'AUM', '1D%'].map(col => (
          <span key={col} className="font-mono text-[9px] text-muted-foreground uppercase leading-none">
            {col}
          </span>
        ))}
      </div>

      {/* Rows */}
      <div className="flex flex-col flex-1">
        {data.map((e, i) => (
          <div
            key={e.ticker}
            className={cn(
              'grid grid-cols-[3.5rem_1fr_4.5rem_3.5rem_4rem] gap-x-2 font-mono text-xs border-b border-border/30 py-1.5 px-2 hover:bg-muted/10 transition-colors items-center',
              i === 0 && 'border-t border-border/30',
            )}
          >
            <span className="text-primary font-semibold text-[10px]">{e.ticker}</span>
            <span className="text-muted-foreground text-[10px] truncate">{e.name}</span>
            <span
              className={cn(
                'tabular-nums text-[10px] font-semibold text-right',
                e.flow >= 0 ? 'text-price-up' : 'text-price-down',
              )}
            >
              {e.flow >= 0 ? '+' : ''}${e.flow.toFixed(0)}M
            </span>
            <span className="text-foreground tabular-nums text-[10px] text-right">
              ${e.aum.toFixed(1)}B
            </span>
            <span
              className={cn(
                'tabular-nums text-[10px] font-semibold text-right',
                e.change >= 0 ? 'text-price-up' : 'text-price-down',
              )}
            >
              {e.change >= 0 ? '+' : ''}{e.change.toFixed(2)}%
            </span>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="shrink-0 pt-1 border-t border-border/30">
        <span className="font-mono text-[10px] text-muted-foreground flex items-center gap-1">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          Simulated · jitter every 60s
        </span>
      </div>
    </div>
  )
}
