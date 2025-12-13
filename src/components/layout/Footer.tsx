import { COMPANY } from '@/constants'

/**
 * Footer component displayed at the bottom of all pages
 */
export function Footer() {
  return (
    <footer className="bg-muted/50 border-border mt-auto w-full border-t py-6">
      <div className="text-muted-foreground container mx-auto flex items-center justify-between px-4 text-sm">
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
