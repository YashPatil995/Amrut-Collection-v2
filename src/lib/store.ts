'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type View =
  | { name: 'home' }
  | { name: 'shop'; gender?: string; category?: string; section?: string; q?: string }
  | { name: 'product'; slug: string }
  | { name: 'cart' }
  | { name: 'wishlist' }
  | { name: 'checkout' }
  | { name: 'order-success'; orderNo: string }
  | { name: 'track-order'; orderNo?: string }
  | { name: 'about' }
  | { name: 'contact' }
  | { name: 'shipping-policy' }
  | { name: 'returns-policy' }
  | { name: 'privacy-policy' }
  | { name: 'admin' }
  | { name: 'admin-login' }
  | { name: 'account' }
  | { name: 'my-orders' }

export interface CartItem {
  productId: string
  slug: string
  name: string
  image: string
  price: number
  mrp: number
  qty: number
  color: string
  size: string
  deliveryCharge?: number
}

export interface WishlistItem {
  productId: string
  slug: string
  name: string
  image: string
  price: number
  mrp: number
}

export interface Customer {
  id?: string
  name: string
  phone: string
  email: string
  avatar: string
}

interface StoreState {
  view: View
  navigate: (view: View) => void
  cart: CartItem[]
  addToCart: (item: CartItem) => void
  updateQty: (productId: string, size: string, color: string, qty: number) => void
  removeFromCart: (productId: string, size: string, color: string) => void
  clearCart: () => void
  cartCount: () => number
  cartSubtotal: () => number
  wishlist: WishlistItem[]
  toggleWishlist: (item: WishlistItem) => void
  isWishlisted: (productId: string) => boolean
  searchOpen: boolean
  setSearchOpen: (v: boolean) => void
  mobileMenuOpen: boolean
  setMobileMenuOpen: (v: boolean) => void
  appliedCoupon: { code: string; discount: number } | null
  setAppliedCoupon: (c: { code: string; discount: number } | null) => void
  selectedPayment: string
  setSelectedPayment: (m: string) => void
  // Customer auth
  customer: Customer | null
  loginCustomer: (c: Customer) => void
  logoutCustomer: () => void
  authOpen: boolean
  setAuthOpen: (v: boolean) => void
  // Admin auth
  adminAuthed: boolean
  adminUser: { name: string; role: string; email: string; location?: string } | null
  loginAdmin: (u: { name: string; role: string; email: string; location?: string }) => void
  logoutAdmin: () => void
  // Pending checkout redirect (for login gating)
  pendingCheckout: boolean
  setPendingCheckout: (v: boolean) => void
  // Guest data bootstrap — load saved guest cart/wishlist on mount
  initGuestData: () => void
}

// ----- Per-user localStorage helpers -----
// Cart and wishlist are stored in localStorage keyed by user email (or 'guest').
function readUserStore(email: string): { cart: CartItem[]; wishlist: WishlistItem[] } {
  if (typeof window === 'undefined') return { cart: [], wishlist: [] }
  try {
    const raw = localStorage.getItem(`amrut-userdata-${email}`)
    if (raw) {
      const parsed = JSON.parse(raw)
      return {
        cart: Array.isArray(parsed.cart) ? parsed.cart : [],
        wishlist: Array.isArray(parsed.wishlist) ? parsed.wishlist : [],
      }
    }
  } catch {}
  return { cart: [], wishlist: [] }
}

function writeUserStore(email: string, cart: CartItem[], wishlist: WishlistItem[]) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(`amrut-userdata-${email}`, JSON.stringify({ cart, wishlist }))
  } catch {}
}

// Debounced persistence — saves to localStorage 1 second after changes stop.
// For authenticated users, also fires off server-side persistence.
// For guests, the per-email bucket (`amrut-userdata-guest`) preserves their cart/wishlist
// across refreshes and browser restarts.
let saveTimer: ReturnType<typeof setTimeout> | null = null
function scheduleUserSave(getState: () => StoreState) {
  if (typeof window === 'undefined') return
  if (saveTimer) clearTimeout(saveTimer)
  saveTimer = setTimeout(() => {
    const s = getState()
    const email = s.customer?.email || 'guest'
    writeUserStore(email, s.cart, s.wishlist)
    if (s.customer?.id) {
      saveCartWishlistToServer(s.customer)
    }
  }, 1000)
}

