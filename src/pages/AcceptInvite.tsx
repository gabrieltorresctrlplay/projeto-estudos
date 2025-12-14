import { useEffect, useState } from 'react'
import { useOrganizationContext } from '@/contexts/OrganizationContext'
import type { Invite } from '@/types'
import { motion } from 'framer-motion'
import { Building2, CheckCircle2, Loader2, XCircle } from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router-dom'

import { inviteService } from '@/lib/organizationService'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function AcceptInvite() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user, acceptInvite } = useOrganizationContext()

  const token = searchParams.get('token')

  const [invite, setInvite] = useState<Invite | null>(null)
  const [loading, setLoading] = useState(true)
  const [accepting, setAccepting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Load invite data
  useEffect(() => {
    if (!token) {
      setError('Código de convite inválido')
      setLoading(false)
      return
    }

    const loadInvite = async () => {
      const { data, error: fetchError } = await inviteService.getInviteByToken(token)

      if (fetchError || !data) {
        setError(fetchError?.message || 'Convite não encontrado ou expirado')
        setLoading(false)
        return
      }

      setInvite(data)
      setLoading(false)

      // If user is logged in, auto-accept
      if (user && user.email) {
        handleAccept(data)
      }
    }

    loadInvite()
  }, [token, user])

  const handleAccept = async (inviteData?: Invite) => {
    if (!token) return

    const targetInvite = inviteData || invite
    if (!targetInvite) return

    setAccepting(true)
    setError(null)

    const { success: accepted, error: acceptError } = await acceptInvite(token)

    if (acceptError) {
      setError(acceptError.message)
      setAccepting(false)
      return
    }

    if (accepted) {
      setSuccess(true)
      setTimeout(() => {
        navigate('/dashboard')
      }, 2000)
    }
  }

  const handleRegister = () => {
    // Preserve token in sessionStorage for post-registration acceptance
    if (token) {
      sessionStorage.setItem('pendingInviteToken', token)
    }
    navigate('/register')
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  // Error state
  if (error && !invite) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="mb-4 flex justify-center">
              <div className="bg-destructive/10 text-destructive flex h-12 w-12 items-center justify-center rounded-full">
                <XCircle className="h-6 w-6" />
              </div>
            </div>
            <CardTitle>Convite Inválido</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => navigate('/dashboard')}
              className="w-full"
            >
              Ir para Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Success state
  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          <Card className="w-full max-w-md">
            <CardHeader>
              <div className="mb-4 flex justify-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10 text-green-500">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
              </div>
              <CardTitle>Convite Aceito!</CardTitle>
              <CardDescription>
                Você agora faz parte de {invite?.organization?.name}. Redirecionando...
              </CardDescription>
            </CardHeader>
          </Card>
        </motion.div>
      </div>
    )
  }

  // Not logged in - prompt to register/login
  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="mb-4 flex justify-center">
              <div className="bg-primary/10 text-primary flex h-12 w-12 items-center justify-center rounded-full">
                <Building2 className="h-6 w-6" />
              </div>
            </div>
            <CardTitle>Convite para {invite?.organization?.name}</CardTitle>
            <CardDescription>
              Você foi convidado para participar como <strong>{invite?.role}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted rounded-lg p-4 text-center">
              <p className="text-muted-foreground text-sm">
                Para aceitar o convite, você precisa criar uma conta ou fazer login.
              </p>
            </div>
            <div className="space-y-2">
              <Button
                onClick={handleRegister}
                className="w-full"
              >
                Criar Conta
              </Button>
              <Button
                onClick={() => {
                  if (token) sessionStorage.setItem('pendingInviteToken', token)
                  navigate('/login')
                }}
                variant="outline"
                className="w-full"
              >
                Já tenho conta
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Logged in - show accept button
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="mb-4 flex justify-center">
            <div className="bg-primary/10 text-primary flex h-12 w-12 items-center justify-center rounded-full">
              <Building2 className="h-6 w-6" />
            </div>
          </div>
          <CardTitle>Convite para {invite?.organization?.name}</CardTitle>
          <CardDescription>
            Você foi convidado para participar como <strong>{invite?.role}</strong>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="border-destructive/20 bg-destructive/10 text-destructive rounded border p-3 text-sm">
              {error}
            </div>
          )}
          <Button
            onClick={() => handleAccept()}
            className="w-full"
            disabled={accepting}
          >
            {accepting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Aceitando...
              </>
            ) : (
              'Aceitar Convite'
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
