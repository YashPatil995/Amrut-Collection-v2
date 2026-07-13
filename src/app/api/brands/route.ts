import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

async function uniqueSlug(base: string, ignoreId?: string): Promise<string> {
  let slug = base || 'brand'
  let n = 0
  // If the base slug is empty, fallback
  if (!slug) slug = 'brand'
  while (true) {
    const existing = await db.brand.findUnique({ where: { slug } })
    if (!existing || existing.id === ignoreId) return slug
    n += 1
    slug = `${base}-${n}`
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const withCounts = searchParams.get('withCounts') === 'true'

    const brands = await db.brand.findMany({
      orderBy: { name: 'asc' },
      include: withCounts ? { _count: { select: { products: true } } } : undefined,
    })

    const out = brands.map((b: any) => {
      if (withCounts) {
        const { _count, ...rest } = b
        return { ...rest, productCount: _count?.products ?? 0 }
      }
      return b
    })

    return NextResponse.json({ brands: out })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const name = (body.name || '').toString().trim()
    if (!name) return NextResponse.json({ error: 'name is required' }, { status: 400 })

    const country = (body.country || '').toString().trim() || null
    const logo = (body.logo || '').toString().trim() || null
    const slug = await uniqueSlug(body.slug ? slugify(body.slug) : slugify(name))

    const brand = await db.brand.create({
      data: { name, slug, country, logo },
    })
    return NextResponse.json({ brand })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json()
    if (!body.id) return NextResponse.json({ error: 'id is required' }, { status: 400 })

    const data: any = {}
    if (body.name !== undefined) {
      const name = body.name.toString().trim()
      if (!name) return NextResponse.json({ error: 'name cannot be empty' }, { status: 400 })
      data.name = name
      // regenerate slug if name changed (only if slug wasn't explicitly supplied)
      if (body.slug === undefined) {
        data.slug = await uniqueSlug(slugify(name), body.id)
      }
    }
    if (body.slug !== undefined) {
      data.slug = await uniqueSlug(slugify(body.slug), body.id)
    }
    if (body.country !== undefined) {
      data.country = (body.country || '').toString().trim() || null
    }
    if (body.logo !== undefined) {
      data.logo = (body.logo || '').toString().trim() || null
    }

    const brand = await db.brand.update({ where: { id: body.id }, data })
    return NextResponse.json({ brand })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

    // Check for referencing products
    const productCount = await db.product.count({ where: { brandId: id } })
    if (productCount > 0) {
      return NextResponse.json(
        {
          error: `Cannot delete: ${productCount} product(s) reference this brand. Please reassign them to another brand first.`,
          productCount,
        },
        { status: 409 }
      )
    }

    await db.brand.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
