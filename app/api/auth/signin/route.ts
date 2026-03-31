import { NextRequest, NextResponse } from 'next/server'
import { comparePassword, signToken, COOKIE_NAME } from '@/lib/auth'
import { findUserByEmail } from '@/lib/user-store'

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()
    if (!email || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    const user = await findUserByEmail(email)
    if (!user) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }
    const valid = await comparePassword(password, user.passwordHash)
    if (!valid) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }
    const token = signToken({ userId: user.id, email: user.email, displayName: user.displayName })
    const response = NextResponse.json({
      user: { id: user.id, email: user.email, displayName: user.displayName, preferences: user.preferences },
    })
    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
    })
    return response
  } catch {
    return NextResponse.json({ error: 'Sign in failed' }, { status: 500 })
  }
}
