import { db } from '@/shared/lib/firebase'
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  increment,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
  where,
} from 'firebase/firestore'

import type {
  CallNextInput,
  Counter,
  EmitTicketInput,
  Queue,
  ServiceCategory,
  Ticket,
  TicketStatus,
} from '../types/queue'

// ============================================
// Ticket Service
// ============================================

const handleError = (error: unknown, context: string): Error => {
  console.error(`[TicketService] ${context}:`, error)
  return error instanceof Error ? error : new Error(`Erro em ${context}`)
}

export const ticketService = {
  /**
   * Emitir nova senha
   */
  async emitTicket(
    input: EmitTicketInput,
  ): Promise<{ ticket: Ticket | null; error: Error | null }> {
    try {
      const { queueId, categoryId, isPriority = false } = input

      // 1. Buscar fila
      const queueDoc = await getDoc(doc(db, 'queues', queueId))
      if (!queueDoc.exists()) {
        return { ticket: null, error: new Error('Fila não encontrada') }
      }
      const queue = queueDoc.data() as Queue
      const today = new Date().toISOString().split('T')[0]

      // 2. Buscar categoria
      const catDoc = await getDoc(doc(db, 'queues', queueId, 'categories', categoryId))
      if (!catDoc.exists()) {
        return { ticket: null, error: new Error('Categoria não encontrada') }
      }
      const category = catDoc.data() as ServiceCategory

      // 3. Calcular próximo número (reset diário)
      let dailyCounters = queue.dailyCounters || {}
      if (queue.lastResetDate !== today) {
        dailyCounters = {}
      }
      const currentCount = dailyCounters[category.prefix] || 0
      const nextNumber = currentCount + 1
      const fullCode = `${category.prefix}${String(nextNumber).padStart(3, '0')}`

      // 4. Criar ticket
      const ticketData = {
        queueId,
        organizationId: queue.organizationId,
        number: nextNumber,
        fullCode,
        categoryId,
        categoryName: category.name,
        categoryColor: category.color,
        status: 'waiting' as TicketStatus,
        priority: isPriority ? category.priority + 100 : category.priority,
        isPriority,
        createdAt: serverTimestamp(),
      }

      const ticketRef = await addDoc(collection(db, 'queues', queueId, 'tickets'), ticketData)

      // 5. Atualizar contador diário
      dailyCounters[category.prefix] = nextNumber
      await updateDoc(doc(db, 'queues', queueId), {
        dailyCounters,
        lastResetDate: today,
        updatedAt: serverTimestamp(),
      })

      return {
        ticket: { id: ticketRef.id, ...ticketData, createdAt: Timestamp.now() } as Ticket,
        error: null,
      }
    } catch (error) {
      return { ticket: null, error: handleError(error, 'emitTicket') }
    }
  },

  /**
   * Chamar próximo da fila
   */
  async callNextTicket(
    queueId: string,
    input: CallNextInput,
  ): Promise<{ ticket: Ticket | null; error: Error | null }> {
    try {
      const { counterId, categoryId } = input

      // 1. Buscar guichê
      const counterDoc = await getDoc(doc(db, 'queues', queueId, 'counters', counterId))
      if (!counterDoc.exists()) {
        return { ticket: null, error: new Error('Guichê não encontrado') }
      }
      const counter = counterDoc.data() as Counter

      // 2. Buscar tickets em espera - Otimizado com filtro no banco
      const q = query(
        collection(db, 'queues', queueId, 'tickets'),
        where('status', '==', 'waiting'),
      )
      const ticketsSnapshot = await getDocs(q)

      let waitingTickets = ticketsSnapshot.docs.map(
        (docSnap) => ({ id: docSnap.id, ...docSnap.data() }) as Ticket,
      )

      // Filtrar por categoria se especificado
      if (categoryId) {
        waitingTickets = waitingTickets.filter((t) => t.categoryId === categoryId)
      }

      // Ordenar: maior prioridade primeiro, depois por criação
      waitingTickets.sort((a, b) => {
        const priorityDiff = (b.priority || 0) - (a.priority || 0)
        if (priorityDiff !== 0) return priorityDiff
        const aTime = a.createdAt?.toMillis?.() || 0
        const bTime = b.createdAt?.toMillis?.() || 0
        return aTime - bTime
      })

      if (waitingTickets.length === 0) {
        return { ticket: null, error: new Error('Não há senhas na fila') }
      }

      const nextTicket = waitingTickets[0]

      // 3. Calcular tempo de espera
      const waitTimeSeconds = nextTicket.createdAt?.toMillis
        ? Math.floor((Date.now() - nextTicket.createdAt.toMillis()) / 1000)
        : 0

      // 4. Atualizar ticket
      await updateDoc(doc(db, 'queues', queueId, 'tickets', nextTicket.id), {
        status: 'calling' as TicketStatus,
        counterId,
        counterName: counter.name,
        calledAt: serverTimestamp(),
        waitTimeSeconds,
      })

      // 5. Atualizar guichê
      await updateDoc(doc(db, 'queues', queueId, 'counters', counterId), {
        currentTicketId: nextTicket.id,
        currentTicketCode: nextTicket.fullCode,
        updatedAt: serverTimestamp(),
      })

      return {
        ticket: {
          ...nextTicket,
          status: 'calling',
          counterId,
          counterName: counter.name,
          waitTimeSeconds,
        } as Ticket,
        error: null,
      }
    } catch (error) {
      return { ticket: null, error: handleError(error, 'callNextTicket') }
    }
  },

  /**
   * Rechamar ticket atual
   * Incrementa recallCount para forçar o monitor a reagir
   */
  async recallTicket(queueId: string, ticketId: string): Promise<{ error: Error | null }> {
    try {
      await updateDoc(doc(db, 'queues', queueId, 'tickets', ticketId), {
        calledAt: serverTimestamp(),
        recallCount: increment(1),
      })
      return { error: null }
    } catch (error) {
      return { error: handleError(error, 'recallTicket') }
    }
  },

  /**
   * Iniciar atendimento efetivo
   */
  async startServing(
    queueId: string,
    ticketId: string,
    attendantId: string,
  ): Promise<{ error: Error | null }> {
    try {
      await updateDoc(doc(db, 'queues', queueId, 'tickets', ticketId), {
        status: 'serving' as TicketStatus,
        attendantId,
        startedAt: serverTimestamp(),
      })
      return { error: null }
    } catch (error) {
      return { error: handleError(error, 'startServing') }
    }
  },

  /**
   * Finalizar atendimento
   */
  async finishTicket(
    queueId: string,
    counterId: string,
    ticketId: string,
    status: 'finished' | 'cancelled' | 'no_show' = 'finished',
  ): Promise<{ error: Error | null }> {
    try {
      // 1. Buscar ticket
      const ticketDoc = await getDoc(doc(db, 'queues', queueId, 'tickets', ticketId))
      if (!ticketDoc.exists()) {
        return { error: new Error('Ticket não encontrado') }
      }
      const ticketData = ticketDoc.data() as Ticket

      const serviceTimeSeconds = ticketData.startedAt?.toMillis
        ? Math.floor((Date.now() - ticketData.startedAt.toMillis()) / 1000)
        : 0

      // 2. Atualizar ticket
      await updateDoc(doc(db, 'queues', queueId, 'tickets', ticketId), {
        status,
        finishedAt: serverTimestamp(),
        serviceTimeSeconds,
      })

      // 3. Limpar guichê
      const counterDoc = await getDoc(doc(db, 'queues', queueId, 'counters', counterId))
      if (counterDoc.exists()) {
        const counterData = counterDoc.data() as Counter
        await updateDoc(doc(db, 'queues', queueId, 'counters', counterId), {
          currentTicketId: null,
          currentTicketCode: null,
          ticketsServedToday: (counterData.ticketsServedToday || 0) + 1,
          updatedAt: serverTimestamp(),
        })
      }

      return { error: null }
    } catch (error) {
      return { error: handleError(error, 'finishTicket') }
    }
  },
}
