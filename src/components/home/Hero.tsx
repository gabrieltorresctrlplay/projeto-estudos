import { memo } from 'react'
import { useAnimationVariants } from '@/hooks'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

import { Button } from '@/components/ui/button'

/**
 * Hero section component for the home page
 * Compact and responsive for fullscreen layout
 */
export const Hero = memo(function Hero() {
  const { containerVariants, itemVariants } = useAnimationVariants()

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-3 md:space-y-6"
    >
      <motion.h1
        variants={itemVariants}
        className="text-foreground text-3xl font-extrabold tracking-tight text-balance sm:text-5xl md:text-6xl lg:text-7xl"
      >
        Potencialize sua <br className="hidden sm:block" />
        <span className="from-primary to-primary inline-block bg-linear-to-r bg-clip-text leading-relaxed text-transparent">
          produtividade global.
        </span>
      </motion.h1>

      <motion.p
        variants={itemVariants}
        className="text-muted-foreground mx-auto max-w-2xl text-sm text-balance sm:text-lg md:text-xl"
      >
        A plataforma completa para escalar operações, otimizar recursos e conectar equipes em tempo
        real. Simples, seguro e eficiente.
      </motion.p>

      <motion.div
        variants={itemVariants}
        className="flex flex-col justify-center gap-2 pt-2 sm:flex-row sm:gap-4 sm:pt-4"
      >
        <Button
          size="lg"
          className="h-10 rounded-full px-6 text-sm transition-all hover:scale-105 sm:h-12 sm:px-8 sm:text-base"
          aria-label="Começar teste grátis de 14 dias"
          asChild
        >
          <Link to="/register">
            Começar Teste Grátis <ArrowRight className="ml-2 size-4 sm:size-5" />
          </Link>
        </Button>
      </motion.div>
    </motion.div>
  )
})
