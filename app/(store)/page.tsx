import Link from 'next/link'
import Image from 'next/image'
import { prisma } from '@/lib/prisma'
import { formatPrice } from '@/lib/utils'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Aurora Luxe — Montres de Luxe au Maroc | Livraison COD',
  description: 'Découvrez Aurora Luxe, votre boutique de montres de luxe au Maroc. Collections homme et femme. Paiement à la livraison (COD) partout au Maroc.',
  openGraph: {
    title: 'Aurora Luxe — Montres de Luxe au Maroc',
    description: 'Collections de montres premium pour homme et femme. Livraison COD partout au Maroc.',
    type: 'website',
  },
}

export const revalidate = 3600

async function getHomepageData() {
  const [featured, menCount, womenCount, settingsList] = await Promise.all([
    prisma.product.findMany({
      where: { active: true, featured: true },
      take: 8,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.product.count({ where: { category: 'MEN', active: true } }),
    prisma.product.count({ where: { category: 'WOMEN', active: true } }),
    prisma.storeSettings.findMany(),
  ])

  const settings: Record<string, string> = {}
  settingsList.forEach((s) => {
    settings[s.key] = s.value
  })

  return { featured, menCount, womenCount, settings }
}

export default async function HomePage() {
  const { featured, menCount, womenCount, settings } = await getHomepageData()

  const heroBannerUrl = settings.hero_banner_url || '/assets/banners/luxury_watch_banner_4k.png'
  const heroBadge = settings.hero_badge || 'Collection 2026 · Maroc'
  const heroTitle = settings.hero_title || "L'élégance à chaque instant"
  const heroSubtitle = settings.hero_subtitle || 'Montres de luxe pour homme et femme — livrées partout au Maroc avec paiement à la livraison.'

  const cinematicVideoUrl = settings.cinematic_video_url || '/assets/videos/auroraluxe-showreel.mp4.mp4'
  const cinematicBadge = settings.cinematic_badge || 'Cinematic Experience'
  const cinematicTitle = settings.cinematic_title || 'EXPERIENCE AURORALUXE'
  const cinematicDesc = settings.cinematic_desc || "Plongez dans l'univers de l'horlogerie de prestige. Découvrez l'art et la précision de nos créations exclusives."
  const cinematicEnabled = settings.cinematic_enabled !== 'false'

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg)' }}>

      {/* ── Hero ── */}
      <section className="relative h-[85vh] min-h-[560px] overflow-hidden bg-black">
        <div className="absolute inset-0 z-0">
          <Image
            src={heroBannerUrl}
            alt="Aurora Luxe Luxury Watch 4K Banner"
            fill
            priority
            quality={100}
            className="object-cover opacity-90"
            sizes="100vw"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-br from-black/45 via-black/20 to-black/45 z-10" />
        <div className="relative z-20 mx-auto flex h-full max-w-7xl flex-col justify-center px-6">
          <p className="text-xs font-semibold tracking-[0.3em] uppercase text-white/90 mb-5">
            {heroBadge}
          </p>
          <h1 className="font-serif text-5xl font-bold leading-[1.1] text-white md:text-7xl lg:text-8xl drop-shadow-md whitespace-pre-line">
            {heroTitle}
          </h1>
          <p className="mt-6 max-w-lg text-base md:text-lg text-white/90 leading-relaxed drop-shadow">
            {heroSubtitle}
          </p>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Link
              href="/collections/men"
              className="inline-block rounded-full bg-white text-black px-8 py-3.5 text-sm font-semibold tracking-wide transition-all hover:bg-white/90 shadow-lg text-center"
            >
              Collection Homme
            </Link>
            <Link
              href="/collections/women"
              className="inline-block rounded-full border border-white/60 text-white px-8 py-3.5 text-sm font-semibold tracking-wide transition-all hover:border-white hover:bg-white/20 shadow-lg text-center"
            >
              Collection Femme
            </Link>
          </div>
        </div>
      </section>

      {/* ── Premium Video Section ── */}
      {cinematicEnabled && (
        <section className="py-16 md:py-24 bg-black text-white relative overflow-hidden">
          <div className="mx-auto max-w-7xl px-6">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <p className="text-xs font-semibold tracking-[0.3em] uppercase text-[#D4AF37] mb-3">
                {cinematicBadge}
              </p>
              <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold tracking-wide">
                {cinematicTitle}
              </h2>
              <p className="mt-4 text-sm sm:text-base text-zinc-300 leading-relaxed">
                {cinematicDesc}
              </p>
            </div>

            <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/15 bg-zinc-950 aspect-[16/9] max-h-[780px] w-full">
              <video
                autoPlay
                muted
                loop
                playsInline
                preload="auto"
                poster={heroBannerUrl}
                className="w-full h-full object-cover"
              >
                <source src={cinematicVideoUrl} type="video/mp4" />
                Your browser does not support the video tag.
              </video>

              {/* Subtle luxury gradient vignette at bottom */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/10 pointer-events-none" />

              {/* Brand watermark overlay */}
              <div className="absolute bottom-6 left-6 right-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pointer-events-none">
                <div className="bg-black/70 backdrop-blur-md border border-white/20 px-4 py-2.5 rounded-xl shadow-lg">
                  <p className="text-[10px] uppercase tracking-widest text-[#D4AF37] font-semibold">Artisanat Suisse</p>
                  <p className="text-xs font-serif font-medium text-white">Mouvement Haute Précision</p>
                </div>
                <div className="hidden sm:block text-right">
                  <span className="text-xs tracking-[0.3em] uppercase text-white/80">Aurora Luxe · 2026</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── Collections ── */}
      <section className="py-16 md:py-24" style={{ backgroundColor: 'var(--bg)' }}>
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Collection Homme */}
            <Link
              href="/collections/men"
              className="group relative block overflow-hidden rounded-2xl aspect-[4/3] bg-zinc-900"
            >
              <Image
                src="/assets/products/men/watch-001.webp"
                alt="Collection Homme — montres de luxe Aurora Luxe"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10 z-10" />
              <div className="absolute bottom-0 left-0 z-20 p-8">
                <p className="text-xs font-semibold tracking-widest uppercase text-white/60 mb-2">
                  {menCount} montres disponibles
                </p>
                <h2 className="font-serif text-4xl font-bold text-white">Collection Homme</h2>
                <span className="mt-3 inline-flex items-center gap-2 text-sm text-white/60 group-hover:text-white transition-colors">
                  Découvrir <span className="group-hover:translate-x-1 transition-transform inline-block">→</span>
                </span>
              </div>
            </Link>

            {/* Collection Femme */}
            <Link
              href="/collections/women"
              className="group relative block overflow-hidden rounded-2xl aspect-[4/3] bg-zinc-800"
            >
              <Image
                src="/assets/products/women/watch-001.webp.webp"
                alt="Collection Femme — montres de luxe Aurora Luxe"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10 z-10" />
              <div className="absolute bottom-0 left-0 z-20 p-8">
                <p className="text-xs font-semibold tracking-widest uppercase text-white/60 mb-2">
                  {womenCount} montres disponibles
                </p>
                <h2 className="font-serif text-4xl font-bold text-white">Collection Femme</h2>
                <span className="mt-3 inline-flex items-center gap-2 text-sm text-white/60 group-hover:text-white transition-colors">
                  Découvrir <span className="group-hover:translate-x-1 transition-transform inline-block">→</span>
                </span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Featured Products ── */}
      {featured.length > 0 && (
        <section className="py-16 md:py-24" style={{ backgroundColor: 'var(--bg-2)' }}>
          <div className="mx-auto max-w-7xl px-6">
            <div className="flex items-end justify-between mb-10">
              <div>
                <p className="text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: 'var(--text-2)' }}>
                  Sélection
                </p>
                <h2 className="font-serif text-4xl font-bold" style={{ color: 'var(--text)' }}>
                  Meilleures Ventes
                </h2>
              </div>
              <Link
                href="/collections/homme"
                className="hidden sm:inline-flex items-center gap-2 text-sm font-medium transition-colors hover:underline"
                style={{ color: 'var(--text-2)' }}
              >
                Voir tout →
              </Link>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {featured.map((product) => {
                const images = JSON.parse(product.images) as string[]
                const img = images[0] || null
                const isSale = product.salePrice != null && product.salePrice < product.price
                const discount = isSale ? Math.round(((product.price - product.salePrice!) / product.price) * 100) : 0

                return (
                  <Link key={product.id} href={`/products/${product.slug}`} className="group block">
                    <div
                      className="rounded-xl overflow-hidden transition-all hover:shadow-xl"
                      style={{ backgroundColor: 'var(--bg)', border: '1px solid var(--border)' }}
                    >
                      <div className="relative aspect-square overflow-hidden" style={{ backgroundColor: 'var(--bg-2)' }}>
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
                            <span className="text-xs">Image à venir</span>
                          </div>
                        )}
                        {isSale && (
                          <div className="absolute top-3 left-3 bg-red-600 text-white px-2 py-1 rounded-md text-xs font-bold">
                            -{discount}%
                          </div>
                        )}
                        {!isSale && product.featured && (
                          <div className="absolute top-3 left-3 bg-black/80 text-white px-2 py-1 rounded-md text-xs font-medium">
                            Bestseller
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="font-medium text-sm leading-snug line-clamp-2" style={{ color: 'var(--text)' }}>
                          {product.name}
                        </h3>
                        <div className="mt-3 flex items-baseline gap-2">
                          {isSale ? (
                            <>
                              <span className="font-bold text-red-600">{formatPrice(product.salePrice!)}</span>
                              <span className="text-xs line-through" style={{ color: 'var(--text-muted)' }}>
                                {formatPrice(product.price)}
                              </span>
                            </>
                          ) : (
                            <span className="font-bold" style={{ color: 'var(--text)' }}>
                              {formatPrice(product.price)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>

            <div className="mt-8 text-center sm:hidden">
              <Link
                href="/collections/homme"
                className="inline-block px-6 py-3 rounded-full border text-sm font-medium transition-colors hover:bg-black hover:text-white hover:border-black"
                style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
              >
                Voir toute la collection →
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── Trust Signals ── */}
      <section className="py-14" style={{ backgroundColor: 'var(--bg)' }}>
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: '💳', title: 'Cash on Delivery', desc: 'Payez à la livraison — aucune carte requise.' },
              { icon: '🚚', title: 'Livraison au Maroc', desc: 'Livraison gratuite partout au Maroc en 24/48h.' },
              { icon: '💬', title: 'Support WhatsApp', desc: 'Contactez-nous directement sur WhatsApp.' },
              { icon: '✓', title: 'Produits Authentiques', desc: 'Chaque montre est garantie 100% originale.' },
            ].map((item) => (
              <div
                key={item.title}
                className="p-6 rounded-xl text-center"
                style={{ backgroundColor: 'var(--bg-2)', border: '1px solid var(--border)' }}
              >
                <div className="text-3xl mb-3">{item.icon}</div>
                <h3 className="font-semibold text-sm mb-1" style={{ color: 'var(--text)' }}>{item.title}</h3>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-2)' }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Brand Story ── */}
      <section className="py-16 md:py-24" style={{ backgroundColor: 'var(--bg-2)' }}>
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-12 md:grid-cols-2 md:items-center">
            <div>
              <p className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: 'var(--text-2)' }}>
                Notre histoire
              </p>
              <h2 className="font-serif text-4xl font-bold" style={{ color: 'var(--text)' }}>
                L&apos;art de mesurer le temps
              </h2>
              <p className="mt-6 text-base leading-relaxed" style={{ color: 'var(--text-2)' }}>
                Aurora Luxe est née de la passion pour l&apos;élégance intemporelle. Chaque montre de notre collection est sélectionnée pour son design exquis, sa qualité supérieure et sa capacité à sublimer vos moments les plus précieux.
              </p>
              <p className="mt-4 text-base leading-relaxed" style={{ color: 'var(--text-2)' }}>
                Livraison gratuite partout au Maroc en 24/48h — aucun paiement en ligne requis.
              </p>
              <div className="mt-8">
                <Link
                  href="/about"
                  className="inline-block rounded-full border px-6 py-3 text-sm font-medium transition-colors hover:bg-black hover:text-white hover:border-black"
                  style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
                >
                  En savoir plus
                </Link>
              </div>
            </div>
            <div
              className="rounded-2xl aspect-[4/3] flex items-center justify-center"
              style={{ backgroundColor: 'var(--bg)', border: '1px solid var(--border)' }}
            >
              <div className="text-center">
                <div className="font-serif text-5xl font-bold mb-2" style={{ color: 'var(--text)' }}>Aurora</div>
                <div className="text-xs tracking-[0.4em] uppercase" style={{ color: 'var(--text-2)' }}>Luxe · Maroc</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Instagram ── */}
      <section className="py-16 md:py-24" style={{ backgroundColor: 'var(--bg)' }}>
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center">
            <p className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: 'var(--text-2)' }}>
              Instagram
            </p>
            <h2 className="font-serif text-4xl font-bold" style={{ color: 'var(--text)' }}>
              Suivez-nous sur Instagram
            </h2>
            <p className="mt-4 max-w-lg mx-auto text-base" style={{ color: 'var(--text-2)' }}>
              Découvrez nos collections en avant-première, les nouveautés et l&apos;actualité Aurora Luxe sur Instagram.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="https://www.instagram.com/aurora.luxe0/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 px-8 py-3.5 rounded-full font-semibold text-sm text-white transition-all hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)' }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
                @aurora.luxe0
              </a>
              <a
                href="https://www.instagram.com/aurora.luxe0/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full border text-sm font-medium transition-colors hover:bg-black hover:text-white hover:border-black"
                style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
              >
                Découvrir notre Instagram
              </a>
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}
