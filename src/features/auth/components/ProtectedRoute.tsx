import { useEffect, useState } from 'react'
import { authService } from '@/features/auth/services/authService'
import { LoadingSpinner } from '@/shared/components/ui/loading-spinner'
import type { User } from 'firebase/auth'
import { Navigate, Outlet } from 'react-router-dom'

export const ProtectedRoute = () => {
  const [user, setUser] = useState<User | null | undefined>(undefined)

  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged((user) => {
      setUser(user)
    })
    return () => unsubscribe()
  }, [])

  if (user === undefined) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (user === null) {
    return (
      <Navigate
        to="/login"
        replace
      />
    )
  }

  return <Outlet />
}
