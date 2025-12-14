import { useState } from 'react'
import { useOrganizationContext } from '@/contexts/OrganizationContext'
import { Check, Copy, Loader2, Ticket } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface InviteMemberDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function InviteMemberDialog({ open, onOpenChange }: InviteMemberDialogProps) {
  const { inviteMember, currentOrganization, currentMemberRole } = useOrganizationContext()
  const [role, setRole] = useState<'admin' | 'member'>('member')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [inviteToken, setInviteToken] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  // Admin can only invite members, Owner can invite both
  const canInviteAdmin = currentMemberRole === 'owner'

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const { token, error: inviteError } = await inviteMember(role)

    if (inviteError) {
      setError(inviteError.message)
      setLoading(false)
      return
    }

    if (token) {
      setInviteToken(token)
      setLoading(false)
    }
  }

  const handleClose = () => {
    setRole('member')
    setError(null)
    setInviteToken(null)
    setCopied(false)
    onOpenChange(false)
  }

  const copyToken = () => {
    if (inviteToken) {
      navigator.clipboard.writeText(inviteToken)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Gerar Token de Convite</DialogTitle>
          <DialogDescription>
            Gere um token para convidar alguém para {currentOrganization?.name}.
          </DialogDescription>
        </DialogHeader>

        {!inviteToken ? (
          <form
            onSubmit={handleInvite}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="role">Cargo</Label>
              <Select
                value={role}
                onValueChange={(value: string) => setRole(value as 'admin' | 'member')}
                disabled={loading}
              >
                <SelectTrigger id="role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="member">Membro</SelectItem>
                  {canInviteAdmin && <SelectItem value="admin">Administrador</SelectItem>}
                </SelectContent>
              </Select>
              <p className="text-muted-foreground text-xs">
                {role === 'admin'
                  ? 'Administradores podem convidar e gerenciar membros.'
                  : 'Membros têm acesso básico à organização.'}
              </p>
              {!canInviteAdmin && (
                <p className="text-muted-foreground text-xs italic">
                  Apenas proprietários podem convidar administradores.
                </p>
              )}
            </div>

            <div className="bg-muted/50 rounded-lg p-3 text-xs">
              <p className="text-muted-foreground">
                • O token expira em <strong>24 horas</strong>
              </p>
              <p className="text-muted-foreground">
                • Só pode ser usado <strong>uma vez</strong>
              </p>
            </div>

            {error && (
              <div className="border-destructive/20 bg-destructive/10 text-destructive rounded border p-2 text-sm">
                {error}
              </div>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={loading}
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Gerar Token
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="bg-muted/50 flex items-center gap-2 rounded-lg p-4">
              <Ticket className="text-primary h-5 w-5" />
              <div className="flex-1">
                <p className="text-sm font-medium">Token gerado!</p>
                <p className="text-muted-foreground text-xs">
                  Compartilhe este token com a pessoa que deseja convidar.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Token de Convite</Label>
              <div className="flex gap-2">
                <Input
                  value={inviteToken}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={copyToken}
                  className="shrink-0"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-muted-foreground text-xs">
                A pessoa deve colar este token na tela de Dashboard ou Onboarding.
              </p>
            </div>

            <DialogFooter>
              <Button onClick={handleClose}>Fechar</Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
