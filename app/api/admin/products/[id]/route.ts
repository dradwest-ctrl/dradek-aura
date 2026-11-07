import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifySession } from '@/lib/auth'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const isValid = await verifySession()
    if (!isValid) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()

    const existing = await prisma.product.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Produit non trouvé' }, { status: 404 })
    }

    // If slug changed, check uniqueness
    if (body.slug && body.slug !== existing.slug) {
      const slugTaken = await prisma.product.findUnique({ where: { slug: body.slug } })
      if (slugTaken) {
        return NextResponse.json({ error: 'Ce slug est déjà utilisé' }, { status: 409 })
      }
    }

    const updated = await prisma.product.update({
      where: { id },
      data: {
        name: body.name ?? existing.name,
        slug: body.slug ?? existing.slug,
        category: body.category ?? existing.category,
        description: body.description ?? existing.description,
        price: body.price ?? existing.price,
        salePrice: body.salePrice !== undefined ? body.salePrice : existing.salePrice,
        sku: body.sku ?? existing.sku,
        stock: body.stock ?? existing.stock,
        images: typeof body.images === 'string' ? body.images : existing.images,
        variants: body.variants ?? existing.variants,
        featured: body.featured ?? existing.featured,
        active: body.active ?? existing.active,
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Error updating product:', error)
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const isValid = await verifySession()
    if (!isValid) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { id } = await params
    await prisma.product.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting product:', error)
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 })
  }
}
