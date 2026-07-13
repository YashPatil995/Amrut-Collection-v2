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
} from 'recharts'
import {
  Banknote,
  TrendingUp,
  CalendarDays,
  Coins,
  ShoppingCart,
  Gauge,
  Users,
  Package,
  Clock,
  AlertTriangle,
  RefreshCw,
  Star,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useFetch } from '@/lib/useFetch'
import {
  formatINR,
  compactINR,
  timeAgo,
  KpiSkeleton,
  TableSkeleton,
  ChartSkeleton,
  OrderStatusBadge,
  SectionHeader,
  EmptyState,
} from './shared'
import { cn } from '@/lib/utils'

interface StatsResp {
  kpi: Record<string, number>
  topProducts: any[]
  topCategories: { name: string; qty: number }[]
  topCustomers: { name: string; email: string; orders: number; spent: number }[]
  statusBreakdown: { status: string; count: number }[]
  paymentBreakdown: { method: string; count: number }[]
  recentOrders: any[]
}

const PALETTE = ['#7c2d3a', '#b8893d', '#6b7a3c', '#a85838', '#c9a96e', '#4a5a2c']

export function Overview() {
  const [refreshKey, setRefreshKey] = React.useState(0)
  const [lastUpdated, setLastUpdated] = React.useState<Date | null>(null)
  const { data, loading, error } = useFetch<StatsResp>(`/api/admin/stats?_=${refreshKey}`, [refreshKey])

  // Auto-refresh every 15 seconds so new orders show up live
  React.useEffect(() => {
    const interval = setInterval(() => {
      setRefreshKey((k) => k + 1)
      setLastUpdated(new Date())
    }, 15000)
    return () => clearInterval(interval)
  }, [])

  // Mark last updated on first load
  React.useEffect(() => {
    if (data && !lastUpdated) setLastUpdated(new Date())
  }, [data, lastUpdated])

  const manualRefresh = () => {
    setRefreshKey((k) => k + 1)
    setLastUpdated(new Date())
  }

  if (loading && !data) {
    return (
      <div className="space-y-6">
        <SectionHeader title="Overview" subtitle="Live snapshot of your store performance" icon={TrendingUp} />
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          {Array.from({ length: 11 }).map((_, i) => (
            <KpiSkeleton key={i} />
          ))}
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2"><ChartSkeleton /></div>
          <ChartSkeleton />
        </div>
        <TableSkeleton />
      </div>
    )
  }

  if (error || !data) {
    return (
      <EmptyState
        title="Couldn't load overview"
        hint={error || 'Server returned no data. Try refreshing.'}
        icon={AlertTriangle}
      />
    )
  }

  const k = data.kpi
  const cards: KpiCardData[] = [
    { label: "Today's Sales", value: formatINR(k.todaySales), icon: Banknote, tone: 'maroon', trend: +8.2, hint: `${k.todayOrders} orders` },
    { label: 'Week Sales', value: formatINR(k.weekSales), icon: CalendarDays, tone: 'gold', trend: +5.4, hint: `${k.weekOrders} orders` },
    { label: 'Month Sales', value: formatINR(k.monthSales), icon: Coins, tone: 'olive', trend: +12.1, hint: `${k.monthOrders} orders` },
    { label: 'Total Revenue', value: formatINR(k.totalRevenue), icon: TrendingUp, tone: 'maroon', trend: +18.7, hint: 'All time' },
    { label: 'Total Orders', value: k.totalOrders.toLocaleString('en-IN'), icon: ShoppingCart, tone: 'gold', trend: +6.3, hint: 'All time' },
    { label: 'Avg Order Value', value: formatINR(k.avgOrderValue), icon: Gauge, tone: 'olive', trend: -2.1, hint: 'Per order' },
    { label: 'Total Customers', value: k.totalCustomers.toLocaleString('en-IN'), icon: Users, tone: 'maroon', trend: +4.5, hint: 'Unique buyers' },
    { label: 'Total Products', value: k.totalProducts.toLocaleString('en-IN'), icon: Package, tone: 'gold', trend: 0, hint: `${k.totalStock} units in stock` },
    { label: 'Pending Orders', value: k.pendingOrders.toLocaleString('en-IN'), icon: Clock, tone: 'olive', trend: 0, hint: 'Awaiting fulfilment' },
    { label: 'Low Stock Alert', value: k.lowStock.toLocaleString('en-IN'), icon: AlertTriangle, tone: 'maroon', trend: 0, hint: 'Below 25 units' },
    { label: 'Repeat Customers', value: k.repeatCustomers.toLocaleString('en-IN'), icon: RefreshCw, tone: 'gold', trend: +3.2, hint: 'Multi-order buyers' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <SectionHeader title="Overview" subtitle="Live snapshot of your store performance" icon={TrendingUp} />
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
            </span>
            {lastUpdated ? `Updated ${lastUpdated.toLocaleTimeString('en-IN')}` : 'Live'}
          </span>
          <Button variant="outline" size="sm" onClick={manualRefresh} className="h-8 border-border/60">
            <RefreshCw className={cn('mr-1.5 h-3.5 w-3.5', loading && 'animate-spin')} /> Refresh
          </Button>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
        {cards.map((c) => (
          <KpiCard key={c.label} {...c} />
        ))}
      </div>

      {/* Recent orders + breakdowns */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2 border-border/60">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="font-serif text-lg text-ink">Live Order Feed</CardTitle>
              <CardDescription>Latest 8 orders across all channels</CardDescription>
            </div>
            <Badge className="gap-1 bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" /> Live
            </Badge>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-[420px] overflow-y-auto scrollbar-thin">
              <Table>
                <TableHeader className="sticky top-0 bg-card">
                  <TableRow>
                    <TableHead className="pl-4">Order</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="pr-4 text-right">When</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.recentOrders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="py-8 text-center text-sm text-muted-foreground">
                        No orders yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    data.recentOrders.map((o) => (
                      <TableRow key={o.orderNo} className="cursor-pointer">
                        <TableCell className="pl-4 font-mono text-xs font-semibold text-maroon">{o.orderNo}</TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-ink">{o.customerName}</span>
                            <span className="text-xs text-muted-foreground">{o.items} item(s)</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right text-sm font-semibold text-ink">{formatINR(o.total)}</TableCell>
                        <TableCell><OrderStatusBadge status={o.status} /></TableCell>
                        <TableCell className="pr-4 text-right text-xs text-muted-foreground">{timeAgo(o.createdAt)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <BreakdownCard
            title="Order Status"
            data={data.statusBreakdown.map((s) => ({ label: s.status, value: s.count }))}
          />
          <BreakdownCard
            title="Payment Methods"
            data={data.paymentBreakdown.map((p) => ({ label: p.method, value: p.count }))}
            palette={['#7c2d3a', '#b8893d', '#6b7a3c', '#a85838']}
          />
        </div>
      </div>

      {/* Top products + categories */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2 border-border/60">
          <CardHeader>
            <CardTitle className="font-serif text-lg text-ink">Top Performing Products</CardTitle>
            <CardDescription>Best sellers by units sold</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.topProducts.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">No products sold yet.</p>
              ) : (
                data.topProducts.map((p, i) => {
                  const img = Array.isArray(p.images) ? p.images[0] : ''
                  return (
                    <div key={p.id} className="flex items-center gap-3 rounded-lg border border-border/50 bg-muted/30 p-2.5">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-maroon text-xs font-bold text-gold">
                        {i + 1}
                      </span>
                      <div className="h-12 w-10 shrink-0 overflow-hidden rounded-md bg-muted">
                        {img && <img src={img} alt={p.name} className="h-full w-full object-cover" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-ink">{p.name}</p>
                        <div className="mt-0.5 flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Star className="h-3 w-3 fill-gold text-gold" /> {p.rating}
                          </span>
                          <span>{p.stock} in stock</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-maroon">{p.sold}</p>
                        <p className="text-[10px] uppercase tracking-wide text-muted-foreground">sold</p>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="font-serif text-lg text-ink">Top Categories</CardTitle>
            <CardDescription>By units sold</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.topCategories} layout="vertical" margin={{ left: 0, right: 12, top: 4, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e7e2d8" />
                  <XAxis type="number" tick={{ fontSize: 11, fill: '#6b7a3c' }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#3a2d2d' }} width={90} axisLine={false} tickLine={false} />
                  <Tooltip
                    cursor={{ fill: 'rgba(184, 137, 61, 0.1)' }}
                    contentStyle={{ borderRadius: 8, border: '1px solid #e7e2d8', fontSize: 12 }}
                  />
                  <Bar dataKey="qty" radius={[0, 6, 6, 0]}>
                    {data.topCategories.map((_, i) => (
                      <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sparkline revenue */}
      <RevenueSparkline data={data} />
    </div>
  )
}

interface KpiCardData {
  label: string
  value: string
  icon: React.ComponentType<{ className?: string }>
  tone: 'maroon' | 'gold' | 'olive'
  trend: number
  hint?: string
}

const TONE_CLASSES = {
  maroon: 'bg-maroon/10 text-maroon group-hover:bg-maroon group-hover:text-white',
  gold: 'bg-gold/15 text-gold-dark group-hover:bg-gold group-hover:text-white',
  olive: 'bg-olive/12 text-olive group-hover:bg-olive group-hover:text-white',
}

function KpiCard({ label, value, icon: Icon, tone, trend, hint }: KpiCardData) {
  return (
    <Card className="group overflow-hidden border-border/60 transition-all hover:-translate-y-0.5 hover:border-gold/40 hover:shadow-md hover:shadow-maroon/5">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <span className={cn('flex h-9 w-9 items-center justify-center rounded-lg transition-colors', TONE_CLASSES[tone])}>
            <Icon className="h-4 w-4" />
          </span>
          {trend !== 0 && (
            <span
              className={cn(
                'flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-semibold',
                trend > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
              )}
            >
              {trend > 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
              {Math.abs(trend)}%
            </span>
          )}
        </div>
        <p className="mt-3 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="mt-0.5 font-serif text-xl font-bold text-ink sm:text-2xl">{value}</p>
        {hint && <p className="mt-1 text-[11px] text-muted-foreground">{hint}</p>}
      </CardContent>
    </Card>
  )
}

function BreakdownCard({
  title,
  data,
  palette = PALETTE,
}: {
  title: string
  data: { label: string; value: number }[]
  palette?: string[]
}) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1
  const labelMap: Record<string, string> = {
    ordered: 'Ordered',
    packed: 'Packed',
    shipped: 'Shipped',
    out_for_delivery: 'Out for Delivery',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
    returned: 'Returned',
    upi: 'UPI',
    card: 'Card',
    cod: 'COD',
    wallet: 'Wallet',
  }
  return (
    <Card className="border-border/60">
      <CardHeader className="pb-3">
        <CardTitle className="font-serif text-base text-ink">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2.5">
        {data.map((d, i) => {
          const pct = Math.round((d.value / total) * 100)
          return (
            <div key={d.label} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 font-medium text-ink">
                  <span className="h-2 w-2 rounded-full" style={{ background: palette[i % palette.length] }} />
                  {labelMap[d.label] || d.label}
                </span>
                <span className="text-muted-foreground">
                  {d.value} <span className="opacity-60">· {pct}%</span>
                </span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${pct}%`, background: palette[i % palette.length] }}
                />
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}

function RevenueSparkline({ data }: { data: StatsResp }) {
  // Build a small 7-bar pseudo weekly view from statusBreakdown counts as proxy is wrong;
  // instead we show topCustomers mini-bar chart.
  const chartData = data.topCustomers.map((c) => ({ name: c.name.split(' ')[0], spent: c.spent }))
  return (
    <Card className="border-border/60">
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle className="font-serif text-lg text-ink">Top Customers by Spend</CardTitle>
          <CardDescription>Highest lifetime value buyers</CardDescription>
        </div>
        <Sparkles className="h-5 w-5 text-gold" />
      </CardHeader>
      <CardContent>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ left: 0, right: 0, top: 8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e7e2d8" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#3a2d2d' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#6b7a3c' }} axisLine={false} tickLine={false} tickFormatter={(v) => compactINR(v)} />
              <Tooltip
                cursor={{ fill: 'rgba(184, 137, 61, 0.1)' }}
                contentStyle={{ borderRadius: 8, border: '1px solid #e7e2d8', fontSize: 12 }}
                formatter={(v: any) => [formatINR(v), 'Spent']}
              />
              <Bar dataKey="spent" radius={[6, 6, 0, 0]} fill="#7c2d3a" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
