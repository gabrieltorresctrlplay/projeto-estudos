import { useEffect, useState } from 'react'
import { useOrganizationContext } from '@/contexts/OrganizationContext'
import { AnimatePresence, motion } from 'framer-motion'
import { AlertCircle, ArrowLeft, Loader2, Ticket } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'

import type { Queue, ServiceCategory, Ticket as TicketType } from '@/types/queue'
import { queueService } from '@/lib/queueService'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export default function TotemPage() {
  const { queueId } = useParams<{ queueId: string }>()
  const navigate = useNavigate()
  const { currentOrganization } = useOrganizationContext()

  const [queue, setQueue] = useState<Queue | null>(null)
  const [categories, setCategories] = useState<ServiceCategory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isEmitting, setIsEmitting] = useState(false)
  const [emittedTicket, setEmittedTicket] = useState<TicketType | null>(null)
  const [waitingCount, setWaitingCount] = useState(0)

  useEffect(() => {
    if (!queueId) return

    const loadQueueData = async () => {
      setIsLoading(true)
      const [queueResult, categoriesResult] = await Promise.all([
        queueService.getQueue(queueId),
        queueService.getCategories(queueId),
      ])

      if (queueResult.data) setQueue(queueResult.data)
      if (categoriesResult.data) setCategories(categoriesResult.data)
      setIsLoading(false)
    }

    loadQueueData()

    // Subscribe para contar fila
    const unsubscribe = queueService.subscribeToWaitingQueue(queueId, (tickets) => {
      setWaitingCount(tickets.length)
    })

    return () => unsubscribe()
  }, [queueId])

  const handleEmitTicket = async (categoryId: string, isPriority = false) => {
    if (!queueId) return

    setIsEmitting(true)
    const { ticket, error } = await queueService.emitTicket({
      queueId,
      categoryId,
      isPriority,
    })

    if (error) {
      toast.error('Erro ao emitir senha', { description: error.message })
      setIsEmitting(false)
      return
    }

    if (ticket) {
      setEmittedTicket(ticket)
      // Limpar após 10 segundos
      setTimeout(() => setEmittedTicket(null), 10000)
    }
    setIsEmitting(false)
  }

  if (isLoading) {
    return (
      <div className="from-queue-bg to-queue-card flex h-screen items-center justify-center bg-linear-to-br">
        <Loader2 className="h-12 w-12 animate-spin text-white" />
      </div>
    )
  }

  if (!queue) {
    return (
      <div className="from-queue-bg to-queue-card flex h-screen flex-col items-center justify-center gap-4 bg-linear-to-br text-white">
        <AlertCircle className="h-16 w-16 text-red-400" />
        <h1 className="text-2xl font-bold">Fila não encontrada</h1>
        <Button
          variant="outline"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
      </div>
    )
  }

  return (
    <div className="from-queue-bg via-queue-card/80 to-queue-bg relative min-h-screen overflow-hidden bg-linear-to-br p-8">
      {/* Ambient Background Glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="bg-primary/10 absolute -top-1/4 left-1/4 h-96 w-96 rounded-full blur-3xl" />
        <div className="bg-info/10 absolute right-1/4 -bottom-1/4 h-96 w-96 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <div className="relative mb-12 text-center">
        <h1 className="bg-linear-to-r from-white to-white/70 bg-clip-text text-5xl font-bold tracking-tight text-transparent">
          {queue.name}
        </h1>
        <p className="mt-3 text-lg text-white/60">
          {currentOrganization?.name}
          <span className="mx-3 text-white/30">•</span>
          <span className="text-primary font-medium">{waitingCount}</span> pessoa(s) na fila
        </p>
      </div>

      {/* Ticket Emitido */}
      <AnimatePresence>
        {emittedTicket && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
            onClick={() => setEmittedTicket(null)}
          >
            <motion.div
              initial={{ y: 50 }}
              animate={{ y: 0 }}
              className="rounded-3xl bg-white p-12 text-center shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-4 flex justify-center">
                <div
                  className="flex h-20 w-20 items-center justify-center rounded-full"
                  style={{ backgroundColor: emittedTicket.categoryColor + '20' }}
                >
                  <Ticket
                    className="h-10 w-10"
                    style={{ color: emittedTicket.categoryColor }}
                  />
                </div>
              </div>
              <p className="text-lg text-slate-500">{emittedTicket.categoryName}</p>
              <p
                className="my-4 text-7xl font-black tracking-wider"
                style={{ color: emittedTicket.categoryColor }}
              >
                {emittedTicket.fullCode}
              </p>
              <p className="text-slate-500">
                {emittedTicket.isPriority && (
                  <span className="bg-warning/20 text-warning mr-2 rounded-full px-3 py-1">
                    Preferencial
                  </span>
                )}
                Aguarde sua vez
              </p>
              <Button
                className="mt-8"
                size="lg"
                onClick={() => setEmittedTicket(null)}
              >
                Fechar
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Categorias */}
      <div className="relative mx-auto grid max-w-5xl gap-6 md:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
          <motion.div
            key={category.id}
            whileHover={{ scale: 1.03, y: -4 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
          >
            <Card
              className="glass cursor-pointer border-2 bg-white/5 backdrop-blur-xl transition-all hover:shadow-2xl"
              style={{ borderColor: category.color + '40' }}
              onClick={() => handleEmitTicket(category.id)}
            >
              <CardContent className="p-8 text-center">
                <div
                  className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl text-2xl font-bold text-white shadow-lg transition-transform duration-300"
                  style={{
                    backgroundColor: category.color,
                    boxShadow: `0 8px 32px ${category.color}40`,
                  }}
                >
                  {category.prefix}
                </div>
                <h3 className="text-xl font-semibold text-white">{category.name}</h3>
                <p className="mt-1 text-sm text-white/60">
                  Tempo estimado: ~{category.estimatedTime} min
                </p>
                <Button
                  className="mt-6 w-full shadow-lg transition-all hover:scale-[1.02]"
                  style={{
                    backgroundColor: category.color,
                    boxShadow: `0 4px 20px ${category.color}40`,
                  }}
                  disabled={isEmitting}
                >
                  {isEmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Retirar Senha'}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Botão Preferencial */}
      <div className="mt-12 text-center">
        <p className="text-muted-foreground mb-4">Atendimento Preferencial</p>
        <div className="flex flex-wrap justify-center gap-4">
          {categories.map((category) => (
            <Button
              key={`pref-${category.id}`}
              variant="outline"
              className="border-warning text-warning hover:bg-warning/10"
              onClick={() => handleEmitTicket(category.id, true)}
              disabled={isEmitting}
            >
              {category.name} (Preferencial)
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}
