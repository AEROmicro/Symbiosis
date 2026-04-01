export const runtime = 'edge';
import { NextResponse } from 'next/server'

function n(v: number | null | undefined, decimals = 2): number {
  if (v == null || isNaN(v)) return 0
  return Number(v.toFixed(decimals))
}

function fmtMarketCap(raw: number | null | undefined): string {
  if (!raw || raw <= 0) return 'N/A'
  if (raw >= 1e12) return `$${(raw / 1e12).toFixed(2)}T`
  if (raw >= 1e9)  return `$${(raw / 1e9).toFixed(2)}B`
  if (raw >= 1e6)  return `$${(raw / 1e6).toFixed(2)}M`
  return `$${raw.toLocaleString()}`
}

async function fetchV7Quote(symbol: string) {
  const fields = [
    'symbol','shortName','regularMarketPrice','regularMarketChange','regularMarketChangePercent',
    'regularMarketPreviousClose',
    'regularMarketOpen','regularMarketDayHigh','regularMarketDayLow',
    'regularMarketVolume','averageDailyVolume3Month','regularMarketState',
    'fullExchangeName','currency','marketCap','fiftyTwoWeekHigh','fiftyTwoWeekLow',
    'fiftyTwoWeekChangePercent','fiftyDayAverage','twoHundredDayAverage',
    'trailingPE','forwardPE','epsTrailingTwelveMonths','beta',
    'trailingAnnualDividendYield','trailingAnnualDividendRate',
    'dividendDate','earningsTimestamp','targetMeanPrice',
    'preMarketPrice','preMarketChange','preMarketChangePercent',
    'postMarketPrice','postMarketChange','postMarketChangePercent',
  ].join(',')
  const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${encodeURIComponent(symbol)}&fields=${fields}`
  // 2-second server-side cache: all concurrent client polls share one Yahoo fetch.
  // Yahoo real-time data updates ~every 15 s so 2 s gives good freshness without
  // hammering their unofficial API and risking a 429.
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, next: { revalidate: 2 } })
  if (!res.ok) return null
  const data = await res.json()
  return data.quoteResponse?.result?.[0] ?? null
}

async function fetchV10Summary(symbol: string) {
  const modules = 'summaryDetail,defaultKeyStatistics,financialData,calendarEvents'
  const url = `https://query2.finance.yahoo.com/v10/finance/quoteSummary/${encodeURIComponent(symbol)}?modules=${modules}`
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, next: { revalidate: 300 } })
  if (!res.ok) return null
  const data = await res.json()
  const result = data.quoteSummary?.result?.[0]
  if (!result) return null
  return result
}

async function fetchYahooFinanceData(symbol: string) {
  try {
    const [v7, v10] = await Promise.allSettled([fetchV7Quote(symbol), fetchV10Summary(symbol)])
    const q = v7.status === 'fulfilled' ? v7.value : null
    const s = v10.status === 'fulfilled' ? v10.value : null

    if (!q) return fetchChartData(symbol)

    const sd  = s?.summaryDetail
    const ks  = s?.defaultKeyStatistics
    const fd  = s?.financialData
    const cal = s?.calendarEvents

    const currentPrice = q.regularMarketPrice
    const prevClose    = q.regularMarketPreviousClose

    // Prefer Yahoo's own daily change values to avoid null/0 prevClose bugs
    // (null coerces to 0 in JS arithmetic, turning the entire price into a fake "change")
    const yahooChange     = q.regularMarketChange ?? null
    const yahooChangePct  = q.regularMarketChangePercent ?? null
    const safePrevClose   = (prevClose != null && prevClose > 0) ? prevClose : null
    const manualChange    = safePrevClose != null ? currentPrice - safePrevClose : null
    const manualChangePct = safePrevClose != null && manualChange != null ? (manualChange / safePrevClose) * 100 : null
    const dailyChange     = yahooChange    ?? manualChange    ?? 0
    const dailyChangePct  = yahooChangePct ?? manualChangePct ?? 0

    const marketCapRaw = q.marketCap ?? sd?.marketCap?.raw
    const marketCapStr = fmtMarketCap(marketCapRaw)

    const avgVol = q.averageDailyVolume3Month ?? sd?.averageVolume3Month?.raw ?? sd?.averageDailyVolume3Month?.raw ?? 0

    const peRatio   = q.trailingPE             != null ? n(q.trailingPE)             : sd?.trailingPE?.raw  != null ? n(sd.trailingPE.raw)  : null
    const fwdPE     = q.forwardPE              != null ? n(q.forwardPE)              : sd?.forwardPE?.raw   != null ? n(sd.forwardPE.raw)   : null

    const eps       = q.epsTrailingTwelveMonths != null ? n(q.epsTrailingTwelveMonths) : ks?.trailingEps?.raw != null ? n(ks.trailingEps.raw) : null

    const beta      = q.beta != null ? n(q.beta) : sd?.beta?.raw != null ? n(sd.beta.raw) : ks?.beta?.raw != null ? n(ks.beta.raw) : null

    const divYield  = q.trailingAnnualDividendYield != null
      ? n(q.trailingAnnualDividendYield * 100, 4)
      : sd?.dividendYield?.raw != null ? n(sd.dividendYield.raw * 100, 4) : null
    const divRate   = q.trailingAnnualDividendRate != null ? n(q.trailingAnnualDividendRate) : sd?.dividendRate?.raw != null ? n(sd.dividendRate.raw) : null

    const targetPrice = q.targetMeanPrice != null ? n(q.targetMeanPrice) : fd?.targetMeanPrice?.raw != null ? n(fd.targetMeanPrice.raw) : null

    let earningsDate: string | null = null
    if (q.earningsTimestamp) {
      earningsDate = new Date(q.earningsTimestamp * 1000).toISOString().split('T')[0]
    } else if (cal?.earnings?.earningsDate?.[0]?.raw) {
      earningsDate = new Date(cal.earnings.earningsDate[0].raw * 1000).toISOString().split('T')[0]
    }

    const exDivDate = q.dividendDate
      ? new Date(q.dividendDate * 1000).toISOString().split('T')[0]
      : sd?.exDividendDate?.raw ? new Date(sd.exDividendDate.raw * 1000).toISOString().split('T')[0] : null

    return {
      symbol: q.symbol || symbol.toUpperCase(),
      name: q.shortName || symbol.toUpperCase(),
      price: n(currentPrice),
      change: n(dailyChange),
      changePercent: n(dailyChangePct),
      high: n(q.regularMarketDayHigh),
      low: n(q.regularMarketDayLow),
      open: n(q.regularMarketOpen),
      previousClose: n(prevClose),
      volume: q.regularMarketVolume ?? 0,
      avgVolume: avgVol,
      marketCap: marketCapStr,
      currency: q.currency || 'USD',
      exchange: q.fullExchangeName || '',
      marketState: q.marketState || 'CLOSED',
      fiftyTwoWeekHigh: n(q.fiftyTwoWeekHigh),
      fiftyTwoWeekLow: n(q.fiftyTwoWeekLow),
      fiftyTwoWeekChangePercent: q.fiftyTwoWeekChangePercent != null ? n(q.fiftyTwoWeekChangePercent) : null,
      fiftyDayAvg: n(q.fiftyDayAverage ?? sd?.fiftyDayAverage?.raw),
      twoHundredDayAvg: n(q.twoHundredDayAverage ?? sd?.twoHundredDayAverage?.raw),
      peRatio,
      forwardPE: fwdPE,
      eps,
      beta,
      dividendYield: divYield,
      dividendRate: divRate,
      exDividendDate: exDivDate,
      earningsDate,
      targetPrice,
      preMarketPrice:          q.preMarketPrice          != null ? n(q.preMarketPrice)          : null,
      preMarketChange:         q.preMarketChange         != null ? n(q.preMarketChange)         : null,
      preMarketChangePercent:  q.preMarketChangePercent  != null ? n(q.preMarketChangePercent)  : null,
      postMarketPrice:         q.postMarketPrice         != null ? n(q.postMarketPrice)         : null,
      postMarketChange:        q.postMarketChange        != null ? n(q.postMarketChange)        : null,
      postMarketChangePercent: q.postMarketChangePercent != null ? n(q.postMarketChangePercent) : null,
      lastUpdated: new Date(),
    }
  } catch {
    return fetchChartData(symbol)
  }
}

