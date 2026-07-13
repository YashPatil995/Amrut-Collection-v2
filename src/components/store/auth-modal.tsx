'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Mail, Phone, User, ChevronRight, CheckCircle2, Loader2, Lock, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useStore } from '@/lib/store'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

type Mode = 'login' | 'signup' | 'otp'
type Method = 'google' | 'phone' | 'email'

export function AuthModal() {
  const authOpen = useStore((s) => s.authOpen)
  const setAuthOpen = useStore((s) => s.setAuthOpen)
  const loginCustomer = useStore((s) => s.loginCustomer)
  const logoutCustomer = useStore((s) => s.logoutCustomer)
  const pendingCheckout = useStore((s) => s.pendingCheckout)
  const setPendingCheckout = useStore((s) => s.setPendingCheckout)
  const navigate = useStore((s) => s.navigate)

  const [mode, setMode] = React.useState<Mode>('login')
  const [method, setMethod] = React.useState<Method | null>(null)
  const [name, setName] = React.useState('')
  const [phone, setPhone] = React.useState('')
  const [email, setEmail] = React.useState('')
  const [otp, setOtp] = React.useState(['', '', '', '', '', ''])
  const [loading, setLoading] = React.useState(false)
  const [otpSent, setOtpSent] = React.useState(false)
  const [devOtp, setDevOtp] = React.useState<string | null>(null)
  const [otpError, setOtpError] = React.useState('')
  const otpRefs = React.useRef<(HTMLInputElement | null)[]>([])

  React.useEffect(() => {
    if (!authOpen) {
      setMode('login'); setMethod(null); setName(''); setPhone(''); setEmail('')
      setOtp(['', '', '', '', '', '']); setOtpSent(false); setLoading(false)
      setDevOtp(null); setOtpError('')
    }
  }, [authOpen])

  const completeLogin = (c: { id?: string; name: string; phone: string; email: string; avatar: string }) => {
    loginCustomer(c)
    if (pendingCheckout) {
      setPendingCheckout(false)
      setTimeout(() => navigate({ name: 'checkout' }), 300)
    }
  }

  // Google login — uses NextAuth's standard signIn('google') flow (full-page redirect).
  // The session is picked up by <SessionSync /> on return.
  const [googleEnabled, setGoogleEnabled] = React.useState(false)
  React.useEffect(() => {
    fetch('/api/auth/config')
      .then((r) => r.json())
      .then((d) => setGoogleEnabled(!!d?.googleEnabled))
      .catch(() => setGoogleEnabled(false))
  }, [])

  const startGoogle = async () => {
    if (!googleEnabled) {
      toast.error('Google OAuth not configured')
      return
    }
    setLoading(true)
    logoutCustomer() // clear old session
    const callbackUrl = pendingCheckout ? '/?checkout=1' : '/'
    try {
      const csrfRes = await fetch('/api/auth/csrf')
      const { csrfToken } = await csrfRes.json()
      const form = document.createElement('form')
      form.method = 'POST'
      form.action = `/api/auth/signin/google?callbackUrl=${encodeURIComponent(callbackUrl)}`
      const input = document.createElement('input')
      input.type = 'hidden'
      input.name = 'csrfToken'
      input.value = csrfToken
      form.appendChild(input)
      document.body.appendChild(form)
      form.submit()
    } catch (e: any) {
      setLoading(false)
      toast.error('Failed to start Google login')
    }
  }

  const sendOtp = async () => {
    if (method === 'phone' && phone.length !== 10) { toast.error('Enter a valid 10-digit phone number'); return }
    if (method === 'email' && !email.includes('@')) { toast.error('Enter a valid email'); return }
    setLoading(true)
    setOtpError('')
    setDevOtp(null)
    try {
      const identifier = method === 'phone' ? phone : email
      const res = await fetch('/api/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, channel: method }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to send OTP')
      setOtpSent(true)
      setMode('otp')
      setOtp(['', '', '', '', '', ''])
      if (data.devCode) {
        setDevOtp(data.devCode)
        toast.success('OTP generated (dev mode)', { description: `Code: ${data.devCode} — displayed below` })
      } else {
        toast.success('OTP sent!', { description: method === 'phone' ? `OTP sent via SMS to +91 ${phone}` : `OTP sent to ${email}` })
      }
      setTimeout(() => otpRefs.current[0]?.focus(), 200)
    } catch (e: any) {
      toast.error(e.message || 'Failed to send OTP')
    } finally {
      setLoading(false)
    }
  }

  const verifyOtp = async () => {
    const code = otp.join('')
    if (code.length !== 6) { toast.error('Enter the 6-digit OTP'); return }
    setLoading(true)
    setOtpError('')
    const displayName = name || (method === 'email' ? email.split('@')[0] : 'Customer')
    const capName = displayName.charAt(0).toUpperCase() + displayName.slice(1)
    const identifier = method === 'phone' ? phone : email
    try {
      const verifyRes = await fetch('/api/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, channel: method, code }),
      })
      const verifyData = await verifyRes.json()
      if (!verifyRes.ok || !verifyData.verified) {
        throw new Error(verifyData.error || 'Invalid OTP')
      }
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: capName,
          phone: method === 'phone' ? phone : null,
          email: method === 'email' ? email : null,
          provider: method,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      const savedUser = data.user
      completeLogin({
        id: savedUser.id,
        name: savedUser.name,
        phone: savedUser.phone || '',
        email: savedUser.email || '',
        avatar: savedUser.avatar || capName.slice(0, 2).toUpperCase(),
      })
      toast.success('Logged in successfully!', { description: `Welcome, ${savedUser.name}!` })
    } catch (e: any) {
      setLoading(false)
      setOtpError(e.message || 'Login failed')
      setOtp(['', '', '', '', '', ''])
      setTimeout(() => otpRefs.current[0]?.focus(), 100)
    }
  }

  const handleOtpChange = (i: number, v: string) => {
    if (!/^\d?$/.test(v)) return
    const next = [...otp]
    next[i] = v
    setOtp(next)
    if (v && i < 5) otpRefs.current[i + 1]?.focus()
  }

  const handleOtpKey = (i: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) otpRefs.current[i - 1]?.focus()
  }

  return (
    <AnimatePresence>
      {authOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 grid place-items-center bg-black/50 backdrop-blur-sm p-4"
          onClick={() => setAuthOpen(false)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
          >
            {/* Header */}
            <div className="relative maroon-gradient p-6 text-center text-white">
              <button onClick={() => setAuthOpen(false)} className="absolute right-4 top-4 text-white/70 hover:text-white">
                <X className="h-5 w-5" />
              </button>
              <div className="mx-auto mb-2 grid h-12 w-12 place-items-center rounded-full bg-white/15">
                <span className="font-serif text-2xl font-bold">A</span>
              </div>
              <h2 className="font-serif text-xl font-bold">
                {mode === 'login' && 'Welcome Back'}
                {mode === 'signup' && 'Create Account'}
                {mode === 'otp' && 'Verify OTP'}
              </h2>
              <p className="mt-0.5 text-xs text-white/80">
                {mode === 'login' && 'Login to your Amrut Collection account'}
                {mode === 'signup' && 'Join the Amrut Collection family'}
                {mode === 'otp' && (method === 'phone' ? `Enter the code sent to +91 ${phone}` : `Enter the code sent to ${email}`)}
              </p>
            </div>

            <div className="p-6">
              {mode === 'otp' ? (
                <div className="space-y-4">
                  {devOtp && (
                    <div className="rounded-lg border-2 border-dashed border-gold bg-gold/5 p-3 text-center">
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-gold-dark">Your OTP (dev mode — no SMS provider configured)</p>
                      <p className="mt-1 font-serif text-3xl font-bold tracking-[0.3em] text-maroon">{devOtp}</p>
                      <button
                        onClick={() => { const digits = devOtp.split(''); setOtp(digits); setTimeout(() => otpRefs.current[5]?.focus(), 50) }}
                        className="mt-1 text-[11px] text-maroon hover:underline"
                      >
                        Auto-fill →
                      </button>
                    </div>
                  )}
                  <div className="flex justify-center gap-2">
                    {otp.map((d, i) => (
                      <input
                        key={i}
                        ref={(el) => { otpRefs.current[i] = el }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={d}
                        onChange={(e) => handleOtpChange(i, e.target.value)}
                        onKeyDown={(e) => handleOtpKey(i, e)}
                        className="h-12 w-11 rounded-lg border-2 border-border bg-background text-center font-serif text-xl font-bold text-maroon outline-none focus:border-maroon"
                      />
                    ))}
                  </div>
                  {otpError && (
                    <p className="flex items-center justify-center gap-1.5 rounded-lg bg-red-50 px-3 py-2 text-center text-xs text-red-600">
                      <AlertCircle className="h-3.5 w-3.5" /> {otpError}
                    </p>
                  )}
                  <p className="text-center text-xs text-muted-foreground">
                    Didn't receive it? <button onClick={sendOtp} className="text-maroon font-medium hover:underline">Resend OTP</button>
                  </p>
                  {!devOtp && (
                    <p className="rounded-lg bg-accent/50 px-3 py-2 text-center text-[11px] text-muted-foreground">
                      💡 Enter the 6-digit code sent to your {method === 'phone' ? 'phone' : 'email'}
                    </p>
                  )}
                  <Button onClick={verifyOtp} disabled={loading} className="w-full bg-maroon text-white hover:bg-maroon-light" size="lg">
                    {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verifying...</> : <><CheckCircle2 className="mr-2 h-4 w-4" /> Verify & Login</>}
                  </Button>
                  <button onClick={() => { setMode(method === 'phone' || method === 'email' ? 'login' : 'signup'); setOtpSent(false); setDevOtp(null); setOtpError('') }} className="w-full text-center text-xs text-muted-foreground hover:text-maroon">
                    ← Back
                  </button>
                </div>
              ) : (
                <>
                  {/* Google login */}
                  <button
                    onClick={startGoogle}
                    disabled={loading}
                    className="mb-2 flex w-full items-center justify-center gap-3 rounded-lg border-2 border-border bg-white py-3 font-medium text-ink transition-all hover:border-gold hover:shadow-md disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="h-5 w-5 animate-spin text-maroon" /> : (
                      <svg className="h-5 w-5" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                    )}
                    Continue with Google
                  </button>

                  <div className="mb-4 flex items-center gap-3">
                    <div className="h-px flex-1 bg-border" />
                    <span className="text-xs text-muted-foreground">or use phone / email</span>
                    <div className="h-px flex-1 bg-border" />
                  </div>

                  {/* Method selector */}
                  <div className="mb-4 grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setMethod('phone')}
                      className={cn('flex items-center justify-center gap-2 rounded-lg border-2 py-2.5 text-sm font-medium transition-all', method === 'phone' ? 'border-maroon bg-maroon/5 text-maroon' : 'border-border text-muted-foreground hover:border-gold')}
                    >
                      <Phone className="h-4 w-4" /> Phone
                    </button>
                    <button
                      onClick={() => setMethod('email')}
                      className={cn('flex items-center justify-center gap-2 rounded-lg border-2 py-2.5 text-sm font-medium transition-all', method === 'email' ? 'border-maroon bg-maroon/5 text-maroon' : 'border-border text-muted-foreground hover:border-gold')}
                    >
                      <Mail className="h-4 w-4" /> Email
                    </button>
                  </div>

                  {/* Form */}
                  {method && (
                    <div className="space-y-3">
                      {mode === 'signup' && (
                        <div>
                          <Label className="text-xs font-medium">Full Name</Label>
                          <div className="relative mt-1">
                            <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className="pl-9" />
                          </div>
                        </div>
                      )}
                      {method === 'phone' && (
                        <div>
                          <Label className="text-xs font-medium">Phone Number</Label>
                          <div className="relative mt-1 flex">
                            <span className="inline-flex items-center rounded-l-md border border-r-0 border-input bg-muted px-3 text-sm font-medium text-muted-foreground">+91</span>
                            <Input value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))} placeholder="7507732111" className="rounded-l-none" type="tel" />
                          </div>
                        </div>
                      )}
                      {method === 'email' && (
                        <div>
                          <Label className="text-xs font-medium">Email Address</Label>
                          <div className="relative mt-1">
                            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" className="pl-9" type="email" />
                          </div>
                        </div>
                      )}
                      <Button onClick={sendOtp} disabled={loading} className="w-full bg-maroon text-white hover:bg-maroon-light" size="lg">
                        {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending...</> : <>Send OTP <ChevronRight className="ml-1 h-4 w-4" /></>}
                      </Button>
                    </div>
                  )}

                  {!method && (
                    <p className="py-4 text-center text-sm text-muted-foreground">Select a login method above</p>
                  )}

                  {/* Toggle login/signup */}
                  <p className="mt-4 text-center text-sm text-muted-foreground">
                    {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
                    <button
                      onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                      className="font-medium text-maroon hover:underline"
                    >
                      {mode === 'login' ? 'Sign Up' : 'Login'}
                    </button>
                  </p>

                  <div className="mt-3 flex items-center justify-center gap-1.5 text-[10px] text-muted-foreground">
                    <Lock className="h-3 w-3" /> Your data is secure & encrypted
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
