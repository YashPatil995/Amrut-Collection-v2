'use client'

import * as React from 'react'
import {
  Megaphone,
  Ticket,
  Plus,
  Copy,
  RefreshCw,
  ImageIcon,
  Eye,
  ToggleLeft,
  ToggleRight,
  Sparkles,
  Percent,
  IndianRupee,
  Pencil,
  Trash2,
  X,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useFetch } from '@/lib/useFetch'
import { toast } from 'sonner'
import { SectionHeader, EmptyState, formatINR } from './shared'
import { cn } from '@/lib/utils'

export function Marketing() {
  return (
    <div className="space-y-6">
      <SectionHeader title="Marketing" subtitle="Coupons, banners & promotions" icon={Megaphone} />

      <div className="grid gap-4 lg:grid-cols-2">
        <CouponGenerator />
        <BannerManager />
      </div>
    </div>
  )
}

function CouponGenerator() {
  const { data } = useFetch<{ coupons: any[] }>('/api/coupons')
  const coupons = data?.coupons || []

  const [code, setCode] = React.useState('')
  const [type, setType] = React.useState<'percent' | 'flat'>('percent')
  const [value, setValue] = React.useState('')
  const [minOrder, setMinOrder] = React.useState('')
  const [maxDiscount, setMaxDiscount] = React.useState('')

  const generate = () => {
    const random = 'AMR' + Math.random().toString(36).slice(2, 7).toUpperCase()
    setCode(random)
    toast.success('Coupon code generated', { description: random })
  }

  const create = () => {
    if (!code || !value) {
      toast.error('Code and value are required')
      return
    }
    toast.success('Coupon created', {
      description: `${code} · ${type === 'percent' ? value + '%' : formatINR(Number(value))} off`,
    })
    setCode(''); setValue(''); setMinOrder(''); setMaxDiscount('')
  }

  return (
    <Card className="border-border/60 lg:col-span-1">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-serif text-lg text-ink">
          <Ticket className="h-5 w-5 text-maroon" /> Coupon Generator
        </CardTitle>
        <CardDescription>Create discount codes for promotions</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <Label className="text-xs font-medium text-ink">Coupon Code</Label>
          <div className="mt-1 flex gap-2">
            <Input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="AMRSUMMER25" className="font-mono" />
            <Button variant="outline" size="icon" onClick={generate} aria-label="Generate code">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label className="text-xs font-medium text-ink">Discount Type</Label>
            <Select value={type} onValueChange={(v) => setType(v as any)}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="percent"><span className="flex items-center gap-2"><Percent className="h-3.5 w-3.5" /> Percentage</span></SelectItem>
                <SelectItem value="flat"><span className="flex items-center gap-2"><IndianRupee className="h-3.5 w-3.5" /> Flat</span></SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs font-medium text-ink">Value {type === 'percent' ? '(%)' : '(₹)'}</Label>
            <Input type="number" value={value} onChange={(e) => setValue(e.target.value)} placeholder={type === 'percent' ? '25' : '500'} className="mt-1" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label className="text-xs font-medium text-ink">Min Order (₹)</Label>
            <Input type="number" value={minOrder} onChange={(e) => setMinOrder(e.target.value)} placeholder="0" className="mt-1" />
          </div>
          <div>
            <Label className="text-xs font-medium text-ink">Max Discount (₹)</Label>
            <Input type="number" value={maxDiscount} onChange={(e) => setMaxDiscount(e.target.value)} placeholder="1000" className="mt-1" />
          </div>
        </div>
        <Button onClick={create} className="w-full maroon-gradient text-white hover:opacity-90">
          <Plus className="mr-1.5 h-4 w-4" /> Create Coupon
        </Button>

        <div className="border-t border-border pt-3">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Active Coupons</p>
          {coupons.length === 0 ? (
            <p className="rounded-lg border border-dashed border-border bg-muted/30 p-3 text-center text-xs text-muted-foreground">
              No active coupons. Create one above.
            </p>
          ) : (
            <div className="space-y-1.5">
              {coupons.slice(0, 5).map((c) => (
                <div key={c.id} className="flex items-center justify-between rounded-lg border border-border/50 bg-muted/30 px-2.5 py-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-maroon">{c.code}</span>
                    <Badge variant="outline" className="text-[10px]">
                      {c.type === 'percent' ? `${c.value}% off` : `${formatINR(c.value)} off`}
                    </Badge>
                  </div>
                  <button
                    className="text-muted-foreground hover:text-maroon"
                    onClick={() => {
                      navigator.clipboard?.writeText(c.code)
                      toast.success('Copied', { description: c.code })
                    }}
                    aria-label="Copy code"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

interface BannerForm {
  id?: string
  title: string
  subtitle: string
  image: string
  ctaText: string
  ctaLink: string
  position: string
  active: boolean
}

const EMPTY_FORM: BannerForm = {
  title: '', subtitle: '', image: '', ctaText: 'Shop Now', ctaLink: '', position: 'hero', active: true,
}

function BannerManager() {
  const [refreshKey, setRefreshKey] = React.useState(0)
  const { data, loading } = useFetch<{ banners: any[] }>(`/api/banners?all=true&_=${refreshKey}`, [refreshKey])
  const banners = data?.banners || []
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [form, setForm] = React.useState<BannerForm>(EMPTY_FORM)
  const [saving, setSaving] = React.useState(false)
  const [deleteId, setDeleteId] = React.useState<string | null>(null)

  const openAdd = () => {
    setForm(EMPTY_FORM)
    setDialogOpen(true)
  }

  const openEdit = (b: any) => {
    setForm({
      id: b.id, title: b.title, subtitle: b.subtitle, image: b.image,
      ctaText: b.ctaText, ctaLink: b.ctaLink, position: b.position, active: b.active,
    })
    setDialogOpen(true)
  }

  const save = async () => {
    if (!form.title || !form.image) {
      toast.error('Title and image URL are required')
      return
    }
    setSaving(true)
    try {
      const method = form.id ? 'PATCH' : 'POST'
      const body: any = { ...form }
      if (!form.id) delete body.id
      const res = await fetch('/api/banners', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const d = await res.json()
      if (!res.ok) throw new Error(d.error)
      toast.success(form.id ? 'Banner updated' : 'Banner created', { description: form.title })
      setDialogOpen(false)
      setRefreshKey((k) => k + 1)
    } catch (e: any) {
      toast.error(e.message || 'Failed to save banner')
    } finally {
      setSaving(false)
    }
  }

  const toggleActive = async (b: any) => {
    try {
      const res = await fetch('/api/banners', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: b.id, active: !b.active }),
      })
      if (!res.ok) throw new Error('Failed')
      toast.success(b.active ? 'Banner hidden' : 'Banner published', { description: b.title })
      setRefreshKey((k) => k + 1)
    } catch {
      toast.error('Failed to update banner')
    }
  }

  const confirmDelete = async () => {
    if (!deleteId) return
    try {
      const res = await fetch(`/api/banners?id=${deleteId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed')
      toast.success('Banner deleted')
      setRefreshKey((k) => k + 1)
    } catch {
      toast.error('Failed to delete banner')
    } finally {
      setDeleteId(null)
    }
  }

  return (
    <>
      <Card className="border-border/60 lg:col-span-2">
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="flex items-center gap-2 font-serif text-lg text-ink">
              <ImageIcon className="h-5 w-5 text-olive" /> Banner Manager
            </CardTitle>
            <CardDescription>Homepage hero & promotional banners</CardDescription>
          </div>
          <Button size="sm" className="maroon-gradient text-white hover:opacity-90" onClick={openAdd}>
            <Plus className="mr-1 h-4 w-4" /> New Banner
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-32 animate-pulse rounded-xl bg-muted" />
              ))}
            </div>
          ) : banners.length === 0 ? (
            <EmptyState title="No banners yet" hint="Click 'New Banner' to create your first homepage banner." icon={ImageIcon} />
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {banners.map((b) => (
                <div key={b.id} className="overflow-hidden rounded-xl border border-border/60 bg-card">
                  <div className="relative h-28 w-full overflow-hidden bg-muted">
                    {b.image && <img src={b.image} alt={b.title} className="h-full w-full object-cover" />}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute left-3 right-3 bottom-2 flex items-end justify-between">
                      <div className="text-white">
                        <p className="text-sm font-semibold drop-shadow">{b.title}</p>
                        <p className="text-[10px] opacity-80 capitalize">{b.position}</p>
                      </div>
                      <Badge className={cn('text-[10px]', b.active ? 'bg-emerald-500 text-white' : 'bg-slate-400 text-white')}>
                        {b.active ? 'Live' : 'Hidden'}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-2.5">
                    <div className="min-w-0">
                      <p className="truncate text-xs text-muted-foreground">{b.subtitle}</p>
                      <p className="text-[10px] text-maroon">CTA: {b.ctaText} → {b.ctaLink || '—'}</p>
                    </div>
                    <div className="flex items-center gap-0.5">
                      <Button size="icon" variant="ghost" className="h-7 w-7" aria-label="Edit" onClick={() => openEdit(b)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <button
                        onClick={() => toggleActive(b)}
                        className="flex h-7 w-7 items-center justify-center rounded-md hover:bg-muted"
                        aria-label="Toggle visibility"
                      >
                        {b.active
                          ? <ToggleRight className="h-5 w-5 text-emerald-600" />
                          : <ToggleLeft className="h-5 w-5 text-muted-foreground" />}
                      </button>
                      <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:text-destructive" aria-label="Delete" onClick={() => setDeleteId(b.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Banner Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl text-maroon">
              {form.id ? 'Edit Banner' : 'Create New Banner'}
            </DialogTitle>
            <DialogDescription>
              {form.id ? 'Update the banner details below.' : 'Add a new banner to your homepage hero carousel.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label className="text-xs font-medium">Title *</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Festive Collection 2026" className="mt-1" />
            </div>
            <div>
              <Label className="text-xs font-medium">Subtitle</Label>
              <Textarea value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} placeholder="Drape yourself in heritage..." className="mt-1" rows={2} />
            </div>
            <div>
              <Label className="text-xs font-medium">Image URL *</Label>
              <Input value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} placeholder="https://..." className="mt-1" />
              {form.image && <img src={form.image} alt="preview" className="mt-2 h-24 w-full rounded-lg object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-medium">CTA Text</Label>
                <Input value={form.ctaText} onChange={(e) => setForm({ ...form, ctaText: e.target.value })} placeholder="Shop Now" className="mt-1" />
              </div>
              <div>
                <Label className="text-xs font-medium">CTA Link</Label>
                <Input value={form.ctaLink} onChange={(e) => setForm({ ...form, ctaLink: e.target.value })} placeholder="women-sarees" className="mt-1" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-medium">Position</Label>
                <Select value={form.position} onValueChange={(v) => setForm({ ...form, position: v })}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hero">Hero Carousel</SelectItem>
                    <SelectItem value="promo">Promo Strip</SelectItem>
                    <SelectItem value="midpage">Mid-page Banner</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <label className="flex cursor-pointer items-center gap-2 pb-2 text-sm">
                  <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} className="accent-maroon h-4 w-4" />
                  Active (visible on storefront)
                </label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={save} disabled={saving} className="maroon-gradient text-white hover:opacity-90">
              {saving ? 'Saving...' : form.id ? 'Update Banner' : 'Create Banner'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this banner?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone. The banner will be permanently removed.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-white hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

function PromoInsights() {
  return (
    <Card className="border-gold/30 bg-gradient-to-br from-cream to-beige/40 lg:col-span-3">
      <CardContent className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl maroon-gradient text-gold">
            <Sparkles className="h-5 w-5" />
          </span>
          <div>
            <p className="font-serif text-lg font-semibold text-maroon">Festive Season Campaign</p>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Schedule a sitewide sale, auto-apply coupons, and feature curated banners across the storefront.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" className="border-maroon/30 text-maroon">Schedule Sale</Button>
          <Button className="maroon-gradient text-white hover:opacity-90">
            <Megaphone className="mr-1.5 h-4 w-4" /> Launch Campaign
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
