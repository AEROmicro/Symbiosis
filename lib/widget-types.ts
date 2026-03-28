export type WidgetType =
  | 'terminal'
  | 'terminal-sm'
  | 'terminal-lg'
  | 'watchlist'
  | 'stock-detail'
  | 'quick-actions'
  | 'system-status'
  | 'news'
  | 'portfolio'
  | 'clock'
  | 'market-hours'
  | 'currency'
  | 'market-stats'
  | 'heatmap'
  | 'crypto'
  | 'economic-calendar'
  | 'help'

export interface WidgetConfig {
  id: string
  type: WidgetType
  x: number
  y: number
  w: number
  h: number
  minW?: number
  minH?: number
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
  category: 'recommended' | 'market' | 'tools' | 'info'
  color: string
}

export const WIDGET_CATALOG: WidgetMeta[] = [
  // ── Terminal variants ──────────────────────────────────────────────────────
  {
    type: 'terminal-sm',
    name: 'Terminal (S)',
    description: 'Small command-line interface — fits beside other widgets',
    iconName: 'Terminal',
    defaultW: 4,
    defaultH: 9,
    minW: 3,
    minH: 9,
    category: 'recommended',
    color: 'bg-primary/20',
  },
  {
    type: 'terminal',
    name: 'Terminal (M)',
    description: 'Medium command-line interface for stock queries and operations',
    iconName: 'Terminal',
    defaultW: 4,
    defaultH: 14,
    minW: 3,
    minH: 14,
    category: 'recommended',
    color: 'bg-primary/20',
  },
  {
    type: 'terminal-lg',
    name: 'Terminal (L)',
    description: 'Large command-line interface — maximum visible history',
    iconName: 'Terminal',
    defaultW: 4,
    defaultH: 22,
    minW: 3,
    minH: 22,
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
    defaultH: 8,
    minW: 4,
    minH: 8,
    maxH: 8,
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
    minW: 3,
    minH: 6,
    category: 'recommended',
    color: 'bg-yellow-500/20',
  },
  {
    type: 'system-status',
    name: 'System Status',
    description: 'Connection status, data feed info, and quick tool access',
    iconName: 'Server',
    defaultW: 4,
    defaultH: 10,
    minW: 3,
    minH: 10,
    category: 'recommended',
    color: 'bg-slate-500/20',
  },
  {
    type: 'news',
    name: 'News',
    description: 'Latest market headlines and symbol-specific news feed',
    iconName: 'Newspaper',
    defaultW: 4,
    defaultH: 8,
    minW: 3,
    minH: 8,
    category: 'recommended',
    color: 'bg-orange-500/20',
  },
  {
    type: 'portfolio',
    name: 'Portfolio',
    description: 'Live portfolio positions with P&L tracking',
    iconName: 'Briefcase',
    defaultW: 5,
    defaultH: 9,
    minW: 3,
    minH: 9,
    category: 'recommended',
    color: 'bg-emerald-500/20',
  },
  {
    type: 'clock',
    name: 'Clock',
    description: 'Live clock with major market timezone times',
    iconName: 'Clock',
    defaultW: 3,
    defaultH: 5,
    minW: 2,
    minH: 5,
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
    minW: 3,
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
    minW: 3,
    minH: 7,
    category: 'market',
    color: 'bg-violet-500/20',
  },
  {
    type: 'heatmap',
    name: 'Sector Heatmap',
    description: 'Color-coded sector performance tiles updated in real-time',
    iconName: 'Map',
    defaultW: 5,
    defaultH: 9,
    minW: 3,
    minH: 9,
    category: 'market',
    color: 'bg-rose-500/20',
  },
  {
    type: 'crypto',
    name: 'Crypto',
    description: 'Major cryptocurrency prices and 24h change percentages',
    iconName: 'Bitcoin',
    defaultW: 4,
    defaultH: 8,
    minW: 3,
    minH: 8,
    category: 'market',
    color: 'bg-amber-500/20',
  },
  {
    type: 'currency',
    name: 'Currency',
    description: 'Live FX rates and currency converter for major pairs',
    iconName: 'DollarSign',
    defaultW: 5,
    defaultH: 10,
    minW: 3,
    minH: 10,
    category: 'tools',
    color: 'bg-lime-500/20',
  },
  {
    type: 'economic-calendar',
    name: 'Economic Calendar',
    description: 'Upcoming high-impact economic events and releases',
    iconName: 'CalendarDays',
    defaultW: 5,
    defaultH: 13,
    minW: 3,
    minH: 13,
    category: 'tools',
    color: 'bg-sky-500/20',
  },
  {
    type: 'help',
    name: 'Help',
    description: 'Quick reference for all terminal commands',
    iconName: 'HelpCircle',
    defaultW: 5,
    defaultH: 5,
    minW: 3,
    minH: 5,
    category: 'info',
    color: 'bg-zinc-500/20',
  },
]

export const DEFAULT_WIDGET_LAYOUT: WidgetConfig[] = [
  { id: 'terminal-sm-1',   type: 'terminal-sm',   x: 0, y: 0,  w: 4, h: 9,  minW: 3, minH: 9  },
  { id: 'quick-actions-1', type: 'quick-actions', x: 0, y: 9,  w: 4, h: 6,  minW: 3, minH: 6  },
  { id: 'system-status-1', type: 'system-status', x: 0, y: 15, w: 4, h: 7,  minW: 3, minH: 7  },
  { id: 'watchlist-1',     type: 'watchlist',     x: 4, y: 0,  w: 8, h: 8,  minW: 4, minH: 8  },
  { id: 'stock-detail-1',  type: 'stock-detail',  x: 4, y: 8,  w: 8, h: 18, minW: 4, minH: 18 },
  { id: 'help-1',          type: 'help',          x: 4, y: 26, w: 8, h: 5,  minW: 3, minH: 5  },
]

export const WIDGET_LAYOUT_KEY = 'symbiosis-widget-layout'
