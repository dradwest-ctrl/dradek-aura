export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const SearchSchema = z.object({
  category: z.enum(['MEN', 'WOMEN']).optional(),
  sort: z.enum(['price_asc', 'price_desc', 'newest', 'featured']).optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const parsed = SearchSchema.parse(Object.fromEntries(searchParams))

    const { category, sort, page = '1', limit = '12' } = parsed
    const skip = (parseInt(page) - 1) * parseInt(limit)

    const whereClause: any = { active: true }
    if (category) whereClause.category = category

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where: whereClause,
        skip,
        take: parseInt(limit),
        orderBy:
          sort === 'price_asc'
            ? { price: 'asc' }
            : sort === 'price_desc'
            ? { price: 'desc' }
            : sort === 'newest'
            ? { createdAt: 'desc' }
            : { featured: 'desc', createdAt: 'desc' },
      }),
      prisma.product.count({ where: whereClause }),
    ])

    return NextResponse.json({
      products,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    })
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
  }
}