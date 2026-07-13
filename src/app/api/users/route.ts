import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET — list all users (for admin) or fetch a single user by ?email= / ?phone= / ?id=
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const limit = searchParams.get('limit')
    const email = searchParams.get('email')?.trim() || ''
    const phone = searchParams.get('phone')?.trim() || ''
    const id = searchParams.get('id')?.trim() || ''

    // Single-user lookup
    if (email || phone || id) {
      const u = id
        ? await db.user.findUnique({ where: { id } })
        : email
          ? await db.user.findFirst({ where: { email } })
          : await db.user.findFirst({ where: { phone } })
      if (!u) return NextResponse.json({ user: null })
      return NextResponse.json({
        user: {
          id: u.id,
          name: u.name,
          email: u.email,
          phone: u.phone,
          avatar: u.avatar,
          provider: u.provider,
          loginCount: u.loginCount,
          totalSpent: u.totalSpent,
          ordersCount: u.ordersCount,
          createdAt: u.createdAt,
        },
      })
    }

    const users = await db.user.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit ? parseInt(limit) : undefined,
    })
    // Fetch real order stats for each user by matching email or phone
    const allOrders = await db.order.findMany({
      select: { email: true, phone: true, total: true, status: true }
    })

    const formatted = users.map((u) => {
      // Match orders by email or phone
      const userOrders = allOrders.filter((o) =>
        (u.email && o.email === u.email) ||
        (u.phone && o.phone === u.phone) ||
        (u.phone && o.phone.includes(u.phone)) ||
        (u.email && o.email.includes(u.email))
      )
      const orderCount = userOrders.length
      const totalSpent = userOrders
        .filter((o) => o.status !== 'cancelled')
        .reduce((sum, o) => sum + o.total, 0)

      return {
        id: u.id,
        name: u.name,
        email: u.email,
        phone: u.phone,
        avatar: u.avatar,
        provider: u.provider,
        loginCount: u.loginCount,
        totalSpent: totalSpent,
        ordersCount: orderCount,
        createdAt: u.createdAt,
      }
    })
    return NextResponse.json({ users: formatted, total: users.length })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

// POST — create or update user (for phone/email OTP login)
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, phone, email, provider } = body
    const isPhone = !!phone
    const identifier = isPhone ? phone : email
    if (!identifier) return NextResponse.json({ error: 'phone or email required' }, { status: 400 })

    let user = await db.user.findFirst({ where: isPhone ? { phone } : { email } })
    if (!user) {
      try {
        user = await db.user.create({
          data: {
            name: name || 'Customer',
            phone: phone || null,
            email: email || null,
            avatar: (name || 'C').slice(0, 2).toUpperCase(),
            provider: provider || (isPhone ? 'phone' : 'email'),
          },
        })
      } catch {
        user = await db.user.findFirst({ where: isPhone ? { phone } : { email } })
      }
    } else {
      user = await db.user.update({
        where: { id: user.id },
        data: {
          loginCount: { increment: 1 },
          name: name || user.name,
        },
      })
    }
    return NextResponse.json({
      user: {
        id: user!.id,
        name: user!.name,
        email: user!.email,
        phone: user!.phone,
        avatar: user!.avatar,
        provider: user!.provider,
      },
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
