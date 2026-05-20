'use client'

import { use, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { useCartStore } from '@/stores/cart.store'
import { formatPrice, ORDER_TYPE_LABELS } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input, Textarea } from '@/components/ui/input'
import { MenuCard } from '@/components/public/menu-card'
import { SkeletonCard } from '@/components/ui/skeleton'
import type { CategoryWithProducts, ProductWithCategory } from '@/types'
import { ShoppingCart, ArrowRight, CheckCircle, Utensils, Package, Bike } from 'lucide-react'
import { cn } from '@/lib/utils'

type Step = 'menu' | 'checkout' | 'done'
type OrderType = 'DINE_IN' | 'TAKEAWAY' | 'DELIVERY'

export default function CommanderPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const [step, setStep] = useState<Step>('menu')
  const [categories, setCategories] = useState<CategoryWithProducts[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [activeCategory, setActiveCategory] = useState('all')
  const { items, total, clearCart, removeItem, updateQuantity } = useCartStore()
  const totalAmount = total()
  const [form, setForm] = useState({ clientName: '', clientPhone: '', clientEmail: '', address: '', note: '', type: 'DINE_IN' as OrderType })
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }))

  useEffect(() => {
    fetch(`/api/${slug}/categories`)
      .then((r) => r.json())
      .then((data) => { setCategories(data); setLoading(false) })
  }, [slug])

  const allProducts: ProductWithCategory[] = categories.flatMap((c) =>
    c.products.map((p) => ({ ...p, category: c }))
  )
  const filtered = activeCategory === 'all' ? allProducts : allProducts.filter((p) => p.categoryId === activeCategory)

  const handleOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!items.length) return toast.error('Votre panier est vide')
    setSubmitting(true)
    try {
      const res = await fetch(`/api/${slug}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          items: items.map((i) => ({ productId: i.productId, quantity: i.quantity, unitPrice: i.price })),
        }),
      })
      if (!res.ok) throw new Error()
      clearCart()
      setStep('done')
    } catch {
      toast.error('Erreur. Réessayez.')
    } finally {
      setSubmitting(false)
    }
  }

  if (step === 'done') return (
    <div className="pt-24 pb-20 flex items-center justify-center min-h-screen">
      <div className="text-center space-y-6 max-w-md mx-auto px-4">
        <CheckCircle size={64} className="text-green-400 mx-auto" />
        <h2 className="font-display text-4xl text-cream">Commande reçue !</h2>
        <p className="text-cream/60">Votre commande est en cours de traitement. Nous vous préparons ça avec soin.</p>
        <Button onClick={() => setStep('menu')} size="lg">Nouvelle commande</Button>
      </div>
    </div>
  )

  const orderTypes: { type: OrderType; icon: React.ReactNode; label: string }[] = [
    { type: 'DINE_IN',  icon: <Utensils size={20} />,  label: 'Sur place' },
    { type: 'TAKEAWAY', icon: <Package size={20} />,   label: 'À emporter' },
    { type: 'DELIVERY', icon: <Bike size={20} />,      label: 'Livraison' },
  ]

  return (
    <div className="pt-24 pb-20">
      <div className="bg-charcoal border-b border-white/10 py-16 text-center">
        <p className="font-accent text-gold text-lg tracking-widest">— Commander —</p>
        <h1 className="font-display text-5xl text-cream mt-2">Commande en ligne</h1>
        <div className="divider-gold w-24 mx-auto mt-4" />
        {/* Steps */}
        <div className="flex items-center justify-center gap-4 mt-8">
          {(['menu','checkout'] as Step[]).map((s, i) => (
            <div key={s} className="flex items-center gap-4">
              {i > 0 && <div className="w-12 h-px bg-white/10" />}
              <div className={cn('flex items-center gap-2 text-sm', step === s ? 'text-gold' : 'text-cream/30')}>
                <span className={cn('w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold', step === s ? 'bg-gold text-espresso' : 'bg-white/10')}>{i+1}</span>
                {s === 'menu' ? 'Menu' : 'Validation'}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        {step === 'menu' ? (
          <div className="flex gap-8">
            {/* Left: Products */}
            <div className="flex-1 min-w-0">
              {/* Category tabs */}
              <div className="flex flex-wrap gap-2 mb-8">
                <button onClick={() => setActiveCategory('all')} className={cn('px-4 py-2 rounded-full text-sm transition-all', activeCategory === 'all' ? 'gradient-gold text-espresso font-semibold' : 'border border-white/10 text-cream/60 hover:text-cream')}>
                  Tout
                </button>
                {categories.map((c) => (
                  <button key={c.id} onClick={() => setActiveCategory(c.id)} className={cn('px-4 py-2 rounded-full text-sm transition-all', activeCategory === c.id ? 'gradient-gold text-espresso font-semibold' : 'border border-white/10 text-cream/60 hover:text-cream')}>
                    {c.icon} {c.nameFr}
                  </button>
                ))}
              </div>
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filtered.map((p) => <MenuCard key={p.id} product={p} />)}
                </div>
              )}
            </div>

            {/* Right: Cart summary */}
            <div className="w-80 shrink-0 hidden lg:block">
              <div className="sticky top-24 bg-charcoal border border-white/10 rounded-2xl p-6 space-y-4">
                <div className="flex items-center gap-2">
                  <ShoppingCart size={18} className="text-gold" />
                  <h3 className="font-display text-lg text-cream">Panier</h3>
                  {items.length > 0 && <span className="ml-auto text-xs text-cream/40">{items.length} article{items.length>1?'s':''}</span>}
                </div>
                {items.length === 0 ? (
                  <p className="text-center text-cream/30 text-sm py-8">Votre panier est vide</p>
                ) : (
                  <>
                    <div className="space-y-3 max-h-72 overflow-y-auto">
                      {items.map((item) => (
                        <div key={item.productId} className="flex items-center gap-3 text-sm">
                          <div className="flex-1 min-w-0">
                            <p className="text-cream truncate">{item.nameFr}</p>
                            <p className="text-gold text-xs">{formatPrice(item.price)}</p>
                          </div>
                          <div className="flex items-center gap-1">
                            <button onClick={() => updateQuantity(item.productId, item.quantity-1)} className="w-6 h-6 rounded bg-white/5 text-cream/60 hover:text-cream text-xs">-</button>
                            <span className="w-5 text-center text-cream text-xs">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.productId, item.quantity+1)} className="w-6 h-6 rounded bg-white/5 text-cream/60 hover:text-cream text-xs">+</button>
                          </div>
                          <button onClick={() => removeItem(item.productId)} className="text-red-400/50 hover:text-red-400 text-xs">✕</button>
                        </div>
                      ))}
                    </div>
                    <div className="divider-gold" />
                    <div className="flex justify-between items-center">
                      <span className="text-cream/60 text-sm">Total</span>
                      <span className="font-display text-xl text-gold">{formatPrice(totalAmount)}</span>
                    </div>
                    <Button onClick={() => setStep('checkout')} className="w-full" size="md">
                      Valider la commande <ArrowRight size={16} />
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Checkout */
          <div className="max-w-2xl mx-auto">
            <div className="bg-charcoal border border-white/10 rounded-2xl p-8 space-y-6">
              {/* Order recap */}
              <div>
                <h3 className="font-display text-xl text-cream mb-4">Récapitulatif</h3>
                <div className="space-y-2 bg-espresso/50 rounded-xl p-4">
                  {items.map((i) => (
                    <div key={i.productId} className="flex justify-between text-sm">
                      <span className="text-cream/70">{i.nameFr} × {i.quantity}</span>
                      <span className="text-gold">{formatPrice(i.price * i.quantity)}</span>
                    </div>
                  ))}
                  <div className="divider-gold mt-2 mb-2" />
                  <div className="flex justify-between font-display">
                    <span className="text-cream">Total</span>
                    <span className="text-gold text-xl">{formatPrice(totalAmount)}</span>
                  </div>
                </div>
              </div>

              {/* Type */}
              <div>
                <p className="text-sm text-cream/70 mb-3 font-medium">Type de commande</p>
                <div className="grid grid-cols-3 gap-3">
                  {orderTypes.map(({ type, icon, label }) => (
                    <button key={type} onClick={() => set('type', type)}
                      className={cn('flex flex-col items-center gap-2 p-4 rounded-xl border text-sm transition-all', form.type === type ? 'border-gold bg-gold/10 text-gold' : 'border-white/10 text-cream/50 hover:border-white/20 hover:text-cream')}>
                      {icon}{label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleOrder} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Nom *" value={form.clientName} onChange={(e) => set('clientName', e.target.value)} required placeholder="Votre nom" />
                  <Input label="Téléphone" value={form.clientPhone} onChange={(e) => set('clientPhone', e.target.value)} placeholder="+212 6XX XXX" type="tel" />
                </div>
                <Input label="Email" value={form.clientEmail} onChange={(e) => set('clientEmail', e.target.value)} placeholder="email@exemple.com" type="email" />
                {form.type === 'DELIVERY' && (
                  <Input label="Adresse de livraison *" value={form.address} onChange={(e) => set('address', e.target.value)} required placeholder="12 rue de la Paix, Oujda" />
                )}
                <Textarea label="Note" value={form.note} onChange={(e) => set('note', e.target.value)} placeholder="Instructions spéciales..." />
                <div className="flex gap-3">
                  <Button type="button" variant="outline" onClick={() => setStep('menu')} className="flex-1">← Retour</Button>
                  <Button type="submit" isLoading={submitting} className="flex-1">
                    <CheckCircle size={16} /> Commander
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* Mobile cart bar — above the bottom nav on mobile (bottom-16), at bottom on tablet */}
      {step === 'menu' && items.length > 0 && (
        <div className="lg:hidden fixed bottom-16 md:bottom-0 left-0 right-0 z-[35] px-4 py-3 glass border-t border-gold/20">
          <Button onClick={() => setStep('checkout')} size="lg" className="w-full">
            <ShoppingCart size={18} />
            Voir panier ({items.reduce((s, i) => s + i.quantity, 0)}) — {formatPrice(totalAmount)}
          </Button>
        </div>
      )}
    </div>
  )
}
