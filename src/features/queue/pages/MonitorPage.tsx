import { useEffect, useRef, useState } from 'react'
import {
  queueManagementService,
  realtimeService,
} from '@/features/queue/services/queueService'
import type { Queue, Ticket } from '@/features/queue/types/queue'
import { Button } from '@/shared/components/ui/button'
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
    <div className="bg-background text-foreground relative flex min-h-screen flex-col overflow-hidden">
      {/* Botão de Áudio - Fixed Position */}
      <Button
        variant="ghost"
        size="icon"
        aria-label={audioEnabled ? 'Desativar áudio' : 'Ativar áudio'}
        className="bg-card text-muted-foreground hover:bg-muted hover:text-foreground absolute top-8 right-8 z-50 h-14 w-14 rounded-full shadow-lg backdrop-blur-sm transition-all"
        onClick={() => setAudioEnabled(!audioEnabled)}
      >
        {audioEnabled ? <Volume2 className="h-8 w-8" /> : <VolumeX className="h-8 w-8" />}
      </Button>

      <main className="flex flex-1 flex-col p-8 md:p-12 lg:flex-row">
        {/* Left Side - Current Ticket (66%) */}
        <section className="bg-card relative flex flex-[2] flex-col items-center justify-center rounded-[3rem] p-12 shadow-2xl lg:mr-8">
           {/* Header Inside Card */}
           <div className="absolute top-12 left-0 w-full text-center">
            <h1 className="text-muted-foreground text-3xl font-light tracking-widest uppercase">
               {queue?.name || 'Fila'}
            </h1>
           </div>

          <AnimatePresence mode="wait">
            {currentTicket ? (
              <motion.div
                key={currentTicket.id}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                className="flex flex-col items-center justify-center text-center"
              >
                {/* Category Badge */}
                <div
                  className="mb-8 rounded-full px-12 py-4 text-3xl font-bold shadow-sm"
                  style={{
                    backgroundColor: `${currentTicket.categoryColor}20`,
                    color: currentTicket.categoryColor,
                  }}
                >
                  {currentTicket.categoryName}
                </div>

                {/* The Big Number */}
                <motion.div
                  className="text-[15rem] leading-none font-black tracking-tighter md:text-[20rem]"
                  style={{ color: currentTicket.categoryColor }}
                  animate={{ scale: [1, 1.02, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                >
                  {currentTicket.fullCode}
                </motion.div>

                {/* Counter Info */}
                <div className="mt-12 flex flex-col items-center">
                    <span className="text-muted-foreground text-4xl font-light">Dirija-se ao</span>
                    <span className="text-foreground mt-2 text-6xl font-bold">{currentTicket.counterName}</span>
                </div>

                {currentTicket.isPriority && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-chart-4 text-primary-foreground mt-8 rounded-full px-8 py-3 text-2xl font-bold shadow-lg"
                    >
                        Prioridade
                    </motion.div>
                )}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center text-center opacity-50"
              >
                <div className="text-9xl">...</div>
                <div className="text-muted-foreground mt-8 text-4xl font-light">Aguardando chamada</div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* Right Side - History (33%) */}
        <aside className="bg-secondary/30 mt-8 flex flex-1 flex-col rounded-[3rem] p-8 backdrop-blur-sm lg:mt-0">
          <h2 className="text-muted-foreground mb-8 text-center text-2xl font-medium uppercase tracking-widest">
            Últimas Chamadas
          </h2>

          <div className="flex flex-1 flex-col gap-6 overflow-hidden">
            <AnimatePresence>
                {previousTickets.map((ticket, index) => (
                <motion.div
                    key={ticket.id}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-card flex items-center justify-between rounded-3xl p-6 shadow-sm"
                >
                    <div className="flex flex-col">
                        <span className="text-muted-foreground text-sm font-medium">{ticket.categoryName}</span>
                        <span
                            className="text-5xl font-bold"
                            style={{ color: ticket.categoryColor }}
                        >
                            {ticket.fullCode}
                        </span>
                    </div>
                    <div className="text-right">
                         <span className="text-muted-foreground block text-sm">Guichê</span>
                         <span className="text-foreground text-2xl font-bold">{ticket.counterName?.replace('Guichê', '')}</span>
                    </div>
                </motion.div>
                ))}
            </AnimatePresence>

            {previousTickets.length === 0 && (
                 <div className="text-muted-foreground flex h-full items-center justify-center text-xl italic">
                     Histórico vazio
                 </div>
            )}
          </div>

           {/* Clock */}
           <div className="text-muted-foreground mt-auto pt-8 text-center text-4xl font-light tracking-widest">
                {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
           </div>
        </aside>
      </main>
    </div>
  )
}
