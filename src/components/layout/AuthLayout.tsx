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
    <div className="bg-background relative flex min-h-screen w-full items-center justify-center overflow-hidden">
      {/* Background Grid Pattern */}
      <div
        className="pointer-events-none fixed inset-0 -z-20 h-full w-full bg-[linear-gradient(to_right,var(--color-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-border)_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] [background-size:24px_24px] opacity-10"
        aria-hidden="true"
      />

      {/* Back Button */}
      <Button
        variant="outline"
        size="icon"
        className="bg-background/50 hover:bg-background/80 border-border absolute top-4 left-4 z-20 backdrop-blur-sm md:top-8 md:left-8"
        onClick={() => navigate('/')}
      >
        <ArrowLeft className="h-4 w-4" />
        <span className="sr-only">Voltar</span>
      </Button>

      {/* Theme Toggle */}
      <div className="absolute top-4 right-4 z-20 md:top-8 md:right-8">
        <ModeToggle />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-md px-4 py-8">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-6 flex justify-center">
            {/* Logo */}
            <div className="bg-primary text-primary-foreground shadow-xs flex h-14 w-14 items-center justify-center rounded-xl">
              <LogoSvg className="h-8 w-8 fill-current" />
            </div>
          </div>
          <h1 className="type-h2 text-foreground mb-2">{title}</h1>
          <p className="type-muted text-lg">{subtitle}</p>
        </div>

        {children}

        <footer className="mt-8 text-center">
          <p className="type-muted text-xs">
            &copy; {new Date().getFullYear()} NerfasInc. Todos os direitos reservados.
          </p>
        </footer>
      </div>
    </div>
  )
}
