'use client'

import { useState, useEffect } from 'react'
import { useStore, CartItem } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { motion, AnimatePresence } from 'framer-motion'
import { useFetch } from '@/lib/useFetch'
import { ProductCard } from '@/components/store/product-card'
import { toast } from 'sonner'
import { QRCodeCanvas } from 'qrcode.react'
import { PAYMENT_CONFIG, generateUpiLink } from '@/lib/payment'
import { Minus, Plus, Trash2, ShoppingBag, Heart, ArrowRight, Tag, Truck, Shield, X, ChevronRight, CheckCircle2, MapPin, Phone, Mail, Clock, Package, Truck as TruckIcon, CreditCard, Wallet, Banknote, Smartphone, Copy, ExternalLink, Loader2, ArrowLeft, Check, Lock } from 'lucide-react'
import { cn } from '@/lib/utils'

export function CartView() {
  const cart = useStore((s) => s.cart)
  const updateQty = useStore((s) => s.updateQty)
  const removeFromCart = useStore((s) => s.removeFromCart)
  const navigate = useStore((s) => s.navigate)
  const subtotal = useStore((s) => s.cartSubtotal())
  const appliedCoupon = useStore((s) => s.appliedCoupon)
  const setAppliedCoupon = useStore((s) => s.setAppliedCoupon)
  const customer = useStore((s) => s.customer)
  const setAuthOpen = useStore((s) => s.setAuthOpen)
  const setPendingCheckout = useStore((s) => s.setPendingCheckout)
  const [code, setCode] = useState('')
  const paymentMethod = useStore((s) => s.selectedPayment)
  const setPaymentMethod = useStore((s) => s.setSelectedPayment)

  const shipping = subtotal > 999 ? 0 : 49
  const discount = appliedCoupon?.discount || 0
  const total = Math.max(0, subtotal + shipping - discount)

  const applyCoupon = async () => {
    if (!code.trim()) return
    const res = await fetch('/api/coupons', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code: code.toUpperCase(), subtotal }) })
    const data = await res.json()
    if (!res.ok) { toast.error(data.error || 'Invalid coupon'); return }
    setAppliedCoupon({ code: code.toUpperCase(), discount: data.discount })
    toast.success(`Coupon applied! You saved ₹${data.discount}`)
    setCode('')
  }

  // Require login before checkout (like Amazon)
  const handleCheckout = () => {
    if (!customer) {
      setPendingCheckout(true)
      setAuthOpen(true)
      toast.info('Please login to continue checkout', { description: 'Quick login with Google, phone or email' })
      return
    }
    navigate({ name: 'checkout' })
  }

  if (cart.length === 0) {
    return <EmptyState icon={ShoppingBag} title="Your cart is empty" desc="Looks like you haven't added anything yet." cta="Start Shopping" onClick={() => navigate({ name: 'shop' })} />
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <h1 className="mb-6 font-serif text-2xl font-bold md:text-3xl">Shopping Cart <span className="text-base font-normal text-muted-foreground">({cart.length} items)</span></h1>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-3 lg:col-span-2">
          <AnimatePresence>
            {cart.map((item) => (
              <motion.div
                key={`${item.productId}-${item.size}-${item.color}`}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -50 }}
                className="flex gap-4 rounded-xl border border-border bg-card p-4"
              >
                <img src={item.image} alt={item.name} onClick={() => navigate({ name: 'product', slug: item.slug })} className="h-28 w-24 cursor-pointer rounded-lg object-cover" />
                <div className="flex flex-1 flex-col">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-serif text-base font-semibold leading-tight cursor-pointer hover:text-maroon" onClick={() => navigate({ name: 'product', slug: item.slug })}>{item.name}</h3>
                      <div className="mt-1 flex flex-wrap gap-2 text-xs text-muted-foreground">
                        {item.color && <span>Color: <span className="font-medium text-foreground">{item.color}</span></span>}
                        {item.size && <span>Size: <span className="font-medium text-foreground">{item.size}</span></span>}
                      </div>
                    </div>
                    <button onClick={() => { removeFromCart(item.productId, item.size, item.color); toast.success('Removed from cart') }} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
                  </div>
                  <div className="mt-auto flex items-center justify-between">
                    <div className="inline-flex items-center rounded-lg border border-border">
                      <button onClick={() => updateQty(item.productId, item.size, item.color, item.qty - 1)} className="grid h-8 w-8 place-items-center hover:bg-accent"><Minus className="h-3.5 w-3.5" /></button>
                      <span className="w-10 text-center text-sm font-medium">{item.qty}</span>
                      <button onClick={() => updateQty(item.productId, item.size, item.color, item.qty + 1)} className="grid h-8 w-8 place-items-center hover:bg-accent"><Plus className="h-3.5 w-3.5" /></button>
                    </div>
                    <div className="text-right">
                      <p className="font-serif text-lg font-bold text-maroon">₹{(item.price * item.qty).toLocaleString('en-IN')}</p>
                      {item.mrp > item.price && <p className="text-xs text-muted-foreground line-through">₹{(item.mrp * item.qty).toLocaleString('en-IN')}</p>}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          <button onClick={() => navigate({ name: 'shop' })} className="flex items-center gap-1 text-sm font-medium text-maroon hover:underline">
            <ChevronRight className="h-4 w-4 rotate-180" /> Continue Shopping
          </button>
        </div>

        {/* Summary */}
        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="mb-4 font-serif text-lg font-semibold">Order Summary</h3>
            {/* coupon */}
            <div className="mb-4">
              {appliedCoupon ? (
                <div className="flex items-center justify-between rounded-lg bg-olive/10 px-3 py-2 text-sm">
                  <span className="flex items-center gap-1.5 font-medium text-olive"><Tag className="h-3.5 w-3.5" /> {appliedCoupon.code}</span>
                  <button onClick={() => { setAppliedCoupon(null); toast.success('Coupon removed') }} className="text-muted-foreground hover:text-destructive"><X className="h-4 w-4" /></button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Input placeholder="Coupon code" value={code} onChange={(e) => setCode(e.target.value)} className="uppercase" />
                  <Button onClick={applyCoupon} variant="outline">Apply</Button>
                </div>
              )}
              <p className="mt-1.5 text-xs text-muted-foreground">Try: WELCOME15, FESTIVE200, AMRUT10</p>
            </div>

            <div className="space-y-2 border-t border-border pt-4 text-sm">
              <Row label={`Subtotal (${cart.length} items)`} value={`₹${subtotal.toLocaleString('en-IN')}`} />
              <Row label="Shipping" value={shipping === 0 ? 'FREE' : `₹${shipping}`} valueClass={shipping === 0 ? 'text-green-600 font-semibold' : ''} />
              {discount > 0 && <Row label="Discount" value={`-₹${discount.toLocaleString('en-IN')}`} valueClass="text-green-600 font-semibold" />}
              <div className="flex justify-between border-t border-border pt-3 text-base font-bold">
                <span>Total</span><span className="text-maroon">₹{total.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Payment methods */}
            <div className="mt-4 border-t border-border pt-4">
              <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground"><Shield className="h-3.5 w-3.5" /> Payment Method</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'upi', label: 'UPI', icon: '🇮🇳', desc: 'GPay / PhonePe' },
                  { id: 'card', label: 'Card', icon: '💳', desc: 'Visa / MC' },
                  { id: 'wallet', label: 'Wallet', icon: '👛', desc: 'Paytm' },
                  { id: 'cod', label: 'COD', icon: '💵', desc: 'Pay on delivery' },
                ].map((p) => (
                  <button
                    key={p.id}
                    onClick={() => { setPaymentMethod(p.id); toast.success(`${p.label} selected`) }}
                    className={cn('flex items-center gap-2 rounded-lg border-2 p-2 text-left transition-all', paymentMethod === p.id ? 'border-maroon bg-maroon/5' : 'border-border hover:border-gold')}
                  >
                    <span className="text-lg">{p.icon}</span>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold">{p.label}</p>
                      <p className="truncate text-[10px] text-muted-foreground">{p.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Login required banner */}
            {!customer && (
              <div className="mt-4 flex items-center gap-2 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2.5 text-xs text-amber-800">
                <Lock className="h-4 w-4 shrink-0" />
                <span>Please <button onClick={() => { setPendingCheckout(true); setAuthOpen(true) }} className="font-semibold underline">login</button> to proceed to checkout</span>
              </div>
            )}

            <Button onClick={handleCheckout} className="mt-4 w-full bg-maroon text-white hover:bg-maroon-light" size="lg">
              {customer ? <><ShoppingBag className="mr-2 h-5 w-5" /> Buy Now — Checkout <ArrowRight className="ml-1 h-4 w-4" /></> : <><Lock className="mr-2 h-5 w-5" /> Login to Checkout</>}
            </Button>

            <div className="mt-4 flex items-center justify-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><Shield className="h-3.5 w-3.5" /> Secure</span>
              <span className="flex items-center gap-1"><Truck className="h-3.5 w-3.5" /> Fast Delivery</span>
              <span className="flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5" /> COD</span>
            </div>
          </div>

          {/* recommendations */}
          <Recommendations />
        </div>
      </div>
    </div>
  )
}

export function WishlistView() {
  const wishlist = useStore((s) => s.wishlist)
  const toggleWishlist = useStore((s) => s.toggleWishlist)
  const addToCart = useStore((s) => s.addToCart)
  const navigate = useStore((s) => s.navigate)

  if (wishlist.length === 0) {
    return <EmptyState icon={Heart} title="Your wishlist is empty" desc="Save your favorite items here for later." cta="Discover Products" onClick={() => navigate({ name: 'shop' })} />
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <h1 className="mb-6 font-serif text-2xl font-bold md:text-3xl">My Wishlist <span className="text-base font-normal text-muted-foreground">({wishlist.length} items)</span></h1>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {wishlist.map((item, i) => (
          <motion.div
            key={item.productId}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="group overflow-hidden rounded-xl border border-border bg-card"
          >
            <div className="relative aspect-[3/4] cursor-pointer overflow-hidden bg-muted" onClick={() => navigate({ name: 'product', slug: item.slug })}>
              <img src={item.image} alt={item.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
              <button onClick={(e) => { e.stopPropagation(); toggleWishlist(item); toast.success('Removed from wishlist') }} className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-white/80 backdrop-blur hover:bg-white">
                <Heart className="h-4 w-4 fill-maroon text-maroon" />
              </button>
            </div>
            <div className="space-y-1.5 p-3">
              <h3 className="line-clamp-1 font-serif text-sm font-medium cursor-pointer hover:text-maroon" onClick={() => navigate({ name: 'product', slug: item.slug })}>{item.name}</h3>
              <div className="flex items-baseline gap-2">
                <span className="font-serif text-base font-semibold text-maroon">₹{item.price.toLocaleString('en-IN')}</span>
                {item.mrp > item.price && <span className="text-xs text-muted-foreground line-through">₹{item.mrp.toLocaleString('en-IN')}</span>}
              </div>
              <Button onClick={() => { addToCart({ ...item, qty: 1, color: '', size: '' }); toast.success('Added to cart') }} size="sm" className="w-full bg-maroon text-white hover:bg-maroon-light">
                <ShoppingBag className="mr-1.5 h-3.5 w-3.5" /> Add to Cart
              </Button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

export function CheckoutView() {
  const cart = useStore((s) => s.cart)
  const subtotal = useStore((s) => s.cartSubtotal())
  const appliedCoupon = useStore((s) => s.appliedCoupon)
  const clearCart = useStore((s) => s.clearCart)
  const navigate = useStore((s) => s.navigate)
  const storedPayment = useStore((s) => s.selectedPayment)
  const setSelectedPayment = useStore((s) => s.setSelectedPayment)
  const customer = useStore((s) => s.customer)
  const setAuthOpen = useStore((s) => s.setAuthOpen)
  const setPendingCheckout = useStore((s) => s.setPendingCheckout)

  // Multi-step: 1=address, 2=payment, 3=pay (UPI QR / COD confirm)
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({ name: '', phone: '', email: '', address: '', city: '', pincode: '', state: 'Maharashtra', notes: '', giftWrap: false })
  const [payment, setPayment] = useState(storedPayment || 'upi')
  const [placing, setPlacing] = useState(false)
  const [showUpiPay, setShowUpiPay] = useState(false)
  const [orderNo, setOrderNo] = useState('')
  const [paid, setPaid] = useState(false)
  const [payTimer, setPayTimer] = useState(0)
  const [utrNumber, setUtrNumber] = useState('')
  const [utrError, setUtrError] = useState('')

  // Saved addresses (loaded from /api/user/addresses for logged-in users)
  const [savedAddresses, setSavedAddresses] = useState<any[]>([])
  const [selectedAddrId, setSelectedAddrId] = useState<string | ''>('')
  const [isUsingSaved, setIsUsingSaved] = useState(false)

  // Load saved address from per-user localStorage + pre-fill with customer data
  useEffect(() => {
    // Address book is keyed by user email so different users don't share checkout form
    const addrKey = `amrut-userdata-${customer?.email || 'guest'}-checkout-address`
    const saved = typeof window !== 'undefined' ? localStorage.getItem(addrKey) : null
    if (saved) {
      try { setForm((f) => ({ ...f, ...JSON.parse(saved) })) } catch {}
    }
    // Pre-fill with logged-in customer's data (so orders match their account)
    if (customer) {
      setForm((f) => ({
        ...f,
        name: f.name || customer.name,
        email: f.email || customer.email,
        phone: f.phone || customer.phone,
      }))
    }
  }, [customer])

  // Fetch saved addresses from DB for logged-in customers
  useEffect(() => {
    if (!customer?.id) {
      setSavedAddresses([])
      return
    }
    fetch(`/api/user/addresses?userId=${encodeURIComponent(customer.id)}`)
      .then((r) => r.json())
      .then((data) => {
        const addrs = Array.isArray(data?.addresses) ? data.addresses : []
        setSavedAddresses(addrs)
        // Auto-select the default address (or the first one) to pre-fill the form
        const def = addrs.find((a: any) => a.isDefault) || addrs[0]
        if (def) {
          setSelectedAddrId(def.id)
          setIsUsingSaved(true)
          setForm((f) => ({
            ...f,
            name: def.name || f.name,
            phone: def.phone || f.phone,
            address: def.address || f.address,
            city: def.city || f.city,
            pincode: def.pincode || f.pincode,
            state: def.state || f.state,
          }))
        }
      })
      .catch(() => {})
  }, [customer?.id])

  // Payment timer countdown
  useEffect(() => {
    if (showUpiPay && payTimer > 0) {
      const t = setTimeout(() => setPayTimer((p) => p - 1), 1000)
      return () => clearTimeout(t)
    }
  }, [showUpiPay, payTimer])

  const shipping = subtotal > 999 ? 0 : 49
  const giftWrapFee = form.giftWrap ? 49 : 0
  const discount = appliedCoupon?.discount || 0
  // Per-product delivery charges (from cart items)
  const productDelivery = cart.reduce((sum, item) => sum + ((item.deliveryCharge || 0) * item.qty), 0)
  const total = Math.max(0, subtotal + productDelivery + shipping + giftWrapFee - discount)

  const selectSavedAddress = (id: string) => {
    const a = savedAddresses.find((x) => x.id === id)
    if (!a) return
    setSelectedAddrId(id)
    setIsUsingSaved(true)
    setForm((f) => ({
      ...f,
      name: a.name || f.name,
      phone: a.phone || f.phone,
      address: a.address || f.address,
      city: a.city || f.city,
      pincode: a.pincode || f.pincode,
      state: a.state || f.state,
    }))
  }

  const saveAddress = () => {
    if (!form.name || !form.phone || !form.address || !form.city || !form.pincode) {
      toast.error('Please fill all required fields')
      return
    }
    if (!/^\d{6}$/.test(form.pincode)) { toast.error('Enter a valid 6-digit pincode'); return }
    if (!/^\d{10}$/.test(form.phone.replace(/\D/g, ''))) { toast.error('Enter a valid 10-digit phone number'); return }
    localStorage.setItem(`amrut-userdata-${customer?.email || 'guest'}-checkout-address`, JSON.stringify(form))
    setStep(2)
    toast.success('Address saved!')
  }

  const proceedToPay = () => {
    setSelectedPayment(payment)
    if (payment === 'cod') {
      // COD — place order directly
      placeOrder()
    } else {
      // UPI / Card / Wallet — show payment UI
      setShowUpiPay(true)
      setPayTimer(300) // 5 min timer
    }
  }

  const placeOrder = async (paymentStatus = 'paid'): Promise<string | null> => {
    setPlacing(true)
    try {
      // CRITICAL: Always use the logged-in customer's email/phone so orders match their account
      const orderEmail = customer?.email || form.email || `${form.phone}@amrut.in`
      const orderPhone = customer?.phone || form.phone
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: customer?.id || null,
          customerName: form.name,
          email: orderEmail,
          phone: orderPhone,
          address: form.address,
          city: form.city,
          state: form.state,
          pincode: form.pincode,
          paymentMethod: payment,
          paymentStatus: payment === 'cod' ? 'pending' : paymentStatus,
          utrNumber: utrNumber || null,
          subtotal, shipping: shipping + giftWrapFee, discount, total,
          items: cart.map((c) => ({ productId: c.productId, name: c.name, image: c.image, price: c.price, qty: c.qty, color: c.color, size: c.size })),
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setOrderNo(data.order.orderNo)

      // If the user is logged in AND typed a new address (not picked from saved), persist it to the DB
      // so it shows up in their Saved Addresses next time.
      if (customer?.id && !isUsingSaved && form.name && form.address && form.pincode) {
        fetch('/api/user/addresses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: customer.id,
            address: {
              label: 'Checkout',
              name: form.name,
              phone: form.phone,
              address: form.address,
              city: form.city,
              pincode: form.pincode,
              state: form.state,
            },
          }),
        }).catch(() => {})
      }

      if (payment === 'cod') {
        clearCart()
        navigate({ name: 'order-success', orderNo: data.order.orderNo })
      }
      return data.order.orderNo
    } catch (e: any) {
      toast.error(e.message || 'Failed to place order')
      return null
    } finally {
      setPlacing(false)
    }
  }

  const confirmPayment = async () => {
    // Validate UTR — must be exactly 12 digits
    const cleanedUtr = utrNumber.replace(/\D/g, '')
    if (cleanedUtr.length !== 12) {
      setUtrError('UTR must be exactly 12 digits. Check your UPI app payment confirmation.')
      toast.error('Invalid UTR', { description: 'Enter the 12-digit transaction reference from your UPI app' })
      return
    }
    setUtrError('')
    setPaid(true)
    toast.success('Payment confirmed!', { description: `UTR: ${utrNumber}` })
    const newOrderNo = await placeOrder('paid')
    if (!newOrderNo) {
      setPaid(false)
      return
    }
    setTimeout(() => {
      clearCart()
      navigate({ name: 'order-success', orderNo: newOrderNo })
    }, 1200)
  }

  if (cart.length === 0 && !showUpiPay) {
    return <EmptyState icon={ShoppingBag} title="Nothing to checkout" desc="Your cart is empty." cta="Go Shopping" onClick={() => navigate({ name: 'shop' })} />
  }

  // Login required to checkout (like Amazon)
  if (!customer && !showUpiPay) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-maroon/10 text-maroon"><Lock className="h-10 w-10" /></div>
        <h2 className="mt-4 font-serif text-2xl font-bold">Login Required</h2>
        <p className="mt-2 text-sm text-muted-foreground">Please login to your Amrut Collection account to complete your purchase. Your cart is safe.</p>
        <Button
          onClick={() => { setPendingCheckout(true); setAuthOpen(true) }}
          className="mt-5 bg-maroon text-white hover:bg-maroon-light"
          size="lg"
        >
          <Lock className="mr-2 h-4 w-4" /> Login to Continue
        </Button>
        <button onClick={() => navigate({ name: 'cart' })} className="mt-3 block w-full text-center text-xs text-muted-foreground hover:text-maroon">
          ← Back to Cart
        </button>
      </div>
    )
  }

  const payments = [
    { id: 'upi', label: 'UPI', desc: 'GPay · PhonePe · Paytm', icon: Smartphone, badge: 'Recommended' },
    { id: 'cod', label: 'Cash on Delivery', desc: 'Pay when delivered', icon: Banknote },
    { id: 'card', label: 'Credit / Debit Card', desc: 'Visa · Mastercard · RuPay', icon: CreditCard },
    { id: 'wallet', label: 'Wallet', desc: 'Paytm · Amazon Pay', icon: Wallet },
  ]

  const upiLink = generateUpiLink(total, orderNo || 'PENDING')
  const mins = Math.floor(payTimer / 60)
  const secs = payTimer % 60

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <button onClick={() => navigate({ name: 'cart' })} className="mb-3 flex items-center gap-1 text-sm text-muted-foreground hover:text-maroon">
          <ArrowLeft className="h-4 w-4" /> Back to Cart
        </button>
        <h1 className="font-serif text-2xl font-bold md:text-3xl">Secure Checkout</h1>
        <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground"><Lock className="h-3 w-3" /> Your payment information is encrypted & secure</p>
      </div>

      {/* Progress steps */}
      <div className="mb-6 flex items-center gap-2">
        {[
          { n: 1, label: 'Address' },
          { n: 2, label: 'Payment' },
          { n: 3, label: 'Confirm' },
        ].map((s, i) => (
          <div key={s.n} className="flex flex-1 items-center gap-2">
            <div className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-all', step >= s.n ? 'bg-maroon text-white' : 'bg-muted text-muted-foreground')}>
              {step > s.n ? <Check className="h-4 w-4" /> : s.n}
            </div>
            <span className={cn('text-xs font-medium sm:text-sm', step >= s.n ? 'text-maroon' : 'text-muted-foreground')}>{s.label}</span>
            {i < 2 && <div className={cn('h-0.5 flex-1', step > s.n ? 'bg-maroon' : 'bg-border')} />}
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {/* STEP 1: ADDRESS */}
          {step === 1 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="rounded-xl border border-border bg-card p-5">
              <h3 className="mb-4 flex items-center gap-2 font-serif text-lg font-semibold"><MapPin className="h-5 w-5 text-maroon" /> Delivery Address</h3>

              {/* Saved addresses (only for logged-in users) */}
              {savedAddresses.length > 0 && (
                <div className="mb-4 space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Saved Addresses</p>
                  <div className="max-h-48 space-y-2 overflow-y-auto scrollbar-thin pr-1">
                    {savedAddresses.map((a) => (
                      <button
                        key={a.id}
                        type="button"
                        onClick={() => selectSavedAddress(a.id)}
                        className={cn(
                          'flex w-full items-start gap-3 rounded-lg border-2 p-3 text-left transition-all',
                          selectedAddrId === a.id ? 'border-maroon bg-maroon/5' : 'border-border hover:border-gold'
                        )}
                      >
                        <div className={cn('mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border-2', selectedAddrId === a.id ? 'border-maroon' : 'border-border')}>
                          {selectedAddrId === a.id && <div className="h-2.5 w-2.5 rounded-full bg-maroon" />}
                        </div>
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="text-xs font-medium text-muted-foreground">{a.label}</span>
                            {a.isDefault && <Badge className="bg-maroon text-white text-[9px]">Default</Badge>}
                          </div>
                          <p className="text-sm font-medium">{a.name} · {a.phone}</p>
                          <p className="text-xs text-muted-foreground">{a.address}, {a.city} - {a.pincode}, {a.state}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => { setSelectedAddrId(''); setIsUsingSaved(false) }}
                    className={cn(
                      'w-full rounded-lg border-2 border-dashed p-2.5 text-center text-xs transition-all',
                      !isUsingSaved ? 'border-maroon bg-maroon/5 text-maroon' : 'border-border text-muted-foreground hover:border-gold'
                    )}
                  >
                    + Enter a new address
                  </button>
                </div>
              )}

              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Full Name *" value={form.name} onChange={(v) => { setForm({ ...form, name: v }); setIsUsingSaved(false) }} placeholder="Rajesh Patil" />
                <Field label="Phone Number *" value={form.phone} onChange={(v) => { setForm({ ...form, phone: v.replace(/\D/g, '').slice(0, 10) }); setIsUsingSaved(false) }} placeholder="7507732111" />
                <Field label="Email (optional)" value={form.email} onChange={(v) => setForm({ ...form, email: v })} type="email" className="sm:col-span-2" placeholder="rajesh@email.com" />
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">Full Address *</label>
                  <textarea
                    value={form.address}
                    onChange={(e) => { setForm({ ...form, address: e.target.value }); setIsUsingSaved(false) }}
                    placeholder="House no, building, street, area, landmark"
                    rows={2}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-maroon"
                  />
                </div>
                <Field label="City *" value={form.city} onChange={(v) => { setForm({ ...form, city: v }); setIsUsingSaved(false) }} placeholder="Parola" />
                <Field label="PIN Code *" value={form.pincode} onChange={(v) => { setForm({ ...form, pincode: v.replace(/\D/g, '').slice(0, 6) }); setIsUsingSaved(false) }} placeholder="425111" />
                <Field label="State" value={form.state} onChange={(v) => { setForm({ ...form, state: v }); setIsUsingSaved(false) }} />
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">Delivery Notes (optional)</label>
                  <Input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="e.g. Leave at the door" />
                </div>
              </div>
              <label className="mt-3 flex cursor-pointer items-center gap-2 rounded-lg bg-accent/50 px-3 py-2 text-sm">
                <input type="checkbox" checked={form.giftWrap} onChange={(e) => setForm({ ...form, giftWrap: e.target.checked })} className="accent-maroon h-4 w-4" />
                🎁 Gift wrapping (+₹49)
              </label>
              <Button onClick={saveAddress} className="mt-4 w-full bg-maroon text-white hover:bg-maroon-light" size="lg">
                Continue to Payment <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </motion.div>
          )}

          {/* STEP 2: PAYMENT METHOD */}
          {step === 2 && !showUpiPay && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="rounded-xl border border-border bg-card p-5">
              <h3 className="mb-4 flex items-center gap-2 font-serif text-lg font-semibold"><Shield className="h-5 w-5 text-maroon" /> Select Payment Method</h3>
              <div className="space-y-2">
                {payments.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setPayment(p.id)}
                    className={cn('flex w-full items-center gap-3 rounded-lg border-2 p-3.5 text-left transition-all', payment === p.id ? 'border-maroon bg-maroon/5 shadow-sm' : 'border-border hover:border-gold')}
                  >
                    <div className={cn('grid h-10 w-10 shrink-0 place-items-center rounded-lg', payment === p.id ? 'bg-maroon text-white' : 'bg-accent text-maroon')}>
                      <p.icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold">{p.label}</p>
                        {p.badge && <Badge className="bg-gold/20 text-gold-dark text-[9px]">{p.badge}</Badge>}
                      </div>
                      <p className="text-xs text-muted-foreground">{p.desc}</p>
                    </div>
                    <div className={cn('grid h-5 w-5 place-items-center rounded-full border-2', payment === p.id ? 'border-maroon' : 'border-border')}>
                      {payment === p.id && <div className="h-2.5 w-2.5 rounded-full bg-maroon" />}
                    </div>
                  </button>
                ))}
              </div>

              {/* Address summary */}
              <div className="mt-4 rounded-lg bg-accent/40 p-3 text-xs">
                <p className="mb-1 flex items-center gap-1 font-semibold text-maroon"><MapPin className="h-3 w-3" /> Delivering to</p>
                <p className="text-foreground/80">{form.name} · {form.phone}</p>
                <p className="text-muted-foreground">{form.address}, {form.city} - {form.pincode}, {form.state}</p>
                <button onClick={() => setStep(1)} className="mt-1 text-maroon hover:underline">Change address</button>
              </div>

              <div className="mt-4 flex gap-2">
                <Button onClick={() => setStep(1)} variant="outline" size="lg" className="border-border">
                  <ArrowLeft className="mr-1 h-4 w-4" /> Back
                </Button>
                <Button onClick={proceedToPay} disabled={placing} className="flex-1 bg-maroon text-white hover:bg-maroon-light" size="lg">
                  {placing ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</> : payment === 'cod' ? <><Banknote className="mr-2 h-5 w-5" /> Place Order (COD)</> : <><Lock className="mr-2 h-4 w-4" /> Pay ₹{total.toLocaleString('en-IN')} </>}
                </Button>
              </div>
            </motion.div>
          )}

          {/* STEP 3: UPI PAYMENT (QR + Deep Link) */}
          {showUpiPay && (
            <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="rounded-xl border-2 border-maroon/30 bg-card p-5 shadow-lg">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="flex items-center gap-2 font-serif text-lg font-semibold text-maroon"><Smartphone className="h-5 w-5" /> UPI Payment</h3>
                {payTimer > 0 && (
                  <Badge className={cn('text-xs', payTimer < 60 ? 'bg-destructive text-white' : 'bg-maroon text-white')}>
                    ⏱ {mins}:{String(secs).padStart(2, '0')}
                  </Badge>
                )}
              </div>

              {/* Amount */}
              <div className="mb-4 rounded-lg maroon-gradient p-4 text-center text-white">
                <p className="text-xs uppercase tracking-wide opacity-80">Amount to Pay</p>
                <p className="font-serif text-3xl font-bold">₹{total.toLocaleString('en-IN')}</p>
                <p className="text-xs opacity-80">Order: {orderNo || 'AMRUT-PENDING'}</p>
              </div>

              {paid ? (
                /* Payment confirmed */
                <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="py-8 text-center">
                  <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-green-100">
                    <CheckCircle2 className="h-10 w-10 text-green-600" />
                  </div>
                  <p className="mt-3 font-serif text-lg font-semibold text-green-700">Payment Successful!</p>
                  <p className="text-sm text-muted-foreground">Confirming your order...</p>
                  <Loader2 className="mx-auto mt-3 h-5 w-5 animate-spin text-maroon" />
                </motion.div>
              ) : (
                <>
                  {/* QR Code */}
                  <div className="mb-4 flex flex-col items-center">
                    <div className="rounded-2xl border-2 border-gold/30 bg-white p-4 shadow-md">
                      <QRCodeCanvas
                        value={upiLink}
                        size={200}
                        level="M"
                        includeMargin={false}
                        imageSettings={{
                          src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Crect width='24' height='24' rx='4' fill='%237a1f2b'/%3E%3Ctext x='12' y='17' font-family='serif' font-size='14' font-weight='bold' fill='white' text-anchor='middle'%3EA%3C/text%3E%3C/svg%3E",
                          height: 36,
                          width: 36,
                          excavate: true,
                        }}
                      />
                    </div>
                    <p className="mt-2 text-center text-xs text-muted-foreground">Scan with any UPI app to pay</p>
                  </div>

                  {/* UPI ID display + copy */}
                  <div className="mb-4 rounded-lg border border-border bg-accent/30 p-3">
                    <p className="mb-1 text-center text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Or pay via UPI ID</p>
                    <div className="flex items-center justify-center gap-2">
                      <code className="font-mono text-sm font-bold text-maroon">{PAYMENT_CONFIG.upiId}</code>
                      <button
                        onClick={() => { navigator.clipboard?.writeText(PAYMENT_CONFIG.upiId); toast.success('UPI ID copied!') }}
                        className="text-muted-foreground hover:text-maroon"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <p className="mt-1 text-center text-[10px] text-muted-foreground">Name: {PAYMENT_CONFIG.payeeName}</p>
                  </div>

                  {/* Open UPI App button (deep link) */}
                  <a
                    href={upiLink}
                    className="mb-3 flex w-full items-center justify-center gap-2 rounded-lg gold-gradient py-3 font-semibold text-white shadow-lg transition-all hover:opacity-90"
                  >
                    <ExternalLink className="h-5 w-5" /> Open UPI App & Pay
                  </a>

                  {/* UTR input — user must enter the transaction reference */}
                  <div className="mb-3 rounded-lg border-2 border-border bg-card p-3">
                    <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-ink">
                      <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                      Enter UTR / Transaction Reference * (12 digits)
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={utrNumber}
                      onChange={(e) => { setUtrNumber(e.target.value.replace(/\D/g, '').slice(0, 12)); setUtrError('') }}
                      placeholder="Enter 12-digit UTR number"
                      maxLength={12}
                      className="w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm font-mono tracking-wider outline-none focus:border-maroon"
                    />
                    <div className="mt-1 flex items-center justify-between">
                      <p className="text-[10px] text-muted-foreground">
                        💡 Find the 12-digit UTR in your UPI app's payment confirmation or bank SMS.
                      </p>
                      <span className={cn('text-[10px] font-medium', utrNumber.length === 12 ? 'text-green-600' : 'text-muted-foreground')}>
                        {utrNumber.length}/12
                      </span>
                    </div>
                    {utrError && (
                      <p className="mt-1 text-[11px] text-red-600">{utrError}</p>
                    )}
                  </div>

                  {/* Confirm payment */}
                  <Button onClick={confirmPayment} disabled={placing} className="w-full bg-green-600 text-white hover:bg-green-700" size="lg">
                    {placing ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Confirming...</> : <><CheckCircle2 className="mr-2 h-5 w-5" /> I've Paid — Confirm Order</>}
                  </Button>

                  <button
                    onClick={() => { setShowUpiPay(false); setStep(2); setUtrNumber(''); setUtrError('') }}
                    className="mt-2 w-full text-center text-xs text-muted-foreground hover:text-maroon"
                  >
                    ← Choose different payment method
                  </button>

                  <p className="mt-3 text-center text-[10px] text-muted-foreground">
                    💡 After paying via UPI app, enter the UTR number above and click "I've Paid" to confirm your order.
                  </p>
                </>
              )}
            </motion.div>
          )}
        </div>

        {/* ORDER SUMMARY (always visible) */}
        <div className="space-y-4">
          <div className="sticky top-24 rounded-xl border border-border bg-card p-5">
            <h3 className="mb-3 font-serif text-lg font-semibold">Order Summary</h3>
            <div className="max-h-48 space-y-2 overflow-y-auto scrollbar-thin pr-1">
              {cart.map((item) => (
                <div key={`${item.productId}-${item.size}-${item.color}`} className="flex gap-2">
                  <div className="relative">
                    <img src={item.image} alt="" className="h-12 w-10 rounded-md object-cover" />
                    <span className="absolute -right-1 -top-1 grid h-4 w-4 place-items-center rounded-full bg-maroon text-[9px] font-bold text-white">{item.qty}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-1 text-xs font-medium">{item.name}</p>
                    <p className="text-[10px] text-muted-foreground">{item.color} · {item.size}</p>
                    <p className="text-xs font-semibold text-maroon">₹{(item.price * item.qty).toLocaleString('en-IN')}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 space-y-2 border-t border-border pt-4 text-sm">
              <Row label={`Subtotal (${cart.length} items)`} value={`₹${subtotal.toLocaleString('en-IN')}`} />
              {/* Per-product delivery charges */}
              {(() => {
                const productDelivery = cart.reduce((sum, item) => sum + ((item.deliveryCharge || 0) * item.qty), 0)
                return productDelivery > 0 ? <Row label="Product Delivery" value={`₹${productDelivery.toLocaleString('en-IN')}`} /> : null
              })()}
              <Row label="Shipping" value={shipping === 0 ? 'FREE' : `₹${shipping}`} valueClass={shipping === 0 ? 'text-green-600' : ''} />
              {giftWrapFee > 0 && <Row label="Gift Wrap" value={`₹${giftWrapFee}`} />}
              {discount > 0 && <Row label="Discount" value={`-₹${discount.toLocaleString('en-IN')}`} valueClass="text-green-600" />}
              <div className="flex justify-between border-t border-border pt-3 text-base font-bold">
                <span>Total</span><span className="text-maroon">₹{total.toLocaleString('en-IN')}</span>
              </div>
              {/* Price breakdown detail */}
              <div className="mt-2 rounded-lg bg-accent/30 p-2 text-[10px] text-muted-foreground">
                <p className="font-semibold text-ink">Price Breakdown:</p>
                <p>Product Price: ₹{subtotal.toLocaleString('en-IN')}</p>
                {(() => { const pd = cart.reduce((s, i) => s + ((i.deliveryCharge || 0) * i.qty), 0); return pd > 0 ? <p>Delivery Charges: ₹{pd.toLocaleString('en-IN')}</p> : null })()}
                <p>Shipping: {shipping === 0 ? 'FREE' : `₹${shipping}`}</p>
                {giftWrapFee > 0 && <p>Gift Wrap: ₹{giftWrapFee}</p>}
                {discount > 0 && <p>Discount: -₹{discount.toLocaleString('en-IN')}</p>}
                <p className="font-semibold text-maroon">Total Payable: ₹{total.toLocaleString('en-IN')}</p>
              </div>
            </div>

            <div className="mt-4 space-y-2 border-t border-border pt-3 text-xs text-muted-foreground">
              <p className="flex items-center gap-1.5"><Truck className="h-3.5 w-3.5 text-maroon" /> Free shipping over ₹999</p>
              <p className="flex items-center gap-1.5"><Shield className="h-3.5 w-3.5 text-maroon" /> 100% secure payment</p>
              <p className="flex items-center gap-1.5"><Package className="h-3.5 w-3.5 text-maroon" /> 7-day easy returns</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function OrderSuccessView() {
  const view = useStore((s) => s.view as any)
  const orderNo = view.orderNo as string
  const navigate = useStore((s) => s.navigate)
  const { data, loading } = useFetch<{ order: any }>(orderNo ? `/api/orders?orderNo=${orderNo}` : null, [orderNo])
  const order = data?.order

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }} className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-green-100">
        <CheckCircle2 className="h-12 w-12 text-green-600" />
      </motion.div>
      <h1 className="mt-6 text-center font-serif text-3xl font-bold">Order Confirmed!</h1>
      <p className="mt-2 text-center text-muted-foreground">Thank you for your purchase. Your order is being processed.</p>

      {/* Order number — always visible & prominent */}
      {orderNo && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mx-auto mt-6 flex max-w-md items-center justify-center gap-3 rounded-xl border-2 border-maroon/30 bg-maroon/5 p-4">
          <div className="text-center">
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Your Order ID</p>
            <p className="font-serif text-2xl font-bold text-maroon">{orderNo}</p>
          </div>
          <button
            onClick={() => { navigator.clipboard?.writeText(orderNo); toast.success('Order ID copied!') }}
            className="grid h-9 w-9 place-items-center rounded-lg border border-border bg-card hover:bg-accent"
            aria-label="Copy order ID"
          >
            <Copy className="h-4 w-4 text-maroon" />
          </button>
        </motion.div>
      )}

      <div className="mt-6 rounded-xl border border-border bg-card p-6">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div>
            <p className="text-xs text-muted-foreground">Order Number</p>
            <p className="font-serif text-xl font-bold text-maroon">{orderNo || '—'}</p>
          </div>
          {order && (
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Total</p>
              <p className="font-serif text-xl font-bold">₹{order.total.toLocaleString('en-IN')}</p>
            </div>
          )}
        </div>
        {loading && (
          <div className="mt-4 space-y-2">
            <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
            <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
            <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
          </div>
        )}
        {order && (
          <div className="mt-4 space-y-2 text-sm">
            <Row label="Status" value={<Badge className="bg-olive/15 text-olive capitalize">{order.status.replace(/_/g, ' ')}</Badge>} />
            <Row label="Payment" value={<span className="capitalize">{order.paymentMethod} · <span className={order.paymentStatus === 'paid' ? 'font-semibold text-green-600' : 'font-semibold text-amber-600'}>{order.paymentStatus}</span></span>} />
            <Row label="Customer" value={order.customerName} />
            <Row label="Phone" value={order.phone} />
            <Row label="Deliver to" value={`${order.address}, ${order.city} - ${order.pincode}, ${order.state}`} />
            <div className="border-t border-border pt-3">
              <p className="mb-2 font-medium">Items ({order.items.length})</p>
              {order.items.map((it: any) => (
                <div key={it.id} className="flex gap-2 py-1">
                  <img src={it.image} alt="" className="h-12 w-10 rounded object-cover" />
                  <div className="flex-1"><p className="text-xs font-medium">{it.name}</p><p className="text-xs text-muted-foreground">{it.color} · {it.size} · Qty {it.qty}</p></div>
                  <p className="text-xs font-semibold">₹{(it.price * it.qty).toLocaleString('en-IN')}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 flex flex-col gap-2 sm:flex-row">
        <Button onClick={() => navigate({ name: 'track-order', orderNo })} className="flex-1 bg-maroon text-white hover:bg-maroon-light">Track Order</Button>
        <Button onClick={() => navigate({ name: 'shop' })} variant="outline" className="flex-1">Continue Shopping</Button>
      </div>

      <p className="mt-4 text-center text-xs text-muted-foreground">
        📧 A confirmation has been sent to your phone/email. Keep your Order ID safe for tracking.
      </p>
    </div>
  )
}

export function TrackOrderView() {
  const view = useStore((s) => s.view as any)
  const navigate = useStore((s) => s.navigate)
  const [orderNo, setOrderNo] = useState(view.orderNo || '')
  const [searched, setSearched] = useState(!!view.orderNo)
  const { data, loading, error } = useFetch<{ order: any }>(searched && orderNo ? `/api/orders?orderNo=${orderNo}` : null, [orderNo, searched])
  const order = data?.order

  const STEPS = [
    { key: 'ordered', label: 'Ordered', icon: Package },
    { key: 'packed', label: 'Packed', icon: Package },
    { key: 'shipped', label: 'Shipped', icon: TruckIcon },
    { key: 'out_for_delivery', label: 'Out for Delivery', icon: TruckIcon },
    { key: 'delivered', label: 'Delivered', icon: CheckCircle2 },
  ]
  const statusIdx = order ? STEPS.findIndex((s) => s.key === order.status) : -1
  const isCancelled = order?.status === 'cancelled' || order?.status === 'returned'

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-6 text-center font-serif text-2xl font-bold md:text-3xl">Track Your Order</h1>
      <div className="flex gap-2">
        <Input placeholder="Enter your order number (e.g. AMR2024012345)" value={orderNo} onChange={(e) => setOrderNo(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && setSearched(true)} />
        <Button onClick={() => setSearched(true)} className="bg-maroon text-white hover:bg-maroon-light">Track</Button>
      </div>

      {loading && <div className="mt-8 animate-pulse rounded-xl bg-muted p-8" />}
      {error && <p className="mt-8 text-center text-destructive">Order not found. Check your order number.</p>}

      {order && !error && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-8 space-y-6">
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-xs text-muted-foreground">Order</p>
                <p className="font-serif text-lg font-bold text-maroon">{order.orderNo}</p>
              </div>
              <Badge className={cn('capitalize', isCancelled ? 'bg-destructive/15 text-destructive' : 'bg-olive/15 text-olive')}>{order.status.replace(/_/g, ' ')}</Badge>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Total</p>
                <p className="font-semibold">₹{order.total.toLocaleString('en-IN')}</p>
              </div>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
          </div>

          {!isCancelled ? (
            <div className="rounded-xl border border-border bg-card p-6">
              <div className="flex items-center justify-between">
                {STEPS.map((step, i) => {
                  const done = i <= statusIdx
                  const active = i === statusIdx
                  return (
                    <div key={step.key} className="flex flex-1 flex-col items-center">
                      <div className="flex w-full items-center">
                        {i > 0 && <div className={cn('h-0.5 flex-1', i <= statusIdx ? 'bg-maroon' : 'bg-border')} />}
                        <div className={cn('grid h-10 w-10 shrink-0 place-items-center rounded-full border-2 transition-all', done ? 'border-maroon bg-maroon text-white' : 'border-border bg-card text-muted-foreground', active && 'ring-4 ring-maroon/20')}>
                          <step.icon className="h-5 w-5" />
                        </div>
                        {i < STEPS.length - 1 && <div className={cn('h-0.5 flex-1', i < statusIdx ? 'bg-maroon' : 'bg-border')} />}
                      </div>
                      <span className={cn('mt-2 text-center text-[10px] font-medium sm:text-xs', done ? 'text-maroon' : 'text-muted-foreground')}>{step.label}</span>
                    </div>
                  )
                })}
              </div>
              <div className="mt-6 rounded-lg bg-accent/40 p-3 text-sm">
                {order.status === 'delivered' ? '🎉 Your order has been delivered. Enjoy!' :
                 order.status === 'out_for_delivery' ? '🚚 Out for delivery! Expected today.' :
                 order.status === 'shipped' ? '📦 Your order is on the way.' :
                 order.status === 'packed' ? '📋 Your order is packed and ready to ship.' :
                 '✅ Order received. We\'re preparing your items.'}
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-center">
              <p className="font-semibold text-destructive">This order was {order.status}</p>
              <p className="mt-1 text-sm text-muted-foreground">Refund status: {order.paymentStatus}</p>
            </div>
          )}

          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="mb-3 font-serif font-semibold">Items in this order</h3>
            <div className="space-y-2">
              {order.items.map((it: any) => (
                <div key={it.id} className="flex gap-3">
                  <img src={it.image} alt="" className="h-16 w-14 cursor-pointer rounded-md object-cover" onClick={() => navigate({ name: 'product', slug: it.productId })} />
                  <div className="flex-1"><p className="text-sm font-medium">{it.name}</p><p className="text-xs text-muted-foreground">{it.color} · {it.size} · Qty {it.qty}</p></div>
                  <p className="text-sm font-semibold">₹{(it.price * it.qty).toLocaleString('en-IN')}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}

export function AboutView() {
  const navigate = useStore((s) => s.navigate)
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="text-center">
        <span className="inline-block rounded-full bg-maroon/10 px-3 py-1 text-xs font-medium text-maroon">Our Story</span>
        <h1 className="mt-3 font-serif text-3xl font-bold md:text-4xl">The Amrut Collection</h1>
        <p className="mt-1 font-serif text-base text-maroon/80" lang="mr">अमृत कलेक्शन</p>
        <div className="mx-auto mt-2 h-0.5 w-16 rounded-full gold-gradient" />
      </div>
      <div className="mt-8 space-y-6 text-foreground/80">
        <p className="text-lg leading-relaxed">Born in the heart of <strong>Parola, Jalgaon</strong>, Amrut Collection is a premium clothing reselling brand that brings together the richness of traditional Indian aesthetics and the ease of modern fashion. The name "Amrut" — meaning nectar of immortality — reflects our commitment to timeless, enduring style.</p>
        <p className="leading-relaxed">What began as a small family boutique has grown into a beloved destination for festive wear, ethnic elegance and contemporary fashion across Maharashtra. Every piece in our collection is hand-curated for quality, fabric and craftsmanship — from handwoven Banarasi sarees to crisp cotton shirts and charming kids' party wear.</p>
        <div className="grid gap-4 sm:grid-cols-3">
          {[{ n: '10,000+', l: 'Happy Customers' }, { n: '500+', l: 'Curated Styles' }, { n: '4.7★', l: 'Average Rating' }].map((s) => (
            <div key={s.l} className="rounded-xl border border-border bg-card p-6 text-center">
              <p className="font-serif text-3xl font-bold text-maroon">{s.n}</p>
              <p className="text-sm text-muted-foreground">{s.l}</p>
            </div>
          ))}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl bg-cream/50 p-6"><h3 className="font-serif text-lg font-semibold text-maroon">Our Mission</h3><p className="mt-2 text-sm">To make premium, traditional Indian fashion accessible and delightful for every family, delivered with trust and care.</p></div>
          <div className="rounded-xl bg-cream/50 p-6"><h3 className="font-serif text-lg font-semibold text-maroon">Our Promise</h3><p className="mt-2 text-sm">Authentic products, honest pricing, easy returns and warm customer service — every single time you shop with us.</p></div>
        </div>
        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="mb-3 flex items-center gap-2 font-serif text-lg font-semibold"><MapPin className="h-5 w-5 text-maroon" /> Visit Us</h3>
          <div className="grid gap-2 text-sm sm:grid-cols-2">
            <p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-maroon" /> Main Bajar, front of Bhajipala Market, Parola, Jalgaon — 425111</p>
            <p className="flex items-center gap-2"><Phone className="h-4 w-4 text-maroon" /> +91 75077 32111</p>
            <p className="flex items-center gap-2"><Mail className="h-4 w-4 text-maroon" /> care@amrutcollection.in</p>
            <p className="flex items-center gap-2"><Clock className="h-4 w-4 text-maroon" /> Mon–Sun: 10 AM – 9 PM</p>
          </div>
        </div>
      </div>
      <div className="mt-8 text-center">
        <Button onClick={() => navigate({ name: 'shop' })} className="bg-maroon text-white hover:bg-maroon-light">Explore the Collection</Button>
      </div>
    </div>
  )
}

export function ContactView() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    toast.success('Message sent!', { description: 'We\'ll get back to you within 24 hours.' })
    setForm({ name: '', email: '', subject: '', message: '' })
  }
  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="text-center">
        <h1 className="font-serif text-3xl font-bold md:text-4xl">Get in Touch</h1>
        <p className="mt-2 text-muted-foreground">We'd love to hear from you. Reach out anytime.</p>
        <div className="mx-auto mt-2 h-0.5 w-16 rounded-full gold-gradient" />
      </div>
      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <div className="space-y-3">
          {[
            { icon: MapPin, title: 'Visit Our Store', lines: ['Main Bajar, front of Bhajipala Market', 'Parola, Jalgaon — 425111, Maharashtra'] },
            { icon: Phone, title: 'Call Us', lines: ['+91 75077 32111', 'Mon–Sun, 10 AM – 9 PM'] },
            { icon: Mail, title: 'Email Us', lines: ['care@amrutcollection.in', 'Reply within 24 hours'] },
            { icon: Clock, title: 'Business Hours', lines: ['Monday – Sunday', '10:00 AM – 9:00 PM'] },
          ].map((c) => (
            <div key={c.title} className="flex gap-3 rounded-xl border border-border bg-card p-4">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-maroon/10 text-maroon"><c.icon className="h-5 w-5" /></div>
              <div><p className="font-semibold">{c.title}</p>{c.lines.map((l) => <p key={l} className="text-sm text-muted-foreground">{l}</p>)}</div>
            </div>
          ))}
        </div>
        <form onSubmit={submit} className="space-y-3 rounded-xl border border-border bg-card p-6">
          <h3 className="font-serif text-lg font-semibold">Send a Message</h3>
          <Field label="Your Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
          <Field label="Email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} type="email" />
          <Field label="Subject" value={form.subject} onChange={(v) => setForm({ ...form, subject: v })} />
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Message</label>
            <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} required rows={4} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-maroon" />
          </div>
          <Button type="submit" className="w-full bg-maroon text-white hover:bg-maroon-light">Send Message</Button>
        </form>
      </div>
    </div>
  )
}

function Recommendations() {
  const { data } = useFetch<{ products: any[] }>(`/api/products?section=bestseller&limit=4`)
  const navigate = useStore((s) => s.navigate)
  if (!data?.products?.length) return null
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <h3 className="mb-3 font-serif font-semibold">You might also like</h3>
      <div className="grid grid-cols-2 gap-2">
        {data.products.slice(0, 4).map((p) => (
          <div key={p.id} onClick={() => navigate({ name: 'product', slug: p.slug })} className="cursor-pointer rounded-lg border border-border p-2 hover:border-gold">
            <img src={p.images[0]} alt="" className="aspect-square w-full rounded object-cover" />
            <p className="mt-1 line-clamp-1 text-xs font-medium">{p.name}</p>
            <p className="text-xs font-semibold text-maroon">₹{p.price.toLocaleString('en-IN')}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function EmptyState({ icon: Icon, title, desc, cta, onClick }: { icon: any; title: string; desc: string; cta: string; onClick: () => void }) {
  return (
    <div className="grid place-items-center px-4 py-20 text-center">
      <div className="grid h-20 w-20 place-items-center rounded-full bg-maroon/10 text-maroon"><Icon className="h-10 w-10" /></div>
      <h2 className="mt-4 font-serif text-2xl font-bold">{title}</h2>
      <p className="mt-1 text-muted-foreground">{desc}</p>
      <Button onClick={onClick} className="mt-5 bg-maroon text-white hover:bg-maroon-light">{cta}</Button>
    </div>
  )
}

function Row({ label, value, valueClass }: { label: string; value: React.ReactNode; valueClass?: string }) {
  return <div className="flex justify-between"><span className="text-muted-foreground">{label}</span><span className={cn('font-medium', valueClass)}>{value}</span></div>
}

function Field({ label, value, onChange, type = 'text', placeholder, className }: { label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string; className?: string }) {
  return (
    <div className={className}>
      <label className="mb-1 block text-xs font-medium text-muted-foreground">{label}</label>
      <Input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} required />
    </div>
  )
}
