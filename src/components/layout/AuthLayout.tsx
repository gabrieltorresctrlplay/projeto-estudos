import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { AnimatedBlurBackground } from '@/components/ui/animated-blur-background'
import { Button } from '@/components/ui/button'

interface AuthLayoutProps {
  children: React.ReactNode
  title: string
  subtitle: string
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  const navigate = useNavigate()

  return (
    <div className="bg-background relative flex min-h-screen w-full items-center justify-center overflow-hidden">
      {/* Background Effect */}
      <div className="absolute inset-0 z-0">
        <AnimatedBlurBackground />
      </div>

      {/* Back Button */}
      <Button
        variant="outline"
        className="bg-background/50 text-foreground hover:bg-background/80 absolute top-4 left-4 z-20 backdrop-blur-sm md:top-8 md:left-8"
        onClick={() => navigate('/')}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Voltar para Home
      </Button>

      {/* Content */}
      <div className="relative z-10 w-full max-w-[400px] px-4">
        <div className="mb-8 text-center">
          <div className="mb-4 flex justify-center">
            {/* Logo Placeholder */}
            <div className="bg-primary/10 flex h-12 w-12 items-center justify-center rounded-xl">
              <span className="text-primary text-2xl font-bold">N</span>
            </div>
          </div>
          <h1 className="text-foreground text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
          <p className="text-muted-foreground mt-2 text-sm">{subtitle}</p>
        </div>

        {children}

        <div className="text-muted-foreground mt-8 text-center text-xs">
          <p>&copy; {new Date().getFullYear()} NerfasInc. Todos os direitos reservados.</p>
        </div>
      </div>
    </div>
  )
}
