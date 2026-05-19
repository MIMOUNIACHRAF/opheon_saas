import type { Metadata } from 'next'
import { getPrisma } from '@/lib/prisma'

export async function generateMenuMetadata(slug: string): Promise<Metadata> {
  const prisma = getPrisma()
  const tenant = await prisma.tenant.findUnique({ where: { slug } })
  if (!tenant) return { title: 'Menu' }
  return {
    title: `Menu — ${tenant.name}`,
    description: `Découvrez le menu complet de ${tenant.name}. Plats, boissons, desserts — commandez en ligne ou réservez votre table.`,
    openGraph: {
      title: `Menu de ${tenant.name}`,
      description: `Tous nos plats, à ${tenant.city ?? 'Maroc'}`,
      type: 'website',
    },
  }
}
