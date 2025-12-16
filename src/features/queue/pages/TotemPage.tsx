import { useEffect, useState } from 'react'
import { useOrganizationContext } from '@/features/organization/context/OrganizationContext'
import {
  queueManagementService,
  realtimeService,
  ticketService,
} from '@/features/queue/services/queueService'
import type { Queue, ServiceCategory, Ticket as TicketType } from '@/features/queue/types/queue'
import { Button } from '@/shared/components/ui/button'
import { Card } from '@/shared/components/ui/card'
import { AnimatePresence, motion } from 'framer-motion'
import { AlertCircle, ArrowLeft, Loader2, Printer, Ticket } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'

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
        queueManagementService.getQueue(queueId),
        queueManagementService.getCategories(queueId),
      ])

      if (queueResult.data) setQueue(queueResult.data)
      if (categoriesResult.data) setCategories(categoriesResult.data)
      setIsLoading(false)
    }

    loadQueueData()

    // Subscribe para contar fila
    const unsubscribe = realtimeService.subscribeToWaitingQueue(queueId, (tickets) => {
      setWaitingCount(tickets.length)
    })

    return () => unsubscribe()
  }, [queueId])

  const handleEmitTicket = async (categoryId: string, isPriority = false) => {
    if (!queueId) return

    setIsEmitting(true)
    const { ticket, error } = await ticketService.emitTicket({
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
      // Limpar após 5 segundos para agilizar
      setTimeout(() => setEmittedTicket(null), 5000)
    }
    setIsEmitting(false)
  }

  if (isLoading) {
    return (
      <div className="bg-background flex h-screen items-center justify-center">
        <Loader2 className="text-primary h-16 w-16 animate-spin" />
      </div>
    )
  }

  if (!queue) {
    return (
      <div className="bg-background text-foreground flex h-screen flex-col items-center justify-center gap-6 p-8">
        <AlertCircle className="text-destructive h-24 w-24" />
        <h1 className="text-4xl font-bold">Fila não encontrada</h1>
        <Button
          size="lg"
          variant="outline"
          onClick={() => navigate(-1)}
          className="text-xl"
        >
          <ArrowLeft className="mr-3 h-6 w-6" />
          Voltar
        </Button>
      </div>
    )
  }

  return (
    <div className="bg-background text-foreground relative flex min-h-screen flex-col overflow-hidden selection:bg-primary/20">
      {/* Background Decor */}
      <div className="bg-primary/5 pointer-events-none absolute -top-40 right-0 h-[500px] w-[500px] rounded-full blur-[120px]" />
      <div className="bg-secondary/20 pointer-events-none absolute bottom-0 left-0 h-[500px] w-[500px] rounded-full blur-[120px]" />

      {/* Header - Compact to save space for buttons */}
      <header className="relative z-10 px-8 pt-8 pb-4 text-center">
        <h1 className="text-foreground text-4xl font-bold tracking-tight md:text-5xl">
          {queue.name}
        </h1>
        <p className="text-muted-foreground mt-2 text-xl">
          Toque em uma opção para retirar sua senha
        </p>
      </header>

      {/* Main Content - Grid of Categories */}
      <main className="relative z-10 flex flex-1 flex-col items-center justify-center p-8">
        <div className="grid w-full max-w-6xl gap-8 md:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <motion.div
              key={category.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.96 }}
              className="h-full"
            >
              <Card
                className="group border-border/50 hover:border-primary/50 relative flex h-full cursor-pointer flex-col overflow-hidden border-2 shadow-sm transition-colors hover:shadow-xl"
                onClick={() => handleEmitTicket(category.id)}
              >
                {/* Category Color Strip */}
                <div
                  className="absolute top-0 left-0 h-2 w-full"
                  style={{ backgroundColor: category.color }}
                />

                <div className="flex flex-1 flex-col items-center justify-center p-10 text-center">
                  <div
                    className="mb-6 flex h-24 w-24 items-center justify-center rounded-full shadow-inner"
                    style={{ backgroundColor: `${category.color}15` }}
                  >
                    <Printer
                      className="h-10 w-10"
                      style={{ color: category.color }}
                    />
                  </div>

                  <h3 className="text-3xl font-bold tracking-tight">{category.name}</h3>

                  {category.estimatedTime && (
                     <p className="text-muted-foreground mt-3 text-lg font-medium">
                       ~{category.estimatedTime} min de espera
                     </p>
                  )}
                </div>

                {/* Footer Action */}
                <div className="bg-muted/30 p-4">
                  <Button
                    className="w-full text-lg h-14"
                    size="lg"
                    style={{
                       backgroundColor: category.color,
                       color: '#fff' // Ensure contrast
                    }}
                    disabled={isEmitting}
                  >
                    {isEmitting ? <Loader2 className="h-6 w-6 animate-spin" /> : 'Retirar Senha'}
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Priority / Accessibility Options - Bottom Area */}
        <div className="mt-12 w-full max-w-6xl">
          <div className="border-border/50 bg-card/50 rounded-2xl border p-6 backdrop-blur-sm">
            <h4 className="text-muted-foreground mb-6 text-center text-lg font-medium uppercase tracking-widest">
              Atendimento Preferencial
            </h4>
            <div className="flex flex-wrap justify-center gap-4">
              {categories.map((category) => (
                <Button
                  key={`pref-${category.id}`}
                  variant="outline"
                  size="lg"
                  className="border-chart-4/50 text-chart-4 hover:bg-chart-4/10 hover:border-chart-4 h-16 px-8 text-xl font-semibold transition-all"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleEmitTicket(category.id, true)
                  }}
                  disabled={isEmitting}
                >
                  <Ticket className="mr-3 h-6 w-6" />
                  {category.name} (Preferencial)
                </Button>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Footer Info */}
      <footer className="p-6 text-center">
        <p className="text-muted-foreground text-lg">
          {currentOrganization?.name} • <span className="text-foreground font-bold">{waitingCount}</span> pessoas aguardando
        </p>
      </footer>

      {/* Ticket Success Modal - Fullscreen Overlay */}
      <AnimatePresence>
        {emittedTicket && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md"
            onClick={() => setEmittedTicket(null)}
          >
            <motion.div
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-card w-full max-w-lg overflow-hidden rounded-3xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header Strip */}
              <div
                className="h-4 w-full"
                style={{ backgroundColor: emittedTicket.categoryColor }}
              />

              <div className="flex flex-col items-center p-12 text-center">
                <div className="mb-6 rounded-full bg-green-100 p-4 text-green-600 dark:bg-green-900/30 dark:text-green-400">
                   <Ticket className="h-12 w-12" />
                </div>

                <h2 className="text-foreground text-3xl font-bold">Senha Retirada!</h2>
                <p className="text-muted-foreground mt-2 text-xl">{emittedTicket.categoryName}</p>

                <div className="my-8 rounded-xl bg-slate-100 px-12 py-8 dark:bg-slate-800">
                  <span
                    className="block text-8xl font-black tracking-tighter"
                    style={{ color: emittedTicket.categoryColor }}
                  >
                    {emittedTicket.fullCode}
                  </span>
                </div>

                {emittedTicket.isPriority && (
                   <div className="mb-6 rounded-full bg-yellow-100 px-6 py-2 text-xl font-bold text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
                     Prioridade
                   </div>
                )}

                <p className="text-muted-foreground mb-8 text-lg">
                  Por favor, aguarde ser chamado no painel.
                </p>

                <Button
                  size="lg"
                  className="h-16 w-full text-xl"
                  onClick={() => setEmittedTicket(null)}
                >
                  Fechar
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
