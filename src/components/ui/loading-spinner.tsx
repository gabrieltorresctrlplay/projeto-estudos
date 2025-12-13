import { motion } from 'framer-motion'

/**
 * Loading spinner component with smooth animation
 */
export function LoadingSpinner() {
  return (
    <div
      className="flex min-h-screen items-center justify-center"
      role="status"
      aria-label="Carregando conteúdo"
    >
      <motion.div
        className="bg-primary size-16 rounded-full"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [1, 0.5, 1],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      <span className="sr-only">Carregando...</span>
    </div>
  )
}
