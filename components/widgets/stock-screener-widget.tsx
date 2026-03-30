'use client'
import { useState } from 'react'
import { cn } from '@/lib/utils'

interface Stock {
  ticker: string
  name: string
  sector: string
  marketCap: number  // billions
  pe: number | null
  w52chg: number
}

const STOCKS: Stock[] = [
  { ticker: 'AAPL',  name: 'Apple',              sector: 'Technology',   marketCap: 2740, pe: 28.1,  w52chg:  12.3 },
  { ticker: 'MSFT',  name: 'Microsoft',           sector: 'Technology',   marketCap: 3050, pe: 35.4,  w52chg:  18.7 },
  { ticker: 'NVDA',  name: 'NVIDIA',              sector: 'Technology',   marketCap: 2180, pe: 62.3,  w52chg:  87.4 },
  { ticker: 'GOOGL', name: 'Alphabet',            sector: 'Technology',   marketCap: 1990, pe: 24.7,  w52chg:  22.1 },
  { ticker: 'AMZN',  name: 'Amazon',              sector: 'Cons. Disc.',  marketCap: 1870, pe: 43.1,  w52chg:  28.9 },
  { ticker: 'META',  name: 'Meta Platforms',      sector: 'Technology',   marketCap: 1230, pe: 27.8,  w52chg: 105.3 },
  { ticker: 'TSLA',  name: 'Tesla',               sector: 'Cons. Disc.',  marketCap:  554, pe: 51.2,  w52chg: -32.1 },
  { ticker: 'LLY',   name: 'Eli Lilly',           sector: 'Healthcare',   marketCap:  747, pe: 61.4,  w52chg:  47.6 },
  { ticker: 'JPM',   name: 'JPMorgan Chase',      sector: 'Financials',   marketCap:  591, pe: 12.3,  w52chg:  21.4 },
  { ticker: 'V',     name: 'Visa',                sector: 'Financials',   marketCap:  516, pe: 29.7,  w52chg:  10.8 },
  { ticker: 'UNH',   name: 'UnitedHealth',        sector: 'Healthcare',   marketCap:  462, pe: 20.1,  w52chg:   3.2 },
  { ticker: 'XOM',   name: 'ExxonMobil',          sector: 'Energy',       marketCap:  423, pe: 13.8,  w52chg: -12.4 },
  { ticker: 'JNJ',   name: 'Johnson & Johnson',   sector: 'Healthcare',   marketCap:  382, pe: 15.4,  w52chg:  -8.7 },
  { ticker: 'PG',    name: 'Procter & Gamble',    sector: 'Cons. Stap.',  marketCap:  363, pe: 26.2,  w52chg:  -2.1 },
  { ticker: 'HD',    name: 'Home Depot',          sector: 'Cons. Disc.',  marketCap:  341, pe: 22.9,  w52chg:   4.5 },
  { ticker: 'MA',    name: 'Mastercard',          sector: 'Financials',   marketCap:  432, pe: 36.1,  w52chg:  15.2 },
  { ticker: 'CVX',   name: 'Chevron',             sector: 'Energy',       marketCap:  278, pe: 12.1,  w52chg: -18.3 },
  { ticker: 'MRK',   name: 'Merck',               sector: 'Healthcare',   marketCap:  279, pe: 17.6,  w52chg:  -4.8 },
  { ticker: 'ABBV',  name: 'AbbVie',              sector: 'Healthcare',   marketCap:  297, pe: 44.8,  w52chg:  13.7 },
  { ticker: 'BAC',   name: 'Bank of America',     sector: 'Financials',   marketCap:  293, pe: 12.9,  w52chg:  14.1 },
]

type CapFilter = 'All' | 'Large' | 'Mid' | 'Small'
type PerfFilter = 'All' | 'Positive' | 'Negative' | '>20%' | '<-20%'

const SECTORS = ['All', 'Technology', 'Healthcare', 'Financials', 'Energy', 'Cons. Disc.', 'Cons. Stap.']

function fmtCap(b: number) {
  if (b >= 1000) return `$${(b / 1000).toFixed(1)}T`
  return `$${b.toFixed(0)}B`
}

