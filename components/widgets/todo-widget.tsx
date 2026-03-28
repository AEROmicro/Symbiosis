'use client'

import { useEffect, useRef, useState } from 'react'
import { Plus, Trash2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const STORAGE_KEY = 'symbiosis-todo'

interface TodoItem {
  id: string
  text: string
  done: boolean
}

export function TodoWidget() {
  const [items, setItems] = useState<TodoItem[]>([])
  const [newText, setNewText] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) setItems(JSON.parse(stored))
    } catch { /* ignore */ }
  }, [])

  // Persist on change
  const save = (next: TodoItem[]) => {
    setItems(next)
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)) } catch { /* ignore */ }
  }

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault()
    const text = newText.trim()
    if (!text) return
    save([...items, { id: Date.now().toString(), text, done: false }])
    setNewText('')
    inputRef.current?.focus()
  }

  const handleToggle = (id: string) =>
    save(items.map(i => i.id === id ? { ...i, done: !i.done } : i))

  const handleDelete = (id: string) =>
    save(items.filter(i => i.id !== id))

  const handleClearDone = () =>
    save(items.filter(i => !i.done))

  const doneCount = items.filter(i => i.done).length

  return (
    <div className="flex flex-col h-full p-3 gap-2">
      {/* Add item */}
      <form onSubmit={handleAdd} className="flex gap-2 shrink-0">
        <Input
          ref={inputRef}
          value={newText}
          onChange={e => setNewText(e.target.value)}
          placeholder="Add a task…"
          className="h-7 text-xs font-mono flex-1"
        />
        <Button type="submit" size="sm" className="h-7 px-2 shrink-0" disabled={!newText.trim()}>
          <Plus className="w-3 h-3" />
        </Button>
      </form>

      {/* Items list */}
      <div className="flex-1 overflow-y-auto space-y-1 min-h-0">
        {items.length === 0 ? (
          <div className="flex items-center justify-center h-full text-xs text-muted-foreground font-mono">
            No tasks yet
          </div>
        ) : (
          items.map(item => (
            <div
              key={item.id}
              className="flex items-center gap-2 px-2 py-1.5 rounded border border-border hover:border-primary/30 transition-colors group"
            >
              <input
                type="checkbox"
                checked={item.done}
                onChange={() => handleToggle(item.id)}
                className="w-3 h-3 shrink-0 accent-primary cursor-pointer"
              />
              <span
                className={`flex-1 text-xs font-mono truncate cursor-pointer ${item.done ? 'line-through text-muted-foreground' : 'text-foreground'}`}
                onClick={() => handleToggle(item.id)}
              >
                {item.text}
              </span>
              <button
                onClick={() => handleDelete(item.id)}
                className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between shrink-0">
        <span className="text-[10px] font-mono text-muted-foreground">
          {doneCount}/{items.length} done
        </span>
        {doneCount > 0 && (
          <Button
            size="sm"
            variant="ghost"
            className="h-6 px-2 text-[10px] font-mono text-muted-foreground hover:text-destructive"
            onClick={handleClearDone}
          >
            <Trash2 className="w-3 h-3" />
            Clear done
          </Button>
        )}
      </div>
    </div>
  )
}
