'use client'

import * as React from 'react'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import {
  TrendingUp,
  CalendarRange,
  PieChart as PieIcon,
  MapPin,
  Layers,
  Flame,
  TrendingDown,
  AlertTriangle,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useFetch } from '@/lib/useFetch'
import { ChartSkeleton, EmptyState, SectionHeader, formatINR, compactINR } from './shared'

interface AnalyticsResp {
  daily: { date: string; revenue: number; orders: number }[]
  monthly: { month: string; revenue: number; orders: number }[]
  genderSales: { name: string; value: number }[]
  topCities: { city: string; orders: number; revenue: number }[]
  categoryRevenue: { name: string; revenue: number }[]
  bestSellers: { name: string; sold: number }[]
  worstSellers: { name: string; sold: number }[]
}

const PALETTE = ['#7c2d3a', '#b8893d', '#6b7a3c', '#a85838', '#c9a96e', '#4a5a2c']
const MAROON = '#7c2d3a'
const GOLD = '#b8893d'
const OLIVE = '#6b7a3c'

const tooltipStyle = {
  borderRadius: 10,
  border: '1px solid #e7e2d8',
  fontSize: 12,
  background: '#fffaf2',
  boxShadow: '0 6px 20px rgba(124, 45, 58, 0.12)',
}

