'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    const fetchProducts = () => {
      fetch(`/api/admin/products${search ? `?search=${search}` : ''}`)
        .then((r) => r.json())
        .then(setProducts)
        .catch(() => {})
    }
    fetchProducts()
  }, [search])

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer ce produit ?\n\n"${name}"`)) {
      return
    }

    setDeletingId(id)
    setErrorMsg('')
    setSuccessMsg('')

    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Erreur lors de la suppression')
      }

      setSuccessMsg('Produit supprimé avec succès.')
      setProducts((prev) => prev.filter((p) => p.id !== id))
      setTimeout(() => setSuccessMsg(''), 4000)
    } catch (err: any) {
      setErrorMsg(err.message || 'Erreur réseau lors de la suppression')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="space-y-6 text-white">
      <div className="flex justify-between items-center">
        <h1 className="font-serif text-4xl font-bold text-white">Gestion des produits</h1>
        <Link href="/admin/products/new" className="px-6 py-2 bg-white text-black rounded-md font-medium hover:bg-neutral-200 transition-colors">
          Ajouter un produit
        </Link>
      </div>

      {successMsg && (
        <div className="p-3 bg-green-950 text-green-200 border border-green-800 rounded-md text-sm font-medium">
          {successMsg}
        </div>
      )}
      {errorMsg && (
        <div className="p-3 bg-red-950 text-red-200 border border-red-800 rounded-md text-sm font-medium">
          {errorMsg}
        </div>
      )}

      <div className="bg-neutral-950 text-white rounded-lg shadow-sm border border-neutral-800 overflow-hidden">
        <div className="p-4 border-b border-neutral-800 bg-neutral-900/50">
          <input
            type="text"
            placeholder="Rechercher des produits..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full max-w-md px-4 py-2 bg-neutral-900 text-white border border-neutral-700 rounded-md focus:outline-none focus:ring-2 focus:ring-white placeholder:text-neutral-500"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-neutral-900/85 border-b border-neutral-800 text-xs uppercase tracking-wider text-neutral-400">
              <tr>
                <th className="px-6 py-4 font-semibold text-neutral-300">Image</th>
                <th className="px-6 py-4 font-semibold text-neutral-300">Nom</th>
                <th className="px-6 py-4 font-semibold text-neutral-300">Catégorie</th>
                <th className="px-6 py-4 font-semibold text-neutral-300">Prix</th>
                <th className="px-6 py-4 font-semibold text-neutral-300">Stock</th>
                <th className="px-6 py-4 font-semibold text-neutral-300">Statut</th>
                <th className="px-6 py-4 font-semibold text-neutral-300">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800 text-sm">
              {products.map((product) => {
                let images: string[] = []
                try {
                  images = JSON.parse(product.images || '[]')
                } catch {
                  images = [product.images || '/assets/products/placeholder.jpg']
                }

                return (
                  <tr key={product.id} className="hover:bg-neutral-900/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="w-12 h-12 bg-neutral-800 rounded overflow-hidden">
                        {images[0] && (
                          <img src={images[0]} alt={product.name} className="w-full h-full object-cover" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-white">{product.name}</div>
                      <div className="text-sm text-neutral-400">{product.sku}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-300">{product.category === 'MEN' ? 'Homme' : 'Femme'}</td>
                    <td className="px-6 py-4 text-sm font-medium text-white">{product.price.toFixed(2)} MAD</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-2 py-1 rounded text-xs ${product.stock <= 5 ? 'bg-red-950 text-red-300 border border-red-800' : 'bg-green-950 text-green-300 border border-green-800'}`}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${product.active ? 'bg-green-950 text-green-300 border border-green-800' : 'bg-neutral-800 text-neutral-300'}`}>
                        {product.active ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                        <Link href={`/admin/products/${product.id}/edit`} className="inline-flex items-center justify-center px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-blue-400 hover:text-blue-300 border border-neutral-700 rounded-md font-medium text-xs transition-colors whitespace-nowrap">
                          Modifier →
                        </Link>
                        <button
                          onClick={() => handleDelete(product.id, product.name)}
                          disabled={deletingId === product.id}
                          className="inline-flex items-center justify-center px-3 py-1.5 bg-red-950/60 hover:bg-red-900 text-red-300 border border-red-800 rounded-md font-medium text-xs transition-colors disabled:opacity-50 whitespace-nowrap"
                        >
                          {deletingId === product.id ? 'Suppression...' : 'Supprimer'}
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {products.length === 0 && (
          <div className="p-12 text-center text-neutral-400">
            <p>Pas de produits trouvés.</p>
          </div>
        )}
      </div>
    </div>
  )
}
