'use client'

import * as React from 'react'
import {
  ShoppingCart,
  Search,
  Eye,
  MapPin,
  Mail,
  Phone,
  Package,
  Loader2,
  ChevronDown,
  ChevronRight,
  AlertTriangle,
  Filter,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { useFetch } from '@/lib/useFetch'
import { toast } from 'sonner'
import {
  SectionHeader,
  TableSkeleton,
  EmptyState,
  formatINR,
  shortDate,
  OrderStatusBadge,
  PaymentStatusBadge,
  PaymentMethodBadge,
  ORDER_STATUSES,
} from './shared'
import { cn } from '@/lib/utils'

interface OrdersResp {
  orders: any[]
}

const STATUS_LABELS: Record<string, string> = {
  ordered: 'Ordered',
  packed: 'Packed',
  shipped: 'Shipped',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  returned: 'Returned',
}

export function OrdersTable() {
  const [search, setSearch] = React.useState('')
  const [status, setStatus] = React.useState<string>('all')
  const [paymentStatus, setPaymentStatus] = React.useState<string>('all')
  const [debounced, setDebounced] = React.useState('')
  const [refreshKey, setRefreshKey] = React.useState(0)
  const [viewOrder, setViewOrder] = React.useState<any | null>(null)
  const [expandedRow, setExpandedRow] = React.useState<string | null>(null)

  React.useEffect(() => {
    const t = setTimeout(() => setDebounced(search), 300)
    return () => clearTimeout(t)
  }, [search])

  const { data, loading, error } = useFetch<OrdersResp>('/api/orders', [refreshKey])

  const allOrders = data?.orders || []
  const filtered = allOrders.filter((o) => {
    if (status !== 'all' && o.status !== status) return false
    if (paymentStatus !== 'all' && o.paymentStatus !== paymentStatus) return false
    if (debounced) {
      const q = debounced.toLowerCase()
      return (
        o.orderNo?.toLowerCase().includes(q) ||
        o.customerName?.toLowerCase().includes(q) ||
        o.email?.toLowerCase().includes(q) ||
        o.city?.toLowerCase().includes(q)
      )
    }
    return true
  })

  const reload = () => setRefreshKey((k) => k + 1)

  const updateOrder = async (id: string, patch: { status?: string; paymentStatus?: string }) => {
    try {
      const res = await fetch('/api/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...patch }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed')
      toast.success('Order updated', {
        description: patch.status ? `Status → ${STATUS_LABELS[patch.status] || patch.status}` : `Payment → ${patch.paymentStatus}`,
      })
      reload()
      setViewOrder((cur: any) => (cur && cur.id === id ? { ...cur, ...patch } : cur))
    } catch (e: any) {
      toast.error('Update failed', { description: e.message })
    }
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Orders"
        subtitle="Fulfilment queue & customer orders"
        icon={ShoppingCart}
        action={
          <Badge className="gap-1 bg-maroon/10 text-maroon hover:bg-maroon/10">
            <Package className="h-3.5 w-3.5" /> {allOrders.length} total
          </Badge>
        }
      />

      {/* Filters */}
      <Card className="border-border/60">
        <CardContent className="flex flex-col gap-3 p-4 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by order #, customer, email, city…"
              className="pl-9"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-full lg:w-[170px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {ORDER_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>{STATUS_LABELS[s]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={paymentStatus} onValueChange={setPaymentStatus}>
              <SelectTrigger className="w-full lg:w-[150px]">
                <SelectValue placeholder="Payment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Payments</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="border-border/60">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-4"><TableSkeleton rows={8} /></div>
          ) : error ? (
            <div className="p-4"><EmptyState title="Couldn't load orders" hint={error} icon={AlertTriangle} /></div>
          ) : filtered.length === 0 ? (
            <div className="p-4"><EmptyState title="No orders match" hint="Adjust your filters to see results." icon={ShoppingCart} /></div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40">
                    <TableHead className="pl-4 w-8"></TableHead>
                    <TableHead>Order #</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>City</TableHead>
                    <TableHead className="text-right">Items</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>UTR</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="pr-4 text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((o) => {
                    const isExpanded = expandedRow === o.id
                    return (
                      <React.Fragment key={o.id}>
                        <TableRow
                          className="cursor-pointer"
                          onClick={() => setExpandedRow(isExpanded ? null : o.id)}
                        >
                          <TableCell className="pl-4">
                            <button className="flex h-6 w-6 items-center justify-center rounded text-muted-foreground hover:bg-muted">
                              {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                            </button>
                          </TableCell>
                          <TableCell className="font-mono text-xs font-semibold text-maroon">{o.orderNo}</TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="text-sm font-medium text-ink">{o.customerName}</span>
                              <span className="text-[11px] text-muted-foreground">{o.email}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-ink">{o.city}, {o.state}</TableCell>
                          <TableCell className="text-right text-sm text-ink">{o.items?.length || 0}</TableCell>
                          <TableCell className="text-right text-sm font-semibold text-maroon">{formatINR(o.total)}</TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-1">
                              <PaymentMethodBadge method={o.paymentMethod} />
                              <PaymentStatusBadge status={o.paymentStatus} />
                            </div>
                          </TableCell>
                          <TableCell>
                            {o.utrNumber ? (
                              <span className="font-mono text-xs font-semibold text-maroon">{o.utrNumber}</span>
                            ) : (
                              <span className="text-xs text-muted-foreground">—</span>
                            )}
                          </TableCell>
                          <TableCell><OrderStatusBadge status={o.status} /></TableCell>
                          <TableCell className="text-xs text-muted-foreground">{shortDate(o.createdAt)}</TableCell>
                          <TableCell className="pr-4 text-right">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 gap-1 text-maroon hover:bg-maroon/10"
                              onClick={(e) => {
                                e.stopPropagation()
                                setViewOrder(o)
                              }}
                            >
                              <Eye className="h-3.5 w-3.5" /> View
                            </Button>
                          </TableCell>
                        </TableRow>
                        {isExpanded && (
                          <TableRow className="bg-muted/20 hover:bg-muted/20">
                            <TableCell colSpan={11} className="p-4">
                              <div className="grid gap-4 lg:grid-cols-2">
                                <div>
                                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Items</p>
                                  <div className="space-y-2">
                                    {o.items?.map((it: any) => (
                                      <div key={it.id} className="flex items-center gap-3 rounded-lg border border-border/50 bg-card p-2">
                                        <div className="h-10 w-9 shrink-0 overflow-hidden rounded bg-muted">
                                          {it.image && <img src={it.image} alt={it.name} className="h-full w-full object-cover" />}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                          <p className="truncate text-sm font-medium text-ink">{it.name}</p>
                                          <p className="text-xs text-muted-foreground">
                                            {it.color} · {it.size} · Qty {it.qty}
                                          </p>
                                        </div>
                                        <p className="text-sm font-semibold text-maroon">{formatINR(it.price * it.qty)}</p>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                                <div className="space-y-3">
                                  <div>
                                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Customer</p>
                                    <div className="space-y-1.5 rounded-lg border border-border/50 bg-card p-3 text-sm">
                                      <p className="font-medium text-ink">{o.customerName}</p>
                                      <p className="flex items-center gap-2 text-muted-foreground"><Mail className="h-3.5 w-3.5" /> {o.email}</p>
                                      <p className="flex items-center gap-2 text-muted-foreground"><Phone className="h-3.5 w-3.5" /> {o.phone}</p>
                                      <p className="flex items-center gap-2 text-muted-foreground"><MapPin className="h-3.5 w-3.5" /> {o.address}, {o.city}, {o.state} — {o.pincode}</p>
                                    </div>
                                  </div>
                                  {o.utrNumber && (
                                    <div>
                                      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Payment UTR</p>
                                      <div className="flex items-center gap-2 rounded-lg border border-maroon/30 bg-maroon/5 p-3">
                                        <span className="font-mono text-sm font-bold text-maroon">{o.utrNumber}</span>
                                        <button
                                          onClick={(e) => { e.stopPropagation(); navigator.clipboard?.writeText(o.utrNumber); toast.success('UTR copied') }}
                                          className="ml-auto text-xs text-maroon hover:underline"
                                        >
                                          Copy
                                        </button>
                                      </div>
                                    </div>
                                  )}
                                  <div>
                                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Update Status</p>
                                    <div className="flex flex-wrap items-center gap-2">
                                      <Select value={o.status} onValueChange={(v) => updateOrder(o.id, { status: v })}>
                                        <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                          {ORDER_STATUSES.map((s) => (
                                            <SelectItem key={s} value={s}>{STATUS_LABELS[s]}</SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                      <Select value={o.paymentStatus} onValueChange={(v) => updateOrder(o.id, { paymentStatus: v })}>
                                        <SelectTrigger className="w-[150px]"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="paid">Paid</SelectItem>
                                          <SelectItem value="pending">Pending</SelectItem>
                                          <SelectItem value="failed">Failed</SelectItem>
                                          <SelectItem value="refunded">Refunded</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </React.Fragment>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <OrderDetailDialog order={viewOrder} onClose={() => setViewOrder(null)} onUpdate={updateOrder} />
    </div>
  )
}

function OrderDetailDialog({
  order,
  onClose,
  onUpdate,
}: {
  order: any | null
  onClose: () => void
  onUpdate: (id: string, patch: { status?: string; paymentStatus?: string }) => void
}) {
  return (
    <Dialog open={!!order} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-h-[92vh] w-[95vw] overflow-y-auto scrollbar-thin sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl text-maroon">
            Order {order?.orderNo}
          </DialogTitle>
          <DialogDescription>Placed on {order && shortDate(order.createdAt)}</DialogDescription>
        </DialogHeader>

        {order && (
          <div className="space-y-5">
            {/* Customer */}
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-border/60 bg-muted/30 p-3">
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Customer</p>
                <p className="text-sm font-semibold text-ink">{order.customerName}</p>
                <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground"><Mail className="h-3 w-3" /> {order.email}</p>
                <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground"><Phone className="h-3 w-3" /> {order.phone}</p>
              </div>
              <div className="rounded-lg border border-border/60 bg-muted/30 p-3">
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Shipping Address</p>
                <p className="text-xs text-ink">{order.address}</p>
                <p className="text-xs text-ink">{order.city}, {order.state} — {order.pincode}</p>
              </div>
            </div>

            {/* Items */}
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Items ({order.items?.length || 0})</p>
              <div className="space-y-2">
                {order.items?.map((it: any) => (
                  <div key={it.id} className="flex items-center gap-3 rounded-lg border border-border/50 bg-card p-2.5">
                    <div className="h-12 w-10 shrink-0 overflow-hidden rounded bg-muted">
                      {it.image && <img src={it.image} alt={it.name} className="h-full w-full object-cover" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-ink">{it.name}</p>
                      <p className="text-xs text-muted-foreground">{it.color} · {it.size} · Qty {it.qty} × {formatINR(it.price)}</p>
                    </div>
                    <p className="text-sm font-semibold text-maroon">{formatINR(it.price * it.qty)}</p>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Totals */}
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between text-muted-foreground"><span>Subtotal</span><span>{formatINR(order.subtotal)}</span></div>
              <div className="flex justify-between text-muted-foreground"><span>Shipping</span><span>{formatINR(order.shipping)}</span></div>
              {order.discount > 0 && (
                <div className="flex justify-between text-emerald-600"><span>Discount</span><span>− {formatINR(order.discount)}</span></div>
              )}
              <div className="flex justify-between border-t border-border pt-1.5 text-base font-bold text-ink">
                <span>Total</span><span className="text-maroon">{formatINR(order.total)}</span>
              </div>
            </div>

            <Separator />

            {/* Status controls */}
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <p className="mb-1.5 text-xs font-medium text-ink">Order Status</p>
                <Select value={order.status} onValueChange={(v) => onUpdate(order.id, { status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {ORDER_STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>{STATUS_LABELS[s]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <p className="mb-1.5 text-xs font-medium text-ink">Payment Status</p>
                <Select value={order.paymentStatus} onValueChange={(v) => onUpdate(order.id, { paymentStatus: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                    <SelectItem value="refunded">Refunded</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
