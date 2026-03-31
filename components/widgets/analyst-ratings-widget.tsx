'use client'
import { useState, useEffect } from 'react'
import { RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AnalystRating {
  symbol: string
  name: string
  buy: number
  hold: number
  sell: number
  strongBuy: number
  strongSell: number
  targetPrice: number | null
}

const SYMBOLS = ['AAPL', 'MSFT', 'NVDA', 'AMZN', 'GOOGL', 'META', 'TSLA', 'JPM']

async function fetchRating(symbol: string): Promise<AnalystRating | null> {
  try {
    const url = `https://query2.yahoo.com/v10/finance/quoteSummary/${symbol}?modules=recommendationTrend,financialData`
    const res = await fetch(`/api/stock/${symbol}`)
    const quote = res.ok ? await res.json() : null

    // Fetch recommendation trend
    const trendRes = await fetch(
      `https://query2.yahoo.com/v10/finance/quoteSummary/${symbol}?modules=recommendationTrend`
    ).catch(() => null)

    let buy = 0, hold = 0, sell = 0, strongBuy = 0, strongSell = 0
    if (trendRes?.ok) {
      const trendData = await trendRes.json().catch(() => null)
      const trend = trendData?.quoteSummary?.result?.[0]?.recommendationTrend?.trend?.[0]
      if (trend) {
        buy = trend.buy ?? 0
        hold = trend.hold ?? 0
        sell = trend.sell ?? 0
        strongBuy = trend.strongBuy ?? 0
        strongSell = trend.strongSell ?? 0
      }
    }

    return {
      symbol,
      name: quote?.name ?? symbol,
      buy: buy + strongBuy,
      hold,
      sell: sell + strongSell,
      strongBuy,
      strongSell,
      targetPrice: quote?.targetPrice ?? null,
    }
  } catch {
    return null
  }
}

function consensus(r: AnalystRating): { label: string; cls: string } {
  const total = r.buy + r.hold + r.sell
  if (total === 0) return { label: 'N/A', cls: 'text-muted-foreground' }
  const buyPct = r.buy / total
  const sellPct = r.sell / total
  if (buyPct >= 0.6)  return { label: 'Strong Buy', cls: 'text-price-up' }
  if (buyPct >= 0.4)  return { label: 'Buy',         cls: 'text-price-up/80' }
  if (sellPct >= 0.4) return { label: 'Sell',        cls: 'text-price-down' }
  return { label: 'Hold', cls: 'text-yellow-400' }
}

export function AnalystRatingsWidget() {
  const [ratings, setRatings] = useState<AnalystRating[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const load = async () => {
    setLoading(true)
    const results = await Promise.all(SYMBOLS.map(fetchRating))
    setRatings(results.filter(Boolean) as AnalystRating[])
    setLastUpdated(new Date())
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  return (
    <div className="flex flex-col h-full font-mono text-xs">
      <div className="grid grid-cols-[3rem_1fr_3.5rem_3.5rem_3.5rem_5rem] gap-x-1 px-3 py-1 text-[9px] text-muted-foreground border-b border-border uppercase tracking-wide shrink-0">
        <span>Sym</span>
        <span>Name</span>
        <span className="text-center text-price-up">Buy</span>
        <span className="text-center text-yellow-400">Hold</span>
        <span className="text-center text-price-down">Sell</span>
        <span className="text-right">Consensus</span>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading && ratings.length === 0 ? (
          <div className="flex items-center justify-center h-full gap-2 text-muted-foreground">
            <RefreshCw className="w-3 h-3 animate-spin" />
            <span>Loading ratings…</span>
          </div>
        ) : (
          ratings.map((r, i) => {
            const c = consensus(r)
            return (
              <div
                key={r.symbol}
                className={cn(
                  'grid grid-cols-[3rem_1fr_3.5rem_3.5rem_3.5rem_5rem] gap-x-1 px-3 py-1.5 border-b border-border/30 hover:bg-muted/10 transition-colors items-center',
                  i % 2 === 0 ? '' : 'bg-muted/5'
                )}
              >
                <span className="text-primary font-semibold">{r.symbol}</span>
                <span className="text-muted-foreground truncate">{r.name}</span>
                <span className="text-center text-price-up">{r.buy}</span>
                <span className="text-center text-yellow-400">{r.hold}</span>
                <span className="text-center text-price-down">{r.sell}</span>
                <span className={cn('text-right font-semibold', c.cls)}>{c.label}</span>
              </div>
            )
          })
        )}
      </div>

      <div className="text-[9px] text-muted-foreground px-3 py-1 border-t border-border shrink-0 flex justify-between items-center">
        <span>Wall Street analyst consensus · Yahoo Finance</span>
        <button onClick={load} disabled={loading} className="hover:text-foreground transition-colors">
          <RefreshCw className={cn('w-3 h-3', loading && 'animate-spin')} />
        </button>
      </div>
    </div>
  )
}
