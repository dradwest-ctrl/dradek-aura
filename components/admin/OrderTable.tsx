import Link from 'next/link'
import { ChevronDown, ChevronUp, Search } from 'lucide-react'
import { cn } from '@/lib/utils'

interface OrderTableProps {
  orders: any[]
  sortConfig?: { key: string; direction: 'asc' | 'desc' }
  onSort?: (key: string) => void
  onStatusChange?: (orderId: string, status: string) => void
  selectedStatus?: string
  onStatusFilter?: (status: string) => void
  searchQuery?: string
  onSearch?: (query: string) => void
}

export function OrderTable({
  orders,
  sortConfig,
  onSort,
  onStatusChange,
  selectedStatus,
  onStatusFilter,
  searchQuery,
  onSearch,
}: OrderTableProps) {
  const statusOptions = ['PENDING', 'CONFIRMED', 'PREPARING', 'SHIPPED', 'DELIVERED', 'CANCELLED']

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: 'bg-blue-100 text-blue-800',
      CONFIRMED: 'bg-green-100 text-green-800',
      PREPARING: 'bg-purple-100 text-purple-800',
      SHIPPED: 'bg-indigo-100 text-indigo-800',
      DELIVERED: 'bg-teal-100 text-teal-800',
      CANCELLED: 'bg-red-100 text-red-800',
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-aurora/10 overflow-hidden">
      {/* Search and Status Filter */}
      <div className="p-4 border-b bg-aurora/5 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-aurora-2" />
          <input
            type="text"
            placeholder="Rechercher par référence, nom ou téléphone..."
            value={searchQuery}
            onChange={(e) => onSearch?.(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-aurora/20 rounded-md focus:outline-none focus:ring-2 focus:ring-aurora"
          />
        </div>
        <select
          value={selectedStatus}
          onChange={(e) => onStatusFilter?.(e.target.value)}
          className="px-4 py-2 border border-aurora/20 rounded-md focus:outline-none focus:ring-2 focus:ring-aurora"
        >
          <option value="">Tous les statuts</option>
          {statusOptions.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-aurora/5 border-b border-aurora/10">
            <tr>
              <th className="px-6 py-4 text-sm font-semibold text-aurora cursor-pointer" onClick={() => onSort?.('reference')}>
                Référence
                {sortConfig?.key === 'reference' && (sortConfig.direction === 'asc' ? <ChevronUp className="inline h-4 w-4" /> : <ChevronDown className="inline h-4 w-4" />)}
              </th>
              <th className="px-6 py-4 text-sm font-semibold text-aurora">Client</th>
              <th className="px-6 py-4 text-sm font-semibold text-aurora">Téléphone</th>
              <th className="px-6 py-4 text-sm font-semibold text-aurora">Ville</th>
              <th className="px-6 py-4 text-sm font-semibold text-aurora">Articles</th>
              <th className="px-6 py-4 text-sm font-semibold text-aurora">Total</th>
              <th className="px-6 py-4 text-sm font-semibold text-aurora">Statut</th>
              <th className="px-6 py-4 text-sm font-semibold text-aurora">Date</th>
              <th className="px-6 py-4 text-sm font-semibold text-aurora">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-b border-aurora/10 hover:bg-aurora/5">
                <td className="px-6 py-4 text-sm font-mono">{order.reference}</td>
                <td className="px-6 py-4">
                  <div className="font-medium">{order.customerName}</div>
                  <div className="text-sm text-aurora-2">{order.city}</div>
                </td>
                <td className="px-6 py-4 text-sm">{order.phone}</td>
                <td className="px-6 py-4 text-sm">{order.city}</td>
                <td className="px-6 py-4 text-sm">
                  {order.items?.length} article{order.items?.length !== 1 ? 's' : ''}
                </td>
                <td className="px-6 py-4 text-sm font-medium">
                  {order.total.toFixed(2)} MAD
                </td>
                <td className="px-6 py-4">
                  <select
                    value={order.status}
                    onChange={(e) => onStatusChange?.(order.id, e.target.value)}
                    className={cn('text-xs px-2 py-1 rounded-full border-none', getStatusColor(order.status))}
                  >
                    {statusOptions.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-6 py-4 text-sm text-aurora-2">
                  {new Date(order.createdAt).toLocaleDateString('fr-MA')}
                </td>
                <td className="px-6 py-4 text-sm">
                  <Link
                    href={`/admin/orders/${order.id}`}
                    className="text-aurora hover:text-aurora-2 font-medium"
                  >
                    Voir détails
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {orders.length === 0 && (
        <div className="p-12 text-center text-aurora-2">
          <p className="text-lg">Aucune commande trouvée.</p>
        </div>
      )}
    </div>
  )
}
