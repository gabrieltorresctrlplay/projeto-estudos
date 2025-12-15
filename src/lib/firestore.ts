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
