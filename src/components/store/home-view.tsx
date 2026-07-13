'use client'

import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '@/lib/store'
import { useFetch } from '@/lib/useFetch'
import { ProductCard } from '@/components/store/product-card'
import { Button } from '@/components/ui/button'
import { ChevronRight, ChevronLeft, Star, Quote, Flame, Sparkles, TrendingUp, Clock, Truck, ArrowRight, MapPin, Phone } from 'lucide-react'
import { cn } from '@/lib/utils'

export function HomeView() {
  return (
    <div className="space-y-16 pb-8">
      <HeroCarousel />
      <OfferMarquee />
      <CountdownSection />
      <FeaturedCategories />
      <ProductRow title="Trending Now" subtitle="What everyone's loving this season" section="trending" icon={TrendingUp} />
      <ProductRow title="New Arrivals" subtitle="Fresh drops just for you" section="new" icon={Sparkles} />
      <ProductRow title="Best Sellers" subtitle="Our most purchased pieces" section="bestseller" icon={Flame} />
      <BrandsStrip />
      <Testimonials />
      <InstagramFeed />
      <StoreMap />
    </div>
  )
}

function HeroCarousel() {
  const navigate = useStore((s) => s.navigate)
  const { data } = useFetch<{ banners: any[] }>('/api/banners')
  const [idx, setIdx] = useState(0)
  const banners = data?.banners || []

  useEffect(() => {
    if (banners.length < 2) return
    const t = setInterval(() => setIdx((i) => (i + 1) % banners.length), 5500)
    return () => clearInterval(t)
  }, [banners.length])

  if (!data) return <div className="h-[420px] animate-pulse bg-muted md:h-[560px]" />
  if (banners.length === 0) return null

  return (
    <section className="relative h-[460px] overflow-hidden md:h-[580px]">
      <AnimatePresence mode="wait">
        {banners.map((b, i) => (
          i === idx && (
            <motion.div
              key={b.id}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
              className="absolute inset-0"
            >
              <img src={b.image} alt={b.title} className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/40 to-transparent" />
              <div className="absolute inset-0 flex items-center">
                <div className="mx-auto w-full max-w-7xl px-6 md:px-10">
                  <motion.div
                    initial={{ x: -30, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.6 }}
                    className="max-w-xl text-white"
                  >
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-gold/40 bg-gold/10 px-3 py-1 text-xs font-medium text-gold backdrop-blur">
                      <Sparkles className="h-3 w-3" /> Amrut Collection
                    </span>
                    <p className="mt-3 font-serif text-3xl font-bold gold-text drop-shadow-md sm:text-4xl" lang="mr">
                      अमृत कलेक्शन
                    </p>
                    <h1 className="mt-2 font-serif text-3xl font-bold leading-tight md:text-5xl">{b.title}</h1>
                    <p className="mt-3 max-w-md text-sm text-white/80 md:text-lg">{b.subtitle}</p>
                    <div className="mt-6 flex flex-wrap gap-3">
                      <Button
                        onClick={() => navigate({ name: 'shop', category: b.ctaLink })}
                        className="gold-gradient text-white shadow-lg hover:opacity-90"
                        size="lg"
                      >
                        {b.ctaText} <ChevronRight className="ml-1 h-4 w-4" />
                      </Button>
                      <Button
                        onClick={() => navigate({ name: 'shop' })}
                        variant="outline"
                        size="lg"
                        className="border-white/40 bg-white/10 text-white backdrop-blur hover:bg-white/20"
                      >
                        Explore All
                      </Button>
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          )
        ))}
      </AnimatePresence>

      {banners.length > 1 && (
        <>
          <button onClick={() => setIdx((i) => (i - 1 + banners.length) % banners.length)} className="absolute left-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/20 text-white backdrop-blur transition-colors hover:bg-white/40">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button onClick={() => setIdx((i) => (i + 1) % banners.length)} className="absolute right-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/20 text-white backdrop-blur transition-colors hover:bg-white/40">
            <ChevronRight className="h-5 w-5" />
          </button>
          <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
            {banners.map((_, i) => (
              <button key={i} onClick={() => setIdx(i)} className={cn('h-1.5 rounded-full transition-all', i === idx ? 'w-8 bg-gold' : 'w-1.5 bg-white/50')} />
            ))}
          </div>
        </>
      )}
    </section>
  )
}

function CountdownBox({ v, l }: { v: number; l: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="grid h-14 w-14 place-items-center rounded-lg bg-white font-serif text-2xl font-bold text-maroon shadow-md md:h-16 md:w-16 md:text-3xl">
        {String(v).padStart(2, '0')}
      </div>
      <span className="mt-1 text-[10px] uppercase tracking-wider text-white/70">{l}</span>
    </div>
  )
}

