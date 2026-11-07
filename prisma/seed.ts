/**
 * Seed script for AuroraLuxe
 * Creates 10 men's + 10 women's products with local asset images.
 */
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const MAN_PRODUCTS = [
  {
    name: 'Montre Homme Atlas Chronographe',
    slug: 'atlas-chronographe',
    sku: 'MEN-001',
    category: 'MEN',
    price: 3200,
    salePrice: 2850,
    stock: 24,
    featured: true,
    description: 'Montre à chronographe classique pour homme. Mouvement suisse de précision, boîtier en acier inoxydable 42mm, verre saphir anti-reflets. Un must-have pour l\'homme moderne.',
    images: JSON.stringify(['/assets/products/men/watch-001.webp', '/assets/products/men/watch-003.webp']),
  },
  {
    name: 'Montre Homme Collection Urban',
    slug: 'collection-urban',
    sku: 'MEN-002',
    category: 'MEN',
    price: 1950,
    salePrice: null,
    stock: 36,
    featured: false,
    description: 'Design urbain pour l\'homme moderne. Inspiration scandinave rencontre l\'horlogerie suisse. Bracelet cuir noir, cadran épuré.',
    images: JSON.stringify(['/assets/products/men/watch-003.webp', '/assets/products/men/watch-001.webp']),
  },
  {
    name: 'Montre Homme Noir Céleste',
    slug: 'noir-celeste',
    sku: 'MEN-003',
    category: 'MEN',
    price: 4800,
    salePrice: 4200,
    stock: 12,
    featured: true,
    description: 'Montre ultra-légère en saphir avec cadran céleste. Édition limitée, boîtier 44mm en titane noir. Réserve de marche 72h.',
    images: JSON.stringify(['/assets/products/men/watch-001.webp', '/assets/products/men/watch-003.webp']),
  },
  {
    name: 'Montre Homme Sport Authentic',
    slug: 'sport-authentic',
    sku: 'MEN-004',
    category: 'MEN',
    price: 1750,
    salePrice: null,
    stock: 48,
    featured: false,
    description: 'Montre sportive énergique pour les styles de vie actifs. Étanche 200m, lunette céramique, bracelet caoutchouc.',
    images: JSON.stringify(['/assets/products/men/watch-003.webp', '/assets/products/men/watch-001.webp']),
  },
  {
    name: 'Montre Homme Silver Elegance',
    slug: 'silver-elegance',
    sku: 'MEN-005',
    category: 'MEN',
    price: 2300,
    salePrice: 2000,
    stock: 18,
    featured: false,
    description: 'Montre argentée alliant élégance et robustesse. Cadran blanc avec index dorés, bracelet milanais.',
    images: JSON.stringify(['/assets/products/men/watch-001.webp', '/assets/products/men/watch-003.webp']),
  },
  {
    name: 'Montre Homme Heritage Oxford',
    slug: 'heritage-oxford',
    sku: 'MEN-006',
    category: 'MEN',
    price: 2900,
    salePrice: null,
    stock: 8,
    featured: true,
    description: 'Bracelet en cuir Oxford sur mouvement suisse, design héritage intemporel. Boîtier bronze, cadran guilloche.',
    images: JSON.stringify(['/assets/products/men/watch-003.webp', '/assets/products/men/watch-001.webp']),
  },
  {
    name: 'Montre Homme Tropical',
    slug: 'tropical',
    sku: 'MEN-007',
    category: 'MEN',
    price: 2600,
    salePrice: 2250,
    stock: 30,
    featured: false,
    description: 'Variante tropicale du modèle rectangulaire iconique. Cadran vert forêt, bracelet NATO.',
    images: JSON.stringify(['/assets/products/men/watch-001.webp', '/assets/products/men/watch-003.webp']),
  },
  {
    name: 'Montre Homme Radar',
    slug: 'radar',
    sku: 'MEN-008',
    category: 'MEN',
    price: 3900,
    salePrice: 3500,
    stock: 5,
    featured: false,
    description: 'Montre sport robuste avec indicateur de réserve de marche RADAR. Boîtier 46mm, verre minéral trempé.',
    images: JSON.stringify(['/assets/products/men/watch-003.webp', '/assets/products/men/watch-001.webp']),
  },
  {
    name: 'Montre Homme Grand Modèle',
    slug: 'grand-modele',
    sku: 'MEN-009',
    category: 'MEN',
    price: 5500,
    salePrice: null,
    stock: 3,
    featured: true,
    description: 'Grand modèle pour le gentleman raffiné. Boîtier 48mm en or rose, cadran squelette, bracelet croco.',
    images: JSON.stringify(['/assets/products/men/watch-001.webp', '/assets/products/men/watch-003.webp']),
  },
  {
    name: 'Montre Homme Soleil',
    slug: 'soleil',
    sku: 'MEN-010',
    category: 'MEN',
    price: 1550,
    salePrice: null,
    stock: 60,
    featured: false,
    description: 'Montre habillée abordable en boîtier titane. Cadran soleil bleu profond, mouvement automatique.',
    images: JSON.stringify(['/assets/products/men/watch-003.webp', '/assets/products/men/watch-001.webp']),
  },
]

