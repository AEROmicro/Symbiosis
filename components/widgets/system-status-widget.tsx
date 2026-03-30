'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { findExchange, isExchangeOpen } from '@/lib/exchanges'
import { HelpDialog }          from '@/components/help-dialog'
import { KeyboardShortcuts }   from '@/components/keyboard-shortcuts'
import { MarketHoursDialog }   from '@/components/market-hours-dialog'
import { NewsDialog }          from '@/components/news-dialog'
import { MarketStatsDialog }   from '@/components/market-stats-dialog'
import { CurrencyConverter }   from '@/components/currency-converter'
import { PortfolioDialog }     from '@/components/portfolio-dialog'
import { CalculatorDialog }    from '@/components/calculator-dialog'
import { LayoutProfilesDialog } from '@/components/layout-profiles-dialog'
import type { WidgetConfig } from '@/lib/widget-types'

interface SystemStatusWidgetProps {
  defaultExchange?: string
  watchedStocks: string[]
  onAddStock: (symbol: string) => void
  widgetLayout?: WidgetConfig[]
  onLoadProfile?: (layout: WidgetConfig[]) => void
}

export function SystemStatusWidget({
  defaultExchange = 'NYSE',
  watchedStocks,
  onAddStock,
  widgetLayout,
  onLoadProfile,
}: SystemStatusWidgetProps) {
  const exchange = findExchange(defaultExchange)
  const [exchangeOpen, setExchangeOpen] = useState(() => isExchangeOpen(exchange))

  // Recheck open/closed every minute
  useEffect(() => {
    const ex = findExchange(defaultExchange)
    setExchangeOpen(isExchangeOpen(ex))
    const id = setInterval(() => setExchangeOpen(isExchangeOpen(findExchange(defaultExchange))), 60_000)
    return () => clearInterval(id)
  }, [defaultExchange])

  const sessionLabel = exchangeOpen ? 'Regular Hours' : 'Market Closed'
  const sessionColor = exchangeOpen ? 'text-primary' : 'text-muted-foreground'

  return (
    <div className="h-full p-2 flex flex-col justify-between overflow-hidden">

      {/* ── Status rows ── */}
      <div className="space-y-2 font-mono text-xs">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Connection</span>
          <span className="flex items-center gap-1.5 text-primary">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            Active
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Data Feed</span>
          <span className="text-primary">Real-time</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Watching</span>
          <span className="text-foreground">{watchedStocks.length} stocks</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Exchange</span>
          <span className="text-foreground truncate max-w-[130px] text-right" title={exchange.name}>
            {exchange.id}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Hours</span>
          <span className="text-foreground tabular-nums">{exchange.hoursLabel}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Session</span>
          <span className={cn('flex items-center gap-1.5', sessionColor)}>
            {exchangeOpen && (
              <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
            )}
            {sessionLabel}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Version</span>
          <span className={cn('flex items-center gap-1.5', sessionColor)}>
            <span className="text-foreground tabular-nums">v5.2 Magnetar Basalt</span>
          </span>
        </div>
      </div>

      {/* ── Divider + Tools ── */}
      <div className="flex flex-col gap-2">
        <div className="border-t border-border" />

        {/* ── Tools — 2-column grid ── */}
        <div className="grid grid-cols-2 gap-1.5">
          <HelpDialog />
          <KeyboardShortcuts />
          <MarketStatsDialog />
          <MarketHoursDialog />
          <NewsDialog />
          <CurrencyConverter onAddToWatchlist={onAddStock} watchedStocks={watchedStocks} />
          <PortfolioDialog />
          <CalculatorDialog />
          {widgetLayout !== undefined && onLoadProfile !== undefined && (
            <LayoutProfilesDialog
              currentLayout={widgetLayout}
              onLoadProfile={onLoadProfile}
            />
          )}
        </div>
      </div>

    </div>
  )
}
