import Link from 'next/link'
import Image from 'next/image'
import { Heart, ShoppingBag } from 'lucide-react'

interface ProductCardProps {
  product: any
  variant?: 'default' | 'compact'
}

export function ProductCard({ product, variant = 'default' }: ProductCardProps) {
  const images = JSON.parse(product.images) as string[]
  const isSale = product.salePrice && product.salePrice < product.price

  if (variant === 'compact') {
    return (
      <Link href={`/products/${product.slug}`} className="block group">
        <div className="bg-white rounded-lg overflow-hidden border border-aurora/10 hover:shadow-lg transition-shadow">
          <div className="relative aspect-square overflow-hidden">
            <Image
              src={images[0] || '/assets/products/placeholder.jpg'}
              alt={product.name}
              fill
              className="object-cover transition-transform group-hover:scale-105"
            />
          </div>
          <div className="p-4">
            <h3 className="font-medium text-sm line-clamp-2">{product.name}</h3>
            <div className="mt-2 flex items-center justify-between">
              <div className="flex items-baseline gap-2">
                {isSale && (
                  <span className="text-aurora-2 line-through text-xs">
                    {product.price.toFixed(2)} DH
                  </span>
                )}
                <span className="font-bold">
                  {(isSale ? product.salePrice : product.price).toFixed(2)} DH
                </span>
              </div>
              <ShoppingBag className="h-4 w-4 text-aurora-2" />
            </div>
          </div>
        </div>
      </Link>
    )
  }

  return (
    <Link href={`/products/${product.slug}`} className="block group">
      <div className="bg-white rounded-lg overflow-hidden border border-aurora/10 hover:shadow-lg transition-shadow">
        <div className="relative aspect-square overflow-hidden">
          <Image
            src={images[0] || '/assets/products/placeholder.jpg'}
            alt={product.name}
            fill
            className="object-cover transition-transform group-hover:scale-105"
          />
          {isSale && (
            <div className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 rounded text-xs font-bold">
              -{Math.round(((product.price - product.salePrice) / product.price) * 100)}%
            </div>
          )}
        </div>
        <div className="p-6">
          <div className="flex justify-between items-start">
            <h3 className="font-medium text-lg line-clamp-2">{product.name}</h3>
            <button
              className="p-2 rounded-full hover:bg-aurora/10 transition-colors"
              aria-label="Ajouter aux favoris"
            >
              <Heart className="h-4 w-4 text-aurora-2" />
            </button>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-baseline gap-2">
              {isSale && (
                <span className="text-aurora-2 line-through">
                  {product.price.toFixed(2)} DH
                </span>
              )}
              <span className="font-bold text-lg">
                {(isSale ? product.salePrice : product.price).toFixed(2)} DH
              </span>
            </div>
            <ShoppingBag className="h-5 w-5 text-aurora-2" />
          </div>
          <div className="mt-4 text-sm text-aurora-2">
            {product.category === 'MEN' ? 'Homme' : 'Femme'}
          </div>
        </div>
      </div>
    </Link>
  )
}
