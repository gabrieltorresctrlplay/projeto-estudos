import { type ReactNode } from 'react'
import { ThemeProvider } from '@/shared/theme/theme-provider'

import { Footer } from './Footer'
import { Topbar } from './Topbar'

interface MainLayoutProps {
  children: ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <ThemeProvider
      defaultTheme="dark"
      storageKey="vite-ui-theme"
    >
      <div className="text-foreground relative flex h-screen flex-col overflow-hidden transition-none">
        <Topbar />
        <main className="relative flex-1 overflow-hidden">{children}</main>
        <div className="relative z-50">
          <Footer />
        </div>
      </div>
    </ThemeProvider>
  )
}
