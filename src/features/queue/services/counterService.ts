import { db } from '@/shared/lib/firebase'
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  runTransaction,
  serverTimestamp,
  updateDoc,
  where,
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
   * Deletar guichê
   */
  async deleteCounter(queueId: string, counterId: string): Promise<{ error: Error | null }> {
    try {
      await deleteDoc(doc(db, 'queues', queueId, 'counters', counterId))
      return { error: null }
    } catch (error) {
      return { error: handleError(error, 'deleteCounter') }
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
   * Buscar guichê por ID
   */
  async getCounter(
    queueId: string,
    counterId: string,
  ): Promise<{ data: Counter | null; error: Error | null }> {
    try {
      const docSnap = await getDoc(doc(db, 'queues', queueId, 'counters', counterId))
      if (!docSnap.exists()) {
        return { data: null, error: new Error('Guichê não encontrado') }
      }
      return { data: { id: docSnap.id, ...docSnap.data() } as Counter, error: null }
    } catch (error) {
      return { data: null, error: handleError(error, 'getCounter') }
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
        // Limpar pausa programada ao mudar status
        pauseAfterCurrent: null,
        scheduledPauseAt: null,
        updatedAt: serverTimestamp(),
      })
      return { error: null }
    } catch (error) {
      return { error: handleError(error, 'updateCounterStatus') }
    }
  },

  // ============================================
  // Atribuição de Guichês (Admin/Owner)
  // ============================================

  /**
   * Atribuir guichê a um funcionário
   */
  async assignCounterToUser(
    queueId: string,
    counterId: string,
    userId: string,
    userName: string,
  ): Promise<{ error: Error | null }> {
    try {
      await updateDoc(doc(db, 'queues', queueId, 'counters', counterId), {
        assignedUserId: userId,
        assignedUserName: userName,
        updatedAt: serverTimestamp(),
      })
      return { error: null }
    } catch (error) {
      return { error: handleError(error, 'assignCounterToUser') }
    }
  },

  /**
   * Remover atribuição de guichê
   */
  async unassignCounter(queueId: string, counterId: string): Promise<{ error: Error | null }> {
    try {
      await updateDoc(doc(db, 'queues', queueId, 'counters', counterId), {
        assignedUserId: null,
        assignedUserName: null,
        updatedAt: serverTimestamp(),
      })
      return { error: null }
    } catch (error) {
      return { error: handleError(error, 'unassignCounter') }
    }
  },

  /**
   * Buscar guichês atribuídos a um usuário em todas as filas da organização
   */
  async getMyAssignedCounters(
    organizationId: string,
    userId: string,
  ): Promise<{ data: (Counter & { queueName?: string })[] | null; error: Error | null }> {
    try {
      // Buscar todas as filas da organização
      const queuesSnapshot = await getDocs(
        query(collection(db, 'queues'), where('organizationId', '==', organizationId)),
      )

      const assignedCounters: (Counter & { queueName?: string })[] = []

      for (const queueDoc of queuesSnapshot.docs) {
        const queueData = queueDoc.data()
        const countersSnapshot = await getDocs(collection(db, 'queues', queueDoc.id, 'counters'))

        for (const counterDoc of countersSnapshot.docs) {
          const counterData = counterDoc.data() as Counter
          if (counterData.assignedUserId === userId) {
            assignedCounters.push({
              ...counterData,
              id: counterDoc.id,
              queueName: queueData.name,
            })
          }
        }
      }

      return { data: assignedCounters, error: null }
    } catch (error) {
      return { data: null, error: handleError(error, 'getMyAssignedCounters') }
    }
  },

  /**
   * Verificar se usuário pode operar um guichê
   * Retorna true se:
   * - Guichê não tem atribuição definida (aberto a todos)
   * - Usuário é o atribuído ao guichê
   */
  async canUserOperateCounter(
    queueId: string,
    counterId: string,
    userId: string,
  ): Promise<boolean> {
    try {
      const { data: counter } = await this.getCounter(queueId, counterId)
      if (!counter) return false

      // Se não há atribuição, qualquer um pode operar
      if (!counter.assignedUserId) return true

      // Se há atribuição, apenas o atribuído pode operar
      return counter.assignedUserId === userId
    } catch {
      return false
    }
  },

  // ============================================
  // Pausa Programada
  // ============================================

  /**
   * Agendar pausa após atendimento atual
   */
  async schedulePauseAfterCurrent(
    queueId: string,
    counterId: string,
  ): Promise<{ error: Error | null }> {
    try {
      await updateDoc(doc(db, 'queues', queueId, 'counters', counterId), {
        pauseAfterCurrent: true,
        updatedAt: serverTimestamp(),
      })
      return { error: null }
    } catch (error) {
      return { error: handleError(error, 'schedulePauseAfterCurrent') }
    }
  },

  /**
   * Cancelar pausa programada
   */
  async cancelScheduledPause(queueId: string, counterId: string): Promise<{ error: Error | null }> {
    try {
      await updateDoc(doc(db, 'queues', queueId, 'counters', counterId), {
        pauseAfterCurrent: null,
        scheduledPauseAt: null,
        updatedAt: serverTimestamp(),
      })
      return { error: null }
    } catch (error) {
      return { error: handleError(error, 'cancelScheduledPause') }
    }
  },

  /**
   * Entrar na fila como atendente (Atômico)
   * Encontra ou cria um Counter e atribui ao usuário
   */
  async enterQueueAsAttendant(
    queueId: string,
    organizationId: string,
    userId: string,
    userName: string,
    stationName: string,
  ): Promise<{ counterId: string | null; error: Error | null }> {
    try {
      // GARANTIA DE ATOMICIDADE:
      // Usamos o NOME normalizado (slug) como ID do documento.
      // Isso permite usar transaction.get() para garantir unicidade absoluta.

      const slug = stationName.toLowerCase().replace(/[^a-z0-9]/g, '-')
      const deterministicId = slug

      const counterId = await runTransaction(db, async (transaction) => {
        const counterRef = doc(db, 'queues', queueId, 'counters', deterministicId)
        const counterDoc = await transaction.get(counterRef)

        if (counterDoc.exists()) {
          // Se existe, verifica se está livre ou se é do próprio usuário
          const data = counterDoc.data() as Counter

          // Permitir roubar a mesa se estiver "closed"? O usuário pediu "conflito".
          // Vamos simplificar: Se existe e está assigned para OUTRO, erro.
          if (data.assignedUserId && data.assignedUserId !== userId) {
            throw new Error(`A ${stationName} já está sendo usada por ${data.assignedUserName}`)
          }

          // Atribuir
          transaction.update(counterRef, {
            assignedUserId: userId,
            assignedUserName: userName,
            name: stationName, // Garante casing correto
            updatedAt: serverTimestamp(),
          })

          return deterministicId
        } else {
          // Criar novo
          // Precisamos do "number". Ler a coleção inteira é inviável na transaction.
          // Vamos usar um numero aleatório ou timestamp para ordenação se não tivermos contador?
          // Ou aceitar que a ordem numero vai ser falha.
          // O user pediu ordem "01 02..". Podemos extrair o numero do nome "Mesa 01" -> 1

          const match = stationName.match(/\d+/)
          const number = match ? parseInt(match[0], 10) : 999

          transaction.set(counterRef, {
            queueId,
            organizationId,
            name: stationName,
            number,
            status: 'closed',
            categories: [],
            ticketsServedToday: 0,
            assignedUserId: userId,
            assignedUserName: userName,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          })

          return deterministicId
        }
      })

      return { counterId, error: null }
    } catch (error) {
      return { counterId: null, error: handleError(error, 'enterQueueAsAttendant') }
    }
  },
}
