'use client'

export function HelpWidget() {
  const commands = [
    { cmd: 'add AAPL',                    desc: 'Add stock to watchlist' },
    { cmd: 'remove AAPL',                 desc: 'Remove stock' },
    { cmd: 'search apple',                desc: 'Search stocks by name' },
    { cmd: 'list',                        desc: 'Show watchlist' },
    { cmd: 'portfolio',                   desc: 'View portfolio P&L' },
    { cmd: 'portfolio add AAPL 10 150',   desc: 'Add position' },
    { cmd: 'portfolio remove AAPL',       desc: 'Remove position' },
    { cmd: 'fx',                          desc: 'Major exchange rates' },
    { cmd: 'fx 100 USD EUR',              desc: 'Convert currency' },
    { cmd: 'fx add EURUSD',               desc: 'Track FX pair' },
    { cmd: 'news',                        desc: 'Market news' },
    { cmd: 'news AAPL',                   desc: 'Stock-specific news' },
    { cmd: 'analyze AAPL',                desc: 'Full analysis' },
    { cmd: 'az AAPL',                     desc: 'Analysis (short)' },
    { cmd: 'popular',                     desc: 'Popular stocks' },
    { cmd: 'compare AAPL MSFT',           desc: 'Compare two stocks' },
    { cmd: 'system',                      desc: 'Show system information' },
    { cmd: 'export watchlist 30',         desc: 'Export watchlist to .CSV' },
    { cmd: 'export portfolio 30',         desc: 'Export portfolio to .CSV' },
    { cmd: 'export AAPL 30',              desc: 'Export symbol to .CSV' },
    { cmd: 'clear',                       desc: 'Clear terminal' },
    { cmd: 'clearall',                    desc: 'Clear watchlist' },
    { cmd: 'popular',                     desc: 'See trending stocks' },
    { cmd: 'help',                        desc: 'All commands' },


  ]

  return (
    <div className="p-4 h-full">
      <div className="text-xs text-muted-foreground font-mono">
        <div className="text-primary mb-3">{'// Quick Reference'}</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1">
          {commands.map(({ cmd, desc }) => (
            <div key={cmd} className="flex gap-2 min-w-0">
              <span className="text-foreground shrink-0">{cmd}</span>
              <span className="text-muted-foreground truncate">— {desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