function OfferMarquee() {
  const offers = [
    '✦ FLAT 10% OFF on first order — Code: WELCOME15',
    '✦ Free shipping on orders above ₹999',
    '✦ Easy 7-day returns',
    '✦ COD available across India',
    '✦ Premium quality ethnic & contemporary wear',
    '✦ Pan-India delivery',
  ]
  const doubled = [...offers, ...offers]
  return (
    <div className="overflow-hidden border-y border-maroon/20 bg-maroon py-2 text-white">
      <div className="marquee flex w-max gap-8 whitespace-nowrap text-xs font-medium tracking-wide">
        {doubled.map((o, i) => <span key={i}>{o}</span>)}
      </div>
    </div>
  )
}

function CountdownSection() {
  const navigate = useStore((s) => s.navigate)
  const [time, setTime] = useState({ d: 0, h: 0, m: 0, s: 0 })
  useEffect(() => {
    // countdown to 3 days from now
    const target = Date.now() + 3 * 86400000 + 5 * 3600000 + 23 * 60000
    const tick = () => {
      const diff = Math.max(0, target - Date.now())
      setTime({
        d: Math.floor(diff / 86400000),
        h: Math.floor((diff % 86400000) / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      })
    }
    tick()
    const t = setInterval(tick, 1000)
    return () => clearInterval(t)
  }, [])

  return (
    <section className="mx-auto max-w-7xl px-4">
      <div className="relative overflow-hidden rounded-2xl maroon-gradient p-6 md:p-10">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gold/20 blur-3xl" />
        <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-gold/10 blur-3xl" />
        <div className="relative flex flex-col items-center gap-6 text-center md:flex-row md:justify-between md:text-left">
          <div className="max-w-md">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-gold/20 px-3 py-1 text-xs font-medium text-gold">
              <Clock className="h-3 w-3" /> Limited Time
            </span>
            <h2 className="mt-3 font-serif text-3xl font-bold text-white md:text-4xl">Festive Collection</h2>
            <p className="mt-2 text-sm text-white/70">Explore our exclusive ethnic wear, sarees & festive collections. Limited time offers!</p>
          </div>
          <div className="flex gap-3">
            <CountdownBox v={time.d} l="Days" />
            <CountdownBox v={time.h} l="Hours" />
            <CountdownBox v={time.m} l="Mins" />
            <CountdownBox v={time.s} l="Secs" />
          </div>
          <Button onClick={() => navigate({ name: 'shop' })} className="gold-gradient text-white shadow-lg hover:opacity-90" size="lg">
            <Flame className="mr-1.5 h-4 w-4" /> Shop Now
          </Button>
        </div>
      </div>
    </section>
  )
}

function FeaturedCategories() {
  const navigate = useStore((s) => s.navigate)
  const { data } = useFetch<{ categories: any[] }>('/api/categories')
  const top = (data?.categories || []).filter((c) => !c.parentId)

  const tiles = [
    { name: 'Men', slug: 'men', image: top.find((c) => c.slug === 'men')?.image, gender: 'men' },
    { name: 'Women', slug: 'women', image: top.find((c) => c.slug === 'women')?.image, gender: 'women' },
    { name: 'Kids', slug: 'kids', image: top.find((c) => c.slug === 'kids')?.image, gender: 'kids' },
  ].filter((t) => t.image)

  const subCats = (data?.categories || []).filter((c) => c.parentId).slice(0, 8)

  return (
    <section className="mx-auto max-w-7xl px-4">
      <SectionHeader title="Shop by Category" subtitle="Find your perfect look" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {tiles.map((t, i) => (
          <motion.button
            key={t.slug}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            onClick={() => navigate({ name: 'shop', gender: t.gender })}
            className="group relative h-64 overflow-hidden rounded-2xl"
          >
            <img src={t.image} alt={t.name} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-5 text-left text-white">
              <h3 className="font-serif text-2xl font-bold">{t.name}</h3>
              <p className="mt-0.5 inline-flex items-center gap-1 text-sm text-white/80 transition-transform group-hover:translate-x-1">
                Explore <ArrowRight className="h-3.5 w-3.5" />
              </p>
            </div>
          </motion.button>
        ))}
      </div>

      {subCats.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {subCats.map((c) => (
            <button
              key={c.id}
              onClick={() => navigate({ name: 'shop', category: c.slug })}
              className="rounded-full border border-border bg-card px-4 py-2 text-sm font-medium transition-colors hover:border-gold hover:text-maroon"
            >
              {c.name}
            </button>
          ))}
        </div>
      )}
    </section>
  )
}

