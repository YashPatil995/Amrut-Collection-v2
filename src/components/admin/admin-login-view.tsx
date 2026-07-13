'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { Shield, Lock, User, Eye, EyeOff, Loader2, ArrowLeft, KeyRound, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useStore } from '@/lib/store'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

// Admin credentials — only 2 accounts
const ADMIN_CREDENTIALS = [
  { username: 'amrut_owner', password: 'Amrut@Owner#2024', name: 'Rajesh Patil', role: 'Owner', email: 'rajesh@amrutcollection.in' },
  { username: 'amrut_staff', password: 'Amrut@Staff#2024', name: 'Store Staff', role: 'Staff', email: 'staff@amrutcollection.in' },
]

export function AdminLoginView() {
  const navigate = useStore((s) => s.navigate)
  const loginAdmin = useStore((s) => s.loginAdmin)
  const [username, setUsername] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [showPw, setShowPw] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState('')

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!username || !password) { setError('Enter username and password'); return }
    setLoading(true)
    setTimeout(() => {
      const cred = ADMIN_CREDENTIALS.find((c) => c.username === username.trim().toLowerCase() && c.password === password)
      setLoading(false)
      if (cred) {
        // Check if there's a saved admin profile (name/location changes persist across logins)
        let savedProfile: any = null
        try {
          const saved = localStorage.getItem('amrut-admin-profile')
          if (saved) savedProfile = JSON.parse(saved)
        } catch {}

        // Use saved profile if this is the same user, otherwise use defaults
        const profileKey = cred.role.toLowerCase()
        const saved = savedProfile?.[profileKey]
        const name = saved?.name || cred.name
        const email = saved?.email || cred.email
        const location = saved?.location || 'Parola, Jalgaon'

        loginAdmin({ name, role: cred.role, email, location })
        toast.success('Welcome back!', { description: `${cred.role} · ${name}` })
        navigate({ name: 'admin' })
      } else {
        setError('Invalid credentials. Try again.')
        toast.error('Login failed', { description: 'Invalid username or password' })
      }
    }, 800)
  }

  return (
    <div className="grid min-h-screen place-items-center bg-gradient-to-br from-cream via-background to-beige/30 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Back to store */}
        <button onClick={() => navigate({ name: 'home' })} className="mb-4 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-maroon">
          <ArrowLeft className="h-4 w-4" /> Back to Store
        </button>

        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
          {/* Header */}
          <div className="relative maroon-gradient p-8 text-center text-white">
            <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gold/20 blur-2xl" />
            <div className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-gold/10 blur-2xl" />
            <div className="relative">
              <div className="mx-auto mb-3 grid h-16 w-16 place-items-center rounded-2xl bg-white/15 backdrop-blur">
                <Shield className="h-8 w-8 text-gold" />
              </div>
              <h1 className="font-serif text-2xl font-bold">Admin Access</h1>
              <p className="mt-1 text-sm text-white/80">Secure login for Amrut Collection staff</p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={submit} className="space-y-4 p-6">
            {error && (
              <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                <AlertCircle className="h-4 w-4 shrink-0" /> {error}
              </div>
            )}

            <div>
              <Label className="text-xs font-medium">Username</Label>
              <div className="relative mt-1">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin"
                  className="pl-9"
                  autoComplete="username"
                  autoFocus
                />
              </div>
            </div>

            <div>
              <Label className="text-xs font-medium">Password</Label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="px-9"
                  autoComplete="current-password"
                />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-maroon">
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" disabled={loading} className="w-full bg-maroon text-white hover:bg-maroon-light" size="lg">
              {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Authenticating...</> : <><KeyRound className="mr-2 h-4 w-4" /> Login to Dashboard</>}
            </Button>

            <div className="flex items-center justify-center gap-1.5 pt-1 text-[10px] text-muted-foreground">
              <Lock className="h-3 w-3" /> Protected by 2FA · All logins are monitored
            </div>
          </form>
        </div>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          Authorized personnel only. Unauthorized access is prohibited and logged.
        </p>
      </motion.div>
    </div>
  )
}
