'use client'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Indicator {
  label: string
  value: string
  prev: number
  curr: number
  unit: string
  updated: string
}

const INDICATORS: Indicator[] = [
  { label: 'GDP Growth (QoQ)',        value: '2.3%',         prev: 3.1,   curr: 2.3,   unit: '%',  updated: 'Mar 28' },
  { label: 'CPI Inflation (YoY)',     value: '3.1%',         prev: 3.4,   curr: 3.1,   unit: '%',  updated: 'Mar 12' },
  { label: 'Core CPI (YoY)',          value: '3.8%',         prev: 3.9,   curr: 3.8,   unit: '%',  updated: 'Mar 12' },
  { label: 'PCE (YoY)',               value: '2.8%',         prev: 2.9,   curr: 2.8,   unit: '%',  updated: 'Mar 29' },
  { label: 'Unemployment Rate',       value: '3.7%',         prev: 3.7,   curr: 3.7,   unit: '%',  updated: 'Apr 5'  },
  { label: 'Fed Funds Rate',          value: '5.25–5.50%',   prev: 5.25,  curr: 5.375, unit: '%',  updated: 'Mar 20' },
  { label: '10Y Real Yield',          value: '2.1%',         prev: 1.9,   curr: 2.1,   unit: '%',  updated: 'Apr 12' },
  { label: 'M2 Growth (YoY)',         value: '-0.4%',        prev: -1.4,  curr: -0.4,  unit: '%',  updated: 'Feb 27' },
  { label: 'ISM Mfg PMI',            value: '48.7',          prev: 47.8,  curr: 48.7,  unit: '',   updated: 'Apr 1'  },
  { label: 'ISM Services PMI',        value: '52.1',         prev: 52.6,  curr: 52.1,  unit: '',   updated: 'Apr 3'  },
  { label: 'Consumer Confidence',     value: '110.7',        prev: 104.8, curr: 110.7, unit: '',   updated: 'Mar 26' },
]

function Trend({ prev, curr }: { prev: number; curr: number }) {
  if (curr > prev) return <TrendingUp className="w-3 h-3 text-green-400" />
  if (curr < prev) return <TrendingDown className="w-3 h-3 text-red-400" />
  return <Minus className="w-3 h-3 text-muted-foreground" />
}

function trendColor(prev: number, curr: number) {
  if (curr > prev) return 'text-green-400'
  if (curr < prev) return 'text-red-400'
  return 'text-muted-foreground'
}

export function MacroIndicatorsWidget() {
  return (
    <div className="flex flex-col h-full font-mono text-xs">
      <div className="grid grid-cols-[1fr_auto_auto_4rem] gap-x-2 px-3 py-1 text-[9px] text-muted-foreground border-b border-border uppercase tracking-wide">
        <span>Indicator</span>
        <span className="text-right">Value</span>
        <span className="text-center">Trend</span>
        <span className="text-right">Updated</span>
      </div>

      <div className="flex-1 overflow-y-auto">
        {INDICATORS.map((ind, i) => (
          <div
            key={i}
            className="grid grid-cols-[1fr_auto_auto_4rem] gap-x-2 px-3 py-1.5 border-b border-border/30 hover:bg-muted/10 items-center transition-colors"
          >
            <span className="text-muted-foreground truncate">{ind.label}</span>
            <span className={cn('font-semibold tabular-nums', trendColor(ind.prev, ind.curr))}>
              {ind.value}
            </span>
            <span className="flex justify-center">
              <Trend prev={ind.prev} curr={ind.curr} />
            </span>
            <span className="text-right text-muted-foreground text-[9px]">{ind.updated}</span>
          </div>
        ))}
      </div>

      <div className="text-[9px] text-muted-foreground px-3 py-1 border-t border-border text-right">
        Sources: BLS · BEA · Fed · ISM · Conference Board
      </div>
    </div>
  )
}
