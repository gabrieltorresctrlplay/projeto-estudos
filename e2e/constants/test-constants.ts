/**
 * Centralized constants for E2E tests
 * Eliminates magic strings and numbers throughout test files
 */

// =============================================================================
// Routes
// =============================================================================

export const ROUTES = {
  HOME: '/',
  TEAM_PAGE: '/dashboard/0/team',
  DASHBOARD: '/dashboard',
  AUTH_PATTERN: /\/(auth|login)/,
} as const

// =============================================================================
// Timeouts (in milliseconds)
// =============================================================================

export const TIMEOUTS = {
  PAGE_LOAD_MS: 20_000,
  RENDER_DELAY_MS: 500,
  TOKEN_EXPIRY_MS: 3_600_000, // 1 hour
  NAVIGATION_MS: 15_000,
} as const

// =============================================================================
// Firebase Emulator Configuration
// =============================================================================

export const FIREBASE_CONFIG = {
  API_KEY: 'demo-api-key',
  APP_NAME: '[DEFAULT]',
  AUTH_STORAGE_KEY_PREFIX: 'firebase:authUser:',
} as const

// =============================================================================
// Test User Data
// =============================================================================

export const TEST_DATA = {
  OWNER_NAME: 'Test Owner',
  ADMIN_NAME: 'Test Admin',
  MEMBER_NAME: 'Test Member',
  ORGANIZATION_NAME: 'Test Organization',
  DEFAULT_DISPLAY_NAME: 'Test User',
} as const

// =============================================================================
// DOM Selectors
// =============================================================================

export const SELECTORS = {
  LOADING_SPINNER: '[role="status"][aria-label="Carregando conteúdo"]',
} as const

// =============================================================================
// UI Text Patterns (RegExp for flexible matching)
// =============================================================================

export const UI_PATTERNS = {
  TEAM_HEADING: /equipe/i,
  OWNER_BADGE: /proprietário/i,
  INVITE_BUTTON: /gerar convite/i,
  LEAVE_BUTTON: /sair da empresa/i,
} as const

// =============================================================================
// Type Exports
// =============================================================================

export type Route = (typeof ROUTES)[keyof typeof ROUTES]
export type Timeout = (typeof TIMEOUTS)[keyof typeof TIMEOUTS]
