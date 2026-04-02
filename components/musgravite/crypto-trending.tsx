'use client'

import { useState, useEffect, useCallback } from 'react'
import { TrendingUp, TrendingDown, Flame, Star, Zap, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

const TRENDING_COINS = [
  { symbol: 'BTC-USD',  name: 'Bitcoin',    short: 'BTC'  },
  { symbol: 'ETH-USD',  name: 'Ethereum',   short: 'ETH'  },
  { symbol: 'SOL-USD',  name: 'Solana',     short: 'SOL'  },
  { symbol: 'BNB-USD',  name: 'BNB',        short: 'BNB'  },
  { symbol: 'DOGE-USD', name: 'Dogecoin',   short: 'DOGE' },
  { symbol: 'AVAX-USD', name: 'Avalanche',  short: 'AVAX' },
]

const CATEGORIES = [
  {
    name: 'DeFi',
    icon: '🏦',
    coins: [
      { symbol: 'UNI',  name: 'Uniswap',    change: '+5.2%' },
      { symbol: 'AAVE', name: 'Aave',       change: '+3.8%' },
      { symbol: 'MKR',  name: 'Maker',      change: '-1.2%' },
      { symbol: 'CRV',  name: 'Curve',      change: '+7.4%' },
    ],
  },
  {
    name: 'Layer 2',
    icon: '⚡',
    coins: [
      { symbol: 'OP',   name: 'Optimism',   change: '+8.1%' },
      { symbol: 'ARB',  name: 'Arbitrum',   change: '+6.3%' },
      { symbol: 'MATIC',name: 'Polygon',    change: '-0.5%' },
      { symbol: 'IMX',  name: 'Immutable X',change: '+4.9%' },
    ],
  },
  {
    name: 'Gaming',
    icon: '🎮',
    coins: [
      { symbol: 'AXS',  name: 'Axie Infinity', change: '+2.1%' },
      { symbol: 'SAND', name: 'Sandbox',     change: '+3.4%' },
      { symbol: 'MANA', name: 'Decentraland',change: '-1.8%' },
      { symbol: 'ENJ',  name: 'Enjin',       change: '+1.3%' },
    ],
  },
  {
    name: 'Meme',
    icon: '🐸',
    coins: [
      { symbol: 'DOGE', name: 'Dogecoin',   change: '+11.2%' },
      { symbol: 'SHIB', name: 'Shiba Inu',  change: '+8.7%'  },
      { symbol: 'PEPE', name: 'Pepe',       change: '+18.4%' },
      { symbol: 'FLOKI',name: 'Floki',      change: '+6.1%'  },
    ],
  },
]

const RECOMMENDED = [
  { symbol: 'ETH',  name: 'Ethereum',  reason: 'Most viewed' },
  { symbol: 'SOL',  name: 'Solana',    reason: 'Trending' },
  { symbol: 'BNB',  name: 'BNB',       reason: 'High volume' },
]

const NEW_LISTINGS = [
  { symbol: 'TIA',  name: 'Celestia',  change: '+24.3%', isNew: true  },
  { symbol: 'SEI',  name: 'Sei',       change: '+18.1%', isNew: false },
  { symbol: 'INJ',  name: 'Injective', change: '+14.6%', isNew: false },
  { symbol: 'WLD',  name: 'Worldcoin', change: '+12.0%', isNew: false },
]

interface LivePrice {
  price: number | null
  changePercent: number | null
}

function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn('bg-card border border-border rounded-md p-4', className)}>{children}</div>
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-3">{children}</h2>
}

