'use client'

import * as React from 'react'
import {
  Shapes,
  Package,
  ArrowRight,
  ImageOff,
  TrendingUp,
  TrendingDown,
  Sparkles,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useFetch } from '@/lib/useFetch'
import { toast } from 'sonner'
import { SectionHeader, EmptyState, formatINR } from './shared'
import { cn } from '@/lib/utils'

interface PatternSample {
  id: string
  name: string
  slug: string
  image: string | null
  price: number
}

interface PatternItem {
  name: string
  count: number
  samples: PatternSample[]
}

export function PatternsManager() {
  const { data, loading } = useFetch<{ patterns: PatternItem[]; total: number }>(`/api/patterns`, [])
  const patterns = data?.patterns || []

  const totalProducts = patterns.reduce((sum, p) => sum + p.count, 0)
  const mostUsed = patterns[0]
  const leastUsed = patterns.length > 0 ? patterns[patterns.length - 1] : null

  const goToProducts = () => {
    toast.info('Go to Products tab to edit patterns', {
      description: 'Open a product and update its patterns field to add or rename a pattern.',
    })
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Patterns"
        subtitle="View & manage product patterns"
        icon={Shapes}
        action={
          <Button variant="outline" onClick={goToProducts} className="border-maroon/20 text-maroon hover:bg-maroon hover:text-white">
            <ArrowRight className="mr-1.5 h-4 w-4" /> Edit in Products
          </Button>
        }
      />

      {/* Info / Note banner */}
      <div className="flex items-start gap-3 rounded-xl border border-gold/30 bg-gradient-to-r from-cream to-beige/30 p-4">
        <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-gold-dark" />
        <div className="text-sm">
          <p className="font-semibold text-maroon">Patterns are assigned per-product</p>
          <p className="mt-0.5 text-muted-foreground">
            This page is read-only — patterns are derived from each product's <code className="rounded bg-muted px-1 py-0.5 text-[11px]">patterns</code> field.
            To add a new pattern or change existing ones, edit the product in the Products tab.
          </p>
          <Button
            variant="link"
            size="sm"
            className="mt-1 h-auto p-0 text-maroon underline-offset-2"
            onClick={goToProducts}
          >
            Go to Products tab to edit patterns →
          </Button>
        </div>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile label="Unique Patterns" value={patterns.length} icon={Shapes} />
        <StatTile label="Total Assignments" value={totalProducts} icon={Package} />
        {mostUsed && (
          <StatTile label="Most Used" valueText={mostUsed.name} subText={`${mostUsed.count} products`} icon={TrendingUp} />
        )}
        {leastUsed && (
          <StatTile label="Least Used" valueText={leastUsed.name} subText={`${leastUsed.count} products`} icon={TrendingDown} />
        )}
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="border-border/60">
              <CardContent className="space-y-3 p-5">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-5 w-28" />
                  <Skeleton className="h-6 w-16" />
                </div>
                <div className="flex gap-2">
                  <Skeleton className="h-16 w-16" />
                  <Skeleton className="h-16 w-16" />
                  <Skeleton className="h-16 w-16" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : patterns.length === 0 ? (
        <EmptyState
          title="No patterns found"
          hint="Once products have patterns assigned (e.g. Solid, Embroidered, Printed), they will appear here with product counts and sample images."
          icon={Shapes}
        />
      ) : (
        <>
          {/* Patterns grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {patterns.map((p, idx) => (
              <PatternCard key={p.name} pattern={p} rank={idx + 1} />
            ))}
          </div>

          {/* Summary table — horizontally scrollable on mobile */}
          <Card className="border-border/60">
            <CardContent className="p-0">
              <div className="border-b border-border/60 px-5 py-3">
                <h3 className="font-serif text-lg font-semibold text-maroon">Pattern Usage Summary</h3>
                <p className="text-xs text-muted-foreground">Sorted by product count (high → low)</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[480px] text-sm">
                  <thead>
                    <tr className="border-b border-border/60 bg-muted/30 text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                      <th className="px-5 py-2.5 font-semibold">#</th>
                      <th className="px-5 py-2.5 font-semibold">Pattern</th>
                      <th className="px-5 py-2.5 text-right font-semibold">Products</th>
                      <th className="px-5 py-2.5 text-right font-semibold">Share</th>
                      <th className="px-5 py-2.5 text-right font-semibold">Rank</th>
                    </tr>
                  </thead>
                  <tbody>
                    {patterns.map((p, idx) => {
                      const share = totalProducts > 0 ? Math.round((p.count / totalProducts) * 100) : 0
                      return (
                        <tr key={p.name} className="border-b border-border/40 last:border-0 hover:bg-muted/20">
                          <td className="px-5 py-3 text-muted-foreground">{idx + 1}</td>
                          <td className="px-5 py-3 font-medium text-ink">{p.name}</td>
                          <td className="px-5 py-3 text-right font-semibold text-maroon">{p.count}</td>
                          <td className="px-5 py-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <div className="hidden h-2 w-24 overflow-hidden rounded-full bg-muted sm:block">
                                <div className="h-full bg-gradient-to-r from-maroon to-gold" style={{ width: `${share}%` }} />
                              </div>
                              <span className="text-xs text-muted-foreground">{share}%</span>
                            </div>
                          </td>
                          <td className="px-5 py-3 text-right">
                            {idx === 0 ? (
                              <Badge className="bg-olive/15 text-olive">Top</Badge>
                            ) : idx === patterns.length - 1 ? (
                              <Badge variant="outline" className="text-muted-foreground">Low</Badge>
                            ) : (
                              <span className="text-xs text-muted-foreground">—</span>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}

function StatTile({
  label,
  value,
  valueText,
  subText,
  icon: Icon,
}: {
  label: string
  value?: number
  valueText?: string
  subText?: string
  icon: React.ComponentType<{ className?: string }>
}) {
  return (
    <Card className="border-border/60">
      <CardContent className="flex items-center gap-3 p-4">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-maroon/8 text-maroon">
          <Icon className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
          {valueText ? (
            <p className="truncate font-serif text-base font-bold text-ink">{valueText}</p>
          ) : (
            <p className="font-serif text-xl font-bold text-ink">{value ?? 0}</p>
          )}
          {subText && <p className="truncate text-[11px] text-muted-foreground">{subText}</p>}
        </div>
      </CardContent>
    </Card>
  )
}

function PatternCard({ pattern, rank }: { pattern: PatternItem; rank: number }) {
  const samples = pattern.samples.slice(0, 4)
  return (
    <Card className="group overflow-hidden border-border/60 transition-all hover:border-gold/50 hover:shadow-md">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-maroon/8 text-[11px] font-bold text-maroon">
                {rank}
              </span>
              <h3 className="truncate font-serif text-base font-semibold text-ink">{pattern.name}</h3>
            </div>
            <p className="mt-0.5 pl-8 text-[11px] text-muted-foreground">
              {pattern.count} {pattern.count === 1 ? 'product' : 'products'}
            </p>
          </div>
          {rank === 1 && pattern.count > 0 && (
            <Badge className="shrink-0 bg-olive/15 text-olive">
              <TrendingUp className="mr-1 h-3 w-3" /> Top
            </Badge>
          )}
        </div>

        {/* Sample thumbnails */}
        <div className="mt-3 grid grid-cols-4 gap-2">
          {samples.length > 0 ? (
            samples.map((s, i) => (
              <div
                key={s.id + i}
                className="group/sample relative aspect-square overflow-hidden rounded-md border border-border bg-muted"
                title={s.name}
              >
                {s.image ? (
                  <img
                    src={s.image}
                    alt={s.name}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover/sample:scale-110"
                  />
                ) : (
                  <div className="grid h-full w-full place-items-center text-muted-foreground/50">
                    <ImageOff className="h-4 w-4" />
                  </div>
                )}
              </div>
            ))
          ) : (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="grid aspect-square place-items-center rounded-md border border-border bg-muted text-muted-foreground/50">
                <ImageOff className="h-4 w-4" />
              </div>
            ))
          )}
        </div>

        {/* Sample product names + prices (first 2) */}
        {samples.length > 0 && (
          <ul className="mt-3 space-y-1">
            {samples.slice(0, 2).map((s, i) => (
              <li key={s.id + i} className="flex items-center justify-between gap-2 text-[11px]">
                <span className="truncate text-muted-foreground">{s.name}</span>
                <span className="shrink-0 font-medium text-maroon">{formatINR(s.price)}</span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}

export default PatternsManager
