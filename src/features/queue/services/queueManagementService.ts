import { db } from '@/shared/lib/firebase'
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  where,
  writeBatch,
} from 'firebase/firestore'
import type { Queue, QueueSettings, ServiceCategory } from '../types/queue'

// ============================================
// Queue Management Service
// ============================================

const handleError = (error: unknown, context: string): Error => {
  console.error(`[QueueManagementService] ${context}:`, error)
  return error instanceof Error ? error : new Error(`Erro em ${context}`)
}

export const queueManagementService = {
  /**
   * Criar nova fila para organização
   */
  async createQueue(
    organizationId: string,
    name: string,
    categories: ServiceCategory[],
  ): Promise<{ queueId: string | null; error: Error | null }> {
    try {
      const defaultSettings: QueueSettings = {
        audioEnabled: true,
        voiceType: 'female',
        displayCount: 5,
        autoResetDaily: true,
        callRepeatCount: 2,
      }

      const queueRef = await addDoc(collection(db, 'queues'), {
        organizationId,
        name,
        isActive: true,
        settings: defaultSettings,
        dailyCounters: {},
        lastResetDate: new Date().toISOString().split('T')[0],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })

      // Criar categorias como subcollection
      if (categories.length > 0) {
        const batch = writeBatch(db)
        categories.forEach((cat) => {
          const catRef = doc(collection(db, 'queues', queueRef.id, 'categories'))
          batch.set(catRef, {
            ...cat,
            id: catRef.id,
            isActive: true,
          })
        })
        await batch.commit()
      }

      return { queueId: queueRef.id, error: null }
    } catch (error) {
      return { queueId: null, error: handleError(error, 'createQueue') }
    }
  },

  /**
   * Buscar fila por ID
   */
  async getQueue(queueId: string): Promise<{ data: Queue | null; error: Error | null }> {
    try {
      const docSnap = await getDoc(doc(db, 'queues', queueId))
      if (!docSnap.exists()) {
        return { data: null, error: new Error('Fila não encontrada') }
      }
      return { data: { id: docSnap.id, ...docSnap.data() } as Queue, error: null }
    } catch (error) {
      return { data: null, error: handleError(error, 'getQueue') }
    }
  },

  /**
   * Buscar filas da organização
   * Query simplificada: apenas where, sem orderBy
   */
  async getOrganizationQueues(
    organizationId: string,
  ): Promise<{ data: Queue[] | null; error: Error | null }> {
    try {
      const q = query(collection(db, 'queues'), where('organizationId', '==', organizationId))
      const snapshot = await getDocs(q)
      const queues = snapshot.docs
        .map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }) as Queue)
        .filter((queue) => queue.isActive !== false)
      return { data: queues, error: null }
    } catch (error) {
      return { data: null, error: handleError(error, 'getOrganizationQueues') }
    }
  },

  /**
   * Buscar categorias de uma fila
   * Query sem índice composto - filtro e ordenação client-side
   */
  async getCategories(
    queueId: string,
  ): Promise<{ data: ServiceCategory[] | null; error: Error | null }> {
    try {
      const snapshot = await getDocs(collection(db, 'queues', queueId, 'categories'))
      const categories = snapshot.docs
        .map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }) as ServiceCategory)
        .filter((cat) => cat.isActive !== false)
        .sort((a, b) => (b.priority || 0) - (a.priority || 0))
      return { data: categories, error: null }
    } catch (error) {
      return { data: null, error: handleError(error, 'getCategories') }
    }
  },
}
