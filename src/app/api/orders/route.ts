import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const orderNo = searchParams.get('orderNo')
    const customer = searchParams.get('customer')

    if (orderNo) {
      const order = await db.order.findUnique({
        where: { orderNo },
        include: { items: true },
      })
      if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })
      return NextResponse.json({ order })
    }

    // Fetch orders by customer email or phone
    if (customer) {
      const secondary = searchParams.get('secondary') || ''
      const orConditions: any[] = [
        { email: { contains: customer } },
        { phone: { contains: customer } },
      ]
      // Also search by secondary (phone) if provided
      if (secondary && secondary !== customer) {
        orConditions.push({ email: { contains: secondary } })
        orConditions.push({ phone: { contains: secondary } })
      }
      const orders = await db.order.findMany({
        where: { OR: orConditions },
        orderBy: { createdAt: 'desc' },
        include: { items: true },
        take: 50,
      })
      return NextResponse.json({ orders })
    }
    const orders = await db.order.findMany({
      orderBy: { createdAt: 'desc' },
      include: { items: true },
      take: 100,
    })
    return NextResponse.json({ orders })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const orderNo = 'AMR' + new Date().getFullYear() + String(new Date().getMonth() + 1).padStart(2, '0') + String(Math.floor(1000 + Math.random() * 9000))
    const order = await db.order.create({
      data: {
        orderNo,
        customerId: body.customerId || null,
        customerName: body.customerName,
        email: body.email,
        phone: body.phone,
        address: body.address,
        city: body.city,
        state: body.state || 'Maharashtra',
        pincode: body.pincode,
        paymentMethod: body.paymentMethod || 'cod',
        paymentStatus: body.paymentMethod === 'cod' ? 'pending' : 'paid',
        utrNumber: body.utrNumber || null,
        status: 'ordered',
        subtotal: body.subtotal,
        shipping: body.shipping || 0,
        discount: body.discount || 0,
        total: body.total,
        items: {
          create: (body.items || []).map((it: any) => ({
            productId: it.productId,
            name: it.name,
            image: it.image,
            price: it.price,
            qty: it.qty,
            color: it.color,
            size: it.size,
          })),
        },
      },
      include: { items: true },
    })
    // decrement stock
    for (const it of order.items) {
      await db.product.update({ where: { id: it.productId }, data: { stock: { decrement: it.qty }, sold: { increment: it.qty } } })
    }
    return NextResponse.json({ order })
  } catch (e: any) {
    console.error('POST /api/orders error', e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json()
    const order = await db.order.update({
      where: { id: body.id },
      data: { status: body.status, paymentStatus: body.paymentStatus },
    })
    return NextResponse.json({ order })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
