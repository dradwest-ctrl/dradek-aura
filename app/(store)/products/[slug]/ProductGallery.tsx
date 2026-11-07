'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'

interface ProductGalleryProps {
  images: string[]
  productName: string
  isSale: boolean
  discount: number
}

export function ProductGallery({ images, productName, isSale, discount }: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [isOpen, setIsOpen] = useState(false)

  const activeImage = images[selectedIndex] || images[0] || '/assets/products/placeholder.jpg'

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (!isOpen) return

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setIsOpen(false)
      if (e.key === 'ArrowRight') {
        setSelectedIndex((prev) => (prev + 1) % images.length)
      }
      if (e.key === 'ArrowLeft') {
        setSelectedIndex((prev) => (prev - 1 + images.length) % images.length)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, images.length])

  return (
    <div>
      {/* Main Preview Image */}
      <div
        onClick={() => setIsOpen(true)}
        className="relative aspect-square overflow-hidden rounded-2xl cursor-zoom-in group"
        style={{ backgroundColor: 'var(--bg-2)' }}
      >
        <Image
          src={activeImage}
          alt={productName}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {isSale && (
          <div className="absolute top-4 left-4 bg-red-600 text-white text-sm font-bold px-3 py-1.5 rounded-full z-10">
            -{discount}%
          </div>
        )}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
          <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/70 text-white text-xs px-3 py-1.5 rounded-full backdrop-blur-sm">
            Cliquez pour agrandir
          </span>
        </div>
      </div>

      {/* Thumbnail Strip */}
      {images.length > 1 && (
        <div className="mt-3 grid grid-cols-4 gap-2">
          {images.map((img, idx) => {
            const isSelected = idx === selectedIndex
            return (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedIndex(idx)}
                className={`relative aspect-square overflow-hidden rounded-xl border-2 transition-all text-left ${
                  isSelected ? 'ring-2 ring-offset-2 ring-black border-black' : 'border-transparent hover:opacity-80'
                }`}
                style={{ borderColor: isSelected ? 'var(--text)' : 'var(--border)' }}
              >
                <Image
                  src={img}
                  alt={`${productName} - vue ${idx + 1}`}
                  fill
                  sizes="100px"
                  className="object-cover"
                />
              </button>
            )
          })}
        </div>
      )}

      {/* Full-Screen Lightbox Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col items-center justify-center p-4 md:p-8">
          {/* Top Bar */}
          <div className="absolute top-4 right-4 md:top-8 md:right-8 flex items-center gap-4 z-50">
            <span className="text-white/70 text-sm font-medium">
              {selectedIndex + 1} / {images.length}
            </span>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              title="Fermer (Échap)"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Main Lightbox Image Container */}
          <div className="relative w-full max-w-5xl h-[75vh] flex items-center justify-center">
            {images.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setSelectedIndex((prev) => (prev - 1 + images.length) % images.length)
                }}
                className="absolute left-2 md:-left-12 z-10 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                title="Précédent"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}

            <div className="relative w-full h-full">
              <Image
                src={activeImage}
                alt={productName}
                fill
                sizes="100vw"
                className="object-contain"
                priority
              />
            </div>

            {images.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setSelectedIndex((prev) => (prev + 1) % images.length)
                }}
                className="absolute right-2 md:-right-12 z-10 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                title="Suivant"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}
          </div>

          {/* Lightbox Thumbnails */}
          {images.length > 1 && (
            <div className="mt-6 flex gap-3 overflow-x-auto max-w-full pb-2 px-2">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedIndex(idx)}
                  className={`relative w-16 h-16 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 ${
                    idx === selectedIndex ? 'border-white scale-105' : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <Image src={img} alt={`Thumb ${idx + 1}`} fill sizes="80px" className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
