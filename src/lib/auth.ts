import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  type User,
} from 'firebase/auth'

import { auth } from './firebase'

const googleProvider = new GoogleAuthProvider()

const DEFAULT_PROFILE_PHOTO =
  'https://cdn.vectorstock.com/i/500p/13/15/hand-drawn-rat-sketch-black-white-vector-52531315.jpg'

export const authService = {
  signUpWithEmail: async (email: string, password: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      // Add default profile photo for email/password users
      await updateProfile(userCredential.user, {
        photoURL: DEFAULT_PROFILE_PHOTO,
      })
      return { user: userCredential.user, error: null }
    } catch (error) {
      return { user: null, error: error as Error }
    }
  },

  signInWithEmail: async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      return { user: userCredential.user, error: null }
    } catch (error) {
      return { user: null, error: error as Error }
    }
  },

  signInWithGoogle: async () => {
    try {
      const userCredential = await signInWithPopup(auth, googleProvider)
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
