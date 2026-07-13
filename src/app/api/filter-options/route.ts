import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET — list filter options, optionally by type and/or gender
// Pass all=true to include inactive options (admin use)
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type') // color | size | pattern | brand | waist
    const gender = searchParams.get('gender') // men | women | kids | all
    const includeAll = searchParams.get('all') === 'true'

    const where: any = {}
    if (!includeAll) where.active = true
    if (type) where.type = type
    if (gender && gender !== 'all') {
      where.OR = [{ gender }, { gender: 'all' }]
    } else if (includeAll && !gender) {
      // no filter — admin fetches all
    }

    const options = await db.filterOption.findMany({
      where,
      orderBy: [{ order: 'asc' }, { value: 'asc' }],
    })
    return NextResponse.json({ options })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

// POST — create a new filter option
export async function POST(req: Request) {
  try {
    const { type, value, gender } = await req.json()
    if (!type || !value) return NextResponse.json({ error: 'type and value required' }, { status: 400 })
    const option = await db.filterOption.create({
      data: { type, value, gender: gender || 'all', active: true },
    })
    return NextResponse.json({ option })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

// PATCH — update (rename, toggle active, reorder)
export async function PATCH(req: Request) {
  try {
    const { id, value, active, gender, order } = await req.json()
    const data: any = {}
    if (value !== undefined) data.value = value
    if (active !== undefined) data.active = active
    if (gender !== undefined) data.gender = gender
    if (order !== undefined) data.order = order
    const option = await db.filterOption.update({ where: { id }, data })
    return NextResponse.json({ option })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

// DELETE
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })
    await db.filterOption.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
