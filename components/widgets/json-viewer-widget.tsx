'use client'

import { useState, useCallback } from 'react'
import { Search, Copy, Check, ChevronRight, ChevronDown, X, Upload } from 'lucide-react'
import { cn } from '@/lib/utils'

type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue }

const SAMPLE_ENDPOINTS = [
  { label: 'AAPL Quote', url: '/api/stock?symbol=AAPL' },
  { label: 'MSFT Quote', url: '/api/stock?symbol=MSFT' },
  { label: 'Market News', url: '/api/news' },
  { label: 'BTC-USD', url: '/api/stock?symbol=BTC-USD' },
]

function getType(val: JsonValue): string {
  if (val === null) return 'null'
  if (Array.isArray(val)) return 'array'
  return typeof val
}

function getColor(type: string): string {
  switch (type) {
    case 'string': return 'text-green-400'
    case 'number': return 'text-blue-400'
    case 'boolean': return 'text-yellow-400'
    case 'null': return 'text-red-400/80'
    default: return 'text-foreground'
  }
}

function JsonNode({
  value,
  depth = 0,
  query,
}: {
  value: JsonValue
  depth?: number
  query: string
}) {
  const [open, setOpen] = useState(depth < 2)
  const type = getType(value)
  const indent = depth * 12

  if (type === 'object' && value !== null && !Array.isArray(value)) {
    const keys = Object.keys(value as Record<string, JsonValue>)
    const isFiltered = query && !JSON.stringify(value).toLowerCase().includes(query.toLowerCase())
    if (isFiltered) return null
    return (
      <div style={{ marginLeft: indent }}>
        <button
          onClick={() => setOpen(p => !p)}
          className="flex items-center gap-0.5 text-muted-foreground hover:text-foreground transition-colors"
        >
          {open ? <ChevronDown className="w-2.5 h-2.5" /> : <ChevronRight className="w-2.5 h-2.5" />}
          <span className="text-foreground/50">{open ? '{' : `{ ${keys.length} keys }`}</span>
        </button>
        {open && (
          <div>
            {keys.map(k => (
              <div key={k} className="flex items-start gap-1">
                <span className={cn(
                  'text-purple-400/80 shrink-0',
                  query && k.toLowerCase().includes(query.toLowerCase()) ? 'bg-primary/20' : '',
                )}>
                  &quot;{k}&quot;
                </span>
                <span className="text-muted-foreground shrink-0">:</span>
                <JsonNode
                  value={(value as Record<string, JsonValue>)[k]}
                  depth={0}
                  query={query}
                />
              </div>
            ))}
            <span className="text-foreground/50">{'}'}</span>
          </div>
        )}
      </div>
    )
  }

  if (type === 'array') {
    const arr = value as JsonValue[]
    const isFiltered = query && !JSON.stringify(value).toLowerCase().includes(query.toLowerCase())
    if (isFiltered) return null
    return (
      <div style={{ marginLeft: indent }}>
        <button
          onClick={() => setOpen(p => !p)}
          className="flex items-center gap-0.5 text-muted-foreground hover:text-foreground transition-colors"
        >
          {open ? <ChevronDown className="w-2.5 h-2.5" /> : <ChevronRight className="w-2.5 h-2.5" />}
          <span className="text-foreground/50">{open ? '[' : `[ ${arr.length} items ]`}</span>
        </button>
        {open && (
          <div>
            {arr.map((item, i) => (
              <div key={i} className="flex items-start gap-1">
                <span className="text-muted-foreground/50 shrink-0 text-[9px] w-4 text-right">{i}</span>
                <JsonNode value={item} depth={0} query={query} />
              </div>
            ))}
            <span className="text-foreground/50">]</span>
          </div>
        )}
      </div>
    )
  }

  // Primitive
  const colorClass = getColor(type)
  const display = type === 'string' ? `"${value}"` : String(value)
  const isFiltered = query && !display.toLowerCase().includes(query.toLowerCase())
  if (isFiltered) return null

  return (
    <span className={cn(colorClass, query && display.toLowerCase().includes(query.toLowerCase()) ? 'bg-primary/20 rounded px-0.5' : '')}>
      {display}
    </span>
  )
}

