import { motion } from 'framer-motion'

import { FeatureGrid, Hero } from '@/components/home'

/**
 * Home page - Landing page with hero section and features
 * Fullscreen responsive layout that fits in viewport on all devices
 * Smooth fade-in animation on load
 */
export default function Home() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="relative flex h-full flex-col items-center justify-center overflow-hidden px-4 py-2 sm:py-4 md:py-0"
    >
      {/* Hero Section */}
      <section
        className="flex w-full max-w-6xl flex-col items-center justify-center gap-3 text-center sm:gap-6 md:gap-12 lg:gap-16"
        aria-labelledby="hero-title"
      >
        <Hero />
        <FeatureGrid />
      </section>
    </motion.div>
  )
}
