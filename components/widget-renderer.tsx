'use client'

import { ReactNode } from 'react'
import {
  Terminal, LayoutGrid, TrendingUp, Zap, Server, Newspaper,
  Briefcase, Clock, Globe, Activity, Map, Bitcoin, DollarSign,
  CalendarDays, HelpCircle, Calculator, ListTodo, Rss,
  Landmark, Gem, Target, Coins,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { WidgetConfig } from '@/lib/widget-types'
import { WIDGET_CATALOG } from '@/lib/widget-types'

// Existing full-featured components
import { TerminalCLI }   from '@/components/terminal-cli'
import { StockCard }     from '@/components/stock-card'
import { StockDetail }   from '@/components/stock-detail'
import { QuickActions }  from '@/components/quick-actions'
import { HelpDialog }         from '@/components/help-dialog'
import { KeyboardShortcuts }  from '@/components/keyboard-shortcuts'
import { MarketHoursDialog }  from '@/components/market-hours-dialog'
import { NewsDialog }         from '@/components/news-dialog'
import { MarketStatsDialog }  from '@/components/market-stats-dialog'
import { CurrencyConverter }  from '@/components/currency-converter'
import { PortfolioDialog }    from '@/components/portfolio-dialog'
import { CalculatorDialog }   from '@/components/calculator-dialog'
import { LayoutProfilesDialog } from '@/components/layout-profiles-dialog'
import { CalculatorWidget }   from '@/components/widgets/calculator-widget'
import { TodoWidget }         from '@/components/widgets/todo-widget'
import { NewsTickerWidget }   from '@/components/widgets/news-ticker-widget'

// New widget components
import { ClockWidget }            from '@/components/widgets/clock-widget'
import { AnalogClockWidget }      from '@/components/widgets/analog-clock-widget'
import { NewsWidget }             from '@/components/widgets/news-widget'
import { PortfolioWidget }        from '@/components/widgets/portfolio-widget'
import { MarketHoursWidget }      from '@/components/widgets/market-hours-widget'
import { MarketStatsWidget }      from '@/components/widgets/market-stats-widget'
import { CurrencyWidget }         from '@/components/widgets/currency-widget'
import { HeatmapWidget }          from '@/components/widgets/heatmap-widget'
import { CryptoWidget }           from '@/components/widgets/crypto-widget'
import { EconomicCalendarWidget } from '@/components/widgets/economic-calendar-widget'
import { TopMoversWidget }        from '@/components/widgets/top-movers-widget'
import { HelpWidget }             from '@/components/widgets/help-widget'
import { FearGreedWidget }        from '@/components/widgets/fear-greed-widget'
import { NotesWidget }            from '@/components/widgets/notes-widget'
import { SpacerWidget }           from '@/components/widgets/spacer-widget'
import { BondsWidget }            from '@/components/widgets/bonds-widget'
import { CommoditiesWidget }      from '@/components/widgets/commodities-widget'
import { PositionSizerWidget }    from '@/components/widgets/position-sizer-widget'
import { DividendsWidget }        from '@/components/widgets/dividends-widget'

// ── Props passed from the main app to stateful widgets ─────────────────────
export interface WidgetAppProps {
  watchedStocks: string[]
  selectedStock: string | null
  onAddStock: (symbol: string) => void
  onRemoveStock: (symbol: string) => void
  onClearAll: () => void
  onSelectStock: (symbol: string) => void
  marketState: string
  refreshInterval: number
  widgetLayout?: import('@/lib/widget-types').WidgetConfig[]
  onLoadProfile?: (layout: import('@/lib/widget-types').WidgetConfig[]) => void
}

// ── Icon lookup by name ─────────────────────────────────────────────────────
const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Terminal, LayoutGrid, TrendingUp, Zap, Server, Newspaper,
  Briefcase, Clock, Globe, Activity, Map, Bitcoin, DollarSign,
  CalendarDays, HelpCircle, Calculator, ListTodo, Rss,
  Landmark, Gem, Target, Coins,
}

// ── WidgetFrame ─────────────────────────────────────────────────────────────
interface WidgetFrameProps {
  title: string
  iconName: string
  children: ReactNode
  className?: string
}

export function WidgetFrame({ title, iconName, children, className }: WidgetFrameProps) {
  const Icon = ICON_MAP[iconName] ?? Terminal
  return (
    <div className={cn('flex flex-col border border-border bg-card rounded-md overflow-hidden h-full', className)}>
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border shrink-0 bg-card/80">
        <Icon className="w-3 h-3 text-primary shrink-0" />
        <span className="text-xs uppercase tracking-wider text-muted-foreground font-mono truncate">
          {title}
        </span>
      </div>
      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {children}
      </div>
    </div>
  )
}

// ── WidgetRenderer ──────────────────────────────────────────────────────────
interface WidgetRendererProps {
  config: WidgetConfig
  appProps: WidgetAppProps
}

