/**
 * Queue System Types
 * Sistema de Fila de Atendimento Multi-Tenant
 */

import type { Timestamp } from 'firebase/firestore'

// ============================================
// Categoria de Serviço
// ============================================

export interface ServiceCategory {
  id: string
  name: string // "Consulta", "Exame", "Pagamento"
  prefix: string // "C", "E", "P" - usado na senha C001
  color: string // cor para identificação visual
  priority: number // 1-10, maior = mais prioridade
  estimatedTime: number // tempo médio em minutos
  isActive: boolean
}

// ============================================
// Fila Principal
// ============================================

export interface Queue {
  id: string
  organizationId: string
  name: string // "Fila Principal", "Atendimento Geral"
  isActive: boolean
  settings: QueueSettings
  // Contadores diários (resetam automaticamente)
  dailyCounters: Record<string, number> // { "C": 42, "E": 15 } - última senha por prefixo
  lastResetDate: string // "2024-12-14" - para saber quando resetar
  createdAt: Timestamp
  updatedAt: Timestamp
}

export interface QueueSettings {
  audioEnabled: boolean
  voiceType: 'male' | 'female'
  displayCount: number // quantas senhas mostrar no monitor (ex: 5)
  autoResetDaily: boolean // resetar contadores à meia-noite
  callRepeatCount: number // quantas vezes repetir chamada (1-3)
}

// ============================================
// Ticket (Senha)
// ============================================

export type TicketStatus = 'waiting' | 'calling' | 'serving' | 'finished' | 'cancelled' | 'no_show'

export interface Ticket {
  id: string
  queueId: string
  organizationId: string
  // Identificação
  number: number // sequencial do dia (1, 2, 3...)
  fullCode: string // "C001", "E015"
  categoryId: string
  categoryName: string // denormalizado para display
  categoryColor: string // denormalizado para display
  // Status
  status: TicketStatus
  priority: number // herdado da categoria + boost preferencial
  isPriority: boolean // senha preferencial (idoso, gestante, etc)
  // Atendimento
  counterId?: string // guichê que está/atendeu
  counterName?: string // "Guichê 3"
  attendantId?: string // userId do atendente
  // Timestamps
  createdAt: Timestamp
  calledAt?: Timestamp
  startedAt?: Timestamp // quando começou atendimento efetivo
  finishedAt?: Timestamp
  // Métricas
  waitTimeSeconds?: number // tempo de espera até ser chamado
  serviceTimeSeconds?: number // tempo de atendimento
}

// ============================================
// Guichê (Counter)
// ============================================

export type CounterStatus = 'open' | 'closed' | 'paused' | 'break'

export interface Counter {
  id: string
  queueId: string
  organizationId: string
  name: string // "Guichê 1"
  number: number // 1, 2, 3...
  status: CounterStatus
  // Atendente atual
  attendantId?: string
  attendantName?: string
  // Ticket atual
  currentTicketId?: string
  currentTicketCode?: string
  // Configuração
  categories: string[] // IDs das categorias que este guichê atende (vazio = todas)
  // Stats do dia
  ticketsServedToday: number
  createdAt: Timestamp
  updatedAt: Timestamp
}

// ============================================
// DTOs e Helpers
// ============================================

export interface EmitTicketInput {
  queueId: string
  categoryId: string
  isPriority?: boolean
}

export interface CallNextInput {
  counterId: string
  categoryId?: string // opcional: forçar categoria específica
}

export interface QueueStats {
  waitingCount: number
  servingCount: number
  finishedToday: number
  averageWaitTime: number // minutos
  averageServiceTime: number // minutos
  byCategory: Record<string, { waiting: number; served: number }>
}
