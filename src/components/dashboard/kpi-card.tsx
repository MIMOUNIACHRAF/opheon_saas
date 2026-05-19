import { cn } from '@/lib/utils'

interface KpiCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: React.ReactNode
  trend?: { value: number; label: string }
  className?: string
}

export function KpiCard({ title, value, subtitle, icon, trend, className }: KpiCardProps) {
  return (
    <div
      className={cn(
        'bg-charcoal border border-white/10 rounded-xl p-6 flex flex-col gap-4',
        className
      )}
    >
      <div className="flex items-center justify-between">
        <p className="text-sm text-cream/50 font-medium">{title}</p>
        <div className="w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center text-gold">
          {icon}
        </div>
      </div>

      <div>
        <p className="font-display text-3xl text-cream">{value}</p>
        {subtitle && <p className="text-xs text-cream/40 mt-1">{subtitle}</p>}
      </div>

      {trend && (
        <div className="flex items-center gap-1.5 text-xs">
          <span
            className={cn(
              'font-medium',
              trend.value >= 0 ? 'text-green-400' : 'text-red-400'
            )}
          >
            {trend.value >= 0 ? '+' : ''}{trend.value}%
          </span>
          <span className="text-cream/30">{trend.label}</span>
        </div>
      )}
    </div>
  )
}
