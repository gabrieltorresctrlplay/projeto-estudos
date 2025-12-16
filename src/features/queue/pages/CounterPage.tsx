import { useEffect, useState } from 'react'
import { useOrganizationContext } from '@/features/organization/context/OrganizationContext'
import {
  counterService,
  queueManagementService,
  realtimeService,
  ticketService,
} from '@/features/queue/services/queueService'
import type { Counter, Queue, Ticket } from '@/features/queue/types/queue'
import { cn } from '@/shared/lib/utils'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowLeft,
  Check,
  Loader2,
  Megaphone,
  Pause,
  Play,
  RotateCcw,
  Timer,
  UserX,
} from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'

/**
 * CounterPage - Zen Operator Interface
 *
 * Design Philosophy:
 * - One focus. The current number is everything.
 * - Calm actions. No visual noise, just clear intent.
 * - Breathing room. The operator's mind should feel spacious.
 */
export default function CounterPage() {
  const { queueId, counterId } = useParams<{ queueId: string; counterId: string }>()
  const navigate = useNavigate()
  const { user } = useOrganizationContext()

  const [queue, setQueue] = useState<Queue | null>(null)
  const [counter, setCounter] = useState<Counter | null>(null)
  const [waitingTickets, setWaitingTickets] = useState<Ticket[]>([])
  const [currentTicket, setCurrentTicket] = useState<Ticket | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [hasPermission, setHasPermission] = useState(true)

  useEffect(() => {
    if (!queueId || !counterId || !user?.uid) return

    const loadData = async () => {
      const [queueRes, countersRes] = await Promise.all([
        queueManagementService.getQueue(queueId),
        counterService.getCounters(queueId),
      ])

      if (queueRes.data) setQueue(queueRes.data)
      if (countersRes.data) {
        const myCounter = countersRes.data.find((c) => c.id === counterId)
        if (myCounter) {
          setCounter(myCounter)
          const canOperate = !myCounter.assignedUserId || myCounter.assignedUserId === user.uid
          setHasPermission(canOperate)
        }
      }
      setIsLoading(false)
    }

    loadData()

    const unsubWaiting = realtimeService.subscribeToWaitingQueue(queueId, setWaitingTickets)
    const unsubCounters = realtimeService.subscribeToCounters(queueId, (counters) => {
      const myCounter = counters.find((c) => c.id === counterId)
      if (myCounter) setCounter(myCounter)
    })

    return () => {
      unsubWaiting()
      unsubCounters()
    }
  }, [queueId, counterId, user?.uid])

  useEffect(() => {
    if (!queueId || !counter?.currentTicketId) {
      setCurrentTicket(null)
      return
    }

    const unsubscribe = realtimeService.subscribeToCalledTickets(queueId, 10, (tickets) => {
      const current = tickets.find((t) => t.id === counter.currentTicketId)
      setCurrentTicket(current || null)
    })

    return () => unsubscribe()
  }, [queueId, counter?.currentTicketId])

  const updateStatus = async (status: 'open' | 'paused' | 'closed') => {
    if (!queueId || !counterId) return
    setIsProcessing(true)
    await counterService.updateStatus(queueId, counterId, status)
    setIsProcessing(false)
  }

  const handleCallNext = async () => {
    if (!queueId || !counterId || !user?.uid) return
    setIsProcessing(true)
    const { ticket, error } = await ticketService.callNextTicket(
      queueId,
      counterId,
      counter?.name || 'Guichê',
      user.uid,
    )
    if (error) toast.error('Erro ao chamar')
    else if (ticket) toast.success(`Chamando ${ticket.fullCode}`)
    setIsProcessing(false)
  }

  const handleRecall = async () => {
    if (!queueId || !currentTicket) return
    setIsProcessing(true)
    const { error } = await ticketService.recallTicket(queueId, currentTicket.id)
    if (error) toast.error('Erro ao rechamar')
    else toast.info('Rechamando...')
    setIsProcessing(false)
  }

  const handleFinish = async (status: 'finished' | 'no_show') => {
    if (!queueId || !counterId || !currentTicket) return
    setIsProcessing(true)
    const { error } = await ticketService.finishTicket(queueId, counterId, currentTicket.id, status)
    if (error) toast.error('Erro ao finalizar')
    setIsProcessing(false)
  }

  const handleSchedulePause = async () => {
    if (!queueId || !counterId) return
    setIsProcessing(true)
    if (counter?.pauseAfterCurrent) {
      await counterService.cancelScheduledPause(queueId, counterId)
      toast.success('Pausa cancelada')
    } else {
      await counterService.schedulePauseAfterCurrent(queueId, counterId)
      toast.info('Pausa agendada')
    }
    setIsProcessing(false)
  }

  const isOpen = counter?.status === 'open'
  const isPaused = counter?.status === 'paused'

  if (isLoading) {
    return (
      <div className="bg-background flex h-screen items-center justify-center">
        <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!hasPermission) {
    return (
      <div className="bg-background text-foreground flex h-screen flex-col items-center justify-center gap-4">
        <span className="text-muted-foreground">
          Este guichê está atribuído a outro funcionário
        </span>
        <button
          onClick={() => navigate(-1)}
          className="text-primary text-sm underline"
        >
          Voltar
        </button>
      </div>
    )
  }

  return (
    <div className="bg-background text-foreground flex h-screen flex-col">
      {/* Minimal Header */}
      <header className="border-border/50 flex items-center justify-between border-b px-8 py-4">
        <div className="flex items-center gap-6">
          <button
            onClick={() => navigate(-1)}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-foreground text-xl font-medium">{counter?.name}</h1>
            <p className="text-muted-foreground/60 text-sm">{queue?.name}</p>
          </div>
        </div>

        {/* Status Toggle - Minimal pills */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => updateStatus('open')}
            disabled={isProcessing}
            className={cn(
              'flex items-center gap-2 rounded-full px-4 py-2 text-sm transition-all',
              isOpen ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <Play className="h-4 w-4" />
            Aberto
          </button>
          <button
            onClick={() => updateStatus('paused')}
            disabled={isProcessing}
            className={cn(
              'flex items-center gap-2 rounded-full px-4 py-2 text-sm transition-all',
              isPaused
                ? 'bg-amber-500/10 text-amber-600'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <Pause className="h-4 w-4" />
            Pausa
          </button>

          {/* Schedule pause button */}
          {isOpen && currentTicket && (
            <button
              onClick={handleSchedulePause}
              disabled={isProcessing}
              className={cn(
                'flex items-center gap-2 rounded-full px-4 py-2 text-sm transition-all',
                counter?.pauseAfterCurrent
                  ? 'bg-destructive/10 text-destructive'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <Timer className="h-4 w-4" />
              {counter?.pauseAfterCurrent ? 'Cancelar' : 'Pausar após'}
            </button>
          )}
        </div>
      </header>

      {/* Main Content - Two columns */}
      <main className="flex flex-1 overflow-hidden">
        {/* Left: Current Service - 65% */}
        <section className="flex flex-[6.5] flex-col items-center justify-center p-12">
          <AnimatePresence mode="wait">
            {currentTicket ? (
              <motion.div
                key={currentTicket.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex flex-col items-center text-center"
              >
                {/* Status indicator */}
                <span className="text-muted-foreground mb-4 text-sm font-light tracking-widest uppercase">
                  {currentTicket.status === 'calling' ? 'Chamando' : 'Atendendo'}
                </span>

                {/* THE NUMBER */}
                <motion.span
                  className="text-primary text-[clamp(5rem,15vw,12rem)] leading-none font-black tracking-tighter"
                  animate={currentTicket.status === 'calling' ? { scale: [1, 1.02, 1] } : {}}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {currentTicket.fullCode}
                </motion.span>

                {/* Priority badge */}
                {currentTicket.isPriority && (
                  <span className="text-primary/70 mt-4 text-sm font-light tracking-wide">
                    Atendimento Preferencial
                  </span>
                )}

                {/* Action buttons - Floating at bottom */}
                <div className="mt-16 flex items-center gap-4">
                  {/* Recall */}
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={handleRecall}
                    disabled={isProcessing}
                    className="text-muted-foreground hover:text-foreground hover:bg-muted flex h-14 w-14 items-center justify-center rounded-full transition-all"
                  >
                    <RotateCcw className="h-6 w-6" />
                  </motion.button>

                  {/* Finish - Primary action */}
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleFinish('finished')}
                    disabled={isProcessing}
                    className="bg-primary text-primary-foreground flex h-20 w-20 items-center justify-center rounded-full shadow-lg transition-all hover:shadow-xl"
                  >
                    <Check className="h-8 w-8" />
                  </motion.button>

                  {/* No show */}
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleFinish('no_show')}
                    disabled={isProcessing}
                    className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 flex h-14 w-14 items-center justify-center rounded-full transition-all"
                  >
                    <UserX className="h-6 w-6" />
                  </motion.button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center text-center"
              >
                {/* No current ticket - Show call next */}
                {isOpen && waitingTickets.length > 0 ? (
                  <>
                    <span className="text-muted-foreground/50 mb-8 text-sm">
                      {waitingTickets.length} {waitingTickets.length === 1 ? 'pessoa' : 'pessoas'}{' '}
                      aguardando
                    </span>

                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      onClick={handleCallNext}
                      disabled={isProcessing}
                      className="bg-primary text-primary-foreground group flex h-32 w-32 flex-col items-center justify-center rounded-full shadow-xl transition-all hover:shadow-2xl"
                    >
                      <Megaphone className="h-10 w-10" />
                      <span className="mt-2 text-sm font-medium">Chamar</span>
                    </motion.button>

                    <p className="text-muted-foreground/40 mt-8 text-sm">
                      Próximo: {waitingTickets[0]?.fullCode}
                    </p>
                  </>
                ) : isOpen ? (
                  <>
                    <span className="text-muted-foreground/30 text-8xl font-light">—</span>
                    <span className="text-muted-foreground/50 mt-8 text-lg font-light">
                      Fila vazia
                    </span>
                  </>
                ) : (
                  <>
                    <Pause className="text-muted-foreground/30 h-16 w-16" />
                    <span className="text-muted-foreground/50 mt-8 text-lg font-light">
                      Guichê em pausa
                    </span>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* Right: Queue - 35% */}
        <aside className="border-border/30 flex flex-[3.5] flex-col border-l">
          <header className="px-6 py-6">
            <h2 className="text-muted-foreground/60 text-xs font-medium tracking-[0.15em] uppercase">
              Fila de Espera
            </h2>
          </header>

          <div className="flex-1 overflow-y-auto px-4 pb-6">
            {waitingTickets.length === 0 ? (
              <div className="text-muted-foreground/30 flex h-full items-center justify-center text-sm">
                Nenhuma senha aguardando
              </div>
            ) : (
              <div className="space-y-2">
                {waitingTickets.slice(0, 10).map((ticket, index) => (
                  <motion.div
                    key={ticket.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1 - index * 0.08, x: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="hover:bg-muted/30 flex items-center justify-between rounded-xl p-4 transition-colors"
                  >
                    <span
                      className="text-2xl font-bold tracking-tight"
                      style={{ color: ticket.categoryColor }}
                    >
                      {ticket.fullCode}
                    </span>
                    {ticket.isPriority && <span className="text-primary/60 text-xs">P</span>}
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Queue stats */}
          <footer className="border-border/30 border-t px-6 py-4">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground/60">Atendidos hoje</span>
              <span className="text-foreground font-medium">
                {counter?.ticketsServedToday || 0}
              </span>
            </div>
          </footer>
        </aside>
      </main>

      {/* Processing overlay */}
      {isProcessing && (
        <div className="bg-background/50 fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
          <Loader2 className="text-primary h-8 w-8 animate-spin" />
        </div>
      )}
    </div>
  )
}
