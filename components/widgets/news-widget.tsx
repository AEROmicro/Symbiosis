'use client'

import { useCallback, useEffect, useState } from 'react'
import { ExternalLink, Loader2, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface NewsArticle {
  title: string
  publisher: string
  link: string
  publishedAt: string
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}

export function NewsWidget() {
  const [articles, setArticles] = useState<NewsArticle[]>([])
  const [loading, setLoading] = useState(false)
  const [symbol, setSymbol] = useState('')

  const fetchNews = useCallback(async (sym?: string) => {
    setLoading(true)
    try {
      const url = sym
        ? `/api/news?symbol=${encodeURIComponent(sym.toUpperCase())}`
        : '/api/news'
      const res = await fetch(url)
      if (!res.ok) return
      const data = await res.json()
      setArticles((data.articles ?? []).slice(0, 5))
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchNews() }, [fetchNews])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchNews(symbol.trim() || undefined)
  }

  return (
    <div className="p-4 flex flex-col gap-3 h-full overflow-hidden">
      <form onSubmit={handleSearch} className="flex gap-2 shrink-0">
        <Input
          value={symbol}
          onChange={e => setSymbol(e.target.value.toUpperCase())}
          placeholder="Symbol (e.g. AAPL)..."
          className="h-7 text-xs font-mono"
        />
        <Button type="submit" size="sm" className="h-7 text-xs px-3 shrink-0" disabled={loading}>
          {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Search className="w-3 h-3" />}
        </Button>
      </form>

      <div className="flex-1 overflow-y-auto space-y-2">
        {loading && articles.length === 0 ? (
          <div className="flex items-center gap-2 text-xs text-muted-foreground py-2">
            <Loader2 className="w-3 h-3 animate-spin" />
            Loading headlines…
          </div>
        ) : articles.length === 0 ? (
          <p className="text-xs text-muted-foreground">No articles found.</p>
        ) : (
          articles.map((a) => (
            <a
              key={a.link || a.title}
              href={a.link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-2 p-2 rounded border border-border bg-card hover:border-primary/40 hover:bg-primary/5 transition-colors group"
            >
              <ExternalLink className="w-3 h-3 mt-0.5 shrink-0 text-muted-foreground group-hover:text-primary transition-colors" />
              <div className="min-w-0">
                <div className="text-xs leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                  {a.title}
                </div>
                <div className="text-[10px] text-muted-foreground mt-0.5">
                  {a.publisher} · {formatDate(a.publishedAt)}
                </div>
              </div>
            </a>
          ))
        )}
      </div>
    </div>
  )
}
