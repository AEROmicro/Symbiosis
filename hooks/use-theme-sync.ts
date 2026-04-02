'use client'

import { useEffect } from 'react'

const THEME_KEY          = 'symbiosis-theme'
const MODERN_ENABLED_KEY = 'symbiosis-modern-enabled'
const MODERN_THEME_KEY   = 'symbiosis-modern-theme'

function applyTheme() {
  try {
    const root          = document.documentElement
    const theme         = localStorage.getItem(THEME_KEY) ?? 'default'
    const modernEnabled = localStorage.getItem(MODERN_ENABLED_KEY) === 'true'
    const modernTheme   = localStorage.getItem(MODERN_THEME_KEY) ?? 'dark'

    if (modernEnabled) {
      root.setAttribute('data-style', 'modern')
      root.setAttribute('data-modern-theme', modernTheme)
      root.removeAttribute('data-theme')
    } else {
      root.removeAttribute('data-style')
      root.removeAttribute('data-modern-theme')
      if (theme === 'default') {
        root.removeAttribute('data-theme')
      } else {
        root.setAttribute('data-theme', theme)
      }
    }
  } catch {
    // localStorage unavailable — keep defaults
  }
}

/**
 * Reads the user's theme from localStorage (set by the main dashboard's
 * Settings dialog) and applies it to <html> so that sub-pages like
 * Tourmaline and Musgravite always match the selected theme.
 *
 * Also listens for cross-tab storage events so the theme updates live
 * if the user changes it while the sub-page is open.
 */
export function useThemeSync() {
  useEffect(() => {
    // Apply immediately on mount
    applyTheme()

    // React to changes made in another tab / the main dashboard
    const handler = (e: StorageEvent) => {
      if (
        e.key === THEME_KEY ||
        e.key === MODERN_ENABLED_KEY ||
        e.key === MODERN_THEME_KEY
      ) {
        applyTheme()
      }
    }

    window.addEventListener('storage', handler)
    return () => window.removeEventListener('storage', handler)
  }, [])
}
