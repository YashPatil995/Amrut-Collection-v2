'use client'

import * as React from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2, Save, Plus, X } from 'lucide-react'
import { toast } from 'sonner'
import { useFetch } from '@/lib/useFetch'

export interface ProductFormValue {
  id?: string
  name: string
  slug?: string
  price: string
  mrp: string
  stock: string
  gender: string
  categoryId: string
  brandId: string
  fabric: string
  material: string
  colors: string
  colorImages: { color: string; image: string }[]
  sizes: string
  waistSizes: string
  keywords: string
  images: string
  deliveryCharge: string
  description: string
  isNew: boolean
  isTrending: boolean
  isBestseller: boolean
  isFeatured: boolean
}

const EMPTY: ProductFormValue = {
  name: '',
  price: '',
  mrp: '',
  stock: '',
  gender: 'men',
  categoryId: '',
  brandId: '',
  fabric: '',
  material: '',
  colors: '',
  colorImages: [],
  sizes: '',
  waistSizes: '',
  keywords: '',
  images: '',
  deliveryCharge: '0',
  description: '',
  isNew: true,
  isTrending: false,
  isBestseller: false,
  isFeatured: false,
}

export function ProductFormDialog({
  open,
  onOpenChange,
  initial,
  onSaved,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  initial?: any | null
  onSaved?: () => void
}) {
  const isEdit = !!initial?.id
  const [form, setForm] = React.useState<ProductFormValue>(EMPTY)
  const [saving, setSaving] = React.useState(false)
  const { data: catsData } = useFetch<{ categories: any[] }>('/api/categories')
  const { data: brandsData } = useFetch<{ brands: any[] }>('/api/brands')

  React.useEffect(() => {
    if (initial) {
      const initialTags: string[] = Array.isArray(initial.tags) ? initial.tags : []
      const waistTag = initialTags.find((t) => t.startsWith('waist:'))
      const waistSizes = waistTag ? waistTag.replace('waist:', '') : ''
      const keywords = initialTags.filter((t) => !t.startsWith('waist:')).join(', ')
      setForm({
        id: initial.id,
        name: initial.name || '',
        slug: initial.slug,
        price: String(initial.price ?? ''),
        mrp: String(initial.mrp ?? ''),
        stock: String(initial.stock ?? ''),
        gender: initial.gender || 'men',
        categoryId: initial.categoryId || initial.category?.id || '',
        brandId: initial.brandId || initial.brand?.id || '',
        fabric: initial.fabric || '',
        material: initial.material || '',
        colors: Array.isArray(initial.colors) ? initial.colors.join(', ') : '',
        colorImages: Array.isArray((initial as any).colorImages) && (initial as any).colorImages.length > 0
          ? (initial as any).colorImages
          : Array.isArray(initial.colors) ? initial.colors.map((c: string) => ({ color: c, image: '' })) : [],
        sizes: Array.isArray(initial.sizes) ? initial.sizes.join(', ') : '',
        waistSizes,
        keywords,
        images: Array.isArray(initial.images) ? initial.images.join(', ') : '',
        deliveryCharge: String((initial as any).deliveryCharge ?? '0'),
        description: initial.description || '',
        isNew: !!initial.isNew,
        isTrending: !!initial.isTrending,
        isBestseller: !!initial.isBestseller,
        isFeatured: !!initial.isFeatured,
      })
    } else {
      setForm(EMPTY)
    }
  }, [initial, open])

  const set = (k: keyof ProductFormValue, v: any) => setForm((f) => ({ ...f, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.price || !form.mrp || !form.categoryId || !form.brandId) {
      toast.error('Please fill all required fields')
      return
    }
    setSaving(true)
    // Build tags array: combine keywords + waistSizes (prefixed with "waist:")
    const keywordTags = form.keywords.split(',').map((s) => s.trim()).filter(Boolean)
    const waistList = form.waistSizes.split(',').map((s) => s.trim()).filter(Boolean)
    const tags = [...keywordTags]
    if (waistList.length > 0) tags.push(`waist:${waistList.join(',')}`)
    // Merge waist sizes into the main sizes array so they show as selectable sizes on the product page
    const sizes = form.sizes.split(',').map((s) => s.trim()).filter(Boolean)
    const allSizes = Array.from(new Set([...sizes, ...waistList]))
    const body = {
      name: form.name,
      price: Number(form.price),
      mrp: Number(form.mrp),
      stock: Number(form.stock || 0),
      gender: form.gender,
      categoryId: form.categoryId,
      brandId: form.brandId,
      fabric: form.fabric,
      material: form.material,
      colors: form.colors.split(',').map((s) => s.trim()).filter(Boolean),
      colorImages: form.colorImages.filter((ci) => ci.color.trim()),
      sizes: allSizes,
      tags,
      images: form.images.split(',').map((s) => s.trim()).filter(Boolean),
      deliveryCharge: Number(form.deliveryCharge) || 0,
      description: form.description,
      isNew: form.isNew,
      isTrending: form.isTrending,
      isBestseller: form.isBestseller,
      isFeatured: form.isFeatured,
    }
    try {
      const res = isEdit
        ? await fetch(`/api/products/${form.slug}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
          })
        : await fetch('/api/products', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
          })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed')
      toast.success(isEdit ? 'Product updated' : 'Product created', { description: form.name })
      onOpenChange(false)
      onSaved?.()
    } catch (e: any) {
      toast.error('Save failed', { description: e.message })
    } finally {
      setSaving(false)
    }
  }

  const cats = catsData?.categories || []
  const brands = brandsData?.brands || []

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] w-[95vw] flex-col gap-0 overflow-hidden p-0 sm:max-w-xl">
        <DialogHeader className="shrink-0 border-b border-border px-6 pt-6 pb-4">
          <DialogTitle className="font-serif text-xl text-maroon">
            {isEdit ? 'Edit Product' : 'Add New Product'}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Update product details. Changes go live immediately.'
              : 'Create a new product in your catalogue.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          {/* scrollable form fields */}
          <div className="flex-1 space-y-4 overflow-y-auto scrollbar-thin px-6 py-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Product Name" required>
              <Input value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="e.g. Banarasi Silk Saree" />
            </Field>
            <Field label="Gender" required>
              <Select value={form.gender} onValueChange={(v) => set('gender', v)}>
                <SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="men">Men</SelectItem>
                  <SelectItem value="women">Women</SelectItem>
                  <SelectItem value="kids">Kids</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Price (₹)" required>
              <Input type="number" min="0" value={form.price} onChange={(e) => set('price', e.target.value)} placeholder="2499" />
            </Field>
            <Field label="MRP (₹)" required>
              <Input type="number" min="0" value={form.mrp} onChange={(e) => set('mrp', e.target.value)} placeholder="3999" />
            </Field>
            <Field label="Stock">
              <Input type="number" min="0" value={form.stock} onChange={(e) => set('stock', e.target.value)} placeholder="50" />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Category" required>
              <Select value={form.categoryId} onValueChange={(v) => set('categoryId', v)}>
                <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  {cats.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name} <span className="text-xs text-muted-foreground">· {c.gender}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Brand" required>
              <Select value={form.brandId} onValueChange={(v) => set('brandId', v)}>
                <SelectTrigger><SelectValue placeholder="Select brand" /></SelectTrigger>
                <SelectContent>
                  {brands.map((b) => (
                    <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Fabric">
              <Input value={form.fabric} onChange={(e) => set('fabric', e.target.value)} placeholder="Pure Silk" />
            </Field>
            <Field label="Material">
              <Input value={form.material} onChange={(e) => set('material', e.target.value)} placeholder="Silk Blend" />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Sizes (comma-separated)">
              <Input value={form.sizes} onChange={(e) => set('sizes', e.target.value)} placeholder="S, M, L, XL" />
              <p className="mt-1 text-[10px] text-muted-foreground">Apparel sizes like S/M/L/XL or Free Size.</p>
            </Field>
            <Field label="Waist Sizes (comma-separated)">
              <Input value={form.waistSizes} onChange={(e) => set('waistSizes', e.target.value)} placeholder="28, 30, 32, 34, 36" />
              <p className="mt-1 text-[10px] text-muted-foreground">For bottom-wear (pants/jeans). Merged into Sizes on save.</p>
            </Field>
          </div>

          {/* Color + Image Manager */}
          <div className="rounded-lg border border-border p-3">
            <div className="mb-2 flex items-center justify-between">
              <Label className="text-xs font-medium text-ink">Colors & Color Images</Label>
              <button
                type="button"
                onClick={() => set('colorImages', [...form.colorImages, { color: '', image: '' }])}
                className="flex items-center gap-1 text-xs text-maroon hover:underline"
              >
                <Plus className="h-3 w-3" /> Add Color
              </button>
            </div>
            <p className="mb-2 text-[10px] text-muted-foreground">Add each color with an optional image URL. The image shows when that color is selected on the product page.</p>
            {form.colorImages.length === 0 && (
              <p className="rounded border border-dashed border-border p-3 text-center text-xs text-muted-foreground">No colors added yet. Click "Add Color".</p>
            )}
            <div className="space-y-2">
              {form.colorImages.map((ci, i) => (
                <div key={i} className="flex gap-2">
                  <Input
                    value={ci.color}
                    onChange={(e) => {
                      const next = [...form.colorImages]
                      next[i] = { ...next[i], color: e.target.value }
                      set('colorImages', next)
                      // Also update the colors string
                      set('colors', next.map((c) => c.color).filter(Boolean).join(', '))
                    }}
                    placeholder="Color name (e.g. Maroon)"
                    className="w-40"
                  />
                  <Input
                    value={ci.image}
                    onChange={(e) => {
                      const next = [...form.colorImages]
                      next[i] = { ...next[i], image: e.target.value }
                      set('colorImages', next)
                    }}
                    placeholder="Image URL for this color (optional)"
                    className="flex-1"
                  />
                  {ci.image && <img src={ci.image} alt="" className="h-8 w-8 rounded border border-border object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />}
                  <button
                    type="button"
                    onClick={() => {
                      const next = form.colorImages.filter((_, idx) => idx !== i)
                      set('colorImages', next)
                      set('colors', next.map((c) => c.color).filter(Boolean).join(', '))
                    }}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <Field label="Image URLs (comma-separated)">
            <Textarea
              rows={2}
              value={form.images}
              onChange={(e) => set('images', e.target.value)}
              placeholder="https://…, https://…"
            />
          </Field>

          {/* Live image thumbnails */}
          <ImageThumbnails
            value={form.images}
            onRemove={(idx) => {
              const arr = form.images.split(',').map((s) => s.trim()).filter(Boolean)
              arr.splice(idx, 1)
              set('images', arr.join(', '))
            }}
          />

          <Field label="Search Keywords (comma-separated)">
            <Input
              value={form.keywords}
              onChange={(e) => set('keywords', e.target.value)}
              placeholder="saree, silk, festive, wedding"
            />
            <p className="mt-1 text-[10px] text-muted-foreground">These help customers find the product via search.</p>
          </Field>

          <Field label="Delivery Charge (₹) — per product">
            <Input
              type="number"
              value={form.deliveryCharge}
              onChange={(e) => set('deliveryCharge', e.target.value)}
              placeholder="0 (for free delivery)"
            />
            <p className="mt-1 text-[10px] text-muted-foreground">Set 0 for free delivery. This charge is added to the product price at checkout.</p>
          </Field>

          <Field label="Description">
            <Textarea
              rows={3}
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              placeholder="Detailed product description…"
            />
          </Field>
          </div>

          {/* Always-visible bottom bar: compact checkboxes grid + actions */}
          <div className="shrink-0 border-t border-border bg-muted/30 px-6 py-3">
            <div className="mb-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
              <CheckRow label="New" checked={form.isNew} onChange={(v) => set('isNew', v)} />
              <CheckRow label="Trending" checked={form.isTrending} onChange={(v) => set('isTrending', v)} />
              <CheckRow label="Bestseller" checked={form.isBestseller} onChange={(v) => set('isBestseller', v)} />
              <CheckRow label="Featured" checked={form.isFeatured} onChange={(v) => set('isFeatured', v)} />
            </div>
            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving} className="maroon-gradient text-white hover:opacity-90">
                {saving ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : isEdit ? <Save className="mr-1.5 h-4 w-4" /> : <Plus className="mr-1.5 h-4 w-4" />}
                {isEdit ? 'Save Changes' : 'Create Product'}
              </Button>
            </DialogFooter>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-ink">
        {label} {required && <span className="text-maroon">*</span>}
      </Label>
      {children}
    </div>
  )
}

function CheckRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm">
      <Checkbox checked={checked} onCheckedChange={(v) => onChange(!!v)} />
      <span className="font-medium text-ink">{label}</span>
    </label>
  )
}

function ImageThumbnails({ value, onRemove }: { value: string; onRemove: (idx: number) => void }) {
  const imgs = value.split(',').map((s) => s.trim()).filter(Boolean)
  if (imgs.length === 0) return null
  return (
    <div className="flex flex-wrap gap-2 rounded-lg border border-border p-3">
      {imgs.map((src, i) => (
        <div key={i} className="group relative h-16 w-16 overflow-hidden rounded-md border border-border">
          <img src={src} alt={`Image ${i + 1}`} className="h-full w-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
          <button
            type="button"
            onClick={() => onRemove(i)}
            className="absolute right-0.5 top-0.5 grid h-4 w-4 place-items-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100"
            aria-label="Remove image"
          >
            <X className="h-2.5 w-2.5" />
          </button>
        </div>
      ))}
    </div>
  )
}