const WOMEN_PRODUCTS = [
  {
    name: 'Montre Femme Elara Rose',
    slug: 'elara-rose',
    sku: 'WOM-001',
    category: 'WOMEN',
    price: 2800,
    salePrice: 2350,
    stock: 24,
    featured: true,
    description: 'Cadran or rose avec profil slim. Bracelet milanais doré, boîtier 34mm. La féminité à l\'état pur.',
    images: JSON.stringify(['/assets/products/men/watch-003.webp', '/assets/products/men/watch-001.webp']),
  },
  {
    name: 'Montre Femme Bronze Or',
    slug: 'bronze-or',
    sku: 'WOM-002',
    category: 'WOMEN',
    price: 3200,
    salePrice: 2700,
    stock: 15,
    featured: false,
    description: 'Montre habillée en bronze inspirée de l\'élégance parisienne. Cadran mère de perle, bracelet cuir camel.',
    images: JSON.stringify(['/assets/products/men/watch-001.webp', '/assets/products/men/watch-003.webp']),
  },
  {
    name: 'Montre Femme Cassandre',
    slug: 'cassandre',
    sku: 'WOM-003',
    category: 'WOMEN',
    price: 4200,
    salePrice: 3700,
    stock: 8,
    featured: true,
    description: 'Design rectangulaire audacieux avec cadran avant-gardiste. Boîtier acier poli, index diamants.',
    images: JSON.stringify(['/assets/products/men/watch-003.webp', '/assets/products/men/watch-001.webp']),
  },
  {
    name: 'Montre Femme Jade',
    slug: 'jade',
    sku: 'WOM-004',
    category: 'WOMEN',
    price: 1900,
    salePrice: 1550,
    stock: 36,
    featured: false,
    description: 'Cadran vert jade, légère et sophistiquée. Boîtier 32mm, bracelet cuir vert bouteille.',
    images: JSON.stringify(['/assets/products/men/watch-001.webp', '/assets/products/men/watch-003.webp']),
  },
  {
    name: 'Montre Femme Vapore',
    slug: 'vapore',
    sku: 'WOM-005',
    category: 'WOMEN',
    price: 3100,
    salePrice: null,
    stock: 22,
    featured: false,
    description: 'Profil hydrodynamique élancé, avant-gardiste. Mouvement quartz suisse, bracelet acier.',
    images: JSON.stringify(['/assets/products/men/watch-003.webp', '/assets/products/men/watch-001.webp']),
  },
  {
    name: 'Montre Femme Versa',
    slug: 'versa',
    sku: 'WOM-006',
    category: 'WOMEN',
    price: 1600,
    salePrice: 1300,
    stock: 50,
    featured: false,
    description: 'Montre habillée polyvalente pour toutes les occasions. Cadran blanc nacré, bracelet interchangeable.',
    images: JSON.stringify(['/assets/products/men/watch-001.webp', '/assets/products/men/watch-003.webp']),
  },
  {
    name: 'Montre Femme Horizon',
    slug: 'horizon',
    sku: 'WOM-007',
    category: 'WOMEN',
    price: 3500,
    salePrice: 2950,
    stock: 10,
    featured: true,
    description: 'Face sport orientée horizontalement, ultra-mince. Boîtier 36mm en acier satiné, étanche 50m.',
    images: JSON.stringify(['/assets/products/men/watch-003.webp', '/assets/products/men/watch-001.webp']),
  },
  {
    name: 'Montre Femme Nuit',
    slug: 'nuit',
    sku: 'WOM-008',
    category: 'WOMEN',
    price: 4500,
    salePrice: 3900,
    stock: 6,
    featured: false,
    description: 'Chef-d\'œuvre noir, fermoir minuit et bracelet noir. Cadran laqué noir avec étoiles luminescentes.',
    images: JSON.stringify(['/assets/products/men/watch-001.webp', '/assets/products/men/watch-003.webp']),
  },
  {
    name: 'Montre Femme Libre',
    slug: 'libre',
    sku: 'WOM-009',
    category: 'WOMEN',
    price: 2200,
    salePrice: 1850,
    stock: 30,
    featured: false,
    description: 'Collection Libre, esthétique minimaliste en titane. Cadran nude, bracelet mesh argent.',
    images: JSON.stringify(['/assets/products/men/watch-003.webp', '/assets/products/men/watch-001.webp']),
  },
  {
    name: 'Montre Femme Lune',
    slug: 'lune',
    sku: 'WOM-010',
    category: 'WOMEN',
    price: 3300,
    salePrice: 2800,
    stock: 12,
    featured: true,
    description: 'Cadran minimal inspiré de la lune pour la femme raffinée. Phase de lune, boîtier 34mm, bracelet satin.',
    images: JSON.stringify(['/assets/products/men/watch-001.webp', '/assets/products/men/watch-003.webp']),
  },
]

const DEFAULT_SETTINGS = [
  { key: 'whatsapp_number', value: '212600000000' },
  { key: 'announcement_text', value: 'LIVRAISON GRATUITE PARTOUT AU MAROC' },
  { key: 'announcement_enabled', value: 'true' },
  { key: 'shipping_fee', value: '30' },
  { key: 'free_shipping_threshold', value: '500' },
]

async function main() {
  console.log('Seeding database with local assets...')

  // Clear existing data
  await prisma.orderItem.deleteMany()
  await prisma.order.deleteMany()
  await prisma.product.deleteMany()
  await prisma.storeSettings.deleteMany()
  await prisma.adminSession.deleteMany()

  // Create settings
  for (const setting of DEFAULT_SETTINGS) {
    await prisma.storeSettings.upsert({
      where: { key: setting.key },
      update: { value: setting.value },
      create: setting,
    })
  }

  // Create men's products
  for (const p of MAN_PRODUCTS) {
    await prisma.product.create({ data: p })
  }

  // Create women's products
  for (const p of WOMEN_PRODUCTS) {
    await prisma.product.create({ data: p })
  }

  console.log(`Created ${MAN_PRODUCTS.length} men's products + ${WOMEN_PRODUCTS.length} women's products`)
  console.log('Seed complete.')
}

async function run() {
  try {
    await main()
  } finally {
    await prisma.$disconnect()
  }
}

run()
