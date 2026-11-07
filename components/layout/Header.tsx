'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Menu, X, ShoppingBag, Sun, Moon, Search } from 'lucide-react'
import { useCartStore } from '@/lib/store/cart'
import { cn } from '@/lib/utils'

export function Header({ className }: { className?: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isDark, setIsDark] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [searchLoading, setSearchLoading] = useState(false)
  const cartCount = useCartStore((s) => s.getCount())

  useEffect(() => {
    const storedTheme = localStorage.getItem('aurora-theme')
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const initialDark = storedTheme ? storedTheme === 'dark' : systemPrefersDark
    setIsDark(initialDark)
    document.documentElement.setAttribute('data-theme', initialDark ? 'dark' : '')
  }, [])

  useEffect(() => {
    useCartStore.persist.rehydrate()
  }, [])

  const toggleTheme = () => {
    setIsDark((prev) => {
      const next = !prev
      document.documentElement.setAttribute('data-theme', next ? 'dark' : '')
      localStorage.setItem('aurora-theme', next ? 'dark' : 'light')
      return next
    })
  }

  // Debounced search
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setSearchResults([])
      return
    }
    const timer = setTimeout(async () => {
      setSearchLoading(true)
      try {
        const res = await fetch(`/api/products?search=${encodeURIComponent(searchQuery)}&limit=6`)
        if (res.ok) {
          const data = await res.json()
          setSearchResults(data.products ?? [])
        }
      } catch {
        // ignore
      } finally {
        setSearchLoading(false)
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  return (
    <>
      <header className={cn(
        'w-full border-b border-[var(--border)] bg-[var(--bg)] backdrop-blur-sm',
        className
      )}>
        <div className="mx-auto flex h-16 max-w-7xl items-center px-4 md:px-6">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="mr-4 md:hidden p-1"
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 font-serif text-xl font-bold tracking-widest uppercase">
            <img
              src="/assets/logo/auroraluxe-logo.svg.jpeg"
              alt="AuroraLuxe"
              className="h-8 w-auto object-contain"
            />
            <span>AuroraLuxe</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex md:gap-8 md:ml-10">
            <Link href="/" className="text-sm font-medium tracking-wide hover:opacity-60 transition-opacity">
              Accueil
            </Link>
            <Link href="/collections/men" className="text-sm font-medium tracking-wide hover:opacity-60 transition-opacity">
              Homme
            </Link>
            <Link href="/collections/women" className="text-sm font-medium tracking-wide hover:opacity-60 transition-opacity">
              Femme
            </Link>
            <Link href="/about" className="text-sm font-medium tracking-wide hover:opacity-60 transition-opacity">
              À propos
            </Link>
          </nav>

          {/* Right side actions — NO profile/user icon */}
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={() => setShowSearch(true)}
              className="p-2 rounded hover:bg-[var(--bg-2)] transition-colors"
              aria-label="Rechercher"
            >
              <Search className="h-5 w-5" />
            </button>
            <button
              onClick={toggleTheme}
              className="p-2 rounded hover:bg-[var(--bg-2)] transition-colors"
              aria-label="Changer le thème"
            >
              {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            <CartButton count={cartCount} />
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <nav className="md:hidden border-t border-[var(--border)] bg-[var(--bg)]">
            <div className="px-4 py-4 space-y-1">
              <Link href="/" className="block py-2.5 px-3 text-sm font-medium rounded hover:bg-[var(--bg-2)] transition-colors" onClick={() => setIsOpen(false)}>Accueil</Link>
              <Link href="/collections/men" className="block py-2.5 px-3 text-sm font-medium rounded hover:bg-[var(--bg-2)] transition-colors" onClick={() => setIsOpen(false)}>Collection Homme</Link>
              <Link href="/collections/women" className="block py-2.5 px-3 text-sm font-medium rounded hover:bg-[var(--bg-2)] transition-colors" onClick={() => setIsOpen(false)}>Collection Femme</Link>
              <Link href="/about" className="block py-2.5 px-3 text-sm font-medium rounded hover:bg-[var(--bg-2)] transition-colors" onClick={() => setIsOpen(false)}>À propos</Link>
            </div>
          </nav>
        )}
      </header>

      {/* Search Modal */}
      {showSearch && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-start justify-center pt-16 px-4" onClick={() => setShowSearch(false)}>
          <div
            className="w-full max-w-2xl rounded-lg shadow-2xl bg-[var(--bg)] border border-[var(--border)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 p-4 border-b border-[var(--border)]">
              <Search className="h-5 w-5 text-[var(--text-2)] flex-shrink-0" />
              <input
                autoFocus
                type="text"
                placeholder="Rechercher une montre..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent text-base outline-none placeholder:text-[var(--text-muted)]"
                style={{ color: 'var(--text)' }}
              />
              <button onClick={() => { setShowSearch(false); setSearchQuery('') }} className="p-1 rounded hover:bg-[var(--bg-2)]">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-2 max-h-96 overflow-y-auto">
              {searchLoading && (
                <p className="text-center py-8 text-sm text-[var(--text-2)]">Recherche en cours...</p>
              )}
              {!searchLoading && searchQuery.length >= 2 && searchResults.length === 0 && (
                <p className="text-center py-8 text-sm text-[var(--text-2)]">Aucun résultat pour &quot;{searchQuery}&quot;</p>
              )}
              {!searchLoading && searchResults.length > 0 && searchResults.map((p: any) => {
                const imgs = JSON.parse(p.images || '[]') as string[]
                return (
                  <Link
                    key={p.id}
                    href={`/products/${p.slug}`}
                    onClick={() => { setShowSearch(false); setSearchQuery('') }}
                    className="flex items-center gap-4 p-3 rounded-lg hover:bg-[var(--bg-2)] transition-colors"
                  >
                    <div className="w-12 h-12 rounded bg-[var(--bg-2)] flex-shrink-0 overflow-hidden">
                      {imgs[0] && (
                        <img src={imgs[0]} alt={p.name} className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate" style={{ color: 'var(--text)' }}>{p.name}</p>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--text-2)' }}>
                        {p.salePrice && p.salePrice < p.price
                          ? `${p.salePrice} DH`
                          : `${p.price} DH`}
                      </p>
                    </div>
                  </Link>
                )
              })}
              {!searchQuery && (
                <div className="p-4 text-center text-sm" style={{ color: 'var(--text-2)' }}>
                  Tapez pour rechercher parmi nos montres
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function CartButton({ count }: { count: number }) {
  const openCart = useCartStore((s) => s.openCart)
  return (
    <button
      onClick={openCart}
      className="relative p-2 rounded hover:bg-[var(--bg-2)] transition-colors"
      aria-label={`Panier — ${count} article${count !== 1 ? 's' : ''}`}
    >
      <ShoppingBag className="h-5 w-5" />
      {count > 0 && (
        <span className="absolute -top-0.5 -right-0.5 bg-black text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center leading-none">
          {count > 9 ? '9+' : count}
        </span>
      )}
    </button>
  )
}
