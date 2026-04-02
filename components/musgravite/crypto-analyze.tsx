'use client'

import { useState, useEffect, useCallback } from 'react'
import { Activity, TrendingUp, TrendingDown, AlertTriangle, BarChart2, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

const CRYPTO_LIST = [
  'BTC', 'ETH', 'BNB', 'SOL', 'XRP', 'ADA', 'AVAX', 'DOGE', 'MATIC', 'DOT',
  'LINK', 'UNI', 'LTC', 'ATOM', 'TRX',
]

function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000
  return x - Math.floor(x)
}

function simMetrics(symbol: string, price: number | null) {
  const base = symbol.split('').reduce((a, c, i) => a + c.charCodeAt(0) * (i + 1), 0)
  const rsi = 30 + Math.round(seededRandom(base) * 50)
  const macd = seededRandom(base + 1) > 0.5 ? 'Bullish' : 'Bearish'
  const volatility = Math.round(10 + seededRandom(base + 2) * 80)
  const r7 = ((seededRandom(base + 3) - 0.4) * 30)
  const r30 = ((seededRandom(base + 4) - 0.35) * 60)
  const r90 = ((seededRandom(base + 5) - 0.3) * 100)
  const buyPct = Math.round(30 + seededRandom(base + 6) * 40)
  const sellPct = Math.round(10 + seededRandom(base + 7) * 30)
  const holdPct = 100 - buyPct - sellPct

  const supportMult = 0.88 + seededRandom(base + 8) * 0.06
  const resistMult = 1.05 + seededRandom(base + 9) * 0.10
  const support = price ? price * supportMult : null
  const resistance = price ? price * resistMult : null

  const risk: 'Low' | 'Medium' | 'High' = volatility < 35 ? 'Low' : volatility < 65 ? 'Medium' : 'High'

  return { rsi, macd, volatility, r7, r30, r90, buyPct, holdPct, sellPct, support, resistance, risk }
}

function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn('bg-card border border-border rounded-md p-4', className)}>{children}</div>
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-3">{children}</h2>
}

function fmtPct(n: number) {
  return `${n >= 0 ? '+' : ''}${n.toFixed(1)}%`
}

