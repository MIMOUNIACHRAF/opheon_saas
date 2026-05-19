'use client'

import Image from 'next/image'
import { Plus, Check, Leaf, Wheat } from 'lucide-react'
import { useState } from 'react'
import { useCartStore } from '@/stores/cart.store'
import { cn, formatPrice } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import type { ProductWithCategory } from '@/types'

interface MenuCardProps {
  product: ProductWithCategory
  lang?: 'fr' | 'en'
}

export function MenuCard({ product, lang = 'fr' }: MenuCardProps) {
  const [added, setAdded] = useState(false)
  const addItem = useCartStore((s) => s.addItem)

  const name = lang === 'fr' ? product.nameFr : product.nameEn
  const desc = lang === 'fr' ? product.descFr : product.descEn

  const handleAdd = () => {
    addItem({
      productId: product.id,
      nameFr: product.nameFr,
      nameEn: product.nameEn,
      price: product.price,
      quantity: 1,
      image: product.image,
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  return (
    <div
      className={cn(
        'group relative bg-charcoal border border-white/10 rounded-xl overflow-hidden',
        'card-hover flex flex-col',
        !product.available && 'opacity-60'
      )}
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden bg-espresso/50">
        {product.image ? (
          <Image
            src={product.image}
            alt={name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-display text-4xl text-gold/20">
              {name.charAt(0)}
            </span>
          </div>
        )}
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          {product.featured && <Badge variant="gold">⭐ Populaire</Badge>}
          {product.isVegan && (
            <Badge variant="green">
              <Leaf size={10} className="mr-1" />Végan
            </Badge>
          )}
          {product.isGlutenFree && (
            <Badge variant="yellow">
              <Wheat size={10} className="mr-1" />Sans gluten
            </Badge>
          )}
          {!product.available && <Badge variant="gray">Indisponible</Badge>}
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4 gap-2">
        <div>
          <h3 className="font-display text-cream text-lg leading-tight">{name}</h3>
          {desc && (
            <p className="text-sm text-cream/50 mt-1 leading-relaxed line-clamp-2">{desc}</p>
          )}
        </div>

        {product.allergens && (
          <p className="text-xs text-cream/30 italic">Allergènes : {product.allergens}</p>
        )}

        <div className="flex items-center justify-between mt-auto pt-3 border-t border-white/5">
          <span className="font-display text-gold text-xl">{formatPrice(product.price)}</span>

          <button
            onClick={handleAdd}
            disabled={!product.available}
            className={cn(
              'flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
              added
                ? 'bg-green-600/20 text-green-400 border border-green-600/30'
                : 'gradient-gold text-espresso hover:opacity-90',
              !product.available && 'opacity-30 cursor-not-allowed'
            )}
          >
            {added ? <><Check size={15} /> Ajouté</> : <><Plus size={15} /> Ajouter</>}
          </button>
        </div>
      </div>
    </div>
  )
}
