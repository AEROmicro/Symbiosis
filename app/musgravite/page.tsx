'use client'

import Link from 'next/link'
import { Coins, ArrowLeft, Construction } from 'lucide-react'

export default function MusgravitePage() {
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
                Crypto
              </span>
            </div>
          </div>
        </div>
        {/* Scanline */}
        <div className="h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
      </header>

      {/* Coming Soon */}
      <main className="flex flex-1 items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center px-4">
          <Construction className="size-12 text-primary/50" />
          <h1 className="text-2xl font-bold tracking-tight">Coming Soon</h1>
          <p className="text-muted-foreground text-sm max-w-sm">
            Musgravite crypto tracking is under construction. Check back soon.
          </p>
          <Link
            href="/"
            className="mt-2 px-4 py-2 text-sm rounded border border-primary/30 text-primary hover:bg-primary/10 transition-colors"
          >
            Back to Dashboard
          </Link>
        </div>
      </main>
    </div>
  )
}
