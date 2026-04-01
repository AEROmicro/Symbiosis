'use client'

import { useEffect, useRef, useState } from 'react'
import { Sparkles, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface BriefingTemplate {
  overview: string
  risks: string[]
  opportunities: string[]
  tradeSetups: string
  sentiment: number
  sentimentLabel: string
  tone: 'bull' | 'bear' | 'neutral'
}

const TEMPLATES: BriefingTemplate[] = [
  {
    tone: 'bull',
    sentiment: 68,
    sentimentLabel: 'Bullish',
    overview:
      'Equity markets are showing resilience as tech sector leads gains. The S&P 500 continues its upward trajectory with strong breadth. Earnings beats are driving momentum in mega-cap names. Options market pricing in reduced volatility ahead.',
    risks: [
      '1. Fed rate decision uncertainty',
      '2. Geopolitical tensions in Middle East',
      '3. Potential earnings disappointments in small caps',
    ],
    opportunities: [
      '1. AI infrastructure plays showing strong momentum',
      '2. Energy sector rotation opportunity',
      '3. Defensive dividend plays for hedging',
    ],
    tradeSetups:
      'NVDA watching for continuation above $875 with RSI at 64. SPY support at $515 — potential bounce setup.',
  },
  {
    tone: 'bear',
    sentiment: 32,
    sentimentLabel: 'Bearish',
    overview:
      'Risk-off sentiment dominates as macro headwinds persist. Rising yields are pressuring growth multiples across tech. Credit spreads widening signals institutional caution. Defensive rotation underway into utilities and staples.',
    risks: [
      '1. Inflation re-acceleration risk',
      '2. Credit market stress building',
      '3. Dollar strength headwind for multinationals',
    ],
    opportunities: [
      '1. Short volatility premium in calm sectors',
      '2. Value stocks with strong FCF yield',
      '3. Gold as inflation hedge',
    ],
    tradeSetups:
      'QQQ bearish divergence on 4H chart, watching $440 breakdown. VIX calls for portfolio protection.',
  },
  {
    tone: 'neutral',
    sentiment: 51,
    sentimentLabel: 'Neutral',
    overview:
      'Markets digest mixed signals as economic data continues to show divergence. FOMC meeting minutes suggest data-dependent approach. Sector rotation from growth to value accelerating. Volatility remains elevated but manageable.',
    risks: [
      '1. Global growth slowdown signals',
      '2. Tech sector valuation compression',
      '3. Liquidity conditions tightening',
    ],
    opportunities: [
      '1. Healthcare sector laggard catch-up play',
      '2. International diversification opportunity',
      '3. Fixed income attractive at current yields',
    ],
    tradeSetups:
      'AAPL consolidating in range $175–$195, watching for directional break. TLT inverse head & shoulders developing.',
  },
]

function sentimentColor(score: number) {
  if (score <= 35) return 'text-price-down'
  if (score <= 55) return 'text-yellow-400'
  return 'text-price-up'
}
function sentimentTrack(score: number) {
  if (score <= 35) return 'bg-price-down'
  if (score <= 55) return 'bg-yellow-400'
  return 'bg-price-up'
}

function todayStr() {
  return new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }).toUpperCase()
}

