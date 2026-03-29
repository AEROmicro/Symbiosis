'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import useSWR from 'swr'
import { useStockData } from '@/hooks/use-stock-data'
import {
  X, TrendingUp, TrendingDown, Activity, BarChart3, DollarSign,
  Clock, Target, Calendar, Zap, Percent,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { getCurrencySymbol } from '@/lib/utils'
import { Dialog, DialogContent } from '@/components/ui/dialog'

// ── Types ────────────────────────────────────────────────────────────────────

interface ChartData {
  time: number
  open: number
  high: number
  low: number
  close: number
  volume: number
}

interface ChartResponse {
  symbol: string
  range: string
  interval: string
  data: ChartData[]
  previousClose: number
  currentPrice: number
}

export interface FullscreenChartProps {
  symbol: string
  open: boolean
  onClose: () => void
}

type ChartType = 'area' | 'candlestick' | 'line'

// ── Constants ─────────────────────────────────────────────────────────────────

const ranges = [
  { label: '1D', value: '1d' },
  { label: '5D', value: '5d' },
  { label: '1M', value: '1mo' },
  { label: '3M', value: '3mo' },
  { label: '6M', value: '6mo' },
  { label: '1Y', value: '1y' },
  { label: '5Y', value: '5y' },
]

// ── Indicator calculations ────────────────────────────────────────────────────

function calculateRSI(closes: number[], period = 14): (number | null)[] {
  if (closes.length < period + 1) return closes.map(() => null)
  const rsi: (number | null)[] = []
  for (let i = 0; i < period; i++) rsi.push(null)

  let avgGain = 0
  let avgLoss = 0
  for (let i = 1; i <= period; i++) {
    const diff = closes[i] - closes[i - 1]
    if (diff > 0) avgGain += diff
    else avgLoss += Math.abs(diff)
  }
  avgGain /= period
  avgLoss /= period

  const firstRS = avgLoss === 0 ? 100 : avgGain / avgLoss
  rsi.push(100 - 100 / (1 + firstRS))

  for (let i = period + 1; i < closes.length; i++) {
    const diff = closes[i] - closes[i - 1]
    const gain = diff > 0 ? diff : 0
    const loss = diff < 0 ? Math.abs(diff) : 0
    avgGain = (avgGain * (period - 1) + gain) / period
    avgLoss = (avgLoss * (period - 1) + loss) / period
    const rs = avgLoss === 0 ? 100 : avgGain / avgLoss
    rsi.push(100 - 100 / (1 + rs))
  }
  return rsi
}

function calculateMA(closes: number[], period: number): (number | null)[] {
  return closes.map((_, i) => {
    if (i < period - 1) return null
    const sum = closes.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0)
    return sum / period
  })
}

// ── Formatting helpers ────────────────────────────────────────────────────────

function formatTime(ts: number, range: string): string {
  const d = new Date(ts)
  if (range === '1d') {
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
  }
  if (range === '5d') {
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) +
      ' ' + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
  }
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: range === '5y' ? '2-digit' : undefined,
  })
}

function formatNumber(num: number): string {
  if (!num) return 'N/A'
  if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`
  if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`
  if (num >= 1e3) return `${(num / 1e3).toFixed(1)}K`
  return num.toLocaleString()
}

const fetcher = (url: string) => fetch(url).then(r => r.json())

// ── Component ─────────────────────────────────────────────────────────────────

