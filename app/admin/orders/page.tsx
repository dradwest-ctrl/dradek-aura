import { prisma } from '@/lib/prisma'
import { Suspense } from 'react'
import { OrdersClient } from './OrdersClient'

async function getOrders(status?: string, search?: string) {
  const whereClause: any = {}

  if (status && status !== 'all') {
    whereClause.status = status
  }

  if (search) {
    whereClause.OR = [
      { reference: { contains: search } },
      { customerName: { contains: search } },
      { phone: { contains: search } },
    ]
  }

  const orders = await prisma.order.findMany({
    where: whereClause,
    orderBy: { createdAt: 'desc' },
    include: { items: true },
  })

  return orders
}

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; search?: string }>
}) {
  const resolved = await searchParams
  const status = resolved.status || 'all'
  const search = resolved.search || ''

  const orders = await getOrders(status === 'all' ? undefined : status, search)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="font-serif text-4xl font-bold">Gestion des commandes</h1>
        <div className="text-sm text-aurora-2">
          {orders.length} commande{orders.length !== 1 ? 's' : ''} trouvée{orders.length !== 1 ? 's' : ''}
        </div>
      </div>

      <Suspense fallback={<div className="p-8 text-center text-aurora-2">Chargement...</div>}>
        <OrdersClient
          orders={orders}
          total={orders.length}
          selectedStatus={status === 'all' ? '' : status}
          searchQuery={search}
        />
      </Suspense>
    </div>
  )
}
