import { db } from '@/shared/lib/firebase'
import {
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore'

import type { Ticket } from '../types/queue'

// ============================================
// Tracking Service
// Permite que clientes acompanhem sua senha via QR Code
// ============================================

const handleError = (error: unknown, context: string): Error => {
  console.error(`[TrackingService] ${context}:`, error)
  return error instanceof Error ? error : new Error(`Erro em ${context}`)
}

/**
 * Gera um token único para tracking
 * Formato: 8 caracteres alfanuméricos
 */
const generateTrackingToken = (): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // Sem I, O, 0, 1 para evitar confusão
  let token = ''
  for (let i = 0; i < 8; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return token
}

export const trackingService = {
  /**
   * Adicionar tracking token a um ticket
   */
  async addTrackingToken(
    queueId: string,
    ticketId: string,
  ): Promise<{ token: string | null; error: Error | null }> {
    try {
      const token = generateTrackingToken()

      await updateDoc(doc(db, 'queues', queueId, 'tickets', ticketId), {
        trackingToken: token,
        updatedAt: serverTimestamp(),
      })

      return { token, error: null }
    } catch (error) {
      return { token: null, error: handleError(error, 'addTrackingToken') }
    }
  },

  /**
   * Buscar ticket por tracking token
   * Busca em todas as filas - usado na página pública
   */
  async getTicketByToken(
    token: string,
  ): Promise<{ data: (Ticket & { queueId: string }) | null; error: Error | null }> {
    try {
      // Buscar em todas as filas
      const queuesSnapshot = await getDocs(collection(db, 'queues'))

      for (const queueDoc of queuesSnapshot.docs) {
        const ticketsQuery = query(
          collection(db, 'queues', queueDoc.id, 'tickets'),
          where('trackingToken', '==', token),
        )

        const ticketsSnapshot = await getDocs(ticketsQuery)

        if (!ticketsSnapshot.empty) {
          const ticketDoc = ticketsSnapshot.docs[0]
          return {
            data: {
              id: ticketDoc.id,
              ...ticketDoc.data(),
              queueId: queueDoc.id,
            } as Ticket & { queueId: string },
            error: null,
          }
        }
      }

      return { data: null, error: new Error('Senha não encontrada') }
    } catch (error) {
      return { data: null, error: handleError(error, 'getTicketByToken') }
    }
  },

  /**
   * Gerar URL de tracking
   */
  getTrackingUrl(token: string): string {
    // Usar a URL base do ambiente
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
    return `${baseUrl}/track/${token}`
  },

  /**
   * Calcular posição na fila
   */
  async getQueuePosition(
    queueId: string,
    ticket: Ticket,
  ): Promise<{ position: number; estimatedWait: number }> {
    try {
      // Buscar tickets esperando antes deste
      const ticketsQuery = query(
        collection(db, 'queues', queueId, 'tickets'),
        where('status', '==', 'waiting'),
      )

      const snapshot = await getDocs(ticketsQuery)
      const waitingTickets = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }) as Ticket)
        .filter((t) => t.createdAt && ticket.createdAt && t.createdAt < ticket.createdAt)

      // Considerar prioridade - preferencial passa na frente de normal
      const position = waitingTickets.filter((t) => t.priority >= ticket.priority).length + 1

      // Estimativa: 5 min por pessoa (pode ser configurável)
      const estimatedWait = position * 5

      return { position, estimatedWait }
    } catch {
      return { position: 0, estimatedWait: 0 }
    }
  },
}
