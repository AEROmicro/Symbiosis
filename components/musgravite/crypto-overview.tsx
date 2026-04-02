'use client'

import { useState, useEffect, useCallback } from 'react'
import { TrendingUp, TrendingDown, Activity, BarChart2, Zap, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

const TOP_CRYPTOS = [
  { symbol: 'BTC-USD', name: 'Bitcoin',   short: 'BTC', rank: 1 },
  { symbol: 'ETH-USD', name: 'Ethereum',  short: 'ETH', rank: 2 },
  { symbol: 'BNB-USD', name: 'BNB',       short: 'BNB', rank: 3 },
  { symbol: 'SOL-USD', name: 'Solana',    short: 'SOL', rank: 4 },
  { symbol: 'XRP-USD', name: 'XRP',       short: 'XRP', rank: 5 },
  { symbol: 'ADA-USD', name: 'Cardano',   short: 'ADA', rank: 6 },
  { symbol: 'AVAX-USD', name: 'Avalanche',short: 'AVAX',rank: 7 },
  { symbol: 'DOGE-USD', name: 'Dogecoin', short: 'DOGE',rank: 8 },
  { symbol: 'MATIC-USD', name: 'Polygon', short: 'MATIC',rank: 9 },
  { symbol: 'DOT-USD', name: 'Polkadot',  short: 'DOT', rank: 10 },
]

const SIMULATED_MCAP: Record<string, string> = {
  BTC: '$1.27T', ETH: '$432B', BNB: '$88B', SOL: '$79B',
  XRP: '$64B', ADA: '$18B', AVAX: '$14B', DOGE: '$22B',
  MATIC: '$9B', DOT: '$10B',
}

const TRENDING_STATIC = [
  { name: 'Pepe', symbol: 'PEPE', change: '+18.4%' },
  { name: 'Worldcoin', symbol: 'WLD', change: '+12.1%' },
  { name: 'Injective', symbol: 'INJ', change: '+9.7%' },
  { name: 'Sei', symbol: 'SEI', change: '+7.3%' },
  { name: 'Celestia', symbol: 'TIA', change: '+6.2%' },
]

interface CryptoPrice {
  symbol: string
  price: number | null
  change: number | null
  changePercent: number | null
  volume: number | null
}

function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn('bg-card border border-border rounded-md p-4', className)}>
      {children}
    </div>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-3">{children}</h2>
}

function fmt(n: number | null, decimals = 2) {
  if (n === null) return '—'
  if (n >= 1000) return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  return n.toFixed(decimals)
}

function fmtPct(n: number | null) {
  if (n === null) return '—'
  return `${n >= 0 ? '+' : ''}${n.toFixed(2)}%`
}

