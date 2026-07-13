'use client'

import * as React from 'react'
import { AdminSidebar, AdminMobileDrawer, type AdminTab, NAV_ITEMS } from './admin-sidebar'
import { AdminTopbar } from './admin-topbar'
import { Overview } from './overview'
import { Analytics } from './analytics'
import { ProductsTable } from './products-table'
import { CategoriesManager } from './categories-manager'
import { BrandsManager } from './brands-manager'
import { PatternsManager } from './patterns-manager'
import { FilterManager } from './filter-manager'
import { OrdersTable } from './orders-table'
import { Customers } from './customers'
import { Reviews } from './reviews'
import { Marketing } from './marketing'
import { SettingsTab } from './settings'
import { motion, AnimatePresence } from 'framer-motion'

export function AdminDashboard() {
  const [active, setActive] = React.useState<AdminTab>('overview')
  const [drawerOpen, setDrawerOpen] = React.useState(false)

  const handleSelect = (id: AdminTab) => {
    setActive(id)
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="flex min-h-screen bg-ivory">
      <AdminSidebar active={active} onSelect={handleSelect} />
      <AdminMobileDrawer open={drawerOpen} onOpenChange={setDrawerOpen} active={active} onSelect={handleSelect} />

      <div className="flex min-w-0 flex-1 flex-col">
        <AdminTopbar active={active} onOpenDrawer={() => setDrawerOpen(true)} onNavigate={handleSelect} />

        <main className="flex-1 px-4 py-6 md:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-[1400px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                {active === 'overview' && <Overview />}
                {active === 'analytics' && <Analytics />}
                {active === 'products' && <ProductsTable />}
                {active === 'categories' && <CategoriesManager />}
                {active === 'brands' && <BrandsManager />}
                {active === 'patterns' && <PatternsManager />}
                {active === 'filters' && <FilterManager />}
                {active === 'orders' && <OrdersTable />}
                {active === 'customers' && <Customers />}
                {active === 'marketing' && <Marketing />}
                {active === 'reviews' && <Reviews />}
                {active === 'settings' && <SettingsTab />}
              </motion.div>
            </AnimatePresence>
          </div>

          <footer className="mx-auto mt-10 w-full max-w-[1400px] border-t border-border/60 pt-4 text-center text-xs text-muted-foreground">
            <p>
              <span className="font-serif font-semibold text-maroon">Amrut Collection</span> · Admin Console ·
              Built with Next.js · {' '}
              <span className="text-gold-dark">Owner · Rajesh Patil</span>
            </p>
            <p className="mt-1">© {new Date().getFullYear()} Amrut Collection. All rights reserved.</p>
          </footer>
        </main>
      </div>
    </div>
  )
}

export { NAV_ITEMS, type AdminTab }
export default AdminDashboard
