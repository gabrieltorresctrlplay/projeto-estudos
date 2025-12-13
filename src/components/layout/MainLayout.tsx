import { type ReactNode } from 'react'

import { AnimatedBlurBackground } from '@/components/ui/animated-blur-background'
import { ThemeProvider } from '@/components/theme/theme-provider'

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
        {/* Animated Blur Background - Always visible */}
        <AnimatedBlurBackground />

        {/* Static Grid Overlay */}
        <div
          className="pointer-events-none fixed inset-0 -z-20 h-full w-full bg-[linear-gradient(to_right,var(--color-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-border)_1px,transparent_1px)] mask-[radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] bg-size-[14px_24px] opacity-10"
          aria-hidden="true"
        />

        <Topbar />
        <main className="relative flex-1 overflow-hidden">{children}</main>
        <div className="relative z-50">
          <Footer />
        </div>
      </div>
    </ThemeProvider>
  )
}
