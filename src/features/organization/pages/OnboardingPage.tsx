import { useState } from 'react'
import { authService } from '@/features/auth/services/authService'
import { useOrganizationContext } from '@/features/organization/context/OrganizationContext'
import { Button } from '@/shared/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card'
import { FeatureIcon } from '@/shared/components/ui/feature-icon'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { userService } from '@/shared/lib/userService'
import { motion } from 'framer-motion'
import { Building2, LogOut, Ticket } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function Onboarding() {
  const navigate = useNavigate()
  const { user, createOrganization, acceptInvite, isLoading } = useOrganizationContext()

  const [orgName, setOrgName] = useState('')
  const [inviteToken, setInviteToken] = useState('')
  const [creating, setCreating] = useState(false)
  const [accepting, setAccepting] = useState(false)
  const [skipping, setSkipping] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogout = async () => {
    await authService.signOut()
    navigate('/')
  }

  const handleSkip = async () => {
    if (!user) return

    setSkipping(true)
    await userService.setOnboardingComplete(user.uid)
    navigate('/dashboard')
  }

  const handleCreateOrg = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setError(null)
    setCreating(true)

    const { orgId, error: createError } = await createOrganization(orgName)

    if (createError) {
      setError(createError.message)
      setCreating(false)
      return
    }

    if (orgId) {
      await userService.setOnboardingComplete(user.uid)
      navigate('/dashboard')
    }
  }

  const handleJoinOrg = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setError(null)
    setAccepting(true)

    const { success, error: acceptError } = await acceptInvite(inviteToken)

    if (acceptError) {
      setError(acceptError.message)
      setAccepting(false)
      return
    }

    if (success) {
      await userService.setOnboardingComplete(user.uid)
      navigate('/dashboard')
    }
  }

  return (
    <div className="bg-background relative flex min-h-screen items-center justify-center overflow-hidden p-4">
      {/* Botão Sair - Canto superior direito */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleLogout}
        className="text-destructive absolute top-4 right-4 z-20"
      >
        <LogOut className="mr-2 h-4 w-4" />
        Sair
      </Button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-4xl"
      >
        <div className="mb-12 space-y-4 text-center">
          <h1 className="text-foreground text-4xl font-bold tracking-tight md:text-5xl">
            Bem-vindo ao <span className="text-primary">NerfasInc Space</span>
          </h1>
          <p className="text-muted-foreground mx-auto max-w-2xl text-lg leading-relaxed md:text-xl">
            Crie uma organização para começar ou entre em uma existente.
          </p>
        </div>

        <div className="relative z-10 grid gap-10 md:grid-cols-2">
          {/* Create Organization */}
          <Card>
            <CardHeader className="pb-2 text-center">
              <div className="mb-6 flex justify-center">
                <FeatureIcon
                  icon={Building2}
                  className="h-16 w-16"
                />
              </div>
              <CardTitle className="text-2xl">Criar Organização</CardTitle>
              <CardDescription>Comece sua jornada do zero</CardDescription>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={handleCreateOrg}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="orgName">Nome da Organização</Label>
                  <Input
                    id="orgName"
                    placeholder="Ex: Acme Inc."
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    disabled={creating || isLoading}
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={creating || isLoading || !orgName.trim()}
                >
                  {creating ? 'Criando...' : 'Criar Organização'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Divider "ou" */}
          <div className="flex items-center justify-center md:hidden">
            <div className="border-border flex-1 border-t" />
            <span className="text-muted-foreground bg-background px-4 text-sm font-medium">ou</span>
            <div className="border-border flex-1 border-t" />
          </div>

          {/* Desktop: Absolute "ou" between cards */}
          <div className="pointer-events-none absolute inset-0 hidden items-center justify-center md:flex">
            <span className="text-muted-foreground z-20 text-sm font-semibold">ou</span>
          </div>

          {/* Join Organization */}
          <Card>
            <CardHeader className="pb-2 text-center">
              <div className="mb-6 flex justify-center">
                <FeatureIcon
                  icon={Ticket}
                  className="h-16 w-16"
                />
              </div>
              <CardTitle className="text-2xl">Entrar com Token</CardTitle>
              <CardDescription>Use um convite existente</CardDescription>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={handleJoinOrg}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="inviteToken">Código do Convite</Label>
                  <Input
                    id="inviteToken"
                    placeholder="Cole seu token..."
                    value={inviteToken}
                    onChange={(e) => setInviteToken(e.target.value)}
                    disabled={accepting || isLoading}
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={accepting || isLoading || !inviteToken.trim()}
                >
                  {accepting ? 'Entrando...' : 'Usar Convite'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Botão Pular - Centralizado abaixo dos cards */}
        <div className="mt-8 flex justify-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSkip}
            disabled={skipping}
            className="text-muted-foreground"
          >
            {skipping ? 'Pulando...' : 'Pular por agora'}
          </Button>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="border-destructive/20 bg-destructive/10 text-destructive mt-8 rounded-xl border p-4 text-center text-sm font-medium"
          >
            {error}
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}
