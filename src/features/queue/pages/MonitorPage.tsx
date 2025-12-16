import { useEffect, useRef, useState } from 'react'
import { queueManagementService, realtimeService } from '@/features/queue/services/queueService'
import type { Queue, Ticket } from '@/features/queue/types/queue'
import { AnimatePresence, motion } from 'framer-motion'
import { Volume2, VolumeX } from 'lucide-react'
import { useParams } from 'react-router-dom'

/**
 * MonitorPage - Zen Digital Display (Redesigned)
 *
 * Design Philosophy:
 * - High Contrast: Visible from 5 meters away.
 * - Alive: Subtle organic background motion prevents "frozen screen" anxiety.
 * - Hierarchy: The current number is god.
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

    const unsubscribe = realtimeService.subscribeToCalledTickets(queueId, 5, (tickets) => {
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
      <div className="flex h-screen items-center justify-center bg-slate-950">
        <div className="h-2 w-32 overflow-hidden rounded-full bg-slate-800">
          <div className="h-full w-1/2 animate-[shimmer_2s_infinite] rounded-full bg-blue-500" />
        </div>
      </div>
    )
  }

  const currentTicket = calledTickets[0]
  const previousTickets = calledTickets.slice(1, 5)

  return (
    <div className="relative flex h-screen flex-col overflow-hidden bg-slate-950 font-sans text-white selection:bg-blue-500/30">
      {/* Organic Background Animation */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] h-[50%] w-[50%] animate-[pulse_8s_infinite] rounded-full bg-blue-900/20 blur-[120px]" />
        <div className="absolute right-[-10%] bottom-[-20%] h-[50%] w-[50%] animate-[pulse_10s_infinite_reverse] rounded-full bg-purple-900/10 blur-[120px]" />
      </div>

      {/* Floating Audio Control */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.2 }}
        whileHover={{ opacity: 1, scale: 1.1 }}
        onClick={() => setAudioEnabled(!audioEnabled)}
        className="absolute top-8 right-8 z-50 rounded-full bg-black/20 p-4 text-slate-400 backdrop-blur-md transition-all duration-300"
      >
        {audioEnabled ? <Volume2 className="h-6 w-6" /> : <VolumeX className="h-6 w-6" />}
      </motion.button>

      {/* HEADER */}
      <header className="absolute top-0 left-0 z-10 flex w-full justify-center p-8">
        <h1 className="text-sm font-medium tracking-[0.4em] text-slate-500 uppercase">
          {queue?.name || 'Monitor de Senhas'}
        </h1>
      </header>

      {/* Main Content */}
      <main className="z-10 flex flex-1 p-8 pt-20">
        {/* LEFT: THE HERO (CURRENT CALL) - 65% */}
        <section className="relative flex flex-[2] flex-col items-center justify-center border-r border-white/5 pr-12">
          <AnimatePresence mode="wait">
            {currentTicket ? (
              <motion.div
                key={`${currentTicket.id}-${currentTicket.recallCount}`}
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
                transition={{ type: 'spring', damping: 20, stiffness: 100 }}
                className="flex w-full flex-col items-center text-center"
              >
                {/* Type Badge */}
                {currentTicket.isPriority && (
                  <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="mb-12 rounded-full border border-orange-500/50 bg-orange-500/20 px-6 py-2 text-sm font-bold tracking-[0.2em] text-orange-200 uppercase"
                  >
                    Prioridade
                  </motion.div>
                )}

                {/* THE NUMBER */}
                <div className="relative">
                  <div
                    className={`absolute inset-0 opacity-40 blur-[100px] ${currentTicket.isPriority ? 'bg-orange-600' : 'bg-blue-600'}`}
                  />
                  <h2
                    className={`relative text-[18vw] leading-[0.85] font-black tracking-tighter ${currentTicket.isPriority ? 'text-orange-500' : 'text-blue-400'}`}
                    style={{ textShadow: '0 0 40px rgba(0,0,0,0.5)' }}
                  >
                    {currentTicket.fullCode}
                  </h2>
                </div>

                {/* THE LOCATION */}
                <div className="mt-16 text-center">
                  <p className="mb-4 text-xl tracking-widest text-slate-400 uppercase">
                    Dirija-se ao
                  </p>
                  <div className="rounded-[2rem] border border-white/10 bg-white/5 px-16 py-8 backdrop-blur-sm">
                    <span className="text-6xl font-bold tracking-tight text-white md:text-7xl">
                      {currentTicket.counterName}
                    </span>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="flex flex-col items-center justify-center opacity-30">
                <div className="mb-8 flex h-32 w-32 items-center justify-center rounded-full border-4 border-slate-700">
                  <div className="h-20 w-20 animate-pulse rounded-full bg-slate-800" />
                </div>
                <p className="text-2xl font-light tracking-widest uppercase">Aguardando Chamada</p>
              </div>
            )}
          </AnimatePresence>
        </section>

        {/* RIGHT: HISTORY - 35% */}
        <aside className="flex h-full flex-1 flex-col overflow-hidden pl-12">
          <h3 className="mb-8 flex items-center gap-4 text-sm font-bold tracking-widest text-slate-600 uppercase">
            <span className="h-2 w-2 rounded-full bg-slate-600" />
            Últimas Chamadas
          </h3>

          <div className="flex flex-col gap-4">
            <AnimatePresence initial={false}>
              {previousTickets.map((ticket, i) => (
                <motion.div
                  key={ticket.id}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/5 p-6"
                >
                  <div>
                    <span
                      className={`block text-4xl font-bold tracking-tight ${ticket.isPriority ? 'text-orange-400' : 'text-slate-200'}`}
                    >
                      {ticket.fullCode}
                    </span>
                    <span className="text-xs font-medium tracking-wider text-slate-500 uppercase">
                      {ticket.isPriority ? 'Preferencial' : 'Geral'}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="block text-xl font-medium text-slate-400">
                      {ticket.counterName?.replace(/^(Guichê|Mesa)\s*/i, '')}
                    </span>
                    <span className="text-[10px] text-slate-600 uppercase">Local</span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {previousTickets.length === 0 && (
              <div className="py-12 text-center text-slate-700 italic">Histórico vazio</div>
            )}
          </div>
        </aside>
      </main>

      <footer className="pointer-events-none absolute bottom-8 z-10 w-full text-center opacity-30">
        <time className="font-mono text-xl text-slate-400">
          {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
        </time>
      </footer>
    </div>
  )
}
