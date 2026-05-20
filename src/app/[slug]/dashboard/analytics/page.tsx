import { getPrisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { formatPrice } from '@/lib/utils'
import { TrendingUp, ShoppingBag, UtensilsCrossed, Users } from 'lucide-react'

export default async function AnalyticsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const prisma = getPrisma()
  const tenant = await prisma.tenant.findUnique({ where: { slug } })
  if (!tenant) notFound()

  const [orders, products] = await Promise.all([
    prisma.order.findMany({
      where: { tenantId: tenant.id },
      include: { items: { include: { product: true } } },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.product.findMany({ where: { tenantId: tenant.id } }),
  ])

  const done = orders.filter((o) => o.status !== 'CANCELLED')
  const totalRevenue = done.reduce((s, o) => s + o.total, 0)
  const avgBasket = done.length ? totalRevenue / done.length : 0

  // Unique clients (by email or phone)
  const clientKeys = new Set(done.map((o) => o.clientEmail || o.clientPhone || o.clientName))

  // Last 30 days — grouped by day
  const last30 = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (29 - i)); d.setHours(0, 0, 0, 0)
    const end = new Date(d); end.setHours(23, 59, 59)
    const dayOrders = done.filter((o) => {
      const c = new Date(o.createdAt)
      return c >= d && c <= end
    })
    return {
      label: d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
      shortLabel: i % 5 === 0 ? d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }) : '',
      ca: dayOrders.reduce((s, o) => s + o.total, 0),
      count: dayOrders.length,
    }
  })

  // Last 7 days for summary
  const last7 = last30.slice(-7)
  const ca7 = last7.reduce((s, d) => s + d.ca, 0)
  const ca7Prev = last30.slice(-14, -7).reduce((s, d) => s + d.ca, 0)
  const trend7 = ca7Prev > 0 ? Math.round(((ca7 - ca7Prev) / ca7Prev) * 100) : null

  const maxCa = Math.max(...last30.map((d) => d.ca), 1)

  // Order type breakdown
  const byType: Record<string, number> = {}
  done.forEach((o) => { byType[o.type] = (byType[o.type] || 0) + 1 })
  const typeTotal = done.length || 1
  const TYPE_LABELS: Record<string, string> = { DINE_IN: 'Sur place', TAKEAWAY: 'À emporter', DELIVERY: 'Livraison' }
  const TYPE_COLORS: Record<string, string> = { DINE_IN: '#C9A84C', TAKEAWAY: '#E8C97A', DELIVERY: '#8B7355' }

  // Top products
  const productSales: Record<string, { name: string; qty: number; revenue: number }> = {}
  done.forEach((order) => {
    order.items.forEach((item) => {
      if (!productSales[item.productId]) {
        productSales[item.productId] = { name: item.product.nameFr, qty: 0, revenue: 0 }
      }
      productSales[item.productId].qty += item.quantity
      productSales[item.productId].revenue += item.unitPrice * item.quantity
    })
  })
  const topProducts = Object.values(productSales).sort((a, b) => b.qty - a.qty).slice(0, 5)

  // Peak hours
  const hourCounts: number[] = Array(24).fill(0)
  done.forEach((o) => { hourCounts[new Date(o.createdAt).getHours()]++ })
  const maxHour = Math.max(...hourCounts, 1)
  const peakHour = hourCounts.indexOf(Math.max(...hourCounts))

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl text-cream">Statistiques</h1>
        <p className="text-cream/40 mt-1">Analyse des performances de votre restaurant</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { icon: <TrendingUp size={18} />, label: 'CA Total', value: formatPrice(totalRevenue), sub: trend7 !== null ? `${trend7 >= 0 ? '+' : ''}${trend7}% cette semaine` : '' },
          { icon: <ShoppingBag size={18} />, label: 'Commandes', value: done.length, sub: `${last7.reduce((s,d)=>s+d.count,0)} cette semaine` },
          { icon: <UtensilsCrossed size={18} />, label: 'Panier moyen', value: formatPrice(avgBasket), sub: `${products.filter(p=>p.available).length} plats actifs` },
          { icon: <Users size={18} />, label: 'Clients uniques', value: clientKeys.size, sub: peakHour > 0 ? `Pic : ${peakHour}h00–${peakHour+1}h00` : '' },
        ].map((k) => (
          <div key={k.label} className="bg-charcoal border border-white/10 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 bg-gold/10 rounded-lg flex items-center justify-center text-gold shrink-0">
                {k.icon}
              </div>
              <span className="text-xs text-cream/40">{k.label}</span>
            </div>
            <p className="font-display text-2xl text-cream">{k.value}</p>
            {k.sub && <p className="text-xs text-cream/30 mt-1">{k.sub}</p>}
          </div>
        ))}
      </div>

      {/* 30-day Revenue chart */}
      <div className="bg-charcoal border border-white/10 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-display text-xl text-cream">Chiffre d&apos;affaires</h2>
            <p className="text-xs text-cream/30 mt-0.5">30 derniers jours</p>
          </div>
          {trend7 !== null && (
            <span className={`text-sm font-semibold px-3 py-1 rounded-full ${trend7 >= 0 ? 'bg-green-500/15 text-green-400' : 'bg-red-500/15 text-red-400'}`}>
              {trend7 >= 0 ? '↑' : '↓'} {Math.abs(trend7)}% vs sem. préc.
            </span>
          )}
        </div>

        <div className="relative">
          {/* Y-axis labels */}
          <div className="absolute left-0 top-0 bottom-8 flex flex-col justify-between text-[10px] text-cream/20 pr-2 w-14">
            <span>{formatPrice(maxCa)}</span>
            <span>{formatPrice(maxCa * 0.5)}</span>
            <span>0</span>
          </div>

          {/* Bars */}
          <div className="ml-14">
            <div className="flex items-end gap-[2px] h-40">
              {last30.map((d, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
                  {/* Tooltip on hover */}
                  {d.ca > 0 && (
                    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-espresso border border-white/10 rounded-lg px-2.5 py-1.5 text-[10px] text-cream whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-lg">
                      <p className="font-semibold text-gold">{formatPrice(d.ca)}</p>
                      <p className="text-cream/50">{d.count} cmd · {d.label}</p>
                    </div>
                  )}
                  <div
                    className="w-full rounded-t-sm transition-all duration-300 group-hover:opacity-90"
                    style={{
                      height: `${(d.ca / maxCa) * 148 + (d.ca > 0 ? 4 : 0)}px`,
                      background: d.ca > 0
                        ? i >= last30.length - 7
                          ? 'linear-gradient(180deg, #E8C97A, #C9A84C)'
                          : 'rgba(201,168,76,0.35)'
                        : 'rgba(255,255,255,0.04)',
                      minHeight: '2px',
                    }}
                  />
                </div>
              ))}
            </div>

            {/* X-axis labels */}
            <div className="flex items-start gap-[2px] mt-2">
              {last30.map((d, i) => (
                <div key={i} className="flex-1 text-center">
                  {d.shortLabel && (
                    <span className="text-[9px] text-cream/25">{d.shortLabel}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <p className="text-xs text-cream/20 mt-4">
          Les 7 derniers jours sont en doré vif · Total 7j : <span className="text-gold/60">{formatPrice(ca7)}</span>
        </p>
      </div>

      {/* Bottom row: type breakdown + top products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Order type breakdown */}
        <div className="bg-charcoal border border-white/10 rounded-xl p-6">
          <h2 className="font-display text-xl text-cream mb-6">Répartition par type</h2>
          {done.length === 0 ? (
            <p className="text-cream/30 text-center py-8 text-sm">Pas encore de données</p>
          ) : (
            <div className="space-y-5">
              {Object.entries(byType).sort((a, b) => b[1] - a[1]).map(([type, count]) => {
                const pct = Math.round((count / typeTotal) * 100)
                return (
                  <div key={type}>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-cream">{TYPE_LABELS[type] ?? type}</span>
                      <span className="text-sm font-semibold" style={{ color: TYPE_COLORS[type] ?? '#fff' }}>
                        {pct}% <span className="font-normal text-cream/30">({count})</span>
                      </span>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${pct}%`, background: TYPE_COLORS[type] ?? '#C9A84C' }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Top products */}
        <div className="bg-charcoal border border-white/10 rounded-xl p-6">
          <h2 className="font-display text-xl text-cream mb-6">Top 5 produits</h2>
          {topProducts.length === 0 ? (
            <p className="text-cream/30 text-center py-8 text-sm">Pas encore de données</p>
          ) : (
            <div className="space-y-4">
              {topProducts.map((p, i) => (
                <div key={p.name} className="flex items-center gap-3">
                  <span className="text-xl font-display w-7 shrink-0" style={{ color: i === 0 ? '#C9A84C' : 'rgba(245,237,216,0.25)' }}>
                    #{i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-1.5">
                      <span className="text-sm text-cream truncate">{p.name}</span>
                      <span className="text-xs text-cream/40 shrink-0 ml-2">{p.qty} vendus</span>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${(p.qty / topProducts[0].qty) * 100}%`,
                          background: `linear-gradient(90deg, #C9A84C, #E8C97A)`,
                          opacity: 1 - i * 0.15,
                        }}
                      />
                    </div>
                  </div>
                  <span className="text-xs text-gold/70 font-display shrink-0 w-20 text-right">{formatPrice(p.revenue)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Peak hours */}
      <div className="bg-charcoal border border-white/10 rounded-xl p-6">
        <h2 className="font-display text-xl text-cream mb-6">Heures de pointe</h2>
        {done.length === 0 ? (
          <p className="text-cream/30 text-center py-8 text-sm">Pas encore de données</p>
        ) : (
          <div>
            <div className="flex items-end gap-1 h-20">
              {hourCounts.map((count, hour) => (
                <div key={hour} className="flex-1 flex flex-col items-center gap-1 group relative">
                  {count > 0 && (
                    <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-espresso border border-white/10 rounded px-1.5 py-0.5 text-[9px] text-cream whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                      {hour}h : {count}
                    </div>
                  )}
                  <div
                    className="w-full rounded-t-sm transition-colors group-hover:opacity-80"
                    style={{
                      height: `${(count / maxHour) * 72 + (count > 0 ? 4 : 0)}px`,
                      background: hour === peakHour
                        ? 'linear-gradient(180deg,#E8C97A,#C9A84C)'
                        : count > 0 ? 'rgba(201,168,76,0.3)' : 'rgba(255,255,255,0.04)',
                      minHeight: '2px',
                    }}
                  />
                </div>
              ))}
            </div>
            <div className="flex gap-1 mt-1.5">
              {hourCounts.map((_, hour) => (
                <div key={hour} className="flex-1 text-center">
                  {hour % 4 === 0 && <span className="text-[9px] text-cream/20">{hour}h</span>}
                </div>
              ))}
            </div>
            <p className="text-xs text-cream/30 mt-3">
              Pic d&apos;activité à <span className="text-gold/60">{peakHour}h00</span> avec {hourCounts[peakHour]} commande{hourCounts[peakHour] > 1 ? 's' : ''}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
