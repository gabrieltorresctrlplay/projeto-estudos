import { CompanyProvider, useCompanyContext } from '@/contexts/CompanyContext'
import { Outlet } from 'react-router-dom'

import { CompanySelector } from '@/components/ui/company-selector'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'

import { AppSidebar } from './AppSidebar'

function DashboardContent() {
  const { companies, selectedCompany, isLoading, createCompany, selectCompany } =
    useCompanyContext()

  // Wrapper to match CompanySelector's expected signature
  const handleCreateCompany = async (name: string): Promise<boolean> => {
    const result = await createCompany(name)
    return result !== null
  }

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
            selectedCompany={selectedCompany}
            onSelectCompany={selectCompany}
            onCreateCompany={handleCreateCompany}
            isLoading={isLoading}
          />
        </header>

        {/* Main content */}
        <div className="flex flex-1 flex-col gap-4 p-4">
          <div className="bg-muted/50 min-h-screen flex-1 rounded-xl p-4">
            <Outlet />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

export function DashboardLayout() {
  return (
    <CompanyProvider>
      <DashboardContent />
    </CompanyProvider>
  )
}
