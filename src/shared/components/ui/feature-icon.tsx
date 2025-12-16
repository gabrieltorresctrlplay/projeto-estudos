import { cn } from '@/shared/lib/utils'

interface FeatureIconProps extends React.HTMLAttributes<HTMLDivElement> {
  icon: React.ElementType
  iconClassName?: string
  variant?: 'primary' | 'outline'
}

export function FeatureIcon({
  icon: Icon,
  className,
  iconClassName,
  variant = 'primary',
  ...props
}: FeatureIconProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-[10px]',
        // Variants
        {
          'bg-primary text-primary-foreground': variant === 'primary',
          'border-border text-foreground border bg-transparent': variant === 'outline',
        },
        className,
      )}
      {...props}
    >
      <Icon className={cn('h-8 w-8', iconClassName)} />
    </div>
  )
}
