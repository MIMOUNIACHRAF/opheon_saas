'use client'

import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

type Variant = 'gold' | 'outline' | 'ghost' | 'danger' | 'dark'
type Size    = 'sm' | 'md' | 'lg'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  isLoading?: boolean
}

const variants: Record<Variant, string> = {
  gold:    'gradient-gold text-espresso font-semibold hover:opacity-90 shadow-lg shadow-yellow-900/20',
  outline: 'border border-gold text-gold hover:bg-gold/10 transition-colors',
  ghost:   'text-cream/70 hover:text-cream hover:bg-white/5 transition-colors',
  danger:  'bg-red-600/20 border border-red-500/40 text-red-400 hover:bg-red-600/30 transition-colors',
  dark:    'bg-charcoal border border-white/10 text-cream hover:bg-white/5 transition-colors',
}

const sizes: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-sm rounded-md',
  md: 'px-5 py-2.5 text-sm rounded-lg',
  lg: 'px-8 py-3.5 text-base rounded-lg',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'gold', size = 'md', isLoading, disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          'inline-flex items-center justify-center gap-2 font-body font-medium',
          'transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {isLoading && (
          <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'
