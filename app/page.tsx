'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import GridLayout, { type Layout, useContainerWidth } from 'react-grid-layout'
import { TerminalHeader } from '@/components/terminal-header'
import { MarketTicker } from '@/components/market-ticker'
import { SettingsDialog, type AppTheme, type ModernTheme } from '@/components/settings-dialog'
import { WidgetRenderer, type WidgetAppProps } from '@/components/widget-renderer'
import { BlueprintEditor } from '@/components/blueprint-editor'
import { MobileLayout } from '@/components/mobile-layout'
import { useAuth } from '@/hooks/use-auth'
import { Terminal, User, LogIn } from 'lucide-react'
import {
  type WidgetConfig,
  DEFAULT_WIDGET_LAYOUT,
  WIDGET_LAYOUT_KEY,
} from '@/lib/widget-types'

const STORAGE_KEY = 'symbiosis-watchlist'
const WATCHLIST_SETS_KEY = 'symbiosis-watchlist-sets'
const ACTIVE_LIST_KEY = 'symbiosis-active-list'
const THEME_KEY   = 'symbiosis-theme'
const EXCHANGE_KEY = 'symbiosis-exchange'
const MODERN_ENABLED_KEY = 'symbiosis-modern-enabled'
const MODERN_THEME_KEY   = 'symbiosis-modern-theme'
const DEFAULT_LIST_NAME = 'Watchlist'
const DEFAULT_STOCKS = ['^IXIC', '^GSPC', '^DJI']

