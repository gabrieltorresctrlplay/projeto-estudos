import { useState } from 'react'
import type { Company } from '@/types'
import { Building2, ChevronDown, Plus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { CreateCompanyDialog } from '@/components/ui/create-company-dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface CompanySelectorProps {
  companies: Company[]
  selectedCompany: Company | null
  onSelectCompany: (companyId: string) => void
  onCreateCompany: (name: string) => Promise<boolean>
  isLoading?: boolean
}

export function CompanySelector({
  companies,
  selectedCompany,
  onSelectCompany,
  onCreateCompany,
  isLoading = false,
}: CompanySelectorProps) {
  const navigate = useNavigate()
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const hasCompanies = companies.length > 0
  const isFirstCompany = companies.length === 0

  const handleSelectCompany = (companyId: string) => {
    // Find the index of the company
    const index = companies.findIndex((c) => c.id === companyId)
    if (index === -1) return

    onSelectCompany(companyId)
    navigate(`/dashboard/${index}`)
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="bg-background/50 hover:bg-accent flex items-center gap-2"
            disabled={isLoading}
          >
            <Building2 className="h-4 w-4" />
            <span className="max-w-[150px] truncate">
              {isLoading
                ? 'Carregando...'
                : hasCompanies && selectedCompany
                  ? selectedCompany.name
                  : 'Crie sua primeira empresa'}
            </span>
            <ChevronDown className="h-4 w-4 opacity-50" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="end"
          className="w-[240px]"
        >
          {hasCompanies ? (
            <>
              <DropdownMenuLabel>Suas Empresas</DropdownMenuLabel>
              <DropdownMenuSeparator />

              {companies.map((company) => (
                <DropdownMenuItem
                  key={company.id}
                  onClick={() => handleSelectCompany(company.id)}
                  className="cursor-pointer"
                >
                  <Building2 className="mr-2 h-4 w-4" />
                  <span className="flex-1 truncate">{company.name}</span>
                  {selectedCompany?.id === company.id && (
                    <span className="text-primary ml-2 text-xs">✓</span>
                  )}
                </DropdownMenuItem>
              ))}

              <DropdownMenuSeparator />

              <DropdownMenuItem
                onClick={() => setIsDialogOpen(true)}
                className="cursor-pointer"
              >
                <Plus className="mr-2 h-4 w-4" />
                <span>Criar nova empresa</span>
              </DropdownMenuItem>
            </>
          ) : (
            <>
              <DropdownMenuLabel>Bem-vindo!</DropdownMenuLabel>
              <DropdownMenuSeparator />

              <div className="text-muted-foreground px-2 py-3 text-sm">
                Você ainda não tem empresas cadastradas.
              </div>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                onClick={() => setIsDialogOpen(true)}
                className="cursor-pointer"
              >
                <Plus className="mr-2 h-4 w-4" />
                <span>Criar primeira empresa</span>
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <CreateCompanyDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onCreateCompany={onCreateCompany}
        isFirstCompany={isFirstCompany}
      />
    </>
  )
}
