import { GoogleAuthProvider, signInWithPopup, signOut, type User } from 'firebase/auth'

import { auth } from './firebase'
import { userService } from './userService'

const googleProvider = new GoogleAuthProvider()

export const authService = {
  /**
   * Sign in with Google (only auth method)
   */
  signInWithGoogle: async () => {
    try {
      const userCredential = await signInWithPopup(auth, googleProvider)

      // Save/update user profile from Google data
      await userService.createUserProfile(
        userCredential.user.uid,
        userCredential.user.email || '',
        userCredential.user.displayName,
        userCredential.user.photoURL,
      )

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
