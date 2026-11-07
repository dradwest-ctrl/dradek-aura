'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

const DEFAULT_TEXT = 'LIVRAISON CASH ON DELIVERY PARTOUT AU MAROC  ✦  PAIEMENT À LA LIVRAISON  ✦  MONTRES AUTHENTIQUES GARANTIES  ✦  SUPPORT WHATSAPP 24/7'

export function AnnouncementBar({ className }: { className?: string }) {
  const [text, setText] = useState(DEFAULT_TEXT)

  useEffect(() => {
    fetch('/api/admin/settings')
      .then((r) => r.ok ? r.json() : null)
      .then((settings) => {
        if (settings?.announcement_enabled === 'true' && settings?.announcement_text) {
          setText(settings.announcement_text)
        }
      })
      .catch(() => {})
  }, [])

  return (
    <div className={cn('bg-black text-white overflow-hidden', className)} style={{ height: 'var(--announcement-h)' }}>
      <div className="marquee-track h-full flex items-center">
        <span className="mx-12 text-xs font-medium tracking-widest whitespace-nowrap">{text}</span>
        <span className="mx-12 text-xs font-medium tracking-widest whitespace-nowrap">{text}</span>
        <span className="mx-12 text-xs font-medium tracking-widest whitespace-nowrap">{text}</span>
      </div>
    </div>
  )
}
