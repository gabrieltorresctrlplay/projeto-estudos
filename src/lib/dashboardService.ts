import type { ActivityItem, DashboardStats } from '@/types'
import {
  collection,
  count,
  getAggregateFromServer,
  getDocs,
  limit,
  orderBy,
  query,
  sum,
  Timestamp,
  where,
} from 'firebase/firestore'

import { db } from './firebase'

export const dashboardService = {
  /**
   * Get aggregated stats for the dashboard
   * Uses server-side aggregation for performance
   */
  getDashboardStats: async (
    orgId: string,
  ): Promise<{ data: DashboardStats | null; error: Error | null }> => {
    try {
      // 1. Total Revenue (Sum of 'amount' in 'transactions')
      const transactionsRef = collection(db, 'transactions')
      const revenueQuery = query(transactionsRef, where('organizationId', '==', orgId))
      const revenueSnapshot = await getAggregateFromServer(revenueQuery, {
        totalRevenue: sum('amount'),
        count: count(),
      })

      // 2. Active Customers (Count of 'customers')
      const customersRef = collection(db, 'customers')
      const customersQuery = query(customersRef, where('organizationId', '==', orgId))
      const customersSnapshot = await getAggregateFromServer(customersQuery, {
        totalCustomers: count(),
      })

      // 3. Recent Activity Count (Last 7 days)
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

      const recentActivityQuery = query(
        transactionsRef,
        where('organizationId', '==', orgId),
        where('createdAt', '>=', sevenDaysAgo),
      )
      const recentActivitySnapshot = await getAggregateFromServer(recentActivityQuery, {
        count: count(),
      })

      return {
        data: {
          totalRevenue: revenueSnapshot.data().totalRevenue || 0,
          activeCustomers: customersSnapshot.data().totalCustomers || 0,
          growthRate: 0, // Placeholder: requires historical data processing
          recentActivityCount: recentActivitySnapshot.data().count || 0,
        },
        error: null,
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
      return { data: null, error: error as Error }
    }
  },

  /**
   * Get recent activity (transactions)
   */
  getRecentActivity: async (
    orgId: string,
    limitCount = 5,
  ): Promise<{ data: ActivityItem[] | null; error: Error | null }> => {
    try {
      const q = query(
        collection(db, 'transactions'),
        where('organizationId', '==', orgId),
        orderBy('createdAt', 'desc'),
        limit(limitCount),
      )

      const snapshot = await getDocs(q)

      const activities: ActivityItem[] = snapshot.docs.map((doc) => {
        const data = doc.data()
        return {
          id: doc.id,
          label: data.description || 'Transação',
          timestamp: (data.createdAt as Timestamp)?.toDate() || new Date(),
          amount: data.amount,
        }
      })

      return { data: activities, error: null }
    } catch (error) {
      console.error('Error fetching recent activity:', error)
      return { data: null, error: error as Error }
    }
  },
}
