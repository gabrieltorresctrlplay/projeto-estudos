import {
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  type User,
} from 'firebase/auth'

import { auth } from './firebase'
import { userService } from './userService'

const googleProvider = new GoogleAuthProvider()

export const authService = {
  /**
   * Sign in with Google (only auth method for production)
   */
  signInWithGoogle: async () => {
    try {
      const userCredential = await signInWithPopup(auth, googleProvider)

      // Save/update user profile from Google data
      const { error: profileError } = await userService.createUserProfile(
        userCredential.user.uid,
        userCredential.user.email || '',
        userCredential.user.displayName,
        userCredential.user.photoURL,
      )

      if (profileError) {
        // If profile creation fails, sign out immediately to prevent inconsistent state
        await signOut(auth)
        throw profileError
      }

      return { user: userCredential.user, error: null }
    } catch (error) {
      return { user: null, error: error as Error }
    }
  },

  /**
   * Sign in with email and password (ONLY for E2E testing with Firebase Emulator)
   * This method should NOT be exposed in production UI
   */
  signInWithEmail: async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      return { user: userCredential.user, error: null }
    } catch (error) {
      return { user: null, error: error as Error }
    }
  },

  signOut: async () => {
    try {
      await signOut(auth)
      return { error: null }
    } catch (error) {
      return { error: error as Error }
    }
  },

  getCurrentUser: (): User | null => {
    return auth.currentUser
  },

  onAuthStateChanged: (callback: (user: User | null) => void) => {
    return auth.onAuthStateChanged(callback)
  },
}

