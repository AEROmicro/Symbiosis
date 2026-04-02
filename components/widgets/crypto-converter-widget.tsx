'use client'

import { useState, useEffect, useCallback } from 'react'
import { RefreshCw, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

const CRYPTOS = ['BTC', 'ETH', 'SOL', 'BNB', 'XRP', 'ADA', 'DOGE']
const ALL_CURRENCIES = ['USD', ...CRYPTOS]

type PriceMap = Record<string, number>

export function CryptoConverterWidget() {
  const [prices, setPrices] = useState<PriceMap>({})
  const [loading, setLoading] = useState(false)
  const [fromCurrency, setFromCurrency] = useState('BTC')
  const [toCurrency, setToCurrency] = useState('USD')
  const [amount, setAmount] = useState('1')
  const [lastUpdated, setLastUpdated] = useState<string>('')

  const fetchRates = useCallback(async () => {
    setLoading(true)
    const newPrices: PriceMap = {}
    await Promise.all(CRYPTOS.map(async (c) => {
      try {
        const res = await fetch(`/api/stock/${c}-USD`)
        if (res.ok) {
          const d = await res.json()
          if (d.price) newPrices[c] = d.price
        }
      } catch {}
    }))
    newPrices['USD'] = 1
    setPrices(newPrices)
    setLastUpdated(new Date().toLocaleTimeString())
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchRates()
    const id = setInterval(fetchRates, 60_000)
    return () => clearInterval(id)
  }, [fetchRates])

  const getUsdValue = (currency: string, amt: number): number => {
    if (currency === 'USD') return amt
    return (prices[currency] ?? 0) * amt
  }

  const convert = (): string => {
    const amt = parseFloat(amount)
    if (isNaN(amt) || amt <= 0) return '—'
    const usdVal = getUsdValue(fromCurrency, amt)
    if (toCurrency === 'USD') return usdVal.toLocaleString('en-US', { maximumFractionDigits: 2 })
    const toPrice = prices[toCurrency]
    if (!toPrice) return '—'
    const result = usdVal / toPrice
    return result < 0.001 ? result.toExponential(4) : result.toLocaleString('en-US', { maximumFractionDigits: 6 })
  }

  const result = convert()

  return (
    <div className="p-4 flex flex-col gap-3 h-full font-mono text-xs">
      <div className="flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Crypto Converter</span>
        <button onClick={fetchRates} disabled={loading} className="text-muted-foreground hover:text-foreground transition-colors">
          <RefreshCw className={cn('w-3 h-3', loading && 'animate-spin')} />
        </button>
      </div>

      <div className="space-y-2">
        <div>
          <label className="text-[9px] text-muted-foreground uppercase tracking-wider block mb-1">Amount</label>
          <input
            type="number" min="0" step="any" value={amount} onChange={e => setAmount(e.target.value)}
            className="w-full h-8 px-2 text-xs font-mono bg-background border border-border rounded-sm text-foreground focus:outline-none focus:border-primary/60 tabular-nums"
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="flex-1">
            <label className="text-[9px] text-muted-foreground uppercase tracking-wider block mb-1">From</label>
            <select value={fromCurrency} onChange={e => setFromCurrency(e.target.value)}
              className="w-full h-8 px-2 text-xs font-mono bg-background border border-border rounded-sm text-foreground focus:outline-none">
              {ALL_CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <ArrowRight className="w-4 h-4 text-muted-foreground mt-4 shrink-0" />
          <div className="flex-1">
            <label className="text-[9px] text-muted-foreground uppercase tracking-wider block mb-1">To</label>
            <select value={toCurrency} onChange={e => setToCurrency(e.target.value)}
              className="w-full h-8 px-2 text-xs font-mono bg-background border border-border rounded-sm text-foreground focus:outline-none">
              {ALL_CURRENCIES.filter(c => c !== fromCurrency).map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="border border-primary/30 bg-primary/5 rounded-sm p-3 text-center">
        <div className="text-[9px] text-muted-foreground uppercase tracking-wider mb-1">
          {amount || '1'} {fromCurrency} =
        </div>
        <div className="text-xl font-bold tabular-nums text-primary">
          {loading && Object.keys(prices).length === 0 ? '…' : result}
        </div>
        <div className="text-[9px] text-muted-foreground mt-0.5">{toCurrency}</div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-1 min-h-0">
        <div className="text-[9px] text-muted-foreground uppercase tracking-wider mb-1">Live Rates (USD)</div>
        {CRYPTOS.map(c => (
          <div key={c} className="flex items-center justify-between border border-border rounded-sm px-2 py-1">
            <span className="font-semibold">{c}</span>
            <span className="tabular-nums">{prices[c] ? `$${prices[c].toLocaleString('en-US', { maximumFractionDigits: 2 })}` : '…'}</span>
          </div>
        ))}
      </div>

      {lastUpdated && (
        <div className="text-[9px] text-muted-foreground shrink-0">Updated: {lastUpdated} · auto-refresh 60s</div>
      )}
    </div>
  )
}
