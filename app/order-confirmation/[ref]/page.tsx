import Link from 'next/link'
import { prisma } from '@/lib/prisma'

async function getOrder(reference: string) {
  const order = await prisma.order.findUnique({
    where: { reference },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
  })
  return order
}

export default async function OrderConfirmationPage({
  params,
}: {
  params: Promise<{ ref: string }>
}) {
  const resolved = await params
  const order = await getOrder(resolved.ref)

  if (!order) {
    return (
      <div className="min-h-screen bg-aurora text-aurora flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-serif text-4xl font-bold mb-4">Commande non trouvée</h1>
          <p className="text-aurora-2">Cette commande n'existe pas ou a été supprimée.</p>
          <Link href="/" className="mt-8 inline-block px-6 py-3 bg-aurora text-white rounded">
            Retour à l'accueil
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-aurora text-aurora">
      <div className="mx-auto max-w-3xl px-6 py-12">
        <div className="bg-white rounded-lg shadow-sm border border-aurora/10 p-8">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-10 h-10 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h1 className="font-serif text-4xl font-bold text-aurora mb-2">Commande confirmée !</h1>
            <p className="text-lg text-aurora-2">Merci pour votre achat</p>
          </div>

          <div className="border-t border-aurora/10 pt-6 mb-8">
            <h2 className="font-serif text-2xl font-bold mb-4">Détails de la commande</h2>
            <div className="bg-aurora/5 rounded-lg p-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm text-aurora-2">Référence de commande</p>
                  <p className="font-mono font-semibold">{order.reference}</p>
                </div>
                <div>
                  <p className="text-sm text-aurora-2">Date de commande</p>
                  <p className="font-semibold">
                    {new Date(order.createdAt).toLocaleDateString('fr-MA', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-aurora-2">Client</p>
                  <p className="font-semibold">{order.customerName}</p>
                </div>
                <div>
                  <p className="text-sm text-aurora-2">Statut de paiement</p>
                  <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    EN ATTENTE DE PAIEMENT (COD)
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="font-serif text-2xl font-bold mb-4">Articles commandés</h2>
            <div className="space-y-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex gap-4 p-4 bg-aurora/5 rounded-lg">
                  <div className="w-16 h-16 bg-gray-200 rounded flex-shrink-0 relative">
                    <img
                      src={item.product?.images ? (JSON.parse(item.product.images)[0] || '/assets/products/placeholder.jpg') : '/assets/products/placeholder.jpg'}
                      alt={item.productName}
                      className="object-cover w-full h-full rounded"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">{item.productName}</h3>
                    {item.variant && (
                      <p className="text-sm text-aurora-2">Variante: {item.variant}</p>
                    )}
                    <p className="text-sm text-aurora-2">
                      {item.price.toFixed(2)} MAD × {item.quantity}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{(item.price * item.quantity).toFixed(2)} MAD</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-aurora/10 pt-6">
            <div className="bg-aurora/5 rounded-lg p-6">
              <h2 className="font-serif text-2xl font-bold mb-4">Informations de livraison</h2>
              <div className="space-y-2 text-sm">
                <p>
                  <span className="text-aurora-2">Nom:</span> {order.customerName}
                </p>
                <p>
                  <span className="text-aurora-2">Téléphone:</span> {order.phone}
                </p>
                <p>
                  <span className="text-aurora-2">Ville:</span> {order.city}
                </p>
                <p>
                  <span className="text-aurora-2">Adresse:</span> {order.address}
                </p>
                {order.addressExtra && (
                  <p>
                    <span className="text-aurora-2">Complément:</span> {order.addressExtra}
                  </p>
                )}
                {order.notes && (
                  <p className="mt-4">
                    <span className="text-aurora-2">Notes:</span> {order.notes}
                  </p>
                )}
              </div>

              <div className="mt-6 pt-6 border-t border-aurora/10">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-aurora-2">Sous-total:</span>
                  <span>{order.subtotal.toFixed(2)} MAD</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-aurora-2">Livraison:</span>
                  <span>{order.shipping.toFixed(2)} MAD</span>
                </div>
                <div className="flex justify-between items-center text-lg font-bold pt-2 border-t">
                  <span>Total à payer à la livraison:</span>
                  <span className="text-2xl">{order.total.toFixed(2)} MAD</span>
                </div>
              </div>

              <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h3 className="font-semibold text-yellow-800 mb-2">Important — Paiement à la livraison</h3>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• Veuillez préparer le montant exact ou d'un montant supérieur à votre commande</li>
                  <li>• Nous livrerons votre commande à l'adresse indiquée</li>
                  <li>• Conservez ce numéro de commande ({order.reference}) pour toute question</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center">
            <Link
              href="/"
              className="inline-block px-8 py-3 bg-aurora text-white rounded-md font-medium hover:bg-aurora/80 transition-colors"
            >
              Continuer vos achats
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
