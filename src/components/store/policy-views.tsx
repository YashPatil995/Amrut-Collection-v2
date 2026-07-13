'use client'

import { useStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Truck, RotateCcw, Shield, Package, MapPin, Clock, CheckCircle2 } from 'lucide-react'

export function PolicyView({ type }: { type: 'shipping' | 'returns' | 'privacy' }) {
  const navigate = useStore((s) => s.navigate)

  const content = {
    shipping: {
      title: 'Shipping Policy',
      icon: Truck,
      sections: [
        { heading: 'Order Processing', body: 'Orders are processed within 24 hours of placement. You will receive an order confirmation email/SMS immediately, and a shipping confirmation once your order is dispatched.' },
        { heading: 'Delivery Timelines', body: 'We deliver across India within 2-7 business days depending on your location:\n• Metro cities: 2-3 business days\n• Tier 2 & 3 cities: 3-5 business days\n• Rural areas: 5-7 business days' },
        { heading: 'Shipping Charges', body: '• FREE shipping on all orders above ₹999\n• Flat ₹49 shipping fee for orders below ₹999\n• Cash on Delivery (COD) available with no extra charges' },
        { heading: 'Order Tracking', body: 'Once your order is shipped, you will receive a tracking number via SMS and email. You can track your order anytime from the "Track Order" section on our website.' },
        { heading: 'Delivery Partners', body: 'We partner with trusted courier services like BlueDart, Delhivery, and DTDC to ensure safe and timely delivery of your orders.' },
        { heading: 'International Shipping', body: 'Currently, we deliver only within India. International shipping will be available soon.' },
      ],
    },
    returns: {
      title: 'Returns & Refunds',
      icon: RotateCcw,
      sections: [
        { heading: '7-Day Return Policy', body: 'We offer a hassle-free 7-day return policy. If you are not satisfied with your purchase, you can return it within 7 days of delivery for a full refund or exchange.' },
        { heading: 'Eligible Items', body: '• Items must be unworn, unwashed, and with all original tags intact\n• Items must be in their original packaging\n• Free gifts/promotional items must be returned along with the product' },
        { heading: 'Non-Returnable Items', body: '• Innerwear and lingerie (for hygiene reasons)\n• Items damaged due to misuse\n• Items altered or modified by the customer' },
        { heading: 'How to Initiate a Return', body: '1. Go to "Track Order" on our website\n2. Enter your order number\n3. Select the item(s) you wish to return\n4. Choose refund or exchange\n5. We will arrange a free pickup from your address' },
        { heading: 'Refund Process', body: '• Refunds are processed within 5-7 business days after we receive the returned item\n• Refunds are credited back to the original payment method\n• For COD orders, refunds are processed via UPI or bank transfer' },
        { heading: 'Exchange Policy', body: 'You can request an exchange for a different size or color of the same product. Exchanges are subject to availability. If the requested item is unavailable, a full refund will be processed.' },
      ],
    },
    privacy: {
      title: 'Privacy Policy',
      icon: Shield,
      sections: [
        { heading: 'Information We Collect', body: 'We collect information you provide directly to us, including:\n• Name, email address, phone number\n• Shipping and billing addresses\n• Payment information (processed securely via payment gateways)\n• Order history and preferences' },
        { heading: 'How We Use Your Information', body: '• To process and fulfill your orders\n• To send order confirmations and shipping updates\n• To provide customer support\n• To improve our products and services\n• To send promotional emails/SMS (you can opt out anytime)' },
        { heading: 'Information Sharing', body: 'We do NOT sell, trade, or rent your personal information to third parties. We may share your information with:\n• Payment gateways (for processing payments)\n• Courier partners (for delivery only)\n• Government authorities (if legally required)' },
        { heading: 'Data Security', body: 'Your data is protected using industry-standard encryption (SSL). Payment information is processed through secure payment gateways (Razorpay, UPI) and we never store your card details on our servers.' },
        { heading: 'Cookies', body: 'We use cookies to enhance your shopping experience, remember your preferences, and analyze website traffic. You can disable cookies in your browser settings.' },
        { heading: 'Your Rights', body: 'You have the right to:\n• Access your personal data\n• Correct inaccurate information\n• Request deletion of your account\n• Opt out of marketing communications\n\nTo exercise these rights, contact us at care@amrutcollection.in' },
        { heading: 'Contact Us', body: 'If you have any questions about our privacy policy, please contact:\nAmrut Collection\nMain Bajar, front of Bhajipala Market, Parola, Jalgaon — 425111\nPhone: +91 75077 32111\nEmail: care@amrutcollection.in' },
      ],
    },
  }

  const data = content[type]
  const Icon = data.icon

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <button onClick={() => navigate({ name: 'home' })} className="mb-4 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-maroon">
        <ArrowLeft className="h-4 w-4" /> Back to Store
      </button>

      <div className="rounded-2xl border border-border bg-card p-6 md:p-8">
        <div className="mb-6 flex items-center gap-3 border-b border-border pb-4">
          <div className="grid h-12 w-12 place-items-center rounded-xl bg-maroon/10 text-maroon">
            <Icon className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-serif text-2xl font-bold text-maroon md:text-3xl">{data.title}</h1>
            <p className="text-xs text-muted-foreground">Last updated: {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
          </div>
        </div>

        <div className="space-y-6">
          {data.sections.map((s, i) => (
            <div key={i}>
              <h2 className="mb-2 flex items-center gap-2 font-serif text-lg font-semibold text-ink">
                <CheckCircle2 className="h-4 w-4 text-gold" /> {s.heading}
              </h2>
              <p className="whitespace-pre-line pl-6 text-sm leading-relaxed text-foreground/80">{s.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-xl bg-cream/50 p-4 text-center">
          <p className="text-sm text-muted-foreground">
            Questions? We're here to help.
          </p>
          <div className="mt-2 flex flex-wrap justify-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5 text-maroon" /> Parola, Jalgaon</span>
            <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5 text-maroon" /> 10 AM – 9 PM</span>
            <span className="flex items-center gap-1"><Package className="h-3.5 w-3.5 text-maroon" /> care@amrutcollection.in</span>
          </div>
        </div>
      </div>
    </div>
  )
}
