'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { Calendar, ShoppingBag, ChevronDown, MapPin, Clock, Phone } from 'lucide-react'
import type { Tenant } from '@/types'

interface HeroProps {
  tenant: Tenant
}

export function HeroSection({ tenant }: HeroProps) {
  const slug = tenant.slug
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width  = window.innerWidth
    canvas.height = window.innerHeight

    const particles: { x: number; y: number; vx: number; vy: number; size: number; opacity: number }[] = []
    for (let i = 0; i < 60; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: -Math.random() * 0.5 - 0.2,
        size: Math.random() * 1.5 + 0.5,
        opacity: Math.random() * 0.4 + 0.1,
      })
    }

    let raf: number
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particles.forEach((p) => {
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(201, 168, 76, ${p.opacity})`
        ctx.fill()
        p.x += p.vx
        p.y += p.vy
        if (p.y < -10) { p.y = canvas.height + 10; p.x = Math.random() * canvas.width }
        if (p.x < -10) p.x = canvas.width + 10
        if (p.x > canvas.width + 10) p.x = -10
      })
      raf = requestAnimationFrame(animate)
    }
    animate()

    const handleResize = () => {
      canvas.width  = window.innerWidth
      canvas.height = window.innerHeight
    }
    window.addEventListener('resize', handleResize)
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', handleResize) }
  }, [])

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      {/* Textured dark background */}
      <div className="absolute inset-0 z-0" style={{
        background: `radial-gradient(ellipse 80% 60% at 50% 40%, #2C1F17 0%, #1A0F0A 50%, #0A0604 100%)`,
      }} />

      {/* Art deco geometric overlay */}
      <div className="absolute inset-0 z-0 pointer-events-none" style={{ opacity: 0.06 }}>
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="artdeco" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
              <polygon points="40,2 78,22 78,58 40,78 2,58 2,22" fill="none" stroke="#C9A84C" strokeWidth="0.5"/>
              <polygon points="40,14 66,28 66,52 40,66 14,52 14,28" fill="none" stroke="#C9A84C" strokeWidth="0.3"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#artdeco)"/>
        </svg>
      </div>

      {/* Particle canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 z-0 pointer-events-none" />

      {/* Horizontal gold lines */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[28%] left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(201,168,76,0.2), transparent)' }} />
        <div className="absolute bottom-[28%] left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(201,168,76,0.2), transparent)' }} />
        <div className="absolute left-[15%] top-0 bottom-0 w-px" style={{ background: 'linear-gradient(180deg, transparent, rgba(201,168,76,0.15), transparent)' }} />
        <div className="absolute right-[15%] top-0 bottom-0 w-px" style={{ background: 'linear-gradient(180deg, transparent, rgba(201,168,76,0.15), transparent)' }} />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center" style={{ animation: 'heroFadeIn 1.2s ease-out forwards' }}>
        {/* Eyebrow */}
        <div className="inline-flex items-center gap-3 mb-8" style={{ animation: 'slideDown 0.8s ease-out 0.2s both' }}>
          <div className="h-px w-12" style={{ background: 'linear-gradient(90deg, transparent, #C9A84C)' }} />
          <span className="font-accent text-lg tracking-[0.4em] uppercase text-gold">
            Bienvenue
          </span>
          <div className="h-px w-12" style={{ background: 'linear-gradient(90deg, #C9A84C, transparent)' }} />
        </div>

        {/* Main title */}
        <h1
          className="font-display text-cream leading-none mb-6"
          style={{
            fontSize: 'clamp(3.5rem, 10vw, 7.5rem)',
            animation: 'slideUp 1s ease-out 0.3s both',
            textShadow: '0 0 80px rgba(201,168,76,0.15)',
          }}
        >
          {tenant.name}
        </h1>

        {/* Tagline */}
        {tenant.tagline && (
          <p
            className="font-accent text-gold/80"
            style={{
              fontSize: 'clamp(1.1rem, 2.5vw, 1.5rem)',
              animation: 'slideUp 1s ease-out 0.5s both',
              letterSpacing: '0.05em',
            }}
          >
            {tenant.tagline}
          </p>
        )}

        {/* Description */}
        {tenant.description && (
          <p
            className="text-cream/50 max-w-xl mx-auto mt-4 leading-relaxed"
            style={{
              fontSize: 'clamp(0.9rem, 1.5vw, 1.05rem)',
              animation: 'slideUp 1s ease-out 0.65s both',
            }}
          >
            {tenant.description}
          </p>
        )}

        {/* Decorative divider */}
        <div className="flex items-center justify-center gap-4 my-10" style={{ animation: 'fadeIn 1s ease-out 0.8s both' }}>
          <div className="h-px w-16 bg-gold/40" />
          <div className="w-2 h-2 rounded-full bg-gold/60" />
          <div className="h-px w-16 bg-gold/40" />
        </div>

        {/* CTAs */}
        <div
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
          style={{ animation: 'slideUp 1s ease-out 0.9s both' }}
        >
          <Link
            href={`/${slug}/reserver`}
            className="group flex items-center gap-2.5 px-8 py-4 rounded-xl font-semibold text-espresso transition-all duration-300 hover:scale-105 hover:shadow-2xl"
            style={{ background: 'linear-gradient(135deg, #C9A84C, #E8C97A)', boxShadow: '0 8px 32px rgba(201,168,76,0.25)' }}
          >
            <Calendar size={18} className="group-hover:rotate-12 transition-transform" />
            Réserver une table
          </Link>
          <Link
            href={`/${slug}/commander`}
            className="group flex items-center gap-2.5 px-8 py-4 rounded-xl font-semibold text-gold border transition-all duration-300 hover:scale-105 hover:bg-gold/10"
            style={{ borderColor: 'rgba(201,168,76,0.5)' }}
          >
            <ShoppingBag size={18} className="group-hover:scale-110 transition-transform" />
            Commander en ligne
          </Link>
        </div>

        {/* Info strip */}
        <div
          className="flex flex-wrap items-center justify-center gap-6 mt-12 pt-8"
          style={{
            animation: 'fadeIn 1s ease-out 1.1s both',
            borderTop: '1px solid rgba(201,168,76,0.12)',
          }}
        >
          {tenant.address && (
            <div className="flex items-center gap-2 text-sm text-cream/40">
              <MapPin size={14} className="text-gold/60" />
              <span>{tenant.address}{tenant.city ? `, ${tenant.city}` : ''}</span>
            </div>
          )}
          {tenant.phone && (
            <a href={`tel:${tenant.phone}`} className="flex items-center gap-2 text-sm text-cream/40 hover:text-gold transition-colors">
              <Phone size={14} className="text-gold/60" />
              <span>{tenant.phone}</span>
            </a>
          )}
          {tenant.hours && (
            <div className="flex items-center gap-2 text-sm text-cream/40">
              <Clock size={14} className="text-gold/60" />
              <span>{tenant.hours}</span>
            </div>
          )}
        </div>
      </div>

      {/* Scroll indicator */}
      <button
        onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 text-cream/30 hover:text-gold transition-colors"
        style={{ animation: 'bounce 2s infinite 2s' }}
      >
        <span className="text-xs tracking-widest uppercase" style={{ fontSize: '10px' }}>Découvrir</span>
        <ChevronDown size={20} />
      </button>

      <style>{`
        @keyframes heroFadeIn { from { opacity:0 } to { opacity:1 } }
        @keyframes slideUp { from { opacity:0; transform:translateY(30px) } to { opacity:1; transform:translateY(0) } }
        @keyframes slideDown { from { opacity:0; transform:translateY(-20px) } to { opacity:1; transform:translateY(0) } }
        @keyframes fadeIn { from { opacity:0 } to { opacity:1 } }
        @keyframes bounce { 0%,100% { transform:translateX(-50%) translateY(0) } 50% { transform:translateX(-50%) translateY(8px) } }
      `}</style>
    </section>
  )
}
