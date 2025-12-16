import { useEffect, useState } from 'react'
import { trackingService } from '@/features/queue/services/trackingService'
import type { Ticket } from '@/features/queue/types/queue'
import { AnimatePresence, motion } from 'framer-motion'
import { AlertCircle, Clock, Loader2, MessageSquare, RefreshCw } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'

type TicketWithQueue = Ticket & { queueId: string }

/**
 * TrackTicketPage - Zen Ticket Tracking
 *
 * Design Philosophy:
 * - One truth: your number and status
 * - Calm confidence: the wait feels manageable
 * - Clear action: when called, it's unmistakable
 */
export default function TrackTicketPage() {
  const { token } = useParams<{ token: string }>()
  const navigate = useNavigate()

  const [ticket, setTicket] = useState<TicketWithQueue | null>(null)
  const [position, setPosition] = useState(0)
  const [estimatedWait, setEstimatedWait] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const loadTicket = async () => {
    if (!token) {
      setError('Token inválido')
      setIsLoading(false)
      return
    }

    setIsRefreshing(true)
    const { data, error: fetchError } = await trackingService.getTicketByToken(token)

    if (fetchError || !data) {
      setError(fetchError?.message || 'Senha não encontrada')
      setTicket(null)
    } else {
      setTicket(data)
      setError(null)

      if (data.status === 'waiting') {
        const positionData = await trackingService.getQueuePosition(data.queueId, data)
        setPosition(positionData.position)
        setEstimatedWait(positionData.estimatedWait)
      }
    }

    setIsLoading(false)
    setIsRefreshing(false)
  }

  useEffect(() => {
    loadTicket()
    const interval = setInterval(loadTicket, 30000)
    return () => clearInterval(interval)
  }, [token])

  if (isLoading) {
    return (
      <div className="bg-background flex h-screen items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
        >
          <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
        </motion.div>
      </div>
    )
  }

  if (error || !ticket) {
    return (
      <div className="bg-background text-foreground flex h-screen flex-col items-center justify-center p-8">
        <AlertCircle className="text-muted-foreground/30 mb-8 h-16 w-16" />
        <h1 className="text-foreground text-xl font-medium">{error || 'Senha não encontrada'}</h1>
        <p className="text-muted-foreground/60 mt-2 text-sm">Verifique se o código está correto</p>
        <button
          onClick={() => navigate('/')}
          className="text-primary mt-8 text-sm underline"
        >
          Voltar ao início
        </button>
      </div>
    )
  }

  const isCalling = ticket.status === 'calling'
  const isWaiting = ticket.status === 'waiting'
  const isFinished = ticket.status === 'finished' || ticket.status === 'no_show'

  return (
    <div className="bg-background text-foreground relative flex h-screen flex-col overflow-hidden">
      {/* Refresh indicator */}
      <motion.button
        onClick={loadTicket}
        disabled={isRefreshing}
        className="text-muted-foreground/40 hover:text-muted-foreground absolute top-8 right-8 p-2 transition-colors"
        animate={isRefreshing ? { rotate: 360 } : {}}
        transition={{ duration: 1, repeat: isRefreshing ? Infinity : 0 }}
      >
        <RefreshCw className="h-5 w-5" />
      </motion.button>

      {/* Main content */}
      <main className="flex flex-1 flex-col items-center justify-center p-8">
        <AnimatePresence mode="wait">
          {/* CALLED STATE - Full screen alert */}
          {isCalling && (
            <motion.div
              key="calling"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center text-center"
            >
              {/* Pulsing background glow */}
              <motion.div
                className="bg-primary/20 absolute inset-0"
                animate={{ opacity: [0.1, 0.3, 0.1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />

              <span className="text-primary relative mb-4 text-sm font-medium tracking-[0.2em] uppercase">
                É a sua vez!
              </span>

              <motion.span
                className="text-primary relative text-[clamp(5rem,20vw,12rem)] leading-none font-black tracking-tighter"
                animate={{ scale: [1, 1.02, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                {ticket.fullCode}
              </motion.span>

              <div className="relative mt-12 flex flex-col items-center">
                <span className="text-muted-foreground text-lg font-light">Dirija-se ao</span>
                <span className="text-foreground mt-2 text-4xl font-semibold">
                  {ticket.counterName}
                </span>
              </div>
            </motion.div>
          )}

          {/* WAITING STATE */}
          {isWaiting && (
            <motion.div
              key="waiting"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center text-center"
            >
              <span className="text-muted-foreground/50 mb-8 text-sm tracking-[0.2em] uppercase">
                Sua senha
              </span>

              <span className="text-primary text-[clamp(4rem,15vw,10rem)] leading-none font-black tracking-tighter">
                {ticket.fullCode}
              </span>

              {ticket.isPriority && (
                <span className="text-primary/60 mt-4 text-sm font-light tracking-wide">
                  Atendimento Preferencial
                </span>
              )}

              {/* Position info */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mt-16 flex flex-col items-center"
              >
                <div className="flex items-center gap-8">
                  <div className="flex flex-col items-center">
                    <span className="text-muted-foreground/50 text-xs tracking-wide uppercase">
                      Posição
                    </span>
                    <span className="text-foreground mt-1 text-4xl font-bold">{position}º</span>
                  </div>

                  <div className="bg-border h-12 w-px" />

                  <div className="flex flex-col items-center">
                    <span className="text-muted-foreground/50 text-xs tracking-wide uppercase">
                      Espera
                    </span>
                    <span className="text-foreground mt-1 text-4xl font-bold">
                      ~{estimatedWait}
                      <span className="text-muted-foreground text-lg">min</span>
                    </span>
                  </div>
                </div>
              </motion.div>

              {/* Status indicator */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                transition={{ delay: 0.5 }}
                className="text-muted-foreground mt-16 flex items-center gap-2 text-sm"
              >
                <Clock className="h-4 w-4" />
                Aguardando chamada
              </motion.div>
            </motion.div>
          )}

          {/* FINISHED STATE */}
          {isFinished && (
            <motion.div
              key="finished"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center text-center"
            >
              <span className="text-muted-foreground/30 text-[clamp(3rem,12vw,8rem)] leading-none font-black tracking-tighter">
                {ticket.fullCode}
              </span>

              <span className="text-muted-foreground/60 mt-8 text-lg font-light">
                {ticket.status === 'finished' ? 'Atendimento concluído' : 'Não compareceu'}
              </span>

              {/* Feedback CTA */}
              {ticket.status === 'finished' && !ticket.feedbackRating && (
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  onClick={() => navigate(`/feedback/${token}`)}
                  className="bg-primary text-primary-foreground mt-12 flex items-center gap-2 rounded-full px-8 py-4 text-sm font-medium shadow-lg transition-all hover:shadow-xl"
                >
                  <MessageSquare className="h-4 w-4" />
                  Avaliar atendimento
                </motion.button>
              )}
            </motion.div>
          )}

          {/* SERVING STATE */}
          {ticket.status === 'serving' && (
            <motion.div
              key="serving"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center text-center"
            >
              <span className="text-primary mb-4 text-sm font-medium tracking-[0.2em] uppercase">
                Em atendimento
              </span>

              <span className="text-primary text-[clamp(4rem,15vw,10rem)] leading-none font-black tracking-tighter">
                {ticket.fullCode}
              </span>

              <span className="text-muted-foreground mt-8 text-lg font-light">
                {ticket.counterName}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Auto-refresh indicator */}
      <footer className="absolute bottom-8 left-1/2 -translate-x-1/2">
        <span className="text-muted-foreground/20 text-xs">Atualização automática</span>
      </footer>
    </div>
  )
}
