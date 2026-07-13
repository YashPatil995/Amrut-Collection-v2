import { db } from '../src/lib/db'

const colors = ['Maroon','Cream','Olive','Matte Black','Gold','Ivory','Beige','Navy','Indigo','Teal','Rose','Wine','Brown','Tan','White','Sky Blue','Yellow','Pink','Green','Purple']
const sizes = ['XS','S','M','L','XL','XXL','Free Size']
const waistSizes = ['28','30','32','34','36','38','40']
const patterns = ['Solid','Embroidered','Printed','Floral','Woven','Striped','Block Print','Kundan','Sequined','Quilted','Textured']
const genders = ['men','women','kids','all']

async function main() {
  for (const gender of genders) {
    for (const color of colors) {
      await db.filterOption.upsert({
        where: { type_value_gender: { type: 'color', value: color, gender } },
        update: {},
        create: { type: 'color', value: color, gender, active: true },
      })
    }
    for (const size of sizes) {
      await db.filterOption.upsert({
        where: { type_value_gender: { type: 'size', value: size, gender } },
        update: {},
        create: { type: 'size', value: size, gender, active: true },
      })
    }
    for (const waist of waistSizes) {
      await db.filterOption.upsert({
        where: { type_value_gender: { type: 'waist', value: waist, gender } },
        update: {},
        create: { type: 'waist', value: waist, gender, active: true },
      })
    }
    for (const pattern of patterns) {
      await db.filterOption.upsert({
        where: { type_value_gender: { type: 'pattern', value: pattern, gender } },
        update: {},
        create: { type: 'pattern', value: pattern, gender, active: true },
      })
    }
  }
  console.log('Filter options seeded!')
}

main().catch(console.error).finally(() => db.$disconnect())
