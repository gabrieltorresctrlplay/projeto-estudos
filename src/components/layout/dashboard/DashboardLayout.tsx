import { useOrganizationContext } from '@/contexts/OrganizationContext'
import { Outlet } from 'react-router-dom'

import { CompanySelector } from '@/components/ui/company-selector'
import { PageTransition } from '@/components/ui/page-transition'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'

import { AppSidebar } from './AppSidebar'

export function DashboardLayout() {
  const {
    memberships,
    currentOrganization,
    isLoading,
    createOrganization,
    setCurrentOrganization,
  } = useOrganizationContext()

  // Wrapper to match CompanySelector's expected signature (temporary until we update the selector)
  const handleCreateCompany = async (name: string): Promise<boolean> => {
    const { orgId, error } = await createOrganization(name)
    return orgId !== null && !error
  }

  // Adapt memberships to Company format for CompanySelector (temporary)
  const companies = memberships.map((m) => m.organization!).filter(Boolean)
  const selectCompany = (companyId: string) => setCurrentOrganization(companyId)

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        {/* Header with trigger and company selector */}
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <div className="flex flex-1 items-center gap-2">
            <h1 className="text-lg font-semibold">Dashboard</h1>
          </div>

          {/* Company Selector */}
          <CompanySelector
            companies={companies}
            selectedCompany={currentOrganization}
            onSelectCompany={selectCompany}
            onCreateCompany={handleCreateCompany}
            isLoading={isLoading}
          />
        </header>

        {/* Main content */}
        <div className="flex flex-1 flex-col gap-4 p-4">
          <div className="bg-muted/50 min-h-screen flex-1 rounded-xl p-4">
            <PageTransition>
              <Outlet />
            </PageTransition>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
