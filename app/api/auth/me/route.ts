export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, COOKIE_NAME } from '@/lib/auth'
import { findUserById, updateUserPreferences } from '@/lib/user-store'

async function getUser(req: NextRequest) {
  const token = req.cookies.get(COOKIE_NAME)?.value
  if (!token) return null
  const payload = verifyToken(token)
  if (!payload) return null
  return findUserById(payload.userId)
}

export async function GET(req: NextRequest) {
  const user = await getUser(req)
  if (!user) return NextResponse.json({ user: null }, { status: 401 })
  return NextResponse.json({
    user: { id: user.id, email: user.email, displayName: user.displayName, preferences: user.preferences },
  })
}

export async function PATCH(req: NextRequest) {
  const user = await getUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const preferences = await req.json()
    await updateUserPreferences(user.id, preferences)
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to update preferences' }, { status: 500 })
  }
}