export function JsonViewerWidget() {
  const [raw, setRaw] = useState('')
  const [parsed, setParsed] = useState<JsonValue | null>(null)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'tree' | 'raw'>('tree')
  const [url, setUrl] = useState('')

  const parse = useCallback((text: string) => {
    setRaw(text)
    if (!text.trim()) { setParsed(null); setError(''); return }
    try {
      setParsed(JSON.parse(text))
      setError('')
    } catch (e) {
      setParsed(null)
      setError((e as Error).message)
    }
  }, [])

  const fetchUrl = useCallback(async (endpoint: string) => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(endpoint)
      const text = await res.text()
      // Pretty-print
      try {
        const json = JSON.parse(text)
        const pretty = JSON.stringify(json, null, 2)
        parse(pretty)
      } catch {
        parse(text)
      }
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }, [parse])

  const copy = () => {
    navigator.clipboard.writeText(raw)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const prettyPrint = () => {
    if (parsed) parse(JSON.stringify(parsed, null, 2))
  }

  const minify = () => {
    if (parsed) parse(JSON.stringify(parsed))
  }

  const lineCount = raw.split('\n').length
  const charCount = raw.length

  return (
    <div className="flex flex-col h-full font-mono text-xs">
      {/* Quick fetch bar */}
      <div className="flex-none border-b border-border p-2 space-y-1.5">
        <div className="flex gap-1">
          <input
            value={url}
            onChange={e => setUrl(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && fetchUrl(url)}
            placeholder="Enter URL or paste JSON below…"
            className="flex-1 px-2 py-1 bg-muted/30 border border-border rounded text-[10px] font-mono focus:outline-none focus:ring-1 focus:ring-primary/50 placeholder:text-muted-foreground"
          />
          <button
            onClick={() => fetchUrl(url)}
            disabled={loading || !url}
            className="px-2 py-1 bg-primary/20 border border-primary/30 rounded text-primary hover:bg-primary/30 disabled:opacity-40 transition-colors text-[10px]"
          >
            {loading ? '…' : 'GET'}
          </button>
        </div>
        {/* Quick endpoints */}
        <div className="flex gap-1 flex-wrap">
          {SAMPLE_ENDPOINTS.map(ep => (
            <button
              key={ep.url}
              onClick={() => { setUrl(ep.url); fetchUrl(ep.url) }}
              className="px-1.5 py-0.5 rounded border border-border text-[9px] text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors"
            >
              {ep.label}
            </button>
          ))}
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-1 px-2 py-1 border-b border-border shrink-0">
        <div className="flex gap-0 border border-border rounded overflow-hidden">
          {(['tree', 'raw'] as const).map(t => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={cn(
                'px-2 py-0.5 text-[9px] uppercase tracking-wider transition-colors',
                activeTab === t ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="relative flex-1 max-w-32">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-2.5 h-2.5 text-muted-foreground pointer-events-none" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Filter…"
            className="w-full pl-5 pr-1 py-0.5 bg-muted/20 border border-border rounded text-[10px] font-mono focus:outline-none focus:ring-1 focus:ring-primary/50 placeholder:text-muted-foreground"
          />
          {query && (
            <button onClick={() => setQuery('')} className="absolute right-1 top-1/2 -translate-y-1/2">
              <X className="w-2.5 h-2.5 text-muted-foreground" />
            </button>
          )}
        </div>
        <button onClick={prettyPrint} className="px-1.5 py-0.5 text-[9px] text-muted-foreground hover:text-foreground border border-border rounded transition-colors">
          Pretty
        </button>
        <button onClick={minify} className="px-1.5 py-0.5 text-[9px] text-muted-foreground hover:text-foreground border border-border rounded transition-colors">
          Minify
        </button>
        <button onClick={copy} className="px-1.5 py-0.5 text-[9px] text-muted-foreground hover:text-primary border border-border rounded transition-colors flex items-center gap-0.5">
          {copied ? <Check className="w-2.5 h-2.5 text-primary" /> : <Copy className="w-2.5 h-2.5" />}
        </button>
      </div>

      {/* Content area */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {error && (
          <div className="px-3 py-1.5 bg-destructive/10 border-b border-destructive/20 text-destructive text-[10px]">
            ⚠ {error}
          </div>
        )}
        {activeTab === 'raw' ? (
          <textarea
            value={raw}
            onChange={e => parse(e.target.value)}
            placeholder={'Paste JSON here…\n\n{\n  "example": true\n}'}
            spellCheck={false}
            className="flex-1 w-full p-3 bg-transparent text-[10px] font-mono text-foreground placeholder:text-muted-foreground/40 resize-none focus:outline-none leading-relaxed"
          />
        ) : (
          <div className="flex-1 overflow-y-auto p-3 text-[10px] leading-relaxed">
            {parsed !== null ? (
              <JsonNode value={parsed} depth={0} query={query} />
            ) : raw ? null : (
              <div className="text-muted-foreground/40 space-y-1">
                <div>{'// Paste JSON or fetch a URL above'}</div>
                <div>{'// Supports objects, arrays, and all primitives'}</div>
                <div>{'// Use the filter box to search keys and values'}</div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Status bar */}
      <div className="flex-none px-3 py-1 border-t border-border text-[9px] text-muted-foreground flex gap-3">
        <span>Lines: {lineCount}</span>
        <span>Chars: {charCount.toLocaleString()}</span>
        {parsed !== null && <span className="text-primary">✓ Valid JSON</span>}
        {error && <span className="text-destructive">✗ Invalid</span>}
        <span className="ml-auto flex items-center gap-1">
          <Upload className="w-2.5 h-2.5" />
          SYMBIOSIS // JSON VIEWER
        </span>
      </div>
    </div>
  )
}