export default function SymbiosisApp() {
  const [watchlistSets, setWatchlistSets] = useState<Record<string, string[]>>({ [DEFAULT_LIST_NAME]: DEFAULT_STOCKS })
  const [activeListName, setActiveListName] = useState(DEFAULT_LIST_NAME)
  const [selectedStock, setSelectedStock]   = useState<string | null>('^IXIC')
  const [marketState,   setMarketState]     = useState<string>('CLOSED')
  const [hydrated,      setHydrated]        = useState(false)
  const [scanlineEnabled, setScanlineEnabled] = useState(true)
  const [theme, setTheme]                   = useState<AppTheme>('default')
  const [defaultExchange, setDefaultExchange] = useState<string>('NYSE')
  const [modernEnabled, setModernEnabled]   = useState(false)
  const [modernTheme, setModernTheme]       = useState<ModernTheme>('dark')
  const [widgetLayout, setWidgetLayout]     = useState<WidgetConfig[]>(DEFAULT_WIDGET_LAYOUT)
  const [blueprintOpen, setBlueprintOpen]   = useState(false)
  const [authOpen, setAuthOpen]             = useState(false)
  const [isMobile, setIsMobile]             = useState(false)
  const refreshInterval = 1000
  const { width: gridWidth, containerRef }  = useContainerWidth({ initialWidth: 1280 })

  const { user, loading: authLoading, syncPreferences } = useAuth()
  const prevUserIdRef = useRef<string | null>(null)
  const syncDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Load from localStorage after mount
  useEffect(() => {
    try {
      // Try new multi-list format first; fall back to legacy single-list key
      const storedSets = localStorage.getItem(WATCHLIST_SETS_KEY)
      if (storedSets) {
        const parsed = JSON.parse(storedSets)
        if (parsed && typeof parsed === 'object') setWatchlistSets(parsed)
        const storedActive = localStorage.getItem(ACTIVE_LIST_KEY)
        if (storedActive && parsed[storedActive]) {
          setActiveListName(storedActive)
          setSelectedStock(parsed[storedActive][0] ?? null)
        } else {
          const first = Object.values(parsed as Record<string, string[]>)[0] ?? []
          setSelectedStock(first[0] ?? null)
        }
      } else {
        // Migrate from legacy single-list storage
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

  // Derived active stock list
  const watchedStocks = watchlistSets[activeListName] ?? []

  // Persist watchlist sets
  useEffect(() => {
    if (!hydrated) return
    try {
      localStorage.setItem(WATCHLIST_SETS_KEY, JSON.stringify(watchlistSets))
      localStorage.setItem(ACTIVE_LIST_KEY, activeListName)
    } catch { /* ignore */ }
  }, [watchlistSets, activeListName, hydrated])

  // Persist widget layout
  useEffect(() => {
    if (!hydrated) return
    try { localStorage.setItem(WIDGET_LAYOUT_KEY, JSON.stringify(widgetLayout)) } catch { /* ignore */ }
  }, [widgetLayout, hydrated])

  // When user logs in, load their server-side preferences
  useEffect(() => {
    if (!user || authLoading) return
    if (prevUserIdRef.current === user.id) return
    prevUserIdRef.current = user.id

    const prefs = user.preferences
    // Restore watchlist sets (with legacy fallback)
    if (prefs.watchlistSets && typeof prefs.watchlistSets === 'object' && Object.keys(prefs.watchlistSets).length > 0) {
      setWatchlistSets(prefs.watchlistSets as Record<string, string[]>)
      const active = prefs.activeListName ?? Object.keys(prefs.watchlistSets)[0] ?? DEFAULT_LIST_NAME
      setActiveListName(active)
      const firstStock = (prefs.watchlistSets as Record<string, string[]>)[active]?.[0] ?? null
      setSelectedStock(firstStock)
    } else if (prefs.watchlist?.length) {
      setWatchlistSets({ [DEFAULT_LIST_NAME]: prefs.watchlist })
      setSelectedStock(prefs.watchlist[0])
    }
    if (Array.isArray(prefs.widgetLayout) && prefs.widgetLayout.length > 0) {
      setWidgetLayout(prefs.widgetLayout as WidgetConfig[])
    }
    if (prefs.theme) setTheme(prefs.theme as AppTheme)
    if (prefs.exchange) setDefaultExchange(prefs.exchange)
    if (typeof prefs.modernEnabled === 'boolean') setModernEnabled(prefs.modernEnabled)
    if (prefs.modernTheme) setModernTheme(prefs.modernTheme as ModernTheme)
    if (typeof prefs.scanlineEnabled === 'boolean') setScanlineEnabled(prefs.scanlineEnabled)
  }, [user, authLoading])

  // When user logs out, reset prevUserIdRef
  useEffect(() => {
    if (!user && !authLoading) {
      prevUserIdRef.current = null
    }
  }, [user, authLoading])

  // Sync preferences to server when they change (debounced)
  useEffect(() => {
    if (!hydrated || !user) return
    if (syncDebounceRef.current) clearTimeout(syncDebounceRef.current)
    syncDebounceRef.current = setTimeout(() => {
      syncPreferences({
        watchlist: watchedStocks,
        watchlistSets,
        activeListName,
        widgetLayout,
        theme,
        exchange: defaultExchange,
        modernEnabled,
        modernTheme,
        scanlineEnabled,
      })
    }, 500)
    return () => { if (syncDebounceRef.current) clearTimeout(syncDebounceRef.current) }
  }, [watchlistSets, activeListName, widgetLayout, theme, defaultExchange, modernEnabled, modernTheme, scanlineEnabled, hydrated, user, syncPreferences, watchedStocks])

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

  // ── Watchlist handlers ──────────────────────────────────────────────────────
  const handleAddStock = useCallback((symbol: string) => {
    setWatchlistSets(prev => {
      const current = prev[activeListName] ?? []
      if (current.includes(symbol)) return prev
      return { ...prev, [activeListName]: [...current, symbol] }
    })
  }, [activeListName])

  const handleAddStockToList = useCallback((symbol: string, listName: string) => {
    setWatchlistSets(prev => {
      const current = prev[listName] ?? []
      if (current.includes(symbol)) return prev
      return { ...prev, [listName]: [...current, symbol] }
    })
  }, [])

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

  // ── Multi-list handlers (account only) ─────────────────────────────────────
  const handleSwitchList = useCallback((name: string) => {
    setActiveListName(name)
    const first = (watchlistSets[name] ?? [])[0] ?? null
    setSelectedStock(first)
  }, [watchlistSets])

  const handleCreateList = useCallback((name: string) => {
    setWatchlistSets(prev => ({ ...prev, [name]: [] }))
    setActiveListName(name)
  }, [])

  const handleDeleteList = useCallback((name: string) => {
    if (name === DEFAULT_LIST_NAME) return // can't delete the default
    setWatchlistSets(prev => {
      const next = { ...prev }
      delete next[name]
      return next
    })
    if (activeListName === name) {
      setActiveListName(DEFAULT_LIST_NAME)
      setSelectedStock((watchlistSets[DEFAULT_LIST_NAME] ?? [])[0] ?? null)
    }
  }, [activeListName, watchlistSets])

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
    // Multi-list
    isLoggedIn:        !!user,
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
      <TerminalHeader marketState={marketState} />

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
                    defaultExchange={defaultExchange}
                    onExchangeChange={handleExchangeChange}
                    modernEnabled={modernEnabled}
                    onModernEnabledChange={handleModernEnabledChange}
                    modernTheme={modernTheme}
                    onModernThemeChange={handleModernThemeChange}
                  />
                  <button
                    onClick={() => setAuthOpen(true)}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-sm border border-border hover:border-primary/50 hover:text-primary transition-colors text-xs font-mono"
                  >
                    {user ? (
                      <>
                        <User className="w-3 h-3" />
                        <span className="max-w-[100px] truncate">{user.displayName}</span>
                      </>
                    ) : (
                      <>
                        <LogIn className="w-3 h-3" />
                        Sign In
                      </>
                    )}
                  </button>
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
        onLayoutChange={setWidgetLayout}
      />

    </div>
  )
}
