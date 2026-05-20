'use client'

import Link from 'next/link'
import { X, Minus, Plus, ShoppingCart, Trash2 } from 'lucide-react'
import { useCartStore } from '@/stores/cart.store'
import { formatPrice } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface CartDrawerProps {
  slug: string
}

export function CartDrawer({ slug }: CartDrawerProps) {
  const { items, isOpen, closeCart, updateQuantity, removeItem, total } = useCartStore()
  const totalAmount = total()

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          onClick={closeCart}
        />
      )}

      {/* Drawer
          Mobile  : slides up from bottom (translate-y)
          Desktop : slides in from right (translate-x via md: overrides)
      */}
      <div
        className={cn(
          'fixed z-50 bg-charcoal flex flex-col overflow-hidden',
          'transition-transform duration-300 ease-in-out',
          // Mobile — bottom sheet
          'bottom-0 left-0 right-0 rounded-t-2xl border-t border-white/10 max-h-[90vh]',
          // Desktop — right sidebar (overrides mobile)
          'md:bottom-auto md:top-0 md:right-0 md:left-auto md:h-full md:w-96',
          'md:max-h-none md:rounded-none md:border-t-0 md:border-l',
          // Open / closed transforms
          isOpen
            ? 'translate-y-0 md:translate-x-0'
            : 'translate-y-full md:translate-y-0 md:translate-x-full'
        )}
      >
        {/* Drag handle — visible on mobile only */}
        <div className="md:hidden flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-10 h-1 rounded-full bg-white/20" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <ShoppingCart size={20} className="text-gold" />
            <h2 className="font-display text-xl text-cream">Mon Panier</h2>
            {items.length > 0 && (
              <span className="text-xs text-cream/40 bg-white/5 px-2 py-0.5 rounded-full">
                {items.reduce((s, i) => s + i.quantity, 0)} art.
              </span>
            )}
          </div>
          <button
            onClick={closeCart}
            className="p-1.5 text-cream/40 hover:text-cream hover:bg-white/5 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {items.length === 0 ? (
            <div className="text-center py-16 space-y-4">
              <div className="w-16 h-16 rounded-full bg-white/4 flex items-center justify-center mx-auto">
                <ShoppingCart size={28} className="text-cream/15" />
              </div>
              <p className="text-cream/40 text-sm">Votre panier est vide</p>
              <button
                onClick={closeCart}
                className="text-gold text-sm hover:underline"
              >
                Parcourir le menu →
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.productId}
                className="flex items-center gap-3 bg-espresso/50 rounded-xl p-3.5 border border-white/5"
              >
                {/* Image placeholder or thumbnail */}
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.nameFr}
                    className="w-12 h-12 rounded-lg object-cover shrink-0"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-gold/10 flex items-center justify-center text-gold font-display text-lg shrink-0">
                    {item.nameFr.charAt(0)}
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-cream truncate">{item.nameFr}</p>
                  <p className="text-gold text-sm font-display">{formatPrice(item.price)}</p>
                </div>

                {/* Quantity controls */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                    className="w-7 h-7 rounded-lg bg-white/8 flex items-center justify-center text-cream/60 hover:text-cream hover:bg-white/15 transition-colors active:scale-90"
                  >
                    <Minus size={13} />
                  </button>
                  <span className="w-6 text-center text-sm text-cream font-semibold">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                    className="w-7 h-7 rounded-lg bg-white/8 flex items-center justify-center text-cream/60 hover:text-cream hover:bg-white/15 transition-colors active:scale-90"
                  >
                    <Plus size={13} />
                  </button>
                </div>

                {/* Subtotal + remove */}
                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  <p className="text-sm text-cream/80 font-medium">
                    {formatPrice(item.price * item.quantity)}
                  </p>
                  <button
                    onClick={() => removeItem(item.productId)}
                    className="text-red-400/40 hover:text-red-400 transition-colors active:scale-90"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div
            className="px-5 pt-4 pb-5 border-t border-white/10 shrink-0 space-y-4"
            style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 20px)' }}
          >
            <div className="flex justify-between items-center">
              <span className="text-cream/60 text-sm">Total</span>
              <span className="font-display text-2xl text-gold">{formatPrice(totalAmount)}</span>
            </div>
            <Link
              href={`/${slug}/commander`}
              onClick={closeCart}
              className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl font-semibold text-espresso gradient-gold hover:opacity-90 transition-opacity active:scale-98 text-base"
            >
              Passer la commande
            </Link>
            <button
              onClick={closeCart}
              className="w-full py-2.5 rounded-xl text-sm text-cream/40 hover:text-cream transition-colors"
            >
              Continuer mes achats
            </button>
          </div>
        )}
      </div>
    </>
  )
}
