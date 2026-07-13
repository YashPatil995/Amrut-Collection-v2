'use client'

import { useEffect } from 'react'
import { useStore } from '@/lib/store'

/**
 * Syncs NextAuth sessions (Google OAuth) with the Zustand customer store.
 * On mount, checks /api/auth/session — if a session exists, logs the user in.
 * Also bootstraps guest cart/wishlist from localStorage so refresh doesn't lose data.
 * Checks URL for ?checkout=1 (Google OAuth redirect with pending checkout).
 */
export function SessionSync() {
  const customer = useStore((s) => s.customer)
  const loginCustomer = useStore((s) => s.loginCustomer)
  const navigate = useStore((s) => s.navigate)
  const setPendingCheckout = useStore((s) => s.setPendingCheckout)
  const initGuestData = useStore((s) => s.initGuestData)

  useEffect(() => {
    // Bootstrap guest cart/wishlist from localStorage (no-op if logged in)
    initGuestData()

    let active = true
    fetch('/api/auth/session')
      .then((r) => r.json())
      .then(async (session) => {
        if (!active) return
        if (session?.user && !customer) {
          // Look up the user's DB id by email so we can fully sync cart/wishlist
          let id: string | undefined
          let phone = ''
          if (session.user.email) {
            try {
              const r2 = await fetch(`/api/users?email=${encodeURIComponent(session.user.email)}`)
              if (r2.ok) {
                const data = await r2.json()
                id = data?.user?.id
                phone = data?.user?.phone || ''
              }
            } catch {}
          }
          loginCustomer({
            id,
            name: session.user.name || 'Google User',
            email: session.user.email || '',
            phone,
            avatar: (session.user.name || 'G').slice(0, 2).toUpperCase(),
          })
          // Check for pending checkout redirect
          const params = new URLSearchParams(window.location.search)
          if (params.get('checkout') === '1') {
            setPendingCheckout(false)
            setTimeout(() => navigate({ name: 'checkout' }), 500)
          }
        }
      })
      .catch(() => {})
    return () => { active = false }
  }, [])

  return null
}
