/**
 * Dashboard Service - Refatorado
 * Estatísticas e atividades recentes do dashboard
 *
 * NOTA: Queries simplificadas para evitar necessidade de índices compostos.
 * Agregações são feitas client-side para funcionar sem configuração.
 */

import { db } from '@/shared/lib/firebase'
import type { ActivityItem, DashboardStats } from '@/shared/types'
import { collection, getDocs, query, Timestamp, where } from 'firebase/firestore'

// ============================================
// Helper
// ============================================

const handleError = (error: unknown, context: string): Error => {
  console.error(`[DashboardService] ${context}:`, error)
  return error instanceof Error ? error : new Error(`Erro em ${context}`)
}

// ============================================
// Service
// ============================================

export const dashboardService = {
  /**
   * Get aggregated stats for the dashboard
   * Refatorado para buscar documentos e agregar client-side
   */
  getDashboardStats: async (
    orgId: string,
  ): Promise<{ data: DashboardStats | null; error: Error | null }> => {
    try {
      // 1. Buscar transações (query simples, sem orderBy)
      const transactionsQuery = query(
        collection(db, 'transactions'),
        where('organizationId', '==', orgId),
      )
      const transactionsSnapshot = await getDocs(transactionsQuery)

      // Agregar client-side
      let totalRevenue = 0
      let recentActivityCount = 0
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

      transactionsSnapshot.docs.forEach((doc) => {
        const data = doc.data()
        totalRevenue += data.amount || 0

        // Contar atividades recentes
        const createdAt = data.createdAt as Timestamp
        if (createdAt?.toDate && createdAt.toDate() >= sevenDaysAgo) {
          recentActivityCount++
        }
      })

      // 2. Buscar clientes (query simples)
      const customersQuery = query(
        collection(db, 'customers'),
        where('organizationId', '==', orgId),
      )
      const customersSnapshot = await getDocs(customersQuery)
      const activeCustomers = customersSnapshot.size

      return {
        data: {
          totalRevenue,
          activeCustomers,
          growthRate: 0, // Placeholder
          recentActivityCount,
        },
        error: null,
      }
    } catch (error) {
      return { data: null, error: handleError(error, 'getDashboardStats') }
    }
  },

  /**
   * Get recent activity (transactions)
   * Refatorado para buscar e ordenar client-side
   */
  getRecentActivity: async (
    orgId: string,
    limitCount = 5,
  ): Promise<{ data: ActivityItem[] | null; error: Error | null }> => {
    try {
      // Query simples sem orderBy
      const q = query(collection(db, 'transactions'), where('organizationId', '==', orgId))

      const snapshot = await getDocs(q)

      // Mapear e ordenar client-side
      const activities: ActivityItem[] = snapshot.docs
        .map((doc) => {
          const data = doc.data()
          return {
            id: doc.id,
            label: data.description || 'Transação',
            timestamp: (data.createdAt as Timestamp)?.toDate() || new Date(),
            amount: data.amount,
          }
        })
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(0, limitCount)

      return { data: activities, error: null }
    } catch (error) {
      return { data: null, error: handleError(error, 'getRecentActivity') }
    }
  },
}
