import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// POST /api/user/wishlist
// Body: { userId: string, wishlist: WishlistItem[] }
// Replaces all existing wishlist entries for the user with the new set.
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const userId: string = body.userId
    const wishlist: any[] = Array.isArray(body.wishlist) ? body.wishlist : []

    if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 })

    // Verify user exists
    const user = await db.user.findUnique({ where: { id: userId } })
    if (!user) return NextResponse.json({ error: 'user not found' }, { status: 404 })

    // Replace wishlist atomically
    await db.userWishlist.deleteMany({ where: { userId } })

    if (wishlist.length > 0) {
      // Use upsert loop to honour the @@unique([userId, productId]) constraint
      await Promise.all(
        wishlist.map((w) =>
          db.userWishlist.upsert({
            where: { userId_productId: { userId, productId: w.productId } },
            update: {},
            create: { userId, productId: w.productId },
          })
        )
      )
    }

    return NextResponse.json({ ok: true, count: wishlist.length })
  } catch (e: any) {
    console.error('POST /api/user/wishlist error', e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
