import { useOrganizationContext } from '@/features/organization/context/OrganizationContext'
import { PageTransition } from '@/shared/components/ui/page-transition'
import { SidebarInset, SidebarProvider } from '@/shared/components/ui/sidebar'
import { Outlet } from 'react-router-dom'

import { AppSidebar } from './AppSidebar'
import { DashboardHeader } from './DashboardHeader'

export function DashboardLayout() {
  const { createOrganization, acceptInvite } = useOrganizationContext()

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
        <DashboardHeader
          onCreateCompany={handleCreateCompany}
          onJoinCompany={handleJoinCompany}
        />

        {/* Main content */}
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden p-4">
          <div className="flex min-h-0 flex-1 flex-col">
            <PageTransition>
              <Outlet />
            </PageTransition>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
