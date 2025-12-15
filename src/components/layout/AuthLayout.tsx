import LogoSvg from '@/assets/logo.svg?react'
import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { Button } from '@/components/ui/button'
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
      {/* Ambient Glow Background */}
      <div className="pointer-events-none fixed inset-0 -z-30">
        <div className="bg-primary/5 absolute top-0 left-1/4 h-96 w-96 rounded-full blur-3xl" />
        <div className="bg-chart-2/5 absolute right-1/4 bottom-0 h-96 w-96 rounded-full blur-3xl" />
      </div>

      {/* Static Grid Overlay */}
      <div
        className="pointer-events-none fixed inset-0 -z-20 h-full w-full bg-[linear-gradient(to_right,var(--color-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-border)_1px,transparent_1px)] mask-[radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] bg-size-[14px_24px] opacity-10"
        aria-hidden="true"
      />

      {/* Back Button */}
      <Button
        variant="outline"
        size="icon"
        className="bg-background/50 text-foreground hover:bg-background/80 border-border absolute top-4 left-4 z-20 border backdrop-blur-sm md:top-8 md:left-8"
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
            {/* Logo with glow effect */}
            <div className="relative">
              <div className="bg-primary/30 absolute inset-0 rounded-xl blur-xl" />
              <div className="bg-primary text-primary-foreground relative flex h-12 w-12 items-center justify-center rounded-xl shadow-lg">
                <LogoSvg className="h-7 w-7 fill-current" />
              </div>
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
