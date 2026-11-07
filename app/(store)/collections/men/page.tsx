import { prisma } from '@/lib/prisma'
import { formatPrice } from '@/lib/utils'
import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Collection Homme — Montres de Luxe | Aurora Luxe Maroc',
  description: 'Découvrez notre collection de montres homme. Design élégant, qualité suisse. Livraison Cash on Delivery partout au Maroc.',
  openGraph: {
    title: 'Collection Homme — Aurora Luxe',
    description: 'Montres homme de luxe au Maroc. Livraison COD.',
    type: 'website',
  },
}

export const revalidate = 3600

async function getMenProducts(sort?: string, page = 1, limit = 12) {
  const skip = (page - 1) * limit
  const whereClause = { category: 'MEN', active: true }

  const orderBy =
    sort === 'price_asc' ? { price: 'asc' as const }
    : sort === 'price_desc' ? { price: 'desc' as const }
    : sort === 'newest' ? { createdAt: 'desc' as const }
    : [{ featured: 'desc' as const }, { createdAt: 'desc' as const }]

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where: whereClause,
      skip,
      take: limit,
      orderBy,
    }),
    prisma.product.count({ where: whereClause }),
  ])

  return { products, total, totalPages: Math.ceil(total / limit) }
}

export default async function MenCollectionPage({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string; page?: string }>
}) {
  const resolved = await searchParams
  const sort = resolved.sort || 'featured'
  const page = Math.max(1, parseInt(resolved.page || '1'))

  const { products, total, totalPages } = await getMenProducts(sort, page)

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg)', color: 'var(--text)' }}>
      {/* Hero */}
      <section className="py-12 md:py-16" style={{ backgroundColor: 'var(--bg-2)', borderBottom: '1px solid var(--border)' }}>
        <div className="mx-auto max-w-7xl px-6">
          <nav className="flex gap-2 text-sm mb-4" style={{ color: 'var(--text-2)' }}>
            <Link href="/" className="hover:underline" style={{ color: 'var(--text-2)' }}>Accueil</Link>
            <span>/</span>
            <span style={{ color: 'var(--text)' }}>Collection Homme</span>
          </nav>
          <h1 className="font-serif text-4xl md:text-5xl font-bold">Collection Homme</h1>
          <p className="mt-3 text-lg" style={{ color: 'var(--text-2)' }}>
            {total} montre{total !== 1 ? 's' : ''} disponible{total !== 1 ? 's' : ''}
          </p>
        </div>
      </section>

      {/* Filters */}
      <section className="py-4 border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="mx-auto max-w-7xl px-6 flex items-center gap-3 flex-wrap">
          <span className="text-sm font-medium" style={{ color: 'var(--text-2)' }}>Trier par:</span>
          {[
            { value: 'featured', label: 'Vedettes' },
            { value: 'newest', label: 'Nouveautés' },
            { value: 'price_asc', label: 'Prix ↑' },
            { value: 'price_desc', label: 'Prix ↓' },
          ].map((opt) => (
            <Link
              key={opt.value}
              href={`/collections/homme?sort=${opt.value}`}
              className="px-4 py-1.5 rounded-full text-sm border transition-colors"
              style={sort === opt.value
                ? { backgroundColor: 'var(--text)', color: 'var(--bg)', borderColor: 'var(--text)' }
                : { backgroundColor: 'transparent', color: 'var(--text-2)', borderColor: 'var(--border)' }
              }
            >
              {opt.label}
            </Link>
          ))}
        </div>
      </section>

      {/* Grid */}
      <section className="py-10 pb-16">
        <div className="mx-auto max-w-7xl px-6">
          {products.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-xl font-medium mb-2" style={{ color: 'var(--text)' }}>Aucun produit disponible</p>
              <p className="text-sm" style={{ color: 'var(--text-2)' }}>Revenez bientôt pour découvrir notre collection homme.</p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((product) => {
                const images = JSON.parse(product.images) as string[]
                const img = images[0] || null
                const isSale = product.salePrice != null && product.salePrice < product.price
                const discount = isSale ? Math.round(((product.price - product.salePrice!) / product.price) * 100) : 0

                return (
                  <Link key={product.id} href={`/products/${product.slug}`} className="group block">
                    <div
                      className="rounded-xl overflow-hidden transition-shadow hover:shadow-xl"
                      style={{ backgroundColor: 'var(--bg-2)', border: '1px solid var(--border)' }}
                    >
                      {/* Image */}
                      <div className="relative aspect-square overflow-hidden" style={{ backgroundColor: 'var(--bg)' }}>
                        {img ? (
                          <Image
                            src={img}
                            alt={product.name}
                            fill
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center" style={{ color: 'var(--text-muted)' }}>
                            <span className="text-sm">Image à venir</span>
                          </div>
                        )}
                        {isSale && (
                          <div className="absolute top-3 left-3 bg-red-600 text-white px-2 py-1 rounded-md text-xs font-bold">
                            -{discount}%
                          </div>
                        )}
                        {product.featured && !isSale && (
                          <div className="absolute top-3 left-3 bg-black text-white px-2 py-1 rounded-md text-xs font-medium">
                            Vedette
                          </div>
                        )}
                        {product.stock <= 5 && product.stock > 0 && (
                          <div className="absolute top-3 right-3 bg-orange-500 text-white px-2 py-1 rounded-md text-xs font-medium">
                            Stock limité
                          </div>
                        )}
                        {product.stock === 0 && (
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                            <span className="bg-black/70 text-white text-sm px-4 py-2 rounded-full">Rupture de stock</span>
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="p-4">
                        <h3 className="font-medium text-sm leading-snug line-clamp-2" style={{ color: 'var(--text)' }}>
                          {product.name}
                        </h3>
                        <div className="mt-3 flex items-center justify-between">
                          <div className="flex items-baseline gap-2">
                            {isSale ? (
                              <>
                                <span className="font-bold text-red-600">{formatPrice(product.salePrice!)}</span>
                                <span className="text-xs line-through" style={{ color: 'var(--text-muted)' }}>{formatPrice(product.price)}</span>
                              </>
                            ) : (
                              <span className="font-bold" style={{ color: 'var(--text)' }}>{formatPrice(product.price)}</span>
                            )}
                          </div>
                          <span className="text-xs" style={{ color: product.stock <= 5 ? '#f97316' : 'var(--text-2)' }}>
                            {product.stock === 0 ? 'Épuisé' : product.stock <= 5 ? `${product.stock} restants` : 'En stock'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-12 flex justify-center gap-2 flex-wrap">
              {page > 1 && (
                <Link
                  href={`/collections/homme?sort=${sort}&page=${page - 1}`}
                  className="px-4 py-2 rounded-lg border text-sm transition-colors"
                  style={{ borderColor: 'var(--border)', color: 'var(--text-2)' }}
                >
                  ← Précédent
                </Link>
              )}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <Link
                  key={n}
                  href={`/collections/homme?sort=${sort}&page=${n}`}
                  className="px-4 py-2 rounded-lg border text-sm transition-colors"
                  style={n === page
                    ? { backgroundColor: 'var(--text)', color: 'var(--bg)', borderColor: 'var(--text)' }
                    : { borderColor: 'var(--border)', color: 'var(--text-2)' }
                  }
                >
                  {n}
                </Link>
              ))}
              {page < totalPages && (
                <Link
                  href={`/collections/homme?sort=${sort}&page=${page + 1}`}
                  className="px-4 py-2 rounded-lg border text-sm transition-colors"
                  style={{ borderColor: 'var(--border)', color: 'var(--text-2)' }}
                >
                  Suivant →
                </Link>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
