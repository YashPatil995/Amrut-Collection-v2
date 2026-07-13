'use client'

import * as React from 'react'
import {
  Users,
  Mail,
  Phone,
  Crown,
  ShoppingBag,
  IndianRupee,
  AlertTriangle,
  Star,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useFetch } from '@/lib/useFetch'
import { SectionHeader, TableSkeleton, EmptyState, formatINR } from './shared'
import { cn } from '@/lib/utils'

interface StatsResp {
  topCustomers: { name: string; email: string; orders: number; spent: number }[]
  kpi: Record<string, number>
}

interface DBUser {
  id: string
  name: string
  email: string | null
  phone: string | null
  avatar: string | null
  provider: string
  loginCount: number
  totalSpent: number
  ordersCount: number
  createdAt: string
}

const TIERS = [
  { min: 50000, label: 'Platinum', color: 'bg-violet-100 text-violet-700' },
  { min: 20000, label: 'Gold', color: 'bg-amber-100 text-amber-700' },
  { min: 5000, label: 'Silver', color: 'bg-slate-100 text-slate-700' },
  { min: 0, label: 'Bronze', color: 'bg-orange-100 text-orange-700' },
]

function tierFor(spent: number) {
  return TIERS.find((t) => spent >= t.min) || TIERS[TIERS.length - 1]
}

function initials(name: string) {
  return name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()
}

