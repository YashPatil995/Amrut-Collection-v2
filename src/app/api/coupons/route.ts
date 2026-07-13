import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const coupons = await db.coupon.findMany({ where: { active: true } })
    return NextResponse.json({ coupons })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const { code, subtotal } = await req.json()
    const coupon = await db.coupon.findUnique({ where: { code: code.toUpperCase() } })
    if (!coupon || !coupon.active) return NextResponse.json({ error: 'Invalid coupon code' }, { status: 400 })
    if (subtotal < coupon.minOrder) return NextResponse.json({ error: `Minimum order ₹${coupon.minOrder} required` }, { status: 400 })
    let discount = coupon.type === 'percent' ? (subtotal * coupon.value) / 100 : coupon.value
    if (coupon.maxDiscount && discount > coupon.maxDiscount) discount = coupon.maxDiscount
    return NextResponse.json({ coupon, discount: Math.round(discount) })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
