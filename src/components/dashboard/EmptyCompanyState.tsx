import { useState } from 'react'
import { Building2, Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CreateCompanyDialog } from '@/components/ui/create-company-dialog'

interface EmptyCompanyStateProps {
  onCreateCompany: (name: string) => Promise<boolean>
}

export function EmptyCompanyState({ onCreateCompany }: EmptyCompanyStateProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  return (
    <>
      <div className="flex min-h-[60vh] items-center justify-center p-4">
        <Card className="w-full max-w-md border-dashed">
          <CardHeader className="text-center">
            <div className="bg-primary/10 mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
              <Building2 className="text-primary h-8 w-8" />
            </div>
            <CardTitle className="text-2xl">Bem-vindo!</CardTitle>
            <CardDescription className="text-base">
              Comece criando sua primeira empresa para acessar todas as funcionalidades do sistema.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button
              size="lg"
              onClick={() => setIsDialogOpen(true)}
              className="gap-2"
            >
              <Plus className="h-5 w-5" />
              Criar Primeira Empresa
            </Button>
          </CardContent>
        </Card>
      </div>

      <CreateCompanyDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onCreateCompany={onCreateCompany}
        isFirstCompany={true}
      />
    </>
  )
}
