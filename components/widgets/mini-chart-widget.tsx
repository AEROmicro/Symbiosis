'use client'

import { useState, useRef, useCallback } from 'react'
import useSWR from 'swr'
import { TrendingUp, TrendingDown, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ChartPoint {
  time: number
  open: number
  high: number
  low: number
  close: number
  volume: number
}

interface ChartResponse {
  symbol: string
  data: ChartPoint[]
  previousClose: number
}

const RANGES = [
  { label: '1D',  value: '1d'  },
  { label: '5D',  value: '5d'  },
  { label: '1M',  value: '1mo' },
  { label: '3M',  value: '3mo' },
  { label: '6M',  value: '6mo' },
  { label: '1Y',  value: '1y'  },
  { label: '5Y',  value: '5y'  },
]

const fetcher = (url: string) => fetch(url).then(r => r.json())

interface MiniChartWidgetProps {
  symbol?: string
}

export function MiniChartWidget({ symbol: propSymbol = 'AAPL' }: MiniChartWidgetProps) {
  const [symbol, setSymbol] = useState(propSymbol)
  const [inputVal, setInputVal] = useState(propSymbol)
  const [range, setRange] = useState('1d')
  const [hoverIdx, setHoverIdx] = useState<number | null>(null)
  const svgRef = useRef<SVGSVGElement>(null)

  const { data, isLoading } = useSWR<ChartResponse>(
    `/api/stock/${encodeURIComponent(symbol)}/chart?range=${range}`,
    fetcher,
    { refreshInterval: range === '1d' ? 15_000 : 0, dedupingInterval: 5_000 }
  )

  const points = data?.data ?? []

  // Reference price: previousClose for 1D, first candle open for others
  const refPrice = range === '1d' && (data?.previousClose ?? 0) > 0
    ? data!.previousClose
    : points.length > 0 ? (points[0].open || points[0].close) : 0

  const lastClose = points.length > 0 ? points[points.length - 1].close : 0
  const hovered   = hoverIdx != null ? points[hoverIdx] : null

  const displayPrice = hovered?.close ?? lastClose
  const periodChange    = refPrice > 0 ? displayPrice - refPrice : null
  const periodChangePct = refPrice > 0 && periodChange != null ? (periodChange / refPrice) * 100 : null
  const isPositive = (periodChange ?? 0) >= 0

  // SVG sparkline
  const buildPath = useCallback(() => {
    if (points.length < 2) return { path: '', area: '', min: 0, max: 0 }
    const closes = points.map(p => p.close)
    const min = Math.min(...closes, refPrice > 0 ? refPrice : Infinity)
    const max = Math.max(...closes, refPrice > 0 ? refPrice : -Infinity)
    const pad = (max - min) * 0.08 || 1
    const lo = min - pad
    const hi = max + pad
    const range = hi - lo || 1
    const W = 400, H = 100

    const toX = (i: number) => (i / (points.length - 1)) * W
    const toY = (v: number) => H - ((v - lo) / range) * H

    const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${toX(i).toFixed(1)} ${toY(p.close).toFixed(1)}`).join(' ')
    const area = `${path} L ${W} ${H} L 0 ${H} Z`

    // Baseline Y for refPrice
    const baseY = refPrice > 0 ? toY(refPrice) : H

    return { path, area, min: lo, max: hi, range, W, H, baseY, toX, toY }
  }, [points, refPrice])

  const chart = buildPath()

  const handleMouseMove = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current || points.length === 0) return
    const rect = svgRef.current.getBoundingClientRect()
    const xPct = (e.clientX - rect.left) / rect.width
    const idx = Math.min(Math.max(0, Math.round(xPct * (points.length - 1))), points.length - 1)
    setHoverIdx(idx)
  }, [points.length])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const s = inputVal.trim().toUpperCase()
    if (s) setSymbol(s)
  }

  return (
    <div className="flex flex-col h-full font-mono text-xs p-2 gap-1.5">
      {/* Symbol input + change display */}
      <div className="flex items-center gap-2 shrink-0">
        <form onSubmit={handleSubmit} className="flex gap-1">
          <input
            value={inputVal}
            onChange={e => setInputVal(e.target.value.toUpperCase())}
            className="bg-background border border-border rounded px-2 py-0.5 text-[11px] w-20 focus:outline-none focus:border-primary font-mono"
            placeholder="AAPL"
          />
          <button type="submit" className="px-1.5 py-0.5 border border-border rounded text-[9px] hover:border-primary hover:text-primary transition-colors">
            Go
          </button>
        </form>

        {/* Period gain/loss */}
        {periodChange != null && !isLoading && (
          <div className={cn('flex items-center gap-0.5 text-[11px] font-semibold', isPositive ? 'text-price-up' : 'text-price-down')}>
            {isPositive ? <TrendingUp className="w-3.5 h-3.5 shrink-0" /> : <TrendingDown className="w-3.5 h-3.5 shrink-0" />}
            <span className="tabular-nums">
              {isPositive ? '+' : ''}{periodChange.toFixed(2)}
              <span className="opacity-70 ml-1 text-[10px]">({isPositive ? '+' : ''}{periodChangePct!.toFixed(2)}%)</span>
            </span>
          </div>
        )}
        {isLoading && <RefreshCw className="w-3 h-3 animate-spin text-muted-foreground ml-auto" />}
      </div>

      {/* Price display */}
      <div className="flex items-baseline gap-1.5 shrink-0">
        <span className="text-xl font-bold tabular-nums text-foreground">
          {displayPrice > 0 ? displayPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '—'}
        </span>
        <span className="text-[9px] text-muted-foreground">
          {hovered ? new Date(hovered.time).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : symbol}
        </span>
      </div>

      {/* Range selector */}
      <div className="flex gap-1 shrink-0 flex-wrap">
        {RANGES.map(r => (
          <button
            key={r.value}
            onClick={() => { setRange(r.value); setHoverIdx(null) }}
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

      {/* Sparkline chart */}
      <div className="flex-1 min-h-0 relative">
        {isLoading && points.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <RefreshCw className="w-4 h-4 animate-spin text-muted-foreground" />
          </div>
        ) : points.length >= 2 ? (
          <svg
            ref={svgRef}
            viewBox={`0 0 400 100`}
            className="w-full h-full cursor-crosshair"
            preserveAspectRatio="none"
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setHoverIdx(null)}
          >
            <defs>
              <linearGradient id="mini-grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={isPositive ? 'var(--price-up)' : 'var(--price-down)'} stopOpacity="0.3" />
                <stop offset="100%" stopColor={isPositive ? 'var(--price-up)' : 'var(--price-down)'} stopOpacity="0.02" />
              </linearGradient>
            </defs>

            {/* Baseline (reference price) */}
            {refPrice > 0 && typeof chart.baseY === 'number' && (
              <line
                x1={0} y1={chart.baseY} x2={400} y2={chart.baseY}
                stroke="rgba(100,100,100,0.4)" strokeWidth={0.5} strokeDasharray="3 3"
              />
            )}

            {/* Area fill */}
            <path d={chart.area} fill="url(#mini-grad)" />

            {/* Line */}
            <path
              d={chart.path}
              fill="none"
              stroke={isPositive ? 'var(--price-up)' : 'var(--price-down)'}
              strokeWidth={1.5}
            />

            {/* Hover crosshair */}
            {hoverIdx != null && typeof chart.toX === 'function' && typeof chart.toY === 'function' && hovered && (
              <>
                <line
                  x1={chart.toX(hoverIdx)} y1={0}
                  x2={chart.toX(hoverIdx)} y2={100}
                  stroke="rgba(150,150,150,0.5)" strokeWidth={0.5}
                />
                <circle
                  cx={chart.toX(hoverIdx)}
                  cy={chart.toY(hovered.close)}
                  r={2.5}
                  fill={isPositive ? 'var(--price-up)' : 'var(--price-down)'}
                />
              </>
            )}
          </svg>
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground text-[10px]">
            No data for {symbol}
          </div>
        )}
      </div>
    </div>
  )
}
