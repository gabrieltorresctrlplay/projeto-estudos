import { memo } from 'react'
import { FeatureIcon } from '@/shared/components/ui/feature-icon'
import type { Feature } from '@/shared/types'
import { motion } from 'framer-motion'

interface FeatureCardProps {
  feature: Feature
  index: number
}

/**
 * Individual feature card component with hover animations
 * Compact design for fullscreen responsive layout
 */
export const FeatureCard = memo(function FeatureCard({ feature, index }: FeatureCardProps) {
  // const Icon = feature.icon // No longer needed as FeatureIcon takes the icon directly

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      animate={{ y: 0, transition: { type: 'tween', duration: 0.2 } }}
      whileHover={{ y: -6, transition: { type: 'spring', stiffness: 400, damping: 17 } }}
      className="group border-border relative overflow-hidden rounded-2xl border p-6 backdrop-blur-md"
    >
      <div className="from-primary/5 absolute inset-0 bg-linear-to-br via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      <div className="mb-4 flex justify-center">
        <FeatureIcon
          icon={feature.icon}
          className="h-14 w-14"
          iconClassName="h-7 w-7"
        />
      </div>
      <h3 className="relative mb-2 text-xl font-semibold">{feature.title}</h3>
      <p className="text-muted-foreground relative text-sm leading-relaxed">
        {feature.description}
      </p>
    </motion.article>
  )
})
