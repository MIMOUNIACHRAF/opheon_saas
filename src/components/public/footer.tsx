import Link from 'next/link'
import { MapPin, Phone, Mail, Clock, Share2, Link2 } from 'lucide-react'
import type { Tenant } from '@/types'

export function PublicFooter({ tenant }: { tenant: Tenant }) {
  const slug = tenant.slug
  return (
    <footer className="bg-charcoal border-t border-white/10 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-espresso font-display font-bold"
                style={{ background: tenant.primaryColor }}
              >
                {tenant.name.charAt(0)}
              </div>
              <span className="font-display text-2xl text-cream">{tenant.name}</span>
            </div>
            {tenant.tagline && (
              <p className="font-accent text-lg text-gold">{tenant.tagline}</p>
            )}
            {tenant.description && (
              <p className="text-sm text-cream/50 leading-relaxed">{tenant.description}</p>
            )}
            <div className="flex gap-3 pt-2">
              {tenant.instagram && (
                <a
                  href={`https://instagram.com/${tenant.instagram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 border border-white/10 rounded-lg text-cream/50 hover:text-gold hover:border-gold/30 transition-colors"
                >
                  <Share2 size={16} />
                </a>
              )}
              {tenant.facebook && (
                <a
                  href={`https://facebook.com/${tenant.facebook}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 border border-white/10 rounded-lg text-cream/50 hover:text-gold hover:border-gold/30 transition-colors"
                >
                  <Link2 size={16} />
                </a>
              )}
            </div>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="font-display text-cream text-lg gold-underline pb-2">Contact</h4>
            <ul className="space-y-3">
              {tenant.address && (
                <li className="flex items-start gap-3 text-sm text-cream/60">
                  <MapPin size={16} className="text-gold mt-0.5 shrink-0" />
                  <span>{tenant.address}{tenant.city ? `, ${tenant.city}` : ''}</span>
                </li>
              )}
              {tenant.phone && (
                <li className="flex items-center gap-3 text-sm text-cream/60">
                  <Phone size={16} className="text-gold shrink-0" />
                  <a href={`tel:${tenant.phone}`} className="hover:text-cream transition-colors">
                    {tenant.phone}
                  </a>
                </li>
              )}
              {tenant.email && (
                <li className="flex items-center gap-3 text-sm text-cream/60">
                  <Mail size={16} className="text-gold shrink-0" />
                  <a href={`mailto:${tenant.email}`} className="hover:text-cream transition-colors">
                    {tenant.email}
                  </a>
                </li>
              )}
              {tenant.hours && (
                <li className="flex items-start gap-3 text-sm text-cream/60">
                  <Clock size={16} className="text-gold mt-0.5 shrink-0" />
                  <span>{tenant.hours}</span>
                </li>
              )}
            </ul>
          </div>

          {/* Navigation */}
          <div className="space-y-4">
            <h4 className="font-display text-cream text-lg gold-underline pb-2">Navigation</h4>
            <ul className="space-y-2">
              {[
                { href: `/${slug}`,           label: 'Accueil' },
                { href: `/${slug}/menu`,      label: 'Notre Menu' },
                { href: `/${slug}/reserver`,  label: 'Réservation' },
                { href: `/${slug}/commander`, label: 'Commander' },
                { href: `/${slug}/contact`,   label: 'Contact' },
              ].map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm text-cream/50 hover:text-gold transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="divider-gold my-10" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-cream/30">
          <p>© {new Date().getFullYear()} {tenant.name}. Tous droits réservés.</p>
          <p>
            Propulsé par{' '}
            <Link href="/" className="text-gold hover:text-gold-light transition-colors">
              Opheon SaaS
            </Link>
          </p>
        </div>
      </div>
    </footer>
  )
}
