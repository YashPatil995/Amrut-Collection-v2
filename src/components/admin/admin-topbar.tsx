'use client'

import * as React from 'react'
import { Menu, Store, Bell, Search, ChevronDown, LogOut, Settings, User, ShieldCheck, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useStore } from '@/lib/store'
import { NAV_ITEMS, type AdminTab } from './admin-sidebar'
import { cn } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function AdminTopbar({
  active,
  onOpenDrawer,
  onNavigate,
}: {
  active: AdminTab
  onOpenDrawer: () => void
  onNavigate?: (tab: AdminTab) => void
}) {
  const navigate = useStore((s) => s.navigate)
  const adminUser = useStore((s) => s.adminUser)
  const logoutAdmin = useStore((s) => s.logoutAdmin)
  const current = NAV_ITEMS.find((n) => n.id === active)

  const initials = adminUser?.name?.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase() || 'RP'

  const handleLogout = () => {
    logoutAdmin()
    navigate({ name: 'home' })
  }

  // notifications
  const notifications = [
    { id: 1, title: 'New order received', desc: 'AMR2026076969 · ₹1,599', time: '2m ago', unread: true },
    { id: 2, title: 'Low stock alert', desc: 'Banarasi Silk Saree — 12 left', time: '1h ago', unread: true },
    { id: 3, title: 'New review pending', desc: '5★ on Lehenga Choli', time: '3h ago', unread: true },
    { id: 4, title: 'Payment settled', desc: '₹45,200 to your bank', time: '1d ago', unread: false },
  ]
  const unreadCount = notifications.filter((n) => n.unread).length

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="flex h-16 items-center gap-3 px-4 md:px-6">
        <Button variant="ghost" size="icon" className="lg:hidden" onClick={onOpenDrawer} aria-label="Open menu">
          <Menu className="h-5 w-5" />
        </Button>

        <div className="flex items-center gap-2.5">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-lg maroon-gradient text-gold shadow-sm">
            <span className="font-serif text-lg font-bold">A</span>
            <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-background bg-gold" />
          </div>
          <div className="hidden flex-col leading-tight sm:flex">
            <span className="font-serif text-base font-bold text-maroon">Amrut Collection</span>
            <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Admin Console
            </span>
          </div>
        </div>

        <div className="ml-2 hidden items-center gap-2 rounded-full bg-muted/60 px-3 py-1.5 text-xs font-medium text-muted-foreground md:flex">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
          {current?.label || 'Overview'}
        </div>

        <div className="ml-auto flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate({ name: 'home' })}
            className="hidden border-maroon/30 text-maroon hover:bg-maroon hover:text-white sm:inline-flex"
          >
            <Store className="mr-1.5 h-4 w-4" />
            Back to Store
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => navigate({ name: 'home' })}
            aria-label="Back to store"
          >
            <Store className="h-5 w-5" />
          </Button>

          {/* Notifications dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && <span className="absolute right-1.5 top-1.5 grid h-4 w-4 place-items-center rounded-full bg-maroon text-[8px] font-bold text-white">{unreadCount}</span>}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel className="flex items-center justify-between">
                <span>Notifications</span>
                {unreadCount > 0 && <span className="text-[10px] font-medium text-maroon">{unreadCount} new</span>}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {notifications.map((n) => (
                <DropdownMenuItem key={n.id} className="flex flex-col items-start gap-0.5 py-2.5">
                  <div className="flex w-full items-start gap-2">
                    {n.unread && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-maroon" />}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-ink">{n.title}</p>
                      <p className="text-xs text-muted-foreground">{n.desc}</p>
                      <p className="mt-0.5 text-[10px] text-muted-foreground">{n.time}</p>
                    </div>
                  </div>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem className="justify-center text-sm text-maroon">
                View all notifications
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Profile dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 rounded-full border border-border bg-card pl-1 pr-3 py-1 transition-colors hover:border-gold cursor-pointer">
                <Avatar className="h-7 w-7 border border-gold/40">
                  <AvatarFallback className="maroon-gradient text-[11px] font-bold text-gold">{initials}</AvatarFallback>
                </Avatar>
                <div className="hidden flex-col leading-tight sm:flex">
                  <span className="text-xs font-semibold text-ink">{adminUser?.name || 'Rajesh Patil'}</span>
                  <span className="text-[10px] text-muted-foreground">{adminUser?.role || 'Owner'} · {adminUser?.location || 'Parola, Jalgaon'}</span>
                </div>
                <ChevronDown className="hidden h-3.5 w-3.5 text-muted-foreground sm:block" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-ink">{adminUser?.name || 'Rajesh Patil'}</span>
                  <span className="text-xs font-normal text-muted-foreground">{adminUser?.email || 'rajesh@amrutcollection.in'}</span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => onNavigate?.('customers')}>
                <User className="h-4 w-4 text-muted-foreground" /> My Profile
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => navigate({ name: 'home' })}>
                <Store className="h-4 w-4 text-muted-foreground" /> View Storefront
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => onNavigate?.('settings')}>
                <Settings className="h-4 w-4 text-muted-foreground" /> Settings
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => onNavigate?.('settings')}>
                <ShieldCheck className="h-4 w-4 text-muted-foreground" /> Security
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="gap-2 cursor-pointer text-destructive focus:text-destructive" onClick={handleLogout}>
                <LogOut className="h-4 w-4" /> Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Search strip */}
      <div className="hidden items-center gap-2 border-t border-border/60 bg-muted/30 px-6 py-2 md:flex">
        <Search className="h-4 w-4 text-muted-foreground" />
        <input
          placeholder="Search orders, products, customers…"
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
        <kbd className="rounded border border-border bg-background px-1.5 py-0.5 text-[10px] text-muted-foreground">
          ⌘K
        </kbd>
      </div>
    </header>
  )
}
