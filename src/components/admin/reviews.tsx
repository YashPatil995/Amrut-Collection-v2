'use client'

import * as React from 'react'
import {
  Star,
  ThumbsUp,
  Check,
  X,
  AlertTriangle,
  Quote,
  ShieldCheck,
  Trash2,
  RefreshCw,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useFetch } from '@/lib/useFetch'
import { toast } from 'sonner'
import { SectionHeader, EmptyState, timeAgo } from './shared'
import { cn } from '@/lib/utils'

interface ReviewsResp {
  reviews: any[]
}

export function Reviews() {
  const { data, loading, error, mutate } = useFetch<ReviewsResp>('/api/reviews?status=all')
  const [filter, setFilter] = React.useState<'all' | 'high' | 'low' | 'pending' | 'rejected'>('all')
  const [busy, setBusy] = React.useState<string | null>(null)

  const reviews = data?.reviews || []
  const avgRating = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(2) : '0.00'
  const fiveStars = reviews.filter((r) => r.rating >= 5).length
  const oneStars = reviews.filter((r) => r.rating <= 2).length

  const visible = reviews.filter((r) => {
    if (filter === 'high') return r.rating >= 4
    if (filter === 'low') return r.rating <= 3
    if (filter === 'pending') return r.status === 'pending'
    if (filter === 'rejected') return r.status === 'rejected'
    return true
  })

  const reload = async () => {
    await mutate()
  }

  const setStatus = async (id: string, status: 'approved' | 'rejected') => {
    setBusy(id)
    try {
      const res = await fetch('/api/reviews', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      })
      if (!res.ok) {
        const j = await res.json()
        throw new Error(j.error || 'Failed')
      }
      toast.success(status === 'approved' ? 'Review approved' : 'Review rejected', {
        description: status === 'approved' ? 'Now visible on the storefront.' : 'Hidden from storefront.',
      })
      await reload()
    } catch (e: any) {
      toast.error('Action failed', { description: e.message })
    } finally {
      setBusy(null)
    }
  }

  const removeReview = async (id: string) => {
    if (!confirm('Delete this review permanently? This cannot be undone.')) return
    setBusy(id)
    try {
      const res = await fetch(`/api/reviews?id=${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const j = await res.json()
        throw new Error(j.error || 'Failed')
      }
      toast.success('Review deleted')
      await reload()
    } catch (e: any) {
      toast.error('Delete failed', { description: e.message })
    } finally {
      setBusy(null)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <SectionHeader title="Reviews" subtitle="Moderate customer feedback" icon={Star} />
        <div className="grid gap-3 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="border-border/60"><CardContent className="h-24 animate-pulse bg-muted/40" /></Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return <EmptyState title="Couldn't load reviews" hint={error} icon={AlertTriangle} />
  }

  return (
    <div className="space-y-6">
      <SectionHeader title="Reviews" subtitle="Moderate customer feedback" icon={Star} />

      {/* KPIs */}
      <div className="grid gap-3 md:grid-cols-3">
        <Card className="border-border/60">
          <CardContent className="flex items-center gap-3 p-4">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold/15 text-gold-dark">
              <Star className="h-5 w-5" />
            </span>
            <div>
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Avg Rating</p>
              <p className="font-serif text-2xl font-bold text-ink">{avgRating} <span className="text-sm text-muted-foreground">/ 5</span></p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/60">
          <CardContent className="flex items-center gap-3 p-4">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
              <ThumbsUp className="h-5 w-5" />
            </span>
            <div>
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground">5-Star Reviews</p>
              <p className="font-serif text-2xl font-bold text-ink">{fiveStars}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/60">
          <CardContent className="flex items-center gap-3 p-4">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 text-rose-700">
              <AlertTriangle className="h-5 w-5" />
            </span>
            <div>
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Low Ratings (≤2★)</p>
              <p className="font-serif text-2xl font-bold text-ink">{oneStars}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        {([
          { k: 'all', label: 'All Reviews' },
          { k: 'high', label: 'Positive (4-5★)' },
          { k: 'low', label: 'Critical (≤3★)' },
          { k: 'pending', label: 'Pending' },
          { k: 'rejected', label: 'Rejected' },
        ] as const).map((f) => (
          <Button
            key={f.k}
            variant={filter === f.k ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(f.k)}
            className={cn(filter === f.k && 'maroon-gradient text-white hover:opacity-90')}
          >
            {f.label}
          </Button>
        ))}
        <Button variant="ghost" size="sm" className="ml-auto" onClick={reload}>
          <RefreshCw className="mr-1.5 h-3.5 w-3.5" /> Refresh
        </Button>
      </div>

      {/* List */}
      {visible.length === 0 ? (
        <EmptyState title="No reviews found" hint="No reviews match the selected filter." icon={Star} />
      ) : (
        <div className="grid max-h-[700px] gap-3 overflow-y-auto scrollbar-thin pr-1 lg:grid-cols-2">
          {visible.map((r) => {
            const isBusy = busy === r.id
            return (
              <Card key={r.id} className="border-border/60 transition-all hover:border-gold/40">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-10 w-10 border border-gold/30">
                      <AvatarFallback className="bg-muted text-xs font-bold text-maroon">
                        {r.userAvatar || r.userName?.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-semibold text-ink">{r.userName}</p>
                        {r.verified && (
                          <Badge variant="outline" className="gap-1 border-emerald-200 bg-emerald-50 text-emerald-700">
                            <ShieldCheck className="h-3 w-3" /> Verified
                          </Badge>
                        )}
                        {r.status === 'approved' && (
                          <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">Approved</Badge>
                        )}
                        {r.status === 'pending' && (
                          <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">Pending</Badge>
                        )}
                        {r.status === 'rejected' && (
                          <Badge className="bg-rose-100 text-rose-700 hover:bg-rose-100">Rejected</Badge>
                        )}
                        <span className="ml-auto text-xs text-muted-foreground">{timeAgo(r.createdAt)}</span>
                      </div>
                      <div className="mt-1 flex items-center gap-2">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={cn('h-3.5 w-3.5', s <= Math.round(r.rating) ? 'fill-gold text-gold' : 'text-muted-foreground/30')}
                            />
                          ))}
                        </div>
                        <span className="text-xs font-medium text-muted-foreground">{r.rating.toFixed(1)}</span>
                      </div>
                      <p className="mt-2 text-sm font-semibold text-maroon">{r.title}</p>
                      <div className="mt-1 flex gap-2">
                        <Quote className="h-4 w-4 shrink-0 text-muted-foreground/40" />
                        <p className="text-sm leading-relaxed text-foreground/80 line-clamp-3">{r.body}</p>
                      </div>
                      {r.product?.name && (
                        <p className="mt-2 text-[11px] text-muted-foreground">on <span className="font-medium text-ink">{r.product.name}</span></p>
                      )}
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        {r.status !== 'approved' && (
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={isBusy}
                            className="h-7 gap-1 border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                            onClick={() => setStatus(r.id, 'approved')}
                          >
                            <Check className="h-3.5 w-3.5" /> Approve
                          </Button>
                        )}
                        {r.status !== 'rejected' && (
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={isBusy}
                            className="h-7 gap-1 border-rose-200 text-rose-700 hover:bg-rose-50"
                            onClick={() => setStatus(r.id, 'rejected')}
                          >
                            <X className="h-3.5 w-3.5" /> Reject
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          disabled={isBusy}
                          className="h-7 gap-1 text-destructive hover:bg-destructive/10"
                          onClick={() => removeReview(r.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" /> Delete
                        </Button>
                        <span className="ml-auto flex items-center gap-1 text-xs text-muted-foreground">
                          <ThumbsUp className="h-3 w-3" /> {r.helpful}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
