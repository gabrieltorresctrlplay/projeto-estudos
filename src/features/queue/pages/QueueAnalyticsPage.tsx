import { useEffect, useState } from 'react'
import { useOrganizationContext } from '@/features/organization/context/OrganizationContext'
import { metricsService, queueManagementService } from '@/features/queue/services/queueService'
import type { DailyQueueMetrics, Queue } from '@/features/queue/types/queue'
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
import {
  ArrowLeft,
  BarChart3,
  Clock,
  Loader2,
  TrendingUp,
  UserCheck,
  Users,
  UserX,
} from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'

export default function QueueAnalyticsPage() {
  const { queueId } = useParams<{ queueId: string }>()
  const navigate = useNavigate()
  const { currentMemberRole } = useOrganizationContext()

  const [queue, setQueue] = useState<Queue | null>(null)
  const [metrics, setMetrics] = useState<DailyQueueMetrics | null>(null)
  const [weekSummary, setWeekSummary] = useState<{
    ticketsServed: number
    averageWaitMinutes: number
    noShowRate: number
  } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const isAdmin = currentMemberRole === 'owner' || currentMemberRole === 'admin'

  useEffect(() => {
    if (!queueId) return

    const loadData = async () => {
      setIsLoading(true)

      const [queueRes, summaryRes] = await Promise.all([
        queueManagementService.getQueue(queueId),
        metricsService.getDashboardSummary(queueId),
      ])

      if (queueRes.data) setQueue(queueRes.data)

      if (summaryRes.error) {
        setError(summaryRes.error)
      } else if (summaryRes.data) {
        setMetrics(summaryRes.data.today)
        setWeekSummary(summaryRes.data.weekTotal)
      }

      setIsLoading(false)
    }

    loadData()
  }, [queueId])

  if (!isAdmin) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 p-8">
        <BarChart3 className="text-muted-foreground h-16 w-16" />
        <h1 className="text-2xl font-bold">Acesso Restrito</h1>
        <p className="text-muted-foreground">Apenas administradores podem ver as métricas.</p>
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

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="text-primary h-12 w-12 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-destructive/5 border-destructive/20 m-8 flex h-screen flex-col items-center justify-center gap-4 rounded-lg border p-8 text-center">
        <BarChart3 className="text-destructive h-12 w-12" />
        <h1 className="text-destructive text-xl font-bold">Erro ao carregar métricas</h1>
        <p className="text-muted-foreground max-w-md">
          {error.message.includes('requires an index')
            ? 'O sistema está processando os índices do banco de dados. Isso pode levar alguns minutos. Por favor, aguarde e recarregue a página.'
            : error.message}
        </p>
        <Button onClick={() => window.location.reload()}>Recarregar Página</Button>
      </div>
    )
  }

  const todayStats = {
    ticketsEmitted: metrics?.ticketsEmitted || 0,
    ticketsServed: metrics?.ticketsServed || 0,
    ticketsNoShow: metrics?.ticketsNoShow || 0,
    avgWaitMinutes: (metrics?.averageWaitTimeSeconds || 0) / 60,
    avgServiceMinutes: (metrics?.averageServiceTimeSeconds || 0) / 60,
    avgRating: metrics?.averageRating || 0,
    feedbackCount: metrics?.feedbackCount || 0,
  }

  const attendantsList = metrics?.byAttendant
    ? Object.entries(metrics.byAttendant).map(([id, stats]) => ({
        id,
        ...stats,
      }))
    : []

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="from-foreground to-foreground/70 bg-linear-to-r bg-clip-text text-4xl font-bold tracking-tight text-transparent">
            Analytics
          </h2>
          <p className="text-muted-foreground mt-2 text-lg">{queue?.name}</p>
        </div>
      </div>

      {/* Stats Cards - Hoje */}
      <div>
        <h3 className="mb-4 text-lg font-semibold">Hoje</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Senhas Emitidas</CardTitle>
              <Users className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{todayStats.ticketsEmitted}</div>
              <p className="text-muted-foreground text-xs">{todayStats.ticketsServed} atendidas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tempo Médio de Espera</CardTitle>
              <Clock className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{todayStats.avgWaitMinutes.toFixed(1)} min</div>
              <p className="text-muted-foreground text-xs">
                Atendimento: {todayStats.avgServiceMinutes.toFixed(1)} min
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Desistências</CardTitle>
              <UserX className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{todayStats.ticketsNoShow}</div>
              <p className="text-muted-foreground text-xs">
                {todayStats.ticketsEmitted > 0
                  ? ((todayStats.ticketsNoShow / todayStats.ticketsEmitted) * 100).toFixed(1)
                  : 0}
                % taxa de no-show
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avaliação Média</CardTitle>
              <TrendingUp className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {todayStats.avgRating > 0 ? todayStats.avgRating.toFixed(1) : '-'} ⭐
              </div>
              <p className="text-muted-foreground text-xs">{todayStats.feedbackCount} avaliações</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Stats Cards - Semana */}
      {weekSummary && (
        <div>
          <h3 className="mb-4 text-lg font-semibold">Últimos 7 Dias</h3>
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Atendidos</CardTitle>
                <UserCheck className="text-muted-foreground h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{weekSummary.ticketsServed}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Espera Média</CardTitle>
                <Clock className="text-muted-foreground h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {weekSummary.averageWaitMinutes.toFixed(1)} min
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Taxa de No-Show</CardTitle>
                <UserX className="text-muted-foreground h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{weekSummary.noShowRate.toFixed(1)}%</div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Performance por Funcionário */}
      <Card>
        <CardHeader>
          <CardTitle>Performance por Funcionário</CardTitle>
          <CardDescription>Atendimentos de hoje por funcionário</CardDescription>
        </CardHeader>
        <CardContent>
          {attendantsList.length === 0 ? (
            <div className="text-muted-foreground py-8 text-center">
              Nenhum atendimento registrado hoje
            </div>
          ) : (
            <div className="space-y-4">
              {attendantsList.map((attendant) => (
                <div
                  key={attendant.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="flex items-center gap-4">
                    <FeatureIcon
                      icon={UserCheck}
                      className="h-10 w-10"
                      iconClassName="h-5 w-5"
                    />
                    <div>
                      <p className="font-medium">{attendant.id.slice(0, 8)}...</p>
                      <p className="text-muted-foreground text-sm">
                        Tempo médio:{' '}
                        {attendant.averageServiceTimeSeconds
                          ? (attendant.averageServiceTimeSeconds / 60).toFixed(1)
                          : '-'}{' '}
                        min
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant="secondary"
                    className="text-lg"
                  >
                    {attendant.ticketsServed} atendimentos
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Placeholder para gráficos futuros */}
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <BarChart3 className="text-muted-foreground mb-4 h-12 w-12" />
          <h3 className="text-lg font-semibold">Gráficos em Breve</h3>
          <p className="text-muted-foreground max-w-md text-center">
            Gráficos de atendimentos por hora, evolução semanal e distribuição por categoria serão
            adicionados em uma atualização futura.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
