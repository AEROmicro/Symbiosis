'use client'

import { Keyboard } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

export function KeyboardShortcuts() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start text-xs font-mono"
        >
          <Keyboard className="w-3 h-3" />
          Keyboard Shortcuts
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md font-mono">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="w-4 h-4 text-primary" />
            Keyboard Shortcuts
          </DialogTitle>
          <DialogDescription>
            Quick keys for efficient terminal navigation
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 text-sm">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Previous command</span>
              <kbd className="px-3 py-1.5 bg-muted rounded text-xs border border-border font-semibold">↑</kbd>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Next command</span>
              <kbd className="px-3 py-1.5 bg-muted rounded text-xs border border-border font-semibold">↓</kbd>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Autocomplete command</span>
              <kbd className="px-3 py-1.5 bg-muted rounded text-xs border border-border font-semibold">Tab</kbd>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Execute command</span>
              <kbd className="px-3 py-1.5 bg-muted rounded text-xs border border-border font-semibold">Enter</kbd>
            </div>
          </div>

          <div className="border-t border-border pt-4">
            <p className="text-xs text-muted-foreground">
              <span className="text-primary font-semibold">Pro Tip:</span> Use arrow keys to navigate through your command history and Tab to autocomplete command names.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
