'use client'

import { useState, useCallback, useEffect } from 'react'
import GridLayout, { type Layout, useContainerWidth } from 'react-grid-layout'
import { TerminalHeader } from '@/components/terminal-header'
import { MarketTicker } from '@/components/market-ticker'
import { SettingsDialog, type AppTheme, type ModernTheme } from '@/components/settings-dialog'
import { WidgetRenderer, type WidgetAppProps } from '@/components/widget-renderer'
import { BlueprintEditor } from '@/components/blueprint-editor'
import { MobileLayout } from '@/components/mobile-layout'
import { Terminal } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  type WidgetConfig,
  type DashboardPage,
  DEFAULT_WIDGET_LAYOUT,
  WIDGET_LAYOUT_KEY,
  PAGES_STORAGE_KEY,
  CURRENT_PAGE_KEY,
} from '@/lib/widget-types'

const STORAGE_KEY        = 'symbiosis-watchlist'        // legacy – migration only
const WATCHLISTS_KEY     = 'symbiosis-watchlists'
const ACTIVE_LIST_KEY    = 'symbiosis-active-list'
const THEME_KEY          = 'symbiosis-theme'
const EXCHANGE_KEY       = 'symbiosis-exchange'
const MODERN_ENABLED_KEY = 'symbiosis-modern-enabled'
const MODERN_THEME_KEY   = 'symbiosis-modern-theme'
const DEFAULT_LIST_NAME  = 'Watchlist'
const DEFAULT_STOCKS     = ['^IXIC', '^GSPC', '^DJI']

