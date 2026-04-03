'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuth } from '@/contexts/auth-context'

interface LoginDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function LoginDialog({ open, onOpenChange }: LoginDialogProps) {
  const { signIn, signUp } = useAuth()
  const [tab, setTab] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const reset = () => { setError(null); setMessage(null) }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    reset()
    setLoading(true)
    const { error } = await signIn(email, password)
    setLoading(false)
    if (error) { setError(error); return }
    onOpenChange(false)
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    reset()
    setLoading(true)
    const { error } = await signUp(email, password)
    setLoading(false)
    if (error) { setError(error); return }
    setMessage('Account created! Check your email to confirm before signing in.')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm font-mono">
        <DialogHeader>
          <DialogTitle className="text-primary">{'>'} Account</DialogTitle>
          <DialogDescription>
            Sign in to sync your portfolio across devices.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={tab} onValueChange={v => { setTab(v as 'login' | 'signup'); reset() }}>
          <TabsList className="w-full">
            <TabsTrigger value="login" className="flex-1">Sign In</TabsTrigger>
            <TabsTrigger value="signup" className="flex-1">Sign Up</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <form onSubmit={handleLogin} className="space-y-4 pt-2">
              <div className="space-y-1">
                <Label htmlFor="login-email">Email</Label>
                <Input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="login-password">Password</Label>
                <Input
                  id="login-password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>
              {error && <p className="text-xs text-destructive">{error}</p>}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Signing in…' : 'Sign In'}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="signup">
            <form onSubmit={handleSignUp} className="space-y-4 pt-2">
              <div className="space-y-1">
                <Label htmlFor="signup-email">Email</Label>
                <Input
                  id="signup-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="signup-password">Password</Label>
                <Input
                  id="signup-password"
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="min 6 characters"
                  minLength={6}
                  required
                />
              </div>
              {error && <p className="text-xs text-destructive">{error}</p>}
              {message && <p className="text-xs text-primary">{message}</p>}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Creating account…' : 'Create Account'}
              </Button>
            </form>
          </TabsContent>
        </Tabs>

        <p className="text-[10px] text-muted-foreground text-center">
          Data is stored securely in Supabase. Local data is always available offline.
        </p>
      </DialogContent>
    </Dialog>
  )
}
