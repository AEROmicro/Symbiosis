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

/** Returns true if the given exchange is currently open for regular trading. */
export function isExchangeOpen(ex: ExchangeDef): boolean {
  const now = new Date()
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: ex.timezone,
    hour: 'numeric',
    minute: 'numeric',
    hour12: false,
    weekday: 'short',
  }).formatToParts(now)

  const hour    = parseInt(parts.find(p => p.type === 'hour')?.value    ?? '0')
  const minute  = parseInt(parts.find(p => p.type === 'minute')?.value  ?? '0')
  const weekday = parts.find(p => p.type === 'weekday')?.value ?? 'Mon'

  if (weekday === 'Sat' || weekday === 'Sun') return false

  const cur   = hour * 60 + minute
  const open  = ex.openHour * 60 + ex.openMinute
  const close = ex.closeHour * 60 + ex.closeMinute
  return cur >= open && cur < close
}

/** Look up an exchange by id, falling back to NYSE. */
export function findExchange(id: string): ExchangeDef {
  return EXCHANGES.find(e => e.id === id) ?? EXCHANGES[0]
}
