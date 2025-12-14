import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

import { authService } from '@/lib/auth'

/**
 * Hidden page for E2E testing authentication
 * Only works with Firebase Emulator
 * URL: /e2e-login?email=xxx&password=yyy&redirect=/dashboard
 */
export default function E2ELogin() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const email = searchParams.get('email')
    const password = searchParams.get('password')
    const redirect = searchParams.get('redirect') || '/dashboard'

    if (!email || !password) {
      setStatus('error')
      setError('Missing email or password in URL params')
      return
    }

    const doLogin = async () => {
      const { user, error: authError } = await authService.signInWithEmail(email, password)

      if (authError || !user) {
        setStatus('error')
        setError(authError?.message || 'Login failed')
        return
      }

      setStatus('success')
      
      // Redirect after successful login
      setTimeout(() => {
        navigate(redirect, { replace: true })
      }, 100)
    }

    doLogin()
  }, [searchParams, navigate])

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-900 text-white">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">E2E Test Login</h1>
        {status === 'loading' && <p>Logging in...</p>}
        {status === 'success' && <p className="text-green-400">✓ Login successful! Redirecting...</p>}
        {status === 'error' && (
          <p className="text-red-400">✗ Error: {error}</p>
        )}
      </div>
    </div>
  )
}
