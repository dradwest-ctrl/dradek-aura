'use client'

import { ReactNode, useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { Toaster } from 'sonner'

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (pathname === '/admin/login') {
      setIsLoading(false)
      setIsAuthorized(true)
      return
    }

    const checkAuth = async () => {
      try {
        const res = await fetch('/api/admin/auth/me', { credentials: 'include' })
        if (res.ok) {
          setIsAuthorized(true)
        } else {
          router.push('/admin/login')
        }
      } catch {
        router.push('/admin/login')
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [pathname, router])

  if (pathname === '/admin/login') {
    return <>{children}</>
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="animate-pulse text-sm">Chargement de l'administration...</div>
      </div>
    )
  }

  if (!isAuthorized) {
    return null
  }

  return (
    <div className="min-h-screen flex" data-theme="dark" style={{ background: 'var(--bg)', color: 'var(--text)' }}>
      <AdminSidebar className="hidden md:flex flex-col fixed inset-y-0 left-0 z-40 w-64" />

      <div className="flex-1 md:pl-64 min-h-screen">
        <main className="p-4 md:p-8 pb-20 md:pb-8">
          {children}
        </main>
      </div>

      <Toaster position="top-right" richColors theme="dark" />
    </div>
  )
}
