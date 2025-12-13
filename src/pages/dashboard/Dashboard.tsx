import { useEffect, useState } from 'react'
import { useCompanyContext } from '@/contexts/CompanyContext'
import type { User as FirebaseUser } from 'firebase/auth'
import { useNavigate, useParams } from 'react-router-dom'

import { authService } from '@/lib/auth'
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
    companies,
    selectedCompany,
    isLoading: companiesLoading,
    createCompany,
    selectCompany,
    pendingCompanyId,
  } = useCompanyContext()

  // Wrapper to handle company creation and navigation
  const handleCreateCompany = async (name: string): Promise<boolean> => {
    const newCompanyId = await createCompany(name)
    return newCompanyId !== null
  }

  // Navigate to new company when it appears in the list
  useEffect(() => {
    if (pendingCompanyId && companies.length > 0) {
      const newIndex = companies.findIndex((c) => c.id === pendingCompanyId)
      if (newIndex !== -1) {
        navigate(`/dashboard/${newIndex}`, { replace: true })
      }
    }
  }, [companies, pendingCompanyId, navigate])

  // Redirect logic when companies load or URL changes
  useEffect(() => {
    if (authLoading || companiesLoading) return

    // If no companies, don't redirect
    if (companies.length === 0) return

    // Parse index from URL
    const index = companyIndex ? parseInt(companyIndex, 10) : null

    // If no index in URL or invalid index, redirect to first company (index 0)
    if (index === null || isNaN(index) || index < 0 || index >= companies.length) {
      navigate('/dashboard/0', { replace: true })
      return
    }

    // Get company at this index
    const targetCompany = companies[index]

    // If selected company doesn't match the index, update selection
    if (!selectedCompany || selectedCompany.id !== targetCompany.id) {
      selectCompany(targetCompany.id)
    }
  }, [
    companyIndex,
    companies,
    selectedCompany,
    authLoading,
    companiesLoading,
    navigate,
    selectCompany,
  ])

  // Show loading while checking auth or loading companies
  if (authLoading || companiesLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  // Show empty state if no company exists
  if (companies.length === 0) {
    return <EmptyCompanyState onCreateCompany={handleCreateCompany} />
  }

  // Show loading if we're redirecting or syncing
  const index = companyIndex ? parseInt(companyIndex, 10) : null
  const isValidIndex = index !== null && !isNaN(index) && index >= 0 && index < companies.length
  const targetCompany = isValidIndex ? companies[index] : null

  if (!selectedCompany || !targetCompany || selectedCompany.id !== targetCompany.id) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  // Show company overview
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Página Inicial</h2>
        <p className="text-muted-foreground">
          Bem-vindo de volta, {user?.displayName || user?.email?.split('@')[0]}.
        </p>
      </div>

      <CompanyOverview company={selectedCompany} />
    </div>
  )
}
