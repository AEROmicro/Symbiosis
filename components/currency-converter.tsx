'use client'

import { useState, useEffect, useCallback } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeftRight, TrendingUp, Plus, RefreshCw, Check } from 'lucide-react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'
import { cn } from '@/lib/utils'

const CURRENCIES = [
  // Major
  { code: 'USD', name: 'US Dollar',              symbol: '$'    },
  { code: 'EUR', name: 'Euro',                   symbol: '€'    },
  { code: 'GBP', name: 'British Pound',          symbol: '£'    },
  { code: 'JPY', name: 'Japanese Yen',           symbol: '¥'    },
  { code: 'CHF', name: 'Swiss Franc',            symbol: 'Fr'   },
  { code: 'CAD', name: 'Canadian Dollar',        symbol: 'C$'   },
  { code: 'AUD', name: 'Australian Dollar',      symbol: 'A$'   },
  { code: 'NZD', name: 'New Zealand Dollar',     symbol: 'NZ$'  },
  // Asia-Pacific
  { code: 'CNY', name: 'Chinese Yuan',           symbol: '¥'    },
  { code: 'HKD', name: 'Hong Kong Dollar',       symbol: 'HK$'  },
  { code: 'SGD', name: 'Singapore Dollar',       symbol: 'S$'   },
  { code: 'KRW', name: 'South Korean Won',       symbol: '₩'    },
  { code: 'INR', name: 'Indian Rupee',           symbol: '₹'    },
  { code: 'TWD', name: 'Taiwan Dollar',          symbol: 'NT$'  },
  { code: 'MYR', name: 'Malaysian Ringgit',      symbol: 'RM'   },
  { code: 'IDR', name: 'Indonesian Rupiah',      symbol: 'Rp'   },
  { code: 'PHP', name: 'Philippine Peso',        symbol: '₱'    },
  { code: 'THB', name: 'Thai Baht',              symbol: '฿'    },
  { code: 'VND', name: 'Vietnamese Dong',        symbol: '₫'    },
  { code: 'PKR', name: 'Pakistani Rupee',        symbol: '₨'    },
  { code: 'BDT', name: 'Bangladeshi Taka',       symbol: '৳'    },
  // Americas
  { code: 'MXN', name: 'Mexican Peso',           symbol: '$'    },
  { code: 'BRL', name: 'Brazilian Real',         symbol: 'R$'   },
  { code: 'ARS', name: 'Argentine Peso',         symbol: '$'    },
  { code: 'CLP', name: 'Chilean Peso',           symbol: '$'    },
  { code: 'COP', name: 'Colombian Peso',         symbol: '$'    },
  { code: 'PEN', name: 'Peruvian Sol',           symbol: 'S/'   },
  // Europe
  { code: 'NOK', name: 'Norwegian Krone',        symbol: 'kr'   },
  { code: 'SEK', name: 'Swedish Krona',          symbol: 'kr'   },
  { code: 'DKK', name: 'Danish Krone',           symbol: 'kr'   },
  { code: 'PLN', name: 'Polish Zloty',           symbol: 'zł'   },
  { code: 'CZK', name: 'Czech Koruna',           symbol: 'Kč'   },
  { code: 'HUF', name: 'Hungarian Forint',       symbol: 'Ft'   },
  { code: 'RON', name: 'Romanian Leu',           symbol: 'lei'  },
  { code: 'HRK', name: 'Croatian Kuna',          symbol: 'kn'   },
  { code: 'TRY', name: 'Turkish Lira',           symbol: '₺'    },
  { code: 'RUB', name: 'Russian Ruble',          symbol: '₽'    },
  { code: 'UAH', name: 'Ukrainian Hryvnia',      symbol: '₴'    },
  // Middle East & Africa
  { code: 'SAR', name: 'Saudi Riyal',            symbol: '﷼'    },
  { code: 'AED', name: 'UAE Dirham',             symbol: 'د.إ'  },
  { code: 'QAR', name: 'Qatari Riyal',           symbol: '﷼'    },
  { code: 'KWD', name: 'Kuwaiti Dinar',          symbol: 'د.ك'  },
  { code: 'BHD', name: 'Bahraini Dinar',         symbol: '.د.ب' },
  { code: 'OMR', name: 'Omani Rial',             symbol: '﷼'    },
  { code: 'JOD', name: 'Jordanian Dinar',        symbol: 'د.ا'  },
  { code: 'ILS', name: 'Israeli Shekel',         symbol: '₪'    },
  { code: 'EGP', name: 'Egyptian Pound',         symbol: '£'    },
  { code: 'NGN', name: 'Nigerian Naira',         symbol: '₦'    },
  { code: 'KES', name: 'Kenyan Shilling',        symbol: 'KSh'  },
  { code: 'GHS', name: 'Ghanaian Cedi',          symbol: '₵'    },
  { code: 'ZAR', name: 'South African Rand',     symbol: 'R'    },
  { code: 'MAD', name: 'Moroccan Dirham',        symbol: 'د.م.' },
]

