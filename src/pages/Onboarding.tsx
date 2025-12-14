import { useState } from 'react'
import { useOrganizationContext } from '@/contexts/OrganizationContext'
import { motion } from 'framer-motion'
import { ArrowRight, Building2, LogOut, Ticket } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { authService } from '@/lib/auth'
import { userService } from '@/lib/userService'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

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
    // Mark onboarding as complete so it doesn't show again
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
      // Mark onboarding complete and redirect
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
      // Mark onboarding complete and redirect
      await userService.setOnboardingComplete(user.uid)
      navigate('/dashboard')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-4xl"
      >
        {/* Header buttons */}
        <div className="absolute top-4 right-4 flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSkip}
            disabled={skipping}
          >
            <ArrowRight className="mr-2 h-4 w-4" />
            {skipping ? 'Pulando...' : 'Pular'}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sair
          </Button>
        </div>

        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold">Bem-vindo!</h1>
          <p className="text-muted-foreground mt-2">
            Crie uma organização, entre em uma existente, ou pule para explorar como visitante.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Create Organization */}
          <Card>
            <CardHeader>
              <div className="mb-4 flex justify-center">
                <div className="bg-primary/10 text-primary flex h-12 w-12 items-center justify-center rounded-full">
                  <Building2 className="h-6 w-6" />
                </div>
              </div>
              <CardTitle>Criar Organização</CardTitle>
              <CardDescription>Comece sua própria organização do zero</CardDescription>
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
                    placeholder="Minha Empresa"
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

          {/* Join Organization */}
          <Card>
            <CardHeader>
              <div className="mb-4 flex justify-center">
                <div className="bg-primary/10 text-primary flex h-12 w-12 items-center justify-center rounded-full">
                  <Ticket className="h-6 w-6" />
                </div>
              </div>
              <CardTitle>Entrar com Token</CardTitle>
              <CardDescription>Cole o código de convite que você recebeu</CardDescription>
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
                    placeholder="Cole o token aqui"
                    value={inviteToken}
                    onChange={(e) => setInviteToken(e.target.value)}
                    disabled={accepting || isLoading}
                    required
                  />
                </div>
                <Button
                  type="submit"
                  variant="outline"
                  className="w-full"
                  disabled={accepting || isLoading || !inviteToken.trim()}
                >
                  {accepting ? 'Entrando...' : 'Usar Convite'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="border-destructive/20 bg-destructive/10 text-destructive mt-6 rounded border p-3 text-center text-sm"
          >
            {error}
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}
