import { getPrisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { formatPrice } from '@/lib/utils'
import { TrendingUp, ShoppingBag, CalendarDays, UtensilsCrossed } from 'lucide-react'

export default async function AnalyticsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const prisma = getPrisma()
  const tenant = await prisma.tenant.findUnique({ where: { slug } })
  if (!tenant) notFound()

  const [orders, products] = await Promise.all([
    prisma.order.findMany({ where: { tenantId: tenant.id }, include: { items: { include: { product: true } } }, orderBy: { createdAt: 'desc' } }),
    prisma.product.findMany({ where: { tenantId: tenant.id }, include: { category: true } }),
  ])

  const totalRevenue = orders.filter((o) => o.status !== 'CANCELLED').reduce((s, o) => s + o.total, 0)
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i)); d.setHours(0,0,0,0)
    const end = new Date(d); end.setHours(23,59,59)
    const dayOrders = orders.filter((o) => { const c = new Date(o.createdAt); return c >= d && c <= end && o.status !== 'CANCELLED' })
    return { day: d.toLocaleDateString('fr-FR', { weekday: 'short' }), ca: dayOrders.reduce((s,o)=>s+o.total,0), count: dayOrders.length }
  })
  const maxCa = Math.max(...last7.map((d) => d.ca), 1)

  // Top products
  const productSales: Record<string, { name: string; qty: number; revenue: number }> = {}
  orders.filter((o) => o.status !== 'CANCELLED').forEach((order) => {
    order.items.forEach((item) => {
      if (!productSales[item.productId]) productSales[item.productId] = { name: item.product.nameFr, qty: 0, revenue: 0 }
      productSales[item.productId].qty += item.quantity
      productSales[item.productId].revenue += item.unitPrice * item.quantity
    })
  })
  const topProducts = Object.values(productSales).sort((a, b) => b.qty - a.qty).slice(0, 5)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl text-cream">Statistiques</h1>
        <p className="text-cream/40 mt-1">Analyse des performances</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { icon: <TrendingUp size={18}/>, label: 'CA Total', value: formatPrice(totalRevenue) },
          { icon: <ShoppingBag size={18}/>, label: 'Commandes', value: orders.filter(o=>o.status!=='CANCELLED').length },
          { icon: <UtensilsCrossed size={18}/>, label: 'Plats au menu', value: products.filter(p=>p.available).length },
          { icon: <CalendarDays size={18}/>, label: 'Panier moyen', value: orders.length ? formatPrice(totalRevenue / orders.filter(o=>o.status!=='CANCELLED').length || 0) : formatPrice(0) },
        ].map((k) => (
          <div key={k.label} className="bg-charcoal border border-white/10 rounded-xl p-5 flex items-center gap-4">
            <div className="w-10 h-10 bg-gold/10 rounded-lg flex items-center justify-center text-gold shrink-0">{k.icon}</div>
            <div><p className="text-xs text-cream/40">{k.label}</p><p className="font-display text-2xl text-cream">{k.value}</p></div>
          </div>
        ))}
      </div>

      {/* Revenue chart (last 7 days) */}
      <div className="bg-charcoal border border-white/10 rounded-xl p-6">
        <h2 className="font-display text-xl text-cream mb-6">CA des 7 derniers jours</h2>
        <div className="flex items-end gap-3 h-48">
          {last7.map((d) => (
            <div key={d.day} className="flex-1 flex flex-col items-center gap-2">
              <span className="text-xs text-gold">{d.ca > 0 ? formatPrice(d.ca) : ''}</span>
              <div className="w-full rounded-t-lg transition-all" style={{ height: `${(d.ca / maxCa) * 140 + (d.ca > 0 ? 8 : 0)}px`, background: d.ca > 0 ? 'linear-gradient(180deg,#E8C97A,#C9A84C)' : 'rgba(255,255,255,0.05)' }} />
              <span className="text-xs text-cream/40 capitalize">{d.day}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Top products */}
      <div className="bg-charcoal border border-white/10 rounded-xl p-6">
        <h2 className="font-display text-xl text-cream mb-6">Top 5 produits</h2>
        {topProducts.length === 0 ? (
          <p className="text-cream/30 text-center py-8">Pas encore de données</p>
        ) : (
          <div className="space-y-4">
            {topProducts.map((p, i) => (
              <div key={p.name} className="flex items-center gap-4">
                <span className="text-lg font-display text-gold/50 w-6">#{i+1}</span>
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-cream">{p.name}</span>
                    <span className="text-xs text-gold">{p.qty} vendus · {formatPrice(p.revenue)}</span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full gradient-gold rounded-full" style={{ width: `${(p.qty / topProducts[0].qty) * 100}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