export function WidgetRenderer({ config, appProps }: WidgetRendererProps) {
  const meta = WIDGET_CATALOG.find(m => m.type === config.type)
  const title = meta?.name ?? config.type
  const iconName = meta?.iconName ?? 'Terminal'

  const {
    watchedStocks, selectedStock,
    onAddStock, onRemoveStock, onClearAll, onSelectStock,
    refreshInterval,
    widgetLayout, onLoadProfile,
  } = appProps

  switch (config.type) {
    // ── Terminal (all sizes) ────────────────────────────────────────────────
    case 'terminal':
    case 'terminal-sm':
    case 'terminal-lg':
      return (
        <WidgetFrame title={title} iconName={iconName}>
          <div className="h-full overflow-hidden">
            <TerminalCLI
              onAddStock={onAddStock}
              onRemoveStock={onRemoveStock}
              onClearAll={onClearAll}
              onSelectStock={onSelectStock}
              watchedStocks={watchedStocks}
            />
          </div>
        </WidgetFrame>
      )

    // ── Watchlist ───────────────────────────────────────────────────────────
    case 'watchlist':
      return (
        <WidgetFrame title={`${title} (${watchedStocks.length})`} iconName={iconName}>
          <div className="h-full overflow-y-auto p-3">
            {watchedStocks.length === 0 ? (
              <div className="border border-dashed border-border bg-card/50 rounded-md p-8 text-center">
                <div className="text-4xl text-primary/30 mb-3 font-mono">{'[  ]'}</div>
                <p className="text-muted-foreground text-sm">No stocks in watchlist</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Use the terminal or quick add buttons to add stocks
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                {watchedStocks.map((symbol) => (
                  <StockCard
                    key={symbol}
                    symbol={symbol}
                    onRemove={onRemoveStock}
                    onClick={onSelectStock}
                    isSelected={selectedStock === symbol}
                    refreshInterval={refreshInterval}
                  />
                ))}
              </div>
            )}
          </div>
        </WidgetFrame>
      )

    // ── Stock Detail ────────────────────────────────────────────────────────
    case 'stock-detail':
      return (
        <WidgetFrame title={selectedStock ? `${title} — ${selectedStock}` : title} iconName={iconName}>
          <div className="h-full overflow-hidden p-3">
            {selectedStock ? (
              <StockDetail symbol={selectedStock} refreshInterval={refreshInterval} onSymbolChange={onSelectStock} />
            ) : (
              <div className="flex items-center justify-center h-full text-xs text-muted-foreground font-mono">
                Select a stock from the watchlist
              </div>
            )}
          </div>
        </WidgetFrame>
      )

    // ── Quick Actions ───────────────────────────────────────────────────────
    case 'quick-actions':
      return (
        <WidgetFrame title={title} iconName={iconName}>
          <QuickActions
            onAddStock={onAddStock}
            onRemoveStock={onRemoveStock}
            onClearAll={onClearAll}
            watchedStocks={watchedStocks}
          />
        </WidgetFrame>
      )

    // ── System Status ───────────────────────────────────────────────────────
    case 'system-status': {
      const sessionLabel =
        appProps.marketState === 'REGULAR' ? 'Regular Hours' :
        appProps.marketState === 'PRE'     ? 'Pre-Market'    :
        appProps.marketState === 'POST'    ? 'After-Hours'   : 'Market Closed'
      const sessionColor =
        appProps.marketState === 'REGULAR' ? 'text-primary'           :
        appProps.marketState === 'PRE'     ? 'text-yellow-500'        :
        appProps.marketState === 'POST'    ? 'text-orange-500'        : 'text-muted-foreground'

      return (
        <WidgetFrame title={title} iconName={iconName}>
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
                <span className="text-muted-foreground">Refresh Rate</span>
                <span className="text-foreground">1s</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Watching</span>
                <span className="text-foreground">{watchedStocks.length} stocks</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Session</span>
                <span className={cn('flex items-center gap-1.5', sessionColor)}>
                  {appProps.marketState !== 'CLOSED' && (
                    <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                  )}
                  {sessionLabel}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Exchange</span>
                <span className="text-foreground">NYSE / NASDAQ</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Hours (ET)</span>
                <span className="text-foreground">09:30 – 16:00</span>
              </div>
            </div>

            {/* ── Divider + Tools ── */}
            <div className="flex flex-col gap-2">
              <div className="border-t border-border" />

              {/* ── Tools — 2-column grid, no scroll ── */}
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
        </WidgetFrame>
      )
    }

    // ── News ────────────────────────────────────────────────────────────────
    case 'news':
    case 'news-lg':
      return (
        <WidgetFrame title={title} iconName={iconName}>
          <NewsWidget />
        </WidgetFrame>
      )

    // ── Portfolio ───────────────────────────────────────────────────────────
    case 'portfolio':
      return (
        <WidgetFrame title={title} iconName={iconName}>
          <PortfolioWidget />
        </WidgetFrame>
      )

    // ── Clock (digital) ─────────────────────────────────────────────────────
    case 'clock':
      return (
        <WidgetFrame title={title} iconName={iconName}>
          <ClockWidget />
        </WidgetFrame>
      )

    // ── Analog Clock ────────────────────────────────────────────────────────
    case 'analog-clock':
      return (
        <WidgetFrame title={title} iconName={iconName}>
          <AnalogClockWidget />
        </WidgetFrame>
      )

    // ── Market Hours ────────────────────────────────────────────────────────
    case 'market-hours':
      return (
        <WidgetFrame title={title} iconName={iconName}>
          <MarketHoursWidget />
        </WidgetFrame>
      )

    // ── Market Stats ────────────────────────────────────────────────────────
    case 'market-stats':
      return (
        <WidgetFrame title={title} iconName={iconName}>
          <MarketStatsWidget />
        </WidgetFrame>
      )

    // ── Heatmap ─────────────────────────────────────────────────────────────
    case 'heatmap':
      return (
        <WidgetFrame title={title} iconName={iconName}>
          <HeatmapWidget />
        </WidgetFrame>
      )

    // ── Crypto ──────────────────────────────────────────────────────────────
    case 'crypto':
      return (
        <WidgetFrame title={title} iconName={iconName}>
          <CryptoWidget />
        </WidgetFrame>
      )

    // ── Currency ────────────────────────────────────────────────────────────
    case 'currency':
      return (
        <WidgetFrame title={title} iconName={iconName}>
          <CurrencyWidget />
        </WidgetFrame>
      )

    // ── Economic Calendar ───────────────────────────────────────────────────
    case 'economic-calendar':
      return (
        <WidgetFrame title={title} iconName={iconName}>
          <EconomicCalendarWidget />
        </WidgetFrame>
      )

    // ── Top Movers ──────────────────────────────────────────────────────────
    case 'top-movers':
      return (
        <WidgetFrame title={title} iconName={iconName}>
          <TopMoversWidget />
        </WidgetFrame>
      )

    // ── Help ────────────────────────────────────────────────────────────────
    case 'help':
      return (
        <WidgetFrame title={title} iconName={iconName}>
          <HelpWidget />
        </WidgetFrame>
      )

    // ── Fear & Greed ─────────────────────────────────────────────────────────
    case 'fear-greed':
      return (
        <WidgetFrame title={title} iconName={iconName}>
          <FearGreedWidget />
        </WidgetFrame>
      )

    // ── Notes ────────────────────────────────────────────────────────────────
    case 'notes':
    case 'notes-lg':
      return (
        <WidgetFrame title={title} iconName={iconName}>
          <NotesWidget />
        </WidgetFrame>
      )

    // ── To-Do ────────────────────────────────────────────────────────────────
    case 'todo':
    case 'todo-lg':
      return (
        <WidgetFrame title={title} iconName={iconName}>
          <TodoWidget />
        </WidgetFrame>
      )

    // ── Calculator ───────────────────────────────────────────────────────────
    case 'calculator':
      return (
        <WidgetFrame title={title} iconName={iconName}>
          <CalculatorWidget />
        </WidgetFrame>
      )

    // ── News Ticker ──────────────────────────────────────────────────────────
    case 'news-ticker':
      return <NewsTickerWidget />

    // ── Spacers ───────────────────────────────────────────────────────────────
    case 'spacer-sm':
    case 'spacer-md':
    case 'spacer-lg':
      return <SpacerWidget />

    // ── Treasury Yields ──────────────────────────────────────────────────────
    case 'bonds':
      return (
        <WidgetFrame title={title} iconName={iconName}>
          <BondsWidget />
        </WidgetFrame>
      )

    // ── Commodities ──────────────────────────────────────────────────────────
    case 'commodities':
      return (
        <WidgetFrame title={title} iconName={iconName}>
          <CommoditiesWidget />
        </WidgetFrame>
      )

    // ── Position Sizer ────────────────────────────────────────────────────────
    case 'position-sizer':
      return (
        <WidgetFrame title={title} iconName={iconName}>
          <PositionSizerWidget />
        </WidgetFrame>
      )

    // ── Dividends ─────────────────────────────────────────────────────────────
    case 'dividends':
      return (
        <WidgetFrame title={title} iconName={iconName}>
          <DividendsWidget />
        </WidgetFrame>
      )

    default:
      return (
        <WidgetFrame title={config.type} iconName="Terminal">
          <div className="flex items-center justify-center h-full text-xs text-muted-foreground font-mono">
            Unknown widget type: {config.type}
          </div>
        </WidgetFrame>
      )
  }
}
