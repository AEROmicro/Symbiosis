'use client'

import { useState, useRef, useEffect, KeyboardEvent } from 'react'
import type { TerminalLog, PortfolioEntry } from '@/lib/stock-types'
import { cn } from '@/lib/utils'

interface TerminalCLIProps {
  onAddStock: (symbol: string) => void
  onRemoveStock: (symbol: string) => void
  onClearAll: () => void
  watchedStocks: string[]
}

// Popular stocks for reference - but any valid ticker will work
const POPULAR_STOCKS = ['AAPL', 'GOOGL', 'MSFT', 'AMZN', 'TSLA', 'META', 'NVDA', 'AMD']

const PORTFOLIO_STORAGE_KEY = 'symbiosis-portfolio'

export function TerminalCLI({ onAddStock, onRemoveStock, onClearAll, watchedStocks }: TerminalCLIProps) {
  const [input, setInput] = useState('')
  const [logs, setLogs] = useState<TerminalLog[]>([
    {
      id: '1',
      timestamp: new Date(),
      type: 'info',
      message: 'Type help for available commands'
    }
  ])
  const [history, setHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [validatingSymbol, setValidatingSymbol] = useState<string | null>(null)
  const [sessionStart] = useState(() => Date.now())
  const [sessionId] = useState(() => crypto.randomUUID().slice(0, 8).toUpperCase())
  const [portfolio, setPortfolio] = useState<PortfolioEntry[]>(() => {
    try {
      const stored = localStorage.getItem(PORTFOLIO_STORAGE_KEY)
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  })
  const inputRef = useRef<HTMLInputElement>(null)
  const logsEndRef = useRef<HTMLDivElement>(null)
  const logsContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (logsContainerRef.current) {
      logsContainerRef.current.scrollTop = logsContainerRef.current.scrollHeight
    }
  }, [logs])

  useEffect(() => {
    try {
      localStorage.setItem(PORTFOLIO_STORAGE_KEY, JSON.stringify(portfolio))
    } catch {
      // localStorage unavailable — silently ignore
    }
  }, [portfolio])

  const addLog = (type: TerminalLog['type'], message: string, showTimestamp = false) => {
    setLogs(prev => [...prev, {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      type,
      message,
      showTimestamp
    }])
  }

  // Validate symbol exists by fetching from API
  const validateAndAddSymbol = async (symbol: string) => {
    const upperSymbol = symbol.toUpperCase()
    
    if (watchedStocks.includes(upperSymbol)) {
      addLog('warning', `${upperSymbol} is already in your watchlist`)
      return
    }

    setValidatingSymbol(upperSymbol)
    addLog('system', `Validating ${upperSymbol}...`)

    try {
      const response = await fetch(`/api/stock/${upperSymbol}`)
      if (response.ok) {
        const data = await response.json()
        onAddStock(upperSymbol)
        addLog('success', `Added ${upperSymbol} (${data.name}) @ $${data.price.toFixed(2)}`)
      } else {
        addLog('error', `Symbol '${upperSymbol}' not found. Check the ticker symbol.`)
      }
    } catch {
      addLog('error', `Failed to validate ${upperSymbol}. Try again.`)
    } finally {
      setValidatingSymbol(null)
    }
  }

  const getStockInfo = async (symbol: string) => {
    const upperSymbol = symbol.toUpperCase()
    addLog('system', `Fetching info for ${upperSymbol}...`)

    try {
      const response = await fetch(`/api/stock/${upperSymbol}`)
      if (response.ok) {
        const data = await response.json()
        addLog('info', `━━━ ${data.symbol} ━━━`)
        addLog('info', `Name: ${data.name}`)
        addLog('info', `Price: $${data.price.toFixed(2)}`)
        addLog('info', `Change: ${data.change >= 0 ? '+' : ''}$${data.change.toFixed(2)} (${data.changePercent >= 0 ? '+' : ''}${data.changePercent.toFixed(2)}%)`)
        addLog('info', `Day Range: $${data.low.toFixed(2)} - $${data.high.toFixed(2)}`)
        addLog('info', `Market State: ${data.marketState}`)
        addLog('info', `Watching: ${watchedStocks.includes(upperSymbol) ? 'Yes' : 'No'}`)
      } else {
        addLog('error', `Symbol '${upperSymbol}' not found`)
      }
    } catch {
      addLog('error', `Failed to fetch info for ${upperSymbol}`)
    }
  }

  const compareStocks = async (symbol1: string, symbol2: string) => {
    const s1 = symbol1.toUpperCase()
    const s2 = symbol2.toUpperCase()
    addLog('system', `Comparing ${s1} vs ${s2}...`)

    try {
      const [res1, res2] = await Promise.all([
        fetch(`/api/stock/${s1}`),
        fetch(`/api/stock/${s2}`)
      ])

      if (!res1.ok || !res2.ok) {
        addLog('error', `Could not fetch data for one or both symbols`)
        return
      }

      const [d1, d2] = await Promise.all([res1.json(), res2.json()])

      addLog('info', `━━━ ${s1} vs ${s2} ━━━`)
      addLog('info', ``)
      addLog('info', `Price:       $${d1.price.toFixed(2).padStart(10)} | $${d2.price.toFixed(2).padStart(10)}`)
      addLog('info', `Change:      ${(d1.changePercent >= 0 ? '+' : '') + d1.changePercent.toFixed(2).padStart(9)}% | ${(d2.changePercent >= 0 ? '+' : '') + d2.changePercent.toFixed(2).padStart(9)}%`)
      addLog('info', ``)
      const winner = d1.changePercent > d2.changePercent ? s1 : d2.changePercent > d1.changePercent ? s2 : 'TIE'
      addLog('success', `Today's winner: ${winner}`)
    } catch {
      addLog('error', `Failed to compare stocks`)
    }
  }

  const analyzeStock = async (symbol: string) => {
    const upperSymbol = symbol.toUpperCase()
    addLog('system', `Analyzing ${upperSymbol}...`)

    try {
      const response = await fetch(`/api/stock/${upperSymbol}`)
      if (!response.ok) {
        addLog('error', `Symbol '${upperSymbol}' not found`)
        return
      }
      const d = await response.json()

      // Trend signals
      const aboveFiftyDay = d.fiftyDayAvg > 0 && d.price > d.fiftyDayAvg
      const aboveTwoHundredDay = d.twoHundredDayAvg > 0 && d.price > d.twoHundredDayAvg
      const weekRange = d.fiftyTwoWeekHigh - d.fiftyTwoWeekLow
      const posInRange = weekRange > 0 ? ((d.price - d.fiftyTwoWeekLow) / weekRange) * 100 : null
      const targetUpside = d.targetPrice ? ((d.targetPrice - d.price) / d.price) * 100 : null
      const volVsAvg = d.avgVolume > 0 ? ((d.volume / d.avgVolume) * 100).toFixed(0) : null

      addLog('info', `━━━ Analysis: ${d.symbol} — ${d.name} ━━━`)
      addLog('info', ``)
      addLog('info', `── Price ──────────────────────────────────`)
      addLog('info', `  Current     $${d.price.toFixed(2)}   ${d.changePercent >= 0 ? '▲' : '▼'} ${Math.abs(d.changePercent).toFixed(2)}% today`)
      addLog('info', `  Day Range   $${d.low.toFixed(2)} – $${d.high.toFixed(2)}`)
      if (d.fiftyTwoWeekLow > 0) {
        addLog('info', `  52-Wk Range $${d.fiftyTwoWeekLow.toFixed(2)} – $${d.fiftyTwoWeekHigh.toFixed(2)}`)
        if (posInRange !== null) addLog('info', `  52-Wk Pos.  ${posInRange.toFixed(1)}% (0%=yearly low, 100%=yearly high)`)
      }
      addLog('info', ``)
      addLog('info', `── Moving Averages ─────────────────────────`)
      if (d.fiftyDayAvg > 0) {
        const diff50 = (((d.price - d.fiftyDayAvg) / d.fiftyDayAvg) * 100).toFixed(2)
        addLog('info', `  50-Day MA   $${d.fiftyDayAvg.toFixed(2)}  (${aboveFiftyDay ? '+' : ''}${diff50}%) ${aboveFiftyDay ? '↑ Bullish' : '↓ Bearish'}`)
      } else {
        addLog('info', `  50-Day MA   N/A`)
      }
      if (d.twoHundredDayAvg > 0) {
        const diff200 = (((d.price - d.twoHundredDayAvg) / d.twoHundredDayAvg) * 100).toFixed(2)
        addLog('info', `  200-Day MA  $${d.twoHundredDayAvg.toFixed(2)}  (${aboveTwoHundredDay ? '+' : ''}${diff200}%) ${aboveTwoHundredDay ? '↑ Bullish' : '↓ Bearish'}`)
      } else {
        addLog('info', `  200-Day MA  N/A`)
      }
      addLog('info', ``)
      addLog('info', `── Fundamentals ────────────────────────────`)
      addLog('info', `  Market Cap  ${d.marketCap}`)
      addLog('info', `  P/E Ratio   ${d.peRatio !== null ? d.peRatio : 'N/A'}${d.forwardPE !== null ? `  (Fwd: ${d.forwardPE})` : ''}`)
      addLog('info', `  EPS         ${d.eps !== null ? '$' + d.eps : 'N/A'}`)
      addLog('info', `  Beta        ${d.beta !== null ? d.beta : 'N/A'}${d.beta !== null ? (d.beta > 1.5 ? '  (High volatility)' : d.beta < 0.8 ? '  (Low volatility)' : '  (Market-like)') : ''}`)
      if (d.dividendYield !== null) {
        addLog('info', `  Dividend    ${d.dividendYield}% yield  ($${d.dividendRate ?? 'N/A'}/sh)`)
      } else {
        addLog('info', `  Dividend    None`)
      }
      addLog('info', ``)
      addLog('info', `── Volume ──────────────────────────────────`)
      addLog('info', `  Today       ${d.volume > 0 ? d.volume.toLocaleString() : 'N/A'}${volVsAvg ? ` (${volVsAvg}% of avg)` : ''}`)
      addLog('info', `  Avg Volume  ${d.avgVolume > 0 ? d.avgVolume.toLocaleString() : 'N/A'}`)
      addLog('info', ``)
      if (d.targetPrice !== null && targetUpside !== null) {
        addLog('info', `── Analyst Target ──────────────────────────`)
        addLog('info', `  Price Tgt   $${d.targetPrice.toFixed(2)}  (${targetUpside >= 0 ? '+' : ''}${targetUpside.toFixed(1)}% upside)`)
        addLog('info', ``)
      }
      // Summary signal
      const bullCount = [aboveFiftyDay, aboveTwoHundredDay, (d.changePercent >= 0)].filter(Boolean).length
      const signal = bullCount === 3 ? 'BULLISH' : bullCount === 0 ? 'BEARISH' : 'NEUTRAL'
      addLog(signal === 'BULLISH' ? 'success' : signal === 'BEARISH' ? 'error' : 'warning',
        `  Signal: ${signal}  (based on MA position & today's momentum)`)
      addLog('info', `  Tip: Use "news ${upperSymbol}" for latest headlines`)
    } catch {
      addLog('error', `Failed to analyze ${upperSymbol}. Try again.`)
    }
  }

  const fetchNews = async (symbol?: string) => {
    const label = symbol ? symbol.toUpperCase() : 'market'
    addLog('system', `Fetching news for ${label}...`)
    try {
      const url = symbol
        ? `/api/news?symbol=${encodeURIComponent(symbol.toUpperCase())}`
        : '/api/news'
      const response = await fetch(url)
      if (!response.ok) {
        addLog('error', 'Failed to fetch news. Please try again.')
        return
      }
      const data = await response.json()
      const articles: Array<{ title: string; publisher: string; publishedAt: string }> = data.articles ?? []
      if (articles.length === 0) {
        addLog('warning', `No news found for ${label}`)
        return
      }
      addLog('info', `━━━ Latest News: ${label.toUpperCase()} ━━━`)
      articles.forEach((a) => {
        const date = new Date(a.publishedAt)
        const publishTimeStr = date.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false })
        addLog('info', `[${publishTimeStr}] ${a.publisher}`)
        addLog('info', `  ${a.title}`)
      })
    } catch {
      addLog('error', 'Failed to fetch news. Please try again.')
    }
  }

  const searchStocks = async (query: string) => {
    addLog('system', `Searching for "${query}"...`)
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
      if (!response.ok) {
        addLog('error', 'Search failed. Please try again.')
        return
      }
      const data = await response.json()
      const results: Array<{ symbol: string; name: string; exchange: string; type: string }> = data.results ?? []
      if (results.length === 0) {
        addLog('warning', `No results found for "${query}"`)
        return
      }
      addLog('info', `━━━ Search results for "${query}" ━━━`)
      results.forEach((r) => {
        const watched = watchedStocks.includes(r.symbol) ? ' ●' : ''
        addLog('info', `${r.symbol.padEnd(10)} ${r.name.slice(0, 34).padEnd(35)} [${r.exchange}]${watched}`)
      })
      addLog('info', 'Use "add <SYMBOL>" to add a result to your watchlist')
    } catch {
      addLog('error', 'Search failed. Please try again.')
    }
  }

  const addPortfolioEntry = async (symbol: string, shares: number, avgPrice: number) => {
    const upperSymbol = symbol.toUpperCase()
    addLog('system', `Validating ${upperSymbol}...`)
    try {
      const response = await fetch(`/api/stock/${upperSymbol}`)
      if (!response.ok) {
        addLog('error', `Symbol '${upperSymbol}' not found. Check the ticker symbol.`)
        return
      }
      const data = await response.json()
      setPortfolio(prev => {
        const existing = prev.findIndex(e => e.symbol === upperSymbol)
        if (existing !== -1) {
          const updated = [...prev]
          updated[existing] = { ...updated[existing], shares, avgPrice }
          return updated
        }
        return [...prev, { symbol: upperSymbol, shares, avgPrice, addedAt: new Date().toISOString() }]
      })
      const cost = shares * avgPrice
      const currentValue = shares * data.price
      const pnl = currentValue - cost
      const pnlPct = ((pnl / cost) * 100)
      addLog('success', `Added ${upperSymbol} to portfolio: ${shares} shares @ $${avgPrice.toFixed(2)}`)
      addLog('info', `Current value: $${currentValue.toFixed(2)} | P&L: ${pnl >= 0 ? '+' : ''}$${pnl.toFixed(2)} (${pnlPct >= 0 ? '+' : ''}${pnlPct.toFixed(2)}%)`)
    } catch {
      addLog('error', `Failed to validate ${upperSymbol}. Try again.`)
    }
  }

  const showPortfolio = async () => {
    if (portfolio.length === 0) {
      addLog('warning', 'Portfolio is empty. Use "portfolio add <SYMBOL> <SHARES> <PRICE>" to add a position.')
      return
    }
    addLog('info', `━━━ Portfolio (${portfolio.length} position${portfolio.length !== 1 ? 's' : ''}) ━━━`)
    let totalCost = 0
    let totalValue = 0

    for (const entry of portfolio) {
      try {
        const response = await fetch(`/api/stock/${entry.symbol}`)
        if (response.ok) {
          const data = await response.json()
          const cost = entry.shares * entry.avgPrice
          const value = entry.shares * data.price
          const pnl = value - cost
          const pnlPct = cost > 0 ? (pnl / cost) * 100 : 0
          totalCost += cost
          totalValue += value
          addLog('info', `${entry.symbol.padEnd(6)} ${entry.shares}sh @ $${entry.avgPrice.toFixed(2)} | Now $${data.price.toFixed(2)} | P&L ${pnl >= 0 ? '+' : ''}$${pnl.toFixed(2)} (${pnlPct >= 0 ? '+' : ''}${pnlPct.toFixed(2)}%)`)
        } else {
          addLog('info', `${entry.symbol.padEnd(6)} ${entry.shares}sh @ $${entry.avgPrice.toFixed(2)} | Price unavailable`)
        }
      } catch {
        addLog('info', `${entry.symbol.padEnd(6)} ${entry.shares}sh @ $${entry.avgPrice.toFixed(2)} | Price unavailable`)
      }
    }

    const totalPnl = totalValue - totalCost
    const totalPnlPct = totalCost > 0 ? (totalPnl / totalCost) * 100 : 0
    addLog('info', `━━━ Total: $${totalValue.toFixed(2)} | P&L ${totalPnl >= 0 ? '+' : ''}$${totalPnl.toFixed(2)} (${totalPnlPct >= 0 ? '+' : ''}${totalPnlPct.toFixed(2)}%) ━━━`)
  }

  const processCommand = async (cmd: string) => {
    const trimmed = cmd.trim()
    const parts = trimmed.split(/\s+/)
    const command = parts[0].toLowerCase()
    const args = parts.slice(1)

    switch (command) {
      case 'help':
        addLog('info', '━━━ Available Commands ━━━')
        addLog('info', 'add <SYMBOL>          - Add stock/FX pair to watchlist')
        addLog('info', 'remove <SYMBOL>       - Remove stock from watchlist')
        addLog('info', 'search <QUERY>        - Search stocks by name or ticker')
        addLog('info', 'info <SYMBOL>         - Show real-time stock info')
        addLog('info', 'compare A B           - Compare two stocks')
        addLog('info', 'list                  - Show watched stocks')
        addLog('info', 'popular               - Show popular stocks')
        addLog('info', 'news                  - Show latest market news')
        addLog('info', 'news <SYMBOL>         - Show news for a specific stock')
        addLog('info', 'analyze <SYMBOL>      - Full technical & fundamental analysis')
        addLog('info', 'portfolio             - Show portfolio with P&L')
        addLog('info', 'portfolio add <SYMBOL> <SHARES> <PRICE>    - Add position to portfolio')
        addLog('info', 'portfolio remove <SYMBOL>                  - Remove position from portfolio')
        addLog('info', 'system                - Show system info')
        addLog('info', 'clear                 - Clear terminal output')
        addLog('info', 'clearall              - Remove all stocks')
        addLog('info', '━━━ FX / Currency Commands ━━━')
        addLog('info', 'fx                    - Show major exchange rates')
        addLog('info', 'fx <AMOUNT> <FROM> <TO>  - Convert currency (e.g. fx 100 USD EUR)')
        addLog('info', 'fx add <PAIR>         - Add FX pair to watchlist (e.g. fx add EURUSD)')
        addLog('info', '━━━ Tips ━━━')
        addLog('info', '• Any valid stock/ETF ticker works (e.g., SPY, QQQ, BRK.B)')
        addLog('info', '• FX pairs: add EURUSD=X, GBPUSD=X, USDJPY=X etc.')
        addLog('info', '• Use arrow keys for command history')
        addLog('info', '• Tab to autocomplete commands')
        addLog('info', '• Click stock cards to see detailed analysis')
        break

      case 'system':
        const uptime = Math.floor((Date.now() - sessionStart) / 1000)
        const uptimeStr = `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m ${uptime % 60}s`
        addLog('info', '')
        addLog('info', '  ╔═══════════════════════════════════════╗')
        addLog('info', '  ║     >_  SYMBIOSIS TERMINAL            ║')
        addLog('info', '  ╚═══════════════════════════════════════╝')
        addLog('info', '')
        addLog('info', `  Version      : 1.3.0 (build 2026.03.23)`)
        addLog('info', `  Kernel       : Next.js 16 + React 19.2`)
        addLog('info', `  Runtime      : TypeScript 5.x / V8 Engine`)
        addLog('info', `  UI Engine    : TailwindCSS v4 + shadcn/ui`)
        addLog('info', `  Data Source  : Yahoo Finance API (real-time)`)
        addLog('info', `  Protocol     : HTTPS/2 + WebSocket ready`)
        addLog('info', `  Uptime       : ${uptimeStr}`)
        addLog('info', `  Session ID   : ${sessionId}`)
        addLog('info', `  Watchlist    : ${watchedStocks.length} symbol${watchedStocks.length !== 1 ? 's' : ''} tracked`)
        addLog('info', `  Heap Memory  : ${(performance as any)?.memory?.usedJSHeapSize ? `${Math.round(((performance as any).memory.usedJSHeapSize) / 1024 / 1024)}MB used` : 'N/A'}`)        
        addLog('info', `  Platform     : ${navigator.platform}`)
        addLog('info', `  Locale       : ${navigator.language} | ${Intl.DateTimeFormat().resolvedOptions().timeZone}`)
        addLog('info', `  Display      : ${window.screen.width}x${window.screen.height} @ ${window.screen.colorDepth}-bit`)
        addLog('info', `  Connection   : ${(navigator as Navigator & { connection?: { effectiveType?: string } }).connection?.effectiveType || 'Unknown'}`)
        addLog('info', '')
        break

      case 'add':
        if (!args[0]) {
          addLog('error', 'Usage: add <SYMBOL> (e.g., add AAPL)')
          break
        }
        await validateAndAddSymbol(args[0])
        break

      case 'remove':
      case 'rm':
        if (!args[0]) {
          addLog('error', 'Usage: remove <SYMBOL>')
          break
        }
        const rmSymbol = args[0].toUpperCase()
        if (!watchedStocks.includes(rmSymbol)) {
          addLog('warning', `${rmSymbol} is not in your watchlist`)
          break
        }
        onRemoveStock(rmSymbol)
        addLog('success', `Removed ${rmSymbol} from watchlist`)
        break

      case 'list':
      case 'ls':
        if (watchedStocks.length === 0) {
          addLog('warning', 'Watchlist is empty. Use "add <SYMBOL>" to add stocks')
        } else {
          addLog('info', `━━━ Watchlist (${watchedStocks.length} stocks) ━━━`)
          watchedStocks.forEach(symbol => {
            addLog('info', `● ${symbol}`)
          })
        }
        break

      case 'clear':
      case 'cls':
        setLogs([{
          id: Date.now().toString(),
          timestamp: new Date(),
          type: 'system',
          message: 'Terminal cleared'
        }])
        break

      case 'clearall':
        onClearAll()
        addLog('success', 'Removed all stocks from watchlist')
        break

      case 'popular':
        addLog('info', '━━━ Popular Stocks ━━━')
        POPULAR_STOCKS.forEach(symbol => {
          const isWatched = watchedStocks.includes(symbol)
          addLog('info', `${isWatched ? '●' : '○'} ${symbol}`)
        })
        addLog('info', '━━━ Other Ideas ━━━')
        addLog('info', '○ SPY   (S&P 500 ETF)')
        addLog('info', '○ QQQ   (NASDAQ 100 ETF)')
        addLog('info', '○ VTI   (Total Market ETF)')
        addLog('info', 'Use "add <SYMBOL>" to add to watchlist')
        break

      case 'news':
        await fetchNews(args[0])
        break

      case 'analyze':
      case 'analysis':
      case 'az':
        if (!args[0]) {
          addLog('error', 'Usage: analyze <SYMBOL>  (e.g., analyze AAPL)')
          break
        }
        await analyzeStock(args[0])
        break

      case 'search':
      case 'browse':
      case 'find':
        if (!args[0]) {
          addLog('error', 'Usage: search <QUERY> (e.g., search apple or search AAPL)')
          break
        }
        await searchStocks(args.join(' '))
        break

      case 'info':
        if (!args[0]) {
          addLog('error', 'Usage: info <SYMBOL>')
          break
        }
        await getStockInfo(args[0])
        break

      case 'compare':
      case 'cmp':
        if (args.length < 2) {
          addLog('error', 'Usage: compare <SYMBOL1> <SYMBOL2>')
          break
        }
        await compareStocks(args[0], args[1])
        break

      case 'portfolio':
      case 'port': {
        const subCmd = args[0]?.toLowerCase()
        if (!subCmd || subCmd === 'list') {
          await showPortfolio()
        } else if (subCmd === 'add') {
          const portSymbol = args[1]
          const portShares = parseFloat(args[2])
          const portPrice = parseFloat(args[3])
          if (!portSymbol || isNaN(portShares) || isNaN(portPrice)) {
            addLog('error', 'Usage: portfolio add <SYMBOL> <SHARES> <PRICE>')
            addLog('error', 'Example: portfolio add AAPL 10 150.00')
            break
          }
          if (portShares <= 0 || portPrice <= 0) {
            addLog('error', 'Shares and price must be positive numbers')
            break
          }
          await addPortfolioEntry(portSymbol, portShares, portPrice)
        } else if (subCmd === 'remove' || subCmd === 'rm') {
          const rmPortSymbol = args[1]?.toUpperCase()
          if (!rmPortSymbol) {
            addLog('error', 'Usage: portfolio remove <SYMBOL>')
            break
          }
          const exists = portfolio.some(e => e.symbol === rmPortSymbol)
          if (!exists) {
            addLog('warning', `${rmPortSymbol} is not in your portfolio`)
            break
          }
          setPortfolio(prev => prev.filter(e => e.symbol !== rmPortSymbol))
          addLog('success', `Removed ${rmPortSymbol} from portfolio`)
        } else {
          addLog('error', `Unknown portfolio sub-command: '${subCmd}'`)
          addLog('info', 'Usage: portfolio | portfolio add <SYMBOL> <SHARES> <PRICE> | portfolio remove <SYMBOL>')
        }
        break
      }

      case '':
        break

      case 'fx':
      case 'currency':
      case 'convert': {
        // fx                   → show major rates
        // fx 100 USD EUR       → convert
        // fx add EURUSD        → add pair to watchlist
        const FX_MAJOR_PAIRS = [
          ['EUR', 'USD', 'Euro'],
          ['GBP', 'USD', 'British Pound'],
          ['USD', 'JPY', 'Japanese Yen'],
          ['USD', 'CAD', 'Canadian Dollar'],
          ['AUD', 'USD', 'Australian Dollar'],
          ['USD', 'CHF', 'Swiss Franc'],
          ['USD', 'CNY', 'Chinese Yuan'],
          ['USD', 'INR', 'Indian Rupee'],
        ]

        // fx add <PAIR>
        if (args[0]?.toLowerCase() === 'add') {
          const rawPair = args[1]
          if (!rawPair) {
            addLog('error', 'Usage: fx add <PAIR>  (e.g. fx add EURUSD)')
            addLog('info',  'This adds the Yahoo Finance FX symbol <PAIR>=X to your watchlist.')
            break
          }
          const fxSym = rawPair.toUpperCase().replace(/=X$/i, '') + '=X'
          await validateAndAddSymbol(fxSym)
          break
        }

        // fx <AMOUNT> <FROM> <TO>
        const maybeAmount = parseFloat(args[0])
        if (!isNaN(maybeAmount) && args[1] && args[2]) {
          const from = args[1].toUpperCase()
          const to   = args[2].toUpperCase()
          const sym  = `${from}${to}=X`
          addLog('system', `Converting ${maybeAmount} ${from} → ${to}…`)
          try {
            const res = await fetch(`/api/stock/${sym}`)
            if (!res.ok) {
              addLog('error', `Rate not available for ${from}/${to}. Check the currency codes.`)
              break
            }
            const data = await res.json()
            const rate = data.price as number
            const dp   = to === 'JPY' || to === 'KRW' ? 2 : 4
            const result = (maybeAmount * rate).toFixed(dp)
            addLog('success', `${maybeAmount} ${from} = ${result} ${to}`)
            addLog('info',    `Rate: 1 ${from} = ${rate.toFixed(dp)} ${to}`)
            addLog('info',    `Tip: "add ${sym}" to track this pair in your watchlist`)
          } catch {
            addLog('error', 'Failed to fetch exchange rate. Try again.')
          }
          break
        }

        // fx  (no args) → show rates table
        addLog('info', '━━━ Major Exchange Rates (vs USD) ━━━')
        addLog('system', 'Fetching live rates…')
        const rateResults = await Promise.allSettled(
          FX_MAJOR_PAIRS.map(async ([from, to, label]) => {
            const sym = `${from}${to}=X`
            const res = await fetch(`/api/stock/${sym}`)
            if (!res.ok) return null
            const data = await res.json()
            return { from, to, label, rate: data.price as number, sym }
          })
        )
        rateResults.forEach(r => {
          if (r.status === 'fulfilled' && r.value) {
            const { from, to, label, rate, sym } = r.value
            const dp = to === 'JPY' || to === 'KRW' ? 3 : 4
            const pair = `${from}/${to}`.padEnd(8)
            addLog('info', `${pair}  ${rate.toFixed(dp).padStart(10)}   ${label.padEnd(22)} [${sym}]`)
          }
        })
        addLog('info', '─────────────────────────────────────────────────')
        addLog('info', 'Usage: fx <AMOUNT> <FROM> <TO>   e.g. fx 500 GBP JPY')
        addLog('info', 'Usage: fx add <PAIR>             e.g. fx add GBPUSD')
        break
      }

      default:
        // Try to interpret as a symbol if it looks like one
        if (/^[A-Za-z.-]{1,6}$/.test(command) && !args.length) {
          addLog('info', `Did you mean "add ${command.toUpperCase()}" or "info ${command.toUpperCase()}"?`)
        } else {
          addLog('error', `Command not found: '${command}'. Type 'help' for available commands`)
        }
    }
  }

  const handleSubmit = async () => {
    if (!input.trim() || validatingSymbol) return
    
    addLog('system', `> ${input}`, true) // Show timestamp only for user commands
    await processCommand(input)
    setHistory(prev => [input, ...prev])
    setHistoryIndex(-1)
    setInput('')
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSubmit()
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (historyIndex < history.length - 1) {
        const newIndex = historyIndex + 1
        setHistoryIndex(newIndex)
        setInput(history[newIndex])
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1
        setHistoryIndex(newIndex)
        setInput(history[newIndex])
      } else if (historyIndex === 0) {
        setHistoryIndex(-1)
        setInput('')
      }
    } else if (e.key === 'Tab') {
      e.preventDefault()
      // Simple tab completion for commands
      const commands = ['help', 'add', 'remove', 'search', 'browse', 'list', 'clear', 'clearall', 'popular', 'news', 'analyze', 'analysis', 'az', 'info', 'compare', 'system', 'portfolio', 'fx', 'currency', 'convert']
      const match = commands.find(c => c.startsWith(input.toLowerCase()))
      if (match) setInput(match + ' ')
    }
  }

  const getLogColor = (type: TerminalLog['type']) => {
    switch (type) {
      case 'success': return 'text-primary'
      case 'error': return 'text-destructive'
      case 'warning': return 'text-yellow-500'
      case 'system': return 'text-muted-foreground'
      default: return 'text-foreground'
    }
  }

  return (
    <div 
      className="border border-border bg-card rounded-md overflow-hidden flex flex-col h-full"
      onClick={() => inputRef.current?.focus()}
    >
      {/* Terminal Header */}
      <div className="flex items-center gap-2 px-4 py-2 border-b border-border bg-muted/30">
        <div className="flex gap-1.5">
          <span className="w-3 h-3 rounded-full bg-destructive/60" />
          <span className="w-3 h-3 rounded-full bg-yellow-500/60" />
          <span className="w-3 h-3 rounded-full bg-primary/60" />
        </div>
        <span className="text-xs text-muted-foreground ml-2">symbiosis@terminal ~ </span>
      </div>

      {/* Logs Output */}
      <div ref={logsContainerRef} className="flex-1 overflow-y-auto p-4 font-mono text-sm min-h-[280px] max-h-[400px]">
        {logs.map((log) => (
          <div key={log.id} className={cn("mb-0.5", getLogColor(log.type))}>
            {log.showTimestamp && (
              <span className="text-muted-foreground text-xs mr-2">
                [{log.timestamp.toLocaleTimeString('en-US', { hour12: false })}]
              </span>
            )}
            <span className="whitespace-pre-wrap">{log.message}</span>
          </div>
        ))}
        <div ref={logsEndRef} />
      </div>

      {/* Input Line */}
      <div className="border-t border-border px-4 py-3 bg-muted/20">
        <div className="flex items-center gap-2">
          <span className="text-primary font-bold">{'>'}_</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground font-mono"
            placeholder={validatingSymbol ? `Validating ${validatingSymbol}...` : "Enter command..."}
            spellCheck={false}
            autoComplete="off"
            disabled={!!validatingSymbol}
          />
        </div>
      </div>
    </div>
  )
}
