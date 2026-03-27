'use client'

import { useState, useCallback, useEffect } from 'react'
import ReactGridLayout, { WidthProvider } from 'react-grid-layout'
import { TerminalHeader } from '@/components/terminal-header'
import { MarketTicker } from '@/components/market-ticker'
import { SettingsDialog, type AppTheme } from '@/components/settings-dialog'
import { WidgetRenderer, type WidgetAppProps } from '@/components/widget-renderer'
import { BlueprintEditor } from '@/components/blueprint-editor'
import { Terminal } from 'lucide-react'
import {
  WidgetConfig,
  DEFAULT_WIDGET_LAYOUT,
  WIDGET_LAYOUT_KEY,
} from '@/lib/widget-types'

const RGL = WidthProvider(ReactGridLayout)

const STORAGE_KEY = 'symbiosis-watchlist'
const THEME_KEY   = 'symbiosis-theme'
const DEFAULT_STOCKS = ['^IXIC', '^GSPC', '^DJI']

export default function SymbiosisApp() {
  const [watchedStocks, setWatchedStocks]   = useState<string[]>(DEFAULT_STOCKS)
  const [selectedStock, setSelectedStock]   = useState<string | null>('^IXIC')
  const [marketState,   setMarketState]     = useState<string>('CLOSED')
  const [hydrated,      setHydrated]        = useState(false)
  const [scanlineEnabled, setScanlineEnabled] = useState(true)
  const [theme, setTheme]                   = useState<AppTheme>('default')
  const [widgetLayout, setWidgetLayout]     = useState<WidgetConfig[]>(DEFAULT_WIDGET_LAYOUT)
  const [blueprintOpen, setBlueprintOpen]   = useState(false)
  const refreshInterval = 1000

  // Load from localStorage after mount
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

      const storedLayout = localStorage.getItem(WIDGET_LAYOUT_KEY)
      if (storedLayout) {
        const parsedLayout = JSON.parse(storedLayout)
        if (Array.isArray(parsedLayout) && parsedLayout.length > 0) {
          setWidgetLayout(parsedLayout)
        }
      }
    } catch {
      // localStorage unavailable — fall back to defaults
    }
    setHydrated(true)
  }, [])

  // Apply theme
  useEffect(() => {
    const root = document.documentElement
    if (theme === 'default') {
      root.removeAttribute('data-theme')
    } else {
      root.setAttribute('data-theme', theme)
    }
  }, [theme])

  // Persist watchlist
  useEffect(() => {
    if (!hydrated) return
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(watchedStocks)) } catch { /* ignore */ }
  }, [watchedStocks, hydrated])

  // Persist widget layout
  useEffect(() => {
    if (!hydrated) return
    try { localStorage.setItem(WIDGET_LAYOUT_KEY, JSON.stringify(widgetLayout)) } catch { /* ignore */ }
  }, [widgetLayout, hydrated])

  const handleThemeChange = useCallback((newTheme: AppTheme) => {
    setTheme(newTheme)
    try { localStorage.setItem(THEME_KEY, newTheme) } catch { /* ignore */ }
  }, [])

  const handleAddStock = useCallback((symbol: string) => {
    setWatchedStocks(prev => prev.includes(symbol) ? prev : [...prev, symbol])
  }, [])

  const handleRemoveStock = useCallback((symbol: string) => {
    setWatchedStocks(prev => prev.filter(s => s !== symbol))
    if (selectedStock === symbol) setSelectedStock(null)
  }, [selectedStock])

  const handleClearAll  = useCallback(() => { setWatchedStocks([]); setSelectedStock(null) }, [])
  const handleSelectStock = useCallback((symbol: string) => { setSelectedStock(symbol) }, [])

  const appProps: WidgetAppProps = {
    watchedStocks,
    selectedStock,
    onAddStock:    handleAddStock,
    onRemoveStock: handleRemoveStock,
    onClearAll:    handleClearAll,
    onSelectStock: handleSelectStock,
    marketState,
    refreshInterval,
  }

  // RGL layout (static — not draggable by user)
  const rglLayout = widgetLayout.map(c => ({
    i: c.id, x: c.x, y: c.y, w: c.w, h: c.h, minW: c.minW, minH: c.minH,
  }))

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
      {scanlineEnabled && <div className="scanline" />}

      {/* Background grid */}
      <div
        className="fixed inset-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(var(--primary) 1px, transparent 1px),
            linear-gradient(90deg, var(--primary) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }}
      />

      {/* Header */}
      <TerminalHeader marketState={marketState} />

      {/* Market Ticker */}
      <MarketTicker onMarketStateChange={setMarketState} />

      {/* Widget Grid */}
      <main className="container mx-auto px-4 py-6 max-w-7xl">
        <RGL
          layout={rglLayout}
          cols={12}
          rowHeight={40}
          isDraggable={false}
          isResizable={false}
          margin={[16, 16]}
          containerPadding={[0, 0]}
        >
          {widgetLayout.map(config => (
            <div key={config.id}>
              <WidgetRenderer config={config} appProps={appProps} />
            </div>
          ))}
        </RGL>
      </main>

      {/* Blueprint Editor */}
      <BlueprintEditor
        open={blueprintOpen}
        onClose={() => setBlueprintOpen(false)}
        layout={widgetLayout}
        onLayoutChange={setWidgetLayout}
      />

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
                onOpenBlueprint={() => setBlueprintOpen(true)}
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
