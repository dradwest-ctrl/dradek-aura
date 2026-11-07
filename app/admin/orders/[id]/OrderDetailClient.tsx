'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Phone, MessageSquare, Printer, Trash2, Check, ArrowLeft, Copy } from 'lucide-react'

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'En attente',
  CONFIRMED: 'Confirmée',
  PREPARING: 'En préparation',
  SHIPPED: 'Expédiée',
  DELIVERED: 'Livrée',
  CANCELLED: 'Annulée',
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-blue-100 text-blue-800 border-blue-200',
  CONFIRMED: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  PREPARING: 'bg-purple-100 text-purple-800 border-purple-200',
  SHIPPED: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  DELIVERED: 'bg-teal-100 text-teal-800 border-teal-200',
  CANCELLED: 'bg-red-100 text-red-800 border-red-200',
}

const STATUS_STEPS = ['PENDING', 'CONFIRMED', 'PREPARING', 'SHIPPED', 'DELIVERED']

interface OrderDetailClientProps {
  order: any
}

export function OrderDetailClient({ order }: OrderDetailClientProps) {
  const [currentStatus, setCurrentStatus] = useState(order.status)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [deleting, setDeleting] = useState(false)
  const router = useRouter()

  const statusOptions = ['PENDING', 'CONFIRMED', 'PREPARING', 'SHIPPED', 'DELIVERED', 'CANCELLED']

  async function updateStatus(newStatus: string) {
    if (newStatus === currentStatus) return
    setLoading(true)
    setMessage('')
    try {
      const res = await fetch(`/api/admin/orders/${order.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      const data = await res.json()
      if (!res.ok) {
        setMessage(data.error || 'Erreur lors de la mise à jour')
      } else {
        setCurrentStatus(newStatus)
        setMessage('Statut mis à jour avec succès')
        router.refresh()
      }
    } catch {
      setMessage('Erreur réseau')
    } finally {
      setLoading(false)
    }
  }

  async function handleDeleteOrder() {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer la commande #${order.reference} ?`)) {
      return
    }
    setDeleting(true)
    try {
      const res = await fetch(`/api/admin/orders/${order.id}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        router.push('/admin/orders')
        router.refresh()
      } else {
        const data = await res.json()
        alert(data.error || 'Erreur lors de la suppression')
      }
    } catch {
      alert('Erreur réseau')
    } finally {
      setDeleting(false)
    }
  }

  function handleCopyInfo() {
    const text = `Commande: ${order.reference}\nClient: ${order.customerName}\nTél: ${order.phone}\nVille: ${order.city}\nAdresse: ${order.address}\nTotal: ${order.total.toFixed(2)} MAD`
    navigator.clipboard.writeText(text)
    alert('Informations copiées dans le presse-papier !')
  }

  function handleWhatsApp() {
    const phone = order.phone.replace(/[^0-9]/g, '')
    const msg = encodeURIComponent(`Bonjour ${order.customerName}, nous vous contactons concernant votre commande ${order.reference} sur Aurora Luxe.`)
    window.open(`https://wa.me/${phone}?text=${msg}`, '_blank')
  }

  function handlePrint() {
    window.print()
  }

  return (
    <div className="space-y-6">
      {/* Top Header Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-xl border border-neutral-200 shadow-sm">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/admin/orders')}
            className="p-2 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors text-neutral-700"
            title="Retour"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-serif text-2xl md:text-3xl font-bold text-neutral-900">Commande #{order.reference}</h1>
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${STATUS_COLORS[currentStatus]}`}>
                {STATUS_LABELS[currentStatus] || currentStatus}
              </span>
            </div>
            <p className="text-sm text-neutral-500 mt-1">
              Passée le {new Date(order.createdAt).toLocaleDateString('fr-MA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-lg text-sm font-medium transition-colors"
          >
            <Printer className="h-4 w-4" />
            Imprimer
          </button>
          <button
            onClick={handleCopyInfo}
            className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-lg text-sm font-medium transition-colors"
          >
            <Copy className="h-4 w-4" />
            Copier
          </button>
          <button
            onClick={handleWhatsApp}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <MessageSquare className="h-4 w-4" />
            WhatsApp
          </button>
          <button
            onClick={handleDeleteOrder}
            disabled={deleting}
            className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg text-sm font-medium transition-colors"
          >
            <Trash2 className="h-4 w-4" />
            Supprimer
          </button>
        </div>
      </div>

      {/* Visual Order Progress Timeline */}
      <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm">
        <h3 className="text-sm font-semibold text-neutral-900 mb-6 uppercase tracking-wider">Progression de la commande</h3>
        <div className="flex items-center justify-between relative">
          {STATUS_STEPS.map((step, idx) => {
            const currentIndex = STATUS_STEPS.indexOf(currentStatus)
            const isCompleted = currentIndex >= idx && currentStatus !== 'CANCELLED'
            const isCurrent = currentStatus === step

            return (
              <div key={step} className="flex flex-col items-center relative z-10 flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                    currentStatus === 'CANCELLED'
                      ? 'bg-neutral-100 text-neutral-400 border-2 border-neutral-300'
                      : isCompleted
                      ? 'bg-black text-white shadow-md'
                      : 'bg-neutral-100 text-neutral-400 border-2 border-neutral-300'
                  }`}
                >
                  {isCompleted ? <Check className="h-5 w-5" /> : idx + 1}
                </div>
                <span className={`text-xs mt-2 font-medium ${isCurrent ? 'text-neutral-900 font-bold' : 'text-neutral-500'}`}>
                  {STATUS_LABELS[step]}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left 2 Columns: Products & Status Management */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Products Table */}
          <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-neutral-200">
              <h3 className="font-serif text-xl font-bold text-neutral-900">Articles commandés ({order.items.length})</h3>
            </div>
            <div className="divide-y divide-neutral-200">
              {order.items.map((item: any) => {
                const imgSrc = item.product?.images
                  ? (JSON.parse(item.product.images)[0] || '/assets/products/placeholder.jpg')
                  : '/assets/products/placeholder.jpg'
                return (
                  <div key={item.id} className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-neutral-50/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-neutral-100 rounded-lg overflow-hidden flex-shrink-0 border border-neutral-200">
                        <img src={imgSrc} alt={item.productName} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-neutral-900">{item.productName}</h4>
                        {item.variant && (
                          <p className="text-xs text-neutral-500 mt-0.5">Variante: {item.variant}</p>
                        )}
                        <p className="text-xs text-neutral-500 mt-0.5">Prix unitaire: {item.price.toFixed(2)} MAD</p>
                      </div>
                    </div>
                    <div className="text-right sm:text-right w-full sm:w-auto flex justify-between sm:block border-t sm:border-t-0 pt-2 sm:pt-0 border-neutral-100">
                      <div className="text-xs text-neutral-500 sm:hidden">Quantité: {item.quantity}</div>
                      <div className="text-sm font-semibold text-neutral-900">
                        {item.quantity} × {item.price.toFixed(2)} MAD
                      </div>
                      <div className="text-base font-bold text-neutral-900 mt-1">
                        {(item.price * item.quantity).toFixed(2)} MAD
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Status Management Section */}
          <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm">
            <h3 className="font-serif text-xl font-bold text-neutral-900 mb-4">Gestion du statut de la commande</h3>
            <div className="flex flex-wrap gap-3">
              {statusOptions.map((status) => {
                const isActive = status === currentStatus
                return (
                  <button
                    key={status}
                    disabled={loading || isActive}
                    onClick={() => updateStatus(status)}
                    className={`px-4 py-2.5 rounded-lg text-sm font-semibold border transition-all ${
                      isActive
                        ? `${STATUS_COLORS[status]} ring-2 ring-neutral-900 cursor-default shadow-sm`
                        : 'bg-neutral-50 hover:bg-neutral-100 text-neutral-700 border-neutral-200'
                    }`}
                  >
                    {loading && status !== currentStatus ? '...' : STATUS_LABELS[status] || status}
                  </button>
                )
              })}
            </div>
            {message && (
              <p className={`mt-4 text-sm font-medium ${message.includes('succès') ? 'text-emerald-700' : 'text-red-600'}`}>
                {message}
              </p>
            )}
          </div>
        </div>

        {/* Right Column: Customer Info & Financial Summary */}
        <div className="space-y-6">
          {/* Customer Information Card */}
          <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm space-y-4">
            <h3 className="font-serif text-xl font-bold text-neutral-900 pb-3 border-b border-neutral-200">Informations client</h3>
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-xs text-neutral-500 uppercase tracking-wider block">Nom complet</span>
                <span className="font-semibold text-neutral-900 text-base">{order.customerName}</span>
              </div>
              <div>
                <span className="text-xs text-neutral-500 uppercase tracking-wider block">Téléphone</span>
                <div className="flex items-center justify-between mt-1">
                  <span className="font-mono font-medium text-neutral-900">{order.phone}</span>
                  <div className="flex gap-2">
                    <a
                      href={`tel:${order.phone}`}
                      className="p-1.5 bg-neutral-100 hover:bg-neutral-200 rounded-md text-neutral-800 transition-colors"
                      title="Appeler"
                    >
                      <Phone className="h-4 w-4" />
                    </a>
                    <button
                      onClick={handleWhatsApp}
                      className="p-1.5 bg-emerald-50 hover:bg-emerald-100 rounded-md text-emerald-700 transition-colors"
                      title="WhatsApp"
                    >
                      <MessageSquare className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
              <div>
                <span className="text-xs text-neutral-500 uppercase tracking-wider block">Ville</span>
                <span className="font-medium text-neutral-900">{order.city}</span>
              </div>
              <div>
                <span className="text-xs text-neutral-500 uppercase tracking-wider block">Adresse de livraison</span>
                <span className="font-medium text-neutral-900 block mt-0.5">{order.address}</span>
                {order.addressExtra && (
                  <span className="text-neutral-500 text-xs block mt-0.5">Complément: {order.addressExtra}</span>
                )}
              </div>
              {order.notes && (
                <div>
                  <span className="text-xs text-neutral-500 uppercase tracking-wider block">Notes client</span>
                  <span className="text-neutral-700 text-xs italic block mt-0.5 bg-neutral-50 p-2.5 rounded-lg border border-neutral-200">{order.notes}</span>
                </div>
              )}
            </div>
          </div>

          {/* Financial Summary Card */}
          <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm space-y-4">
            <h3 className="font-serif text-xl font-bold text-neutral-900 pb-3 border-b border-neutral-200">Résumé financier</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-neutral-600">
                <span>Sous-total articles</span>
                <span className="font-medium text-neutral-900">{order.subtotal.toFixed(2)} MAD</span>
              </div>
              <div className="flex justify-between text-neutral-600">
                <span>Frais de livraison</span>
                <span className="font-medium text-neutral-900">
                  {order.shipping === 0 ? 'Gratuite' : `${order.shipping.toFixed(2)} MAD`}
                </span>
              </div>
              <div className="flex justify-between text-neutral-600 pb-3 border-b border-neutral-200">
                <span>Mode de paiement</span>
                <span className="font-medium text-neutral-900">{order.paymentMethod}</span>
              </div>
              <div className="flex justify-between items-center pt-1">
                <span className="font-serif text-lg font-bold text-neutral-900">Total à payer</span>
                <span className="text-xl font-bold text-neutral-900">{order.total.toFixed(2)} MAD</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
