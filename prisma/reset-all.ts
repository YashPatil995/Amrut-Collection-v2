import { db } from '../src/lib/db'

async function main() {
  console.log('Deleting all demo orders...')
  await db.orderItem.deleteMany()
  await db.order.deleteMany()
  console.log('Orders deleted:', await db.order.count())

  console.log('Resetting product stats...')
  await db.product.updateMany({ data: { discount: 0, sold: 0, rating: 0, reviewCount: 0 } })
  console.log('Products reset')

  console.log('Deleting demo reviews...')
  await db.review.deleteMany()
  console.log('Reviews deleted:', await db.review.count())

  console.log('Done! Fresh website ready.')
}

main().catch(console.error).finally(() => db.$disconnect())
