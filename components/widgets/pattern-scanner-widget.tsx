'use client'

import { useEffect, useState } from 'react'
import { ScanLine } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface PatternEntry {
  id: number
  symbol: string
  pattern: string
  timeframe: '1H' | '4H' | '1D' | '1W'
  strength: number
  signal: 'BUY' | 'SELL' | 'WATCH'
  confidence: number
}

type SignalFilter = 'ALL' | 'BUY' | 'SELL' | 'WATCH'

const INITIAL_PATTERNS: PatternEntry[] = [
  { id: 1,  symbol: 'NVDA',  pattern: 'Bull Flag',           timeframe: '4H', strength: 85, signal: 'BUY',   confidence: 82 },
  { id: 2,  symbol: 'SPY',   pattern: 'Ascending Triangle',  timeframe: '1D', strength: 72, signal: 'BUY',   confidence: 76 },
  { id: 3,  symbol: 'TSLA',  pattern: 'Head & Shoulders',    timeframe: '4H', strength: 68, signal: 'SELL',  confidence: 71 },
  { id: 4,  symbol: 'AAPL',  pattern: 'Cup & Handle',        timeframe: '1D', strength: 79, signal: 'BUY',   confidence: 84 },
  { id: 5,  symbol: 'QQQ',   pattern: 'Breakout',            timeframe: '1H', strength: 91, signal: 'BUY',   confidence: 88 },
  { id: 6,  symbol: 'META',  pattern: 'Bull Flag',           timeframe: '1D', strength: 76, signal: 'BUY',   confidence: 79 },
  { id: 7,  symbol: 'AMZN',  pattern: 'Double Bottom',       timeframe: '4H', strength: 65, signal: 'BUY',   confidence: 69 },
  { id: 8,  symbol: 'MSFT',  pattern: 'Channel Break',       timeframe: '1D', strength: 70, signal: 'BUY',   confidence: 74 },
  { id: 9,  symbol: 'IWM',   pattern: 'Wedge',               timeframe: '1D', strength: 55, signal: 'SELL',  confidence: 62 },
  { id: 10, symbol: 'GOOGL', pattern: 'Support Bounce',      timeframe: '1H', strength: 63, signal: 'WATCH', confidence: 67 },
]

const SCAN_PATTERNS: PatternEntry[] = [
  { id: 11, symbol: 'SPY',   pattern: 'Breakout',            timeframe: '4H', strength: 88, signal: 'BUY',   confidence: 91 },
  { id: 12, symbol: 'NVDA',  pattern: 'Ascending Triangle',  timeframe: '1D', strength: 82, signal: 'BUY',   confidence: 85 },
  { id: 13, symbol: 'AAPL',  pattern: 'Channel Break',       timeframe: '1H', strength: 74, signal: 'BUY',   confidence: 78 },
  { id: 14, symbol: 'TSLA',  pattern: 'Wedge',               timeframe: '1W', strength: 61, signal: 'SELL',  confidence: 65 },
  { id: 15, symbol: 'AMZN',  pattern: 'Bull Flag',           timeframe: '4H', strength: 77, signal: 'BUY',   confidence: 81 },
  { id: 16, symbol: 'MSFT',  pattern: 'Cup & Handle',        timeframe: '1D', strength: 83, signal: 'BUY',   confidence: 87 },
  { id: 17, symbol: 'QQQ',   pattern: 'Double Bottom',       timeframe: '1H', strength: 69, signal: 'BUY',   confidence: 73 },
  { id: 18, symbol: 'META',  pattern: 'Head & Shoulders',    timeframe: '4H', strength: 64, signal: 'SELL',  confidence: 68 },
  { id: 19, symbol: 'GOOGL', pattern: 'Support Bounce',      timeframe: '1D', strength: 71, signal: 'WATCH', confidence: 74 },
  { id: 20, symbol: 'IWM',   pattern: 'Ascending Triangle',  timeframe: '4H', strength: 58, signal: 'WATCH', confidence: 61 },
]

const SIGNAL_STYLES: Record<PatternEntry['signal'], string> = {
  BUY:   'text-green-400  bg-green-900/30  border-green-700/40',
  SELL:  'text-red-400    bg-red-900/30    border-red-700/40',
  WATCH: 'text-yellow-400 bg-yellow-900/30 border-yellow-700/40',
}

