'use client'

import { useState } from 'react'
import { useStore } from '@/lib/store'
import { useFetch } from '@/lib/useFetch'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { motion } from 'framer-motion'
import { Package, Truck, CheckCircle2, Clock, ChevronRight, ShoppingBag, MapPin } from 'lucide-react'
import { cn } from '@/lib/utils'

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  ordered: { label: 'Ordered', color: 'bg-blue-100 text-blue-700', icon: Clock },
  packed: { label: 'Packed', color: 'bg-amber-100 text-amber-700', icon: Package },
  shipped: { label: 'Shipped', color: 'bg-purple-100 text-purple-700', icon: Truck },
  out_for_delivery: { label: 'Out for Delivery', color: 'bg-cyan-100 text-cyan-700', icon: Truck },
  delivered: { label: 'Delivered', color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-700', icon: Package },
  returned: { label: 'Returned', color: 'bg-orange-100 text-orange-700', icon: Package },
}

export function MyOrdersView() {
  const customer = useStore((s) => s.customer)
  const navigate = useStore((s) => s.navigate)

  // Build the /api/user/data query — by userId (preferred), email, or phone
  let url: string | null = null
  if (customer?.id) {
    url = `/api/user/data?userId=${encodeURIComponent(customer.id)}`
  } else if (customer?.email) {
    url = `/api/user/data?email=${encodeURIComponent(customer.email)}`
  } else if (customer?.phone) {
    url = `/api/user/data?phone=${encodeURIComponent(customer.phone)}`
  }

  const { data, loading } = useFetch<{ orders: any[] }>(url, [url])

  const orders = data?.orders || []
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null)

  if (!customer) {
    return (
      <div className="grid place-items-center px-4 py-20 text-center">
        <ShoppingBag className="h-12 w-12 text-muted-foreground" />
        <p className="mt-3 text-sm text-muted-foreground">Please login to view your orders.</p>
        <Button onClick={() => navigate({ name: 'home' })} className="mt-4 bg-maroon text-white">Go Home</Button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <button onClick={() => navigate({ name: 'account' })} className="mb-4 flex items-center gap-1 text-sm text-muted-foreground hover:text-maroon">
        ← Back to Account
      </button>
      <h1 className="mb-1 font-serif text-2xl font-bold">My Orders</h1>
      <p className="mb-6 text-sm text-muted-foreground">{orders.length} order(s) placed</p>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-32 animate-pulse rounded-xl bg-muted" />)}
        </div>
      ) : orders.length === 0 ? (
        <div className="grid place-items-center rounded-xl border border-dashed border-border py-16 text-center">
          <Package className="h-12 w-12 text-muted-foreground" />
          <p className="mt-3 font-serif text-lg font-semibold">No orders yet</p>
          <p className="mt-1 text-sm text-muted-foreground">When you place an order, it will appear here.</p>
          <Button onClick={() => navigate({ name: 'shop' })} className="mt-4 bg-maroon text-white hover:bg-maroon-light">Start Shopping</Button>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order, idx) => {
            const statusCfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.ordered
            const StatusIcon = statusCfg.icon
            const isExpanded = expandedOrder === order.id
            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="overflow-hidden rounded-xl border border-border bg-card"
              >
                <button
                  onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                  className="flex w-full items-center gap-3 p-4 text-left hover:bg-accent/30"
                >
                  <div className={cn('grid h-12 w-12 shrink-0 place-items-center rounded-lg', statusCfg.color)}>
                    <StatusIcon className="h-6 w-6" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-mono text-sm font-bold text-maroon">{order.orderNo}</p>
                      <Badge className={cn('text-[10px]', statusCfg.color)}>{statusCfg.label}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} · {order.items?.length || 0} item(s)
                    </p>
                    <div className="mt-1 flex items-center justify-between">
                      <p className="font-serif text-base font-bold text-maroon">₹{order.total.toLocaleString('en-IN')}</p>
                      <span className="text-xs text-muted-foreground capitalize">{order.paymentMethod} · {order.paymentStatus}</span>
                    </div>
                  </div>
                  <ChevronRight className={cn('h-4 w-4 text-muted-foreground transition-transform', isExpanded && 'rotate-90')} />
                </button>

                {isExpanded && (
                  <div className="border-t border-border p-4">
                    {/* Items */}
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Items</p>
                    <div className="space-y-2">
                      {order.items?.map((it: any) => (
                        <div key={it.id} className="flex gap-3 rounded-lg border border-border/50 p-2">
                          <img src={it.image} alt="" className="h-12 w-10 rounded object-cover" />
                          <div className="flex-1">
                            <p className="text-sm font-medium">{it.name}</p>
                            <p className="text-xs text-muted-foreground">{it.color} · {it.size} · Qty {it.qty}</p>
                          </div>
                          <p className="text-sm font-semibold">₹{(it.price * it.qty).toLocaleString('en-IN')}</p>
                        </div>
                      ))}
                    </div>

                    {/* Delivery address */}
                    <div className="mt-3 rounded-lg bg-accent/30 p-3">
                      <p className="mb-1 flex items-center gap-1 text-xs font-semibold text-maroon"><MapPin className="h-3 w-3" /> Delivery Address</p>
                      <p className="text-xs text-muted-foreground">{order.customerName} · {order.phone}</p>
                      <p className="text-xs text-muted-foreground">{order.address}, {order.city} - {order.pincode}, {order.state}</p>
                    </div>

                    {order.utrNumber && (
                      <div className="mt-2 rounded-lg border border-maroon/20 bg-maroon/5 p-2 text-xs">
                        <span className="font-semibold text-maroon">UTR: </span>
                        <span className="font-mono">{order.utrNumber}</span>
                      </div>
                    )}

                    {/* Timeline */}
                    <div className="mt-3 flex items-center justify-between">
                      <Button onClick={() => navigate({ name: 'track-order', orderNo: order.orderNo })} variant="outline" size="sm" className="border-maroon/30 text-maroon">
                        Track Order
                      </Button>
                    </div>
                  </div>
                )}
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
