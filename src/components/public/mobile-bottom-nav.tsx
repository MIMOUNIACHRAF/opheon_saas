'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, UtensilsCrossed, Calendar, ShoppingBag, ShoppingCart } from 'lucide-react'
import { useCartStore } from '@/stores/cart.store'
import { cn } from '@/lib/utils'

interface Props {
  slug: string
  primaryColor: string
}

export function MobileBottomNav({ slug, primaryColor }: Props) {
  const pathname = usePathname()
  const { itemCount, toggleCart } = useCartStore()
  const count = itemCount()

  const links = [
    { href: `/${slug}`,           icon: Home,            label: 'Accueil' },
    { href: `/${slug}/menu`,      icon: UtensilsCrossed, label: 'Menu' },
    { href: `/${slug}/reserver`,  icon: Calendar,        label: 'Réserver' },
    { href: `/${slug}/commander`, icon: ShoppingBag,     label: 'Commander' },
  ]

  return (
    <div
      className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-charcoal/96 backdrop-blur-xl border-t border-white/8"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="flex items-stretch h-16">
        {links.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || (href !== `/${slug}` && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex-1 flex flex-col items-center justify-center gap-0.5 transition-all duration-200 active:scale-90',
                active ? 'text-gold' : 'text-cream/35'
              )}
            >
              <div className={cn(
                'w-10 h-6 rounded-full flex items-center justify-center transition-all duration-200',
                active ? 'bg-gold/15' : ''
              )}>
                <Icon size={19} strokeWidth={active ? 2.2 : 1.5} />
              </div>
              <span className={cn(
                'text-[10px] font-medium leading-none transition-colors',
                active ? 'text-gold' : 'text-cream/30'
              )}>
                {label}
              </span>
            </Link>
          )
        })}

        {/* Cart */}
        <button
          onClick={toggleCart}
          className="flex-1 flex flex-col items-center justify-center gap-0.5 text-cream/35 transition-all duration-200 active:scale-90"
        >
          <div className="w-10 h-6 rounded-full flex items-center justify-center relative">
            <ShoppingCart size={19} strokeWidth={1.5} />
            {count > 0 && (
              <span
                className="absolute -top-1.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full flex items-center justify-center text-[9px] font-bold text-espresso leading-none"
                style={{ background: primaryColor }}
              >
                {count > 9 ? '9+' : count}
              </span>
            )}
          </div>
          <span className="text-[10px] font-medium leading-none text-cream/30">Panier</span>
        </button>
      </div>
    </div>
  )
}