export function Customers() {
  const { data, loading, error } = useFetch<StatsResp>('/api/admin/stats')
  const { data: usersData } = useFetch<{ users: DBUser[]; total: number }>('/api/users')
  const customers = data?.topCustomers || []
  const dbUsers = usersData?.users || []
  const kpi = data?.kpi

  if (loading) {
    return (
      <div className="space-y-6">
        <SectionHeader title="Customers" subtitle="Your most valuable buyers" icon={Users} />
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="border-border/60"><CardContent className="p-5"><TableSkeleton rows={1} /></CardContent></Card>
          ))}
        </div>
        <TableSkeleton />
      </div>
    )
  }

  if (error || !data) {
    return <EmptyState title="Couldn't load customers" hint={error} icon={AlertTriangle} />
  }

  return (
    <div className="space-y-6">
      <SectionHeader title="Customers" subtitle="Your most valuable buyers" icon={Users} />

      {/* KPI row */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="Total Customers" value={(kpi?.totalCustomers || 0).toLocaleString('en-IN')} icon={Users} tone="maroon" />
        <StatCard label="Repeat Customers" value={(kpi?.repeatCustomers || 0).toLocaleString('en-IN')} icon={ShoppingBag} tone="gold" />
        <StatCard label="Avg Spend / Customer" value={formatINR(customers.length ? customers.reduce((s, c) => s + c.spent, 0) / customers.length : 0)} icon={IndianRupee} tone="olive" />
        <StatCard label="Top Spender" value={customers[0] ? formatINR(customers[0].spent) : '₹0'} icon={Crown} tone="maroon" />
      </div>

      {/* Top customers cards */}
      <div>
        <p className="mb-3 font-serif text-lg font-semibold text-ink">Top Spenders</p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {customers.length === 0 ? (
            <div className="sm:col-span-2 lg:col-span-3">
              <EmptyState title="No customers yet" hint="Customer data appears after the first order." icon={Users} />
            </div>
          ) : (
            customers.map((c, i) => {
              const tier = tierFor(c.spent)
              return (
                <Card key={c.email} className="group border-border/60 transition-all hover:-translate-y-0.5 hover:border-gold/40 hover:shadow-md hover:shadow-maroon/5">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-11 w-11 border-2 border-gold/40">
                          <AvatarFallback className="maroon-gradient text-sm font-bold text-gold">{initials(c.name)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-semibold text-ink">{c.name}</p>
                          <p className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Mail className="h-3 w-3" /> {c.email}
                          </p>
                        </div>
                      </div>
                      {i === 0 && (
                        <Badge className="gap-1 bg-gold/15 text-gold-dark hover:bg-gold/15">
                          <Crown className="h-3 w-3" /> #1
                        </Badge>
                      )}
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <Badge className={cn('font-medium', tier.color)}>{tier.label}</Badge>
                      <div className="text-right">
                        <p className="font-serif text-lg font-bold text-maroon">{formatINR(c.spent)}</p>
                        <p className="text-[11px] text-muted-foreground">{c.orders} order(s)</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })
          )}
        </div>
      </div>

      {/* Full table */}
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="font-serif text-lg text-ink">Customer Ledger</CardTitle>
          <CardDescription>Ranked by lifetime spend</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead className="pl-4">Rank</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="text-right">Orders</TableHead>
                  <TableHead className="text-right">Lifetime Spend</TableHead>
                  <TableHead className="pr-4">Tier</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-8 text-center text-sm text-muted-foreground">No customers yet.</TableCell>
                  </TableRow>
                ) : (
                  customers.map((c, i) => {
                    const tier = tierFor(c.spent)
                    return (
                      <TableRow key={c.email}>
                        <TableCell className="pl-4">
                          <span className={cn('flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold',
                            i === 0 ? 'bg-gold text-white' : i === 1 ? 'bg-slate-300 text-slate-800' : i === 2 ? 'bg-orange-200 text-orange-800' : 'bg-muted text-muted-foreground')}>
                            {i + 1}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-7 w-7"><AvatarFallback className="bg-muted text-[10px] font-bold text-maroon">{initials(c.name)}</AvatarFallback></Avatar>
                            <span className="text-sm font-medium text-ink">{c.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">{c.email}</TableCell>
                        <TableCell className="text-right text-sm text-ink">{c.orders}</TableCell>
                        <TableCell className="text-right text-sm font-semibold text-maroon">{formatINR(c.spent)}</TableCell>
                        <TableCell className="pr-4"><Badge className={cn('font-medium', tier.color)}>{tier.label}</Badge></TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Registered Users (real DB users from signup/login) */}
      <Card className="border-border/60">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 font-serif text-lg text-ink">
                <Users className="h-5 w-5 text-maroon" /> Registered Users
              </CardTitle>
              <CardDescription>Customers who created accounts via Google, Phone or Email</CardDescription>
            </div>
            <Badge className="bg-maroon text-white">{dbUsers.length} registered</Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto max-h-[500px] overflow-y-auto scrollbar-thin">
            <Table>
              <TableHeader className="sticky top-0 bg-muted/40">
                <TableRow>
                  <TableHead className="pl-4">User</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead className="text-right">Logins</TableHead>
                  <TableHead className="text-right">Orders</TableHead>
                  <TableHead className="text-right pr-4">Spent</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dbUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-8 text-center text-sm text-muted-foreground">
                      No registered users yet. New signups will appear here.
                    </TableCell>
                  </TableRow>
                ) : (
                  dbUsers.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell className="pl-4">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="maroon-gradient text-[10px] font-bold text-gold">
                              {u.avatar || initials(u.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium text-ink">{u.name}</p>
                            <p className="text-[10px] text-muted-foreground">
                              Joined {new Date(u.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {u.email && <p className="flex items-center gap-1"><Mail className="h-3 w-3" /> {u.email}</p>}
                        {u.phone && <p className="flex items-center gap-1"><Phone className="h-3 w-3" /> +91 {u.phone}</p>}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-[10px] capitalize">
                          {u.provider === 'google' ? '🔵 Google' : u.provider === 'phone' ? '📱 Phone OTP' : '✉️ Email OTP'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right text-sm text-ink">{u.loginCount}</TableCell>
                      <TableCell className="text-right text-sm text-ink">{u.ordersCount}</TableCell>
                      <TableCell className="text-right pr-4 text-sm font-semibold text-maroon">{formatINR(u.totalSpent)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function StatCard({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string
  value: string
  icon: React.ComponentType<{ className?: string }>
  tone: 'maroon' | 'gold' | 'olive'
}) {
  const toneClass = tone === 'maroon' ? 'bg-maroon/10 text-maroon' : tone === 'gold' ? 'bg-gold/15 text-gold-dark' : 'bg-olive/12 text-olive'
  return (
    <Card className="border-border/60">
      <CardContent className="p-4">
        <span className={cn('flex h-9 w-9 items-center justify-center rounded-lg', toneClass)}>
          <Icon className="h-4 w-4" />
        </span>
        <p className="mt-3 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="font-serif text-lg font-bold text-ink">{value}</p>
      </CardContent>
    </Card>
  )
}
