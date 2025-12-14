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
    acceptInvite,
  } = useOrganizationContext()

  // Wrapper to match CompanySelector's expected signature
  const handleCreateCompany = async (name: string): Promise<boolean> => {
    const { orgId, error } = await createOrganization(name)
    return orgId !== null && !error
  }

  // Wrapper for join company
  const handleJoinCompany = async (token: string) => {
    return await acceptInvite(token)
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        {/* Header with trigger and company selector */}
        <header className="flex h-16 shrink-0 items-center gap-4 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <div className="flex flex-1 items-center gap-2">
            <h1 className="type-h4 text-foreground">Dashboard</h1>
          </div>

          {/* Company Selector */}
          <CompanySelector
            memberships={memberships}
            selectedCompanyId={currentOrganization?.id || null}
            onSelectCompany={setCurrentOrganization}
            onCreateCompany={handleCreateCompany}
            onJoinCompany={handleJoinCompany}
            isLoading={isLoading}
          />
        </header>

        {/* Main content */}
        <main className="flex flex-1 flex-col gap-4 p-4 lg:p-6">
          <div className="bg-muted/30 min-h-screen flex-1 rounded-xl border border-dashed p-4 shadow-sm lg:p-6">
            <PageTransition>
              <Outlet />
            </PageTransition>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