const CHART_RANGES = [
  { label: '1D',  value: '1d'  },
  { label: '5D',  value: '5d'  },
  { label: '1M',  value: '1mo' },
  { label: '3M',  value: '3mo' },
  { label: '1Y',  value: '1y'  },
]

// Build the Yahoo Finance forex symbol for a pair
function fxSymbol(from: string, to: string): string {
  return `${from}${to}=X`
}

// Determine decimal places for display (large-integer currencies quoted to 2dp)
function priceDp(to: string): number {
  return ['JPY', 'KRW', 'IDR', 'VND', 'CLP', 'COP', 'HUF', 'PKR', 'BDT'].includes(to) ? 2 : 4
}

interface ChartPoint {
  time: number
  close: number
}

interface CurrencyConverterProps {
  onAddToWatchlist?: (symbol: string) => void
  watchedStocks?: string[]
}

export function CurrencyConverter({ onAddToWatchlist, watchedStocks = [] }: CurrencyConverterProps) {
  const [open, setOpen] = useState(false)
  const [amount, setAmount] = useState('1')
  const [from, setFrom] = useState('USD')
  const [to, setTo]   = useState('EUR')

  const [rate, setRate]         = useState<number | null>(null)
  const [rateLoading, setRateLoading] = useState(false)
  const [rateError, setRateError]   = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const [chartData, setChartData]       = useState<ChartPoint[]>([])
  const [chartRange, setChartRange]     = useState('1mo')
  const [chartLoading, setChartLoading] = useState(false)

  const symbol = fxSymbol(from, to)
  const dp      = priceDp(to)
  const isWatched = watchedStocks.includes(symbol)
  const converted = rate !== null ? (parseFloat(amount) || 0) * rate : null

  // First / last chart values for change indicator
  const chartFirst = chartData[0]?.close ?? null
  const chartLast  = chartData[chartData.length - 1]?.close ?? null
  const chartChange = chartFirst && chartLast ? ((chartLast - chartFirst) / chartFirst) * 100 : null

  const fetchRate = useCallback(async () => {
    if (from === to) { setRate(1); return }
    setRateLoading(true)
    setRateError(false)
    try {
      const res = await fetch(`/api/stock/${fxSymbol(from, to)}`)
      if (res.ok) {
        const data = await res.json()
        setRate(data.price)
        setLastUpdated(new Date())
      } else {
        setRateError(true)
      }
    } catch {
      setRateError(true)
    } finally {
      setRateLoading(false)
    }
  }, [from, to])

  const fetchChart = useCallback(async () => {
    if (from === to) { setChartData([]); return }
    setChartLoading(true)
    try {
      const res = await fetch(`/api/stock/${fxSymbol(from, to)}/chart?range=${chartRange}`)
      if (res.ok) {
        const data = await res.json()
        setChartData(
          (data.data ?? [])
            .map((d: { time: number; close: number }) => ({ time: d.time, close: d.close }))
            .filter((d: ChartPoint) => d.close != null)
        )
      }
    } catch {}
    setChartLoading(false)
  }, [from, to, chartRange])

  // Refresh rate + chart whenever dialog opens or pair changes;
  // also re-runs when chartRange changes because fetchChart is memoised on it.
  useEffect(() => {
    if (!open) return
    fetchRate()
    fetchChart()
  }, [open, from, to, fetchRate, fetchChart])

  const swap = () => {
    setFrom(to)
    setTo(from)
    setRate(null)
    setChartData([])
  }

  const formatAxisTime = (ts: number) => {
    const d = new Date(ts)
    if (chartRange === '1d') {
      return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    }
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const formatTooltipTime = (ts: number) => {
    const d = new Date(ts)
    if (chartRange === '1d') {
      return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    }
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="w-full justify-start text-xs font-mono">
          <ArrowLeftRight className="w-3 h-3" />
          Currency Converter
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl sm:max-w-2xl max-h-[90vh] overflow-y-auto bg-card border-border font-mono">
        <DialogHeader>
          <DialogTitle className="text-primary flex items-center gap-2 font-mono">
            <ArrowLeftRight className="w-4 h-4" />
            Currency Converter
          </DialogTitle>
        </DialogHeader>

        {/* ── Conversion inputs ─────────────────────────────────── */}
        <div className="flex items-end gap-3">
          {/* Amount */}
          <div className="flex-1 space-y-1">
            <div className="text-xs text-muted-foreground">Amount</div>
            <Input
              type="number"
              min="0"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              className="font-mono bg-background border-border"
            />
          </div>

          {/* From */}
          <div className="flex-1 space-y-1">
            <div className="text-xs text-muted-foreground">From</div>
            <Select value={from} onValueChange={v => { setFrom(v); setRate(null); setChartData([]) }}>
              <SelectTrigger className="w-full font-mono bg-background border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="font-mono min-w-[280px] max-h-52" position="popper">
                {CURRENCIES.map(c => (
                  <SelectItem key={c.code} value={c.code}>
                    <span className="font-bold mr-1">{c.code}</span>
                    <span className="text-muted-foreground text-xs">{c.name}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Swap */}
          <button
            onClick={swap}
            title="Swap currencies"
            className="mb-0.5 p-2 rounded-md border border-border hover:border-primary hover:bg-primary/5 transition-all"
          >
            <ArrowLeftRight className="w-4 h-4 text-primary" />
          </button>

          {/* To */}
          <div className="flex-1 space-y-1">
            <div className="text-xs text-muted-foreground">To</div>
            <Select value={to} onValueChange={v => { setTo(v); setRate(null); setChartData([]) }}>
              <SelectTrigger className="w-full font-mono bg-background border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="font-mono min-w-[280px] max-h-52" position="popper">
                {CURRENCIES.map(c => (
                  <SelectItem key={c.code} value={c.code}>
                    <span className="font-bold mr-1">{c.code}</span>
                    <span className="text-muted-foreground text-xs">{c.name}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Refresh */}
          <button
            onClick={() => { fetchRate(); fetchChart() }}
            title="Refresh rate"
            disabled={rateLoading}
            className="mb-0.5 p-2 rounded-md border border-border hover:border-primary hover:bg-primary/5 transition-all disabled:opacity-40"
          >
            <RefreshCw className={cn('w-4 h-4 text-primary', rateLoading && 'animate-spin')} />
          </button>
        </div>

        {/* ── Result box ───────────────────────────────────────── */}
        <div className="border border-primary/30 bg-primary/5 rounded-md p-4 min-h-[80px]">
          {from === to ? (
            <div className="text-muted-foreground text-sm">Select two different currencies to convert.</div>
          ) : rateLoading ? (
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <RefreshCw className="w-3 h-3 animate-spin" /> Fetching live rate…
            </div>
          ) : rateError ? (
            <div className="text-destructive text-sm">Unable to fetch rate — please try again.</div>
          ) : rate !== null ? (
            <>
              <div className="text-3xl font-bold text-primary tabular-nums">
                {converted?.toLocaleString('en-US', {
                  minimumFractionDigits: dp,
                  maximumFractionDigits: dp,
                })}{' '}
                <span className="text-xl">{to}</span>
              </div>
              <div className="text-xs text-muted-foreground mt-1.5 flex flex-wrap items-center gap-3">
                <span>
                  1 {from} = {rate.toFixed(dp)} {to}
                </span>
                <span>·</span>
                <span>
                  1 {to} = {(1 / rate).toFixed(priceDp(from))} {from}
                </span>
                {lastUpdated && (
                  <>
                    <span>·</span>
                    <span>Updated {lastUpdated.toLocaleTimeString()}</span>
                  </>
                )}
              </div>
            </>
          ) : null}
        </div>

        {/* ── Watchlist / Portfolio CTA ─────────────────────────── */}
        {from !== to && onAddToWatchlist && (
          <div className="flex items-center gap-3">
            <button
              onClick={() => onAddToWatchlist(symbol)}
              disabled={isWatched}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md border transition-all',
                isWatched
                  ? 'border-primary/40 text-primary bg-primary/10 cursor-default'
                  : 'border-border hover:border-primary hover:bg-primary/5 hover:text-primary text-muted-foreground'
              )}
            >
              {isWatched ? (
                <><Check className="w-3 h-3" /> {symbol} in watchlist</>
              ) : (
                <><Plus className="w-3 h-3" /> Add {symbol} to watchlist</>
              )}
            </button>
            <span className="text-xs text-muted-foreground">
              Watchlist cards + portfolio P&amp;L tracking supported for FX pairs.
            </span>
          </div>
        )}

        {/* ── Historical chart ──────────────────────────────────── */}
        {from !== to && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <TrendingUp className="w-3 h-3 text-primary" />
                <span>
                  Historical Rate
                  {chartChange !== null && (
                    <span className={cn('ml-2 font-mono', chartChange >= 0 ? 'text-primary' : 'text-destructive')}>
                      {chartChange >= 0 ? '+' : ''}{chartChange.toFixed(2)}%
                    </span>
                  )}
                </span>
              </div>
              <div className="flex gap-1">
                {CHART_RANGES.map(r => (
                  <button
                    key={r.value}
                    onClick={() => setChartRange(r.value)}
                    className={cn(
                      'px-2 py-0.5 text-xs rounded transition-all',
                      chartRange === r.value
                        ? 'bg-primary/20 text-primary border border-primary/30'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            {chartLoading ? (
              <div className="h-44 flex items-center justify-center text-muted-foreground text-xs gap-2">
                <RefreshCw className="w-3 h-3 animate-spin" /> Loading chart…
              </div>
            ) : chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={176}>
                <LineChart data={chartData} margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
                  <XAxis
                    dataKey="time"
                    tickFormatter={formatAxisTime}
                    tick={{ fontSize: 10, fill: 'var(--muted-foreground)', fontFamily: 'monospace' }}
                    axisLine={false}
                    tickLine={false}
                    interval="preserveStartEnd"
                    minTickGap={60}
                  />
                  <YAxis
                    domain={['auto', 'auto']}
                    tick={{ fontSize: 10, fill: 'var(--muted-foreground)', fontFamily: 'monospace' }}
                    axisLine={false}
                    tickLine={false}
                    width={56}
                    tickFormatter={v => v.toFixed(dp)}
                  />
                  {chartFirst && (
                    <ReferenceLine
                      y={chartFirst}
                      stroke="var(--muted-foreground)"
                      strokeDasharray="4 2"
                      strokeOpacity={0.4}
                    />
                  )}
                  <Tooltip
                    contentStyle={{
                      background: 'var(--card)',
                      border: '1px solid var(--border)',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontFamily: 'monospace',
                      color: 'var(--foreground)',
                    }}
                    labelFormatter={ts => formatTooltipTime(ts as number)}
                    formatter={(v: number) => [v.toFixed(dp), `${from}/${to}`]}
                  />
                  <Line
                    type="monotone"
                    dataKey="close"
                    stroke={chartChange !== null && chartChange < 0 ? 'var(--destructive)' : 'var(--primary)'}
                    strokeWidth={1.5}
                    dot={false}
                    activeDot={{ r: 3 }}
                    animationDuration={400}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-44 flex items-center justify-center text-muted-foreground text-xs">
                No historical data available for this pair.
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
