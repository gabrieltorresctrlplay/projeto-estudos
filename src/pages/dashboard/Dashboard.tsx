import { useEffect, useState } from 'react'
import { useOrganizationContext } from '@/contexts/OrganizationContext'
import type { User as FirebaseUser } from 'firebase/auth'
import { useNavigate, useParams } from 'react-router-dom'

import { authService } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { CompanyOverview } from '@/components/dashboard/CompanyOverview'
import { EmptyCompanyState } from '@/components/dashboard/EmptyCompanyState'

export default function Dashboard() {
  const navigate = useNavigate()
  const { companyIndex } = useParams<{ companyIndex?: string }>()
  const [user, setUser] = useState<FirebaseUser | null>(null)
  const [authLoading, setAuthLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged((currentUser) => {
      setUser(currentUser)
      setAuthLoading(false)
    })
    return () => unsubscribe()
  }, [])

  const {
    memberships,
    currentOrganization,
    isLoading: orgsLoading,
    createOrganization,
    setCurrentOrganization,
    error,
  } = useOrganizationContext()

  // Wrapper to handle organization creation and navigation
  const handleCreateOrganization = async (name: string): Promise<boolean> => {
    const { orgId } = await createOrganization(name)
    return orgId !== null
  }

  // Redirect logic when organizations load or URL changes
  useEffect(() => {
    if (authLoading || orgsLoading || error) return

    // If no organizations, redirect to onboarding
    if (memberships.length === 0) {
      navigate('/onboarding', { replace: true })
      return
    }

    // Parse index from URL
    const index = companyIndex ? parseInt(companyIndex, 10) : null

    // If no index in URL or invalid index, redirect to first org (index 0)
    if (index === null || isNaN(index) || index < 0 || index >= memberships.length) {
      navigate('/dashboard/0', { replace: true })
      return
    }

    // Get organization at this index
    const targetMembership = memberships[index]

    // If current organization doesn't match the index, update selection
    if (!currentOrganization || currentOrganization.id !== targetMembership.organizationId) {
      setCurrentOrganization(targetMembership.organizationId)
    }
  }, [
    companyIndex,
    memberships,
    currentOrganization,
    authLoading,
    orgsLoading,
    navigate,
    setCurrentOrganization,
  ])

  // Show loading while checking auth or loading organizations
  if (authLoading || orgsLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <p className="text-destructive font-medium">Erro ao carregar organizações</p>
        <p className="text-muted-foreground text-sm">{error.message}</p>
        <Button onClick={() => window.location.reload()}>Tentar novamente</Button>
      </div>
    )
  }

  // Show empty state if no organization exists (redirect to onboarding)
  if (memberships.length === 0) {
    return <EmptyCompanyState onCreateCompany={handleCreateOrganization} />
  }

  // Show loading if we're redirecting or syncing
  const index = companyIndex ? parseInt(companyIndex, 10) : null
  const isValidIndex = index !== null && !isNaN(index) && index >= 0 && index < memberships.length
  const targetMembership = isValidIndex ? memberships[index] : null

  if (
    !currentOrganization ||
    !targetMembership ||
    currentOrganization.id !== targetMembership.organizationId
  ) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  // Show organization overview (pass Organization as Company for now)
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Página Inicial</h2>
        <p className="text-muted-foreground">
          Bem-vindo de volta, {user?.displayName || user?.email?.split('@')[0]}.
        </p>
      </div>

      <CompanyOverview company={currentOrganization as any} />
    </div>
  )
}
