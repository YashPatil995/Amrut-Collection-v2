import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

function parseProduct(p: any) {
  return {
    ...p,
    colors: JSON.parse(p.colors || '[]'),
    sizes: JSON.parse(p.sizes || '[]'),
    patterns: JSON.parse(p.patterns || '[]'),
    images: JSON.parse(p.images || '[]'),
    tags: JSON.parse(p.tags || '[]'),
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const q = searchParams.get('q') || ''
    const gender = searchParams.get('gender')
    const category = searchParams.get('category')
    const section = searchParams.get('section')
    const sort = searchParams.get('sort') || 'popular'
    const limit = searchParams.get('limit')
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const discountOnly = searchParams.get('discountOnly') === 'true'
    // Support multiple values for color/size/pattern/brand
    const colors = searchParams.getAll('color')
    const sizes = searchParams.getAll('size')
    const patterns = searchParams.getAll('pattern')
    const brandSlugs = searchParams.getAll('brand')

    const where: any = {}
    if (gender && gender !== 'all') where.gender = gender
    // Note: q (search) is handled after fetch — SQLite contains is case-sensitive
    // so we filter in JavaScript for case-insensitive matching
    // Category filter (top-level includes children)
    if (category && category !== 'all') {
      const cat = await db.category.findUnique({ where: { slug: category } })
      if (cat) {
        if (cat.parentId === null) {
          const subs = await db.category.findMany({ where: { parentId: cat.id } })
          where.categoryId = { in: [cat.id, ...subs.map((s) => s.id)] }
        } else {
          where.categoryId = cat.id
        }
      }
    }
    // Brand filter (by slug)
    if (brandSlugs.length > 0) {
      const brands = await db.brand.findMany({ where: { slug: { in: brandSlugs } } })
      if (brands.length > 0) where.brandId = { in: brands.map((b) => b.id) }
    }
    // Price filter
    if (minPrice || maxPrice) {
      where.price = {}
      if (minPrice) where.price.gte = parseFloat(minPrice)
      if (maxPrice) where.price.lte = parseFloat(maxPrice)
    }
    // Discount filter
    if (discountOnly || section === 'sale') where.discount = { gt: 0 }
    // Section filters
    if (section === 'trending') where.isTrending = true
    if (section === 'new') where.isNew = true
    if (section === 'bestseller') where.isBestseller = true
    if (section === 'featured') where.isFeatured = true
    // Color filter (JSON string contains)
    if (colors.length > 0) {
      where.AND = colors.map((c) => ({ colors: { contains: `"${c}"` } }))
    }
    // Size filter
    if (sizes.length > 0) {
      where.AND = [...(where.AND || []), ...sizes.map((s) => ({ sizes: { contains: `"${s}"` } }))]
    }
    // Pattern filter
    if (patterns.length > 0) {
      where.AND = [...(where.AND || []), ...patterns.map((p) => ({ patterns: { contains: `"${p}"` } }))]
    }

    let orderBy: any = { sold: 'desc' }
    if (sort === 'newest') orderBy = { createdAt: 'desc' }
    else if (sort === 'price-low') orderBy = { price: 'asc' }
    else if (sort === 'price-high') orderBy = { price: 'desc' }
    else if (sort === 'rating') orderBy = { rating: 'desc' }
    else if (sort === 'discount') orderBy = { discount: 'desc' }

    const products = await db.product.findMany({
      where,
      orderBy,
      include: { brand: true, category: true },
      ...(limit ? { take: parseInt(limit) } : {}),
    })

    // Case-insensitive search filtering (SQLite contains is case-sensitive)
    let filtered = products
    if (q) {
      const ql = q.toLowerCase()
      filtered = products.filter((p) =>
        p.name.toLowerCase().includes(ql) ||
        p.description.toLowerCase().includes(ql) ||
        p.fabric.toLowerCase().includes(ql) ||
        p.material.toLowerCase().includes(ql) ||
        p.sku.toLowerCase().includes(ql) ||
        p.tags.toLowerCase().includes(ql) ||
        (p.brand?.name || '').toLowerCase().includes(ql) ||
        (p.category?.name || '').toLowerCase().includes(ql)
      )
    }

    return NextResponse.json({ products: filtered.map(parseProduct), total: filtered.length })
  } catch (e: any) {
    console.error('GET /api/products error', e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const slug = body.slug || body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Math.random().toString(36).slice(2, 6)
    const sku = body.sku || 'AMR' + Date.now().toString().slice(-6)
    const barcode = body.barcode || '890' + Math.floor(1000000000 + Math.random() * 8999999999).toString()
    const price = Number(body.price)
    const mrp = Number(body.mrp)
    const discount = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0
    const product = await db.product.create({
      data: {
        name: body.name,
        slug,
        description: body.description || '',
        fabric: body.fabric || 'Premium',
        material: body.material || body.fabric || 'Premium',
        washCare: body.washCare || 'Hand wash cold, do not bleach',
        sku,
        barcode,
        price,
        mrp,
        discount,
        stock: Number(body.stock) || 0,
        deliveryCharge: Number(body.deliveryCharge) || 0,
        rating: 0,
        reviewCount: 0,
        sold: 0,
        colors: JSON.stringify(body.colors || []),
        colorImages: JSON.stringify(body.colorImages || []),
        sizes: JSON.stringify(body.sizes || []),
        patterns: JSON.stringify(body.patterns || []),
        images: JSON.stringify(body.images || []),
        tags: JSON.stringify(body.tags || []),
        gender: body.gender || 'all',
        isTrending: !!body.isTrending,
        isNew: !!body.isNew,
        isBestseller: !!body.isBestseller,
        isFeatured: !!body.isFeatured,
        categoryId: body.categoryId,
        brandId: body.brandId,
      },
    })
    return NextResponse.json({ product: parseProduct(product) })
  } catch (e: any) {
    console.error('POST /api/products error', e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
