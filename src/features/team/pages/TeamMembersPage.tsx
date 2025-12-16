import { useEffect, useState } from 'react'
import { InviteMemberDialog } from '@/features/organization/components/InviteMemberDialog'
import { useOrganizationContext } from '@/features/organization/context/OrganizationContext'
import {
  inviteService,
  organizationService,
} from '@/features/organization/services/organizationService'
import { TeamMembersSkeleton } from '@/shared/components/feedback/PageSkeleton'
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
import { useCompanySync } from '@/shared/hooks/useCompanySync'
import type { Invite, OrganizationMember, UserProfile } from '@/shared/types'
import { Check, Copy, Crown, LogOut, Shield, Ticket, Trash2, User, UserPlus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

// Extended member type with user profile
type MemberWithUser = OrganizationMember & { user?: UserProfile }

export default function TeamMembers() {
  const navigate = useNavigate()

  // Sync company index from URL with context
  const { isSyncing } = useCompanySync()

  const { currentOrganization, currentMemberRole, user, refreshMemberships } =
    useOrganizationContext()
  const [members, setMembers] = useState<MemberWithUser[]>([])
  const [invites, setInvites] = useState<Invite[]>([])
  const [loading, setLoading] = useState(true)
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false)
  const [copiedToken, setCopiedToken] = useState<string | null>(null)
  const [deletingInvite, setDeletingInvite] = useState<string | null>(null)
  const [deletingAll, setDeletingAll] = useState(false)
  const [leaving, setLeaving] = useState(false)

  // Permission checks
  const isOwner = currentMemberRole === 'owner'
  const isAdmin = currentMemberRole === 'admin'
  const canManageTeam = isOwner || isAdmin
  const canLeave = !isOwner // Everyone except owner can leave

  // Load team members
  useEffect(() => {
    const loadTeamData = async () => {
      if (!currentOrganization) {
        setLoading(false)
        return
      }

      setLoading(true)

      // Get all organization members with user profiles
      const { data: membersData } = await organizationService.getOrganizationMembers(
        currentOrganization.id,
      )
      setMembers(membersData || [])

      // Load pending invites if can manage
      if (canManageTeam) {
        const { data: invitesData } = await inviteService.getOrganizationInvites(
          currentOrganization.id,
        )
        // Admin can only see member invites, owner sees all
        const filteredInvites = isOwner
          ? invitesData
          : invitesData?.filter((i) => i.role === 'member')
        setInvites(filteredInvites || [])
      }

      setLoading(false)
    }

    loadTeamData()
  }, [currentOrganization, canManageTeam])

  const copyToken = (token: string) => {
    navigator.clipboard.writeText(token)
    setCopiedToken(token)
    setTimeout(() => setCopiedToken(null), 2000)
  }

  const handleDeleteInvite = async (inviteId: string) => {
    setDeletingInvite(inviteId)
    await inviteService.deleteInvite(inviteId)
    setInvites((prev) => prev.filter((i) => i.id !== inviteId))
    setDeletingInvite(null)
  }

  const handleDeleteAllInvites = async () => {
    if (!currentOrganization) return

    setDeletingAll(true)
    await inviteService.deleteAllOrganizationInvites(currentOrganization.id)
    setInvites([])
    setDeletingAll(false)
  }

  // Check if current user can remove a specific member
  const canRemoveMember = (memberRole: string) => {
    if (memberRole === 'owner') return false // Cannot remove owner
    if (isOwner) return true // Owner can remove anyone except owner
    if (isAdmin && memberRole === 'member') return true // Admin can only remove members
    return false
  }

  const handleRemoveMember = async (memberId: string, memberName: string) => {
    const confirmed = window.confirm(`Tem certeza que deseja remover "${memberName}" da equipe?`)
    if (!confirmed) return

    await organizationService.removeMember(memberId)
    setMembers((prev) => prev.filter((m) => m.id !== memberId))
  }

  // Handle leaving the organization
  const handleLeaveOrganization = async () => {
    const confirmed = window.confirm(
      `Tem certeza que deseja sair de "${currentOrganization?.name}"? Esta ação não pode ser desfeita.`,
    )
    if (!confirmed) return

    // Find my membership
    const myMembership = members.find((m) => m.userId === user?.uid)
    if (!myMembership) return

    setLeaving(true)
    await organizationService.removeMember(myMembership.id)
    await refreshMemberships()
    navigate('/dashboard')
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner':
        return <Crown className="h-4 w-4" />
      case 'admin':
        return <Shield className="h-4 w-4" />
      default:
        return <User className="h-4 w-4" />
    }
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'owner':
        return (
          <Badge
            variant="default"
            className="gap-1"
          >
            {getRoleIcon(role)} Proprietário
          </Badge>
        )
      case 'admin':
        return (
          <Badge
            variant="secondary"
            className="gap-1"
          >
            {getRoleIcon(role)} Admin
          </Badge>
        )
      default:
        return (
          <Badge
            variant="outline"
            className="gap-1"
          >
            {getRoleIcon(role)} Membro
          </Badge>
        )
    }
  }

  if (loading || isSyncing) {
    return <TeamMembersSkeleton />
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="from-foreground to-foreground/70 bg-linear-to-r bg-clip-text text-4xl font-bold tracking-tight text-transparent">
            Equipe
          </h2>
          <p className="text-muted-foreground mt-2 text-lg">
            Gerencie os membros de {currentOrganization?.name}
          </p>
        </div>
        <div className="flex gap-2">
          {canLeave && (
            <Button
              variant="outline"
              onClick={handleLeaveOrganization}
              disabled={leaving}
              className="text-destructive hover:text-destructive"
            >
              <LogOut className="mr-2 h-4 w-4" />
              {leaving ? 'Saindo...' : 'Sair da Empresa'}
            </Button>
          )}
          {canManageTeam && (
            <Button onClick={() => setInviteDialogOpen(true)}>
              <UserPlus className="mr-2 h-4 w-4" />
              Gerar Convite
            </Button>
          )}
        </div>
      </div>

      {/* Members List */}
      <Card>
        <CardHeader>
          <CardTitle>Membros Ativos</CardTitle>
          <CardDescription>{members.length} membro(s) na organização</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {members.map((member) => (
              <div
                key={member.id}
                className="group border-border hover:bg-muted flex items-center justify-between rounded-lg border p-4 transition-all"
              >
                <div className="flex items-center gap-4">
                  {/* Avatar */}
                  {member.user?.photoURL ? (
                    <img
                      src={member.user.photoURL}
                      alt={member.user.displayName || 'Avatar'}
                      className="h-10 w-10 rounded-full object-cover ring-2 ring-transparent transition-all"
                    />
                  ) : (
                    <FeatureIcon
                      icon={User}
                      className="h-10 w-10"
                      iconClassName="h-5 w-5"
                    />
                  )}
                  {/* Name and email */}
                  <div>
                    <p className="font-medium">
                      {member.userId === user?.uid ? 'Você' : member.user?.displayName || 'Membro'}
                    </p>
                    <p className="text-muted-foreground text-sm transition-colors">
                      {member.user?.email || member.userId}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getRoleBadge(member.role)}
                  {member.userId !== user?.uid && canRemoveMember(member.role) && (
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Remover ${member.user?.displayName || 'membro'}`}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10 opacity-0 transition-all group-hover:opacity-100 active:scale-95"
                      onClick={() =>
                        handleRemoveMember(member.id, member.user?.displayName || 'Membro')
                      }
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Pending Invites */}
      {canManageTeam && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Convites Pendentes</CardTitle>
              <CardDescription>{invites.length} convite(s) aguardando aceitação</CardDescription>
            </div>
            {invites.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleDeleteAllInvites}
                disabled={deletingAll}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {deletingAll ? 'Apagando...' : 'Apagar Todos'}
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {invites.length === 0 ? (
              <p className="text-muted-foreground py-4 text-center text-sm">
                Nenhum convite pendente
              </p>
            ) : (
              <div className="space-y-4">
                {invites.map((invite) => (
                  <div
                    key={invite.id}
                    className="flex items-center justify-between rounded-lg border p-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="bg-muted flex h-10 w-10 items-center justify-center rounded-full">
                        <Ticket className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <code className="bg-muted rounded px-2 py-0.5 font-mono text-xs">
                            {invite.token.slice(0, 8)}...
                          </code>
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label="Copiar token do convite"
                            className="h-6 w-6"
                            onClick={() => copyToken(invite.token)}
                          >
                            {copiedToken === invite.token ? (
                              <Check className="text-primary h-3 w-3" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                        <p className="text-muted-foreground text-xs">
                          Expira em{' '}
                          {new Date(invite.expiresAt).toLocaleDateString('pt-BR', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getRoleBadge(invite.role)}
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Excluir convite"
                        onClick={() => handleDeleteInvite(invite.id)}
                        disabled={deletingInvite === invite.id}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Invite Dialog */}
      <InviteMemberDialog
        open={inviteDialogOpen}
        onOpenChange={(open) => {
          setInviteDialogOpen(open)
          // Reload invites after closing dialog
          if (!open && currentOrganization) {
            inviteService.getOrganizationInvites(currentOrganization.id).then(({ data }) => {
              setInvites(data || [])
            })
          }
        }}
      />
    </div>
  )
}
