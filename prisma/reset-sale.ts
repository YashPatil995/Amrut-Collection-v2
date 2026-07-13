// Quick script to reset all product discounts and sold counts to zero.
// Usage: bunx tsx prisma/reset-sale.ts
import { db } from '../src/lib/db'

async function main() {
  const result = await db.product.updateMany({
    data: { discount: 0, sold: 0 },
  })
  console.log(`Reset ${result.count} products: discount=0, sold=0`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
