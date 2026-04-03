'use client'

import { useEffect, useState } from 'react'
import { Eye, EyeOff, Download, CheckCircle, AlertCircle } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'
import { usePortfolio } from '@/contexts/portfolio-context'
import type { PortfolioEntry } from '@/lib/stock-types'

const ALPACA_KEYS_STORAGE = 'symbiosis-alpaca-keys'

interface AlpacaKeys {
  apiKey: string
  apiSecret: string
  environment: 'paper' | 'live'
}

interface AlpacaConnectProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AlpacaConnect({ open, onOpenChange }: AlpacaConnectProps) {
  const { portfolio, setPortfolio } = usePortfolio()

  const [apiKey, setApiKey] = useState('')
  const [apiSecret, setApiSecret] = useState('')
  const [isLive, setIsLive] = useState(false)
  const [showSecret, setShowSecret] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [imported, setImported] = useState<Array<PortfolioEntry & { source: string }> | null>(null)
  const [addedCount, setAddedCount] = useState<number | null>(null)

  // Load saved keys on open
  useEffect(() => {
    if (!open) return
    try {
      const saved = localStorage.getItem(ALPACA_KEYS_STORAGE)
      if (saved) {
        const parsed: AlpacaKeys = JSON.parse(saved)
        setApiKey(parsed.apiKey ?? '')
        setApiSecret(parsed.apiSecret ?? '')
        setIsLive(parsed.environment === 'live')
      }
    } catch { /* ignore */ }
    setError(null)
    setImported(null)
    setAddedCount(null)
  }, [open])

  const handleImport = async () => {
    if (!apiKey || !apiSecret) { setError('Please enter your Alpaca API key and secret.'); return }
    setError(null)
    setImported(null)
    setAddedCount(null)
    setLoading(true)

    try {
      // Persist keys locally for convenience (user explicitly entered them)
      const keysToSave: AlpacaKeys = { apiKey, apiSecret, environment: isLive ? 'live' : 'paper' }
      try { localStorage.setItem(ALPACA_KEYS_STORAGE, JSON.stringify(keysToSave)) } catch { /* ignore */ }

      const res = await fetch('/api/brokerage/alpaca', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey, apiSecret, environment: isLive ? 'live' : 'paper' }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? 'Failed to import positions.')
        return
      }

      setImported(data)
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleAddToPortfolio = () => {
    if (!imported) return

    setPortfolio(prev => {
      const existingSymbols = new Set(prev.map(e => e.symbol))
      const newEntries = imported.filter(e => !existingSymbols.has(e.symbol))
      const updated: PortfolioEntry[] = [
        // Update quantities for symbols already in portfolio
        ...prev.map(e => {
          const match = imported.find(i => i.symbol === e.symbol)
          return match ? { ...e, shares: match.shares, avgPrice: match.avgPrice } : e
        }),
        // Add new symbols
        ...newEntries,
      ]
      setAddedCount(newEntries.length)
      return updated
    })
  }

  const existingSymbols = new Set(portfolio.map(e => e.symbol))

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg font-mono">
        <DialogHeader>
          <DialogTitle className="text-primary">{'>'} Connect Brokerage</DialogTitle>
          <DialogDescription>
            Import your Alpaca positions directly into your portfolio.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* API Key */}
          <div className="space-y-1">
            <Label htmlFor="alpaca-key">API Key ID</Label>
            <Input
              id="alpaca-key"
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              placeholder="PKxxxxxxxxxxxxxxxxxxxxxxxx"
              className="font-mono text-xs"
            />
          </div>

          {/* Secret */}
          <div className="space-y-1">
            <Label htmlFor="alpaca-secret">Secret Key</Label>
            <div className="relative">
              <Input
                id="alpaca-secret"
                type={showSecret ? 'text' : 'password'}
                value={apiSecret}
                onChange={e => setApiSecret(e.target.value)}
                placeholder="••••••••••••••••••••••••••••••••"
                className="font-mono text-xs pr-8"
              />
              <button
                type="button"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                onClick={() => setShowSecret(v => !v)}
              >
                {showSecret ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Environment toggle */}
          <div className="flex items-center gap-3">
            <Switch
              id="alpaca-env"
              checked={isLive}
              onCheckedChange={setIsLive}
            />
            <Label htmlFor="alpaca-env" className="text-xs">
              {isLive
                ? <span className="text-destructive font-semibold">Live Trading</span>
                : <span>Paper Trading</span>
              }
            </Label>
          </div>

          {error && (
            <div className="flex items-start gap-2 text-xs text-destructive border border-destructive/30 rounded p-2">
              <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              {error}
            </div>
          )}

          <Button
            onClick={handleImport}
            disabled={loading || !apiKey || !apiSecret}
            className="w-full"
          >
            <Download className="w-3.5 h-3.5 mr-2" />
            {loading ? 'Importing…' : 'Fetch Positions'}
          </Button>

          {/* Imported positions preview */}
          {imported && imported.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-2">
              No open positions found in this account.
            </p>
          )}

          {imported && imported.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">
                Found {imported.length} position{imported.length !== 1 ? 's' : ''}:
              </p>
              <div className="max-h-48 overflow-y-auto space-y-1 border rounded p-2">
                {imported.map(pos => {
                  const inPortfolio = existingSymbols.has(pos.symbol)
                  return (
                    <div
                      key={pos.symbol}
                      className={cn(
                        'flex justify-between items-center text-xs px-1',
                        inPortfolio ? 'text-muted-foreground' : 'text-foreground',
                      )}
                    >
                      <span className="font-semibold">{pos.symbol}</span>
                      <span>
                        {pos.shares} sh @ ${pos.avgPrice.toFixed(2)}
                        {inPortfolio && (
                          <span className="ml-2 text-[10px] text-primary">(will update)</span>
                        )}
                      </span>
                    </div>
                  )
                })}
              </div>

              {addedCount !== null ? (
                <div className="flex items-center gap-2 text-xs text-primary">
                  <CheckCircle className="w-3.5 h-3.5" />
                  {addedCount > 0
                    ? `Added ${addedCount} new position${addedCount !== 1 ? 's' : ''} and updated existing entries.`
                    : 'All positions updated in portfolio.'
                  }
                </div>
              ) : (
                <Button
                  variant="outline"
                  onClick={handleAddToPortfolio}
                  className="w-full text-xs"
                >
                  <CheckCircle className="w-3.5 h-3.5 mr-2" />
                  Add / Update in Portfolio
                </Button>
              )}
            </div>
          )}

          <p className="text-[10px] text-muted-foreground">
            Your API keys are stored locally in your browser and are only sent directly to Alpaca
            via our secure server proxy. They are never stored on our servers.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
