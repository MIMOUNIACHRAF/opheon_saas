'use client'

import { useState, useEffect, use } from 'react'
import Image from 'next/image'
import { X, ChevronLeft, ChevronRight, Camera } from 'lucide-react'

const PHOTOS = [
  { src: 'https://picsum.photos/seed/tajine1/800/1000',   alt: 'Tajine de légumes', category: 'Plats' },
  { src: 'https://picsum.photos/seed/food22/800/600',     alt: 'Couscous royal',    category: 'Plats' },
  { src: 'https://picsum.photos/seed/moroccan3/800/600',  alt: 'Pâtisseries orientales', category: 'Desserts' },
  { src: 'https://picsum.photos/seed/restau4/800/1000',   alt: 'Salle principale',  category: 'Espace' },
  { src: 'https://picsum.photos/seed/mintea5/800/600',    alt: 'Thé à la menthe',   category: 'Boissons' },
  { src: 'https://picsum.photos/seed/dessert6/800/600',   alt: 'Desserts maison',   category: 'Desserts' },
  { src: 'https://picsum.photos/seed/moroccan7/800/1000', alt: 'Pastilla au poulet', category: 'Plats' },
  { src: 'https://picsum.photos/seed/kitchen8/800/600',   alt: 'Notre cuisine',     category: 'Espace' },
  { src: 'https://picsum.photos/seed/salad9/800/600',     alt: 'Salade fraîcheur',  category: 'Entrées' },
  { src: 'https://picsum.photos/seed/terrace10/800/1000', alt: 'Terrasse extérieure', category: 'Espace' },
  { src: 'https://picsum.photos/seed/coffee11/800/600',   alt: 'Café traditionnel', category: 'Boissons' },
  { src: 'https://picsum.photos/seed/lamb12/800/600',     alt: 'Méchoui d\'agneau', category: 'Plats' },
]

const CATEGORIES = ['Tous', 'Plats', 'Desserts', 'Boissons', 'Entrées', 'Espace']

export default function GaleriePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  void slug

  const [active, setActive] = useState('Tous')
  const [lightbox, setLightbox] = useState<number | null>(null)

  const filtered = active === 'Tous' ? PHOTOS : PHOTOS.filter((p) => p.category === active)

  const openLightbox = (idx: number) => setLightbox(idx)
  const closeLightbox = () => setLightbox(null)
  const prev = () => setLightbox((i) => (i !== null ? (i - 1 + filtered.length) % filtered.length : null))
  const next = () => setLightbox((i) => (i !== null ? (i + 1) % filtered.length : null))

  useEffect(() => {
    if (lightbox === null) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox()
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [lightbox]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="min-h-screen pt-28 pb-20" style={{ background: '#1A0F0A' }}>
      <div className="max-w-7xl mx-auto px-6">

        {/* Page header */}
        <div className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center gap-3">
            <div className="h-px w-12" style={{ background: 'linear-gradient(90deg, transparent, #C9A84C)' }} />
            <span className="font-accent text-sm tracking-[0.4em] uppercase" style={{ color: '#C9A84C' }}>
              Galerie Photos
            </span>
            <div className="h-px w-12" style={{ background: 'linear-gradient(90deg, #C9A84C, transparent)' }} />
          </div>
          <h1 className="font-display text-5xl md:text-6xl" style={{ color: '#F5EDD8' }}>
            Notre <span style={{ color: '#C9A84C' }}>univers</span>
          </h1>
          <p className="max-w-md mx-auto text-sm" style={{ color: 'rgba(245,237,216,0.4)' }}>
            Découvrez en images l&apos;ambiance, les plats et les moments qui font l&apos;essence de notre restaurant.
          </p>
        </div>

        {/* Category filters */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActive(cat)}
              className="px-5 py-2 rounded-full text-sm font-medium transition-all duration-200"
              style={
                active === cat
                  ? { background: 'linear-gradient(135deg, #C9A84C, #E8C97A)', color: '#1A0F0A' }
                  : { background: 'rgba(255,255,255,0.05)', color: 'rgba(245,237,216,0.5)', border: '1px solid rgba(255,255,255,0.08)' }
              }
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Masonry grid */}
        <div
          style={{
            columns: '3 280px',
            columnGap: '12px',
          }}
        >
          {filtered.map((photo, i) => (
            <div
              key={photo.src}
              className="relative overflow-hidden rounded-xl group cursor-pointer mb-3"
              style={{ breakInside: 'avoid' }}
              onClick={() => openLightbox(i)}
            >
              <Image
                src={photo.src}
                alt={photo.alt}
                width={800}
                height={600}
                className="w-full object-cover transition-transform duration-700 group-hover:scale-110"
                unoptimized
              />
              {/* Hover overlay */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-3"
                style={{ background: 'rgba(26,15,10,0.75)' }}
              >
                <Camera size={24} style={{ color: '#C9A84C' }} />
                <span className="text-sm font-medium" style={{ color: '#F5EDD8' }}>{photo.alt}</span>
                <span
                  className="text-xs px-3 py-1 rounded-full"
                  style={{ background: 'rgba(201,168,76,0.2)', color: '#C9A84C' }}
                >
                  {photo.category}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Empty state */}
        {filtered.length === 0 && (
          <div className="text-center py-20" style={{ color: 'rgba(245,237,216,0.3)' }}>
            Aucune photo dans cette catégorie.
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightbox !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(10,6,4,0.95)' }}
          onClick={closeLightbox}
        >
          {/* Close */}
          <button
            className="absolute top-6 right-6 p-2 rounded-full transition-colors"
            style={{ background: 'rgba(255,255,255,0.08)', color: '#F5EDD8' }}
            onClick={closeLightbox}
          >
            <X size={22} />
          </button>

          {/* Counter */}
          <span
            className="absolute top-6 left-1/2 -translate-x-1/2 text-sm"
            style={{ color: 'rgba(245,237,216,0.4)' }}
          >
            {lightbox + 1} / {filtered.length}
          </span>

          {/* Prev */}
          <button
            className="absolute left-6 p-3 rounded-full transition-all hover:scale-110"
            style={{ background: 'rgba(255,255,255,0.08)', color: '#F5EDD8' }}
            onClick={(e) => { e.stopPropagation(); prev() }}
          >
            <ChevronLeft size={24} />
          </button>

          {/* Image */}
          <div
            className="relative max-w-4xl max-h-[80vh] rounded-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={filtered[lightbox].src}
              alt={filtered[lightbox].alt}
              width={1200}
              height={900}
              className="max-h-[80vh] w-auto object-contain"
              unoptimized
            />
            {/* Caption */}
            <div
              className="absolute bottom-0 left-0 right-0 px-6 py-4"
              style={{ background: 'linear-gradient(to top, rgba(10,6,4,0.9), transparent)' }}
            >
              <p className="font-medium text-sm" style={{ color: '#F5EDD8' }}>{filtered[lightbox].alt}</p>
              <p className="text-xs mt-1" style={{ color: '#C9A84C' }}>{filtered[lightbox].category}</p>
            </div>
          </div>

          {/* Next */}
          <button
            className="absolute right-6 p-3 rounded-full transition-all hover:scale-110"
            style={{ background: 'rgba(255,255,255,0.08)', color: '#F5EDD8' }}
            onClick={(e) => { e.stopPropagation(); next() }}
          >
            <ChevronRight size={24} />
          </button>
        </div>
      )}
    </div>
  )
}
