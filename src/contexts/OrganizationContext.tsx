import { createContext, useContext, useEffect, useState } from 'react'
import type { MemberRole, Organization, OrganizationMember } from '@/types'
import type { User as FirebaseUser } from 'firebase/auth'

import { authService } from '@/lib/auth'
import { inviteService, organizationService } from '@/lib/organizationService'

interface OrganizationContextType {
  // Auth State
  user: FirebaseUser | null

  // Organization State
  memberships: OrganizationMember[]
  currentOrganization: Organization | null
  currentMemberRole: MemberRole | null
  isLoading: boolean
  error: Error | null

  // Actions
  setCurrentOrganization: (orgId: string) => void
  createOrganization: (name: string) => Promise<{ orgId: string | null; error: Error | null }>
  inviteMember: (
    email: string | null,
    role: 'admin' | 'member',
  ) => Promise<{ token: string | null; error: Error | null }>
  acceptInvite: (token: string) => Promise<{ success: boolean; error: Error | null }>
  refreshMemberships: () => Promise<void>
}

const OrganizationContext = createContext<OrganizationContextType | null>(null)

export function OrganizationProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null)
  const [memberships, setMemberships] = useState<OrganizationMember[]>([])
  const [currentOrganization, setCurrentOrganizationState] = useState<Organization | null>(null)
  const [currentMemberRole, setCurrentMemberRole] = useState<MemberRole | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  // Load memberships when user changes
  const loadMemberships = async (userId: string) => {
    try {
      setIsLoading(true)
      setError(null)

      const { data, error: fetchError } = await organizationService.getUserMemberships(userId)

      if (fetchError) {
        setError(fetchError)
        return
      }

      setMemberships(data || [])

      // Auto-select organization
      if (data && data.length > 0) {
        // Try to restore last selected org from localStorage
        const lastOrgId = localStorage.getItem(`lastOrgId_${userId}`)
        const targetOrg = lastOrgId ? data.find((m) => m.organizationId === lastOrgId) : data[0]

        if (targetOrg?.organization) {
          setCurrentOrganizationState(targetOrg.organization)
          setCurrentMemberRole(targetOrg.role)
        }
      } else {
        // No memberships, clear state
        setCurrentOrganizationState(null)
        setCurrentMemberRole(null)
      }
    } catch (err) {
      setError(err as Error)
    } finally {
      setIsLoading(false)
    }
  }

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged(async (currentUser) => {
      setUser(currentUser)

      if (currentUser) {
        // Check for pending invite token (from /accept-invite flow)
        const pendingToken = sessionStorage.getItem('pendingInviteToken')

        if (pendingToken && currentUser.email) {
          // Auto-accept pending invite
          sessionStorage.removeItem('pendingInviteToken')

          const { error: acceptError } = await inviteService.acceptInvite(
            pendingToken,
            currentUser.uid,
            currentUser.email,
          )

          if (acceptError) {
            console.error('Failed to auto-accept invite:', acceptError)
          }
        }

        // Load memberships (will include newly accepted invite if successful)
        await loadMemberships(currentUser.uid)
      } else {
        // User logged out, clear state
        setMemberships([])
        setCurrentOrganizationState(null)
        setCurrentMemberRole(null)
        setIsLoading(false)
      }
    })

    return () => unsubscribe()
  }, [])

  // Set current organization
  const setCurrentOrganization = (orgId: string) => {
    const membership = memberships.find((m) => m.organizationId === orgId)

    if (!membership) {
      console.error('Organization not found in memberships:', orgId)
      return
    }

    if (membership.organization) {
      setCurrentOrganizationState(membership.organization)
      setCurrentMemberRole(membership.role)

      // Persist to localStorage
      if (user) {
        localStorage.setItem(`lastOrgId_${user.uid}`, orgId)
      }
    }
  }

  // Create organization
  const createOrganization = async (
    name: string,
  ): Promise<{ orgId: string | null; error: Error | null }> => {
    if (!user) {
      return { orgId: null, error: new Error('User not authenticated') }
    }

    const { orgId, error } = await organizationService.createOrganization(user.uid, name)

    if (orgId && !error) {
      // Manually update state to ensure immediate availability (avoid read latency)
      const newOrg: Organization = {
        id: orgId,
        name,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const newMembership: OrganizationMember = {
        id: 'temp-' + Date.now(), // Temporary ID until reload
        organizationId: orgId,
        userId: user.uid,
        role: 'owner',
        joinedAt: new Date(),
        organization: newOrg,
      }

      setMemberships((prev) => [...prev, newMembership])
      setCurrentOrganizationState(newOrg)
      setCurrentMemberRole('owner')
      if (user) {
        localStorage.setItem(`lastOrgId_${user.uid}`, orgId)
      }

      // Background reload to get real IDs and ensure consistency
      loadMemberships(user.uid)
    }

    return { orgId, error }
  }

  // Invite member
  const inviteMember = async (
    email: string | null,
    role: 'admin' | 'member',
  ): Promise<{ token: string | null; error: Error | null }> => {
    if (!user) {
      return { token: null, error: new Error('User not authenticated') }
    }

    if (!currentOrganization) {
      return { token: null, error: new Error('No organization selected') }
    }

    // Check if user has permission (owner or admin)
    if (currentMemberRole !== 'owner' && currentMemberRole !== 'admin') {
      return { token: null, error: new Error('Insufficient permissions to invite members') }
    }

    return await inviteService.createInvite(currentOrganization.id, email, role, user.uid)
  }

  // Accept invite
  const acceptInvite = async (
    token: string,
  ): Promise<{ success: boolean; error: Error | null }> => {
    if (!user || !user.email) {
      return { success: false, error: new Error('User not authenticated') }
    }

    const { memberId, error } = await inviteService.acceptInvite(token, user.uid, user.email)

    if (memberId && !error) {
      // Reload memberships to include new org
      await loadMemberships(user.uid)
      return { success: true, error: null }
    }

    return { success: false, error: error || new Error('Failed to accept invite') }
  }

  // Refresh memberships
  const refreshMemberships = async () => {
    if (user) {
      await loadMemberships(user.uid)
    }
  }

  return (
    <OrganizationContext.Provider
      value={{
        user,
        memberships,
        currentOrganization,
        currentMemberRole,
        isLoading,
        error,
        setCurrentOrganization,
        createOrganization,
        inviteMember,
        acceptInvite,
        refreshMemberships,
      }}
    >
      {children}
    </OrganizationContext.Provider>
  )
}

export function useOrganizationContext() {
  const context = useContext(OrganizationContext)
  if (!context) {
    throw new Error('useOrganizationContext must be used within OrganizationProvider')
  }
  return context
}
