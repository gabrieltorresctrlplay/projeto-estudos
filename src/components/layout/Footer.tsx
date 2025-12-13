export function Footer() {
  return (
    <footer className="bg-muted/50 border-border mt-auto w-full border-t py-6">
      <div className="text-muted-foreground container mx-auto flex items-center justify-between px-4 text-sm">
        <p>© 2024 NerfasInc. Todos os direitos reservados.</p>
        <div className="flex gap-4">
          <a
            href="#"
            className="hover:text-foreground"
          >
            Termos
          </a>
          <a
            href="#"
            className="hover:text-foreground"
          >
            Privacidade
          </a>
        </div>
      </div>
    </footer>
  )
}
