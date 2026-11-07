import { Package, ShoppingBag, Truck, Users, Wallet } from 'lucide-react'

interface StatsCardsProps {
  totalOrders?: number
  newOrders?: number
  confirmedOrders?: number
  deliveredOrders?: number
  cancelledOrders?: number
  totalRevenue?: number
  pendingCODValue?: number
  totalProducts?: number
  lowStockProducts?: number
  customerCount?: number
}

export function StatsCards({
  totalOrders = 0,
  newOrders = 0,
  confirmedOrders = 0,
  deliveredOrders = 0,
  cancelledOrders = 0,
  totalRevenue = 0,
  pendingCODValue = 0,
  totalProducts = 0,
  lowStockProducts = 0,
  customerCount = 0,
}: StatsCardsProps) {
  const cards = [
    {
      label: 'Commandes total',
      value: totalOrders,
      icon: ShoppingBag,
      color: 'bg-blue-500/10 text-blue-600',
    },
    {
      label: 'Nouvelles',
      value: newOrders,
      icon: Truck,
      color: 'bg-green-500/10 text-green-600',
    },
    {
      label: 'Confirmées',
      value: confirmedOrders,
      icon: Package,
      color: 'bg-purple-500/10 text-purple-600',
    },
    {
      label: 'Livrées',
      value: deliveredOrders,
      icon: Package,
      color: 'bg-indigo-500/10 text-indigo-600',
    },
    {
      label: 'Annulées',
      value: cancelledOrders,
      icon: Package,
      color: 'bg-red-500/10 text-red-600',
    },
    {
      label: "Chiffre d'affaires",
      value: `${totalRevenue.toLocaleString('fr-MA')} MAD`,
      icon: Wallet,
      color: 'bg-amber-500/10 text-amber-600',
    },
    {
      label: 'COD en attente',
      value: `${pendingCODValue.toLocaleString('fr-MA')} MAD`,
      icon: Wallet,
      color: 'bg-orange-500/10 text-orange-600',
    },
    {
      label: 'Produits actifs',
      value: totalProducts,
      icon: Package,
      color: 'bg-cyan-500/10 text-cyan-600',
    },
    {
      label: 'Stock faible',
      value: lowStockProducts,
      icon: Package,
      color: 'bg-yellow-500/10 text-yellow-600',
    },
    {
      label: 'Clients',
      value: customerCount,
      icon: Users,
      color: 'bg-pink-500/10 text-pink-600',
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
      {cards.map((card, idx) => {
        const Icon = card.icon
        return (
          <div key={idx} className="bg-aurora-2 rounded-lg p-6 shadow-sm border border-aurora/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-aurora-2">{card.label}</p>
                <p className="mt-2 text-2xl font-bold text-aurora">{card.value}</p>
              </div>
              <div className={`p-3 rounded-full ${card.color}`}>
                <Icon className="h-6 w-6" />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
