'use client'
import { useState, useCallback, useMemo } from 'react'
import useSWR from 'swr'
import { RefreshCw, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'

const fetcher = (url: string) => fetch(url).then(r => r.json())

interface CandleData { time: number; open: number; high: number; low: number; close: number; volume: number }
interface ChartResponse { symbol: string; data: CandleData[] }

const RANGES = [
  { label: '1D',  value: '1d'  },
  { label: '5D',  value: '5d'  },
  { label: '1M',  value: '1mo' },
  { label: '3M',  value: '3mo' },
  { label: '6M',  value: '6mo' },
  { label: '1Y',  value: '1y'  },
]

// ── Indicator math ────────────────────────────────────────────────────────
function ema(values: number[], period: number): number[] {
  const k = 2 / (period + 1)
  const result: number[] = []
  let prev = values.slice(0, period).reduce((s, v) => s + v, 0) / period
  result.push(...new Array(period - 1).fill(NaN))
  result.push(prev)
  for (let i = period; i < values.length; i++) {
    prev = values[i] * k + prev * (1 - k)
    result.push(prev)
  }
  return result
}

function rsi(closes: number[], period = 14): number[] {
  const result: number[] = new Array(period).fill(NaN)
  let avgGain = 0, avgLoss = 0
  for (let i = 1; i <= period; i++) {
    const d = closes[i] - closes[i - 1]
    avgGain += d > 0 ? d : 0
    avgLoss += d < 0 ? -d : 0
  }
  avgGain /= period
  avgLoss /= period
  result.push(avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss))
  for (let i = period + 1; i < closes.length; i++) {
    const d = closes[i] - closes[i - 1]
    avgGain = (avgGain * (period - 1) + Math.max(d, 0)) / period
    avgLoss = (avgLoss * (period - 1) + Math.max(-d, 0)) / period
    result.push(avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss))
  }
  return result
}

function macd(closes: number[]): { macdLine: number[]; signal: number[]; histogram: number[] } {
  const ema12 = ema(closes, 12)
  const ema26 = ema(closes, 26)
  const macdLine = closes.map((_, i) => isNaN(ema12[i]) || isNaN(ema26[i]) ? NaN : ema12[i] - ema26[i])
  const validMacd = macdLine.filter(v => !isNaN(v))
  const signalRaw = ema(validMacd, 9)
  const firstValid = macdLine.findIndex(v => !isNaN(v))
  const signal: number[] = new Array(firstValid).fill(NaN)
  let sigIdx = 0
  for (let i = firstValid; i < macdLine.length; i++) {
    signal.push(isNaN(signalRaw[sigIdx]) ? NaN : signalRaw[sigIdx])
    sigIdx++
  }
  const histogram = macdLine.map((m, i) => isNaN(m) || isNaN(signal[i]) ? NaN : m - signal[i])
  return { macdLine, signal, histogram }
}

// ── Signal classification ─────────────────────────────────────────────────
type Signal = 'bullish' | 'bearish' | 'neutral'

interface Indicator {
  name: string
  value: string
  signal: Signal
  detail: string
}

function classifyRSI(v: number): Signal {
  if (v >= 70) return 'bearish'
  if (v <= 30) return 'bullish'
  if (v > 55) return 'bullish'
  if (v < 45) return 'bearish'
  return 'neutral'
}

function signalIcon(s: Signal) {
  if (s === 'bullish') return <TrendingUp className="w-3 h-3 text-price-up" />
  if (s === 'bearish') return <TrendingDown className="w-3 h-3 text-price-down" />
  return <Minus className="w-3 h-3 text-muted-foreground" />
}

function signalBadge(s: Signal) {
  if (s === 'bullish') return <span className="text-[9px] font-semibold text-price-up bg-price-up/10 border border-price-up/30 px-1.5 py-0.5 rounded">BULL</span>
  if (s === 'bearish') return <span className="text-[9px] font-semibold text-price-down bg-price-down/10 border border-price-down/30 px-1.5 py-0.5 rounded">BEAR</span>
  return <span className="text-[9px] font-semibold text-muted-foreground bg-muted/30 border border-border px-1.5 py-0.5 rounded">NEUT</span>
}

