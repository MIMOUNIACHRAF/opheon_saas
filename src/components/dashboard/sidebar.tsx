'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, UtensilsCrossed, CalendarDays,
  ShoppingBag, Settings, LogOut, ChevronLeft, ChevronRight, Users,
  BarChart3,
} from 'lucide-react'
import { signOut } from 'next-auth/react'
import { cn } from '@/lib/utils'
import type { Tenant } from '@/types'

interface SidebarProps {
  tenant: Tenant
  pendingOrders?: number
  pendingReservations?: number
}

export function DashboardSidebar({ tenant, pendingOrders = 0, pendingReservations = 0 }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()
  const base = `/${tenant.slug}/dashboard`

  const links = [
    { href: base,                     label: 'Dashboard',      icon: LayoutDashboard, badge: 0 },
    { href: `${base}/menu`,           label: 'Menu',           icon: UtensilsCrossed, badge: 0 },
    { href: `${base}/commandes`,      label: 'Commandes',      icon: ShoppingBag,     badge: pendingOrders },
    { href: `${base}/reservations`,   label: 'Réservations',   icon: CalendarDays,    badge: pendingReservations },
    { href: `${base}/clients`,        label: 'Clients',        icon: Users,           badge: 0 },
    { href: `${base}/analytics`,      label: 'Statistiques',   icon: BarChart3,       badge: 0 },
    { href: `${base}/parametres`,     label: 'Paramètres',     icon: Settings,        badge: 0 },
  ]

  return (
    <aside
      className={cn(
        'flex flex-col h-screen bg-charcoal border-r border-white/10 transition-all duration-300 shrink-0',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className={cn('flex items-center gap-3 p-4 border-b border-white/10', collapsed && 'justify-center')}>
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-espresso font-bold text-sm shrink-0"
          style={{ background: tenant.primaryColor }}
        >
          {tenant.name.charAt(0)}
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="font-display text-cream text-sm truncate">{tenant.name}</p>
            <p className="text-xs text-cream/30">Administration</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
        {links.map(({ href, label, icon: Icon, badge }) => {
          const active = pathname === href || (href !== base && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200',
                active
                  ? 'bg-gold/15 text-gold border border-gold/20'
                  : 'text-cream/50 hover:text-cream hover:bg-white/5',
                collapsed && 'justify-center'
              )}
              title={collapsed ? label : undefined}
            >
              <div className="relative shrink-0">
                <Icon size={18} />
                {badge > 0 && (
                  <span className={cn(
                    'absolute -top-1.5 -right-1.5 min-w-[16px] h-4 px-0.5 rounded-full flex items-center justify-center text-[10px] font-bold text-espresso',
                    badge > 0 ? 'bg-red-500 text-white' : ''
                  )}>
                    {badge > 9 ? '9+' : badge}
                  </span>
                )}
              </div>
              {!collapsed && <span className="truncate flex-1">{label}</span>}
              {!collapsed && badge > 0 && (
                <span className="ml-auto text-[10px] font-bold bg-red-500/20 text-red-400 border border-red-500/30 px-1.5 py-0.5 rounded-full">
                  {badge}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Bottom */}
      <div className={cn('p-2 border-t border-white/10 space-y-0.5', collapsed && 'items-center')}>
        <Link
          href={`/${tenant.slug}`}
          className={cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-cream/40 hover:text-cream hover:bg-white/5 transition-colors',
            collapsed && 'justify-center'
          )}
          title={collapsed ? 'Voir le site' : undefined}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
          {!collapsed && <span>Voir le site</span>}
        </Link>

        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className={cn(
            'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-400/60 hover:text-red-400 hover:bg-red-900/10 transition-colors',
            collapsed && 'justify-center'
          )}
          title={collapsed ? 'Déconnexion' : undefined}
        >
          <LogOut size={18} className="shrink-0" />
          {!collapsed && <span>Déconnexion</span>}
        </button>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-cream/20 hover:text-cream/50 transition-colors',
            collapsed && 'justify-center'
          )}
        >
          {collapsed ? <ChevronRight size={18} /> : <><ChevronLeft size={18} /><span>Réduire</span></>}
        </button>
      </div>
    </aside>
  )
}
