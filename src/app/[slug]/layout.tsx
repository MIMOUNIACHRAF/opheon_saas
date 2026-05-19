import { notFound } from 'next/navigation'
import { getPrisma } from '@/lib/prisma'
import { PublicNavbar } from '@/components/public/navbar'
import { PublicFooter } from '@/components/public/footer'
import { CartDrawer } from '@/components/public/cart-drawer'

export default async function TenantLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const prisma = getPrisma()
  const tenant = await prisma.tenant.findUnique({ where: { slug, active: true } })
  if (!tenant) notFound()

  const base = process.env.NEXTAUTH_URL ?? 'http://localhost:3000'

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    name: tenant.name,
    description: tenant.description ?? tenant.tagline ?? undefined,
    url: `${base}/${slug}`,
    telephone: tenant.phone ?? undefined,
    email: tenant.email ?? undefined,
    address: tenant.address
      ? {
          '@type': 'PostalAddress',
          streetAddress: tenant.address,
          addressLocality: tenant.city ?? 'Oujda',
          addressCountry: 'MA',
        }
      : undefined,
    openingHours: tenant.hours ?? undefined,
    servesCuisine: 'Moroccan',
    priceRange: '$$',
    hasMenu: `${base}/${slug}/menu`,
    acceptsReservations: true,
  }

  return (
    <div className="min-h-screen bg-espresso flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PublicNavbar tenant={tenant} />
      <main className="flex-1">{children}</main>
      <PublicFooter tenant={tenant} />
      <CartDrawer slug={slug} />
    </div>
  )
}
