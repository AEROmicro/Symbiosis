'use client'

import { useCallback, useEffect, useState } from 'react'
import { Clock, Globe, Newspaper, Search, ExternalLink, ChevronDown, ChevronUp, Loader2 } from 'lucide-react'
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
import { cn } from '@/lib/utils'

interface MarketHours {
  name: string
  timezone: string
  open: string
  close: string
  isOpen: boolean
}

interface NewsArticle {
  title: string
  publisher: string
  link: string
  publishedAt: string
}

function isMarketOpen(openHour: number, openMinute: number, closeHour: number, closeMinute: number, timezone: string): boolean {
  const now = new Date()
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    hour: 'numeric',
    minute: 'numeric',
    hour12: false,
    weekday: 'short'
  })

  const parts = formatter.formatToParts(now)
  const hour = parseInt(parts.find(p => p.type === 'hour')?.value || '0')
  const minute = parseInt(parts.find(p => p.type === 'minute')?.value || '0')
  const weekday = parts.find(p => p.type === 'weekday')?.value

  // Check if it's a weekend
  if (weekday === 'Sat' || weekday === 'Sun') {
    return false
  }

  const currentMinutes = hour * 60 + minute
  const openMinutes = openHour * 60 + openMinute
  const closeMinutes = closeHour * 60 + closeMinute

  return currentMinutes >= openMinutes && currentMinutes < closeMinutes
}

export function MarketHoursDialog() {
  const [open, setOpen] = useState(false)
  const [markets, setMarkets] = useState<MarketHours[]>([])
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
      if (!res.ok) return
      const data = await res.json()
      const articles: NewsArticle[] = data.articles ?? []
      return articles
    } catch {
      return []
    } finally {
      setNewsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (open) {
      fetchNews().then(articles => {
        if (articles) setHeadlines(articles.slice(0, 3))
      })
    } else {
      setShowMoreNews(false)
      setSearchSymbol('')
      setNewsArticles([])
    }
  }, [open, fetchNews])

  const handleMoreNewsClick = async () => {
    if (!showMoreNews) {
      const articles = await fetchNews()
      if (articles) setNewsArticles(articles)
    }
    setShowMoreNews(v => !v)
  }

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    const sym = searchSymbol.trim() || undefined
    const articles = await fetchNews(sym)
    if (articles) setNewsArticles(articles)
  }

  const formatDate = (iso: string) => {
    const date = new Date(iso)
    return date.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false })
  }

  useEffect(() => {
    const updateMarkets = () => {
      setMarkets([
        {
          name: 'NYSE',
          timezone: 'America/New_York',
          open: '09:30',
          close: '16:00',
          isOpen: isMarketOpen(9, 30, 16, 0, 'America/New_York')
        },
        {
          name: 'NASDAQ',
          timezone: 'America/New_York',
          open: '09:30',
          close: '16:00',
          isOpen: isMarketOpen(9, 30, 16, 0, 'America/New_York')
        },
        {
          name: 'LSE',
          timezone: 'Europe/London',
          open: '08:00',
          close: '16:30',
          isOpen: isMarketOpen(8, 0, 16, 30, 'Europe/London')
        },
        {
          name: 'TSE',
          timezone: 'Asia/Tokyo',
          open: '09:00',
          close: '15:00',
          isOpen: isMarketOpen(9, 0, 15, 0, 'Asia/Tokyo')
        },
        {
          name: 'SSE',
          timezone: 'Asia/Shanghai',
          open: '09:30',
          close: '15:00',
          isOpen: isMarketOpen(9, 30, 15, 0, 'Asia/Shanghai')
        },
        {
          name: 'BSE',
          timezone: 'Asia/Kolkata',
          open: '09:15',
          close: '15:30',
          isOpen: isMarketOpen(9, 15, 15, 30, 'Asia/Kolkata')
        }
      ])
    }

    updateMarkets()
    const interval = setInterval(updateMarkets, 60000) // Update every minute
    return () => clearInterval(interval)
  }, [])

  const openMarkets = markets.filter(m => m.isOpen)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start text-xs font-mono"
        >
          <Globe className="w-3 h-3" />
          Market Hours
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl font-mono">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" />
            Global Market Hours
          </DialogTitle>
          <DialogDescription>
            Trading hours for major stock exchanges worldwide
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {openMarkets.length > 0 && (
            <div className="border border-primary/30 bg-primary/5 rounded-md p-3">
              <p className="text-xs text-primary font-semibold mb-2 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                Currently Trading ({openMarkets.length})
              </p>
              <div className="space-y-1">
                {openMarkets.map(market => (
                  <div key={market.name} className="text-xs text-primary">
                    {market.name} - {market.open} to {market.close} ({market.timezone.split('/')[1]})
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            {markets.map(market => (
              <div
                key={market.name}
                className={cn(
                  "flex items-center justify-between p-3 rounded-md border",
                  market.isOpen
                    ? "border-primary/30 bg-primary/5"
                    : "border-border bg-card"
                )}
              >
                <div className="flex items-center gap-3">
                  <span className={cn(
                    "w-2 h-2 rounded-full",
                    market.isOpen ? "bg-primary animate-pulse" : "bg-muted-foreground"
                  )} />
                  <div>
                    <div className="font-semibold text-sm">
                      {market.name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {market.timezone.replace('_', ' ')}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={cn(
                    "text-xs font-semibold",
                    market.isOpen ? "text-primary" : "text-muted-foreground"
                  )}>
                    {market.isOpen ? 'OPEN' : 'CLOSED'}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {market.open} - {market.close}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-border pt-4 space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
              <Newspaper className="w-3 h-3 text-primary" />
              Latest Market News
            </div>

            {headlines.length === 0 ? (
              <div className="text-xs text-muted-foreground">Loading headlines...</div>
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

          <div className="text-xs text-muted-foreground border-t border-border pt-3">
            <p className="mb-1">
              <span className="text-primary font-semibold">Note:</span> Market hours shown in local exchange time
            </p>
            <p>Status updates every minute. Markets are closed on weekends and holidays.</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
