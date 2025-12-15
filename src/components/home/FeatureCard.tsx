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
      whileHover={{ y: -6, transition: { type: 'spring', stiffness: 400, damping: 17 } }}
      className="group border-border/50 bg-card/50 hover:bg-card/80 hover:border-primary/20 relative overflow-hidden rounded-2xl border p-6 backdrop-blur-md transition-all duration-300 hover:shadow-2xl"
    >
      <div className="from-primary/5 absolute inset-0 bg-linear-to-br via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      <div
        className="from-primary/20 to-primary/5 text-primary shadow-primary/10 group-hover:shadow-primary/20 relative mb-4 flex size-12 items-center justify-center rounded-2xl bg-linear-to-br shadow-lg ring-1 ring-white/10 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3"
        aria-hidden="true"
      >
        <Icon className="size-6" />
      </div>
      <h3 className="relative mb-2 text-xl font-semibold">{feature.title}</h3>
      <p className="text-muted-foreground relative text-sm leading-relaxed">
        {feature.description}
      </p>
    </motion.article>
  )
})
