import LogoSvg from '@/assets/logo.svg?react'
import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { ConcreteBackground } from '@/components/ui/concrete-background'
import { ModeToggle } from '@/components/theme/mode-toggle'

interface AuthLayoutProps {
  children: React.ReactNode
  title: string
  subtitle: string
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  const navigate = useNavigate()

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden">
      {/* Concrete Texture Background */}
      <ConcreteBackground />

      {/* Back Button */}
      <Button
        variant="outline"
        size="icon"
        className="bg-background/50 text-foreground hover:bg-background/80 border-border absolute top-4 left-4 z-20 border shadow-md backdrop-blur-sm md:top-8 md:left-8"
        onClick={() => navigate('/')}
      >
        <ArrowLeft className="h-4 w-4" />
      </Button>

      {/* Theme Toggle */}
      <div className="absolute top-4 right-4 z-20 md:top-8 md:right-8">
        <ModeToggle />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-[400px] px-4">
        <div className="mb-8 text-center">
          <div className="mb-4 flex justify-center">
            {/* Logo */}
            <div className="bg-primary text-primary-foreground flex h-12 w-12 items-center justify-center rounded-xl">
              <LogoSvg className="h-7 w-7 fill-current" />
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
