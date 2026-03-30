'use client'
import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface BreadthData {
  nyseAdv: number
  nyseDec: number
  nasdaqAdv: number
  nasdaqDec: number
  nyseHighs: number
  nyseLows: number
  pctAbove200: number
  mcclellan: number
  trin: number
}

function randomize(base: BreadthData): BreadthData {
  const jit = (v: number, r: number) => Math.round(v + (Math.random() - 0.5) * r * 2)
  const jitF = (v: number, r: number) => Math.round((v + (Math.random() - 0.5) * r * 2) * 10) / 10
  return {
    nyseAdv:      jit(base.nyseAdv, 60),
    nyseDec:      jit(base.nyseDec, 60),
    nasdaqAdv:    jit(base.nasdaqAdv, 80),
    nasdaqDec:    jit(base.nasdaqDec, 80),
    nyseHighs:    jit(base.nyseHighs, 10),
    nyseLows:     jit(base.nyseLows, 8),
    pctAbove200:  jitF(base.pctAbove200, 0.5),
    mcclellan:    jitF(base.mcclellan, 3),
    trin:         Math.round((base.trin + (Math.random() - 0.5) * 0.08) * 100) / 100,
  }
}

const BASE: BreadthData = {
  nyseAdv: 1842, nyseDec: 1124, nasdaqAdv: 2310, nasdaqDec: 1654,
  nyseHighs: 87, nyseLows: 43, pctAbove200: 58.4, mcclellan: 34.7, trin: 0.91,
}

function RatioBar({ a, b, colorA, colorB }: { a: number; b: number; colorA: string; colorB: string }) {
  const total = a + b
  const pct = total > 0 ? (a / total) * 100 : 50
  return (
    <div className="flex h-1.5 w-full rounded overflow-hidden bg-muted/30">
      <div className={cn('h-full transition-all duration-500', colorA)} style={{ width: `${pct}%` }} />
      <div className={cn('h-full flex-1', colorB)} />
    </div>
  )
}

export function MarketBreadthWidget() {
  const [data, setData] = useState<BreadthData>(BASE)
  const [lastUpdated, setLastUpdated] = useState('')

  useEffect(() => {
    const update = () => {
      setData(randomize(BASE))
      setLastUpdated(new Date().toLocaleTimeString())
    }
    update()
    const id = setInterval(update, 30_000)
    return () => clearInterval(id)
  }, [])

  const trinColor = data.trin < 1.0 ? 'text-green-400' : data.trin > 1.5 ? 'text-red-400' : 'text-amber-400'
  const mclColor  = data.mcclellan >= 0 ? 'text-green-400' : 'text-red-400'

  return (
    <div className="flex flex-col h-full font-mono text-xs p-3 gap-2">

      {/* NYSE A/D */}
      <div className="flex flex-col gap-1 px-2.5 py-2 rounded bg-muted/20 border border-border/50">
        <div className="flex justify-between text-[9px] text-muted-foreground uppercase tracking-wide">
          <span>NYSE Adv / Dec</span>
          <span className="text-foreground">
            <span className="text-green-400">{data.nyseAdv.toLocaleString()}</span>
            <span className="text-muted-foreground mx-1">/</span>
            <span className="text-red-400">{data.nyseDec.toLocaleString()}</span>
          </span>
        </div>
        <RatioBar a={data.nyseAdv} b={data.nyseDec} colorA="bg-green-500" colorB="bg-red-500/60" />
      </div>

      {/* NASDAQ A/D */}
      <div className="flex flex-col gap-1 px-2.5 py-2 rounded bg-muted/20 border border-border/50">
        <div className="flex justify-between text-[9px] text-muted-foreground uppercase tracking-wide">
          <span>NASDAQ Adv / Dec</span>
          <span className="text-foreground">
            <span className="text-green-400">{data.nasdaqAdv.toLocaleString()}</span>
            <span className="text-muted-foreground mx-1">/</span>
            <span className="text-red-400">{data.nasdaqDec.toLocaleString()}</span>
          </span>
        </div>
        <RatioBar a={data.nasdaqAdv} b={data.nasdaqDec} colorA="bg-green-500" colorB="bg-red-500/60" />
      </div>

      {/* 52W Highs / Lows */}
      <div className="flex items-center justify-between px-2.5 py-2 rounded bg-muted/20 border border-border/50">
        <span className="text-muted-foreground text-[9px] uppercase tracking-wide">NYSE 52W Highs / Lows</span>
        <span>
          <span className="text-green-400 font-semibold">{data.nyseHighs}</span>
          <span className="text-muted-foreground mx-1">/</span>
          <span className="text-red-400 font-semibold">{data.nyseLows}</span>
        </span>
      </div>

      {/* % Above 200D MA */}
      <div className="flex flex-col gap-1 px-2.5 py-2 rounded bg-muted/20 border border-border/50">
        <div className="flex justify-between text-[9px]">
          <span className="text-muted-foreground uppercase tracking-wide">NYSE % Above 200D MA</span>
          <span className="font-semibold text-foreground">{data.pctAbove200.toFixed(1)}%</span>
        </div>
        <div className="h-1.5 w-full rounded bg-muted/30">
          <div
            className="h-full rounded bg-primary transition-all duration-500"
            style={{ width: `${data.pctAbove200}%` }}
          />
        </div>
      </div>

      {/* McClellan + TRIN */}
      <div className="grid grid-cols-2 gap-2">
        <div className="flex flex-col items-center px-2 py-2 rounded bg-muted/20 border border-border/50">
          <span className="text-[9px] text-muted-foreground uppercase tracking-wide">McClellan Osc</span>
          <span className={cn('font-semibold text-base mt-0.5', mclColor)}>
            {data.mcclellan > 0 ? '+' : ''}{data.mcclellan.toFixed(1)}
          </span>
        </div>
        <div className="flex flex-col items-center px-2 py-2 rounded bg-muted/20 border border-border/50">
          <span className="text-[9px] text-muted-foreground uppercase tracking-wide">TRIN (Arms)</span>
          <span className={cn('font-semibold text-base mt-0.5', trinColor)}>
            {data.trin.toFixed(2)}
          </span>
        </div>
      </div>

      {lastUpdated && (
        <div className="text-[9px] text-muted-foreground mt-auto pt-1 border-t border-border text-right">
          Updated {lastUpdated}
        </div>
      )}
    </div>
  )
}
