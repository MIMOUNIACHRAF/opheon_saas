'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Lock, Mail } from 'lucide-react'
import { Suspense } from 'react'

function LoginForm() {
  const router = useRouter()
  const params = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ email: '', password: '' })
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const res = await signIn('credentials', { ...form, redirect: false })
    setLoading(false)
    if (res?.ok) {
      const callbackUrl = params.get('callbackUrl') || '/'
      router.push(callbackUrl)
      router.refresh()
    } else {
      toast.error('Email ou mot de passe incorrect')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="relative">
        <Mail size={16} className="absolute left-3 top-9 text-gold/60 pointer-events-none" />
        <Input label="Email" value={form.email} onChange={(e) => set('email', e.target.value)}
          type="email" required placeholder="admin@opheon.ma" className="pl-9" />
      </div>
      <div className="relative">
        <Lock size={16} className="absolute left-3 top-9 text-gold/60 pointer-events-none" />
        <Input label="Mot de passe" value={form.password} onChange={(e) => set('password', e.target.value)}
          type="password" required placeholder="••••••••" className="pl-9" />
      </div>
      <Button type="submit" isLoading={loading} size="lg" className="w-full">
        Se connecter
      </Button>
    </form>
  )
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-espresso flex items-center justify-center p-4">
      {/* BG art deco */}
      <div className="fixed inset-0 opacity-5 pointer-events-none">
        <div className="absolute top-1/3 left-0 right-0 h-px bg-gold" />
        <div className="absolute left-1/3 top-0 bottom-0 w-px bg-gold" />
      </div>

      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 gradient-gold rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-yellow-900/30">
            <span className="font-display text-espresso text-2xl font-bold">O</span>
          </div>
          <h1 className="font-display text-3xl text-cream">Espace Admin</h1>
          <p className="text-cream/40 mt-2 text-sm">Connectez-vous pour accéder au dashboard</p>
        </div>

        <div className="bg-charcoal border border-white/10 rounded-2xl p-8">
          <Suspense fallback={null}>
            <LoginForm />
          </Suspense>
        </div>

        <p className="text-center text-xs text-cream/20 mt-6">
          Opheon SaaS — Plateforme de gestion restauration
        </p>
      </div>
    </div>
  )
}
