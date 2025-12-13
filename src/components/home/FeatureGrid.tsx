import { FEATURES } from '@/constants'

import { FeatureCard } from './FeatureCard'

/**
 * Grid of feature cards displayed on the home page
 */
export function FeatureGrid() {
  return (
    <section
      className="mt-20 grid w-full grid-cols-1 gap-8 md:grid-cols-3"
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
