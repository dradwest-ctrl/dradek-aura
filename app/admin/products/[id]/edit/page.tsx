import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ProductEditForm } from './ProductEditForm'

async function getProduct(id: string) {
  return prisma.product.findUnique({ where: { id } })
}

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const product = await getProduct(id)

  if (!product) notFound()

  const existingSlugs = (
    await prisma.product.findMany({ select: { slug: true }, where: { NOT: { id } } })
  ).map((p) => p.slug)

  return (
    <div className="space-y-6 text-white">
      <div className="flex items-center gap-4">
        <Link href="/admin/products" className="text-sm font-medium text-neutral-400 hover:text-white">
          ← Retour aux produits
        </Link>
      </div>
      <h1 className="font-serif text-4xl font-bold text-white">Modifier le produit</h1>
      <ProductEditForm product={product} existingSlugs={existingSlugs} />
    </div>
  )
}
