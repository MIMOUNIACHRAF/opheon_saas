import Link from 'next/link'
import { CheckCircle, ArrowRight, UtensilsCrossed, CalendarDays, ShoppingBag, BarChart3, Shield, Zap } from 'lucide-react'

const FEATURES = [
  { icon: <UtensilsCrossed size={22}/>, title: 'Menu dynamique', desc: 'Gérez vos plats, catégories et disponibilités en temps réel depuis le dashboard.' },
  { icon: <CalendarDays size={22}/>, title: 'Réservations', desc: 'Système de réservation intégré avec confirmation et gestion des créneaux.' },
  { icon: <ShoppingBag size={22}/>, title: 'Commandes en ligne', desc: 'Panier client, commandes sur place / à emporter / livraison.' },
  { icon: <BarChart3 size={22}/>, title: 'Analytics', desc: "Suivez votre CA, top produits et performances en temps réel." },
  { icon: <Shield size={22}/>, title: 'Multi-rôles', desc: 'Admin, Manager, Staff — chaque utilisateur a ses accès adaptés.' },
  { icon: <Zap size={22}/>, title: 'Multi-tenant', desc: 'Une plateforme, plusieurs restaurants. Déployez votre site en quelques clics.' },
]

const PLANS = [
  { name: 'Basic', price: '299', period: 'MAD/mois', color: 'border-white/10', features: ['Site vitrine', 'Menu dynamique', 'Réservations', '1 utilisateur admin'] },
  { name: 'Pro', price: '599', period: 'MAD/mois', color: 'border-gold/40', tag: 'Populaire', features: ['Tout Basic', 'Commandes en ligne', 'Analytics', '5 utilisateurs', 'Support prioritaire'] },
  { name: 'Enterprise', price: 'Sur devis', period: '', color: 'border-white/10', features: ['Tout Pro', 'Multi-établissements', 'Intégration Stripe', 'Domaine personnalisé', 'SLA garanti'] },
]

const DEMOS = [
  { name: 'Café Ophéon', slug: 'opheon', desc: 'Café-restaurant marocain, Oujda', color: '#C9A84C' },
  { name: 'Restaurant 2', slug: 'restaurant2', desc: 'Restaurant gastronomique', color: '#D4452A' },
]

