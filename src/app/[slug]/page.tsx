import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getPrisma } from '@/lib/prisma'
import { MenuCard } from '@/components/public/menu-card'
import { HeroSection } from '@/components/public/sections/hero'
import { StatsSection } from '@/components/public/sections/stats'
import { GalleryPreview } from '@/components/public/sections/gallery-preview'
import { EventsSection } from '@/components/public/sections/events'
import { NewsletterSection } from '@/components/public/sections/newsletter'
import type { Metadata } from 'next'
import type { ProductWithCategory } from '@/types'
import { Calendar, Star } from 'lucide-react'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const prisma = getPrisma()
  const tenant = await prisma.tenant.findUnique({ where: { slug } })
  if (!tenant) return { title: 'Not Found' }
  return {
    title: tenant.name,
    description: tenant.description ?? tenant.tagline ?? undefined,
    openGraph: {
      title: tenant.name,
      description: tenant.description ?? tenant.tagline ?? undefined,
      type: 'website',
    },
  }
}

export default async function TenantHomePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const prisma = getPrisma()
  const tenant = await prisma.tenant.findUnique({
    where: { slug, active: true },
    include: {
      categories: { orderBy: { order: 'asc' } },
      products: {
        where: { featured: true, available: true },
        include: { category: true },
        take: 6,
        orderBy: { createdAt: 'desc' },
      },
    },
  })
  if (!tenant) notFound()

  const featured = tenant.products as ProductWithCategory[]

  const testimonials = [
    {
      name: 'Sarah M.',
      text: 'Une expérience culinaire exceptionnelle. Les saveurs sont authentiques et le service irréprochable.',
    },
    {
      name: 'Karim B.',
      text: "Le meilleur café de la ville. L'ambiance est parfaite pour un déjeuner d'affaires ou un moment entre amis.",
    },
    {
      name: 'Leila A.',
      text: "Des plats raffinés qui mêlent tradition et modernité. On revient toujours avec plaisir !",
    },
  ]

  return (
    <>
      {/* ─── Hero cinématique ─────────────────────────────────── */}
      <HeroSection tenant={tenant} />

      {/* ─── Stats animées ────────────────────────────────────── */}
      <StatsSection />

      {/* ─── Featured Menu ────────────────────────────────────── */}
      {featured.length > 0 && (
        <section className="py-24 px-4 sm:px-6 lg:px-8" style={{ background: '#1A0F0A' }}>
          <div className="max-w-7xl mx-auto">
            <div className="text-center space-y-4 mb-16">
              <div className="inline-flex items-center gap-3">
                <div className="h-px w-12" style={{ background: 'linear-gradient(90deg, transparent, #C9A84C)' }} />
                <span className="font-accent text-sm tracking-[0.4em] uppercase" style={{ color: '#C9A84C' }}>
                  Nos Spécialités
                </span>
                <div className="h-px w-12" style={{ background: 'linear-gradient(90deg, #C9A84C, transparent)' }} />
              </div>
              <h2 className="font-display text-4xl md:text-5xl" style={{ color: '#F5EDD8' }}>
                Menu <span style={{ color: '#C9A84C' }}>Signature</span>
              </h2>
              <div className="w-16 h-px mx-auto" style={{ background: 'rgba(201,168,76,0.4)' }} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featured.map((product) => (
                <MenuCard key={product.id} product={product} />
              ))}
            </div>

            <div className="text-center mt-12">
              <Link
                href={`/${slug}/menu`}
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-sm font-medium transition-all hover:scale-105"
                style={{ border: '1px solid rgba(201,168,76,0.35)', color: '#C9A84C' }}
              >
                Voir le menu complet →
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ─── Gallery preview ──────────────────────────────────── */}
      <GalleryPreview slug={slug} />

      {/* ─── Events & Promotions ──────────────────────────────── */}
      <EventsSection />

      {/* ─── Notre histoire ───────────────────────────────────── */}
      <section className="py-24" style={{ background: '#2C1F17', borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="max-w-4xl mx-auto px-6 text-center space-y-6">
          <div className="inline-flex items-center gap-3">
            <div className="h-px w-12" style={{ background: 'linear-gradient(90deg, transparent, #C9A84C)' }} />
            <span className="font-accent text-sm tracking-[0.4em] uppercase" style={{ color: '#C9A84C' }}>
              Notre Histoire
            </span>
            <div className="h-px w-12" style={{ background: 'linear-gradient(90deg, #C9A84C, transparent)' }} />
          </div>
          <h2 className="font-display text-4xl md:text-5xl" style={{ color: '#F5EDD8' }}>
            Une tradition <span style={{ color: '#C9A84C' }}>d&apos;excellence</span>
          </h2>
          <p className="text-lg leading-relaxed max-w-2xl mx-auto" style={{ color: 'rgba(245,237,216,0.55)' }}>
            Nichés au cœur de la ville, nous nous sommes engagés à offrir une expérience culinaire
            d&apos;exception alliant saveurs authentiques et modernité raffinée. Chaque plat est une
            invitation au voyage, préparé avec passion et des ingrédients soigneusement sélectionnés
            auprès de producteurs locaux.
          </p>
          <div className="flex justify-center pt-4">
            <Link
              href={`/${slug}/menu`}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium transition-all hover:scale-105"
              style={{ background: 'rgba(201,168,76,0.12)', color: '#C9A84C', border: '1px solid rgba(201,168,76,0.2)' }}
            >
              Découvrir notre menu →
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Témoignages ──────────────────────────────────────── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8" style={{ background: '#1A0F0A' }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center space-y-4 mb-16">
            <div className="inline-flex items-center gap-3">
              <div className="h-px w-12" style={{ background: 'linear-gradient(90deg, transparent, #C9A84C)' }} />
              <span className="font-accent text-sm tracking-[0.4em] uppercase" style={{ color: '#C9A84C' }}>
                Ce qu&apos;ils disent
              </span>
              <div className="h-px w-12" style={{ background: 'linear-gradient(90deg, #C9A84C, transparent)' }} />
            </div>
            <h2 className="font-display text-4xl md:text-5xl" style={{ color: '#F5EDD8' }}>
              Témoignages
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div
                key={i}
                className="rounded-2xl p-8 space-y-5 transition-all duration-300 hover:-translate-y-1"
                style={{ background: '#2C1F17', border: '1px solid rgba(255,255,255,0.06)' }}
              >
                <div className="flex gap-1">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} size={14} fill="#C9A84C" style={{ color: '#C9A84C' }} />
                  ))}
                </div>
                <p className="text-sm leading-relaxed italic" style={{ color: 'rgba(245,237,216,0.65)' }}>
                  &quot;{t.text}&quot;
                </p>
                <p className="text-sm font-semibold" style={{ color: '#C9A84C' }}>{t.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Newsletter & Fidélité ────────────────────────────── */}
      <NewsletterSection />

      {/* ─── CTA final ────────────────────────────────────────── */}
      <section className="py-24" style={{ background: '#1A0F0A', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="max-w-3xl mx-auto px-6 text-center space-y-8">
          <h2 className="font-display text-4xl md:text-5xl" style={{ color: '#F5EDD8' }}>
            Prêt à vivre l&apos;expérience <span style={{ color: '#C9A84C' }}>{tenant.name}</span> ?
          </h2>
          <p style={{ color: 'rgba(245,237,216,0.45)' }}>
            Réservez votre table dès maintenant ou commandez en ligne.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href={`/${slug}/reserver`}
              className="flex items-center gap-2.5 px-8 py-4 rounded-xl font-semibold transition-all hover:scale-105 hover:shadow-2xl"
              style={{
                background: 'linear-gradient(135deg, #C9A84C, #E8C97A)',
                color: '#1A0F0A',
                boxShadow: '0 8px 32px rgba(201,168,76,0.25)',
              }}
            >
              <Calendar size={18} />
              Réserver une table
            </Link>
            <Link
              href={`/${slug}/menu`}
              className="flex items-center gap-2 px-8 py-4 rounded-xl font-medium transition-all hover:scale-105"
              style={{ border: '1px solid rgba(201,168,76,0.4)', color: '#C9A84C' }}
            >
              Explorer le menu →
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
