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
    <div className="bg-background relative flex min-h-screen items-center justify-center overflow-hidden p-4">
      {/* Ambient Glow Background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="bg-primary/10 absolute top-1/4 left-1/4 h-96 w-96 rounded-full opacity-50 mix-blend-screen blur-[128px]" />
        <div className="bg-brand-500/10 absolute right-1/4 bottom-1/4 h-96 w-96 rounded-full opacity-50 mix-blend-screen blur-[128px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-4xl"
      >
        {/* Header buttons */}
        <div className="absolute top-4 right-4 z-10 flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSkip}
            disabled={skipping}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowRight className="mr-2 h-4 w-4" />
            {skipping ? 'Pulando...' : 'Pular'}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="text-muted-foreground hover:text-destructive transition-colors"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sair
          </Button>
        </div>

        <div className="mb-12 space-y-4 text-center">
          <h1 className="text-foreground text-4xl font-bold tracking-tight md:text-5xl">
            Bem-vindo ao{' '}
            <span className="from-primary to-brand-400 bg-linear-to-r bg-clip-text text-transparent">
              Supabase Space
            </span>
          </h1>
          <p className="text-muted-foreground mx-auto max-w-2xl text-lg leading-relaxed md:text-xl">
            Crie uma organização para começar ou entre em uma existente.
          </p>
        </div>

        <div className="relative z-10 grid gap-6 md:grid-cols-2">
          {/* Create Organization */}
          <Card className="group border-border/50 bg-card/50 hover:bg-card/80 hover:border-primary/20 relative overflow-hidden backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
            <div className="from-primary/5 absolute inset-0 bg-linear-to-br via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            <CardHeader className="relative pb-2 text-center">
              <div className="mb-6 flex justify-center">
                <div className="from-primary/20 to-primary/5 text-primary shadow-primary/10 flex h-20 w-20 items-center justify-center rounded-3xl bg-linear-to-br shadow-xl ring-1 ring-white/10 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">
                  <Building2 className="h-10 w-10" />
                </div>
              </div>
              <CardTitle className="text-2xl">Criar Organização</CardTitle>
              <CardDescription>Comece sua jornada do zero</CardDescription>
            </CardHeader>
            <CardContent className="relative">
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
                    className="bg-background/50 focus:bg-background h-11 transition-colors"
                  />
                </div>
                <Button
                  type="submit"
                  className="shadow-primary/20 h-11 w-full shadow-lg transition-all active:scale-95"
                  disabled={creating || isLoading || !orgName.trim()}
                >
                  {creating ? 'Criando...' : 'Criar Organização'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Join Organization */}
          <Card className="group border-border/50 bg-card/50 hover:bg-card/80 hover:border-primary/20 relative overflow-hidden backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
            <div className="from-secondary/5 absolute inset-0 bg-gradient-to-br via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            <CardHeader className="relative pb-2 text-center">
              <div className="mb-6 flex justify-center">
                <div className="from-secondary/20 to-secondary/5 text-secondary shadow-secondary/10 flex h-20 w-20 items-center justify-center rounded-3xl bg-linear-to-br shadow-xl ring-1 ring-white/10 transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-3">
                  <Ticket className="h-10 w-10" />
                </div>
              </div>
              <CardTitle className="text-2xl">Entrar com Token</CardTitle>
              <CardDescription>Use um convite existente</CardDescription>
            </CardHeader>
            <CardContent className="relative">
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
                    className="bg-background/50 focus:bg-background h-11 transition-colors"
                  />
                </div>
                <Button
                  type="submit"
                  variant="outline"
                  className="hover:bg-secondary/10 hover:text-secondary hover:border-secondary/20 h-11 w-full transition-all active:scale-95"
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
