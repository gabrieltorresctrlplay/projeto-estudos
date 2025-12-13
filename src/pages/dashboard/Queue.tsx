import { useState } from 'react'
import { Info, MonitorPlay, Tv, Users } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

export default function Queue() {
  const [isMonitorDialogOpen, setIsMonitorDialogOpen] = useState(false)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Fila</h2>
        <p className="text-muted-foreground">Gerencie sua fila de atendimento</p>
      </div>

      {/* Botões de navegação */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="hover:border-primary cursor-pointer transition-colors">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Monitores</CardTitle>
              <MonitorPlay className="text-primary h-5 w-5" />
            </div>
            <CardDescription>Visualize os painéis de chamada</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              className="w-full"
              variant="outline"
              onClick={() => setIsMonitorDialogOpen(true)}
            >
              Acessar Monitores
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:border-primary cursor-pointer transition-colors">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Guichês</CardTitle>
              <Users className="text-primary h-5 w-5" />
            </div>
            <CardDescription>Gerencie os guichês de atendimento</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              className="w-full"
              variant="outline"
            >
              Acessar Guichês
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:border-primary cursor-pointer transition-colors">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Informações</CardTitle>
              <Info className="text-primary h-5 w-5" />
            </div>
            <CardDescription>Configurações e estatísticas</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              className="w-full"
              variant="outline"
            >
              Ver Informações
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Modal de Monitores */}
      <Dialog
        open={isMonitorDialogOpen}
        onOpenChange={setIsMonitorDialogOpen}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Escolha o tipo de monitor</DialogTitle>
            <DialogDescription>
              Selecione qual tipo de monitor você deseja acessar
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4">
            <Card className="hover:border-primary cursor-pointer transition-colors">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Tv className="text-primary h-6 w-6" />
                  <div>
                    <CardTitle className="text-base">Totem</CardTitle>
                    <CardDescription className="text-xs">
                      Painel de autoatendimento para senhas
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button
                  className="w-full"
                  variant="default"
                >
                  Abrir Totem
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:border-primary cursor-pointer transition-colors">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <MonitorPlay className="text-primary h-6 w-6" />
                  <div>
                    <CardTitle className="text-base">Monitor de Chamada</CardTitle>
                    <CardDescription className="text-xs">
                      Painel de exibição de chamadas
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button
                  className="w-full"
                  variant="default"
                >
                  Abrir Monitor
                </Button>
              </CardContent>
            </Card>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
