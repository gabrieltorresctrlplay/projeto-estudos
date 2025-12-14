import { useEffect, useState } from 'react'
import { useOrganizationContext } from '@/contexts/OrganizationContext'
import type { UserProfile } from '@/types'
import type { User as FirebaseUser } from 'firebase/auth'
import { Building2, Ticket } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'

import { authService } from '@/lib/auth'
import { userService } from '@/lib/userService'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { CompanyOverview } from '@/components/dashboard/CompanyOverview'

export default function Dashboard() {
  const navigate = useNavigate()
  const { companyIndex } = useParams<{ companyIndex?: string }>()
  const [user, setUser] = useState<FirebaseUser | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [authLoading, setAuthLoading] = useState(true)

  // Form state for visitor actions
  const [orgName, setOrgName] = useState('')
  const [inviteToken, setInviteToken] = useState('')
  const [creating, setCreating] = useState(false)
  const [accepting, setAccepting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged(async (currentUser) => {
      setUser(currentUser)
      if (currentUser) {
        const { data } = await userService.getUserProfile(currentUser.uid)
        setUserProfile(data)
      }
      setAuthLoading(false)
    })
    return () => unsubscribe()
  }, [])

  const {
    memberships,
    currentOrganization,
    isLoading: orgsLoading,
    isProcessingInvite,
    createOrganization,
    setCurrentOrganization,
    acceptInvite,
    error: orgError,
  } = useOrganizationContext()

  // Check if user is a visitor (no memberships and has completed onboarding)
  const isVisitor = memberships.length === 0

  // Handle create org for visitors
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
      // Will auto-redirect via useEffect
    }
  }

  // Handle join org for visitors
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
      // Will auto-redirect via useEffect
    }
  }

  // Redirect logic when organizations load or URL changes
  useEffect(() => {
    if (authLoading || orgsLoading || orgError) return

    // If processing a pending invite, don't redirect - wait for completion
    if (isProcessingInvite) {
      console.log('Processing pending invite, waiting...')
      return
    }

    // If visitor and hasn't completed onboarding, redirect to onboarding
    if (memberships.length === 0 && userProfile && !userProfile.hasCompletedOnboarding) {
      navigate('/onboarding', { replace: true })
      return
    }

    // If visitor (completed onboarding), stay on dashboard - show visitor cards
    if (memberships.length === 0) {
      return
    }

    // Parse index from URL
    const index = companyIndex ? parseInt(companyIndex, 10) : null

    // If no index in URL or invalid index, redirect to first org (index 0)
    if (index === null || isNaN(index) || index < 0 || index >= memberships.length) {
      navigate('/dashboard/0', { replace: true })
      return
    }

    // Get organization at this index
    const targetMembership = memberships[index]

    // If current organization doesn't match the index, update selection
    if (!currentOrganization || currentOrganization.id !== targetMembership.organizationId) {
      setCurrentOrganization(targetMembership.organizationId)
    }
  }, [
    companyIndex,
    memberships,
    currentOrganization,
    userProfile,
    authLoading,
    orgsLoading,
    isProcessingInvite,
    navigate,
    setCurrentOrganization,
  ])

  // Show loading while checking auth or loading organizations
  if (authLoading || orgsLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (orgError) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <p className="text-destructive font-medium">Erro ao carregar organizações</p>
        <p className="text-muted-foreground text-sm">{orgError.message}</p>
        <Button onClick={() => window.location.reload()}>Tentar novamente</Button>
      </div>
    )
  }

  // Visitor Dashboard - show action cards
  if (isVisitor) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Bem-vindo, Visitante!</h2>
          <p className="text-muted-foreground">
            Crie uma organização ou entre em uma existente para começar.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Create Organization Card */}
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
                    disabled={creating}
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={creating || !orgName.trim()}
                >
                  {creating ? 'Criando...' : 'Criar Organização'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Join Organization Card */}
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
                    disabled={accepting}
                    required
                  />
                </div>
                <Button
                  type="submit"
                  variant="outline"
                  className="w-full"
                  disabled={accepting || !inviteToken.trim()}
                >
                  {accepting ? 'Entrando...' : 'Usar Convite'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {error && (
          <div className="border-destructive/20 bg-destructive/10 text-destructive rounded border p-3 text-center text-sm">
            {error}
          </div>
        )}
      </div>
    )
  }

  // Show loading if we're redirecting or syncing
  const index = companyIndex ? parseInt(companyIndex, 10) : null
  const isValidIndex = index !== null && !isNaN(index) && index >= 0 && index < memberships.length
  const targetMembership = isValidIndex ? memberships[index] : null

  if (
    !currentOrganization ||
    !targetMembership ||
    currentOrganization.id !== targetMembership.organizationId
  ) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  // Member Dashboard - show organization overview
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Página Inicial</h2>
        <p className="text-muted-foreground">
          Bem-vindo de volta, {user?.displayName || user?.email?.split('@')[0]}.
        </p>
      </div>

      <CompanyOverview company={currentOrganization as any} />
    </div>
  )
}
