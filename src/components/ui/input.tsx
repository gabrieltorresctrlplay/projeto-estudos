import * as React from 'react'

import { cn } from '@/lib/utils'

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        'border-input file:text-foreground placeholder:text-muted-foreground',
        'flex h-11 w-full rounded-md border bg-transparent px-3 py-2 text-base md:text-sm',
        'shadow-xs transition-all duration-200 ease-out',
        'file:border-0 file:bg-transparent file:text-sm file:font-medium',
        'focus-visible:ring-ring/50 focus-visible:border-ring focus-visible:ring-2 focus-visible:outline-none',
        'hover:border-ring/50',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    />
  )
}

export { Input }
