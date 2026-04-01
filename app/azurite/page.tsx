'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import GridLayout, { type Layout, type LayoutItem, useContainerWidth } from 'react-grid-layout'
import {
  Terminal, LayoutGrid, TrendingUp, Zap, Server, Newspaper,
  Briefcase, Clock, Globe, Activity, Map, Bitcoin, DollarSign,
  CalendarDays, HelpCircle, X, Plus, Search, RotateCcw, Save,
  LayoutDashboard, Landmark, Gem, Target, Coins, ArrowLeft, Check,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import {
  type WidgetConfig,
  type WidgetMeta,
  type DashboardPage,
  WIDGET_CATALOG,
  DEFAULT_WIDGET_LAYOUT,
  PAGES_STORAGE_KEY,
  CURRENT_PAGE_KEY,
} from '@/lib/widget-types'

// ── Icon map ────────────────────────────────────────────────────────────────
const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Terminal, LayoutGrid, TrendingUp, Zap, Server, Newspaper,
  Briefcase, Clock, Globe, Activity, Map, Bitcoin, DollarSign,
  CalendarDays, HelpCircle, Landmark, Gem, Target, Coins,
}

// ── Helpers ─────────────────────────────────────────────────────────────────
function configsToLayout(configs: WidgetConfig[]): Layout {
  return configs.map(c => ({
    i: c.id, x: c.x, y: c.y, w: c.w, h: c.h, minW: c.minW, minH: c.minH,
  })) as Layout
}

function mergeLayout(configs: WidgetConfig[], rglLayout: Layout): WidgetConfig[] {
  return configs.map(c => {
    const found = rglLayout.find((l: LayoutItem) => l.i === c.id)
    if (!found) return c
    return { ...c, x: found.x, y: found.y, w: found.w, h: found.h }
  })
}

function nextId(type: string, existing: WidgetConfig[]): string {
  const ids = existing.filter(c => c.type === type).map(c => {
    const n = parseInt(c.id.split('-').pop() ?? '0')
    return isNaN(n) ? 0 : n
  })
  const max = ids.length > 0 ? Math.max(...ids) : 0
  return `${type}-${max + 1}`
}

function findMaxY(configs: WidgetConfig[]): number {
  return configs.reduce((m, c) => Math.max(m, c.y + c.h), 0)
}

// ── Category label ───────────────────────────────────────────────────────────
function CategoryLabel({ label }: { label: string }) {
  return (
    <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold px-1 pt-2 pb-1 border-b border-border mb-1">
      {label}
    </div>
  )
}

