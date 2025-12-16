import { useEffect, useState } from 'react'
import { metricsService, ticketService } from '@/features/queue/services/queueService'
import { trackingService } from '@/features/queue/services/trackingService'
import type { Ticket } from '@/features/queue/types/queue'
import { AnimatePresence, motion } from 'framer-motion'
import { AlertCircle, Check, Loader2, Star } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'

type TicketWithQueue = Ticket & { queueId: string }

/**
 * FeedbackPage - Zen Rating Experience
 *
 * Design Philosophy:
 * - Gratitude first: thank them for their time
 * - One gesture: tap stars, done
 * - Celebration: reward their feedback
 */
export default function FeedbackPage() {
  const { token } = useParams<{ token: string }>()
  const navigate = useNavigate()

  const [ticket, setTicket] = useState<TicketWithQueue | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!token) {
      setError('Token inválido')
      setIsLoading(false)
      return
    }

    const loadTicket = async () => {
      const { data, error: fetchError } = await trackingService.getTicketByToken(token)

      if (fetchError || !data) {
        setError(fetchError?.message || 'Senha não encontrada')
      } else if (data.status !== 'finished') {
        setError('Este atendimento ainda não foi finalizado')
      } else if (data.feedbackRating) {
        setError('Você já avaliou este atendimento')
      } else {
        setTicket(data)
      }

      setIsLoading(false)
    }

    loadTicket()
  }, [token])

  const handleSubmit = async () => {
    if (!ticket || rating === 0) {
      toast.error('Selecione uma nota')
      return
    }

    setIsSubmitting(true)

    try {
      await ticketService.saveFeedback(ticket.queueId, ticket.id, rating, comment || undefined)
      await metricsService.recordFeedback(ticket.queueId, rating)
      setSubmitted(true)
    } catch {
      toast.error('Erro ao enviar feedback')
    }

    setIsSubmitting(false)
  }

  if (isLoading) {
    return (
      <div className="bg-background flex h-screen items-center justify-center">
        <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-background text-foreground flex h-screen flex-col items-center justify-center p-8">
        <AlertCircle className="text-muted-foreground/30 mb-8 h-16 w-16" />
        <h1 className="text-foreground text-xl font-medium">{error}</h1>
        <button
          onClick={() => navigate('/')}
          className="text-primary mt-8 text-sm underline"
        >
          Voltar ao início
        </button>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="bg-background text-foreground flex h-screen flex-col items-center justify-center p-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="text-primary mb-8"
        >
          <Check
            className="h-16 w-16"
            strokeWidth={1.5}
          />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-foreground text-3xl font-light"
        >
          Obrigado!
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ delay: 0.4 }}
          className="text-muted-foreground mt-4 text-center text-sm"
        >
          Sua opinião nos ajuda a melhorar
        </motion.p>

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          onClick={() => navigate('/')}
          className="text-primary mt-12 text-sm underline"
        >
          Voltar ao início
        </motion.button>
      </div>
    )
  }

  return (
    <div className="bg-background text-foreground flex h-screen flex-col items-center justify-center p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex w-full max-w-md flex-col items-center text-center"
      >
        {/* Ticket reference */}
        <span className="text-muted-foreground/50 text-sm tracking-[0.2em] uppercase">
          Senha {ticket?.fullCode}
        </span>

        {/* Question */}
        <h1 className="text-foreground mt-8 text-2xl font-light">Como foi seu atendimento?</h1>

        {/* Stars */}
        <div className="mt-12 flex gap-3">
          {[1, 2, 3, 4, 5].map((star) => (
            <motion.button
              key={star}
              whileTap={{ scale: 0.9 }}
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className="focus:outline-none"
            >
              <Star
                className={`h-12 w-12 transition-all duration-200 ${
                  (hoverRating || rating) >= star
                    ? 'fill-amber-400 text-amber-400'
                    : 'text-muted-foreground/20'
                }`}
              />
            </motion.button>
          ))}
        </div>

        {/* Rating label */}
        <AnimatePresence mode="wait">
          {rating > 0 && (
            <motion.span
              key={rating}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 0.6, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-muted-foreground mt-4 text-sm"
            >
              {rating === 1 && 'Muito ruim'}
              {rating === 2 && 'Ruim'}
              {rating === 3 && 'Regular'}
              {rating === 4 && 'Bom'}
              {rating === 5 && 'Excelente'}
            </motion.span>
          )}
        </AnimatePresence>

        {/* Optional comment */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: rating > 0 ? 1 : 0 }}
          className="mt-8 w-full"
        >
          <textarea
            placeholder="Comentário opcional..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="bg-muted/50 text-foreground placeholder:text-muted-foreground/40 focus:ring-primary/20 h-24 w-full resize-none rounded-xl border-0 p-4 text-sm focus:ring-2 focus:outline-none"
          />
        </motion.div>

        {/* Submit */}
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={handleSubmit}
          disabled={isSubmitting || rating === 0}
          className={`mt-8 rounded-full px-12 py-4 text-sm font-medium transition-all ${
            rating > 0
              ? 'bg-primary text-primary-foreground shadow-lg hover:shadow-xl'
              : 'bg-muted text-muted-foreground cursor-not-allowed'
          }`}
        >
          {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Enviar'}
        </motion.button>
      </motion.div>
    </div>
  )
}
