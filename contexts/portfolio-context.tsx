'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react'
import type { PortfolioEntry } from '@/lib/stock-types'
import { useAuth } from '@/contexts/auth-context'
import { createBrowserClient } from '@/lib/supabase'

const PORTFOLIO_STORAGE_KEY = 'symbiosis-portfolio'

export type SyncStatus = 'idle' | 'syncing' | 'synced' | 'error'

interface PortfolioContextType {
  portfolio: PortfolioEntry[]
  setPortfolio: React.Dispatch<React.SetStateAction<PortfolioEntry[]>>
  syncStatus: SyncStatus
}

const PortfolioContext = createContext<PortfolioContextType | null>(null)

async function getAccessToken() {
  const supabase = createBrowserClient()
  const { data } = await supabase.auth.getSession()
  return data.session?.access_token ?? null
}

async function saveToCloud(entries: PortfolioEntry[], token: string) {
  await fetch('/api/user/portfolio', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(entries),
  })
}

export function PortfolioProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()

  // Start from [] to avoid hydration mismatch; load from localStorage after mount
  const [portfolio, setPortfolioState] = useState<PortfolioEntry[]>([])
  const [initialized, setInitialized] = useState(false)
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle')

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(PORTFOLIO_STORAGE_KEY)
      if (stored) setPortfolioState(JSON.parse(stored))
    } catch {
      // ignore
    }
    setInitialized(true)
  }, [])

  // When user logs in, merge cloud portfolio with local
  useEffect(() => {
    if (!initialized || !user) return

    const loadCloud = async () => {
      setSyncStatus('syncing')
      try {
        const token = await getAccessToken()
        if (!token) { setSyncStatus('idle'); return }

        const res = await fetch('/api/user/portfolio', {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) { setSyncStatus('error'); return }

        const cloudEntries: PortfolioEntry[] = await res.json()

        setPortfolioState(localEntries => {
          const cloudSymbols = new Set(cloudEntries.map(e => e.symbol))
          // Local-only entries not yet in cloud
          const localOnly = localEntries.filter(e => !cloudSymbols.has(e.symbol))
          const merged = [...cloudEntries, ...localOnly]

          // Persist merged locally
          try { localStorage.setItem(PORTFOLIO_STORAGE_KEY, JSON.stringify(merged)) } catch { /* ignore */ }

          // If there were local-only entries, push the merged set up to the cloud
          if (localOnly.length > 0) {
            saveToCloud(merged, token).catch(() => undefined)
          } else if (cloudEntries.length === 0 && localEntries.length > 0) {
            // Cloud empty but local has data – seed the cloud
            saveToCloud(localEntries, token).catch(() => undefined)
          }

          return merged
        })

        setSyncStatus('synced')
      } catch {
        setSyncStatus('error')
      }
    }

    loadCloud()
  }, [user, initialized]) // eslint-disable-line react-hooks/exhaustive-deps

  // Wrapped setter: persist to localStorage and optionally cloud
  const setPortfolio: React.Dispatch<React.SetStateAction<PortfolioEntry[]>> =
    useCallback(
      updater => {
        setPortfolioState(prev => {
          const next = typeof updater === 'function' ? updater(prev) : updater

          // Persist locally
          try { localStorage.setItem(PORTFOLIO_STORAGE_KEY, JSON.stringify(next)) } catch { /* ignore */ }

          // Persist to cloud if authenticated
          if (user) {
            setSyncStatus('syncing')
            getAccessToken().then(token => {
              if (!token) { setSyncStatus('idle'); return }
              saveToCloud(next, token)
                .then(() => setSyncStatus('synced'))
                .catch(() => setSyncStatus('error'))
            })
          }

          return next
        })
      },
      [user],
    )

  return (
    <PortfolioContext.Provider value={{ portfolio, setPortfolio, syncStatus }}>
      {children}
    </PortfolioContext.Provider>
  )
}

export function usePortfolio() {
  const ctx = useContext(PortfolioContext)
  if (!ctx) throw new Error('usePortfolio must be used within PortfolioProvider')
  return ctx
}