export function AiMarketBriefingWidget() {
  const [templateIdx, setTemplateIdx] = useState(0)
  const [loading, setLoading] = useState(true)
  const [overviewDisplay, setOverviewDisplay] = useState('')
  const [showBody, setShowBody] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const tpl = TEMPLATES[templateIdx]

  function startAnimation(idx: number) {
    setLoading(true)
    setShowBody(false)
    setOverviewDisplay('')

    const t = TEMPLATES[idx]
    setTimeout(() => {
      setLoading(false)
      let charIdx = 0
      timerRef.current = setInterval(() => {
        charIdx++
        setOverviewDisplay(t.overview.slice(0, charIdx))
        if (charIdx >= t.overview.length) {
          if (timerRef.current) clearInterval(timerRef.current)
          setShowBody(true)
        }
      }, 15)
    }, 1500)
  }

  useEffect(() => {
    startAnimation(0)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handleRegenerate() {
    if (timerRef.current) clearInterval(timerRef.current)
    const next = (templateIdx + 1) % TEMPLATES.length
    setTemplateIdx(next)
    startAnimation(next)
  }

  return (
    <div className="p-4 flex flex-col gap-3 h-full overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between shrink-0">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          <span className="font-mono text-xs font-semibold text-foreground">AI MARKET BRIEFING</span>
          <span className="px-1.5 py-0.5 rounded border text-[9px] leading-none font-semibold text-purple-400 bg-purple-900/30 border-purple-700/40">
            AI
          </span>
        </div>
        <span className="font-mono text-[9px] text-muted-foreground">{todayStr()}</span>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex-1 flex items-center justify-center">
          <span className="font-mono text-xs text-primary animate-pulse tracking-widest">■■■ GENERATING...</span>
        </div>
      )}

      {/* Content */}
      {!loading && (
        <>
          {/* Market Overview with typewriter */}
          <div className="border border-border/50 rounded bg-muted/10 p-3 shrink-0">
            <div className="font-mono text-[9px] text-primary uppercase tracking-widest mb-1.5">▸ MARKET OVERVIEW</div>
            <p className="font-mono text-[10px] text-muted-foreground leading-relaxed">
              {overviewDisplay}
              {overviewDisplay.length < tpl.overview.length && (
                <span className="inline-block w-1.5 h-3 bg-primary animate-pulse ml-0.5 align-middle" />
              )}
            </p>
          </div>

          {/* Body sections — appear after typewriter finishes */}
          <div className={cn('flex flex-col gap-2 transition-opacity duration-300', showBody ? 'opacity-100' : 'opacity-0')}>
            {/* Key Risks */}
            <div className="border border-border/50 rounded bg-muted/10 p-3">
              <div className="font-mono text-[9px] text-price-down uppercase tracking-widest mb-1.5">▸ KEY RISKS</div>
              {tpl.risks.map((r, i) => (
                <div key={i} className="font-mono text-[10px] text-muted-foreground leading-relaxed">{r}</div>
              ))}
            </div>

            {/* Opportunities */}
            <div className="border border-border/50 rounded bg-muted/10 p-3">
              <div className="font-mono text-[9px] text-price-up uppercase tracking-widest mb-1.5">▸ OPPORTUNITIES</div>
              {tpl.opportunities.map((o, i) => (
                <div key={i} className="font-mono text-[10px] text-muted-foreground leading-relaxed">{o}</div>
              ))}
            </div>

            {/* Trade Setups */}
            <div className="border border-border/50 rounded bg-muted/10 p-3">
              <div className="font-mono text-[9px] text-primary uppercase tracking-widest mb-1.5">▸ TRADE SETUPS</div>
              <p className="font-mono text-[10px] text-muted-foreground leading-relaxed">{tpl.tradeSetups}</p>
            </div>

            {/* Sentiment gauge */}
            <div className="border border-border/50 rounded bg-muted/10 p-3">
              <div className="font-mono text-[9px] text-primary uppercase tracking-widest mb-2">▸ SENTIMENT</div>
              <div className="flex items-center justify-between text-[9px] font-mono text-muted-foreground mb-1">
                <span>BEARISH</span><span>NEUTRAL</span><span>BULLISH</span>
              </div>
              <div className="relative h-2.5 rounded-full bg-muted overflow-hidden mb-1.5">
                <div
                  className={cn('h-full rounded-full transition-all duration-700', sentimentTrack(tpl.sentiment))}
                  style={{ width: `${tpl.sentiment}%` }}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className={cn('font-mono text-xs font-bold', sentimentColor(tpl.sentiment))}>
                  {tpl.sentimentLabel}
                </span>
                <span className={cn('font-mono text-xs tabular-nums font-bold', sentimentColor(tpl.sentiment))}>
                  {tpl.sentiment}/100
                </span>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Regenerate */}
      <div className="mt-auto shrink-0 pt-1">
        <Button
          variant="outline"
          size="sm"
          className="w-full font-mono text-xs"
          onClick={handleRegenerate}
          disabled={loading}
        >
          <RefreshCw className="w-3 h-3 mr-1" />
          REGENERATE BRIEFING
        </Button>
      </div>
    </div>
  )
}
