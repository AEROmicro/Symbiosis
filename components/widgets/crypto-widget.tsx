'use client'

import { useEffect, useState, useMemo, useCallback } from 'react'
import { TrendingUp, TrendingDown, RefreshCw, Search, X, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const ALL_CRYPTOS = [
  { symbol: 'BTC-USD',    name: 'Bitcoin',              tag: 'L1'      },
  { symbol: 'ETH-USD',    name: 'Ethereum',             tag: 'L1'      },
  { symbol: 'BNB-USD',    name: 'BNB',                  tag: 'L1'      },
  { symbol: 'SOL-USD',    name: 'Solana',               tag: 'L1'      },
  { symbol: 'XRP-USD',    name: 'XRP',                  tag: 'L1'      },
  { symbol: 'ADA-USD',    name: 'Cardano',              tag: 'L1'      },
  { symbol: 'DOGE-USD',   name: 'Dogecoin',             tag: 'Meme'    },
  { symbol: 'TRX-USD',    name: 'TRON',                 tag: 'L1'      },
  { symbol: 'AVAX-USD',   name: 'Avalanche',            tag: 'L1'      },
  { symbol: 'LINK-USD',   name: 'Chainlink',            tag: 'Oracle'  },
  { symbol: 'DOT-USD',    name: 'Polkadot',             tag: 'L1'      },
  { symbol: 'MATIC-USD',  name: 'Polygon',              tag: 'L2'      },
  { symbol: 'LTC-USD',    name: 'Litecoin',             tag: 'L1'      },
  { symbol: 'BCH-USD',    name: 'Bitcoin Cash',         tag: 'L1'      },
  { symbol: 'ATOM-USD',   name: 'Cosmos',               tag: 'L1'      },
  { symbol: 'NEAR-USD',   name: 'NEAR Protocol',        tag: 'L1'      },
  { symbol: 'APT-USD',    name: 'Aptos',                tag: 'L1'      },
  { symbol: 'SUI-USD',    name: 'Sui',                  tag: 'L1'      },
  { symbol: 'ICP-USD',    name: 'Internet Computer',    tag: 'L1'      },
  { symbol: 'XLM-USD',    name: 'Stellar',              tag: 'L1'      },
  { symbol: 'ALGO-USD',   name: 'Algorand',             tag: 'L1'      },
  { symbol: 'VET-USD',    name: 'VeChain',              tag: 'L1'      },
  { symbol: 'ETC-USD',    name: 'Ethereum Classic',     tag: 'L1'      },
  { symbol: 'FIL-USD',    name: 'Filecoin',             tag: 'Storage' },
  { symbol: 'HBAR-USD',   name: 'Hedera',               tag: 'L1'      },
  { symbol: 'EOS-USD',    name: 'EOS',                  tag: 'L1'      },
  { symbol: 'XTZ-USD',    name: 'Tezos',                tag: 'L1'      },
  { symbol: 'FLOW-USD',   name: 'Flow',                 tag: 'L1'      },
  { symbol: 'EGLD-USD',   name: 'MultiversX',           tag: 'L1'      },
  { symbol: 'THETA-USD',  name: 'Theta Network',        tag: 'L1'      },
  { symbol: 'IOTA-USD',   name: 'IOTA',                 tag: 'L1'      },
  { symbol: 'NEO-USD',    name: 'NEO',                  tag: 'L1'      },
  { symbol: 'WAVES-USD',  name: 'Waves',                tag: 'L1'      },
  { symbol: 'ONE-USD',    name: 'Harmony',              tag: 'L1'      },
  { symbol: 'ROSE-USD',   name: 'Oasis Network',        tag: 'L1'      },
  { symbol: 'ZIL-USD',    name: 'Zilliqa',              tag: 'L1'      },
  { symbol: 'CELO-USD',   name: 'Celo',                 tag: 'L1'      },
  { symbol: 'KAVA-USD',   name: 'Kava',                 tag: 'L1'      },
  { symbol: 'KDA-USD',    name: 'Kadena',               tag: 'L1'      },
  { symbol: 'MINA-USD',   name: 'Mina Protocol',        tag: 'L1'      },
  { symbol: 'OP-USD',     name: 'Optimism',             tag: 'L2'      },
  { symbol: 'ARB-USD',    name: 'Arbitrum',             tag: 'L2'      },
  { symbol: 'IMX-USD',    name: 'Immutable X',          tag: 'L2'      },
  { symbol: 'METIS-USD',  name: 'Metis',                tag: 'L2'      },
  { symbol: 'BOBA-USD',   name: 'Boba Network',         tag: 'L2'      },
  { symbol: 'SKL-USD',    name: 'SKALE',                tag: 'L2'      },
  { symbol: 'LRC-USD',    name: 'Loopring',             tag: 'L2'      },
  { symbol: 'STRK-USD',   name: 'Starknet',             tag: 'L2'      },
  { symbol: 'MANTA-USD',  name: 'Manta Network',        tag: 'L2'      },
  { symbol: 'ALT-USD',    name: 'AltLayer',             tag: 'L2'      },
  { symbol: 'UNI-USD',    name: 'Uniswap',              tag: 'DeFi'    },
  { symbol: 'AAVE-USD',   name: 'Aave',                 tag: 'DeFi'    },
  { symbol: 'MKR-USD',    name: 'Maker',                tag: 'DeFi'    },
  { symbol: 'CRV-USD',    name: 'Curve DAO',            tag: 'DeFi'    },
  { symbol: 'COMP-USD',   name: 'Compound',             tag: 'DeFi'    },
  { symbol: 'SNX-USD',    name: 'Synthetix',            tag: 'DeFi'    },
  { symbol: 'SUSHI-USD',  name: 'SushiSwap',            tag: 'DeFi'    },
  { symbol: 'BAL-USD',    name: 'Balancer',             tag: 'DeFi'    },
  { symbol: 'YFI-USD',    name: 'yearn.finance',        tag: 'DeFi'    },
  { symbol: 'CVX-USD',    name: 'Convex Finance',       tag: 'DeFi'    },
  { symbol: 'LDO-USD',    name: 'Lido DAO',             tag: 'DeFi'    },
  { symbol: 'RPL-USD',    name: 'Rocket Pool',          tag: 'DeFi'    },
  { symbol: 'FXS-USD',    name: 'Frax Share',           tag: 'DeFi'    },
  { symbol: 'CAKE-USD',   name: 'PancakeSwap',          tag: 'DeFi'    },
  { symbol: 'GMX-USD',    name: 'GMX',                  tag: 'DeFi'    },
  { symbol: 'DYDX-USD',   name: 'dYdX',                 tag: 'DeFi'    },
  { symbol: 'RUNE-USD',   name: 'THORChain',            tag: 'DeFi'    },
  { symbol: 'OSMO-USD',   name: 'Osmosis',              tag: 'DeFi'    },
  { symbol: 'RAY-USD',    name: 'Raydium',              tag: 'DeFi'    },
  { symbol: 'ORCA-USD',   name: 'Orca',                 tag: 'DeFi'    },
  { symbol: 'JUP-USD',    name: 'Jupiter',              tag: 'DeFi'    },
  { symbol: 'JTO-USD',    name: 'Jito',                 tag: 'DeFi'    },
  { symbol: 'AERO-USD',   name: 'Aerodrome Finance',    tag: 'DeFi'    },
  { symbol: 'ZRX-USD',    name: '0x Protocol',          tag: 'DeFi'    },
  { symbol: 'KNC-USD',    name: 'Kyber Network',        tag: 'DeFi'    },
  { symbol: 'BNT-USD',    name: 'Bancor',               tag: 'DeFi'    },
  { symbol: 'UMA-USD',    name: 'UMA',                  tag: 'DeFi'    },
  { symbol: 'PERP-USD',   name: 'Perpetual Protocol',   tag: 'DeFi'    },
  { symbol: 'RDNT-USD',   name: 'Radiant Capital',      tag: 'DeFi'    },
  { symbol: 'GNS-USD',    name: 'Gains Network',        tag: 'DeFi'    },
  { symbol: 'STG-USD',    name: 'Stargate Finance',     tag: 'Bridge'  },
  { symbol: 'CELR-USD',   name: 'Celer Network',        tag: 'Bridge'  },
  { symbol: 'SYN-USD',    name: 'Synapse',              tag: 'Bridge'  },
  { symbol: 'W-USD',      name: 'Wormhole',             tag: 'Bridge'  },
  { symbol: 'SHIB-USD',   name: 'Shiba Inu',            tag: 'Meme'    },
  { symbol: 'PEPE-USD',   name: 'Pepe',                 tag: 'Meme'    },
  { symbol: 'FLOKI-USD',  name: 'Floki',                tag: 'Meme'    },
  { symbol: 'BONK-USD',   name: 'Bonk',                 tag: 'Meme'    },
  { symbol: 'WIF-USD',    name: 'dogwifhat',            tag: 'Meme'    },
  { symbol: 'POPCAT-USD', name: 'Popcat',               tag: 'Meme'    },
  { symbol: 'MOG-USD',    name: 'Mog Coin',             tag: 'Meme'    },
  { symbol: 'TURBO-USD',  name: 'Turbo',                tag: 'Meme'    },
  { symbol: 'BRETT-USD',  name: 'Brett',                tag: 'Meme'    },
  { symbol: 'NEIRO-USD',  name: 'Neiro',                tag: 'Meme'    },
  { symbol: 'BOME-USD',   name: 'Book of Meme',         tag: 'Meme'    },
  { symbol: 'MEW-USD',    name: 'cat in a dogs world',  tag: 'Meme'    },
  { symbol: 'MYRO-USD',   name: 'Myro',                 tag: 'Meme'    },
  { symbol: 'DOGS-USD',   name: 'Dogs',                 tag: 'Meme'    },
  { symbol: 'SAMO-USD',   name: 'Samoyedcoin',          tag: 'Meme'    },
  { symbol: 'AXS-USD',    name: 'Axie Infinity',        tag: 'Game'    },
  { symbol: 'SAND-USD',   name: 'The Sandbox',          tag: 'Game'    },
  { symbol: 'MANA-USD',   name: 'Decentraland',         tag: 'Game'    },
  { symbol: 'ENJ-USD',    name: 'Enjin Coin',           tag: 'Game'    },
  { symbol: 'GALA-USD',   name: 'Gala',                 tag: 'Game'    },
  { symbol: 'ILV-USD',    name: 'Illuvium',             tag: 'Game'    },
  { symbol: 'MAGIC-USD',  name: 'Magic (Treasure)',     tag: 'Game'    },
  { symbol: 'YGG-USD',    name: 'Yield Guild',          tag: 'Game'    },
  { symbol: 'PIXEL-USD',  name: 'Pixels',               tag: 'Game'    },
  { symbol: 'PORTAL-USD', name: 'Portal',               tag: 'Game'    },
  { symbol: 'HIGH-USD',   name: 'Highstreet',           tag: 'Game'    },
  { symbol: 'TLM-USD',    name: 'Alien Worlds',         tag: 'Game'    },
  { symbol: 'MBOX-USD',   name: 'Mobox',                tag: 'Game'    },
  { symbol: 'ALICE-USD',  name: 'My Neighbor Alice',    tag: 'Game'    },
  { symbol: 'AGLD-USD',   name: 'Adventure Gold',       tag: 'Game'    },
  { symbol: 'BLUR-USD',   name: 'Blur',                 tag: 'NFT'     },
  { symbol: 'APE-USD',    name: 'ApeCoin',              tag: 'NFT'     },
  { symbol: 'RARE-USD',   name: 'SuperRare',            tag: 'NFT'     },
  { symbol: 'RARI-USD',   name: 'Rarible',              tag: 'NFT'     },
  { symbol: 'STARS-USD',  name: 'Stargaze',             tag: 'NFT'     },
  { symbol: 'PYTH-USD',   name: 'Pyth Network',         tag: 'Oracle'  },
  { symbol: 'BAND-USD',   name: 'Band Protocol',        tag: 'Oracle'  },
  { symbol: 'API3-USD',   name: 'API3',                 tag: 'Oracle'  },
  { symbol: 'DIA-USD',    name: 'DIA',                  tag: 'Oracle'  },
  { symbol: 'XMR-USD',    name: 'Monero',               tag: 'Privacy' },
  { symbol: 'ZEC-USD',    name: 'Zcash',                tag: 'Privacy' },
  { symbol: 'DASH-USD',   name: 'Dash',                 tag: 'Privacy' },
  { symbol: 'SCRT-USD',   name: 'Secret Network',       tag: 'Privacy' },
  { symbol: 'PHALA-USD',  name: 'Phala Network',        tag: 'Privacy' },
  { symbol: 'FET-USD',    name: 'Fetch.ai',             tag: 'AI'      },
  { symbol: 'AGIX-USD',   name: 'SingularityNET',       tag: 'AI'      },
  { symbol: 'TAO-USD',    name: 'Bittensor',            tag: 'AI'      },
  { symbol: 'WLD-USD',    name: 'Worldcoin',            tag: 'AI'      },
  { symbol: 'AKT-USD',    name: 'Akash Network',        tag: 'AI'      },
  { symbol: 'OCEAN-USD',  name: 'Ocean Protocol',       tag: 'AI'      },
  { symbol: 'NMR-USD',    name: 'Numeraire',            tag: 'AI'      },
  { symbol: 'VIRTUAL-USD',name: 'Virtuals Protocol',    tag: 'AI'      },
  { symbol: 'GRT-USD',    name: 'The Graph',            tag: 'Infra'   },
  { symbol: 'ANKR-USD',   name: 'Ankr',                 tag: 'Infra'   },
  { symbol: 'NKN-USD',    name: 'NKN',                  tag: 'Infra'   },
  { symbol: 'ORBS-USD',   name: 'Orbs',                 tag: 'Infra'   },
  { symbol: 'SFP-USD',    name: 'SafePal',              tag: 'Infra'   },
  { symbol: 'HNT-USD',    name: 'Helium',               tag: 'DePIN'   },
  { symbol: 'RNDR-USD',   name: 'Render',               tag: 'DePIN'   },
  { symbol: 'IOTX-USD',   name: 'IoTeX',                tag: 'DePIN'   },
  { symbol: 'AR-USD',     name: 'Arweave',              tag: 'Storage' },
  { symbol: 'SC-USD',     name: 'Siacoin',              tag: 'Storage' },
  { symbol: 'STORJ-USD',  name: 'Storj',                tag: 'Storage' },
  { symbol: 'ONDO-USD',   name: 'Ondo Finance',         tag: 'RWA'     },
  { symbol: 'CFG-USD',    name: 'Centrifuge',           tag: 'RWA'     },
  { symbol: 'MPL-USD',    name: 'Maple Finance',        tag: 'RWA'     },
  { symbol: 'USDT-USD',   name: 'Tether',               tag: 'Stable'  },
  { symbol: 'USDC-USD',   name: 'USD Coin',             tag: 'Stable'  },
  { symbol: 'DAI-USD',    name: 'Dai',                  tag: 'Stable'  },
  { symbol: 'FRAX-USD',   name: 'Frax',                 tag: 'Stable'  },
  { symbol: 'LUSD-USD',   name: 'Liquity USD',          tag: 'Stable'  },
  { symbol: 'AMPL-USD',   name: 'Ampleforth',           tag: 'Stable'  },
  { symbol: 'OKB-USD',    name: 'OKB',                  tag: 'CEX'     },
  { symbol: 'CRO-USD',    name: 'Cronos',               tag: 'CEX'     },
  { symbol: 'KCS-USD',    name: 'KuCoin Token',         tag: 'CEX'     },
  { symbol: 'GT-USD',     name: 'Gate Token',           tag: 'CEX'     },
  { symbol: 'NEXO-USD',   name: 'Nexo',                 tag: 'Finance' },
  { symbol: 'QNT-USD',    name: 'Quant',                tag: 'Finance' },
  { symbol: 'XDC-USD',    name: 'XDC Network',          tag: 'Finance' },
  { symbol: 'COTI-USD',   name: 'COTI',                 tag: 'Finance' },
  { symbol: 'ACH-USD',    name: 'Alchemy Pay',          tag: 'Finance' },
  { symbol: 'RVN-USD',    name: 'Ravencoin',            tag: 'PoW'     },
  { symbol: 'KAS-USD',    name: 'Kaspa',                tag: 'PoW'     },
  { symbol: 'ERGO-USD',   name: 'Ergo',                 tag: 'PoW'     },
  { symbol: 'ZEN-USD',    name: 'Horizen',              tag: 'PoW'     },
  { symbol: 'FLUX-USD',   name: 'Flux',                 tag: 'PoW'     },
  { symbol: 'ALPH-USD',   name: 'Alephium',             tag: 'PoW'     },
  { symbol: 'STETH-USD',  name: 'Lido stETH',           tag: 'LST'     },
  { symbol: 'RETH-USD',   name: 'Rocket Pool ETH',      tag: 'LST'     },
  { symbol: 'CBETH-USD',  name: 'Coinbase ETH',         tag: 'LST'     },
  { symbol: 'CHZ-USD',    name: 'Chiliz',               tag: 'Social'  },
  { symbol: 'AUDIO-USD',  name: 'Audius',               tag: 'Social'  },
  { symbol: 'LPT-USD',    name: 'Livepeer',             tag: 'Social'  },
  { symbol: 'BAT-USD',    name: 'Basic Attention',      tag: 'Social'  },
  { symbol: 'NOT-USD',    name: 'Notcoin',              tag: 'Social'  },
  { symbol: 'HMSTR-USD',  name: 'Hamster Kombat',       tag: 'Social'  },
  { symbol: 'MAJOR-USD',  name: 'Major',                tag: 'Social'  },
  { symbol: 'HOOK-USD',   name: 'Hooked Protocol',      tag: 'Social'  },
  { symbol: 'INJ-USD',    name: 'Injective',            tag: 'L1'      },
  { symbol: 'TIA-USD',    name: 'Celestia',             tag: 'L1'      },
  { symbol: 'SEI-USD',    name: 'Sei',                  tag: 'L1'      },
  { symbol: 'EVMOS-USD',  name: 'Evmos',                tag: 'L1'      },
  { symbol: 'CFX-USD',    name: 'Conflux',              tag: 'L1'      },
  { symbol: 'ASTR-USD',   name: 'Astar',                tag: 'L1'      },
  { symbol: 'GLMR-USD',   name: 'Moonbeam',             tag: 'L1'      },
  { symbol: 'MOVR-USD',   name: 'Moonriver',            tag: 'L1'      },
  { symbol: 'KSM-USD',    name: 'Kusama',               tag: 'L1'      },
  { symbol: 'JUNO-USD',   name: 'Juno',                 tag: 'L1'      },
  { symbol: 'DUSK-USD',   name: 'Dusk Network',         tag: 'L1'      },
  { symbol: 'ARDR-USD',   name: 'Ardor',                tag: 'L1'      },
  { symbol: 'NULS-USD',   name: 'NULS',                 tag: 'L1'      },
  { symbol: 'TOMO-USD',   name: 'TomoChain',            tag: 'L1'      },
  { symbol: 'WAN-USD',    name: 'Wanchain',             tag: 'L1'      },
  { symbol: 'KUJIRA-USD', name: 'Kujira',               tag: 'DeFi'    },
  { symbol: 'ACA-USD',    name: 'Acala',                tag: 'DeFi'    },
  { symbol: 'POWR-USD',   name: 'Power Ledger',         tag: 'Energy'  },
  { symbol: 'IDEX-USD',   name: 'IDEX',                 tag: 'DeFi'    },
  { symbol: 'CHESS-USD',  name: 'Tranchess',            tag: 'DeFi'    },
  { symbol: 'POLS-USD',   name: 'Polkastarter',         tag: 'DeFi'    },
  { symbol: 'FORTH-USD',  name: 'Ampleforth Gov',       tag: 'DeFi'    },
  { symbol: 'CVC-USD',    name: 'Civic',                tag: 'Identity'},
  { symbol: 'JASMY-USD',  name: 'JasmyCoin',            tag: 'Identity'},
  { symbol: 'IOST-USD',   name: 'IOST',                 tag: 'L1'      },
  { symbol: 'BAKE-USD',   name: 'BakeryToken',          tag: 'DeFi'    },
  { symbol: 'XVS-USD',    name: 'Venus',                tag: 'DeFi'    },
  { symbol: 'BSW-USD',    name: 'Biswap',               tag: 'DeFi'    },
  { symbol: 'ALPACA-USD', name: 'Alpaca Finance',       tag: 'DeFi'    },
]

const ALL_TAGS = ['All', 'L1', 'L2', 'DeFi', 'Meme', 'AI', 'Game', 'NFT', 'Oracle', 'Privacy', 'Stable', 'DePIN', 'RWA', 'Storage', 'Bridge', 'CEX', 'Social', 'PoW', 'LST', 'Finance', 'Infra', 'Energy', 'Identity']

const PAGE_SIZE = 20

function formatPrice(price: number): string {
  if (price >= 1000) return `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  if (price >= 1)    return `$${price.toFixed(3)}`
  return `$${price.toPrecision(4)}`
}

interface CryptoPrice {
  symbol: string
  name: string
  tag: string
  price: number | null
  change: number | null
}

export function CryptoWidget() {
  const [search, setSearch] = useState('')
  const [activeTag, setActiveTag] = useState('All')
  const [page, setPage] = useState(0)
  const [prices, setPrices] = useState<Record<string, { price: number | null; change: number | null }>>({})
  const [fetching, setFetching] = useState(false)

  const cryptoList = ALL_CRYPTOS

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return cryptoList.filter(c => {
      const matchTag = activeTag === 'All' || c.tag === activeTag
      const matchSearch = !q || c.symbol.toLowerCase().includes(q) || c.name.toLowerCase().includes(q)
      return matchTag && matchSearch
    })
  }, [cryptoList, search, activeTag])

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const pageItems = useMemo(() => filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE), [filtered, page])

  const fetchPage = useCallback(async (items: typeof ALL_CRYPTOS[number][]) => {
    if (items.length === 0) return
    setFetching(true)
    const results = await Promise.allSettled(
      items.map(async (c) => {
        try {
          const res = await fetch(`/api/stock/${c.symbol}`)
          if (res.ok) {
            const data = await res.json()
            return { symbol: c.symbol, price: data.price ?? null, change: data.changePercent ?? null }
          }
        } catch { /* silent */ }
        return { symbol: c.symbol, price: null, change: null }
      }),
    )
    const update: Record<string, { price: number | null; change: number | null }> = {}
    for (const r of results) {
      if (r.status === 'fulfilled') {
        update[r.value.symbol] = { price: r.value.price, change: r.value.change }
      }
    }
    setPrices(prev => ({ ...prev, ...update }))
    setFetching(false)
  }, [])

  useEffect(() => {
    fetchPage(pageItems)
    const id = setInterval(() => fetchPage(pageItems), 120_000)
    return () => clearInterval(id)
  }, [pageItems, fetchPage])

  useEffect(() => { setPage(0) }, [search, activeTag])

  const rows: CryptoPrice[] = pageItems.map(c => ({
    ...c,
    price: prices[c.symbol]?.price ?? null,
    change: prices[c.symbol]?.change ?? null,
  }))

  return (
    <div className="flex flex-col h-full font-mono text-xs gap-2 p-3">
      {/* Search bar */}
      <div className="flex-none relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder={`Search ${cryptoList.length} coins…`}
          className="w-full pl-7 pr-7 py-1.5 bg-muted/30 border border-border rounded text-xs font-mono placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
        />
        {search && (
          <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Tag filter pills */}
      <div className="flex-none flex gap-1 flex-wrap">
        {ALL_TAGS.map(tag => (
          <button
            key={tag}
            onClick={() => setActiveTag(tag)}
            className={cn(
              'px-1.5 py-0.5 rounded border text-[9px] uppercase tracking-wider transition-colors shrink-0',
              activeTag === tag
                ? 'bg-primary/20 border-primary/40 text-primary'
                : 'border-border text-muted-foreground hover:text-foreground hover:bg-muted/20',
            )}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Coin list */}
      <div className="flex-1 overflow-y-auto space-y-1">
        {filtered.length === 0 ? (
          <div className="flex items-center justify-center h-20 text-muted-foreground">
            No coins match &ldquo;{search}&rdquo;
          </div>
        ) : (
          rows.map(c => {
            const pos = (c.change ?? 0) >= 0
            const hasData = c.price !== null
            return (
              <div
                key={c.symbol}
                className="flex items-center justify-between px-2.5 py-1.5 rounded border border-border/60 bg-card/30 hover:bg-muted/10 transition-colors"
              >
                <div className="min-w-0 flex items-center gap-2">
                  <span className="font-bold text-primary text-[11px] tabular-nums w-14 shrink-0">{c.symbol.replace('-USD', '')}</span>
                  <div className="min-w-0">
                    <div className="text-foreground text-[10px] truncate leading-tight">{c.name}</div>
                    <div className="text-muted-foreground text-[9px]">{c.tag}</div>
                  </div>
                </div>
                <div className="text-right shrink-0 ml-1">
                  {hasData ? (
                    <>
                      <div className="font-bold tabular-nums text-[11px]">
                        {formatPrice(c.price!)}
                      </div>
                      <div className={cn('flex items-center gap-0.5 justify-end text-[10px]', pos ? 'text-price-up' : 'text-price-down')}>
                        {pos ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
                        {pos ? '+' : ''}{c.change?.toFixed(2)}%
                      </div>
                    </>
                  ) : (
                    <div className="text-muted-foreground text-[10px]">{fetching ? '…' : '–'}</div>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Pagination + refresh bar */}
      <div className="flex-none flex items-center gap-1.5 border-t border-border pt-2">
        <Button
          variant="outline" size="sm"
          className="h-6 w-6 p-0"
          onClick={() => setPage(p => Math.max(0, p - 1))}
          disabled={page === 0}
        >
          <ChevronLeft className="w-3 h-3" />
        </Button>
        <span className="text-[10px] text-muted-foreground tabular-nums flex-1 text-center">
          {page + 1}/{totalPages || 1} &nbsp;·&nbsp; {filtered.length} coins
        </span>
        <Button
          variant="outline" size="sm"
          className="h-6 w-6 p-0"
          onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
          disabled={page >= totalPages - 1}
        >
          <ChevronRight className="w-3 h-3" />
        </Button>
        <Button
          variant="outline" size="sm"
          className="h-6 px-2 text-[10px] font-mono gap-1"
          onClick={() => fetchPage(pageItems)}
          disabled={fetching}
        >
          <RefreshCw className={cn('w-3 h-3', fetching && 'animate-spin')} />
          Refresh
        </Button>
      </div>
    </div>
  )
}
