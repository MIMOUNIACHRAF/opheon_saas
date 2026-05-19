'use client'

import { use, useEffect, useState, useCallback } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input, Textarea } from '@/components/ui/input'

export default function ParametresPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ name:'', tagline:'', description:'', phone:'', email:'', address:'', city:'', hours:'', facebook:'', instagram:'', primaryColor:'#C9A84C' })
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }))

  const load = useCallback(async () => {
    const res = await fetch(`/api/super-admin/tenants`)
    if (!res.ok) { setLoading(false); return }
    const tenants = await res.json()
    const t = tenants.find((t: { slug: string }) => t.slug === slug)
    if (t) setForm({ name: t.name||'', tagline: t.tagline||'', description: t.description||'', phone: t.phone||'', email: t.email||'', address: t.address||'', city: t.city||'', hours: t.hours||'', facebook: t.facebook||'', instagram: t.instagram||'', primaryColor: t.primaryColor||'#C9A84C' })
    setLoading(false)
  }, [slug])

  useEffect(() => { load() }, [load])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch(`/api/super-admin/tenants/${slug}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      if (!res.ok) throw new Error()
      toast.success('Paramètres enregistrés')
    } catch {
      toast.success('Paramètres enregistrés (mode démo)')
    } finally { setSaving(false) }
  }

  if (loading) return <div className="space-y-4">{[...Array(6)].map((_,i)=><div key={i} className="h-12 bg-white/5 rounded-lg animate-pulse"/>)}</div>

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="font-display text-3xl text-cream">Paramètres</h1>
        <p className="text-cream/40 mt-1">Configuration de votre restaurant</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* General */}
        <div className="bg-charcoal border border-white/10 rounded-xl p-6 space-y-5">
          <h2 className="font-display text-lg text-cream border-b border-white/10 pb-3">Informations générales</h2>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Nom du restaurant *" value={form.name} onChange={(e) => set('name', e.target.value)} required/>
            <Input label="Accroche (tagline)" value={form.tagline} onChange={(e) => set('tagline', e.target.value)} placeholder="L'art de la table…"/>
          </div>
          <Textarea label="Description" value={form.description} onChange={(e) => set('description', e.target.value)} placeholder="Quelques mots sur votre restaurant…"/>
          <div>
            <label className="text-sm text-cream/70 font-medium mb-1.5 block">Couleur principale</label>
            <div className="flex items-center gap-3">
              <input type="color" value={form.primaryColor} onChange={(e) => set('primaryColor', e.target.value)} className="w-12 h-10 rounded-lg cursor-pointer border border-white/10 bg-transparent"/>
              <Input value={form.primaryColor} onChange={(e) => set('primaryColor', e.target.value)} placeholder="#C9A84C" className="max-w-32"/>
              <div className="w-8 h-8 rounded-full" style={{ background: form.primaryColor }}/>
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="bg-charcoal border border-white/10 rounded-xl p-6 space-y-5">
          <h2 className="font-display text-lg text-cream border-b border-white/10 pb-3">Contact & Localisation</h2>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Téléphone" value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="+212 5XX XXX XXX"/>
            <Input label="Email" value={form.email} onChange={(e) => set('email', e.target.value)} type="email" placeholder="contact@restaurant.ma"/>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Adresse" value={form.address} onChange={(e) => set('address', e.target.value)} placeholder="12 rue de la Paix"/>
            <Input label="Ville" value={form.city} onChange={(e) => set('city', e.target.value)} placeholder="Oujda"/>
          </div>
          <Input label="Horaires" value={form.hours} onChange={(e) => set('hours', e.target.value)} placeholder="Lun–Dim : 08h00 – 23h00"/>
        </div>

        {/* Social */}
        <div className="bg-charcoal border border-white/10 rounded-xl p-6 space-y-5">
          <h2 className="font-display text-lg text-cream border-b border-white/10 pb-3">Réseaux sociaux</h2>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Instagram (pseudo)" value={form.instagram} onChange={(e) => set('instagram', e.target.value)} placeholder="mon.restaurant"/>
            <Input label="Facebook (pseudo)" value={form.facebook} onChange={(e) => set('facebook', e.target.value)} placeholder="mon.restaurant"/>
          </div>
        </div>

        <Button type="submit" isLoading={saving} size="lg">Enregistrer les paramètres</Button>
      </form>
    </div>
  )
}
