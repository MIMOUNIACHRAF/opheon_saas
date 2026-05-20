'use client'

import { use, useEffect, useState, useCallback } from 'react'
import { toast } from 'sonner'
import { RefreshCw, Clock, Phone, MapPin, ChevronDown, ChevronUp } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { formatPrice, ORDER_TYPE_LABELS, STATUS_COLORS, ORDER_STATUS_LABELS } from '@/lib/utils'
import { cn } from '@/lib/utils'
import type { OrderWithItems } from '@/types'

type Status = 'PENDING' | 'PREPARING' | 'READY' | 'DELIVERED' | 'CANCELLED'

function getElapsed(date: Date | string): { label: string; level: 'ok' | 'warn' | 'urgent' } {
  const ms = Date.now() - new Date(date).getTime()
  const mins = Math.floor(ms / 60000)
  if (mins < 60) {
    return {
      label: `${mins} min`,
      level: mins >= 15 ? 'urgent' : mins >= 8 ? 'warn' : 'ok',
    }
  }
  const hrs = Math.floor(mins / 60)
  const rem = mins % 60
  return { label: rem > 0 ? `${hrs}h${String(rem).padStart(2, '0')}` : `${hrs}h`, level: 'urgent' }
}

const URGENCY_STYLES = {
  ok:     { border: 'border-white/10',         dot: 'bg-green-500',  text: 'text-green-400',  bg: '' },
  warn:   { border: 'border-yellow-500/30',    dot: 'bg-yellow-400', text: 'text-yellow-400', bg: 'bg-yellow-500/5' },
  urgent: { border: 'border-red-500/40',       dot: 'bg-red-500',    text: 'text-red-400',    bg: 'bg-red-500/5' },
}

const NEXT_STATUS: Partial<Record<Status, Status>> = {
  PENDING: 'PREPARING',
  PREPARING: 'READY',
  READY: 'DELIVERED',
}
const NEXT_LABEL: Partial<Record<Status, string>> = {
  PENDING: 'Démarrer',
  PREPARING: 'Marquer prêt',
  READY: 'Livré',
}

