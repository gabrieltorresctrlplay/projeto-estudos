import { useEffect, useState } from 'react'
import { useOrganizationContext } from '@/contexts/OrganizationContext'
import type { Invite, OrganizationMember } from '@/types'
import { Crown, Mail, Shield, Trash2, User, UserPlus } from 'lucide-react'

import { inviteService } from '@/lib/organizationService'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { InviteMemberDialog } from '@/components/dashboard/InviteMemberDialog'

export default function TeamMembers() {
  const { currentOrganization, currentMemberRole, memberships, user } = useOrganizationContext()
  const [members, setMembers] = useState<OrganizationMember[]>([])
  const [invites, setInvites] = useState<Invite[]>([])
  const [loading, setLoading] = useState(true)
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false)

  const canManageTeam = currentMemberRole === 'owner' || currentMemberRole === 'admin'

  // Load team members
  useEffect(() => {
    const loadTeamData = async () => {
      if (!currentOrganization) return

      setLoading(true)

      // This is a simplified version - in production you'd want to create
      // a service method to get all members of an organization
      // For now, we'll just show the current user's membership
      const currentMembership = memberships.find((m) => m.organizationId === currentOrganization.id)

      setMembers(currentMembership ? [currentMembership] : [])

      // Load pending invites
      if (canManageTeam) {
        const { data: invitesData } = await inviteService.getOrganizationInvites(
          currentOrganization.id,
        )
        setInvites(invitesData || [])
      }

      setLoading(false)
    }

    loadTeamData()
  }, [currentOrganization, memberships, canManageTeam])

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

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Equipe</h2>
          <p className="text-muted-foreground">
            Gerencie os membros de {currentOrganization?.name}
          </p>
        </div>
        {canManageTeam && (
          <Button onClick={() => setInviteDialogOpen(true)}>
            <UserPlus className="mr-2 h-4 w-4" />
            Convidar Membro
          </Button>
        )}
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
                className="flex items-center justify-between rounded-lg border p-4"
              >
                <div className="flex items-center gap-4">
                  <div className="bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-full">
                    <User className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium">{member.userId === user?.uid ? 'Você' : 'Membro'}</p>
                    <p className="text-muted-foreground text-sm">{member.userId}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getRoleBadge(member.role)}
                  {canManageTeam && member.userId !== user?.uid && member.role !== 'owner' && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive"
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
      {canManageTeam && invites.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Convites Pendentes</CardTitle>
            <CardDescription>{invites.length} convite(s) aguardando aceitação</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {invites.map((invite) => (
                <div
                  key={invite.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="bg-muted flex h-10 w-10 items-center justify-center rounded-full">
                      <Mail className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium">{invite.email}</p>
                      <p className="text-muted-foreground text-sm">
                        Expira em{' '}
                        {new Date(invite.expiresAt).toLocaleDateString('pt-BR', {
                          day: 'numeric',
                          month: 'short',
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">{getRoleBadge(invite.role)}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Invite Dialog */}
      <InviteMemberDialog
        open={inviteDialogOpen}
        onOpenChange={setInviteDialogOpen}
      />
    </div>
  )
}
