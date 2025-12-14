import { useEffect, useState } from 'react'
import type { ActivityItem, Company, DashboardStats } from '@/types'
import { Activity, Building2, DollarSign, TrendingUp, Users } from 'lucide-react'

import { dashboardService } from '@/lib/dashboardService'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

interface CompanyOverviewProps {
  company: Company
}

export function CompanyOverview({ company }: CompanyOverviewProps) {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    async function loadData() {
      if (!company?.id) return

      setLoading(true)
      try {
        const [statsRes, activityRes] = await Promise.all([
          dashboardService.getDashboardStats(company.id),
          dashboardService.getRecentActivity(company.id),
        ])

        if (isMounted) {
          if (statsRes.data) setStats(statsRes.data)
          if (activityRes.data) setActivities(activityRes.data)
        }
      } catch (error) {
        console.error('Failed to load dashboard data:', error)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    loadData()

    return () => {
      isMounted = false
    }
  }, [company.id])

  // Helper to format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  // Helper to format relative time
  const formatRelativeTime = (date: Date) => {
    const rtf = new Intl.RelativeTimeFormat('pt-BR', { numeric: 'auto' })
    const now = new Date()
    const diffInSeconds = (date.getTime() - now.getTime()) / 1000

    if (Math.abs(diffInSeconds) < 60) return rtf.format(Math.round(diffInSeconds), 'second')
    if (Math.abs(diffInSeconds) < 3600) return rtf.format(Math.round(diffInSeconds / 60), 'minute')
    if (Math.abs(diffInSeconds) < 86400) return rtf.format(Math.round(diffInSeconds / 3600), 'hour')
    return rtf.format(Math.round(diffInSeconds / 86400), 'day')
  }

  const statItems = [
    {
      title: 'Receita Total',
      value: loading ? null : formatCurrency(stats?.totalRevenue || 0),
      change: 'Lifetime', // We don't have historical data for % change yet
      icon: DollarSign,
    },
    {
      title: 'Clientes Ativos',
      value: loading ? null : (stats?.activeCustomers || 0).toLocaleString('pt-BR'),
      change: 'Total cadastrados',
      icon: Users,
    },
    {
      title: 'Taxa de Crescimento',
      value: loading ? null : '0%', // Placeholder until we have historical data
      change: 'Dados insuficientes',
      icon: TrendingUp,
    },
    {
      title: 'Atividade Recente',
      value: loading ? null : (stats?.recentActivityCount || 0).toString(),
      change: 'Transações nos últimos 7 dias',
      icon: Activity,
    },
  ]

  return (
    <div className="space-y-6">
      {/* Company Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 flex h-12 w-12 items-center justify-center rounded-lg">
              <Building2 className="text-primary h-6 w-6" />
            </div>
            <div>
              <CardTitle className="text-2xl">{company.name}</CardTitle>
              <CardDescription>
                Empresa criada em {company.createdAt.toLocaleDateString('pt-BR')}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statItems.map((stat, i) => {
          const Icon = stat.icon
          return (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <Icon className="text-muted-foreground h-4 w-4" />
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-8 w-24" />
                ) : (
                  <div className="text-2xl font-bold">{stat.value}</div>
                )}
                <p className="text-muted-foreground text-xs">{stat.change}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Recent Activity Card */}
      <Card>
        <CardHeader>
          <CardTitle>Atividade Recente</CardTitle>
          <CardDescription>Últimas movimentações da sua empresa</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between border-b pb-3 last:border-0">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <Skeleton className="h-4 w-16" />
                </div>
              ))
            ) : activities.length === 0 ? (
              <p className="text-muted-foreground text-center py-4 text-sm">
                Nenhuma atividade recente encontrada.
              </p>
            ) : (
              activities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0"
                >
                  <div>
                    <p className="text-sm font-medium">{activity.label}</p>
                    <p className="text-muted-foreground text-xs">
                      {formatRelativeTime(activity.timestamp)}
                    </p>
                  </div>
                  {activity.amount && (
                    <p className="text-sm font-semibold text-green-600 dark:text-green-400">
                      {formatCurrency(activity.amount)}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
