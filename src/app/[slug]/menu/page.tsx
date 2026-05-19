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
    const catOk = active === 'all' || p.categoryId === active
    const vegOk = filter === 'vegan' ? p.isVegan : true
    const gfOk  = filter === 'gluten' ? p.isGlutenFree : true
    const popOk = filter === 'popular' ? p.featured : true
    return catOk && vegOk && gfOk && popOk
  })

  return (
    <div className="pt-24 pb-20">
      {/* Header */}
      <div className="bg-charcoal border-b border-white/10 py-16 text-center">
        <p className="font-accent text-gold text-lg tracking-widest">— Découvrez —</p>
        <h1 className="font-display text-5xl text-cream mt-2">Notre Menu</h1>
        <div className="divider-gold w-24 mx-auto mt-4" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        {/* Category tabs */}
        <div className="flex flex-wrap gap-2 mb-4 justify-center">
          <button
            onClick={() => setActive('all')}
            className={cn(
              'px-5 py-2 rounded-full text-sm transition-all',
              active === 'all' ? 'gradient-gold text-espresso font-semibold' : 'border border-white/10 text-cream/60 hover:text-cream'
            )}
          >
            Tout
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setActive(c.id)}
              className={cn(
                'px-5 py-2 rounded-full text-sm transition-all',
                active === c.id ? 'gradient-gold text-espresso font-semibold' : 'border border-white/10 text-cream/60 hover:text-cream'
              )}
            >
              {c.icon && <span className="mr-1">{c.icon}</span>}{c.nameFr}
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 justify-center mb-10">
          {[
            { id: 'all', label: 'Tous' },
            { id: 'popular', label: '⭐ Populaires' },
            { id: 'vegan', label: '🌿 Végan' },
            { id: 'gluten', label: '🌾 Sans gluten' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={cn(
                'px-4 py-1.5 rounded-lg text-xs transition-all',
                filter === f.id ? 'bg-gold/20 text-gold border border-gold/30' : 'text-cream/40 hover:text-cream/70 border border-transparent'
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-cream/30">
            <p className="font-display text-2xl">Aucun plat trouvé</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map((p) => (
              <MenuCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
