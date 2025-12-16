import { db } from '@/shared/lib/firebase'
import {
  collection,
  doc,
  getDoc,
  getDocs,
  increment,
  query,
  serverTimestamp,
  setDoc,
  where,
} from 'firebase/firestore'

import type { AttendantDayStats, DailyQueueMetrics, Ticket } from '../types/queue'

// ============================================
// Metrics Service
// ============================================

const handleError = (error: unknown, context: string): Error => {
  console.error(`[MetricsService] ${context}:`, error)
  return error instanceof Error ? error : new Error(`Erro em ${context}`)
}

const getToday = () => new Date().toISOString().split('T')[0]

const getMetricsDocId = (queueId: string, date: string) => `${queueId}_${date}`

export const metricsService = {
  /**
   * Registrar emissão de ticket
   */
  async recordTicketEmitted(
    queueId: string,
    organizationId: string,
    categoryId: string,
  ): Promise<void> {
    try {
      const date = getToday()
      const docId = getMetricsDocId(queueId, date)
      const docRef = doc(db, 'queueMetrics', docId)

      const docSnap = await getDoc(docRef)

      if (docSnap.exists()) {
        // Atualizar métricas existentes
        await setDoc(
          docRef,
          {
            ticketsEmitted: increment(1),
            [`byCategory.${categoryId}.ticketsEmitted`]: increment(1),
            updatedAt: serverTimestamp(),
          },
          { merge: true },
        )
      } else {
        // Criar documento inicial
        const initialData: Partial<DailyQueueMetrics> = {
          id: docId,
          queueId,
          organizationId,
          date,
          ticketsEmitted: 1,
          ticketsServed: 0,
          ticketsNoShow: 0,
          ticketsCancelled: 0,
          averageWaitTimeSeconds: 0,
          averageServiceTimeSeconds: 0,
          maxWaitTimeSeconds: 0,
          peakHour: new Date().getHours(),
          peakWaitingCount: 0,
          byAttendant: {},
          byCategory: {
            [categoryId]: {
              ticketsEmitted: 1,
              ticketsServed: 0,
              averageWaitTimeSeconds: 0,
            },
          },
          averageRating: 0,
          feedbackCount: 0,
        }
        await setDoc(docRef, {
          ...initialData,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        })
      }
    } catch (error) {
      handleError(error, 'recordTicketEmitted')
    }
  },

  /**
   * Registrar conclusão de ticket
   */
  async recordTicketCompletion(
    queueId: string,
    ticket: Ticket,
    outcome: 'finished' | 'no_show' | 'cancelled',
  ): Promise<void> {
    try {
      const date = getToday()
      const docId = getMetricsDocId(queueId, date)
      const docRef = doc(db, 'queueMetrics', docId)

      const updates: Record<string, unknown> = {
        updatedAt: serverTimestamp(),
      }

      if (outcome === 'finished') {
        updates.ticketsServed = increment(1)
        updates[`byCategory.${ticket.categoryId}.ticketsServed`] = increment(1)

        // Atualizar métricas do atendente
        if (ticket.attendantId) {
          updates[`byAttendant.${ticket.attendantId}.ticketsServed`] = increment(1)
          if (ticket.serviceTimeSeconds) {
            // Nota: para média, precisaríamos de uma abordagem mais sofisticada
            // Por agora, acumulamos o total
            updates[`byAttendant.${ticket.attendantId}.totalServiceTimeSeconds`] = increment(
              ticket.serviceTimeSeconds,
            )
          }
        }
      } else if (outcome === 'no_show') {
        updates.ticketsNoShow = increment(1)
      } else if (outcome === 'cancelled') {
        updates.ticketsCancelled = increment(1)
      }

      await setDoc(docRef, updates, { merge: true })
    } catch (error) {
      handleError(error, 'recordTicketCompletion')
    }
  },

  /**
   * Registrar feedback do cliente
   */
  async recordFeedback(queueId: string, rating: number): Promise<void> {
    try {
      const date = getToday()
      const docId = getMetricsDocId(queueId, date)
      const docRef = doc(db, 'queueMetrics', docId)

      // Para calcular média corretamente, incrementamos count e acumulamos total
      // A média real é calculada na leitura
      await setDoc(
        docRef,
        {
          feedbackCount: increment(1),
          totalRating: increment(rating),
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      )
    } catch (error) {
      handleError(error, 'recordFeedback')
    }
  },

  /**
   * Buscar métricas do dia
   */
  async getDailyMetrics(
    queueId: string,
    date?: string,
  ): Promise<{ data: DailyQueueMetrics | null; error: Error | null }> {
    try {
      const targetDate = date || getToday()
      const docId = getMetricsDocId(queueId, targetDate)
      const docSnap = await getDoc(doc(db, 'queueMetrics', docId))

      if (!docSnap.exists()) {
        return { data: null, error: null }
      }

      const rawData = docSnap.data()
      const data = rawData as DailyQueueMetrics

      // Calcular média de rating se necessário
      const totalRating = rawData.totalRating as number | undefined
      if (data.feedbackCount && totalRating) {
        data.averageRating = totalRating / data.feedbackCount
      }

      return { data, error: null }
    } catch (error) {
      return { data: null, error: handleError(error, 'getDailyMetrics') }
    }
  },

  /**
   * Buscar métricas de um período
   */
  async getMetricsRange(
    queueId: string,
    startDate: string,
    endDate: string,
  ): Promise<{ data: DailyQueueMetrics[]; error: Error | null }> {
    try {
      const q = query(
        collection(db, 'queueMetrics'),
        where('queueId', '==', queueId),
        where('date', '>=', startDate),
        where('date', '<=', endDate),
      )

      const snapshot = await getDocs(q)
      const metrics = snapshot.docs
        .map((docSnap) => docSnap.data() as DailyQueueMetrics)
        .sort((a, b) => a.date.localeCompare(b.date))

      return { data: metrics, error: null }
    } catch (error) {
      return { data: [], error: handleError(error, 'getMetricsRange') }
    }
  },

  /**
   * Buscar performance de um atendente
   */
  async getAttendantPerformance(
    organizationId: string,
    attendantId: string,
    startDate: string,
    endDate: string,
  ): Promise<{
    data: {
      totalTickets: number
      averageServiceTime: number
      dailyBreakdown: { date: string; tickets: number }[]
    } | null
    error: Error | null
  }> {
    try {
      const q = query(
        collection(db, 'queueMetrics'),
        where('organizationId', '==', organizationId),
        where('date', '>=', startDate),
        where('date', '<=', endDate),
      )

      const snapshot = await getDocs(q)

      let totalTickets = 0
      let totalServiceTime = 0
      const dailyBreakdown: { date: string; tickets: number }[] = []

      snapshot.docs.forEach((docSnap) => {
        const data = docSnap.data() as DailyQueueMetrics
        const attendantStats = data.byAttendant?.[attendantId] as AttendantDayStats | undefined

        if (attendantStats) {
          totalTickets += attendantStats.ticketsServed || 0
          totalServiceTime += attendantStats.totalActiveTimeSeconds || 0
          dailyBreakdown.push({
            date: data.date,
            tickets: attendantStats.ticketsServed || 0,
          })
        }
      })

      return {
        data: {
          totalTickets,
          averageServiceTime: totalTickets > 0 ? totalServiceTime / totalTickets : 0,
          dailyBreakdown: dailyBreakdown.sort((a, b) => a.date.localeCompare(b.date)),
        },
        error: null,
      }
    } catch (error) {
      return { data: null, error: handleError(error, 'getAttendantPerformance') }
    }
  },

  /**
   * Buscar resumo de métricas para dashboard
   */
  async getDashboardSummary(queueId: string): Promise<{
    data: {
      today: DailyQueueMetrics | null
      weekTotal: {
        ticketsServed: number
        averageWaitMinutes: number
        noShowRate: number
      }
    } | null
    error: Error | null
  }> {
    try {
      // Métricas de hoje
      const { data: today } = await this.getDailyMetrics(queueId)

      // Últimos 7 dias
      const endDate = getToday()
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - 7)
      const startDateStr = startDate.toISOString().split('T')[0]

      const { data: weekMetrics } = await this.getMetricsRange(queueId, startDateStr, endDate)

      // Agregar semana
      let weekTicketsServed = 0
      let weekTotalWait = 0
      let weekTicketsEmitted = 0
      let weekNoShows = 0

      weekMetrics.forEach((day) => {
        weekTicketsServed += day.ticketsServed || 0
        weekTotalWait += (day.averageWaitTimeSeconds || 0) * (day.ticketsServed || 0)
        weekTicketsEmitted += day.ticketsEmitted || 0
        weekNoShows += day.ticketsNoShow || 0
      })

      return {
        data: {
          today,
          weekTotal: {
            ticketsServed: weekTicketsServed,
            averageWaitMinutes: weekTicketsServed > 0 ? weekTotalWait / weekTicketsServed / 60 : 0,
            noShowRate: weekTicketsEmitted > 0 ? (weekNoShows / weekTicketsEmitted) * 100 : 0,
          },
        },
        error: null,
      }
    } catch (error) {
      return { data: null, error: handleError(error, 'getDashboardSummary') }
    }
  },
}
