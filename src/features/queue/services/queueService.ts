import { counterService } from './counterService'
import { metricsService } from './metricsService'
import { queueManagementService } from './queueManagementService'
import { queueStatsService } from './queueStatsService'
import { realtimeService } from './realtimeService'
import { ticketService } from './ticketService'

/**
 * Queue Service - Facade
 * Aggregates all queue-related services for backward compatibility and convenience.
 */
export const queueService = {
  ...queueManagementService,
  ...counterService,
  ...ticketService,
  ...queueStatsService,
  ...realtimeService,
  ...metricsService,
}

// Export individual services for granular usage
export {
  queueManagementService,
  counterService,
  ticketService,
  queueStatsService,
  realtimeService,
  metricsService,
}
