import { memo } from 'react'
import { Button } from '@/shared/components/ui/button'
import { useAnimationVariants } from '@/shared/hooks'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

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
        <span className="from-primary via-success to-primary inline-block bg-linear-to-r bg-clip-text leading-relaxed text-transparent">
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
        className="flex flex-col justify-center gap-3 pt-4 sm:flex-row sm:gap-4 sm:pt-6"
      >
        <Button
          size="lg"
          variant="premium"
          className="shadow-primary/25 h-11 rounded-full px-8 text-sm shadow-lg sm:h-12 sm:px-10 sm:text-base"
          aria-label="Começar teste grátis de 14 dias"
          asChild
        >
          <Link to="/login">
            Começar Teste Grátis <ArrowRight className="ml-2 size-4 sm:size-5" />
          </Link>
        </Button>
      </motion.div>
    </motion.div>
  )
})
