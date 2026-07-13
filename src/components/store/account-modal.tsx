'use client'

import * as React from 'react'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Plus, Trash2, CreditCard } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { useStore } from '@/lib/store'

interface AccountModalProps {
  type: 'addresses' | 'payments' | null
  onClose: () => void
}

// Payment methods stay in localStorage (no DB model for them) — keyed per user
const PAY_KEY_BASE = 'amrut-userdata'
const PAY_SUFFIX = '-payments'

interface SavedAddress {
  id: string
  label: string
  name: string
  phone: string
  address: string
  city: string
  pincode: string
  state: string
  isDefault: boolean
}

interface PaymentMethod {
  id: string
  type: 'upi' | 'card'
  label: string
  detail: string
  isDefault: boolean
}

// Build the per-user payment storage key — falls back to 'guest' if logged out
function usePayStorageKey() {
  const customer = useStore((s) => s.customer)
  const email = customer?.email || 'guest'
  return { payKey: `${PAY_KEY_BASE}-${email}${PAY_SUFFIX}` }
}

function loadPayments(key: string): PaymentMethod[] {
  if (typeof window === 'undefined') return []
  try {
    const saved = localStorage.getItem(key)
    if (saved) return JSON.parse(saved)
  } catch {}
  return []
}

function savePayments(key: string, data: PaymentMethod[]) {
  if (typeof window !== 'undefined') localStorage.setItem(key, JSON.stringify(data))
}

