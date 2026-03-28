'use client'

import { useState } from 'react'
import { Plus, Trash2, X, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface QuickActionsProps {
  onAddStock: (symbol: string) => void
  onRemoveStock: (symbol: string) => void
  onClearAll: () => void
  watchedStocks: string[]
}

const CATEGORIES = {
  stocks: {
    label: 'Stocks',
    items: [
      { symbol: 'AAPL',  name: 'Apple'     },
      { symbol: 'MSFT',  name: 'Microsoft' },
      { symbol: 'GOOGL', name: 'Google'    },
      { symbol: 'AMZN',  name: 'Amazon'    },
      { symbol: 'TSLA',  name: 'Tesla'     },
      { symbol: 'META',  name: 'Meta'      },
      { symbol: 'NVDA',  name: 'NVIDIA'    },
      { symbol: 'AMD',   name: 'AMD'       },
    ],
  },
  indices: {
    label: 'Indices',
    items: [
      { symbol: '^GSPC', name: 'S&P 500'      },
      { symbol: '^DJI',  name: 'Dow Jones'    },
      { symbol: '^IXIC', name: 'NASDAQ'       },
      { symbol: '^RUT',  name: 'Russell 2000' },
      { symbol: '^VIX',  name: 'VIX'          },
    ],
  },
  etfs: {
    label: 'ETFs',
    items: [
      { symbol: 'SPY', name: 'S&P 500 ETF' },
      { symbol: 'QQQ', name: 'NASDAQ ETF'  },
      { symbol: 'IWM', name: 'Russell ETF' },
      { symbol: 'DIA', name: 'Dow ETF'     },
      { symbol: 'GLD', name: 'Gold ETF'    },
      { symbol: 'SLV', name: 'Silver ETF'  },
      { symbol: 'VTI', name: 'Vanguard Total Market'  },
      { symbol: 'VXUS', name: 'Vanguard International'  },
    ],
  },
  crypto: {
    label: 'Crypto',
    items: [
      { symbol: 'BTC-USD',  name: 'Bitcoin'  },
      { symbol: 'ETH-USD',  name: 'Ethereum' },
      { symbol: 'SOL-USD',  name: 'Solana'   },
      { symbol: 'BNB-USD', name: 'BNB' },
      { symbol: 'XRP-USD', name: 'XRP' },
      { symbol: 'AVAX-USD', name: 'Avalanche' },
      { symbol: 'DOGE-USD', name: 'Dogecoin' },

    ],
  },
  sectors: {
    label: 'Sectors',
    items: [
      { symbol: 'XLK',  name: 'Technology'    },
      { symbol: 'XLV',  name: 'Healthcare'    },
      { symbol: 'XLF',  name: 'Finance'       },
      { symbol: 'XLE',  name: 'Energy'        },
      { symbol: 'XLY',  name: 'Consumer'      },
      { symbol: 'XLI',  name: 'Industrial'    },
      { symbol: 'XLU',  name: 'Utilities'     },
      { symbol: 'XLB',  name: 'Materials'     },
      { symbol: 'XLRE', name: 'Real Estate'   },
      { symbol: 'XLC',  name: 'Communication' },
    ],
  },
} as const

type TabKey = keyof typeof CATEGORIES

export function QuickActions({ onAddStock, onRemoveStock, onClearAll, watchedStocks }: QuickActionsProps) {
  const [activeTab, setActiveTab] = useState<TabKey>('stocks')
  const [confirmClear, setConfirmClear] = useState(false)

  const items = CATEGORIES[activeTab].items

  return (
    <div className="flex flex-col h-full p-3 gap-2">
      {/* Category tabs */}
      <div className="flex flex-wrap gap-1 shrink-0">
        {(Object.keys(CATEGORIES) as TabKey[]).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              'flex-1 basis-[30%] py-0.5 text-[9px] font-mono uppercase tracking-wider rounded border transition-colors',
              activeTab === tab
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border text-muted-foreground hover:border-primary/40 hover:text-foreground',
            )}
          >
            {CATEGORIES[tab].label}
          </button>
        ))}
      </div>

      {/* Item grid — expands to fill available space, items anchored top */}
      <nav aria-label="Quick add symbols" className="flex-1 grid grid-cols-2 gap-1 content-start overflow-hidden">
        {items.map(({ symbol, name }) => {
          const isWatched = watchedStocks.includes(symbol)
          return (
            <button
              key={symbol}
              onClick={() => isWatched ? onRemoveStock(symbol) : onAddStock(symbol)}
              className={cn(
                'flex items-center gap-1.5 px-2 py-1 text-xs rounded border transition-all text-left',
                isWatched
                  ? 'border-primary/40 bg-primary/10 text-primary hover:border-destructive/60 hover:bg-destructive/10 hover:text-destructive'
                  : 'border-border hover:border-primary hover:bg-primary/5 text-foreground hover:text-primary',
              )}
            >
              {isWatched
                ? <Check className="w-3 h-3 shrink-0" />
                : <Plus  className="w-3 h-3 shrink-0" />
              }
              <div className="min-w-0">
                <div className="font-semibold truncate leading-tight">{symbol}</div>
                <div className="text-[9px] text-muted-foreground truncate leading-tight">{name}</div>
              </div>
            </button>
          )
        })}
      </nav>

      {/* Watchlist actions */}
      <div className="shrink-0 border-t border-border pt-2">
        {confirmClear ? (
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="destructive"
              className="flex-1 h-7 text-[10px] font-mono"
              onClick={() => { onClearAll(); setConfirmClear(false) }}
            >
              Confirm Clear All
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-7 px-2"
              onClick={() => setConfirmClear(false)}
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        ) : (
          <Button
            size="sm"
            variant="outline"
            className="w-full h-7 text-[10px] font-mono gap-1.5"
            onClick={() => setConfirmClear(true)}
            disabled={watchedStocks.length === 0}
          >
            <Trash2 className="w-3 h-3" />
            Clear Watchlist ({watchedStocks.length})
          </Button>
        )}
      </div>
    </div>
  )
}
