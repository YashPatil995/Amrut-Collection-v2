'use client'

import * as React from 'react'
import {
  LayoutDashboard,
  TrendingUp,
  Package,
  ShoppingCart,
  Users,
  Megaphone,
  Star,
  Settings,
  Crown,
  X,
  LayoutGrid,
  Tag,
  Shapes,
  SlidersHorizontal,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'

export type AdminTab =
  | 'overview'
  | 'analytics'
  | 'products'
  | 'categories'
  | 'brands'
  | 'patterns'
  | 'filters'
  | 'orders'
  | 'customers'
  | 'marketing'
  | 'reviews'
  | 'settings'

interface NavItem {
  id: AdminTab
  label: string
  icon: React.ComponentType<{ className?: string }>
  hint?: string
}

export const NAV_ITEMS: NavItem[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard, hint: 'KPIs & live feed' },
  { id: 'analytics', label: 'Analytics', icon: TrendingUp, hint: 'Revenue & trends' },
  { id: 'products', label: 'Products', icon: Package, hint: 'Catalog management' },
  { id: 'categories', label: 'Categories', icon: LayoutGrid, hint: 'Categories & images' },
  { id: 'brands', label: 'Brands', icon: Tag, hint: 'Brand catalog' },
  { id: 'patterns', label: 'Patterns', icon: Shapes, hint: 'Product patterns' },
  { id: 'filters', label: 'Filters', icon: SlidersHorizontal, hint: 'Colors, sizes & patterns' },
  { id: 'orders', label: 'Orders', icon: ShoppingCart, hint: 'Fulfilment queue' },
  { id: 'customers', label: 'Customers', icon: Users, hint: 'Top buyers' },
  { id: 'marketing', label: 'Marketing', icon: Megaphone, hint: 'Coupons & banners' },
  { id: 'reviews', label: 'Reviews', icon: Star, hint: 'Moderation' },
  { id: 'settings', label: 'Settings', icon: Settings, hint: 'Store config' },
]

interface SidebarProps {
  active: AdminTab
  onSelect: (id: AdminTab) => void
}

export function AdminSidebarContent({ active, onSelect }: SidebarProps) {
  return (
    <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-4 scrollbar-thin">
      <div className="px-3 pb-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Control Center
        </p>
      </div>
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon
        const isActive = active === item.id
        return (
          <button
            key={item.id}
            onClick={() => onSelect(item.id)}
            className={cn(
              'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-all',
              isActive
                ? 'maroon-gradient text-white shadow-md shadow-maroon/20'
                : 'text-foreground/80 hover:bg-accent hover:text-maroon'
            )}
          >
            <span
              className={cn(
                'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors',
                isActive ? 'bg-white/15 text-gold' : 'bg-muted text-maroon group-hover:bg-maroon group-hover:text-white'
              )}
            >
              <Icon className="h-4 w-4" />
            </span>
            <span className="flex flex-1 flex-col">
              <span className="leading-tight">{item.label}</span>
              {item.hint && (
                <span className={cn('text-[10px] font-normal', isActive ? 'text-white/70' : 'text-muted-foreground')}>
                  {item.hint}
                </span>
              )}
            </span>
          </button>
        )
      })}

      <div className="mt-4 rounded-xl border border-gold/30 bg-gradient-to-br from-cream to-beige/40 p-4">
        <div className="flex items-center gap-2">
          <Crown className="h-4 w-4 text-gold-dark" />
          <p className="font-serif text-sm font-semibold text-maroon">Owner Plan</p>
        </div>
        <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
          Full access to all admin modules, analytics, and store configuration.
        </p>
      </div>
    </nav>
  )
}

export function AdminSidebar({ active, onSelect }: SidebarProps) {
  return (
    <aside className="hidden w-[260px] shrink-0 flex-col border-r border-border bg-sidebar lg:flex">
      <AdminSidebarContent active={active} onSelect={onSelect} />
    </aside>
  )
}

export function AdminMobileDrawer({
  open,
  onOpenChange,
  active,
  onSelect,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  active: AdminTab
  onSelect: (id: AdminTab) => void
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-[280px] border-border bg-sidebar p-0">
        <SheetHeader className="flex-row items-center justify-between border-b border-border px-4 py-3">
          <SheetTitle className="font-serif text-lg text-maroon">Navigation</SheetTitle>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onOpenChange(false)}>
            <X className="h-4 w-4" />
          </Button>
        </SheetHeader>
        <AdminSidebarContent
          active={active}
          onSelect={(id) => {
            onSelect(id)
            onOpenChange(false)
          }}
        />
      </SheetContent>
    </Sheet>
  )
}
