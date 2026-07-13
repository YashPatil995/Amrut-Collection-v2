'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { User, Package, Heart, MapPin, LogOut, Mail, Phone, ChevronRight, ShoppingBag, Star, CreditCard } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useStore } from '@/lib/store'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { AccountModal } from './account-modal'
import { useFetch } from '@/lib/useFetch'

export function AccountView() {
  const customer = useStore((s) => s.customer)
  const logoutCustomer = useStore((s) => s.logoutCustomer)
  const navigate = useStore((s) => s.navigate)
  const [modalType, setModalType] = React.useState<'addresses' | 'payments' | null>(null)
  const wishlist = useStore((s) => s.wishlist)
  const cart = useStore((s) => s.cart)

  // Build the user-data query — fetches REAL stats for this customer only
  let url: string | null = null
  if (customer?.id) {
    url = `/api/user/data?userId=${encodeURIComponent(customer.id)}`
  } else if (customer?.email) {
    url = `/api/user/data?email=${encodeURIComponent(customer.email)}`
  } else if (customer?.phone) {
    url = `/api/user/data?phone=${encodeURIComponent(customer.phone)}`
  }

  const { data } = useFetch<{
    orders: any[]
    orderCount: number
    totalSpent: number
  }>(url, [url])

  const orderCount = data?.orderCount ?? 0
  const totalSpent = data?.totalSpent ?? 0

  if (!customer) {
    return (
      <div className="grid place-items-center px-4 py-20 text-center">
        <div className="grid h-20 w-20 place-items-center rounded-full bg-maroon/10 text-maroon"><User className="h-10 w-10" /></div>
        <h2 className="mt-4 font-serif text-2xl font-bold">Please log in</h2>
        <p className="mt-1 text-muted-foreground">Login to view your account, orders & wishlist.</p>
        <Button onClick={() => navigate({ name: 'home' })} className="mt-5 bg-maroon text-white hover:bg-maroon-light">Go Home</Button>
      </div>
    )
  }

  const stats = [
    { label: 'Orders', value: String(orderCount), icon: Package, color: 'text-maroon' },
    { label: 'Wishlist', value: String(wishlist.length), icon: Heart, color: 'text-rose-500' },
    { label: 'Cart Items', value: String(cart.length), icon: ShoppingBag, color: 'text-olive' },
    { label: 'Total Spent', value: `₹${totalSpent.toLocaleString('en-IN')}`, icon: Star, color: 'text-gold-dark' },
  ]

  const menu = [
    { label: 'My Orders', desc: `${orderCount} order(s) placed`, icon: Package, action: () => navigate({ name: 'my-orders' }) },
    { label: 'My Wishlist', desc: `${wishlist.length} saved items`, icon: Heart, action: () => navigate({ name: 'wishlist' }) },
    { label: 'Saved Addresses', desc: 'Manage delivery addresses', icon: MapPin, action: () => setModalType('addresses') },
    { label: 'Payment Methods', desc: 'UPI, cards & wallets', icon: CreditCard, action: () => setModalType('payments') },
    { label: 'Track an Order', desc: 'Check order status', icon: ShoppingBag, action: () => navigate({ name: 'track-order' }) },
  ]

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      {/* Profile header */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="relative overflow-hidden rounded-2xl maroon-gradient p-6 text-white">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gold/20 blur-3xl" />
        <div className="relative flex items-center gap-4">
          <div className="grid h-20 w-20 place-items-center rounded-full bg-white/15 text-2xl font-bold backdrop-blur">
            {customer.avatar || customer.name.slice(0, 2).toUpperCase()}
          </div>
          <div className="flex-1">
            <h1 className="font-serif text-2xl font-bold">{customer.name}</h1>
            <div className="mt-1 flex flex-wrap gap-3 text-sm text-white/80">
              {customer.phone && <span className="flex items-center gap-1"><Phone className="h-3.5 w-3.5" /> +91 {customer.phone}</span>}
              {customer.email && <span className="flex items-center gap-1"><Mail className="h-3.5 w-3.5" /> {customer.email}</span>}
            </div>
            <Badge className="mt-2 bg-gold/20 text-gold hover:bg-gold/20">Gold Member</Badge>
          </div>
          <Button onClick={() => { logoutCustomer(); toast.success('Logged out'); fetch('/api/auth/signout', { method: 'POST' }).catch(() => {}); navigate({ name: 'home' }) }} variant="secondary" className="bg-white/15 text-white hover:bg-white/25">
            <LogOut className="mr-1.5 h-4 w-4" /> Logout
          </Button>
        </div>
        {/* Total spent — read-only real value, shown as a banner */}
        <div className="relative mt-4 flex items-center gap-3 rounded-lg bg-white/10 px-4 py-2 text-sm">
          <Star className="h-4 w-4 text-gold" />
          <span>Total Spent:</span>
          <span className="font-bold">₹{totalSpent.toLocaleString('en-IN')}</span>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-xl border border-border bg-card p-4 text-center"
          >
            <s.icon className={cn('mx-auto mb-1 h-5 w-5', s.color)} />
            <p className="font-serif text-2xl font-bold text-maroon">{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Menu */}
      <div className="mt-4 overflow-hidden rounded-xl border border-border bg-card">
        {menu.map((m, i) => (
          <button
            key={m.label}
            onClick={m.action}
            className={cn('flex w-full items-center gap-3 p-4 text-left transition-colors hover:bg-accent/50', i > 0 && 'border-t border-border')}
          >
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-maroon/10 text-maroon">
              <m.icon className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold">{m.label}</p>
              <p className="text-xs text-muted-foreground">{m.desc}</p>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>
        ))}
      </div>

      <AccountModal type={modalType} onClose={() => setModalType(null)} />
    </div>
  )
}
