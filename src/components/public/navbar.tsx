'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ShoppingCart, Menu, X, ArrowRight, Calendar } from 'lucide-react'
import { useCartStore } from '@/stores/cart.store'
import { cn } from '@/lib/utils'
import type { Tenant } from '@/types'

interface NavbarProps {
  tenant: Tenant
}

export function PublicNavbar({ tenant }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()
  const { itemCount, toggleCart } = useCartStore()
  const count = itemCount()
  const slug = tenant.slug

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  const links = [
    { href: `/${slug}`,           label: 'Accueil' },
    { href: `/${slug}/menu`,      label: 'Menu' },
    { href: `/${slug}/galerie`,   label: 'Galerie' },
    { href: `/${slug}/reserver`,  label: 'Réserver' },
    { href: `/${slug}/commander`, label: 'Commander' },
    { href: `/${slug}/contact`,   label: 'Contact' },
  ]

  return (
    <>
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-40 transition-all duration-300',
          scrolled ? 'glass border-b border-gold/20 py-3' : 'bg-transparent py-5'
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href={`/${slug}`} className="flex items-center gap-3 group">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-espresso font-display font-bold text-sm shrink-0"
                style={{ background: tenant.primaryColor }}
              >
                {tenant.name.charAt(0)}
              </div>
              <span className="font-display text-xl text-cream group-hover:text-gold transition-colors">
                {tenant.name}
              </span>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-1">
              {links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className={cn(
                    'px-4 py-2 rounded-lg text-sm transition-all duration-200',
                    pathname === l.href
                      ? 'text-gold bg-gold/10'
                      : 'text-cream/70 hover:text-cream hover:bg-white/5'
                  )}
                >
                  {l.label}
                </Link>
              ))}
            </nav>

            {/* Right actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={toggleCart}
                className="relative p-2.5 text-cream/70 hover:text-gold transition-colors"
                aria-label="Panier"
              >
                <ShoppingCart size={20} />
                {count > 0 && (
                  <span
                    className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full text-espresso text-xs font-bold flex items-center justify-center"
                    style={{ background: tenant.primaryColor }}
                  >
                    {count}
                  </span>
                )}
              </button>

              <Link
                href={`/${slug}/dashboard`}
                className="hidden md:block text-xs text-cream/40 hover:text-gold transition-colors px-3 py-1.5 border border-white/10 rounded-lg hover:border-gold/30"
              >
                Admin
              </Link>

              {/* Hamburger — mobile only */}
              <button
                className="md:hidden relative z-50 p-2 text-cream/70 hover:text-cream transition-colors"
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label={mobileOpen ? 'Fermer' : 'Menu'}
              >
                <span className={cn('absolute inset-2 flex items-center justify-center transition-all duration-200', mobileOpen ? 'opacity-100' : 'opacity-0')}>
                  <X size={22} />
                </span>
                <span className={cn('flex items-center justify-center transition-all duration-200', mobileOpen ? 'opacity-0' : 'opacity-100')}>
                  <Menu size={22} />
                </span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile fullscreen overlay */}
      <div
        className={cn(
          'md:hidden fixed inset-0 z-40 flex flex-col transition-all duration-300',
          mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
        style={{ background: 'rgba(26,15,10,0.98)', backdropFilter: 'blur(20px)' }}
      >
        {/* Top bar inside overlay */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-espresso font-display font-bold text-sm"
              style={{ background: tenant.primaryColor }}
            >
              {tenant.name.charAt(0)}
            </div>
            <span className="font-display text-xl text-cream">{tenant.name}</span>
          </div>
        </div>

        {/* Divider */}
        <div className="mx-6 h-px bg-gold/10" />

        {/* Nav links — large touch targets */}
        <nav className="flex-1 flex flex-col justify-center px-6 gap-1">
          {links.map((l, i) => {
            const active = pathname === l.href
            return (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'flex items-center justify-between py-4 px-2 transition-all duration-200 active:scale-98',
                  i < links.length - 1 && 'border-b border-white/5',
                  active ? 'text-gold' : 'text-cream/70'
                )}
                style={{
                  transform: mobileOpen ? 'translateX(0)' : 'translateX(-20px)',
                  transitionDelay: mobileOpen ? `${i * 40}ms` : '0ms',
                  opacity: mobileOpen ? 1 : 0,
                }}
              >
                <span className="font-display text-2xl">{l.label}</span>
                <ArrowRight size={18} className={active ? 'text-gold' : 'text-gold/20'} />
              </Link>
            )
          })}
        </nav>

        {/* Bottom CTA */}
        <div
          className="px-6 pb-32 pt-6 space-y-3"
          style={{
            transform: mobileOpen ? 'translateY(0)' : 'translateY(20px)',
            transition: 'transform 0.3s ease 0.25s, opacity 0.3s ease 0.25s',
            opacity: mobileOpen ? 1 : 0,
          }}
        >
          <Link
            href={`/${slug}/reserver`}
            onClick={() => setMobileOpen(false)}
            className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl font-semibold text-espresso transition-opacity hover:opacity-90 active:scale-98"
            style={{ background: `linear-gradient(135deg, ${tenant.primaryColor}, #E8C97A)` }}
          >
            <Calendar size={18} />
            Réserver une table
          </Link>
          <Link
            href={`/${slug}/dashboard`}
            onClick={() => setMobileOpen(false)}
            className="flex items-center justify-center w-full py-3.5 rounded-2xl text-sm text-cream/40 border border-white/10 hover:border-white/20 transition-colors"
          >
            Espace admin
          </Link>
        </div>
      </div>
    </>
  )
}
