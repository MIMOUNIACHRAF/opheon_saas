import { notFound, redirect } from 'next/navigation'
import { getPrisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { DashboardSidebar } from '@/components/dashboard/sidebar'
import type { SessionUser } from '@/types'

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const session = await auth()
  if (!session?.user) redirect('/login')

  const user = session.user as SessionUser & { role: string; tenantSlug: string | null }
  if (user.role !== 'SUPER_ADMIN' && user.tenantSlug !== slug) redirect('/login')

  const prisma = getPrisma()
  const tenant = await prisma.tenant.findUnique({ where: { slug } })
  if (!tenant) notFound()

  return (
    <div className="flex h-screen bg-espresso overflow-hidden">
      <DashboardSidebar tenant={tenant} />
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">{children}</div>
      </main>
    </div>
  )
}
