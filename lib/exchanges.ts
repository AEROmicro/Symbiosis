export interface ExchangeDef {
  id: string
  name: string
  region: string
  country: string
  timezone: string
  openHour: number
  openMinute: number
  closeHour: number
  closeMinute: number
  /** Local-time label shown in the system status widget, e.g. "09:30 – 16:00" */
  hoursLabel: string
  /** Two-letter country code for flag emoji (unused in rendering but helpful) */
  flag: string
}

export const EXCHANGES: ExchangeDef[] = [
  { id: 'NYSE',    name: 'NYSE / NASDAQ',      region: 'New York',      country: 'US',  timezone: 'America/New_York',    openHour: 9,  openMinute: 30, closeHour: 16, closeMinute: 0,  hoursLabel: '09:30 – 16:00', flag: '🇺🇸' },
  { id: 'TSX',     name: 'Toronto (TSX)',       region: 'Toronto',       country: 'CA',  timezone: 'America/Toronto',     openHour: 9,  openMinute: 30, closeHour: 16, closeMinute: 0,  hoursLabel: '09:30 – 16:00', flag: '🇨🇦' },
  { id: 'BMV',     name: 'Mexico City (BMV)',   region: 'Mexico City',   country: 'MX',  timezone: 'America/Mexico_City', openHour: 8,  openMinute: 30, closeHour: 15, closeMinute: 0,  hoursLabel: '08:30 – 15:00', flag: '🇲🇽' },
  { id: 'B3',      name: 'São Paulo (B3)',       region: 'São Paulo',     country: 'BR',  timezone: 'America/Sao_Paulo',   openHour: 10, openMinute: 0,  closeHour: 17, closeMinute: 0,  hoursLabel: '10:00 – 17:00', flag: '🇧🇷' },
  { id: 'LSE',     name: 'London (LSE)',         region: 'London',        country: 'GB',  timezone: 'Europe/London',       openHour: 8,  openMinute: 0,  closeHour: 16, closeMinute: 30, hoursLabel: '08:00 – 16:30', flag: '🇬🇧' },
  { id: 'EURONEXT',name: 'Euronext Paris',       region: 'Paris',         country: 'FR',  timezone: 'Europe/Paris',        openHour: 9,  openMinute: 0,  closeHour: 17, closeMinute: 30, hoursLabel: '09:00 – 17:30', flag: '🇫🇷' },
  { id: 'XETRA',   name: 'Frankfurt (XETRA)',    region: 'Frankfurt',     country: 'DE',  timezone: 'Europe/Berlin',       openHour: 9,  openMinute: 0,  closeHour: 17, closeMinute: 30, hoursLabel: '09:00 – 17:30', flag: '🇩🇪' },
  { id: 'AMS',     name: 'Amsterdam (AEX)',      region: 'Amsterdam',     country: 'NL',  timezone: 'Europe/Amsterdam',    openHour: 9,  openMinute: 0,  closeHour: 17, closeMinute: 30, hoursLabel: '09:00 – 17:30', flag: '🇳🇱' },
  { id: 'BME',     name: 'Madrid (BME)',         region: 'Madrid',        country: 'ES',  timezone: 'Europe/Madrid',       openHour: 9,  openMinute: 0,  closeHour: 17, closeMinute: 35, hoursLabel: '09:00 – 17:35', flag: '🇪🇸' },
  { id: 'BIT',     name: 'Milan (Borsa Italiana)',region: 'Milan',        country: 'IT',  timezone: 'Europe/Rome',         openHour: 9,  openMinute: 0,  closeHour: 17, closeMinute: 35, hoursLabel: '09:00 – 17:35', flag: '🇮🇹' },
  { id: 'SIX',     name: 'Zürich (SIX)',         region: 'Zürich',        country: 'CH',  timezone: 'Europe/Zurich',       openHour: 9,  openMinute: 0,  closeHour: 17, closeMinute: 30, hoursLabel: '09:00 – 17:30', flag: '🇨🇭' },
  { id: 'OSE',     name: 'Oslo Børs',            region: 'Oslo',          country: 'NO',  timezone: 'Europe/Oslo',         openHour: 9,  openMinute: 0,  closeHour: 16, closeMinute: 20, hoursLabel: '09:00 – 16:20', flag: '🇳🇴' },
  { id: 'OMXS',    name: 'Stockholm (OMX)',      region: 'Stockholm',     country: 'SE',  timezone: 'Europe/Stockholm',    openHour: 9,  openMinute: 0,  closeHour: 17, closeMinute: 30, hoursLabel: '09:00 – 17:30', flag: '🇸🇪' },
  { id: 'OMXC',    name: 'Copenhagen (OMX)',     region: 'Copenhagen',    country: 'DK',  timezone: 'Europe/Copenhagen',   openHour: 9,  openMinute: 0,  closeHour: 17, closeMinute: 0,  hoursLabel: '09:00 – 17:00', flag: '🇩🇰' },
  { id: 'OMXH',    name: 'Helsinki (OMX)',       region: 'Helsinki',      country: 'FI',  timezone: 'Europe/Helsinki',     openHour: 9,  openMinute: 0,  closeHour: 18, closeMinute: 30, hoursLabel: '09:00 – 18:30', flag: '🇫🇮' },
  { id: 'GPW',     name: 'Warsaw (GPW)',         region: 'Warsaw',        country: 'PL',  timezone: 'Europe/Warsaw',       openHour: 9,  openMinute: 0,  closeHour: 17, closeMinute: 5,  hoursLabel: '09:00 – 17:05', flag: '🇵🇱' },
  { id: 'WBAG',    name: 'Vienna (Wiener Börse)',region: 'Vienna',        country: 'AT',  timezone: 'Europe/Vienna',       openHour: 9,  openMinute: 0,  closeHour: 17, closeMinute: 35, hoursLabel: '09:00 – 17:35', flag: '🇦🇹' },
  { id: 'EURONEXT_BR', name: 'Brussels (Euronext)', region: 'Brussels',  country: 'BE',  timezone: 'Europe/Brussels',     openHour: 9,  openMinute: 0,  closeHour: 17, closeMinute: 30, hoursLabel: '09:00 – 17:30', flag: '🇧🇪' },
  { id: 'JSE',     name: 'Johannesburg (JSE)',   region: 'Johannesburg',  country: 'ZA',  timezone: 'Africa/Johannesburg', openHour: 9,  openMinute: 0,  closeHour: 17, closeMinute: 0,  hoursLabel: '09:00 – 17:00', flag: '🇿🇦' },
  { id: 'TSE',     name: 'Tokyo (TSE)',          region: 'Tokyo',         country: 'JP',  timezone: 'Asia/Tokyo',          openHour: 9,  openMinute: 0,  closeHour: 15, closeMinute: 30, hoursLabel: '09:00 – 15:30', flag: '🇯🇵' },
  { id: 'HKEX',    name: 'Hong Kong (HKEX)',     region: 'Hong Kong',     country: 'HK',  timezone: 'Asia/Hong_Kong',      openHour: 9,  openMinute: 30, closeHour: 16, closeMinute: 0,  hoursLabel: '09:30 – 16:00', flag: '🇭🇰' },
  { id: 'SSE',     name: 'Shanghai (SSE)',       region: 'Shanghai',      country: 'CN',  timezone: 'Asia/Shanghai',       openHour: 9,  openMinute: 30, closeHour: 15, closeMinute: 0,  hoursLabel: '09:30 – 15:00', flag: '🇨🇳' },
  { id: 'SZSE',    name: 'Shenzhen (SZSE)',      region: 'Shenzhen',      country: 'CN',  timezone: 'Asia/Shanghai',       openHour: 9,  openMinute: 30, closeHour: 15, closeMinute: 0,  hoursLabel: '09:30 – 15:00', flag: '🇨🇳' },
  { id: 'TWSE',    name: 'Taiwan (TWSE)',        region: 'Taipei',        country: 'TW',  timezone: 'Asia/Taipei',         openHour: 9,  openMinute: 0,  closeHour: 13, closeMinute: 30, hoursLabel: '09:00 – 13:30', flag: '🇹🇼' },
  { id: 'KRX',     name: 'Seoul (KRX)',          region: 'Seoul',         country: 'KR',  timezone: 'Asia/Seoul',          openHour: 9,  openMinute: 0,  closeHour: 15, closeMinute: 30, hoursLabel: '09:00 – 15:30', flag: '🇰🇷' },
  { id: 'BSE',     name: 'Mumbai (BSE / NSE)',   region: 'Mumbai',        country: 'IN',  timezone: 'Asia/Kolkata',        openHour: 9,  openMinute: 15, closeHour: 15, closeMinute: 30, hoursLabel: '09:15 – 15:30', flag: '🇮🇳' },
  { id: 'SGX',     name: 'Singapore (SGX)',      region: 'Singapore',     country: 'SG',  timezone: 'Asia/Singapore',      openHour: 9,  openMinute: 0,  closeHour: 17, closeMinute: 0,  hoursLabel: '09:00 – 17:00', flag: '🇸🇬' },
  { id: 'BURSA',   name: 'Kuala Lumpur (Bursa)', region: 'Kuala Lumpur',  country: 'MY',  timezone: 'Asia/Kuala_Lumpur',   openHour: 9,  openMinute: 0,  closeHour: 17, closeMinute: 0,  hoursLabel: '09:00 – 17:00', flag: '🇲🇾' },
  { id: 'SET',     name: 'Bangkok (SET)',        region: 'Bangkok',       country: 'TH',  timezone: 'Asia/Bangkok',        openHour: 10, openMinute: 0,  closeHour: 16, closeMinute: 30, hoursLabel: '10:00 – 16:30', flag: '🇹🇭' },
  { id: 'IDX',     name: 'Jakarta (IDX)',        region: 'Jakarta',       country: 'ID',  timezone: 'Asia/Jakarta',        openHour: 9,  openMinute: 0,  closeHour: 15, closeMinute: 50, hoursLabel: '09:00 – 15:50', flag: '🇮🇩' },
  { id: 'DFM',     name: 'Dubai (DFM)',          region: 'Dubai',         country: 'AE',  timezone: 'Asia/Dubai',          openHour: 10, openMinute: 0,  closeHour: 14, closeMinute: 0,  hoursLabel: '10:00 – 14:00', flag: '🇦🇪' },
  { id: 'TADAWUL', name: 'Riyadh (Tadawul)',     region: 'Riyadh',        country: 'SA',  timezone: 'Asia/Riyadh',         openHour: 10, openMinute: 0,  closeHour: 15, closeMinute: 0,  hoursLabel: '10:00 – 15:00', flag: '🇸🇦' },
  { id: 'TASE',    name: 'Tel Aviv (TASE)',      region: 'Tel Aviv',      country: 'IL',  timezone: 'Asia/Jerusalem',      openHour: 9,  openMinute: 59, closeHour: 17, closeMinute: 14, hoursLabel: '09:59 – 17:14', flag: '🇮🇱' },
  { id: 'ASX',     name: 'Sydney (ASX)',         region: 'Sydney',        country: 'AU',  timezone: 'Australia/Sydney',    openHour: 10, openMinute: 0,  closeHour: 16, closeMinute: 0,  hoursLabel: '10:00 – 16:00', flag: '🇦🇺' },
  { id: 'NZX',     name: 'Auckland (NZX)',       region: 'Auckland',      country: 'NZ',  timezone: 'Pacific/Auckland',    openHour: 10, openMinute: 0,  closeHour: 16, closeMinute: 45, hoursLabel: '10:00 – 16:45', flag: '🇳🇿' },
]

