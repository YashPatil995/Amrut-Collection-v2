'use client'

import * as React from 'react'
import {
  Tag,
  Plus,
  Pencil,
  Trash2,
  Save,
  ImageOff,
  Globe,
  Package,
  Layers,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { useFetch } from '@/lib/useFetch'
import { toast } from 'sonner'
import { SectionHeader, EmptyState } from './shared'
import { cn } from '@/lib/utils'

interface BrandItem {
  id: string
  name: string
  slug: string
  logo: string | null
  country: string | null
  productCount?: number
}

const COUNTRIES = [
  'India',
  'USA',
  'United Kingdom',
  'Italy',
  'France',
  'Spain',
  'Germany',
  'Turkey',
  'Bangladesh',
  'Sri Lanka',
  'Nepal',
  'UAE',
  'Japan',
  'Other',
]

interface FormState {
  id?: string
  name: string
  country: string
  logo: string
}

const EMPTY_FORM: FormState = { name: '', country: 'India', logo: '' }

export function BrandsManager() {
  const [refreshKey, setRefreshKey] = React.useState(0)
  const { data, loading } = useFetch<{ brands: BrandItem[] }>(
    `/api/brands?withCounts=true&_=${refreshKey}`,
    [refreshKey]
  )
  const brands = data?.brands || []

  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [form, setForm] = React.useState<FormState>(EMPTY_FORM)
  const [saving, setSaving] = React.useState(false)
  const [deleteTarget, setDeleteTarget] = React.useState<BrandItem | null>(null)

  const openAdd = () => {
    setForm(EMPTY_FORM)
    setDialogOpen(true)
  }

  const openEdit = (b: BrandItem) => {
    setForm({
      id: b.id,
      name: b.name,
      country: b.country || 'India',
      logo: b.logo || '',
    })
    setDialogOpen(true)
  }

  const save = async () => {
    if (!form.name.trim()) {
      toast.error('Brand name is required')
      return
    }
    setSaving(true)
    try {
      const isEdit = !!form.id
      const res = await fetch('/api/brands', {
        method: isEdit ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...(isEdit ? { id: form.id } : {}),
          name: form.name.trim(),
          country: form.country,
          logo: form.logo.trim(),
        }),
      })
      const d = await res.json()
      if (!res.ok) throw new Error(d.error || 'Failed to save')
      toast.success(isEdit ? 'Brand updated' : 'Brand created', {
        description: form.name.trim(),
      })
      setDialogOpen(false)
      setRefreshKey((k) => k + 1)
    } catch (e: any) {
      toast.error(e.message || 'Failed to save brand')
    } finally {
      setSaving(false)
    }
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    try {
      const res = await fetch(`/api/brands?id=${deleteTarget.id}`, { method: 'DELETE' })
      const d = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(d.error || 'Failed to delete brand')
      }
      toast.success('Brand deleted', { description: deleteTarget.name })
      setRefreshKey((k) => k + 1)
    } catch (e: any) {
      toast.error(e.message || 'Cannot delete brand')
    } finally {
      setDeleteTarget(null)
    }
  }

  const totalProducts = brands.reduce((sum, b) => sum + (b.productCount || 0), 0)

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Brands"
        subtitle="Manage your brand catalog"
        icon={Tag}
        action={
          <Button onClick={openAdd} className="maroon-gradient text-white hover:opacity-90">
            <Plus className="mr-1.5 h-4 w-4" /> Add Brand
          </Button>
        }
      />

      {/* Stats strip */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <StatTile label="Total Brands" value={brands.length} icon={Tag} />
        <StatTile label="With Products" value={brands.filter((b) => (b.productCount || 0) > 0).length} icon={Package} />
        <StatTile label="Total Products" value={totalProducts} icon={Layers} />
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="border-border/60">
              <CardContent className="flex flex-col items-center gap-3 p-6">
                <Skeleton className="h-16 w-16 rounded-full" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-16" />
                <div className="mt-2 flex w-full gap-2">
                  <Skeleton className="h-8 flex-1" />
                  <Skeleton className="h-8 w-8" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : brands.length === 0 ? (
        <EmptyState
          title="No brands yet"
          hint="Add your first brand to start organizing products by manufacturer."
          icon={Tag}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {brands.map((b) => (
            <BrandCard
              key={b.id}
              brand={b}
              onEdit={() => openEdit(b)}
              onDelete={() => setDeleteTarget(b)}
            />
          ))}
        </div>
      )}

      {/* Add / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(o) => setDialogOpen(o)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl text-maroon">
              {form.id ? 'Edit Brand' : 'Add Brand'}
            </DialogTitle>
            <DialogDescription>
              {form.id
                ? 'Update the brand details below. Slug will be regenerated if the name changes.'
                : 'Create a new brand for your catalog. A URL-friendly slug is auto-generated from the name.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label className="text-xs font-medium">Brand Name *</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="e.g. FabIndia, Manyavar"
                className="mt-1"
                autoFocus
              />
            </div>

            <div>
              <Label className="text-xs font-medium">Country of Origin</Label>
              <Select
                value={form.country}
                onValueChange={(v) => setForm((f) => ({ ...f, country: v }))}
              >
                <SelectTrigger className="mt-1 w-full">
                  <Globe className="mr-2 h-4 w-4 text-muted-foreground" />
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  {COUNTRIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs font-medium">Logo URL (optional)</Label>
              <Input
                value={form.logo}
                onChange={(e) => setForm((f) => ({ ...f, logo: e.target.value }))}
                placeholder="https://..."
                className="mt-1"
              />
              <div className="mt-2 rounded-lg border border-border bg-muted/30 p-2">
                <p className="mb-2 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Preview</p>
                <div className="flex items-center justify-center">
                  <BrandAvatar brand={form} size="lg" />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={save} disabled={saving} className="maroon-gradient text-white hover:opacity-90">
              <Save className="mr-1.5 h-4 w-4" /> {saving ? 'Saving...' : form.id ? 'Save Changes' : 'Create Brand'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete “{deleteTarget?.name}”?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove the brand from your catalog. If any products are still assigned to it,
              you will need to reassign them to another brand before deleting.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

function StatTile({
  label,
  value,
  icon: Icon,
}: {
  label: string
  value: number
  icon: React.ComponentType<{ className?: string }>
}) {
  return (
    <Card className="border-border/60">
      <CardContent className="flex items-center gap-3 p-4">
        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-maroon/8 text-maroon">
          <Icon className="h-5 w-5" />
        </span>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
          <p className="font-serif text-xl font-bold text-ink">{value}</p>
        </div>
      </CardContent>
    </Card>
  )
}

function BrandAvatar({
  brand,
  size = 'md',
}: {
  brand: { name: string; logo?: string | null }
  size?: 'md' | 'lg'
}) {
  const dims = size === 'lg' ? 'h-16 w-16' : 'h-12 w-12'
  const text = size === 'lg' ? 'text-2xl' : 'text-lg'
  if (brand.logo) {
    return (
      <img
        src={brand.logo}
        alt={brand.name}
        className={cn(dims, 'rounded-full border border-border bg-white object-contain p-1')}
      />
    )
  }
  return (
    <div
      className={cn(
        dims,
        'flex items-center justify-center rounded-full border border-maroon/30 bg-gradient-to-br from-maroon to-maroon/80 font-serif font-bold text-white',
        text
      )}
    >
      {brand.name.charAt(0).toUpperCase() || 'A'}
    </div>
  )
}

function BrandCard({
  brand,
  onEdit,
  onDelete,
}: {
  brand: BrandItem
  onEdit: () => void
  onDelete: () => void
}) {
  const count = brand.productCount || 0
  return (
    <Card className="group overflow-hidden border-border/60 transition-all hover:border-gold/50 hover:shadow-md">
      <CardContent className="flex flex-col items-center gap-3 p-5 text-center">
        <BrandAvatar brand={brand} size="lg" />

        <div className="w-full">
          <h3 className="truncate font-serif text-base font-semibold text-ink">{brand.name}</h3>
          <p className="mt-0.5 truncate text-[11px] text-muted-foreground">/{brand.slug}</p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-1.5">
          {brand.country && (
            <Badge variant="outline" className="gap-1 border-gold/30 text-[10px] text-maroon">
              <Globe className="h-3 w-3" /> {brand.country}
            </Badge>
          )}
          <Badge
            variant="secondary"
            className={cn(
              'gap-1 text-[10px]',
              count > 0 ? 'bg-olive/15 text-olive' : 'bg-muted text-muted-foreground'
            )}
          >
            <Package className="h-3 w-3" /> {count} {count === 1 ? 'product' : 'products'}
          </Badge>
        </div>

        <div className="mt-1 flex w-full gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 border-maroon/20 text-maroon hover:bg-maroon hover:text-white"
            onClick={onEdit}
          >
            <Pencil className="mr-1.5 h-3 w-3" /> Edit
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 border-destructive/20 text-destructive hover:bg-destructive hover:text-white"
            onClick={onDelete}
            aria-label="Delete brand"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default BrandsManager