export default function SymbiosisApp() {
  const [watchlistSets, setWatchlistSets] = useState<Record<string, string[]>>({
    [DEFAULT_LIST_NAME]: DEFAULT_STOCKS,
  })
  const [activeListName, setActiveListName] = useState<string>(DEFAULT_LIST_NAME)
  const watchedStocks = watchlistSets[activeListName] ?? []
  const [selectedStock, setSelectedStock]   = useState<string | null>('^IXIC')
  const [marketState,   setMarketState]     = useState<string>('CLOSED')
  const [hydrated,      setHydrated]        = useState(false)
  const [scanlineEnabled, setScanlineEnabled] = useState(true)
  const [theme, setTheme]                   = useState<AppTheme>('default')
  const [defaultExchange, setDefaultExchange] = useState<string>('NYSE')
  const [modernEnabled, setModernEnabled]   = useState(false)
  const [modernTheme, setModernTheme]       = useState<ModernTheme>('dark')
  const DEFAULT_PAGES: DashboardPage[] = [
    { id: 'main', name: 'Main', layout: DEFAULT_WIDGET_LAYOUT }
  ]
  const [pages, setPages] = useState<DashboardPage[]>(DEFAULT_PAGES)
  const [currentPageId, setCurrentPageId] = useState<string>('main')
  const [blueprintOpen, setBlueprintOpen]   = useState(false)
  const [isMobile, setIsMobile]             = useState(false)
  const refreshInterval = 1000
  const { width: gridWidth, containerRef }  = useContainerWidth({ initialWidth: 1280 })

  const currentPage = pages.find(p => p.id === currentPageId) ?? pages[0]
  const widgetLayout = currentPage?.layout ?? DEFAULT_WIDGET_LAYOUT

  // Load from localStorage after mount
  useEffect(() => {
    try {
      // Multi-watchlist (new format)
      const storedWatchlists = localStorage.getItem(WATCHLISTS_KEY)
      if (storedWatchlists) {
        const parsed = JSON.parse(storedWatchlists)
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
          setWatchlistSets(parsed)
          const storedActive = localStorage.getItem(ACTIVE_LIST_KEY)
          const activeName = storedActive && parsed[storedActive] ? storedActive : Object.keys(parsed)[0] ?? DEFAULT_LIST_NAME
          setActiveListName(activeName)
          const firstStock = (parsed[activeName] ?? [])[0]
          if (firstStock) setSelectedStock(firstStock)
        }
      } else {
        // Migrate legacy flat watchlist
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored) {
          const parsed = JSON.parse(stored)
          if (Array.isArray(parsed) && parsed.length > 0) {
            setWatchlistSets({ [DEFAULT_LIST_NAME]: parsed })
            setSelectedStock(parsed[0])
          }
        }
      }
      const storedTheme = localStorage.getItem(THEME_KEY) as AppTheme | null
      if (storedTheme) setTheme(storedTheme)

      const storedExchange = localStorage.getItem(EXCHANGE_KEY)
      if (storedExchange) setDefaultExchange(storedExchange)

      const storedModernEnabled = localStorage.getItem(MODERN_ENABLED_KEY)
      if (storedModernEnabled === 'true') setModernEnabled(true)

      const storedModernTheme = localStorage.getItem(MODERN_THEME_KEY) as ModernTheme | null
      if (storedModernTheme) setModernTheme(storedModernTheme)

      const storedPages = localStorage.getItem(PAGES_STORAGE_KEY)
      if (storedPages) {
        const parsedPages = JSON.parse(storedPages)
        if (Array.isArray(parsedPages) && parsedPages.length > 0) {
          setPages(parsedPages)
        }
      } else {
        // migrate legacy single layout
        const storedLayout = localStorage.getItem(WIDGET_LAYOUT_KEY)
        if (storedLayout) {
          const parsedLayout = JSON.parse(storedLayout)
          if (Array.isArray(parsedLayout) && parsedLayout.length > 0) {
            setPages([{ id: 'main', name: 'Main', layout: parsedLayout }])
          }
        }
      }
      const storedCurrentPage = localStorage.getItem(CURRENT_PAGE_KEY)
      if (storedCurrentPage) {
        setCurrentPageId(storedCurrentPage)
      }
    } catch {
      // localStorage unavailable — fall back to defaults
    }
    setHydrated(true)
  }, [])

  // Mobile detection
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  // Apply theme + modern style
  useEffect(() => {
    const root = document.documentElement
    if (modernEnabled) {
      root.setAttribute('data-style', 'modern')
      root.setAttribute('data-modern-theme', modernTheme)
      root.removeAttribute('data-theme')
    } else {
      root.removeAttribute('data-style')
      root.removeAttribute('data-modern-theme')
      if (theme === 'default') {
        root.removeAttribute('data-theme')
      } else {
        root.setAttribute('data-theme', theme)
      }
    }
  }, [theme, modernEnabled, modernTheme])

  // Persist watchlists
  useEffect(() => {
    if (!hydrated) return
    try { localStorage.setItem(WATCHLISTS_KEY, JSON.stringify(watchlistSets)) } catch { /* ignore */ }
  }, [watchlistSets, hydrated])

  useEffect(() => {
    if (!hydrated) return
    try { localStorage.setItem(ACTIVE_LIST_KEY, activeListName) } catch { /* ignore */ }
  }, [activeListName, hydrated])

  // Persist pages
  useEffect(() => {
    if (!hydrated) return
    try { localStorage.setItem(PAGES_STORAGE_KEY, JSON.stringify(pages)) } catch { /* ignore */ }
  }, [pages, hydrated])

  useEffect(() => {
    if (!hydrated) return
    try { localStorage.setItem(CURRENT_PAGE_KEY, currentPageId) } catch { /* ignore */ }
  }, [currentPageId, hydrated])

  const handleThemeChange = useCallback((newTheme: AppTheme) => {
    setTheme(newTheme)
    try { localStorage.setItem(THEME_KEY, newTheme) } catch { /* ignore */ }
  }, [])

  const handleModernEnabledChange = useCallback((enabled: boolean) => {
    setModernEnabled(enabled)
    try { localStorage.setItem(MODERN_ENABLED_KEY, String(enabled)) } catch { /* ignore */ }
  }, [])

  const handleModernThemeChange = useCallback((t: ModernTheme) => {
    setModernTheme(t)
    try { localStorage.setItem(MODERN_THEME_KEY, t) } catch { /* ignore */ }
  }, [])

  const handleExchangeChange = useCallback((exchangeId: string) => {
    setDefaultExchange(exchangeId)
    try { localStorage.setItem(EXCHANGE_KEY, exchangeId) } catch { /* ignore */ }
  }, [])

  const handleAddStock = useCallback((symbol: string) => {
    setWatchlistSets(prev => {
      const list = prev[activeListName] ?? []
      if (list.includes(symbol)) return prev
      return { ...prev, [activeListName]: [...list, symbol] }
    })
  }, [activeListName])

  const handleRemoveStock = useCallback((symbol: string) => {
    setWatchlistSets(prev => ({
      ...prev,
      [activeListName]: (prev[activeListName] ?? []).filter(s => s !== symbol),
    }))
    if (selectedStock === symbol) setSelectedStock(null)
  }, [activeListName, selectedStock])

  const handleClearAll = useCallback(() => {
    setWatchlistSets(prev => ({ ...prev, [activeListName]: [] }))
    setSelectedStock(null)
  }, [activeListName])
  const handleSelectStock = useCallback((symbol: string) => { setSelectedStock(symbol) }, [])

  const handleSwitchList = useCallback((name: string) => {
    setActiveListName(name)
    setSelectedStock(null)
  }, [])

  const handleCreateList = useCallback((name: string) => {
    setWatchlistSets(prev => ({ ...prev, [name]: [] }))
    setActiveListName(name)
  }, [])

  const handleDeleteList = useCallback((name: string) => {
    setWatchlistSets(prev => {
      const next = { ...prev }
      delete next[name]
      return next
    })
    setActiveListName(prev => {
      if (prev !== name) return prev
      const remaining = Object.keys(watchlistSets).filter(n => n !== name)
      return remaining[0] ?? DEFAULT_LIST_NAME
    })
  }, [watchlistSets])

  const handleAddStockToList = useCallback((symbol: string, listName: string) => {
    setWatchlistSets(prev => {
      const list = prev[listName] ?? []
      if (list.includes(symbol)) return prev
      return { ...prev, [listName]: [...list, symbol] }
    })
  }, [])

  const handlePageLayoutChange = useCallback((layout: WidgetConfig[]) => {
    setPages(prev => prev.map(p => p.id === currentPageId ? { ...p, layout } : p))
  }, [currentPageId])

  const handleCreatePage = useCallback((name: string) => {
    const id = `page-${Date.now()}`
    const newPage: DashboardPage = { id, name, layout: DEFAULT_WIDGET_LAYOUT }
    setPages(prev => [...prev, newPage])
    setCurrentPageId(id)
  }, [])

  const handleDeletePage = useCallback((id: string) => {
    setPages(prev => {
      const next = prev.filter(p => p.id !== id)
      if (next.length === 0) return [{ id: 'main', name: 'Main', layout: DEFAULT_WIDGET_LAYOUT }]
      return next
    })
    setCurrentPageId(prev => prev === id ? (pages.find(p => p.id !== id)?.id ?? 'main') : prev)
  }, [pages])

  const handleRenamePage = useCallback((id: string, name: string) => {
    setPages(prev => prev.map(p => p.id === id ? { ...p, name } : p))
  }, [])

  const appProps: WidgetAppProps = {
    watchedStocks,
    selectedStock,
    onAddStock:    handleAddStock,
    onRemoveStock: handleRemoveStock,
    onClearAll:    handleClearAll,
    onSelectStock: handleSelectStock,
    marketState,
    refreshInterval,
    defaultExchange,
    watchlistSets,
    activeListName,
    onSwitchList:      handleSwitchList,
    onCreateList:      handleCreateList,
    onDeleteList:      handleDeleteList,
    onAddStockToList:  handleAddStockToList,
  }

  // RGL layout (static — not draggable by user on main screen)
  const rglLayout: Layout = widgetLayout.map(c => ({
    i: c.id, x: c.x, y: c.y, w: c.w, h: c.h, minW: c.minW, minH: c.minH,
  })) as Layout

  if (!hydrated) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center relative">
        <div className="scanline" />
        <div className="flex items-center gap-3 font-mono text-primary animate-pulse">
          <Terminal className="w-5 h-5" />
          <span className="tracking-widest text-sm">REDEFINE THE LIMITS</span>
          <span className="text-xs text-primary/50 tracking-widest">Symbiosis // v5.2 Magnetar Basalt</span>
        </div>
      </div>
    )
  }

  return (
    <div className={isMobile
      ? 'h-dvh bg-background flex flex-col overflow-hidden relative'
      : 'min-h-screen bg-background relative'
    }>
      {scanlineEnabled && <div className="scanline" />}

      {/* Background grid — desktop only */}
      {!isMobile && (
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
      )}

      {/* Header */}
      <TerminalHeader />

      {/* Market Ticker */}
      <MarketTicker onMarketStateChange={setMarketState} />

      {/* ── Mobile layout ─────────────────────────────────────── */}
      {isMobile ? (
        <MobileLayout
          appProps={appProps}
          theme={theme}
          onThemeChange={handleThemeChange}
          scanlineEnabled={scanlineEnabled}
          onScanlineChange={setScanlineEnabled}
          onOpenBlueprint={() => setBlueprintOpen(true)}
          defaultExchange={defaultExchange}
          onExchangeChange={handleExchangeChange}
          modernEnabled={modernEnabled}
          onModernEnabledChange={handleModernEnabledChange}
          modernTheme={modernTheme}
          onModernThemeChange={handleModernThemeChange}
        />
      ) : (
        <>
          {/* ── Desktop widget grid ──────────────────────────── */}
          <main className="container mx-auto px-4 py-6 max-w-7xl">
            <div ref={containerRef}>
              <GridLayout
                width={gridWidth}
                layout={rglLayout}
                gridConfig={{ cols: 12, rowHeight: 40, margin: [16, 16], containerPadding: [0, 0] }}
                dragConfig={{ enabled: false }}
                resizeConfig={{ enabled: false }}
              >
                {widgetLayout.map(config => (
                  <div key={config.id}>
                    <WidgetRenderer config={config} appProps={appProps} />
                  </div>
                ))}
              </GridLayout>
            </div>
          </main>

          {/* Footer */}
          <footer className="border-t border-border py-4 mt-8 relative z-10">
            <div className="container mx-auto px-4 max-w-7xl">
              <div className="grid grid-cols-3 items-center text-xs text-muted-foreground font-mono">
                {/* Left: branding */}
                <div className="flex items-center gap-2">
                  <span className="text-primary">{'>'}_</span>
                  <span>Symbiosis // Redefine the Limits</span>
                </div>

                {/* Center: page tabs */}
                <div className="flex items-center justify-center gap-1 overflow-x-auto">
                  {pages.map(page => (
                    <button
                      key={page.id}
                      onClick={() => setCurrentPageId(page.id)}
                      className={cn(
                        'px-3 py-0.5 text-[11px] font-mono rounded-sm border transition-colors shrink-0',
                        page.id === currentPageId
                          ? 'bg-primary border-primary text-primary-foreground'
                          : 'border-border text-muted-foreground hover:text-foreground hover:border-primary/50'
                      )}
                    >
                      {page.name}
                    </button>
                  ))}
                </div>

                {/* Right: status + settings */}
                <div className="flex items-center justify-end gap-4">
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
                    defaultExchange={defaultExchange}
                    onExchangeChange={handleExchangeChange}
                    modernEnabled={modernEnabled}
                    onModernEnabledChange={handleModernEnabledChange}
                    modernTheme={modernTheme}
                    onModernThemeChange={handleModernThemeChange}
                  />
                </div>
              </div>
              <div className="mt-3 text-center text-xs text-muted-foreground font-mono space-y-0.5">
                <div>© ÆROforge 2026</div>
                <div>Licensed under GNU GPLv3</div>
              </div>
            </div>
          </footer>
        </>
      )}

      {/* Blueprint Editor */}
      <BlueprintEditor
        open={blueprintOpen}
        onClose={() => setBlueprintOpen(false)}
        layout={widgetLayout}
        onLayoutChange={handlePageLayoutChange}
        pages={pages}
        currentPageId={currentPageId}
        onPageChange={setCurrentPageId}
        onCreatePage={handleCreatePage}
        onDeletePage={handleDeletePage}
        onRenamePage={handleRenamePage}
      />
    </div>
  )
}
