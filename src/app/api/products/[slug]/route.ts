import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

function parseProduct(p: any) {
  return {
    ...p,
    colors: JSON.parse(p.colors || '[]'),
    colorImages: JSON.parse(p.colorImages || '[]'),
    sizes: JSON.parse(p.sizes || '[]'),
    patterns: JSON.parse(p.patterns || '[]'),
    images: JSON.parse(p.images || '[]'),
    tags: JSON.parse(p.tags || '[]'),
  }
}

export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params
    const product = await db.product.findUnique({
      where: { slug },
      include: { brand: true, category: true, reviews: { where: { status: 'approved' }, orderBy: { helpful: 'desc' } } },
    })
    if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    // similar products: same category, exclude self
    const similar = await db.product.findMany({
      where: { categoryId: product.categoryId, id: { not: product.id } },
      take: 8,
      orderBy: { sold: 'desc' },
      include: { brand: true },
    })

    return NextResponse.json({ product: parseProduct(product), similar: similar.map(parseProduct) })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params
    const body = await req.json()
    const data: any = { ...body }
    if (body.price && body.mrp) data.discount = Math.round(((body.mrp - body.price) / body.mrp) * 100)
    if (body.colors) data.colors = JSON.stringify(body.colors)
    if (body.colorImages !== undefined) data.colorImages = JSON.stringify(body.colorImages)
    if (body.sizes) data.sizes = JSON.stringify(body.sizes)
    if (body.patterns) data.patterns = JSON.stringify(body.patterns)
    if (body.images) data.images = JSON.stringify(body.images)
    if (body.tags) data.tags = JSON.stringify(body.tags)
    delete data.id
    delete data.brand
    delete data.category
    delete data.reviews
    const p = await db.product.update({ where: { slug }, data })
    return NextResponse.json({ product: parseProduct(p) })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params
    const product = await db.product.findUnique({ where: { slug }, select: { id: true } })
    if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    // Delete all related records first to avoid foreign key constraint errors
    // (also handled by onDelete: Cascade in schema, but kept for safety on existing DBs)
    await db.review.deleteMany({ where: { productId: product.id } })
    await db.wishlistItem.deleteMany({ where: { productId: product.id } })
    await db.userWishlist.deleteMany({ where: { productId: product.id } })
    await db.orderItem.deleteMany({ where: { productId: product.id } })

    await db.product.delete({ where: { id: product.id } })
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
