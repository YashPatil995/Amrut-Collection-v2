'use client'

import { useMemo, useState, useEffect } from 'react'
import { useStore } from '@/lib/store'
import { useFetch } from '@/lib/useFetch'
import { ProductCard } from '@/components/store/product-card'
import { SlidersHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface FilterOption {
  id: string
  type: string
  value: string
  gender: string
  active: boolean
}

interface FilterProps {
  priceRange: [number, number]
  setPriceRange: (v: [number, number]) => void
  selColors: string[]
  selSizes: string[]
  selWaist: string[]
  selPatterns: string[]
  selBrands: string[]
  discountOnly: boolean
  setDiscountOnly: (v: boolean) => void
  toggle: (arr: string[], set: (v: string[]) => void, val: string) => void
  setSelColors: (v: string[]) => void
  setSelSizes: (v: string[]) => void
  setSelWaist: (v: string[]) => void
  setSelPatterns: (v: string[]) => void
  setSelBrands: (v: string[]) => void
  activeFilterCount: number
  clearAll: () => void
  brands: any[]
  colorOptions: FilterOption[]
  sizeOptions: FilterOption[]
  waistOptions: FilterOption[]
  patternOptions: FilterOption[]
}

export function ShopView() {
  const view = useStore((s) => s.view as any)
  const navigate = useStore((s) => s.navigate)

  const v = view.name === 'shop' ? view : {}
  const [sort, setSort] = useState('popular')
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000])
  const [selColors, setSelColors] = useState<string[]>([])
  const [selSizes, setSelSizes] = useState<string[]>([])
  const [selWaist, setSelWaist] = useState<string[]>([])
  const [selPatterns, setSelPatterns] = useState<string[]>([])
  const [selBrands, setSelBrands] = useState<string[]>([])
  const [discountOnly, setDiscountOnly] = useState(false)
  const [showFilters, setShowFilters] = useState(false)

  // Reset all filter selections whenever the gender/section/category changes so
  // we don't carry stale selections from another gender across.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSelColors([]); setSelSizes([]); setSelWaist([]); setSelPatterns([])
    setSelBrands([]); setDiscountOnly(false); setPriceRange([0, 10000])
  }, [v.gender, v.section, v.category])

  // Determine current gender for filter-option fetches (default to 'all' for non-gendered views).
  const genderForFilters = (v.gender || 'all') as string

  // Fetch filter options from the API (gender-specific + 'all' fallback handled server-side).
  const { data: colorData } = useFetch<{ options: FilterOption[] }>(
    `/api/filter-options?type=color&gender=${genderForFilters}`,
    [genderForFilters]
  )
  const { data: sizeData } = useFetch<{ options: FilterOption[] }>(
    `/api/filter-options?type=size&gender=${genderForFilters}`,
    [genderForFilters]
  )
  const { data: waistData } = useFetch<{ options: FilterOption[] }>(
    `/api/filter-options?type=waist&gender=${genderForFilters}`,
    [genderForFilters]
  )
  const { data: patternData } = useFetch<{ options: FilterOption[] }>(
    `/api/filter-options?type=pattern&gender=${genderForFilters}`,
    [genderForFilters]
  )

  const colorOptions = colorData?.options || []
  const sizeOptions = sizeData?.options || []
  const waistOptions = waistData?.options || []
  const patternOptions = patternData?.options || []

  const params = useMemo(() => {
    const p = new URLSearchParams()
    if (v.gender) p.set('gender', v.gender)
    if (v.category) p.set('category', v.category)
    if (v.section === 'sale') p.set('discountOnly', 'true')
    else if (v.section) p.set('section', v.section)
    if (v.q) p.set('q', v.q)
    p.set('minPrice', String(priceRange[0]))
    p.set('maxPrice', String(priceRange[1]))
    p.set('sort', sort)
    if (discountOnly) p.set('discountOnly', 'true')
    selColors.forEach((c) => p.append('color', c))
    selSizes.forEach((s) => p.append('size', s))
    selWaist.forEach((s) => p.append('size', s))
    selPatterns.forEach((pt) => p.append('pattern', pt))
    selBrands.forEach((b) => p.append('brand', b))
    return p.toString()
  }, [v, sort, priceRange, discountOnly, selColors, selSizes, selWaist, selPatterns, selBrands])

  const { data, loading } = useFetch<{ products: any[] }>(`/api/products?${params}`, [params])
  const { data: brandData } = useFetch<{ brands: any[] }>('/api/brands')
  const products = data?.products || []

  const title = v.section === 'sale' ? 'Mega Sale' :
    v.section === 'new' ? 'New Arrivals' :
    v.section === 'bestseller' ? 'Best Sellers' :
    v.section === 'trending' ? 'Trending Now' :
    v.q ? `Search: "${v.q}"` :
    v.gender ? `${v.gender.charAt(0).toUpperCase() + v.gender.slice(1)}'s Collection` : 'All Products'

  const toggle = (arr: string[], set: (v: string[]) => void, val: string) => {
    set(arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val])
  }

  const clearAll = () => {
    setPriceRange([0, 10000]); setSelColors([]); setSelSizes([]); setSelWaist([]); setSelPatterns([]); setSelBrands([]); setDiscountOnly(false)
  }

  const activeFilterCount = selColors.length + selSizes.length + selWaist.length + selPatterns.length + selBrands.length + (discountOnly ? 1 : 0) + (priceRange[0] > 0 || priceRange[1] < 10000 ? 1 : 0)

  const filterProps: FilterProps = {
    priceRange, setPriceRange,
    selColors, selSizes, selWaist, selPatterns, selBrands, discountOnly, setDiscountOnly,
    toggle, setSelColors, setSelSizes, setSelWaist, setSelPatterns, setSelBrands,
    activeFilterCount, clearAll, brands: brandData?.brands || [],
    colorOptions, sizeOptions, waistOptions, patternOptions,
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      {/* breadcrumb */}
      <div className="mb-4 flex items-center gap-1 text-xs text-muted-foreground">
        <button onClick={() => navigate({ name: 'home' })} className="hover:text-maroon">Home</button>
        <span>/</span>
        <span className="text-foreground">{title}</span>
      </div>

      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl font-bold md:text-3xl">{title}</h1>
          <p className="text-sm text-muted-foreground">{loading ? 'Loading...' : `${products.length} products found`}</p>
        </div>
        <div className="flex items-center gap-2">
          <Sheet open={showFilters} onOpenChange={setShowFilters}>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="lg:hidden">
                <SlidersHorizontal className="mr-1.5 h-4 w-4" /> Filters
                {activeFilterCount > 0 && <Badge className="ml-1.5 h-4 px-1 text-[9px] bg-maroon text-white">{activeFilterCount}</Badge>}
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[320px] overflow-y-auto">
              <SheetHeader><SheetTitle>Filters</SheetTitle></SheetHeader>
              <div className="mt-4"><FilterPanel {...filterProps} /></div>
            </SheetContent>
          </Sheet>
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="popular">Most Popular</SelectItem>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
              <SelectItem value="rating">Top Rated</SelectItem>
              <SelectItem value="discount">Biggest Discount</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex gap-6">
        {/* desktop sidebar */}
        <aside className="hidden w-64 shrink-0 lg:block">
          <div className="sticky top-24 rounded-xl border border-border bg-card p-4">
            <FilterPanel {...filterProps} />
          </div>
        </aside>

        {/* products grid */}
        <div className="min-w-0 flex-1">
          {loading ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="overflow-hidden rounded-xl border border-border">
                  <div className="aspect-[3/4] animate-pulse bg-muted" />
                  <div className="space-y-2 p-3"><div className="h-3 w-1/3 animate-pulse rounded bg-muted" /><div className="h-3 w-full animate-pulse rounded bg-muted" /><div className="h-4 w-1/2 animate-pulse rounded bg-muted" /></div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="grid place-items-center rounded-xl border border-dashed border-border py-20 text-center">
              <div>
                <p className="font-serif text-xl font-semibold">No products found</p>
                <p className="mt-1 text-sm text-muted-foreground">Try adjusting your filters or search.</p>
                <Button onClick={clearAll} variant="outline" className="mt-4">Clear Filters</Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
              {products.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function FilterPanel(props: FilterProps) {
  const {
    priceRange, setPriceRange,
    selColors, selSizes, selWaist, selPatterns, selBrands, discountOnly, setDiscountOnly,
    toggle, setSelColors, setSelSizes, setSelWaist, setSelPatterns, setSelBrands,
    activeFilterCount, clearAll, brands,
    colorOptions, sizeOptions, waistOptions, patternOptions,
  } = props
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-serif text-lg font-semibold">Filters</h3>
        {activeFilterCount > 0 && (
          <button onClick={clearAll} className="text-xs text-maroon hover:underline">Clear all ({activeFilterCount})</button>
        )}
      </div>

      {/* Price */}
      <div>
        <h4 className="mb-3 text-sm font-semibold">Price Range</h4>
        <Slider
          value={priceRange}
          onValueChange={(v) => setPriceRange(v as [number, number])}
          min={0} max={10000} step={100}
          className="my-2"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>₹{priceRange[0].toLocaleString('en-IN')}</span>
          <span>₹{priceRange[1].toLocaleString('en-IN')}</span>
        </div>
      </div>

      {/* Colors */}
      {colorOptions.length > 0 && (
        <FilterGroup title="Colors">
          <div className="flex flex-wrap gap-2">
            {colorOptions.map((c) => (
              <button
                key={c.id}
                onClick={() => toggle(selColors, setSelColors, c.value)}
                className={cn('rounded-full border px-3 py-1 text-xs transition-colors', selColors.includes(c.value) ? 'border-maroon bg-maroon text-white' : 'border-border hover:border-gold')}
              >
                {c.value}
              </button>
            ))}
          </div>
        </FilterGroup>
      )}

      {/* Sizes */}
      {sizeOptions.length > 0 && (
        <FilterGroup title="Sizes">
          <div className="grid grid-cols-4 gap-2">
            {sizeOptions.map((s) => (
              <button
                key={s.id}
                onClick={() => toggle(selSizes, setSelSizes, s.value)}
                className={cn('rounded-md border px-2 py-1.5 text-xs transition-colors', selSizes.includes(s.value) ? 'border-maroon bg-maroon text-white' : 'border-border hover:border-gold')}
              >
                {s.value}
              </button>
            ))}
          </div>
        </FilterGroup>
      )}

      {/* Waist */}
      {waistOptions.length > 0 && (
        <FilterGroup title="Waist">
          <div className="grid grid-cols-4 gap-2">
            {waistOptions.map((s) => (
              <button
                key={s.id}
                onClick={() => toggle(selWaist, setSelWaist, s.value)}
                className={cn('rounded-md border px-2 py-1.5 text-xs transition-colors', selWaist.includes(s.value) ? 'border-maroon bg-maroon text-white' : 'border-border hover:border-gold')}
              >
                {s.value}
              </button>
            ))}
          </div>
        </FilterGroup>
      )}

      {/* Patterns */}
      {patternOptions.length > 0 && (
        <FilterGroup title="Pattern">
          <div className="space-y-1.5">
            {patternOptions.map((p) => (
              <label key={p.id} className="flex cursor-pointer items-center gap-2 text-sm">
                <Checkbox checked={selPatterns.includes(p.value)} onCheckedChange={() => toggle(selPatterns, setSelPatterns, p.value)} />
                {p.value}
              </label>
            ))}
          </div>
        </FilterGroup>
      )}

      {/* Brands */}
      {brands.length > 0 && (
        <FilterGroup title="Brands">
          <div className="max-h-44 space-y-1.5 overflow-y-auto scrollbar-thin pr-1">
            {brands.map((b) => (
              <label key={b.id} className="flex cursor-pointer items-center gap-2 text-sm">
                <Checkbox checked={selBrands.includes(b.slug)} onCheckedChange={() => toggle(selBrands, setSelBrands, b.slug)} />
                {b.name}
              </label>
            ))}
          </div>
        </FilterGroup>
      )}

    </div>
  )
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(true)
  return (
    <div className="border-t border-border pt-4">
      <button onClick={() => setOpen(!open)} className="mb-3 flex w-full items-center justify-between">
        <h4 className="text-sm font-semibold">{title}</h4>
        <ChevronIcon open={open} />
      </button>
      {open && children}
    </div>
  )
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg className={cn('h-4 w-4 transition-transform', !open && '-rotate-90')} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6" /></svg>
  )
}
