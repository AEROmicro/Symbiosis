'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

export interface AuthUser {
  id: string
  email: string
  displayName: string
  preferences: {
    watchlist: string[]
    watchlistSets?: Record<string, string[]>
    activeListName?: string
    widgetLayout: object[]
    theme: string
    exchange: string
    modernEnabled: boolean
    modernTheme: string
    scanlineEnabled: boolean
  }
}

interface AuthState {
  user: AuthUser | null
  loading: boolean
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({ user: null, loading: true })
  const syncTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const fetchMe = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me')
      if (res.ok) {
        const data = await res.json()
        setState({ user: data.user, loading: false })
      } else {
        setState({ user: null, loading: false })
      }
    } catch {
      setState({ user: null, loading: false })
    }
  }, [])

  useEffect(() => {
    fetchMe()
  }, [fetchMe])

  const signIn = useCallback(async (email: string, password: string): Promise<{ error?: string }> => {
    const res = await fetch('/api/auth/signin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    const data = await res.json()
    if (!res.ok) return { error: data.error }
    setState({ user: data.user, loading: false })
    return {}
  }, [])

  const signUp = useCallback(async (email: string, password: string, displayName: string): Promise<{ error?: string }> => {
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, displayName }),
    })
    const data = await res.json()
    if (!res.ok) return { error: data.error }
    setState({ user: data.user, loading: false })
    return {}
  }, [])

  const signOut = useCallback(async () => {
    await fetch('/api/auth/signout', { method: 'POST' })
    setState({ user: null, loading: false })
  }, [])

  // Debounced sync — waits 500ms after last call before sending
  const syncPreferences = useCallback(async (preferences: object) => {
    if (!state.user) return
    if (syncTimerRef.current) clearTimeout(syncTimerRef.current)
    syncTimerRef.current = setTimeout(async () => {
      try {
        await fetch('/api/auth/me', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(preferences),
        })
      } catch { /* silent — non-critical */ }
    }, 500)
  }, [state.user])

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => { if (syncTimerRef.current) clearTimeout(syncTimerRef.current) }
  }, [])

  return { ...state, signIn, signUp, signOut, syncPreferences }
}
