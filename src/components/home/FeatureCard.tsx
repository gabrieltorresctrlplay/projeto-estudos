import { memo } from 'react'
import type { Feature } from '@/types'
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
  const Icon = feature.icon

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      animate={{ y: 0, transition: { type: 'tween', duration: 0.2 } }}
      whileHover={{ y: -5, transition: { type: 'tween', duration: 0.2 } }}
      className="bg-card/50 cursor-default rounded-xl border p-3 shadow-sm backdrop-blur-sm transition-all hover:shadow-md md:rounded-2xl md:p-6"
    >
      <div
        className="bg-primary/10 text-primary mb-2 flex size-8 items-center justify-center rounded-full md:mb-4 md:size-12"
        aria-hidden="true"
      >
        <Icon className="size-4 md:size-6" />
      </div>
      <h3 className="mb-1 text-base font-semibold md:mb-2 md:text-xl">{feature.title}</h3>
      <p className="text-muted-foreground text-xs md:text-base">{feature.description}</p>
    </motion.article>
  )
})
