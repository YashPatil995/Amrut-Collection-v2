'use client'

import { useState } from 'react'
import { useStore } from '@/lib/store'
import { useFetch } from '@/lib/useFetch'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { ProductCard } from '@/components/store/product-card'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { Star, Heart, ShoppingBag, Truck, RotateCcw, Shield, Check, Minus, Plus, ChevronRight, Ruler, Package, MessageSquare, ThumbsUp, Share2, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'

const COLOR_MAP: Record<string, string> = {
  maroon: '#7a1f2b', red: '#c0392b', 'royal blue': '#1e3a8a', emerald: '#047857', teal: '#0d9488',
  'peacock blue': '#1e5f8a', gold: '#c9a14a', mustard: '#d4a017', rose: '#e11d48', pink: '#ec4899',
  mint: '#6ee7b7', yellow: '#facc15', navy: '#1e293b', indigo: '#3730a3', 'matte black': '#1c1917',
  black: '#1c1917', brown: '#7c2d12', tan: '#c2956b', cream: '#f5ebd7', ivory: '#fbf8f1', beige: '#e8dcc4',
  olive: '#5b6236', wine: '#722f37',
}

export function ProductDetailView() {
  const view = useStore((s) => s.view as any)
  const slug = view.slug as string
  const navigate = useStore((s) => s.navigate)
  const addToCart = useStore((s) => s.addToCart)
  const toggleWishlist = useStore((s) => s.toggleWishlist)
  const isWishlisted = useStore((s) => s.isWishlisted)
  const customer = useStore((s) => s.customer)
  const setAuthOpen = useStore((s) => s.setAuthOpen)
  const setPendingCheckout = useStore((s) => s.setPendingCheckout)

  const { data, loading } = useFetch<{ product: any; similar: any[] }>(`/api/products/${slug}`, [slug])
  const product = data?.product
  const [activeImg, setActiveImg] = useState(0)
  const [selColor, setSelColor] = useState<string | null>(null)
  const [selSize, setSelSize] = useState<string | null>(null)
  const [qty, setQty] = useState(1)
  const [zoom, setZoom] = useState(false)
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 })

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="grid gap-8 md:grid-cols-2">
          <div className="aspect-[3/4] animate-pulse rounded-xl bg-muted" />
          <div className="space-y-4"><div className="h-8 w-3/4 animate-pulse rounded bg-muted" /><div className="h-6 w-1/3 animate-pulse rounded bg-muted" /><div className="h-24 animate-pulse rounded bg-muted" /></div>
        </div>
      </div>
    )
  }

  if (!product) {
    return <div className="grid place-items-center py-20 text-center"><p>Product not found.</p><Button onClick={() => navigate({ name: 'shop' })} className="mt-4">Back to Shop</Button></div>
  }

  const colors: string[] = product.colors
  const sizes: string[] = product.sizes
  const images: string[] = product.images
  const wished = isWishlisted(product.id)

  const handleAddToCart = () => {
    if (colors.length > 0 && !selColor) { toast.error('Please select a color'); return }
    if (sizes.length > 0 && !selSize) { toast.error('Please select a size'); return }
    addToCart({
      productId: product.id, slug: product.slug, name: product.name, image: images[0],
      price: product.price, mrp: product.mrp, qty,
      color: selColor || colors[0] || '', size: selSize || sizes[0] || '',
    })
    toast.success('Added to cart', { description: `${product.name} × ${qty}` })
  }

  const handleBuyNow = () => {
    handleAddToCart()
    if (!customer) {
      setPendingCheckout(true)
      setAuthOpen(true)
      toast.info('Please login to continue to checkout', { description: 'Your item has been added to cart' })
      return
    }
    navigate({ name: 'checkout' })
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    setZoomPos({ x: ((e.clientX - rect.left) / rect.width) * 100, y: ((e.clientY - rect.top) / rect.height) * 100 })
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      {/* breadcrumb */}
      <div className="mb-4 flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
        <button onClick={() => navigate({ name: 'home' })} className="hover:text-maroon">Home</button>
        <ChevronRight className="h-3 w-3" />
        <button onClick={() => navigate({ name: 'shop', gender: product.gender })} className="capitalize hover:text-maroon">{product.gender}</button>
        <ChevronRight className="h-3 w-3" />
        <span className="line-clamp-1 text-foreground">{product.name}</span>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Gallery */}
        <div className="space-y-3">
          <div
            className="relative aspect-[3/4] cursor-zoom-in overflow-hidden rounded-xl border border-border bg-card"
            onMouseEnter={() => setZoom(true)}
            onMouseLeave={() => setZoom(false)}
            onMouseMove={handleMouseMove}
          >
            <img
              src={images[activeImg]}
              alt={product.name}
              className="h-full w-full object-cover transition-transform duration-200"
              style={zoom ? { transform: `scale(2)`, transformOrigin: `${zoomPos.x}% ${zoomPos.y}%` } : undefined}
            />
            <div className="absolute left-3 top-3 flex flex-col gap-1">
              {product.discount > 0 && <Badge className="bg-maroon text-white">-{product.discount}% OFF</Badge>}
              {product.isNew && <Badge className="bg-olive text-white">NEW</Badge>}
              {product.isBestseller && <Badge className="bg-gold text-white">BESTSELLER</Badge>}
            </div>
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto scrollbar-thin">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  className={cn('h-20 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition-colors', i === activeImg ? 'border-maroon' : 'border-border hover:border-gold')}
                >
                  <img src={img} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="space-y-5">
          <div>
            {product.brand && <p className="text-xs font-semibold uppercase tracking-wider text-maroon">{product.brand.name}</p>}
            <h1 className="mt-1 font-serif text-2xl font-bold md:text-3xl">{product.name}</h1>
            <div className="mt-2 flex items-center gap-3">
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => <Star key={i} className={cn('h-4 w-4', i < Math.round(product.rating) ? 'fill-gold text-gold' : 'text-muted')} />)}
                <span className="ml-1 text-sm font-medium">{product.rating.toFixed(1)}</span>
              </div>
              <span className="text-sm text-muted-foreground">{product.reviewCount} reviews</span>
              <span className="text-sm text-muted-foreground">·</span>
              <span className="text-sm text-muted-foreground">{product.sold} sold</span>
            </div>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3">
            <span className="font-serif text-3xl font-bold text-maroon">₹{product.price.toLocaleString('en-IN')}</span>
            {product.mrp > product.price && <span className="text-lg text-muted-foreground line-through">₹{product.mrp.toLocaleString('en-IN')}</span>}
            {product.discount > 0 && <Badge className="bg-olive/15 text-olive">Save ₹{(product.mrp - product.price).toLocaleString('en-IN')}</Badge>}
          </div>
          <p className="text-xs text-muted-foreground">Inclusive of all taxes</p>

          {/* Colors */}
          {colors.length > 0 && (
            <div>
              <div className="mb-2 flex items-center justify-between">
                <Label className="text-sm font-semibold">Color: <span className="text-muted-foreground">{selColor || 'Select'}</span></Label>
              </div>
              <div className="flex flex-wrap gap-2">
                {colors.map((c) => {
                  const colorImgData = (product.colorImages || []).find((ci: any) => ci.color === c)
                  const hasImg = !!colorImgData?.image
                  return (
                    <button
                      key={c}
                      onClick={() => setSelColor(c)}
                      title={c}
                      className={cn('grid h-9 w-9 place-items-center rounded-full border-2 transition-all overflow-hidden', selColor === c ? 'border-maroon scale-110' : 'border-border hover:border-gold')}
                      style={hasImg ? { backgroundColor: '#fff' } : { backgroundColor: COLOR_MAP[c.toLowerCase()] || '#ccc' }}
                    >
                      {hasImg ? (
                        <img src={colorImgData.image} alt={c} className="h-full w-full object-cover" />
                      ) : (
                        selColor === c && <Check className="h-4 w-4 text-white drop-shadow" />
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Sizes */}
          {sizes.length > 0 && (
            <div>
              <div className="mb-2 flex items-center justify-between">
                <Label className="text-sm font-semibold">Size: <span className="text-muted-foreground">{selSize || 'Select'}</span></Label>
                <SizeGuideDialog />
              </div>
              <div className="flex flex-wrap gap-2">
                {sizes.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSelSize(s)}
                    className={cn('min-w-[3rem] rounded-md border-2 px-3 py-2 text-sm font-medium transition-all', selSize === s ? 'border-maroon bg-maroon text-white' : 'border-border hover:border-gold')}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Qty */}
          <div>
            <Label className="mb-2 block text-sm font-semibold">Quantity</Label>
            <div className="inline-flex items-center rounded-lg border border-border">
              <button onClick={() => setQty(Math.max(1, qty - 1))} className="grid h-10 w-10 place-items-center hover:bg-accent"><Minus className="h-4 w-4" /></button>
              <span className="w-12 text-center font-medium">{qty}</span>
              <button onClick={() => setQty(qty + 1)} className="grid h-10 w-10 place-items-center hover:bg-accent"><Plus className="h-4 w-4" /></button>
            </div>
          </div>

          {/* Stock */}
          <div className="flex items-center gap-2 text-sm">
            {product.stock > 0 ? (
              <><span className="flex h-2 w-2 rounded-full bg-green-500" /><span className="text-green-700">In Stock ({product.stock} left)</span></>
            ) : (
              <><span className="flex h-2 w-2 rounded-full bg-red-500" /><span className="text-red-600">Out of Stock</span></>
            )}
          </div>

          {/* Actions */}
          <div className="space-y-2">
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button onClick={handleAddToCart} size="lg" variant="outline" className="border-maroon text-maroon hover:bg-maroon hover:text-white sm:flex-1 h-12 text-base">
                <ShoppingBag className="mr-2 h-5 w-5" /> Add to Cart
              </Button>
              <Button onClick={handleBuyNow} size="lg" className="bg-maroon text-white hover:bg-maroon-light sm:flex-1 h-12 text-base shadow-lg shadow-maroon/20">
                <Zap className="mr-2 h-5 w-5" /> Buy Now
              </Button>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => { toggleWishlist({ productId: product.id, slug: product.slug, name: product.name, image: images[0], price: product.price, mrp: product.mrp }); toast.success(wished ? 'Removed from wishlist' : 'Added to wishlist') }}
                size="lg"
                variant="outline"
                className={cn('flex-1 border-border h-11', wished && 'border-maroon text-maroon bg-maroon/5')}
              >
                <Heart className={cn('mr-2 h-5 w-5', wished && 'fill-maroon text-maroon')} /> {wished ? 'Wishlisted' : 'Add to Wishlist'}
              </Button>
              <Button variant="outline" size="lg" className="border-border h-11 px-4" onClick={() => toast.success('Link copied!')}><Share2 className="h-5 w-5" /></Button>
            </div>
          </div>

          {/* Delivery info */}
          <div className="grid grid-cols-1 gap-3 rounded-xl border border-border bg-cream/40 p-4 sm:grid-cols-3">
            <div className="flex items-start gap-2"><Truck className="mt-0.5 h-5 w-5 text-maroon" /><div><p className="text-xs font-semibold">{product.deliveryCharge > 0 ? `Delivery: ₹${product.deliveryCharge}` : 'Free Delivery'}</p><p className="text-xs text-muted-foreground">{product.deliveryCharge > 0 ? 'Added at checkout' : 'Over ₹999 · 2-4 days'}</p></div></div>
            <div className="flex items-start gap-2"><RotateCcw className="mt-0.5 h-5 w-5 text-maroon" /><div><p className="text-xs font-semibold">7-Day Returns</p><p className="text-xs text-muted-foreground">Easy & hassle-free</p></div></div>
            <div className="flex items-start gap-2"><Shield className="mt-0.5 h-5 w-5 text-maroon" /><div><p className="text-xs font-semibold">Secure Payment</p><p className="text-xs text-muted-foreground">100% protected</p></div></div>
          </div>

          {/* estimated delivery */}
          <div className="flex items-center gap-2 rounded-lg bg-accent/50 px-4 py-2.5 text-sm">
            <Package className="h-4 w-4 text-maroon" />
            <span>Estimated delivery: <strong>{new Date(Date.now() + 3 * 86400000).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} – {new Date(Date.now() + 5 * 86400000).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</strong></span>
          </div>
        </div>
      </div>

      {/* Details tabs */}
      <div className="mt-10">
        <Tabs defaultValue="description">
          <TabsList className="w-full justify-start overflow-x-auto">
            <TabsTrigger value="description">Description</TabsTrigger>
            <TabsTrigger value="details">Product Details</TabsTrigger>
            <TabsTrigger value="reviews">Reviews ({product.reviewCount})</TabsTrigger>
            <TabsTrigger value="qa">Q & A</TabsTrigger>
          </TabsList>

          <TabsContent value="description" className="mt-4">
            <div className="max-w-3xl space-y-3 text-sm leading-relaxed text-foreground/80">
              <p>{product.description}</p>
              <p>Experience the elegance of {product.name}, crafted with premium {product.material.toLowerCase()}. {product.fabric} ensures lasting comfort and style for every occasion.</p>
            </div>
          </TabsContent>

          <TabsContent value="details" className="mt-4">
            <div className="grid max-w-3xl gap-2 sm:grid-cols-2">
              <DetailRow label="Fabric" value={product.fabric} />
              <DetailRow label="Material" value={product.material} />
              <DetailRow label="Wash Care" value={product.washCare} />
              <DetailRow label="Brand" value={product.brand?.name} />
              <DetailRow label="Category" value={product.category?.name} />
              <DetailRow label="SKU" value={product.sku} />
              <DetailRow label="Barcode" value={product.barcode} />
              <DetailRow label="Gender" value={product.gender} />
              <DetailRow label="Pattern" value={(product.patterns || []).join(', ') || 'Solid'} />
              <DetailRow label="Return Policy" value="7-day easy returns" />
            </div>
          </TabsContent>

          <TabsContent value="reviews" className="mt-4">
            <ReviewsSection productId={product.id} rating={product.rating} reviewCount={product.reviewCount} initialReviews={product.reviews} />
          </TabsContent>

          <TabsContent value="qa" className="mt-4">
            <div className="grid place-items-center rounded-xl border border-dashed border-border py-12 text-center text-sm text-muted-foreground">
              <MessageSquare className="mb-2 h-8 w-8 text-muted" />
              No questions yet. Be the first to ask!
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Similar products */}
      {data?.similar && data.similar.length > 0 && (
        <div className="mt-12">
          <h2 className="mb-5 font-serif text-2xl font-bold">You May Also Like</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {data.similar.slice(0, 8).map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
          </div>
        </div>
      )}
    </div>
  )
}

function DetailRow({ label, value }: { label: string; value?: string }) {
  if (!value) return null
  return (
    <div className="flex justify-between gap-4 border-b border-border py-2 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium capitalize">{value}</span>
    </div>
  )
}

function SizeGuideDialog() {
  const [open, setOpen] = useState(false)
  const rows = [
    { size: 'S', chest: '36–38', waist: '30–32', hip: '36–38' },
    { size: 'M', chest: '38–40', waist: '32–34', hip: '38–40' },
    { size: 'L', chest: '40–42', waist: '34–36', hip: '40–42' },
    { size: 'XL', chest: '42–44', waist: '36–38', hip: '42–44' },
    { size: 'XXL', chest: '44–46', waist: '38–40', hip: '44–46' },
  ]
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button type="button" className="flex items-center gap-1 text-xs text-maroon hover:underline">
          <Ruler className="h-3 w-3" /> Size Guide
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif text-maroon">Size Guide (inches)</DialogTitle>
        </DialogHeader>
        <div className="rounded-lg border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-accent/50">
              <tr>
                <th className="px-3 py-2 text-left font-semibold">Size</th>
                <th className="px-3 py-2 text-left font-semibold">Chest</th>
                <th className="px-3 py-2 text-left font-semibold">Waist</th>
                <th className="px-3 py-2 text-left font-semibold">Hip</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.size} className="border-t border-border">
                  <td className="px-3 py-2 font-semibold text-maroon">{r.size}</td>
                  <td className="px-3 py-2">{r.chest}</td>
                  <td className="px-3 py-2">{r.waist}</td>
                  <td className="px-3 py-2">{r.hip}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-muted-foreground">
          Measurements are body measurements in inches. For a relaxed fit, choose a size up. For bottom-wear (pants/jeans), the waist column applies.
        </p>
      </DialogContent>
    </Dialog>
  )
}

function ReviewsSection({ productId, rating, reviewCount, initialReviews }: { productId: string; rating: number; reviewCount: number; initialReviews: any[] }) {
  const [reviews, setReviews] = useState(initialReviews || [])
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [r, setR] = useState(5)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    const res = await fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, userName: name, rating: r, title, body }),
    })
    if (res.ok) {
      const { review } = await res.json()
      setReviews([review, ...reviews])
      setShowForm(false); setName(''); setTitle(''); setBody(''); setR(5)
      toast.success('Review submitted!')
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      {/* summary */}
      <div className="space-y-4">
        <div className="rounded-xl border border-border bg-card p-5 text-center">
          <p className="font-serif text-4xl font-bold text-maroon">{rating.toFixed(1)}</p>
          <div className="my-2 flex justify-center">
            {Array.from({ length: 5 }).map((_, i) => <Star key={i} className={cn('h-4 w-4', i < Math.round(rating) ? 'fill-gold text-gold' : 'text-muted')} />)}
          </div>
          <p className="text-xs text-muted-foreground">{reviewCount} reviews</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} variant="outline" className="w-full border-maroon text-maroon hover:bg-maroon hover:text-white">
          Write a Review
        </Button>
        {showForm && (
          <motion.form initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} onSubmit={submit} className="space-y-3 rounded-xl border border-border bg-card p-4">
            <Input placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} required />
            <div>
              <Label className="mb-1 block text-xs">Rating</Label>
              <div className="flex gap-1">
                {[1,2,3,4,5].map((i) => <button key={i} type="button" onClick={() => setR(i)}><Star className={cn('h-6 w-6', i <= r ? 'fill-gold text-gold' : 'text-muted')} /></button>)}
              </div>
            </div>
            <Input placeholder="Review title" value={title} onChange={(e) => setTitle(e.target.value)} required />
            <Textarea placeholder="Share your experience..." value={body} onChange={(e) => setBody(e.target.value)} required rows={3} />
            <Button type="submit" className="w-full bg-maroon text-white hover:bg-maroon-light">Submit Review</Button>
          </motion.form>
        )}
      </div>

      {/* list */}
      <div className="space-y-4 lg:col-span-2 max-h-[600px] overflow-y-auto scrollbar-thin pr-1">
        {reviews.length === 0 ? (
          <div className="grid place-items-center rounded-xl border border-dashed border-border py-12 text-sm text-muted-foreground">No reviews yet. Be the first!</div>
        ) : reviews.map((rv) => (
          <div key={rv.id} className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-start gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full gold-gradient font-semibold text-white">{rv.userAvatar || rv.userName.slice(0,2).toUpperCase()}</div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold">{rv.userName}</p>
                    <div className="flex items-center gap-2">
                      <div className="flex">{Array.from({length:5}).map((_,i)=><Star key={i} className={cn('h-3 w-3', i<rv.rating?'fill-gold text-gold':'text-muted')} />)}</div>
                      {rv.verified && <Badge variant="secondary" className="text-[9px]">✓ Verified Purchase</Badge>}
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">{new Date(rv.createdAt).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}</span>
                </div>
                <p className="mt-2 font-medium text-sm">{rv.title}</p>
                <p className="mt-1 text-sm text-foreground/80">{rv.body}</p>
                <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                  <button className="flex items-center gap-1 hover:text-maroon"><ThumbsUp className="h-3 w-3" /> Helpful ({rv.helpful})</button>
                  <button className="hover:text-maroon">Report</button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
