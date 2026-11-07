'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { LayoutGrid, Package, ShoppingBag, Settings, LogOut, Users } from 'lucide-react'

const navItems = [
  { href: '/admin', label: 'Accueil', icon: LayoutGrid, exact: true },
  { href: '/admin/orders', label: 'Commandes', icon: ShoppingBag, exact: false },
  { href: '/admin/products', label: 'Produits', icon: Package, exact: false },
  { href: '/admin/customers', label: 'Clients', icon: Users, exact: false },
  { href: '/admin/settings', label: 'Paramètres & Social', icon: Settings, exact: false },
]

export function AdminSidebar({ className }: { className?: string }) {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    await fetch('/api/admin/auth/logout', { method: 'POST' })
    router.push('/admin/login')
  }

  return (
    <aside className={cn('w-64 border-r h-screen sticky top-0 flex flex-col justify-between', className)}
      style={{ background: 'var(--bg-2)', borderColor: 'var(--border)' }}>
      <div>
        <div className="p-6 border-b flex items-center gap-3" style={{ borderColor: 'var(--border)' }}>
          <img
            src="/assets/logo/auroraluxe-logo.svg.jpeg"
            alt="AuroraLuxe"
            className="h-8 w-auto object-contain"
          />
          <div>
            <h2 className="font-serif text-lg font-bold tracking-wide leading-none" style={{ color: 'var(--text)' }}>
              AURORA LUXE
            </h2>
            <p className="text-[10px] mt-1 tracking-widest uppercase" style={{ color: 'var(--text-2)' }}>
              Administration
            </p>
          </div>
        </div>

        <nav className="mt-4 px-3 space-y-1">
          {navItems.map((item) => {
            const isActive = item.exact
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-all',
                  isActive
                    ? 'border-r-2'
                    : 'hover:opacity-80'
                )}
                style={
                  isActive
                    ? { background: 'var(--bg)', color: 'var(--text)', borderColor: 'var(--text)' }
                    : { color: 'var(--text-2)' }
                }
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {item.label}
              </Link>
            )
          })}
        </nav>
      </div>

      <div className="p-3 border-t" style={{ borderColor: 'var(--border)' }}>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-all hover:opacity-80"
          style={{ color: 'var(--text-2)' }}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          Déconnexion
        </button>
      </div>
    </aside>
  )
}
