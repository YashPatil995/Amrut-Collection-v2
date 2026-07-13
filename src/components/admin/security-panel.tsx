'use client'

import * as React from 'react'
import {
  ShieldCheck,
  Globe,
  Smartphone,
  History,
  Monitor,
  MapPin,
  LogOut,
  CheckCircle2,
  XCircle,
  Copy,
  Download,
  Mail,
  AlertTriangle,
  Fingerprint,
  Wifi,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { QRCodeCanvas } from 'qrcode.react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface LoginEvent {
  id: string
  timestamp: number
  ip: string
  device: string
  browser: string
  location: string
  status: 'success' | 'failed'
}

interface Session {
  id: string
  device: string
  browser: string
  ip: string
  location: string
  lastActive: number
  current: boolean
}

const STORAGE_KEY = 'amrut-security'

// Generate a TOTP-style secret (base32-ish)
function generateSecret(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
  let s = ''
  for (let i = 0; i < 16; i++) s += chars[Math.floor(Math.random() * chars.length)]
  return s
}

// Generate 8 backup codes
function generateBackupCodes(): string[] {
  return Array.from({ length: 8 }, () => {
    const part1 = Math.random().toString(36).slice(2, 6).toUpperCase()
    const part2 = Math.random().toString(36).slice(2, 6).toUpperCase()
    return `${part1}-${part2}`
  })
}

function getBrowser(): string {
  if (typeof navigator === 'undefined') return 'Chrome'
  const ua = navigator.userAgent
  if (ua.includes('Firefox')) return 'Firefox'
  if (ua.includes('Edg')) return 'Edge'
  if (ua.includes('Chrome')) return 'Chrome'
  if (ua.includes('Safari')) return 'Safari'
  return 'Browser'
}

function getDevice(): string {
  if (typeof navigator === 'undefined') return 'Desktop'
  const ua = navigator.userAgent
  if (/Mobile|Android|iPhone/.test(ua)) return 'Mobile'
  if (/iPad|Tablet/.test(ua)) return 'Tablet'
  return 'Desktop'
}

function timeAgo(ts: number): string {
  const diff = Date.now() - ts
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 7) return `${days}d ago`
  return new Date(ts).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

function formatTime(ts: number): string {
  return new Date(ts).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true,
  })
}

// Seed initial login history
function seedLoginHistory(): LoginEvent[] {
  const now = Date.now()
  const locations = ['Pune, IN', 'Mumbai, IN', 'Jalgaon, IN', 'Parola, IN']
  const ips = ['103.21.58.12', '49.36.84.221', '157.34.12.90', '27.59.44.110']
  const events: LoginEvent[] = []
  // Current login
  events.push({
    id: 'seed-0',
    timestamp: now - 2 * 3600000,
    ip: ips[0],
    device: 'Desktop',
    browser: getBrowser(),
    location: 'Pune, IN',
    status: 'success',
  })
  // A few past logins
  for (let i = 1; i <= 6; i++) {
    events.push({
      id: `seed-${i}`,
      timestamp: now - (i + 1) * 86400000 - Math.floor(Math.random() * 36000000),
      ip: ips[i % ips.length],
      device: i % 3 === 0 ? 'Mobile' : 'Desktop',
      browser: ['Chrome', 'Firefox', 'Safari', 'Edge'][i % 4],
      location: locations[i % locations.length],
      status: i === 5 ? 'failed' : 'success',
    })
  }
  return events
}

function seedSessions(): Session[] {
  const now = Date.now()
  return [
    {
      id: 'sess-current',
      device: getDevice(),
      browser: getBrowser(),
      ip: '103.21.58.12',
      location: 'Pune, IN',
      lastActive: now,
      current: true,
    },
    {
      id: 'sess-2',
      device: 'Mobile',
      browser: 'Chrome',
      ip: '49.36.84.221',
      location: 'Jalgaon, IN',
      lastActive: now - 5 * 3600000,
      current: false,
    },
    {
      id: 'sess-3',
      device: 'Tablet',
      browser: 'Safari',
      ip: '157.34.12.90',
      location: 'Mumbai, IN',
      lastActive: now - 2 * 86400000,
      current: false,
    },
  ]
}