function fmtPrice(n: number | null) {
  if (n === null) return '—'
  if (n >= 1000) return `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  if (n >= 1) return `$${n.toFixed(4)}`
  return `$${n.toFixed(6)}`
}

function fmtPct(n: number | null) {
  if (n === null) return '—'
  return `${n >= 0 ? '+' : ''}${n.toFixed(2)}%`
}

export function CryptoTrending() {
  const [livePrices, setLivePrices] = useState<Record<string, LivePrice>>({})
  const [loading, setLoading] = useState(false)

  const fetchAll = useCallback(async () => {
    setLoading(true)
    const results = await Promise.allSettled(
      TRENDING_COINS.map(c => fetch(`/api/stock/${c.symbol}`).then(r => r.json()))
    )
    const map: Record<string, LivePrice> = {}
    results.forEach((r, i) => {
      const { short } = TRENDING_COINS[i]
      if (r.status === 'fulfilled' && r.value && !r.value.error) {
        map[short] = { price: r.value.price ?? null, changePercent: r.value.changePercent ?? null }
      } else {
        map[short] = { price: null, changePercent: null }
      }
    })
    setLivePrices(map)
    setLoading(false)
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  const isPositive = (change: string) => !change.startsWith('-')

  return (
    <div className="font-mono space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Flame className="h-4 w-4 text-primary" />
          <h1 className="text-lg font-bold">Trending &amp; Popular</h1>
        </div>
        <Button variant="outline" size="sm" onClick={fetchAll} disabled={loading}>
          <RefreshCw className={cn('h-3 w-3 mr-1', loading && 'animate-spin')} />
          Refresh
        </Button>
      </div>

      {/* Live Trending Prices */}
      <Card className="p-0 overflow-hidden">
        <div className="p-4 pb-2">
          <SectionTitle>🔥 Top Trending (Live Prices)</SectionTitle>
        </div>
        <div className="divide-y divide-border/50">
          {TRENDING_COINS.map((c, i) => {
            const lp = livePrices[c.short]
            const pct = lp?.changePercent ?? null
            return (
              <div key={c.short} className="flex items-center justify-between px-4 py-3 hover:bg-muted/30 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground w-4">{i + 1}</span>
                  <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                    {c.short.slice(0, 2)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{c.name}</p>
                    <p className="text-xs text-muted-foreground">{c.short}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold">
                    {loading ? <span className="text-muted-foreground animate-pulse">...</span> : fmtPrice(lp?.price ?? null)}
                  </p>
                  <p className={cn('text-xs flex items-center justify-end gap-0.5', pct === null ? 'text-muted-foreground' : pct >= 0 ? 'text-green-500' : 'text-red-500')}>
                    {pct !== null && (pct >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />)}
                    {fmtPct(pct)}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </Card>

      {/* Categories */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {CATEGORIES.map(cat => (
          <Card key={cat.name}>
            <SectionTitle>{cat.icon} {cat.name}</SectionTitle>
            <div className="space-y-2">
              {cat.coins.map(coin => (
                <div key={coin.symbol} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground text-xs font-mono w-12">{coin.symbol}</span>
                    <span className="text-muted-foreground text-xs">{coin.name}</span>
                  </div>
                  <span className={cn('text-xs font-semibold', isPositive(coin.change) ? 'text-green-500' : 'text-red-500')}>
                    {coin.change}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Recommended */}
        <Card>
          <SectionTitle><Star className="inline h-3 w-3 mr-1" />Recommended For You</SectionTitle>
          <div className="space-y-3">
            {RECOMMENDED.map(r => (
              <div key={r.symbol} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-[9px] font-bold text-primary">
                    {r.symbol.slice(0, 2)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{r.name}</p>
                    <p className="text-xs text-muted-foreground">{r.reason}</p>
                  </div>
                </div>
                <span className="text-xs text-primary font-mono">{r.symbol}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Gainers / New Listings */}
        <Card>
          <SectionTitle><Zap className="inline h-3 w-3 mr-1" />Top Gainers</SectionTitle>
          <div className="space-y-2">
            {NEW_LISTINGS.map(n => (
              <div key={n.symbol} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  {n.isNew && (
                    <span className="text-[9px] bg-primary/20 text-primary px-1 rounded">NEW</span>
                  )}
                  <span className="font-semibold">{n.symbol}</span>
                  <span className="text-xs text-muted-foreground">{n.name}</span>
                </div>
                <span className={cn('text-xs font-bold', isPositive(n.change) ? 'text-green-500' : 'text-red-500')}>
                  {n.change}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
