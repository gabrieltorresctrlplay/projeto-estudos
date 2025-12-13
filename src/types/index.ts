/**
 * Global TypeScript types and interfaces
 */

export interface Feature {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
}

export interface NavLink {
  label: string
  href: string
}

export type Theme = 'dark' | 'light' | 'system'

export interface ThemeProviderProps {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

export interface ThemeProviderState {
  theme: Theme
  setTheme: (theme: Theme) => void
}

// Company Management
export interface Company {
  id: string
  name: string
  ownerId: string
  createdAt: Date
  updatedAt: Date
}

export interface UserPreferences {
  theme: Theme
  selectedCompanyId: string | null
}
