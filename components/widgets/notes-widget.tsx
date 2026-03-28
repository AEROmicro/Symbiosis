'use client'

import { useEffect, useRef, useState } from 'react'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

const STORAGE_KEY = 'symbiosis-notes'

export function NotesWidget() {
  const [notes, setNotes] = useState('')
  const [saved, setSaved] = useState(true)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored !== null) setNotes(stored)
    } catch { /* ignore */ }
  }, [])

  const handleChange = (value: string) => {
    setNotes(value)
    setSaved(false)
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => {
      try { localStorage.setItem(STORAGE_KEY, value) } catch { /* ignore */ }
      setSaved(true)
    }, 800)
  }

  const handleClear = () => {
    setNotes('')
    try { localStorage.removeItem(STORAGE_KEY) } catch { /* ignore */ }
    setSaved(true)
  }

  return (
    <div className="flex flex-col h-full p-3 gap-2">
      <textarea
        className="flex-1 w-full resize-none bg-transparent border border-border rounded-md px-3 py-2 text-xs font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50 transition-colors"
        placeholder={'// notes, tickers, trade ideas...\n'}
        value={notes}
        onChange={(e) => handleChange(e.target.value)}
        spellCheck={false}
      />
      <div className="flex items-center justify-between shrink-0">
        <span className="text-[10px] font-mono text-muted-foreground">
          {saved ? '● saved' : '○ saving…'}
        </span>
        <Button
          size="sm"
          variant="ghost"
          className="h-6 px-2 text-[10px] font-mono text-muted-foreground hover:text-destructive"
          onClick={handleClear}
          disabled={!notes}
        >
          <Trash2 className="w-3 h-3" />
          Clear
        </Button>
      </div>
    </div>
  )
}
