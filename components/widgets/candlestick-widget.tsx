'use client'

import { useState, useRef, useCallback } from 'react'
import useSWR from 'swr'
import { TrendingUp, TrendingDown, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CandleData {
  time: number
  open: number
  high: number
  low: number
  close: number
  volume: number
}

interface ChartResponse {
  symbol: string
  data: CandleData[]
}

interface CandlestickWidgetProps {
  symbol?: string
}

const fetcher = (url: string) => fetch(url).then(r => r.json())

const SVG_W = 480
const SVG_H = 200
const PAD_L = 4
const PAD_R = 4
const PAD_T = 8
const PAD_B = 8

const RANGES = [
  { label: '1D', value: '1d' },
  { label: '5D', value: '5d' },
  { label: '1M', value: '1mo' },
  { label: '3M', value: '3mo' },
  { label: '6M', value: '6mo' },
  { label: '1Y', value: '1y' },
]

export function CandlestickWidget({ symbol = 'AAPL' }: CandlestickWidgetProps) {
  const [hovered, setHovered] = useState<CandleData | null>(null)
  const [range, setRange] = useState('1mo')
  const svgRef = useRef<SVGSVGElement>(null)

  const { data, isLoading, error } = useSWR<ChartResponse>(
    `/api/stock/${encodeURIComponent(symbol)}/chart?range=${range}`,
    fetcher,
    { refreshInterval: range === '1d' ? 30_000 : 0, dedupingInterval: 60_000 }
  )

  const candles = data?.data ?? []

  // Period gain/loss: first candle open → last candle close
  const firstOpen = candles.length > 0 ? (candles[0].open ?? candles[0].close) : null
  const lastClose = candles.length > 0 ? candles[candles.length - 1].close : null
  const periodChange = firstOpen != null && lastClose != null && firstOpen > 0
    ? lastClose - firstOpen
    : null
  const periodChangePct = firstOpen != null && periodChange != null && firstOpen > 0
    ? (periodChange / firstOpen) * 100
    : null
  const periodIsPositive = (periodChange ?? 0) >= 0

  const renderChart = useCallback(() => {
    if (candles.length === 0) return null

    const highs = candles.map(c => c.high).filter(Boolean)
    const lows  = candles.map(c => c.low).filter(Boolean)
    const minPrice = Math.min(...lows)
    const maxPrice = Math.max(...highs)
    const priceRange = maxPrice - minPrice || 1

    const chartW = SVG_W - PAD_L - PAD_R
    const chartH = SVG_H - PAD_T - PAD_B

    const toY = (price: number) => PAD_T + chartH - ((price - minPrice) / priceRange) * chartH
    const candleW = Math.max(2, Math.min(8, (chartW / candles.length) * 0.6))
    const spacing = chartW / candles.length

    return candles.map((c, i) => {
      if (c.open == null || c.close == null || c.high == null || c.low == null) return null
      const x = PAD_L + i * spacing + spacing / 2
      const isUp = c.close >= c.open
      const color = isUp ? 'var(--price-up)' : 'var(--price-down)'

      const bodyTop    = toY(Math.max(c.open, c.close))
      const bodyBottom = toY(Math.min(c.open, c.close))
      const bodyH      = Math.max(1, bodyBottom - bodyTop)
      const wickTop    = toY(c.high)
      const wickBottom = toY(c.low)

      return (
        <g
          key={c.time}
          onMouseEnter={() => setHovered(c)}
          onMouseLeave={() => setHovered(null)}
          style={{ cursor: 'crosshair' }}
        >
          {/* wick */}
          <line x1={x} y1={wickTop} x2={x} y2={wickBottom} stroke={color} strokeWidth={1} opacity={0.7} />
          {/* body */}
          <rect
            x={x - candleW / 2}
            y={bodyTop}
            width={candleW}
            height={bodyH}
            fill={color}
            stroke={color}
            strokeWidth={0.5}
            opacity={0.85}
          />
        </g>
      )
    })
  }, [candles])

  if (isLoading && candles.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <RefreshCw className="w-4 h-4 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error || (data && candles.length === 0)) {
    return (
      <div className="flex items-center justify-center h-full text-xs text-muted-foreground font-mono">
        No chart data for {symbol}
      </div>
    )
  }

  const fmt = (n: number) => n?.toFixed(2) ?? '—'

  return (
    <div className="flex flex-col h-full font-mono text-xs p-2 gap-1.5">
      {/* Header: symbol + period gain/loss */}
      <div className="flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-primary font-semibold shrink-0">{symbol}</span>
          {periodChange != null && (
            <div className={cn('flex items-center gap-0.5 text-[10px]', periodIsPositive ? 'text-price-up' : 'text-price-down')}>
              {periodIsPositive ? <TrendingUp className="w-3 h-3 shrink-0" /> : <TrendingDown className="w-3 h-3 shrink-0" />}
              <span className="tabular-nums">
                {periodIsPositive ? '+' : ''}{periodChange.toFixed(2)}
                <span className="opacity-70 ml-1">({periodIsPositive ? '+' : ''}{periodChangePct?.toFixed(2) ?? '0.00'}%)</span>
              </span>
            </div>
          )}
        </div>
        <span className="text-muted-foreground text-[10px] shrink-0">OHLC</span>
      </div>

      {/* Range selector */}
      <div className="flex gap-1 shrink-0 flex-wrap">
        {RANGES.map(r => (
          <button
            key={r.value}
            onClick={() => setRange(r.value)}
            className={cn(
              'px-1.5 py-0.5 rounded border text-[9px] transition-colors',
              range === r.value
                ? 'bg-primary/20 text-primary border-primary/40'
                : 'border-border text-muted-foreground hover:text-foreground'
            )}
          >
            {r.label}
          </button>
        ))}
      </div>

      {/* hover info */}
      <div className="flex items-center gap-3 text-[10px] shrink-0 h-4">
        {hovered ? (
          <>
            <span className="text-muted-foreground">O: <span className="text-foreground">{fmt(hovered.open)}</span></span>
            <span className="text-muted-foreground">H: <span className="text-primary">{fmt(hovered.high)}</span></span>
            <span className="text-muted-foreground">L: <span className="text-destructive">{fmt(hovered.low)}</span></span>
            <span className="text-muted-foreground">C: <span className="text-foreground">{fmt(hovered.close)}</span></span>
          </>
        ) : (
          <span className="text-muted-foreground/50">Hover candles for OHLC</span>
        )}
      </div>

      {/* SVG chart */}
      <div className="flex-1 min-h-0">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          className="w-full h-full"
          preserveAspectRatio="none"
        >
          {renderChart()}
        </svg>
      </div>
    </div>
  )
}
