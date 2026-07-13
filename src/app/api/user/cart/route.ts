import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// POST /api/user/cart
// Body: { userId: string, cart: CartItem[] }
// Replaces all existing cart entries for the user with the new set.
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const userId: string = body.userId
    const cart: any[] = Array.isArray(body.cart) ? body.cart : []

    if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 })

    // Verify user exists
    const user = await db.user.findUnique({ where: { id: userId } })
    if (!user) return NextResponse.json({ error: 'user not found' }, { status: 404 })

    // Replace cart atomically — delete all existing rows then insert new ones
    await db.userCart.deleteMany({ where: { userId } })

    if (cart.length > 0) {
      await db.userCart.createMany({
        data: cart.map((c) => ({
          userId,
          productId: c.productId || '',
          name: c.name || '',
          image: c.image || '',
          price: Number(c.price) || 0,
          mrp: Number(c.mrp) || 0,
          qty: Number(c.qty) || 1,
          color: c.color || '',
          size: c.size || '',
        })),
      })
    }

    return NextResponse.json({ ok: true, count: cart.length })
  } catch (e: any) {
    console.error('POST /api/user/cart error', e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
