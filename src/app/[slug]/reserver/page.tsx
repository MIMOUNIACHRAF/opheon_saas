'use client'

import { use, useState } from 'react'
import { toast } from 'sonner'
import { Calendar, Clock, Users, Phone, Mail, User, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input, Textarea } from '@/components/ui/input'

export default function ReserverPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [form, setForm] = useState({
    clientName: '', clientPhone: '', clientEmail: '',
    date: '', time: '', covers: 2, note: '',
  })

  const set = (k: string, v: string | number) => setForm((f) => ({ ...f, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch(`/api/${slug}/reservations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error()
      setDone(true)
      toast.success('Réservation envoyée ! Nous vous confirmons bientôt.')
    } catch {
      toast.error('Erreur lors de la réservation. Réessayez.')
    } finally {
      setLoading(false)
    }
  }

  const times = ['09:00','09:30','10:00','10:30','11:00','11:30','12:00','12:30',
    '13:00','13:30','14:00','14:30','19:00','19:30','20:00','20:30','21:00','21:30','22:00']

  return (
    <div className="pt-24 pb-20">
      <div className="bg-charcoal border-b border-white/10 py-16 text-center">
        <p className="font-accent text-gold text-lg tracking-widest">— Réservation —</p>
        <h1 className="font-display text-5xl text-cream mt-2">Réserver une Table</h1>
        <div className="divider-gold w-24 mx-auto mt-4" />
      </div>

      <div className="max-w-2xl mx-auto px-4 mt-16">
        {done ? (
          <div className="text-center space-y-6 py-16 bg-charcoal border border-green-500/20 rounded-2xl px-8">
            <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="font-display text-3xl text-cream">Demande envoyée !</h2>
            <p className="text-cream/60">
              Votre réservation pour <strong className="text-gold">{form.covers} personne{form.covers > 1 ? 's' : ''}</strong> le{' '}
              <strong className="text-gold">{form.date}</strong> à <strong className="text-gold">{form.time}</strong> est en cours de traitement.
            </p>
            <p className="text-cream/40 text-sm">Vous recevrez une confirmation rapidement.</p>
            <Button onClick={() => setDone(false)} variant="outline" size="lg">
              Nouvelle réservation
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-charcoal border border-white/10 rounded-2xl p-8 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="relative">
                <User size={16} className="absolute left-3 top-9 text-gold/60 pointer-events-none" />
                <Input label="Nom complet *" value={form.clientName} onChange={(e) => set('clientName', e.target.value)}
                  placeholder="Jean Dupont" required className="pl-9" />
              </div>
              <div className="relative">
                <Phone size={16} className="absolute left-3 top-9 text-gold/60 pointer-events-none" />
                <Input label="Téléphone *" value={form.clientPhone} onChange={(e) => set('clientPhone', e.target.value)}
                  placeholder="+212 6XX XXX XXX" type="tel" required className="pl-9" />
              </div>
            </div>

            <div className="relative">
              <Mail size={16} className="absolute left-3 top-9 text-gold/60 pointer-events-none" />
              <Input label="Email" value={form.clientEmail} onChange={(e) => set('clientEmail', e.target.value)}
                placeholder="votre@email.com" type="email" className="pl-9" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="relative">
                <Calendar size={16} className="absolute left-3 top-9 text-gold/60 pointer-events-none" />
                <Input label="Date *" value={form.date} onChange={(e) => set('date', e.target.value)}
                  type="date" required className="pl-9"
                  min={new Date().toISOString().split('T')[0]} />
              </div>
              <div>
                <label className="text-sm text-cream/70 font-medium mb-1.5 block">
                  <Clock size={14} className="inline mr-1 text-gold/60" />Heure *
                </label>
                <select
                  value={form.time} onChange={(e) => set('time', e.target.value)} required
                  className="w-full bg-charcoal border border-white/10 rounded-lg px-4 py-2.5 text-cream text-sm outline-none focus:border-gold/60"
                >
                  <option value="">Choisir</option>
                  {times.map((t) => <option key={t} value={t} className="bg-charcoal">{t}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm text-cream/70 font-medium mb-1.5 block">
                  <Users size={14} className="inline mr-1 text-gold/60" />Couverts *
                </label>
                <select
                  value={form.covers} onChange={(e) => set('covers', Number(e.target.value))} required
                  className="w-full bg-charcoal border border-white/10 rounded-lg px-4 py-2.5 text-cream text-sm outline-none focus:border-gold/60"
                >
                  {[1,2,3,4,5,6,7,8,10,12,15,20].map((n) => (
                    <option key={n} value={n} className="bg-charcoal">{n} personne{n>1?'s':''}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="relative">
              <MessageSquare size={16} className="absolute left-3 top-9 text-gold/60 pointer-events-none" />
              <Textarea label="Note (allergies, occasion spéciale…)" value={form.note}
                onChange={(e) => set('note', e.target.value)} placeholder="Anniversaire, allergie aux fruits à coque…"
                className="pl-9" />
            </div>

            <Button type="submit" isLoading={loading} size="lg" className="w-full">
              <Calendar size={18} />
              Confirmer la réservation
            </Button>
          </form>
        )}
      </div>
    </div>
  )
}
