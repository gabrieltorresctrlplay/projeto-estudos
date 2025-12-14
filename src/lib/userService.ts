import type { UserProfile } from '@/types'
import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore'

import { db } from './firebase'

/**
 * Service for managing user profiles in Firestore
 * User profiles are stored in the 'users' collection with UID as document ID
 */
export const userService = {
  /**
   * Create or update a user profile after registration/login
   */
  createUserProfile: async (
    uid: string,
    email: string,
    displayName: string | null,
    photoURL: string | null,
  ): Promise<{ error: Error | null }> => {
    try {
      const now = new Date()
      const userRef = doc(db, 'users', uid)
      const existing = await getDoc(userRef)

      if (existing.exists()) {
        // Update existing profile (keep createdAt and hasCompletedOnboarding, update rest)
        await setDoc(
          userRef,
          {
            email,
            displayName,
            photoURL,
            updatedAt: now,
          },
          { merge: true },
        )
      } else {
        // Create new profile with hasCompletedOnboarding = false
        await setDoc(userRef, {
          email,
          displayName,
          photoURL,
          hasCompletedOnboarding: false,
          createdAt: now,
          updatedAt: now,
        })
      }

      return { error: null }
    } catch (error) {
      return { error: error as Error }
    }
  },

  /**
   * Mark user as having completed onboarding
   */
  setOnboardingComplete: async (uid: string): Promise<{ error: Error | null }> => {
    try {
      const userRef = doc(db, 'users', uid)
      await setDoc(
        userRef,
        {
          hasCompletedOnboarding: true,
          updatedAt: new Date(),
        },
        { merge: true },
      )
      return { error: null }
    } catch (error) {
      return { error: error as Error }
    }
  },

  /**
   * Get a single user profile by UID
   */
  getUserProfile: async (
    uid: string,
  ): Promise<{ data: UserProfile | null; error: Error | null }> => {
    try {
      const userRef = doc(db, 'users', uid)
      const userDoc = await getDoc(userRef)

      if (!userDoc.exists()) {
        return { data: null, error: null }
      }

      const data = userDoc.data()
      return {
        data: {
          id: userDoc.id,
          email: data.email as string,
          displayName: (data.displayName as string) || null,
          photoURL: (data.photoURL as string) || null,
          hasCompletedOnboarding: (data.hasCompletedOnboarding as boolean) || false,
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
   * Get multiple user profiles by UIDs
   * Returns a Map for easy lookup by UID
   */
  getUserProfiles: async (
    uids: string[],
  ): Promise<{ data: Map<string, UserProfile> | null; error: Error | null }> => {
    try {
      if (uids.length === 0) {
        return { data: new Map(), error: null }
      }

      // Firestore 'in' query has a limit of 30 items
      // For larger lists, we'd need to batch, but this should be fine for teams
      const usersMap = new Map<string, UserProfile>()

      // Fetch each user profile individually (more reliable than 'in' query for UIDs)
      await Promise.all(
        uids.map(async (uid) => {
          const { data } = await userService.getUserProfile(uid)
          if (data) {
            usersMap.set(uid, data)
          }
        }),
      )

      return { data: usersMap, error: null }
    } catch (error) {
      return { data: null, error: error as Error }
    }
  },

  /**
   * Update user's display name
   */
  updateDisplayName: async (uid: string, displayName: string): Promise<{ error: Error | null }> => {
    try {
      const userRef = doc(db, 'users', uid)
      await setDoc(
        userRef,
        {
          displayName,
          updatedAt: new Date(),
        },
        { merge: true },
      )
      return { error: null }
    } catch (error) {
      return { error: error as Error }
    }
  },
}
