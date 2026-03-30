'use client'
import { useState, useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'

type Sentiment = 'Bullish' | 'Bearish' | 'Neutral'

interface FlowEntry {
  id: number
  ticker: string
  contract: string
  premium: number
  sentiment: Sentiment
  time: string
}

const SEED_ENTRIES: Omit<FlowEntry, 'id'>[] = [
  { ticker: 'AAPL',  contract: 'AAPL 200C 05/17',  premium: 4.2,  sentiment: 'Bullish', time: '09:32' },
  { ticker: 'NVDA',  contract: 'NVDA 900C 04/19',  premium: 8.7,  sentiment: 'Bullish', time: '09:35' },
  { ticker: 'SPY',   contract: 'SPY 490P 04/26',   premium: 6.1,  sentiment: 'Bearish', time: '09:41' },
  { ticker: 'TSLA',  contract: 'TSLA 240C 05/03',  premium: 3.4,  sentiment: 'Bullish', time: '09:44' },
  { ticker: 'META',  contract: 'META 520C 04/19',  premium: 5.5,  sentiment: 'Bullish', time: '09:48' },
  { ticker: 'QQQ',   contract: 'QQQ 430P 04/26',   premium: 7.2,  sentiment: 'Bearish', time: '09:52' },
  { ticker: 'AMZN',  contract: 'AMZN 195C 05/17',  premium: 2.9,  sentiment: 'Bullish', time: '09:57' },
  { ticker: 'MSFT',  contract: 'MSFT 420P 04/19',  premium: 4.8,  sentiment: 'Bearish', time: '10:03' },
  { ticker: 'GS',    contract: 'GS 480C 04/26',    premium: 1.7,  sentiment: 'Bullish', time: '10:09' },
  { ticker: 'XLF',   contract: 'XLF 42P 05/17',    premium: 3.3,  sentiment: 'Bearish', time: '10:14' },
  { ticker: 'GOOGL', contract: 'GOOGL 165C 04/19', premium: 2.1,  sentiment: 'Neutral', time: '10:18' },
  { ticker: 'AMD',   contract: 'AMD 175C 05/03',   premium: 5.9,  sentiment: 'Bullish', time: '10:22' },
]

const INCOMING: Omit<FlowEntry, 'id' | 'time'>[] = [
  { ticker: 'COIN',  contract: 'COIN 240C 05/17',  premium: 6.3,  sentiment: 'Bullish' },
  { ticker: 'PLTR',  contract: 'PLTR 25C 04/26',   premium: 2.4,  sentiment: 'Bullish' },
  { ticker: 'SPY',   contract: 'SPY 480P 05/17',   premium: 9.1,  sentiment: 'Bearish' },
  { ticker: 'NFLX',  contract: 'NFLX 620C 04/19',  premium: 3.7,  sentiment: 'Neutral' },
  { ticker: 'UBER',  contract: 'UBER 80C 05/03',   premium: 1.9,  sentiment: 'Bullish' },
  { ticker: 'DIS',   contract: 'DIS 105P 04/26',   premium: 2.6,  sentiment: 'Bearish' },
]

const sentimentStyles: Record<Sentiment, string> = {
  Bullish: 'text-green-400 bg-green-900/30 border-green-700/40',
  Bearish: 'text-red-400 bg-red-900/30 border-red-700/40',
  Neutral: 'text-amber-400 bg-amber-900/30 border-amber-700/40',
}

type Filter = 'All' | Sentiment

let nextId = SEED_ENTRIES.length + 1

export function OptionsFlowWidget() {
  const [entries, setEntries] = useState<FlowEntry[]>(
    SEED_ENTRIES.map((e, i) => ({ ...e, id: i + 1 }))
  )
  const [filter, setFilter] = useState<Filter>('All')
  const incomingIdx = useRef(0)

  useEffect(() => {
    const id = setInterval(() => {
      const src = INCOMING[incomingIdx.current % INCOMING.length]
      incomingIdx.current++
      const newEntry: FlowEntry = {
        ...src,
        id: nextId++,
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
      }
      setEntries(prev => [newEntry, ...prev].slice(0, 15))
    }, 20_000)
    return () => clearInterval(id)
  }, [])

  const visible = filter === 'All' ? entries : entries.filter(e => e.sentiment === filter)

  return (
    <div className="flex flex-col h-full font-mono text-xs">
      <div className="flex gap-1 px-3 pt-2 pb-1">
        {(['All', 'Bullish', 'Bearish'] as Filter[]).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              'px-2 py-0.5 rounded border text-[10px] transition-colors',
              filter === f
                ? 'bg-primary/20 text-primary border-primary/40'
                : 'border-border text-muted-foreground hover:text-foreground'
            )}
          >
            {f}
          </button>
        ))}
        <span className="ml-auto text-[9px] text-muted-foreground self-center">Unusual Flow</span>
      </div>

      <div className="grid grid-cols-[3rem_7rem_3rem_4.5rem_3rem] gap-x-1 px-3 py-1 text-[9px] text-muted-foreground border-b border-border uppercase tracking-wide">
        <span>Ticker</span>
        <span>Contract</span>
        <span className="text-right">Prem</span>
        <span className="text-center">Signal</span>
        <span className="text-right">Time</span>
      </div>

      <div className="flex-1 overflow-y-auto">
        {visible.map(e => (
          <div
            key={e.id}
            className="grid grid-cols-[3rem_7rem_3rem_4.5rem_3rem] gap-x-1 px-3 py-1.5 border-b border-border/30 hover:bg-muted/10 items-center transition-colors"
          >
            <span className="text-primary font-semibold">{e.ticker}</span>
            <span className="text-muted-foreground text-[9px] truncate">{e.contract}</span>
            <span className="text-right text-foreground">${e.premium.toFixed(1)}M</span>
            <span className="flex justify-center">
              <span className={cn('px-1 py-0.5 rounded border text-[8px] leading-none', sentimentStyles[e.sentiment])}>
                {e.sentiment}
              </span>
            </span>
            <span className="text-right text-muted-foreground text-[9px]">{e.time}</span>
          </div>
        ))}
      </div>

      <div className="text-[9px] text-muted-foreground px-3 py-1 border-t border-border flex justify-between">
        <span>Live stream · updates every 20s</span>
        <span>{visible.length} entries</span>
      </div>
    </div>
  )
}
