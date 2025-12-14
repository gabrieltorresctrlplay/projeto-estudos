import type { Invite, MemberRole, Organization, OrganizationMember, UserProfile } from '@/types'
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  updateDoc,
  where,
  type Timestamp,
} from 'firebase/firestore'
import { v4 as uuidv4 } from 'uuid'

import { db } from './firebase'
import { userService } from './userService'

/**
 * Organization Service - Multi-Tenant SaaS Operations
 * Handles organizations, memberships (N:N pivot table), and invites
 */

// ============================================
// Organization CRUD
// ============================================

export const organizationService = {
  /**
   * Create a new organization and automatically create owner membership
   */
  createOrganization: async (
    userId: string,
    name: string,
  ): Promise<{ orgId: string | null; memberId: string | null; error: Error | null }> => {
    try {
      const now = new Date()

      // 1. Create organization
      const orgData = {
        name,
        createdAt: now,
        updatedAt: now,
      }
      const orgRef = await addDoc(collection(db, 'organizations'), orgData)

      // 2. Create owner membership
      const memberData = {
        organizationId: orgRef.id,
        userId,
        role: 'owner' as MemberRole,
        joinedAt: now,
      }
      const memberRef = await addDoc(collection(db, 'organization_members'), memberData)

      return { orgId: orgRef.id, memberId: memberRef.id, error: null }
    } catch (error) {
      return { orgId: null, memberId: null, error: error as Error }
    }
  },

  /**
   * Get all memberships for a user (WITH joined organization data)
   * Deduplicates by organizationId to prevent UI issues from invalid data
   */
  getUserMemberships: async (
    userId: string,
  ): Promise<{ data: OrganizationMember[] | null; error: Error | null }> => {
    try {
      // Query organization_members WHERE userId == userId
      const q = query(collection(db, 'organization_members'), where('userId', '==', userId))
      const memberSnapshot = await getDocs(q)

      // Fetch organization data for each membership
      const memberships: OrganizationMember[] = await Promise.all(
        memberSnapshot.docs.map(async (memberDoc) => {
          const memberData = memberDoc.data()
          const orgId = memberData.organizationId as string

          // Fetch organization details
          const orgDoc = await getDoc(doc(db, 'organizations', orgId))
          const orgData = orgDoc.exists() ? orgDoc.data() : null

          return {
            id: memberDoc.id,
            organizationId: orgId,
            userId: memberData.userId as string,
            role: memberData.role as MemberRole,
            joinedAt: (memberData.joinedAt as Timestamp)?.toDate() || new Date(),
            organization: orgData
              ? {
                  id: orgDoc.id,
                  name: orgData.name as string,
                  createdAt: (orgData.createdAt as Timestamp)?.toDate() || new Date(),
                  updatedAt: (orgData.updatedAt as Timestamp)?.toDate() || new Date(),
                }
              : undefined,
          }
        }),
      )

      // Deduplicate by organizationId (keep first occurrence, which has highest role priority)
      // Sort by role priority first: owner > admin > member
      const rolePriority: Record<MemberRole, number> = { owner: 0, admin: 1, member: 2 }
      const sorted = memberships.sort((a, b) => rolePriority[a.role] - rolePriority[b.role])

      const seen = new Set<string>()
      const deduplicated = sorted.filter((m) => {
        if (seen.has(m.organizationId)) {
          console.warn(`Duplicate membership found for org ${m.organizationId}, skipping`)
          return false
        }
        seen.add(m.organizationId)
        return true
      })

      return { data: deduplicated, error: null }
    } catch (error) {
      return { data: null, error: error as Error }
    }
  },

  /**
   * Get a specific organization by ID
   */
  getOrganization: async (
    orgId: string,
  ): Promise<{ data: Organization | null; error: Error | null }> => {
    try {
      const orgDoc = await getDoc(doc(db, 'organizations', orgId))

      if (!orgDoc.exists()) {
        return { data: null, error: new Error('Organization not found') }
      }

      const data = orgDoc.data()
      return {
        data: {
          id: orgDoc.id,
          name: data.name as string,
          createdAt: (data.createdAt as Timestamp)?.toDate() || new Date(),
          updatedAt: (data.updatedAt as Timestamp)?.toDate() || new Date(),
        },
        error: null,
      }
    } catch (error) {
      return { data: null, error: error as Error }
    }
  },

  /**
   * Update organization name
   */
  updateOrganization: async (orgId: string, name: string): Promise<{ error: Error | null }> => {
    try {
      await updateDoc(doc(db, 'organizations', orgId), {
        name,
        updatedAt: new Date(),
      })
      return { error: null }
    } catch (error) {
      return { error: error as Error }
    }
  },

  /**
   * Get all members of an organization with their user profiles
   * Deduplicates by userId to prevent showing duplicate members
   */
  getOrganizationMembers: async (
    orgId: string,
  ): Promise<{
    data: (OrganizationMember & { user?: UserProfile })[] | null
    error: Error | null
  }> => {
    try {
      // 1. Query all members of this organization
      const q = query(collection(db, 'organization_members'), where('organizationId', '==', orgId))
      const memberSnapshot = await getDocs(q)

      // 2. Build result with joined user data, deduplicating by userId
      const rolePriority: Record<MemberRole, number> = { owner: 0, admin: 1, member: 2 }
      const membersByUser = new Map<
        string,
        { doc: (typeof memberSnapshot.docs)[0]; role: MemberRole }
      >()

      // Keep only the highest-role membership for each user
      memberSnapshot.docs.forEach((memberDoc) => {
        const data = memberDoc.data()
        const userId = data.userId as string
        const role = data.role as MemberRole

        const existing = membersByUser.get(userId)
        if (!existing || rolePriority[role] < rolePriority[existing.role]) {
          membersByUser.set(userId, { doc: memberDoc, role })
        }
      })

      // 3. Get unique user IDs
      const userIds = Array.from(membersByUser.keys())

      // 4. Fetch user profiles
      const { data: usersMap } = await userService.getUserProfiles(userIds)

      // 5. Build final result
      const members = Array.from(membersByUser.values()).map(({ doc: memberDoc }) => {
        const data = memberDoc.data()
        const userId = data.userId as string

        return {
          id: memberDoc.id,
          organizationId: data.organizationId as string,
          userId,
          role: data.role as MemberRole,
          joinedAt: (data.joinedAt as Timestamp)?.toDate() || new Date(),
          user: usersMap?.get(userId) || undefined,
        }
      })

      return { data: members, error: null }
    } catch (error) {
      return { data: null, error: error as Error }
    }
  },

  /**
   * Remove a member from an organization
   */
  removeMember: async (memberId: string): Promise<{ error: Error | null }> => {
    try {
      await deleteDoc(doc(db, 'organization_members', memberId))
      return { error: null }
    } catch (error) {
      return { error: error as Error }
    }
  },
}

