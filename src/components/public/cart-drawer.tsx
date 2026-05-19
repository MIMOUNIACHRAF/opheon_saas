'use client'

import Link from 'next/link'
import { X, Minus, Plus, ShoppingCart, Trash2 } from 'lucide-react'
import { useCartStore } from '@/stores/cart.store'
import { formatPrice } from '@/lib/utils'

interface CartDrawerProps {
  slug: string
}

export function CartDrawer({ slug }: CartDrawerProps) {
  const { items, isOpen, closeCart, updateQuantity, removeItem, total } = useCartStore()
  const totalAmount = total()

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          onClick={closeCart}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed right-0 top-0 h-full w-full max-w-md z-50 bg-charcoal border-l border-white/10
          transform transition-transform duration-300 ease-in-out flex flex-col
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <ShoppingCart size={20} className="text-gold" />
            <h2 className="font-display text-xl text-cream">Mon Panier</h2>
          </div>
          <button
            onClick={closeCart}
            className="text-cream/40 hover:text-cream transition-colors p-1"
          >
            <X size={22} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {items.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <ShoppingCart size={48} className="text-cream/10 mx-auto" />
              <p className="text-cream/40">Votre panier est vide</p>
              <button onClick={closeCart} className="text-gold text-sm hover:underline">
                Voir le menu →
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.productId}
                className="flex items-center gap-4 bg-espresso/50 rounded-xl p-3 border border-white/5"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-cream truncate">{item.nameFr}</p>
                  <p className="text-gold text-sm font-display">{formatPrice(item.price)}</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                    className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center text-cream/60 hover:text-cream transition-colors"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="w-6 text-center text-sm text-cream font-medium">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                    className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center text-cream/60 hover:text-cream transition-colors"
                  >
                    <Plus size={14} />
                  </button>
                </div>

                <div className="flex flex-col items-end gap-1">
                  <p className="text-sm text-cream/80 font-medium">
                    {formatPrice(item.price * item.quantity)}
                  </p>
                  <button
                    onClick={() => removeItem(item.productId)}
                    className="text-red-400/60 hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-6 border-t border-white/10 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-cream/60">Total</span>
              <span className="font-display text-2xl text-gold">{formatPrice(totalAmount)}</span>
            </div>
            <Link
              href={`/${slug}/commander`}
              onClick={closeCart}
              className="block w-full gradient-gold text-espresso font-semibold py-3 rounded-xl text-center hover:opacity-90 transition-opacity"
            >
              Passer la commande
            </Link>
          </div>
        )}
      </div>
    </>
  )
}
