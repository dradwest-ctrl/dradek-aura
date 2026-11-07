import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { OrderDetailClient } from './OrderDetailClient'

async function getOrder(id: string) {
  try {
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    })
    return order
  } catch (error) {
    console.error('Error fetching order details:', error)
    return null
  }
}

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const resolved = await params
  const order = await getOrder(resolved.id)

  if (!order) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
        <div className="text-center max-w-md bg-neutral-900 p-8 rounded-xl border border-neutral-800 shadow-lg">
          <h1 className="font-serif text-3xl font-bold mb-3 text-white">Commande non trouvée</h1>
          <p className="text-neutral-400 text-sm mb-6">
            La commande demandée n'existe pas ou a été supprimée de la base de données.
          </p>
          <Link href="/admin/orders" className="inline-flex items-center justify-center px-6 py-2.5 bg-white text-black rounded-lg font-medium hover:bg-neutral-200 transition-colors">
            ← Retour aux commandes
          </Link>
        </div>
      </div>
    )
  }

  // Ensure items is always an array
  const safeOrder = {
    ...order,
    items: Array.isArray(order.items) ? order.items : [],
  }

  return <OrderDetailClient order={safeOrder} />
}
