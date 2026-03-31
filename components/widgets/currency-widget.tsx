'use client'

import { useEffect, useState } from 'react'
import { TrendingUp, TrendingDown, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from '@/lib/utils'

const FX_PAIRS = [
  { from: 'EUR', to: 'USD', symbol: 'EURUSD=X' },
  { from: 'GBP', to: 'USD', symbol: 'GBPUSD=X' },
  { from: 'USD', to: 'JPY', symbol: 'USDJPY=X' },
  { from: 'USD', to: 'CAD', symbol: 'USDCAD=X' },
  { from: 'AUD', to: 'USD', symbol: 'AUDUSD=X' },
  { from: 'USD', to: 'CHF', symbol: 'USDCHF=X' },
  { from: 'NZD', to: 'USD', symbol: 'NZDUSD=X' },
  { from: 'USD', to: 'CNY', symbol: 'USDCNY=X' },
  { from: 'USD', to: 'INR', symbol: 'USDINR=X' },
  { from: 'USD', to: 'MXN', symbol: 'USDMXN=X' },
  { from: 'USD', to: 'BRL', symbol: 'USDBRL=X' },
  { from: 'USD', to: 'KRW', symbol: 'USDKRW=X' },
  { from: 'USD', to: 'SGD', symbol: 'USDSGD=X' },
  { from: 'USD', to: 'HKD', symbol: 'USDHKD=X' },
  { from: 'USD', to: 'NOK', symbol: 'USDNOK=X' },
  { from: 'USD', to: 'SEK', symbol: 'USDSEK=X' },
  { from: 'USD', to: 'TRY', symbol: 'USDTRY=X' },
  { from: 'USD', to: 'ZAR', symbol: 'USDZAR=X' },
]

const CURRENCIES = [
  // Major
  'USD', 'EUR', 'GBP', 'JPY', 'CHF', 'CAD', 'AUD', 'NZD',
  // Asia-Pacific
  'CNY', 'HKD', 'SGD', 'KRW', 'INR', 'TWD', 'MYR', 'IDR', 'PHP', 'THB', 'VND',
  // Americas
  'MXN', 'BRL', 'ARS', 'CLP', 'COP', 'PEN',
  // Europe
  'NOK', 'SEK', 'DKK', 'PLN', 'CZK', 'HUF', 'RON', 'TRY', 'RUB', 'UAH',
  // Middle East & Africa
  'SAR', 'AED', 'QAR', 'KWD', 'ILS', 'EGP', 'NGN', 'ZAR', 'MAD',
]

interface Rate { symbol: string; from: string; to: string; price: number; change: number }

export function CurrencyWidget() {
  const [rates, setRates] = useState<Rate[]>([])
  const [loading, setLoading] = useState(false)
  const [amount, setAmount] = useState('1')
  const [from, setFrom] = useState('USD')
  const [to, setTo] = useState('EUR')
  const [converted, setConverted] = useState<number | null>(null)

  const fetchRates = async () => {
    setLoading(true)
    try {
      const results = await Promise.all(
        FX_PAIRS.map(async (pair) => {
          try {
            const res = await fetch(`/api/stock/${pair.symbol}`)
            if (res.ok) {
              const data = await res.json()
              return { ...pair, price: data.price, change: data.changePercent ?? 0 }
            }
          } catch {
            // silent
          }
          return null
        }),
      )
      setRates(results.filter(Boolean) as Rate[])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchRates() }, [])

  useEffect(() => {
    const id = setInterval(fetchRates, 60_000)
    return () => clearInterval(id)
  }, [])

  const handleConvert = async () => {
    if (from === to) { setConverted(parseFloat(amount)); return }
    try {
      const sym = `${from}${to}=X`
      const res = await fetch(`/api/stock/${sym}`)
      if (res.ok) {
        const data = await res.json()
        setConverted(parseFloat(amount) * data.price)
      }
    } catch {
      // silent
    }
  }

  return (
    <div className="p-4 flex flex-col gap-3 h-full">
      {/* Rates list */}
      <div className="flex-1 space-y-1">
        {loading && rates.length === 0 ? (
          <div className="space-y-1">
            {[...Array(6)].map((_, i) => <div key={i} className="h-8 bg-muted rounded animate-pulse" />)}
          </div>
        ) : rates.map((r) => {
          const pos = r.change >= 0
          return (
            <div key={r.symbol} className="flex items-center justify-between text-xs font-mono px-2 py-1.5 rounded border border-border">
              <span className="font-semibold text-foreground">{r.from}/{r.to}</span>
              <div className="flex items-center gap-2">
                <span className="tabular-nums">{r.price.toFixed(4)}</span>
                <span className={cn('flex items-center gap-0.5', pos ? 'text-price-up' : 'text-price-down')}>
                  {pos ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
                  {pos ? '+' : ''}{r.change.toFixed(2)}%
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Converter */}
      <div className="border-t border-border pt-3 space-y-2 shrink-0">
        <div className="text-xs text-muted-foreground uppercase tracking-wider">Convert</div>
        <div className="flex gap-2">
          <Input
            value={amount}
            onChange={e => setAmount(e.target.value)}
            className="h-7 text-xs font-mono w-20 shrink-0"
            type="number"
            min="0"
          />
          <Select value={from} onValueChange={setFrom}>
            <SelectTrigger className="h-7 text-xs font-mono flex-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CURRENCIES.map(c => <SelectItem key={c} value={c} className="text-xs font-mono">{c}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={to} onValueChange={setTo}>
            <SelectTrigger className="h-7 text-xs font-mono flex-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CURRENCIES.map(c => <SelectItem key={c} value={c} className="text-xs font-mono">{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <Button size="sm" variant="outline" className="w-full h-7 text-xs font-mono" onClick={handleConvert}>
          Convert
        </Button>
        {converted !== null && (
          <div className="text-xs text-center font-mono text-primary">
            {amount} {from} = <span className="font-bold">{converted.toFixed(4)} {to}</span>
          </div>
        )}
      </div>

      <Button variant="outline" size="sm" className="w-full text-xs font-mono shrink-0" onClick={fetchRates} disabled={loading}>
        <RefreshCw className="w-3 h-3" />
        Refresh Rates
      </Button>
    </div>
  )
}
