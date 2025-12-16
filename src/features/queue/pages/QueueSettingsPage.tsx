import { useEffect, useState } from 'react'
import { useOrganizationContext } from '@/features/organization/context/OrganizationContext'
import { queueManagementService } from '@/features/queue/services/queueService'
import type { Queue, QueueSettings, TotemSettings } from '@/features/queue/types/queue'
import { Button } from '@/shared/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Separator } from '@/shared/components/ui/separator'
import { Switch } from '@/shared/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs'
import { AlertTriangle, ArrowLeft, Bell, Loader2, Palette, Save, Volume2 } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'

export default function QueueSettingsPage() {
  const { queueId } = useParams<{ queueId: string }>()
  const navigate = useNavigate()
  const { currentMemberRole } = useOrganizationContext()

  const [queue, setQueue] = useState<Queue | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  // SLA Settings
  const [slaEnabled, setSlaEnabled] = useState(false)
  const [slaMaxWaitMinutes, setSlaMaxWaitMinutes] = useState(30)
  const [slaMaxQueueSize, setSlaMaxQueueSize] = useState(50)

  // Audio Settings
  const [voiceType, setVoiceType] = useState<'male' | 'female' | 'custom'>('female')
  const [callTemplate, setCallTemplate] = useState('{code}, {counter}')

  // Totem Settings
  const [primaryColor, setPrimaryColor] = useState('#3b82f6')
  const [welcomeTitle, setWelcomeTitle] = useState('Bem-vindo!')
  const [welcomeSubtitle, setWelcomeSubtitle] = useState('Toque para retirar sua senha')

  const isAdmin = currentMemberRole === 'owner' || currentMemberRole === 'admin'

  useEffect(() => {
    if (!queueId) return

    const loadQueue = async () => {
      const { data } = await queueManagementService.getQueue(queueId)
      if (data) {
        setQueue(data)
        // Load existing settings
        if (data.settings) {
          setSlaEnabled(data.settings.slaEnabled || false)
          setSlaMaxWaitMinutes(data.settings.slaMaxWaitMinutes || 30)
          setSlaMaxQueueSize(data.settings.slaMaxQueueSize || 50)
          setVoiceType(data.settings.voiceType || 'female')
          setCallTemplate(data.settings.callTemplate || '{code}, {counter}')
        }
        if (data.totemSettings) {
          setPrimaryColor(data.totemSettings.primaryColor || '#3b82f6')
          setWelcomeTitle(data.totemSettings.welcomeTitle || 'Bem-vindo!')
          setWelcomeSubtitle(data.totemSettings.welcomeSubtitle || 'Toque para retirar sua senha')
        }
      }
      setIsLoading(false)
    }

    loadQueue()
  }, [queueId])

  const handleSave = async () => {
    if (!queueId) return

    setIsSaving(true)

    const settings: Partial<QueueSettings> = {
      slaEnabled,
      slaMaxWaitMinutes,
      slaMaxQueueSize,
      voiceType,
      callTemplate,
    }

    const totemSettings: Partial<TotemSettings> = {
      primaryColor,
      welcomeTitle,
      welcomeSubtitle,
    }

    const { error } = await queueManagementService.updateQueue(queueId, {
      settings,
      totemSettings,
    })

    if (error) {
      toast.error('Erro ao salvar', { description: error.message })
    } else {
      toast.success('Configurações salvas!')
    }

    setIsSaving(false)
  }

  if (!isAdmin) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 p-8">
        <AlertTriangle className="text-muted-foreground h-16 w-16" />
        <h1 className="text-2xl font-bold">Acesso Restrito</h1>
        <p className="text-muted-foreground">Apenas administradores podem alterar configurações.</p>
        <Button
          variant="outline"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="text-primary h-12 w-12 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h2 className="from-foreground to-foreground/70 bg-linear-to-r bg-clip-text text-4xl font-bold tracking-tight text-transparent">
            Configurações
          </h2>
          <p className="text-muted-foreground mt-2 text-lg">{queue?.name}</p>
        </div>
        <Button
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          Salvar
        </Button>
      </div>

      <Tabs
        defaultValue="sla"
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger
            value="sla"
            className="gap-2"
          >
            <Bell className="h-4 w-4" />
            SLA Alerts
          </TabsTrigger>
          <TabsTrigger
            value="audio"
            className="gap-2"
          >
            <Volume2 className="h-4 w-4" />
            Áudio
          </TabsTrigger>
          <TabsTrigger
            value="totem"
            className="gap-2"
          >
            <Palette className="h-4 w-4" />
            Totem
          </TabsTrigger>
        </TabsList>

        {/* SLA Tab */}
        <TabsContent value="sla">
          <Card>
            <CardHeader>
              <CardTitle>Alertas de SLA</CardTitle>
              <CardDescription>
                Configure alertas para monitorar a qualidade do atendimento
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Ativar Alertas de SLA</Label>
                  <p className="text-muted-foreground text-sm">
                    Receba alertas quando limites forem ultrapassados
                  </p>
                </div>
                <Switch
                  checked={slaEnabled}
                  onCheckedChange={setSlaEnabled}
                />
              </div>

              <Separator />

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="maxWait">Tempo Máximo de Espera (min)</Label>
                  <Input
                    id="maxWait"
                    type="number"
                    value={slaMaxWaitMinutes}
                    onChange={(e) => setSlaMaxWaitMinutes(Number(e.target.value))}
                    disabled={!slaEnabled}
                  />
                  <p className="text-muted-foreground text-xs">
                    Alerta quando alguém espera mais que isso
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxQueue">Tamanho Máximo da Fila</Label>
                  <Input
                    id="maxQueue"
                    type="number"
                    value={slaMaxQueueSize}
                    onChange={(e) => setSlaMaxQueueSize(Number(e.target.value))}
                    disabled={!slaEnabled}
                  />
                  <p className="text-muted-foreground text-xs">
                    Alerta quando a fila exceder este número
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Audio Tab */}
        <TabsContent value="audio">
          <Card>
            <CardHeader>
              <CardTitle>Configurações de Áudio</CardTitle>
              <CardDescription>Personalize a voz e mensagens de chamada</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Tipo de Voz</Label>
                <div className="flex gap-2">
                  {(['female', 'male'] as const).map((type) => (
                    <Button
                      key={type}
                      variant={voiceType === type ? 'default' : 'outline'}
                      onClick={() => setVoiceType(type)}
                      className="flex-1"
                    >
                      {type === 'female' ? 'Feminina' : 'Masculina'}
                    </Button>
                  ))}
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="template">Template de Chamada</Label>
                <Input
                  id="template"
                  value={callTemplate}
                  onChange={(e) => setCallTemplate(e.target.value)}
                  placeholder="{code}, {counter}"
                />
                <p className="text-muted-foreground text-xs">
                  Use {'{code}'} para o código da senha e {'{counter}'} para o guichê
                </p>
                <div className="bg-muted rounded-lg p-3">
                  <p className="text-sm">
                    <strong>Prévia:</strong>{' '}
                    {callTemplate.replace('{code}', 'A 0 0 1').replace('{counter}', 'Guichê 1')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Totem Tab */}
        <TabsContent value="totem">
          <Card>
            <CardHeader>
              <CardTitle>Personalização do Totem</CardTitle>
              <CardDescription>Customize cores e textos da tela do totem</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="primaryColor">Cor Principal</Label>
                <div className="flex gap-2">
                  <Input
                    id="primaryColor"
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="h-10 w-20 cursor-pointer"
                  />
                  <Input
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="welcomeTitle">Título de Boas-vindas</Label>
                <Input
                  id="welcomeTitle"
                  value={welcomeTitle}
                  onChange={(e) => setWelcomeTitle(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="welcomeSubtitle">Subtítulo</Label>
                <Input
                  id="welcomeSubtitle"
                  value={welcomeSubtitle}
                  onChange={(e) => setWelcomeSubtitle(e.target.value)}
                />
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>Prévia</Label>
                <div
                  className="rounded-xl border-2 p-8 text-center"
                  style={{ borderColor: primaryColor }}
                >
                  <h3
                    className="text-2xl font-bold"
                    style={{ color: primaryColor }}
                  >
                    {welcomeTitle}
                  </h3>
                  <p className="text-muted-foreground mt-2">{welcomeSubtitle}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
