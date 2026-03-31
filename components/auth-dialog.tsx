'use client'

import { useState } from 'react'
import { User, LogOut, Mail, Lock, UserPlus, LogIn, Eye, EyeOff, CheckCircle } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useAuth, type AuthUser } from '@/hooks/use-auth'
import { cn } from '@/lib/utils'

interface AuthDialogProps {
  open: boolean
  onClose: () => void
  onAuthChange?: (user: AuthUser | null) => void
}

function InputField({
  label,
  type,
  value,
  onChange,
  placeholder,
  icon: Icon,
  reveal,
  onReveal,
}: {
  label: string
  type: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  icon: React.ComponentType<{ className?: string }>
  reveal?: boolean
  onReveal?: () => void
}) {
  const inputType = type === 'password' ? (reveal ? 'text' : 'password') : type
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] uppercase tracking-widest font-mono text-muted-foreground flex items-center gap-1.5">
        <Icon className="w-3 h-3" />
        {label}
      </label>
      <div className="relative">
        <input
          type={inputType}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={type === 'password' ? 'current-password' : type === 'email' ? 'email' : 'off'}
          className={cn(
            'w-full bg-background/60 border border-border rounded-sm px-3 py-2 text-sm font-mono text-foreground',
            'placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/20',
            'transition-colors',
            type === 'password' && 'pr-9',
          )}
        />
        {type === 'password' && onReveal && (
          <button
            type="button"
            onClick={onReveal}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
            tabIndex={-1}
          >
            {reveal ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          </button>
        )}
      </div>
    </div>
  )
}

