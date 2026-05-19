'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Camera } from 'lucide-react'

const PHOTOS = [
  { src: 'https://picsum.photos/seed/tajine1/600/800',   alt: 'Tajine signature', tall: true },
  { src: 'https://picsum.photos/seed/food22/600/400',    alt: 'Couscous royal',   tall: false },
  { src: 'https://picsum.photos/seed/moroccan3/600/400', alt: 'Pâtisseries',      tall: false },
  { src: 'https://picsum.photos/seed/restau4/600/800',   alt: 'Notre espace',     tall: true },
  { src: 'https://picsum.photos/seed/mintea5/600/400',   alt: 'Thé à la menthe', tall: false },
  { src: 'https://picsum.photos/seed/dessert6/600/400',  alt: 'Desserts maison',  tall: false },
]

interface GalleryPreviewProps {
  slug: string
}

export function GalleryPreview({ slug }: GalleryPreviewProps) {
  return (
    <section className="py-24" style={{ background: '#1A0F0A' }}>
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="flex items-end justify-between mb-12">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-3">
              <div className="h-px w-8" style={{ background: 'linear-gradient(90deg, transparent, #C9A84C)' }} />
              <span className="font-accent text-sm tracking-[0.4em] uppercase" style={{ color: '#C9A84C' }}>
                Galerie
              </span>
            </div>
            <h2 className="font-display text-4xl md:text-5xl" style={{ color: '#F5EDD8' }}>
              L&apos;art dans <span style={{ color: '#C9A84C' }}>l&apos;assiette</span>
            </h2>
          </div>
          <Link
            href={`/${slug}/galerie`}
            className="hidden md:flex items-center gap-2 text-sm font-medium transition-colors hover:opacity-80"
            style={{ color: '#C9A84C' }}
          >
            <Camera size={16} />
            Voir tout
          </Link>
        </div>

        {/* Mosaic grid */}
        <div
          className="grid gap-3"
          style={{
            gridTemplateColumns: 'repeat(3, 1fr)',
            gridAutoRows: '200px',
          }}
        >
          {PHOTOS.map((photo, i) => (
            <div
              key={i}
              className="relative overflow-hidden rounded-xl group"
              style={{ gridRow: photo.tall ? 'span 2' : 'span 1' }}
            >
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
                sizes="(max-width: 768px) 50vw, 33vw"
                unoptimized
              />
              {/* Hover overlay */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4"
                style={{ background: 'linear-gradient(to top, rgba(26,15,10,0.8), transparent)' }}
              >
                <span className="text-sm font-medium" style={{ color: '#F5EDD8' }}>{photo.alt}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Mobile CTA */}
        <div className="text-center mt-8 md:hidden">
          <Link
            href={`/${slug}/galerie`}
            className="inline-flex items-center gap-2 text-sm font-medium"
            style={{ color: '#C9A84C' }}
          >
            <Camera size={16} />
            Voir toute la galerie
          </Link>
        </div>
      </div>
    </section>
  )
}
