import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'Aurora Luxe — Montres de Luxe au Maroc',
    template: '%s | Aurora Luxe',
  },
  description:
    'Découvrez la collection Aurora Luxe — montres premium pour homme et femme. Livraison Cash on Delivery partout au Maroc. Montres de luxe Maroc.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'),
  keywords: [
    'montres luxe Maroc',
    'montre homme Maroc',
    'montre femme Maroc',
    'acheter montre en ligne Maroc',
    'livraison Maroc COD',
    'Aurora Luxe',
    'montres de luxe',
  ],
  authors: [{ name: 'Aurora Luxe' }],
  creator: 'Aurora Luxe',
  openGraph: {
    siteName: 'Aurora Luxe',
    locale: 'fr_MA',
    type: 'website',
    title: 'Aurora Luxe — Montres de Luxe au Maroc',
    description: 'Montres premium pour homme et femme. Livraison Cash on Delivery partout au Maroc.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Aurora Luxe — Montres de Luxe au Maroc',
    description: 'Montres premium pour homme et femme. Livraison Cash on Delivery partout au Maroc.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  alternates: {
    canonical: process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="fr"
      suppressHydrationWarning
      className={`${inter.variable} ${playfair.variable}`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var t = localStorage.getItem('aurora-theme');
                if (t === 'dark' || (!t && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.setAttribute('data-theme', 'dark');
                }
              } catch(e) {}
            `,
          }}
        />
      </head>
      <body className="font-sans antialiased" style={{ backgroundColor: 'var(--bg)', color: 'var(--text)' }}>
        {children}
      </body>
    </html>
  )
}