export function AuthDialog({ open, onClose, onAuthChange }: AuthDialogProps) {
  const { user, signIn, signUp, signOut } = useAuth()
  const [tab, setTab] = useState<'signin' | 'signup'>('signin')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  // Sign In fields
  const [siEmail, setSiEmail] = useState('')
  const [siPassword, setSiPassword] = useState('')

  // Sign Up fields
  const [suName, setSuName] = useState('')
  const [suEmail, setSuEmail] = useState('')
  const [suPassword, setSuPassword] = useState('')
  const [suConfirm, setSuConfirm] = useState('')

  function resetFields() {
    setSiEmail(''); setSiPassword('')
    setSuName(''); setSuEmail(''); setSuPassword(''); setSuConfirm('')
    setError(null); setShowPassword(false)
  }

  function handleClose() {
    resetFields()
    onClose()
  }

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const result = await signIn(siEmail, siPassword)
    setLoading(false)
    if (result.error) { setError(result.error); return }
    onAuthChange?.(user)
    handleClose()
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (suPassword !== suConfirm) { setError('Passwords do not match'); return }
    if (suPassword.length < 8) { setError('Password must be at least 8 characters'); return }
    setLoading(true)
    const result = await signUp(suEmail, suPassword, suName)
    setLoading(false)
    if (result.error) { setError(result.error); return }
    onAuthChange?.(user)
    handleClose()
  }

  async function handleSignOut() {
    await signOut()
    onAuthChange?.(null)
  }

  // ── Logged-in view ──────────────────────────────────────────────────────
  if (user) {
    return (
      <Dialog open={open} onOpenChange={v => { if (!v) handleClose() }}>
        <DialogContent className="sm:max-w-md bg-card border-border font-mono">
          <DialogHeader>
            <DialogTitle className="text-sm uppercase tracking-widest text-primary flex items-center gap-2">
              <User className="w-4 h-4" />
              Account
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* User info card */}
            <div className="border border-primary/30 rounded-sm bg-primary/5 p-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-sm bg-primary/20 border border-primary/30 flex items-center justify-center">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="text-sm text-foreground font-semibold">{user.displayName}</div>
                  <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <Mail className="w-3 h-3" />
                    {user.email}
                  </div>
                </div>
                <div className="ml-auto">
                  <CheckCircle className="w-4 h-4 text-primary" />
                </div>
              </div>

              <div className="border-t border-border/50 pt-3 grid grid-cols-2 gap-2 text-[10px]">
                <div>
                  <div className="text-muted-foreground uppercase tracking-wider mb-0.5">Watchlist</div>
                  <div className="text-foreground">{user.preferences.watchlist.length} symbols</div>
                </div>
                <div>
                  <div className="text-muted-foreground uppercase tracking-wider mb-0.5">Widgets</div>
                  <div className="text-foreground">{user.preferences.widgetLayout.length} saved</div>
                </div>
                <div>
                  <div className="text-muted-foreground uppercase tracking-wider mb-0.5">Theme</div>
                  <div className="text-foreground capitalize">{user.preferences.theme}</div>
                </div>
                <div>
                  <div className="text-muted-foreground uppercase tracking-wider mb-0.5">Exchange</div>
                  <div className="text-foreground">{user.preferences.exchange}</div>
                </div>
              </div>
            </div>

            <div className="text-[10px] text-muted-foreground border border-border/50 rounded-sm px-3 py-2 bg-background/40">
              <span className="text-primary">{'>'}</span> Your preferences sync automatically across sessions.
            </div>

            <Button
              variant="ghost"
              className="w-full h-9 text-xs font-mono border border-destructive/30 text-destructive hover:bg-destructive/10 hover:border-destructive/60 rounded-sm"
              onClick={handleSignOut}
            >
              <LogOut className="w-3.5 h-3.5 mr-2" />
              Sign Out
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  // ── Auth tabs view ──────────────────────────────────────────────────────
  return (
    <Dialog open={open} onOpenChange={v => { if (!v) handleClose() }}>
      <DialogContent className="sm:max-w-md bg-card border-border font-mono">
        <DialogHeader>
          <DialogTitle className="text-sm uppercase tracking-widest text-primary flex items-center gap-2">
            <User className="w-4 h-4" />
            {tab === 'signin' ? 'Sign In' : 'Create Account'}
          </DialogTitle>
        </DialogHeader>

        {/* Tab switcher */}
        <div className="flex border-b border-border -mx-6 px-6 mb-4">
          {(['signin', 'signup'] as const).map(t => (
            <button
              key={t}
              onClick={() => { setTab(t); setError(null) }}
              className={cn(
                'flex items-center gap-1.5 px-4 py-2 text-[10px] uppercase tracking-widest font-mono border-b-2 transition-colors -mb-px',
                tab === t
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground',
              )}
            >
              {t === 'signin' ? <LogIn className="w-3 h-3" /> : <UserPlus className="w-3 h-3" />}
              {t === 'signin' ? 'Sign In' : 'Sign Up'}
            </button>
          ))}
        </div>

        {/* Error banner */}
        {error && (
          <div className="mb-4 px-3 py-2 rounded-sm bg-destructive/10 border border-destructive/30 text-[11px] text-destructive font-mono flex items-start gap-2">
            <span className="text-destructive/80 shrink-0 mt-0.5">{'>'}</span>
            {error}
          </div>
        )}

        {/* Sign In form */}
        {tab === 'signin' && (
          <form onSubmit={handleSignIn} className="space-y-4">
            <InputField
              label="Email"
              type="email"
              value={siEmail}
              onChange={setSiEmail}
              placeholder="you@example.com"
              icon={Mail}
            />
            <InputField
              label="Password"
              type="password"
              value={siPassword}
              onChange={setSiPassword}
              placeholder="••••••••"
              icon={Lock}
              reveal={showPassword}
              onReveal={() => setShowPassword(p => !p)}
            />
            <Button
              type="submit"
              disabled={loading || !siEmail || !siPassword}
              className="w-full h-9 text-xs font-mono uppercase tracking-widest rounded-sm"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 border border-current border-t-transparent rounded-full animate-spin" />
                  Authenticating...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <LogIn className="w-3.5 h-3.5" />
                  Sign In
                </span>
              )}
            </Button>
            <p className="text-center text-[10px] text-muted-foreground">
              No account?{' '}
              <button type="button" onClick={() => { setTab('signup'); setError(null) }} className="text-primary hover:underline">
                Create one
              </button>
            </p>
          </form>
        )}

        {/* Sign Up form */}
        {tab === 'signup' && (
          <form onSubmit={handleSignUp} className="space-y-4">
            <InputField
              label="Display Name"
              type="text"
              value={suName}
              onChange={setSuName}
              placeholder="Your name"
              icon={User}
            />
            <InputField
              label="Email"
              type="email"
              value={suEmail}
              onChange={setSuEmail}
              placeholder="you@example.com"
              icon={Mail}
            />
            <InputField
              label="Password"
              type="password"
              value={suPassword}
              onChange={setSuPassword}
              placeholder="Min. 8 characters"
              icon={Lock}
              reveal={showPassword}
              onReveal={() => setShowPassword(p => !p)}
            />
            <InputField
              label="Confirm Password"
              type="password"
              value={suConfirm}
              onChange={setSuConfirm}
              placeholder="Repeat password"
              icon={Lock}
            />

            {/* Password strength hint */}
            {suPassword && (
              <div className="flex gap-1">
                {[8, 12, 16].map((len, i) => (
                  <div
                    key={len}
                    className={cn(
                      'h-0.5 flex-1 rounded-full transition-colors',
                      suPassword.length >= len ? 'bg-primary' : 'bg-border',
                      i === 0 && suPassword.length >= 8 && suPassword.length < 12 && 'bg-amber-500',
                    )}
                  />
                ))}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading || !suName || !suEmail || !suPassword || !suConfirm}
              className="w-full h-9 text-xs font-mono uppercase tracking-widest rounded-sm"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 border border-current border-t-transparent rounded-full animate-spin" />
                  Creating account...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <UserPlus className="w-3.5 h-3.5" />
                  Create Account
                </span>
              )}
            </Button>
            <p className="text-center text-[10px] text-muted-foreground">
              Already have an account?{' '}
              <button type="button" onClick={() => { setTab('signin'); setError(null) }} className="text-primary hover:underline">
                Sign in
              </button>
            </p>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
