import { useCallback, useEffect, useRef, useState } from 'react'
import {
  queueManagementService,
  realtimeService,
  ticketService,
} from '@/features/queue/services/queueService'
import { trackingService } from '@/features/queue/services/trackingService'
import type { Queue, ServiceCategory, Ticket as TicketType } from '@/features/queue/types/queue'
import { AnimatePresence, motion } from 'framer-motion'
import { Hand, Loader2, User, Users } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { useParams } from 'react-router-dom'
import { toast } from 'sonner'

const IDLE_TIMEOUT_MS = 20000

export default function TotemPage() {
  const { queueId } = useParams<{ queueId: string }>()

  const [queue, setQueue] = useState<Queue | null>(null)
  const [categories, setCategories] = useState<ServiceCategory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isEmitting, setIsEmitting] = useState(false)
  const [emittedTicket, setEmittedTicket] = useState<TicketType | null>(null)
  const [trackingUrl, setTrackingUrl] = useState<string | null>(null)
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

    loadData()

    // Subscribe to waiting queue (silent)
    const unsubscribe = realtimeService.subscribeToWaitingQueue(queueId, () => {
      // Logic for waitingCount extracted if needed later
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

      // Auto reset after 10s
      setTimeout(() => {
        setEmittedTicket(null)
        setTrackingUrl(null)
        setScreen('welcome')
      }, 10000)
    }
    setIsEmitting(false)
  }

  if (isLoading) {
    return (
      <div className="bg-background flex h-screen items-center justify-center">
        <Loader2 className="text-primary h-12 w-12 animate-spin" />
      </div>
    )
  }

  if (!queue) return null

  return (
    <div className="relative flex h-screen flex-col overflow-hidden bg-slate-50 font-sans select-none">
      <AnimatePresence mode="wait">
        {/* WELCOME SCREEN */}
        {screen === 'welcome' && (
          <motion.div
            key="welcome"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -50 }}
            className="flex h-full cursor-pointer flex-col items-center justify-center bg-white"
            onClick={() => setScreen('selection')}
          >
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              className="mb-12 rounded-full bg-blue-50 p-12"
            >
              <Hand className="h-24 w-24 text-blue-600" />
            </motion.div>

            <h1 className="max-w-2xl px-4 text-center text-4xl font-bold tracking-tight text-slate-900 md:text-6xl">
              Toque para retirar sua senha
            </h1>

            <p className="mt-6 text-xl font-medium text-slate-500">{queue.name}</p>

            <div className="absolute bottom-12 text-sm text-slate-400">Desenvolvido por Oiee</div>
          </motion.div>
        )}

        {/* SELECTION SCREEN */}
        {screen === 'selection' && (
          <motion.div
            key="selection"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="flex h-full flex-col gap-8 p-8 md:p-12"
          >
            <header className="mb-4 text-center">
              <h2 className="text-2xl font-semibold text-slate-700">
                Selecione o tipo de atendimento
              </h2>
            </header>

            <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 md:flex-row md:gap-12">
              {/* GENERAL TICKET */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleEmitTicket(false)}
                disabled={isEmitting}
                className="group relative flex flex-1 flex-col items-center justify-center overflow-hidden rounded-[2.5rem] bg-linear-to-br from-blue-500 to-indigo-600 p-8 text-white shadow-2xl shadow-blue-900/20"
              >
                <div className="absolute top-0 left-0 h-full w-full bg-white/0 transition-colors group-hover:bg-white/10" />
                <div className="mb-8 rounded-full bg-white/20 p-8 backdrop-blur-md">
                  <Users className="h-16 w-16 text-white" />
                </div>
                <span className="text-4xl font-bold tracking-tight">Geral</span>
                <span className="mt-4 text-lg font-medium text-blue-100">Atendimento Comum</span>
              </motion.button>

              {/* PRIORITY TICKET */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleEmitTicket(true)}
                disabled={isEmitting}
                className="group relative flex flex-1 flex-col items-center justify-center overflow-hidden rounded-[2.5rem] bg-linear-to-br from-amber-500 to-orange-600 p-8 text-white shadow-2xl shadow-orange-900/20"
              >
                <div className="absolute top-0 left-0 h-full w-full bg-white/0 transition-colors group-hover:bg-white/10" />
                <div className="mb-8 rounded-full bg-white/20 p-8 backdrop-blur-md">
                  <User className="h-16 w-16 text-white" />
                </div>
                <span className="text-4xl font-bold tracking-tight">Preferencial</span>
                <span className="mt-4 text-lg font-medium text-amber-100">
                  Idosos, Gestantes, PCD
                </span>
              </motion.button>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation()
                setScreen('welcome')
              }}
              className="mx-auto mt-8 px-8 py-4 font-medium text-slate-400 hover:text-slate-600"
            >
              Cancelar
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* TICKET SUCCESS MODAL */}
      <AnimatePresence>
        {emittedTicket && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-6 backdrop-blur-md"
            onClick={() => setEmittedTicket(null)}
          >
            <motion.div
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              className="w-full max-w-md rounded-[2.5rem] bg-white p-8 text-center shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-6 flex justify-center">
                <div className="rounded-full bg-green-100 p-4">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', delay: 0.2 }}
                  >
                    <Hand className="h-10 w-10 rotate-12 text-green-600" />
                  </motion.div>
                </div>
              </div>

              <h2 className="mb-2 text-3xl font-bold text-slate-800">Sua senha é</h2>

              <div className="my-8 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 py-8">
                <span
                  className={`text-7xl font-black tracking-tighter ${emittedTicket.isPriority ? 'text-orange-500' : 'text-blue-600'}`}
                >
                  {emittedTicket.fullCode}
                </span>
                <p className="mt-2 text-sm font-medium tracking-widest text-slate-400 uppercase">
                  {emittedTicket.isPriority ? 'Preferencial' : 'Geral'}
                </p>
              </div>

              {trackingUrl && (
                <div className="mb-6 flex flex-col items-center gap-4">
                  <div className="rounded-xl border bg-white p-3 shadow-sm">
                    <QRCodeSVG
                      value={trackingUrl}
                      size={100}
                    />
                  </div>
                  <p className="text-xs text-slate-400">Escaneie para acompanhar pelo celular</p>
                </div>
              )}

              <p className="font-medium text-slate-500">Aguarde a chamada no monitor</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {isEmitting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/50 backdrop-blur-sm">
          <Loader2 className="h-16 w-16 animate-spin text-blue-600" />
        </div>
      )}
    </div>
  )
}
