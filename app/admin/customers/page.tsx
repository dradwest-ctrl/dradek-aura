'use client'

import { useEffect, useState } from 'react'

interface Customer {
  name: string
  phone: string
  city: string
  totalSpent: number
  orderCount: number
  lastOrderDate: Date
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])

  useEffect(() => {
    fetch('/api/admin/customers')
      .then((r) => r.json())
      .then(setCustomers)
      .catch(() => {})
  }, [])

  return (
    <div className="space-y-6">
      <h1 className="font-serif text-4xl font-bold">Gestion des clients</h1>

      <div className="bg-white rounded-lg shadow-sm border border-aurora/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-aurora/5 border-b border-aurora/10">
              <tr>
                <th className="px-6 py-4 text-sm font-semibold">Nom</th>
                <th className="px-6 py-4 text-sm font-semibold">Téléphone</th>
                <th className="px-6 py-4 text-sm font-semibold">Ville</th>
                <th className="px-6 py-4 text-sm font-semibold">Commandes</th>
                <th className="px-6 py-4 text-sm font-semibold">Total dépensé</th>
                <th className="px-6 py-4 text-sm font-semibold">Dernière commande</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => (
                <tr key={customer.phone} className="border-b border-aurora/10 hover:bg-aurora/5">
                  <td className="px-6 py-4 font-medium">{customer.name}</td>
                  <td className="px-6 py-4 text-sm">{customer.phone}</td>
                  <td className="px-6 py-4 text-sm">{customer.city}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className="px-2 py-1 bg-aurora/10 rounded-full text-xs">{customer.orderCount}</span>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium">{customer.totalSpent.toFixed(2)} MAD</td>
                  <td className="px-6 py-4 text-sm text-aurora-2">
                    {new Date(customer.lastOrderDate).toLocaleDateString('fr-MA')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {customers.length === 0 && (
          <div className="p-12 text-center text-aurora-2">
            <p>Pas de clients trouvés.</p>
          </div>
        )}
      </div>
    </div>
  )
}
