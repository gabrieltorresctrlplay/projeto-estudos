import LogoSvg from '@/assets/logo.svg?react'
import { Button } from '@/shared/components/ui/button'
import { FeatureIcon } from '@/shared/components/ui/feature-icon'
import { ModeToggle } from '@/shared/theme/mode-toggle'
import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

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

      {/* Back Button */}
      <Button
        variant="outline"
        size="icon"
        aria-label="Voltar"
        className="bg-background/50 text-foreground hover:bg-background/80 border-border absolute top-[16px] left-[16px] z-20 border backdrop-blur-sm md:top-4 md:left-4"
        onClick={() => navigate('/')}
      >
        <ArrowLeft className="h-4 w-4" />
      </Button>

      {/* Theme Toggle */}
      <div className="absolute top-[16px] right-[16px] z-20 md:top-4 md:right-4">
        <ModeToggle />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-[400px] px-4">
        <div className="mb-8 text-center">
          <div className="mb-4 flex justify-center">
            {/* Logo with glow effect */}
            <FeatureIcon
              icon={LogoSvg}
              className="h-12 w-12"
              iconClassName="h-7 w-7"
            />
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
