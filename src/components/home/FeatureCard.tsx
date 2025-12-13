import type { Feature } from '@/types'
import { motion } from 'framer-motion'

interface FeatureCardProps {
  feature: Feature
  index: number
}

/**
 * Individual feature card component with hover animations
 */
export function FeatureCard({ feature, index }: FeatureCardProps) {
  const Icon = feature.icon

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -5 }}
      className="bg-card/50 cursor-default rounded-2xl border p-6 shadow-sm backdrop-blur-sm transition-all hover:shadow-md"
    >
      <div
        className="bg-primary/10 text-primary mb-4 flex size-12 items-center justify-center rounded-full"
        aria-hidden="true"
      >
        <Icon className="size-6" />
      </div>
      <h3 className="mb-2 text-xl font-semibold">{feature.title}</h3>
      <p className="text-muted-foreground">{feature.description}</p>
    </motion.article>
  )
}
