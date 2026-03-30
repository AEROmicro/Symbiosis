'use client'

import { useState } from 'react'
import { Settings, LayoutDashboard, ChevronDown } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { EXCHANGES } from '@/lib/exchanges'

export type AppTheme = 'default' | 'red' | 'mutualism-light' | 'mutualism-dark'

interface SettingsDialogProps {
  currentTheme: AppTheme
  onThemeChange: (theme: AppTheme) => void
  scanlineEnabled: boolean
  onScanlineChange: (enabled: boolean) => void
  onOpenBlueprint?: () => void
  defaultExchange: string
  onExchangeChange: (exchangeId: string) => void
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

export function SettingsDialog({ currentTheme, onThemeChange, scanlineEnabled, onScanlineChange, onOpenBlueprint, defaultExchange, onExchangeChange }: SettingsDialogProps) {
  const [open, setOpen] = useState(false)
  const [exchangeOpen, setExchangeOpen] = useState(false)

  const selected = EXCHANGES.find(e => e.id === defaultExchange) ?? EXCHANGES[0]

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
      <DialogContent className="max-w-md font-mono max-h-[90vh] overflow-y-auto">
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

          {/* Default Exchange */}
          <div className="border-t border-border pt-4">
            <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
              Default Exchange
            </p>
            <p className="text-[10px] text-muted-foreground mb-3">
              Determines the market session shown in the System Status widget
            </p>
            <div className="relative">
              <button
                onClick={() => setExchangeOpen(prev => !prev)}
                className={cn(
                  'w-full flex items-center justify-between px-3 py-2.5 rounded-md border text-left transition-all text-sm',
                  exchangeOpen
                    ? 'border-primary/40 bg-primary/5'
                    : 'border-border hover:border-primary/30 hover:bg-muted/30',
                )}
              >
                <span className="flex items-center gap-2">
                  <span className="font-semibold text-xs">{selected.id}</span>
                  <span className="text-muted-foreground text-xs">{selected.name}</span>
                </span>
                <ChevronDown className={cn('w-4 h-4 text-muted-foreground transition-transform shrink-0', exchangeOpen && 'rotate-180')} />
              </button>

              {exchangeOpen && (
                <div className="absolute z-50 mt-1 w-full rounded-md border border-border bg-card shadow-lg max-h-56 overflow-y-auto">
                  {EXCHANGES.map((ex) => (
                    <button
                      key={ex.id}
                      onClick={() => { onExchangeChange(ex.id); setExchangeOpen(false) }}
                      className={cn(
                        'w-full flex items-center gap-2 px-3 py-2 text-xs text-left hover:bg-muted/40 transition-colors',
                        ex.id === defaultExchange && 'bg-primary/10 text-primary',
                      )}
                    >
                      <span className="shrink-0">{ex.flag}</span>
                      <span className="font-semibold w-16 shrink-0">{ex.id}</span>
                      <span className="text-muted-foreground truncate">{ex.name}</span>
                      <span className="ml-auto shrink-0 text-muted-foreground tabular-nums">{ex.hoursLabel}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* CRT Scanline toggle */}
          <div className="border-t border-border pt-4">
            <p className="text-xs uppercase tracking-wider text-muted-foreground mb-3">
              Display
            </p>
            <button
              onClick={() => onScanlineChange(!scanlineEnabled)}
              className={cn(
                'w-full flex items-center justify-between px-3 py-2.5 rounded-md border text-left transition-all text-sm',
                scanlineEnabled
                  ? 'border-primary/40 bg-primary/5'
                  : 'border-border hover:border-primary/30 hover:bg-muted/30',
              )}
            >
              <div>
                <div className="font-semibold text-xs">CRT Scanlines</div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  Retro scanline overlay effect
                </div>
              </div>
              <div
                className={cn(
                  'relative w-9 h-5 rounded-full border transition-colors shrink-0',
                  scanlineEnabled ? 'bg-primary border-primary' : 'bg-muted border-border',
                )}
              >
                <span
                  className={cn(
                    'absolute top-0.5 w-4 h-4 rounded-full bg-background transition-transform',
                    scanlineEnabled ? 'translate-x-4' : 'translate-x-0.5',
                  )}
                />
              </div>
            </button>
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
