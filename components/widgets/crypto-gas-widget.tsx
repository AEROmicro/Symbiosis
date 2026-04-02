'use client'

import { useState, useEffect, useCallback } from 'react'
import { RefreshCw, Fuel } from 'lucide-react'
import { cn } from '@/lib/utils'

interface GasSpeed {
  label: string
  gwei: number
  color: string
  dotColor: string
}

const GAS_SPEEDS: GasSpeed[] = [
  { label: 'Slow',     gwei: 15, color: 'text-green-500',  dotColor: 'bg-green-500' },
  { label: 'Standard', gwei: 22, color: 'text-amber-400',  dotColor: 'bg-amber-400' },
  { label: 'Fast',     gwei: 35, color: 'text-orange-500', dotColor: 'bg-orange-500' },
  { label: 'Instant',  gwei: 55, color: 'text-destructive',dotColor: 'bg-destructive' },
]

const GAS_UNITS = 21_000

export function CryptoGasWidget() {
  const [ethPrice, setEthPrice] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<string>('')

  const fetchEthPrice = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/stock/ETH-USD')
      if (res.ok) {
        const d = await res.json()
        if (d.price) {
          setEthPrice(d.price)
          setLastUpdated(new Date().toLocaleTimeString())
        }
      }
    } catch {}
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchEthPrice()
  }, [fetchEthPrice])

  const calcCostUSD = (gwei: number): string => {
    if (!ethPrice) return '…'
    const gweiToEth = gwei * GAS_UNITS * 1e-9
    const usd = gweiToEth * ethPrice
    if (usd < 0.01) return `<$0.01`
    return `$${usd.toFixed(2)}`
  }

  return (
    <div className="p-4 flex flex-col gap-3 h-full font-mono text-xs">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Fuel className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground">ETH Gas Tracker</span>
        </div>
        <button onClick={fetchEthPrice} disabled={loading} className="text-muted-foreground hover:text-foreground transition-colors">
          <RefreshCw className={cn('w-3 h-3', loading && 'animate-spin')} />
        </button>
      </div>

      {ethPrice && (
        <div className="border border-border rounded-sm px-3 py-2 flex items-center justify-between">
          <span className="text-muted-foreground">ETH Price</span>
          <span className="font-bold tabular-nums">${ethPrice.toLocaleString('en-US', { maximumFractionDigits: 2 })}</span>
        </div>
      )}

      <div className="flex-1 space-y-2 min-h-0">
        <div className="text-[9px] text-muted-foreground uppercase tracking-wider">Gas Prices (21,000 gas · ETH transfer)</div>
        {GAS_SPEEDS.map(speed => (
          <div key={speed.label} className="border border-border rounded-sm px-3 py-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={cn('w-2 h-2 rounded-full shrink-0', speed.dotColor)} />
              <div>
                <div className="font-semibold">{speed.label}</div>
                <div className="text-[9px] text-muted-foreground tabular-nums">{speed.gwei} Gwei</div>
              </div>
            </div>
            <div className="text-right">
              <div className={cn('font-bold tabular-nums', speed.color)}>{calcCostUSD(speed.gwei)}</div>
              <div className="text-[9px] text-muted-foreground tabular-nums">
                {(speed.gwei * GAS_UNITS * 1e-9).toFixed(6)} ETH
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="shrink-0 text-[9px] text-muted-foreground">
        {lastUpdated ? `Updated: ${lastUpdated}` : 'Fetching price…'}
        {' · '}Simulated gas · Mainnet estimate
      </div>
    </div>
  )
}
