'use client'

import { use, useEffect, useState, useCallback } from 'react'
import { toast } from 'sonner'
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight, Search, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input, Textarea, Select } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Modal } from '@/components/ui/modal'
import { Skeleton } from '@/components/ui/skeleton'
import { formatPrice } from '@/lib/utils'
import type { CategoryWithProducts, ProductWithCategory } from '@/types'

const EMPTY_PRODUCT = { nameFr: '', nameEn: '', descFr: '', descEn: '', price: 0, image: '', available: true, featured: false, isVegan: false, isGlutenFree: false, allergens: '', categoryId: '' }

export default function DashboardMenuPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const [categories, setCategories] = useState<CategoryWithProducts[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState<'products' | 'categories'>('products')
  const [modal, setModal] = useState<{ open: boolean; mode: 'create' | 'edit'; product?: ProductWithCategory }>({ open: false, mode: 'create' })
  const [form, setForm] = useState(EMPTY_PRODUCT)
  const [saving, setSaving] = useState(false)
  const set = (k: string, v: unknown) => setForm((f) => ({ ...f, [k]: v }))

  const load = useCallback(async () => {
    const data = await fetch(`/api/${slug}/categories`).then((r) => r.json())
    setCategories(data)
    setLoading(false)
  }, [slug])

  useEffect(() => { load() }, [load])

  const allProducts: ProductWithCategory[] = categories.flatMap((c) => c.products.map((p) => ({ ...p, category: c })))
  const filtered = allProducts.filter((p) => p.nameFr.toLowerCase().includes(search.toLowerCase()) || p.category.nameFr.toLowerCase().includes(search.toLowerCase()))

  const openCreate = () => { setForm(EMPTY_PRODUCT); setModal({ open: true, mode: 'create' }) }
  const openEdit   = (p: ProductWithCategory) => { setForm({ ...p, image: p.image ?? '', descFr: p.descFr ?? '', descEn: p.descEn ?? '', allergens: p.allergens ?? '' }); setModal({ open: true, mode: 'edit', product: p }) }

  const handleSave = async () => {
    if (!form.nameFr || !form.categoryId) return toast.error('Nom et catégorie requis')
    setSaving(true)
    try {
      const url  = modal.mode === 'edit' ? `/api/${slug}/menu/${modal.product?.id}` : `/api/${slug}/menu`
      const method = modal.mode === 'edit' ? 'PATCH' : 'POST'
      const res  = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, price: Number(form.price) }) })
      if (!res.ok) throw new Error()
      toast.success(modal.mode === 'edit' ? 'Plat mis à jour' : 'Plat créé')
      setModal({ open: false, mode: 'create' })
      load()
    } catch { toast.error('Erreur. Réessayez.') }
    finally { setSaving(false) }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer ce plat ?')) return
    await fetch(`/api/${slug}/menu/${id}`, { method: 'DELETE' })
    toast.success('Plat supprimé')
    load()
  }

  const toggleAvailable = async (p: ProductWithCategory) => {
    await fetch(`/api/${slug}/menu/${p.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ available: !p.available }) })
    load()
  }

  const catOptions = categories.map((c) => ({ value: c.id, label: c.nameFr }))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl text-cream">Gestion Menu</h1>
          <p className="text-cream/40 mt-1">{allProducts.length} plat{allProducts.length>1?'s':''} · {categories.length} catégorie{categories.length>1?'s':''}</p>
        </div>
        <Button onClick={openCreate}><Plus size={16}/> Nouveau plat</Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/10">
        {(['products','categories'] as const).map((t) => (
          <button key={t} onClick={() => setActiveTab(t)} className={`px-5 py-2.5 text-sm transition-colors border-b-2 -mb-px ${activeTab===t?'text-gold border-gold':'text-cream/40 border-transparent hover:text-cream'}`}>
            {t === 'products' ? `Plats (${allProducts.length})` : `Catégories (${categories.length})`}
          </button>
        ))}
      </div>

      {activeTab === 'products' ? (
        <>
          {/* Search */}
          <div className="relative max-w-sm">
            <Search size={16} className="absolute left-3 top-3 text-cream/30 pointer-events-none" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher un plat…"
              className="pl-9 pr-4 py-2.5 w-full bg-charcoal border border-white/10 rounded-lg text-sm text-cream placeholder:text-cream/30 outline-none focus:border-gold/60" />
          </div>

          {/* Products table */}
          <div className="bg-charcoal border border-white/10 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left px-5 py-3 text-cream/40 font-medium">Plat</th>
                  <th className="text-left px-5 py-3 text-cream/40 font-medium">Catégorie</th>
                  <th className="text-left px-5 py-3 text-cream/40 font-medium">Prix</th>
                  <th className="text-left px-5 py-3 text-cream/40 font-medium">Statut</th>
                  <th className="text-right px-5 py-3 text-cream/40 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? [...Array(6)].map((_,i)=>(
                  <tr key={i} className="border-b border-white/5"><td colSpan={5} className="px-5 py-3"><Skeleton className="h-5"/></td></tr>
                )) : filtered.length === 0 ? (
                  <tr><td colSpan={5} className="px-5 py-16 text-center text-cream/30">Aucun plat trouvé</td></tr>
                ) : filtered.map((p) => (
                  <tr key={p.id} className="border-b border-white/5 hover:bg-white/2">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        {p.image ? <img src={p.image} alt={p.nameFr} className="w-10 h-10 rounded-lg object-cover" /> : <div className="w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center text-gold text-xs font-display">{p.nameFr[0]}</div>}
                        <div>
                          <p className="text-cream font-medium">{p.nameFr}</p>
                          {p.featured && <span className="text-xs text-gold flex items-center gap-1"><Star size={10} fill="currentColor"/>Populaire</span>}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-cream/60">{p.category.nameFr}</td>
                    <td className="px-5 py-3 text-gold font-display">{formatPrice(p.price)}</td>
                    <td className="px-5 py-3">
                      <Badge variant={p.available ? 'green' : 'gray'}>{p.available ? 'Disponible' : 'Indisponible'}</Badge>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => toggleAvailable(p)} className="p-1.5 text-cream/40 hover:text-gold transition-colors" title="Changer disponibilité">
                          {p.available ? <ToggleRight size={18} className="text-green-400"/> : <ToggleLeft size={18}/>}
                        </button>
                        <button onClick={() => openEdit(p)} className="p-1.5 text-cream/40 hover:text-gold transition-colors"><Pencil size={16}/></button>
                        <button onClick={() => handleDelete(p.id)} className="p-1.5 text-cream/40 hover:text-red-400 transition-colors"><Trash2 size={16}/></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? [...Array(4)].map((_,i)=><Skeleton key={i} className="h-24"/>) : categories.map((c) => (
            <div key={c.id} className="bg-charcoal border border-white/10 rounded-xl p-5 flex items-center justify-between">
              <div>
                <p className="text-cream font-medium">{c.icon} {c.nameFr}</p>
                <p className="text-cream/40 text-sm">{c.products.length} plat{c.products.length>1?'s':''}</p>
              </div>
              <Badge variant="gold">#{c.order}</Badge>
            </div>
          ))}
        </div>
      )}

      {/* Product modal */}
      <Modal isOpen={modal.open} onClose={() => setModal({open:false,mode:'create'})} title={modal.mode==='create'?'Nouveau plat':'Modifier le plat'} size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Nom FR *" value={form.nameFr} onChange={(e) => set('nameFr', e.target.value)} placeholder="Couscous Royal"/>
            <Input label="Nom EN *" value={form.nameEn} onChange={(e) => set('nameEn', e.target.value)} placeholder="Royal Couscous"/>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Textarea label="Description FR" value={form.descFr} onChange={(e) => set('descFr', e.target.value)} placeholder="Description en français…"/>
            <Textarea label="Description EN" value={form.descEn} onChange={(e) => set('descEn', e.target.value)} placeholder="English description…"/>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Prix (MAD) *" value={form.price} onChange={(e) => set('price', e.target.value)} type="number" min="0" step="0.5" placeholder="85"/>
            <Select label="Catégorie *" value={form.categoryId} onChange={(e) => set('categoryId', e.target.value)} options={[{value:'',label:'Choisir…'},...catOptions]}/>
          </div>
          <Input label="Image URL" value={form.image} onChange={(e) => set('image', e.target.value)} placeholder="https://…"/>
          <Input label="Allergènes" value={form.allergens} onChange={(e) => set('allergens', e.target.value)} placeholder="Gluten, Lactose…"/>
          <div className="flex flex-wrap gap-4">
            {([['available','Disponible'],['featured','Mis en avant'],['isVegan','Végan'],['isGlutenFree','Sans gluten']] as [string,string][]).map(([k,l]) => (
              <label key={k} className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={!!form[k as keyof typeof form]} onChange={(e) => set(k, e.target.checked)}
                  className="w-4 h-4 accent-yellow-500 rounded" />
                <span className="text-sm text-cream/70">{l}</span>
              </label>
            ))}
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={() => setModal({open:false,mode:'create'})} className="flex-1">Annuler</Button>
            <Button onClick={handleSave} isLoading={saving} className="flex-1">{modal.mode==='create'?'Créer':'Enregistrer'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
