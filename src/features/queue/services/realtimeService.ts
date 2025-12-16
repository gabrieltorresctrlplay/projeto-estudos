import { db } from '@/shared/lib/firebase'
import {
  collection,
  onSnapshot,
  query,
  where,
} from 'firebase/firestore'
import type { Counter, Ticket } from '../types/queue'

// ============================================
// Realtime Service
// ============================================

export const realtimeService = {
  /**
   * Subscribe para tickets chamados (Monitor)
   * Query simplificada - filtro e ordenação client-side
   */
  subscribeToCalledTickets(
    queueId: string,
    displayCount: number,
    callback: (tickets: Ticket[]) => void,
  ) {
    // Busca apenas tickets sendo chamados ou atendidos
    const q = query(
      collection(db, 'queues', queueId, 'tickets'),
      where('status', 'in', ['calling', 'serving']),
    )

    return onSnapshot(
      q,
      (snapshot) => {
        const tickets = snapshot.docs
          .map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }) as Ticket)
          .sort((a, b) => {
            const aTime = a.calledAt?.toMillis?.() || 0
            const bTime = b.calledAt?.toMillis?.() || 0
            return bTime - aTime // Mais recente primeiro
          })
          .slice(0, displayCount)
        callback(tickets)
      },
      (error) => {
        console.error('[RealtimeService] subscribeToCalledTickets error:', error)
        callback([])
      },
    )
  },

  /**
   * Subscribe para fila de espera (Guichê)
   * Query simplificada - filtro e ordenação client-side
   */
  subscribeToWaitingQueue(
    queueId: string,
    callback: (tickets: Ticket[]) => void,
    categoryId?: string,
  ) {
    // Otimização: Busca apenas tickets com status 'waiting'
    const q = query(collection(db, 'queues', queueId, 'tickets'), where('status', '==', 'waiting'))

    return onSnapshot(
      q,
      (snapshot) => {
        let tickets = snapshot.docs.map(
          (docSnap) => ({ id: docSnap.id, ...docSnap.data() }) as Ticket,
        )

        if (categoryId) {
          tickets = tickets.filter((t) => t.categoryId === categoryId)
        }

        // Ordenar: maior prioridade primeiro, depois mais antigo
        tickets.sort((a, b) => {
          const priorityDiff = (b.priority || 0) - (a.priority || 0)
          if (priorityDiff !== 0) return priorityDiff
          const aTime = a.createdAt?.toMillis?.() || 0
          const bTime = b.createdAt?.toMillis?.() || 0
          return aTime - bTime
        })

        callback(tickets)
      },
      (error) => {
        console.error('[RealtimeService] subscribeToWaitingQueue error:', error)
        callback([])
      },
    )
  },

  /**
   * Subscribe para guichês (Admin)
   */
  subscribeToCounters(queueId: string, callback: (counters: Counter[]) => void) {
    return onSnapshot(
      collection(db, 'queues', queueId, 'counters'),
      (snapshot) => {
        const counters = snapshot.docs
          .map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }) as Counter)
          .sort((a, b) => (a.number || 0) - (b.number || 0))
        callback(counters)
      },
      (error) => {
        console.error('[RealtimeService] subscribeToCounters error:', error)
        callback([])
      },
    )
  },
}