const STRENGTH_BAR: Record<PatternEntry['signal'], string> = {
  BUY:   'bg-green-500/70',
  SELL:  'bg-red-500/70',
  WATCH: 'bg-yellow-500/70',
}

export function PatternScannerWidget() {
  const [patterns, setPatterns] = useState<PatternEntry[]>(INITIAL_PATTERNS)
  const [filter, setFilter] = useState<SignalFilter>('ALL')
  const [scanning, setScanning] = useState(false)
  const [dots, setDots] = useState('')
  const [usedScan, setUsedScan] = useState(false)

  useEffect(() => {
    if (!scanning) return
    const id = setInterval(() => setDots(d => d.length >= 3 ? '' : d + '.'), 400)
    return () => clearInterval(id)
  }, [scanning])

  function handleScan() {
    setScanning(true)
    setTimeout(() => {
      setScanning(false)
      setDots('')
      setPatterns(usedScan ? INITIAL_PATTERNS : SCAN_PATTERNS)
      setUsedScan(prev => !prev)
    }, 2000)
  }

  const visible = patterns.filter(p => filter === 'ALL' || p.signal === filter)

  return (
    <div className="p-4 flex flex-col gap-3 h-full overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between shrink-0">
        <div className="flex items-center gap-1.5">
          <ScanLine className="w-3.5 h-3.5 text-primary" />
          <span className="font-mono text-xs font-semibold text-foreground">PATTERN SCANNER</span>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="font-mono text-[10px] h-6 px-2"
          onClick={handleScan}
          disabled={scanning}
        >
          {scanning ? `SCANNING${dots}` : 'SCAN'}
        </Button>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-1.5 shrink-0">
        {(['ALL', 'BUY', 'SELL', 'WATCH'] as SignalFilter[]).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              'px-2 py-0.5 rounded border font-mono text-[9px] leading-none transition-colors',
              filter === f
                ? 'bg-primary/20 border-primary/40 text-primary'
                : 'border-border text-muted-foreground hover:text-foreground',
            )}
          >
            {f}
          </button>
        ))}
        <span className="ml-auto font-mono text-[9px] text-muted-foreground">{visible.length} patterns</span>
      </div>

      {/* Column headers */}
      <div className="grid grid-cols-[3rem_7rem_2.5rem_5rem_4rem_4rem] gap-x-1.5 px-2 shrink-0">
        {['SYMBOL', 'PATTERN', 'TF', 'STRENGTH', 'SIGNAL', 'CONF%'].map(col => (
          <span key={col} className="font-mono text-[9px] text-muted-foreground uppercase leading-none">{col}</span>
        ))}
      </div>

      {/* Rows */}
      <div className="flex flex-col gap-0 flex-1">
        {scanning ? (
          <div className="flex-1 flex items-center justify-center">
            <span className="font-mono text-xs text-primary animate-pulse">SCANNING{dots}</span>
          </div>
        ) : (
          visible.map(p => (
            <div
              key={p.id}
              className="grid grid-cols-[3rem_7rem_2.5rem_5rem_4rem_4rem] gap-x-1.5 font-mono text-xs border-b border-border/30 py-1.5 px-2 hover:bg-muted/10 transition-colors items-center"
            >
              <span className="text-primary font-semibold text-[10px]">{p.symbol}</span>
              <span className="text-foreground text-[10px] truncate">{p.pattern}</span>
              <span className="text-muted-foreground text-[10px]">{p.timeframe}</span>
              <div className="flex items-center gap-1">
                <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className={cn('h-full rounded-full', STRENGTH_BAR[p.signal])}
                    style={{ width: `${p.strength}%` }}
                  />
                </div>
                <span className="text-[9px] text-muted-foreground tabular-nums w-6 text-right">{p.strength}%</span>
              </div>
              <span>
                <span className={cn('px-1.5 py-0.5 rounded border text-[9px] leading-none font-semibold', SIGNAL_STYLES[p.signal])}>
                  {p.signal}
                </span>
              </span>
              <span className="text-muted-foreground tabular-nums text-[10px] text-right">{p.confidence}%</span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
