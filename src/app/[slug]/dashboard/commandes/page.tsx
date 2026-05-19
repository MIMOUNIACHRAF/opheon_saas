'use client'

import { use, useEffect, useState, useCallback } from 'react'
import { toast } from 'sonner'
import { RefreshCw } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { formatPrice, formatDate, ORDER_STATUS_LABELS, ORDER_TYPE_LABELS, STATUS_COLORS } from '@/lib/utils'
import type { OrderWithItems } from '@/types'

const STATUSES = ['PENDING','PREPARING','READY','DELIVERED','CANCELLED'] as const
type Status = typeof STATUSES[number]

export default function CommandesPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const [orders, setOrders] = useState<OrderWithItems[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<Status | 'ALL'>('ALL')
  const [expanded, setExpanded] = useState<string | null>(null)

  const load = useCallback(async () => {
    const data = await fetch(`/api/${slug}/orders`).then((r) => r.json())
    setOrders(data)
    setLoading(false)
  }, [slug])

  useEffect(() => { load() }, [load])
  useEffect(() => { const t = setInterval(load, 30000); return () => clearInterval(t) }, [load])

  const filtered = filter === 'ALL' ? orders : orders.filter((o) => o.status === filter)

  const updateStatus = async (id: string, status: Status) => {
    await fetch(`/api/${slug}/orders/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) })
    toast.success('Statut mis à jour')
    load()
  }

  const nextStatus: Record<string, Status> = { PENDING: 'PREPARING', PREPARING: 'READY', READY: 'DELIVERED' }
  const nextLabel: Record<string, string> = { PENDING: '→ En préparation', PREPARING: '→ Prêt', READY: '→ Livré' }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl text-cream">Commandes</h1>
          <p className="text-cream/40 mt-1">{orders.length} commande{orders.length>1?'s':''} au total</p>
        </div>
        <Button variant="outline" onClick={() => { setLoading(true); load() }} size="sm"><RefreshCw size={14}/> Actualiser</Button>
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2">
        {(['ALL', ...STATUSES] as const).map((s) => {
          const count = s === 'ALL' ? orders.length : orders.filter((o) => o.status === s).length
          return (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-4 py-1.5 rounded-full text-sm transition-all ${filter===s?'gradient-gold text-espresso font-semibold':'border border-white/10 text-cream/60 hover:text-cream'}`}>
              {s === 'ALL' ? 'Toutes' : ORDER_STATUS_LABELS[s]} ({count})
            </button>
          )
        })}
      </div>

      {/* Orders list */}
      <div className="space-y-3">
        {loading ? [...Array(5)].map((_,i)=><Skeleton key={i} className="h-20"/>) : filtered.length === 0 ? (
          <div className="text-center py-16 text-cream/30 bg-charcoal rounded-xl border border-white/10">
            <p className="font-display text-xl">Aucune commande</p>
          </div>
        ) : filtered.map((order) => (
          <div key={order.id} className="bg-charcoal border border-white/10 rounded-xl overflow-hidden">
            <div
              className="flex items-center gap-4 p-4 cursor-pointer hover:bg-white/2 transition-colors"
              onClick={() => setExpanded(expanded === order.id ? null : order.id)}
            >
              <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <p className="text-cream font-medium">{order.clientName}</p>
                  <p className="text-xs text-cream/40">{formatDate(order.createdAt)}</p>
                </div>
                <div>
                  <p className="text-cream/60 text-sm">{ORDER_TYPE_LABELS[order.type]}</p>
                  <p className="text-xs text-cream/40">{order.items.reduce((s,i)=>s+i.quantity,0)} article{order.items.reduce((s,i)=>s+i.quantity,0)>1?'s':''}</p>
                </div>
                <div>
                  <p className="text-gold font-display text-lg">{formatPrice(order.total)}</p>
                </div>
                <div>
                  <Badge className={STATUS_COLORS[order.status]}>{ORDER_STATUS_LABELS[order.status]}</Badge>
                </div>
              </div>
            </div>

            {expanded === order.id && (
              <div className="border-t border-white/10 p-4 space-y-4 bg-espresso/30">
                {/* Items */}
                <div className="space-y-2">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-cream/70">{item.product.nameFr} × {item.quantity}</span>
                      <span className="text-gold">{formatPrice(item.unitPrice * item.quantity)}</span>
                    </div>
                  ))}
                </div>
                {order.note && <p className="text-xs text-cream/40 italic bg-white/5 rounded-lg px-3 py-2">Note : {order.note}</p>}
                {order.address && <p className="text-xs text-cream/40">Livraison : {order.address}</p>}

                {/* Status actions */}
                <div className="flex flex-wrap gap-2 pt-2">
                  {nextStatus[order.status] && (
                    <Button size="sm" onClick={() => updateStatus(order.id, nextStatus[order.status]!)}>
                      {nextLabel[order.status]}
                    </Button>
                  )}
                  {order.status !== 'CANCELLED' && order.status !== 'DELIVERED' && (
                    <Button size="sm" variant="danger" onClick={() => updateStatus(order.id, 'CANCELLED')}>
                      Annuler
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
