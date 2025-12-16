import { useEffect, useRef, useState } from 'react'
import { queueManagementService, realtimeService } from '@/features/queue/services/queueService'
import type { Queue, Ticket } from '@/features/queue/types/queue'
import { AnimatePresence, motion } from 'framer-motion'
import { Volume2, VolumeX } from 'lucide-react'
import { useParams } from 'react-router-dom'

/**
 * MonitorPage - Zen Digital Display
 *
 * Design Philosophy:
 * - The number is the protagonist. Everything else fades.
 * - Silence is elegance. Minimal elements, maximum impact.
 * - Slow, deliberate animations that breathe.
 */
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

    const unsubscribe = realtimeService.subscribeToCalledTickets(queueId, 4, (tickets) => {
      setCalledTickets(tickets)

      if (tickets.length > 0) {
        const latestTicket = tickets[0]
        const ticketKey = `${latestTicket.id}-${latestTicket.recallCount || 0}`

        if (ticketKey !== lastCalledRef.current) {
          lastCalledRef.current = ticketKey
          if (audioEnabled) {
            playCallAudio(latestTicket)
          }
        }
      }
    })

    return () => unsubscribe()
  }, [queueId, audioEnabled])

  const playCallAudio = (ticket: Ticket) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(
        `Senha ${ticket.fullCode.split('').join(' ')}, ${ticket.counterName}`,
      )
      utterance.lang = 'pt-BR'
      utterance.rate = 0.85
      utterance.pitch = 0.9
      speechSynthesis.speak(utterance)
    }
  }

  if (isLoading) {
    return (
      <div className="bg-background flex h-screen items-center justify-center">
        <motion.div
          className="bg-primary/20 h-1 w-32 overflow-hidden rounded-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            className="bg-primary h-full w-1/3 rounded-full"
            animate={{ x: ['0%', '200%'] }}
            transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut' }}
          />
        </motion.div>
      </div>
    )
  }

  const currentTicket = calledTickets[0]
  const previousTickets = calledTickets.slice(1, 4)

  return (
    <div className="bg-background text-foreground relative flex h-screen flex-col overflow-hidden">
      {/* Floating Audio Control - Minimal, almost invisible */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.4 }}
        whileHover={{ opacity: 1, scale: 1.1 }}
        onClick={() => setAudioEnabled(!audioEnabled)}
        className="text-muted-foreground absolute top-8 right-8 z-50 p-4 transition-all duration-500"
        aria-label={audioEnabled ? 'Desativar áudio' : 'Ativar áudio'}
      >
        {audioEnabled ? <Volume2 className="h-6 w-6" /> : <VolumeX className="h-6 w-6" />}
      </motion.button>

      {/* Main Stage */}
      <main className="flex flex-1">
        {/* Left: The Protagonist - 70% */}
        <section className="flex flex-[7] flex-col items-center justify-center">
          <AnimatePresence mode="wait">
            {currentTicket ? (
              <motion.article
                key={`${currentTicket.id}-${currentTicket.recallCount}`}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                className="flex flex-col items-center text-center"
              >
                {/* Queue Name - Whisper */}
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.3 }}
                  className="text-muted-foreground mb-8 text-sm font-light tracking-[0.3em] uppercase"
                >
                  {queue?.name}
                </motion.span>

                {/* THE NUMBER - Hero */}
                <motion.div
                  className="relative"
                  animate={{
                    scale: [1, 1.008, 1],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                >
                  {/* Subtle glow behind */}
                  <div
                    className="absolute inset-0 opacity-20 blur-3xl"
                    style={{ backgroundColor: currentTicket.categoryColor }}
                  />

                  <span
                    className="relative block text-[clamp(8rem,25vw,22rem)] leading-[0.85] font-black tracking-tighter"
                    style={{ color: currentTicket.categoryColor }}
                  >
                    {currentTicket.fullCode}
                  </span>
                </motion.div>

                {/* Counter - Subtle guide */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                  className="mt-16 flex flex-col items-center gap-2"
                >
                  <span className="text-muted-foreground/60 text-lg font-light tracking-widest uppercase">
                    Dirija-se ao
                  </span>
                  <span className="text-foreground text-5xl font-semibold tracking-wide">
                    {currentTicket.counterName}
                  </span>
                </motion.div>

                {/* Priority - Elegant badge */}
                {currentTicket.isPriority && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 }}
                    className="border-primary/30 text-primary mt-12 rounded-full border px-8 py-3 text-sm font-medium tracking-widest uppercase"
                  >
                    Atendimento Preferencial
                  </motion.div>
                )}
              </motion.article>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center text-center"
              >
                <span className="text-muted-foreground/30 text-sm font-light tracking-[0.3em] uppercase">
                  {queue?.name}
                </span>
                <div className="text-muted-foreground/10 mt-8 text-[clamp(6rem,20vw,16rem)] leading-none font-black tracking-tighter">
                  —
                </div>
                <span className="text-muted-foreground/40 mt-8 text-lg font-light">
                  Aguardando próxima chamada
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* Right: History - 30% - Minimal sidebar */}
        <aside className="border-border/30 flex flex-[3] flex-col border-l">
          <header className="p-8 pb-4">
            <h2 className="text-muted-foreground/50 text-xs font-medium tracking-[0.2em] uppercase">
              Anteriores
            </h2>
          </header>

          <div className="flex flex-1 flex-col gap-1 px-4 pb-8">
            <AnimatePresence>
              {previousTickets.map((ticket, index) => (
                <motion.div
                  key={ticket.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1 - index * 0.25, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: index * 0.05, duration: 0.4 }}
                  className="hover:bg-muted/30 flex items-center justify-between rounded-2xl p-6 transition-colors"
                >
                  <div className="flex flex-col gap-1">
                    <span
                      className="text-4xl font-bold tracking-tight"
                      style={{ color: ticket.categoryColor }}
                    >
                      {ticket.fullCode}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-muted-foreground text-sm font-light">
                      {ticket.counterName?.replace('Guichê ', '')}
                    </span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {previousTickets.length === 0 && (
              <div className="text-muted-foreground/30 flex flex-1 items-center justify-center text-sm">
                Sem chamadas anteriores
              </div>
            )}
          </div>
        </aside>
      </main>

      {/* Bottom: Time - Almost invisible */}
      <footer className="absolute bottom-8 left-1/2 -translate-x-1/2">
        <time className="text-muted-foreground/20 text-sm font-light tabular-nums">
          {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
        </time>
      </footer>
    </div>
  )
}
