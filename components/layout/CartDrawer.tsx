'use client'

import { useCartStore } from '@/lib/store/cart'
import { formatPrice } from '@/lib/utils'
import { X } from 'lucide-react'
import Link from 'next/link'

export function CartDrawer() {
  const { items, isOpen, closeCart, remove, updateQty } = useCartStore()

  if (!isOpen) return null

  const total = items.reduce((sum, item) => sum + (item.salePrice ?? item.price) * item.quantity, 0)

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <div className="absolute inset-0 bg-black/50" onClick={closeCart} />
      <div className="relative w-full max-w-md bg-aurora h-full shadow-xl flex flex-col">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="text-xl font-serif">Panier</h2>
          <button onClick={closeCart} className="p-2 hover:bg-aurora/10 rounded">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {items.length === 0 ? (
            <p className="text-aurora-2 text-center py-8">Votre panier est vide</p>
          ) : (
            <>{items.map((item) => (
              <div key={`${item.productId}-${item.variant || ''}`} className="flex gap-4 bg-aurora-2 p-4 rounded-lg">
                <div className="w-20 h-20 bg-gray-200 rounded flex-shrink-0 relative">
                  <img src={item.image} alt={item.name} className="object-cover w-full h-full rounded" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm truncate">{item.name}</h3>
                  {item.variant && (
                    <p className="text-xs text-aurora-2 mt-1">{item.variant}</p>
                  )}
                  <p className="text-sm text-aurora-2 mt-1">
                    {formatPrice(item.salePrice ?? item.price)} × {item.quantity}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQty(item.productId, item.variant, item.quantity - 1)}
                      className="w-8 h-8 rounded bg-aurora border flex items-center justify-center hover:bg-aurora/20"
                    >
                      -
                    </button>
                    <span className="w-8 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQty(item.productId, item.variant, item.quantity + 1)}
                      className="w-8 h-8 rounded bg-aurora border flex items-center justify-center hover:bg-aurora/20"
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => remove(item.productId, item.variant)}
                    className="text-xs text-red-600 hover:underline"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            ))}</>
          )}
        </div>

        <div className="p-4 border-t bg-aurora">
          <div className="flex justify-between items-center mb-4">
            <span className="font-semibold">Total:</span>
            <span className="text-xl font-bold">{formatPrice(total)}</span>
          </div>
          <Link
            href="/checkout"
            onClick={closeCart}
            className="block w-full py-3 bg-aurora text-center rounded font-medium hover:bg-aurora/80 transition-colors"
          >
            Passer la commande (COD)
          </Link>
        </div>
      </div>
    </div>
  )
}
