import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const now = new Date()
    const allOrders = await db.order.findMany({ include: { items: true } })
    const products = await db.product.findMany()

    // Daily revenue for last 14 days
    const daily: { date: string; revenue: number; orders: number }[] = []
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i)
      const next = new Date(d); next.setDate(next.getDate() + 1)
      const dayOrders = allOrders.filter((o) => o.createdAt >= d && o.createdAt < next)
      daily.push({
        date: d.toISOString().slice(5, 10),
        revenue: Math.round(dayOrders.reduce((s, o) => s + o.total, 0)),
        orders: dayOrders.length,
      })
    }

    // Monthly revenue for current year
    const monthly: { month: string; revenue: number; orders: number }[] = []
    const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
    for (let m = 0; m < 12; m++) {
      const start = new Date(now.getFullYear(), m, 1)
      const end = new Date(now.getFullYear(), m + 1, 1)
      const mOrders = allOrders.filter((o) => o.createdAt >= start && o.createdAt < end)
      monthly.push({
        month: monthNames[m],
        revenue: Math.round(mOrders.reduce((s, o) => s + o.total, 0)),
        orders: mOrders.length,
      })
    }

    // Gender sales
    const genderMap: Record<string, number> = { men: 0, women: 0, kids: 0 }
    for (const o of allOrders) {
      for (const it of o.items) {
        const prod = products.find((p) => p.id === it.productId)
        if (prod) genderMap[prod.gender] += it.qty
      }
    }
    const genderSales = Object.entries(genderMap).map(([name, value]) => ({ name, value }))

    // Top cities
    const cityMap: Record<string, { orders: number; revenue: number }> = {}
    for (const o of allOrders) {
      if (!cityMap[o.city]) cityMap[o.city] = { orders: 0, revenue: 0 }
      cityMap[o.city].orders++
      cityMap[o.city].revenue += o.total
    }
    const topCities = Object.entries(cityMap).map(([city, d]) => ({ city, ...d })).sort((a, b) => b.revenue - a.revenue).slice(0, 6)

    // Category revenue
    const cats = await db.category.findMany()
    const catRev: Record<string, number> = {}
    for (const o of allOrders) {
      for (const it of o.items) {
        const prod = products.find((p) => p.id === it.productId)
        if (prod) catRev[prod.categoryId] = (catRev[prod.categoryId] || 0) + it.price * it.qty
      }
    }
    const categoryRevenue = Object.entries(catRev).map(([cid, rev]) => ({
      name: cats.find((c) => c.id === cid)?.name || 'Unknown',
      revenue: Math.round(rev),
    })).sort((a, b) => b.revenue - a.revenue)

    // Best & worst sellers
    const sortedBySold = [...products].sort((a, b) => b.sold - a.sold)
    const bestSellers = sortedBySold.slice(0, 5).map((p) => ({ name: p.name, sold: p.sold }))
    const worstSellers = sortedBySold.slice(-5).reverse().map((p) => ({ name: p.name, sold: p.sold }))

    return NextResponse.json({
      daily,
      monthly,
      genderSales,
      topCities,
      categoryRevenue,
      bestSellers,
      worstSellers,
    })
  } catch (e: any) {
    console.error('admin/analytics error', e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
