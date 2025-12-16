import { type ReactNode } from 'react'
import { cn } from '@/shared/lib/utils'

interface ContainerProps {
  children: ReactNode
  className?: string
  as?: 'div' | 'section' | 'article' | 'main'
}

/**
 * Reusable container component with max-width and responsive padding
 */
export function Container({ children, className, as: Component = 'div' }: ContainerProps) {
  return <Component className={cn('container mx-auto px-4', className)}>{children}</Component>
}
