'use client'

import * as React from 'react'
import {
  SlidersHorizontal,
  Plus,
  Trash2,
  Check,
  Pencil,
  X,
  Loader2,
  Palette,
  Ruler,
  ScanLine,
  Shapes,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
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
import { SectionHeader, EmptyState } from './shared'
import { cn } from '@/lib/utils'

type FilterType = 'color' | 'size' | 'waist' | 'pattern'
type Gender = 'men' | 'women' | 'kids' | 'all'

interface FilterOption {
  id: string
  type: string
  value: string
  gender: string
  active: boolean
  order: number
  createdAt: string
}

const TYPE_META: Record<FilterType, { label: string; icon: React.ComponentType<{ className?: string }>; hint: string }> = {
  color: { label: 'Colors', icon: Palette, hint: 'Color options shown in the filter sidebar' },
  size: { label: 'Sizes', icon: Ruler, hint: 'Apparel sizes like S/M/L/XL or Free Size' },
  waist: { label: 'Waist', icon: ScanLine, hint: 'Bottom-wear waist sizes (28, 30, 32…)' },
  pattern: { label: 'Patterns', icon: Shapes, hint: 'Pattern filters like Solid, Embroidered, Printed' },
}

const GENDER_OPTIONS: { value: Gender; label: string }[] = [
  { value: 'men', label: 'Men' },
  { value: 'women', label: 'Women' },
  { value: 'kids', label: 'Kids' },
  { value: 'all', label: 'All / Unisex' },
]

export function FilterManager() {
  const [type, setType] = React.useState<FilterType>('color')
  const [gender, setGender] = React.useState<Gender>('men')
  const [refreshKey, setRefreshKey] = React.useState(0)
  const [newVal, setNewVal] = React.useState('')
  const [adding, setAdding] = React.useState(false)
  const [deleteTarget, setDeleteTarget] = React.useState<FilterOption | null>(null)
  const [busyId, setBusyId] = React.useState<string | null>(null)
  const [editingId, setEditingId] = React.useState<string | null>(null)
  const [editValue, setEditValue] = React.useState('')

  // Fetch ALL options for the selected type+gender (including inactive)
  // The API only returns active options by default; pass `all=true` to bypass.
  const { data, loading } = useFetch<{ options: FilterOption[] }>(
    `/api/filter-options?type=${type}&gender=${gender}&all=true&_=${refreshKey}`,
    [type, gender, refreshKey]
  )
  const options = data?.options || []

  const reload = () => setRefreshKey((k) => k + 1)

  const addOption = async () => {
    const value = newVal.trim()
    if (!value) {
      toast.error('Enter a value first')
      return
    }
    setAdding(true)
    try {
      const res = await fetch('/api/filter-options', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, value, gender }),
      })
      const d = await res.json()
      if (!res.ok) throw new Error(d.error || 'Failed to add')
      toast.success('Filter added', { description: `${TYPE_META[type].label}: ${value}` })
      setNewVal('')
      reload()
    } catch (e: any) {
      toast.error(e.message || 'Failed to add filter')
    } finally {
      setAdding(false)
    }
  }

  const toggleActive = async (opt: FilterOption) => {
    setBusyId(opt.id)
    try {
      const res = await fetch('/api/filter-options', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: opt.id, active: !opt.active }),
      })
      const d = await res.json()
      if (!res.ok) throw new Error(d.error || 'Failed to update')
      toast.success(opt.active ? 'Disabled' : 'Enabled', { description: opt.value })
      reload()
    } catch (e: any) {
      toast.error(e.message || 'Failed to update')
    } finally {
      setBusyId(null)
    }
  }

  const startEdit = (opt: FilterOption) => {
    setEditingId(opt.id)
    setEditValue(opt.value)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditValue('')
  }

  const saveEdit = async (opt: FilterOption) => {
    const value = editValue.trim()
    if (!value) {
      toast.error('Value cannot be empty')
      return
    }
    if (value === opt.value) {
      cancelEdit()
      return
    }
    setBusyId(opt.id)
    try {
      const res = await fetch('/api/filter-options', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: opt.id, value }),
      })
      const d = await res.json()
      if (!res.ok) throw new Error(d.error || 'Failed to rename')
      toast.success('Renamed', { description: `${opt.value} → ${value}` })
      cancelEdit()
      reload()
    } catch (e: any) {
      toast.error(e.message || 'Failed to rename')
    } finally {
      setBusyId(null)
    }
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    setBusyId(deleteTarget.id)
    try {
      const res = await fetch(`/api/filter-options?id=${deleteTarget.id}`, { method: 'DELETE' })
      const d = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(d.error || 'Failed to delete')
      toast.success('Filter deleted', { description: deleteTarget.value })
      reload()
    } catch (e: any) {
      toast.error(e.message || 'Failed to delete')
    } finally {
      setBusyId(null)
      setDeleteTarget(null)
    }
  }

  const activeCount = options.filter((o) => o.active).length
  const inactiveCount = options.length - activeCount

  const TypeIcon = TYPE_META[type].icon

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Filter Manager"
        subtitle="Manage colors, sizes, waist sizes & patterns shown in the shop sidebar"
        icon={SlidersHorizontal}
      />

      {/* Info banner */}
      <div className="flex items-start gap-3 rounded-xl border border-gold/30 bg-gradient-to-r from-cream to-beige/30 p-4">
        <SlidersHorizontal className="mt-0.5 h-5 w-5 shrink-0 text-gold-dark" />
        <div className="text-sm">
          <p className="font-semibold text-maroon">How filter options work</p>
          <p className="mt-0.5 text-muted-foreground">
            Filter options are scoped per gender (Men / Women / Kids / All). When a customer browses
            Men&apos;s products, only the Men&apos;s + All filter options appear in the sidebar.
            Disable an option to hide it temporarily, or delete it to remove it permanently.
          </p>
        </div>
      </div>

      {/* Type tabs */}
      <Tabs value={type} onValueChange={(v) => setType(v as FilterType)}>
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
          {(Object.keys(TYPE_META) as FilterType[]).map((t) => {
            const Meta = TYPE_META[t]
            const TIcon = Meta.icon
            return (
              <TabsTrigger key={t} value={t} className="gap-1.5">
                <TIcon className="h-4 w-4" />
                <span className="hidden sm:inline">{Meta.label}</span>
                <span className="sm:hidden">{Meta.label}</span>
              </TabsTrigger>
            )
          })}
        </TabsList>

        {(Object.keys(TYPE_META) as FilterType[]).map((t) => (
          <TabsContent key={t} value={t} className="mt-4">
            {/* Gender selector + add row */}
            <Card className="border-border/60">
              <CardContent className="space-y-4 p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Gender
                    </label>
                    <Select value={gender} onValueChange={(v) => setGender(v as Gender)}>
                      <SelectTrigger className="w-[220px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {GENDER_OPTIONS.map((g) => (
                          <SelectItem key={g.value} value={g.value}>
                            {g.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="border-emerald/30 text-emerald-700">
                      {activeCount} active
                    </Badge>
                    {inactiveCount > 0 && (
                      <Badge variant="outline" className="border-muted text-muted-foreground">
                        {inactiveCount} disabled
                      </Badge>
                    )}
                    <Badge variant="outline" className="border-maroon/30 text-maroon">
                      {options.length} total
                    </Badge>
                  </div>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row">
                  <Input
                    value={newVal}
                    onChange={(e) => setNewVal(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addOption()}
                    placeholder={`Add new ${TYPE_META[t].label.toLowerCase().replace(/s$/, '')} (e.g. ${
                      t === 'color' ? 'Maroon' : t === 'size' ? 'XL' : t === 'waist' ? '32' : 'Embroidered'
                    })`}
                    className="flex-1"
                  />
                  <Button
                    onClick={addOption}
                    disabled={adding}
                    className="maroon-gradient text-white hover:opacity-90"
                  >
                    {adding ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Plus className="mr-1.5 h-4 w-4" />}
                    Add
                  </Button>
                </div>
                <p className="text-[11px] text-muted-foreground">{TYPE_META[t].hint}</p>
              </CardContent>
            </Card>

            {/* Options list */}
            {loading ? (
              <div className="mt-4 space-y-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : options.length === 0 ? (
              <div className="mt-4">
                <EmptyState
                  title={`No ${TYPE_META[t].label.toLowerCase()} for ${GENDER_OPTIONS.find((g) => g.value === gender)?.label}`}
                  hint={`Click "Add" above to create the first ${TYPE_META[t].label.toLowerCase().replace(/s$/, '')} for this gender.`}
                  icon={TypeIcon}
                />
              </div>
            ) : (
              <div className="mt-4 rounded-xl border border-border bg-card p-4">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Options for {GENDER_OPTIONS.find((g) => g.value === gender)?.label}
                  </p>
                  <p className="text-[11px] text-muted-foreground">Tip: click value to rename</p>
                </div>
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {options.map((opt) => (
                    <FilterChip
                      key={opt.id}
                      option={opt}
                      isEditing={editingId === opt.id}
                      editValue={editValue}
                      busy={busyId === opt.id}
                      onEditChange={setEditValue}
                      onStartEdit={() => startEdit(opt)}
                      onCancelEdit={cancelEdit}
                      onSaveEdit={() => saveEdit(opt)}
                      onToggleActive={() => toggleActive(opt)}
                      onDelete={() => setDeleteTarget(opt)}
                    />
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      <AlertDialog open={!!deleteTarget} onOpenChange={(v) => !v && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete filter option?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete <span className="font-semibold">{deleteTarget?.value}</span> from{' '}
              <span className="font-semibold">{TYPE_META[deleteTarget?.type as FilterType]?.label || 'filters'}</span>{' '}
              ({GENDER_OPTIONS.find((g) => g.value === deleteTarget?.gender)?.label}). This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

function FilterChip({
  option,
  isEditing,
  editValue,
  busy,
  onEditChange,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onToggleActive,
  onDelete,
}: {
  option: FilterOption
  isEditing: boolean
  editValue: string
  busy: boolean
  onEditChange: (v: string) => void
  onStartEdit: () => void
  onCancelEdit: () => void
  onSaveEdit: () => void
  onToggleActive: () => void
  onDelete: () => void
}) {
  return (
    <div
      className={cn(
        'group flex items-center gap-2 rounded-lg border p-2 transition-colors',
        option.active
          ? 'border-border bg-card hover:border-gold/50'
          : 'border-dashed border-border bg-muted/40 opacity-70'
      )}
    >
      {isEditing ? (
        <Input
          autoFocus
          value={editValue}
          onChange={(e) => onEditChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') onSaveEdit()
            if (e.key === 'Escape') onCancelEdit()
          }}
          className="h-8 flex-1 text-sm"
        />
      ) : (
        <button
          type="button"
          onClick={onStartEdit}
          className="flex min-w-0 flex-1 items-center gap-2 text-left"
          title="Click to rename"
        >
          <span
            className={cn(
              'truncate text-sm font-medium',
              option.active ? 'text-ink' : 'text-muted-foreground line-through'
            )}
          >
            {option.value}
          </span>
          <Pencil className="h-3 w-3 shrink-0 text-muted-foreground opacity-0 group-hover:opacity-100" />
        </button>
      )}

      {isEditing ? (
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={onSaveEdit}
            disabled={busy}
            className="grid h-7 w-7 place-items-center rounded-md bg-emerald-600 text-white hover:bg-emerald-700"
            aria-label="Save"
          >
            {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
          </button>
          <button
            type="button"
            onClick={onCancelEdit}
            className="grid h-7 w-7 place-items-center rounded-md bg-muted text-foreground hover:bg-muted/70"
            aria-label="Cancel"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={onToggleActive}
            disabled={busy}
            title={option.active ? 'Disable' : 'Enable'}
            className={cn(
              'grid h-7 w-7 place-items-center rounded-md transition-colors',
              option.active
                ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                : 'bg-muted text-muted-foreground hover:bg-muted/70'
            )}
          >
            {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
          </button>
          <button
            type="button"
            onClick={onDelete}
            disabled={busy}
            title="Delete"
            className="grid h-7 w-7 place-items-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  )
}

export default FilterManager
