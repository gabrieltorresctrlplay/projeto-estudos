import { useCallback, useEffect, useRef, useState } from 'react'
import {
  queueManagementService,
  realtimeService,
  ticketService,
} from '@/features/queue/services/queueService'
import type { Queue, ServiceCategory, Ticket as TicketType } from '@/features/queue/types/queue'
import { Button } from '@/shared/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card'
import { FeatureIcon } from '@/shared/components/ui/feature-icon'
import { AnimatePresence, motion } from 'framer-motion'
import { AlertCircle, ArrowLeft, Hand, Loader2, Ticket, UserCheck, Users } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'

const IDLE_TIMEOUT_MS = 15000 // 15 segundos de inatividade volta para tela inicial

export default function TotemPage() {
  const { queueId } = useParams<{ queueId: string }>()
  const navigate = useNavigate()

  const [queue, setQueue] = useState<Queue | null>(null)
  const [categories, setCategories] = useState<ServiceCategory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isEmitting, setIsEmitting] = useState(false)
  const [emittedTicket, setEmittedTicket] = useState<TicketType | null>(null)
  const [waitingCount, setWaitingCount] = useState(0)

  // Estado da tela: 'welcome' ou 'selection'
  const [screen, setScreen] = useState<'welcome' | 'selection'>('welcome')
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Pegar a categoria "Atendimento Geral" (ou a primeira)
  const geralCategory = categories.find((c) => c.prefix === 'A') || categories[0]

  // Reset do timer de inatividade
  const resetIdleTimer = useCallback(() => {
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current)
    }
    if (screen === 'selection' && !emittedTicket) {
      idleTimerRef.current = setTimeout(() => {
        setScreen('welcome')
      }, IDLE_TIMEOUT_MS)
    }
  }, [screen, emittedTicket])

  // Ao mudar de tela ou fechar modal, resetar timer
  useEffect(() => {
    resetIdleTimer()
    return () => {
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current)
      }
    }
  }, [screen, emittedTicket, resetIdleTimer])

  useEffect(() => {
    if (!queueId) return

    const loadQueueData = async () => {
      setIsLoading(true)
      const [queueResult, categoriesResult] = await Promise.all([
        queueManagementService.getQueue(queueId),
        queueManagementService.getCategories(queueId),
      ])

      if (queueResult.data) setQueue(queueResult.data)
      if (categoriesResult.data) setCategories(categoriesResult.data)
      setIsLoading(false)
    }

    loadQueueData()

    const unsubscribe = realtimeService.subscribeToWaitingQueue(queueId, (tickets) => {
      setWaitingCount(tickets.length)
    })

    return () => unsubscribe()
  }, [queueId])

  const handleEmitTicket = async (isPriority = false) => {
    if (!queueId || !geralCategory) return

    setIsEmitting(true)
    const { ticket, error } = await ticketService.emitTicket({
      queueId,
      categoryId: geralCategory.id,
      isPriority,
    })

    if (error) {
      toast.error('Erro ao emitir senha', { description: error.message })
      setIsEmitting(false)
      return
    }

    if (ticket) {
      setEmittedTicket(ticket)
      // Após mostrar o ticket, voltar para welcome
      setTimeout(() => {
        setEmittedTicket(null)
        setScreen('welcome')
      }, 5000)
    }
    setIsEmitting(false)
  }

  const handleStartSelection = () => {
    setScreen('selection')
  }

  if (isLoading) {
    return (
      <div className="bg-background flex h-screen items-center justify-center">
        <Loader2 className="text-primary h-16 w-16 animate-spin" />
      </div>
    )
  }

  if (!queue) {
    return (
      <div className="bg-background text-foreground flex h-screen flex-col items-center justify-center gap-6 p-8">
        <AlertCircle className="text-destructive h-24 w-24" />
        <h1 className="text-4xl font-bold">Fila não encontrada</h1>
        <Button
          size="lg"
          variant="outline"
          onClick={() => navigate(-1)}
          className="text-xl"
        >
          <ArrowLeft className="mr-3 h-6 w-6" />
          Voltar
        </Button>
      </div>
    )
  }

  return (
    <div className="bg-background text-foreground relative flex min-h-screen flex-col overflow-hidden">
      <AnimatePresence mode="wait">
        {/* Tela 1: Boas-vindas */}
        {screen === 'welcome' && (
          <motion.div
            key="welcome"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex min-h-screen flex-col items-center justify-center p-8"
            onClick={handleStartSelection}
          >
            <motion.div
              className="flex flex-col items-center text-center"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <FeatureIcon
                icon={Hand}
                className="mb-8 h-40 w-40"
                iconClassName="h-20 w-20"
              />

              <h1 className="from-foreground to-foreground/70 bg-linear-to-r bg-clip-text text-5xl font-bold tracking-tight text-transparent md:text-7xl">
                Bem-vindo!
              </h1>

              <p className="text-muted-foreground mt-6 text-2xl md:text-3xl">
                Toque na tela para retirar sua senha
              </p>

              <motion.div
                className="mt-12"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              >
                <Button
                  size="lg"
                  className="h-20 px-16 text-2xl font-bold"
                >
                  Iniciar
                </Button>
              </motion.div>

              <p className="text-muted-foreground mt-16 text-lg">
                <span className="text-foreground font-bold">{waitingCount}</span> pessoas na fila
              </p>
            </motion.div>
          </motion.div>
        )}

        {/* Tela 2: Seleção de tipo de atendimento */}
        {screen === 'selection' && (
          <motion.div
            key="selection"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex min-h-screen flex-col"
          >
            {/* Header */}
            <header className="relative z-10 px-8 pt-12 pb-6 text-center">
              <h1 className="from-foreground to-foreground/70 bg-linear-to-r bg-clip-text text-4xl font-bold tracking-tight text-transparent md:text-5xl">
                {queue.name}
              </h1>
              <p className="text-muted-foreground mt-3 text-xl">Escolha o tipo de atendimento</p>
            </header>

            {/* Main Content - 2 Big Buttons */}
            <main className="relative z-10 flex flex-1 items-center justify-center px-8 py-4">
              <div className="grid h-[65vh] w-full max-w-6xl gap-8 md:grid-cols-2">
                {/* Atendimento Geral */}
                <motion.div
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  className="h-full"
                >
                  <Card
                    className="group hover:border-primary/50 flex h-full cursor-pointer flex-col overflow-hidden shadow-lg transition-all hover:shadow-2xl"
                    onClick={() => handleEmitTicket(false)}
                  >
                    <CardHeader className="flex flex-1 flex-col items-center justify-center text-center">
                      <div className="mb-8 flex justify-center">
                        <FeatureIcon
                          icon={Users}
                          className="h-32 w-32"
                          iconClassName="h-16 w-16"
                        />
                      </div>
                      <CardTitle className="text-5xl font-bold">Atendimento Geral</CardTitle>
                      <CardDescription className="mt-4 text-2xl">
                        Senha comum para todos os serviços
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-8">
                      <Button
                        className="h-20 w-full text-2xl font-bold active:scale-95"
                        size="lg"
                        disabled={isEmitting}
                      >
                        {isEmitting ? (
                          <Loader2 className="h-8 w-8 animate-spin" />
                        ) : (
                          'Retirar Senha'
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Atendimento Preferencial */}
                <motion.div
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  className="h-full"
                >
                  <Card
                    className="group hover:border-primary/50 flex h-full cursor-pointer flex-col overflow-hidden shadow-lg transition-all hover:shadow-2xl"
                    onClick={() => handleEmitTicket(true)}
                  >
                    <CardHeader className="flex flex-1 flex-col items-center justify-center text-center">
                      <div className="mb-8 flex justify-center">
                        <FeatureIcon
                          icon={UserCheck}
                          className="h-32 w-32"
                          iconClassName="h-16 w-16"
                        />
                      </div>
                      <CardTitle className="text-5xl font-bold">Atendimento Preferencial</CardTitle>
                      <CardDescription className="mt-4 text-2xl">
                        Idosos, gestantes, PcD e lactantes
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-8">
                      <Button
                        variant="secondary"
                        className="h-20 w-full text-2xl font-bold active:scale-95"
                        size="lg"
                        disabled={isEmitting}
                      >
                        {isEmitting ? (
                          <Loader2 className="h-8 w-8 animate-spin" />
                        ) : (
                          'Retirar Senha'
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </main>

            {/* Footer Info */}
            <footer className="p-6 text-center">
              <p className="text-muted-foreground text-lg">
                <span className="text-foreground font-bold">{waitingCount}</span> pessoas aguardando
              </p>
            </footer>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Ticket Success Modal */}
      <AnimatePresence>
        {emittedTicket && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="bg-background/95 fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md"
            onClick={() => {
              setEmittedTicket(null)
              setScreen('welcome')
            }}
          >
            <motion.div
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <Card className="overflow-hidden shadow-2xl">
                <CardHeader className="text-center">
                  <div className="mb-4 flex justify-center">
                    <FeatureIcon
                      icon={Ticket}
                      className="h-20 w-20"
                    />
                  </div>
                  <CardTitle className="text-3xl">Senha Retirada!</CardTitle>
                  <CardDescription className="text-xl">
                    {emittedTicket.isPriority ? 'Atendimento Preferencial' : 'Atendimento Geral'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 text-center">
                  <div className="bg-muted rounded-2xl px-8 py-6">
                    <span className="text-primary block text-8xl font-black tracking-tighter">
                      {emittedTicket.fullCode}
                    </span>
                  </div>

                  {emittedTicket.isPriority && (
                    <div className="bg-secondary text-secondary-foreground inline-block rounded-full px-6 py-2 text-lg font-bold">
                      Prioridade
                    </div>
                  )}

                  <p className="text-muted-foreground text-lg">
                    Por favor, aguarde ser chamado no painel.
                  </p>

                  <Button
                    size="lg"
                    className="h-14 w-full text-xl"
                    onClick={() => {
                      setEmittedTicket(null)
                      setScreen('welcome')
                    }}
                  >
                    Fechar
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