// ── Catalog item ─────────────────────────────────────────────────────────────
function CatalogItem({
  meta, alreadyAdded, onAdd,
}: {
  meta: WidgetMeta
  alreadyAdded: boolean
  onAdd: () => void
}) {
  const Icon = ICON_MAP[meta.iconName] ?? Terminal
  return (
    <div className="flex items-start gap-2 p-2 rounded border border-border hover:border-primary/40 hover:bg-primary/5 transition-colors">
      <div className={cn('p-1.5 rounded shrink-0 mt-0.5', meta.color)}>
        <Icon className="w-3 h-3 text-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xs font-semibold text-foreground leading-tight">{meta.name}</div>
        <div className="text-[10px] text-muted-foreground mt-0.5 leading-snug line-clamp-2">{meta.description}</div>
      </div>
      <Button
        size="sm"
        variant={alreadyAdded ? 'ghost' : 'outline'}
        className="h-6 text-[10px] px-2 shrink-0 font-mono"
        onClick={onAdd}
      >
        {alreadyAdded ? (
          <span className="text-muted-foreground">Added</span>
        ) : (
          <><Plus className="w-2.5 h-2.5" /> Add</>
        )}
      </Button>
    </div>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function AzuritePage() {
  const router = useRouter()

  const [hydrated, setHydrated] = useState(false)
  const [pages, setPages] = useState<DashboardPage[]>([
    { id: 'main', name: 'Main', layout: DEFAULT_WIDGET_LAYOUT },
  ])
  const [currentPageId, setCurrentPageId] = useState<string>('main')
  const [draft, setDraft] = useState<WidgetConfig[]>(DEFAULT_WIDGET_LAYOUT)
  const [search, setSearch] = useState('')
  const [newPageName, setNewPageName] = useState('')
  const [addingPage, setAddingPage] = useState(false)
  const [saved, setSaved] = useState(false)

  const { width: containerWidth, containerRef } = useContainerWidth({ initialWidth: 900 })

  // ── Load from localStorage ────────────────────────────────────────────────
  useEffect(() => {
    try {
      const storedPages = localStorage.getItem(PAGES_STORAGE_KEY)
      if (storedPages) {
        const parsed: DashboardPage[] = JSON.parse(storedPages)
        if (Array.isArray(parsed) && parsed.length > 0) {
          setPages(parsed)
          const storedCurrent = localStorage.getItem(CURRENT_PAGE_KEY)
          const currentId =
            storedCurrent && parsed.find(p => p.id === storedCurrent)
              ? storedCurrent
              : parsed[0].id
          setCurrentPageId(currentId)
          setDraft(parsed.find(p => p.id === currentId)?.layout ?? DEFAULT_WIDGET_LAYOUT)
        }
      }
    } catch { /* ignore */ }
    setHydrated(true)
  }, [])

  // ── Keep draft in sync when switching pages ───────────────────────────────
  const switchPage = (id: string) => {
    // Persist current draft into pages before switching
    setPages(prev => prev.map(p => p.id === currentPageId ? { ...p, layout: draft } : p))
    const target = pages.find(p => p.id === id)
    if (target) setDraft(target.layout)
    setCurrentPageId(id)
  }

  // ── Draft mutations ───────────────────────────────────────────────────────
  const handleLayoutChange = (rglLayout: Layout) => {
    setDraft(prev => mergeLayout(prev, rglLayout))
  }

  const handleDelete = (id: string) => setDraft(prev => prev.filter(c => c.id !== id))

  const handleAdd = (meta: WidgetMeta) => {
    const id = nextId(meta.type, draft)
    const newWidget: WidgetConfig = {
      id, type: meta.type,
      x: 0, y: findMaxY(draft),
      w: meta.defaultW, h: meta.defaultH,
      minW: meta.minW, minH: meta.minH,
    }
    setDraft(prev => [...prev, newWidget])
  }

  const handleReset = () => setDraft(DEFAULT_WIDGET_LAYOUT)

  // ── Page management ───────────────────────────────────────────────────────
  const handleCreatePage = () => {
    const name = newPageName.trim()
    if (!name) return
    const id = `page-${Date.now()}`
    const newPage: DashboardPage = { id, name, layout: DEFAULT_WIDGET_LAYOUT }
    setPages(prev => prev.map(p => p.id === currentPageId ? { ...p, layout: draft } : p).concat(newPage))
    setCurrentPageId(id)
    setDraft(DEFAULT_WIDGET_LAYOUT)
    setNewPageName('')
    setAddingPage(false)
  }

  const handleDeletePage = (id: string) => {
    setPages(prev => {
      const next = prev.filter(p => p.id !== id)
      return next.length === 0
        ? [{ id: 'main', name: 'Main', layout: DEFAULT_WIDGET_LAYOUT }]
        : next
    })
    if (id === currentPageId) {
      const remaining = pages.filter(p => p.id !== id)
      const fallback = remaining[0]
      if (fallback) {
        setCurrentPageId(fallback.id)
        setDraft(fallback.layout)
      }
    }
  }

  // ── Save & navigate back ──────────────────────────────────────────────────
  const handleSave = () => {
    const updatedPages = pages.map(p =>
      p.id === currentPageId ? { ...p, layout: draft } : p
    )
    try {
      localStorage.setItem(PAGES_STORAGE_KEY, JSON.stringify(updatedPages))
      localStorage.setItem(CURRENT_PAGE_KEY, currentPageId)
    } catch { /* ignore */ }
    setSaved(true)
    setTimeout(() => router.push('/'), 600)
  }

  // ── Widget catalog filtering ──────────────────────────────────────────────
  const filteredCatalog = useMemo(() => {
    const q = search.toLowerCase()
    return WIDGET_CATALOG.filter(
      m => !q || m.name.toLowerCase().includes(q) || m.description.toLowerCase().includes(q),
    )
  }, [search])

  const typesInDraft = new Set(draft.map(c => c.type))
  const recommended  = filteredCatalog.filter(m => m.category === 'recommended')
  const market       = filteredCatalog.filter(m => m.category === 'market')
  const tools        = filteredCatalog.filter(m => m.category === 'tools')
  const info         = filteredCatalog.filter(m => m.category === 'info')
  const layoutWidgets = filteredCatalog.filter(m => m.category === 'layout')

  const rglLayout = configsToLayout(draft)

  if (!hydrated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center font-mono text-primary animate-pulse">
        <LayoutDashboard className="w-5 h-5 mr-2" />
        Loading Azurite…
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-mono flex flex-col">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50 shrink-0">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors text-sm"
            >
              <ArrowLeft className="size-4" />
              <span className="hidden sm:inline">Back</span>
            </Link>
            <div className="w-px h-5 bg-border" />
            <div className="flex items-center gap-2">
              <LayoutDashboard className="size-5 text-primary" />
              <span className="font-bold text-lg tracking-tight text-foreground">Azurite</span>
              <span className="hidden sm:inline text-xs text-muted-foreground px-2 py-0.5 bg-primary/10 border border-primary/20 rounded">
                Dashboard Editor
              </span>
            </div>
          </div>

          <div className="text-xs text-muted-foreground font-mono hidden md:block">
            Drag to reposition · X to remove
          </div>
        </div>
        <div className="h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
      </header>

      {/* ── Pages bar ──────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-1 px-4 py-2 border-b border-border bg-card/50 shrink-0 overflow-x-auto">
        <span className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider mr-2 shrink-0">Pages:</span>

        {pages.map(page => (
          <div key={page.id} className="flex items-center shrink-0">
            <button
              onClick={() => switchPage(page.id)}
              className={cn(
                'px-2 py-1 text-[11px] font-mono border transition-colors',
                pages.length > 1 ? 'rounded-l' : 'rounded',
                page.id === currentPageId
                  ? 'bg-primary border-primary text-primary-foreground'
                  : 'border-border text-muted-foreground hover:text-foreground hover:bg-primary/10',
              )}
            >
              {page.name}
            </button>
            {pages.length > 1 && (
              <button
                onClick={() => handleDeletePage(page.id)}
                className="px-1 py-1 text-[11px] font-mono border border-l-0 rounded-r hover:bg-destructive/20 hover:text-destructive transition-colors border-border"
                title={`Delete page "${page.name}"`}
              >
                <X className="w-2.5 h-2.5" />
              </button>
            )}
          </div>
        ))}

        {/* Inline new-page form */}
        {addingPage ? (
          <form
            className="flex items-center gap-1 ml-1 shrink-0"
            onSubmit={e => { e.preventDefault(); handleCreatePage() }}
          >
            <input
              autoFocus
              value={newPageName}
              onChange={e => setNewPageName(e.target.value)}
              onKeyDown={e => e.key === 'Escape' && setAddingPage(false)}
              placeholder="Page name…"
              maxLength={24}
              className="h-6 w-28 px-2 text-[11px] font-mono bg-background border border-primary/50 rounded focus:outline-none focus:ring-1 focus:ring-primary/50"
            />
            <button
              type="submit"
              disabled={!newPageName.trim()}
              className="h-6 px-1.5 text-[11px] font-mono border border-primary/50 rounded hover:bg-primary/10 transition-colors disabled:opacity-40"
            >
              <Check className="w-2.5 h-2.5" />
            </button>
            <button
              type="button"
              onClick={() => setAddingPage(false)}
              className="h-6 px-1.5 text-[11px] font-mono border border-border rounded hover:bg-muted transition-colors"
            >
              <X className="w-2.5 h-2.5" />
            </button>
          </form>
        ) : (
          <button
            onClick={() => setAddingPage(true)}
            className="px-2 py-1 text-[11px] font-mono border border-dashed border-border rounded text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors ml-1 shrink-0"
            title="New page"
          >
            <Plus className="w-2.5 h-2.5" />
          </button>
        )}
      </div>

      {/* ── Body ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-1 min-h-0 overflow-hidden">

        {/* Grid area */}
        <div className="flex-1 min-w-0 overflow-y-auto overflow-x-hidden bg-background/50">
          <div
            ref={containerRef}
            className="relative w-full p-3"
            style={{
              backgroundImage: `
                linear-gradient(var(--border) 1px, transparent 1px),
                linear-gradient(90deg, var(--border) 1px, transparent 1px)
              `,
              backgroundSize: '40px 40px',
            }}
          >
            <GridLayout
              width={containerWidth}
              layout={rglLayout}
              gridConfig={{
                cols: 12,
                rowHeight: 40,
                margin: [4, 4],
                containerPadding: [0, 0],
              }}
              dragConfig={{ enabled: true }}
              resizeConfig={{ enabled: false }}
              onLayoutChange={handleLayoutChange}
              className="min-h-0"
            >
              {draft.map(config => {
                const meta  = WIDGET_CATALOG.find(m => m.type === config.type)
                const Icon  = ICON_MAP[meta?.iconName ?? 'Terminal'] ?? Terminal
                const color = meta?.color ?? 'bg-primary/20'

                return (
                  <div
                    key={config.id}
                    className={cn(
                      'rounded border border-border/60 flex flex-col overflow-hidden select-none',
                      color,
                    )}
                  >
                    {config.type === 'spacer-sm' || config.type === 'spacer-md' || config.type === 'spacer-lg' ? (
                      <div className="flex items-center justify-between px-2 h-full bg-muted/20 border-dashed cursor-move">
                        <span className="text-[10px] text-muted-foreground font-mono opacity-60">{meta?.name}</span>
                        <button
                          className="w-4 h-4 rounded flex items-center justify-center hover:bg-destructive/20 hover:text-destructive transition-colors shrink-0"
                          onClick={(e) => { e.stopPropagation(); handleDelete(config.id) }}
                          title="Remove widget"
                        >
                          <X className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center justify-between px-2 py-1.5 bg-black/10 border-b border-border/40 cursor-move shrink-0">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <Icon className="w-3 h-3 text-foreground/70 shrink-0" />
                            <span className="text-xs font-semibold text-foreground/80 truncate">
                              {meta?.name ?? config.type}
                            </span>
                          </div>
                          <button
                            className="w-5 h-5 rounded flex items-center justify-center hover:bg-destructive/20 hover:text-destructive transition-colors shrink-0 ml-1"
                            onClick={(e) => { e.stopPropagation(); handleDelete(config.id) }}
                            title="Remove widget"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                        <div className="flex-1 flex items-center justify-center p-2 min-h-0">
                          <div className="text-center opacity-50 pointer-events-none">
                            <Icon className="w-6 h-6 mx-auto mb-1 text-foreground/50" />
                            <div className="text-[10px] text-foreground/50 font-mono">{meta?.name}</div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )
              })}
            </GridLayout>
          </div>
        </div>

        {/* Right sidebar — widget catalog */}
        <div className="w-80 xl:w-96 shrink-0 border-l border-border flex flex-col overflow-hidden">
          <div className="px-3 py-2 border-b border-border shrink-0">
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Add Widgets</div>
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground pointer-events-none" />
              <Input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search widgets…"
                className="h-7 text-xs font-mono pl-6"
              />
            </div>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto px-2 py-1 space-y-0.5">
            {recommended.length > 0 && (
              <>
                <CategoryLabel label="Recommended" />
                {recommended.map(m => (
                  <CatalogItem key={m.type} meta={m} alreadyAdded={typesInDraft.has(m.type)} onAdd={() => handleAdd(m)} />
                ))}
              </>
            )}
            {market.length > 0 && (
              <>
                <CategoryLabel label="Market" />
                {market.map(m => (
                  <CatalogItem key={m.type} meta={m} alreadyAdded={typesInDraft.has(m.type)} onAdd={() => handleAdd(m)} />
                ))}
              </>
            )}
            {tools.length > 0 && (
              <>
                <CategoryLabel label="Tools" />
                {tools.map(m => (
                  <CatalogItem key={m.type} meta={m} alreadyAdded={typesInDraft.has(m.type)} onAdd={() => handleAdd(m)} />
                ))}
              </>
            )}
            {info.length > 0 && (
              <>
                <CategoryLabel label="Info" />
                {info.map(m => (
                  <CatalogItem key={m.type} meta={m} alreadyAdded={typesInDraft.has(m.type)} onAdd={() => handleAdd(m)} />
                ))}
              </>
            )}
            {layoutWidgets.length > 0 && (
              <>
                <CategoryLabel label="Layout" />
                {layoutWidgets.map(m => (
                  <CatalogItem key={m.type} meta={m} alreadyAdded={false} onAdd={() => handleAdd(m)} />
                ))}
              </>
            )}
            {filteredCatalog.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-6">
                No widgets match &ldquo;{search}&rdquo;
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-border shrink-0 bg-card">
        <Button
          variant="outline"
          size="sm"
          className="text-xs font-mono gap-1.5"
          onClick={handleReset}
        >
          <RotateCcw className="w-3 h-3" />
          Reset to Default
        </Button>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" className="text-xs font-mono" asChild>
            <Link href="/">Cancel</Link>
          </Button>
          <Button
            size="sm"
            className="text-xs font-mono gap-1.5"
            onClick={handleSave}
            disabled={saved}
          >
            {saved ? (
              <><Check className="w-3 h-3" /> Saved!</>
            ) : (
              <><Save className="w-3 h-3" /> Save Layout</>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
