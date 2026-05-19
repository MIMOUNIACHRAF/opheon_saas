import { MetadataRoute } from 'next'
import { getPrisma } from '@/lib/prisma'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXTAUTH_URL ?? 'http://localhost:3000'
  const prisma = getPrisma()
  const tenants = await prisma.tenant.findMany({ where: { active: true } })

  const tenantRoutes = tenants.flatMap((t) =>
    ['', '/menu', '/reserver', '/commander', '/contact'].map((path) => ({
      url: `${base}/${t.slug}${path}`,
      lastModified: t.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: path === '' ? 1.0 : 0.8,
    }))
  )

  return [
    { url: base, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    ...tenantRoutes,
  ]
}
