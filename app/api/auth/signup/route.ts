import { NextRequest, NextResponse } from 'next/server'
import { hashPassword, signToken, COOKIE_NAME } from '@/lib/auth'
import { createUser } from '@/lib/user-store'

export async function POST(req: NextRequest) {
  try {
    const { email, password, displayName } = await req.json()
    if (!email || !password || !displayName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })
    }
    const passwordHash = await hashPassword(password)
    const user = await createUser(email, passwordHash, displayName)
    const token = signToken({ userId: user.id, email: user.email, displayName: user.displayName })
    const response = NextResponse.json({
      user: { id: user.id, email: user.email, displayName: user.displayName, preferences: user.preferences },
    }, { status: 201 })
    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
    })
    return response
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    if (message === 'User already exists') {
      return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Failed to create account' }, { status: 500 })
  }
}
