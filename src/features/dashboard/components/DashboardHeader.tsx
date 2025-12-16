import { useOrganizationContext } from '@/features/organization/context/OrganizationContext'
import { CompanySelector } from '@/shared/components/ui/company-selector'
import { SidebarTrigger } from '@/shared/components/ui/sidebar'

interface DashboardHeaderProps {
  onCreateCompany: (name: string) => Promise<boolean>
  onJoinCompany: (token: string) => Promise<{ success: boolean; error: Error | null }>
}

export function DashboardHeader({ onCreateCompany, onJoinCompany }: DashboardHeaderProps) {
  const { memberships, currentOrganization, isLoading, setCurrentOrganization } =
    useOrganizationContext()

  return (
    <header className="border-border flex h-16 shrink-0 items-center gap-2 border border-l-0 px-4">
      <SidebarTrigger className="-ml-1" />
      <div className="flex flex-1 items-center gap-2">
        <h1 className="text-foreground font-semibold">Dashboard</h1>
      </div>

      {/* Company Selector */}
      <CompanySelector
        memberships={memberships}
        selectedCompanyId={currentOrganization?.id || null}
        onSelectCompany={setCurrentOrganization}
        onCreateCompany={onCreateCompany}
        onJoinCompany={onJoinCompany}
        isLoading={isLoading}
      />
    </header>
  )
}
