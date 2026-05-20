'use client'

import { use, useEffect, useState } from 'react'
import { MenuCard } from '@/components/public/menu-card'
import { SkeletonCard } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import type { CategoryWithProducts, ProductWithCategory } from '@/types'

export default function MenuPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const [categories, setCategories] = useState<CategoryWithProducts[]>([])
  const [active, setActive] = useState<string>('all')
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')

  useEffect(() => {
    fetch(`/api/${slug}/categories`)
      .then((r) => r.json())
      .then((data) => { setCategories(data); setLoading(false) })
  }, [slug])

  const allProducts: ProductWithCategory[] = categories.flatMap((c) =>
    c.products.map((p) => ({ ...p, category: c }))
  )

  const filtered = allProducts.filter((p) => {
    const catOk  = active === 'all' || p.categoryId === active
    const vegOk  = filter === 'vegan'   ? p.isVegan      : true
    const gfOk   = filter === 'gluten'  ? p.isGlutenFree : true
    const popOk  = filter === 'popular' ? p.featured     : true
    return catOk && vegOk && gfOk && popOk
  })

  return (
    <div className="pt-24 pb-28 md:pb-20">
      {/* Header */}
      <div className="bg-charcoal border-b border-white/10 py-14 text-center">
        <p className="font-accent text-gold text-lg tracking-widest">— Découvrez —</p>
        <h1 className="font-display text-4xl sm:text-5xl text-cream mt-2">Notre Menu</h1>
        <div className="divider-gold w-24 mx-auto mt-4" />
      </div>

      {/* Sticky filter bar */}
      <div className="sticky top-14 z-20 bg-espresso/95 backdrop-blur-md border-b border-white/5 py-3">
        {/* Category tabs — horizontal scroll on mobile, wrap on desktop */}
        <div className="overflow-x-auto scrollbar-hide">
          <div className="flex gap-2 px-4 sm:px-6 lg:px-8 sm:flex-wrap sm:justify-center min-w-max sm:min-w-0">
            <button
              onClick={() => setActive('all')}
              className={cn(
                'whitespace-nowrap px-4 py-2 rounded-full text-sm transition-all shrink-0',
                active === 'all'
                  ? 'gradient-gold text-espresso font-semibold shadow-sm'
                  : 'border border-white/10 text-cream/60 hover:text-cream hover:border-white/20'
              )}
            >
              Tout ({allProducts.length})
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setActive(c.id)}
                className={cn(
                  'whitespace-nowrap flex items-center gap-1.5 px-4 py-2 rounded-full text-sm transition-all shrink-0',
                  active === c.id
                    ? 'gradient-gold text-espresso font-semibold shadow-sm'
                    : 'border border-white/10 text-cream/60 hover:text-cream hover:border-white/20'
                )}
              >
                {c.icon && <span>{c.icon}</span>}
                {c.nameFr}
                <span className={cn(
                  'text-[10px] px-1.5 py-0.5 rounded-full',
                  active === c.id ? 'bg-espresso/20' : 'bg-white/8 text-cream/40'
                )}>
                  {c.products.length}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Diet filters — always scrollable */}
        <div className="overflow-x-auto scrollbar-hide mt-2">
          <div className="flex gap-2 px-4 sm:px-6 lg:px-8 min-w-max sm:min-w-0 sm:justify-center sm:flex-wrap">
            {[
              { id: 'all',     label: 'Tous' },
              { id: 'popular', label: '⭐ Populaires' },
              { id: 'vegan',   label: '🌿 Végan' },
              { id: 'gluten',  label: '🌾 Sans gluten' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={cn(
                  'whitespace-nowrap px-3.5 py-1.5 rounded-lg text-xs transition-all shrink-0',
                  filter === f.id
                    ? 'bg-gold/20 text-gold border border-gold/30'
                    : 'text-cream/40 hover:text-cream/70 border border-transparent hover:border-white/10'
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results count */}
      {!loading && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-2">
          <p className="text-xs text-cream/30">
            {filtered.length} plat{filtered.length !== 1 ? 's' : ''}
            {active !== 'all' && ` dans ${categories.find(c => c.id === active)?.nameFr ?? ''}`}
          </p>
        </div>
      )}

      {/* Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {[...Array(8)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24 text-cream/30">
            <p className="font-display text-2xl">Aucun plat trouvé</p>
            <button onClick={() => { setActive('all'); setFilter('all') }} className="text-gold text-sm mt-4 hover:underline">
              Réinitialiser les filtres
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {filtered.map((p) => (
              <MenuCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