function ProductRow({ title, subtitle, section, icon: Icon }: { title: string; subtitle: string; section: string; icon: any }) {
  const navigate = useStore((s) => s.navigate)
  const { data } = useFetch<{ products: any[] }>(`/api/products?section=${section}&limit=8`)

  return (
    <section className="mx-auto max-w-7xl px-4">
      <div className="mb-5 flex items-end justify-between">
        <div>
          <div className="flex items-center gap-2 text-maroon">
            <Icon className="h-5 w-5" />
            <span className="text-xs font-semibold uppercase tracking-widest">{section === 'trending' ? 'Hot Right Now' : section === 'new' ? 'Just In' : 'Top Picks'}</span>
          </div>
          <h2 className="mt-1 font-serif text-2xl font-bold md:text-3xl">{title}</h2>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>
        <Button variant="ghost" onClick={() => navigate({ name: 'shop', section })} className="text-maroon hover:bg-maroon/10">
          View All <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {data ? (
        data.products.length ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {data.products.slice(0, 8).map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
          </div>
        ) : <EmptyRow />
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      )}
    </section>
  )
}

function PromoBanner() {
  const navigate = useStore((s) => s.navigate)
  return (
    <section className="mx-auto max-w-7xl px-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="relative overflow-hidden rounded-2xl bg-olive p-8 text-white">
          <div className="relative z-10 max-w-xs">
            <Sparkles className="h-8 w-8 text-gold" />
            <h3 className="mt-3 font-serif text-2xl font-bold">Festive Offers Inside</h3>
            <p className="mt-1 text-sm text-white/80">Explore this season's exclusive deals on ethnic wear, sarees & more.</p>
            <Button onClick={() => navigate({ name: 'shop', section: 'sale' })} variant="secondary" className="mt-4 bg-white text-olive hover:bg-white/90">Shop Offers</Button>
          </div>
          <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-white/10" />
        </div>
        <div className="relative overflow-hidden rounded-2xl gold-gradient p-8 text-white">
          <div className="relative z-10 max-w-xs">
            <Truck className="h-8 w-8" />
            <h3 className="mt-3 font-serif text-2xl font-bold">Free Express Shipping</h3>
            <p className="mt-1 text-sm text-white/80">On all orders above ₹999. Delivered in 2-4 business days.</p>
            <Button onClick={() => navigate({ name: 'shop' })} variant="secondary" className="mt-4 bg-maroon text-white hover:bg-maroon-light">Shop Now</Button>
          </div>
          <div className="absolute -right-6 -bottom-6 h-32 w-32 rounded-full bg-white/15" />
        </div>
      </div>
    </section>
  )
}

