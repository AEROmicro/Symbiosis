'use client'
import { cn } from '@/lib/utils'

interface EarningsSurprise {
  symbol: string
  name: string
  quarter: string
  epsEst: number
  epsActual: number
}

const SURPRISES: EarningsSurprise[] = [
  { symbol: 'META',  name: 'Meta Platforms',    quarter: "Q4'24", epsEst: 6.76,  epsActual: 8.02  },
  { symbol: 'MSFT',  name: 'Microsoft',         quarter: "Q2'25", epsEst: 3.11,  epsActual: 3.23  },
  { symbol: 'GOOGL', name: 'Alphabet',          quarter: "Q4'24", epsEst: 2.12,  epsActual: 2.15  },
  { symbol: 'AMZN',  name: 'Amazon',            quarter: "Q4'24", epsEst: 1.49,  epsActual: 1.86  },
  { symbol: 'AAPL',  name: 'Apple',             quarter: "Q1'25", epsEst: 2.35,  epsActual: 2.40  },
  { symbol: 'NVDA',  name: 'NVIDIA',            quarter: "Q4'24", epsEst: 0.85,  epsActual: 0.89  },
  { symbol: 'TSLA',  name: 'Tesla',             quarter: "Q4'24", epsEst: 0.73,  epsActual: 0.71  },
  { symbol: 'INTC',  name: 'Intel',             quarter: "Q4'24", epsEst: 0.12,  epsActual: 0.13  },
]

export function EarningsSurpriseWidget() {
  return (
    <div className="flex flex-col h-full font-mono text-xs">
      <div className="grid grid-cols-[3rem_1fr_3.5rem_4rem_4rem_4.5rem] gap-x-1 px-3 py-1 text-[9px] text-muted-foreground border-b border-border uppercase tracking-wide shrink-0">
        <span>Sym</span>
        <span>Name</span>
        <span className="text-right">Qtr</span>
        <span className="text-right">Est</span>
        <span className="text-right">Actual</span>
        <span className="text-right">Surprise</span>
      </div>
      <div className="flex-1 overflow-y-auto">
        {SURPRISES.map((s, i) => {
          const surprise = ((s.epsActual - s.epsEst) / Math.abs(s.epsEst)) * 100
          return (
            <div
              key={s.symbol + i}
              className={cn(
                'grid grid-cols-[3rem_1fr_3.5rem_4rem_4rem_4.5rem] gap-x-1 px-3 py-1.5 border-b border-border/30 hover:bg-muted/10 transition-colors items-center',
                i % 2 === 0 ? '' : 'bg-muted/5'
              )}
            >
              <span className="text-primary font-semibold">{s.symbol}</span>
              <span className="text-muted-foreground truncate">{s.name}</span>
              <span className="text-right text-muted-foreground">{s.quarter}</span>
              <span className="text-right text-foreground">${s.epsEst.toFixed(2)}</span>
              <span className="text-right text-foreground">${s.epsActual.toFixed(2)}</span>
              <span className={cn('text-right font-semibold', surprise >= 0 ? 'text-primary' : 'text-destructive')}>
                {surprise >= 0 ? '+' : ''}{surprise.toFixed(1)}%
              </span>
            </div>
          )
        })}
      </div>
      <div className="text-[9px] text-muted-foreground px-3 py-1 border-t border-border shrink-0">
        EPS surprise = (actual − est) / |est| · Static data
      </div>
    </div>
  )
}
