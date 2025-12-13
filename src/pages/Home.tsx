import { useEffect, useState } from 'react'
import type { User as FirebaseUser } from 'firebase/auth'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

import { authService } from '@/lib/auth'
import { FeatureGrid, Hero } from '@/components/home'

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
      {/* Hero Section */}
      <section
        className="flex w-full max-w-6xl flex-col items-center justify-center gap-3 text-center sm:gap-6 md:gap-12 lg:gap-16"
        aria-labelledby="hero-title"
      >
        <Hero />
        <FeatureGrid />
      </section>
    </motion.div>
  )
}
