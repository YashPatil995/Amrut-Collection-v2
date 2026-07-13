'use client'

import { Search, Heart, ShoppingBag, Menu, X, User, MapPin, Phone, Shield, ChevronDown } from 'lucide-react'
import { useStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useFetch } from '@/lib/useFetch'
import { ProductCard } from './product-card'
import { AuthModal } from './auth-modal'
import { cn } from '@/lib/utils'

const NAV = [
  { label: 'Home', view: { name: 'home' as const } },
  { label: 'Men', view: { name: 'shop' as const, gender: 'men' } },
  { label: 'Women', view: { name: 'shop' as const, gender: 'women' } },
  { label: 'Kids', view: { name: 'shop' as const, gender: 'kids' } },
  { label: 'New Arrivals', view: { name: 'shop' as const, section: 'new' } },
  { label: 'Best Sellers', view: { name: 'shop' as const, section: 'bestseller' } },
]

export function Header() {
  const navigate = useStore((s) => s.navigate)
  const cartCount = useStore((s) => s.cartCount())
  const wishlist = useStore((s) => s.wishlist)
  const view = useStore((s) => s.view)
  const customer = useStore((s) => s.customer)
  const setAuthOpen = useStore((s) => s.setAuthOpen)
  const mobileMenuOpen = useStore((s) => s.mobileMenuOpen)
  const setMobileMenuOpen = useStore((s) => s.setMobileMenuOpen)
  const searchOpen = useStore((s) => s.searchOpen)
  const setSearchOpen = useStore((s) => s.setSearchOpen)

  // Hidden admin access: click logo 8 times to open admin login
  const logoClicks = useRef(0)
  const logoTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const handleLogoClick = () => {
    logoClicks.current += 1
    if (logoTimer.current) clearTimeout(logoTimer.current)
    logoTimer.current = setTimeout(() => { logoClicks.current = 0 }, 1500)
    if (logoClicks.current >= 8) {
      logoClicks.current = 0
      navigate({ name: 'admin-login' })
      return
    }
    navigate({ name: 'home' })
  }

  const isAdmin = view.name === 'admin' || view.name === 'admin-login'
  if (isAdmin) return null

  return (
    <>
      {/* announcement bar */}
      <div className="maroon-gradient text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-4 py-1.5 text-[11px] sm:text-xs">
          <div className="flex items-center gap-2 overflow-hidden">
            <Phone className="h-3 w-3 shrink-0" />
            <span className="whitespace-nowrap">+91 75077 32111</span>
            <span className="hidden sm:inline opacity-50">|</span>
            <span className="hidden items-center gap-1 sm:inline-flex">
              <MapPin className="h-3 w-3" /> Parola, Jalgaon — 425111
            </span>
          </div>
          <div className="hidden items-center gap-1 md:flex">
            <span>✦ Free shipping over ₹999</span>
            <span className="opacity-50">·</span>
            <span>Easy 7-day returns</span>
          </div>
        </div>
      </div>

      {/* main header */}
      <header className="sticky top-0 z-40 border-b border-border glass overflow-visible">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 overflow-visible">
          <button
            className="md:hidden"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          <button onClick={handleLogoClick} className="flex items-center gap-2 shrink-0">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full gold-gradient text-white shadow-md">
              <span className="font-serif text-lg font-bold">A</span>
            </div>
            <div className="leading-none">
              <p className="font-serif text-base font-bold gold-text" lang="mr">अमृत कलेक्शन</p>
              <p className="text-[9px] font-medium uppercase tracking-[0.25em] text-muted-foreground">Amrut Collection</p>
            </div>
          </button>

          {/* desktop nav */}
          <nav className="ml-4 hidden flex-1 items-center gap-1 md:flex">
            {NAV.map((n) => (
              <button
                key={n.label}
                onClick={() => navigate(n.view)}
                className={cn(
                  'rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-maroon'
                )}
              >
                {n.label}
              </button>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-1">
            <button
              onClick={() => setSearchOpen(true)}
              aria-label="Search"
              className="grid h-9 w-9 place-items-center rounded-full transition-colors hover:bg-accent"
            >
              <Search className="h-[18px] w-[18px]" />
            </button>
            <button
              onClick={() => navigate({ name: 'wishlist' })}
              aria-label="Wishlist"
              className="relative grid h-9 w-9 place-items-center rounded-full transition-colors hover:bg-accent"
            >
              <Heart className="h-[18px] w-[18px]" />
              {wishlist.length > 0 && <Badge className="absolute -right-0.5 -top-0.5 h-4 min-w-4 px-1 text-[9px] bg-maroon text-white">{wishlist.length}</Badge>}
            </button>
            <button
              onClick={() => navigate({ name: 'cart' })}
              aria-label="Cart"
              className="relative grid h-9 w-9 place-items-center rounded-full transition-colors hover:bg-accent"
            >
              <ShoppingBag className="h-[18px] w-[18px]" />
              {cartCount > 0 && <Badge className="absolute -right-0.5 -top-0.5 h-4 min-w-4 px-1 text-[9px] bg-maroon text-white">{cartCount}</Badge>}
            </button>
            {/* Account / Login button */}
            {customer ? (
              <button
                onClick={() => navigate({ name: 'account' })}
                aria-label="My account"
                className="ml-1 flex items-center gap-1.5 rounded-full border border-border bg-card py-1 pl-1 pr-2.5 transition-colors hover:border-gold"
              >
                <span className="grid h-7 w-7 place-items-center rounded-full gold-gradient text-xs font-bold text-white">
                  {customer.avatar || customer.name.slice(0, 2).toUpperCase()}
                </span>
                <span className="hidden text-xs font-medium sm:inline">{customer.name.split(' ')[0]}</span>
              </button>
            ) : (
              <Button
                onClick={() => setAuthOpen(true)}
                size="sm"
                className="ml-1 bg-maroon text-white hover:bg-maroon-light"
              >
                <User className="mr-1 h-3.5 w-3.5" /> Login
              </Button>
            )}
          </div>
        </div>
      </header>

      <SearchOverlay />
      <AuthModal />
      <MobileMenu />
    </>
  )
}

function SearchOverlay() {
  const searchOpen = useStore((s) => s.searchOpen)
  const setSearchOpen = useStore((s) => s.setSearchOpen)
  const navigate = useStore((s) => s.navigate)
  const [q, setQ] = useState('')
  const [debounced, setDebounced] = useState('')
  const [recent, setRecent] = useState<string[]>([])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!searchOpen) { setQ(''); setDebounced('') }
  }, [searchOpen])

  useEffect(() => {
    const t = setTimeout(() => setDebounced(q), 300)
    return () => clearTimeout(t)
  }, [q])

  const { data } = useFetch<{ products: any[] }>(debounced.length >= 2 ? `/api/products?q=${encodeURIComponent(debounced)}&limit=6` : null, [debounced])

  const submit = (term: string) => {
    if (!term.trim()) return
    setRecent((r) => [term, ...r.filter((x) => x !== term)].slice(0, 5))
    setSearchOpen(false)
    navigate({ name: 'shop', q: term })
  }

  return (
    <AnimatePresence>
      {searchOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
          onClick={() => setSearchOpen(false)}
        >
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="mx-auto mt-20 max-w-2xl rounded-2xl border border-border bg-card p-4 shadow-2xl"
          >
            <div className="flex items-center gap-2 border-b border-border pb-3">
              <Search className="h-5 w-5 text-muted-foreground" />
              <input
                autoFocus
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && submit(q)}
                placeholder="Search for sarees, kurtis, shirts, brands..."
                className="flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground"
              />
              <button onClick={() => setSearchOpen(false)}><X className="h-5 w-5" /></button>
            </div>

            {debounced.length < 2 ? (
              <div className="py-2">
                {recent.length > 0 && (
                  <>
                    <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">Recent Searches</p>
                    <div className="flex flex-wrap gap-2">
                      {recent.map((r) => (
                        <button key={r} onClick={() => submit(r)} className="rounded-full bg-accent px-3 py-1 text-xs hover:bg-accent/70">{r}</button>
                      ))}
                    </div>
                  </>
                )}
                <p className="mb-2 mt-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">Popular</p>
                <div className="flex flex-wrap gap-2">
                  {['Sarees', 'Kurtis', 'Sherwani', 'Lehengas', 'Denim'].map((t) => (
                    <button key={t} onClick={() => submit(t)} className="rounded-full border border-border px-3 py-1 text-xs hover:border-gold">{t}</button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="max-h-96 overflow-y-auto scrollbar-thin py-2">
                {data?.products?.length ? (
                  data.products.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => { setSearchOpen(false); navigate({ name: 'product', slug: p.slug }) }}
                      className="flex w-full items-center gap-3 rounded-lg p-2 text-left hover:bg-accent"
                    >
                      <img src={p.images[0]} alt={p.name} className="h-12 w-12 rounded-md object-cover" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{p.name}</p>
                        <p className="text-xs text-muted-foreground">{p.brand?.name} · ₹{p.price.toLocaleString('en-IN')}</p>
                      </div>
                    </button>
                  ))
                ) : (
                  <p className="py-6 text-center text-sm text-muted-foreground">No results for "{debounced}"</p>
                )}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function MobileMenu() {
  const open = useStore((s) => s.mobileMenuOpen)
  const setOpen = useStore((s) => s.setMobileMenuOpen)
  const navigate = useStore((s) => s.navigate)
  const setAuthOpenM = useStore((s) => s.setAuthOpen)
  const customer = useStore((s) => s.customer)
  const { data } = useFetch<{ categories: any[] }>('/api/categories')

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent side="left" className="w-[300px] overflow-y-auto p-0">
        <SheetHeader className="border-b border-border p-4">
          <SheetTitle className="flex items-center gap-2 font-serif text-maroon">
            <div className="grid h-8 w-8 place-items-center rounded-full gold-gradient text-white"><span className="font-bold">A</span></div>
            <div className="leading-tight">
              <p className="font-serif text-base font-bold gold-text" lang="mr">अमृत कलेक्शन</p>
              <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">Amrut Collection</p>
            </div>
          </SheetTitle>
        </SheetHeader>
        <div className="p-2">
          {NAV.map((n) => (
            <button
              key={n.label}
              onClick={() => { setOpen(false); navigate(n.view) }}
              className="block w-full rounded-md px-3 py-2.5 text-left text-sm font-medium hover:bg-accent"
            >
              {n.label}
            </button>
          ))}
          <div className="my-2 border-t border-border" />
          <p className="px-3 py-1 text-xs uppercase tracking-wider text-muted-foreground">Shop by Gender</p>
          {(data?.categories || []).filter((c) => !c.parentId).map((c) => (
            <button
              key={c.id}
              onClick={() => { setOpen(false); navigate({ name: 'shop', category: c.slug }) }}
              className="block w-full rounded-md px-3 py-2 text-left text-sm hover:bg-accent"
            >
              {c.name}
            </button>
          ))}
          <div className="my-2 border-t border-border" />
          <button onClick={() => { setOpen(false); navigate({ name: 'track-order' }) }} className="block w-full rounded-md px-3 py-2 text-left text-sm hover:bg-accent">Track Order</button>
          <button onClick={() => { setOpen(false); navigate({ name: 'wishlist' }) }} className="block w-full rounded-md px-3 py-2 text-left text-sm hover:bg-accent">Wishlist</button>
          {customer ? (
            <button onClick={() => { setOpen(false); navigate({ name: 'account' }) }} className="mt-2 flex w-full items-center gap-2 rounded-md bg-maroon px-3 py-2 text-left text-sm font-medium text-white">
              <User className="h-4 w-4" /> My Account ({customer.name.split(' ')[0]})
            </button>
          ) : (
            <button onClick={() => { setOpen(false); setAuthOpenM(true) }} className="mt-2 flex w-full items-center gap-2 rounded-md bg-maroon px-3 py-2 text-left text-sm font-medium text-white">
              <User className="h-4 w-4" /> Login / Sign Up
            </button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