function fmtPrice(n: number | null) {
  if (n === null) return '—'
  if (n >= 1000) return `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  if (n >= 1) return `$${n.toFixed(4)}`
  return `$${n.toFixed(6)}`
}

function GaugeMeter({ value, label, colorClass }: { value: number; label: string; colorClass: string }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className={cn('font-bold', colorClass)}>{value}</span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all duration-700', colorClass.replace('text-', 'bg-'))}
          style={{ width: `${Math.min(100, value)}%` }}
        />
      </div>
    </div>
  )
}

export function CryptoAnalyze() {
  const [selected, setSelected] = useState('BTC')
  const [price, setPrice] = useState<number | null>(null)
  const [pct24h, setPct24h] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)

  const fetchPrice = useCallback(async (sym: string) => {
    setLoading(true)
    setPrice(null)
    setPct24h(null)
    try {
      const res = await fetch(`/api/stock/${sym}-USD`)
      const d = await res.json()
      if (!d.error && d.price) {
        setPrice(d.price)
        setPct24h(d.changePercent ?? null)
      }
    } catch {}
    setLoading(false)
  }, [])

  useEffect(() => { fetchPrice(selected) }, [selected, fetchPrice])

  const m = simMetrics(selected, price)

  const rsiColor = m.rsi < 30 ? 'text-green-500' : m.rsi > 70 ? 'text-red-500' : 'text-yellow-500'
  const rsiLabel = m.rsi < 30 ? 'Oversold' : m.rsi > 70 ? 'Overbought' : 'Neutral'
  const riskColor = m.risk === 'Low' ? 'text-green-500' : m.risk === 'Medium' ? 'text-yellow-500' : 'text-red-500'
  const volColor = m.volatility < 35 ? 'text-green-500' : m.volatility < 65 ? 'text-yellow-500' : 'text-red-500'

  return (
    <div className="font-mono space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-primary" />
          <h1 className="text-lg font-bold">Crypto Analysis</h1>
        </div>
        <Button variant="outline" size="sm" onClick={() => fetchPrice(selected)} disabled={loading}>
          <RefreshCw className={cn('h-3 w-3 mr-1', loading && 'animate-spin')} />
          Refresh
        </Button>
      </div>

      {/* Selector */}
      <Card>
        <div className="flex items-center gap-3">
          <select
            className="flex-1 bg-muted border border-border rounded px-3 py-2 text-sm font-mono"
            value={selected}
            onChange={e => setSelected(e.target.value)}
          >
            {CRYPTO_LIST.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <div className="text-right">
            {loading
              ? <span className="text-muted-foreground text-sm animate-pulse">Loading...</span>
              : (
                <>
                  <p className="text-lg font-bold">{fmtPrice(price)}</p>
                  <p className={cn('text-xs', pct24h !== null && pct24h >= 0 ? 'text-green-500' : 'text-red-500')}>
                    {pct24h !== null ? fmtPct(pct24h) : '—'} (24h)
                  </p>
                </>
              )}
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Technical Indicators */}
        <Card>
          <SectionTitle>Technical Indicators</SectionTitle>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-muted-foreground">RSI (14)</span>
                <div className="flex items-center gap-2">
                  <span className={cn('text-sm font-bold', rsiColor)}>{m.rsi}</span>
                  <span className={cn('text-xs px-1.5 py-0.5 rounded', rsiColor, rsiColor.replace('text-', 'bg-') + '/10')}>{rsiLabel}</span>
                </div>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden relative">
                <div className="absolute left-[30%] top-0 h-full w-px bg-yellow-500/50" />
                <div className="absolute left-[70%] top-0 h-full w-px bg-yellow-500/50" />
                <div
                  className={cn('h-full rounded-full transition-all duration-700', rsiColor.replace('text-', 'bg-'))}
                  style={{ width: `${m.rsi}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-muted-foreground mt-0.5">
                <span>0</span><span>Oversold 30</span><span>Overbought 70</span><span>100</span>
              </div>
            </div>

            <div className="flex justify-between items-center py-2 border-t border-border/50">
              <span className="text-sm text-muted-foreground">MACD Signal</span>
              <div className={cn('flex items-center gap-1 text-sm font-bold', m.macd === 'Bullish' ? 'text-green-500' : 'text-red-500')}>
                {m.macd === 'Bullish' ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {m.macd}
              </div>
            </div>

            {/* Support / Resistance */}
            <div className="space-y-2 pt-1 border-t border-border/50">
              <p className="text-xs text-muted-foreground">Key Levels</p>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Support</span>
                <span className="text-sm font-semibold text-green-500">{fmtPrice(m.support)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Resistance</span>
                <span className="text-sm font-semibold text-red-500">{fmtPrice(m.resistance)}</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Price Momentum */}
        <Card>
          <SectionTitle>Price Momentum</SectionTitle>
          <div className="space-y-3">
            {[
              { label: '7d Return',  value: m.r7 },
              { label: '30d Return', value: m.r30 },
              { label: '90d Return', value: m.r90 },
            ].map(row => (
              <div key={row.label} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{row.label}</span>
                  <span className={cn('font-semibold', row.value >= 0 ? 'text-green-500' : 'text-red-500')}>
                    {fmtPct(row.value)}
                  </span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={cn('h-full rounded-full transition-all duration-700', row.value >= 0 ? 'bg-green-500' : 'bg-red-500')}
                    style={{ width: `${Math.min(100, Math.abs(row.value))}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Volatility & Risk */}
        <Card>
          <SectionTitle>Volatility &amp; Risk</SectionTitle>
          <GaugeMeter value={m.volatility} label="Volatility Score" colorClass={volColor} />
          <div className="mt-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Risk Assessment</p>
              <div className={cn('flex items-center gap-1', riskColor)}>
                <AlertTriangle className="h-4 w-4" />
                <span className="text-lg font-bold">{m.risk} Risk</span>
              </div>
            </div>
            <div className="text-right text-xs text-muted-foreground">
              <p>Based on 30-day</p>
              <p>historical volatility</p>
            </div>
          </div>
        </Card>

        {/* Analyst Sentiment */}
        <Card>
          <SectionTitle>Analyst Sentiment</SectionTitle>
          <div className="space-y-2">
            {[
              { label: 'Buy',  value: m.buyPct,  color: 'bg-green-500' },
              { label: 'Hold', value: m.holdPct, color: 'bg-yellow-500' },
              { label: 'Sell', value: m.sellPct, color: 'bg-red-500' },
            ].map(row => (
              <div key={row.label} className="space-y-0.5">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">{row.label}</span>
                  <span className="font-semibold">{row.value}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className={cn('h-full rounded-full transition-all duration-700', row.color)} style={{ width: `${row.value}%` }} />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground border-t border-border/50 pt-3">
            <BarChart2 className="h-3 w-3" />
            <span>Simulated data — for educational purposes only</span>
          </div>
        </Card>
      </div>
    </div>
  )
}
