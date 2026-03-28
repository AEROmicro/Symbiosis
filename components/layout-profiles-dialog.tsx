'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Layers,
  Plus,
  Trash2,
  Check,
  Save,
  Copy,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { WidgetConfig } from '@/lib/widget-types'
import { DEFAULT_WIDGET_LAYOUT } from '@/lib/widget-types'

export const PROFILES_STORAGE_KEY = 'symbiosis-layout-profiles'
export const ACTIVE_PROFILE_KEY   = 'symbiosis-active-profile'

export interface LayoutProfile {
  id: string
  name: string
  layout: WidgetConfig[]
  createdAt: string
  updatedAt: string
}

function generateId() {
  return Math.random().toString(36).slice(2, 10)
}

interface LayoutProfilesDialogProps {
  currentLayout: WidgetConfig[]
  onLoadProfile: (layout: WidgetConfig[]) => void
  onSaveCurrentAs?: (name: string) => void
}

export function LayoutProfilesDialog({
  currentLayout,
  onLoadProfile,
}: LayoutProfilesDialogProps) {
  const [open, setOpen] = useState(false)
  const [profiles, setProfiles] = useState<LayoutProfile[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [newName, setNewName] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')

  // Load profiles from localStorage
  useEffect(() => {
    if (!open) return
    try {
      const stored = localStorage.getItem(PROFILES_STORAGE_KEY)
      if (stored) setProfiles(JSON.parse(stored))
      const active = localStorage.getItem(ACTIVE_PROFILE_KEY)
      if (active) setActiveId(active)
    } catch { /* ignore */ }
  }, [open])

  const persist = (next: LayoutProfile[]) => {
    setProfiles(next)
    try { localStorage.setItem(PROFILES_STORAGE_KEY, JSON.stringify(next)) } catch { /* ignore */ }
  }

  const handleSaveNew = (e: React.FormEvent) => {
    e.preventDefault()
    const name = newName.trim()
    if (!name) return
    const now = new Date().toISOString()
    const profile: LayoutProfile = {
      id: generateId(),
      name,
      layout: currentLayout,
      createdAt: now,
      updatedAt: now,
    }
    persist([...profiles, profile])
    setNewName('')
  }

  const handleUpdateCurrent = (id: string) => {
    const now = new Date().toISOString()
    persist(profiles.map(p =>
      p.id === id ? { ...p, layout: currentLayout, updatedAt: now } : p
    ))
  }

  const handleDelete = (id: string) => {
    persist(profiles.filter(p => p.id !== id))
    if (activeId === id) {
      setActiveId(null)
      try { localStorage.removeItem(ACTIVE_PROFILE_KEY) } catch { /* ignore */ }
    }
  }

  const handleLoad = (profile: LayoutProfile) => {
    onLoadProfile(profile.layout)
    setActiveId(profile.id)
    try { localStorage.setItem(ACTIVE_PROFILE_KEY, profile.id) } catch { /* ignore */ }
    setOpen(false)
  }

  const handleDuplicate = (profile: LayoutProfile) => {
    const now = new Date().toISOString()
    const copy: LayoutProfile = {
      ...profile,
      id: generateId(),
      name: `${profile.name} (copy)`,
      createdAt: now,
      updatedAt: now,
    }
    persist([...profiles, copy])
  }

  const handleLoadDefault = () => {
    onLoadProfile(DEFAULT_WIDGET_LAYOUT)
    setActiveId(null)
    try { localStorage.removeItem(ACTIVE_PROFILE_KEY) } catch { /* ignore */ }
    setOpen(false)
  }

  const handleRenameSubmit = (id: string) => {
    const name = editingName.trim()
    if (!name) { setEditingId(null); return }
    persist(profiles.map(p => p.id === id ? { ...p, name } : p))
    setEditingId(null)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start text-xs font-mono"
        >
          <Layers className="w-3 h-3" />
          Layouts
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md font-mono">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-sm">
            <Layers className="w-4 h-4 text-primary" />
            Layout Profiles
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Save current layout */}
          <div className="space-y-2">
            <div className="text-xs text-muted-foreground uppercase tracking-wider">
              Save Current Layout
            </div>
            <form onSubmit={handleSaveNew} className="flex gap-2">
              <Input
                value={newName}
                onChange={e => setNewName(e.target.value)}
                placeholder="Profile name…"
                className="h-7 text-xs font-mono flex-1"
              />
              <Button type="submit" size="sm" className="h-7 px-3 shrink-0" disabled={!newName.trim()}>
                <Save className="w-3 h-3" />
                Save
              </Button>
            </form>
          </div>

          {/* Saved profiles */}
          <div className="space-y-2">
            <div className="text-xs text-muted-foreground uppercase tracking-wider">
              Saved Profiles ({profiles.length})
            </div>

            {/* Default layout */}
            <div className="flex items-center gap-2 p-2 rounded border border-border bg-card/50">
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium text-foreground truncate flex items-center gap-1.5">
                  Default Layout
                  {activeId === null && (
                    <span className="text-[10px] text-primary border border-primary/30 rounded px-1">active</span>
                  )}
                </div>
                <div className="text-[10px] text-muted-foreground">Built-in default dashboard</div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-[10px] font-mono shrink-0"
                onClick={handleLoadDefault}
              >
                <Check className="w-3 h-3" />
                Load
              </Button>
            </div>

            {profiles.length === 0 ? (
              <div className="text-xs text-muted-foreground text-center py-4 border border-dashed border-border rounded">
                No saved profiles yet. Save your current layout above.
              </div>
            ) : (
              profiles.map(profile => (
                <div
                  key={profile.id}
                  className={cn(
                    'flex items-center gap-2 p-2 rounded border transition-colors',
                    activeId === profile.id
                      ? 'border-primary/40 bg-primary/5'
                      : 'border-border bg-card/50',
                  )}
                >
                  <div className="flex-1 min-w-0">
                    {editingId === profile.id ? (
                      <input
                        autoFocus
                        className="w-full bg-background border border-border rounded px-1.5 py-0.5 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-primary/50"
                        value={editingName}
                        onChange={e => setEditingName(e.target.value)}
                        onBlur={() => handleRenameSubmit(profile.id)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') handleRenameSubmit(profile.id)
                          if (e.key === 'Escape') setEditingId(null)
                        }}
                      />
                    ) : (
                      <div
                        className="text-xs font-medium text-foreground truncate flex items-center gap-1.5 cursor-pointer hover:text-primary transition-colors"
                        onClick={() => { setEditingId(profile.id); setEditingName(profile.name) }}
                        title="Click to rename"
                      >
                        {profile.name}
                        {activeId === profile.id && (
                          <span className="text-[10px] text-primary border border-primary/30 rounded px-1">active</span>
                        )}
                      </div>
                    )}
                    <div className="text-[10px] text-muted-foreground">
                      {profile.layout.length} widget{profile.layout.length !== 1 ? 's' : ''} ·{' '}
                      {new Date(profile.updatedAt).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-1.5 text-[10px] text-muted-foreground hover:text-primary"
                      onClick={() => handleUpdateCurrent(profile.id)}
                      title="Overwrite with current layout"
                    >
                      <Save className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-1.5 text-[10px] text-muted-foreground hover:text-primary"
                      onClick={() => handleDuplicate(profile)}
                      title="Duplicate"
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-[10px] font-mono text-foreground hover:text-primary"
                      onClick={() => handleLoad(profile)}
                    >
                      <Check className="w-3 h-3" />
                      Load
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-1.5 text-[10px] text-muted-foreground hover:text-destructive"
                      onClick={() => handleDelete(profile.id)}
                      title="Delete"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>

          <p className="text-[10px] text-muted-foreground border-t border-border pt-3">
            Tip: Click a profile name to rename it. Use{' '}
            <span className="text-primary">Blueprint Editor</span> to edit the active layout.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
