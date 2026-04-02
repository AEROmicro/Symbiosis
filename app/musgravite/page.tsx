'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Coins, ArrowLeft, LayoutDashboard, Star, BarChart2,
  Search, TrendingUp, Newspaper, Menu, X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useThemeSync } from '@/hooks/use-theme-sync'
import { CryptoOverview }   from '@/components/musgravite/crypto-overview'
import { CryptoWatchlist }  from '@/components/musgravite/crypto-watchlist'
import { CryptoCompare }    from '@/components/musgravite/crypto-compare'
import { CryptoSearch }     from '@/components/musgravite/crypto-search'
import { CryptoAnalyze }    from '@/components/musgravite/crypto-analyze'
import { CryptoTrending }   from '@/components/musgravite/crypto-trending'
import { CryptoNews }       from '@/components/musgravite/crypto-news'

type Section = 'overview' | 'watchlist' | 'compare' | 'search' | 'analyze' | 'trending' | 'news'

const NAV_ITEMS: { id: Section; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'overview',  label: 'Overview',   icon: LayoutDashboard },
  { id: 'watchlist', label: 'Watchlist',  icon: Star            },
  { id: 'compare',   label: 'Compare',    icon: BarChart2       },
  { id: 'search',    label: 'Search',     icon: Search          },
  { id: 'analyze',   label: 'Analyze',    icon: TrendingUp      },
  { id: 'trending',  label: 'Trending',   icon: Coins           },
  { id: 'news',      label: 'News',       icon: Newspaper       },
]

function SectionContent({ section }: { section: Section }) {
  switch (section) {
    case 'overview':  return <CryptoOverview />
    case 'watchlist': return <CryptoWatchlist />
    case 'compare':   return <CryptoCompare />
    case 'search':    return <CryptoSearch />
    case 'analyze':   return <CryptoAnalyze />
    case 'trending':  return <CryptoTrending />
    case 'news':      return <CryptoNews />
  }
}

export default function MusgravitePage() {
  const [active, setActive] = useState<Section>('overview')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useThemeSync()

  return (
    <div className="min-h-screen bg-background text-foreground font-mono flex flex-col">
      {/* Top Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors text-sm">
              <ArrowLeft className="size-4" />
              <span className="hidden sm:inline">Back</span>
            </Link>
            <div className="w-px h-5 bg-border" />
            <div className="flex items-center gap-2">
              <Coins className="size-5 text-primary" />
              <span className="font-bold text-lg tracking-tight text-foreground">Musgravite</span>
              <span className="hidden sm:inline text-xs text-muted-foreground px-2 py-0.5 bg-primary/10 border border-primary/20 rounded">
                Crypto Tracker
              </span>
            </div>
          </div>

          {/* Mobile menu toggle */}
          <Button
            variant="ghost"
            size="icon-sm"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(v => !v)}
          >
            {mobileMenuOpen ? <X className="size-4" /> : <Menu className="size-4" />}
          </Button>
        </div>
        {/* Scanline */}
        <div className="h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex flex-col w-52 border-r border-border bg-card/30 shrink-0">
          <nav className="flex flex-col gap-0.5 p-3 flex-1">
            {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActive(id)}
                className={cn(
                  'flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors text-left w-full',
                  active === id
                    ? 'bg-primary/10 text-primary border border-primary/20'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                )}
              >
                <Icon className="size-4 shrink-0" />
                {label}
              </button>
            ))}
          </nav>
          <div className="p-3 border-t border-border">
            <p className="text-xs text-muted-foreground/60 text-center">Prices via Yahoo Finance</p>
          </div>
        </aside>

        {/* Mobile Dropdown Nav */}
        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-x-0 top-14 bottom-0 z-40 bg-background/95 backdrop-blur-sm border-t border-border overflow-y-auto">
            <nav className="flex flex-col gap-1 p-4">
              {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => { setActive(id); setMobileMenuOpen(false) }}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-md text-sm transition-colors text-left w-full',
                    active === id
                      ? 'bg-primary/10 text-primary border border-primary/20'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                  )}
                >
                  <Icon className="size-5 shrink-0" />
                  {label}
                </button>
              ))}
            </nav>
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 md:p-6 max-w-5xl mx-auto">
            <SectionContent section={active} />
          </div>
        </main>
      </div>

      {/* Mobile Bottom Tabs */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border z-40 flex">
        {NAV_ITEMS.slice(0, 5).map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => { setActive(id); setMobileMenuOpen(false) }}
            className={cn(
              'flex-1 flex flex-col items-center gap-0.5 py-2 text-[10px] transition-colors',
              active === id ? 'text-primary' : 'text-muted-foreground'
            )}
          >
            <Icon className="size-4" />
            {label}
          </button>
        ))}
      </nav>
    </div>
  )
}
