export type WidgetType =
  | 'terminal'
  | 'terminal-sm'
  | 'terminal-lg'
  | 'watchlist'
  | 'stock-detail'
  | 'quick-actions'
  | 'system-status'
  | 'news'
  | 'news-lg'
  | 'portfolio'
  | 'clock'
  | 'analog-clock'
  | 'market-hours'
  | 'currency'
  | 'market-stats'
  | 'heatmap'
  | 'crypto'
  | 'economic-calendar'
  | 'top-movers'
  | 'help'
  | 'fear-greed'
  | 'notes'
  | 'notes-lg'
  | 'spacer-sm'
  | 'spacer-md'
  | 'spacer-lg'

export interface WidgetConfig {
  id: string
  type: WidgetType
  x: number
  y: number
  w: number
  h: number
  minW?: number
  minH?: number
  maxW?: number // Added this
  maxH?: number // Added this
}

export interface WidgetMeta {
  type: WidgetType
  name: string
  description: string
  iconName: string
  defaultW: number
  defaultH: number
  minW: number
  minH: number
  maxW?: number // Added this
  maxH?: number // Added this
  category: 'recommended' | 'market' | 'tools' | 'info' | 'layout'
  color: string
}

export const WIDGET_CATALOG: WidgetMeta[] = [
  {
    type: 'terminal-sm',
    name: 'Terminal (S)',
    description: 'Small command-line interface — fits beside other widgets',
    iconName: 'Terminal',
    defaultW: 4,
    defaultH: 10,
    minW: 4,
    minH: 10,
    category: 'recommended',
    color: 'bg-primary/20',
  },
  {
    type: 'terminal',
    name: 'Terminal (M)',
    description: 'Medium full-width terminal — spans the entire dashboard width',
    iconName: 'Terminal',
    defaultW: 12,
    defaultH: 12,
    minW: 8,
    minH: 12,
    category: 'recommended',
    color: 'bg-primary/20',
  },
  {
    type: 'terminal-lg',
    name: 'Terminal (L)',
    description: 'Large full-width terminal — maximum history, spans the entire dashboard width',
    iconName: 'Terminal',
    defaultW: 12,
    defaultH: 16,
    minW: 8,
    minH: 14,
    category: 'recommended',
    color: 'bg-primary/20',
  },
  {
    type: 'watchlist',
    name: 'Watchlist',
    description: 'Live stock cards for all symbols in your watchlist',
    iconName: 'LayoutGrid',
    defaultW: 8,
    defaultH: 8,
    minW: 4,
    minH: 8,
    category: 'recommended',
    color: 'bg-blue-500/20',
  },
  {
    type: 'stock-detail',
    name: 'Stock Detail',
    description: 'Deep metrics and price chart for the selected stock',
    iconName: 'TrendingUp',
    defaultW: 8,
    defaultH: 14,
    minW: 4,
    minH: 14,
    maxH: 14,
    category: 'recommended',
    color: 'bg-indigo-500/20',
  },
  {
    type: 'quick-actions',
    name: 'Quick Actions',
    description: 'One-click buttons to add stocks, indices, ETFs, and crypto; clear watchlist',
    iconName: 'Zap',
    defaultW: 4,
    defaultH: 6,
    minW: 4,
    minH: 6,
    category: 'recommended',
    color: 'bg-yellow-500/20',
  },
  {
    type: 'system-status',
    name: 'System Status',
    description: 'Connection status, data feed info, market session, and quick tool access',
    iconName: 'Server',
    defaultW: 4,
    defaultH: 7,
    minW: 4,
    minH: 7,
    maxH: 7,
    category: 'recommended',
    color: 'bg-slate-500/20',
  },
  {
    type: 'news',
    name: 'News (S)',
    description: 'Latest market headlines and symbol-specific news feed',
    iconName: 'Newspaper',
    defaultW: 4,
    defaultH: 8,
    minW: 4,
    minH: 8,
    category: 'recommended',
    color: 'bg-orange-500/20',
  },
  {
    type: 'news-lg',
    name: 'News (L)',
    description: 'Wide market headlines feed — spans 8 columns with more room for articles',
    iconName: 'Newspaper',
    defaultW: 8,
    defaultH: 10,
    minW: 8,
    minH: 10,
    category: 'recommended',
    color: 'bg-orange-500/20',
  },
  {
    type: 'portfolio',
    name: 'Portfolio',
    description: 'Live portfolio positions with P&L tracking',
    iconName: 'Briefcase',
    defaultW: 4,
    defaultH: 9,
    minW: 4,
    minH: 9,
    category: 'recommended',
    color: 'bg-emerald-500/20',
  },
  {
    type: 'clock',
    name: 'Clock',
    description: 'Live digital clock with major market timezone times',
    iconName: 'Clock',
    defaultW: 4,
    defaultH: 5,
    minW: 4,
    minH: 5,
    category: 'recommended',
    color: 'bg-cyan-500/20',
  },
  {
    type: 'analog-clock',
    name: 'Analog Clock',
    description: 'SVG analog clock with hands plus market timezone open/close status',
    iconName: 'Clock',
    defaultW: 4,
    defaultH: 11,
    minW: 4,
    minH: 9,
    category: 'recommended',
    color: 'bg-cyan-500/20',
  },
  {
    type: 'market-hours',
    name: 'Market Hours',
    description: 'Open/closed status for global stock exchanges',
    iconName: 'Globe',
    defaultW: 4,
    defaultH: 7,
    minW: 4,
    minH: 7,
    category: 'recommended',
    color: 'bg-teal-500/20',
  },
  {
    type: 'market-stats',
    name: 'Market Stats',
    description: 'Real-time major index prices and percentage changes',
    iconName: 'Activity',
    defaultW: 4,
    defaultH: 7,
    minW: 4,
    minH: 7,
    category: 'market',
    color: 'bg-violet-500/20',
  },
  {
    type: 'heatmap',
    name: 'Sector Heatmap',
    description: 'Color-coded sector performance tiles updated in real-time',
    iconName: 'Map',
    defaultW: 4,
    defaultH: 9,
    minW: 4,
    minH: 9,
    category: 'market',
    color: 'bg-rose-500/20',
  },
  {
    type: 'top-movers',
    name: 'Top Movers',
    description: 'Biggest gainers and losers across all tracked instruments',
    iconName: 'TrendingUp',
    defaultW: 4,
    defaultH: 9,
    minW: 4,
    minH: 9,
    category: 'market',
    color: 'bg-fuchsia-500/20',
  },
  {
    type: 'crypto',
    name: 'Crypto',
    description: 'Major cryptocurrency prices and 24h change percentages',
    iconName: 'Bitcoin',
    defaultW: 4,
    defaultH: 8,
    minW: 4,
    minH: 8,
    category: 'market',
    color: 'bg-amber-500/20',
  },
  {
    type: 'currency',
    name: 'Currency',
    description: 'Live FX rates and currency converter for major pairs',
    iconName: 'DollarSign',
    defaultW: 4,
    defaultH: 10,
    minW: 4,
    minH: 10,
    category: 'tools',
    color: 'bg-lime-500/20',
  },
  {
    type: 'economic-calendar',
    name: 'Economic Calendar',
    description: 'Upcoming high-impact economic events and releases',
    iconName: 'CalendarDays',
    defaultW: 4,
    defaultH: 13,
    minW: 4,
    minH: 13,
    category: 'tools',
    color: 'bg-sky-500/20',
  },
  {
    type: 'help',
    name: 'Help',
    description: 'Quick reference for all terminal commands',
    iconName: 'HelpCircle',
    defaultW: 8,
    defaultH: 8,
    minW: 8,
    minH: 6,
    category: 'info',
    color: 'bg-zinc-500/20',
  },
  {
    type: 'fear-greed',
    name: 'Fear & Greed',
    description: 'Market sentiment score derived from VIX and SPY momentum',
    iconName: 'Activity',
    defaultW: 4,
    defaultH: 9,
    minW: 4,
    minH: 9,
    category: 'market',
    color: 'bg-yellow-500/20',
  },
  {
    type: 'notes',
    name: 'Notes (S)',
    description: 'Scratch pad for trade ideas, tickers, or anything else',
    iconName: 'Terminal',
    defaultW: 4,
    defaultH: 5,
    minW: 4,
    minH: 5,
    category: 'tools',
    color: 'bg-zinc-500/20',
  },
  {
    type: 'notes-lg',
    name: 'Notes (L)',
    description: 'Scratch pad for trade ideas, tickers, or anything else; now larger',
    iconName: 'Terminal',
    defaultW: 8,
    defaultH: 8,
    minW: 4,
    minH: 8,
    category: 'tools',
    color: 'bg-zinc-500/20',
  },
  {
    type: 'spacer-sm',
    name: 'Spacer (S)',
    description: 'Invisible 4-column spacer for layout alignment',
    iconName: 'LayoutGrid',
    defaultW: 4,
    defaultH: 1,
    minW: 4,
    minH: 1,
    maxW: 4,
    maxH: 1,
    category: 'layout',
    color: 'bg-muted/40',
  },
  {
    type: 'spacer-md',
    name: 'Spacer (M)',
    description: 'Invisible 8-column spacer for layout alignment',
    iconName: 'LayoutGrid',
    defaultW: 8,
    defaultH: 1,
    minW: 8,
    minH: 1,
    maxW: 8,
    maxH: 1,
    category: 'layout',
    color: 'bg-muted/40',
  },
  {
    type: 'spacer-lg',
    name: 'Spacer (L)',
    description: 'Invisible 12-column spacer for layout alignment',
    iconName: 'LayoutGrid',
    defaultW: 12,
    defaultH: 1,
    minW: 12,
    minH: 1,
    maxW: 12,
    maxH: 1,
    category: 'layout',
    color: 'bg-muted/40',
  },
]

