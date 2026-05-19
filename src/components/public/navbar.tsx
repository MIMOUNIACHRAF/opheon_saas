'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ShoppingCart, Menu, X } from 'lucide-react'
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

  const links = [
    { href: `/${slug}`,           label: 'Accueil' },
    { href: `/${slug}/menu`,      label: 'Menu' },
    { href: `/${slug}/galerie`,   label: 'Galerie' },
    { href: `/${slug}/reserver`,  label: 'Réserver' },
    { href: `/${slug}/commander`, label: 'Commander' },
    { href: `/${slug}/contact`,   label: 'Contact' },
  ]

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-40 transition-all duration-300',
        scrolled
          ? 'glass border-b border-gold/20 py-3'
          : 'bg-transparent py-5'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href={`/${slug}`} className="flex items-center gap-3 group">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-espresso font-display font-bold text-sm"
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
          <div className="flex items-center gap-3">
            <button
              onClick={toggleCart}
              className="relative p-2 text-cream/70 hover:text-gold transition-colors"
              aria-label="Panier"
            >
              <ShoppingCart size={20} />
              {count > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 gradient-gold rounded-full text-espresso text-xs font-bold flex items-center justify-center">
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

            <button
              className="md:hidden text-cream/70 hover:text-cream transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Menu"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <nav className="md:hidden mt-4 pb-4 border-t border-white/10 pt-4 flex flex-col gap-1">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'px-4 py-3 rounded-lg text-sm transition-colors',
                  pathname === l.href
                    ? 'text-gold bg-gold/10'
                    : 'text-cream/70 hover:text-cream hover:bg-white/5'
                )}
              >
                {l.label}
              </Link>
            ))}
          </nav>
        )}
      </div>
    </header>
  )
}
