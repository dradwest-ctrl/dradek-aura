import { prisma } from '@/lib/prisma'
import { StatsCards } from '@/components/admin/StatsCards'

async function getDashboardStats() {
  const [totalOrders, newOrders, confirmedOrders, shippedOrders, deliveredOrders, cancelledOrders, totalRevenue, pendingCODValue, totalProducts, lowStockProducts, customerCount] = await Promise.all([
    // Total orders
    prisma.order.count(),
    // New orders (PENDING status)
    prisma.order.count({ where: { status: 'PENDING' } }),
    // Confirmed orders (CONFIRMED status)
    prisma.order.count({ where: { status: 'CONFIRMED' } }),
    // Shipped orders
    prisma.order.count({ where: { status: 'SHIPPED' } }),
    // Delivered orders
    prisma.order.count({ where: { status: 'DELIVERED' } }),
    // Cancelled orders
    prisma.order.count({ where: { status: 'CANCELLED' } }),
    // Total revenue from delivered orders
    prisma.order.aggregate({
      where: { status: 'DELIVERED' },
      _sum: { total: true },
    }),
    // Pending COD value (PENDING + CONFIRMED status)
    prisma.order.aggregate({
      where: { status: { in: ['PENDING', 'CONFIRMED'] } },
      _sum: { total: true },
    }),
    // Total active products
    prisma.product.count({ where: { active: true } }),
    // Low stock products (stock <= 5)
    prisma.product.count({ where: { stock: { lte: 5 }, active: true } }),
    // Unique customers from delivered orders
    prisma.order.groupBy({
      by: ['phone'],
      _count: { phone: true },
      where: { status: 'DELIVERED' },
    }),
  ])

  return {
    totalOrders,
    newOrders,
    confirmedOrders,
    shippedOrders,
    deliveredOrders,
    cancelledOrders,
    totalRevenue: totalRevenue._sum.total || 0,
    pendingCODValue: pendingCODValue._sum.total || 0,
    totalProducts,
    lowStockProducts,
    customerCount: customerCount.length,
  }
}

export default async function DashboardPage() {
  const stats = await getDashboardStats()

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="font-serif text-4xl font-bold">Tableau de bord</h1>
        <p className="text-aurora-2">
          {new Date().toLocaleDateString('fr-MA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      <StatsCards {...stats} />

      {/* Recent Orders */}
      <div className="bg-white rounded-lg shadow-sm border border-aurora/10 overflow-hidden">
        <div className="p-6 border-b border-aurora/10 flex justify-between items-center">
          <h2 className="font-serif text-2xl font-bold">Commandes récentes</h2>
          <a href="/admin/orders" className="text-sm font-medium text-blue-600 hover:underline">
            Voir tout →
          </a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-aurora/5 border-b border-aurora/10 text-xs uppercase tracking-wider text-aurora-2">
              <tr>
                <th className="px-6 py-3">Référence</th>
                <th className="px-6 py-3">Client</th>
                <th className="px-6 py-3">Ville</th>
                <th className="px-6 py-3">Total</th>
                <th className="px-6 py-3">Statut</th>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-aurora/10 text-sm">
              {await prisma.order.findMany({ take: 5, orderBy: { createdAt: 'desc' } }).then(orders => orders.map(order => (
                <tr key={order.id} className="hover:bg-aurora/5">
                  <td className="px-6 py-4 font-mono font-medium">{order.reference}</td>
                  <td className="px-6 py-4">
                    <div className="font-medium">{order.customerName}</div>
                    <div className="text-xs text-aurora-2">{order.phone}</div>
                  </td>
                  <td className="px-6 py-4">{order.city}</td>
                  <td className="px-6 py-4 font-semibold">{order.total.toFixed(2)} MAD</td>
                  <td className="px-6 py-4">
                    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${
                      order.status === 'PENDING' ? 'bg-blue-100 text-blue-800' :
                      order.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' :
                      order.status === 'DELIVERED' ? 'bg-teal-100 text-teal-800' :
                      order.status === 'CANCELLED' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-aurora-2">{new Date(order.createdAt).toLocaleDateString('fr-MA')}</td>
                  <td className="px-6 py-4">
                    <a href={`/admin/orders/${order.id}`} className="text-blue-600 hover:underline font-medium text-xs">
                      Détails
                    </a>
                  </td>
                </tr>
              )))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white rounded-lg p-6 shadow-sm border border-aurora/10">
          <h3 className="font-semibold mb-2">Produits</h3>
          <p className="text-2xl font-bold text-aurora">{stats.totalProducts}</p>
          <p className="text-sm text-aurora-2 mt-1">Total actifs</p>
        </div>
        <div className="bg-white rounded-lg p-6 shadow-sm border border-aurora/10">
          <h3 className="font-semibold mb-2">Commandes en attente</h3>
          <p className="text-2xl font-bold text-blue-600">{stats.newOrders}</p>
          <p className="text-sm text-aurora-2 mt-1">À confirmer</p>
        </div>
        <div className="bg-white rounded-lg p-6 shadow-sm border border-aurora/10">
          <h3 className="font-semibold mb-2">Valeur COD</h3>
          <p className="text-2xl font-bold text-orange-600">{stats.pendingCODValue.toFixed(2)} MAD</p>
          <p className="text-sm text-aurora-2 mt-1">En attente de paiement</p>
        </div>
        <div className="bg-white rounded-lg p-6 shadow-sm border border-aurora/10">
          <h3 className="font-semibold mb-2">Clients</h3>
          <p className="text-2xl font-bold text-purple-600">{stats.customerCount}</p>
          <p className="text-sm text-aurora-2 mt-1">Clients uniques</p>
        </div>
      </div>
    </div>
  )
}
