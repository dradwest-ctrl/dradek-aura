import { ReactNode } from 'react'
import { AnnouncementBar } from '@/components/layout/AnnouncementBar'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { CartDrawer } from '@/components/layout/CartDrawer'
import { WhatsAppButton } from '@/components/layout/WhatsAppButton'

export default function StoreLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <AnnouncementBar className="sticky top-0 z-50" />
      <Header className="sticky top-[var(--announcement-h)] z-40" />
      <CartDrawer />
      <WhatsAppButton />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}
