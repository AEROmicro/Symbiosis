import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import type { PortfolioEntry } from '@/lib/stock-types'

function getBearerToken(req: NextRequest): string | null {
  const auth = req.headers.get('Authorization')
  return auth?.startsWith('Bearer ') ? auth.slice(7) : null
}

export async function GET(req: NextRequest) {
  const token = getBearerToken(req)
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createServerClient(token)
  const { data: { user }, error: authErr } = await supabase.auth.getUser()
  if (authErr || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('portfolio_entries')
    .select('*')
    .eq('user_id', user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const entries: PortfolioEntry[] = (data ?? []).map((row) => ({
    symbol: row.symbol as string,
    shares: row.shares as number,
    avgPrice: row.avg_price as number,
    addedAt: row.added_at as string,
    source: (row.source as string | undefined) ?? 'manual',
  }))

  return NextResponse.json(entries)
}

export async function POST(req: NextRequest) {
  const token = getBearerToken(req)
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createServerClient(token)
  const { data: { user }, error: authErr } = await supabase.auth.getUser()
  if (authErr || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const entries: PortfolioEntry[] = await req.json()

  // Replace the entire portfolio for this user
  const { error: delErr } = await supabase
    .from('portfolio_entries')
    .delete()
    .eq('user_id', user.id)

  if (delErr) return NextResponse.json({ error: delErr.message }, { status: 500 })

  if (entries.length > 0) {
    const { error: insErr } = await supabase.from('portfolio_entries').insert(
      entries.map(e => ({
        user_id: user.id,
        symbol: e.symbol,
        shares: e.shares,
        avg_price: e.avgPrice,
        added_at: e.addedAt ?? new Date().toISOString(),
        source: (e as PortfolioEntry & { source?: string }).source ?? 'manual',
      })),
    )
    if (insErr) return NextResponse.json({ error: insErr.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
