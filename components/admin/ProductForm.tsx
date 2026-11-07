'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

interface ProductFormProps {
  categories: string[]
  existingSlugs: string[]
}

export function ProductForm({ categories, existingSlugs }: ProductFormProps) {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    category: '',
    description: '',
    price: '',
    salePrice: '',
    sku: '',
    stock: '0',
    variants: '[]',
    featured: false,
    active: true,
  })

  const [images, setImages] = useState<string[]>(['/assets/products/placeholder.jpg'])
  const [uploading, setUploading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[àâä]/g, 'a')
      .replace(/[éèêë]/g, 'e')
      .replace(/[îï]/g, 'i')
      .replace(/[ôö]/g, 'o')
      .replace(/[ùûü]/g, 'u')
      .replace(/ç/g, 'c')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
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

      // Client-side validation: format
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
      if (!validTypes.includes(file.type)) {
        setErrorMsg("Format d'image non autorisé. Utilisez JPG, PNG ou WEBP.")
        setUploading(false)
        return
      }

      // Client-side validation: size (10 MB)
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
          throw new Error(data.error || "Impossible de télécharger l'image. Veuillez réessayer.")
        }

        setImages((prev) => [...prev.filter(img => img !== '/assets/products/placeholder.jpg'), data.url])
      } catch (err: any) {
        setErrorMsg(err.message || "Impossible de télécharger l'image. Veuillez réessayer.")
      }
    }

    setUploading(false)
    e.target.value = ''
  }

  const removeImage = (indexToRemove: number) => {
    setImages((prev) => prev.filter((_, idx) => idx !== indexToRemove))
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) newErrors.name = 'Le nom est requis'
    if (!formData.slug.trim()) newErrors.slug = 'Le slug est requis'
    if (!categories.includes(formData.category))
      newErrors.category = 'Catégorie invalide'
    if (!formData.description.trim()) newErrors.description = 'La description est requise'
    if (!formData.price || parseFloat(formData.price) <= 0)
      newErrors.price = 'Prix invalide'
    if (formData.salePrice && parseFloat(formData.salePrice) <= 0)
      newErrors.salePrice = 'Prix de solde invalide'
    if (formData.salePrice && parseFloat(formData.salePrice) >= parseFloat(formData.price || '0'))
      newErrors.salePrice = 'Le prix de solde doit être inférieur au prix régulier'
    if (!formData.sku.trim()) newErrors.sku = 'Le SKU est requis'
    if (!formData.stock || parseInt(formData.stock) < 0)
      newErrors.stock = 'Stock invalide'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsSubmitting(true)
    setErrorMsg('')
    setSuccessMsg('')

    try {
      const response = await fetch('/api/admin/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          slug: formData.slug.trim(),
          category: formData.category,
          description: formData.description.trim(),
          price: parseFloat(formData.price),
          salePrice: formData.salePrice ? parseFloat(formData.salePrice) : null,
          sku: formData.sku.trim(),
          stock: parseInt(formData.stock),
          images: images.length > 0 ? images : ['/assets/products/placeholder.jpg'],
          variants: formData.variants || '[]',
          featured: formData.featured,
          active: formData.active,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Une erreur est survenue lors de la création')
      }

      setSuccessMsg('Produit créé avec succès ! Redirection...')
      setTimeout(() => {
        router.push('/admin/products')
        router.refresh()
      }, 1200)
    } catch (error: any) {
      console.error('Error creating product:', error)
      setErrorMsg(error.message || 'Erreur réseau')
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
          <div className="space-y-2">
            <label htmlFor="name" className="block text-sm font-semibold text-white">
              Nom du produit *
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleInputChange}
              onBlur={() => {
                if (formData.name && !formData.slug) {
                  setFormData((prev) => ({
                    ...prev,
                    slug: generateSlug(prev.name),
                  }))
                }
              }}
              className={cn(
                'w-full px-4 py-2 bg-neutral-900 text-white border border-neutral-700 rounded-md focus:outline-none focus:ring-2 focus:ring-white',
                errors.name && 'border-red-500'
              )}
              placeholder="Ex: Montre Classique Homme"
            />
            {errors.name && <p className="text-sm text-red-400">{errors.name}</p>}
          </div>

          <div className="space-y-2">
            <label htmlFor="slug" className="block text-sm font-semibold text-white">
              Slug *
            </label>
            <input
              id="slug"
              name="slug"
              type="text"
              value={formData.slug}
              onChange={handleInputChange}
              className={cn(
                'w-full px-4 py-2 bg-neutral-900 text-white border border-neutral-700 rounded-md focus:outline-none focus:ring-2 focus:ring-white',
                errors.slug && 'border-red-500'
              )}
              placeholder="exemple-montre-homme"
            />
            {errors.slug && <p className="text-sm text-red-400">{errors.slug}</p>}
            {formData.slug && !existingSlugs.includes(formData.slug) && (
              <p className="text-sm text-green-400">Slug disponible</p>
            )}
            {formData.slug && existingSlugs.includes(formData.slug) && (
              <p className="text-sm text-red-400">Ce slug est déjà utilisé</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="category" className="block text-sm font-semibold text-white">
              Catégorie *
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className={cn(
                'w-full px-4 py-2 bg-neutral-900 text-white border border-neutral-700 rounded-md focus:outline-none focus:ring-2 focus:ring-white',
                errors.category && 'border-red-500'
              )}
            >
              <option value="" className="bg-neutral-900 text-white">Sélectionnez une catégorie</option>
              {categories.map((category) => (
                <option key={category} value={category} className="bg-neutral-900 text-white">
                  {category === 'MEN' ? 'Homme' : 'Femme'}
                </option>
              ))}
            </select>
            {errors.category && <p className="text-sm text-red-400">{errors.category}</p>}
          </div>

          <div className="space-y-2">
            <label htmlFor="sku" className="block text-sm font-semibold text-white">
              SKU *
            </label>
            <input
              id="sku"
              name="sku"
              type="text"
              value={formData.sku}
              onChange={handleInputChange}
              className={cn(
                'w-full px-4 py-2 bg-neutral-900 text-white border border-neutral-700 rounded-md focus:outline-none focus:ring-2 focus:ring-white',
                errors.sku && 'border-red-500'
              )}
              placeholder="SKU123"
            />
            {errors.sku && <p className="text-sm text-red-400">{errors.sku}</p>}
          </div>

          <div className="space-y-2">
            <label htmlFor="price" className="block text-sm font-semibold text-white">
              Prix (MAD) *
            </label>
            <input
              id="price"
              name="price"
              type="number"
              min="0"
              step="0.01"
              value={formData.price}
              onChange={handleInputChange}
              className={cn(
                'w-full px-4 py-2 bg-neutral-900 text-white border border-neutral-700 rounded-md focus:outline-none focus:ring-2 focus:ring-white',
                errors.price && 'border-red-500'
              )}
              placeholder="2500"
            />
            {errors.price && <p className="text-sm text-red-400">{errors.price}</p>}
          </div>

          <div className="space-y-2">
            <label htmlFor="salePrice" className="block text-sm font-semibold text-white">
              Prix de solde (MAD) (optionnel)
            </label>
            <input
              id="salePrice"
              name="salePrice"
              type="number"
              min="0"
              step="0.01"
              value={formData.salePrice}
              onChange={handleInputChange}
              className={cn(
                'w-full px-4 py-2 bg-neutral-900 text-white border border-neutral-700 rounded-md focus:outline-none focus:ring-2 focus:ring-white',
                errors.salePrice && 'border-red-500'
              )}
              placeholder="2200"
            />
            {errors.salePrice && <p className="text-sm text-red-400">{errors.salePrice}</p>}
          </div>

          <div className="space-y-2">
            <label htmlFor="stock" className="block text-sm font-semibold text-white">
              Stock *
            </label>
            <input
              id="stock"
              name="stock"
              type="number"
              min="0"
              value={formData.stock}
              onChange={handleInputChange}
              className={cn(
                'w-full px-4 py-2 bg-neutral-900 text-white border border-neutral-700 rounded-md focus:outline-none focus:ring-2 focus:ring-white',
                errors.stock && 'border-red-500'
              )}
              placeholder="10"
            />
            {errors.stock && <p className="text-sm text-red-400">{errors.stock}</p>}
          </div>

          <div className="space-y-2 md:col-span-2">
            <label htmlFor="description" className="block text-sm font-semibold text-white">
              Description *
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              value={formData.description}
              onChange={handleInputChange}
              className={cn(
                'w-full px-4 py-2 bg-neutral-900 text-white border border-neutral-700 rounded-md focus:outline-none focus:ring-2 focus:ring-white resize-none',
                errors.description && 'border-red-500'
              )}
              placeholder="Description détaillée du produit..."
            />
            {errors.description && <p className="text-sm text-red-400">{errors.description}</p>}
          </div>

          {/* Professional Image Upload Section */}
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

          <div className="space-y-2 md:col-span-2">
            <label className="block text-sm font-semibold text-white">Options</label>
            <div className="flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="featured"
                  checked={formData.featured}
                  onChange={handleInputChange}
                  className="h-4 w-4 rounded border-neutral-700 bg-neutral-900 text-white focus:ring-white"
                />
                <span className="text-sm font-medium text-white">Produit vedette</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="active"
                  checked={formData.active}
                  onChange={handleInputChange}
                  className="h-4 w-4 rounded border-neutral-700 bg-neutral-900 text-white focus:ring-white"
                />
                <span className="text-sm font-medium text-white">Produit actif</span>
              </label>
            </div>
          </div>

          <div className="space-y-2 md:col-span-2">
            <label htmlFor="variants" className="block text-sm font-semibold text-white">
              Variants (JSON)
            </label>
            <textarea
              id="variants"
              name="variants"
              rows={3}
              value={formData.variants}
              onChange={handleInputChange}
              className="w-full px-4 py-2 bg-neutral-900 text-white border border-neutral-700 rounded-md focus:outline-none focus:ring-2 focus:ring-white resize-none font-mono text-sm"
              placeholder='{"Taille": ["40mm", "42mm"]}'
            />
            <p className="text-xs text-neutral-400">
              Format JSON: {`{"label": ["option1", "option2"]}`}
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-4 pt-4 border-t border-neutral-800">
          <button
            type="button"
            onClick={() => router.push('/admin/products')}
            className="px-6 py-2.5 border border-neutral-700 rounded-md font-medium text-neutral-300 hover:bg-neutral-900 transition-colors"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={isSubmitting || uploading}
            className="px-8 py-2.5 bg-white text-black rounded-md font-medium hover:bg-neutral-200 transition-colors disabled:opacity-50"
          >
            {isSubmitting ? 'Enregistrement...' : 'Enregistrer le produit'}
          </button>
        </div>
      </form>
    </div>
  )
}