export function CryptoOverview() {
  const [prices, setPrices] = useState<Record<string, CryptoPrice>>({})
  const [loading, setLoading] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<string | null>(null)

  const fetchAll = useCallback(async () => {
    setLoading(true)
    const results = await Promise.allSettled(
      TOP_CRYPTOS.map(c =>
        fetch(`/api/stock/${c.symbol}`).then(r => r.json())
      )
    )
    const map: Record<string, CryptoPrice> = {}
    results.forEach((r, i) => {
      const { short } = TOP_CRYPTOS[i]
      if (r.status === 'fulfilled' && r.value && !r.value.error) {
        const d = r.value
        map[short] = {
          symbol: short,
          price: d.price ?? null,
          change: d.change ?? null,
          changePercent: d.changePercent ?? null,
          volume: d.volume ?? null,
        }
      } else {
        map[short] = { symbol: short, price: null, change: null, changePercent: null, volume: null }
      }
    })
    setPrices(map)
    setLastUpdated(new Date().toLocaleTimeString())
    setLoading(false)
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  const btc = prices['BTC']
  const totalVolume = Object.values(prices).reduce((acc, p) => acc + (p.volume ?? 0), 0)

  return (
    <div className="font-mono space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold">Crypto Market Overview</h1>
          {lastUpdated && <p className="text-xs text-muted-foreground">Updated {lastUpdated}</p>}
        </div>
        <Button variant="outline" size="sm" onClick={fetchAll} disabled={loading}>
          <RefreshCw className={cn('h-3 w-3 mr-1', loading && 'animate-spin')} />
          Refresh
        </Button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <p className="text-xs text-muted-foreground mb-1">Total Market Cap</p>
          <p className="text-base font-bold text-primary">$2.41T</p>
          <p className="text-xs text-green-500">+2.3% (24h)</p>
        </Card>
        <Card>
          <p className="text-xs text-muted-foreground mb-1">BTC Dominance</p>
          <div className="flex items-center gap-1">
            <Activity className="h-3 w-3 text-primary" />
            <p className="text-base font-bold">52.7%</p>
          </div>
          <div className="mt-1 h-1.5 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full" style={{ width: '52.7%' }} />
          </div>
        </Card>
        <Card>
          <p className="text-xs text-muted-foreground mb-1">Fear &amp; Greed</p>
          <p className="text-base font-bold">55 <span className="text-xs text-muted-foreground">/ 100</span></p>
          <p className="text-xs text-green-500">Greed</p>
        </Card>
        <Card>
          <p className="text-xs text-muted-foreground mb-1">24h Volume</p>
          <p className="text-base font-bold">
            {totalVolume > 0
              ? `$${(totalVolume / 1e9).toFixed(1)}B`
              : '$98.4B'}
          </p>
          <p className="text-xs text-muted-foreground">Spot markets</p>
        </Card>
      </div>

      {/* Price Table */}
      <Card className="p-0 overflow-hidden">
        <div className="p-4 pb-2">
          <SectionTitle>Top Cryptocurrencies</SectionTitle>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-xs text-muted-foreground">
                <th className="text-left px-4 py-2">#</th>
                <th className="text-left px-4 py-2">Name</th>
                <th className="text-right px-4 py-2">Price</th>
                <th className="text-right px-4 py-2">24h %</th>
                <th className="text-right px-4 py-2 hidden sm:table-cell">Mkt Cap</th>
              </tr>
            </thead>
            <tbody>
              {TOP_CRYPTOS.map(c => {
                const p = prices[c.short]
                const pct = p?.changePercent ?? null
                const positive = pct !== null && pct >= 0
                return (
                  <tr key={c.short} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-2 text-muted-foreground">{c.rank}</td>
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-[9px] font-bold text-primary">
                          {c.short.slice(0, 2)}
                        </div>
                        <div>
                          <p className="font-semibold leading-none">{c.name}</p>
                          <p className="text-xs text-muted-foreground">{c.short}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-2 text-right font-semibold">
                      {p?.price !== null && p?.price !== undefined
                        ? `$${fmt(p.price)}`
                        : <span className="text-muted-foreground">—</span>}
                    </td>
                    <td className={cn('px-4 py-2 text-right', pct === null ? 'text-muted-foreground' : positive ? 'text-green-500' : 'text-red-500')}>
                      <span className="flex items-center justify-end gap-0.5">
                        {pct !== null && (positive
                          ? <TrendingUp className="h-3 w-3" />
                          : <TrendingDown className="h-3 w-3" />)}
                        {fmtPct(pct)}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-right text-muted-foreground hidden sm:table-cell">
                      {SIMULATED_MCAP[c.short] ?? '—'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Trending */}
        <Card>
          <SectionTitle>🔥 Trending</SectionTitle>
          <div className="space-y-2">
            {TRENDING_STATIC.map((t, i) => (
              <div key={t.symbol} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground w-4">{i + 1}</span>
                  <Zap className="h-3 w-3 text-primary" />
                  <span className="text-sm font-semibold">{t.name}</span>
                  <span className="text-xs text-muted-foreground">{t.symbol}</span>
                </div>
                <span className="text-xs text-green-500">{t.change}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* BTC Snapshot */}
        <Card>
          <SectionTitle>Bitcoin Snapshot</SectionTitle>
          {btc ? (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Price</span>
                <span className="font-bold">{btc.price !== null ? `$${fmt(btc.price)}` : '—'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">24h Change</span>
                <span className={cn(btc.change !== null && btc.change >= 0 ? 'text-green-500' : 'text-red-500')}>
                  {btc.change !== null ? `$${fmt(btc.change)}` : '—'} ({fmtPct(btc.changePercent)})
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Dominance</span>
                <span>52.7%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Market Cap</span>
                <span>$1.27T</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Halving</span>
                <span className="text-primary">Apr 2024 ✓</span>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-20">
              <BarChart2 className="h-5 w-5 animate-pulse text-muted-foreground" />
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
