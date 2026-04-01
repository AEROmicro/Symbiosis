'use client'

import { useEffect, useRef, useState } from 'react'
import { Activity } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DarkPoolEntry {
  id: number
  time: string
  symbol: string
  shares: string
  price: string
  side: 'BUY' | 'SELL'
  source: 'DARK' | 'LIT'
}

const SEED_DATA: Omit<DarkPoolEntry, 'id'>[] = [
  { time: '09:31', symbol: 'SPY',   shares: '850K', price: '541.20', side: 'BUY',  source: 'DARK' },
  { time: '09:33', symbol: 'AAPL',  shares: '320K', price: '211.45', side: 'SELL', source: 'DARK' },
  { time: '09:35', symbol: 'NVDA',  shares: '180K', price: '138.70', side: 'BUY',  source: 'LIT'  },
  { time: '09:37', symbol: 'TSLA',  shares: '420K', price: '247.80', side: 'SELL', source: 'DARK' },
  { time: '09:40', symbol: 'META',  shares: '210K', price: '570.30', side: 'BUY',  source: 'DARK' },
  { time: '09:43', symbol: 'AMZN',  shares: '155K', price: '196.50', side: 'BUY',  source: 'LIT'  },
  { time: '09:46', symbol: 'MSFT',  shares: '290K', price: '430.10', side: 'SELL', source: 'DARK' },
  { time: '09:49', symbol: 'GOOGL', shares: '175K', price: '178.90', side: 'BUY',  source: 'DARK' },
  { time: '09:52', symbol: 'QQQ',   shares: '600K', price: '474.60', side: 'SELL', source: 'LIT'  },
  { time: '09:55', symbol: 'NFLX',  shares: '95K',  price: '720.40', side: 'BUY',  source: 'DARK' },
]

const INCOMING: Omit<DarkPoolEntry, 'id'>[] = [
  { time: '', symbol: 'AMD',   shares: '310K', price: '162.30', side: 'BUY',  source: 'DARK' },
  { time: '', symbol: 'SPY',   shares: '1.2M', price: '540.85', side: 'SELL', source: 'DARK' },
  { time: '', symbol: 'NVDA',  shares: '250K', price: '139.10', side: 'BUY',  source: 'LIT'  },
  { time: '', symbol: 'AAPL',  shares: '400K', price: '210.90', side: 'SELL', source: 'DARK' },
  { time: '', symbol: 'TSLA',  shares: '510K', price: '249.20', side: 'BUY',  source: 'DARK' },
  { time: '', symbol: 'AMZN',  shares: '220K', price: '197.80', side: 'BUY',  source: 'DARK' },
  { time: '', symbol: 'META',  shares: '190K', price: '568.40', side: 'SELL', source: 'LIT'  },
  { time: '', symbol: 'MSFT',  shares: '350K', price: '431.70', side: 'BUY',  source: 'DARK' },
  { time: '', symbol: 'GOOGL', shares: '145K', price: '179.50', side: 'SELL', source: 'DARK' },
  { time: '', symbol: 'COIN',  shares: '88K',  price: '238.60', side: 'BUY',  source: 'LIT'  },
  { time: '', symbol: 'SPY',   shares: '750K', price: '541.50', side: 'BUY',  source: 'DARK' },
  { time: '', symbol: 'IWM',   shares: '480K', price: '208.30', side: 'SELL', source: 'DARK' },
]

function nowTime(): string {
  return new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
}

export function DarkPoolScannerWidget() {
  const [entries, setEntries] = useState<DarkPoolEntry[]>(() =>
    SEED_DATA.map((d, i) => ({ ...d, id: i + 1 }))
  )
  const idCounter = useRef(SEED_DATA.length + 1)
  const incomingIdx = useRef(0)

  useEffect(() => {
    const tick = () => {
      const next = INCOMING[incomingIdx.current % INCOMING.length]
      incomingIdx.current++
      const entry: DarkPoolEntry = { ...next, id: idCounter.current++, time: nowTime() }
      setEntries(prev => [entry, ...prev].slice(0, 40))
    }
    const id = setInterval(tick, 8000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="p-4 flex flex-col gap-3 h-full overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between shrink-0">
        <div className="flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5 text-purple-400" />
          <span className="font-mono text-xs font-semibold text-foreground">Dark Pool Scanner</span>
        </div>
        <span className="font-mono text-[10px] text-muted-foreground">{entries.length} entries</span>
      </div>

      {/* Column headers */}
      <div className="grid grid-cols-[3.5rem_3.5rem_3.5rem_4rem_3rem_4.5rem] gap-x-1 px-2 shrink-0">
        {['TIME', 'SYMBOL', 'SHARES', 'PRICE', 'SIDE', 'SOURCE'].map(col => (
          <span key={col} className="font-mono text-[9px] text-muted-foreground uppercase leading-none">{col}</span>
        ))}
      </div>

      {/* Rows */}
      <div className="flex flex-col gap-0 flex-1">
        {entries.map((e, i) => (
          <div
            key={e.id}
            className={cn(
              'grid grid-cols-[3.5rem_3.5rem_3.5rem_4rem_3rem_4.5rem] gap-x-1 font-mono text-xs border-b border-border/30 py-1.5 px-2 hover:bg-muted/10 transition-colors',
              i === 0 && 'bg-purple-900/10'
            )}
          >
            <span className="text-muted-foreground text-[10px] tabular-nums">{e.time}</span>
            <span className="text-primary font-semibold text-[10px]">{e.symbol}</span>
            <span className="text-foreground tabular-nums text-[10px]">{e.shares}</span>
            <span className="text-foreground tabular-nums text-[10px]">${e.price}</span>
            <span>
              <span className={cn(
                'px-1.5 py-0.5 rounded border text-[9px] leading-none font-semibold',
                e.side === 'BUY'
                  ? 'text-green-400 bg-green-900/30 border-green-700/40'
                  : 'text-red-400 bg-red-900/30 border-red-700/40'
              )}>
                {e.side}
              </span>
            </span>
            <span>
              <span className={cn(
                'px-1.5 py-0.5 rounded border text-[9px] leading-none font-semibold',
                e.source === 'DARK'
                  ? 'text-purple-400 bg-purple-900/30 border-purple-700/40'
                  : 'text-sky-400 bg-sky-900/30 border-sky-700/40'
              )}>
                {e.source}
              </span>
            </span>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between shrink-0 pt-1 border-t border-border/30">
        <span className="font-mono text-[10px] text-muted-foreground flex items-center gap-1">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          Live · updates every 8s
        </span>
        <span className="font-mono text-[10px] text-muted-foreground">{entries.length} total</span>
      </div>
    </div>
  )
}
