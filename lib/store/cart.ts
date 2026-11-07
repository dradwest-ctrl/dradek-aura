'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CartItem {
  productId: string
  slug: string
  name: string
  image: string
  price: number
  salePrice?: number
  variant?: string
  quantity: number
}

interface CartStore {
  items: CartItem[]
  isOpen: boolean
  add: (item: CartItem) => void
  remove: (productId: string, variant?: string) => void
  updateQty: (productId: string, variant: string | undefined, qty: number) => void
  clear: () => void
  openCart: () => void
  closeCart: () => void
  getTotal: () => number
  getCount: () => number
}

function itemKey(productId: string, variant?: string) {
  return `${productId}__${variant ?? ''}`
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      add: (newItem) => {
        set((state) => {
          const key = itemKey(newItem.productId, newItem.variant)
          const existing = state.items.find(
            (i) => itemKey(i.productId, i.variant) === key
          )
          if (existing) {
            return {
              items: state.items.map((i) =>
                itemKey(i.productId, i.variant) === key
                  ? { ...i, quantity: Math.min(i.quantity + newItem.quantity, 10) }
                  : i
              ),
              isOpen: true,
            }
          }
          return { items: [...state.items, newItem], isOpen: true }
        })
      },

      remove: (productId, variant) => {
        const key = itemKey(productId, variant)
        set((state) => ({
          items: state.items.filter((i) => itemKey(i.productId, i.variant) !== key),
        }))
      },

      updateQty: (productId, variant, qty) => {
        const key = itemKey(productId, variant)
        if (qty <= 0) {
          get().remove(productId, variant)
          return
        }
        set((state) => ({
          items: state.items.map((i) =>
            itemKey(i.productId, i.variant) === key
              ? { ...i, quantity: Math.min(qty, 10) }
              : i
          ),
        }))
      },

      clear: () => set({ items: [] }),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),

      getTotal: () => {
        const { items } = get()
        return items.reduce((sum, i) => sum + (i.salePrice ?? i.price) * i.quantity, 0)
      },

      getCount: () => {
        const { items } = get()
        return items.reduce((sum, i) => sum + i.quantity, 0)
      },
    }),
    {
      name: 'aurora-cart',
      skipHydration: true,
    }
  )
)
