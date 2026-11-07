'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { OrderTable } from '@/components/admin/OrderTable'
import { useCallback } from 'react'

interface Order {
  id: string
  reference: string
  customerName: string
  phone: string
  city: string
  status: string
  total: number
  createdAt: Date
  items: any[]
}

interface OrdersClientProps {
  orders: Order[]
  total: number
  selectedStatus: string
  searchQuery: string
}

export function OrdersClient({ orders, total: _total, selectedStatus, searchQuery }: OrdersClientProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
      router.push(`${pathname}?${params.toString()}`)
    },
    [router, pathname, searchParams]
  )

  async function handleStatusChange(orderId: string, newStatus: string) {
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (res.ok) {
        router.refresh()
      } else {
        const data = await res.json()
        alert(data.error || 'Erreur lors de la mise à jour du statut')
      }
    } catch {
      alert('Erreur réseau')
    }
  }

  return (
    <OrderTable
      orders={orders}
      selectedStatus={selectedStatus}
      onStatusFilter={(status) => updateParam('status', status)}
      searchQuery={searchQuery}
      onSearch={(query) => updateParam('search', query)}
      onStatusChange={handleStatusChange}
    />
  )
}
