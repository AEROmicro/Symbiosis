'use client'

import { useState, useRef } from 'react'
import useSWR from 'swr'
import { cn } from '@/lib/utils'

// ... interfaces and fetcher/ranges remain the same ...

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
  
  // Scaling logic
  const prices = chartData.map(d => d.close)
  const minPrice = Math.min(...prices, previousClose)
  const maxPrice = Math.max(...prices, previousClose)
  const priceRange = maxPrice - minPrice || 1
  const padding = priceRange * 0.1
  const adjustedMin = minPrice - padding
  const adjustedMax = maxPrice + padding
  const adjustedRange = adjustedMax - adjustedMin

  const maxLineY = 100 - ((maxPrice - adjustedMin) / adjustedRange) * 100
  const minLineY = 100 - ((minPrice - adjustedMin) / adjustedRange) * 100
  const prevCloseY = 100 - ((previousClose - adjustedMin) / adjustedRange) * 100

  const firstPrice = chartData[0]?.close || previousClose
  const lastPrice = chartData[chartData.length - 1]?.close || firstPrice
  const isPositive = lastPrice >= firstPrice

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
  const referencePrice = chartData.length > 0 ? chartData[0].open || chartData[0].close : previousClose
  const displayChange = referencePrice > 0 ? displayPrice - referencePrice : 0
  const displayChangePercent = referencePrice > 0 ? (displayChange / referencePrice) * 100 : 0
  const displayIsPositive = displayChange >= 0

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full w-full bg-card animate-pulse">
        <div className="text-muted-foreground font-mono text-xs">LOADING_CHART...</div>
      </div>
    )
  }

  return (
    // FIX 1: h-full and flex-col to fill the widget renderer
    <div className="flex flex-col h-full w-full bg-card overflow-hidden">
      
      {/* Header: flex-none (fixed size) */}
      <div className="p-3 border-b border-border flex items-center justify-between flex-none bg-background/50 backdrop-blur-sm">
        <div>
          <div className="text-xl font-bold tabular-nums">
            ${displayPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div className={cn("text-[10px] uppercase font-mono tracking-tighter", displayIsPositive ? "text-primary" : "text-destructive")}>
            {displayIsPositive ? '▲' : '▼'} {displayChange.toFixed(2)} ({displayChangePercent.toFixed(2)}%)
          </div>
        </div>
        
        <div className="flex gap-1">
          {ranges.map((r) => (
            <button
              key={r.value}
              onClick={() => setRange(r.value)}
              className={cn(
                "px-1.5 py-0.5 text-[10px] font-bold rounded border transition-all",
                range === r.value ? "bg-primary border-primary text-primary-foreground shadow-[0_0_10px_rgba(var(--primary),0.3)]" : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Chart Area: flex-1 and min-h-0 to take all remaining space */}
      <div 
        ref={containerRef}
        className="relative flex-1 min-h-0 w-full cursor-crosshair group"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => { setHoveredPoint(null); setHoveredX(null); }}
      >
        {chartData.length > 0 ? (
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full p-2">
            <line x1="0" y1={prevCloseY} x2="100" y2={prevCloseY} stroke="currentColor" strokeWidth="0.2" strokeDasharray="1,1" className="text-muted-foreground/30" />
            <path d={getAreaPath()} fill={isPositive ? 'url(#grad-pos)' : 'url(#grad-neg)'} />
            <defs>
              <linearGradient id="grad-pos" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.2" />
                <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="grad-neg" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--destructive)" stopOpacity="0.2" />
                <stop offset="100%" stopColor="var(--destructive)" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d={getPath()} fill="none" stroke={isPositive ? 'var(--primary)' : 'var(--destructive)'} strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
            
            {hoveredX !== null && (
              <line x1={hoveredX} y1="0" x2={hoveredX} y2="100" stroke="currentColor" strokeWidth="0.5" className="text-primary" />
            )}
          </svg>
        ) : (
          <div className="h-full flex items-center justify-center text-muted-foreground text-xs italic">NO_DATA_AVAILABLE</div>
        )}

        {/* Floating Price Labels */}
        <div className="absolute right-2 top-2 bottom-2 flex flex-col justify-between text-[9px] font-mono pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity">
          <span className="text-primary">${maxPrice.toFixed(2)}</span>
          <span className="text-destructive">${minPrice.toFixed(2)}</span>
        </div>
      </div>

      {/* Volume: flex-none with a small fixed height */}
      <div className="h-8 w-full px-2 pb-1 flex-none opacity-40 hover:opacity-100 transition-opacity border-t border-border/50">
        <div className="flex items-end h-full gap-[1px]">
          {chartData.map((d, i) => {
            const maxVol = Math.max(...chartData.map(x => x.volume)) || 1
            const volHeight = (d.volume / maxVol) * 100
            const volIsPos = i === 0 ? d.close >= previousClose : d.close >= chartData[i-1].close
            return (
              <div key={i} className={cn("flex-1", volIsPos ? "bg-primary" : "bg-destructive")} style={{ height: `${volHeight}%` }} />
            )
          })}
        </div>
      </div>
    </div>
  )
}
