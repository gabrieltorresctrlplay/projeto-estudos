import { useEffect, useState } from 'react'
import { useOrganizationContext } from '@/contexts/OrganizationContext'
import {
  AlertCircle,
  ChevronRight,
  Clock,
  Loader2,
  Pause,
  Phone,
  Play,
  RotateCcw,
  UserCheck,
  X,
} from 'lucide-react'
import { useParams } from 'react-router-dom'
import { toast } from 'sonner'

import type { Counter, Queue, Ticket } from '@/types/queue'
import { queueService } from '@/lib/queueService'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function CounterPage() {
  const { queueId, counterId } = useParams<{ queueId: string; counterId: string }>()
  const { user } = useOrganizationContext()

  const [queue, setQueue] = useState<Queue | null>(null)
  const [counter, setCounter] = useState<Counter | null>(null)
  const [waitingTickets, setWaitingTickets] = useState<Ticket[]>([])
  const [currentTicket, setCurrentTicket] = useState<Ticket | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    if (!queueId || !counterId) return

    const loadData = async () => {
      const [queueRes, countersRes] = await Promise.all([
        queueService.getQueue(queueId),
        queueService.getCounters(queueId),
      ])

      if (queueRes.data) setQueue(queueRes.data)
      if (countersRes.data) {
        const myCounter = countersRes.data.find((c) => c.id === counterId)
        if (myCounter) setCounter(myCounter)
      }
      setIsLoading(false)
    }

    loadData()

    // Subscribe para fila de espera
    const unsubWaiting = queueService.subscribeToWaitingQueue(queueId, (tickets) => {
      setWaitingTickets(tickets)
    })

    // Subscribe para guichês (para ver ticket atual)
    const unsubCounters = queueService.subscribeToCounters(queueId, (counters) => {
      const myCounter = counters.find((c) => c.id === counterId)
      if (myCounter) setCounter(myCounter)
    })

    return () => {
      unsubWaiting()
      unsubCounters()
    }
  }, [queueId, counterId])

  // Buscar ticket atual se houver
  useEffect(() => {
    if (!queueId || !counter?.currentTicketId) {
      setCurrentTicket(null)
      return
    }

    const unsubscribe = queueService.subscribeToCalledTickets(queueId, 10, (tickets) => {
      const current = tickets.find((t) => t.id === counter.currentTicketId)
      setCurrentTicket(current || null)
    })

    return () => unsubscribe()
  }, [queueId, counter?.currentTicketId])

  const handleOpenCounter = async () => {
    if (!queueId || !counterId || !user) return
    setIsProcessing(true)
    const { error } = await queueService.updateCounterStatus(
      queueId,
      counterId,
      'open',
      user.uid,
      user.displayName || 'Atendente',
    )
    if (error) toast.error('Erro ao abrir guichê', { description: error.message })
    setIsProcessing(false)
  }

  const handlePauseCounter = async () => {
    if (!queueId || !counterId) return
    setIsProcessing(true)
    const { error } = await queueService.updateCounterStatus(queueId, counterId, 'paused')
    if (error) toast.error('Erro ao pausar guichê', { description: error.message })
    setIsProcessing(false)
  }

  const handleCallNext = async () => {
    if (!queueId || !counterId) return
    setIsProcessing(true)
    const { ticket, error } = await queueService.callNextTicket(queueId, { counterId })
    if (error) {
      toast.error('Erro ao chamar', { description: error.message })
    } else if (ticket) {
      toast.success(`Chamando ${ticket.fullCode}`)
    }
    setIsProcessing(false)
  }

  const handleRecall = async () => {
    if (!queueId || !currentTicket) return
    setIsProcessing(true)
    const { error } = await queueService.recallTicket(queueId, currentTicket.id)
    if (error) toast.error('Erro ao rechamar')
    else toast.success(`Rechamando ${currentTicket.fullCode}`)
    setIsProcessing(false)
  }

  const handleStartServing = async () => {
    if (!queueId || !currentTicket || !user) return
    setIsProcessing(true)
    const { error } = await queueService.startServing(queueId, currentTicket.id, user.uid)
    if (error) toast.error('Erro ao iniciar atendimento')
    setIsProcessing(false)
  }

  const handleFinish = async (status: 'finished' | 'no_show' | 'cancelled') => {
    if (!queueId || !counterId || !currentTicket) return
    setIsProcessing(true)
    const { error } = await queueService.finishTicket(queueId, counterId, currentTicket.id, status)
    if (error) toast.error('Erro ao finalizar')
    else toast.success('Atendimento finalizado')
    setIsProcessing(false)
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="from-background via-background to-muted min-h-screen bg-linear-to-b p-6">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="from-foreground to-foreground/70 bg-linear-to-r bg-clip-text text-3xl font-bold text-transparent">
              {counter?.name || 'Guichê'}
            </h1>
            <p className="text-muted-foreground mt-1 text-lg">{queue?.name}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant={counter?.status === 'open' ? 'default' : 'secondary'}
              className={cn(
                counter?.status === 'open' && 'bg-primary',
                counter?.status === 'paused' && 'bg-chart-4',
              )}
            >
              {counter?.status === 'open' && 'Aberto'}
              {counter?.status === 'closed' && 'Fechado'}
              {counter?.status === 'paused' && 'Pausado'}
            </Badge>
            {counter?.status === 'closed' && (
              <Button
                onClick={handleOpenCounter}
                disabled={isProcessing}
              >
                <Play className="mr-2 h-4 w-4" />
                Abrir Guichê
              </Button>
            )}
            {counter?.status === 'open' && (
              <Button
                variant="outline"
                onClick={handlePauseCounter}
                disabled={isProcessing}
              >
                <Pause className="mr-2 h-4 w-4" />
                Pausar
              </Button>
            )}
            {counter?.status === 'paused' && (
              <Button
                onClick={handleOpenCounter}
                disabled={isProcessing}
              >
                <Play className="mr-2 h-4 w-4" />
                Retomar
              </Button>
            )}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Painel Principal */}
          <div className="lg:col-span-2">
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Atendimento Atual</CardTitle>
              </CardHeader>
              <CardContent>
                {currentTicket ? (
                  <div className="space-y-6">
                    {/* Ticket Atual */}
                    <div
                      className="relative overflow-hidden rounded-2xl border-2 p-10 text-center"
                      style={{ borderColor: currentTicket.categoryColor + '30' }}
                    >
                      {/* Background Glow */}
                      <div
                        className="absolute inset-0 opacity-10"
                        style={{
                          background: `radial-gradient(ellipse at center, ${currentTicket.categoryColor}, transparent 70%)`,
                        }}
                      />
                      <Badge
                        className="relative mb-4 shadow-lg"
                        style={{
                          backgroundColor: currentTicket.categoryColor,
                          boxShadow: `0 4px 20px ${currentTicket.categoryColor}40`,
                        }}
                      >
                        {currentTicket.categoryName}
                      </Badge>
                      <div
                        className="relative text-7xl font-black"
                        style={{
                          color: currentTicket.categoryColor,
                          textShadow: `0 4px 20px ${currentTicket.categoryColor}30`,
                        }}
                      >
                        {currentTicket.fullCode}
                      </div>
                      {currentTicket.isPriority && (
                        <Badge
                          variant="accent"
                          className="bg-chart-4 text-primary-foreground relative mt-4 shadow-md"
                        >
                          Preferencial
                        </Badge>
                      )}
                      <div className="text-muted-foreground relative mt-4 flex items-center justify-center gap-2">
                        <Clock className="h-4 w-4" />
                        Esperou: {Math.floor((currentTicket.waitTimeSeconds || 0) / 60)} min
                      </div>
                    </div>

                    {/* Ações */}
                    <div className="grid grid-cols-2 gap-4">
                      {currentTicket.status === 'calling' && (
                        <>
                          <Button
                            size="lg"
                            variant="outline"
                            onClick={handleRecall}
                            disabled={isProcessing}
                          >
                            <RotateCcw className="mr-2 h-4 w-4" />
                            Rechamar
                          </Button>
                          <Button
                            size="lg"
                            className="bg-primary hover:bg-primary/90"
                            onClick={handleStartServing}
                            disabled={isProcessing}
                          >
                            <UserCheck className="mr-2 h-4 w-4" />
                            Iniciar Atendimento
                          </Button>
                        </>
                      )}
                      {currentTicket.status === 'serving' && (
                        <>
                          <Button
                            size="lg"
                            variant="outline"
                            className="border-destructive text-destructive hover:bg-destructive/10"
                            onClick={() => handleFinish('no_show')}
                            disabled={isProcessing}
                          >
                            <X className="mr-2 h-4 w-4" />
                            Não Compareceu
                          </Button>
                          <Button
                            size="lg"
                            className="bg-primary hover:bg-primary/90"
                            onClick={() => handleFinish('finished')}
                            disabled={isProcessing}
                          >
                            <UserCheck className="mr-2 h-4 w-4" />
                            Finalizar
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="py-16 text-center">
                    <AlertCircle className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
                    <p className="text-muted-foreground text-lg">Nenhum atendimento em andamento</p>
                    <Button
                      size="lg"
                      className="mt-6"
                      onClick={handleCallNext}
                      disabled={
                        isProcessing || counter?.status !== 'open' || waitingTickets.length === 0
                      }
                    >
                      {isProcessing ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Phone className="mr-2 h-4 w-4" />
                      )}
                      Chamar Próximo
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Fila de Espera */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Fila de Espera
                  <Badge variant="secondary">{waitingTickets.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="max-h-[500px] overflow-y-auto">
                {waitingTickets.length === 0 ? (
                  <p className="text-muted-foreground py-8 text-center">Fila vazia</p>
                ) : (
                  <div className="space-y-2">
                    {waitingTickets.map((ticket, index) => (
                      <div
                        key={ticket.id}
                        className={cn(
                          'flex items-center justify-between rounded-lg border p-3',
                          index === 0 && 'border-primary bg-primary/5',
                          ticket.isPriority && 'border-chart-4 bg-chart-4/10',
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="text-primary-foreground flex h-10 w-10 items-center justify-center rounded-lg text-sm font-bold"
                            style={{ backgroundColor: ticket.categoryColor }}
                          >
                            {ticket.fullCode.slice(0, 1)}
                          </div>
                          <div>
                            <div className="font-semibold">{ticket.fullCode}</div>
                            <div className="text-muted-foreground text-xs">
                              {ticket.categoryName}
                              {ticket.isPriority && ' • Preferencial'}
                            </div>
                          </div>
                        </div>
                        {index === 0 && <ChevronRight className="text-primary h-5 w-5" />}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