async function fetchChartData(symbol: string) {
  try {
    // 1d interval, 2d range gives us today and yesterday specifically
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=2d`

    const response = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      next: { revalidate: 60 }
    })

    const data = await response.json()
    const meta = data.chart?.result?.[0]?.meta
    if (!meta) return null

    const price = meta.regularMarketPrice
    const prevClose = meta.chartPreviousClose
    const safePrevClose = (prevClose != null && prevClose > 0) ? prevClose : null
    const chartChange = safePrevClose != null ? price - safePrevClose : 0
    const chartChangePct = safePrevClose != null ? (chartChange / safePrevClose) * 100 : 0

    return {
      symbol: meta.symbol,
      name: meta.shortName || meta.symbol,
      price: n(price),
      change: n(chartChange),
      changePercent: n(chartChangePct),
      high: n(meta.regularMarketDayHigh ?? price),
      low: n(meta.regularMarketDayLow ?? price),
      open: n(meta.regularMarketOpen ?? prevClose),
      previousClose: n(prevClose),
      volume: meta.regularMarketVolume ?? 0,
      avgVolume: 0,
      marketCap: 'N/A',
      currency: meta.currency || 'USD',
      exchange: meta.exchangeName || '',
      marketState: meta.marketState || 'CLOSED',
      fiftyTwoWeekHigh: n(meta.fiftyTwoWeekHigh ?? price),
      fiftyTwoWeekLow: n(meta.fiftyTwoWeekLow ?? price),
      fiftyTwoWeekChangePercent: null,
      fiftyDayAvg: 0,
      twoHundredDayAvg: 0,
      peRatio: null,
      forwardPE: null,
      eps: null,
      beta: null,
      dividendYield: null,
      dividendRate: null,
      exDividendDate: null,
      earningsDate: null,
      targetPrice: null,
      preMarketPrice: null,
      preMarketChange: null,
      preMarketChangePercent: null,
      postMarketPrice: null,
      postMarketChange: null,
      postMarketChangePercent: null,
      lastUpdated: new Date(),
    }
  } catch {
    return null
  }
}

export async function GET(request: Request, { params }: { params: Promise<{ symbol: string }> }) {
  const { symbol } = await params
  const stockData = await fetchYahooFinanceData(symbol.toUpperCase().trim())
  if (!stockData) return NextResponse.json({ error: 'Not Found' }, { status: 404 })
  return NextResponse.json(stockData, {
    headers: {
      // Browsers / CDN: always ask our API (no client caching).
      // Our API: caches the upstream Yahoo fetch for 2 s (see revalidate above),
      // so all concurrent polls share one Yahoo round-trip per symbol.
      'Cache-Control': 'no-store',
    },
  })
}
