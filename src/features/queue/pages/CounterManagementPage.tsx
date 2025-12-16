import { useEffect, useState } from 'react'
import { useOrganizationContext } from '@/features/organization/context/OrganizationContext'
import { organizationService } from '@/features/organization/services/organizationService'
import { counterService, queueManagementService } from '@/features/queue/services/queueService'
import type { Counter, Queue } from '@/features/queue/types/queue'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog'
import { FeatureIcon } from '@/shared/components/ui/feature-icon'
import type { OrganizationMember, UserProfile } from '@/shared/types'
import {
  AlertCircle,
  ArrowLeft,
  Loader2,
  Monitor,
  Plus,
  Trash2,
  User,
  UserCheck,
  UserMinus,
  Users,
} from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'

type MemberWithUser = OrganizationMember & { user?: UserProfile }

export default function CounterManagementPage() {
  const { queueId } = useParams<{ queueId: string }>()
  const navigate = useNavigate()
  const { currentOrganization, currentMemberRole } = useOrganizationContext()

  const [queue, setQueue] = useState<Queue | null>(null)
  const [counters, setCounters] = useState<Counter[]>([])
  const [members, setMembers] = useState<MemberWithUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)

  // Dialog state
  const [assignDialogOpen, setAssignDialogOpen] = useState(false)
  const [selectedCounter, setSelectedCounter] = useState<Counter | null>(null)

  // Permission check
  const isOwner = currentMemberRole === 'owner'
  const isAdmin = currentMemberRole === 'admin'
  const canManage = isOwner || isAdmin

  useEffect(() => {
    if (!queueId || !currentOrganization?.id) return

    const loadData = async () => {
      setIsLoading(true)

      const [queueRes, countersRes, membersRes] = await Promise.all([
        queueManagementService.getQueue(queueId),
        counterService.getCounters(queueId),
        organizationService.getOrganizationMembers(currentOrganization.id),
      ])

      if (queueRes.data) setQueue(queueRes.data)
      if (countersRes.data) setCounters(countersRes.data)
      if (membersRes.data) setMembers(membersRes.data)

      setIsLoading(false)
    }

    loadData()
  }, [queueId, currentOrganization?.id])

  const handleAssign = async (member: MemberWithUser) => {
    if (!queueId || !selectedCounter) return

    setIsProcessing(true)
    const { error } = await counterService.assignCounterToUser(
      queueId,
      selectedCounter.id,
      member.userId,
      member.user?.displayName || member.user?.email || 'Funcionário',
    )

    if (error) {
      toast.error('Erro ao atribuir', { description: error.message })
    } else {
      toast.success(
        `${selectedCounter.name} atribuído a ${member.user?.displayName || 'Funcionário'}`,
      )
      // Atualizar lista local
      setCounters((prev) =>
        prev.map((c) =>
          c.id === selectedCounter.id
            ? {
                ...c,
                assignedUserId: member.userId,
                assignedUserName: member.user?.displayName || member.user?.email || 'Funcionário',
              }
            : c,
        ),
      )
    }

    setIsProcessing(false)
    setAssignDialogOpen(false)
    setSelectedCounter(null)
  }

  const handleUnassign = async (counter: Counter) => {
    if (!queueId) return

    setIsProcessing(true)
    const { error } = await counterService.unassignCounter(queueId, counter.id)

    if (error) {
      toast.error('Erro ao remover atribuição', { description: error.message })
    } else {
      toast.success(`Atribuição removida de ${counter.name}`)
      setCounters((prev) =>
        prev.map((c) =>
          c.id === counter.id
            ? { ...c, assignedUserId: undefined, assignedUserName: undefined }
            : c,
        ),
      )
    }

    setIsProcessing(false)
  }

  const handleAddCounter = async () => {
    if (!queueId || !currentOrganization?.id) return

    setIsProcessing(true)
    const nextNumber = counters.length + 1
    const { counterId, error } = await counterService.createCounter(
      queueId,
      currentOrganization.id,
      `Guichê ${nextNumber}`,
      nextNumber,
    )

    if (error) {
      toast.error('Erro ao criar guichê', { description: error.message })
    } else if (counterId) {
      toast.success(`Guichê ${nextNumber} criado`)
      // Recarregar
      const { data } = await counterService.getCounters(queueId)
      if (data) setCounters(data)
    }

    setIsProcessing(false)
  }

  const handleDeleteCounter = async (counter: Counter) => {
    if (!queueId) return

    const confirmed = window.confirm(
      `Tem certeza que deseja excluir "${counter.name}"? Esta ação não pode ser desfeita.`,
    )
    if (!confirmed) return

    setIsProcessing(true)
    const { error } = await counterService.deleteCounter(queueId, counter.id)

    if (error) {
      toast.error('Erro ao excluir guichê', { description: error.message })
    } else {
      toast.success(`${counter.name} excluído`)
      setCounters((prev) => prev.filter((c) => c.id !== counter.id))
    }

    setIsProcessing(false)
  }

  const openAssignDialog = (counter: Counter) => {
    setSelectedCounter(counter)
    setAssignDialogOpen(true)
  }

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

  if (!canManage) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 p-8">
        <AlertCircle className="text-destructive h-16 w-16" />
        <h1 className="text-2xl font-bold">Acesso Negado</h1>
        <p className="text-muted-foreground">Apenas administradores podem gerenciar guichês.</p>
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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
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
              Gerenciar Guichês
            </h2>
            <p className="text-muted-foreground mt-2 text-lg">{queue?.name}</p>
          </div>
        </div>
        <Button
          onClick={handleAddCounter}
          disabled={isProcessing}
        >
          <Plus className="mr-2 h-4 w-4" />
          Novo Guichê
        </Button>
      </div>

      {/* Counters Grid */}
      {counters.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Monitor className="text-muted-foreground mb-4 h-12 w-12" />
            <h3 className="text-lg font-semibold">Nenhum guichê criado</h3>
            <p className="text-muted-foreground mb-4">
              Crie guichês para que os funcionários possam atender
            </p>
            <Button
              onClick={handleAddCounter}
              disabled={isProcessing}
            >
              <Plus className="mr-2 h-4 w-4" />
              Criar Guichê
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {counters.map((counter) => (
            <Card
              key={counter.id}
              className="group overflow-hidden"
            >
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-3">
                    <FeatureIcon
                      icon={Monitor}
                      className="h-10 w-10"
                      iconClassName="h-5 w-5"
                    />
                    {counter.name}
                  </CardTitle>
                  {getStatusBadge(counter.status)}
                </div>
                <CardDescription>
                  {counter.ticketsServedToday || 0} atendimentos hoje
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Assigned User */}
                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="text-muted-foreground mb-2 text-xs font-medium tracking-wider uppercase">
                    Atribuído a
                  </p>
                  {counter.assignedUserId ? (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="bg-primary/10 flex h-8 w-8 items-center justify-center rounded-full">
                          <User className="text-primary h-4 w-4" />
                        </div>
                        <span className="font-medium">{counter.assignedUserName}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100"
                        onClick={() => handleUnassign(counter)}
                        disabled={isProcessing}
                      >
                        <UserMinus className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="text-muted-foreground flex items-center gap-2 text-sm">
                      <Users className="h-4 w-4" />
                      <span>Qualquer funcionário pode operar</span>
                    </div>
                  )}
                </div>

                {/* Current Attendant (if different from assigned) */}
                {counter.attendantId && counter.attendantId !== counter.assignedUserId && (
                  <div className="flex items-center gap-2 text-sm">
                    <UserCheck className="h-4 w-4 text-green-600" />
                    <span>
                      <span className="text-muted-foreground">Operando agora: </span>
                      {counter.attendantName}
                    </span>
                  </div>
                )}

                {/* Current Ticket */}
                {counter.currentTicketCode && (
                  <div className="flex items-center gap-2 text-sm">
                    <Badge variant="outline">{counter.currentTicketCode}</Badge>
                    <span className="text-muted-foreground">em atendimento</span>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => openAssignDialog(counter)}
                    disabled={isProcessing}
                  >
                    <User className="mr-2 h-4 w-4" />
                    {counter.assignedUserId ? 'Reassignar' : 'Atribuir'}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => handleDeleteCounter(counter)}
                    disabled={isProcessing || counter.status === 'open'}
                    title={
                      counter.status === 'open'
                        ? 'Feche o guichê antes de excluir'
                        : 'Excluir guichê'
                    }
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Assign Dialog */}
      <Dialog
        open={assignDialogOpen}
        onOpenChange={setAssignDialogOpen}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Atribuir {selectedCounter?.name}</DialogTitle>
            <DialogDescription>
              Selecione um membro da equipe para atribuir a este guichê
            </DialogDescription>
          </DialogHeader>

          <div className="max-h-80 space-y-2 overflow-y-auto">
            {/* Option: No assignment (anyone can operate) */}
            <div
              className="hover:bg-muted flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors"
              onClick={() => {
                if (selectedCounter) handleUnassign(selectedCounter)
                setAssignDialogOpen(false)
              }}
            >
              <div className="bg-muted flex h-10 w-10 items-center justify-center rounded-full">
                <Users className="text-muted-foreground h-5 w-5" />
              </div>
              <div>
                <p className="font-medium">Sem atribuição</p>
                <p className="text-muted-foreground text-sm">Qualquer funcionário pode operar</p>
              </div>
            </div>

            {/* Team members */}
            {members.map((member) => (
              <div
                key={member.id}
                className="hover:bg-muted flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors"
                onClick={() => handleAssign(member)}
              >
                {member.user?.photoURL ? (
                  <img
                    src={member.user.photoURL}
                    alt={member.user.displayName || ''}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                ) : (
                  <FeatureIcon
                    icon={User}
                    className="h-10 w-10"
                    iconClassName="h-5 w-5"
                  />
                )}
                <div className="flex-1">
                  <p className="font-medium">{member.user?.displayName || 'Membro'}</p>
                  <p className="text-muted-foreground text-sm">{member.user?.email}</p>
                </div>
                <Badge
                  variant="outline"
                  className="capitalize"
                >
                  {member.role === 'owner'
                    ? 'Proprietário'
                    : member.role === 'admin'
                      ? 'Admin'
                      : 'Membro'}
                </Badge>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
