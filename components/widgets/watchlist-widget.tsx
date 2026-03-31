'use client'

import { useState } from 'react'
import { Plus, ChevronDown, Check, Trash2, ListPlus } from 'lucide-react'
import { StockCard } from '@/components/stock-card'
import { cn } from '@/lib/utils'

interface WatchlistWidgetProps {
  watchedStocks: string[]
  selectedStock: string | null
  onRemoveStock: (symbol: string) => void
  onSelectStock: (symbol: string) => void
  refreshInterval?: number
  // Multi-list (account only)
  isLoggedIn?: boolean
  watchlistSets?: Record<string, string[]>
  activeListName?: string
  onSwitchList?: (name: string) => void
  onCreateList?: (name: string) => void
  onDeleteList?: (name: string) => void
}

export function WatchlistWidget({
  watchedStocks,
  selectedStock,
  onRemoveStock,
  onSelectStock,
  refreshInterval = 3000,
  isLoggedIn = false,
  watchlistSets = {},
  activeListName = 'Watchlist',
  onSwitchList,
  onCreateList,
  onDeleteList,
}: WatchlistWidgetProps) {
  const [showNewList, setShowNewList] = useState(false)
  const [newListName, setNewListName] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)

  const listNames = Object.keys(watchlistSets)
  const hasMultipleLists = isLoggedIn && listNames.length > 0

  const handleCreate = () => {
    const name = newListName.trim()
    if (!name || watchlistSets[name] !== undefined) return
    onCreateList?.(name)
    setNewListName('')
    setShowNewList(false)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Scrollable stock cards area */}
      <div className="flex-1 overflow-y-auto p-3 min-h-0">
        {watchedStocks.length === 0 ? (
          <div className="border border-dashed border-border bg-card/50 rounded-md p-8 text-center h-full flex flex-col items-center justify-center">
            <div className="text-4xl text-primary/30 mb-3 font-mono">{'[  ]'}</div>
            <p className="text-muted-foreground text-sm">No stocks in {activeListName}</p>
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

      {/* Fixed list-switcher bar — always at the bottom, never covers stock rows */}
      {hasMultipleLists && (
        <div className="shrink-0 border-t border-border bg-card/80 px-3 py-2">
          {showNewList ? (
            /* New list input */
            <div className="flex items-center gap-2">
              <input
                autoFocus
                className="flex-1 bg-transparent border border-border rounded px-2 py-1 text-xs font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
                placeholder="List name…"
                value={newListName}
                onChange={e => setNewListName(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') handleCreate()
                  if (e.key === 'Escape') { setShowNewList(false); setNewListName('') }
                }}
                maxLength={32}
              />
              <button
                onClick={handleCreate}
                disabled={!newListName.trim()}
                className="text-primary hover:text-primary/80 disabled:opacity-40 transition-colors"
                title="Create list"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => { setShowNewList(false); setNewListName('') }}
                className="text-muted-foreground hover:text-foreground transition-colors"
                title="Cancel"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
              {/* List tabs */}
              {listNames.map(name => (
                <div key={name} className="relative shrink-0 group">
                  <button
                    onClick={() => { onSwitchList?.(name); setMenuOpen(false) }}
                    className={cn(
                      'px-2.5 py-1 rounded text-[10px] font-mono font-semibold transition-colors border whitespace-nowrap',
                      name === activeListName
                        ? 'bg-primary/20 border-primary/40 text-primary'
                        : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted',
                    )}
                  >
                    {name}
                    {name === activeListName && (
                      <span className="ml-1 text-primary/60">({watchedStocks.length})</span>
                    )}
                  </button>
                  {/* Delete button — only show on non-active lists with no stocks, or active with hover */}
                  {listNames.length > 1 && name !== 'Watchlist' && (
                    <button
                      onClick={() => onDeleteList?.(name)}
                      className="absolute -top-1 -right-1 hidden group-hover:flex w-3.5 h-3.5 rounded-full bg-destructive/80 text-white items-center justify-center"
                      title={`Delete ${name}`}
                    >
                      <Trash2 className="w-2 h-2" />
                    </button>
                  )}
                </div>
              ))}

              {/* New list button */}
              <button
                onClick={() => setShowNewList(true)}
                className="shrink-0 ml-1 flex items-center gap-1 px-2 py-1 rounded text-[10px] font-mono text-muted-foreground hover:text-primary border border-transparent hover:border-primary/30 transition-colors"
                title="Create new watchlist"
              >
                <ListPlus className="w-3 h-3" />
                New
              </button>
            </div>
          )}
        </div>
      )}

      {/* Sign-in prompt — shown instead of list switcher when not logged in */}
      {!isLoggedIn && (
        <div className="shrink-0 border-t border-border px-3 py-1.5 flex items-center justify-center">
          <span className="text-[10px] font-mono text-muted-foreground">
            Sign in to create multiple watchlists
          </span>
        </div>
      )}
    </div>
  )
}
