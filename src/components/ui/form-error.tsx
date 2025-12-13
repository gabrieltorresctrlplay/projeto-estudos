import { AlertCircle } from 'lucide-react'

import { cn } from '@/lib/utils'

interface FormErrorProps {
  message?: string
  className?: string
}

export function FormError({ message, className }: FormErrorProps) {
  if (!message) return null

  return (
    <div
      className={cn('text-destructive mt-1.5 flex items-center gap-1.5 text-xs', className)}
      role="alert"
      aria-live="polite"
    >
      <AlertCircle className="h-3 w-3 shrink-0" />
      <span>{message}</span>
    </div>
  )
}
