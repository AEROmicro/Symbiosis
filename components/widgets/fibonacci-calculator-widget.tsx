'use client'

import { useState } from 'react'
import { Calculator } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface FibLevel {
  ratio: number
  label: string
  type: 'support' | 'key' | 'resistance' | 'extension'
  price: number
}

const LEVELS: { ratio: number; label: string; type: FibLevel['type'] }[] = [
  { ratio: 0,     label: '0%',    type: 'support'   },
  { ratio: 0.236, label: '23.6%', type: 'support'   },
  { ratio: 0.382, label: '38.2%', type: 'key'       },
  { ratio: 0.5,   label: '50%',   type: 'key'       },
  { ratio: 0.618, label: '61.8%', type: 'key'       },
  { ratio: 0.786, label: '78.6%', type: 'resistance'},
  { ratio: 1,     label: '100%',  type: 'resistance'},
  { ratio: 1.618, label: '161.8%',type: 'extension' },
]

function calcLevels(high: number, low: number): FibLevel[] {
  const range = high - low
  return LEVELS.map(l => {
    const price = l.ratio <= 1
      ? high - range * l.ratio
      : high + range * 0.618   // 161.8% extension
    return { ...l, price: parseFloat(price.toFixed(2)) }
  })
}

function typeColor(type: FibLevel['type']): string {
  switch (type) {
    case 'support':    return 'text-price-up'
    case 'key':        return 'text-primary'
    case 'resistance': return 'text-price-down'
    case 'extension':  return 'text-yellow-400'
  }
}

function typeLabel(type: FibLevel['type']): string {
  switch (type) {
    case 'support':    return 'Support'
    case 'key':        return 'Key Level'
    case 'resistance': return 'Resistance'
    case 'extension':  return 'Extension'
  }
}

export function FibonacciCalculatorWidget() {
  const [highStr, setHighStr] = useState('195.50')
  const [lowStr,  setLowStr]  = useState('165.00')
  const [levels,  setLevels]  = useState<FibLevel[]>(() => calcLevels(195.50, 165.00))
  const [error,   setError]   = useState<string | null>(null)

  const handleCalculate = () => {
    const high = parseFloat(highStr)
    const low  = parseFloat(lowStr)
    if (isNaN(high) || isNaN(low)) { setError('Enter valid numbers.'); return }
    if (low >= high)               { setError('High must be greater than Low.'); return }
    setError(null)
    setLevels(calcLevels(high, low))
  }

  const high = parseFloat(highStr) || 0
  const low  = parseFloat(lowStr)  || 0
  const range = high - low

  return (
    <div className="p-4 flex flex-col gap-3 h-full overflow-y-auto">
      {/* Header */}
      <div className="flex items-center gap-1.5 shrink-0">
        <Calculator className="w-3.5 h-3.5 text-primary" />
        <span className="font-mono text-xs font-semibold text-foreground">Fibonacci Calculator</span>
      </div>

      {/* Inputs */}
      <div className="grid grid-cols-2 gap-2 shrink-0">
        <div className="flex flex-col gap-1">
          <label className="font-mono text-[9px] text-muted-foreground uppercase">High Price</label>
          <input
            type="number"
            value={highStr}
            onChange={e => setHighStr(e.target.value)}
            className="border border-border bg-background px-2 py-1 rounded font-mono text-xs w-full text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="font-mono text-[9px] text-muted-foreground uppercase">Low Price</label>
          <input
            type="number"
            value={lowStr}
            onChange={e => setLowStr(e.target.value)}
            className="border border-border bg-background px-2 py-1 rounded font-mono text-xs w-full text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
          />
        </div>
      </div>

      {error && (
        <p className="font-mono text-[10px] text-price-down shrink-0">{error}</p>
      )}

      <Button
        variant="outline"
        size="sm"
        className="w-full font-mono text-xs shrink-0"
        onClick={handleCalculate}
      >
        <Calculator className="w-3 h-3 mr-1" />
        Calculate
      </Button>

      {/* Visual range bar */}
      {range > 0 && (
        <div className="shrink-0 rounded border border-border bg-muted/10 px-3 py-2">
          <div className="flex justify-between font-mono text-[10px] text-muted-foreground mb-1.5">
            <span className="text-price-up">${low.toFixed(2)}</span>
            <span className="text-muted-foreground">Range: ${range.toFixed(2)}</span>
            <span className="text-price-down">${high.toFixed(2)}</span>
          </div>
          <div className="relative h-2 rounded-full bg-muted overflow-visible">
            <div className="absolute inset-0 bg-gradient-to-r from-price-up/40 via-primary/40 to-price-down/40 rounded-full" />
            {levels.slice(0, -1).map(l => {
              const pct = range > 0 ? ((l.price - low) / range) * 100 : 0
              return (
                <div
                  key={l.label}
                  className="absolute top-1/2 -translate-y-1/2 w-0.5 h-3 bg-border/80"
                  style={{ left: `${pct}%` }}
                />
              )
            })}
          </div>
        </div>
      )}

      {/* Column headers */}
      <div className="grid grid-cols-[3.5rem_5rem_1fr] gap-x-2 px-2 shrink-0">
        {['LEVEL', 'PRICE', 'TYPE'].map(c => (
          <span key={c} className="font-mono text-[9px] text-muted-foreground uppercase">{c}</span>
        ))}
      </div>

      {/* Levels table */}
      <div className="flex flex-col flex-1">
        {levels.map((l, i) => (
          <div
            key={l.label}
            className={cn(
              'grid grid-cols-[3.5rem_5rem_1fr] gap-x-2 font-mono text-xs border-b border-border/30 py-1.5 px-2 hover:bg-muted/10 transition-colors items-center',
              i === 0 && 'border-t border-border/30',
            )}
          >
            <span className="text-muted-foreground text-[10px]">{l.label}</span>
            <span className="text-foreground tabular-nums text-[10px] font-semibold">${l.price.toFixed(2)}</span>
            <span>
              <span className={cn(
                'px-1.5 py-0.5 rounded border text-[9px] leading-none font-semibold border-current/30',
                typeColor(l.type),
              )}>
                {typeLabel(l.type)}
              </span>
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
