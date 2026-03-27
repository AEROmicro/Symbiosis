'use client'

import { useState } from 'react'
import { Settings, LayoutDashboard } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export type AppTheme = 'default' | 'red' | 'mutualism-light' | 'mutualism-dark'

interface SettingsDialogProps {
  currentTheme: AppTheme
  onThemeChange: (theme: AppTheme) => void
  scanlineEnabled: boolean
  onScanlineChange: (enabled: boolean) => void
  onOpenBlueprint?: () => void
}

const themes: {
  id: AppTheme
  name: string
  description: string
  preview: { bg: string; text: string; accent: string }
}[] = [
  {
    id: 'default',
    name: 'Matrix Green',
    description: 'Classic terminal green on dark',
    preview: { bg: '#0a120a', text: '#4ade80', accent: '#4ade80' },
  },
  {
    id: 'red',
    name: 'Red Terminal',
    description: 'Red accent on dark background',
    preview: { bg: '#120a0a', text: '#f87171', accent: '#f87171' },
  },
  {
    id: 'mutualism-light',
    name: 'Mutualism Light',
    description: 'White background, black text',
    preview: { bg: '#ffffff', text: '#111111', accent: '#111111' },
  },
  {
    id: 'mutualism-dark',
    name: 'Mutualism Dark',
    description: 'Black background, white text',
    preview: { bg: '#080808', text: '#eeeeee', accent: '#eeeeee' },
  },
]

export function SettingsDialog({ currentTheme, onThemeChange, onOpenBlueprint }: SettingsDialogProps) {
  const [open, setOpen] = useState(false)
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-muted-foreground hover:text-foreground"
          title="Settings"
        >
          <Settings className="w-3.5 h-3.5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md font-mono">
        <DialogHeader>
          <DialogTitle className="font-mono text-sm tracking-wider uppercase">
            {'>'}_&nbsp;Settings
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground mb-3">
              Color Theme
            </p>
            <div className="grid grid-cols-2 gap-3">
              {themes.map((theme) => {
                const isActive = currentTheme === theme.id
                return (
                  <button
                    key={theme.id}
                    onClick={() => onThemeChange(theme.id)}
                    className={cn(
                      'relative p-3 rounded-md border text-left transition-all',
                      isActive
                        ? 'border-primary ring-1 ring-primary bg-primary/5'
                        : 'border-border hover:border-primary/50 hover:bg-muted/30',
                    )}
                  >
                    {/* Preview swatch */}
                    <div
                      className="h-10 rounded mb-2 border border-white/10 flex items-center justify-center gap-1.5"
                      style={{ backgroundColor: theme.preview.bg }}
                    >
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: theme.preview.accent }}
                      />
                      <span
                        style={{
                          color: theme.preview.text,
                          fontSize: '9px',
                          fontFamily: 'monospace',
                        }}
                      >
                        {'>'}_
                      </span>
                    </div>
                    <div className="text-xs font-semibold leading-tight">{theme.name}</div>
                    <div className="text-xs text-muted-foreground mt-0.5 leading-tight">
                      {theme.description}
                    </div>
                    {isActive && (
                      <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary" />
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Blueprint button */}
          {onOpenBlueprint && (
            <div className="border-t border-border pt-4">
              <p className="text-xs uppercase tracking-wider text-muted-foreground mb-3">
                Layout
              </p>
              <Button
                variant="outline"
                className="w-full justify-start gap-2 font-mono text-sm"
                onClick={() => {
                  setOpen(false)
                  onOpenBlueprint()
                }}
              >
                <LayoutDashboard className="w-4 h-4 text-primary" />
                Customize Layout
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