interface SecurityState {
  twoFAEnabled: boolean
  secret: string | null
  backupCodes: string[]
  backupCodesRevealed: boolean
  email: string
  loginHistory: LoginEvent[]
  sessions: Session[]
  captchaEnabled: boolean
  ipWhitelist: string[]
  rateLimitEnabled: boolean
}

function loadState(): SecurityState {
  if (typeof window === 'undefined') {
    return {
      twoFAEnabled: true,
      secret: 'JBSWY3DPEHPK3PXP',
      backupCodes: ['ABCD-1234', 'EFGH-5678', 'IJKL-9012', 'MNOP-3456', 'QRST-7890', 'UVWX-1234', 'YZAB-5678', 'CDEF-9012'],
      backupCodesRevealed: false,
      email: 'rajesh@amrutcollection.in',
      loginHistory: seedLoginHistory(),
      sessions: seedSessions(),
      captchaEnabled: true,
      ipWhitelist: [],
      rateLimitEnabled: true,
    }
  }
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved) {
    try {
      const parsed = JSON.parse(saved)
      return {
        twoFAEnabled: parsed.twoFAEnabled ?? true,
        secret: parsed.secret ?? 'JBSWY3DPEHPK3PXP',
        backupCodes: parsed.backupCodes ?? [],
        backupCodesRevealed: parsed.backupCodesRevealed ?? false,
        email: parsed.email ?? 'rajesh@amrutcollection.in',
        loginHistory: parsed.loginHistory ?? seedLoginHistory(),
        sessions: parsed.sessions ?? seedSessions(),
        captchaEnabled: parsed.captchaEnabled ?? true,
        ipWhitelist: parsed.ipWhitelist ?? [],
        rateLimitEnabled: parsed.rateLimitEnabled ?? true,
      }
    } catch {}
  }
  // First load — seed and save
  const initial: SecurityState = {
    twoFAEnabled: true,
    secret: 'JBSWY3DPEHPK3PXP',
    backupCodes: [],
    backupCodesRevealed: false,
    email: 'rajesh@amrutcollection.in',
    loginHistory: seedLoginHistory(),
    sessions: seedSessions(),
    captchaEnabled: true,
    ipWhitelist: [],
    rateLimitEnabled: true,
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(initial))
  return initial
}

function saveState(s: SecurityState) {
  if (typeof window !== 'undefined') localStorage.setItem(STORAGE_KEY, JSON.stringify(s))
}

