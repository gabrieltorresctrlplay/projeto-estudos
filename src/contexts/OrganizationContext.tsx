import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
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
  isProcessingInvite: boolean // True while auto-accepting a pending invite
  error: Error | null

  // Actions
  setCurrentOrganization: (orgId: string) => void
  createOrganization: (name: string) => Promise<{ orgId: string | null; error: Error | null }>
  inviteMember: (role: 'admin' | 'member') => Promise<{ token: string | null; error: Error | null }>
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
  const [isProcessingInvite, setIsProcessingInvite] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  // Load memberships when user changes
  const loadMemberships = useCallback(async (userId: string) => {
    try {
      setIsLoading(true)
      setError(null)

      const { data, error: fetchError } = await organizationService.getUserMemberships(userId)

      // Check if the user ID matches the current user context (prevents race conditions on switch/logout)
      // Note: We can't easily access the 'latest' user state inside this async callback without a ref,
      // but we can check if the component is mounted or if the result is relevant.
      // For now, we rely on the fact that this is called from useEffect which handles cancellations by ignoring stales if we use a flag,
      // but simpler: just check auth.currentUser directly if imported, or trust the caller.
      // Better approach: Since we can't check 'isMounted' easily in functional components without a ref,
      // we will assume the caller ensures validity, but we handle the error gracefully.

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
  }, [])

  // Listen to auth state changes
  useEffect(() => {
    let isMounted = true

    const unsubscribe = authService.onAuthStateChanged(async (currentUser) => {
      if (!isMounted) return

      setUser(currentUser)

      if (currentUser) {
        // Check for pending invite token (from /accept-invite flow)
        const pendingToken = sessionStorage.getItem('pendingInviteToken')

        if (pendingToken && currentUser.email) {
          // Auto-accept pending invite
          setIsProcessingInvite(true)
          sessionStorage.removeItem('pendingInviteToken')

          const { error: acceptError } = await inviteService.acceptInvite(
            pendingToken,
            currentUser.uid,
            currentUser.email,
          )

          if (acceptError) {
            console.error('Failed to auto-accept invite:', acceptError)
          }
          if (isMounted) setIsProcessingInvite(false)
        }

        // Load memberships (will include newly accepted invite if successful)
        if (isMounted) await loadMemberships(currentUser.uid)
      } else {
        // User logged out, clear state
        setMemberships([])
        setCurrentOrganizationState(null)
        setCurrentMemberRole(null)
        setIsLoading(false)
      }
    })

    return () => {
      isMounted = false
      unsubscribe()
    }
  }, [loadMemberships])

  // Set current organization
  const setCurrentOrganization = useCallback(
    (orgId: string) => {
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
    },
    [memberships, user],
  )

  // Create organization
  const createOrganization = useCallback(
    async (name: string): Promise<{ orgId: string | null; error: Error | null }> => {
      if (!user) {
        return { orgId: null, error: new Error('User not authenticated') }
      }

      const { orgId, memberId, error } = await organizationService.createOrganization(
        user.uid,
        name,
      )

      if (orgId && memberId && !error) {
        // Manually update state to ensure immediate availability (avoid read latency)
        const newOrg: Organization = {
          id: orgId,
          name,
          createdAt: new Date(),
          updatedAt: new Date(),
        }

        const newMembership: OrganizationMember = {
          id: memberId, // Use real memberId
          organizationId: orgId,
          userId: user.uid,
          role: 'owner',
          joinedAt: new Date(),
          organization: newOrg,
        }

        setMemberships((prev) => [...prev, newMembership])
        setCurrentOrganizationState(newOrg)
        setCurrentMemberRole('owner')

        localStorage.setItem(`lastOrgId_${user.uid}`, orgId)

        // No need to reload immediately as we have the real IDs,
        // but beneficial to ensure server sync eventually.
        // We skip immediate reload to prevent UI flicker if the read is slower than the write propagation.
      }

      return { orgId, error }
    },
    [user], // Removed loadMemberships dependency as we don't call it immediately anymore
  )

  // Invite member
  const inviteMember = useCallback(
    async (role: 'admin' | 'member'): Promise<{ token: string | null; error: Error | null }> => {
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

      return await inviteService.createInvite(currentOrganization.id, role, user.uid)
    },
    [user, currentOrganization, currentMemberRole],
  )

  // Accept invite
  const acceptInvite = useCallback(
    async (token: string): Promise<{ success: boolean; error: Error | null }> => {
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
    },
    [user, loadMemberships],
  )

  // Refresh memberships
  const refreshMemberships = useCallback(async () => {
    if (user) {
      await loadMemberships(user.uid)
    }
  }, [user, loadMemberships])

  const value = useMemo(
    () => ({
      user,
      memberships,
      currentOrganization,
      currentMemberRole,
      isLoading,
      isProcessingInvite,
      error,
      setCurrentOrganization,
      createOrganization,
      inviteMember,
      acceptInvite,
      refreshMemberships,
    }),
    [
      user,
      memberships,
      currentOrganization,
      currentMemberRole,
      isLoading,
      isProcessingInvite,
      error,
      setCurrentOrganization,
      createOrganization,
      inviteMember,
      acceptInvite,
      refreshMemberships,
    ],
  )

  return <OrganizationContext.Provider value={value}>{children}</OrganizationContext.Provider>
}

export function useOrganizationContext() {
  const context = useContext(OrganizationContext)
  if (!context) {
    throw new Error('useOrganizationContext must be used within OrganizationProvider')
  }
  return context
}
