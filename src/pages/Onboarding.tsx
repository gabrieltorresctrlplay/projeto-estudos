import { useState } from 'react'
import { useOrganizationContext } from '@/contexts/OrganizationContext'
import { motion } from 'framer-motion'
import { Building2, LogOut, Mail, Plus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { authService } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function Onboarding() {
  const navigate = useNavigate()
  const { createOrganization, acceptInvite, isLoading } = useOrganizationContext()

  const [orgName, setOrgName] = useState('')
  const [inviteToken, setInviteToken] = useState('')
  const [creating, setCreating] = useState(false)
  const [accepting, setAccepting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogout = async () => {
    await authService.signOut()
    navigate('/')
  }

  const handleCreateOrg = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setCreating(true)

    const { orgId, error: createError } = await createOrganization(orgName)

    if (createError) {
      setError(createError.message)
      setCreating(false)
      return
    }

    if (orgId) {
      // Successfully created, redirect to dashboard
      navigate('/dashboard')
    }
  }

  const handleJoinOrg = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setAccepting(true)

    const { success, error: acceptError } = await acceptInvite(inviteToken)

    if (acceptError) {
      setError(acceptError.message)
      setAccepting(false)
      return
    }

    if (success) {
      // Successfully joined, redirect to dashboard
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
        {/* Logout Button */}
        <div className="absolute top-4 right-4">
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
            Para começar, crie uma nova organização ou entre em uma existente.
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
                  {creating ? (
                    <>
                      <Plus className="mr-2 h-4 w-4 animate-spin" />
                      Criando...
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      Criar Organização
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Join Organization */}
          <Card>
            <CardHeader>
              <div className="mb-4 flex justify-center">
                <div className="bg-primary/10 text-primary flex h-12 w-12 items-center justify-center rounded-full">
                  <Mail className="h-6 w-6" />
                </div>
              </div>
              <CardTitle>Entrar em Organização</CardTitle>
              <CardDescription>Cole o token do link de convite que você recebeu</CardDescription>
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
                    placeholder="Cole o token aqui (da URL do convite)"
                    value={inviteToken}
                    onChange={(e) => setInviteToken(e.target.value)}
                    disabled={accepting || isLoading}
                    required
                  />
                  <p className="text-muted-foreground text-xs">
                    O token está na URL do convite após "?token="
                  </p>
                </div>
                <Button
                  type="submit"
                  variant="outline"
                  className="w-full"
                  disabled={accepting || isLoading || !inviteToken.trim()}
                >
                  {accepting ? (
                    <>
                      <Mail className="mr-2 h-4 w-4 animate-spin" />
                      Entrando...
                    </>
                  ) : (
                    <>
                      <Mail className="mr-2 h-4 w-4" />
                      Usar Convite
                    </>
                  )}
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