// Exchanges with a midday lunch break (11:30–13:00 local time) — defined once
// at module level so it is not recreated on every exchangeTimeParts() call.
const LUNCH_BREAK_IDS = new Set(['SSE', 'SZSE', 'HKEX', 'TWSE'])

/**
 * Core helper: resolves the current local time parts for an exchange.
 * Returns { cur, open, close, isWeekend, isLunch } where cur/open/close are
 * minutes-since-midnight in the exchange's own timezone.
 */
function exchangeTimeParts(ex: ExchangeDef) {
  const now = new Date()
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: ex.timezone,
    hour: 'numeric',
    minute: 'numeric',
    hour12: false,
    weekday: 'short',
  }).formatToParts(now)

  const hour    = parseInt(parts.find(p => p.type === 'hour')?.value   ?? '0')
  const minute  = parseInt(parts.find(p => p.type === 'minute')?.value ?? '0')
  const weekday = parts.find(p => p.type === 'weekday')?.value ?? 'Mon'

  const cur       = hour * 60 + minute
  const open      = ex.openHour  * 60 + ex.openMinute
  const close     = ex.closeHour * 60 + ex.closeMinute
  const isWeekend = weekday === 'Sat' || weekday === 'Sun'

  const isLunch = LUNCH_BREAK_IDS.has(ex.id) && cur >= 11 * 60 + 30 && cur < 13 * 60

  return { cur, open, close, isWeekend, isLunch }
}

