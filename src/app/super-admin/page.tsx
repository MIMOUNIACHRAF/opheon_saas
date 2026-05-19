import { redirect } from 'next/navigation'
import Link from 'next/link'
import { auth } from '@/lib/auth'
import { getPrisma } from '@/lib/prisma'
import { formatPrice, formatDateShort } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { ExternalLink, Users, ShoppingBag, UtensilsCrossed, CalendarDays } from 'lucide-react'
import type { SessionUser } from '@/types'

export default async function SuperAdminPage() {
  const session = await auth()
  if (!session?.user || (session.user as SessionUser & {role:string}).role !== 'SUPER_ADMIN') redirect('/login')

  const prisma = getPrisma()
  const tenants = await prisma.tenant.findMany({
    include: { _count: { select: { orders: true, reservations: true, products: true, users: true } } },
    orderBy: { createdAt: 'desc' },
  })

  const totalOrders = tenants.reduce((s, t) => s + t._count.orders, 0)
  const totalTenants = tenants.length
  const activeTenants = tenants.filter((t) => t.active).length

  return (
    <div className="min-h-screen bg-espresso p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-4xl text-cream">Super Admin</h1>
            <p className="text-cream/40 mt-1">Gestion globale de la plateforme Opheon SaaS</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 gradient-gold rounded-xl flex items-center justify-center">
              <span className="font-display text-espresso font-bold">O</span>
            </div>
            <Link href="/login" className="text-xs text-cream/40 hover:text-red-400 transition-colors px-3 py-2 border border-white/10 rounded-lg">
              Déconnexion
            </Link>
          </div>
        </div>

        {/* Global KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Restaurants', value: totalTenants, sub: `${activeTenants} actifs`, icon: <UtensilsCrossed size={18}/> },
            { label: 'Commandes totales', value: totalOrders, sub: 'Tous restaurants', icon: <ShoppingBag size={18}/> },
            { label: 'Utilisateurs', value: tenants.reduce((s,t)=>s+t._count.users,0), sub: 'Staff & admins', icon: <Users size={18}/> },
            { label: 'Réservations', value: tenants.reduce((s,t)=>s+t._count.reservations,0), sub: 'Tous restaurants', icon: <CalendarDays size={18}/> },
          ].map((k) => (
            <div key={k.label} className="bg-charcoal border border-white/10 rounded-xl p-5 flex items-center gap-4">
              <div className="w-10 h-10 bg-gold/10 rounded-lg flex items-center justify-center text-gold">{k.icon}</div>
              <div><p className="text-xs text-cream/40">{k.label}</p><p className="font-display text-2xl text-cream">{k.value}</p><p className="text-xs text-cream/30">{k.sub}</p></div>
            </div>
          ))}
        </div>

        {/* Tenants list */}
        <div className="bg-charcoal border border-white/10 rounded-xl overflow-hidden">
          <div className="p-6 border-b border-white/10">
            <h2 className="font-display text-xl text-cream">Restaurants clients</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left px-6 py-3 text-cream/40 font-medium">Restaurant</th>
                  <th className="text-left px-6 py-3 text-cream/40 font-medium">Plan</th>
                  <th className="text-left px-6 py-3 text-cream/40 font-medium">Commandes</th>
                  <th className="text-left px-6 py-3 text-cream/40 font-medium">Produits</th>
                  <th className="text-left px-6 py-3 text-cream/40 font-medium">Créé le</th>
                  <th className="text-left px-6 py-3 text-cream/40 font-medium">Statut</th>
                  <th className="text-right px-6 py-3 text-cream/40 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {tenants.map((t) => (
                  <tr key={t.id} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-espresso" style={{ background: t.primaryColor }}>
                          {t.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-cream font-medium">{t.name}</p>
                          <p className="text-xs text-cream/40">/{t.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={t.plan === 'ENTERPRISE' ? 'gold' : t.plan === 'PRO' ? 'blue' : 'gray'}>{t.plan}</Badge>
                    </td>
                    <td className="px-6 py-4 text-cream/70">{t._count.orders}</td>
                    <td className="px-6 py-4 text-cream/70">{t._count.products}</td>
                    <td className="px-6 py-4 text-cream/40">{formatDateShort(t.createdAt)}</td>
                    <td className="px-6 py-4">
                      <Badge variant={t.active ? 'green' : 'red'}>{t.active ? 'Actif' : 'Suspendu'}</Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/${t.slug}`} target="_blank" className="p-1.5 text-cream/40 hover:text-gold transition-colors" title="Voir le site">
                          <ExternalLink size={15}/>
                        </Link>
                        <Link href={`/${t.slug}/dashboard`} className="px-3 py-1.5 text-xs border border-gold/30 text-gold rounded-lg hover:bg-gold/10 transition-colors">
                          Dashboard
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