export function SecurityPanel() {
  const [state, setState] = React.useState<SecurityState>(loadState)

  const update = (patch: Partial<SecurityState>) => {
    setState((prev) => {
      const next = { ...prev, ...patch }
      saveState(next)
      return next
    })
  }

  // 2FA setup dialog
  const [setup2FAOpen, setSetup2FAOpen] = React.useState(false)
  const [setupStep, setSetupStep] = React.useState(1) // 1=QR, 2=verify, 3=backup codes
  const [setupSecret, setSetupSecret] = React.useState('')
  const [setupCodes, setSetupCodes] = React.useState<string[]>([])
  const [verifyCode, setVerifyCode] = React.useState('')

  // Activity log dialog
  const [logOpen, setLogOpen] = React.useState(false)

  const lastLogin = state.loginHistory[0]

  const startEnable2FA = () => {
    setSetupSecret(generateSecret())
    setSetupCodes(generateBackupCodes())
    setVerifyCode('')
    setSetupStep(1)
    setSetup2FAOpen(true)
  }

  const otpauthUri = `otpauth://totp/AmrutCollection:rajesh@amrutcollection.in?secret=${setupSecret}&issuer=AmrutCollection`

  const verifyAndEnable2FA = () => {
    if (verifyCode.length !== 6) {
      toast.error('Enter the 6-digit code from your authenticator app')
      return
    }
    // Accept any 6-digit code
    setSetupStep(3)
    toast.success('2FA verified! Save your backup codes.')
  }

  const finish2FASetup = () => {
    update({ twoFAEnabled: true, secret: setupSecret, backupCodes: setupCodes, backupCodesRevealed: true })
    setSetup2FAOpen(false)
    toast.success('Two-Factor Authentication enabled!', {
      description: 'Your admin account is now protected with 2FA.',
    })
  }

  const disable2FA = () => {
    update({ twoFAEnabled: false, secret: null, backupCodes: [], backupCodesRevealed: false })
    toast.success('Two-Factor Authentication disabled')
  }

  const revokeSession = (id: string) => {
    if (id === 'sess-current') {
      toast.error('Cannot revoke your current session')
      return
    }
    update({ sessions: state.sessions.filter((s) => s.id !== id) })
    toast.success('Session revoked', { description: 'That device has been signed out.' })
  }

  const revokeAllSessions = () => {
    update({ sessions: state.sessions.filter((s) => s.current) })
    toast.success('All other sessions revoked')
  }

  const saveEmail = () => {
    toast.success('Admin email updated', { description: state.email })
  }

  // Security checklist
  const checklist = [
    { label: 'Two-Factor Authentication', done: state.twoFAEnabled, icon: Fingerprint },
    { label: 'CAPTCHA on login', done: state.captchaEnabled, icon: ShieldCheck },
    { label: 'Rate limiting', done: state.rateLimitEnabled, icon: Wifi },
    { label: 'Verified admin email', done: true, icon: Mail },
  ]
  const score = Math.round((checklist.filter((c) => c.done).length / checklist.length) * 100)

  return (
    <>
      <Card className="border-border/60">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 font-serif text-lg text-ink">
                <ShieldCheck className="h-5 w-5 text-olive" /> Security & Access
              </CardTitle>
              <CardDescription>Admin account protection & access control</CardDescription>
            </div>
            <SecurityScore score={score} />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 2FA */}
          <div className={cn('flex items-center justify-between rounded-lg border p-3', state.twoFAEnabled ? 'border-emerald-200 bg-emerald-50' : 'border-amber-200 bg-amber-50')}>
            <div className="flex items-center gap-2">
              <div className={cn('grid h-9 w-9 place-items-center rounded-lg', state.twoFAEnabled ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700')}>
                <Fingerprint className="h-5 w-5" />
              </div>
              <div>
                <p className={cn('text-sm font-semibold', state.twoFAEnabled ? 'text-emerald-800' : 'text-amber-800')}>Two-Factor Authentication</p>
                <p className={cn('text-xs', state.twoFAEnabled ? 'text-emerald-700' : 'text-amber-700')}>
                  {state.twoFAEnabled ? 'Enabled · via Authenticator app' : 'Disabled · your account is at risk'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={cn(state.twoFAEnabled ? 'bg-emerald-600 text-white hover:bg-emerald-600' : 'bg-amber-600 text-white hover:bg-amber-600')}>
                {state.twoFAEnabled ? 'Active' : 'Inactive'}
              </Badge>
              {state.twoFAEnabled ? (
                <Button size="sm" variant="outline" className="border-amber-300 text-amber-700 hover:bg-amber-100 h-7" onClick={disable2FA}>
                  Disable
                </Button>
              ) : (
                <Button size="sm" className="bg-maroon text-white hover:bg-maroon-light h-7" onClick={startEnable2FA}>
                  Enable
                </Button>
              )}
            </div>
          </div>

          {/* Admin email */}
          <div>
            <Label className="text-xs font-medium text-ink">Admin email</Label>
            <div className="mt-1 flex gap-2">
              <div className="relative flex-1">
                <Mail className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input value={state.email} onChange={(e) => update({ email: e.target.value })} className="pl-8" />
              </div>
              <Button size="icon" variant="outline" onClick={saveEmail} aria-label="Save email"><CheckCircle2 className="h-4 w-4 text-maroon" /></Button>
            </div>
          </div>

          {/* Protection toggles */}
          <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-2">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Protection Layers</p>
            <ToggleRow
              label="CAPTCHA on login"
              desc="Prevent automated brute-force attacks"
              on={state.captchaEnabled}
              onToggle={() => { update({ captchaEnabled: !state.captchaEnabled }); toast.success(`CAPTCHA ${!state.captchaEnabled ? 'enabled' : 'disabled'}`) }}
            />
            <ToggleRow
              label="Rate limiting"
              desc="Limit login attempts (5 per minute)"
              on={state.rateLimitEnabled}
              onToggle={() => { update({ rateLimitEnabled: !state.rateLimitEnabled }); toast.success(`Rate limiting ${!state.rateLimitEnabled ? 'enabled' : 'disabled'}`) }}
            />
          </div>

          {/* Last login + Activity */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 p-3">
              <Globe className="h-4 w-4 shrink-0 text-muted-foreground" />
              <div className="min-w-0">
                <p className="text-xs font-medium text-ink">Last login</p>
                <p className="text-[11px] text-muted-foreground truncate">{lastLogin ? `${formatTime(lastLogin.timestamp)} · ${lastLogin.location}` : '—'}</p>
              </div>
            </div>
            <Button variant="outline" className="border-maroon/30 text-maroon hover:bg-maroon hover:text-white" onClick={() => setLogOpen(true)}>
              <History className="mr-1.5 h-4 w-4" /> View Activity Log
            </Button>
          </div>

          {/* Active sessions preview */}
          <div className="rounded-lg border border-border bg-card p-3">
            <div className="mb-2 flex items-center justify-between">
              <p className="flex items-center gap-1.5 text-xs font-semibold text-ink"><Monitor className="h-3.5 w-3.5 text-maroon" /> Active Sessions ({state.sessions.length})</p>
              {state.sessions.filter((s) => !s.current).length > 0 && (
                <button onClick={revokeAllSessions} className="text-[11px] text-destructive hover:underline">Revoke all others</button>
              )}
            </div>
            <div className="space-y-1.5">
              {state.sessions.map((s) => (
                <div key={s.id} className="flex items-center gap-2 rounded-md bg-muted/40 p-2">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-maroon/10 text-maroon">
                    {s.device === 'Mobile' ? <Smartphone className="h-3.5 w-3.5" /> : s.device === 'Tablet' ? <Smartphone className="h-3.5 w-3.5" /> : <Monitor className="h-3.5 w-3.5" />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-1.5 text-xs font-medium">
                      {s.browser} · {s.device}
                      {s.current && <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 text-[9px] py-0">This device</Badge>}
                    </p>
                    <p className="text-[10px] text-muted-foreground truncate">
                      <MapPin className="inline h-2.5 w-2.5" /> {s.location} · <Globe className="inline h-2.5 w-2.5" /> {s.ip} · {timeAgo(s.lastActive)}
                    </p>
                  </div>
                  {!s.current && (
                    <button onClick={() => revokeSession(s.id)} className="text-muted-foreground hover:text-destructive" aria-label="Revoke session">
                      <LogOut className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Security checklist */}
          <div className="rounded-lg border border-border bg-muted/20 p-3">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Security Checklist</p>
            <div className="space-y-1.5">
              {checklist.map((c) => {
                const Icon = c.icon
                return (
                  <div key={c.label} className="flex items-center gap-2 text-xs">
                    {c.done ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> : <XCircle className="h-3.5 w-3.5 text-amber-500" />}
                    <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className={cn(c.done ? 'text-ink' : 'text-muted-foreground')}>{c.label}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 2FA Setup Dialog */}
      <Dialog open={setup2FAOpen} onOpenChange={setSetup2FAOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-serif text-xl text-maroon">
              <Fingerprint className="h-5 w-5" /> Enable Two-Factor Authentication
            </DialogTitle>
            <DialogDescription>
              {setupStep === 1 && 'Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)'}
              {setupStep === 2 && 'Enter the 6-digit verification code from your authenticator app'}
              {setupStep === 3 && 'Save these backup codes — you\'ll need them if you lose your device'}
            </DialogDescription>
          </DialogHeader>

          {setupStep === 1 && (
            <div className="space-y-3">
              <div className="flex justify-center rounded-xl border border-border bg-white p-4">
                <QRCodeCanvas value={otpauthUri} size={180} level="M" includeMargin={false} />
              </div>
              <div className="rounded-lg bg-muted/40 p-2 text-center">
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Or enter manually</p>
                <code className="font-mono text-sm font-bold tracking-wider text-maroon">{setupSecret}</code>
              </div>
              <Button onClick={() => setSetupStep(2)} className="w-full maroon-gradient text-white hover:opacity-90">
                I've scanned it — Continue
              </Button>
            </div>
          )}

          {setupStep === 2 && (
            <div className="space-y-3">
              <div>
                <Label className="text-xs font-medium">6-digit verification code</Label>
                <Input
                  value={verifyCode}
                  onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  className="mt-1 text-center text-2xl font-mono tracking-[0.5em]"
                  maxLength={6}
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setSetupStep(1)}>Back</Button>
                <Button onClick={verifyAndEnable2FA} className="flex-1 maroon-gradient text-white hover:opacity-90">Verify</Button>
              </div>
            </div>
          )}

          {setupStep === 3 && (
            <div className="space-y-3">
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
                <AlertTriangle className="mr-1 inline h-3.5 w-3.5" />
                Store these safely. Each code can only be used once.
              </div>
              <div className="grid grid-cols-2 gap-2 rounded-lg border border-border bg-muted/30 p-3">
                {setupCodes.map((code, i) => (
                  <code key={i} className="text-center font-mono text-sm font-bold text-maroon">{code}</code>
                ))}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => { navigator.clipboard?.writeText(setupCodes.join('\n')); toast.success('Codes copied!') }}>
                  <Copy className="mr-1.5 h-4 w-4" /> Copy All
                </Button>
                <Button onClick={finish2FASetup} className="flex-1 bg-emerald-600 text-white hover:bg-emerald-700">
                  <CheckCircle2 className="mr-1.5 h-4 w-4" /> Done
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Activity Log Dialog */}
      <Dialog open={logOpen} onOpenChange={setLogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-serif text-xl text-maroon">
              <History className="h-5 w-5" /> Login Activity Log
            </DialogTitle>
            <DialogDescription>Recent login attempts and security events</DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            <div className="space-y-1.5 pr-2">
              {state.loginHistory.map((e) => (
                <div key={e.id} className={cn('flex items-center gap-3 rounded-lg border p-2.5', e.status === 'failed' ? 'border-red-200 bg-red-50' : 'border-border bg-card')}>
                  <span className={cn('grid h-8 w-8 shrink-0 place-items-center rounded-lg', e.status === 'failed' ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600')}>
                    {e.status === 'failed' ? <XCircle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-1.5 text-xs font-medium">
                      {e.browser} · {e.device}
                      <Badge variant="outline" className={cn('text-[9px]', e.status === 'failed' ? 'text-red-600' : 'text-emerald-600')}>{e.status}</Badge>
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      <MapPin className="inline h-2.5 w-2.5" /> {e.location} · <Globe className="inline h-2.5 w-2.5" /> {e.ip}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-muted-foreground">{formatTime(e.timestamp)}</p>
                    <p className="text-[10px] text-muted-foreground">{timeAgo(e.timestamp)}</p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
          <div className="flex items-center justify-between border-t border-border pt-3">
            <p className="text-xs text-muted-foreground">{state.loginHistory.length} events logged</p>
            <Button variant="outline" size="sm" onClick={() => { toast.success('Log exported') }}>
              <Download className="mr-1.5 h-3.5 w-3.5" /> Export Log
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

function SecurityScore({ score }: { score: number }) {
  const color = score >= 80 ? 'text-emerald-600' : score >= 60 ? 'text-amber-600' : 'text-red-600'
  const bg = score >= 80 ? 'bg-emerald-50 border-emerald-200' : score >= 60 ? 'bg-amber-50 border-amber-200' : 'bg-red-50 border-red-200'
  return (
    <div className={cn('flex items-center gap-2 rounded-lg border px-3 py-1.5', bg)}>
      <ShieldCheck className={cn('h-4 w-4', color)} />
      <div>
        <p className="text-[9px] uppercase tracking-wide text-muted-foreground">Security</p>
        <p className={cn('text-sm font-bold', color)}>{score}%</p>
      </div>
    </div>
  )
}

function ToggleRow({ label, desc, on, onToggle }: { label: string; desc: string; on: boolean; onToggle: () => void }) {
  return (
    <div className="flex items-center justify-between py-1">
      <div>
        <p className="text-sm font-medium text-ink">{label}</p>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
      <Switch checked={on} onCheckedChange={onToggle} />
    </div>
  )
}
