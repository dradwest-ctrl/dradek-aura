'use client'

import { useCartStore } from '@/lib/store/cart'
import { useRouter } from 'next/navigation'

interface Product {
  id: string
  slug: string
  name: string
  price: number
  salePrice: number | null
  stock: number
  images: string
}

export function AddToCartButton({ product }: { product: Product }) {
  const add = useCartStore((s) => s.add)
  const router = useRouter()

  const images = JSON.parse(product.images) as string[]
  const image = images[0] || '/assets/products/placeholder.jpg'

  function buildItem(qty = 1) {
    return {
      productId: product.id,
      slug: product.slug,
      name: product.name,
      image,
      price: product.price,
      salePrice: product.salePrice ?? undefined,
      quantity: qty,
    }
  }

  function handleAddToCart() {
    add(buildItem(1))
  }

  function handleBuyNow() {
    add(buildItem(1))
    router.push('/checkout')
  }

  if (product.stock === 0) {
    return (
      <div className="mt-8">
        <button disabled className="w-full px-8 py-4 bg-zinc-800 text-zinc-400 rounded-xl font-medium cursor-not-allowed text-base">
          Rupture de stock
        </button>
      </div>
    )
  }

  return (
    <div className="mt-8 flex flex-col sm:flex-row gap-4">
      <button
        onClick={handleAddToCart}
        className="flex-1 px-8 py-4 bg-white text-black rounded-xl font-bold text-base hover:bg-zinc-200 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg shadow-white/5 border border-white/20"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
        </svg>
        Ajouter au panier
      </button>
      <button
        onClick={handleBuyNow}
        className="flex-1 px-8 py-4 bg-zinc-900 text-white rounded-xl font-bold text-base hover:bg-zinc-800 active:scale-[0.98] transition-all flex items-center justify-center gap-2 border border-zinc-700 shadow-xl"
      >
        <span>Commander maintenant</span>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
        </svg>
      </button>
    </div>
  )
}
