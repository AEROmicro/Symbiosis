'use client'

import { useCallback, useState } from 'react'
import { Newspaper, Search, ExternalLink, Loader2, ChevronDown, ChevronUp } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface NewsArticle {
  title: string
  publisher: string
  link: string
  publishedAt: string
}

export function NewsDialog() {
  const [open, setOpen] = useState(false)
  const [headlines, setHeadlines] = useState<NewsArticle[]>([])
  const [showMoreNews, setShowMoreNews] = useState(false)
  const [newsArticles, setNewsArticles] = useState<NewsArticle[]>([])
  const [newsLoading, setNewsLoading] = useState(false)
  const [searchSymbol, setSearchSymbol] = useState('')

  const fetchNews = useCallback(async (symbol?: string) => {
    setNewsLoading(true)
    try {
      const url = symbol
        ? `/api/news?symbol=${encodeURIComponent(symbol.toUpperCase())}`
        : '/api/news'
      const res = await fetch(url)
      if (!res.ok) {
        console.error(`News API error: ${res.status}`)
        return []
      }
      const data = await res.json()
      const articles: NewsArticle[] = data.articles ?? []
      return articles
    } catch {
      return []
    } finally {
      setNewsLoading(false)
    }
  }, [])

  const handleOpenChange = async (next: boolean) => {
    setOpen(next)
    if (next) {
      const articles = await fetchNews()
      setHeadlines(articles.slice(0, 3))
    } else {
      setShowMoreNews(false)
      setSearchSymbol('')
      setNewsArticles([])
      setHeadlines([])
    }
  }

  const handleMoreNewsClick = async () => {
    if (!showMoreNews) {
      const articles = await fetchNews()
      setNewsArticles(articles)
    }
    setShowMoreNews(v => !v)
  }

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    const sym = searchSymbol.trim() || undefined
    const articles = await fetchNews(sym)
    setNewsArticles(articles)
  }

  const formatDate = (iso: string) => {
    const date = new Date(iso)
    return date.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false })
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start text-xs font-mono"
        >
          <Newspaper className="w-3 h-3" />
          Market News
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl font-mono">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Newspaper className="w-4 h-4 text-primary" />
            Market News
          </DialogTitle>
          <DialogDescription>
            Latest market headlines and stock-specific news
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
            Latest Headlines
          </div>

          {newsLoading && headlines.length === 0 ? (
            <div className="flex items-center gap-2 text-xs text-muted-foreground py-2">
              <Loader2 className="w-3 h-3 animate-spin" />
              Loading headlines...
            </div>
          ) : headlines.length === 0 ? (
            <div className="text-xs text-muted-foreground">No headlines available.</div>
          ) : (
            <div className="space-y-2">
              {headlines.map((article) => (
                <a
                  key={article.link || article.title}
                  href={article.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-2 p-2 rounded-md border border-border bg-card hover:border-primary/40 hover:bg-primary/5 transition-colors group"
                >
                  <ExternalLink className="w-3 h-3 mt-0.5 shrink-0 text-muted-foreground group-hover:text-primary transition-colors" />
                  <div className="min-w-0">
                    <div className="text-xs text-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                      {article.title}
                    </div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">
                      {article.publisher} · {formatDate(article.publishedAt)}
                    </div>
                  </div>
                </a>
              ))}
            </div>
          )}

          <Button
            variant="outline"
            size="sm"
            className="w-full text-xs font-mono justify-between"
            onClick={handleMoreNewsClick}
            disabled={newsLoading && !showMoreNews}
          >
            <span className="flex items-center gap-2">
              <Newspaper className="w-3 h-3" />
              More News
            </span>
            {showMoreNews ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </Button>

          {showMoreNews && (
            <div className="space-y-3">
              <form onSubmit={handleSearch} className="flex gap-2">
                <Input
                  value={searchSymbol}
                  onChange={e => setSearchSymbol(e.target.value.toUpperCase())}
                  placeholder="Search symbol (e.g. AAPL)..."
                  className="h-7 text-xs font-mono"
                />
                <Button type="submit" size="sm" className="h-7 text-xs px-3" disabled={newsLoading}>
                  {newsLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Search className="w-3 h-3" />}
                </Button>
              </form>

              {newsLoading ? (
                <div className="flex items-center gap-2 text-xs text-muted-foreground py-2">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Loading news...
                </div>
              ) : newsArticles.length === 0 ? (
                <div className="text-xs text-muted-foreground py-2">No articles found.</div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {newsArticles.map((article) => (
                    <a
                      key={article.link || article.title}
                      href={article.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-start gap-2 p-2 rounded-md border border-border bg-card hover:border-primary/40 hover:bg-primary/5 transition-colors group"
                    >
                      <ExternalLink className="w-3 h-3 mt-0.5 shrink-0 text-muted-foreground group-hover:text-primary transition-colors" />
                      <div className="min-w-0">
                        <div className="text-xs text-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                          {article.title}
                        </div>
                        <div className="text-[10px] text-muted-foreground mt-0.5">
                          {article.publisher} · {formatDate(article.publishedAt)}
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
