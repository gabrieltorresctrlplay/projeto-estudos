import { useEffect, useState } from 'react'
import type { Company } from '@/types'

import { companyService, userPreferencesService } from '@/lib/firestore'

interface UseCompaniesReturn {
  companies: Company[]
  selectedCompany: Company | null
  isLoading: boolean
  error: Error | null
  createCompany: (name: string) => Promise<string | null>
  selectCompany: (companyId: string) => Promise<void>
  refreshCompanies: () => Promise<void>
}

export function useCompanies(userId: string | undefined): UseCompaniesReturn {
  const [companies, setCompanies] = useState<Company[]>([])
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  // Load companies and selected company
  const loadCompanies = async (selectCompanyId?: string) => {
    if (!userId) {
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      // Get user's companies
      const { data: companiesData, error: companiesError } =
        await companyService.getUserCompanies(userId)

      if (companiesError) {
        setError(companiesError)
        setIsLoading(false)
        return
      }

      setCompanies(companiesData || [])

      // Determine which company to select
      let companyToSelect: Company | null = null

      if (selectCompanyId) {
        // If a specific company ID was provided, select it
        companyToSelect = companiesData?.find((c) => c.id === selectCompanyId) || null
      } else {
        // Get user preferences to find selected company
        const { data: preferences } = await userPreferencesService.getUserPreferences(userId)

        if (preferences?.selectedCompanyId && companiesData) {
          companyToSelect =
            companiesData.find((c) => c.id === preferences.selectedCompanyId) || null
        }

        // If no company selected yet, auto-select first one
        if (!companyToSelect && companiesData && companiesData.length > 0) {
          companyToSelect = companiesData[0]
          await userPreferencesService.setSelectedCompany(userId, companiesData[0].id)
        }
      }

      setSelectedCompany(companyToSelect)
    } catch (err) {
      setError(err as Error)
    } finally {
      setIsLoading(false)
    }
  }

  // Create new company
  const createCompany = async (name: string): Promise<string | null> => {
    if (!userId) return null

    try {
      const { id, error: createError } = await companyService.createCompany(userId, name)

      if (createError || !id) {
        setError(createError)
        return null
      }

      // Save the new company as selected
      await userPreferencesService.setSelectedCompany(userId, id)

      // Reload companies and select the new one
      await loadCompanies(id)

      // Force a small delay to ensure state propagation
      await new Promise((resolve) => setTimeout(resolve, 50))

      return id
    } catch (err) {
      setError(err as Error)
      return null
    }
  }

  // Select a company
  const selectCompany = async (companyId: string) => {
    if (!userId) return

    // Find the company in current list
    const company = companies.find((c) => c.id === companyId)
    if (!company) {
      console.error('Company not found:', companyId)
      return
    }

    // Update state immediately for better UX
    setSelectedCompany(company)

    // Save to Firestore in background
    try {
      await userPreferencesService.setSelectedCompany(userId, companyId)
    } catch (err) {
      console.error('Error saving selected company:', err)
      setError(err as Error)
    }
  }

  // Refresh companies
  const refreshCompanies = async () => {
    await loadCompanies()
  }

  // Load companies on mount or when userId changes
  useEffect(() => {
    loadCompanies()
  }, [userId])

  return {
    companies,
    selectedCompany,
    isLoading,
    error,
    createCompany,
    selectCompany,
    refreshCompanies,
  }
}
