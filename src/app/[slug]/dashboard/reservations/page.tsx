'use client'

import { use, useEffect, useState, useCallback } from 'react'
import { toast } from 'sonner'
import { CalendarDays, Users, Phone, Mail, CheckCircle, XCircle, Clock } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { formatDateShort, RESERVATION_STATUS_LABELS, STATUS_COLORS } from '@/lib/utils'
import type { Reservation, ReservationStatus } from '@/types'

export default function ReservationsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<ReservationStatus | 'ALL'>('ALL')

  const load = useCallback(async () => {
    const data = await fetch(`/api/${slug}/reservations`).then((r) => r.json())
    setReservations(data)
    setLoading(false)
  }, [slug])

  useEffect(() => { load() }, [load])

  const filtered = filter === 'ALL' ? reservations : reservations.filter((r) => r.status === filter)

  const updateStatus = async (id: string, status: ReservationStatus) => {
    await fetch(`/api/${slug}/reservations/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) })
    toast.success('Statut mis à jour')
    load()
  }

  const counts = {
    ALL: reservations.length,
    PENDING: reservations.filter((r) => r.status === 'PENDING').length,
    CONFIRMED: reservations.filter((r) => r.status === 'CONFIRMED').length,
    CANCELLED: reservations.filter((r) => r.status === 'CANCELLED').length,
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl text-cream">Réservations</h1>
        <p className="text-cream/40 mt-1">{reservations.length} réservation{reservations.length>1?'s':''}</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {(['ALL','PENDING','CONFIRMED','CANCELLED'] as const).map((s) => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-4 py-1.5 rounded-full text-sm transition-all ${filter===s?'gradient-gold text-espresso font-semibold':'border border-white/10 text-cream/60 hover:text-cream'}`}>
            {s === 'ALL' ? 'Toutes' : RESERVATION_STATUS_LABELS[s]} ({counts[s]})
          </button>
        ))}
      </div>

      {/* List */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {loading ? [...Array(6)].map((_,i)=><Skeleton key={i} className="h-44"/>) : filtered.length === 0 ? (
          <div className="col-span-3 text-center py-16 bg-charcoal rounded-xl border border-white/10 text-cream/30">
            <CalendarDays size={40} className="mx-auto mb-3 text-cream/10"/>
            <p className="font-display text-xl">Aucune réservation</p>
          </div>
        ) : filtered.map((r) => (
          <div key={r.id} className="bg-charcoal border border-white/10 rounded-xl p-5 space-y-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-cream font-medium">{r.clientName}</p>
                <div className="flex items-center gap-3 mt-1 text-xs text-cream/40">
                  <span className="flex items-center gap-1"><CalendarDays size={11}/>{formatDateShort(r.date)}</span>
                  <span className="flex items-center gap-1"><Clock size={11}/>{r.time}</span>
                  <span className="flex items-center gap-1"><Users size={11}/>{r.covers} pers.</span>
                </div>
              </div>
              <Badge className={STATUS_COLORS[r.status]}>{RESERVATION_STATUS_LABELS[r.status]}</Badge>
            </div>

            <div className="space-y-1">
              {r.clientPhone && <p className="text-xs text-cream/50 flex items-center gap-2"><Phone size={12} className="text-gold/60"/>{r.clientPhone}</p>}
              {r.clientEmail && <p className="text-xs text-cream/50 flex items-center gap-2"><Mail size={12} className="text-gold/60"/>{r.clientEmail}</p>}
              {r.note && <p className="text-xs text-cream/40 italic bg-white/5 rounded-lg px-3 py-2 mt-2">{r.note}</p>}
            </div>

            {r.status === 'PENDING' && (
              <div className="flex gap-2">
                <button onClick={() => updateStatus(r.id, 'CONFIRMED')}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium bg-green-600/20 text-green-400 border border-green-600/30 hover:bg-green-600/30 transition-colors">
                  <CheckCircle size={14}/> Confirmer
                </button>
                <button onClick={() => updateStatus(r.id, 'CANCELLED')}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium bg-red-600/20 text-red-400 border border-red-600/30 hover:bg-red-600/30 transition-colors">
                  <XCircle size={14}/> Annuler
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
