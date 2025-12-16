import { useEffect, useState } from 'react'
import { authService } from '@/features/auth/services/authService'
import { FeatureGrid, Hero } from '@/features/home/components'
import type { User as FirebaseUser } from 'firebase/auth'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

/**
 * Home page - Landing page with hero section and features
 * Fullscreen responsive layout that fits in viewport on all devices
 * Smooth fade-in animation on load
 * Redirects authenticated users to dashboard
 */
export default function Home() {
  const navigate = useNavigate()
  const [user, setUser] = useState<FirebaseUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged((currentUser) => {
      setUser(currentUser)
      setLoading(false)

      // Redirect to dashboard if user is logged in
      if (currentUser) {
        navigate('/dashboard')
      }
    })
    return () => unsubscribe()
  }, [navigate])

  // Don't render anything while checking auth (prevents flash)
  if (loading || user) {
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="relative flex h-full flex-col items-center justify-center overflow-hidden px-4 py-2 sm:py-4 md:py-0"
    >
      {/* Ambient Glow Background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="bg-primary/5 absolute -top-1/4 left-1/3 h-96 w-96 rounded-full blur-3xl" />
        <div className="bg-chart-2/5 absolute right-1/3 -bottom-1/4 h-96 w-96 rounded-full blur-3xl" />
      </div>

      {/* Hero Section */}
      <section
        className="relative flex w-full max-w-6xl flex-col items-center justify-center gap-3 text-center sm:gap-6 md:gap-12 lg:gap-16"
        aria-labelledby="hero-title"
      >
        <Hero />
        <FeatureGrid />
      </section>
    </motion.div>
  )
}
