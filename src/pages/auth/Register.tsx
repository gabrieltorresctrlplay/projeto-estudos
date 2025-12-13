import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'

import { authService } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AuthLayout } from '@/components/layout/AuthLayout'

export default function Register() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (password !== confirmPassword) {
      setError('As senhas não coincidem.')
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.')
      setLoading(false)
      return
    }

    const { error } = await authService.signUpWithEmail(email, password)

    if (error) {
      setError('Erro ao criar conta. Email já em uso?')
      setLoading(false)
    } else {
      navigate('/dashboard')
    }
  }

  return (
    <AuthLayout
      title="Criar nova conta"
      subtitle="Comece sua jornada gratuitamente hoje"
    >
      <Card className="border-border/50 bg-background/60 backdrop-blur-xl">
        <CardContent className="pt-6">
          <form
            onSubmit={handleRegister}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Senha</Label>
              <Input
                id="confirmPassword"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            {error && (
              <div className="rounded border border-red-500/20 bg-red-500/10 p-2 text-center text-sm font-medium text-red-500">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Criar Conta
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center border-t p-4">
          <p className="text-muted-foreground text-sm">
            Já tem uma conta?{' '}
            <Link
              to="/login"
              className="text-primary font-medium hover:underline"
            >
              Entrar
            </Link>
          </p>
        </CardFooter>
      </Card>

      <p className="text-muted-foreground mt-4 px-8 text-center text-xs">
        Ao clicar em criar conta, você aceita nossos{' '}
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
    </AuthLayout>
  )
}
