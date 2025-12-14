import { COMPANY } from '@/constants'

/**
 * Footer component displayed at the bottom of all pages
 */
export function Footer() {
  return (
    <footer className="bg-muted/70 border-border mt-auto w-full border-t">
      <div className="text-muted-foreground flex h-16 items-center justify-between px-4 text-sm">
        <p>
          © {COMPANY.year} {COMPANY.name}. Todos os direitos reservados.
        </p>
        <nav
          className="flex gap-4"
          aria-label="Navegação secundária"
        >
          <a
            href="#termos"
            className="hover:text-foreground transition-colors"
          >
            Termos
          </a>
          <a
            href="#privacidade"
            className="hover:text-foreground transition-colors"
          >
            Privacidade
          </a>
        </nav>
      </div>
    </footer>
  )
}
