'use client'

import { useState } from 'react'
import {
  BarChart2, LayoutGrid, Terminal as TerminalIcon,
  MoreHorizontal, Plus, Check,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { TerminalCLI }      from '@/components/terminal-cli'
import { StockCard }        from '@/components/stock-card'
import { MarketStatsWidget }    from '@/components/widgets/market-stats-widget'
import { CryptoWidget }         from '@/components/widgets/crypto-widget'
import { NewsWidget }           from '@/components/widgets/news-widget'
import { PortfolioWidget }      from '@/components/widgets/portfolio-widget'
import { HelpDialog }           from '@/components/help-dialog'
import { KeyboardShortcuts }    from '@/components/keyboard-shortcuts'
import { MarketHoursDialog }    from '@/components/market-hours-dialog'
import { CurrencyConverter }    from '@/components/currency-converter'
import { PortfolioDialog }      from '@/components/portfolio-dialog'
import { SettingsDialog, type AppTheme } from '@/components/settings-dialog'
import type { WidgetAppProps }  from '@/components/widget-renderer'

const QUICK_SYMBOLS = [
  { symbol: 'AAPL',  name: 'Apple'   },
  { symbol: 'MSFT',  name: 'MSFT'    },
  { symbol: 'NVDA',  name: 'NVIDIA'  },
  { symbol: 'TSLA',  name: 'Tesla'   },
  { symbol: '^GSPC', name: 'S&P'     },
  { symbol: '^IXIC', name: 'NASDAQ'  },
  { symbol: 'BTC-USD', name: 'BTC'   },
  { symbol: 'ETH-USD', name: 'ETH'   },
]

type MobileTab = 'market' | 'watchlist' | 'terminal' | 'more'

interface MobileLayoutProps {
  appProps: WidgetAppProps
  theme: AppTheme
  onThemeChange: (t: AppTheme) => void
  scanlineEnabled: boolean
  onScanlineChange: (v: boolean) => void
  onOpenBlueprint: () => void
}

export function MobileLayout({
  appProps,
  theme,
  onThemeChange,
  scanlineEnabled,
  onScanlineChange,
  onOpenBlueprint,
}: MobileLayoutProps) {
  const [activeTab, setActiveTab] = useState<MobileTab>('market')

  const {
    watchedStocks, selectedStock,
    onAddStock, onRemoveStock, onClearAll, onSelectStock,
    refreshInterval,
  } = appProps

  const isTerminal = activeTab === 'terminal'

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
      {/* ── Tab content ───────────────────────────────────────── */}
      <div className={cn('flex-1 min-h-0', isTerminal ? 'overflow-hidden' : 'overflow-y-auto')}>

        {/* MARKET */}
        {activeTab === 'market' && (
          <div className="p-4 space-y-4 pb-8">
            <section>
              <h2 className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2">
                Major Indices
              </h2>
              <div className="border border-border rounded-md overflow-hidden">
                <MarketStatsWidget />
              </div>
            </section>
            <section>
              <h2 className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2">
                Crypto
              </h2>
              <div className="border border-border rounded-md overflow-hidden" style={{ height: 260 }}>
                <CryptoWidget />
              </div>
            </section>
          </div>
        )}

        {/* WATCHLIST */}
        {activeTab === 'watchlist' && (
          <div className="p-4 space-y-4 pb-8">
            {/* Quick-add chips */}
            <div className="grid grid-cols-4 gap-2">
              {QUICK_SYMBOLS.map(({ symbol, name }) => {
                const watched = watchedStocks.includes(symbol)
                return (
                  <button
                    key={symbol}
                    onClick={() => watched ? onRemoveStock(symbol) : onAddStock(symbol)}
                    className={cn(
                      'flex flex-col items-center gap-0.5 py-2 px-1 rounded border transition-colors',
                      watched
                        ? 'border-primary/50 bg-primary/10 text-primary'
                        : 'border-border text-muted-foreground hover:border-primary/40 hover:text-foreground',
                    )}
                  >
                    {watched
                      ? <Check className="w-3.5 h-3.5 shrink-0" />
                      : <Plus  className="w-3.5 h-3.5 shrink-0" />}
                    <span className="text-[9px] font-mono font-bold leading-tight truncate w-full text-center">
                      {name}
                    </span>
                  </button>
                )
              })}
            </div>

            {/* Stock cards */}
            {watchedStocks.length === 0 ? (
              <div className="text-center py-16 font-mono">
                <div className="text-4xl text-primary/30 mb-3">{'[  ]'}</div>
                <p className="text-sm text-muted-foreground">No stocks in watchlist</p>
                <p className="text-xs text-muted-foreground mt-1">Tap a symbol above to add</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {watchedStocks.map(symbol => (
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
        )}

        {/* TERMINAL */}
        {activeTab === 'terminal' && (
          <div className="h-full p-3">
            <div className="h-full border border-border rounded-md overflow-hidden">
              <TerminalCLI
                onAddStock={onAddStock}
                onRemoveStock={onRemoveStock}
                onClearAll={onClearAll}
                onSelectStock={onSelectStock}
                watchedStocks={watchedStocks}
              />
            </div>
          </div>
        )}

        {/* MORE */}
        {activeTab === 'more' && (
          <div className="p-4 space-y-5 pb-8">
            <section>
              <h2 className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2">
                Portfolio
              </h2>
              <div className="border border-border rounded-md overflow-hidden" style={{ height: 280 }}>
                <PortfolioWidget />
              </div>
            </section>

            <section>
              <h2 className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2">
                News
              </h2>
              <div className="border border-border rounded-md overflow-hidden" style={{ height: 320 }}>
                <NewsWidget />
              </div>
            </section>

            <section>
              <h2 className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2">
                Tools
              </h2>
              <div className="space-y-2">
                <HelpDialog />
                <KeyboardShortcuts />
                <MarketHoursDialog />
                <CurrencyConverter onAddToWatchlist={onAddStock} watchedStocks={watchedStocks} />
                <PortfolioDialog />
              </div>
            </section>

            <section>
              <h2 className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2">
                Settings
              </h2>
              <SettingsDialog
                currentTheme={theme}
                onThemeChange={onThemeChange}
                scanlineEnabled={scanlineEnabled}
                onScanlineChange={onScanlineChange}
                onOpenBlueprint={onOpenBlueprint}
              />
            </section>

            <div className="text-center text-[10px] text-muted-foreground font-mono pt-2 space-y-0.5">
              <div>Symbiosis // Redefine the Limits</div>
              <div>© ÆROforge 2026 · GNU GPLv3</div>
            </div>
          </div>
        )}
      </div>

      {/* ── Bottom navigation ─────────────────────────────────── */}
      <nav className="shrink-0 border-t border-border bg-card/90 backdrop-blur-sm safe-bottom">
        <div className="grid grid-cols-4">
          {([
            { tab: 'market',    Icon: BarChart2,      label: 'Market'    },
            { tab: 'watchlist', Icon: LayoutGrid,     label: 'Watchlist' },
            { tab: 'terminal',  Icon: TerminalIcon,   label: 'Terminal'  },
            { tab: 'more',      Icon: MoreHorizontal, label: 'More'      },
          ] as const).map(({ tab, Icon, label }) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                'flex flex-col items-center gap-1 py-3 transition-colors',
                activeTab === tab
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-mono">{label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  )
}
