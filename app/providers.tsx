'use client'

import { AuthProvider } from '@/contexts/auth-context'
import { PortfolioProvider } from '@/contexts/portfolio-context'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <PortfolioProvider>
        {children}
      </PortfolioProvider>
    </AuthProvider>
  )
}