export function TechnicalAnalysisWidget() {
  const [symbol, setSymbol] = useState('AAPL')
  const [inputVal, setInputVal] = useState('AAPL')
  const [range, setRange] = useState('3mo')

  const { data, isLoading, error, mutate } = useSWR<ChartResponse>(
    `/api/stock/${symbol}/chart?range=${range}`,
    fetcher,
    { refreshInterval: 300_000, dedupingInterval: 60_000 }
  )

  // Period gain/loss
  const candles = data?.data ?? []
  const firstOpen = candles.length > 0 ? (candles[0].open ?? candles[0].close) : null
  const lastClose = candles.length > 0 ? candles[candles.length - 1].close : null
  const periodChange = firstOpen != null && lastClose != null && firstOpen > 0 ? lastClose - firstOpen : null
  const periodChangePct = firstOpen != null && periodChange != null && firstOpen > 0
    ? (periodChange / firstOpen) * 100 : null
  const periodIsPositive = (periodChange ?? 0) >= 0

    const indicators = useMemo<Indicator[]>(() => {
    if (candles.length < 50) return []
    const closes = candles.map(c => c.close)
    const last = closes[closes.length - 1]

    // RSI(14)
    const rsiVals = rsi(closes, 14)
    const rsiLast = rsiVals[rsiVals.length - 1]
    const rsiSig = classifyRSI(rsiLast)

    // MACD
    const { macdLine, signal: sigLine, histogram } = macd(closes)
    const ml = macdLine[macdLine.length - 1]
    const sl = sigLine[sigLine.length - 1]
    const hist = histogram[histogram.length - 1]
    const macdSig: Signal = isNaN(ml) || isNaN(sl) ? 'neutral' : ml > sl ? 'bullish' : ml < sl ? 'bearish' : 'neutral'

    // EMA20 / EMA50
    const ema20 = ema(closes, 20)
    const ema50 = ema(closes, 50)
    const e20 = ema20[ema20.length - 1]
    const e50 = ema50[ema50.length - 1]
    const emaSig: Signal = last > e20 && e20 > e50 ? 'bullish' : last < e20 && e20 < e50 ? 'bearish' : 'neutral'

    // SMA200
    const sma200 = closes.length >= 200
      ? closes.slice(-200).reduce((s, v) => s + v, 0) / 200
      : closes.reduce((s, v) => s + v, 0) / closes.length
    const smaSig: Signal = last > sma200 ? 'bullish' : 'bearish'

    // Bollinger Bands (20)
    const sma20 = closes.slice(-20).reduce((s, v) => s + v, 0) / 20
    const stddev = Math.sqrt(closes.slice(-20).reduce((s, v) => s + Math.pow(v - sma20, 2), 0) / 20)
    const upper = sma20 + 2 * stddev
    const lower = sma20 - 2 * stddev
    const bbSig: Signal = last >= upper ? 'bearish' : last <= lower ? 'bullish' : 'neutral'
    const bbPct = ((last - lower) / (upper - lower) * 100)

    return [
      {
        name: 'RSI (14)',
        value: rsiLast.toFixed(1),
        signal: rsiSig,
        detail: rsiLast >= 70 ? 'Overbought' : rsiLast <= 30 ? 'Oversold' : `Momentum ${rsiLast.toFixed(0)}`,
      },
      {
        name: 'MACD (12,26,9)',
        value: isNaN(ml) ? '—' : ml.toFixed(3),
        signal: macdSig,
        detail: isNaN(hist) ? '—' : `Hist ${hist > 0 ? '+' : ''}${hist.toFixed(3)}`,
      },
      {
        name: 'EMA 20/50',
        value: `${e20.toFixed(2)} / ${e50.toFixed(2)}`,
        signal: emaSig,
        detail: last > e20 ? 'Above EMA20' : 'Below EMA20',
      },
      {
        name: 'SMA 200',
        value: sma200.toFixed(2),
        signal: smaSig,
        detail: last > sma200 ? 'Above SMA200' : 'Below SMA200',
      },
      {
        name: 'Bollinger Bands',
        value: `${bbPct.toFixed(0)}%B`,
        signal: bbSig,
        detail: last >= upper ? 'At upper band' : last <= lower ? 'At lower band' : `Mid ${bbPct.toFixed(0)}%`,
      },
    ]
  }, [candles])

  const overall: Signal = useMemo(() => {
    if (indicators.length === 0) return 'neutral'
    const bulls = indicators.filter(i => i.signal === 'bullish').length
    const bears = indicators.filter(i => i.signal === 'bearish').length
    if (bulls > bears && bulls >= 3) return 'bullish'
    if (bears > bulls && bears >= 3) return 'bearish'
    return 'neutral'
  }, [indicators])

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    const s = inputVal.trim().toUpperCase()
    if (s) setSymbol(s)
  }, [inputVal])

  return (
    <div className="flex flex-col h-full font-mono text-xs">
      {/* Header / input */}
      <div className="flex items-center gap-2 px-3 pt-2 pb-1 shrink-0">
        <form onSubmit={handleSubmit} className="flex gap-1 flex-1">
          <input
            value={inputVal}
            onChange={e => setInputVal(e.target.value.toUpperCase())}
            className="bg-background border border-border rounded px-2 py-0.5 text-[11px] w-20 focus:outline-none focus:border-primary"
            placeholder="AAPL"
          />
          <button type="submit" className="px-2 py-0.5 border border-border rounded text-[10px] hover:border-primary hover:text-primary transition-colors">
            Analyze
          </button>
        </form>
        <button onClick={() => mutate()} className="text-muted-foreground hover:text-foreground transition-colors">
          <RefreshCw className={cn('w-3 h-3', isLoading && 'animate-spin')} />
        </button>
      </div>

      {/* Range selector */}
      <div className="flex gap-1 px-3 pb-1 shrink-0 flex-wrap">
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

      {/* Period gain/loss + Overall signal */}
      {indicators.length > 0 && (
        <div className={cn(
          'mx-3 mb-2 p-2 rounded border shrink-0',
          overall === 'bullish' ? 'bg-price-up/10 border-price-up/30' :
          overall === 'bearish' ? 'bg-price-down/10 border-price-down/30' :
          'bg-muted/20 border-border'
        )}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              {signalIcon(overall)}
              <span className="font-semibold uppercase tracking-wide text-[10px]">
                {symbol} — Overall Signal
              </span>
            </div>
            {signalBadge(overall)}
          </div>
          {periodChange != null && (
            <div className={cn('flex items-center gap-1 mt-1 text-[10px]', periodIsPositive ? 'text-price-up' : 'text-price-down')}>
              {periodIsPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              <span className="tabular-nums">
                {periodIsPositive ? '+' : ''}{periodChange.toFixed(2)}
                <span className="opacity-70 ml-1">({periodIsPositive ? '+' : ''}{periodChangePct?.toFixed(2) ?? '0.00'}%)</span>
              </span>
              <span className="text-muted-foreground ml-1">{RANGES.find(r => r.value === range)?.label} change</span>
            </div>
          )}
        </div>
      )}

      {/* Indicators */}
      <div className="flex-1 overflow-y-auto">
        {isLoading && indicators.length === 0 ? (
          <div className="flex items-center justify-center h-full gap-2 text-muted-foreground">
            <RefreshCw className="w-3 h-3 animate-spin" />
            <span>Computing indicators…</span>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            Failed to load data for {symbol}
          </div>
        ) : (
          indicators.map(ind => (
            <div key={ind.name} className="px-3 py-2 border-b border-border/30 hover:bg-muted/10 transition-colors">
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-muted-foreground">{ind.name}</span>
                {signalBadge(ind.signal)}
              </div>
              <div className="flex items-center justify-between">
                <span className={cn(
                  'font-semibold tabular-nums',
                  ind.signal === 'bullish' ? 'text-price-up' :
                  ind.signal === 'bearish' ? 'text-price-down' :
                  'text-foreground'
                )}>
                  {ind.value}
                </span>
                <span className="text-[9px] text-muted-foreground">{ind.detail}</span>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="text-[9px] text-muted-foreground px-3 py-1 border-t border-border shrink-0">
        Real OHLC · {RANGES.find(r => r.value === range)?.label} · RSI · MACD · EMA · BB
      </div>
    </div>
  )
}
