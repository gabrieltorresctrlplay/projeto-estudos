import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Loader2, Volume2, VolumeX } from 'lucide-react'
import { useParams } from 'react-router-dom'

import type { Queue, Ticket } from '@/types/queue'
import { queueService } from '@/lib/queueService'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

export default function MonitorPage() {
  const { queueId } = useParams<{ queueId: string }>()

  const [queue, setQueue] = useState<Queue | null>(null)
  const [calledTickets, setCalledTickets] = useState<Ticket[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [audioEnabled, setAudioEnabled] = useState(true)
  const lastCalledRef = useRef<string | null>(null)

  useEffect(() => {
    if (!queueId) return

    const loadQueue = async () => {
      const { data } = await queueService.getQueue(queueId)
      if (data) setQueue(data)
      setIsLoading(false)
    }

    loadQueue()

    // Subscribe para tickets chamados
    const unsubscribe = queueService.subscribeToCalledTickets(
      queueId,
      5, // Mostrar últimas 5 chamadas
      (tickets) => {
        setCalledTickets(tickets)

        // Chamar áudio se novo ticket
        if (tickets.length > 0 && tickets[0].id !== lastCalledRef.current) {
          lastCalledRef.current = tickets[0].id
          if (audioEnabled) {
            playCallAudio(tickets[0])
          }
        }
      },
    )

    return () => unsubscribe()
  }, [queueId, audioEnabled])

  const playCallAudio = (ticket: Ticket) => {
    // Usar Web Speech API para TTS
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(
        `Senha ${ticket.fullCode.split('').join(' ')}, ${ticket.counterName}`,
      )
      utterance.lang = 'pt-BR'
      utterance.rate = 0.9
      speechSynthesis.speak(utterance)
    }
  }

  if (isLoading) {
    return (
      <div className="bg-queue-bg flex h-screen items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin text-white" />
      </div>
    )
  }

  const currentTicket = calledTickets[0]
  const previousTickets = calledTickets.slice(1)

  return (
    <div className="from-queue-bg via-info/10 to-queue-bg relative min-h-screen overflow-hidden bg-linear-to-br p-8 text-white">
      {/* Ambient Background Effects */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="bg-primary/5 absolute -top-1/3 left-1/2 h-[600px] w-[600px] -translate-x-1/2 animate-pulse rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_0%,_var(--queue-bg)_70%)]" />
      </div>

      {/* Botão de Áudio */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-6 right-6 z-10 rounded-full bg-white/5 text-white/60 backdrop-blur-sm transition-all hover:bg-white/10 hover:text-white"
        onClick={() => setAudioEnabled(!audioEnabled)}
      >
        {audioEnabled ? <Volume2 className="h-6 w-6" /> : <VolumeX className="h-6 w-6" />}
      </Button>

      {/* Header */}
      <div className="relative mb-16 text-center">
        <p className="text-sm font-medium tracking-[0.3em] text-white/40 uppercase">
          Painel de Chamada
        </p>
        <h1 className="mt-2 bg-linear-to-r from-white to-white/60 bg-clip-text text-4xl font-light tracking-wider text-transparent">
          {queue?.name || 'Aguardando...'}
        </h1>
      </div>

      {/* Senha Atual */}
      <AnimatePresence mode="wait">
        {currentTicket ? (
          <motion.div
            key={currentTicket.id}
            initial={{ scale: 0.8, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: -50 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            className="relative mb-20 text-center"
          >
            {/* Glow Effect Behind Ticket */}
            <div
              className="absolute top-1/2 left-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
              style={{ backgroundColor: currentTicket.categoryColor + '30' }}
            />

            <div
              className="relative mx-auto mb-6 inline-block rounded-full px-8 py-2.5 text-lg font-medium shadow-lg"
              style={{
                backgroundColor: currentTicket.categoryColor,
                boxShadow: `0 8px 32px ${currentTicket.categoryColor}50`,
              }}
            >
              {currentTicket.categoryName}
            </div>

            <motion.div
              className="text-[10rem] leading-none font-black tracking-widest md:text-[14rem]"
              style={{
                color: currentTicket.categoryColor,
                textShadow: `0 0 60px ${currentTicket.categoryColor}40`,
              }}
              animate={{ scale: [1, 1.015, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            >
              {currentTicket.fullCode}
            </motion.div>

            <div className="mt-10 text-4xl font-light text-white/70">
              <span className="mr-4 text-white/40">→</span>
              <span className="font-medium text-white">{currentTicket.counterName}</span>
            </div>

            {currentTicket.isPriority && (
              <div className="bg-warning text-warning-foreground shadow-warning/30 mt-6 inline-block rounded-full px-6 py-2 text-lg font-medium shadow-lg">
                Atendimento Preferencial
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-16 py-32 text-center"
          >
            <div className="text-6xl font-light text-white/40">Aguardando chamadas...</div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Histórico */}
      {previousTickets.length > 0 && (
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-6 text-center text-lg font-light tracking-widest text-white/40 uppercase">
            Chamadas Anteriores
          </h2>
          <div className="grid grid-cols-4 gap-4">
            {previousTickets.map((ticket, index) => (
              <motion.div
                key={ticket.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={cn(
                  'rounded-2xl border border-white/10 bg-white/5 p-6 text-center backdrop-blur-sm',
                  ticket.status === 'serving' && 'border-success/30 bg-success/10',
                )}
              >
                <div
                  className="text-3xl font-bold"
                  style={{ color: ticket.categoryColor }}
                >
                  {ticket.fullCode}
                </div>
                <div className="mt-2 text-sm text-white/60">{ticket.counterName}</div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Clock */}
      <div className="absolute bottom-8 left-8 text-2xl font-light text-white/40">
        {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
      </div>
    </div>
  )
}