function OrderCard({ order, slug, onUpdate }: { order: OrderWithItems; slug: string; onUpdate: () => void }) {
  const [expanded, setExpanded] = useState(false)
  const [updating, setUpdating] = useState(false)

  const isActive = ['PENDING', 'PREPARING', 'READY'].includes(order.status)
  const elapsed = isActive ? getElapsed(order.createdAt) : null
  const urgency = elapsed?.level ?? 'ok'
  const styles = URGENCY_STYLES[urgency]
  const itemCount = order.items.reduce((s, i) => s + i.quantity, 0)

  const advance = async () => {
    const next = NEXT_STATUS[order.status as Status]
    if (!next) return
    setUpdating(true)
    await fetch(`/api/${slug}/orders/${order.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: next }),
    })
    toast.success(
      next === 'PREPARING' ? 'Commande en préparation' :
      next === 'READY' ? 'Commande prête !' :
      'Commande livrée'
    )
    setUpdating(false)
    onUpdate()
  }

  const cancel = async () => {
    if (!confirm('Annuler cette commande ?')) return
    setUpdating(true)
    await fetch(`/api/${slug}/orders/${order.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'CANCELLED' }),
    })
    toast.error('Commande annulée')
    setUpdating(false)
    onUpdate()
  }

  return (
    <div className={cn('rounded-xl border transition-all duration-300', styles.border, styles.bg, isActive && urgency !== 'ok' && 'shadow-sm')}>
      {/* Main row */}
      <div className="flex items-start gap-3 p-4">
        {/* Urgency dot */}
        {isActive && (
          <div className="mt-1.5 shrink-0 flex flex-col items-center gap-1">
            <div className={cn('w-2.5 h-2.5 rounded-full shrink-0', styles.dot, urgency !== 'ok' && 'animate-pulse')} />
          </div>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="text-cream font-semibold">{order.clientName}</span>
            <span className="text-cream/40 text-xs">{ORDER_TYPE_LABELS[order.type]}</span>
            {order.clientPhone && (
              <a href={`tel:${order.clientPhone}`} className="text-cream/30 hover:text-gold text-xs flex items-center gap-1 transition-colors">
                <Phone size={11} />{order.clientPhone}
              </a>
            )}
          </div>

          {/* Items inline */}
          <p className="text-sm text-cream/50 mt-1 truncate">
            {order.items.map((i) => `${i.product.nameFr} ×${i.quantity}`).join(' · ')}
          </p>

          {order.address && (
            <p className="text-xs text-cream/30 mt-1 flex items-center gap-1">
              <MapPin size={10} />{order.address}
            </p>
          )}
          {order.note && (
            <p className="text-xs text-gold/60 mt-1 italic">Note : {order.note}</p>
          )}
        </div>

        {/* Right column */}
        <div className="shrink-0 flex flex-col items-end gap-2">
          <p className="font-display text-lg text-gold leading-none">{formatPrice(order.total)}</p>
          <p className="text-cream/40 text-xs">{itemCount} art.</p>

          {/* Status badge or elapsed */}
          {isActive && elapsed ? (
            <div className={cn('flex items-center gap-1 text-xs font-medium', styles.text)}>
              <Clock size={11} />
              <span>{elapsed.label}</span>
            </div>
          ) : (
            <Badge className={cn(STATUS_COLORS[order.status], 'text-xs')}>
              {ORDER_STATUS_LABELS[order.status]}
            </Badge>
          )}
        </div>
      </div>

      {/* Action bar for active orders */}
      {isActive && (
        <div className="flex items-center gap-2 px-4 pb-3 pt-0">
          {NEXT_STATUS[order.status as Status] && (
            <button
              onClick={advance}
              disabled={updating}
              className="flex-1 py-2 rounded-lg text-xs font-semibold bg-gold/15 text-gold border border-gold/30 hover:bg-gold/25 transition-colors disabled:opacity-50"
            >
              {updating ? '…' : `→ ${NEXT_LABEL[order.status as Status]}`}
            </button>
          )}
          {order.status !== 'CANCELLED' && order.status !== 'DELIVERED' && (
            <button
              onClick={cancel}
              disabled={updating}
              className="py-2 px-3 rounded-lg text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors disabled:opacity-50"
            >
              ✕
            </button>
          )}
          <button
            onClick={() => setExpanded(!expanded)}
            className="py-2 px-2 rounded-lg text-xs text-cream/30 hover:text-cream/60 transition-colors"
          >
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>
      )}

      {/* Expanded detail (for history / inactive) */}
      {(!isActive || expanded) && (
        <div className="border-t border-white/8 px-4 pb-4 pt-3 space-y-2">
          {order.items.map((item) => (
            <div key={item.id} className="flex justify-between text-xs">
              <span className="text-cream/60">{item.product.nameFr} × {item.quantity}</span>
              <span className="text-cream/40">{formatPrice(item.unitPrice * item.quantity)}</span>
            </div>
          ))}
          {!isActive && (
            <div className="flex items-center gap-2 pt-1">
              <Badge className={cn(STATUS_COLORS[order.status], 'text-xs')}>
                {ORDER_STATUS_LABELS[order.status]}
              </Badge>
              <span className="text-cream/20 text-xs">{new Date(order.createdAt).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function CommandesPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const [orders, setOrders] = useState<OrderWithItems[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<Status | 'ALL'>('ALL')
  const [countdown, setCountdown] = useState(30)

  const load = useCallback(async () => {
    const data = await fetch(`/api/${slug}/orders`).then((r) => r.json())
    setOrders(Array.isArray(data) ? data : [])
    setLoading(false)
    setCountdown(30)
  }, [slug])

  useEffect(() => { load() }, [load])

  // Auto-refresh countdown
  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) { load(); return 30 }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [load])

  const filtered = filter === 'ALL' ? orders : orders.filter((o) => o.status === filter)

  const counts = {
    ALL: orders.length,
    PENDING: orders.filter((o) => o.status === 'PENDING').length,
    PREPARING: orders.filter((o) => o.status === 'PREPARING').length,
    READY: orders.filter((o) => o.status === 'READY').length,
    DELIVERED: orders.filter((o) => o.status === 'DELIVERED').length,
    CANCELLED: orders.filter((o) => o.status === 'CANCELLED').length,
  }

  const urgent = orders.filter((o) => {
    if (!['PENDING', 'PREPARING'].includes(o.status)) return false
    const mins = Math.floor((Date.now() - new Date(o.createdAt).getTime()) / 60000)
    return mins >= 8
  }).length

  const FILTER_TABS: { key: Status | 'ALL'; label: string }[] = [
    { key: 'ALL', label: 'Toutes' },
    { key: 'PENDING', label: 'En attente' },
    { key: 'PREPARING', label: 'Préparation' },
    { key: 'READY', label: 'Prêt' },
    { key: 'DELIVERED', label: 'Livré' },
    { key: 'CANCELLED', label: 'Annulé' },
  ]

  // Countdown ring
  const pct = countdown / 30
  const r = 9
  const circ = 2 * Math.PI * r
  const dash = circ * pct

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-cream">Commandes</h1>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-cream/40 text-sm">{orders.length} commande{orders.length > 1 ? 's' : ''}</span>
            {urgent > 0 && (
              <span className="flex items-center gap-1.5 text-xs font-semibold text-red-400 bg-red-500/10 border border-red-500/20 px-2.5 py-1 rounded-full animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 inline-block" />
                {urgent} urgent{urgent > 1 ? 'es' : 'e'}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Countdown ring */}
          <button
            onClick={() => { setLoading(true); load() }}
            className="flex items-center gap-2 text-xs text-cream/40 hover:text-cream transition-colors group"
            title={`Actualisation dans ${countdown}s`}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" className="rotate-[-90deg]">
              <circle cx="12" cy="12" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="2" />
              <circle cx="12" cy="12" r={r} fill="none" stroke="#C9A84C" strokeWidth="2"
                strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" className="transition-all duration-1000" />
            </svg>
            <RefreshCw size={13} className="group-hover:rotate-180 transition-transform duration-500" />
            <span className="hidden sm:inline">{countdown}s</span>
          </button>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-1.5">
        {FILTER_TABS.map(({ key, label }) => {
          const count = counts[key]
          const hasPending = (key === 'PENDING' || key === 'PREPARING') && count > 0
          return (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={cn(
                'flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all',
                filter === key
                  ? 'gradient-gold text-espresso shadow-sm'
                  : 'border border-white/10 text-cream/50 hover:text-cream hover:border-white/20'
              )}
            >
              {hasPending && filter !== key && (
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block" />
              )}
              {label}
              <span className={cn(
                'px-1.5 py-0.5 rounded-full text-[10px]',
                filter === key ? 'bg-espresso/20' : 'bg-white/8'
              )}>
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Orders */}
      <div className="space-y-2.5">
        {loading ? (
          [...Array(4)].map((_, i) => <Skeleton key={i} className="h-24" />)
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-cream/20 bg-charcoal rounded-xl border border-white/8">
            <p className="font-display text-xl">Aucune commande</p>
            <p className="text-sm mt-1">dans cette catégorie</p>
          </div>
        ) : (
          filtered.map((order) => (
            <OrderCard key={order.id} order={order} slug={slug} onUpdate={load} />
          ))
        )}
      </div>
    </div>
  )
}
