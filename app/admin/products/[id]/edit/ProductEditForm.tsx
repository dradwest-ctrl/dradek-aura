'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

interface Product {
  id: string
  name: string
  slug: string
  category: string
  description: string
  price: number
  salePrice: number | null
  sku: string
  stock: number
  images: string
  variants: string
  featured: boolean
  active: boolean
}

interface ProductEditFormProps {
  product: Product
  existingSlugs: string[]
}

const categories = ['MEN', 'WOMEN']

export function ProductEditForm({ product, existingSlugs }: ProductEditFormProps) {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: product.name,
    slug: product.slug,
    category: product.category,
    description: product.description,
    price: String(product.price),
    salePrice: product.salePrice != null ? String(product.salePrice) : '',
    sku: product.sku,
    stock: String(product.stock),
    variants: product.variants,
    featured: product.featured,
    active: product.active,
  })

  // Parse existing images safely
  let initialImages: string[] = ['/assets/products/placeholder.jpg']
  try {
    const parsed = JSON.parse(product.images || '[]')
    if (Array.isArray(parsed) && parsed.length > 0) {
      initialImages = parsed
    }
  } catch {
    if (product.images) initialImages = [product.images]
  }

  const [images, setImages] = useState<string[]>(initialImages)
  const [uploading, setUploading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked
    setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files || files.length === 0) return

    if (images.length + files.length > 10) {
      setErrorMsg('Maximum de 10 images par produit autorisée.')
      return
    }

    setUploading(true)
    setErrorMsg('')

    for (let i = 0; i < files.length; i++) {
      const file = files[i]

      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
      if (!validTypes.includes(file.type)) {
        setErrorMsg("Format d'image non autorisé. Utilisez JPG, PNG ou WEBP.")
        setUploading(false)
        return
      }

      if (file.size > 10 * 1024 * 1024) {
        setErrorMsg('La taille maximale autorisée est de 10 Mo.')
        setUploading(false)
        return
      }

      const formPayload = new FormData()
      formPayload.append('file', file)

      try {
        const res = await fetch('/api/admin/upload', {
          method: 'POST',
          body: formPayload,
        })

        const data = await res.json()

        if (!res.ok) {
          throw new Error(data.error || "Impossible de télécharger l'image.")
        }

        setImages((prev) => [...prev.filter(img => img !== '/assets/products/placeholder.jpg'), data.url])
      } catch (err: any) {
        setErrorMsg(err.message || "Impossible de télécharger l'image.")
      }
    }

    setUploading(false)
    e.target.value = ''
  }

  const removeImage = (indexToRemove: number) => {
    setImages((prev) => prev.filter((_, idx) => idx !== indexToRemove))
  }

  function validate() {
    const errs: Record<string, string> = {}
    if (!formData.name.trim()) errs.name = 'Le nom est requis'
    if (!formData.slug.trim()) errs.slug = 'Le slug est requis'
    if (!categories.includes(formData.category)) errs.category = 'Catégorie invalide'
    if (!formData.description.trim()) errs.description = 'La description est requise'
    if (!formData.price || parseFloat(formData.price) <= 0) errs.price = 'Prix invalide'
    if (formData.salePrice && parseFloat(formData.salePrice) >= parseFloat(formData.price || '0'))
      errs.salePrice = 'Le prix de solde doit être inférieur au prix régulier'
    if (!formData.sku.trim()) errs.sku = 'Le SKU est requis'
    if (parseInt(formData.stock) < 0) errs.stock = 'Stock invalide'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    setIsSubmitting(true)
    setErrorMsg('')
    setSuccessMsg('')

    try {
      const res = await fetch(`/api/admin/products/${product.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          salePrice: formData.salePrice ? parseFloat(formData.salePrice) : null,
          stock: parseInt(formData.stock),
          images: JSON.stringify(images.length > 0 ? images : ['/assets/products/placeholder.jpg']),
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        setErrorMsg(data.error || 'Une erreur est survenue')
      } else {
        setSuccessMsg('Produit modifié avec succès ! Redirection...')
        setTimeout(() => {
          router.push('/admin/products')
          router.refresh()
        }, 1200)
      }
    } catch {
      setErrorMsg('Erreur réseau')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-black text-white rounded-lg shadow-sm border border-neutral-800 p-6">
      {successMsg && (
        <div className="mb-4 p-3 bg-green-950 text-green-200 border border-green-800 rounded-md text-sm font-medium">
          {successMsg}
        </div>
      )}
      {errorMsg && (
        <div className="mb-4 p-3 bg-red-950 text-red-200 border border-red-800 rounded-md text-sm font-medium">
          {errorMsg}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Name */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-white">Nom du produit *</label>
            <input name="name" type="text" value={formData.name} onChange={handleChange}
              className={cn('w-full px-4 py-2 bg-neutral-900 text-white border border-neutral-700 rounded-md focus:outline-none focus:ring-2 focus:ring-white', errors.name && 'border-red-500')} />
            {errors.name && <p className="text-sm text-red-400">{errors.name}</p>}
          </div>

          {/* Slug */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-white">Slug *</label>
            <input name="slug" type="text" value={formData.slug} onChange={handleChange}
              className={cn('w-full px-4 py-2 bg-neutral-900 text-white border border-neutral-700 rounded-md focus:outline-none focus:ring-2 focus:ring-white', errors.slug && 'border-red-500')} />
            {errors.slug && <p className="text-sm text-red-400">{errors.slug}</p>}
            {formData.slug && formData.slug !== product.slug && existingSlugs.includes(formData.slug) && (
              <p className="text-sm text-red-400">Ce slug est déjà utilisé</p>
            )}
          </div>

          {/* Category */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-white">Catégorie *</label>
            <select name="category" value={formData.category} onChange={handleChange}
              className={cn('w-full px-4 py-2 bg-neutral-900 text-white border border-neutral-700 rounded-md focus:outline-none focus:ring-2 focus:ring-white', errors.category && 'border-red-500')}>
              <option value="" className="bg-neutral-900 text-white">Sélectionnez une catégorie</option>
              {categories.map((c) => <option key={c} value={c} className="bg-neutral-900 text-white">{c === 'MEN' ? 'Homme' : 'Femme'}</option>)}
            </select>
            {errors.category && <p className="text-sm text-red-400">{errors.category}</p>}
          </div>

          {/* SKU */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-white">SKU *</label>
            <input name="sku" type="text" value={formData.sku} onChange={handleChange}
              className={cn('w-full px-4 py-2 bg-neutral-900 text-white border border-neutral-700 rounded-md focus:outline-none focus:ring-2 focus:ring-white', errors.sku && 'border-red-500')} />
            {errors.sku && <p className="text-sm text-red-400">{errors.sku}</p>}
          </div>

          {/* Price */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-white">Prix (MAD) *</label>
            <input name="price" type="number" min="0" step="0.01" value={formData.price} onChange={handleChange}
              className={cn('w-full px-4 py-2 bg-neutral-900 text-white border border-neutral-700 rounded-md focus:outline-none focus:ring-2 focus:ring-white', errors.price && 'border-red-500')} />
            {errors.price && <p className="text-sm text-red-400">{errors.price}</p>}
          </div>

          {/* Sale price */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-white">Prix de solde (MAD) (optionnel)</label>
            <input name="salePrice" type="number" min="0" step="0.01" value={formData.salePrice} onChange={handleChange}
              className={cn('w-full px-4 py-2 bg-neutral-900 text-white border border-neutral-700 rounded-md focus:outline-none focus:ring-2 focus:ring-white', errors.salePrice && 'border-red-500')} />
            {errors.salePrice && <p className="text-sm text-red-400">{errors.salePrice}</p>}
          </div>

          {/* Stock */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-white">Stock *</label>
            <input name="stock" type="number" min="0" value={formData.stock} onChange={handleChange}
              className={cn('w-full px-4 py-2 bg-neutral-900 text-white border border-neutral-700 rounded-md focus:outline-none focus:ring-2 focus:ring-white', errors.stock && 'border-red-500')} />
            {errors.stock && <p className="text-sm text-red-400">{errors.stock}</p>}
          </div>

          {/* Description */}
          <div className="space-y-2 md:col-span-2">
            <label className="block text-sm font-semibold text-white">Description *</label>
            <textarea name="description" rows={4} value={formData.description} onChange={handleChange}
              className={cn('w-full px-4 py-2 bg-neutral-900 text-white border border-neutral-700 rounded-md focus:outline-none focus:ring-2 focus:ring-white resize-none', errors.description && 'border-red-500')} />
            {errors.description && <p className="text-sm text-red-400">{errors.description}</p>}
          </div>

          {/* Professional Image Upload & Management Section */}
          <div className="space-y-3 md:col-span-2">
            <label className="block text-sm font-semibold text-white">
              Images du produit (Max 10 images, JPG, PNG, WEBP — Max 10 Mo)
            </label>
            <div className="flex flex-wrap gap-4 items-center">
              {images.map((imgUrl, idx) => (
                <div key={idx} className="relative w-24 h-24 bg-neutral-900 border border-neutral-700 rounded-lg overflow-hidden group">
                  <img src={imgUrl} alt={`Product ${idx}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 text-xs opacity-80 hover:opacity-100 transition-opacity"
                    title="Supprimer l'image"
                  >
                    ✕
                  </button>
                  {idx === 0 && (
                    <span className="absolute bottom-1 left-1 bg-black/70 text-[10px] px-1.5 py-0.5 rounded text-white">
                      Principal
                    </span>
                  )}
                </div>
              ))}

              {images.length < 10 && (
                <label className="w-24 h-24 flex flex-col items-center justify-center bg-neutral-900 border-2 border-dashed border-neutral-700 rounded-lg cursor-pointer hover:border-white transition-colors">
                  <span className="text-2xl text-neutral-400">+</span>
                  <span className="text-xs text-neutral-400 mt-1">{uploading ? 'Chargement...' : 'Ajouter'}</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    multiple
                    onChange={handleFileChange}
                    disabled={uploading}
                    className="hidden"
                  />
                </label>
              )}
            </div>
            {uploading && <p className="text-xs text-neutral-400 animate-pulse">Téléchargement et traitement des images en cours...</p>}
          </div>

          {/* Options */}
          <div className="space-y-2 md:col-span-2">
            <label className="block text-sm font-semibold text-white">Options</label>
            <div className="flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" name="featured" checked={formData.featured} onChange={handleChange} className="h-4 w-4 rounded border-neutral-700 bg-neutral-900 text-white focus:ring-white" />
                <span className="text-sm font-medium text-white">Produit vedette</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" name="active" checked={formData.active} onChange={handleChange} className="h-4 w-4 rounded border-neutral-700 bg-neutral-900 text-white focus:ring-white" />
                <span className="text-sm font-medium text-white">Produit actif</span>
              </label>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4 pt-4 border-t border-neutral-800">
          <button type="button" onClick={() => router.push('/admin/products')}
            className="px-6 py-2.5 border border-neutral-700 rounded-md font-medium text-neutral-300 hover:bg-neutral-900 transition-colors">
            Annuler
          </button>
          <button type="submit" disabled={isSubmitting || uploading}
            className="px-8 py-2.5 bg-white text-black rounded-md font-medium hover:bg-neutral-200 transition-colors disabled:opacity-50">
            {isSubmitting ? 'Enregistrement...' : 'Mettre à jour'}
          </button>
        </div>
      </form>
    </div>
  )
}