/**
 * Returns the full trading-session state for an exchange based on the current
 * local time in the exchange's own timezone.
 *
 * US (NYSE/NASDAQ) and Canadian (TSX) exchanges support three sessions:
 *   PRE     04:00 – 09:30  local
 *   REGULAR 09:30 – 16:00  local
 *   POST    16:00 – 20:00  local
 *
 * All other exchanges return REGULAR during standard hours, CLOSED otherwise.
 * This is the authoritative local-time fallback used when the Yahoo Finance API
 * returns an incorrect or stale marketState.
 */
export function getMarketState(ex: ExchangeDef): 'PRE' | 'REGULAR' | 'POST' | 'CLOSED' {
  const { cur, open, close, isWeekend, isLunch } = exchangeTimeParts(ex)
  if (isWeekend || isLunch) return 'CLOSED'

  // US and Canadian exchanges have official extended-hours sessions
  if (ex.id === 'NYSE' || ex.id === 'TSX') {
    const preStart = 4  * 60  // 04:00 local
    const postEnd  = 20 * 60  // 20:00 local
    if (cur >= open     && cur < close)   return 'REGULAR'
    if (cur >= preStart && cur < open)    return 'PRE'
    if (cur >= close    && cur < postEnd) return 'POST'
    return 'CLOSED'
  }

  // All other exchanges: regular session only
  return cur >= open && cur < close ? 'REGULAR' : 'CLOSED'
}

