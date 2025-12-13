import { useReducedMotion } from '@/hooks'
import { motion } from 'framer-motion'

/**
 * Animated background with floating gradient blobs
 * Respects user's reduced motion preference for accessibility
 */
export const AnimatedBlurBackground = () => {
  const prefersReducedMotion = useReducedMotion()

  return (
    <div
      className="bg-background pointer-events-none fixed inset-0 z-0 overflow-hidden"
      aria-hidden="true"
    >
      {/* Blob 1 - Primary */}
      <motion.div
        animate={prefersReducedMotion ? {} : { x: [0, 100, 0], y: [0, -50, 0], scale: [1, 1.2, 1] }}
        transition={
          prefersReducedMotion ? {} : { duration: 20, repeat: Infinity, ease: 'easeInOut' as const }
        }
        className="bg-primary/40 absolute top-0 left-0 h-[500px] w-[500px] rounded-full mix-blend-multiply blur-[120px] dark:opacity-50 dark:mix-blend-screen"
      />

      {/* Blob 2 - Chart 2 */}
      <motion.div
        animate={
          prefersReducedMotion ? {} : { x: [0, -100, 0], y: [0, 100, 0], scale: [1, 1.5, 1] }
        }
        transition={
          prefersReducedMotion
            ? {}
            : { duration: 25, repeat: Infinity, ease: 'easeInOut' as const, delay: 2 }
        }
        className="bg-chart-2/40 absolute top-[20%] right-0 h-[400px] w-[400px] rounded-full mix-blend-multiply blur-[100px] dark:opacity-50 dark:mix-blend-screen"
      />

      {/* Blob 3 - Chart 4 */}
      <motion.div
        animate={prefersReducedMotion ? {} : { x: [0, 50, 0], y: [0, 50, 0], scale: [1, 1.1, 1] }}
        transition={
          prefersReducedMotion
            ? {}
            : { duration: 18, repeat: Infinity, ease: 'easeInOut' as const, delay: 5 }
        }
        className="bg-chart-4/30 absolute bottom-0 left-[20%] h-[600px] w-[600px] rounded-full mix-blend-multiply blur-[130px] dark:opacity-50 dark:mix-blend-screen"
      />
    </div>
  )
}
