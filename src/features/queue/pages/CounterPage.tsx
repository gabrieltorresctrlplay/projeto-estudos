import { useEffect, useState } from 'react'
import { useOrganizationContext } from '@/features/organization/context/OrganizationContext'
import {
  counterService,
  queueManagementService,
  realtimeService,
  ticketService,
} from '@/features/queue/services/queueService'
import type { Counter, Queue, Ticket } from '@/features/queue/types/queue'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Separator } from '@/shared/components/ui/separator'
import { cn } from '@/shared/lib/utils'
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle,
  Clock,
  Loader2,
  Megaphone,
  PauseCircle,
  PlayCircle,
  RotateCcw,
  UserX,
} from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'

export default function CounterPage() {
  const { queueId, counterId } = useParams<{ queueId: string; counterId: string }>()
  const navigate = useNavigate()
  const { user } = useOrganizationContext()

  const [queue, setQueue] = useState<Queue | null>(null)
  const [counter, setCounter] = useState<Counter | null>(null)
  const [waitingTickets, setWaitingTickets] = useState<Ticket[]>([])
  const [currentTicket, setCurrentTicket] = useState<Ticket | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [hasPermission, setHasPermission] = useState(true)

  useEffect(() => {
    if (!queueId || !counterId || !user?.uid) return

    const loadData = async () => {
      const [queueRes, countersRes] = await Promise.all([
        queueManagementService.getQueue(queueId),
        counterService.getCounters(queueId),
      ])

      if (queueRes.data) setQueue(queueRes.data)
      if (countersRes.data) {
        const myCounter = countersRes.data.find((c) => c.id === counterId)
        if (myCounter) {
          setCounter(myCounter)
          // Verificar permissão: sem atribuição = todos podem, com atribuição = apenas o atribuído
          const canOperate = !myCounter.assignedUserId || myCounter.assignedUserId === user.uid
          setHasPermission(canOperate)
        }
      }
      setIsLoading(false)
    }

    loadData()

    // Subscribe para fila de espera
    const unsubWaiting = realtimeService.subscribeToWaitingQueue(queueId, (tickets) => {
      setWaitingTickets(tickets)
    })

    // Subscribe para guichês (para ver ticket atual)
    const unsubCounters = realtimeService.subscribeToCounters(queueId, (counters) => {
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

    const unsubscribe = realtimeService.subscribeToCalledTickets(queueId, 10, (tickets) => {
      const current = tickets.find((t) => t.id === counter.currentTicketId)
      setCurrentTicket(current || null)
    })

    return () => unsubscribe()
  }, [queueId, counter?.currentTicketId])

  const updateStatus = async (status: 'open' | 'paused' | 'closed') => {
    if (!queueId || !counterId) return
    setIsProcessing(true)
    const { error } = await counterService.updateCounterStatus(
      queueId,
      counterId,
      status,
      status === 'open' ? user?.uid : undefined,
      status === 'open' ? user?.displayName || 'Atendente' : undefined,
    )
    if (error) toast.error('Erro ao atualizar status', { description: error.message })
    setIsProcessing(false)
  }

  const handleCallNext = async () => {
    if (!queueId || !counterId) return
    setIsProcessing(true)
    const { ticket, error } = await ticketService.callNextTicket(queueId, { counterId })
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
    const { error } = await ticketService.recallTicket(queueId, currentTicket.id)
    if (error) toast.error('Erro ao rechamar')
    else toast.success(`Rechamando ${currentTicket.fullCode}`)
    setIsProcessing(false)
  }

  const handleStartServing = async () => {
    if (!queueId || !currentTicket || !user) return
    setIsProcessing(true)
    const { error } = await ticketService.startServing(queueId, currentTicket.id, user.uid)
    if (error) toast.error('Erro ao iniciar atendimento')
    setIsProcessing(false)
  }

  const handleFinish = async (status: 'finished' | 'no_show' | 'cancelled') => {
    if (!queueId || !counterId || !currentTicket) return
    setIsProcessing(true)
    const { error } = await ticketService.finishTicket(queueId, counterId, currentTicket.id, status)
    if (error) toast.error('Erro ao finalizar')
    else toast.success('Atendimento finalizado')
    setIsProcessing(false)
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="text-primary h-12 w-12 animate-spin" />
      </div>
    )
  }

  // Verificar permissão
  if (!hasPermission) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 p-8">
        <AlertCircle className="text-destructive h-16 w-16" />
        <h1 className="text-2xl font-bold">Acesso Negado</h1>
        <p className="text-muted-foreground max-w-md text-center">
          Este guichê está atribuído a outro funcionário.
          {counter?.assignedUserName && (
            <span className="mt-2 block">
              <strong>Atribuído a:</strong> {counter.assignedUserName}
            </span>
          )}
        </p>
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

  const isCounterOpen = counter?.status === 'open'
  const isCounterPaused = counter?.status === 'paused'

  return (
    <div className="bg-muted/20 flex min-h-screen flex-col">
      {/* Top Bar */}
      <header className="bg-card sticky top-0 z-10 border-b px-6 py-4 shadow-xs">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div>
            <h1 className="text-foreground text-2xl font-bold tracking-tight">
              {counter?.name || 'Meu Guichê'}
            </h1>
            <p className="text-muted-foreground text-sm">{queue?.name}</p>
          </div>

          <div className="flex items-center gap-4">
            {/* Status Toggle */}
            <div className="flex items-center gap-2 rounded-lg border p-1 shadow-xs">
              <Button
                size="sm"
                variant={isCounterOpen ? 'default' : 'ghost'}
                onClick={() => updateStatus('open')}
                disabled={isProcessing}
                className={cn('gap-2', isCounterOpen && 'bg-green-600 hover:bg-green-700')}
              >
                <PlayCircle className="h-4 w-4" />
                Aberto
              </Button>
              <Button
                size="sm"
                variant={isCounterPaused ? 'secondary' : 'ghost'}
                onClick={() => updateStatus('paused')}
                disabled={isProcessing}
                className={cn(
                  'gap-2',
                  isCounterPaused && 'bg-yellow-100 text-yellow-900 hover:bg-yellow-200',
                )}
              >
                <PauseCircle className="h-4 w-4" />
                Pausa
              </Button>
              <Button
                size="sm"
                variant={counter?.status === 'closed' ? 'secondary' : 'ghost'}
                onClick={() => updateStatus('closed')}
                disabled={isProcessing}
                className="gap-2"
              >
                Fechado
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto grid w-full max-w-7xl flex-1 gap-6 p-6 lg:grid-cols-3">
        {/* Main Action Area (2/3) */}
        <div className="flex flex-col gap-6 lg:col-span-2">
          {/* Current Ticket Card */}
          <Card className="flex flex-1 flex-col overflow-hidden border-2 shadow-md transition-shadow hover:shadow-lg">
            <CardHeader className="bg-muted/30 pb-4">
              <CardTitle className="flex items-center justify-between text-xl">
                <span>Atendimento Atual</span>
                {currentTicket && (
                  <Badge
                    variant={currentTicket.status === 'calling' ? 'secondary' : 'default'}
                    className="px-3 py-1 text-sm"
                  >
                    {currentTicket.status === 'calling' ? 'Chamando...' : 'Em Atendimento'}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>

            <CardContent className="flex flex-1 flex-col items-center justify-center p-12 text-center">
              {currentTicket ? (
                <div className="w-full max-w-md space-y-8">
                  <div className="space-y-4">
                    <div className="text-muted-foreground text-lg font-medium tracking-widest uppercase">
                      {currentTicket.categoryName}
                    </div>
                    <div
                      className="text-8xl font-black tracking-tighter"
                      style={{ color: currentTicket.categoryColor }}
                    >
                      {currentTicket.fullCode}
                    </div>
                    {currentTicket.isPriority && (
                      <Badge className="rounded-full border-transparent bg-red-100 px-4 py-1 text-lg text-red-700 hover:bg-red-100">
                        Prioridade
                      </Badge>
                    )}
                  </div>

                  {/* Timer info */}
                  <div className="text-muted-foreground flex items-center justify-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>
                      Chegou às{' '}
                      {currentTicket.createdAt
                        ?.toDate()
                        .toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <Separator />

                  {/* Actions */}
                  <div className="grid grid-cols-2 gap-4">
                    {currentTicket.status === 'calling' && (
                      <>
                        <Button
                          size="lg"
                          variant="outline"
                          onClick={handleRecall}
                          disabled={isProcessing}
                          className="h-14 border-2 text-lg"
                        >
                          <RotateCcw className="mr-2 h-5 w-5" />
                          Rechamar
                        </Button>
                        <Button
                          size="lg"
                          onClick={handleStartServing}
                          disabled={isProcessing}
                          className="h-14 bg-green-600 text-lg text-white hover:bg-green-700"
                        >
                          <CheckCircle className="mr-2 h-5 w-5" />
                          Iniciar
                        </Button>
                      </>
                    )}

                    {currentTicket.status === 'serving' && (
                      <>
                        <Button
                          size="lg"
                          variant="outline"
                          onClick={() => handleFinish('no_show')}
                          disabled={isProcessing}
                          className="h-14 border-red-200 text-lg text-red-700 hover:bg-red-50"
                        >
                          <UserX className="mr-2 h-5 w-5" />
                          Ausente
                        </Button>
                        <Button
                          size="lg"
                          onClick={() => handleFinish('finished')}
                          disabled={isProcessing}
                          className="h-14 text-lg"
                        >
                          <CheckCircle className="mr-2 h-5 w-5" />
                          Finalizar
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 opacity-60">
                  <div className="bg-muted mb-6 rounded-full p-6">
                    <AlertCircle className="text-muted-foreground h-12 w-12" />
                  </div>
                  <h3 className="text-2xl font-semibold">Nenhum atendimento</h3>
                  <p className="text-muted-foreground mt-2 max-w-xs">
                    Abra o guichê e chame o próximo da fila para começar.
                  </p>

                  <Button
                    size="lg"
                    className="mt-8 h-16 w-64 text-xl shadow-lg"
                    onClick={handleCallNext}
                    disabled={!isCounterOpen || isProcessing || waitingTickets.length === 0}
                  >
                    {isProcessing ? (
                      <Loader2 className="animate-spin" />
                    ) : (
                      <Megaphone className="mr-2" />
                    )}
                    Chamar Próximo
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Waiting List (1/3) */}
        <div className="flex flex-col gap-6">
          <Card className="flex h-full flex-col shadow-sm">
            <CardHeader className="bg-muted/20 border-b pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Fila de Espera</CardTitle>
                <Badge
                  variant="outline"
                  className="bg-background"
                >
                  {waitingTickets.length}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-auto p-0">
              {waitingTickets.length === 0 ? (
                <div className="text-muted-foreground flex h-40 items-center justify-center">
                  Fila vazia
                </div>
              ) : (
                <ul className="divide-y">
                  {waitingTickets.map((ticket) => (
                    <li
                      key={ticket.id}
                      className={cn(
                        'hover:bg-muted/50 flex items-center justify-between p-4 transition-colors',
                        ticket.isPriority && 'bg-red-50/50 dark:bg-red-900/10',
                      )}
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className="flex h-10 w-10 items-center justify-center rounded-full text-xs font-bold text-white shadow-sm"
                          style={{ backgroundColor: ticket.categoryColor }}
                        >
                          {ticket.fullCode.substring(0, 1)}
                        </div>
                        <div>
                          <div className="text-lg leading-none font-bold">{ticket.fullCode}</div>
                          <div className="text-muted-foreground mt-1 text-xs">
                            {ticket.categoryName}
                            {ticket.isPriority && (
                              <span className="ml-1 font-semibold text-red-600">• Prioridade</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-muted-foreground text-xs">
                        {Math.floor((Date.now() - ticket.createdAt.toMillis()) / 60000)} min
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
            <div className="bg-muted/20 border-t p-4">
              <Button
                className="w-full"
                variant="secondary"
                onClick={handleCallNext}
                disabled={!isCounterOpen || isProcessing || waitingTickets.length === 0}
              >
                <Megaphone className="mr-2 h-4 w-4" />
                Chamar Próximo
              </Button>
            </div>
          </Card>
        </div>
      </main>
    </div>
  )
}
