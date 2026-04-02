'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, Clock, X, TrendingUp, TrendingDown, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const STORAGE_KEY = 'musgravite-recent-searches'

const POPULAR_CRYPTOS = [
  { symbol: 'BTC',  name: 'Bitcoin' },
  { symbol: 'ETH',  name: 'Ethereum' },
  { symbol: 'BNB',  name: 'BNB' },
  { symbol: 'SOL',  name: 'Solana' },
  { symbol: 'XRP',  name: 'XRP' },
  { symbol: 'ADA',  name: 'Cardano' },
  { symbol: 'DOGE', name: 'Dogecoin' },
  { symbol: 'AVAX', name: 'Avalanche' },
  { symbol: 'MATIC',name: 'Polygon' },
  { symbol: 'DOT',  name: 'Polkadot' },
  { symbol: 'SHIB', name: 'Shiba Inu' },
  { symbol: 'LTC',  name: 'Litecoin' },
  { symbol: 'LINK', name: 'Chainlink' },
  { symbol: 'UNI',  name: 'Uniswap' },
  { symbol: 'ATOM', name: 'Cosmos' },
  { symbol: 'TRX',  name: 'TRON' },
  { symbol: 'XLM',  name: 'Stellar' },
  { symbol: 'NEAR', name: 'NEAR Protocol' },
  { symbol: 'ICP',  name: 'Internet Computer' },
  { symbol: 'APT',  name: 'Aptos' },
  { symbol: 'OP',   name: 'Optimism' },
  { symbol: 'ARB',  name: 'Arbitrum' },
  { symbol: 'FIL',  name: 'Filecoin' },
  { symbol: 'HBAR', name: 'Hedera' },
  { symbol: 'VET',  name: 'VeChain' },
  { symbol: 'ETC',  name: 'Ethereum Classic' },
  { symbol: 'CRO',  name: 'Cronos' },
  { symbol: 'QNT',  name: 'Quant' },
  { symbol: 'ALGO', name: 'Algorand' },
  { symbol: 'EGLD', name: 'MultiversX' },
]

const DESCRIPTIONS: Record<string, string> = {
  BTC:  'Bitcoin is the first decentralized cryptocurrency, created in 2009 by Satoshi Nakamoto. It enables peer-to-peer transactions without a central authority.',
  ETH:  'Ethereum is a decentralized platform that enables smart contracts and decentralized applications (dApps) to be built and run without downtime or fraud.',
  BNB:  'BNB (formerly Binance Coin, rebranded to Build and Build) is the native cryptocurrency of the BNB Chain ecosystem, used to pay fees on Binance and across the ecosystem.',
  SOL:  'Solana is a high-performance blockchain supporting fast, low-cost transactions with a focus on scalable decentralized apps and crypto projects.',
  XRP:  'XRP is a digital asset built for payments, enabling fast, low-cost international money transfers via the Ripple network.',
  ADA:  'Cardano is a proof-of-stake blockchain platform that aims to enable changemakers, innovators, and visionaries to bring positive global change.',
  DOGE: 'Dogecoin started as a meme but became a widely-used cryptocurrency, known for its Shiba Inu mascot and low transaction fees.',
  AVAX: 'Avalanche is a layer-1 blockchain that functions as a platform for decentralized applications and custom blockchain networks.',
  MATIC:'Polygon is a Layer-2 scaling solution for Ethereum, providing faster and cheaper transactions while maintaining compatibility with Ethereum.',
  DOT:  'Polkadot enables cross-blockchain transfers of any type of data or asset, allowing different blockchains to interoperate.',
}

