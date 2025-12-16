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
  // Personalização do Totem
  totemSettings?: TotemSettings
  // Contadores diários (resetam automaticamente)
  dailyCounters: Record<string, number> // { "C": 42, "E": 15 } - última senha por prefixo
  lastResetDate: string // "2024-12-14" - para saber quando resetar
  createdAt: Timestamp
  updatedAt: Timestamp
}

export interface QueueSettings {
  audioEnabled: boolean
  voiceType: 'male' | 'female' | 'custom'
  displayCount: number // quantas senhas mostrar no monitor (ex: 5)
  autoResetDaily: boolean // resetar contadores à meia-noite
  callRepeatCount: number // quantas vezes repetir chamada (1-3)
  // Áudio personalizado
  customAudioUrl?: string // URL do áudio customizado
  callTemplate?: string // Template: "Senha {code}, {counter}"
  backgroundMusicUrl?: string // Música de fundo no monitor
  backgroundMusicVolume?: number // 0-100
  // SLA Alerts
  slaEnabled?: boolean
  slaMaxWaitMinutes?: number // Alerta se espera > X min
  slaMaxQueueSize?: number // Alerta se fila > X pessoas
  slaMaxIdleMinutes?: number // Alerta se guichê ocioso > X min
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
  attendantName?: string // nome do atendente
  // Rechamada
  recallCount?: number // incrementa a cada rechamada (força reação do monitor)
  // Transferência
  transferredFrom?: string // counterId anterior
  transferredAt?: Timestamp
  transferReason?: string
  // Timestamps
  createdAt: Timestamp
  calledAt?: Timestamp
  startedAt?: Timestamp // quando começou atendimento efetivo
  finishedAt?: Timestamp
  // Métricas
  waitTimeSeconds?: number // tempo de espera até ser chamado
  serviceTimeSeconds?: number // tempo de atendimento
  // Feedback do cliente
  feedbackRating?: number // 1-5 estrelas
  feedbackComment?: string
  feedbackAt?: Timestamp
  // Tracking (QR Code)
  trackingToken?: string // token seguro para rastrear pelo celular
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
  // Atribuição fixa (definida pelo admin/owner)
  assignedUserId?: string
  assignedUserName?: string
  // Atendente atual (quem está operando agora)
  attendantId?: string
  attendantName?: string
  // Ticket atual
  currentTicketId?: string
  currentTicketCode?: string
  // Configuração
  categories: string[] // IDs das categorias que este guichê atende (vazio = todas)
  // Pausa programada
  pauseAfterCurrent?: boolean // Pausar após finalizar atendimento atual
  scheduledPauseAt?: Timestamp // Horário agendado para pausar
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

// ============================================
// Métricas e Analytics
// ============================================

export interface AttendantDayStats {
  ticketsServed: number
  averageServiceTimeSeconds: number
  totalActiveTimeSeconds: number
}

export interface CategoryDayStats {
  ticketsEmitted: number
  ticketsServed: number
  averageWaitTimeSeconds: number
}

export interface DailyQueueMetrics {
  id: string // formato: queueId_YYYY-MM-DD
  queueId: string
  organizationId: string
  date: string // YYYY-MM-DD
  // Tickets
  ticketsEmitted: number
  ticketsServed: number
  ticketsNoShow: number
  ticketsCancelled: number
  // Tempos
  averageWaitTimeSeconds: number
  averageServiceTimeSeconds: number
  maxWaitTimeSeconds: number
  // Pico
  peakHour: number // 0-23
  peakWaitingCount: number
  // Por funcionário
  byAttendant: Record<string, AttendantDayStats>
  // Por categoria
  byCategory: Record<string, CategoryDayStats>
  // Feedback
  averageRating: number
  feedbackCount: number
  // Timestamps
  createdAt: Timestamp
  updatedAt: Timestamp
}

export interface AttendanceSession {
  id: string
  queueId: string
  counterId: string
  counterName: string
  attendantId: string
  attendantName: string
  organizationId: string
  // Período
  startedAt: Timestamp
  endedAt?: Timestamp
  // Métricas da sessão
  ticketsServed: number
  ticketsNoShow: number
  ticketsCancelled: number
  totalServiceTimeSeconds: number
  averageServiceTimeSeconds: number
}

// ============================================
// Personalização do Totem
// ============================================

export interface TotemSettings {
  // Cores
  primaryColor: string
  backgroundColor: string
  cardColor: string
  textColor: string
  // Textos
  welcomeTitle: string
  welcomeSubtitle: string
  generalButtonText: string
  priorityButtonText: string
  priorityDescription: string
  ticketSuccessTitle: string
  ticketSuccessMessage: string
  footerText: string // Suporta {count} para pessoas na fila
  // Ícones (nomes do Lucide)
  welcomeIcon: string
  generalIcon: string
  priorityIcon: string
  ticketIcon: string
  // Logo
  logoUrl?: string
  logoPosition: 'top' | 'bottom' | 'none'
  // Avançado
  customCss?: string
}

export const DEFAULT_TOTEM_SETTINGS: TotemSettings = {
  primaryColor: 'hsl(var(--primary))',
  backgroundColor: 'hsl(var(--background))',
  cardColor: 'hsl(var(--card))',
  textColor: 'hsl(var(--foreground))',
  welcomeTitle: 'Bem-vindo!',
  welcomeSubtitle: 'Toque na tela para retirar sua senha',
  generalButtonText: 'Atendimento Geral',
  priorityButtonText: 'Atendimento Preferencial',
  priorityDescription: 'Idosos, gestantes, PcD e lactantes',
  ticketSuccessTitle: 'Senha Retirada!',
  ticketSuccessMessage: 'Por favor, aguarde ser chamado no painel.',
  footerText: '{count} pessoas na fila',
  welcomeIcon: 'Hand',
  generalIcon: 'Users',
  priorityIcon: 'UserCheck',
  ticketIcon: 'Ticket',
  logoPosition: 'none',
}

// ============================================
// DTOs Adicionais
// ============================================

export interface TransferTicketInput {
  ticketId: string
  toCounterId: string
  reason?: string
}

export type SLAAlertType =
  | 'wait_time_exceeded'
  | 'queue_size_exceeded'
  | 'counter_idle'
  | 'priority_waiting_long'

export interface SLAAlert {
  id: string
  queueId: string
  type: SLAAlertType
  message: string
  severity: 'warning' | 'critical'
  createdAt: Timestamp
  resolvedAt?: Timestamp
}
