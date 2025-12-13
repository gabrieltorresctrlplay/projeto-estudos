import logo from '@/assets/logo.svg'

import { Button } from '@/components/ui/button'
import { ModeToggle } from '@/components/mode-toggle'

export function Topbar() {
  return (
    <header className="bg-muted/50 border-border sticky top-0 z-50 w-full border-b backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2 text-xl font-bold tracking-tighter">
          <div className="bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-lg">
            <img
              src={logo}
              alt="NerfasInc Logo"
              className="size-5"
            />
          </div>
          NerfasInc
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden gap-4 md:flex">
            <Button
              variant="ghost"
              size="sm"
            >
              Soluções
            </Button>
            <Button
              variant="ghost"
              size="sm"
            >
              Preços
            </Button>
          </div>
          <div className="bg-border hidden h-6 w-px md:block" />
          <Button size="sm">Entrar</Button>
          <ModeToggle />
        </div>
      </div>
    </header>
  )
}
