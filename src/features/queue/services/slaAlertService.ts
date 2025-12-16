import { db } from '@/shared/lib/firebase'
import {
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore'

import type { SLAAlert, SLAAlertType } from '../types/queue'

// ============================================
// SLA Alert Service
// Monitors service level agreements and generates alerts
// ============================================

const handleError = (error: unknown, context: string): Error => {
  console.error(`[SLAAlertService] ${context}:`, error)
  return error instanceof Error ? error : new Error(`Erro em ${context}`)
}

export const slaAlertService = {
  /**
   * Criar um alerta SLA
   */
  async createAlert(
    queueId: string,
    organizationId: string,
    type: SLAAlertType,
    message: string,
    ticketId?: string,
    counterId?: string,
  ): Promise<{ alertId: string | null; error: Error | null }> {
    try {
      const alertRef = doc(collection(db, 'slaAlerts'))

      await setDoc(alertRef, {
        id: alertRef.id,
        queueId,
        organizationId,
        type,
        message,
        ticketId: ticketId || null,
        counterId: counterId || null,
        isResolved: false,
        createdAt: serverTimestamp(),
      })

      return { alertId: alertRef.id, error: null }
    } catch (error) {
      return { alertId: null, error: handleError(error, 'createAlert') }
    }
  },

  /**
   * Buscar alertas ativos de uma organização
   */
  async getActiveAlerts(
    organizationId: string,
  ): Promise<{ data: SLAAlert[]; error: Error | null }> {
    try {
      const q = query(
        collection(db, 'slaAlerts'),
        where('organizationId', '==', organizationId),
        where('isResolved', '==', false),
        orderBy('createdAt', 'desc'),
      )

      const snapshot = await getDocs(q)
      const alerts = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      })) as SLAAlert[]

      return { data: alerts, error: null }
    } catch (error) {
      return { data: [], error: handleError(error, 'getActiveAlerts') }
    }
  },

  /**
   * Buscar alertas de uma fila específica
   */
  async getQueueAlerts(queueId: string): Promise<{ data: SLAAlert[]; error: Error | null }> {
    try {
      const q = query(
        collection(db, 'slaAlerts'),
        where('queueId', '==', queueId),
        where('isResolved', '==', false),
        orderBy('createdAt', 'desc'),
      )

      const snapshot = await getDocs(q)
      const alerts = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      })) as SLAAlert[]

      return { data: alerts, error: null }
    } catch (error) {
      return { data: [], error: handleError(error, 'getQueueAlerts') }
    }
  },

  /**
   * Resolver um alerta
   */
  async resolveAlert(alertId: string): Promise<{ error: Error | null }> {
    try {
      await updateDoc(doc(db, 'slaAlerts', alertId), {
        isResolved: true,
        resolvedAt: serverTimestamp(),
      })
      return { error: null }
    } catch (error) {
      return { error: handleError(error, 'resolveAlert') }
    }
  },

  /**
   * Verificar SLAs para uma fila (chamado periodicamente)
   */
  async checkQueueSLA(
    queueId: string,
    organizationId: string,
    settings: {
      slaMaxWaitMinutes?: number
      slaMaxQueueSize?: number
      slaMaxIdleMinutes?: number
    },
  ): Promise<{ alerts: string[]; error: Error | null }> {
    try {
      const alerts: string[] = []

      // Verificar tickets esperando muito tempo
      if (settings.slaMaxWaitMinutes) {
        const maxWaitTime = new Date()
        maxWaitTime.setMinutes(maxWaitTime.getMinutes() - settings.slaMaxWaitMinutes)

        const waitingQuery = query(
          collection(db, 'queues', queueId, 'tickets'),
          where('status', '==', 'waiting'),
          where('createdAt', '<', maxWaitTime),
        )

        const waitingSnapshot = await getDocs(waitingQuery)

        for (const ticketDoc of waitingSnapshot.docs) {
          await this.createAlert(
            queueId,
            organizationId,
            'wait_time_exceeded',
            `Senha ${ticketDoc.data().fullCode} esperando há mais de ${settings.slaMaxWaitMinutes} minutos`,
            ticketDoc.id,
          )
          alerts.push(`wait_time:${ticketDoc.id}`)
        }
      }

      // Verificar tamanho da fila
      if (settings.slaMaxQueueSize) {
        const allWaitingQuery = query(
          collection(db, 'queues', queueId, 'tickets'),
          where('status', '==', 'waiting'),
        )

        const allWaitingSnapshot = await getDocs(allWaitingQuery)

        if (allWaitingSnapshot.size > settings.slaMaxQueueSize) {
          await this.createAlert(
            queueId,
            organizationId,
            'queue_size_exceeded',
            `Fila tem ${allWaitingSnapshot.size} pessoas esperando (máximo: ${settings.slaMaxQueueSize})`,
          )
          alerts.push('queue_size')
        }
      }

      return { alerts, error: null }
    } catch (error) {
      return { alerts: [], error: handleError(error, 'checkQueueSLA') }
    }
  },
}
