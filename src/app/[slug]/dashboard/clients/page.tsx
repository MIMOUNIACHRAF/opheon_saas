'use client'

import { use, useEffect, useState, useCallback } from 'react'
import { Users, ShoppingBag, CalendarDays, Phone, Mail, TrendingUp, Search } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { formatPrice, formatDateShort } from '@/lib/utils'
import type { Order, Reservation } from '@/types'

type Client = {
  name: string
  email: string | null
  phone: string | null
  orderCount: number
  reservationCount: number
  totalSpent: number
  lastActivity: Date | string
  orders: Order[]
  reservations: Reservation[]
}

export default function ClientsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Client | null>(null)

  const load = useCallback(async () => {
    const [ordersRes, reservationsRes] = await Promise.all([
      fetch(`/api/${slug}/orders`).then((r) => r.json()),
      fetch(`/api/${slug}/reservations`).then((r) => r.json()),
    ])

    const orders: Order[] = Array.isArray(ordersRes) ? ordersRes : []
    const reservations: Reservation[] = Array.isArray(reservationsRes) ? reservationsRes : []

    const map = new Map<string, Client>()

    for (const order of orders) {
      const key = order.clientEmail || order.clientPhone || order.clientName
      if (!key) continue
      const existing = map.get(key)
      if (existing) {
        existing.orderCount++
        existing.totalSpent += order.total
        existing.orders.push(order)
        if (new Date(order.createdAt) > new Date(existing.lastActivity)) {
          existing.lastActivity = order.createdAt
        }
      } else {
        map.set(key, {
          name: order.clientName,
          email: order.clientEmail,
          phone: order.clientPhone,
          orderCount: 1,
          reservationCount: 0,
          totalSpent: order.total,
          lastActivity: order.createdAt,
          orders: [order],
          reservations: [],
        })
      }
    }

    for (const res of reservations) {
      const key = res.clientEmail || res.clientPhone || res.clientName
      if (!key) continue
      const existing = map.get(key)
      if (existing) {
        existing.reservationCount++
        existing.reservations.push(res)
        if (new Date(res.createdAt) > new Date(existing.lastActivity)) {
          existing.lastActivity = res.createdAt
        }
      } else {
        map.set(key, {
          name: res.clientName,
          email: res.clientEmail,
          phone: res.clientPhone,
          orderCount: 0,
          reservationCount: 1,
          totalSpent: 0,
          lastActivity: res.createdAt,
          orders: [],
          reservations: [res],
        })
      }
    }

    const sorted = Array.from(map.values()).sort(
      (a, b) => new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime()
    )

    setClients(sorted)
    setLoading(false)
  }, [slug])

  useEffect(() => { load() }, [load])

  const filtered = clients.filter((c) => {
    const q = search.toLowerCase()
    return (
      c.name.toLowerCase().includes(q) ||
      (c.email ?? '').toLowerCase().includes(q) ||
      (c.phone ?? '').includes(q)
    )
  })

  const totalRevenue = clients.reduce((s, c) => s + c.totalSpent, 0)
  const repeatClients = clients.filter((c) => c.orderCount + c.reservationCount > 1).length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl text-cream">Clients</h1>
        <p className="text-cream/40 mt-1">{clients.length} client{clients.length > 1 ? 's' : ''} au total</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-charcoal border border-white/10 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-lg bg-gold/10 flex items-center justify-center">
              <Users size={18} className="text-gold" />
            </div>
            <span className="text-cream/50 text-sm">Total clients</span>
          </div>
          <p className="font-display text-3xl text-cream">{loading ? '—' : clients.length}</p>
        </div>

        <div className="bg-charcoal border border-white/10 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-lg bg-gold/10 flex items-center justify-center">
              <TrendingUp size={18} className="text-gold" />
            </div>
            <span className="text-cream/50 text-sm">CA total clients</span>
          </div>
          <p className="font-display text-3xl text-cream">{loading ? '—' : formatPrice(totalRevenue)}</p>
        </div>

        <div className="bg-charcoal border border-white/10 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-lg bg-gold/10 flex items-center justify-center">
              <ShoppingBag size={18} className="text-gold" />
            </div>
            <span className="text-cream/50 text-sm">Clients fidèles</span>
          </div>
          <p className="font-display text-3xl text-cream">{loading ? '—' : repeatClients}</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-cream/30" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher un client…"
          className="w-full bg-charcoal border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-sm text-cream placeholder:text-cream/30 focus:outline-none focus:border-gold/50 transition-colors"
        />
      </div>

      {/* Table */}
      <div className="bg-charcoal border border-white/10 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left px-6 py-3 text-cream/40 font-medium">Client</th>
                <th className="text-left px-6 py-3 text-cream/40 font-medium">Contact</th>
                <th className="text-left px-6 py-3 text-cream/40 font-medium">Commandes</th>
                <th className="text-left px-6 py-3 text-cream/40 font-medium">Réservations</th>
                <th className="text-left px-6 py-3 text-cream/40 font-medium">Total dépensé</th>
                <th className="text-left px-6 py-3 text-cream/40 font-medium">Dernière activité</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(6)].map((_, i) => (
                  <tr key={i} className="border-b border-white/5">
                    {[...Array(7)].map((_, j) => (
                      <td key={j} className="px-6 py-4">
                        <Skeleton className="h-4 w-24" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center text-cream/30">
                    <Users size={40} className="mx-auto mb-3 text-cream/10" />
                    <p className="font-display text-xl">Aucun client trouvé</p>
                  </td>
                </tr>
              ) : (
                filtered.map((c, i) => (
                  <tr
                    key={i}
                    className="border-b border-white/5 hover:bg-white/3 transition-colors cursor-pointer"
                    onClick={() => setSelected(c)}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gold/15 flex items-center justify-center text-gold font-display text-sm shrink-0">
                          {c.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-cream font-medium">{c.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-0.5">
                        {c.email && (
                          <p className="text-cream/50 text-xs flex items-center gap-1.5">
                            <Mail size={11} className="text-gold/60" />{c.email}
                          </p>
                        )}
                        {c.phone && (
                          <p className="text-cream/50 text-xs flex items-center gap-1.5">
                            <Phone size={11} className="text-gold/60" />{c.phone}
                          </p>
                        )}
                        {!c.email && !c.phone && <span className="text-cream/20 text-xs">—</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-cream/70">
                        <ShoppingBag size={13} className="text-gold/60" />
                        <span>{c.orderCount}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-cream/70">
                        <CalendarDays size={13} className="text-gold/60" />
                        <span>{c.reservationCount}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gold font-display">
                      {c.totalSpent > 0 ? formatPrice(c.totalSpent) : <span className="text-cream/20">—</span>}
                    </td>
                    <td className="px-6 py-4 text-cream/40 text-xs">
                      {formatDateShort(c.lastActivity)}
                    </td>
                    <td className="px-6 py-4">
                      <Badge className="bg-gold/10 text-gold/80 border-gold/20 text-xs cursor-pointer hover:bg-gold/20 transition-colors">
                        Détails
                      </Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail modal */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-charcoal border border-white/10 rounded-2xl w-full max-w-lg max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-white/10 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gold/15 flex items-center justify-center text-gold font-display text-xl shrink-0">
                {selected.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="font-display text-xl text-cream">{selected.name}</h2>
                <div className="flex flex-wrap gap-3 mt-1">
                  {selected.email && (
                    <span className="text-xs text-cream/40 flex items-center gap-1">
                      <Mail size={11} />{selected.email}
                    </span>
                  )}
                  {selected.phone && (
                    <span className="text-xs text-cream/40 flex items-center gap-1">
                      <Phone size={11} />{selected.phone}
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="text-cream/30 hover:text-cream transition-colors text-xl leading-none"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Stats */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-white/5 rounded-lg p-3 text-center">
                  <p className="font-display text-2xl text-cream">{selected.orderCount}</p>
                  <p className="text-xs text-cream/40 mt-0.5">Commandes</p>
                </div>
                <div className="bg-white/5 rounded-lg p-3 text-center">
                  <p className="font-display text-2xl text-cream">{selected.reservationCount}</p>
                  <p className="text-xs text-cream/40 mt-0.5">Réservations</p>
                </div>
                <div className="bg-white/5 rounded-lg p-3 text-center">
                  <p className="font-display text-lg text-gold">{formatPrice(selected.totalSpent)}</p>
                  <p className="text-xs text-cream/40 mt-0.5">Total dépensé</p>
                </div>
              </div>

              {/* Orders */}
              {selected.orders.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-cream/60 mb-3 flex items-center gap-2">
                    <ShoppingBag size={14} className="text-gold" /> Commandes récentes
                  </h3>
                  <div className="space-y-2">
                    {selected.orders.slice(0, 5).map((o) => (
                      <div key={o.id} className="flex items-center justify-between bg-white/5 rounded-lg px-4 py-2.5">
                        <div>
                          <p className="text-xs text-cream/70 capitalize">{o.type.toLowerCase().replace('_', ' ')}</p>
                          <p className="text-xs text-cream/30">{formatDateShort(o.createdAt)}</p>
                        </div>
                        <span className="text-gold font-display text-sm">{formatPrice(o.total)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Reservations */}
              {selected.reservations.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-cream/60 mb-3 flex items-center gap-2">
                    <CalendarDays size={14} className="text-gold" /> Réservations
                  </h3>
                  <div className="space-y-2">
                    {selected.reservations.slice(0, 5).map((r) => (
                      <div key={r.id} className="flex items-center justify-between bg-white/5 rounded-lg px-4 py-2.5">
                        <div>
                          <p className="text-xs text-cream/70">{formatDateShort(r.date)} à {r.time}</p>
                          <p className="text-xs text-cream/30">{r.covers} personne{r.covers > 1 ? 's' : ''}</p>
                        </div>
                        <Badge
                          className={
                            r.status === 'CONFIRMED'
                              ? 'bg-green-500/20 text-green-400 border-green-500/30 text-xs'
                              : r.status === 'CANCELLED'
                              ? 'bg-red-500/20 text-red-400 border-red-500/30 text-xs'
                              : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-xs'
                          }
                        >
                          {r.status === 'CONFIRMED' ? 'Confirmée' : r.status === 'CANCELLED' ? 'Annulée' : 'En attente'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
