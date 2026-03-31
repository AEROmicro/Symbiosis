'use client'

import { ReactNode } from 'react'
import {
  Terminal, LayoutGrid, TrendingUp, Zap, Server, Newspaper,
  Briefcase, Clock, Globe, Activity, Map, Bitcoin, DollarSign,
  CalendarDays, HelpCircle, Calculator, ListTodo, Rss,
  Landmark, Gem, Target, Coins, Book, Search,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { WidgetConfig } from '@/lib/widget-types'
import { WIDGET_CATALOG } from '@/lib/widget-types'

// Existing full-featured components
import { TerminalCLI }   from '@/components/terminal-cli'
import { StockCard }     from '@/components/stock-card'
import { StockDetail }   from '@/components/stock-detail'
import { QuickActions }  from '@/components/quick-actions'
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
import { SystemStatusWidget }  from '@/components/widgets/system-status-widget'
import { FormulasWidget }         from '@/components/widgets/formulas-widget'
import { DictionaryWidget }       from '@/components/widgets/dictionary-widget'
import { MarketSessionWidget }    from '@/components/widgets/market-session-widget'
import { WatchlistCompactWidget } from '@/components/widgets/watchlist-compact-widget'
import { EarningsWidget }         from '@/components/widgets/earnings-widget'
import { YieldCurveWidget }       from '@/components/widgets/yield-curve-widget'
import { MarketBreadthWidget }    from '@/components/widgets/market-breadth-widget'
import { SectorRotationWidget }   from '@/components/widgets/sector-rotation-widget'
import { MacroIndicatorsWidget }  from '@/components/widgets/macro-indicators-widget'
import { OptionsFlowWidget }      from '@/components/widgets/options-flow-widget'
import { InsiderActivityWidget }  from '@/components/widgets/insider-activity-widget'
import { CorrelationHeatmapWidget } from '@/components/widgets/correlation-heatmap-widget'
import { StockScreenerWidget }    from '@/components/widgets/stock-screener-widget'
import { RiskMetricsWidget }      from '@/components/widgets/risk-metrics-widget'
import { TimerWidget }            from '@/components/widgets/timer-widget'
import { JsonViewerWidget }       from '@/components/widgets/json-viewer-widget'
import { SystemMonitorWidget }    from '@/components/widgets/system-monitor-widget'
import { WeatherWidget }          from '@/components/widgets/weather-widget'
import { WatchlistWidget }        from '@/components/widgets/watchlist-widget'
import { WorldClockWidget }       from '@/components/widgets/world-clock-widget'
import { PriceAlertsWidget }      from '@/components/widgets/price-alerts-widget'
import { SavingsGoalsWidget }     from '@/components/widgets/savings-goals-widget'
import { IpoCalendarWidget }      from '@/components/widgets/ipo-calendar-widget'
import { AnalystRatingsWidget }   from '@/components/widgets/analyst-ratings-widget'
import { ShortInterestWidget }    from '@/components/widgets/short-interest-widget'
import { StockComparisonWidget }  from '@/components/widgets/stock-comparison-widget'
import { EarningsSurpriseWidget } from '@/components/widgets/earnings-surprise-widget'
import { SentimentTrackerWidget } from '@/components/widgets/sentiment-tracker-widget'
import { TradeJournalWidget }     from '@/components/widgets/trade-journal-widget'
import { VolatilityWidget }       from '@/components/widgets/volatility-widget'
import { MarketCapWidget }        from '@/components/widgets/market-cap-widget'
import { CandlestickWidget }      from '@/components/widgets/candlestick-widget'

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
  defaultExchange?: string
  widgetLayout?: import('@/lib/widget-types').WidgetConfig[]
  onLoadProfile?: (layout: import('@/lib/widget-types').WidgetConfig[]) => void
  // Multi-list watchlists
  isLoggedIn?: boolean
  watchlistSets?: Record<string, string[]>
  activeListName?: string
  onSwitchList?: (name: string) => void
  onCreateList?: (name: string) => void
  onDeleteList?: (name: string) => void
  // Terminal: add to specific list
  onAddStockToList?: (symbol: string, listName: string) => void
}

