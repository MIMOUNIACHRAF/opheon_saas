'use client'

import { use, useState } from 'react'
import { toast } from 'sonner'
import { MapPin, Phone, Mail, Clock, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input, Textarea } from '@/components/ui/input'

export default function ContactPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await new Promise((r) => setTimeout(r, 1000))
    toast.success('Message envoyé ! Nous vous répondrons sous 24h.')
    setForm({ name: '', email: '', subject: '', message: '' })
    setLoading(false)
  }

  return (
    <div className="pt-24 pb-20">
      <div className="bg-charcoal border-b border-white/10 py-16 text-center">
        <p className="font-accent text-gold text-lg tracking-widest">— Nous trouver —</p>
        <h1 className="font-display text-5xl text-cream mt-2">Contact</h1>
        <div className="divider-gold w-24 mx-auto mt-4" />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Info */}
          <div className="space-y-8">
            <div>
              <h2 className="font-display text-3xl text-cream mb-6">Informations</h2>
              <div className="space-y-4">
                {[
                  { icon: <MapPin className="text-gold" size={20} />, title: 'Adresse', value: 'Centre-ville, Oujda, Maroc' },
                  { icon: <Phone className="text-gold" size={20} />, title: 'Téléphone', value: '+212 5XX XXX XXX' },
                  { icon: <Mail className="text-gold" size={20} />, title: 'Email', value: `contact@${slug}.ma` },
                  { icon: <Clock className="text-gold" size={20} />, title: 'Horaires', value: 'Lun–Dim : 08h00 – 23h00' },
                ].map((item) => (
                  <div key={item.title} className="flex items-start gap-4 bg-charcoal border border-white/10 rounded-xl p-4">
                    <div className="w-10 h-10 bg-gold/10 rounded-lg flex items-center justify-center shrink-0">{item.icon}</div>
                    <div>
                      <p className="text-xs text-cream/40 uppercase tracking-wider">{item.title}</p>
                      <p className="text-cream mt-0.5">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Map placeholder */}
            <div className="bg-charcoal border border-white/10 rounded-xl h-64 flex items-center justify-center overflow-hidden">
              <div className="text-center text-cream/20 space-y-2">
                <MapPin size={32} className="mx-auto text-gold/30" />
                <p className="text-sm">Carte interactive</p>
                <p className="text-xs">Intégration Google Maps disponible</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <div>
            <h2 className="font-display text-3xl text-cream mb-6">Envoyer un message</h2>
            <form onSubmit={handleSubmit} className="bg-charcoal border border-white/10 rounded-2xl p-8 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <Input label="Nom *" value={form.name} onChange={(e) => set('name', e.target.value)} required placeholder="Votre nom" />
                <Input label="Email *" value={form.email} onChange={(e) => set('email', e.target.value)} required type="email" placeholder="email@ex.com" />
              </div>
              <Input label="Sujet" value={form.subject} onChange={(e) => set('subject', e.target.value)} placeholder="Comment pouvons-nous vous aider ?" />
              <Textarea label="Message *" value={form.message} onChange={(e) => set('message', e.target.value)} required placeholder="Votre message…" />
              <Button type="submit" isLoading={loading} size="lg" className="w-full">
                <Send size={16} /> Envoyer le message
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
