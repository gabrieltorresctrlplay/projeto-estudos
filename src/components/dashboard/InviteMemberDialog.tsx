import { useState } from 'react'
import { useOrganizationContext } from '@/contexts/OrganizationContext'
import { Loader2, Mail } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
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
  const { inviteMember, currentOrganization } = useOrganizationContext()
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<'admin' | 'member'>('member')
  const [isGeneric, setIsGeneric] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [inviteToken, setInviteToken] = useState<string | null>(null)

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const { token, error: inviteError } = await inviteMember(isGeneric ? null : email, role)

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
    setEmail('')
    setRole('member')
    setIsGeneric(false)
    setError(null)
    setInviteToken(null)
    onOpenChange(false)
  }

  const inviteLink = inviteToken
    ? `${window.location.origin}/accept-invite?token=${inviteToken}`
    : null

  const copyInviteLink = () => {
    if (inviteLink) {
      navigator.clipboard.writeText(inviteLink)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Convidar Membro</DialogTitle>
          <DialogDescription>
            Envie um convite para alguém se juntar à {currentOrganization?.name}.
          </DialogDescription>
        </DialogHeader>

        {!inviteToken ? (
          <form
            onSubmit={handleInvite}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="email">Email do convidado</Label>
              <Input
                id="email"
                type="email"
                placeholder="usuario@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading || isGeneric}
                required={!isGeneric}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="generic"
                checked={isGeneric}
                onCheckedChange={(checked: boolean) => setIsGeneric(checked === true)}
                disabled={loading}
              />
              <Label
                htmlFor="generic"
                className="cursor-pointer text-sm font-normal"
              >
                Link genérico (qualquer pessoa pode usar)
              </Label>
            </div>
            {isGeneric && (
              <div className="rounded border border-yellow-500/20 bg-yellow-500/10 p-2 text-xs text-yellow-700 dark:text-yellow-400">
                ⚠️ Link expira em <strong>5 minutos</strong>. Qualquer pessoa pode usar.
              </div>
            )}
            {!isGeneric && email && (
              <p className="text-muted-foreground text-xs">
                Este convite expira em <strong>24 horas</strong> e só pode ser usado por {email}.
              </p>
            )}

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
                  <SelectItem value="admin">Administrador</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-muted-foreground text-xs">
                {role === 'admin'
                  ? 'Administradores podem convidar e gerenciar membros.'
                  : 'Membros têm acesso básico à organização.'}
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
                disabled={loading || (!isGeneric && !email.trim())}
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Enviar Convite
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="bg-muted/50 flex items-center gap-2 rounded-lg p-4">
              <Mail className="text-primary h-5 w-5" />
              <div className="flex-1">
                <p className="text-sm font-medium">Convite enviado!</p>
                <p className="text-muted-foreground text-xs">
                  {inviteToken && email
                    ? `Compartilhe o link abaixo com ${email}`
                    : 'Compartilhe o link abaixo (expira em 5 minutos)'}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Link do Convite</Label>
              <div className="flex gap-2">
                <Input
                  value={inviteLink || ''}
                  readOnly
                  className="font-mono text-xs"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={copyInviteLink}
                >
                  Copiar
                </Button>
              </div>
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
