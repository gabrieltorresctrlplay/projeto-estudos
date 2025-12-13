import { Plus } from 'lucide-react'

import { authService } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function Dashboard() {
  const user = authService.getCurrentUser()

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">
            Bem-vindo de volta, {user?.displayName || user?.email?.split('@')[0]}.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Novo Projeto
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="bg-card/50 border-primary/10 hover:border-primary/30 backdrop-blur-xl transition-colors">
          <CardHeader>
            <CardTitle>Visão Geral</CardTitle>
            <CardDescription>Resumo da sua conta</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="bg-muted/50 flex items-center justify-between rounded p-2">
                <span className="text-sm">Status</span>
                <span className="rounded-full border border-[hsl(var(--chart-1)_/_0.3)] bg-[hsl(var(--chart-1)_/_0.1)] px-2 py-1 text-xs font-medium text-[hsl(var(--chart-1))]">
                  Ativo
                </span>
              </div>
              <div className="bg-muted/50 flex items-center justify-between rounded p-2">
                <span className="text-sm">Plano</span>
                <span className="text-xs font-medium">Free Tier</span>
              </div>
              <div className="bg-muted/50 flex items-center justify-between rounded p-2">
                <span className="text-sm">Membros</span>
                <span className="text-xs font-medium">1</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-primary/10 hover:border-primary/30 backdrop-blur-xl transition-colors">
          <CardHeader>
            <CardTitle>Atividade Recente</CardTitle>
            <CardDescription>Últimas ações no sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center space-y-2 py-4 text-center">
              <p className="text-muted-foreground text-sm">Nenhuma atividade recente.</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-primary/10 hover:border-primary/30 backdrop-blur-xl transition-colors">
          <CardHeader>
            <CardTitle>Acesso Rápido</CardTitle>
            <CardDescription>Atalhos do sistema</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2">
            <Button
              variant="secondary"
              className="w-full justify-start"
            >
              Gerenciar Perfil
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start"
            >
              Ver Documentação
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Example Chart Section Area */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="bg-card/50 border-primary/10 col-span-4 backdrop-blur-xl">
          <CardHeader>
            <CardTitle>Analytics</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="bg-muted/20 flex h-[200px] items-center justify-center rounded-md border border-dashed">
              <p className="text-muted-foreground text-sm">Gráfico de Visitas (Em breve)</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-primary/10 col-span-3 backdrop-blur-xl">
          <CardHeader>
            <CardTitle>Equipe</CardTitle>
            <CardDescription>Membros online agora</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="bg-primary/20 text-primary flex size-8 items-center justify-center rounded-full text-xs font-bold">
                  VC
                </div>
                <div>
                  <p className="text-sm leading-none font-medium">Você</p>
                  <p className="text-muted-foreground text-xs">Online</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
