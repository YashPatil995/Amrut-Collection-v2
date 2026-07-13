import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const products = await db.product.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        patterns: true,
        images: true,
        price: true,
      },
    })

    // Aggregate pattern counts and collect sample products per pattern
    const map = new Map<string, { name: string; count: number; samples: any[] }>()

    for (const p of products) {
      let patterns: string[] = []
      try {
        patterns = JSON.parse(p.patterns || '[]')
        if (!Array.isArray(patterns)) patterns = []
      } catch {
        patterns = []
      }

      let images: string[] = []
      try {
        images = JSON.parse(p.images || '[]')
        if (!Array.isArray(images)) images = []
      } catch {
        images = []
      }

      for (const patternName of patterns) {
        const key = String(patternName).trim()
        if (!key) continue
        if (!map.has(key)) {
          map.set(key, { name: key, count: 0, samples: [] })
        }
        const entry = map.get(key)!
        entry.count += 1
        // Keep up to 4 sample products (with images preferred)
        if (entry.samples.length < 4) {
          entry.samples.push({
            id: p.id,
            name: p.name,
            slug: p.slug,
            image: images[0] || null,
            price: p.price,
          })
        }
      }
    }

    const patterns = Array.from(map.values()).sort((a, b) => b.count - a.count)
    return NextResponse.json({ patterns, total: patterns.length })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
