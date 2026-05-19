import { getPrisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { KpiCard } from '@/components/dashboard/kpi-card'
import { formatPrice, ORDER_STATUS_LABELS, STATUS_COLORS } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { ShoppingBag, CalendarDays, UtensilsCrossed, TrendingUp } from 'lucide-react'

export default async function DashboardPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const prisma = getPrisma()
  const tenant = await prisma.tenant.findUnique({ where: { slug } })
  if (!tenant) notFound()

  const [orders, reservations, products, recentOrders] = await Promise.all([
    prisma.order.findMany({ where: { tenantId: tenant.id } }),
    prisma.reservation.findMany({ where: { tenantId: tenant.id } }),
    prisma.product.findMany({ where: { tenantId: tenant.id } }),
    prisma.order.findMany({
      where: { tenantId: tenant.id },
      include: { items: { include: { product: true } } },
      orderBy: { createdAt: 'desc' },
      take: 8,
    }),
  ])

  const today = new Date(); today.setHours(0,0,0,0)
  const todayOrders = orders.filter((o) => new Date(o.createdAt) >= today)
  const caToday = todayOrders.reduce((s, o) => s + o.total, 0)
  const pendingOrders = orders.filter((o) => ['PENDING','PREPARING'].includes(o.status)).length
  const pendingRes = reservations.filter((r) => r.status === 'PENDING').length

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl text-cream">Dashboard</h1>
        <p className="text-cream/40 mt-1">Bienvenue, {tenant.name}</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard title="CA Aujourd'hui" value={formatPrice(caToday)} subtitle={`${todayOrders.length} commande${todayOrders.length>1?'s':''}`} icon={<TrendingUp size={18}/>} trend={{ value: 12, label: 'vs hier' }} />
        <KpiCard title="Commandes en cours" value={pendingOrders} subtitle="À traiter" icon={<ShoppingBag size={18}/>} />
        <KpiCard title="Réservations en attente" value={pendingRes} subtitle="À confirmer" icon={<CalendarDays size={18}/>} />
        <KpiCard title="Produits actifs" value={products.filter((p) => p.available).length} subtitle={`Sur ${products.length} au total`} icon={<UtensilsCrossed size={18}/>} />
      </div>

      {/* Recent orders */}
      <div className="bg-charcoal border border-white/10 rounded-xl overflow-hidden">
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <h2 className="font-display text-xl text-cream">Dernières commandes</h2>
          <a href={`/${slug}/dashboard/commandes`} className="text-xs text-gold hover:underline">Voir tout →</a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left px-6 py-3 text-cream/40 font-medium">Client</th>
                <th className="text-left px-6 py-3 text-cream/40 font-medium">Articles</th>
                <th className="text-left px-6 py-3 text-cream/40 font-medium">Total</th>
                <th className="text-left px-6 py-3 text-cream/40 font-medium">Type</th>
                <th className="text-left px-6 py-3 text-cream/40 font-medium">Statut</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-cream/30">Aucune commande</td></tr>
              ) : recentOrders.map((order) => (
                <tr key={order.id} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                  <td className="px-6 py-4 text-cream">{order.clientName}</td>
                  <td className="px-6 py-4 text-cream/60">{order.items.reduce((s,i)=>s+i.quantity,0)} article{order.items.reduce((s,i)=>s+i.quantity,0)>1?'s':''}</td>
                  <td className="px-6 py-4 text-gold font-display">{formatPrice(order.total)}</td>
                  <td className="px-6 py-4 text-cream/60 capitalize">{order.type.toLowerCase().replace('_',' ')}</td>
                  <td className="px-6 py-4">
                    <Badge className={STATUS_COLORS[order.status]}>{ORDER_STATUS_LABELS[order.status]}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