export function StockScreenerWidget() {
  const [capFilter,  setCapFilter]  = useState<CapFilter>('All')
  const [sectorFilter, setSectorFilter] = useState('All')
  const [peMin, setPeMin] = useState('')
  const [peMax, setPeMax] = useState('')
  const [perfFilter, setPerfFilter] = useState<PerfFilter>('All')

  const filtered = STOCKS.filter(s => {
    if (capFilter === 'Large'  && s.marketCap <= 10)  return false
    if (capFilter === 'Mid'    && (s.marketCap < 2 || s.marketCap > 10)) return false
    if (capFilter === 'Small'  && s.marketCap >= 2)   return false
    if (sectorFilter !== 'All' && s.sector !== sectorFilter) return false
    if (peMin && s.pe != null && s.pe < parseFloat(peMin)) return false
    if (peMax && s.pe != null && s.pe > parseFloat(peMax)) return false
    if (perfFilter === 'Positive' && s.w52chg <= 0)  return false
    if (perfFilter === 'Negative' && s.w52chg >= 0)  return false
    if (perfFilter === '>20%'     && s.w52chg <= 20) return false
    if (perfFilter === '<-20%'    && s.w52chg >= -20) return false
    return true
  })

  return (
    <div className="flex flex-col h-full font-mono text-xs">
      {/* Filters */}
      <div className="flex flex-wrap gap-x-3 gap-y-1.5 px-3 pt-2 pb-2 border-b border-border">
        {/* Market Cap */}
        <div className="flex items-center gap-1">
          <span className="text-[9px] text-muted-foreground uppercase tracking-wide">Cap:</span>
          {(['All', 'Large', 'Mid', 'Small'] as CapFilter[]).map(c => (
            <button key={c} onClick={() => setCapFilter(c)}
              className={cn('px-1.5 py-0.5 rounded border text-[9px] transition-colors',
                capFilter === c ? 'bg-primary/20 text-primary border-primary/40' : 'border-border text-muted-foreground hover:text-foreground')}>
              {c}
            </button>
          ))}
        </div>

        {/* Sector */}
        <div className="flex items-center gap-1">
          <span className="text-[9px] text-muted-foreground uppercase tracking-wide">Sector:</span>
          <select
            value={sectorFilter}
            onChange={e => setSectorFilter(e.target.value)}
            className="bg-muted/40 border border-border rounded px-1 py-0.5 text-[9px] text-foreground"
          >
            {SECTORS.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>

        {/* P/E */}
        <div className="flex items-center gap-1">
          <span className="text-[9px] text-muted-foreground uppercase tracking-wide">P/E:</span>
          <input value={peMin} onChange={e => setPeMin(e.target.value)} placeholder="min"
            className="w-10 bg-muted/40 border border-border rounded px-1 py-0.5 text-[9px] text-foreground placeholder-muted-foreground/50" />
          <span className="text-muted-foreground">–</span>
          <input value={peMax} onChange={e => setPeMax(e.target.value)} placeholder="max"
            className="w-10 bg-muted/40 border border-border rounded px-1 py-0.5 text-[9px] text-foreground placeholder-muted-foreground/50" />
        </div>

        {/* 52W Perf */}
        <div className="flex items-center gap-1">
          <span className="text-[9px] text-muted-foreground uppercase tracking-wide">52W:</span>
          {(['All', 'Positive', 'Negative', '>20%', '<-20%'] as PerfFilter[]).map(p => (
            <button key={p} onClick={() => setPerfFilter(p)}
              className={cn('px-1.5 py-0.5 rounded border text-[9px] transition-colors',
                perfFilter === p ? 'bg-primary/20 text-primary border-primary/40' : 'border-border text-muted-foreground hover:text-foreground')}>
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Count */}
      <div className="px-3 py-1 text-[9px] text-muted-foreground border-b border-border">
        {filtered.length} result{filtered.length !== 1 ? 's' : ''}
      </div>

      {/* Header */}
      <div className="grid grid-cols-[3rem_1fr_5rem_4rem_3rem_4rem] gap-x-1 px-3 py-1 text-[9px] text-muted-foreground border-b border-border uppercase tracking-wide">
        <span>Ticker</span>
        <span>Name</span>
        <span>Sector</span>
        <span className="text-right">Mkt Cap</span>
        <span className="text-right">P/E</span>
        <span className="text-right">52W %</span>
      </div>

      <div className="flex-1 overflow-y-auto">
        {filtered.map(s => (
          <div key={s.ticker}
            className="grid grid-cols-[3rem_1fr_5rem_4rem_3rem_4rem] gap-x-1 px-3 py-1.5 border-b border-border/30 hover:bg-muted/10 items-center transition-colors">
            <span className="text-primary font-semibold">{s.ticker}</span>
            <span className="text-foreground truncate">{s.name}</span>
            <span className="text-muted-foreground text-[9px] truncate">{s.sector}</span>
            <span className="text-right text-foreground">{fmtCap(s.marketCap)}</span>
            <span className="text-right text-muted-foreground">{s.pe != null ? s.pe.toFixed(1) : '—'}</span>
            <span className={cn('text-right font-semibold', s.w52chg >= 0 ? 'text-green-400' : 'text-red-400')}>
              {s.w52chg >= 0 ? '+' : ''}{s.w52chg.toFixed(1)}%
            </span>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="px-3 py-4 text-muted-foreground text-center">No stocks match filters</div>
        )}
      </div>
    </div>
  )
}