export function Analytics() {
  const { data, loading, error } = useFetch<AnalyticsResp>('/api/admin/analytics')

  if (loading) {
    return (
      <div className="space-y-6">
        <SectionHeader title="Analytics" subtitle="Revenue, channels & product performance" icon={TrendingUp} />
        <div className="grid gap-4 lg:grid-cols-2">
          <ChartSkeleton />
          <ChartSkeleton />
          <ChartSkeleton />
          <ChartSkeleton />
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <EmptyState
        title="Couldn't load analytics"
        hint={error || 'Server returned no data.'}
        icon={AlertTriangle}
      />
    )
  }

  const genderLabels: Record<string, string> = { men: 'Men', women: 'Women', kids: 'Kids' }
  const genderData = data.genderSales.map((g) => ({ ...g, label: genderLabels[g.name] || g.name }))
  const totalGender = genderData.reduce((s, g) => s + g.value, 0) || 1
  const totalDailyRev = data.daily.reduce((s, d) => s + d.revenue, 0)
  const totalMonthlyRev = data.monthly.reduce((s, d) => s + d.revenue, 0)

  return (
    <div className="space-y-6">
      <SectionHeader title="Analytics" subtitle="Revenue, channels & product performance" icon={TrendingUp} />

      {/* Revenue daily area */}
      <Card className="border-border/60">
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="font-serif text-lg text-ink">Revenue — Last 14 Days</CardTitle>
            <CardDescription>Daily revenue trend across all channels</CardDescription>
          </div>
          <Badge className="gap-1 bg-maroon/10 text-maroon hover:bg-maroon/10">
            <TrendingUp className="h-3 w-3" /> {formatINR(totalDailyRev)}
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.daily} margin={{ left: 0, right: 12, top: 8, bottom: 0 }}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={MAROON} stopOpacity={0.35} />
                    <stop offset="100%" stopColor={MAROON} stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e7e2d8" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#6b7a3c' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#6b7a3c' }} axisLine={false} tickLine={false} tickFormatter={(v) => compactINR(v)} />
                <Tooltip
                  cursor={{ stroke: GOLD, strokeWidth: 1, strokeDasharray: '4 4' }}
                  contentStyle={tooltipStyle}
                  formatter={(v: any, n: any) => [n === 'revenue' ? formatINR(v) : v, n === 'revenue' ? 'Revenue' : 'Orders']}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke={MAROON}
                  strokeWidth={2.5}
                  fill="url(#revGrad)"
                  dot={{ r: 3, fill: MAROON, strokeWidth: 0 }}
                  activeDot={{ r: 5, fill: GOLD, stroke: '#fff', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Monthly + gender */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="border-border/60 lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="font-serif text-lg text-ink">Monthly Revenue — Current Year</CardTitle>
              <CardDescription>12-month revenue & order count</CardDescription>
            </div>
            <Badge className="gap-1 bg-gold/15 text-gold-dark hover:bg-gold/15">
              <CalendarRange className="h-3 w-3" /> {formatINR(totalMonthlyRev)}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.monthly} margin={{ left: 0, right: 0, top: 8, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e7e2d8" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#6b7a3c' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#6b7a3c' }} axisLine={false} tickLine={false} tickFormatter={(v) => compactINR(v)} />
                  <Tooltip cursor={{ fill: 'rgba(184, 137, 61, 0.1)' }} contentStyle={tooltipStyle} formatter={(v: any, n: any) => [n === 'revenue' ? formatINR(v) : v, n === 'revenue' ? 'Revenue' : 'Orders']} />
                  <Bar dataKey="revenue" radius={[6, 6, 0, 0]} fill={MAROON} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="font-serif text-lg text-ink">Sales by Gender</CardTitle>
            <CardDescription>Units sold split</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[220px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={genderData}
                    dataKey="value"
                    nameKey="label"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                  >
                    {genderData.map((_, i) => (
                      <Cell key={i} fill={PALETTE[i % PALETTE.length]} stroke="#fffaf2" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} formatter={(v: any, n: any) => [`${v} units`, n]} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2 text-center">
              {genderData.map((g, i) => (
                <div key={g.name} className="rounded-lg border border-border/50 bg-muted/30 p-2">
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{g.label}</p>
                  <p className="text-sm font-bold" style={{ color: PALETTE[i] }}>
                    {Math.round((g.value / totalGender) * 100)}%
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top cities + category revenue */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border-border/60">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="font-serif text-lg text-ink">Top Cities</CardTitle>
              <CardDescription>By revenue contribution</CardDescription>
            </div>
            <MapPin className="h-5 w-5 text-olive" />
          </CardHeader>
          <CardContent>
            <div className="h-[260px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.topCities} layout="vertical" margin={{ left: 0, right: 16, top: 4, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e7e2d8" />
                  <XAxis type="number" tick={{ fontSize: 10, fill: '#6b7a3c' }} axisLine={false} tickLine={false} tickFormatter={(v) => compactINR(v)} />
                  <YAxis type="category" dataKey="city" tick={{ fontSize: 11, fill: '#3a2d2d' }} width={70} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{ fill: 'rgba(184, 137, 61, 0.1)' }} contentStyle={tooltipStyle} formatter={(v: any, n: any) => [n === 'revenue' ? formatINR(v) : v, n === 'revenue' ? 'Revenue' : 'Orders']} />
                  <Bar dataKey="revenue" radius={[0, 6, 6, 0]} fill={GOLD} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="font-serif text-lg text-ink">Revenue by Category</CardTitle>
              <CardDescription>Catalogue contribution</CardDescription>
            </div>
            <Layers className="h-5 w-5 text-maroon" />
          </CardHeader>
          <CardContent>
            <div className="h-[260px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.categoryRevenue} margin={{ left: 0, right: 0, top: 8, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e7e2d8" />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#6b7a3c' }} axisLine={false} tickLine={false} interval={0} angle={-15} textAnchor="end" height={50} />
                  <YAxis tick={{ fontSize: 10, fill: '#6b7a3c' }} axisLine={false} tickLine={false} tickFormatter={(v) => compactINR(v)} />
                  <Tooltip cursor={{ fill: 'rgba(184, 137, 61, 0.1)' }} contentStyle={tooltipStyle} formatter={(v: any) => [formatINR(v), 'Revenue']} />
                  <Bar dataKey="revenue" radius={[6, 6, 0, 0]}>
                    {data.categoryRevenue.map((_, i) => (
                      <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Best vs worst sellers */}
      <div className="grid gap-4 lg:grid-cols-2">
        <SellersCard
          title="Best Sellers"
          icon={Flame}
          tone="maroon"
          items={data.bestSellers}
          max={Math.max(1, ...data.bestSellers.map((s) => s.sold))}
        />
        <SellersCard
          title="Needs Attention"
          subtitle="Slowest moving inventory"
          icon={TrendingDown}
          tone="olive"
          items={data.worstSellers}
          max={Math.max(1, ...data.worstSellers.map((s) => s.sold))}
        />
      </div>

      {/* Insight footer */}
      <Card className="border-gold/30 bg-gradient-to-br from-cream to-beige/40">
        <CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl maroon-gradient text-gold">
              <PieIcon className="h-5 w-5" />
            </span>
            <div>
              <p className="font-serif text-base font-semibold text-maroon">Owner Insight</p>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {data.bestSellers[0]
                  ? `“${data.bestSellers[0].name}” is your top performer with ${data.bestSellers[0].sold} units sold. Consider amplifying it in marketing campaigns.`
                  : 'Connect more product data to unlock insights.'}
              </p>
            </div>
          </div>
          <Badge className="self-start bg-maroon text-white hover:bg-maroon sm:self-auto">Recommendation</Badge>
        </CardContent>
      </Card>
    </div>
  )
}

function SellersCard({
  title,
  subtitle,
  icon: Icon,
  tone,
  items,
  max,
}: {
  title: string
  subtitle?: string
  icon: React.ComponentType<{ className?: string }>
  tone: 'maroon' | 'olive'
  items: { name: string; sold: number }[]
  max: number
}) {
  const toneClass = tone === 'maroon' ? 'bg-maroon/10 text-maroon' : 'bg-olive/12 text-olive'
  const barColor = tone === 'maroon' ? MAROON : OLIVE
  return (
    <Card className="border-border/60">
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle className="font-serif text-lg text-ink">{title}</CardTitle>
          {subtitle && <CardDescription>{subtitle}</CardDescription>}
        </div>
        <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${toneClass}`}>
          <Icon className="h-4 w-4" />
        </span>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">No data yet.</p>
        ) : (
          items.map((it, i) => {
            const pct = Math.round((it.sold / max) * 100)
            return (
              <div key={it.name + i} className="space-y-1.5">
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="flex min-w-0 items-center gap-2">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-bold text-maroon">
                      {i + 1}
                    </span>
                    <span className="truncate font-medium text-ink">{it.name}</span>
                  </span>
                  <span className="shrink-0 text-xs font-semibold text-muted-foreground">{it.sold} sold</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: barColor }} />
                </div>
              </div>
            )
          })
        )}
      </CardContent>
    </Card>
  )
}
