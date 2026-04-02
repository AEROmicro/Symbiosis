'use client'

import { useState, useEffect, useCallback } from 'react'
import { Newspaper, ExternalLink, RefreshCw, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

const CRYPTO_KEYWORDS = [
  'bitcoin', 'ethereum', 'crypto', 'blockchain', 'defi', 'nft',
  'altcoin', 'solana', 'binance', 'coinbase', 'web3', 'token',
  'stablecoin', 'ripple', 'dogecoin', 'polygon', 'avalanche',
]

interface Article {
  title: string
  publisher: string
  link: string
  publishedAt: string
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

function isCryptoRelated(article: Article): boolean {
  const text = `${article.title} ${article.publisher}`.toLowerCase()
  return CRYPTO_KEYWORDS.some(kw => text.includes(kw))
}

function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn('bg-card border border-border rounded-md p-4', className)}>{children}</div>
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-3">{children}</h2>
}

const CRYPTO_QUERIES = ['bitcoin', 'ethereum crypto', 'cryptocurrency blockchain', 'defi']

export function CryptoNews() {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<string | null>(null)
  const [isCryptoFiltered, setIsCryptoFiltered] = useState(true)

  const fetchNews = useCallback(async () => {
    setLoading(true)
    setError(false)

    // Fetch from multiple crypto-related queries in parallel
    const results = await Promise.allSettled(
      CRYPTO_QUERIES.map(q =>
        fetch(`/api/news?symbol=${encodeURIComponent(q)}`).then(r => r.json())
      )
    )

    const seen = new Set<string>()
    const all: Article[] = []

    results.forEach(r => {
      if (r.status === 'fulfilled' && Array.isArray(r.value?.articles)) {
        r.value.articles.forEach((a: Article) => {
          if (!seen.has(a.link)) {
            seen.add(a.link)
            all.push(a)
          }
        })
      }
    })

    if (all.length === 0) {
      // Fallback to general finance news
      try {
        const res = await fetch('/api/news')
        const d = await res.json()
        if (Array.isArray(d?.articles)) {
          all.push(...d.articles)
          setIsCryptoFiltered(false)
        }
      } catch {}
    }

    if (all.length === 0) {
      setError(true)
      setLoading(false)
      return
    }

    // Filter crypto-related; if too few, show all
    const cryptoArticles = all.filter(isCryptoRelated)
    if (cryptoArticles.length >= 3) {
      setArticles(cryptoArticles.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()))
      setIsCryptoFiltered(true)
    } else {
      setArticles(all.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()))
      setIsCryptoFiltered(false)
    }

    setLastUpdated(new Date().toLocaleTimeString())
    setLoading(false)
  }, [])

  useEffect(() => { fetchNews() }, [fetchNews])

  return (
    <div className="font-mono space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Newspaper className="h-4 w-4 text-primary" />
          <h1 className="text-lg font-bold">Crypto News</h1>
          {!isCryptoFiltered && (
            <span className="text-xs bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 rounded px-1.5 py-0.5">
              General Finance
            </span>
          )}
        </div>
        <Button variant="outline" size="sm" onClick={fetchNews} disabled={loading}>
          <RefreshCw className={cn('h-3 w-3 mr-1', loading && 'animate-spin')} />
          Refresh
        </Button>
      </div>

      {lastUpdated && (
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <Clock className="h-3 w-3" /> Updated {lastUpdated}
          {isCryptoFiltered && <span className="ml-2 text-primary">· Crypto filtered</span>}
        </p>
      )}

      {loading && (
        <div className="space-y-3">
          {[1, 2, 3, 4].map(i => (
            <Card key={i} className="animate-pulse">
              <div className="h-4 bg-muted rounded w-3/4 mb-2" />
              <div className="h-3 bg-muted rounded w-1/3 mb-3" />
              <div className="h-3 bg-muted rounded w-full" />
            </Card>
          ))}
        </div>
      )}

      {error && !loading && (
        <Card className="text-center py-8">
          <Newspaper className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Could not load news</p>
          <Button variant="outline" size="sm" className="mt-3" onClick={fetchNews}>Try Again</Button>
        </Card>
      )}

      {!loading && !error && articles.length === 0 && (
        <Card className="text-center py-8">
          <Newspaper className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">No news articles found</p>
        </Card>
      )}

      {!loading && !error && articles.length > 0 && (
        <div className="space-y-3">
          <SectionTitle>
            {isCryptoFiltered ? 'Crypto & Blockchain News' : 'Finance News'}
            <span className="ml-2 font-normal text-muted-foreground">({articles.length} articles)</span>
          </SectionTitle>

          {articles.map((article, i) => (
            <Card key={`${article.link}-${i}`} className="hover:border-primary/40 transition-colors group">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold text-primary">{article.publisher}</span>
                    <span className="text-xs text-muted-foreground">·</span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-2.5 w-2.5" />
                      {timeAgo(article.publishedAt)}
                    </span>
                  </div>
                  <p className="text-sm font-semibold leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                    {article.title}
                  </p>
                </div>
                {article.link && (
                  <a
                    href={article.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-shrink-0 text-muted-foreground hover:text-primary transition-colors mt-0.5"
                    aria-label="Read more"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                )}
              </div>

              {article.link && (
                <a
                  href={article.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-2"
                >
                  Read more <ExternalLink className="h-2.5 w-2.5" />
                </a>
              )}
            </Card>
          ))}
        </div>
      )}

      {!loading && !error && articles.length > 0 && (
        <p className="text-xs text-muted-foreground text-center">
          News sourced from Yahoo Finance · Not financial advice
        </p>
      )}
    </div>
  )
}
