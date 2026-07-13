'use client'

import { useStore } from '@/lib/store'
import { Header } from '@/components/store/header'
import { Footer } from '@/components/store/footer'
import { HomeView } from '@/components/store/home-view'
import { ShopView } from '@/components/store/shop-view'
import { ProductDetailView } from '@/components/store/product-detail-view'
import { CartView, WishlistView, CheckoutView, OrderSuccessView, TrackOrderView, AboutView, ContactView } from '@/components/store/cart-views'
import { AccountView } from '@/components/store/account-view'
import { MyOrdersView } from '@/components/store/my-orders-view'
import { PolicyView } from '@/components/store/policy-views'
import { AdminDashboard } from '@/components/admin/admin-dashboard'
import { AdminLoginView } from '@/components/admin/admin-login-view'
import { AnimatePresence, motion } from 'framer-motion'

export default function Home() {
  const view = useStore((s) => s.view)
  const adminAuthed = useStore((s) => s.adminAuthed)
  const isAdminPage = view.name === 'admin'
  const isAdminLogin = view.name === 'admin-login'
  const hideChrome = isAdminPage || isAdminLogin

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {!hideChrome && <Header />}
      <main className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={view.name + ('slug' in view ? view.slug : '') + ('orderNo' in view ? view.orderNo : '') + ('gender' in view ? view.gender : '') + ('category' in view ? view.category : '') + ('section' in view ? view.section : '') + ('q' in view ? view.q : '')}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            {renderView(view, adminAuthed)}
          </motion.div>
        </AnimatePresence>
      </main>
      {!hideChrome && <Footer />}
    </div>
  )
}

function renderView(view: any, adminAuthed: boolean) {
  switch (view.name) {
    case 'home': return <HomeView />
    case 'shop': return <ShopView />
    case 'product': return <ProductDetailView />
    case 'cart': return <CartView />
    case 'wishlist': return <WishlistView />
    case 'checkout': return <CheckoutView />
    case 'order-success': return <OrderSuccessView />
    case 'track-order': return <TrackOrderView />
    case 'about': return <AboutView />
    case 'contact': return <ContactView />
    case 'shipping-policy': return <PolicyView type="shipping" />
    case 'returns-policy': return <PolicyView type="returns" />
    case 'privacy-policy': return <PolicyView type="privacy" />
    case 'account': return <AccountView />
    case 'my-orders': return <MyOrdersView />
    case 'admin-login': return <AdminLoginView />
    case 'admin': return adminAuthed ? <AdminDashboard /> : <AdminLoginView />
    default: return <HomeView />
  }
}