export function FullscreenChart({ symbol, open, onClose }: FullscreenChartProps) {
  const [range, setRange] = useState('1d')
  const [chartType, setChartType] = useState<ChartType>('area')
  const [showMA50, setShowMA50] = useState(true)
  const [showMA200, setShowMA200] = useState(true)
  const [showRSI, setShowRSI] = useState(true)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [hoveredX, setHoveredX] = useState<number | null>(null)
  const chartRef = useRef<HTMLDivElement>(null)

  const { stock } = useStockData(symbol, 30000)

  const isMarketOpen =
    stock?.marketState === 'REGULAR' ||
    stock?.marketState === 'PRE' ||
    stock?.marketState === 'POST'

  const { data, isLoading: chartLoading } = useSWR<ChartResponse>(
    `/api/stock/${symbol}/chart?range=${range}`,
    fetcher,
    {
      refreshInterval: range === '1d' && isMarketOpen ? 30000 : 0,
      revalidateOnFocus: false,
    }
  )

  // ── Data derivation ────────────────────────────────────────────────────────

  const chartData = data?.data ?? []
  const previousClose = data?.previousClose ?? stock?.previousClose ?? 0
  const sym = getCurrencySymbol(stock?.currency)

  const closes = chartData.map(d => d.close)
  const ma50 = calculateMA(closes, 50)
  const ma200 = calculateMA(closes, 200)
  const rsiValues = calculateRSI(closes, 14)

  const allPrices = chartData.flatMap(d => [d.high ?? d.close, d.low ?? d.close])
  if (previousClose > 0) allPrices.push(previousClose)

  const minPrice = allPrices.length ? Math.min(...allPrices) : 0
  const maxPrice = allPrices.length ? Math.max(...allPrices) : 100
  const priceRange = maxPrice - minPrice || 1
  const pad = priceRange * 0.08
  const adjMin = minPrice - pad
  const adjMax = maxPrice + pad
  const adjRange = adjMax - adjMin || 1

  const toY = (price: number) => 100 - ((price - adjMin) / adjRange) * 100
  const toX = (i: number) => chartData.length <= 1 ? 50 : (i / (chartData.length - 1)) * 100

  const lastPrice = chartData.length > 0 ? chartData[chartData.length - 1].close : previousClose
  const refPrice = chartData.length > 0 ? (chartData[0].open || chartData[0].close) : previousClose
  const isPositive = lastPrice >= refPrice

  const hoveredPoint = hoveredIndex !== null ? chartData[hoveredIndex] : null
  const displayPrice = hoveredPoint?.close ?? lastPrice
  const displayChange = refPrice > 0 ? displayPrice - refPrice : 0
  const displayChangePct = refPrice > 0 ? (displayChange / refPrice) * 100 : 0
  const displayIsPos = displayChange >= 0

  const hoveredMA50 = hoveredIndex !== null ? ma50[hoveredIndex] : null
  const hoveredMA200 = hoveredIndex !== null ? ma200[hoveredIndex] : null
  const hoveredRSI = hoveredIndex !== null ? rsiValues[hoveredIndex] : null

  // ── Mouse interaction ──────────────────────────────────────────────────────

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!chartRef.current || chartData.length === 0) return
    const rect = chartRef.current.getBoundingClientRect()
    const pct = (e.clientX - rect.left) / rect.width
    const idx = Math.min(Math.max(0, Math.round(pct * (chartData.length - 1))), chartData.length - 1)
    setHoveredIndex(idx)
    setHoveredX(pct * 100)
  }, [chartData.length])

  const handleMouseLeave = useCallback(() => {
    setHoveredIndex(null)
    setHoveredX(null)
  }, [])

  // ── SVG path builders ──────────────────────────────────────────────────────

  const getLinePath = () =>
    chartData.map((d, i) => `${i === 0 ? 'M' : 'L'} ${toX(i)} ${toY(d.close)}`).join(' ')

  const getAreaPath = () => {
    const line = getLinePath()
    return line
      ? `${line} L ${toX(chartData.length - 1)} 100 L 0 100 Z`
      : ''
  }

  const getMaPath = (ma: (number | null)[]) => {
    let path = ''
    let first = true
    ma.forEach((val, i) => {
      if (val === null) return
      path += first ? `M ${toX(i)} ${toY(val)}` : ` L ${toX(i)} ${toY(val)}`
      first = false
    })
    return path
  }

  // ── Axis labels ────────────────────────────────────────────────────────────

  // Y-axis: 6 price labels evenly spaced across the visible range
  const priceLabels = Array.from({ length: 6 }, (_, i) => {
    const price = adjMin + (i / 5) * adjRange
    return { y: toY(price), price }
  })

  // X-axis: ~6 time labels sampled evenly
  const timeLabels: { x: number; label: string }[] = []
  if (chartData.length > 1) {
    const step = Math.max(1, Math.floor(chartData.length / 6))
    for (let i = 0; i < chartData.length; i += step) {
      timeLabels.push({ x: toX(i), label: formatTime(chartData[i].time, range) })
    }
  }

  const maxVol = Math.max(...chartData.map(d => d.volume || 0)) || 1
  const color = isPositive ? 'var(--primary)' : 'var(--destructive)'

  // Candlestick width based on data density
  // Candlestick body width: use 90% of the per-bar slot, leaving 10% spacing between candles
  const candleWidth = chartData.length > 0 ? Math.max(0.4, 90 / chartData.length) : 1

  // RSI y-coordinate (RSI is 0–100, map to SVG 0–100 top-down)
  const rsiToY = (val: number) => 100 - val

  // ── Stats sidebar ──────────────────────────────────────────────────────────

  const lastMA50 = ma50[ma50.length - 1]
  const lastMA200 = ma200[ma200.length - 1]
  const lastRSI = rsiValues[rsiValues.length - 1]

  const stats = stock
    ? [
        { label: 'Open',      value: `${sym}${stock.open.toFixed(2)}`,            icon: Clock },
        { label: 'Prev Close',value: `${sym}${stock.previousClose.toFixed(2)}`,   icon: DollarSign },
        { label: 'Day High',  value: `${sym}${stock.high.toFixed(2)}`,            icon: TrendingUp,   pos: true },
        { label: 'Day Low',   value: `${sym}${stock.low.toFixed(2)}`,             icon: TrendingDown, pos: false },
        { label: 'Volume',    value: formatNumber(stock.volume),              icon: BarChart3 },
        { label: 'Avg Vol',   value: formatNumber(stock.avgVolume),           icon: Activity },
        { label: 'Mkt Cap',   value: stock.marketCap,                         icon: DollarSign },
        { label: '52W High',  value: `${sym}${stock.fiftyTwoWeekHigh.toFixed(2)}`,icon: TrendingUp,   pos: true },
        { label: '52W Low',   value: `${sym}${stock.fiftyTwoWeekLow.toFixed(2)}`, icon: TrendingDown, pos: false },
        { label: 'P/E',       value: stock.peRatio != null ? stock.peRatio.toFixed(2) : 'N/A',         icon: Percent },
        { label: 'Fwd P/E',   value: stock.forwardPE != null ? stock.forwardPE.toFixed(2) : 'N/A',     icon: Percent },
        { label: 'EPS',       value: stock.eps != null ? `${sym}${stock.eps.toFixed(2)}` : 'N/A',           icon: DollarSign },
        { label: 'Beta',      value: stock.beta != null ? stock.beta.toFixed(2) : 'N/A',               icon: Zap },
        { label: 'Div Yield', value: stock.dividendYield != null ? `${stock.dividendYield.toFixed(2)}%` : 'N/A', icon: Percent },
        { label: 'Target',    value: stock.targetPrice != null ? `${sym}${stock.targetPrice.toFixed(2)}` : 'N/A', icon: Target },
        { label: 'Earnings',  value: stock.earningsDate ?? 'N/A',             icon: Calendar },
        { label: 'MA 50',     value: lastMA50 != null ? `${sym}${lastMA50.toFixed(2)}` : 'N/A',  icon: Activity },
        { label: 'MA 200',    value: lastMA200 != null ? `${sym}${lastMA200.toFixed(2)}` : 'N/A', icon: Activity },
      ]
    : []

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="!top-0 !left-0 !translate-x-0 !translate-y-0 !max-w-none !rounded-none w-screen h-screen flex flex-col font-mono p-0 gap-0 overflow-hidden" showCloseButton={false}>

      {/* ── HEADER ── */}
      <div className="flex-none border-b border-border bg-card/60 backdrop-blur-sm px-4 py-2 flex items-center gap-3 flex-wrap">

        {/* Symbol + badge + name */}
        <div className="flex items-center gap-2 flex-none">
          <span className="text-base font-bold font-mono text-foreground">{symbol}</span>
          {stock && (
            <span className={cn(
              'px-1.5 py-0.5 text-[9px] font-bold tracking-wider border rounded font-mono',
              stock.marketState === 'REGULAR'
                ? 'bg-primary/10 border-primary/30 text-primary'
                : stock.marketState === 'PRE' || stock.marketState === 'POST'
                ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-500'
                : 'bg-muted border-border text-muted-foreground',
            )}>
              {stock.marketState === 'REGULAR'
                ? 'LIVE'
                : stock.marketState === 'PRE'
                ? 'PRE'
                : stock.marketState === 'POST'
                ? 'AH'
                : 'CLOSED'}
            </span>
          )}
          {stock && (
            <span className="hidden md:inline text-xs text-muted-foreground font-mono">{stock.name}</span>
          )}
        </div>

        {/* Price + change */}
        <div className="flex items-baseline gap-2 flex-none">
          <span className="text-xl font-bold tabular-nums font-mono">
            {sym}{displayPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          <span className={cn('text-sm tabular-nums font-mono', displayIsPos ? 'text-primary' : 'text-destructive')}>
            {displayIsPos ? '+' : ''}{displayChange.toFixed(2)} ({displayIsPos ? '+' : ''}{displayChangePct.toFixed(2)}%)
          </span>
        </div>

        {/* OHLCV + indicator values on hover */}
        <div className={cn(
          'hidden lg:flex items-center gap-2 text-[10px] font-mono text-muted-foreground border-l border-border pl-3 flex-wrap',
          !hoveredPoint && 'invisible',
        )}>
          <span>O: <span className="text-foreground">{sym}{hoveredPoint?.open?.toFixed(2) ?? '—'}</span></span>
          <span>H: <span className="text-primary">{sym}{hoveredPoint?.high?.toFixed(2) ?? '—'}</span></span>
          <span>L: <span className="text-destructive">{sym}{hoveredPoint?.low?.toFixed(2) ?? '—'}</span></span>
          <span>C: <span className="text-foreground">{sym}{hoveredPoint?.close?.toFixed(2) ?? '—'}</span></span>
          <span>V: <span className="text-foreground">{hoveredPoint ? formatNumber(hoveredPoint.volume) : '—'}</span></span>
          {showMA50 && (
            <span>MA50: <span className="text-blue-400">{hoveredMA50 != null ? `${sym}${hoveredMA50.toFixed(2)}` : '—'}</span></span>
          )}
          {showMA200 && (
            <span>MA200: <span className="text-orange-400">{hoveredMA200 != null ? `${sym}${hoveredMA200.toFixed(2)}` : '—'}</span></span>
          )}
          {showRSI && (
            <span>RSI: <span className={cn(
              hoveredRSI != null && hoveredRSI > 70 ? 'text-destructive'
                : hoveredRSI != null && hoveredRSI < 30 ? 'text-primary'
                : 'text-purple-400',
            )}>{hoveredRSI != null ? hoveredRSI.toFixed(1) : '—'}</span></span>
          )}
        </div>

        {/* Right-side controls */}
        <div className="ml-auto flex items-center gap-2 flex-none">
          {isMarketOpen && range === '1d' && (
            <div className="flex items-center gap-1 text-[10px] font-mono text-primary">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              LIVE
            </div>
          )}
          <span className="hidden sm:inline text-[10px] font-mono text-muted-foreground">
            Press <kbd className="px-1 border border-border rounded text-[9px]">Esc</kbd> to collapse
          </span>
          <button
            onClick={onClose}
            className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
            aria-label="Close fullscreen chart"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── BODY ── */}
      <div className="flex-1 flex overflow-hidden min-h-0">

        {/* ── LEFT SIDEBAR (desktop) ── */}
        <div className="hidden lg:flex flex-col w-44 flex-none border-r border-border bg-card/30 overflow-hidden">
          <div className="px-2 py-1.5 border-b border-border">
            <span className="text-[9px] font-mono uppercase text-muted-foreground tracking-widest">Statistics</span>
          </div>

          <div className="flex-1 overflow-y-auto">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="px-2 py-1.5 border-b border-border/40 hover:bg-muted/20 transition-colors"
              >
                <div className="flex items-center gap-1 text-[9px] uppercase text-muted-foreground mb-0.5">
                  <stat.icon className="w-2.5 h-2.5" />
                  {stat.label}
                </div>
                <div className={cn(
                  'text-[11px] font-mono font-semibold tabular-nums',
                  stat.pos === true
                    ? 'text-primary'
                    : stat.pos === false
                    ? 'text-destructive'
                    : 'text-foreground',
                )}>
                  {stat.value}
                </div>
              </div>
            ))}
          </div>

          {/* Overlay toggles */}
          <div className="px-2 py-2 border-t border-border space-y-1">
            <span className="text-[9px] font-mono uppercase text-muted-foreground tracking-widest">Overlays</span>
            {[
              { label: 'MA 50',  active: showMA50,  toggle: () => setShowMA50(p => !p),  color: 'text-blue-400',   line: 'bg-blue-400' },
              { label: 'MA 200', active: showMA200, toggle: () => setShowMA200(p => !p), color: 'text-orange-400', line: 'bg-orange-400' },
              { label: 'RSI 14', active: showRSI,   toggle: () => setShowRSI(p => !p),   color: 'text-purple-400', line: 'bg-purple-400' },
            ].map((ind) => (
              <button
                key={ind.label}
                onClick={ind.toggle}
                className={cn(
                  'w-full flex items-center gap-2 px-2 py-1 rounded text-[10px] font-mono border transition-colors',
                  ind.active
                    ? `border-current/30 bg-current/5 ${ind.color}`
                    : 'border-border text-muted-foreground hover:text-foreground hover:bg-muted/30',
                )}
              >
                <span className={cn('w-3 h-[2px] rounded', ind.active ? ind.line : 'bg-muted-foreground')} />
                {ind.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── MAIN CHART AREA ── */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

          {/* Controls bar */}
          <div className="flex-none px-3 py-1.5 border-b border-border flex items-center gap-2 flex-wrap bg-background/30">
            {/* Time ranges */}
            <div className="flex gap-0.5">
              {ranges.map((r) => (
                <button
                  key={r.value}
                  onClick={() => setRange(r.value)}
                  className={cn(
                    'px-2 py-0.5 text-[10px] font-mono rounded transition-colors border',
                    range === r.value
                      ? 'bg-primary border-primary text-primary-foreground'
                      : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted',
                  )}
                >
                  {r.label}
                </button>
              ))}
            </div>

            <div className="w-px h-4 bg-border" />

            {/* Chart type */}
            <div className="flex gap-0.5">
              {(['area', 'candlestick', 'line'] as ChartType[]).map((ct) => (
                <button
                  key={ct}
                  onClick={() => setChartType(ct)}
                  className={cn(
                    'px-2 py-0.5 text-[10px] font-mono rounded transition-colors border capitalize',
                    chartType === ct
                      ? 'bg-primary border-primary text-primary-foreground'
                      : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted',
                  )}
                >
                  {ct === 'candlestick' ? 'Candles' : ct.charAt(0).toUpperCase() + ct.slice(1)}
                </button>
              ))}
            </div>

            {/* Overlay toggles (mobile — sidebar is hidden) */}
            <div className="flex gap-0.5 lg:hidden ml-auto">
              {[
                { label: 'MA50',  active: showMA50,  toggle: () => setShowMA50(p => !p) },
                { label: 'MA200', active: showMA200, toggle: () => setShowMA200(p => !p) },
                { label: 'RSI',   active: showRSI,   toggle: () => setShowRSI(p => !p) },
              ].map((ind) => (
                <button
                  key={ind.label}
                  onClick={ind.toggle}
                  className={cn(
                    'px-2 py-0.5 text-[10px] font-mono rounded transition-colors border',
                    ind.active
                      ? 'bg-primary/20 border-primary/50 text-primary'
                      : 'border-transparent text-muted-foreground hover:bg-muted',
                  )}
                >
                  {ind.label}
                </button>
              ))}
            </div>
          </div>

          {/* Chart panels */}
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden p-2 gap-1.5">

            {/* ── PRICE CHART ── */}
            <div
              ref={chartRef}
              className={cn(
                'relative cursor-crosshair select-none border border-border rounded bg-card/20 overflow-hidden',
                showRSI ? 'flex-[3]' : 'flex-1',
              )}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
            >
              {chartLoading ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-muted-foreground font-mono text-xs animate-pulse">LOADING_DATA...</div>
                </div>
              ) : chartData.length > 0 ? (
                <>
                  {/* Y-axis price labels — right side overlay */}
                  <div className="absolute right-1 top-1 bottom-5 flex flex-col justify-between text-[9px] font-mono text-muted-foreground/50 pointer-events-none z-10">
                    {priceLabels.slice().reverse().map((pl, i) => (
                      <span key={i} className="leading-none tabular-nums">
                        {sym}{pl.price.toFixed(pl.price >= 100 ? 0 : 2)}
                      </span>
                    ))}
                  </div>

                  {/* SVG chart */}
                  <svg
                    viewBox="0 0 100 100"
                    preserveAspectRatio="none"
                    className="absolute inset-0 w-full h-full"
                    style={{ paddingBottom: '20px' }}
                  >
                    <defs>
                      <linearGradient id="fsc-gradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%"   stopColor={color} stopOpacity="0.25" />
                        <stop offset="100%" stopColor={color} stopOpacity="0" />
                      </linearGradient>
                      <clipPath id="fsc-clip">
                        <rect x="0" y="0" width="100" height="100" />
                      </clipPath>
                    </defs>

                    {/* Grid lines */}
                    {priceLabels.map((pl, i) => (
                      <line
                        key={i}
                        x1="0" y1={pl.y} x2="100" y2={pl.y}
                        stroke="currentColor" strokeWidth="0.15"
                        className="text-border"
                      />
                    ))}

                    {/* Previous-close dashed reference */}
                    {previousClose > 0 && (
                      <line
                        x1="0" y1={toY(previousClose)} x2="100" y2={toY(previousClose)}
                        stroke="currentColor" strokeWidth="0.3" strokeDasharray="2,2"
                        className="text-muted-foreground/40"
                      />
                    )}

                    {/* ── Chart data ── */}
                    {chartType === 'area' && (
                      <>
                        <path d={getAreaPath()} fill="url(#fsc-gradient)" clipPath="url(#fsc-clip)" />
                        <path
                          d={getLinePath()} fill="none" stroke={color} strokeWidth="1.5"
                          vectorEffect="non-scaling-stroke" clipPath="url(#fsc-clip)"
                        />
                      </>
                    )}

                    {chartType === 'line' && (
                      <path
                        d={getLinePath()} fill="none" stroke={color} strokeWidth="1.5"
                        vectorEffect="non-scaling-stroke" clipPath="url(#fsc-clip)"
                      />
                    )}

                    {chartType === 'candlestick' && chartData.map((d, i) => {
                      const x = toX(i)
                      const openY  = toY(d.open ?? d.close)
                      const closeY = toY(d.close)
                      const highY  = toY(d.high ?? d.close)
                      const lowY   = toY(d.low ?? d.close)
                      const bullish = d.close >= (d.open ?? d.close)
                      const cColor  = bullish ? 'var(--primary)' : 'var(--destructive)'
                      const bodyTop = Math.min(openY, closeY)
                      const bodyH   = Math.max(Math.abs(closeY - openY), 0.5)
                      const hw      = candleWidth / 2
                      return (
                        <g key={i} clipPath="url(#fsc-clip)">
                          <line
                            x1={x} y1={highY} x2={x} y2={lowY}
                            stroke={cColor} strokeWidth="0.4"
                            vectorEffect="non-scaling-stroke"
                          />
                          <rect
                            x={x - hw} y={bodyTop} width={candleWidth} height={bodyH}
                            fill={cColor} fillOpacity={bullish ? 0.75 : 1}
                            stroke={cColor} strokeWidth="0.2"
                            vectorEffect="non-scaling-stroke"
                          />
                        </g>
                      )
                    })}

                    {/* ── Moving averages ── */}
                    {showMA50 && getMaPath(ma50) && (
                      <path
                        d={getMaPath(ma50)} fill="none"
                        stroke="#60a5fa" strokeWidth="0.8" strokeDasharray="3,2"
                        vectorEffect="non-scaling-stroke" clipPath="url(#fsc-clip)"
                      />
                    )}
                    {showMA200 && getMaPath(ma200) && (
                      <path
                        d={getMaPath(ma200)} fill="none"
                        stroke="#fb923c" strokeWidth="0.8" strokeDasharray="3,2"
                        vectorEffect="non-scaling-stroke" clipPath="url(#fsc-clip)"
                      />
                    )}

                    {/* ── Crosshair ── */}
                    {hoveredX !== null && (
                      <>
                        <line
                          x1={hoveredX} y1="0" x2={hoveredX} y2="100"
                          stroke="currentColor" strokeWidth="0.4"
                          className="text-foreground/40"
                        />
                        {hoveredPoint && (
                          <>
                            <line
                              x1="0" y1={toY(hoveredPoint.close)} x2="100" y2={toY(hoveredPoint.close)}
                              stroke="currentColor" strokeWidth="0.3" strokeDasharray="1,2"
                              className="text-foreground/30"
                            />
                            <circle
                              cx={hoveredX} cy={toY(hoveredPoint.close)}
                              r="0.8" fill={color}
                              vectorEffect="non-scaling-stroke"
                            />
                          </>
                        )}
                      </>
                    )}
                  </svg>

                  {/* ── Time axis ── */}
                  <div className="absolute bottom-0 left-0 right-8 h-5 flex items-center pointer-events-none overflow-hidden">
                    {timeLabels.map((tl, i) => (
                      <span
                        key={i}
                        className="absolute text-[8px] font-mono text-muted-foreground/50 -translate-x-1/2 whitespace-nowrap"
                        style={{ left: `${tl.x}%` }}
                      >
                        {tl.label}
                      </span>
                    ))}
                  </div>

                  {/* ── Hover OHLCV tooltip ── */}
                  {hoveredPoint && hoveredX !== null && (
                    <div
                      className="absolute top-2 pointer-events-none z-20"
                      style={
                        hoveredX > 55
                          ? { right: `${100 - hoveredX}%`, transform: 'translateX(-4px)' }
                          : { left: `${hoveredX}%`, transform: 'translateX(4px)' }
                      }
                    >
                      <div className="bg-popover/95 border border-border rounded px-2 py-1.5 text-[10px] font-mono shadow-lg backdrop-blur-sm">
                        <div className="text-muted-foreground mb-1 text-[9px]">
                          {formatTime(hoveredPoint.time, range)}
                        </div>
                        <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 tabular-nums">
                          <span className="text-muted-foreground">O</span>
                          <span>{sym}{hoveredPoint.open?.toFixed(2)}</span>
                          <span className="text-primary">H</span>
                          <span className="text-primary">{sym}{hoveredPoint.high?.toFixed(2)}</span>
                          <span className="text-destructive">L</span>
                          <span className="text-destructive">{sym}{hoveredPoint.low?.toFixed(2)}</span>
                          <span>C</span>
                          <span>{sym}{hoveredPoint.close?.toFixed(2)}</span>
                          <span className="text-muted-foreground">Vol</span>
                          <span>{formatNumber(hoveredPoint.volume)}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-muted-foreground font-mono text-sm">
                  NO_DATA
                </div>
              )}
            </div>

            {/* ── VOLUME BARS ── */}
            <div className="flex-none h-10 border border-border rounded bg-card/20 relative overflow-hidden">
              <span className="absolute left-1.5 top-0.5 text-[8px] font-mono text-muted-foreground/50 pointer-events-none z-10">
                VOL
              </span>
              <div className="flex items-end h-full gap-[0.5px] px-0.5 pb-0.5 pt-4">
                {chartData.map((d, i) => {
                  const volH = (d.volume / maxVol) * 100
                  const isPos = i === 0
                    ? d.close >= previousClose
                    : d.close >= chartData[i - 1].close
                  return (
                    <div
                      key={i}
                      className={cn('flex-1 min-w-0', isPos ? 'bg-primary/50' : 'bg-destructive/50')}
                      style={{ height: `${volH}%` }}
                    />
                  )
                })}
              </div>
            </div>

            {/* ── RSI PANEL ── */}
            {showRSI && (
              <div className="flex-none h-20 border border-border rounded bg-card/20 overflow-hidden relative">
                {/* Label */}
                <span className="absolute left-1.5 top-0.5 text-[8px] font-mono text-muted-foreground/50 pointer-events-none z-10">
                  RSI (14)
                </span>

                {/* Y-axis labels */}
                <div className="absolute right-1 top-0 bottom-0 flex flex-col justify-between text-[8px] font-mono pointer-events-none z-10 py-0.5">
                  <span className="text-muted-foreground/40">100</span>
                  <span className="text-destructive/60">70</span>
                  <span className="text-primary/60">30</span>
                  <span className="text-muted-foreground/40">0</span>
                </div>

                <svg
                  viewBox="0 0 100 100"
                  preserveAspectRatio="none"
                  className="absolute inset-0 w-full h-full"
                  style={{ paddingRight: '24px' }}
                >
                  {/* Reference lines */}
                  <line x1="0" y1={rsiToY(70)} x2="100" y2={rsiToY(70)}
                    stroke="var(--destructive)" strokeWidth="0.4" strokeDasharray="2,2" strokeOpacity="0.5" />
                  <line x1="0" y1={rsiToY(30)} x2="100" y2={rsiToY(30)}
                    stroke="var(--primary)" strokeWidth="0.4" strokeDasharray="2,2" strokeOpacity="0.5" />
                  <line x1="0" y1={rsiToY(50)} x2="100" y2={rsiToY(50)}
                    stroke="currentColor" strokeWidth="0.2" strokeOpacity="0.15"
                    className="text-muted-foreground" />

                  {/* RSI line */}
                  {(() => {
                    let path = ''
                    let first = true
                    rsiValues.forEach((val, i) => {
                      if (val === null) return
                      path += first
                        ? `M ${toX(i)} ${rsiToY(val)}`
                        : ` L ${toX(i)} ${rsiToY(val)}`
                      first = false
                    })
                    return path
                      ? <path d={path} fill="none" stroke="#a855f7" strokeWidth="1" vectorEffect="non-scaling-stroke" />
                      : null
                  })()}

                  {/* Crosshair sync */}
                  {hoveredX !== null && (
                    <line
                      x1={hoveredX} y1="0" x2={hoveredX} y2="100"
                      stroke="currentColor" strokeWidth="0.4"
                      className="text-foreground/30"
                    />
                  )}
                </svg>

                {/* Current RSI readout */}
                {lastRSI != null && (
                  <div className={cn(
                    'absolute bottom-1 left-8 text-[9px] font-mono font-semibold',
                    lastRSI > 70 ? 'text-destructive' : lastRSI < 30 ? 'text-primary' : 'text-purple-400',
                  )}>
                    {lastRSI.toFixed(1)}
                    {lastRSI > 70 && ' · OVERBOUGHT'}
                    {lastRSI < 30 && ' · OVERSOLD'}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      </DialogContent>
    </Dialog>
  )
}
