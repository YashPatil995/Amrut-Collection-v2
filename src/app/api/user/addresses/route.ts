import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/user/addresses?userId=xxx → returns addresses for user
// POST /api/user/addresses → { userId, address } creates address, sets isDefault if first
// PATCH /api/user/addresses → { id, userId, isDefault? } updates an address (sets default, unsets others)
// DELETE /api/user/addresses?id=xxx → deletes address
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId')?.trim() || ''
    if (!userId) return NextResponse.json({ addresses: [] })
    const addresses = await db.address.findMany({
      where: { userId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    })
    return NextResponse.json({ addresses })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const userId: string = body.userId
    const a: any = body.address || {}
    if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 })

    const user = await db.user.findUnique({ where: { id: userId } })
    if (!user) return NextResponse.json({ error: 'user not found' }, { status: 404 })

    const existingCount = await db.address.count({ where: { userId } })

    const created = await db.address.create({
      data: {
        userId,
        label: a.label || 'Home',
        name: a.name || user.name,
        phone: a.phone || user.phone || '',
        address: a.address || '',
        city: a.city || '',
        pincode: a.pincode || '',
        state: a.state || 'Maharashtra',
        isDefault: existingCount === 0 || !!a.isDefault,
      },
    })

    // If this is marked default, unset default on others
    if (created.isDefault) {
      await db.address.updateMany({
        where: { userId, id: { not: created.id } },
        data: { isDefault: false },
      })
    }

    return NextResponse.json({ address: created })
  } catch (e: any) {
    console.error('POST /api/user/addresses error', e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')?.trim() || ''
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

    const existing = await db.address.findUnique({ where: { id } })
    await db.address.delete({ where: { id } })

    // If the deleted address was default, promote the most recent remaining one
    if (existing?.isDefault && existing.userId) {
      const next = await db.address.findFirst({
        where: { userId: existing.userId },
        orderBy: { createdAt: 'desc' },
      })
      if (next) {
        await db.address.update({ where: { id: next.id }, data: { isDefault: true } })
      }
    }

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json()
    const id: string = body.id
    const userId: string = body.userId
    if (!id || !userId) return NextResponse.json({ error: 'id and userId required' }, { status: 400 })

    const existing = await db.address.findUnique({ where: { id } })
    if (!existing || existing.userId !== userId) {
      return NextResponse.json({ error: 'address not found' }, { status: 404 })
    }

    // Update isDefault (and unset on others if becoming default)
    if (body.isDefault) {
      await db.address.updateMany({
        where: { userId, id: { not: id } },
        data: { isDefault: false },
      })
    }
    const updated = await db.address.update({
      where: { id },
      data: { isDefault: !!body.isDefault },
    })
    return NextResponse.json({ address: updated })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
