import { getPrisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { KpiCard } from '@/components/dashboard/kpi-card'
import { formatPrice, ORDER_STATUS_LABELS, STATUS_COLORS } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { ShoppingBag, CalendarDays, UtensilsCrossed, TrendingUp, AlertTriangle, Clock } from 'lucide-react'
import Link from 'next/link'

function timeAgo(date: Date | string): string {
  const mins = Math.floor((Date.now() - new Date(date).getTime()) / 60000)
  if (mins < 60) return `il y a ${mins} min`
  const hrs = Math.floor(mins / 60)
  return `il y a ${hrs}h${mins % 60 > 0 ? String(mins % 60).padStart(2,'0') : ''}`
}

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

  const today = new Date(); today.setHours(0, 0, 0, 0)
  const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1)

  const todayOrders = orders.filter((o) => new Date(o.createdAt) >= today && o.status !== 'CANCELLED')
  const yesterdayOrders = orders.filter((o) => {
    const d = new Date(o.createdAt)
    return d >= yesterday && d < today && o.status !== 'CANCELLED'
  })

  const caToday = todayOrders.reduce((s, o) => s + o.total, 0)
  const caYesterday = yesterdayOrders.reduce((s, o) => s + o.total, 0)
  const caTrend = caYesterday > 0 ? Math.round(((caToday - caYesterday) / caYesterday) * 100) : null

  const pendingOrders = orders.filter((o) => ['PENDING', 'PREPARING'].includes(o.status))
  const pendingRes = reservations.filter((r) => r.status === 'PENDING')

  // Urgent orders: pending for > 10 min
  const urgentOrders = pendingOrders.filter((o) => {
    const mins = Math.floor((Date.now() - new Date(o.createdAt).getTime()) / 60000)
    return mins >= 10
  })

  const hasAlerts = urgentOrders.length > 0 || pendingRes.length > 0

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl text-cream">Dashboard</h1>
        <p className="text-cream/40 mt-1">Bienvenue, {tenant.name}</p>
      </div>

      {/* ── Alerts ─────────────────────────────────────────────── */}
      {hasAlerts && (
        <div className="space-y-2.5">
          {urgentOrders.length > 0 && (
            <Link
              href={`/${slug}/dashboard/commandes`}
              className="flex items-center gap-4 bg-red-500/8 border border-red-500/25 rounded-xl px-5 py-3.5 hover:bg-red-500/12 transition-colors group"
            >
              <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center shrink-0">
                <AlertTriangle size={16} className="text-red-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-red-300">
                  {urgentOrders.length} commande{urgentOrders.length > 1 ? 's' : ''} urgente{urgentOrders.length > 1 ? 's' : ''}
                </p>
                <p className="text-xs text-red-400/60 mt-0.5">En attente depuis plus de 10 minutes — action requise</p>
              </div>
              <span className="text-red-400/40 group-hover:text-red-400 transition-colors text-sm">Voir →</span>
            </Link>
          )}

          {pendingRes.length > 0 && (
            <Link
              href={`/${slug}/dashboard/reservations`}
              className="flex items-center gap-4 bg-yellow-500/8 border border-yellow-500/20 rounded-xl px-5 py-3.5 hover:bg-yellow-500/12 transition-colors group"
            >
              <div className="w-8 h-8 rounded-lg bg-yellow-500/20 flex items-center justify-center shrink-0">
                <Clock size={16} className="text-yellow-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-yellow-300">
                  {pendingRes.length} réservation{pendingRes.length > 1 ? 's' : ''} à confirmer
                </p>
                <p className="text-xs text-yellow-400/60 mt-0.5">Des clients attendent votre confirmation</p>
              </div>
              <span className="text-yellow-400/40 group-hover:text-yellow-400 transition-colors text-sm">Voir →</span>
            </Link>
          )}
        </div>
      )}

      {/* ── KPIs ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard
          title="CA Aujourd'hui"
          value={formatPrice(caToday)}
          subtitle={`${todayOrders.length} commande${todayOrders.length > 1 ? 's' : ''}`}
          icon={<TrendingUp size={18} />}
          trend={caTrend !== null ? { value: caTrend, label: 'vs hier' } : undefined}
        />
        <KpiCard
          title="Commandes en cours"
          value={pendingOrders.length}
          subtitle={urgentOrders.length > 0 ? `⚠ ${urgentOrders.length} urgente${urgentOrders.length > 1 ? 's' : ''}` : 'À traiter'}
          icon={<ShoppingBag size={18} />}
        />
        <KpiCard
          title="Réservations en attente"
          value={pendingRes.length}
          subtitle="À confirmer"
          icon={<CalendarDays size={18} />}
        />
        <KpiCard
          title="Produits actifs"
          value={products.filter((p) => p.available).length}
          subtitle={`Sur ${products.length} au total`}
          icon={<UtensilsCrossed size={18} />}
        />
      </div>

      {/* ── Recent orders ──────────────────────────────────────── */}
      <div className="bg-charcoal border border-white/10 rounded-xl overflow-hidden">
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <h2 className="font-display text-xl text-cream">Dernières commandes</h2>
          <Link href={`/${slug}/dashboard/commandes`} className="text-xs text-gold hover:underline">
            Voir tout →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left px-6 py-3 text-cream/40 font-medium">Client</th>
                <th className="text-left px-6 py-3 text-cream/40 font-medium hidden sm:table-cell">Articles</th>
                <th className="text-left px-6 py-3 text-cream/40 font-medium">Total</th>
                <th className="text-left px-6 py-3 text-cream/40 font-medium hidden md:table-cell">Type</th>
                <th className="text-left px-6 py-3 text-cream/40 font-medium">Statut</th>
                <th className="text-left px-6 py-3 text-cream/40 font-medium hidden lg:table-cell">Quand</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-cream/30">Aucune commande</td></tr>
              ) : recentOrders.map((order) => (
                <tr key={order.id} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                  <td className="px-6 py-4 text-cream font-medium">{order.clientName}</td>
                  <td className="px-6 py-4 text-cream/60 hidden sm:table-cell">
                    {order.items.reduce((s, i) => s + i.quantity, 0)} art.
                  </td>
                  <td className="px-6 py-4 text-gold font-display">{formatPrice(order.total)}</td>
                  <td className="px-6 py-4 text-cream/60 capitalize hidden md:table-cell">
                    {order.type.toLowerCase().replace('_', ' ')}
                  </td>
                  <td className="px-6 py-4">
                    <Badge className={STATUS_COLORS[order.status]}>{ORDER_STATUS_LABELS[order.status]}</Badge>
                  </td>
                  <td className="px-6 py-4 text-cream/30 text-xs hidden lg:table-cell">
                    {timeAgo(order.createdAt)}
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
