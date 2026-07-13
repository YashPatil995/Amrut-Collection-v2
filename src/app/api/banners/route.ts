import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const all = searchParams.get('all') === 'true'
    const banners = await db.banner.findMany(
      all ? { orderBy: { order: 'asc' } } : { where: { active: true }, orderBy: { order: 'asc' } }
    )
    return NextResponse.json({ banners })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const count = await db.banner.count()
    const banner = await db.banner.create({
      data: {
        title: body.title,
        subtitle: body.subtitle || '',
        image: body.image,
        ctaText: body.ctaText || 'Shop Now',
        ctaLink: body.ctaLink || '',
        position: body.position || 'hero',
        order: body.order ?? count,
        active: body.active !== false,
      },
    })
    return NextResponse.json({ banner })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json()
    const data: any = {}
    if (body.active !== undefined) data.active = body.active
    if (body.title !== undefined) data.title = body.title
    if (body.subtitle !== undefined) data.subtitle = body.subtitle
    if (body.image !== undefined) data.image = body.image
    if (body.ctaText !== undefined) data.ctaText = body.ctaText
    if (body.ctaLink !== undefined) data.ctaLink = body.ctaLink
    if (body.order !== undefined) data.order = body.order
    const banner = await db.banner.update({ where: { id: body.id }, data })
    return NextResponse.json({ banner })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })
    await db.banner.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