// Server-side persistence — best-effort, never blocks UI
function saveCartWishlistToServer(customer: Customer) {
  if (!customer?.id) return
  const id = customer.id
  // Avoid importing the whole store — read current state via the persisted hook
  try {
    const state = useStore.getState()
    Promise.all([
      fetch('/api/user/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: id, cart: state.cart }),
      }).catch(() => {}),
      fetch('/api/user/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: id, wishlist: state.wishlist }),
      }).catch(() => {}),
    ])
  } catch {}
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      view: { name: 'home' },
      navigate: (view) => {
        set({ view })
        if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' })
      },
      cart: [],
      addToCart: (item) => {
        const cart = get().cart
        const idx = cart.findIndex((c) => c.productId === item.productId && c.size === item.size && c.color === item.color)
        if (idx >= 0) {
          const next = [...cart]
          next[idx] = { ...next[idx], qty: next[idx].qty + item.qty }
          set({ cart: next })
        } else {
          set({ cart: [...cart, item] })
        }
        scheduleUserSave(get)
      },
      updateQty: (productId, size, color, qty) => {
        if (qty <= 0) {
          get().removeFromCart(productId, size, color)
          return
        }
        set({
          cart: get().cart.map((c) =>
            c.productId === productId && c.size === size && c.color === color ? { ...c, qty } : c
          ),
        })
        scheduleUserSave(get)
      },
      removeFromCart: (productId, size, color) => {
        set({ cart: get().cart.filter((c) => !(c.productId === productId && c.size === size && c.color === color)) })
        scheduleUserSave(get)
      },
      clearCart: () => { set({ cart: [], appliedCoupon: null }); scheduleUserSave(get) },
      cartCount: () => get().cart.reduce((s, c) => s + c.qty, 0),
      cartSubtotal: () => get().cart.reduce((s, c) => s + c.price * c.qty, 0),
      wishlist: [],
      toggleWishlist: (item) => {
        const wl = get().wishlist
        if (wl.some((w) => w.productId === item.productId)) {
          set({ wishlist: wl.filter((w) => w.productId !== item.productId) })
        } else {
          set({ wishlist: [...wl, item] })
        }
        scheduleUserSave(get)
      },
      isWishlisted: (productId) => get().wishlist.some((w) => w.productId === productId),
      searchOpen: false,
      setSearchOpen: (v) => set({ searchOpen: v }),
      mobileMenuOpen: false,
      setMobileMenuOpen: (v) => set({ mobileMenuOpen: v }),
      appliedCoupon: null,
      setAppliedCoupon: (c) => set({ appliedCoupon: c }),
      selectedPayment: 'upi',
      setSelectedPayment: (m) => set({ selectedPayment: m }),
      // Customer auth — each user gets their own cart/wishlist (per-user isolation)
      customer: null,
      loginCustomer: (c) => {
        const state = get()
        // 1. Save current cart/wishlist (current user's bucket or guest's)
        const currentEmail = state.customer?.email || 'guest'
        writeUserStore(currentEmail, state.cart, state.wishlist)

        // 2. Load the new user's saved cart/wishlist from localStorage
        const loaded = readUserStore(c.email || 'guest')

        // 3. Set customer, cart, wishlist all at once
        set({
          customer: c,
          authOpen: false,
          cart: loaded.cart,
          wishlist: loaded.wishlist,
          appliedCoupon: null,
        })

        // 4. Best-effort load from server (if customer has id) — merges back if localStorage empty
        if (c.id) {
          fetch(`/api/user/data?userId=${encodeURIComponent(c.id)}`)
            .then((r) => r.json())
            .then((data) => {
              if (!data) return
              const s2 = get()
              // Only adopt server data if local bucket is empty (so we don't overwrite freshly-built guest cart)
              if (s2.cart.length === 0 && Array.isArray(data.cart) && data.cart.length > 0) {
                set({ cart: data.cart })
              }
              if (s2.wishlist.length === 0 && Array.isArray(data.wishlist) && data.wishlist.length > 0) {
                set({ wishlist: data.wishlist })
              }
              scheduleUserSave(get)
            })
            .catch(() => {})
        }
      },
      logoutCustomer: () => {
        const state = get()
        // Save current user's cart/wishlist before clearing
        if (state.customer?.email) {
          writeUserStore(state.customer.email, state.cart, state.wishlist)
          if (state.customer.id) {
            saveCartWishlistToServer(state.customer)
          }
        }
        // Reset to guest state
        set({ customer: null, cart: [], wishlist: [], appliedCoupon: null })
      },
      authOpen: false,
      setAuthOpen: (v) => set({ authOpen: v }),
      // Admin auth
      adminAuthed: false,
      adminUser: null,
      loginAdmin: (u) => set({ adminAuthed: true, adminUser: u }),
      logoutAdmin: () => set({ adminAuthed: false, adminUser: null }),
      // Pending checkout redirect
      pendingCheckout: false,
      setPendingCheckout: (v) => set({ pendingCheckout: v }),
      // Guest data bootstrap — called from a useEffect in layout.tsx on mount.
      // Restores a guest's saved cart/wishlist from localStorage so refresh doesn't lose data.
      initGuestData: () => {
        if (typeof window === 'undefined') return
        const s = get()
        if (s.customer) return // authenticated users get their data via loginCustomer
        const guest = readUserStore('guest')
        if (guest.cart.length > 0 || guest.wishlist.length > 0) {
          set({ cart: guest.cart, wishlist: guest.wishlist })
        }
      },
    }),
    {
      name: 'amrut-store',
      // Do NOT persist cart/wishlist globally — they live in per-user localStorage buckets.
      partialize: (s) =>
        ({
          view: s.view,
          selectedPayment: s.selectedPayment,
          customer: s.customer,
          adminAuthed: s.adminAuthed,
          adminUser: s.adminUser,
        }) as any,
    }
  )
)
