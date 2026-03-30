'use client'
import { useState } from 'react'
import { cn } from '@/lib/utils'

const ASSETS = ['SPY', 'QQQ', 'GLD', 'TLT', 'BTC', 'OIL', 'VIX', 'USD']

const CORR_3M: number[][] = [
//  SPY    QQQ    GLD    TLT    BTC    OIL    VIX    USD
  [ 1.00,  0.96,  0.12, -0.38,  0.52,  0.28, -0.78, -0.22],  // SPY
  [ 0.96,  1.00,  0.08, -0.41,  0.58,  0.21, -0.75, -0.19],  // QQQ
  [ 0.12,  0.08,  1.00,  0.31,  0.14,  0.09, -0.14, -0.48],  // GLD
  [-0.38, -0.41,  0.31,  1.00, -0.28, -0.15,  0.41,  0.23],  // TLT
  [ 0.52,  0.58,  0.14, -0.28,  1.00,  0.31, -0.44, -0.17],  // BTC
  [ 0.28,  0.21,  0.09, -0.15,  0.31,  1.00, -0.23, -0.35],  // OIL
  [-0.78, -0.75, -0.14,  0.41, -0.44, -0.23,  1.00,  0.18],  // VIX
  [-0.22, -0.19, -0.48,  0.23, -0.17, -0.35,  0.18,  1.00],  // USD
]

const CORR_1Y: number[][] = [
//  SPY    QQQ    GLD    TLT    BTC    OIL    VIX    USD
  [ 1.00,  0.94,  0.18, -0.31,  0.44,  0.33, -0.72, -0.18],  // SPY
  [ 0.94,  1.00,  0.12, -0.35,  0.51,  0.24, -0.69, -0.14],  // QQQ
  [ 0.18,  0.12,  1.00,  0.28,  0.22,  0.14, -0.11, -0.44],  // GLD
  [-0.31, -0.35,  0.28,  1.00, -0.21, -0.11,  0.38,  0.19],  // TLT
  [ 0.44,  0.51,  0.22, -0.21,  1.00,  0.28, -0.38, -0.13],  // BTC
  [ 0.33,  0.24,  0.14, -0.11,  0.28,  1.00, -0.19, -0.41],  // OIL
  [-0.72, -0.69, -0.11,  0.38, -0.38, -0.19,  1.00,  0.14],  // VIX
  [-0.18, -0.14, -0.44,  0.19, -0.13, -0.41,  0.14,  1.00],  // USD
]

function corrColor(v: number): string {
  if (v === 1) return 'hsl(220 15% 25%)'
  if (v > 0) {
    const intensity = Math.round(v * 80)
    return `hsl(142 ${intensity}% ${10 + intensity * 0.25}%)`
  }
  const intensity = Math.round(Math.abs(v) * 80)
  return `hsl(0 ${intensity}% ${10 + intensity * 0.25}%)`
}

function corrTextColor(v: number): string {
  if (Math.abs(v) > 0.5) return 'text-foreground'
  return 'text-muted-foreground'
}

type Period = '3M' | '1Y'

export function CorrelationHeatmapWidget() {
  const [period, setPeriod] = useState<Period>('3M')
  const matrix = period === '3M' ? CORR_3M : CORR_1Y
  const n = ASSETS.length

  return (
    <div className="flex flex-col h-full font-mono text-xs p-3 gap-2">
      <div className="flex gap-1">
        {(['3M', '1Y'] as Period[]).map(p => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={cn(
              'px-2 py-0.5 rounded border text-[10px] transition-colors',
              period === p
                ? 'bg-primary/20 text-primary border-primary/40'
                : 'border-border text-muted-foreground hover:text-foreground'
            )}
          >
            {p}
          </button>
        ))}
        <span className="ml-auto text-[9px] text-muted-foreground self-center">Rolling Correlation</span>
      </div>

      <div className="flex-1 min-h-0 overflow-auto">
        <table className="w-full border-collapse text-[9px]" style={{ tableLayout: 'fixed' }}>
          <thead>
            <tr>
              <th className="text-muted-foreground font-normal text-right pr-1 w-8" />
              {ASSETS.map(a => (
                <th key={a} className="text-muted-foreground font-normal text-center pb-1 truncate">{a}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ASSETS.map((rowAsset, r) => (
              <tr key={rowAsset}>
                <td className="text-muted-foreground text-right pr-1 py-0.5 truncate">{rowAsset}</td>
                {ASSETS.map((_, c) => {
                  const v = matrix[r][c]
                  return (
                    <td key={c} className="p-0.5">
                      <div
                        className={cn(
                          'flex items-center justify-center rounded text-[8px] tabular-nums h-6',
                          corrTextColor(v)
                        )}
                        style={{ backgroundColor: corrColor(v) }}
                      >
                        {v.toFixed(2)}
                      </div>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center gap-2 pt-1 border-t border-border">
        <div className="flex items-center gap-1">
          <div className="w-3 h-2.5 rounded" style={{ backgroundColor: corrColor(-1) }} />
          <span className="text-[8px] text-muted-foreground">−1 (inverse)</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-2.5 rounded" style={{ backgroundColor: corrColor(0) }} />
          <span className="text-[8px] text-muted-foreground">0 (uncorr)</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-2.5 rounded" style={{ backgroundColor: corrColor(1) }} />
          <span className="text-[8px] text-muted-foreground">+1 (perfect)</span>
        </div>
      </div>
    </div>
  )
}
