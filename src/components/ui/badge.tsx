import { cn } from '@/lib/utils'

type BadgeVariant = 'gold' | 'green' | 'red' | 'yellow' | 'blue' | 'gray' | 'outline'

interface BadgeProps {
  variant?: BadgeVariant
  className?: string
  children: React.ReactNode
}

const variants: Record<BadgeVariant, string> = {
  gold:    'bg-yellow-900/30 text-yellow-400 border-yellow-700/40',
  green:   'bg-green-900/30 text-green-400 border-green-700/40',
  red:     'bg-red-900/30 text-red-400 border-red-700/40',
  yellow:  'bg-amber-900/30 text-amber-400 border-amber-700/40',
  blue:    'bg-blue-900/30 text-blue-400 border-blue-700/40',
  gray:    'bg-white/5 text-cream/50 border-white/10',
  outline: 'border border-gold/40 text-gold bg-transparent',
}

export function Badge({ variant = 'gold', className, children }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  )
}
