'use client'

import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg'
}

export function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [isOpen, onClose])

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  if (!isOpen) return null

  const sizes = { sm: 'max-w-md', md: 'max-w-xl', lg: 'max-w-2xl' }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal
    >
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        ref={ref}
        className={cn(
          'relative w-full bg-charcoal border border-white/10 rounded-xl shadow-2xl',
          'max-h-[90vh] overflow-y-auto',
          sizes[size]
        )}
      >
        {title && (
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <h2 className="font-display text-xl text-cream">{title}</h2>
            <button
              onClick={onClose}
              className="text-cream/40 hover:text-cream transition-colors p-1 rounded-lg hover:bg-white/5"
            >
              <X size={20} />
            </button>
          </div>
        )}
        <div className={cn('p-6', !title && 'pt-10')}>
          {!title && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-cream/40 hover:text-cream transition-colors"
            >
              <X size={20} />
            </button>
          )}
          {children}
        </div>
      </div>
    </div>
  )
}
