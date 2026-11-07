'use client'

import { formatPrice } from '@/lib/utils'
import { useCartStore } from '@/lib/store/cart'
import { useState, useEffect } from 'react'
import Link from 'next/link'

const CITIES = [
  'Casablanca', 'Rabat', 'Marrakech', 'Fès', 'Tanger', 'Agadir', 'Meknès',
  'Oujda', 'Kenitra', 'Tétouan', 'Salé', 'Mohammedia', 'El Jadida',
  'Safi', 'Béni Mellal', 'Nador', 'Khémisset', 'Larache', 'Khouribga',
  'Settat', 'Berrechid', 'Khénifra', 'Taza', 'Ifrane', 'Tiznit',
  'Ouarzazate', 'Errachidia', 'Laâyoune', 'Dakhla', 'Autre',
]

function validatePhone(phone: string) {
  return /^(0[67]\d{8}|(\+212|00212)[67]\d{8})$/.test(phone.replace(/\s/g, ''))
}

export default function CheckoutPage() {
  const [mounted, setMounted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formData, setFormData] = useState({
    customerName: '',
    phone: '',
    city: '',
    address: '',
  })

  useEffect(() => {
    setMounted(true)
    useCartStore.persist.rehydrate()
  }, [])

  const { items, getTotal, clear } = useCartStore()

  const shipping = 30
  const subtotal = getTotal()
  const total = subtotal + shipping

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    // Clear error on change
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  function validate() {
    const errs: Record<string, string> = {}
    if (!formData.customerName.trim() || formData.customerName.trim().length < 2) {
      errs.customerName = 'Nom complet requis (minimum 2 caractères)'
    }
    if (!formData.phone.trim()) {
      errs.phone = 'Numéro de téléphone requis'
    } else if (!validatePhone(formData.phone)) {
      errs.phone = 'Format invalide — ex: 0664810767 ou +212664810767'
    }
    if (!formData.city.trim()) {
      errs.city = 'Ville requise'
    }
    if (!formData.address.trim() || formData.address.trim().length < 5) {
      errs.address = 'Adresse complète requise (minimum 5 caractères)'
    }
    return errs
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (items.length === 0) return

    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      // Scroll to first error
      const firstErrorKey = Object.keys(errs)[0]
      document.getElementById(firstErrorKey)?.focus()
      return
    }

    setIsSubmitting(true)
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: formData.customerName.trim(),
          phone: formData.phone.replace(/\s/g, ''),
          city: formData.city.trim(),
          address: formData.address.trim(),
          items: items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            variantKey: item.variant,
          })),
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        // Show API validation errors
        if (data.errors?.fieldErrors) {
          const apiErrs: Record<string, string> = {}
          for (const [key, msgs] of Object.entries(data.errors.fieldErrors)) {
            if (Array.isArray(msgs) && msgs.length > 0) {
              apiErrs[key] = msgs[0] as string
            }
          }
          setErrors(apiErrs)
        } else {
          setErrors({ form: data.error || 'Une erreur est survenue' })
        }
        return
      }

      clear()
      window.location.href = `/order-confirmation/${data.reference}`
    } catch {
      setErrors({ form: 'Erreur réseau — veuillez réessayer' })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg)' }}>
        <div className="animate-pulse text-sm" style={{ color: 'var(--text-2)' }}>Chargement...</div>
      </div>
    )
  }

  const inputClass = `
    w-full px-4 py-3 rounded-lg border text-sm transition-colors
    focus:outline-none focus:ring-2 focus:ring-black
  `
  const inputStyle = {
    backgroundColor: 'var(--bg)',
    borderColor: 'var(--border)',
    color: 'var(--text)',
  }
  const inputErrorStyle = {
    ...inputStyle,
    borderColor: '#dc2626',
  }

  return (
    <div className="min-h-screen py-8 md:py-12" style={{ backgroundColor: 'var(--bg)' }}>
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        {/* Breadcrumb */}
        <nav className="flex gap-2 text-sm mb-8" style={{ color: 'var(--text-2)' }}>
          <Link href="/" className="hover:underline" style={{ color: 'var(--text-2)' }}>Accueil</Link>
          <span>/</span>
          <span style={{ color: 'var(--text)' }}>Commande</span>
        </nav>

        <h1 className="font-serif text-3xl md:text-4xl font-bold mb-8" style={{ color: 'var(--text)' }}>
          Finaliser la commande
        </h1>

        {items.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-lg mb-6" style={{ color: 'var(--text-2)' }}>Votre panier est vide.</p>
            <Link
              href="/collections/homme"
              className="inline-block px-8 py-3 bg-black text-white rounded-lg font-medium hover:bg-black/80 transition-colors"
            >
              Voir nos montres
            </Link>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
            {/* Form */}
            <div
              className="rounded-xl p-6 md:p-8"
              style={{ backgroundColor: 'var(--bg-2)', border: '1px solid var(--border)' }}
            >
              <h2 className="font-serif text-2xl font-bold mb-6" style={{ color: 'var(--text)' }}>
                Informations de livraison
              </h2>

              {errors.form && (
                <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                  {errors.form}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                {/* Full name */}
                <div>
                  <label htmlFor="customerName" className="block text-sm font-medium mb-2" style={{ color: 'var(--text)' }}>
                    Nom complet <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="customerName"
                    name="customerName"
                    type="text"
                    autoComplete="name"
                    value={formData.customerName}
                    onChange={handleChange}
                    placeholder="Ex: Ahmed Benali"
                    className={inputClass}
                    style={errors.customerName ? inputErrorStyle : inputStyle}
                  />
                  {errors.customerName && (
                    <p className="mt-1.5 text-xs text-red-600">{errors.customerName}</p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium mb-2" style={{ color: 'var(--text)' }}>
                    Numéro de téléphone <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="0664810767"
                    className={inputClass}
                    style={errors.phone ? inputErrorStyle : inputStyle}
                  />
                  {errors.phone ? (
                    <p className="mt-1.5 text-xs text-red-600">{errors.phone}</p>
                  ) : (
                    <p className="mt-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>
                      Format: 06XXXXXXXX ou 07XXXXXXXX
                    </p>
                  )}
                </div>

                {/* City */}
                <div>
                  <label htmlFor="city" className="block text-sm font-medium mb-2" style={{ color: 'var(--text)' }}>
                    Ville <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className={inputClass}
                    style={errors.city ? inputErrorStyle : inputStyle}
                  >
                    <option value="">Sélectionnez votre ville</option>
                    {CITIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  {errors.city && (
                    <p className="mt-1.5 text-xs text-red-600">{errors.city}</p>
                  )}
                </div>

                {/* Address */}
                <div>
                  <label htmlFor="address" className="block text-sm font-medium mb-2" style={{ color: 'var(--text)' }}>
                    Adresse de livraison <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="address"
                    name="address"
                    type="text"
                    autoComplete="street-address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Rue, Quartier, Numéro..."
                    className={inputClass}
                    style={errors.address ? inputErrorStyle : inputStyle}
                  />
                  {errors.address && (
                    <p className="mt-1.5 text-xs text-red-600">{errors.address}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 bg-black text-white rounded-xl font-semibold text-base hover:bg-black/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                      </svg>
                      Traitement en cours...
                    </span>
                  ) : (
                    `Confirmer la commande — ${formatPrice(total)}`
                  )}
                </button>

                <p className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>
                  Paiement Cash on Delivery à la livraison · Aucune carte bancaire requise
                </p>
              </form>
            </div>

            {/* Order summary */}
            <div className="lg:sticky lg:top-24 h-fit">
              <div
                className="rounded-xl p-6"
                style={{ backgroundColor: 'var(--bg-2)', border: '1px solid var(--border)' }}
              >
                <h2 className="font-serif text-xl font-bold mb-5" style={{ color: 'var(--text)' }}>
                  Résumé de la commande
                </h2>

                <div className="space-y-4 max-h-72 overflow-y-auto pr-1">
                  {items.map((item) => (
                    <div key={`${item.productId}-${item.variant || ''}`} className="flex gap-3">
                      <div
                        className="w-16 h-16 rounded-lg flex-shrink-0 overflow-hidden"
                        style={{ backgroundColor: 'var(--bg)', border: '1px solid var(--border)' }}
                      >
                        {item.image && (
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate" style={{ color: 'var(--text)' }}>{item.name}</p>
                        {item.variant && (
                          <p className="text-xs mt-0.5" style={{ color: 'var(--text-2)' }}>{item.variant}</p>
                        )}
                        <p className="text-sm mt-1" style={{ color: 'var(--text-2)' }}>
                          {formatPrice(item.salePrice ?? item.price)} × {item.quantity}
                        </p>
                      </div>
                      <div className="text-sm font-semibold flex-shrink-0" style={{ color: 'var(--text)' }}>
                        {formatPrice((item.salePrice ?? item.price) * item.quantity)}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-5 pt-4 space-y-2" style={{ borderTop: '1px solid var(--border)' }}>
                  <div className="flex justify-between text-sm">
                    <span style={{ color: 'var(--text-2)' }}>Sous-total</span>
                    <span style={{ color: 'var(--text)' }}>{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span style={{ color: 'var(--text-2)' }}>Livraison (COD)</span>
                    <span style={{ color: 'var(--text)' }}>{formatPrice(shipping)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg pt-3" style={{ borderTop: '1px solid var(--border)', color: 'var(--text)' }}>
                    <span>Total</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                </div>

                <div
                  className="mt-4 p-4 rounded-lg text-sm space-y-1.5"
                  style={{ backgroundColor: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text-2)' }}
                >
                  <p>🚚 <strong style={{ color: 'var(--text)' }}>Livraison:</strong> Livraison gratuite partout au Maroc en 24/48h</p>
                  <p>💳 <strong style={{ color: 'var(--text)' }}>Paiement:</strong> Cash à la livraison (COD)</p>
                  <p>📞 <strong style={{ color: 'var(--text)' }}>Suivi:</strong> Par WhatsApp après confirmation</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
