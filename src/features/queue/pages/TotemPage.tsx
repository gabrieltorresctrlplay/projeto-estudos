import { useCallback, useEffect, useRef, useState } from 'react'
import {
  queueManagementService,
  realtimeService,
  ticketService,
} from '@/features/queue/services/queueService'
import { trackingService } from '@/features/queue/services/trackingService'
import type { Queue, ServiceCategory, Ticket as TicketType } from '@/features/queue/types/queue'
import { AnimatePresence, motion } from 'framer-motion'
import { Hand, Loader2, UserCheck, Users } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'

const IDLE_TIMEOUT_MS = 20000

/**
 * TotemPage - Zen Self-Service Kiosk
 *
 * Design Philosophy:
 * - Calm in chaos. Queues are stressful; the interface is the antidote.
 * - Touch is intimate. Make every tap feel intentional and rewarding.
 * - Typography breathes. Give the numbers room to exist.
 */
export default function TotemPage() {
  const { queueId } = useParams<{ queueId: string }>()
  const navigate = useNavigate()

  const [queue, setQueue] = useState<Queue | null>(null)
  const [categories, setCategories] = useState<ServiceCategory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isEmitting, setIsEmitting] = useState(false)
  const [emittedTicket, setEmittedTicket] = useState<TicketType | null>(null)
  const [trackingUrl, setTrackingUrl] = useState<string | null>(null)
  const [waitingCount, setWaitingCount] = useState(0)
  const [screen, setScreen] = useState<'welcome' | 'selection'>('welcome')
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const geralCategory = categories.find((c) => c.prefix === 'A') || categories[0]

  const resetIdleTimer = useCallback(() => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current)
    if (screen === 'selection' && !emittedTicket) {
      idleTimerRef.current = setTimeout(() => setScreen('welcome'), IDLE_TIMEOUT_MS)
    }
  }, [screen, emittedTicket])

  useEffect(() => {
    if (screen === 'selection') resetIdleTimer()
    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current)
    }
  }, [screen, emittedTicket, resetIdleTimer])

  useEffect(() => {
    if (!queueId) return

    const loadData = async () => {
      const [queueRes, categoriesRes] = await Promise.all([
        queueManagementService.getQueue(queueId),
        queueManagementService.getCategories(queueId),
      ])
      if (queueRes.data) setQueue(queueRes.data)
      if (categoriesRes.data) setCategories(categoriesRes.data)
      setIsLoading(false)
    }

    loadData()

    // Subscribe to waiting queue and count tickets
    const unsubscribe = realtimeService.subscribeToWaitingQueue(queueId, (tickets) => {
      setWaitingCount(tickets.length)
    })
    return () => unsubscribe()
  }, [queueId])

  const handleEmitTicket = async (isPriority: boolean) => {
    if (!queueId || !geralCategory) return

    setIsEmitting(true)
    const { ticket, error } = await ticketService.emitTicket({
      queueId,
      categoryId: geralCategory.id,
      isPriority,
    })

    if (error) {
      toast.error('Erro ao emitir senha')
      setIsEmitting(false)
      return
    }

    if (ticket) {
      const { token } = await trackingService.addTrackingToken(queueId, ticket.id)
      if (token) setTrackingUrl(trackingService.getTrackingUrl(token))

      setEmittedTicket(ticket)
      setTimeout(() => {
        setEmittedTicket(null)
        setTrackingUrl(null)
        setScreen('welcome')
      }, 12000)
    }
    setIsEmitting(false)
  }

  if (isLoading) {
    return (
      <div className="bg-background flex h-screen items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          className="text-muted-foreground"
        >
          <Loader2 className="h-12 w-12 animate-spin" />
        </motion.div>
      </div>
    )
  }

  if (!queue) {
    return (
      <div className="bg-background text-foreground flex h-screen flex-col items-center justify-center">
        <span className="text-muted-foreground text-lg">Fila não encontrada</span>
        <button
          onClick={() => navigate(-1)}
          className="text-primary mt-4 text-sm underline"
        >
          Voltar
        </button>
      </div>
    )
  }

  return (
    <div className="bg-background text-foreground relative flex h-screen flex-col overflow-hidden select-none">
      <AnimatePresence mode="wait">
        {/* Screen 1: Welcome - Pure zen */}
        {screen === 'welcome' && (
          <motion.div
            key="welcome"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.3 } }}
            transition={{ duration: 0.6 }}
            className="flex h-full flex-col items-center justify-center"
            onClick={() => setScreen('selection')}
          >
            <motion.div
              className="flex flex-col items-center text-center"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {/* Gentle pulsing icon */}
              <motion.div
                animate={{
                  scale: [1, 1.04, 1],
                  opacity: [0.6, 1, 0.6],
                }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                className="text-primary mb-16"
              >
                <Hand
                  className="h-24 w-24"
                  strokeWidth={1}
                />
              </motion.div>

              <h1 className="text-foreground text-6xl font-light tracking-tight md:text-7xl">
                Retire sua senha
              </h1>

              <p className="text-muted-foreground/60 mt-8 text-xl font-light">
                Toque em qualquer lugar
              </p>

              {/* Subtle queue count */}
              {waitingCount > 0 && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.4 }}
                  className="text-muted-foreground mt-24 text-sm"
                >
                  {waitingCount} {waitingCount === 1 ? 'pessoa' : 'pessoas'} aguardando
                </motion.p>
              )}
            </motion.div>
          </motion.div>
        )}

        {/* Screen 2: Selection - Two massive touch targets */}
        {screen === 'selection' && (
          <motion.div
            key="selection"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="flex h-full flex-col"
          >
            {/* Minimal header */}
            <header className="px-12 pt-12 pb-8 text-center">
              <motion.h1
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 0.5 }}
                className="text-muted-foreground text-sm font-medium tracking-[0.2em] uppercase"
              >
                {queue.name}
              </motion.h1>
            </header>

            {/* Two massive buttons - the only choice */}
            <main className="flex flex-1 items-center justify-center gap-8 px-12 pb-12">
              {/* Regular Service */}
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => handleEmitTicket(false)}
                disabled={isEmitting}
                className="bg-card hover:bg-muted/50 group flex h-[70vh] flex-1 flex-col items-center justify-center rounded-[2rem] border transition-all duration-300"
              >
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="flex flex-col items-center"
                >
                  <Users
                    className="text-muted-foreground mb-8 h-20 w-20"
                    strokeWidth={1}
                  />
                  <span className="text-foreground text-4xl font-light tracking-tight">Geral</span>
                  <span className="text-muted-foreground/60 mt-4 text-lg font-light">
                    Atendimento comum
                  </span>
                </motion.div>
              </motion.button>

              {/* Priority Service */}
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => handleEmitTicket(true)}
                disabled={isEmitting}
                className="border-primary/30 bg-primary/5 hover:bg-primary/10 group flex h-[70vh] flex-1 flex-col items-center justify-center rounded-[2rem] border transition-all duration-300"
              >
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="flex flex-col items-center"
                >
                  <UserCheck
                    className="text-primary mb-8 h-20 w-20"
                    strokeWidth={1}
                  />
                  <span className="text-primary text-4xl font-light tracking-tight">
                    Preferencial
                  </span>
                  <span className="text-muted-foreground/60 mt-4 text-lg font-light">
                    Idosos, gestantes, PCD
                  </span>
                </motion.div>
              </motion.button>
            </main>

            {/* Loading overlay */}
            {isEmitting && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-background/80 fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm"
              >
                <Loader2 className="text-primary h-16 w-16 animate-spin" />
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success Modal - Ticket issued */}
      <AnimatePresence>
        {emittedTicket && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="bg-background fixed inset-0 z-50 flex items-center justify-center"
            onClick={() => {
              setEmittedTicket(null)
              setTrackingUrl(null)
              setScreen('welcome')
            }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="flex flex-col items-center text-center"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Success indicator - minimal */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring' }}
                className="text-primary mb-12"
              >
                <svg
                  className="h-16 w-16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    className="text-primary/20"
                  />
                  <motion.path
                    d="M8 12l2.5 2.5L16 9"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ delay: 0.4, duration: 0.4 }}
                  />
                </svg>
              </motion.div>

              {/* THE NUMBER - Absolute protagonist */}
              <motion.div
                className="relative"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <span className="text-primary block text-[clamp(6rem,18vw,14rem)] leading-none font-black tracking-tighter">
                  {emittedTicket.fullCode}
                </span>
              </motion.div>

              {/* Type indicator */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                transition={{ delay: 0.5 }}
                className="text-muted-foreground mt-8 text-lg font-light"
              >
                {emittedTicket.isPriority ? 'Atendimento Preferencial' : 'Atendimento Geral'}
              </motion.p>

              {/* QR Code for tracking */}
              {trackingUrl && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="mt-12 flex flex-col items-center"
                >
                  <div className="rounded-2xl bg-white p-4">
                    <QRCodeSVG
                      value={trackingUrl}
                      size={120}
                      level="M"
                    />
                  </div>
                  <p className="text-muted-foreground/60 mt-4 text-sm font-light">
                    Escaneie para acompanhar
                  </p>
                </motion.div>
              )}

              {/* Instruction */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.3 }}
                transition={{ delay: 0.8 }}
                className="text-muted-foreground mt-16 text-sm"
              >
                Aguarde sua chamada no painel
              </motion.p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
