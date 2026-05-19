import { cn } from '@/lib/utils'

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-lg bg-white/5',
        className
      )}
    />
  )
}

export function SkeletonCard() {
  return (
    <div className="bg-charcoal border border-white/10 rounded-xl p-4 space-y-3">
      <Skeleton className="h-48 w-full rounded-lg" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
      <div className="flex justify-between items-center pt-1">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-8 w-24 rounded-lg" />
      </div>
    </div>
  )
}
