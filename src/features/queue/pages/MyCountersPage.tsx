import { useEffect, useState } from 'react'
import { useOrganizationContext } from '@/features/organization/context/OrganizationContext'
import { counterService } from '@/features/queue/services/queueService'
import type { Counter } from '@/features/queue/types/queue'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card'
import { FeatureIcon } from '@/shared/components/ui/feature-icon'
import { Loader2, Monitor, PlayCircle, Users } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

type CounterWithQueue = Counter & { queueName?: string }

export default function MyCountersPage() {
  const navigate = useNavigate()
  const { currentOrganization, user } = useOrganizationContext()

  const [counters, setCounters] = useState<CounterWithQueue[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!currentOrganization?.id || !user?.uid) return

    const loadMyCounters = async () => {
      setIsLoading(true)
      const { data } = await counterService.getMyAssignedCounters(currentOrganization.id, user.uid)
      if (data) setCounters(data)
      setIsLoading(false)
    }

    loadMyCounters()
  }, [currentOrganization?.id, user?.uid])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Aberto</Badge>
      case 'paused':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pausado</Badge>
      default:
        return <Badge variant="secondary">Fechado</Badge>
    }
  }

  const handleOpenCounter = (counter: CounterWithQueue) => {
    navigate(`/queue/${counter.queueId}/counter/${counter.id}`)
  }

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="text-primary h-12 w-12 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="from-foreground to-foreground/70 bg-linear-to-r bg-clip-text text-4xl font-bold tracking-tight text-transparent">
          Meus Guichês
        </h2>
        <p className="text-muted-foreground mt-2 text-lg">
          Guichês atribuídos a você para atendimento
        </p>
      </div>

      {/* Counters */}
      {counters.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FeatureIcon
              icon={Users}
              className="mb-4 h-16 w-16"
              iconClassName="h-8 w-8"
            />
            <h3 className="text-xl font-semibold">Nenhum guichê atribuído</h3>
            <p className="text-muted-foreground mt-2 max-w-md text-center">
              Você ainda não foi designado para nenhum guichê. Entre em contato com o administrador
              para solicitar a atribuição.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {counters.map((counter) => (
            <Card
              key={counter.id}
              className="group cursor-pointer overflow-hidden transition-all hover:shadow-lg"
              onClick={() => handleOpenCounter(counter)}
            >
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-3">
                    <FeatureIcon
                      icon={Monitor}
                      className="h-12 w-12"
                      iconClassName="h-6 w-6"
                    />
                    {counter.name}
                  </CardTitle>
                  {getStatusBadge(counter.status)}
                </div>
                <CardDescription>{counter.queueName}</CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Stats */}
                <div className="bg-muted/50 rounded-lg p-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Atendimentos hoje</span>
                    <span className="font-bold">{counter.ticketsServedToday || 0}</span>
                  </div>
                </div>

                {/* Current Ticket */}
                {counter.currentTicketCode && (
                  <div className="flex items-center gap-2 text-sm">
                    <Badge
                      variant="outline"
                      className="text-lg font-bold"
                    >
                      {counter.currentTicketCode}
                    </Badge>
                    <span className="text-muted-foreground">em atendimento</span>
                  </div>
                )}

                {/* Action Button */}
                <Button
                  className="w-full"
                  size="lg"
                >
                  <PlayCircle className="mr-2 h-5 w-5" />
                  {counter.status === 'open' ? 'Continuar Atendimento' : 'Abrir Guichê'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
