import { useState } from 'react'

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

interface CreateCompanyDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreateCompany: (name: string) => Promise<boolean>
  isFirstCompany?: boolean
}

export function CreateCompanyDialog({
  open,
  onOpenChange,
  onCreateCompany,
  isFirstCompany = false,
}: CreateCompanyDialogProps) {
  const [companyName, setCompanyName] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleCreate = async () => {
    if (!companyName.trim()) {
      setError('Nome da empresa é obrigatório')
      return
    }

    setIsCreating(true)
    setError(null)

    const success = await onCreateCompany(companyName.trim())

    if (success) {
      setCompanyName('')
      onOpenChange(false)
    } else {
      setError('Erro ao criar empresa. Tente novamente.')
    }

    setIsCreating(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isCreating) {
      handleCreate()
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isFirstCompany ? 'Crie sua primeira empresa' : 'Nova Empresa'}</DialogTitle>
          <DialogDescription>
            {isFirstCompany
              ? 'Comece criando sua primeira empresa para acessar o sistema.'
              : 'Adicione uma nova empresa ao seu portfólio.'}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="company-name">Nome da Empresa</Label>
            <Input
              id="company-name"
              placeholder="Ex: Minha Empresa LTDA"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isCreating}
              autoFocus
            />
            {error && <p className="text-destructive text-sm">{error}</p>}
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isCreating}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleCreate}
            disabled={isCreating || !companyName.trim()}
          >
            {isCreating ? 'Criando...' : 'Criar Empresa'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
