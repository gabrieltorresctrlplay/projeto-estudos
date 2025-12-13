import { createContext, useContext, useEffect, useState } from 'react'
import { useCompanies } from '@/hooks'
import type { Company } from '@/types'
import type { User as FirebaseUser } from 'firebase/auth'

import { authService } from '@/lib/auth'

interface CompanyContextType {
  companies: Company[]
  selectedCompany: Company | null
  isLoading: boolean
  error: Error | null
  createCompany: (name: string) => Promise<string | null>
  selectCompany: (companyId: string) => Promise<void>
  refreshCompanies: () => Promise<void>
  pendingCompanyId: string | null
}

const CompanyContext = createContext<CompanyContextType | null>(null)

export function CompanyProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null)
  const [pendingCompanyId, setPendingCompanyId] = useState<string | null>(null)

  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged((currentUser) => {
      setUser(currentUser)
    })
    return () => unsubscribe()
  }, [])

  const companyData = useCompanies(user?.uid)

  // Wrapper to track pending company creation
  const createCompanyWithTracking = async (name: string): Promise<string | null> => {
    const id = await companyData.createCompany(name)
    if (id) {
      setPendingCompanyId(id)
    }
    return id
  }

  // Clear pending ID when companies update and pending company is found
  useEffect(() => {
    if (pendingCompanyId && companyData.companies.length > 0) {
      const found = companyData.companies.find((c) => c.id === pendingCompanyId)
      if (found) {
        // Clear after a short delay to allow consumers to react
        setTimeout(() => setPendingCompanyId(null), 100)
      }
    }
  }, [companyData.companies, pendingCompanyId])

  return (
    <CompanyContext.Provider
      value={{
        ...companyData,
        createCompany: createCompanyWithTracking,
        pendingCompanyId,
      }}
    >
      {children}
    </CompanyContext.Provider>
  )
}

export function useCompanyContext() {
  const context = useContext(CompanyContext)
  if (!context) {
    throw new Error('useCompanyContext must be used within CompanyProvider')
  }
  return context
}
