'use client'

import * as React from 'react'
import {
  LayoutGrid,
  Plus,
  Pencil,
  Trash2,
  Save,
  X,
  ImageOff,
  FolderTree,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
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
import { useFetch } from '@/lib/useFetch'
import { toast } from 'sonner'
import { SectionHeader, EmptyState } from './shared'
import { cn } from '@/lib/utils'

interface CategoryItem {
  id: string
  name: string
  slug: string
  gender: string
  icon: string | null
  image: string | null
  parentId: string | null
  parent?: CategoryItem | null
  children?: CategoryItem[]
}

export function CategoriesManager() {
  const [refreshKey, setRefreshKey] = React.useState(0)
  const { data, loading } = useFetch<{ categories: CategoryItem[] }>(`/api/categories?_=${refreshKey}`, [refreshKey])
  const cats = data?.categories || []
  const topLevel = cats.filter((c) => !c.parentId)
  const [editCat, setEditCat] = React.useState<CategoryItem | null>(null)
  const [editName, setEditName] = React.useState('')
  const [editImage, setEditImage] = React.useState('')
  const [saving, setSaving] = React.useState(false)
  const [deleteId, setDeleteId] = React.useState<string | null>(null)

  const openImageEditor = (c: CategoryItem) => {
    setEditCat(c)
    setEditName(c.name)
    setEditImage(c.image || '')
  }

  const saveImage = async () => {
    if (!editCat) return
    if (!editName.trim()) {
      toast.error('Category name is required')
      return
    }
    setSaving(true)
    try {
      const res = await fetch('/api/categories', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editCat.id, name: editName.trim(), image: editImage }),
      })
      const d = await res.json()
      if (!res.ok) throw new Error(d.error)
      toast.success('Category updated', { description: editName.trim() })
      setEditCat(null)
      setRefreshKey((k) => k + 1)
    } catch (e: any) {
      toast.error(e.message || 'Failed to update')
    } finally {
      setSaving(false)
    }
  }

  const confirmDelete = async () => {
    if (!deleteId) return
    try {
      const res = await fetch(`/api/categories?id=${deleteId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed')
      toast.success('Category deleted')
      setRefreshKey((k) => k + 1)
    } catch {
      toast.error('Cannot delete — category may have products')
    } finally {
      setDeleteId(null)
    }
  }

  return (
    <div className="space-y-6">
      <SectionHeader title="Categories" subtitle="Manage categories & their storefront images" icon={LayoutGrid} />

      {/* Info banner */}
      <div className="flex items-start gap-3 rounded-xl border border-gold/30 bg-gradient-to-r from-cream to-beige/30 p-4">
        <FolderTree className="mt-0.5 h-5 w-5 shrink-0 text-maroon" />
        <div className="text-sm">
          <p className="font-semibold text-maroon">Storefront Category Images</p>
          <p className="mt-0.5 text-muted-foreground">
            The top-level categories (Men, Women, Kids) appear on the homepage "Shop by Category" section. Click the edit (pencil) button on any category to change its image — changes reflect instantly on the storefront.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-48 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      ) : topLevel.length === 0 ? (
        <EmptyState title="No categories" hint="Categories will appear here once created." icon={LayoutGrid} />
      ) : (
        <div className="space-y-6">
          {topLevel.map((parent) => {
            const children = cats.filter((c) => c.parentId === parent.id)
            return (
              <div key={parent.id}>
                <div className="mb-3 flex items-center gap-2">
                  <h3 className="font-serif text-lg font-semibold capitalize text-maroon">{parent.name}</h3>
                  <Badge variant="outline" className="text-[10px] capitalize">{parent.gender}</Badge>
                  <Badge variant="secondary" className="text-[10px]">{children.length} subcategories</Badge>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {/* Parent card */}
                  <CategoryCard
                    cat={parent}
                    isParent
                    onEdit={() => openImageEditor(parent)}
                    onDelete={() => setDeleteId(parent.id)}
                  />
                  {/* Children cards */}
                  {children.map((child) => (
                    <CategoryCard
                      key={child.id}
                      cat={child}
                      onEdit={() => openImageEditor(child)}
                      onDelete={() => setDeleteId(child.id)}
                    />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Edit Category Dialog (name + image) */}
      <Dialog open={!!editCat} onOpenChange={(o) => !o && setEditCat(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl text-maroon">Edit Category</DialogTitle>
            <DialogDescription>
              Rename the category and/or update its storefront image.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label className="text-xs font-medium">Category Name</Label>
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Category name"
                className="mt-1"
                autoFocus
              />
              <p className="mt-1 text-[10px] text-muted-foreground">The slug stays the same — only the display name changes.</p>
            </div>
            <div>
              <Label className="text-xs font-medium">Image URL</Label>
              <Input
                value={editImage}
                onChange={(e) => setEditImage(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="mt-1"
              />
            </div>
            <div className="rounded-lg border border-border bg-muted/30 p-2">
              <p className="mb-2 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Preview</p>
              {editImage ? (
                <div className="relative aspect-[4/3] overflow-hidden rounded-md bg-muted">
                  <img
                    src={editImage}
                    alt="preview"
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      const t = e.target as HTMLImageElement
                      t.style.display = 'none'
                      t.parentElement!.innerHTML = '<div class="grid h-full w-full place-items-center text-muted-foreground"><svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg></div>'
                    }}
                  />
                </div>
              ) : (
                <div className="grid aspect-[4/3] place-items-center rounded-md bg-muted text-muted-foreground">
                  <ImageOff className="h-8 w-8" />
                </div>
              )}
            </div>
            <p className="text-[11px] text-muted-foreground">
              Tip: Use a high-quality image (ideally 800×1000 or similar portrait ratio) for the best appearance on the homepage.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditCat(null)}>Cancel</Button>
            <Button onClick={saveImage} disabled={saving} className="maroon-gradient text-white hover:opacity-90">
              <Save className="mr-1.5 h-4 w-4" /> {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this category?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the category. Products assigned to it may need reassignment. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-white hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

function CategoryCard({
  cat,
  isParent = false,
  onEdit,
  onDelete,
}: {
  cat: CategoryItem
  isParent?: boolean
  onEdit: () => void
  onDelete: () => void
}) {
  return (
    <div className={cn('group overflow-hidden rounded-xl border bg-card transition-all', isParent ? 'border-maroon/30 shadow-md' : 'border-border/60 hover:border-gold/50')}>
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        {cat.image ? (
          <img src={cat.image} alt={cat.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <div className="grid h-full w-full place-items-center text-muted-foreground">
            <ImageOff className="h-8 w-8" />
          </div>
        )}
        {isParent && (
          <div className="absolute left-2 top-2">
            <Badge className="bg-maroon text-white text-[10px]">Main Category</Badge>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
        <div className="absolute right-2 top-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <Button size="icon" variant="secondary" className="h-8 w-8 bg-white/90 hover:bg-white" onClick={onEdit} aria-label="Edit image">
            <Pencil className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="secondary" className="h-8 w-8 bg-white/90 text-destructive hover:bg-white" onClick={onDelete} aria-label="Delete">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="p-3">
        <div className="flex items-center justify-between">
          <h4 className="font-serif text-sm font-semibold">{cat.name}</h4>
          <Badge variant="outline" className="text-[9px] capitalize">{cat.gender}</Badge>
        </div>
        <p className="mt-0.5 truncate text-[11px] text-muted-foreground">/{cat.slug}</p>
        <Button variant="outline" size="sm" className="mt-2 w-full border-maroon/20 text-maroon hover:bg-maroon hover:text-white" onClick={onEdit}>
          <Pencil className="mr-1.5 h-3 w-3" /> Edit
        </Button>
      </div>
    </div>
  )
}
