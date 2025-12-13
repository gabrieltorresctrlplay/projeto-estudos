import type { Company } from '@/types'
import { Activity, Building2, DollarSign, TrendingUp, Users } from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface CompanyOverviewProps {
  company: Company
}

export function CompanyOverview({ company }: CompanyOverviewProps) {
  // Dados fake para demonstração
  const stats = [
    {
      title: 'Receita Total',
      value: 'R$ 45.231,89',
      change: '+20.1% em relação ao mês passado',
      icon: DollarSign,
    },
    {
      title: 'Clientes Ativos',
      value: '+2.350',
      change: '+180 novos este mês',
      icon: Users,
    },
    {
      title: 'Taxa de Crescimento',
      value: '+12.5%',
      change: '+4.5% em relação ao trimestre anterior',
      icon: TrendingUp,
    },
    {
      title: 'Atividade Recente',
      value: '573',
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
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <Icon className="text-muted-foreground h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
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
            {[
              { label: 'Nova venda realizada', time: 'Há 2 horas', amount: 'R$ 1.234,56' },
              { label: 'Cliente cadastrado', time: 'Há 4 horas', amount: null },
              { label: 'Pagamento recebido', time: 'Há 1 dia', amount: 'R$ 3.450,00' },
              { label: 'Produto atualizado', time: 'Há 2 dias', amount: null },
            ].map((activity, index) => (
              <div
                key={index}
                className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0"
              >
                <div>
                  <p className="text-sm font-medium">{activity.label}</p>
                  <p className="text-muted-foreground text-xs">{activity.time}</p>
                </div>
                {activity.amount && (
                  <p className="text-sm font-semibold text-green-600 dark:text-green-400">
                    {activity.amount}
                  </p>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
