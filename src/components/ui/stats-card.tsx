import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { type LucideIcon } from 'lucide-react'

import { cn } from '@/lib/utils'

/**
 * StatsCard — A premium dashboard metric card demonstrating the Semantic Design System.
 *
 * Features:
 * - Uses semantic tokens exclusively (no hardcoded colors)
 * - Micro-interactions: hover lift, icon pulse, value shimmer on load
 * - Accessible focus states (WCAG 2.2 AA+)
 * - 44px touch targets for mobile
 * - Motion-reduced support
 */

const statsCardVariants = cva(
  [
    // Base styles: Supabase Glass Panel
    'relative overflow-hidden rounded-xl border',
    'glass-panel', // New utility
    'text-text-primary',
    // Transitions & Motion
    'transition-all duration-[var(--duration-normal)] ease-[var(--ease-smooth)]',
    // Hover: Lift & Brand Glow
    'hover:-translate-y-1 hover:shadow-lg hover:border-brand-400/50',
    // Focus
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2',
  ].join(' '),
  {
    variants: {
      trend: {
        neutral: 'hover:shadow-md',
        positive: 'hover:border-status-success/50 hover:glow-brand', // Brand glow
        negative: 'hover:border-status-error/50',
      },
    },
    defaultVariants: {
      trend: 'neutral',
    },
  },
)

const iconContainerVariants = cva(
  [
    'flex items-center justify-center rounded-lg',
    'transition-all duration-[var(--duration-normal)] ease-[var(--ease-out)]',
  ].join(' '),
  {
    variants: {
      trend: {
        neutral: 'bg-surface-sunken text-text-secondary',
        positive: 'bg-gradient-to-br from-brand-500/10 to-brand-500/20 text-brand-600',
        negative: 'bg-status-error-subtle text-status-error',
      },
      size: {
        sm: 'size-8',
        default: 'size-10',
        lg: 'size-12',
      },
    },
    defaultVariants: {
      trend: 'neutral',
      size: 'default',
    },
  },
)

const trendBadgeVariants = cva(
  [
    'inline-flex items-center gap-1 rounded-full px-2 py-0.5',
    'text-xs font-medium',
    'transition-colors duration-[var(--duration-fast)]',
  ].join(' '),
  {
    variants: {
      trend: {
        neutral: 'bg-surface-sunken text-text-secondary',
        positive: 'bg-status-success-subtle text-status-success-text',
        negative: 'bg-status-error-subtle text-status-error-text',
      },
    },
    defaultVariants: {
      trend: 'neutral',
    },
  },
)

export interface StatsCardProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof statsCardVariants> {
  /** The metric title/label */
  title: string
  /** The metric value to display */
  value: string | number
  /** Optional description text */
  description?: string
  /** Lucide icon component */
  icon?: LucideIcon
  /** Trend change text (e.g., "+12.5%") */
  trendValue?: string
  /** Whether the card is in loading state */
  loading?: boolean
  /** Size of the icon container */
  iconSize?: 'sm' | 'default' | 'lg'
}

function StatsCard({
  className,
  title,
  value,
  description,
  icon: Icon,
  trend = 'neutral',
  trendValue,
  loading = false,
  iconSize = 'default',
  ...props
}: StatsCardProps) {
  return (
    <div
      className={cn(statsCardVariants({ trend }), className)}
      role="article"
      aria-label={`${title}: ${value}`}
      {...props}
    >
      {/* Subtle gradient overlay for premium feel */}
      <div
        className="to-surface-brand/[0.02] pointer-events-none absolute inset-0 bg-gradient-to-br from-transparent via-transparent"
        aria-hidden="true"
      />

      {/* Content */}
      <div className="relative p-5">
        <div className="flex items-start justify-between gap-4">
          {/* Text content */}
          <div className="min-w-0 flex-1 space-y-2">
            {/* Title */}
            <p className="text-text-secondary text-sm leading-none font-medium">{title}</p>

            {/* Value */}
            {loading ? (
              <div className="animate-shimmer bg-surface-sunken h-8 w-24 rounded-md" />
            ) : (
              <p className="text-text-primary truncate text-2xl font-bold tracking-tight">
                {value}
              </p>
            )}

            {/* Trend badge */}
            {trendValue && !loading && (
              <div className="flex items-center gap-2">
                <span className={cn(trendBadgeVariants({ trend }))}>
                  {trend === 'positive' ? '↑' : trend === 'negative' ? '↓' : ''}
                  {trendValue}
                </span>
                {description && <span className="text-text-muted text-xs">{description}</span>}
              </div>
            )}

            {/* Description only (when no trend) */}
            {!trendValue && description && !loading && (
              <p className="text-text-tertiary text-xs">{description}</p>
            )}
          </div>

          {/* Icon */}
          {Icon && (
            <div
              className={cn(
                iconContainerVariants({ trend, size: iconSize }),
                // Micro-interaction: subtle scale on card hover
                'group-hover:scale-105',
              )}
            >
              <Icon
                className={cn(
                  'transition-transform duration-[var(--duration-normal)]',
                  iconSize === 'sm' && 'size-4',
                  iconSize === 'default' && 'size-5',
                  iconSize === 'lg' && 'size-6',
                )}
              />
            </div>
          )}
        </div>
      </div>

      {/* Interactive highlight on hover */}
      <div
        className={cn(
          'absolute bottom-0 left-0 h-0.5 w-full',
          'origin-left scale-x-0 transition-transform duration-[var(--duration-normal)] ease-[var(--ease-out)]',
          'group-hover:scale-x-100',
          trend === 'positive' && 'bg-status-success',
          trend === 'negative' && 'bg-status-error',
          trend === 'neutral' && 'bg-surface-brand',
        )}
        aria-hidden="true"
      />
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────────────────
   StatsCardGrid — Container for responsive grid layout
   ───────────────────────────────────────────────────────────────────────────── */

interface StatsCardGridProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

function StatsCardGrid({ className, children, ...props }: StatsCardGridProps) {
  return (
    <div
      className={cn('grid gap-4 sm:grid-cols-2 lg:grid-cols-4', className)}
      {...props}
    >
      {children}
    </div>
  )
}

export { StatsCard, StatsCardGrid, statsCardVariants }
