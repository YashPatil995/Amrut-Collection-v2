import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/user/data?email=xxx | ?phone=xxx | ?userId=xxx
// Returns ALL user-specific data: cart, wishlist, addresses, orders, totalSpent, orderCount
//
// Order matching rules:
//   - Authenticated users (userId provided) → match ONLY by customerId (their orders)
//   - Unauthenticated fallback (email/phone only, no userId) → match by email OR phone
//     (legacy path so guest checkout orders can still be looked up by contact info)
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const email = searchParams.get('email')?.trim() || ''
    const phone = searchParams.get('phone')?.trim() || ''
    const userId = searchParams.get('userId')?.trim() || ''

    // Find the user by id, email, or phone
    let user: any = null
    if (userId) {
      user = await db.user.findUnique({ where: { id: userId } })
    } else if (email) {
      user = await db.user.findFirst({ where: { email } })
    } else if (phone) {
      user = await db.user.findFirst({ where: { phone } })
    }

    const uid = user?.id
    const userEmail = user?.email || email || ''
    const userPhone = user?.phone || phone || ''

    // Build order match — authenticated users match ONLY by customerId.
    // For the legacy unauthenticated path (no uid, just email/phone), fall back to email/phone match.
    let orderWhere: any = {}
    if (uid) {
      orderWhere = { customerId: uid }
    } else if (userEmail || userPhone) {
      const or: any[] = []
      if (userEmail) or.push({ email: userEmail })
      if (userPhone) or.push({ phone: userPhone })
      orderWhere = or.length ? { OR: or } : {}
    }

    const hasOrderMatch = uid || orderWhere.OR?.length

    // Run all queries in parallel
    const [cart, wishlistRows, addresses, orders] = await Promise.all([
      uid
        ? db.userCart.findMany({ where: { userId: uid }, orderBy: { createdAt: 'desc' } })
        : Promise.resolve([]),
      uid
        ? db.userWishlist.findMany({ where: { userId: uid }, orderBy: { createdAt: 'desc' } })
        : Promise.resolve([]),
      uid ? db.address.findMany({ where: { userId: uid }, orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }] }) : Promise.resolve([]),
      hasOrderMatch
        ? db.order.findMany({ where: orderWhere, orderBy: { createdAt: 'desc' }, include: { items: true }, take: 100 })
        : Promise.resolve([]),
    ])

    // Compute totals
    const validOrders = orders.filter((o: any) => o.status !== 'cancelled')
    const totalSpent = validOrders.reduce((sum: number, o: any) => sum + (o.total || 0), 0)
    const orderCount = orders.length

    // Hydrate wishlist with product data
    const productIds = wishlistRows.map((w: any) => w.productId).filter(Boolean)
    const products = productIds.length
      ? await db.product.findMany({ where: { id: { in: productIds } }, select: { id: true, name: true, slug: true, images: true, price: true, mrp: true } })
      : []
    const productMap = new Map(products.map((p: any) => [p.id, p]))

    // Wishlist items in client shape
    const wishlistItems = wishlistRows.map((w: any) => {
      const p: any = productMap.get(w.productId) || {}
      const imgs = (() => { try { return JSON.parse(p.images || '[]') } catch { return [] } })()
      return {
        productId: w.productId,
        slug: p.slug || '',
        name: p.name || '',
        image: imgs[0] || '',
        price: p.price || 0,
        mrp: p.mrp || 0,
      }
    })

    // Cart items in client shape
    const cartItems = cart.map((c: any) => ({
      productId: c.productId,
      slug: '',
      name: c.name,
      image: c.image,
      price: c.price,
      mrp: c.mrp,
      qty: c.qty,
      color: c.color,
      size: c.size,
    }))

    return NextResponse.json({
      cart: cartItems,
      wishlist: wishlistItems,
      addresses,
      orders,
      totalSpent,
      orderCount,
      user: user
        ? {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            avatar: user.avatar,
            provider: user.provider,
          }
        : null,
    })
  } catch (e: any) {
    console.error('GET /api/user/data error', e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
