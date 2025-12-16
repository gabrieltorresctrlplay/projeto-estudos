import { useEffect, useRef, useState } from 'react'
import {
  queueManagementService,
  realtimeService,
} from '@/features/queue/services/queueService'
import type { Queue, Ticket } from '@/features/queue/types/queue'
import { Button } from '@/shared/components/ui/button'
import { cn } from '@/shared/lib/utils'
import { AnimatePresence, motion } from 'framer-motion'
import { Loader2, Volume2, VolumeX } from 'lucide-react'
import { useParams } from 'react-router-dom'

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
      const { data } = await queueManagementService.getQueue(queueId)
      if (data) setQueue(data)
      setIsLoading(false)
    }

    loadQueue()

    // Subscribe para tickets chamados
    const unsubscribe = realtimeService.subscribeToCalledTickets(
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
      <div className="bg-background flex h-screen items-center justify-center">
        <Loader2 className="text-primary h-16 w-16 animate-spin" />
      </div>
    )
  }

  const currentTicket = calledTickets[0]
  const previousTickets = calledTickets.slice(1)

  return (
    <div className="bg-background text-foreground relative min-h-screen overflow-hidden p-8">
      {/* Ambient Background Effects */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="bg-primary/5 absolute -top-1/3 left-1/2 h-[600px] w-[600px] -translate-x-1/2 animate-pulse rounded-full blur-3xl" />
        <div className="to-background absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_0%,_var(--color-background)_70%)] from-transparent" />
      </div>

      {/* Botão de Áudio */}
      <Button
        variant="ghost"
        size="icon"
        aria-label={audioEnabled ? 'Desativar áudio' : 'Ativar áudio'}
        className="bg-secondary text-muted-foreground hover:bg-accent hover:text-foreground absolute top-6 right-6 z-10 rounded-full backdrop-blur-sm transition-all"
        onClick={() => setAudioEnabled(!audioEnabled)}
      >
        {audioEnabled ? <Volume2 className="h-6 w-6" /> : <VolumeX className="h-6 w-6" />}
      </Button>

      {/* Header */}
      <div className="relative mb-16 text-center">
        <p className="text-muted-foreground text-sm font-medium tracking-[0.3em] uppercase">
          Painel de Chamada
        </p>
        <h1 className="text-foreground mt-2 text-4xl font-light tracking-wider">
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

            <div className="text-muted-foreground mt-10 text-4xl font-light">
              <span className="mr-4 opacity-50">→</span>
              <span className="text-foreground font-medium">{currentTicket.counterName}</span>
            </div>

            {currentTicket.isPriority && (
              <div className="bg-chart-4 text-primary-foreground shadow-chart-4/30 mt-6 inline-block rounded-full px-6 py-2 text-lg font-medium shadow-lg">
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
            <div className="text-muted-foreground text-6xl font-light">Aguardando chamadas...</div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Histórico */}
      {previousTickets.length > 0 && (
        <div className="mx-auto max-w-4xl">
          <h2 className="text-muted-foreground mb-6 text-center text-lg font-light tracking-widest uppercase">
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
                  'border-border rounded-2xl border p-6 text-center backdrop-blur-sm',
                  ticket.status === 'serving' && 'border-primary/30 bg-primary/10',
                )}
              >
                <div
                  className="text-3xl font-bold"
                  style={{ color: ticket.categoryColor }}
                >
                  {ticket.fullCode}
                </div>
                <div className="text-muted-foreground mt-2 text-sm">{ticket.counterName}</div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Clock */}
      <div className="text-muted-foreground absolute bottom-8 left-8 text-2xl font-light">
        {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
      </div>
    </div>
  )
}
