import { useEffect, useState } from 'react'
import { useOrganizationContext } from '@/features/organization/context/OrganizationContext'
import { useNavigate, useParams } from 'react-router-dom'

/**
 * Hook to sync the company index from URL with the OrganizationContext.
 * Use this in any dashboard sub-page that needs to ensure currentOrganization is set.
 *
 * @returns Object with loading state and redirect function
 */
export function useCompanySync() {
  const navigate = useNavigate()
  const { companyIndex } = useParams<{ companyIndex: string }>()
  const [isSyncing, setIsSyncing] = useState(true)

  const {
    memberships,
    currentOrganization,
    isLoading: orgsLoading,
    setCurrentOrganization,
  } = useOrganizationContext()

  useEffect(() => {
    // Wait for memberships to load
    if (orgsLoading) {
      setIsSyncing(true)
      return
    }

    // If no memberships, redirect to dashboard root
    if (memberships.length === 0) {
      navigate('/dashboard', { replace: true })
      setIsSyncing(false)
      return
    }

    // Parse index from URL
    const index = companyIndex ? parseInt(companyIndex, 10) : null

    // If no valid index, redirect to first org
    if (index === null || isNaN(index) || index < 0 || index >= memberships.length) {
      navigate('/dashboard/0', { replace: true })
      setIsSyncing(false)
      return
    }

    // Get organization at this index
    const targetMembership = memberships[index]

    // If current organization doesn't match the index, update selection
    if (!currentOrganization || currentOrganization.id !== targetMembership.organizationId) {
      setCurrentOrganization(targetMembership.organizationId)
    }

    setIsSyncing(false)
  }, [
    companyIndex,
    memberships,
    currentOrganization,
    orgsLoading,
    navigate,
    setCurrentOrganization,
  ])

  return {
    isSyncing: isSyncing || orgsLoading,
    companyIndex: companyIndex ? parseInt(companyIndex, 10) : 0,
  }
}
