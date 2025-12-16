import { motion } from 'framer-motion'

/**
 * Loading spinner component with elegant rotating rings
 * Premium design with smooth animations
 */
export function LoadingSpinner() {
  return (
    <div
      className="flex h-full items-center justify-center"
      role="status"
      aria-label="Carregando conteúdo"
    >
      <div className="relative flex items-center justify-center">
        {/* Outer ring */}
        <motion.div
          className="border-primary absolute size-16 rounded-full border-4 border-t-transparent"
          animate={{ rotate: 360 }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'linear',
          }}
        />

        {/* Middle ring */}
        <motion.div
          className="border-chart-3 absolute size-12 rounded-full border-4 border-b-transparent"
          animate={{ rotate: -360 }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'linear',
          }}
        />

        {/* Inner pulse */}
        <motion.div
          className="bg-primary absolute size-3 rounded-full"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.7, 1, 0.7],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>
      <span className="sr-only">Carregando...</span>
    </div>
  )
}
