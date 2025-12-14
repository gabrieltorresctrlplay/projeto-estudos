import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { authService } from '@/lib/auth'
import { userService } from '@/lib/userService'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { GoogleIcon } from '@/components/ui/google-icon'
import { AuthLayout } from '@/components/layout/AuthLayout'

export default function Auth() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleGoogleSignIn = async () => {
    setLoading(true)
    setError(null)

    const { user, error: authError } = await authService.signInWithGoogle()

    if (authError || !user) {
      setError('Erro ao conectar com Google. Tente novamente.')
      setLoading(false)
      return
    }

    // Check if user has completed onboarding
    const { data: profile } = await userService.getUserProfile(user.uid)

    if (profile?.hasCompletedOnboarding) {
      // Returning user - go to dashboard
      navigate('/dashboard', { replace: true })
    } else {
      // First time user - go to onboarding
      navigate('/onboarding', { replace: true })
    }
  }

  return (
    <AuthLayout
      title="Bem-vindo"
      subtitle="Entre com sua conta Google para continuar"
    >
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>Entrar</CardTitle>
          <CardDescription>Use sua conta Google para acessar a plataforma</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="border-destructive/20 bg-destructive/10 text-destructive rounded border p-3 text-center text-sm font-medium">
              {error}
            </div>
          )}

          <Button
            variant="outline"
            className="bg-background w-full"
            onClick={handleGoogleSignIn}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <GoogleIcon className="mr-2 h-4 w-4" />
            )}
            Continuar com Google
          </Button>

          <p className="text-muted-foreground text-center text-xs">
            Ao continuar, você aceita nossos{' '}
            <a
              href="#"
              className="underline"
            >
              Termos de Serviço
            </a>{' '}
            e{' '}
            <a
              href="#"
              className="underline"
            >
              Política de Privacidade
            </a>
            .
          </p>
        </CardContent>
      </Card>
    </AuthLayout>
  )
}