/** Returns true if the given exchange is currently open for regular trading. */
export function isExchangeOpen(ex: ExchangeDef): boolean {
  return getMarketState(ex) === 'REGULAR'
}

/** Look up an exchange by id, falling back to NYSE. */
export function findExchange(id: string): ExchangeDef {
  return EXCHANGES.find(e => e.id === id) ?? EXCHANGES[0]
}

/**
 * Maps Yahoo Finance `fullExchangeName` (and common short codes) to an ExchangeDef.
 * Returns null if no match is found (treat as NYSE/US exchange).
 */
export function resolveExchange(fullExchangeName: string): ExchangeDef | null {
  if (!fullExchangeName) return null
  const n = fullExchangeName.toLowerCase().trim()

  // ── US exchanges (NASDAQ + NYSE family) ────────────────────────────────────
  if (
    n.includes('nasdaq') || n === 'nms' || n === 'ngm' || n === 'ncm' ||
    n === 'new york stock exchange' || n.includes('nyse') ||
    n === 'nyq' || n === 'nya' || n === 'nyb' || n === 'pnk' ||
    n === 'cboe' || n === 'bats' || n === 'arca'
  ) return EXCHANGES.find(e => e.id === 'NYSE') ?? null

  // ── Canada ─────────────────────────────────────────────────────────────────
  if (n.includes('toronto') || n === 'tsx' || n === 'tsxv' || n.includes('canadian'))
    return EXCHANGES.find(e => e.id === 'TSX') ?? null

  // ── Mexico ─────────────────────────────────────────────────────────────────
  if (n.includes('mexico') || n === 'bmv' || n.includes('bolsa mexicana'))
    return EXCHANGES.find(e => e.id === 'BMV') ?? null

  // ── Brazil ─────────────────────────────────────────────────────────────────
  if (n.includes('brazil') || n === 'b3' || n.includes('bovespa') || n.includes('são paulo') || n.includes('sao paulo'))
    return EXCHANGES.find(e => e.id === 'B3') ?? null

  // ── London / UK ────────────────────────────────────────────────────────────
  if (n.includes('london') || n === 'lse' || n === 'lil' || n.includes('aim'))
    return EXCHANGES.find(e => e.id === 'LSE') ?? null

  // ── Germany / XETRA ────────────────────────────────────────────────────────
  if (n.includes('xetra') || n.includes('frankfurt') || n === 'fra' || n === 'ger')
    return EXCHANGES.find(e => e.id === 'XETRA') ?? null

  // ── France / Euronext Paris ─────────────────────────────────────────────────
  if (n.includes('euronext paris') || n.includes('paris') || n === 'par')
    return EXCHANGES.find(e => e.id === 'EURONEXT') ?? null

  // ── Netherlands / Euronext Amsterdam ───────────────────────────────────────
  if (n.includes('amsterdam') || n === 'ams')
    return EXCHANGES.find(e => e.id === 'AMS') ?? null

  // ── Spain ──────────────────────────────────────────────────────────────────
  if (n.includes('madrid') || n === 'bme' || n.includes('bolsa de madrid'))
    return EXCHANGES.find(e => e.id === 'BME') ?? null

  // ── Italy ──────────────────────────────────────────────────────────────────
  if (n.includes('milan') || n.includes('borsa italiana') || n === 'bit')
    return EXCHANGES.find(e => e.id === 'BIT') ?? null

  // ── Switzerland ────────────────────────────────────────────────────────────
  if (n.includes('swiss') || n.includes('zürich') || n.includes('zurich') || n === 'six')
    return EXCHANGES.find(e => e.id === 'SIX') ?? null

  // ── Norway ─────────────────────────────────────────────────────────────────
  if (n.includes('oslo') || n === 'ob' || n === 'ose')
    return EXCHANGES.find(e => e.id === 'OSE') ?? null

  // ── Sweden ─────────────────────────────────────────────────────────────────
  if (n.includes('stockholm') || n.includes('omx stockholm') || n === 'sto')
    return EXCHANGES.find(e => e.id === 'OMXS') ?? null

  // ── Denmark ────────────────────────────────────────────────────────────────
  if (n.includes('copenhagen') || n.includes('omx copenhagen') || n === 'cph')
    return EXCHANGES.find(e => e.id === 'OMXC') ?? null

  // ── Finland ────────────────────────────────────────────────────────────────
  if (n.includes('helsinki') || n.includes('omx helsinki') || n === 'hel')
    return EXCHANGES.find(e => e.id === 'OMXH') ?? null

  // ── Poland ─────────────────────────────────────────────────────────────────
  if (n.includes('warsaw') || n === 'gpw')
    return EXCHANGES.find(e => e.id === 'GPW') ?? null

  // ── Austria ────────────────────────────────────────────────────────────────
  if (n.includes('vienna') || n.includes('wiener') || n === 'wbag')
    return EXCHANGES.find(e => e.id === 'WBAG') ?? null

  // ── Belgium ────────────────────────────────────────────────────────────────
  if (n.includes('brussels') || n.includes('bruxelles'))
    return EXCHANGES.find(e => e.id === 'EURONEXT_BR') ?? null

  // ── South Africa ───────────────────────────────────────────────────────────
  if (n.includes('johannesburg') || n === 'jse')
    return EXCHANGES.find(e => e.id === 'JSE') ?? null

  // ── Japan ──────────────────────────────────────────────────────────────────
  if (n.includes('tokyo') || n === 'tse' || n === 'jpx' || n.includes('nikkei'))
    return EXCHANGES.find(e => e.id === 'TSE') ?? null

  // ── Hong Kong ──────────────────────────────────────────────────────────────
  if (n.includes('hong kong') || n === 'hkex' || n === 'hkse')
    return EXCHANGES.find(e => e.id === 'HKEX') ?? null

  // ── China – Shanghai ───────────────────────────────────────────────────────
  if (n.includes('shanghai') || n === 'sse')
    return EXCHANGES.find(e => e.id === 'SSE') ?? null

  // ── China – Shenzhen ───────────────────────────────────────────────────────
  if (n.includes('shenzhen') || n === 'szse')
    return EXCHANGES.find(e => e.id === 'SZSE') ?? null

  // ── Taiwan ─────────────────────────────────────────────────────────────────
  if (n.includes('taiwan') || n === 'twse' || n === 'two')
    return EXCHANGES.find(e => e.id === 'TWSE') ?? null

  // ── South Korea ────────────────────────────────────────────────────────────
  if (n.includes('korea') || n === 'krx' || n === 'kse' || n.includes('kospi') || n.includes('kosdaq'))
    return EXCHANGES.find(e => e.id === 'KRX') ?? null

  // ── India ──────────────────────────────────────────────────────────────────
  if (n.includes('bombay') || n.includes('mumbai') || n.includes('national stock exchange of india') || n === 'nse' || n === 'bse' || n === 'nse india')
    return EXCHANGES.find(e => e.id === 'BSE') ?? null

  // ── Singapore ──────────────────────────────────────────────────────────────
  if (n.includes('singapore') || n === 'sgx')
    return EXCHANGES.find(e => e.id === 'SGX') ?? null

  // ── Malaysia ───────────────────────────────────────────────────────────────
  if (n.includes('bursa') || n.includes('kuala lumpur') || n === 'klse')
    return EXCHANGES.find(e => e.id === 'BURSA') ?? null

  // ── Thailand ───────────────────────────────────────────────────────────────
  if (n.includes('thailand') || n.includes('bangkok') || n === 'set')
    return EXCHANGES.find(e => e.id === 'SET') ?? null

  // ── Indonesia ──────────────────────────────────────────────────────────────
  if (n.includes('jakarta') || n.includes('indonesia') || n === 'idx')
    return EXCHANGES.find(e => e.id === 'IDX') ?? null

  // ── UAE / Dubai ────────────────────────────────────────────────────────────
  if (n.includes('dubai') || n === 'dfm' || n.includes('abu dhabi'))
    return EXCHANGES.find(e => e.id === 'DFM') ?? null

  // ── Saudi Arabia ───────────────────────────────────────────────────────────
  if (n.includes('saudi') || n.includes('tadawul') || n.includes('riyadh'))
    return EXCHANGES.find(e => e.id === 'TADAWUL') ?? null

  // ── Israel ─────────────────────────────────────────────────────────────────
  if (n.includes('tel aviv') || n === 'tase')
    return EXCHANGES.find(e => e.id === 'TASE') ?? null

  // ── Australia ──────────────────────────────────────────────────────────────
  if (n.includes('australian') || n.includes('sydney') || n === 'asx')
    return EXCHANGES.find(e => e.id === 'ASX') ?? null

  // ── New Zealand ────────────────────────────────────────────────────────────
  if (n.includes('new zealand') || n.includes('auckland') || n === 'nzx')
    return EXCHANGES.find(e => e.id === 'NZX') ?? null

  return null
}
