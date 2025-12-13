import { useAnimationVariants } from '@/hooks'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

import { Button } from '@/components/ui/button'

/**
 * Hero section component for the home page
 */
export function Hero() {
  const { containerVariants, itemVariants } = useAnimationVariants()

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <motion.h1
        variants={itemVariants}
        className="from-foreground to-foreground/50 bg-linear-to-br bg-clip-text text-5xl font-extrabold tracking-tight text-balance text-transparent md:text-7xl"
      >
        Potencialize sua <br />
        <span className="from-primary to-chart-3 bg-linear-to-r bg-clip-text text-transparent">
          produtividade global.
        </span>
      </motion.h1>

      <motion.p
        variants={itemVariants}
        className="text-muted-foreground mx-auto max-w-2xl text-lg text-balance md:text-xl"
      >
        A plataforma completa para escalar operações, otimizar recursos e conectar equipes em tempo
        real. Simples, seguro e eficiente.
      </motion.p>

      <motion.div
        variants={itemVariants}
        className="flex flex-wrap justify-center gap-4 pt-4"
      >
        <Button
          size="lg"
          className="h-12 rounded-full px-8 text-base shadow-lg transition-all hover:scale-105 hover:shadow-xl"
          aria-label="Começar teste grátis de 14 dias"
        >
          Começar Teste Grátis <ArrowRight className="ml-2 size-5" />
        </Button>
        <Button
          size="lg"
          variant="outline"
          className="h-12 rounded-full px-8 text-base"
          aria-label="Agendar conversa com equipe de vendas"
        >
          Falar com Vendas
        </Button>
      </motion.div>
    </motion.div>
  )
}
