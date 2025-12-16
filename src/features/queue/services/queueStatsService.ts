import { db } from '@/shared/lib/firebase'
import {
  collection,
  getDocs,
  query,
  Timestamp,
  where,
} from 'firebase/firestore'
import type { QueueStats, Ticket } from '../types/queue'

// ============================================
// Queue Statistics Service
// ============================================

const handleError = (error: unknown, context: string): Error => {
  console.error(`[QueueStatsService] ${context}:`, error)
  return error instanceof Error ? error : new Error(`Erro em ${context}`)
}

export const queueStatsService = {
  async getQueueStats(queueId: string): Promise<{ stats: QueueStats | null; error: Error | null }> {
    try {
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      // Otimização: Filtrar tickets de hoje diretamente no banco
      const q = query(
        collection(db, 'queues', queueId, 'tickets'),
        where('createdAt', '>=', Timestamp.fromDate(today)),
      )

      const ticketsSnapshot = await getDocs(q)
      const tickets = ticketsSnapshot.docs.map((docSnap) => docSnap.data()) as Ticket[]

      const waiting = tickets.filter((t) => t.status === 'waiting')
      const serving = tickets.filter((t) => t.status === 'serving' || t.status === 'calling')
      const finished = tickets.filter((t) => t.status === 'finished')

      const avgWait =
        finished.length > 0
          ? finished.reduce((acc, t) => acc + (t.waitTimeSeconds || 0), 0) / finished.length / 60
          : 0

      const avgService =
        finished.length > 0
          ? finished.reduce((acc, t) => acc + (t.serviceTimeSeconds || 0), 0) / finished.length / 60
          : 0

      const byCategory: Record<string, { waiting: number; served: number }> = {}
      tickets.forEach((t) => {
        const catName = t.categoryName || 'Outros'
        if (!byCategory[catName]) {
          byCategory[catName] = { waiting: 0, served: 0 }
        }
        if (t.status === 'waiting') {
          byCategory[catName].waiting++
        } else if (t.status === 'finished') {
          byCategory[catName].served++
        }
      })

      return {
        stats: {
          waitingCount: waiting.length,
          servingCount: serving.length,
          finishedToday: finished.length,
          averageWaitTime: Math.round(avgWait * 10) / 10,
          averageServiceTime: Math.round(avgService * 10) / 10,
          byCategory,
        },
        error: null,
      }
    } catch (error) {
      return { stats: null, error: handleError(error, 'getQueueStats') }
    }
  },
}