export default function SaaSLandingPage() {
  return (
    <div className="min-h-screen bg-espresso text-cream font-body">
      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-gold/15 py-4">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 gradient-gold rounded-xl flex items-center justify-center">
              <span className="font-display text-espresso font-bold text-sm">O</span>
            </div>
            <span className="font-display text-xl text-cream">Opheon <span className="text-gold">SaaS</span></span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm text-cream/60">
            <a href="#features" className="hover:text-cream transition-colors">Fonctionnalités</a>
            <a href="#demos" className="hover:text-cream transition-colors">Démos</a>
            <a href="#tarifs" className="hover:text-cream transition-colors">Tarifs</a>
          </div>
          <Link href="/login" className="gradient-gold text-espresso font-semibold px-5 py-2 rounded-lg text-sm hover:opacity-90 transition-opacity">
            Se connecter
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative pt-32 pb-24 px-6 text-center overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/3 left-0 right-0 h-px bg-gold" />
          <div className="absolute left-1/4 top-0 bottom-0 w-px bg-gold" />
          <div className="absolute right-1/4 top-0 bottom-0 w-px bg-gold" />
        </div>
        <div className="relative max-w-5xl mx-auto space-y-8">
          <div className="inline-flex items-center gap-2 bg-gold/10 border border-gold/30 text-gold text-sm px-4 py-2 rounded-full">
            <Zap size={14} fill="currentColor" /> Plateforme SaaS pour la restauration
          </div>
          <h1 className="font-display text-5xl md:text-7xl text-cream leading-tight">
            Votre restaurant en ligne,<br/>
            <span className="text-gold">prêt en 24h</span>
          </h1>
          <p className="text-xl text-cream/60 max-w-2xl mx-auto leading-relaxed">
            Site vitrine premium + gestion complète (menu, réservations, commandes) + dashboard analytics. Tout-en-un, sans code.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/opheon" className="flex items-center gap-2 gradient-gold text-espresso font-semibold px-8 py-4 rounded-xl text-base hover:opacity-90 shadow-lg shadow-yellow-900/30">
              Voir la démo live <ArrowRight size={18}/>
            </Link>
            <Link href="#tarifs" className="flex items-center gap-2 border border-gold/40 text-gold px-8 py-4 rounded-xl text-base hover:bg-gold/10 transition-colors">
              Voir les tarifs
            </Link>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-6 pt-4 text-sm text-cream/40">
            {['Sans engagement', 'Mise en ligne rapide', 'Support inclus', 'HTTPS gratuit'].map((t) => (
              <span key={t} className="flex items-center gap-1.5"><CheckCircle size={14} className="text-green-400"/>{t}</span>
            ))}
          </div>
        </div>
      </section>

      {/* DEMOS */}
      <section id="demos" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 space-y-3">
            <p className="font-accent text-gold text-lg">— Exemples clients —</p>
            <h2 className="font-display text-4xl text-cream">Découvrez nos restaurants</h2>
            <div className="divider-gold w-24 mx-auto" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {DEMOS.map((d) => (
              <Link key={d.slug} href={`/${d.slug}`}
                className="group bg-charcoal border border-white/10 rounded-2xl p-8 hover:border-gold/30 transition-all card-hover flex items-center gap-6">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-espresso font-display text-2xl font-bold shrink-0 shadow-lg" style={{ background: d.color }}>
                  {d.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-display text-2xl text-cream group-hover:text-gold transition-colors">{d.name}</h3>
                  <p className="text-cream/50 text-sm mt-1">{d.desc}</p>
                  <span className="inline-flex items-center gap-1 text-gold text-sm mt-3 group-hover:gap-2 transition-all">
                    Visiter le site <ArrowRight size={14}/>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-20 px-6 bg-charcoal border-y border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 space-y-3">
            <p className="font-accent text-gold text-lg">— Ce que vous obtenez —</p>
            <h2 className="font-display text-4xl text-cream">Tout ce dont vous avez besoin</h2>
            <div className="divider-gold w-24 mx-auto" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f) => (
              <div key={f.title} className="bg-espresso border border-white/10 rounded-xl p-6 hover:border-gold/20 transition-colors space-y-3">
                <div className="w-11 h-11 bg-gold/10 rounded-xl flex items-center justify-center text-gold">{f.icon}</div>
                <h3 className="font-display text-lg text-cream">{f.title}</h3>
                <p className="text-cream/50 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="tarifs" className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16 space-y-3">
            <p className="font-accent text-gold text-lg">— Tarifs —</p>
            <h2 className="font-display text-4xl text-cream">Simple et transparent</h2>
            <div className="divider-gold w-24 mx-auto" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PLANS.map((plan) => (
              <div key={plan.name} className={`relative bg-charcoal border rounded-2xl p-8 flex flex-col ${plan.color} ${plan.tag ? 'ring-1 ring-gold/30' : ''}`}>
                {plan.tag && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 gradient-gold text-espresso text-xs font-bold px-4 py-1 rounded-full">
                    {plan.tag}
                  </div>
                )}
                <div className="mb-6">
                  <h3 className="font-display text-xl text-cream">{plan.name}</h3>
                  <div className="mt-3 flex items-baseline gap-1">
                    <span className="font-display text-4xl text-gold">{plan.price}</span>
                    {plan.period && <span className="text-cream/40 text-sm">{plan.period}</span>}
                  </div>
                </div>
                <ul className="space-y-3 flex-1 mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2.5 text-sm text-cream/70">
                      <CheckCircle size={15} className="text-green-400 shrink-0"/>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/login" className={`block text-center py-3 rounded-xl font-semibold text-sm transition-all ${plan.tag ? 'gradient-gold text-espresso hover:opacity-90' : 'border border-white/20 text-cream hover:border-gold/40 hover:text-gold'}`}>
                  Commencer
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/10 py-10 px-6 text-center">
        <p className="text-cream/30 text-sm">
          © {new Date().getFullYear()} Opheon SaaS. Tous droits réservés.
          {' · '}
          <Link href="/super-admin" className="hover:text-gold transition-colors">Admin</Link>
        </p>
      </footer>
    </div>
  )
}
