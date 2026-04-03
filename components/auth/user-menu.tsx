'use client'

import { useState } from 'react'
import { LogIn, LogOut, User, Link2, CloudOff, Cloud, Loader2 } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/auth-context'
import { usePortfolio } from '@/contexts/portfolio-context'
import { LoginDialog } from '@/components/auth/login-dialog'
import { AlpacaConnect } from '@/components/brokerage/alpaca-connect'
import { cn } from '@/lib/utils'

export function UserMenu() {
  const { user, loading, signOut } = useAuth()
  const { syncStatus } = usePortfolio()
  const [loginOpen, setLoginOpen] = useState(false)
  const [alpacaOpen, setAlpacaOpen] = useState(false)

  if (loading) {
    return (
      <Button variant="ghost" size="sm" className="text-muted-foreground" disabled>
        <Loader2 className="w-3 h-3 animate-spin" />
      </Button>
    )
  }

  if (!user) {
    return (
      <>
        <Button
          variant="outline"
          size="sm"
          className="text-xs font-mono gap-1.5"
          onClick={() => setLoginOpen(true)}
        >
          <LogIn className="w-3 h-3" />
          Sign In
        </Button>
        <LoginDialog open={loginOpen} onOpenChange={setLoginOpen} />
      </>
    )
  }

  const syncIcon = syncStatus === 'syncing'
    ? <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />
    : syncStatus === 'error'
      ? <CloudOff className="w-3 h-3 text-destructive" />
      : <Cloud className={cn('w-3 h-3', syncStatus === 'synced' ? 'text-primary' : 'text-muted-foreground')} />

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="text-xs font-mono gap-1.5">
            <User className="w-3 h-3" />
            <span className="hidden sm:inline max-w-[120px] truncate">
              {user.email ?? 'Account'}
            </span>
            {syncIcon}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="font-mono text-xs">
          <DropdownMenuLabel className="text-[11px] font-normal text-muted-foreground truncate max-w-[200px]">
            {user.email}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setAlpacaOpen(true)}>
            <Link2 className="w-3 h-3 mr-2" />
            Connect Brokerage
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={signOut}
            className="text-destructive focus:text-destructive"
          >
            <LogOut className="w-3 h-3 mr-2" />
            Sign Out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlpacaConnect open={alpacaOpen} onOpenChange={setAlpacaOpen} />
    </>
  )
}
