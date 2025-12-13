import { useEffect, useState } from 'react'
import type { User } from 'firebase/auth'
import { Navigate, Outlet } from 'react-router-dom'

import { authService } from '@/lib/auth'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

export const PublicOnlyRoute = () => {
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

  if (user) {
    return (
      <Navigate
        to="/dashboard"
        replace
      />
    )
  }

  return <Outlet />
}
