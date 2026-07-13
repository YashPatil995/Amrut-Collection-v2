import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const now = new Date()
    const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const startWeek = new Date(startToday)
    startWeek.setDate(startWeek.getDate() - 6)
    const startMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startYear = new Date(now.getFullYear(), 0, 1)

    const [allOrders, products, customers] = await Promise.all([
      db.order.findMany({ include: { items: true }, orderBy: { createdAt: 'desc' } }),
      db.product.findMany(),
      db.order.findMany({ select: { email: true, customerName: true, total: true, createdAt: true }, distinct: ['email'], orderBy: { createdAt: 'desc' } }),
    ])

    const revenueAll = allOrders.reduce((s, o) => s + o.total, 0)
    const todayOrders = allOrders.filter((o) => o.createdAt >= startToday)
    const weekOrders = allOrders.filter((o) => o.createdAt >= startWeek)
    const monthOrders = allOrders.filter((o) => o.createdAt >= startMonth)
    const yearOrders = allOrders.filter((o) => o.createdAt >= startYear)

    const revenue = (arr: any[]) => arr.reduce((s, o) => s + o.total, 0)
    const avgOrder = allOrders.length ? revenueAll / allOrders.length : 0

    const pendingOrders = allOrders.filter((o) => ['ordered', 'packed'].includes(o.status)).length
    const cancelledOrders = allOrders.filter((o) => o.status === 'cancelled').length
    const returnedOrders = allOrders.filter((o) => o.status === 'returned').length
    const lowStock = products.filter((p) => p.stock < 25).length
    const totalStock = products.reduce((s, p) => s + p.stock, 0)

    // top products by sold
    const topProducts = [...products].sort((a, b) => b.sold - a.sold).slice(0, 6).map((p) => ({
      id: p.id, name: p.name, sold: p.sold, price: p.price, stock: p.stock, rating: p.rating, images: JSON.parse(p.images),
    }))

    // top categories
    const catMap: Record<string, number> = {}
    for (const o of allOrders) {
      for (const it of o.items) {
        const prod = products.find((p) => p.id === it.productId)
        if (prod) catMap[prod.categoryId] = (catMap[prod.categoryId] || 0) + it.qty
      }
    }
    const cats = await db.category.findMany()
    const topCategories = Object.entries(catMap).map(([cid, qty]) => ({
      name: cats.find((c) => c.id === cid)?.name || 'Unknown', qty,
    })).sort((a, b) => b.qty - a.qty).slice(0, 6)

    // top customers
    const custMap: Record<string, { name: string; email: string; orders: number; spent: number }> = {}
    for (const o of allOrders) {
      if (!custMap[o.email]) custMap[o.email] = { name: o.customerName, email: o.email, orders: 0, spent: 0 }
      custMap[o.email].orders++
      custMap[o.email].spent += o.total
    }
    const topCustomers = Object.values(custMap).sort((a, b) => b.spent - a.spent).slice(0, 6)

    // status breakdown
    const statusBreakdown = ['ordered', 'packed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'returned'].map((s) => ({
      status: s, count: allOrders.filter((o) => o.status === s).length,
    }))

    // payment breakdown
    const paymentBreakdown = ['upi', 'card', 'cod', 'wallet'].map((m) => ({
      method: m, count: allOrders.filter((o) => o.paymentMethod === m).length,
    }))

    return NextResponse.json({
      kpi: {
        todaySales: revenue(todayOrders),
        weekSales: revenue(weekOrders),
        monthSales: revenue(monthOrders),
        yearSales: revenue(yearOrders),
        totalRevenue: revenueAll,
        totalOrders: allOrders.length,
        todayOrders: todayOrders.length,
        weekOrders: weekOrders.length,
        monthOrders: monthOrders.length,
        avgOrderValue: Math.round(avgOrder),
        totalCustomers: customers.length,
        totalProducts: products.length,
        totalStock,
        pendingOrders,
        cancelledOrders,
        returnedOrders,
        lowStock,
        repeatCustomers: Object.values(custMap).filter((c) => c.orders > 1).length,
      },
      topProducts,
      topCategories,
      topCustomers,
      statusBreakdown,
      paymentBreakdown,
      recentOrders: allOrders.slice(0, 8).map((o) => ({
        orderNo: o.orderNo, customerName: o.customerName, total: o.total, status: o.status, createdAt: o.createdAt, items: o.items.length,
      })),
    })
  } catch (e: any) {
    console.error('admin/stats error', e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
