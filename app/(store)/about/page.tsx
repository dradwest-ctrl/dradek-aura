import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'À propos | Aurora Luxe — Montres de Luxe au Maroc',
  description: 'Découvrez l\'histoire d\'Aurora Luxe, votre boutique de montres de luxe au Maroc. Livraison Cash on Delivery partout au Maroc.',
}

export default function AboutPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg)', color: 'var(--text)' }}>
      <section className="relative py-24 md:py-32">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid items-center gap-16 md:grid-cols-2">
            <div>
              <h1 className="font-serif text-6xl font-bold">Aurora Luxe</h1>
              <p className="mt-8 text-lg leading-relaxed" style={{ color: 'var(--text-2)' }}>
                Aurora Luxe est née de la passion pour l&apos;élégance intemporelle. Fondée au Maroc, notre mission est de proposer des montres de luxe qui allient sophistication, authenticité et style moderne.
              </p>
              <p className="mt-6 text-lg leading-relaxed" style={{ color: 'var(--text-2)' }}>
                Chaque montre de notre collection est soigneusement sélectionnée pour son design, sa qualité et son histoire. Nous proposons des pièces qui se distinguent par leur raffinement et leur fonctionnalité.
              </p>
              <p className="mt-6 text-lg leading-relaxed" style={{ color: 'var(--text-2)' }}>
                Livraison gratuite partout au Maroc en 24/48h — aucun paiement en ligne requis.
              </p>
              <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                <a
                  href="/collections/homme"
                  className="rounded border px-8 py-3 text-center font-medium transition-colors hover:bg-black hover:text-white hover:border-black"
                  style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
                >
                  Collection Homme
                </a>
                <a
                  href="/collections/femme"
                  className="rounded border px-8 py-3 text-center font-medium transition-colors hover:bg-black hover:text-white hover:border-black"
                  style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
                >
                  Collection Femme
                </a>
              </div>
            </div>
            <div
              className="relative h-96 md:h-[500px] rounded-lg overflow-hidden flex items-center justify-center"
              style={{ backgroundColor: 'var(--bg-2)' }}
            >
              {/* Placeholder — replace with real brand photo */}
              <div className="text-center px-8">
                <div className="font-serif text-4xl font-bold mb-4" style={{ color: 'var(--text)' }}>Aurora Luxe</div>
                <p className="text-sm" style={{ color: 'var(--text-2)' }}>Montres de Luxe · Maroc</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24" style={{ backgroundColor: 'var(--bg-2)' }}>
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="font-serif text-5xl font-bold text-center">Nos Valeurs</h2>
          <div className="mt-16 grid gap-12 md:grid-cols-3">
            {[
              {
                icon: '🔒',
                title: 'Authenticité',
                desc: 'Chaque montre est garantie authentique. Nous sélectionnons uniquement des pièces provenant de sources fiables.',
              },
              {
                icon: '⚡',
                title: 'Excellence',
                desc: 'Nous ne vendons que des montres qui répondent à nos critères de qualité stricts, garantissant durabilité et élégance.',
              },
              {
                icon: '💬',
                title: 'Service Client',
                desc: 'Assistance WhatsApp dédiée, livraison à domicile et paiement à la livraison — nous sommes là pour vous.',
              },
            ].map((item) => (
              <div key={item.title} className="text-center p-8 rounded-lg" style={{ backgroundColor: 'var(--bg)', border: '1px solid var(--border)' }}>
                <div className="text-5xl mb-6">{item.icon}</div>
                <h3 className="font-serif text-2xl font-bold mb-4">{item.title}</h3>
                <p style={{ color: 'var(--text-2)' }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <h2 className="font-serif text-4xl font-bold mb-6">Pourquoi Aurora Luxe ?</h2>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { stat: 'COD', label: 'Paiement à la livraison' },
              { stat: '24/48h', label: 'Délai de livraison' },
              { stat: '100%', label: 'Produits authentiques' },
              { stat: '7j/7', label: 'Support WhatsApp' },
            ].map((item) => (
              <div key={item.label} className="p-6 rounded-lg" style={{ backgroundColor: 'var(--bg-2)', border: '1px solid var(--border)' }}>
                <div className="font-serif text-4xl font-bold mb-2">{item.stat}</div>
                <div className="text-sm" style={{ color: 'var(--text-2)' }}>{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
