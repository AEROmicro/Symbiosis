'use client'

import { useEffect, useState } from 'react'
import { ExternalLink, Loader2, Rss } from 'lucide-react'

interface NewsArticle {
  title: string
  publisher: string
  link: string
  publishedAt: string
}

export function NewsTickerWidget() {
  const [articles, setArticles] = useState<NewsArticle[]>([])
  const [loading, setLoading] = useState(true)

  const fetchNews = async () => {
    try {
      const res = await fetch('/api/news')
      if (!res.ok) return
      const data = await res.json()
      setArticles((data.articles ?? []).slice(0, 35))
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNews()
    const id = setInterval(fetchNews, 300_000)
    return () => clearInterval(id)
  }, [])

  if (loading) {
    return (
      <div className="h-full flex items-center gap-2 px-4 border border-border bg-card/50 rounded-md text-xs text-muted-foreground font-mono">
        <Loader2 className="w-3 h-3 animate-spin shrink-0" />
        Loading news…
      </div>
    )
  }

  if (articles.length === 0) {
    return (
      <div className="h-full flex items-center gap-2 px-4 border border-border bg-card/50 rounded-md text-xs text-muted-foreground font-mono">
        <Rss className="w-3 h-3 shrink-0" />
        No headlines available
      </div>
    )
  }

  // Duplicate for seamless marquee loop
  const items = [...articles, ...articles]
  const duration = Math.max(60, articles.length * 8)

  return (
    <div className="h-full flex items-center border border-border bg-card/50 rounded-md overflow-hidden">
      {/* Label */}
      <div className="flex items-center gap-1.5 px-3 shrink-0 border-r border-border h-full bg-card/80">
        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse shrink-0" />
        <span className="text-[10px] font-mono text-primary uppercase tracking-wider shrink-0">News</span>
      </div>

      {/* Scrolling ticker */}
      <div className="flex-1 overflow-hidden h-full flex items-center">
        <div
          className="flex w-max whitespace-nowrap hover:[animation-play-state:paused]"
          style={{ animation: `marquee ${duration}s linear infinite` }}
        >
          {items.map((article, i) => (
            <a
              key={`${article.link}-${i}`}
              href={article.link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 group"
            >
              <ExternalLink className="w-2.5 h-2.5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
              <span className="text-xs font-mono text-foreground group-hover:text-primary transition-colors">
                {article.title}
              </span>
              <span className="text-[10px] text-muted-foreground shrink-0">
                — {article.publisher}
              </span>
              <span className="text-border/60 text-xs px-2">·</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
