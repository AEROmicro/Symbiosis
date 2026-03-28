'use client'

import { useState, useRef } from 'react'
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

interface PriceChartProps {
  symbol: string
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

export function PriceChart({ symbol }: PriceChartProps) {
  const [range, setRange] = useState('1d')
  const [hoveredPoint, setHoveredPoint] = useState<ChartData | null>(null)
  const [hoveredX, setHoveredX] = useState<number | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  
  const { data, isLoading } = useSWR<ChartResponse>(
    `/api/stock/${symbol}/chart?range=${range}`,
    fetcher,
    { refreshInterval: range === '1d' ? 30000 : 0 }
  )

  const chartData = data?.data || []
  const previousClose = data?.previousClose || 0
  
  // Calculate min/max for scaling
  const prices = chartData.map(d => d.close)
  const minPrice = prices.length ? Math.min(...prices, previousClose) : previousClose
  const maxPrice = prices.length ? Math.max(...prices, previousClose) : previousClose
  const priceRange = maxPrice - minPrice || 1
  const padding = priceRange * 0.1
  const adjustedMin = minPrice - padding
  const adjustedMax = maxPrice + padding
  const adjustedRange = adjustedMax - adjustedMin

  const maxLineY = 100 - ((maxPrice - adjustedMin) / adjustedRange) * 100
  const minLineY = 100 - ((minPrice - adjustedMin) / adjustedRange) * 100
  const prevCloseY = 100 - ((previousClose - adjustedMin) / adjustedRange) * 100

  const lastPrice = chartData.length > 0 ? chartData[chartData.length - 1].close : previousClose
  const referencePrice = chartData.length > 0 ? chartData[0].open || chartData[0].close : previousClose
  const isPositive = lastPrice >= referencePrice

  const getPath = () => {
    if (chartData.length === 0) return ''
    return chartData.map((d, i) => {
      const x = (i / (chartData.length - 1)) * 100
      const y = 100 - ((d.close - adjustedMin) / adjustedRange) * 100
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`
    }).join(' ')
  }

  const getAreaPath = () => {
    const path = getPath()
    return path ? `${path} L 100 100 L 0 100 Z` : ''
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current || chartData.length === 0) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const percentage = x / rect.width
    const index = Math.min(Math.max(0, Math.round(percentage * (chartData.length - 1))), chartData.length - 1)
    setHoveredPoint(chartData[index])
    setHoveredX(percentage * 100)
  }

  const displayPrice = hoveredPoint?.close || lastPrice
  const displayChange = referencePrice > 0 ? displayPrice - referencePrice : 0
  const displayChangePercent = referencePrice > 0 ? (displayChange / referencePrice) * 100 : 0
  const displayIsPositive = displayChange >= 0

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full w-full bg-card animate-pulse border border-border rounded-md">
        <div className="text-muted-foreground font-mono text-xs">LOADING_DATA...</div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full w-full bg-card overflow-hidden border border-border rounded-md">
      {/* Header */}
      <div className="p-3 border-b border-border flex items-center justify-between flex-none bg-background/50">
        <div>
          <div className="text-xl font-bold tabular-nums">
            ${displayPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className={cn("text-xs tabular-nums font-mono", displayIsPositive ? "text-primary" : "text-destructive")}>
            {displayIsPositive ? '+' : ''}{displayChange.toFixed(2)} ({displayIsPositive ? '+' : ''}{displayChangePercent.toFixed(2)}%)
          </div>
        </div>
        
        <div className="flex gap-1">
          {ranges.map((r) => (
            <button
              key={r.value}
              onClick={() => setRange(r.value)}
              className={cn(
                "px-2 py-1 text-[10px] font-mono rounded transition-colors border",
                range === r.value 
                  ? "bg-primary border-primary text-primary-foreground" 
                  : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Chart: Uses flex-1 and min-h-0 to expand to fill widget */}
      <div 
        ref={containerRef}
        className="relative flex-1 min-h-0 w-full cursor-crosshair group"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => { setHoveredPoint(null); setHoveredX(null); }}
      >
        {chartData.length > 0 ? (
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full p-4 overflow-visible">
             <defs>
              <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={isPositive ? 'var(--primary)' : 'var(--destructive)'} stopOpacity="0.2" />
                <stop offset="100%" stopColor={isPositive ? 'var(--primary)' : 'var(--destructive)'} stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Previous close line */}
            <line x1="0" y1={prevCloseY} x2="100" y2={prevCloseY} stroke="currentColor" strokeWidth="0.2" strokeDasharray="2,2" className="text-muted-foreground/40" />
            
            {/* Area Fill */}
            <path d={getAreaPath()} fill="url(#chartGradient)" />
            
            {/* Main Price Line */}
            <path d={getPath()} fill="none" stroke={isPositive ? 'var(--primary)' : 'var(--destructive)'} strokeWidth="2" vectorEffect="non-scaling-stroke" />
            
            {/* Hover Vertical Line */}
            {hoveredX !== null && (
              <line x1={hoveredX} y1="0" x2={hoveredX} y2="100" stroke="currentColor" strokeWidth="0.5" className="text-foreground" />
            )}
          </svg>
        ) : (
          <div className="h-full flex items-center justify-center text-muted-foreground font-mono text-sm">NO_DATA</div>
        )}

        {/* Floating Price Labels */}
        <div className="absolute right-2 top-2 bottom-2 flex flex-col justify-between text-[10px] font-mono pointer-events-none opacity-50">
          <span className="text-primary">${maxPrice.toFixed(2)}</span>
          <span className="text-destructive">${minPrice.toFixed(2)}</span>
        </div>
      </div>

      {/* Volume: flex-none small bar at bottom */}
      <div className="h-10 w-full px-2 pb-1 flex-none border-t border-border/30">
        <div className="flex items-end h-full gap-[1px]">
          {chartData.map((d, i) => {
            const maxVol = Math.max(...chartData.map(x => x.volume)) || 1
            const volHeight = (d.volume / maxVol) * 100
            const volIsPos = i === 0 ? d.close >= previousClose : d.close >= chartData[i-1].close
            return (
              <div 
                key={i} 
                className={cn("flex-1", volIsPos ? "bg-primary/40" : "bg-destructive/40")} 
                style={{ height: `${volHeight}%` }} 
              />
            )
          })}
        </div>
      </div>
    </div>
  )
}