// ── Icon lookup by name ─────────────────────────────────────────────────────
const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Terminal, LayoutGrid, TrendingUp, Zap, Server, Newspaper,
  Briefcase, Clock, Globe, Activity, Map, Bitcoin, DollarSign,
  CalendarDays, HelpCircle, Calculator, ListTodo, Rss,
  Landmark, Gem, Target, Coins, Book, Search,
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
    defaultExchange,
    widgetLayout, onLoadProfile,
    isLoggedIn, watchlistSets, activeListName,
    onSwitchList, onCreateList, onDeleteList, onAddStockToList,
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
              isLoggedIn={isLoggedIn}
              watchlistNames={Object.keys(watchlistSets ?? {})}
              activeListName={activeListName}
              onAddStockToList={onAddStockToList}
            />
          </div>
        </WidgetFrame>
      )

    // ── Watchlist ───────────────────────────────────────────────────────────
    case 'watchlist':
      return (
        <WidgetFrame title={`${activeListName ?? title} (${watchedStocks.length})`} iconName={iconName}>
          <WatchlistWidget
            watchedStocks={watchedStocks}
            selectedStock={selectedStock}
            onRemoveStock={onRemoveStock}
            onSelectStock={onSelectStock}
            refreshInterval={refreshInterval}
            isLoggedIn={isLoggedIn}
            watchlistSets={watchlistSets}
            activeListName={activeListName}
            onSwitchList={onSwitchList}
            onCreateList={onCreateList}
            onDeleteList={onDeleteList}
          />
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
    case 'system-status':
      return (
        <WidgetFrame title={title} iconName={iconName}>
          <SystemStatusWidget
            defaultExchange={defaultExchange}
            watchedStocks={watchedStocks}
            onAddStock={onAddStock}
            widgetLayout={widgetLayout}
            onLoadProfile={onLoadProfile}
          />
        </WidgetFrame>
      )

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
    case 'portfolio-lg':
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

    // ── Market Sessions ──────────────────────────────────────────────────────
    case 'market-session':
      return (
        <WidgetFrame title={title} iconName={iconName}>
          <MarketSessionWidget />
        </WidgetFrame>
      )

    // ── Watchlist Compact ────────────────────────────────────────────────────
    case 'watchlist-compact':
      return (
        <WidgetFrame title={title} iconName={iconName}>
          <WatchlistCompactWidget
            watchedStocks={watchedStocks}
            selectedStock={selectedStock}
            onSelectStock={onSelectStock}
            refreshInterval={refreshInterval}
          />
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
    case 'notes-md':
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

    // ── Dictionary ─────────────────────────────────────────────────────────────
    case 'dictionary':
    case 'dictionary-lg':
      return (
        <WidgetFrame title={title} iconName={iconName}>
          <DictionaryWidget />
        </WidgetFrame>
      )

    // ── Formulas ────────────────────────────────────────────────────────────
    case 'formulas':
    case 'formulas-lg':
      return (
        <WidgetFrame title={title} iconName={iconName}>
          <FormulasWidget />
        </WidgetFrame>
      )

    // ── New Market widgets ───────────────────────────────────────────────────
    case 'earnings':
      return (
        <WidgetFrame title={title} iconName={iconName}>
          <EarningsWidget />
        </WidgetFrame>
      )

    case 'yield-curve':
      return (
        <WidgetFrame title={title} iconName={iconName}>
          <YieldCurveWidget />
        </WidgetFrame>
      )

    case 'market-breadth':
      return (
        <WidgetFrame title={title} iconName={iconName}>
          <MarketBreadthWidget />
        </WidgetFrame>
      )

    case 'sector-rotation':
      return (
        <WidgetFrame title={title} iconName={iconName}>
          <SectorRotationWidget />
        </WidgetFrame>
      )

    case 'macro-indicators':
      return (
        <WidgetFrame title={title} iconName={iconName}>
          <MacroIndicatorsWidget />
        </WidgetFrame>
      )

    case 'options-flow':
      return (
        <WidgetFrame title={title} iconName={iconName}>
          <OptionsFlowWidget />
        </WidgetFrame>
      )

    case 'insider-activity':
      return (
        <WidgetFrame title={title} iconName={iconName}>
          <InsiderActivityWidget />
        </WidgetFrame>
      )

    case 'correlation-heatmap':
      return (
        <WidgetFrame title={title} iconName={iconName}>
          <CorrelationHeatmapWidget />
        </WidgetFrame>
      )

    // ── New Tools widgets ────────────────────────────────────────────────────
    case 'stock-screener':
      return (
        <WidgetFrame title={title} iconName={iconName}>
          <StockScreenerWidget />
        </WidgetFrame>
      )

    case 'risk-metrics':
      return (
        <WidgetFrame title={title} iconName={iconName}>
          <RiskMetricsWidget />
        </WidgetFrame>
      )

    case 'timer':
      return (
        <WidgetFrame title={title} iconName={iconName}>
          <TimerWidget />
        </WidgetFrame>
      )

    case 'json-viewer':
      return (
        <WidgetFrame title={title} iconName={iconName}>
          <JsonViewerWidget />
        </WidgetFrame>
      )

    case 'system-monitor':
      return (
        <WidgetFrame title={title} iconName={iconName}>
          <SystemMonitorWidget />
        </WidgetFrame>
      )

    case 'weather':
      return (
        <WidgetFrame title={title} iconName={iconName}>
          <WeatherWidget />
        </WidgetFrame>
      )

    case 'world-clock':
      return (
        <WidgetFrame title={title} iconName={iconName}>
          <WorldClockWidget />
        </WidgetFrame>
      )

    case 'price-alerts':
      return (
        <WidgetFrame title={title} iconName={iconName}>
          <PriceAlertsWidget />
        </WidgetFrame>
      )

    case 'savings-goals':
      return (
        <WidgetFrame title={title} iconName={iconName}>
          <SavingsGoalsWidget />
        </WidgetFrame>
      )

    case 'ipo-calendar':
      return <WidgetFrame title={title} iconName={iconName}><IpoCalendarWidget /></WidgetFrame>
    case 'analyst-ratings':
      return <WidgetFrame title={title} iconName={iconName}><AnalystRatingsWidget /></WidgetFrame>
    case 'short-interest':
      return <WidgetFrame title={title} iconName={iconName}><ShortInterestWidget /></WidgetFrame>
    case 'stock-comparison':
      return <WidgetFrame title={title} iconName={iconName}><StockComparisonWidget /></WidgetFrame>
    case 'earnings-surprise':
      return <WidgetFrame title={title} iconName={iconName}><EarningsSurpriseWidget /></WidgetFrame>
    case 'sentiment-tracker':
      return <WidgetFrame title={title} iconName={iconName}><SentimentTrackerWidget /></WidgetFrame>
    case 'trade-journal':
      return <WidgetFrame title={title} iconName={iconName}><TradeJournalWidget /></WidgetFrame>
    case 'volatility-index':
      return <WidgetFrame title={title} iconName={iconName}><VolatilityWidget /></WidgetFrame>
    case 'market-cap-leaderboard':
      return <WidgetFrame title={title} iconName={iconName}><MarketCapWidget /></WidgetFrame>
    case 'candlestick-mini':
      return <WidgetFrame title={title} iconName={iconName}><CandlestickWidget symbol={selectedStock ?? 'AAPL'} /></WidgetFrame>

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
