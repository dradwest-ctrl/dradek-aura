import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifySession } from '@/lib/auth'

export async function GET(_request: NextRequest) {
  const ok = await verifySession()
  if (!ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const orders = await prisma.order.findMany({
      where: { status: 'DELIVERED' },
      select: {
        customerName: true,
        phone: true,
        city: true,
        total: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    const customerMap = new Map<string, {
      name: string
      phone: string
      city: string
      totalSpent: number
      orderCount: number
      lastOrderDate: Date
    }>()

    orders.forEach((order) => {
      if (!customerMap.has(order.phone)) {
        customerMap.set(order.phone, {
          name: order.customerName,
          phone: order.phone,
          city: order.city,
          totalSpent: 0,
          orderCount: 0,
          lastOrderDate: order.createdAt,
        })
      }
      const customer = customerMap.get(order.phone)!
      customer.totalSpent += order.total
      customer.orderCount += 1
      if (order.createdAt > customer.lastOrderDate) {
        customer.lastOrderDate = order.createdAt
      }
    })

    const customers = Array.from(customerMap.values()).sort((a, b) => b.totalSpent - a.totalSpent)

    return NextResponse.json(customers)
  } catch (error) {
    console.error('Error fetching customers:', error)
    return NextResponse.json({ error: 'Failed to fetch customers' }, { status: 500 })
  }
}
