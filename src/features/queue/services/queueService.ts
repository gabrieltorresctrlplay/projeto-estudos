/**
 * Queue Service - Refatorado
 * Gerenciamento de Filas de Atendimento Multi-Tenant
 *
 * IMPORTANTE: Queries simplificadas para evitar necessidade de índices compostos.
 * Filtros e ordenações são feitas client-side quando necessário.
 */

import type {
  CallNextInput,
  Counter,
  CounterStatus,
  EmitTicketInput,
  Queue,
  QueueSettings,
  QueueStats,
  ServiceCategory,
  Ticket,
  TicketStatus,
} from '@/features/queue/types/queue'
import { db } from '@/shared/lib/firebase'
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore'

// ============================================
// Helpers
// ============================================

const handleError = (error: unknown, context: string): Error => {
  console.error(`[QueueService] ${context}:`, error)
  return error instanceof Error ? error : new Error(`Erro em ${context}`)
}

// ============================================
// Queue CRUD
// ============================================

export const queueService = {
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

  // ============================================
  // Ticket Management (Totem)
  // ============================================

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

  // ============================================
  // Counter Management (Guichês)
  // ============================================

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
   */
  async recallTicket(queueId: string, ticketId: string): Promise<{ error: Error | null }> {
    try {
      await updateDoc(doc(db, 'queues', queueId, 'tickets', ticketId), {
        calledAt: serverTimestamp(),
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

  // ============================================
  // Realtime Subscriptions (Simplificadas)
  // ============================================

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
        console.error('[QueueService] subscribeToCalledTickets error:', error)
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
        console.error('[QueueService] subscribeToWaitingQueue error:', error)
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
        console.error('[QueueService] subscribeToCounters error:', error)
        callback([])
      },
    )
  },

  // ============================================
  // Estatísticas
  // ============================================

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
