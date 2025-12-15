import { useState } from 'react'
import type { OrganizationMember } from '@/types'
import { Building2, ChevronDown, Plus, Ticket } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { CreateCompanyDialog } from '@/components/ui/create-company-dialog'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface CompanySelectorProps {
  memberships: OrganizationMember[]
  selectedCompanyId: string | null
  onSelectCompany: (companyId: string) => void
  onCreateCompany: (name: string) => Promise<boolean>
  onJoinCompany: (token: string) => Promise<{ success: boolean; error: Error | null }>
  isLoading?: boolean
}

export function CompanySelector({
  memberships,
  selectedCompanyId,
  onSelectCompany,
  onCreateCompany,
  onJoinCompany,
  isLoading = false,
}: CompanySelectorProps) {
  const navigate = useNavigate()
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isJoinDialogOpen, setIsJoinDialogOpen] = useState(false)
  const [joinToken, setJoinToken] = useState('')
  const [joining, setJoining] = useState(false)
  const [joinError, setJoinError] = useState<string | null>(null)

  // Separate memberships by role
  const ownedCompanies = memberships.filter((m) => m.role === 'owner')
  const linkedCompanies = memberships.filter((m) => m.role !== 'owner')

  const hasCompanies = memberships.length > 0
  const selectedCompany = memberships.find(
    (m) => m.organizationId === selectedCompanyId,
  )?.organization

  const handleSelectCompany = (companyId: string) => {
    const index = memberships.findIndex((m) => m.organizationId === companyId)
    if (index === -1) return

    onSelectCompany(companyId)
    navigate(`/dashboard/${index}`)
  }

  const handleJoinCompany = async () => {
    if (!joinToken.trim()) return

    setJoining(true)
    setJoinError(null)

    const { success, error } = await onJoinCompany(joinToken.trim())

    if (error) {
      setJoinError(error.message)
      setJoining(false)
      return
    }

    if (success) {
      setIsJoinDialogOpen(false)
      setJoinToken('')
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="selector"
            className="flex items-center gap-2"
            disabled={isLoading}
          >
            <Building2 className="h-4 w-4" />
            <span className="max-w-[150px] truncate">
              {isLoading
                ? 'Carregando...'
                : hasCompanies && selectedCompany
                  ? selectedCompany.name
                  : 'Selecionar empresa'}
            </span>
            <ChevronDown className="h-4 w-4 opacity-50" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="end"
          className="w-[260px]"
        >
          {/* Owned companies section */}
          {ownedCompanies.length > 0 && (
            <>
              <DropdownMenuLabel className="text-muted-foreground text-xs">
                Suas Empresas
              </DropdownMenuLabel>
              {ownedCompanies.map((membership) => (
                <DropdownMenuItem
                  key={membership.id}
                  onClick={() => handleSelectCompany(membership.organizationId)}
                  className="cursor-pointer"
                >
                  <Building2 className="mr-2 h-4 w-4" />
                  <span className="flex-1 truncate">{membership.organization?.name}</span>
                  {selectedCompanyId === membership.organizationId && (
                    <span className="text-primary ml-2 text-xs">✓</span>
                  )}
                </DropdownMenuItem>
              ))}
            </>
          )}

          {/* Linked companies section */}
          {linkedCompanies.length > 0 && (
            <>
              {ownedCompanies.length > 0 && <DropdownMenuSeparator />}
              <DropdownMenuLabel className="text-muted-foreground text-xs">
                Vinculado
              </DropdownMenuLabel>
              {linkedCompanies.map((membership) => (
                <DropdownMenuItem
                  key={membership.id}
                  onClick={() => handleSelectCompany(membership.organizationId)}
                  className="cursor-pointer"
                >
                  <Building2 className="mr-2 h-4 w-4" />
                  <span className="flex-1 truncate">{membership.organization?.name}</span>
                  <span className="text-muted-foreground text-xs capitalize">
                    {membership.role === 'admin' ? 'Admin' : 'Membro'}
                  </span>
                  {selectedCompanyId === membership.organizationId && (
                    <span className="text-primary ml-2 text-xs">✓</span>
                  )}
                </DropdownMenuItem>
              ))}
            </>
          )}

          {/* Empty state */}
          {!hasCompanies && (
            <>
              <DropdownMenuLabel>Bem-vindo!</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="text-muted-foreground px-2 py-3 text-sm">
                Você ainda não tem empresas cadastradas.
              </div>
            </>
          )}

          <DropdownMenuSeparator />

          {/* Actions */}
          <DropdownMenuItem
            onClick={() => setIsCreateDialogOpen(true)}
            className="cursor-pointer"
          >
            <Plus className="mr-2 h-4 w-4" />
            <span>Criar nova empresa</span>
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => setIsJoinDialogOpen(true)}
            className="cursor-pointer"
          >
            <Ticket className="mr-2 h-4 w-4" />
            <span>Entrar com token</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Create Company Dialog */}
      <CreateCompanyDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onCreateCompany={onCreateCompany}
        isFirstCompany={!hasCompanies}
      />

      {/* Join Company Dialog */}
      <Dialog
        open={isJoinDialogOpen}
        onOpenChange={setIsJoinDialogOpen}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Entrar em uma Empresa</DialogTitle>
            <DialogDescription>
              Cole o token de convite que você recebeu para se vincular a uma empresa.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="joinToken">Token de Convite</Label>
              <Input
                id="joinToken"
                placeholder="Cole o token aqui"
                value={joinToken}
                onChange={(e) => setJoinToken(e.target.value)}
                disabled={joining}
              />
            </div>

            {joinError && (
              <div className="border-destructive/20 bg-destructive/10 text-destructive rounded border p-2 text-sm">
                {joinError}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsJoinDialogOpen(false)
                setJoinToken('')
                setJoinError(null)
              }}
              disabled={joining}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleJoinCompany}
              disabled={joining || !joinToken.trim()}
            >
              {joining ? 'Entrando...' : 'Entrar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
