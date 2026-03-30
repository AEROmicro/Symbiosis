'use client'

import { useState, useMemo, useEffect } from 'react'
import { useStockData } from '@/hooks/use-stock-data'
import { PriceChart } from '@/components/price-chart'
import { FullscreenChart } from '@/components/fullscreen-chart'
import { TrendingUp, TrendingDown, Activity, BarChart3, DollarSign, Clock, Moon, Sunrise } from 'lucide-react'
import { cn, getCurrencySymbol } from '@/lib/utils'
import { resolveExchange, getMarketState, EXCHANGES } from '@/lib/exchanges'

interface StockDetailProps {
  symbol: string
  refreshInterval?: number
  onSymbolChange?: (symbol: string) => void
}

export function StockDetail({ symbol, refreshInterval = 15000, onSymbolChange }: StockDetailProps) {
  const { stock, isLoading } = useStockData(symbol, refreshInterval)
  const [fullscreenOpen, setFullscreenOpen] = useState(false)

  // Tick every 60 s so the locally-computed market state badge stays accurate
  // even when SWR is polling slowly (e.g. closed market, 15-min interval).
  const [tick, setTick] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 60_000)
    return () => clearInterval(id)
  }, [])

  const resolvedExchange = useMemo(
    () => (stock ? resolveExchange(stock.exchange) : null),
    [stock]
  )

  // Effective market state:
  //  1. Trust Yahoo's PRE / POST / REGULAR signals directly.
  //  2. If Yahoo says CLOSED, fall back to local-clock calculation for the
  //     stock's actual exchange — this catches PRE, POST, and mis-reported CLOSED.
  //  3. If no stock data at all, use NYSE as a best-guess default.
  // The `tick` dependency ensures this recomputes every 60 s without an API call.
  const effectiveMarketState = useMemo(() => {
    if (!stock) {
      const defaultEx = EXCHANGES[0] // NYSE
      return getMarketState(defaultEx)
    }
    if (stock.marketState === 'REGULAR' || stock.marketState === 'PRE' || stock.marketState === 'POST')
      return stock.marketState
    // Yahoo returned CLOSED — derive from local exchange clock
    const ex = resolvedExchange ?? EXCHANGES[0]
    return getMarketState(ex)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stock, resolvedExchange, tick])

  if (isLoading) {
    return (
      <div className="flex flex-col h-full space-y-2 p-2">
        <div className="flex-none border border-border bg-card rounded-md p-4 animate-pulse">
          <div className="h-6 w-24 bg-muted rounded mb-3" />
          <div className="h-10 w-32 bg-muted rounded" />
        </div>
        <div className="flex-1 bg-muted rounded-md animate-pulse" />
      </div>
    )
  }

  if (!stock) {
    return (
      <div className="flex items-center justify-center h-full border border-border bg-card rounded-md p-6 text-center">
        <p className="text-muted-foreground">Select a stock to view details</p>
      </div>
    )
  }

  const sym = getCurrencySymbol(stock.currency)

  // Determine which extended-session data is available
  const hasPreMarket =
    stock.preMarketPrice != null &&
    stock.preMarketChange != null &&
    stock.preMarketChangePercent != null
  const hasPostMarket =
    stock.postMarketPrice != null &&
    stock.postMarketChange != null &&
    stock.postMarketChangePercent != null

  // Effective "current" price — matches what the watchlist card displays:
  //   PRE  + pre-market data  → pre-market price
  //   POST + post-market data → post-market price
  //   otherwise               → regular session price
  const effectivePrice =
    effectiveMarketState === 'PRE'  && hasPreMarket  ? stock.preMarketPrice!  :
    effectiveMarketState === 'POST' && hasPostMarket ? stock.postMarketPrice! :
    stock.price
  const effectiveChange =
    effectiveMarketState === 'PRE'  && hasPreMarket  ? stock.preMarketChange!  :
    effectiveMarketState === 'POST' && hasPostMarket ? stock.postMarketChange! :
    stock.change
  const effectiveChangePercent =
    effectiveMarketState === 'PRE'  && hasPreMarket  ? stock.preMarketChangePercent!  :
    effectiveMarketState === 'POST' && hasPostMarket ? stock.postMarketChangePercent! :
    stock.changePercent

  const isPositive = effectiveChange >= 0

  // Show the regular-session row as secondary when pre/post market is the primary
  const showRegularAsSecondary =
    (effectiveMarketState === 'PRE'  && hasPreMarket) ||
    (effectiveMarketState === 'POST' && hasPostMarket)

  const regularPos = stock.change >= 0

  const coreStats = [
    { label: 'Open',      value: `${sym}${stock.open.toFixed(2)}`,         icon: Clock },
    { label: 'Prev Close',value: `${sym}${stock.previousClose.toFixed(2)}`,icon: DollarSign },
    { label: 'Day High',  value: `${sym}${stock.high.toFixed(2)}`,         icon: TrendingUp },
    { label: 'Day Low',   value: `${sym}${stock.low.toFixed(2)}`,          icon: TrendingDown },
    { label: 'Volume',    value: formatNumber(stock.volume),                icon: BarChart3 },
    { label: 'Avg Volume',value: formatNumber(stock.avgVolume),             icon: Activity },
  ]

  return (
    <div className="flex flex-col h-full w-full overflow-hidden space-y-2">
      
      <div className="flex-none border border-border bg-card rounded-md overflow-hidden">
        
        {/* Header Card */}
        <div className="p-3 border-b border-border">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-3">
              <span className="text-xl font-bold text-foreground">{stock.symbol}</span>
              <span className={cn(
                "px-2 py-0.5 text-[10px] font-bold tracking-wider border rounded",
                effectiveMarketState === 'REGULAR' 
                  ? "bg-primary/10 border-primary/30 text-primary" 
                  : effectiveMarketState === 'PRE' || effectiveMarketState === 'POST'
                  ? "bg-yellow-500/10 border-yellow-500/30 text-yellow-500"
                  : "bg-muted border-border text-muted-foreground"
              )}>
                {effectiveMarketState === 'REGULAR' ? 'LIVE' : effectiveMarketState === 'PRE' ? 'PRE' : effectiveMarketState === 'POST' ? 'AH' : 'CLOSED'}
              </span>
              {/* Exchange badge */}
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                {resolvedExchange && (
                  <span className="text-sm leading-none">{resolvedExchange.flag}</span>
                )}
                <span className="truncate max-w-[140px]" title={stock.exchange}>
                  {resolvedExchange ? resolvedExchange.name : stock.exchange}
                </span>
              </span>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <span className={cn(
                "w-1.5 h-1.5 rounded-full",
                effectiveMarketState === 'REGULAR' ? "bg-primary animate-pulse" :
                effectiveMarketState === 'PRE' || effectiveMarketState === 'POST' ? "bg-yellow-500 animate-pulse" :
                "bg-muted-foreground"
              )} />
              {effectiveMarketState === 'REGULAR' ? 'Market Open' : effectiveMarketState === 'PRE' ? 'Pre-Market' : effectiveMarketState === 'POST' ? 'After Hours' : 'Market Closed'}
            </div>
          </div>
          <p className="text-xs text-muted-foreground mb-2">{stock.name}</p>

          {/* Main price row — always shows the effective current price */}
          <div className="flex items-end gap-3 flex-wrap">
            <span className="text-3xl font-bold text-foreground tabular-nums leading-none">
              {sym}{effectivePrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <div className={cn(
              "flex items-center gap-1 text-sm font-medium",
              isPositive ? "text-primary" : "text-destructive"
            )}>
              {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              <span className="tabular-nums">
                {isPositive ? '+' : ''}{effectiveChange.toFixed(2)} ({isPositive ? '+' : ''}{effectiveChangePercent.toFixed(2)}%)
              </span>
            </div>
            {/* Only show "Regular Close" label when the market is closed and no extended-hours data is the primary */}
            {effectiveMarketState === 'CLOSED' && !showRegularAsSecondary && (
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider self-end pb-0.5">Regular Close</span>
            )}
            {effectiveMarketState === 'PRE' && (
              <span className="text-[10px] text-yellow-500 uppercase tracking-wider self-end pb-0.5 flex items-center gap-1">
                <Sunrise className="w-3 h-3" /> Pre-Market
              </span>
            )}
            {effectiveMarketState === 'POST' && (
              <span className="text-[10px] text-orange-400 uppercase tracking-wider self-end pb-0.5 flex items-center gap-1">
                <Moon className="w-3 h-3" /> After Hours
              </span>
            )}
          </div>

          {/* Secondary row: regular session close — shown only when pre/post market is the primary */}
          {showRegularAsSecondary && (
            <div className="mt-2 flex items-center gap-2 flex-wrap">
              <DollarSign className="w-3 h-3 text-muted-foreground shrink-0" />
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Regular Close</span>
              <span className="text-sm font-semibold tabular-nums text-muted-foreground">
                {sym}{stock.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className={cn(
                "text-xs font-medium tabular-nums",
                regularPos ? "text-primary/70" : "text-destructive/70"
              )}>
                {regularPos ? '+' : ''}{stock.change.toFixed(2)} ({regularPos ? '+' : ''}{stock.changePercent.toFixed(2)}%)
              </span>
            </div>
          )}
        </div>

        {/* Daily Range Bar */}
        {stock.high > 0 && stock.low > 0 && stock.high !== stock.low && (
          <div className="px-3 py-2 border-b border-border bg-muted/10">
            <div className="flex items-center justify-between text-[10px] uppercase text-muted-foreground mb-1.5">
              <span>Day Range</span>
              <span className="tabular-nums">
                {sym}{stock.low.toFixed(2)} – {sym}{stock.high.toFixed(2)}
              </span>
            </div>
            <div className="relative h-1.5 bg-muted rounded-full overflow-hidden">
              <div 
                className="absolute left-0 top-0 h-full bg-gradient-to-r from-destructive via-yellow-500 to-primary rounded-full opacity-80"
                style={{ width: '100%' }}
              />
              <div 
                className="absolute top-1/2 -translate-y-1/2 w-2 h-2 bg-foreground rounded-full border border-background shadow-md"
                style={{ left: `calc(${((stock.price - stock.low) / (stock.high - stock.low)) * 100}% - 4px)` }}
              />
            </div>
          </div>
        )}

        {/* Quick Stats Row */}
        <div className="hidden sm:grid grid-cols-3 lg:grid-cols-6 border-b border-border">
          {coreStats.map((stat) => (
            <div 
              key={stat.label} 
              className="p-2 border-r border-border last:border-r-0 hover:bg-muted/30 transition-colors"
            >
              <div className="flex items-center gap-1 text-[10px] uppercase text-muted-foreground mb-0.5">
                <stat.icon className="w-3 h-3" />
                {stat.label}
              </div>
              <div className="text-xs font-semibold text-foreground tabular-nums">
                {stat.value}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chart area */}
      <div className="flex-1 min-h-0 w-full relative bg-card border border-border rounded-md overflow-hidden">
        <PriceChart
          symbol={symbol}
          currency={stock.currency}
          onExpand={() => setFullscreenOpen(true)}
        />
      </div>

      {/* Advanced chart — fullscreen via Dialog portal (same as blueprint) */}
      <FullscreenChart
        symbol={symbol}
        open={fullscreenOpen}
        onClose={() => setFullscreenOpen(false)}
        onSymbolChange={onSymbolChange}
      />
    </div>
  )
}

function formatNumber(num: number): string {
  if (!num) return 'N/A'
  if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`
  if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`
  if (num >= 1e3) return `${(num / 1e3).toFixed(1)}K`
  return num.toLocaleString()
}

