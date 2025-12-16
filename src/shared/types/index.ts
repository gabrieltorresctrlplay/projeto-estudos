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

// ============================================
// Multi-Tenant Organization System
// ============================================

export interface Organization {
  id: string
  name: string
  createdAt: Date
  updatedAt: Date
}

export type MemberRole = 'owner' | 'admin' | 'member'

export interface OrganizationMember {
  id: string
  organizationId: string
  userId: string
  role: MemberRole
  joinedAt: Date
  // Expanded view (with joined organization data)
  organization?: Organization
}

// User Profile (stored in Firestore 'users' collection)
export interface UserProfile {
  id: string // same as Firebase Auth UID
  email: string
  displayName: string | null
  photoURL: string | null
  hasCompletedOnboarding: boolean // True after first onboarding (skip or complete)
  createdAt: Date
  updatedAt: Date
}

export interface Invite {
  id: string
  organizationId: string
  email: string | null // null = generic invite (no email validation)
  role: 'admin' | 'member' // owner cannot be invited, created automatically
  token: string
  createdBy: string // userId of the inviter
  expiresAt: Date
  createdAt: Date
  // Expanded view (with organization data for display)
  organization?: Organization
}

// ============================================
// Dashboard & Analytics
// ============================================

export interface ActivityItem {
  id: string
  label: string
  timestamp: Date
  amount?: number
}

export interface DashboardStats {
  totalRevenue: number
  activeCustomers: number
  growthRate: number
  recentActivityCount: number
}
