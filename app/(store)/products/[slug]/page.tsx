import { prisma } from '@/lib/prisma'
import { formatPrice } from '@/lib/utils'
import Link from 'next/link'
import Image from 'next/image'
import { AddToCartButton } from './AddToCartButton'
import { ProductGallery } from './ProductGallery'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

export const revalidate = 3600

async function getProduct(slug: string) {
  return prisma.product.findUnique({ where: { slug } })
}

async function getRelated(category: string, excludeId: string) {
  return prisma.product.findMany({
    where: { category, active: true, NOT: { id: excludeId } },
    take: 4,
    orderBy: { featured: 'desc' },
  })
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const product = await getProduct(slug)
  if (!product) return { title: 'Produit non trouvé' }

  let images: string[] = []
  try {
    images = JSON.parse(product.images)
  } catch {
    images = [product.images || '/assets/products/placeholder.jpg']
  }
  const _price = product.salePrice ?? product.price

  return {
    title: `${product.name} — Aurora Luxe`,
    description: `${product.description.slice(0, 155)} — Livraison COD partout au Maroc.`,
    openGraph: {
      title: product.name,
      description: product.description.slice(0, 155),
      images: images[0] ? [{ url: images[0], alt: product.name }] : [],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: product.name,
      description: product.description.slice(0, 155),
      images: images[0] ? [images[0]] : [],
    },
  }
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const product = await getProduct(slug)
  if (!product) notFound()

  let images: string[] = []
  try {
    images = JSON.parse(product.images)
    if (!Array.isArray(images) || images.length === 0) {
      images = ['/assets/products/placeholder.jpg']
    }
  } catch {
    images = [product.images || '/assets/products/placeholder.jpg']
  }

  const isSale = product.salePrice != null && product.salePrice < product.price
  const discount = isSale ? Math.round(((product.price - product.salePrice!) / product.price) * 100) : 0
  const related = await getRelated(product.category, product.id)

  // JSON-LD structured data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: images,
    sku: product.sku,
    brand: { '@type': 'Brand', name: 'Aurora Luxe' },
    offers: {
      '@type': 'Offer',
      url: `${process.env.NEXT_PUBLIC_APP_URL}/products/${product.slug}`,
      priceCurrency: 'MAD',
      price: product.salePrice ?? product.price,
      availability: product.stock > 0
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      seller: { '@type': 'Organization', name: 'Aurora Luxe' },
    },
  }

  const collectionHref = product.category === 'MEN' ? '/collections/homme' : '/collections/femme'
  const collectionLabel = product.category === 'MEN' ? 'Collection Homme' : 'Collection Femme'

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="min-h-screen" style={{ backgroundColor: 'var(--bg)', color: 'var(--text)' }}>
        <div className="mx-auto max-w-7xl px-4 md:px-6 py-8 md:py-12">

          {/* Breadcrumb */}
          <nav className="flex gap-2 text-sm mb-8 flex-wrap" aria-label="Breadcrumb">
            <Link href="/" className="hover:underline" style={{ color: 'var(--text-2)' }}>Accueil</Link>
            <span style={{ color: 'var(--text-2)' }}>/</span>
            <Link href={collectionHref} className="hover:underline" style={{ color: 'var(--text-2)' }}>{collectionLabel}</Link>
            <span style={{ color: 'var(--text-2)' }}>/</span>
            <span style={{ color: 'var(--text)' }} className="line-clamp-1">{product.name}</span>
          </nav>

          <div className="grid gap-10 md:grid-cols-2 lg:gap-16">
            {/* ── Gallery Component ── */}
            <ProductGallery
              images={images}
              productName={product.name}
              isSale={isSale}
              discount={discount}
            />

            {/* ── Info ── */}
            <div className="flex flex-col">
              <p className="text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: 'var(--text-2)' }}>
                {collectionLabel}
              </p>

              <h1 className="font-serif text-3xl md:text-4xl font-bold leading-tight" style={{ color: 'var(--text)' }}>
                {product.name}
              </h1>

              {/* Price */}
              <div className="mt-5 flex items-baseline gap-3 flex-wrap">
                {isSale ? (
                  <>
                    <span className="text-3xl font-bold text-red-600">
                      {formatPrice(product.salePrice!)}
                    </span>
                    <span className="text-xl line-through" style={{ color: 'var(--text-muted)' }}>
                      {formatPrice(product.price)}
                    </span>
                    <span className="text-sm font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
                      Économisez {discount}%
                    </span>
                  </>
                ) : (
                  <span className="text-3xl font-bold" style={{ color: 'var(--text)' }}>
                    {formatPrice(product.price)}
                  </span>
                )}
              </div>

              {/* Stock */}
              <div className="mt-4">
                {product.stock === 0 ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-red-50 text-red-700 border border-red-200">
                    ✕ Rupture de stock
                  </span>
                ) : product.stock <= 5 ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-orange-50 text-orange-700 border border-orange-200">
                    ⚡ Plus que {product.stock} en stock
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-green-50 text-green-700 border border-green-200">
                    ✓ En stock
                  </span>
                )}
              </div>

              {/* Description */}
              <div className="mt-6">
                <p className="text-base leading-relaxed" style={{ color: 'var(--text-2)' }}>
                  {product.description}
                </p>
              </div>

              {/* Specs */}
              <div className="mt-6 grid grid-cols-2 gap-3">
                {[
                  { label: 'SKU', value: product.sku },
                  { label: 'Catégorie', value: product.category === 'MEN' ? 'Homme' : 'Femme' },
                  { label: 'Paiement', value: 'Cash on Delivery' },
                  { label: 'Livraison', value: '24/48h au Maroc' },
                ].map((spec) => (
                  <div
                    key={spec.label}
                    className="p-3 rounded-xl"
                    style={{ backgroundColor: 'var(--bg-2)', border: '1px solid var(--border)' }}
                  >
                    <p className="text-xs mb-0.5" style={{ color: 'var(--text-muted)' }}>{spec.label}</p>
                    <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>{spec.value}</p>
                  </div>
                ))}
              </div>

              {/* Cart buttons */}
              <AddToCartButton product={{
                id: product.id,
                slug: product.slug,
                name: product.name,
                price: product.price,
                salePrice: product.salePrice,
                stock: product.stock,
                images: product.images,
              }} />

              {/* Delivery info */}
              <div
                className="mt-6 p-5 rounded-2xl space-y-2.5"
                style={{ backgroundColor: 'var(--bg-2)', border: '1px solid var(--border)' }}
              >
                {[
                  { icon: '🚚', text: 'Livraison gratuite partout au Maroc en 24/48h' },
                  { icon: '💳', text: 'Paiement Cash on Delivery — payez à la réception de votre colis' },
                  { icon: '🔒', text: 'Garantie authenticité — produit 100% original' },
                  { icon: '💬', text: 'Support WhatsApp disponible pour toute question' },
                ].map((item) => (
                  <div key={item.icon} className="flex items-start gap-3 text-sm">
                    <span className="flex-shrink-0 mt-0.5">{item.icon}</span>
                    <span style={{ color: 'var(--text-2)' }}>{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Related Products ── */}
          {related.length > 0 && (
            <section className="mt-20">
              <h2 className="font-serif text-3xl font-bold mb-8" style={{ color: 'var(--text)' }}>
                Vous pourriez aussi aimer
              </h2>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {related.map((rel) => {
                  let relImages: string[] = []
                  try {
                    relImages = JSON.parse(rel.images)
                  } catch {
                    relImages = [rel.images || '/assets/products/placeholder.jpg']
                  }
                  const relSale = rel.salePrice != null && rel.salePrice < rel.price
                  return (
                    <Link key={rel.id} href={`/products/${rel.slug}`} className="group block">
                      <div
                        className="rounded-xl overflow-hidden transition-all hover:shadow-xl"
                        style={{ backgroundColor: 'var(--bg-2)', border: '1px solid var(--border)' }}
                      >
                        <div className="relative aspect-square overflow-hidden" style={{ backgroundColor: 'var(--bg)' }}>
                          {relImages[0] ? (
                            <Image
                              src={relImages[0]}
                              alt={rel.name}
                              fill
                              sizes="(max-width: 640px) 50vw, 25vw"
                              className="object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center" style={{ color: 'var(--text-muted)' }}>
                              <span className="text-xs">Image à venir</span>
                            </div>
                          )}
                          {relSale && (
                            <div className="absolute top-2 left-2 bg-red-600 text-white px-2 py-0.5 rounded text-xs font-bold">
                              -{Math.round(((rel.price - rel.salePrice!) / rel.price) * 100)}%
                            </div>
                          )}
                        </div>
                        <div className="p-4">
                          <h3 className="text-sm font-medium line-clamp-2" style={{ color: 'var(--text)' }}>{rel.name}</h3>
                          <div className="mt-2 flex items-baseline gap-2">
                            {relSale ? (
                              <>
                                <span className="font-bold text-red-600 text-sm">{formatPrice(rel.salePrice!)}</span>
                                <span className="text-xs line-through" style={{ color: 'var(--text-muted)' }}>{formatPrice(rel.price)}</span>
                              </>
                            ) : (
                              <span className="font-bold text-sm" style={{ color: 'var(--text)' }}>{formatPrice(rel.price)}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </section>
          )}

        </div>
      </div>
    </>
  )
}
