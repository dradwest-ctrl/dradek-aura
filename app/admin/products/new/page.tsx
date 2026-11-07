import { prisma } from '@/lib/prisma'
import { ProductForm } from '@/components/admin/ProductForm'

async function getProductFormData() {
  const categories = ['MEN', 'WOMEN']

  const existingSlugs = (await prisma.product.findMany({
    select: { slug: true },
  })).map((p) => p.slug)

  return {
    categories,
    existingSlugs,
  }
}

export default async function NewProductPage() {
  const { categories, existingSlugs } = await getProductFormData()

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="font-serif text-4xl font-bold">Ajouter un produit</h1>
      </div>

      <ProductForm categories={categories} existingSlugs={existingSlugs} />
    </div>
  )
}
