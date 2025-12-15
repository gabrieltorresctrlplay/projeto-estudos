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
      <Card className="border-border/50 bg-card/50 w-full max-w-md shadow-2xl backdrop-blur-xl">
        <div className="from-primary/5 pointer-events-none absolute inset-0 bg-linear-to-br via-transparent to-transparent" />
        <CardHeader className="relative text-center">
          <CardTitle className="text-2xl">Entrar</CardTitle>
          <CardDescription>Use sua conta Google para acessar a plataforma</CardDescription>
        </CardHeader>
        <CardContent className="relative space-y-4">
          {error && (
            <div className="border-destructive/20 bg-destructive/10 text-destructive rounded-lg border p-3 text-center text-sm font-medium shadow-sm">
              {error}
            </div>
          )}

          <Button
            variant="outline"
            className="bg-background/80 hover:bg-background hover:border-primary/50 group relative h-11 w-full overflow-hidden text-base transition-all hover:shadow-md active:scale-95"
            onClick={handleGoogleSignIn}
            disabled={loading}
          >
            <div className="absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/5 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
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
              className="hover:text-primary underline transition-colors"
            >
              Termos de Serviço
            </a>{' '}
            e{' '}
            <a
              href="#"
              className="hover:text-primary underline transition-colors"
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
