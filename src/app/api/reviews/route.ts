import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const productId = searchParams.get('productId')
    const status = searchParams.get('status') // admin can filter by pending|approved|rejected
    const where: any = {}
    if (productId) where.productId = productId
    // Public requests (no status filter) only see approved reviews.
    // Admin requests pass an explicit status (e.g. pending|all).
    if (status && status !== 'all') where.status = status
    else if (!status) where.status = 'approved'

    const reviews = await db.review.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { product: { select: { name: true, slug: true } } },
      take: productId ? undefined : 200,
    })
    return NextResponse.json({ reviews })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const review = await db.review.create({
      data: {
        productId: body.productId,
        userName: body.userName,
        userAvatar: body.userAvatar || body.userName.slice(0, 2).toUpperCase(),
        rating: parseFloat(body.rating),
        title: body.title,
        body: body.body,
        verified: true,
        status: 'approved',
      },
    })
    // update product rating & reviewCount
    const all = await db.review.findMany({ where: { productId: body.productId, status: 'approved' } })
    const avg = all.reduce((s, r) => s + r.rating, 0) / all.length
    await db.product.update({
      where: { id: body.productId },
      data: { rating: Math.round(avg * 10) / 10, reviewCount: all.length },
    })
    return NextResponse.json({ review })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

// PATCH /api/reviews  body: { id, status }  — updates a review's status (approve/reject)
export async function PATCH(req: Request) {
  try {
    const body = await req.json()
    const { id, status } = body as { id: string; status: string }
    if (!id || !status) {
      return NextResponse.json({ error: 'id and status are required' }, { status: 400 })
    }
    const existing = await db.review.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ error: 'Review not found' }, { status: 404 })
    const updated = await db.review.update({
      where: { id },
      data: { status },
    })
    // Recompute product rating/reviewCount after a status change
    const all = await db.review.findMany({ where: { productId: existing.productId, status: 'approved' } })
    const avg = all.length > 0 ? all.reduce((s, r) => s + r.rating, 0) / all.length : 0
    await db.product.update({
      where: { id: existing.productId },
      data: { rating: Math.round(avg * 10) / 10, reviewCount: all.length },
    })
    return NextResponse.json({ review: updated })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

// DELETE /api/reviews?id=xxx  — deletes a review
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'id query param is required' }, { status: 400 })
    const existing = await db.review.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ error: 'Review not found' }, { status: 404 })
    await db.review.delete({ where: { id } })
    // Recompute product rating/reviewCount
    const all = await db.review.findMany({ where: { productId: existing.productId, status: 'approved' } })
    const avg = all.length > 0 ? all.reduce((s, r) => s + r.rating, 0) / all.length : 0
    await db.product.update({
      where: { id: existing.productId },
      data: { rating: Math.round(avg * 10) / 10, reviewCount: all.length },
    })
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
