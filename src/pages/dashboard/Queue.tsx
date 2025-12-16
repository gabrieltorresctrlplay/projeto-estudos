import { useEffect, useState } from 'react'
import { useOrganizationContext } from '@/contexts/OrganizationContext'
import { Loader2, MonitorPlay, Plus, Settings, Tv, Users } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import type { Queue, ServiceCategory } from '@/types/queue'
import { queueService } from '@/lib/queueService'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { QueueSkeleton } from '@/components/skeletons/PageSkeleton'

export default function QueuePage() {
  const navigate = useNavigate()
  const { currentOrganization } = useOrganizationContext()

  const [queues, setQueues] = useState<Queue[]>([])

  const [isLoading, setIsLoading] = useState(true)
  const [isMonitorDialogOpen, setIsMonitorDialogOpen] = useState(false)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [newQueueName, setNewQueueName] = useState('')
  const [selectedQueueId, setSelectedQueueId] = useState<string | null>(null)

  useEffect(() => {
    if (!currentOrganization?.id) return

    const loadQueues = async () => {
      setIsLoading(true)
      const { data } = await queueService.getOrganizationQueues(currentOrganization.id)
      if (data) {
        setQueues(data)
        // Se há filas, buscar guichês da primeira
        if (data.length > 0) {
          setSelectedQueueId(data[0].id)
        }
      }
      setIsLoading(false)
    }

    loadQueues()
  }, [currentOrganization?.id])

  const handleCreateQueue = async () => {
    if (!currentOrganization?.id || !newQueueName.trim()) return

    setIsCreating(true)

    // Categorias padrão para começar
    const defaultCategories: Omit<ServiceCategory, 'id'>[] = [
      {
        name: 'Atendimento Geral',
        prefix: 'A',
        color: '#3b82f6',
        priority: 1,
        estimatedTime: 15,
        isActive: true,
      },
      {
        name: 'Preferencial',
        prefix: 'P',
        color: '#f59e0b',
        priority: 10,
        estimatedTime: 10,
        isActive: true,
      },
    ]

    const { queueId, error } = await queueService.createQueue(
      currentOrganization.id,
      newQueueName,
      defaultCategories as ServiceCategory[],
    )

    if (error) {
      toast.error('Erro ao criar fila', { description: error.message })
    } else if (queueId) {
      toast.success('Fila criada com sucesso!')
      setNewQueueName('')
      setIsCreateDialogOpen(false)

      // Criar guichês padrão
      for (let i = 1; i <= 3; i++) {
        await queueService.createCounter(queueId, currentOrganization.id, `Guichê ${i}`, i)
      }

      // Recarregar filas
      const { data } = await queueService.getOrganizationQueues(currentOrganization.id)
      if (data) setQueues(data)
    }

    setIsCreating(false)
  }

  const handleOpenMonitorDialog = (queueId: string) => {
    setSelectedQueueId(queueId)
    setIsMonitorDialogOpen(true)
  }

  if (isLoading) {
    return <QueueSkeleton />
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="from-foreground to-foreground/70 bg-linear-to-r bg-clip-text text-4xl font-bold tracking-tight text-transparent">
            Fila
          </h2>
          <p className="text-muted-foreground mt-2 text-lg">Gerencie sua fila de atendimento</p>
        </div>
        <Button
          onClick={() => setIsCreateDialogOpen(true)}
          className="shadow-md"
        >
          <Plus className="mr-2 h-4 w-4" />
          Nova Fila
        </Button>
      </div>

      {queues.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="text-muted-foreground mb-4 h-12 w-12" />
            <h3 className="text-lg font-semibold">Nenhuma fila criada</h3>
            <p className="text-muted-foreground mb-4">
              Crie sua primeira fila de atendimento para começar
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Criar Fila
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Filas existentes */}
          {/* Filas existentes */}
          {queues.map((queue) => (
            <Card
              key={queue.id}
              className="group"
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl">{queue.name}</CardTitle>
                    <CardDescription>
                      Criada em{' '}
                      {queue.createdAt?.toDate
                        ? queue.createdAt.toDate().toLocaleDateString('pt-BR')
                        : 'data desconhecida'}
                    </CardDescription>
                  </div>
                  <Badge
                    variant={queue.isActive ? 'default' : 'secondary'}
                    className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20"
                  >
                    {queue.isActive ? 'Ativa' : 'Inativa'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  {/* Monitores */}
                  <Card
                    className="border-border cursor-pointer"
                    onClick={() => handleOpenMonitorDialog(queue.id)}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">Monitores</CardTitle>
                        <MonitorPlay className="text-primary h-5 w-5" />
                      </div>
                      <CardDescription className="text-xs">
                        Visualize os painéis de chamada
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button
                        className="w-full transition-transform active:scale-95"
                        variant="outline"
                        size="sm"
                      >
                        Acessar
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Guichês */}
                  <Card
                    className="border-border cursor-pointer"
                    onClick={async () => {
                      const { data } = await queueService.getCounters(queue.id)
                      if (data && data.length > 0) {
                        navigate(`/queue/${queue.id}/counter/${data[0].id}`)
                      } else {
                        toast.error('Nenhum guichê configurado')
                      }
                    }}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">Guichês</CardTitle>
                        <Users className="text-primary h-5 w-5" />
                      </div>
                      <CardDescription className="text-xs">
                        Gerencie os guichês de atendimento
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button
                        className="w-full transition-transform active:scale-95"
                        variant="outline"
                        size="sm"
                      >
                        Acessar
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Configurações */}
                  <Card className="bg-muted cursor-not-allowed border-dashed opacity-60">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-muted-foreground text-base">
                          Configurações
                        </CardTitle>
                        <Settings className="text-muted-foreground h-5 w-5" />
                      </div>
                      <CardDescription className="text-xs">
                        Ajuste categorias e preferências
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button
                        className="w-full"
                        variant="ghost"
                        size="sm"
                        disabled
                      >
                        Em breve
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          ))}
        </>
      )}

      {/* Dialog de Criação */}
      <Dialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Criar Nova Fila</DialogTitle>
            <DialogDescription>Dê um nome para sua fila de atendimento</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="queueName">Nome da Fila</Label>
              <Input
                id="queueName"
                placeholder="Ex: Atendimento Principal"
                value={newQueueName}
                onChange={(e) => setNewQueueName(e.target.value)}
              />
            </div>
            <Button
              className="w-full"
              onClick={handleCreateQueue}
              disabled={isCreating || !newQueueName.trim()}
            >
              {isCreating ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Plus className="mr-2 h-4 w-4" />
              )}
              Criar Fila
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog de Monitores */}
      <Dialog
        open={isMonitorDialogOpen}
        onOpenChange={setIsMonitorDialogOpen}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Escolha o tipo de monitor</DialogTitle>
            <DialogDescription>
              Selecione qual tipo de monitor você deseja acessar
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4">
            <Card
              className="cursor-pointer transition-colors"
              onClick={() => {
                if (selectedQueueId) {
                  window.open(`/queue/${selectedQueueId}/totem`, '_blank')
                  setIsMonitorDialogOpen(false)
                }
              }}
            >
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Tv className="text-primary h-6 w-6" />
                  <div>
                    <CardTitle className="text-base">Totem</CardTitle>
                    <CardDescription className="text-xs">
                      Painel de autoatendimento para senhas
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button
                  className="w-full"
                  variant="default"
                >
                  Abrir Totem
                </Button>
              </CardContent>
            </Card>

            <Card
              className="cursor-pointer transition-colors"
              onClick={() => {
                if (selectedQueueId) {
                  window.open(`/queue/${selectedQueueId}/monitor`, '_blank')
                  setIsMonitorDialogOpen(false)
                }
              }}
            >
              <CardHeader>
                <div className="flex items-center gap-3">
                  <MonitorPlay className="text-primary h-6 w-6" />
                  <div>
                    <CardTitle className="text-base">Monitor de Chamada</CardTitle>
                    <CardDescription className="text-xs">
                      Painel de exibição de chamadas para TV
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button
                  className="w-full"
                  variant="default"
                >
                  Abrir Monitor
                </Button>
              </CardContent>
            </Card>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
