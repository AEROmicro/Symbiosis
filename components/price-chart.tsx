'use client'

import { useState, useEffect, useRef } from 'react'
import useSWR from 'swr'
import { cn } from '@/lib/utils'

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
  data: ChartData[]
  previousClose: number
  currentPrice: number
}

const fetcher = (url: string) => fetch(url).then(r => r.json())

const ranges = [
  { label: '1D', value: '1d' },
  { label: '5D', value: '5d' },
  { label: '1M', value: '1mo' },
  { label: '3M', value: '3mo' },
  { label: '6M', value: '6mo' },
  { label: '1Y', value: '1y' },
  { label: '5Y', value: '5y' },
]

interface PriceChartProps {
  symbol: string
}

export function PriceChart({ symbol }: PriceChartProps) {
  const [range, setRange] = useState('1d')
  const [hoveredPoint, setHoveredPoint] = useState<ChartData | null>(null)
  const [hoveredX, setHoveredX] = useState<number | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  
  const { data, isLoading } = useSWR<ChartResponse>(
    `/api/stock/${symbol}/chart?range=${range}`,
    fetcher,
    { refreshInterval: range === '1d' ? 60000 : 0 }
  )

  const chartData = data?.data || []
  const previousClose = data?.previousClose || 0
  
  // Calculate min/max for scaling
  const prices = chartData.map(d => d.close)
  const minPrice = Math.min(...prices, previousClose)
  const maxPrice = Math.max(...prices, previousClose)
  const priceRange = maxPrice - minPrice || 1
  const padding = priceRange * 0.1
  const adjustedMin = minPrice - padding
  const adjustedMax = maxPrice + padding
  const adjustedRange = adjustedMax - adjustedMin

  // Y positions for reference lines (in SVG user-space 0-100, y=0 is top)
  const maxLineY = 100 - ((maxPrice - adjustedMin) / adjustedRange) * 100
  const minLineY = 100 - ((minPrice - adjustedMin) / adjustedRange) * 100

  // Determine if overall positive
  const firstPrice = chartData[0]?.close || previousClose
  const lastPrice = chartData[chartData.length - 1]?.close || firstPrice
  const isPositive = lastPrice >= firstPrice

  // Generate SVG path
  const getPath = () => {
    if (chartData.length === 0) return ''
    
    const width = 100
    const height = 100
    
    return chartData.map((d, i) => {
      const x = (i / (chartData.length - 1)) * width
      const y = height - ((d.close - adjustedMin) / adjustedRange) * height
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`
    }).join(' ')
  }

  const getAreaPath = () => {
    const path = getPath()
    if (!path) return ''
    return `${path} L 100 100 L 0 100 Z`
  }

  // Previous close line position
  const prevCloseY = 100 - ((previousClose - adjustedMin) / adjustedRange) * 100

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current || chartData.length === 0) return
    
    const rect = containerRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const percentage = x / rect.width
    const index = Math.min(
      Math.max(0, Math.round(percentage * (chartData.length - 1))),
      chartData.length - 1
    )
    
    setHoveredPoint(chartData[index])
    setHoveredX(percentage * 100)
  }

  const displayPrice = hoveredPoint?.close || lastPrice
  // Use first data point as reference for historical ranges, previousClose for intraday
  const referencePrice = chartData.length > 0 ? chartData[0].open || chartData[0].close : previousClose
  const displayChange = referencePrice > 0 ? displayPrice - referencePrice : 0
  const displayChangePercent = referencePrice > 0 ? (displayChange / referencePrice) * 100 : 0
  const displayIsPositive = displayChange >= 0

  if (isLoading) {
    return (
      <div className="border border-border bg-card rounded-md p-4">
        <div className="h-48 flex items-center justify-center">
          <div className="text-muted-foreground font-mono text-sm animate-pulse">
            Loading chart data...
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="border border-border bg-card rounded-md overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div>
          <div className="text-2xl font-bold tabular-nums">
            ${displayPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className={cn(
            "text-sm tabular-nums",
            displayIsPositive ? "text-primary" : "text-destructive"
          )}>
            {displayIsPositive ? '+' : ''}{displayChange.toFixed(2)} ({displayIsPositive ? '+' : ''}{displayChangePercent.toFixed(2)}%)
            {hoveredPoint && (
              <span className="text-muted-foreground ml-2">
                {new Date(hoveredPoint.time).toLocaleString()}
              </span>
            )}
          </div>
        </div>
        
        {/* Range Selector */}
        <div className="flex gap-1">
          {ranges.map((r) => (
            <button
              key={r.value}
              onClick={() => setRange(r.value)}
              className={cn(
                "px-2 py-1 text-xs font-mono rounded transition-colors",
                range === r.value
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div 
        ref={containerRef}
        className="relative h-48 px-4 py-2 cursor-crosshair"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => {
          setHoveredPoint(null)
          setHoveredX(null)
        }}
      >
        {chartData.length > 0 ? (
          <svg 
            viewBox="0 0 100 100" 
            preserveAspectRatio="none"
            className="w-full h-full"
          >
            {/* Grid lines */}
            <defs>
              <pattern id="grid" width="10" height="20" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="0.1" className="text-border" />
              </pattern>
            </defs>
            <rect width="100" height="100" fill="url(#grid)" />
            
            {/* Previous close line */}
            <line
              x1="0"
              y1={prevCloseY}
              x2="100"
              y2={prevCloseY}
              stroke="currentColor"
              strokeWidth="0.3"
              strokeDasharray="2,2"
              className="text-muted-foreground"
            />

            {/* Period high line */}
            {chartData.length > 0 && (
              <line
                x1="0"
                y1={maxLineY}
                x2="100"
                y2={maxLineY}
                stroke={isPositive ? 'var(--primary)' : 'var(--destructive)'}
                strokeWidth="0.3"
                strokeDasharray="1,3"
                opacity="0.6"
              />
            )}

            {/* Period low line */}
            {chartData.length > 0 && (
              <line
                x1="0"
                y1={minLineY}
                x2="100"
                y2={minLineY}
                stroke={isPositive ? 'var(--primary)' : 'var(--destructive)'}
                strokeWidth="0.3"
                strokeDasharray="1,3"
                opacity="0.6"
              />
            )}
            
            {/* Area fill */}
            <path
              d={getAreaPath()}
              fill={isPositive ? 'color-mix(in oklch, var(--primary) 10%, transparent)' : 'color-mix(in oklch, var(--destructive) 10%, transparent)'}
            />
            
            {/* Line */}
            <path
              d={getPath()}
              fill="none"
              stroke={isPositive ? 'var(--primary)' : 'var(--destructive)'}
              strokeWidth="0.5"
              vectorEffect="non-scaling-stroke"
              style={{ strokeWidth: '2px' }}
            />
            
            {/* Hover line */}
            {hoveredX !== null && (
              <line
                x1={hoveredX}
                y1="0"
                x2={hoveredX}
                y2="100"
                stroke="currentColor"
                strokeWidth="0.3"
                className="text-foreground"
              />
            )}
          </svg>
        ) : (
          <div className="h-full flex items-center justify-center text-muted-foreground font-mono text-sm">
            No data available
          </div>
        )}
        
        {/* Price labels */}
        <div className="absolute right-0 top-0 bottom-0 w-16 flex flex-col justify-between text-xs text-muted-foreground font-mono pointer-events-none py-1">
          <span className={cn(isPositive ? "text-primary" : "text-destructive")}>
            ${maxPrice.toFixed(2)}
          </span>
          <span className="text-foreground">${previousClose.toFixed(2)}</span>
          <span className={cn(isPositive ? "text-primary" : "text-destructive")}>
            ${minPrice.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Volume bars */}
      <div className="h-12 px-4 border-t border-border">
        <div className="flex items-end h-full gap-px">
          {chartData.map((d, i) => {
            const maxVol = Math.max(...chartData.map(x => x.volume))
            const height = (d.volume / maxVol) * 100
            const pointIsPositive = i === 0 ? d.close >= previousClose : d.close >= chartData[i-1].close
            return (
              <div
                key={i}
                className={cn(
                  "flex-1 rounded-t-sm",
                  pointIsPositive ? "bg-primary/40" : "bg-destructive/40"
                )}
                style={{ height: `${height}%` }}
              />
            )
          })}
        </div>
      </div>
    </div>
  )
}
