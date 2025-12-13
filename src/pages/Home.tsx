import { motion, type Variants } from 'framer-motion'
import { ArrowRight, BarChart3, ShieldCheck, Zap } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { AnimatedBlurBackground } from '@/components/AnimatedBlurBackground'

export default function Home() {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  }

  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
      },
    },
  }

  return (
    <>
      <div className="relative z-10 flex flex-col justify-center pt-20">
        {/* Hero Section */}
        <main className="mx-auto flex max-w-5xl flex-col items-center justify-center px-4 text-center">
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
              A plataforma completa para escalar operações, otimizar recursos e conectar equipes em
              tempo real. Simples, seguro e eficiente.
            </motion.p>

            <motion.div
              variants={itemVariants}
              className="flex flex-wrap justify-center gap-4 pt-4"
            >
              <Button
                size="lg"
                className="h-12 rounded-full px-8 text-base shadow-lg transition-all hover:scale-105 hover:shadow-xl"
              >
                Começar Teste Grátis <ArrowRight className="ml-2 size-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-12 rounded-full px-8 text-base"
              >
                Falar com Vendas
              </Button>
            </motion.div>
          </motion.div>

          {/* Floating Elements / Grid */}
          <div className="mt-20 grid w-full grid-cols-1 gap-8 md:grid-cols-3">
            {[
              {
                icon: BarChart3,
                title: 'Analytics em Tempo Real',
                desc: 'Tome decisões baseadas em dados com dashboards intuitivos e precisos.',
              },
              {
                icon: ShieldCheck,
                title: 'Segurança Corporativa',
                desc: 'Proteção de dados nível enterprise e conformidade total com LGPD.',
              },
              {
                icon: Zap,
                title: 'Automação Inteligente',
                desc: 'Fluxos de trabalho automatizados para eliminar tarefas repetitivas.',
              },
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -5 }}
                className="bg-card/50 cursor-default rounded-2xl border p-6 shadow-sm backdrop-blur-sm transition-all hover:shadow-md"
              >
                <div className="bg-primary/10 text-primary mb-4 flex size-12 items-center justify-center rounded-full">
                  <feature.icon className="size-6" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </main>
      </div>

      {/* Animated Blur Background */}
      <AnimatedBlurBackground />

      {/* Static Grid Overlay (Optional texturizer) */}
      <div className="pointer-events-none fixed inset-0 -z-20 h-full w-full bg-[linear-gradient(to_right,var(--color-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-border)_1px,transparent_1px)] mask-[radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] bg-size-[14px_24px] opacity-10"></div>
    </>
  )
}