// ============================================
// Invite System
// ============================================

export const inviteService = {
  /**
   * Create an invite token (always 24h expiration)
   */
  createInvite: async (
    organizationId: string,
    role: 'admin' | 'member',
    createdBy: string,
  ): Promise<{ token: string | null; inviteId: string | null; error: Error | null }> => {
    try {
      const token = uuidv4()
      const now = new Date()
      const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000) // Always 24 hours

      const inviteData = {
        organizationId,
        role,
        token,
        createdBy,
        expiresAt,
        createdAt: now,
      }

      const inviteRef = await addDoc(collection(db, 'invites'), inviteData)
      return { token, inviteId: inviteRef.id, error: null }
    } catch (error) {
      return { token: null, inviteId: null, error: error as Error }
    }
  },

  /**
   * Get invite by token (for accept flow)
   */
  getInviteByToken: async (
    token: string,
  ): Promise<{ data: Invite | null; error: Error | null }> => {
    try {
      const q = query(collection(db, 'invites'), where('token', '==', token))
      const snapshot = await getDocs(q)

      if (snapshot.empty) {
        return { data: null, error: new Error('Invite not found') }
      }

      const inviteDoc = snapshot.docs[0]
      const data = inviteDoc.data()

      // Check expiration
      const expiresAt = (data.expiresAt as Timestamp).toDate()
      if (expiresAt < new Date()) {
        return { data: null, error: new Error('Invite has expired') }
      }

      // Fetch organization data
      const orgDoc = await getDoc(doc(db, 'organizations', data.organizationId as string))
      const orgData = orgDoc.exists() ? orgDoc.data() : null

      return {
        data: {
          id: inviteDoc.id,
          organizationId: data.organizationId as string,
          email: (data.email as string) || null,
          role: data.role as 'admin' | 'member',
          token: data.token as string,
          createdBy: data.createdBy as string,
          expiresAt,
          createdAt: (data.createdAt as Timestamp).toDate(),
          organization: orgData
            ? {
                id: orgDoc.id,
                name: orgData.name as string,
                createdAt: (orgData.createdAt as Timestamp)?.toDate() || new Date(),
                updatedAt: (orgData.updatedAt as Timestamp)?.toDate() || new Date(),
              }
            : undefined,
        },
        error: null,
      }
    } catch (error) {
      return { data: null, error: error as Error }
    }
  },

  /**
   * Accept an invite (create membership and delete invite)
   */
  acceptInvite: async (
    token: string,
    userId: string,
    userEmail: string,
  ): Promise<{ memberId: string | null; error: Error | null }> => {
    try {
      // 1. Get invite
      const { data: invite, error: inviteError } = await inviteService.getInviteByToken(token)
      if (inviteError || !invite) {
        return { memberId: null, error: inviteError || new Error('Invite not found') }
      }

      // 2. Validate email match (security check) - only if invite has email
      if (invite.email && invite.email.toLowerCase() !== userEmail.toLowerCase()) {
        return { memberId: null, error: new Error('Email does not match invite') }
      }

      // 3. Check if user is already a member of THIS organization
      // Using single where() to avoid composite index requirement
      const userMembershipsQ = query(
        collection(db, 'organization_members'),
        where('userId', '==', userId),
      )
      const userMemberships = await getDocs(userMembershipsQ)

      // Filter client-side to find if already member of this org
      const existingMembership = userMemberships.docs.find(
        (doc) => doc.data().organizationId === invite.organizationId,
      )

      if (existingMembership) {
        // Already a member, just delete the invite and return existing membership ID
        console.log('User already member of org, skipping creation')
        await deleteDoc(doc(db, 'invites', invite.id))
        return { memberId: existingMembership.id, error: null }
      }

      // 4. Create membership (only if not already a member)
      const memberData = {
        organizationId: invite.organizationId,
        userId,
        role: invite.role,
        joinedAt: new Date(),
      }
      const memberRef = await addDoc(collection(db, 'organization_members'), memberData)

      // 5. Delete invite
      await deleteDoc(doc(db, 'invites', invite.id))

      return { memberId: memberRef.id, error: null }
    } catch (error) {
      return { memberId: null, error: error as Error }
    }
  },

  /**
   * Get all pending invites for an organization
   */
  getOrganizationInvites: async (
    organizationId: string,
  ): Promise<{ data: Invite[] | null; error: Error | null }> => {
    try {
      const q = query(collection(db, 'invites'), where('organizationId', '==', organizationId))
      const snapshot = await getDocs(q)

      const invites: Invite[] = snapshot.docs
        .map((doc) => {
          const data = doc.data()
          const expiresAt = (data.expiresAt as Timestamp).toDate()

          // Filter out expired invites
          if (expiresAt < new Date()) {
            return null
          }

          return {
            id: doc.id,
            organizationId: data.organizationId as string,
            email: (data.email as string) || null,
            role: data.role as 'admin' | 'member',
            token: data.token as string,
            createdBy: data.createdBy as string,
            expiresAt,
            createdAt: (data.createdAt as Timestamp).toDate(),
          }
        })
        .filter((invite): invite is Invite => invite !== null)

      return { data: invites, error: null }
    } catch (error) {
      return { data: null, error: error as Error }
    }
  },

  /**
   * Delete a single invite
   */
  deleteInvite: async (inviteId: string): Promise<{ error: Error | null }> => {
    try {
      await deleteDoc(doc(db, 'invites', inviteId))
      return { error: null }
    } catch (error) {
      return { error: error as Error }
    }
  },

  /**
   * Delete all invites for an organization
   */
  deleteAllOrganizationInvites: async (
    organizationId: string,
  ): Promise<{ deletedCount: number; error: Error | null }> => {
    try {
      const q = query(collection(db, 'invites'), where('organizationId', '==', organizationId))
      const snapshot = await getDocs(q)

      const deletePromises = snapshot.docs.map((doc) => deleteDoc(doc.ref))
      await Promise.all(deletePromises)

      return { deletedCount: snapshot.docs.length, error: null }
    } catch (error) {
      return { deletedCount: 0, error: error as Error }
    }
  },
}
