'use client'
import { useState, useCallback } from 'react'
import useSWR from 'swr'
import { RefreshCw, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { OptionsChainResponse, OptionContract } from '@/app/api/options/[symbol]/route'

const fetcher = (url: string) => fetch(url).then(r => r.json())

function fmtDate(ts: number) {
  return new Date(ts * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })
}

function fmtIV(iv: number) {
  return `${(iv * 100).toFixed(0)}%`
}

function ContractRow({
  contract,
  currentPrice,
  side,
}: {
  contract: OptionContract
  currentPrice: number
  side: 'call' | 'put'
}) {
  const itm = contract.inTheMoney
  const mid = contract.bid > 0 && contract.ask > 0 ? ((contract.bid + contract.ask) / 2).toFixed(2) : '—'
  const atMoney = Math.abs(contract.strike - currentPrice) / currentPrice < 0.005

  return (
    <div
      className={cn(
        'grid grid-cols-[4.5rem_3.5rem_3.5rem_3.5rem_4rem_3.5rem] gap-x-1 px-2 py-1 border-b border-border/20 text-[10px] items-center transition-colors hover:bg-muted/10',
        itm ? (side === 'call' ? 'bg-price-up/5' : 'bg-price-down/5') : '',
        atMoney ? 'border-primary/30' : ''
      )}
    >
      <span className={cn('font-semibold tabular-nums', atMoney && 'text-primary')}>
        {contract.strike.toFixed(0)}
        {atMoney && <span className="text-[8px] text-primary ml-0.5">★</span>}
      </span>
      <span className="tabular-nums text-right text-muted-foreground">{contract.bid.toFixed(2)}</span>
      <span className="tabular-nums text-right text-muted-foreground">{contract.ask.toFixed(2)}</span>
      <span className="tabular-nums text-right">{mid}</span>
      <span className="tabular-nums text-right text-muted-foreground">
        {contract.volume > 0 ? contract.volume.toLocaleString() : '—'}
      </span>
      <span className={cn('tabular-nums text-right', contract.impliedVolatility > 0.5 ? 'text-yellow-400' : 'text-muted-foreground')}>
        {contract.impliedVolatility > 0 ? fmtIV(contract.impliedVolatility) : '—'}
      </span>
    </div>
  )
}

export function OptionsChainWidget() {
  const [symbol, setSymbol] = useState('AAPL')
  const [inputVal, setInputVal] = useState('AAPL')
  const [selectedDate, setSelectedDate] = useState<number | null>(null)
  const [side, setSide] = useState<'calls' | 'puts'>('calls')

  const url = selectedDate
    ? `/api/options/${symbol}?date=${selectedDate}`
    : `/api/options/${symbol}`

  const { data, isLoading, error, mutate } = useSWR<OptionsChainResponse>(url, fetcher, {
    refreshInterval: 60_000,
    dedupingInterval: 30_000,
    onSuccess: (d) => {
      if (!selectedDate && d.expirationDates?.[0]) {
        setSelectedDate(d.expirationDates[0])
      }
    },
  })

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    const s = inputVal.trim().toUpperCase()
    if (s) { setSymbol(s); setSelectedDate(null) }
  }, [inputVal])

  const contracts = side === 'calls' ? (data?.calls ?? []) : (data?.puts ?? [])
  const currentPrice = data?.currentPrice ?? 0

  // Show only strikes close to current price (within 15%)
  const filtered = currentPrice > 0
    ? contracts.filter(c => Math.abs(c.strike - currentPrice) / currentPrice <= 0.15).slice(0, 20)
    : contracts.slice(0, 20)

  return (
    <div className="flex flex-col h-full font-mono text-xs">
      {/* Symbol input + controls */}
      <div className="flex items-center gap-2 px-3 pt-2 pb-1 shrink-0">
        <form onSubmit={handleSubmit} className="flex gap-1 flex-1">
          <input
            value={inputVal}
            onChange={e => setInputVal(e.target.value.toUpperCase())}
            className="bg-background border border-border rounded px-2 py-0.5 text-[11px] font-mono w-20 focus:outline-none focus:border-primary"
            placeholder="AAPL"
          />
          <button type="submit" className="px-2 py-0.5 border border-border rounded text-[10px] hover:border-primary hover:text-primary transition-colors">
            Load
          </button>
        </form>
        {(['calls', 'puts'] as const).map(s => (
          <button
            key={s}
            onClick={() => setSide(s)}
            className={cn(
              'px-2 py-0.5 rounded border text-[10px] transition-colors capitalize',
              side === s
                ? s === 'calls' ? 'bg-price-up/20 text-price-up border-price-up/40' : 'bg-price-down/20 text-price-down border-price-down/40'
                : 'border-border text-muted-foreground hover:text-foreground'
            )}
          >
            {s}
          </button>
        ))}
        <button onClick={() => mutate()} className="text-muted-foreground hover:text-foreground transition-colors">
          <RefreshCw className={cn('w-3 h-3', isLoading && 'animate-spin')} />
        </button>
      </div>

      {/* Expiration selector */}
      {data?.expirationDates && data.expirationDates.length > 0 && (
        <div className="flex items-center gap-1 px-3 pb-1 overflow-x-auto shrink-0">
          {data.expirationDates.slice(0, 6).map(d => (
            <button
              key={d}
              onClick={() => setSelectedDate(d)}
              className={cn(
                'px-2 py-0.5 rounded border text-[9px] shrink-0 transition-colors',
                selectedDate === d
                  ? 'bg-primary/20 border-primary/40 text-primary'
                  : 'border-border text-muted-foreground hover:text-foreground'
              )}
            >
              {fmtDate(d)}
            </button>
          ))}
        </div>
      )}

      {/* Price info */}
      {currentPrice > 0 && (
        <div className="px-3 pb-1 shrink-0 text-[10px] text-muted-foreground">
          <span className="font-semibold text-primary">{data?.symbol}</span>
          <span className="ml-2">@ ${currentPrice.toFixed(2)}</span>
          <span className="ml-2 text-[9px]">★ = ATM</span>
        </div>
      )}

      {/* Column header */}
      <div className="grid grid-cols-[4.5rem_3.5rem_3.5rem_3.5rem_4rem_3.5rem] gap-x-1 px-2 py-0.5 text-[9px] text-muted-foreground border-b border-border uppercase tracking-wide shrink-0">
        <span>Strike</span>
        <span className="text-right">Bid</span>
        <span className="text-right">Ask</span>
        <span className="text-right">Mid</span>
        <span className="text-right">Vol</span>
        <span className="text-right">IV</span>
      </div>

      {/* Chain rows */}
      <div className="flex-1 overflow-y-auto">
        {isLoading && filtered.length === 0 ? (
          <div className="flex items-center justify-center h-full gap-2 text-muted-foreground">
            <RefreshCw className="w-3 h-3 animate-spin" />
            <span>Loading options…</span>
          </div>
        ) : error || (data && filtered.length === 0) ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            No options data for {symbol}
          </div>
        ) : (
          filtered.map((c, i) => (
            <ContractRow key={`${c.strike}-${i}`} contract={c} currentPrice={currentPrice} side={side === 'calls' ? 'call' : 'put'} />
          ))
        )}
      </div>

      <div className="text-[9px] text-muted-foreground px-3 py-1 border-t border-border shrink-0 flex justify-between">
        <span>Live options · Yahoo Finance · ±15% ATM</span>
        <span>{filtered.length} strikes</span>
      </div>
    </div>
  )
}
