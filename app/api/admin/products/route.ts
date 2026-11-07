import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { slugify } from '@/lib/utils'
import { verifySession } from '@/lib/auth'

const ProductCreateSchema = z.object({
  name: z.string().min(2).max(200),
  slug: z.string().min(2).max(200).regex(/^[a-z0-9-]+$/).optional(),
  category: z.enum(['MEN', 'WOMEN']),
  description: z.string().min(1).max(5000),
  price: z.number().positive(),
  salePrice: z.number().positive().nullable().optional(),
  sku: z.string().min(1).max(100),
  stock: z.number().int().min(0),
  images: z.array(z.string()).default([]),
  variants: z.string().default('[]'),
  featured: z.boolean().default(false),
  active: z.boolean().default(true),
})

export async function GET(request: NextRequest) {
  const ok = await verifySession()
  if (!ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const category = searchParams.get('category') || ''

    const whereClause: any = {}
    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
      ]
    }
    if (category) {
      whereClause.category = category
    }

    const products = await prisma.product.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(products)
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const ok = await verifySession()
  if (!ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await request.json()

    const validationResult = ProductCreateSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Données invalides', details: validationResult.error.flatten() },
        { status: 400 }
      )
    }

    const data = validationResult.data
    const slug = data.slug || slugify(data.name)

    // Check if slug is unique
    const existingProduct = await prisma.product.findUnique({ where: { slug } })
    if (existingProduct) {
      return NextResponse.json(
        { error: 'Un produit avec ce slug existe déjà' },
        { status: 409 }
      )
    }

    const product = await prisma.product.create({
      data: {
        name: data.name,
        slug,
        category: data.category,
        description: data.description,
        price: data.price,
        salePrice: data.salePrice ?? null,
        sku: data.sku,
        stock: data.stock,
        images: JSON.stringify(data.images),
        variants: data.variants,
        featured: data.featured,
        active: data.active,
      },
    })

    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 })
  }
}
