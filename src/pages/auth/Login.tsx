import { useState } from 'react'
import { useFormValidation } from '@/hooks'
import { authService, validateEmail, validatePassword } from '@/lib'
import { Loader2 } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { FormError } from '@/components/ui/form-error'
import { GoogleIcon } from '@/components/ui/google-icon'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AuthLayout } from '@/components/layout/AuthLayout'

export default function Login() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const { errors, validateField, validateAllFields, clearAllErrors } = useFormValidation()

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate all fields
    const isValid = validateAllFields({
      email: () => validateEmail(email),
      password: () => validatePassword(password),
    })

    if (!isValid) return

    setLoading(true)
    setError(null)

    const { error } = await authService.signInWithEmail(email, password)

    if (error) {
      setError('Credenciais inválidas ou erro no login.')
      setLoading(false)
    } else {
      navigate('/dashboard')
    }
  }

  const handleGoogleLogin = async () => {
    clearAllErrors()
    setLoading(true)
    setError(null)
    const { error } = await authService.signInWithGoogle()

    if (error) {
      setError('Erro ao conectar com Google.')
      setLoading(false)
    } else {
      navigate('/dashboard')
    }
  }

  return (
    <AuthLayout
      title="Bem-vindo de volta"
      subtitle="Entre na sua conta para acessar o dashboard"
    >
      <Card>
        <CardContent className="pt-6">
          <form
            onSubmit={handleEmailLogin}
            className="space-y-4"
            noValidate
          >
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => validateField('email', email, validateEmail)}
                aria-invalid={!!errors.email}
              />
              <FormError message={errors.email} />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Senha</Label>
                <Link
                  to="/forgot-password"
                  className="text-primary text-xs hover:underline"
                >
                  Esqueceu a senha?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={() => validateField('password', password, validatePassword)}
                aria-invalid={!!errors.password}
              />
              <FormError message={errors.password} />
            </div>

            {error && (
              <div className="border-destructive/20 bg-destructive/10 text-destructive rounded border p-2 text-center text-sm font-medium">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Entrar
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background text-muted-foreground px-2">Ou continue com</span>
            </div>
          </div>

          <Button
            variant="outline"
            type="button"
            className="bg-background w-full shadow-lg"
            onClick={handleGoogleLogin}
            disabled={loading}
          >
            <GoogleIcon className="mr-2 h-4 w-4" />
            Google
          </Button>
        </CardContent>
        <CardFooter className="flex justify-center border-t p-4">
          <p className="text-muted-foreground text-sm">
            Não tem uma conta?{' '}
            <Link
              to="/register"
              className="text-primary font-medium hover:underline"
            >
              Criar conta
            </Link>
          </p>
        </CardFooter>
      </Card>
    </AuthLayout>
  )
}
