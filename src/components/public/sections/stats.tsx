'use client'

import { useEffect, useRef, useState } from 'react'

interface StatItem { value: number; suffix: string; label: string }

const STATS: StatItem[] = [
  { value: 10,   suffix: '+', label: "Années d'excellence" },
  { value: 50,   suffix: '+', label: 'Plats signature' },
  { value: 5000, suffix: '+', label: 'Clients satisfaits' },
  { value: 4.9,  suffix: '★', label: 'Note moyenne' },
]

function useCountUp(target: number, duration = 2000, start = false) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (!start) return
    const isDecimal = target % 1 !== 0
    const step = target / (duration / 16)
    let current = 0
    const timer = setInterval(() => {
      current = Math.min(current + step, target)
      setCount(isDecimal ? Math.round(current * 10) / 10 : Math.floor(current))
      if (current >= target) clearInterval(timer)
    }, 16)
    return () => clearInterval(timer)
  }, [start, target, duration])
  return count
}

function StatCounter({ value, suffix, label }: StatItem) {
  const [started, setStarted] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const count = useCountUp(value, 1800, started)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setStarted(true); obs.disconnect() } }, { threshold: 0.5 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return (
    <div ref={ref} className="text-center space-y-2">
      <p className="font-display text-5xl" style={{ color: '#C9A84C' }}>
        {count}{suffix}
      </p>
      <p className="text-sm tracking-wide uppercase" style={{ color: 'rgba(245,237,216,0.5)', letterSpacing: '0.12em' }}>{label}</p>
    </div>
  )
}

export function StatsSection() {
  return (
    <section className="py-20 border-y" style={{ background: '#2C1F17', borderColor: 'rgba(255,255,255,0.05)' }}>
      <div className="max-w-5xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
          {STATS.map((s) => <StatCounter key={s.label} {...s} />)}
        </div>
      </div>
    </section>
  )
}
