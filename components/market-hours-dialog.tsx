'use client'

import { useEffect, useState } from 'react'
import { Clock, Globe } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface MarketHours {
  name: string
  timezone: string
  open: string
  close: string
  isOpen: boolean
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
