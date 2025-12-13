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
  type DocumentData,
  type QueryConstraint,
} from 'firebase/firestore'

import { db } from './firebase'

export const firestoreService = {
  getDocument: async (collectionName: string, docId: string) => {
    try {
      const docRef = doc(db, collectionName, docId)
      const docSnap = await getDoc(docRef)

      if (docSnap.exists()) {
        return { data: { id: docSnap.id, ...docSnap.data() }, error: null }
      }
      return { data: null, error: new Error('Document not found') }
    } catch (error) {
      return { data: null, error: error as Error }
    }
  },

  getDocuments: async (collectionName: string, ...queryConstraints: QueryConstraint[]) => {
    try {
      const collectionRef = collection(db, collectionName)
      const q =
        queryConstraints.length > 0 ? query(collectionRef, ...queryConstraints) : collectionRef

      const querySnapshot = await getDocs(q)
      const documents = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))

      return { data: documents, error: null }
    } catch (error) {
      return { data: null, error: error as Error }
    }
  },

  addDocument: async (collectionName: string, data: DocumentData) => {
    try {
      const docRef = await addDoc(collection(db, collectionName), data)
      return { id: docRef.id, error: null }
    } catch (error) {
      return { id: null, error: error as Error }
    }
  },

  updateDocument: async (collectionName: string, docId: string, data: DocumentData) => {
    try {
      const docRef = doc(db, collectionName, docId)
      await updateDoc(docRef, data)
      return { error: null }
    } catch (error) {
      return { error: error as Error }
    }
  },

  deleteDocument: async (collectionName: string, docId: string) => {
    try {
      const docRef = doc(db, collectionName, docId)
      await deleteDoc(docRef)
      return { error: null }
    } catch (error) {
      return { error: error as Error }
    }
  },
}

export { where }

// Company Management Functions
export const companyService = {
  /**
   * Create a new company for a user
   */
  createCompany: async (userId: string, companyName: string) => {
    try {
      const now = new Date()
      const companyData = {
        name: companyName,
        ownerId: userId,
        createdAt: now,
        updatedAt: now,
      }

      const docRef = await addDoc(collection(db, 'companies'), companyData)
      return { id: docRef.id, error: null }
    } catch (error) {
      return { id: null, error: error as Error }
    }
  },

  /**
   * Get all companies owned by a user
   */
  getUserCompanies: async (userId: string) => {
    try {
      const q = query(collection(db, 'companies'), where('ownerId', '==', userId))
      const querySnapshot = await getDocs(q)

      const companies = querySnapshot.docs
        .map((doc) => ({
          id: doc.id,
          name: doc.data().name as string,
          ownerId: doc.data().ownerId as string,
          createdAt: doc.data().createdAt?.toDate() || new Date(),
          updatedAt: doc.data().updatedAt?.toDate() || new Date(),
        }))
        .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime()) // Oldest first

      return { data: companies, error: null }
    } catch (error) {
      return { data: null, error: error as Error }
    }
  },

  /**
   * Get a specific company by ID
   */
  getCompany: async (companyId: string) => {
    try {
      const docRef = doc(db, 'companies', companyId)
      const docSnap = await getDoc(docRef)

      if (docSnap.exists()) {
        const data = docSnap.data()
        return {
          data: {
            id: docSnap.id,
            name: data.name as string,
            ownerId: data.ownerId as string,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
          },
          error: null,
        }
      }
      return { data: null, error: new Error('Company not found') }
    } catch (error) {
      return { data: null, error: error as Error }
    }
  },

  /**
   * Update company name
   */
  updateCompany: async (companyId: string, companyName: string) => {
    try {
      const docRef = doc(db, 'companies', companyId)
      await updateDoc(docRef, {
        name: companyName,
        updatedAt: new Date(),
      })
      return { error: null }
    } catch (error) {
      return { error: error as Error }
    }
  },
}

// User Preferences Functions
export const userPreferencesService = {
  /**
   * Get user preferences (theme + selected company)
   */
  getUserPreferences: async (userId: string) => {
    try {
      const docRef = doc(db, 'users', userId)
      const docSnap = await getDoc(docRef)

      if (docSnap.exists()) {
        const data = docSnap.data()
        return {
          data: {
            theme: (data.theme as 'light' | 'dark' | 'system') || 'system',
            selectedCompanyId: (data.selectedCompanyId as string) || null,
          },
          error: null,
        }
      }

      // Create default preferences if user doc doesn't exist
      return {
        data: {
          theme: 'system' as const,
          selectedCompanyId: null,
        },
        error: null,
      }
    } catch (error) {
      return { data: null, error: error as Error }
    }
  },

  /**
   * Set selected company for user
   */
  setSelectedCompany: async (userId: string, companyId: string | null) => {
    try {
      const docRef = doc(db, 'users', userId)
      await updateDoc(docRef, {
        selectedCompanyId: companyId,
      })
      return { error: null }
    } catch (error) {
      return { error: error as Error }
    }
  },

  /**
   * Set theme preference for user
   */
  setTheme: async (userId: string, theme: 'light' | 'dark' | 'system') => {
    try {
      const docRef = doc(db, 'users', userId)
      await updateDoc(docRef, {
        theme: theme,
      })
      return { error: null }
    } catch (error) {
      return { error: error as Error }
    }
  },
}
