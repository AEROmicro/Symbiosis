'use client'

import { HelpCircle, ExternalLink, Command, Activity, Info, Mail } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

export function HelpDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start text-xs font-mono"
        >
          <HelpCircle className="w-3 h-3" />
          Help
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto font-mono">        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="text-primary">{'>'}_</span>
            Symbiosis Help Center
          </DialogTitle>
          <DialogDescription>
            Terminal commands, keyboard shortcuts, and system information
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 text-sm">
          {/* Terminal Commands */}
          <div>
            <div className="flex items-center gap-2 mb-3 text-primary font-semibold">
              <Command className="w-4 h-4" />
              Terminal Commands
            </div>
            <div className="space-y-2 pl-2">
              <div className="grid grid-cols-[auto_1fr] gap-x-8 gap-y-1.5">
                <code className="text-primary">add &lt;SYMBOL&gt;</code>
                <span className="text-muted-foreground">Add stock to watchlist</span>

                <code className="text-primary">remove &lt;SYMBOL&gt;</code>
                <span className="text-muted-foreground">Remove stock from watchlist</span>

                <code className="text-primary">search &lt;QUERY&gt;</code>
                <span className="text-muted-foreground">Search stocks by name or ticker</span>

                <code className="text-primary">info &lt;SYMBOL&gt;</code>
                <span className="text-muted-foreground">Show real-time stock information</span>

                <code className="text-primary">compare A B</code>
                <span className="text-muted-foreground">Compare two stocks side-by-side</span>

                <code className="text-primary">list</code>
                <span className="text-muted-foreground">Display all watched stocks</span>

                <code className="text-primary">popular</code>
                <span className="text-muted-foreground">Show popular stocks to track</span>

                <code className="text-primary">news</code>
                <span className="text-muted-foreground">Show latest market news headlines</span>

                <code className="text-primary">news &lt;SYMBOL&gt;</code>
                <span className="text-muted-foreground">Show news for a specific stock</span>

                <code className="text-primary">analyze &lt;SYMBOL&gt;</code>
                <span className="text-muted-foreground">Full technical &amp; fundamental analysis (alias: az)</span>

                <code className="text-primary">portfolio</code>
                <span className="text-muted-foreground">View portfolio with P&L analysis</span>

                <code className="text-primary">portfolio add &lt;SYMBOL&gt; &lt;SHARES&gt; &lt;PRICE&gt;</code>
                <span className="text-muted-foreground">Add position to portfolio</span>

                <code className="text-primary">portfolio remove &lt;SYMBOL&gt;</code>
                <span className="text-muted-foreground">Remove position from portfolio</span>

                <code className="text-primary">system</code>
                <span className="text-muted-foreground">Display system information</span>

                <code className="text-primary">clear</code>
                <span className="text-muted-foreground">Clear terminal output</span>

                <code className="text-primary">clearall</code>
                <span className="text-muted-foreground">Remove all stocks from watchlist</span>
              </div>
            </div>
          </div>

          {/* Keyboard Shortcuts */}
          <div>
            <div className="flex items-center gap-2 mb-3 text-primary font-semibold">
              <Activity className="w-4 h-4" />
              Keyboard Shortcuts
            </div>
            <div className="space-y-2 pl-2">
              <div className="grid grid-cols-[auto_1fr] gap-x-8 gap-y-1.5">
                <kbd className="px-2 py-1 bg-muted rounded text-xs border border-border">↑</kbd>
                <span className="text-muted-foreground">Navigate command history (previous)</span>

                <kbd className="px-2 py-1 bg-muted rounded text-xs border border-border">↓</kbd>
                <span className="text-muted-foreground">Navigate command history (next)</span>

                <kbd className="px-2 py-1 bg-muted rounded text-xs border border-border">Tab</kbd>
                <span className="text-muted-foreground">Autocomplete commands</span>

                <kbd className="px-2 py-1 bg-muted rounded text-xs border border-border">Enter</kbd>
                <span className="text-muted-foreground">Execute command</span>
              </div>
            </div>
          </div>

          {/* Usage Tips */}
          <div>
            <div className="flex items-center gap-2 mb-3 text-primary font-semibold">
              <Info className="w-4 h-4" />
              Usage Tips
            </div>
            <ul className="space-y-1.5 pl-6 text-muted-foreground list-disc">
              <li>Any valid stock or ETF ticker works (e.g., SPY, QQQ, BRK.B)</li>
              <li>Click stock cards to see detailed analysis and charts</li>
              <li>Market data updates automatically every 3 seconds</li>
              <li>Your watchlist persists in local storage</li>
              <li>Hover over the ticker to pause scrolling</li>
            </ul>
          </div>

          {/* Market Status Info */}
          <div>
            <div className="flex items-center gap-2 mb-3 text-primary font-semibold">
              <Activity className="w-4 h-4" />
              Market Status
            </div>
            <div className="space-y-2 pl-2">
              <div className="grid grid-cols-[auto_1fr] gap-x-8 gap-y-1.5 text-xs">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  <span className="text-primary font-semibold">OPEN</span>
                </span>
                <span className="text-muted-foreground">Market is actively trading</span>

                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
                  <span className="text-yellow-500 font-semibold">PRE-MARKET</span>
                </span>
                <span className="text-muted-foreground">Pre-market trading hours</span>

                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                  <span className="text-orange-500 font-semibold">AFTER-HOURS</span>
                </span>
                <span className="text-muted-foreground">Post-market trading hours</span>

                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-muted-foreground" />
                  <span className="text-muted-foreground font-semibold">CLOSED</span>
                </span>
                <span className="text-muted-foreground">Market is closed</span>
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                Market status updates automatically based on NYSE trading hours (9:30 AM - 4:00 PM ET)
              </p>
            </div>
          </div>

          {/* Links */}
          <div className="border-t border-border pt-4 mt-4">
            <div className="flex flex-col gap-2">
              <a
                href="https://github.com/AEROmicro/Symbiosis"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                View on GitHub
              </a>
              <a
                href="mailto:aeroforge-co@outlook.com?subject=Symbiosis%20Support&body=Hello%20ÆROforge%20team%2C%0A%0A"
                className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors"
              >
                <Mail className="w-4 h-4" />
                Contact Support — aeroforge-co@outlook.com
              </a>
              <p className="text-xs text-muted-foreground">
                Symbiosis v5.2 Magnetar Basalt (stable build) - Built with Next.js, React, and Tailwind CSS
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
