import { FEATURES } from '@/constants'

import { FeatureCard } from './FeatureCard'

/**
 * Grid of feature cards displayed on the home page
 * Compact layout for fullscreen responsive design
 */
export function FeatureGrid() {
  return (
    <section
      className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 md:gap-6 lg:grid-cols-3"
      aria-label="Principais funcionalidades"
    >
      {FEATURES.map((feature, index) => (
        <FeatureCard
          key={feature.title}
          feature={feature}
          index={index}
        />
      ))}
    </section>
  )
}
