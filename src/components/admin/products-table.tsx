'use client'

import * as React from 'react'
import {
  Package,
  Plus,
  Search,
  Pencil,
  Trash2,
  Star,
  AlertTriangle,
  Loader2,
  Boxes,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
import { ProductFormDialog } from './product-form-dialog'
import { SectionHeader, TableSkeleton, EmptyState, formatINR } from './shared'
import { cn } from '@/lib/utils'

interface ProductsResp {
  products: any[]
}

export function ProductsTable() {
  const [search, setSearch] = React.useState('')
  const [gender, setGender] = React.useState<string>('all')
  const [debounced, setDebounced] = React.useState('')
  const [refreshKey, setRefreshKey] = React.useState(0)

  const [formOpen, setFormOpen] = React.useState(false)
  const [editing, setEditing] = React.useState<any | null>(null)
  const [deleteTarget, setDeleteTarget] = React.useState<any | null>(null)
  const [deleting, setDeleting] = React.useState(false)

  React.useEffect(() => {
    const t = setTimeout(() => setDebounced(search), 350)
    return () => clearTimeout(t)
  }, [search])

  const url = `/api/products?${new URLSearchParams({
    ...(debounced ? { q: debounced } : {}),
    ...(gender !== 'all' ? { gender } : {}),
  }).toString()}`

  const { data, loading, error } = useFetch<ProductsResp>(url, [refreshKey])

  const reload = React.useCallback(() => setRefreshKey((k) => k + 1), [])

  const products = data?.products || []

  // KPIs
  const totalProducts = products.length
  const totalStock = products.reduce((s, p) => s + (p.stock || 0), 0)
  const lowStockCount = products.filter((p) => p.stock < 25).length
  const avgRating = totalProducts ? (products.reduce((s, p) => s + (p.rating || 0), 0) / totalProducts).toFixed(2) : '0.00'

  const openAdd = () => {
    setEditing(null)
    setFormOpen(true)
  }
  const openEdit = (p: any) => {
    setEditing(p)
    setFormOpen(true)
  }
  const confirmDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/products/${deleteTarget.slug}`, { method: 'DELETE' })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed')
      toast.success('Product deleted', { description: deleteTarget.name })
      setDeleteTarget(null)
      reload()
    } catch (e: any) {
      toast.error('Delete failed', { description: e.message })
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Products"
        subtitle="Manage your catalogue inventory"
        icon={Package}
        action={
          <Button onClick={openAdd} className="maroon-gradient text-white hover:opacity-90">
            <Plus className="mr-1.5 h-4 w-4" /> Add Product
          </Button>
        }
      />

      {/* Mini KPIs */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <MiniKpi label="Catalogue Size" value={totalProducts.toLocaleString('en-IN')} icon={Package} tone="maroon" />
        <MiniKpi label="Total Stock Units" value={totalStock.toLocaleString('en-IN')} icon={Boxes} tone="gold" />
        <MiniKpi label="Low Stock Items" value={lowStockCount.toLocaleString('en-IN')} icon={AlertTriangle} tone="olive" />
        <MiniKpi label="Avg Rating" value={avgRating} icon={Star} tone="maroon" />
      </div>

      {/* Filters */}
      <Card className="border-border/60">
        <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products by name…"
              className="pl-9"
            />
          </div>
          <Select value={gender} onValueChange={setGender}>
            <SelectTrigger className="w-full sm:w-[160px]">
              <SelectValue placeholder="All genders" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Genders</SelectItem>
              <SelectItem value="men">Men</SelectItem>
              <SelectItem value="women">Women</SelectItem>
              <SelectItem value="kids">Kids</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="border-border/60">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-4"><TableSkeleton rows={8} /></div>
          ) : error ? (
            <div className="p-4">
              <EmptyState title="Couldn't load products" hint={error} icon={AlertTriangle} />
            </div>
          ) : products.length === 0 ? (
            <div className="p-4">
              <EmptyState title="No products found" hint="Try adjusting your filters or add a new product." icon={Package} />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40">
                    <TableHead className="pl-4">Product</TableHead>
                    <TableHead>Brand</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead className="text-right">MRP</TableHead>
                    <TableHead className="text-right">Stock</TableHead>
                    <TableHead className="text-right">Rating</TableHead>
                    <TableHead className="text-right">Sold</TableHead>
                    <TableHead>Tags</TableHead>
                    <TableHead className="pr-4 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((p) => {
                    const img = Array.isArray(p.images) ? p.images[0] : ''
                    const lowStock = p.stock < 25
                    return (
                      <TableRow key={p.id} className="group">
                        <TableCell className="pl-4">
                          <div className="flex items-center gap-3">
                            <div className="h-12 w-10 shrink-0 overflow-hidden rounded-md border border-border bg-muted">
                              {img && <img src={img} alt={p.name} className="h-full w-full object-cover" />}
                            </div>
                            <div className="min-w-0 max-w-[220px]">
                              <p className="truncate text-sm font-medium text-ink">{p.name}</p>
                              <p className="truncate font-mono text-[10px] text-muted-foreground">{p.slug}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-ink">{p.brand?.name || '—'}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-medium capitalize">{p.category?.name || '—'}</Badge>
                        </TableCell>
                        <TableCell className="text-right text-sm font-semibold text-maroon">{formatINR(p.price)}</TableCell>
                        <TableCell className="text-right text-xs text-muted-foreground line-through">{formatINR(p.mrp)}</TableCell>
                        <TableCell className="text-right">
                          <span className={cn('text-sm font-medium', lowStock ? 'text-rose-600' : 'text-ink')}>
                            {p.stock}
                          </span>
                          {lowStock && <span className="ml-1 text-[10px] text-rose-600">· low</span>}
                        </TableCell>
                        <TableCell className="text-right">
                          <span className="inline-flex items-center gap-1 text-sm">
                            <Star className="h-3 w-3 fill-gold text-gold" />
                            <span className="font-medium text-ink">{p.rating}</span>
                            <span className="text-xs text-muted-foreground">({p.reviewCount})</span>
                          </span>
                        </TableCell>
                        <TableCell className="text-right text-sm font-medium text-ink">{p.sold}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {p.isNew && <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">New</Badge>}
                            {p.isTrending && <Badge className="bg-rose-100 text-rose-700 hover:bg-rose-100">Trending</Badge>}
                            {p.isBestseller && <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">Best</Badge>}
                            {p.isFeatured && <Badge className="bg-violet-100 text-violet-700 hover:bg-violet-100">Featured</Badge>}
                          </div>
                        </TableCell>
                        <TableCell className="pr-4">
                          <div className="flex items-center justify-end gap-1">
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-maroon hover:bg-maroon/10" onClick={() => openEdit(p)}>
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-rose-600 hover:bg-rose-50" onClick={() => setDeleteTarget(p)}>
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <ProductFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        initial={editing}
        onSaved={reload}
      />

      <AlertDialog open={!!deleteTarget} onOpenChange={(v) => !v && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-serif text-maroon">Delete product?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove <strong className="text-ink">{deleteTarget?.name}</strong> from your catalogue.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={deleting}
              className="bg-rose-600 text-white hover:bg-rose-700"
            >
              {deleting ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Trash2 className="mr-1.5 h-4 w-4" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

function MiniKpi({
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
  const toneClass =
    tone === 'maroon'
      ? 'bg-maroon/10 text-maroon'
      : tone === 'gold'
      ? 'bg-gold/15 text-gold-dark'
      : 'bg-olive/12 text-olive'
  return (
    <Card className="border-border/60">
      <CardContent className="flex items-center gap-3 p-4">
        <span className={cn('flex h-9 w-9 items-center justify-center rounded-lg', toneClass)}>
          <Icon className="h-4 w-4" />
        </span>
        <div>
          <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
          <p className="font-serif text-lg font-bold text-ink">{value}</p>
        </div>
      </CardContent>
    </Card>
  )
}
