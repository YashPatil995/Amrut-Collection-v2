'use client'

import * as React from 'react'
import {
  Settings,
  Store,
  Bell,
  CreditCard,
  Truck,
  ShieldCheck,
  Palette,
  Globe,
  Save,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { SectionHeader } from './shared'
import { SecurityPanel } from './security-panel'
import { cn } from '@/lib/utils'
import { useStore } from '@/lib/store'
import { User, Mail, Shield } from 'lucide-react'

export function SettingsTab() {
  const adminUser = useStore((s) => s.adminUser)
  const loginAdmin = useStore((s) => s.loginAdmin)
  const [adminName, setAdminName] = React.useState(adminUser?.name || 'Rajesh Patil')
  const [adminEmail, setAdminEmail] = React.useState(adminUser?.email || 'rajesh@amrutcollection.in')
  const [adminRole] = React.useState(adminUser?.role || 'Owner')
  const [adminLocation, setAdminLocation] = React.useState(adminUser?.location || 'Parola, Jalgaon')

  const saveAdminProfile = () => {
    loginAdmin({ name: adminName, role: adminRole, email: adminEmail, location: adminLocation })
    // Persist to localStorage so changes survive logout/login
    try {
      const saved = localStorage.getItem('amrut-admin-profile')
      const profiles = saved ? JSON.parse(saved) : {}
      // Save under the current admin's role key (owner or staff)
      const key = adminRole.toLowerCase()
      profiles[key] = { name: adminName, email: adminEmail, location: adminLocation }
      localStorage.setItem('amrut-admin-profile', JSON.stringify(profiles))
    } catch {}
    toast.success('Admin profile updated', { description: 'Changes saved permanently' })
  }

  const [storeName, setStoreName] = React.useState('Amrut Collection')
  const [tagline, setTagline] = React.useState('Premium Ethnic & Contemporary Wear')
  const [currency, setCurrency] = React.useState('INR')
  const [lowStockThreshold, setLowStockThreshold] = React.useState('25')
  const [freeShipThreshold, setFreeShipThreshold] = React.useState('1499')
  const [flatShipFee, setFlatShipFee] = React.useState('99')

  const [toggles, setToggles] = React.useState({
    emailNotif: true,
    smsNotif: false,
    orderConfirm: true,
    autoApprove: false,
    codEnabled: true,
    upiEnabled: true,
    maintenanceMode: false,
  })

  const flip = (k: keyof typeof toggles) => setToggles((t) => ({ ...t, [k]: !t[k] }))

  const save = () => toast.success('Settings saved', { description: 'Your store configuration has been updated.' })

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Settings"
        subtitle="Store configuration & preferences"
        icon={Settings}
        action={
          <Button onClick={save} className="maroon-gradient text-white hover:opacity-90">
            <Save className="mr-1.5 h-4 w-4" /> Save Changes
          </Button>
        }
      />

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Admin Profile — editable */}
        <Card className="border-maroon/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-serif text-lg text-ink">
              <User className="h-5 w-5 text-maroon" /> Admin Profile
            </CardTitle>
            <CardDescription>Your admin account details (shown in topbar)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="grid h-14 w-14 shrink-0 place-items-center rounded-full maroon-gradient text-xl font-bold text-gold">
                {adminName.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()}
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-ink">{adminName}</p>
                <p className="text-xs text-muted-foreground">{adminRole}</p>
                <Badge className="mt-1 bg-maroon/10 text-maroon hover:bg-maroon/10">{adminRole}</Badge>
              </div>
            </div>
            <div>
              <Label className="text-xs font-medium text-ink">Admin Name</Label>
              <Input value={adminName} onChange={(e) => setAdminName(e.target.value)} className="mt-1" placeholder="Admin name" />
            </div>
            <div>
              <Label className="text-xs font-medium text-ink">Admin Email</Label>
              <div className="relative mt-1">
                <Mail className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} className="pl-8" placeholder="admin@amrutcollection.in" />
              </div>
            </div>
            <div>
              <Label className="text-xs font-medium text-ink">Location (shown in topbar)</Label>
              <Input value={adminLocation} onChange={(e) => setAdminLocation(e.target.value)} className="mt-1" placeholder="Parola, Jalgaon" />
            </div>
            <Button onClick={saveAdminProfile} className="w-full maroon-gradient text-white hover:opacity-90">
              <Save className="mr-1.5 h-4 w-4" /> Save Admin Profile
            </Button>
          </CardContent>
        </Card>

        {/* Store profile */}
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-serif text-lg text-ink">
              <Store className="h-5 w-5 text-maroon" /> Store Profile
            </CardTitle>
            <CardDescription>Basic store information shown across the site</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label className="text-xs font-medium text-ink">Store Name</Label>
              <Input value={storeName} onChange={(e) => setStoreName(e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label className="text-xs font-medium text-ink">Tagline</Label>
              <Input value={tagline} onChange={(e) => setTagline(e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label className="text-xs font-medium text-ink">About / Description</Label>
              <Textarea rows={3} placeholder="Tell customers about your brand…" className="mt-1" defaultValue="Amrut Collection brings handcrafted ethnic and contemporary apparel from the heart of Pune. Three generations of textile mastery." />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs font-medium text-ink">Currency</Label>
                <Select value={currency} onValueChange={setCurrency}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="INR">₹ Indian Rupee</SelectItem>
                    <SelectItem value="USD">$ US Dollar</SelectItem>
                    <SelectItem value="EUR">€ Euro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs font-medium text-ink">Timezone</Label>
                <Select defaultValue="ist">
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ist">IST (India)</SelectItem>
                    <SelectItem value="utc">UTC</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-serif text-lg text-ink">
              <Bell className="h-5 w-5 text-gold-dark" /> Notifications
            </CardTitle>
            <CardDescription>How you want to be alerted</CardDescription>
          </CardHeader>
          <CardContent className="space-y-1">
            <ToggleRow label="Email notifications" desc="Order alerts, low stock, reviews" on={toggles.emailNotif} onToggle={() => flip('emailNotif')} />
            <ToggleRow label="SMS notifications" desc="Critical alerts via SMS" on={toggles.smsNotif} onToggle={() => flip('smsNotif')} />
            <ToggleRow label="Order confirmation" desc="Auto-send confirmation to customers" on={toggles.orderConfirm} onToggle={() => flip('orderConfirm')} />
            <ToggleRow label="Auto-approve reviews" desc="Skip manual review moderation" on={toggles.autoApprove} onToggle={() => flip('autoApprove')} />
            <ToggleRow label="Maintenance mode" desc="Take storefront offline temporarily" on={toggles.maintenanceMode} onToggle={() => flip('maintenanceMode')} danger />
          </CardContent>
        </Card>

        {/* Payments */}
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-serif text-lg text-ink">
              <CreditCard className="h-5 w-5 text-olive" /> Payments & Gateway
            </CardTitle>
            <CardDescription>Payment methods & gateway integration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-1">
            <ToggleRow label="UPI" desc="Google Pay, PhonePe, Paytm" on={toggles.upiEnabled} onToggle={() => flip('upiEnabled')} />
            <ToggleRow label="Cards" desc="Credit / Debit cards" on onToggle={() => toast.info('Toggle')} />
            <ToggleRow label="Cash on Delivery" desc="Pay at doorstep" on={toggles.codEnabled} onToggle={() => flip('codEnabled')} />
            <ToggleRow label="Wallets" desc="Paytm, Amazon Pay" on={false} onToggle={() => toast.info('Toggle')} />
            <div className="mt-3 rounded-lg border border-border bg-muted/30 p-3 space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Payment Gateway (for future integration)</p>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs">Razorpay Key ID</Label>
                  <Input placeholder="rzp_live_..." className="mt-1 text-xs" defaultValue="" />
                </div>
                <div>
                  <Label className="text-xs">Razorpay Key Secret</Label>
                  <Input type="password" placeholder="••••••••" className="mt-1 text-xs" defaultValue="" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs">Cashfree App ID</Label>
                  <Input placeholder="Enter App ID" className="mt-1 text-xs" defaultValue="" />
                </div>
                <div>
                  <Label className="text-xs">Cashfree Secret Key</Label>
                  <Input type="password" placeholder="••••••••" className="mt-1 text-xs" defaultValue="" />
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground">Add your gateway keys here when ready. The system is designed to integrate Razorpay or Cashfree — just add the keys and the checkout will use the gateway instead of manual UPI.</p>
            </div>
            <div className="mt-3 rounded-lg border border-border bg-muted/30 p-3 space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Courier API (for future integration)</p>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs">Delhivery API Token</Label>
                  <Input placeholder="Enter token" className="mt-1 text-xs" defaultValue="" />
                </div>
                <div>
                  <Label className="text-xs">Shiprocket Token</Label>
                  <Input placeholder="Enter token" className="mt-1 text-xs" defaultValue="" />
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground">Add courier API tokens to enable automated shipping label generation and real-time tracking.</p>
            </div>
          </CardContent>
        </Card>

        {/* Shipping */}
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-serif text-lg text-ink">
              <Truck className="h-5 w-5 text-maroon" /> Shipping
            </CardTitle>
            <CardDescription>Shipping rules & thresholds</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs font-medium text-ink">Flat Shipping (₹)</Label>
                <Input type="number" value={flatShipFee} onChange={(e) => setFlatShipFee(e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label className="text-xs font-medium text-ink">Free Ship Above (₹)</Label>
                <Input type="number" value={freeShipThreshold} onChange={(e) => setFreeShipThreshold(e.target.value)} className="mt-1" />
              </div>
            </div>
            <div>
              <Label className="text-xs font-medium text-ink">Low Stock Threshold</Label>
              <Input type="number" value={lowStockThreshold} onChange={(e) => setLowStockThreshold(e.target.value)} className="mt-1" />
              <p className="mt-1 text-[11px] text-muted-foreground">Products below this count trigger restock alerts.</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs font-medium text-ink">Dispatch SLA</Label>
                <Select defaultValue="24h">
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="12h">Within 12 hours</SelectItem>
                    <SelectItem value="24h">Within 24 hours</SelectItem>
                    <SelectItem value="48h">Within 48 hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs font-medium text-ink">Carrier</Label>
                <Select defaultValue="bluedart">
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bluedart">BlueDart</SelectItem>
                    <SelectItem value="delhivery">Delhivery</SelectItem>
                    <SelectItem value="dtdc">DTDC</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Appearance */}
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-serif text-lg text-ink">
              <Palette className="h-5 w-5 text-gold-dark" /> Appearance
            </CardTitle>
            <CardDescription>Brand theme & identity</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs font-medium text-ink">Brand palette</span>
              {[
                { name: 'Maroon', color: '#7c2d3a' },
                { name: 'Gold', color: '#b8893d' },
                { name: 'Olive', color: '#6b7a3c' },
                { name: 'Cream', color: '#f5efe0' },
                { name: 'Ink', color: '#2e2823' },
              ].map((c) => (
                <div key={c.name} className="flex items-center gap-1.5">
                  <span className="h-6 w-6 rounded-full border border-border" style={{ background: c.color }} />
                  <span className="text-xs text-muted-foreground">{c.name}</span>
                </div>
              ))}
            </div>
            <div>
              <Label className="text-xs font-medium text-ink">Heading Font</Label>
              <Select defaultValue="playfair">
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="playfair">Playfair Display (serif)</SelectItem>
                  <SelectItem value="cormorant">Cormorant Garamond</SelectItem>
                  <SelectItem value="inter">Inter (sans)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-3">
              <div>
                <p className="text-sm font-medium text-ink">Dark mode support</p>
                <p className="text-xs text-muted-foreground">Allow customers to switch themes</p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        {/* Security — full panel */}
        <div className="lg:col-span-2">
          <SecurityPanel />
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={save} className="maroon-gradient text-white hover:opacity-90">
          <Save className="mr-1.5 h-4 w-4" /> Save All Changes
        </Button>
      </div>
    </div>
  )
}

function ToggleRow({
  label,
  desc,
  on,
  onToggle,
  danger,
}: {
  label: string
  desc: string
  on: boolean
  onToggle: () => void
  danger?: boolean
}) {
  return (
    <div className="flex items-center justify-between border-b border-border/50 py-2.5 last:border-0">
      <div>
        <p className={cn('text-sm font-medium', danger ? 'text-rose-700' : 'text-ink')}>{label}</p>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
      <Switch checked={on} onCheckedChange={onToggle} />
    </div>
  )
}