export const DEFAULT_WIDGET_LAYOUT: WidgetConfig[] = [
  { id: 'clock-1',         type: 'clock',         x: 0, y: 0,  w: 4, h: 5,  minW: 4, minH: 5  },
  { id: 'terminal-sm-1',   type: 'terminal-sm',   x: 0, y: 5,  w: 4, h: 9,  minW: 4, minH: 9  },
  { id: 'quick-actions-1', type: 'quick-actions', x: 0, y: 14, w: 4, h: 7,  minW: 4, minH: 7  },
  { id: 'system-status-1', type: 'system-status', x: 0, y: 21, w: 4, h: 7,  minW: 4, minH: 7, maxH: 7 },
  { id: 'notes-1',         type: 'notes',         x: 0, y: 28, w: 4, h: 5,  minW: 4, minH: 7, maxH: 7 },
  { id: 'watchlist-1',     type: 'watchlist',     x: 4, y: 0,  w: 8, h: 8,  minW: 4, minH: 8  },
  { id: 'stock-detail-1',  type: 'stock-detail',  x: 4, y: 8,  w: 8, h: 10, minW: 4, minH: 8, maxH: 10 },
  { id: 'heatmap-1',       type: 'heatmap',       x: 4, y: 18, w: 4, h: 9,  minW: 4, minH: 9  },
  { id: 'top-movers-1',    type: 'top-movers',    x: 8, y: 18, w: 4, h: 9,  minW: 4, minH: 9  },
  { id: 'help-1',          type: 'help',          x: 4, y: 27, w: 8, h: 5,  minW: 4, minH: 8  },
]

export const WIDGET_LAYOUT_KEY = 'symbiosis-widget-layout'
