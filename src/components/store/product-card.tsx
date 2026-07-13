'use client'

import { Heart, Star, ShoppingBag, Eye } from 'lucide-react'
import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { useStore } from '@/lib/store'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'

export interface Product {
  id: string
  name: string
  slug: string
  description: string
  price: number
  mrp: number
  discount: number
  stock: number
  rating: number
  reviewCount: number
  sold: number
  colors: string[]
  sizes: string[]
  patterns: string[]
  images: string[]
  tags: string[]
  gender: string
  isTrending: boolean
  isNew: boolean
  isBestseller: boolean
  isFeatured: boolean
  brand?: { name: string }
  category?: { name: string }
}

export function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  const navigate = useStore((s) => s.navigate)
  const toggleWishlist = useStore((s) => s.toggleWishlist)
  const isWishlisted = useStore((s) => s.isWishlisted)
  const addToCart = useStore((s) => s.addToCart)

  const wished = isWishlisted(product.id)

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (product.sizes.length === 0 || product.colors.length === 0) return
    addToCart({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      image: product.images[0],
      price: product.price,
      mrp: product.mrp,
      qty: 1,
      color: product.colors[0],
      size: product.sizes[0],
    })
    toast.success('Added to cart', { description: product.name })
  }

  const handleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation()
    toggleWishlist({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      image: product.images[0],
      price: product.price,
      mrp: product.mrp,
    })
    toast.success(wished ? 'Removed from wishlist' : 'Added to wishlist')
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.04, 0.3) }}
      onClick={() => navigate({ name: 'product', slug: product.slug })}
      className="group relative cursor-pointer overflow-hidden rounded-xl border border-border bg-card transition-all hover:shadow-xl hover:shadow-maroon/5 hover:border-gold/40"
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-muted">
        <img
          src={product.images[0]}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        {product.images[1] && (
          <img
            src={product.images[1]}
            alt={product.name}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          />
        )}

        {/* badges */}
        <div className="absolute left-2 top-2 flex flex-col gap-1">
          {product.discount > 0 && (
            <span className="rounded-md bg-maroon px-2 py-0.5 text-[10px] font-semibold text-white shadow">-{product.discount}%</span>
          )}
          {product.isNew && (
            <span className="rounded-md bg-olive px-2 py-0.5 text-[10px] font-semibold text-white shadow">NEW</span>
          )}
          {product.isBestseller && (
            <span className="rounded-md bg-gold px-2 py-0.5 text-[10px] font-semibold text-white shadow">BESTSELLER</span>
          )}
        </div>

        {/* wishlist */}
        <button
          onClick={handleWishlist}
          aria-label="Toggle wishlist"
          className="absolute right-2 top-2 grid h-9 w-9 place-items-center rounded-full bg-white/80 backdrop-blur transition-all hover:bg-white"
        >
          <Heart className={`h-4 w-4 transition-colors ${wished ? 'fill-maroon text-maroon' : 'text-ink'}`} />
        </button>

        {/* quick actions */}
        <div className="absolute inset-x-0 bottom-0 flex translate-y-full gap-2 p-2 transition-transform duration-300 group-hover:translate-y-0">
          <Button
            onClick={handleQuickAdd}
            size="sm"
            className="flex-1 bg-maroon text-white hover:bg-maroon-light shadow-lg"
          >
            <ShoppingBag className="mr-1.5 h-3.5 w-3.5" /> Quick Add
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={(e) => { e.stopPropagation(); navigate({ name: 'product', slug: product.slug }) }}
            className="bg-white/95 text-ink hover:bg-white shadow-lg"
          >
            <Eye className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      <div className="space-y-1 p-3">
        {product.brand && <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{product.brand.name}</p>}
        <h3 className="line-clamp-1 font-serif text-sm font-medium leading-tight text-foreground">{product.name}</h3>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Star className="h-3 w-3 fill-gold text-gold" />
          <span className="font-medium text-foreground">{product.rating.toFixed(1)}</span>
          <span>({product.reviewCount})</span>
          <span className="mx-1">·</span>
          <span>{product.sold} sold</span>
        </div>
        <div className="flex items-baseline gap-2 pt-0.5">
          <span className="font-serif text-base font-semibold text-maroon">₹{product.price.toLocaleString('en-IN')}</span>
          {product.mrp > product.price && (
            <span className="text-xs text-muted-foreground line-through">₹{product.mrp.toLocaleString('en-IN')}</span>
          )}
        </div>
        {product.colors.length > 0 && (
          <div className="flex gap-1 pt-1">
            {product.colors.slice(0, 4).map((c) => (
              <ColorDot key={c} color={c} />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  )
}

const COLOR_MAP: Record<string, string> = {
  maroon: '#7a1f2b', red: '#c0392b', 'royal blue': '#1e3a8a', emerald: '#047857', teal: '#0d9488',
  'peacock blue': '#1e5f8a', gold: '#c9a14a', mustard: '#d4a017', rose: '#e11d48', pink: '#ec4899',
  mint: '#6ee7b7', yellow: '#facc15', navy: '#1e293b', indigo: '#3730a3', 'matte black': '#1c1917',
  black: '#1c1917', brown: '#7c2d12', tan: '#c2956b', cream: '#f5ebd7', ivory: '#fbf8f1', beige: '#e8dcc4',
  olive: '#5b6236', wine: '#722f37',
}

function ColorDot({ color }: { color: string }) {
  const bg = COLOR_MAP[color.toLowerCase()] || '#ccc'
  return (
    <span
      title={color}
      className="h-3 w-3 rounded-full border border-black/10"
      style={{ backgroundColor: bg }}
    />
  )
}