export function AccountModal({ type, onClose }: AccountModalProps) {
  const customer = useStore((s) => s.customer)
  const { payKey } = usePayStorageKey()

  // Addresses come from the DB via /api/user/addresses
  const [addresses, setAddresses] = React.useState<SavedAddress[]>([])
  const [addressesLoading, setAddressesLoading] = React.useState(false)
  const [payments, setPayments] = React.useState<PaymentMethod[]>(() => loadPayments(payKey))

  // New address form
  const [showAddrForm, setShowAddrForm] = React.useState(false)
  const [addrSaving, setAddrSaving] = React.useState(false)
  const [addrForm, setAddrForm] = useState({ label: '', name: '', phone: '', address: '', city: '', pincode: '' })

  // New payment form
  const [showPayForm, setShowPayForm] = React.useState(false)
  const [payForm, setPayForm] = useState({ type: 'upi' as 'upi' | 'card', label: '', detail: '' })

  // Load addresses from DB whenever the modal opens or the customer changes
  const reloadAddresses = React.useCallback(() => {
    if (!customer?.id) {
      setAddresses([])
      return
    }
    setAddressesLoading(true)
    fetch(`/api/user/addresses?userId=${encodeURIComponent(customer.id)}`)
      .then((r) => r.json())
      .then((data) => {
        setAddresses(Array.isArray(data?.addresses) ? data.addresses : [])
      })
      .catch(() => toast.error('Failed to load addresses'))
      .finally(() => setAddressesLoading(false))
  }, [customer?.id])

  React.useEffect(() => {
    if (type === 'addresses') reloadAddresses()
  }, [type, reloadAddresses])

  // Reload payments from the per-user bucket whenever the user or modal type changes
  React.useEffect(() => {
    setPayments(loadPayments(payKey))
  }, [type, payKey])

  const persistPayments = (pays: PaymentMethod[]) => {
    setPayments(pays)
    savePayments(payKey, pays)
  }

  const addAddress = async () => {
    if (!customer?.id) {
      toast.error('Please login to save addresses')
      return
    }
    if (!addrForm.name || !addrForm.phone || !addrForm.address || !addrForm.pincode) {
      toast.error('Fill all required fields')
      return
    }
    setAddrSaving(true)
    try {
      const res = await fetch('/api/user/addresses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: customer.id,
          address: { ...addrForm, state: 'Maharashtra' },
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Failed to save address')
      setShowAddrForm(false)
      setAddrForm({ label: '', name: '', phone: '', address: '', city: '', pincode: '' })
      toast.success('Address saved')
      reloadAddresses()
    } catch (e: any) {
      toast.error(e.message || 'Failed to save address')
    } finally {
      setAddrSaving(false)
    }
  }

  const deleteAddress = async (id: string) => {
    try {
      const res = await fetch(`/api/user/addresses?id=${encodeURIComponent(id)}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete')
      toast.success('Address removed')
      reloadAddresses()
    } catch (e: any) {
      toast.error(e.message || 'Failed to delete address')
    }
  }

  const setDefaultAddress = async (id: string) => {
    if (!customer?.id) return
    try {
      const res = await fetch('/api/user/addresses', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, userId: customer.id, isDefault: true }),
      })
      if (!res.ok) throw new Error('Failed to set default')
      toast.success('Default address updated')
      reloadAddresses()
    } catch {
      toast.error('Failed to set default')
    }
  }

  const addPayment = () => {
    if (!payForm.label || !payForm.detail) {
      toast.error('Fill all fields')
      return
    }
    const newPay: PaymentMethod = {
      id: 'pay-' + Date.now(),
      ...payForm,
      isDefault: payments.length === 0,
    }
    const updated = [...payments, newPay]
    // If this is the new default, unset the others
    if (newPay.isDefault) updated.forEach((p) => { p.isDefault = p.id === newPay.id })
    persistPayments(updated)
    setShowPayForm(false)
    setPayForm({ type: 'upi', label: '', detail: '' })
    toast.success('Payment method saved')
  }

  const deletePayment = (id: string) => {
    persistPayments(payments.filter((p) => p.id !== id))
    toast.success('Payment method removed')
  }

  const setDefaultPayment = (id: string) => {
    persistPayments(payments.map((p) => ({ ...p, isDefault: p.id === id })))
    toast.success('Default payment updated')
  }

  return (
    <AnimatePresence>
      {type && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 grid place-items-center bg-black/50 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg max-h-[85vh] overflow-y-auto scrollbar-thin rounded-2xl border border-border bg-card shadow-2xl"
          >
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-card px-6 py-4">
              <h2 className="font-serif text-lg font-bold text-maroon">
                {type === 'addresses' && 'Saved Addresses'}
                {type === 'payments' && 'Payment Methods'}
              </h2>
              <button onClick={onClose} className="text-muted-foreground hover:text-maroon"><X className="h-5 w-5" /></button>
            </div>

            <div className="p-6">
              {type === 'addresses' && (
                <div className="space-y-3">
                  {!customer?.id && (
                    <p className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                      Please login to save and manage addresses across devices.
                    </p>
                  )}
                  {customer?.id && addressesLoading && (
                    <p className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">Loading addresses…</p>
                  )}
                  {customer?.id && !addressesLoading && addresses.length === 0 && !showAddrForm && (
                    <p className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                      No saved addresses yet. Add one for faster checkout.
                    </p>
                  )}
                  {addresses.map((a) => (
                    <div key={a.id} className={cn('rounded-xl border p-4', a.isDefault ? 'border-maroon bg-maroon/5' : 'border-border')}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-[10px]">{a.label}</Badge>
                            {a.isDefault && <Badge className="bg-maroon text-white text-[9px]">Default</Badge>}
                          </div>
                          <p className="mt-1 text-sm font-medium">{a.name} · {a.phone}</p>
                          <p className="text-xs text-muted-foreground">{a.address}, {a.city} - {a.pincode}</p>
                        </div>
                        <div className="flex gap-1">
                          {!a.isDefault && <button onClick={() => setDefaultAddress(a.id)} className="text-[10px] text-maroon hover:underline">Set default</button>}
                          <button onClick={() => deleteAddress(a.id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {showAddrForm ? (
                    <div className="space-y-3 rounded-xl border border-border p-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-xs">Label</Label>
                          <Input value={addrForm.label} onChange={(e) => setAddrForm({ ...addrForm, label: e.target.value })} placeholder="Home" className="mt-1" />
                        </div>
                        <div>
                          <Label className="text-xs">Name *</Label>
                          <Input value={addrForm.name} onChange={(e) => setAddrForm({ ...addrForm, name: e.target.value })} placeholder="Full name" className="mt-1" />
                        </div>
                        <div>
                          <Label className="text-xs">Phone *</Label>
                          <Input value={addrForm.phone} onChange={(e) => setAddrForm({ ...addrForm, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })} placeholder="7507732111" className="mt-1" />
                        </div>
                        <div>
                          <Label className="text-xs">PIN *</Label>
                          <Input value={addrForm.pincode} onChange={(e) => setAddrForm({ ...addrForm, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) })} placeholder="425111" className="mt-1" />
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs">Address *</Label>
                        <Input value={addrForm.address} onChange={(e) => setAddrForm({ ...addrForm, address: e.target.value })} placeholder="House, street, area" className="mt-1" />
                      </div>
                      <div>
                        <Label className="text-xs">City</Label>
                        <Input value={addrForm.city} onChange={(e) => setAddrForm({ ...addrForm, city: e.target.value })} placeholder="Parola" className="mt-1" />
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" className="flex-1" onClick={() => setShowAddrForm(false)} disabled={addrSaving}>Cancel</Button>
                        <Button className="flex-1 bg-maroon text-white hover:bg-maroon-light" onClick={addAddress} disabled={addrSaving}>
                          {addrSaving ? 'Saving…' : 'Save Address'}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    customer?.id && (
                      <Button variant="outline" className="w-full border-dashed" onClick={() => setShowAddrForm(true)}>
                        <Plus className="mr-1.5 h-4 w-4" /> Add New Address
                      </Button>
                    )
                  )}
                </div>
              )}

              {type === 'payments' && (
                <div className="space-y-3">
                  {payments.length === 0 && !showPayForm && (
                    <p className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                      No saved payment methods. Add one for faster checkout.
                    </p>
                  )}
                  {payments.map((p) => (
                    <div key={p.id} className={cn('rounded-xl border p-4', p.isDefault ? 'border-maroon bg-maroon/5' : 'border-border')}>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="grid h-10 w-10 place-items-center rounded-lg bg-maroon/10 text-maroon">
                            {p.type === 'upi' ? <span className="text-xs font-bold">UPI</span> : <CreditCard className="h-5 w-5" />}
                          </div>
                          <div>
                            <p className="text-sm font-medium">{p.label}</p>
                            <p className="text-xs text-muted-foreground">{p.detail}</p>
                            {p.isDefault && <Badge className="mt-1 bg-maroon text-white text-[9px]">Default</Badge>}
                          </div>
                        </div>
                        <div className="flex gap-1">
                          {!p.isDefault && <button onClick={() => setDefaultPayment(p.id)} className="text-[10px] text-maroon hover:underline">Set default</button>}
                          <button onClick={() => deletePayment(p.id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {showPayForm ? (
                    <div className="space-y-3 rounded-xl border border-border p-4">
                      <div className="grid grid-cols-2 gap-2">
                        <Button variant={payForm.type === 'upi' ? 'default' : 'outline'} className={payForm.type === 'upi' ? 'bg-maroon text-white' : ''} onClick={() => setPayForm({ ...payForm, type: 'upi' })}>UPI ID</Button>
                        <Button variant={payForm.type === 'card' ? 'default' : 'outline'} className={payForm.type === 'card' ? 'bg-maroon text-white' : ''} onClick={() => setPayForm({ ...payForm, type: 'card' })}>Card</Button>
                      </div>
                      <div>
                        <Label className="text-xs">Label</Label>
                        <Input value={payForm.label} onChange={(e) => setPayForm({ ...payForm, label: e.target.value })} placeholder={payForm.type === 'upi' ? 'My UPI' : 'Visa card'} className="mt-1" />
                      </div>
                      <div>
                        <Label className="text-xs">{payForm.type === 'upi' ? 'UPI ID' : 'Card Number'}</Label>
                        <Input value={payForm.detail} onChange={(e) => setPayForm({ ...payForm, detail: e.target.value })} placeholder={payForm.type === 'upi' ? 'name@bank' : '•••• •••• •••• 1234'} className="mt-1" />
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" className="flex-1" onClick={() => setShowPayForm(false)}>Cancel</Button>
                        <Button className="flex-1 bg-maroon text-white hover:bg-maroon-light" onClick={addPayment}>Save</Button>
                      </div>
                    </div>
                  ) : (
                    <Button variant="outline" className="w-full border-dashed" onClick={() => setShowPayForm(true)}>
                      <Plus className="mr-1.5 h-4 w-4" /> Add Payment Method
                    </Button>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
