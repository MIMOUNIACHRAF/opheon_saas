'use client'

import { useState } from 'react'
import { Mail, Gift, Star, ArrowRight, CheckCircle } from 'lucide-react'

const PERKS = [
  { icon: Gift, label: '10% sur votre 1ère commande' },
  { icon: Star, label: 'Offres exclusives membres' },
  { icon: Mail, label: 'Actualités en avant-première' },
]

export function NewsletterSection() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setStatus('loading')
    await new Promise((r) => setTimeout(r, 900))
    setStatus('success')
    setEmail('')
  }

  return (
    <section className="py-24 relative overflow-hidden" style={{ background: '#2C1F17' }}>
      {/* Dot pattern bg */}
      <div className="absolute inset-0 pointer-events-none" style={{ opacity: 0.05 }}>
        <svg width="100%" height="100%">
          <defs>
            <pattern id="nl-dots" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
              <circle cx="20" cy="20" r="1" fill="#C9A84C" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#nl-dots)" />
        </svg>
      </div>

      <div className="max-w-3xl mx-auto px-6 relative text-center space-y-10">
        {/* Header */}
        <div className="space-y-4">
          <div className="inline-flex items-center gap-3">
            <div className="h-px w-12" style={{ background: 'linear-gradient(90deg, transparent, #C9A84C)' }} />
            <span className="font-accent text-sm tracking-[0.4em] uppercase" style={{ color: '#C9A84C' }}>
              Programme Fidélité
            </span>
            <div className="h-px w-12" style={{ background: 'linear-gradient(90deg, #C9A84C, transparent)' }} />
          </div>
          <h2 className="font-display text-4xl md:text-5xl" style={{ color: '#F5EDD8' }}>
            Rejoignez notre <span style={{ color: '#C9A84C' }}>communauté</span>
          </h2>
          <p className="max-w-md mx-auto" style={{ color: 'rgba(245,237,216,0.5)' }}>
            Inscrivez-vous pour recevoir nos offres exclusives, nouveautés et événements en avant-première.
          </p>
        </div>

        {/* Perks */}
        <div className="grid grid-cols-3 gap-6">
          {PERKS.map(({ icon: Icon, label }) => (
            <div key={label} className="space-y-3">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center mx-auto"
                style={{ background: 'rgba(201,168,76,0.12)', border: '1px solid rgba(201,168,76,0.2)' }}
              >
                <Icon size={20} style={{ color: '#C9A84C' }} />
              </div>
              <p className="text-xs leading-relaxed" style={{ color: 'rgba(245,237,216,0.5)' }}>{label}</p>
            </div>
          ))}
        </div>

        {/* Form / Success */}
        {status === 'success' ? (
          <div
            className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl"
            style={{ background: 'rgba(201,168,76,0.12)', border: '1px solid rgba(201,168,76,0.25)' }}
          >
            <CheckCircle size={20} style={{ color: '#C9A84C' }} />
            <span className="font-medium" style={{ color: '#C9A84C' }}>
              Merci ! Vous êtes maintenant inscrit(e).
            </span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-sm mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="votre@email.com"
              required
              className="flex-1 px-5 py-3.5 rounded-xl text-sm outline-none"
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(201,168,76,0.2)',
                color: '#F5EDD8',
              }}
            />
            <button
              type="submit"
              disabled={status === 'loading'}
              className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-sm transition-all hover:scale-105 disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg, #C9A84C, #E8C97A)', color: '#1A0F0A' }}
            >
              {status === 'loading' ? 'Inscription…' : (<>S&apos;inscrire <ArrowRight size={15} /></>)}
            </button>
          </form>
        )}
      </div>
    </section>
  )
}
