'use client'

import { useState, useCallback, useEffect } from 'react'
import { TerminalHeader } from '@/components/terminal-header'
import { TerminalCLI } from '@/components/terminal-cli'
import { StockCard } from '@/components/stock-card'
import { StockDetail } from '@/components/stock-detail'
import { QuickActions } from '@/components/quick-actions'
import { MarketTicker } from '@/components/market-ticker'
import { Activity, Terminal, LayoutGrid } from 'lucide-react'
import { HelpDialog } from '@/components/help-dialog'
import { KeyboardShortcuts } from '@/components/keyboard-shortcuts'
import { MarketHoursDialog } from '@/components/market-hours-dialog'
import { NewsDialog } from '@/components/news-dialog'
import { MarketStatsDialog } from '@/components/market-stats-dialog'
import { SettingsDialog, type AppTheme } from '@/components/settings-dialog'
import { CurrencyConverter } from '@/components/currency-converter'
import { PortfolioDialog } from '@/components/portfolio-dialog'

const STORAGE_KEY = 'symbiosis-watchlist'
const THEME_KEY = 'symbiosis-theme'
const DEFAULT_STOCKS = ['^IXIC', '^GSPC', '^DJI']

export default function SymbiosisApp() {
  const [watchedStocks, setWatchedStocks] = useState<string[]>(DEFAULT_STOCKS)
  const [selectedStock, setSelectedStock] = useState<string | null>('^IXIC')
  const [marketState, setMarketState] = useState<string>('CLOSED')
  const [hydrated, setHydrated] = useState(false)
  const [scanlineEnabled, setScanlineEnabled] = useState(true)
  const [theme, setTheme] = useState<AppTheme>('default')
  const refreshInterval = 1000 // Fixed 1s refresh rate

  // Load from localStorage after mount (never runs on server)
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed) && parsed.length > 0) {
          setWatchedStocks(parsed)
          setSelectedStock(parsed[0])
        }
      }
      const storedTheme = localStorage.getItem(THEME_KEY) as AppTheme | null
      if (storedTheme) setTheme(storedTheme)
    } catch {
      // localStorage unavailable (private mode, etc.) — fall back to defaults
    }
    setHydrated(true)
  }, [])

  // Apply theme to document root
  useEffect(() => {
    const root = document.documentElement
    if (theme === 'default') {
      root.removeAttribute('data-theme')
    } else {
      root.setAttribute('data-theme', theme)
    }
  }, [theme])

  // Persist to localStorage whenever watchlist changes, but only after hydration
  // (prevents overwriting stored data with defaults on first render)
  useEffect(() => {
    if (!hydrated) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(watchedStocks))
    } catch {
      // localStorage unavailable — silently ignore
    }
  }, [watchedStocks, hydrated])

  const handleThemeChange = useCallback((newTheme: AppTheme) => {
    setTheme(newTheme)
    try {
      localStorage.setItem(THEME_KEY, newTheme)
    } catch {
      // ignore
    }
  }, [])

  const handleAddStock = useCallback((symbol: string) => {
    setWatchedStocks(prev => {
      if (prev.includes(symbol)) return prev
      return [...prev, symbol]
    })
  }, [])

  const handleRemoveStock = useCallback((symbol: string) => {
    setWatchedStocks(prev => prev.filter(s => s !== symbol))
    if (selectedStock === symbol) {
      setSelectedStock(null)
    }
  }, [selectedStock])

  const handleClearAll = useCallback(() => {
    setWatchedStocks([])
    setSelectedStock(null)
  }, [])

  const handleSelectStock = useCallback((symbol: string) => {
    setSelectedStock(symbol)
  }, [])

  // ==========================================
  // HYDRATION GUARD: Prevents Next.js 16 Crash
  // ==========================================
  if (!hydrated) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center relative">
        <div className="scanline" />
        <div className="flex items-center gap-3 font-mono text-primary animate-pulse">
          <Terminal className="w-5 h-5" />
          <span className="tracking-widest text-sm">INITIALIZING_SYSTEM_CORE...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background relative">
      {/* Scanline Effect */}
      {scanlineEnabled && <div className="scanline" />}
      
      {/* Background Grid Pattern */}
      <div 
        className="fixed inset-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(var(--primary) 1px, transparent 1px),
            linear-gradient(90deg, var(--primary) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }}
      />

      {/* Header */}
      <TerminalHeader marketState={marketState} />
      
      {/* Market Ticker */}
      <MarketTicker onMarketStateChange={setMarketState} />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column - Terminal & Quick Actions */}
          <div className="lg:col-span-1 space-y-6">
            {/* Terminal CLI */}
            <div>
              <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground mb-3">
                <Terminal className="w-3 h-3 text-primary" />
                Command Terminal
              </div>
              <TerminalCLI
                onAddStock={handleAddStock}
                onRemoveStock={handleRemoveStock}
                onClearAll={handleClearAll}
                watchedStocks={watchedStocks}
              />
            </div>

            {/* Quick Actions */}
            <QuickActions 
              onAddStock={handleAddStock}
              watchedStocks={watchedStocks}
            />

            {/* System Status */}
            <div className="border border-border bg-card rounded-md p-4 z-10 relative">
              <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground mb-3">
                <Activity className="w-3 h-3 text-primary" />
                System Status
              </div>
              <div className="space-y-2 text-sm font-mono">
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
              </div>
              <div className="mt-4 pt-4 border-t border-border space-y-2">
                <HelpDialog />
                <KeyboardShortcuts />
                <MarketStatsDialog />
                <MarketHoursDialog />
                <NewsDialog />
                <CurrencyConverter
                  onAddToWatchlist={handleAddStock}
                  watchedStocks={watchedStocks}
                />
                <PortfolioDialog />
              </div>
            </div>
          </div>

          {/* Right Column - Stock Grid & Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stock Grid */}
            <div>
              <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground mb-3">
                <LayoutGrid className="w-3 h-3 text-primary" />
                Watchlist ({watchedStocks.length})
              </div>
              
              {watchedStocks.length === 0 ? (
                <div className="border border-dashed border-border bg-card/50 rounded-md p-8 text-center z-10 relative">
                  <div className="text-4xl text-primary/30 mb-3 font-mono">{'[  ]'}</div>
                  <p className="text-muted-foreground mb-2">No stocks in watchlist</p>
                  <p className="text-sm text-muted-foreground">
                    Use the terminal or quick add buttons to add stocks
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 z-10 relative">
                  {watchedStocks.map((symbol) => (
                    <StockCard
                      key={symbol}
                      symbol={symbol}
                      onRemove={handleRemoveStock}
                      onClick={handleSelectStock}
                      isSelected={selectedStock === symbol}
                      refreshInterval={refreshInterval}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Stock Detail */}
            {selectedStock && (
              <div className="z-10 relative">
                <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground mb-3">
                  <span className="text-primary">$</span>
                  Stock Details
                </div>
                <StockDetail symbol={selectedStock} refreshInterval={refreshInterval} />
              </div>
            )}

            {/* Help Panel */}
            <div className="border border-border bg-card/50 rounded-md p-4 z-10 relative">
              <div className="text-xs text-muted-foreground font-mono">
                <div className="text-primary mb-2">{'// Quick Reference'}</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1">
                  <div><span className="text-foreground">add AAPL</span> - Add stock</div>
                  <div><span className="text-foreground">remove AAPL</span> - Remove stock</div>
                  <div><span className="text-foreground">search apple</span> - Search stocks</div>
                  <div><span className="text-foreground">list</span> - Show watchlist</div>
                  <div><span className="text-foreground">portfolio</span> - View portfolio P&L</div>
                  <div><span className="text-foreground">portfolio add AAPL 10 150</span> - Add position</div>
                  <div><span className="text-foreground">fx</span> - Major exchange rates</div>
                  <div><span className="text-foreground">fx 100 USD EUR</span> - Convert currency</div>
                  <div><span className="text-foreground">fx add EURUSD</span> - Track FX pair</div>
                  <div><span className="text-foreground">news</span> - Market news</div>
                  <div><span className="text-foreground">news AAPL</span> - Stock news</div>
                  <div><span className="text-foreground">analyze AAPL</span> - Full analysis</div>
                  <div><span className="text-foreground">az AAPL</span> - Analysis (short)</div>
                  <div><span className="text-foreground">popular</span> - Popular stocks</div>
                  <div><span className="text-foreground">compare AAPL MSFT</span> - Compare two</div>
                  <div><span className="text-foreground">help</span> - All commands</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-4 mt-8 relative z-10">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-mono">
            <div className="flex items-center gap-2">
              <span className="text-primary">{'>'}_</span>
              <span>Symbiosis // Redefine the Limits</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="hidden sm:inline">Market data updates in real-time</span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                Connected
              </span>
              <SettingsDialog 
                currentTheme={theme} 
                onThemeChange={handleThemeChange}
                scanlineEnabled={scanlineEnabled}
                onScanlineChange={setScanlineEnabled}
              />
            </div>
          </div>
          <div className="mt-3 text-center text-xs text-muted-foreground font-mono space-y-0.5">
            <div>© ÆROforge 2026</div>
            <div>Licensed under GNU GPLv3</div>
          </div>
        </div>
      </footer>
    </div>
  )
}
