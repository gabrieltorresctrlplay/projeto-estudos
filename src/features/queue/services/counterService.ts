import { db } from '@/shared/lib/firebase'
import {
  addDoc,
  collection,
  doc,
  getDocs,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore'
import type { Counter, CounterStatus } from '../types/queue'

// ============================================
// Counter Management Service
// ============================================

const handleError = (error: unknown, context: string): Error => {
  console.error(`[CounterService] ${context}:`, error)
  return error instanceof Error ? error : new Error(`Erro em ${context}`)
}

export const counterService = {
  /**
   * Criar guichê
   */
  async createCounter(
    queueId: string,
    organizationId: string,
    name: string,
    number: number,
    categories: string[] = [],
  ): Promise<{ counterId: string | null; error: Error | null }> {
    try {
      const counterRef = await addDoc(collection(db, 'queues', queueId, 'counters'), {
        queueId,
        organizationId,
        name,
        number,
        status: 'closed' as CounterStatus,
        categories,
        ticketsServedToday: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
      return { counterId: counterRef.id, error: null }
    } catch (error) {
      return { counterId: null, error: handleError(error, 'createCounter') }
    }
  },

  /**
   * Buscar guichês de uma fila
   * Query simples sem where, ordenação client-side
   */
  async getCounters(queueId: string): Promise<{ data: Counter[] | null; error: Error | null }> {
    try {
      const snapshot = await getDocs(collection(db, 'queues', queueId, 'counters'))
      const counters = snapshot.docs
        .map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }) as Counter)
        .sort((a, b) => (a.number || 0) - (b.number || 0))
      return { data: counters, error: null }
    } catch (error) {
      return { data: null, error: handleError(error, 'getCounters') }
    }
  },

  /**
   * Abrir/Fechar guichê
   */
  async updateCounterStatus(
    queueId: string,
    counterId: string,
    status: CounterStatus,
    attendantId?: string,
    attendantName?: string,
  ): Promise<{ error: Error | null }> {
    try {
      await updateDoc(doc(db, 'queues', queueId, 'counters', counterId), {
        status,
        attendantId: attendantId || null,
        attendantName: attendantName || null,
        updatedAt: serverTimestamp(),
      })
      return { error: null }
    } catch (error) {
      return { error: handleError(error, 'updateCounterStatus') }
    }
  },
}
