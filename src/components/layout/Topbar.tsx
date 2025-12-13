import logo from '@/assets/logo.svg'
import { COMPANY, NAV_LINKS } from '@/constants'

import { Button } from '@/components/ui/button'
import { ModeToggle } from '@/components/mode-toggle'

/**
 * Top navigation bar component
 */
export function Topbar() {
  return (
    <header className="bg-muted/50 border-border sticky top-0 z-50 w-full border-b backdrop-blur-md">
      <nav
        className="container mx-auto flex h-16 items-center justify-between px-4"
        aria-label="Navegação principal"
      >
        <a
          href="/"
          className="flex items-center gap-2 text-xl font-bold tracking-tighter transition-opacity hover:opacity-80"
          aria-label={`${COMPANY.name} - Página inicial`}
        >
          <div
            className="bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-lg"
            aria-hidden="true"
          >
            <img
              src={logo}
              alt=""
              className="size-5 brightness-0 invert dark:brightness-100 dark:invert-0"
            />
          </div>
          {COMPANY.name}
        </a>

        <div className="flex items-center gap-4">
          <div
            className="hidden gap-4 md:flex"
            role="navigation"
            aria-label="Menu de navegação"
          >
            {NAV_LINKS.map((link) => (
              <Button
                key={link.label}
                variant="ghost"
                size="sm"
                asChild
              >
                <a href={link.href}>{link.label}</a>
              </Button>
            ))}
          </div>

          <div
            className="bg-border hidden h-6 w-px md:block"
            aria-hidden="true"
          />

          <Button
            size="sm"
            aria-label="Acessar conta"
          >
            Entrar
          </Button>

          <ModeToggle />
        </div>
      </nav>
    </header>
  )
}
