'use client'

import * as React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

// ---------- formatting ----------
export function formatINR(n: number | undefined | null): string {
  const v = Number(n || 0)
  return '₹' + v.toLocaleString('en-IN', { maximumFractionDigits: 0 })
}

export function compactINR(n: number | undefined | null): string {
  const v = Number(n || 0)
  if (v >= 10000000) return '₹' + (v / 10000000).toFixed(2) + ' Cr'
  if (v >= 100000) return '₹' + (v / 100000).toFixed(2) + ' L'
  if (v >= 1000) return '₹' + (v / 1000).toFixed(1) + 'K'
  return '₹' + v.toLocaleString('en-IN')
}

export function timeAgo(iso: string | Date): string {
  const d = new Date(iso)
  const diff = Date.now() - d.getTime()
  const sec = Math.floor(diff / 1000)
  if (sec < 60) return 'just now'
  const min = Math.floor(sec / 60)
  if (min < 60) return `${min}m ago`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `${hr}h ago`
  const day = Math.floor(hr / 24)
  if (day < 30) return `${day}d ago`
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })
}

export function shortDate(iso: string | Date): string {
  const d = new Date(iso)
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' })
}

// ---------- status helpers ----------
const STATUS_STYLES: Record<string, string> = {
  ordered: 'bg-blue-100 text-blue-800 border-blue-200',
  packed: 'bg-amber-100 text-amber-800 border-amber-200',
  shipped: 'bg-violet-100 text-violet-800 border-violet-200',
  out_for_delivery: 'bg-cyan-100 text-cyan-800 border-cyan-200',
  delivered: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  cancelled: 'bg-rose-100 text-rose-800 border-rose-200',
  returned: 'bg-orange-100 text-orange-800 border-orange-200',
}

const STATUS_LABELS: Record<string, string> = {
  ordered: 'Ordered',
  packed: 'Packed',
  shipped: 'Shipped',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  returned: 'Returned',
}

export function OrderStatusBadge({ status }: { status: string }) {
  return (
    <Badge variant="outline" className={cn('border font-medium', STATUS_STYLES[status] || 'bg-muted text-foreground')}>
      {STATUS_LABELS[status] || status}
    </Badge>
  )
}

export const ORDER_STATUSES = Object.keys(STATUS_LABELS)

const PAY_STYLES: Record<string, string> = {
  paid: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  pending: 'bg-amber-100 text-amber-800 border-amber-200',
  failed: 'bg-rose-100 text-rose-800 border-rose-200',
  refunded: 'bg-orange-100 text-orange-800 border-orange-200',
}
const PAY_LABELS: Record<string, string> = {
  paid: 'Paid',
  pending: 'Pending',
  failed: 'Failed',
  refunded: 'Refunded',
}
export function PaymentStatusBadge({ status }: { status: string }) {
  return (
    <Badge variant="outline" className={cn('border font-medium capitalize', PAY_STYLES[status] || 'bg-muted')}>
      {PAY_LABELS[status] || status}
    </Badge>
  )
}

export function PaymentMethodBadge({ method }: { method: string }) {
  const map: Record<string, string> = {
    upi: 'bg-violet-50 text-violet-700 border-violet-200',
    card: 'bg-sky-50 text-sky-700 border-sky-200',
    cod: 'bg-amber-50 text-amber-700 border-amber-200',
    wallet: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  }
  return (
    <Badge variant="outline" className={cn('border font-medium uppercase', map[method] || 'bg-muted')}>
      {method}
    </Badge>
  )
}

// ---------- shared building blocks ----------
export function SectionHeader({
  title,
  subtitle,
  icon: Icon,
  action,
}: {
  title: string
  subtitle?: string
  icon?: React.ComponentType<{ className?: string }>
  action?: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        {Icon && (
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-maroon/8 text-maroon">
            <Icon className="h-5 w-5" />
          </span>
        )}
        <div>
          <h2 className="font-serif text-2xl font-bold text-ink sm:text-3xl">{title}</h2>
          {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  )
}

export function EmptyState({ title, hint, icon: Icon }: { title: string; hint?: string; icon?: React.ComponentType<{ className?: string }> }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-muted/30 px-6 py-12 text-center">
      {Icon && <Icon className="h-10 w-10 text-muted-foreground/60" />}
      <p className="font-serif text-lg font-semibold text-ink">{title}</p>
      {hint && <p className="max-w-md text-sm text-muted-foreground">{hint}</p>}
    </div>
  )
}

// ---------- skeletons ----------
export function KpiSkeleton() {
  return (
    <Card className="border-border/60">
      <CardContent className="p-5">
        <Skeleton className="h-10 w-10 rounded-lg" />
        <Skeleton className="mt-4 h-3 w-20" />
        <Skeleton className="mt-2 h-7 w-28" />
        <Skeleton className="mt-2 h-3 w-16" />
      </CardContent>
    </Card>
  )
}

export function TableSkeleton({ rows = 6, cols = 6 }: { rows?: number; cols?: number }) {
  return (
    <div className="space-y-3">
      <Skeleton className="h-10 w-full" />
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full" style={{ animationDelay: `${i * 60}ms` }} />
      ))}
      <div className="hidden">{cols}</div>
    </div>
  )
}

export function ChartSkeleton() {
  return <Skeleton className="h-[280px] w-full rounded-xl" />
}
