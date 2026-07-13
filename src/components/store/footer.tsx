'use client'

import { Instagram, Facebook, Youtube, Mail, Phone, MapPin, MessageCircle, Shield } from 'lucide-react'
import { useStore } from '@/lib/store'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export function Footer() {
  const navigate = useStore((s) => s.navigate)
  const view = useStore((s) => s.view)
  if (view.name === 'admin') return null

  const subscribe = (e: React.FormEvent) => {
    e.preventDefault()
    toast.success('Subscribed!', { description: 'Welcome to the Amrut family. Watch your inbox for festive offers.' })
    ;(e.target as HTMLFormElement).reset()
  }

  return (
    <footer className="mt-auto border-t border-border bg-cream/60">
      {/* trust badges */}
      <div className="border-b border-border bg-card">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-4 px-4 py-6 sm:grid-cols-4">
          {[
            { icon: Shield, title: 'Secure Payments', desc: 'UPI · Cards · COD' },
            { icon: MessageCircle, title: '24/7 Support', desc: 'WhatsApp & Call' },
            { icon: Mail, title: 'Easy Returns', desc: '7-day return policy' },
            { icon: MapPin, title: 'Pan-India Shipping', desc: 'Fast & tracked' },
          ].map((b) => (
            <div key={b.title} className="flex items-center gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-maroon/10 text-maroon">
                <b.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold">{b.title}</p>
                <p className="text-xs text-muted-foreground">{b.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* main footer */}
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 md:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-full gold-gradient text-white shadow-md"><span className="font-serif text-xl font-bold">A</span></div>
            <div className="leading-tight">
              <p className="font-serif text-2xl font-bold gold-text drop-shadow-sm" lang="mr">अमृत कलेक्शन</p>
              <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-maroon">Amrut Collection</p>
              <p className="mt-0.5 text-[9px] uppercase tracking-[0.2em] text-muted-foreground">Premium Indian Clothing</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            A premium clothing reselling brand rooted in Parola, Jalgaon. Bringing you the finest in ethnic and contemporary fashion, woven with tradition and delivered with care.
          </p>
          <div className="flex gap-2 pt-1">
            <a href="https://www.instagram.com/amrut_dresses_parola?igsh=cWRwcGZ3eGZyZHU3" target="_blank" rel="noreferrer" aria-label="Instagram" className="grid h-9 w-9 place-items-center rounded-full border border-border transition-colors hover:border-gold hover:bg-gold/10">
              <Instagram className="h-4 w-4" />
            </a>
            {[Facebook, Youtube].map((Icon, i) => (
              <a key={i} href="#" className="grid h-9 w-9 place-items-center rounded-full border border-border transition-colors hover:border-gold hover:bg-gold/10">
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        <div>
          <h4 className="mb-3 font-serif text-base font-semibold">Shop</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {[
              { label: 'Men', v: { name: 'shop' as const, gender: 'men' } },
              { label: 'Women', v: { name: 'shop' as const, gender: 'women' } },
              { label: 'Kids', v: { name: 'shop' as const, gender: 'kids' } },
              { label: 'New Arrivals', v: { name: 'shop' as const, section: 'new' } },
              { label: 'Best Sellers', v: { name: 'shop' as const, section: 'bestseller' } },
            ].map((l) => (
              <li key={l.label}>
                <button onClick={() => navigate(l.v)} className="transition-colors hover:text-maroon">{l.label}</button>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="mb-3 font-serif text-base font-semibold">Information</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><button onClick={() => navigate({ name: 'about' })} className="hover:text-maroon">About Us</button></li>
            <li><button onClick={() => navigate({ name: 'contact' })} className="hover:text-maroon">Contact</button></li>
            <li><button onClick={() => navigate({ name: 'track-order' })} className="hover:text-maroon">Track Order</button></li>
            <li><button onClick={() => navigate({ name: 'shipping-policy' })} className="hover:text-maroon">Shipping Policy</button></li>
            <li><button onClick={() => navigate({ name: 'returns-policy' })} className="hover:text-maroon">Returns & Refunds</button></li>
            <li><button onClick={() => navigate({ name: 'privacy-policy' })} className="hover:text-maroon">Privacy Policy</button></li>
          </ul>
        </div>

        <div className="space-y-3">
          <h4 className="font-serif text-base font-semibold">Stay in Touch</h4>
          <p className="text-sm text-muted-foreground">Get festive offers & new arrivals in your inbox.</p>
          <form onSubmit={subscribe} className="flex gap-2">
            <Input type="email" required placeholder="Your email" className="bg-card" />
            <Button type="submit" className="bg-maroon text-white hover:bg-maroon-light">Subscribe</Button>
          </form>
          <div className="space-y-1.5 pt-2 text-sm text-muted-foreground">
            <p className="flex items-center gap-2"><Phone className="h-4 w-4 text-maroon" /> +91 75077 32111</p>
            <p className="flex items-center gap-2"><Mail className="h-4 w-4 text-maroon" /> care@amrutcollection.in</p>
            <p className="flex items-start gap-2"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-maroon" /> Main Bajar, front of Bhajipala Market, Parola, Jalgaon — 425111, Maharashtra, India</p>
          </div>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-4 text-xs text-muted-foreground sm:flex-row">
          <p>© {new Date().getFullYear()} Amrut Collection. All rights reserved. Made with ♥ in Parola, Jalgaon.</p>
          <div className="flex gap-3">
            <span>Visa</span><span>Mastercard</span><span>UPI</span><span>RuPay</span><span>COD</span>
          </div>
        </div>
      </div>

      {/* floating WhatsApp + call buttons */}
      <FloatingButtons />
    </footer>
  )
}

function FloatingButtons() {
  return (
    <div className="fixed bottom-4 right-4 z-30 flex flex-col gap-2">
      <a href="tel:+917507732111" aria-label="Call us"
        className="grid h-12 w-12 place-items-center rounded-full bg-maroon text-white shadow-lg transition-transform hover:scale-110">
        <Phone className="h-5 w-5" />
      </a>
      <a href="https://wa.me/917507732111" target="_blank" rel="noreferrer" aria-label="WhatsApp"
        className="grid h-12 w-12 place-items-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:scale-110">
        <MessageCircle className="h-5 w-5" />
      </a>
    </div>
  )
}
