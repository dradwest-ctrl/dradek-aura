import { z } from 'zod'

// ─── Admin Auth ─────────────────────────────────────────────────────────────

export const LoginSchema = z.object({
  username: z.string().min(1, 'Nom d\'utilisateur requis'),
  password: z.string().min(1, 'Mot de passe requis'),
})

// ─── Checkout / Orders ───────────────────────────────────────────────────────

export const OrderItemInputSchema = z.object({
  productId: z.string().cuid('ID produit invalide'),
  variantKey: z.string().optional(),
  quantity: z.number().int().min(1, 'Quantité minimale: 1').max(10, 'Quantité maximale: 10'),
})

export const CheckoutSchema = z.object({
  customerName: z
    .string()
    .min(2, 'Nom complet requis (min. 2 caractères)')
    .max(100, 'Nom trop long'),
  phone: z
    .string()
    .regex(
      /^(0[67]\d{8}|(\+212|00212)[67]\d{8})$/,
      'Numéro de téléphone invalide (format: 06XXXXXXXX ou 07XXXXXXXX)'
    ),
  city: z.string().min(1, 'Ville requise').max(100, 'Ville trop longue'),
  address: z
    .string()
    .min(5, 'Adresse de livraison requise (min. 5 caractères)')
    .max(200, 'Adresse trop longue'),
  items: z
    .array(OrderItemInputSchema)
    .min(1, 'Votre panier est vide'),
})

export type CheckoutInput = z.infer<typeof CheckoutSchema>

// ─── Product (Admin) ─────────────────────────────────────────────────────────

export const ProductSchema = z.object({
  name: z.string().min(2, 'Nom requis').max(200),
  slug: z
    .string()
    .min(2)
    .max(200)
    .regex(/^[a-z0-9-]+$/, 'Slug: lettres minuscules, chiffres et tirets uniquement'),
  category: z.enum(['MEN', 'WOMEN']),
  description: z.string().min(1, 'Description requise').max(5000),
  price: z.number().positive('Prix invalide').max(1000000),
  salePrice: z.number().positive().max(1000000).nullable().optional(),
  sku: z.string().min(1, 'SKU requis').max(100),
  stock: z.number().int().min(0, 'Stock invalide'),
  images: z.array(z.string()).default([]),
  variants: z.string().default('[]'), // JSON
  featured: z.boolean().default(false),
  active: z.boolean().default(true),
})

export type ProductInput = z.infer<typeof ProductSchema>

// ─── Settings ────────────────────────────────────────────────────────────────

export const SettingSchema = z.object({
  key: z.string().min(1).max(100),
  value: z.string().max(5000),
})

// ─── Order Status ────────────────────────────────────────────────────────────

export const ORDER_STATUSES = ['PENDING', 'CONFIRMED', 'PREPARING', 'SHIPPED', 'DELIVERED', 'CANCELLED'] as const
export type OrderStatus = typeof ORDER_STATUSES[number]

export const OrderStatusSchema = z.enum(ORDER_STATUSES)