function BrandsStrip() {
  const { data } = useFetch<{ brands: any[] }>('/api/brands')
  if (!data) return null
  return (
    <section className="mx-auto max-w-7xl px-4">
      <SectionHeader title="Popular Brands" subtitle="Trusted names in fashion" />
      <div className="flex flex-wrap items-center justify-center gap-3">
        {data.brands.map((b) => (
          <div key={b.id} className="rounded-xl border border-border bg-card px-6 py-3 text-center transition-colors hover:border-gold">
            <p className="font-serif text-base font-semibold text-maroon">{b.name}</p>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{b.country}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

function Testimonials() {
  const reviews = [
    { name: 'Priya Sharma', city: 'Jalgaon', text: 'The Banarasi saree I ordered was even more beautiful in person. The zari work is exquisite. Amrut Collection has become my go-to for festive shopping!', rating: 5, avatar: 'PS' },
    { name: 'Rohit Patil', city: 'Pune', text: 'Bought a kurta pajama set for my engagement. Premium quality fabric and perfect stitching. Delivery was quick and packaging was elegant.', rating: 5, avatar: 'RP' },
    { name: 'Anjali Deshmukh', city: 'Mumbai', text: 'Love the collection! The Anarkali kurti fits perfectly and the colors are exactly as shown. Customer support was very helpful with sizing.', rating: 5, avatar: 'AD' },
    { name: 'Vikram More', city: 'Nashik', text: 'Ordered a Nehru jacket for a wedding. Got so many compliments! The linen quality is top-notch. Will definitely shop again.', rating: 4, avatar: 'VM' },
  ]
  return (
    <section className="bg-cream/50 py-12">
      <div className="mx-auto max-w-7xl px-4">
        <SectionHeader title="What Our Customers Say" subtitle="Loved by thousands across Maharashtra" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {reviews.map((r, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="rounded-2xl border border-border bg-card p-5 shadow-sm"
            >
              <Quote className="h-7 w-7 text-gold/50" />
              <p className="mt-2 text-sm leading-relaxed text-foreground/80">{r.text}</p>
              <div className="mt-4 flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-full gold-gradient font-semibold text-white">{r.avatar}</div>
                <div>
                  <p className="text-sm font-semibold">{r.name}</p>
                  <p className="text-xs text-muted-foreground">{r.city}</p>
                </div>
                <div className="ml-auto flex">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Star key={j} className={cn('h-3.5 w-3.5', j < r.rating ? 'fill-gold text-gold' : 'text-muted')} />
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

function InstagramFeed() {
  const { data } = useFetch<{ products: any[] }>(`/api/products?limit=6&sort=popular`)
  const instagramUrl = 'https://www.instagram.com/amrut_dresses_parola?igsh=cWRwcGZ3eGZyZHU3'
  return (
    <section className="mx-auto max-w-7xl px-4">
      <SectionHeader title="@amrut_dresses_parola" subtitle="Follow us on Instagram for style inspiration" />
      <div className="grid grid-cols-3 gap-2 md:grid-cols-6">
        {(data?.products || []).slice(0, 6).map((p, i) => (
          <a key={p.id} href={instagramUrl} target="_blank" rel="noreferrer" className="group relative aspect-square overflow-hidden rounded-lg">
            <img src={p.images[0]} alt={p.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
            <div className="absolute inset-0 grid place-items-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
              <InstagramIcon />
            </div>
          </a>
        ))}
      </div>
      <div className="mt-4 text-center">
        <Button asChild variant="outline" className="border-maroon text-maroon hover:bg-maroon/10">
          <a href={instagramUrl} target="_blank" rel="noreferrer">Follow @amrut_dresses_parola <ArrowRight className="ml-1.5 h-4 w-4" /></a>
        </Button>
      </div>
    </section>
  )
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-7 w-7 fill-white">
      <path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.7 3.7 0 0 1-1.38-.9 3.7 3.7 0 0 1-.9-1.38c-.16-.42-.36-1.06-.41-2.23C2.17 15.58 2.16 15.2 2.16 12s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41C8.42 2.17 8.8 2.16 12 2.16zm0 3.68A6.16 6.16 0 1 0 12 18.16 6.16 6.16 0 0 0 12 5.84zm0 10.16A4 4 0 1 1 12 8a4 4 0 0 1 0 8zm6.4-10.4a1.44 1.44 0 1 1-2.88 0 1.44 1.44 0 0 1 2.88 0z"/>
    </svg>
  )
}

function StoreMap() {
  return (
    <section className="mx-auto max-w-7xl px-4">
      <div className="grid gap-6 rounded-2xl border border-border bg-card p-6 md:grid-cols-2 md:p-8">
        <div>
          <h2 className="font-serif text-2xl font-bold text-maroon">Visit Our Store</h2>
          <p className="mt-2 text-sm text-muted-foreground">Experience the collection in person at our flagship store in Parola.</p>
          <div className="mt-4 space-y-3 text-sm">
            <div className="flex gap-3"><MapPinIcon /><div><p className="font-medium">Address</p><p className="text-muted-foreground">Main Bajar, front of Bhajipala Market, Parola, Jalgaon — 425111, Maharashtra, India</p></div></div>
            <div className="flex gap-3"><PhoneIcon /><div><p className="font-medium">Phone</p><p className="text-muted-foreground">+91 75077 32111</p></div></div>
            <div className="flex gap-3"><ClockIconSmall /><div><p className="font-medium">Hours</p><p className="text-muted-foreground">Mon – Sun: 8:00 AM – 9:00 PM</p></div></div>
          </div>
        </div>
        <div className="overflow-hidden rounded-xl border border-border">
          <iframe
            title="Amrut Collection location"
            src="https://www.openstreetmap.org/export/embed.html?bbox=75.107%2C20.876%2C75.127%2C20.896&layer=mapnik&marker=20.886%2C75.117"
            className="h-64 w-full md:h-full"
            loading="lazy"
          />
        </div>
      </div>
    </section>
  )
}
const MapPinIcon = () => <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-maroon/10 text-maroon"><MapPin className="h-3.5 w-3.5" /></span>
const PhoneIcon = () => <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-maroon/10 text-maroon"><Phone className="h-3.5 w-3.5" /></span>
const ClockIconSmall = () => <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-maroon/10 text-maroon"><Clock className="h-3.5 w-3.5" /></span>

function SectionHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mb-6 text-center">
      <h2 className="font-serif text-2xl font-bold md:text-3xl">{title}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
      <div className="mx-auto mt-2 h-0.5 w-12 rounded-full gold-gradient" />
    </div>
  )
}

function SkeletonCard() {
  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <div className="aspect-[3/4] animate-pulse bg-muted" />
      <div className="space-y-2 p-3">
        <div className="h-3 w-1/3 animate-pulse rounded bg-muted" />
        <div className="h-3 w-full animate-pulse rounded bg-muted" />
        <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
      </div>
    </div>
  )
}
function EmptyRow() {
  return <div className="rounded-xl border border-dashed border-border py-12 text-center text-sm text-muted-foreground">No products found.</div>
}