interface SearchResult {
  symbol: string
  name: string
  price: number | null
  change: number | null
  changePercent: number | null
  volume: number | null
  marketCap: number | null
  high52w: number | null
  low52w: number | null
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

function fmtLarge(n: number | null) {
  if (n === null) return '—'
  if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`
  if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`
  return `$${n.toLocaleString()}`
}

function fmtPct(n: number | null) {
  if (n === null) return '—'
  return `${n >= 0 ? '+' : ''}${n.toFixed(2)}%`
}

export function CryptoSearch() {
  const [query, setQuery] = useState('')
  const [result, setResult] = useState<SearchResult | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [loading, setLoading] = useState(false)
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [suggestions, setSuggestions] = useState<typeof POPULAR_CRYPTOS>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) setRecentSearches(JSON.parse(saved))
    } catch {}
  }, [])

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target as Node)
        && inputRef.current && !inputRef.current.contains(e.target as Node)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const addRecent = (sym: string) => {
    const updated = [sym, ...recentSearches.filter(s => s !== sym)].slice(0, 8)
    setRecentSearches(updated)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  }

  const handleQueryChange = (val: string) => {
    setQuery(val)
    setNotFound(false)
    const q = val.trim().toUpperCase()
    if (q.length === 0) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }
    const filtered = POPULAR_CRYPTOS.filter(c =>
      c.symbol.startsWith(q) || c.name.toUpperCase().includes(q)
    ).slice(0, 6)
    setSuggestions(filtered)
    setShowSuggestions(filtered.length > 0)
  }

  const doSearch = async (sym: string) => {
    const clean = sym.trim().toUpperCase().replace(/-USD$/, '')
    if (!clean) return
    setShowSuggestions(false)
    setQuery(clean)
    setResult(null)
    setNotFound(false)
    setLoading(true)

    try {
      const res = await fetch(`/api/stock/${clean}-USD`)
      const d = await res.json()
      if (d.error || !d.price) {
        setNotFound(true)
      } else {
        const info = POPULAR_CRYPTOS.find(c => c.symbol === clean)
        setResult({
          symbol: clean,
          name: d.name ?? info?.name ?? clean,
          price: d.price ?? null,
          change: d.change ?? null,
          changePercent: d.changePercent ?? null,
          volume: d.volume ?? null,
          marketCap: d.marketCap ?? null,
          high52w: d.fiftyTwoWeekHigh ?? null,
          low52w: d.fiftyTwoWeekLow ?? null,
        })
        addRecent(clean)
      }
    } catch {
      setNotFound(true)
    } finally {
      setLoading(false)
    }
  }

  const clearRecent = (sym: string) => {
    const updated = recentSearches.filter(s => s !== sym)
    setRecentSearches(updated)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  }

  const pct = result?.changePercent ?? null
  const positive = pct !== null && pct >= 0

  return (
    <div className="font-mono space-y-4">
      <div className="flex items-center gap-2">
        <Search className="h-4 w-4 text-primary" />
        <h1 className="text-lg font-bold">Crypto Search</h1>
      </div>

      {/* Search Bar */}
      <Card>
        <div className="relative">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                ref={inputRef}
                className="font-mono uppercase text-sm pr-8"
                placeholder="Search BTC, ETH, SOL..."
                value={query}
                onChange={e => handleQueryChange(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && doSearch(query)}
                onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
              />
              {query && (
                <button
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => { setQuery(''); setResult(null); setNotFound(false); setSuggestions([]) }}
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
            <Button onClick={() => doSearch(query)} disabled={loading || !query.trim()}>
              {loading ? <span className="animate-pulse">...</span> : <Search className="h-4 w-4" />}
            </Button>
          </div>

          {/* Suggestions Dropdown */}
          {showSuggestions && (
            <div ref={suggestionsRef} className="absolute top-full left-0 right-16 mt-1 bg-card border border-border rounded-md shadow-lg z-10 overflow-hidden">
              {suggestions.map(s => (
                <button
                  key={s.symbol}
                  className="w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-muted transition-colors text-left"
                  onMouseDown={() => doSearch(s.symbol)}
                >
                  <span>
                    <span className="font-semibold text-primary">{s.symbol}</span>
                    <span className="text-muted-foreground ml-2">{s.name}</span>
                  </span>
                  <ChevronRight className="h-3 w-3 text-muted-foreground" />
                </button>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Recent Searches */}
      {recentSearches.length > 0 && !result && !loading && !notFound && (
        <Card>
          <SectionTitle>Recent Searches</SectionTitle>
          <div className="flex flex-wrap gap-2">
            {recentSearches.map(s => (
              <div key={s} className="flex items-center gap-1 bg-muted rounded px-2 py-1 text-xs">
                <Clock className="h-3 w-3 text-muted-foreground" />
                <button className="hover:text-primary transition-colors" onClick={() => doSearch(s)}>{s}</button>
                <button className="text-muted-foreground hover:text-red-500 ml-1" onClick={() => clearRecent(s)}>
                  <X className="h-2.5 w-2.5" />
                </button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Not Found */}
      {notFound && (
        <Card className="text-center py-6">
          <Search className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm font-semibold">No results for &ldquo;{query}&rdquo;</p>
          <p className="text-xs text-muted-foreground mt-1">Check the symbol and try again</p>
        </Card>
      )}

      {/* Result */}
      {result && (
        <div className="space-y-3">
          <Card>
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                    {result.symbol.slice(0, 2)}
                  </div>
                  <div>
                    <p className="font-bold text-lg leading-none">{result.symbol}</p>
                    <p className="text-xs text-muted-foreground">{result.name}</p>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold">{fmtPrice(result.price)}</p>
                <p className={cn('text-sm flex items-center justify-end gap-1', positive ? 'text-green-500' : 'text-red-500')}>
                  {pct !== null && (positive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />)}
                  {fmtPct(pct)} (24h)
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { label: '24h Change', value: result.change !== null ? `$${result.change.toFixed(4)}` : '—', cls: positive ? 'text-green-500' : 'text-red-500' },
                { label: 'Volume (24h)', value: fmtLarge(result.volume) },
                { label: 'Market Cap', value: fmtLarge(result.marketCap) },
                { label: '52w High', value: fmtPrice(result.high52w), cls: 'text-green-500' },
                { label: '52w Low', value: fmtPrice(result.low52w), cls: 'text-red-500' },
              ].map(row => (
                <div key={row.label} className="bg-muted/40 rounded p-2">
                  <p className="text-xs text-muted-foreground">{row.label}</p>
                  <p className={cn('text-sm font-semibold', row.cls)}>{row.value}</p>
                </div>
              ))}
            </div>
          </Card>

          {/* Description */}
          {DESCRIPTIONS[result.symbol] && (
            <Card>
              <SectionTitle>About {result.name}</SectionTitle>
              <p className="text-sm text-muted-foreground leading-relaxed">{DESCRIPTIONS[result.symbol]}</p>
            </Card>
          )}
        </div>
      )}

      {/* Popular */}
      {!result && !notFound && !loading && (
        <Card>
          <SectionTitle>Popular Cryptos</SectionTitle>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {POPULAR_CRYPTOS.slice(0, 12).map(c => (
              <button
                key={c.symbol}
                onClick={() => doSearch(c.symbol)}
                className="flex items-center gap-2 p-2 rounded bg-muted/40 hover:bg-muted transition-colors text-left"
              >
                <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-[8px] font-bold text-primary">
                  {c.symbol.slice(0, 2)}
                </div>
                <div>
                  <p className="text-xs font-semibold">{c.symbol}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{c.name}</p>
                </div>
              </button>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
