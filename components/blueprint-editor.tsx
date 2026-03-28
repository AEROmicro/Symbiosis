'use client'

import { useEffect, useMemo, useState } from 'react'
import GridLayout, { type Layout, type LayoutItem, useContainerWidth } from 'react-grid-layout'
import {
  Terminal, LayoutGrid, TrendingUp, Zap, Server, Newspaper,
  Briefcase, Clock, Globe, Activity, Map, Bitcoin, DollarSign,
  CalendarDays, HelpCircle, X, Plus, Search, RotateCcw, Save,
  LayoutDashboard,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import {
  type WidgetConfig,
  type WidgetMeta,
  WIDGET_CATALOG,
  DEFAULT_WIDGET_LAYOUT,
} from '@/lib/widget-types'

// ── Icon map ────────────────────────────────────────────────────────────────
const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Terminal, LayoutGrid, TrendingUp, Zap, Server, Newspaper,
  Briefcase, Clock, Globe, Activity, Map, Bitcoin, DollarSign,
  CalendarDays, HelpCircle,
}

// ── Helpers ─────────────────────────────────────────────────────────────────
function configsToLayout(configs: WidgetConfig[]): Layout {
  return configs.map(c => ({
    i: c.id,
    x: c.x,
    y: c.y,
    w: c.w,
    h: c.h,
    minW: c.minW,
    minH: c.minH,
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

// ── Category label component ─────────────────────────────────────────────────
function CategoryLabel({ label }: { label: string }) {
  return (
    <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold px-1 pt-2 pb-1 border-b border-border mb-1">
      {label}
    </div>
  )
}

// ── Catalog item in the sidebar ──────────────────────────────────────────────
function CatalogItem({
  meta,
  alreadyAdded,
  onAdd,
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

// ── BlueprintEditor ──────────────────────────────────────────────────────────
interface BlueprintEditorProps {
  open: boolean
  onClose: () => void
  layout: WidgetConfig[]
  onLayoutChange: (layout: WidgetConfig[]) => void
}

export function BlueprintEditor({ open, onClose, layout, onLayoutChange }: BlueprintEditorProps) {
  const [draft, setDraft] = useState<WidgetConfig[]>(layout)
  const [search, setSearch] = useState('')

  const { width: containerWidth, containerRef } = useContainerWidth({ initialWidth: 900 })

  // Re-sync draft when the editor opens
  useEffect(() => {
    if (open) setDraft(layout)
  }, [open, layout])

  const handleLayoutChange = (rglLayout: Layout) => {
    setDraft(prev => mergeLayout(prev, rglLayout))
  }

  const handleDelete = (id: string) => {
    setDraft(prev => prev.filter(c => c.id !== id))
  }

  const handleAdd = (meta: WidgetMeta) => {
    const id = nextId(meta.type, draft)
    const newWidget: WidgetConfig = {
      id,
      type: meta.type,
      x: 0,
      y: findMaxY(draft),
      w: meta.defaultW,
      h: meta.defaultH,
      minW: meta.minW,
      minH: meta.minH,
    }
    setDraft(prev => [...prev, newWidget])
  }

  const handleSave = () => {
    onLayoutChange(draft)
    onClose()
  }

  const handleReset = () => {
    setDraft(DEFAULT_WIDGET_LAYOUT)
  }

  const filteredCatalog = useMemo(() => {
    const q = search.toLowerCase()
    return WIDGET_CATALOG.filter(
      m => !q || m.name.toLowerCase().includes(q) || m.description.toLowerCase().includes(q),
    )
  }, [search])

  const typesInDraft = new Set(draft.map(c => c.type))

  const recommended = filteredCatalog.filter(m => m.category === 'recommended')
  const market      = filteredCatalog.filter(m => m.category === 'market')
  const tools       = filteredCatalog.filter(m => m.category === 'tools')
  const info        = filteredCatalog.filter(m => m.category === 'info')

  const rglLayout = configsToLayout(draft)

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="!top-0 !left-0 !translate-x-0 !translate-y-0 !max-w-none !rounded-none w-screen h-screen flex flex-col font-mono p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-4 py-3 border-b border-border shrink-0">
          <DialogTitle className="flex items-center gap-2 text-sm font-mono tracking-wider uppercase">
            <LayoutDashboard className="w-4 h-4 text-primary" />
            Blueprint
            <span className="text-muted-foreground font-normal text-xs tracking-normal ml-1">
              — drag to reposition · X to remove
            </span>
          </DialogTitle>
        </DialogHeader>

        {/* Body */}
        <div className="flex flex-1 min-h-0">
          {/* ── Grid area ────────────────────────────────────────────────── */}
          <div className="flex-1 min-w-0 overflow-y-auto overflow-x-200 bg-background/50 p-3">
            <div
              ref={containerRef}
              className="min-h-full relative"
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
                  margin: [8, 8],
                  containerPadding: [4, 4],
                }}
                dragConfig={{ enabled: true }}
                // Resizing disabled — widgets use exact fixed heights to eliminate internal scrolling
                resizeConfig={{ enabled: false }}
                onLayoutChange={handleLayoutChange}
                className="min-h-[600px]"
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
                      {/* Title bar */}
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

                      {/* Body placeholder */}
                      <div className="flex-1 flex items-center justify-center p-2 min-h-0">
                        <div className="text-center opacity-50 pointer-events-none">
                          <Icon className="w-6 h-6 mx-auto mb-1 text-foreground/50" />
                          <div className="text-[10px] text-foreground/50 font-mono">{meta?.name}</div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </GridLayout>
            </div>
          </div>

          {/* ── Right sidebar ─────────────────────────────────────────────── */}
          <div className="w-64 shrink-0 border-l border-border flex flex-col overflow-hidden">
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

            <div className="flex-1 overflow-y-auto px-2 py-1 space-y-0.5">
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
              {filteredCatalog.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-6">No widgets match &ldquo;{search}&rdquo;</p>
              )}
            </div>
          </div>
        </div>

        {/* ── Footer actions ─────────────────────────────────────────────── */}
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
            <Button variant="ghost" size="sm" className="text-xs font-mono" onClick={onClose}>
              Cancel
            </Button>
            <Button size="sm" className="text-xs font-mono gap-1.5" onClick={handleSave}>
              <Save className="w-3 h-3" />
              Save Layout
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
