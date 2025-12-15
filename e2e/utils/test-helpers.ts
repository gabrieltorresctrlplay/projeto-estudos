/**
 * Reusable test helper functions for E2E tests
 * Provides authentication, navigation, and page state utilities
 */

import { expect, type Page } from '@playwright/test'

import {
  FIREBASE_CONFIG,
  ROUTES,
  SELECTORS,
  TEST_DATA,
  TIMEOUTS,
} from '../constants/test-constants'
import {
  clearAuthEmulator,
  clearFirestoreEmulator,
  signInTestUser,
  type TestUser,
} from './firebase-emulator'

// =============================================================================
// Types
// =============================================================================

export interface AuthenticatedUser extends TestUser {
  uid: string
}

interface FirebaseAuthData {
  uid: string
  email: string
  emailVerified: boolean
  displayName: string
  isAnonymous: boolean
  providerData: unknown[]
  stsTokenManager: {
    refreshToken: string
    accessToken: string
    expirationTime: number
  }
  createdAt: string
  lastLoginAt: string
  apiKey: string
  appName: string
}

// =============================================================================
// Emulator State Management
// =============================================================================

/**
 * Resets emulator state by clearing both Auth and Firestore data
 * Should be called before each test to ensure clean state
 */
export async function resetEmulatorState(): Promise<void> {
  await clearAuthEmulator()
  await clearFirestoreEmulator()
}

// =============================================================================
// Authentication Helpers
// =============================================================================

/**
 * Builds Firebase auth data structure for localStorage injection
 */
function buildFirebaseAuthData(email: string, uid: string, token: string): FirebaseAuthData {
  const now = Date.now()

  return {
    uid,
    email,
    emailVerified: false,
    displayName: TEST_DATA.DEFAULT_DISPLAY_NAME,
    isAnonymous: false,
    providerData: [],
    stsTokenManager: {
      refreshToken: token,
      accessToken: token,
      expirationTime: now + TIMEOUTS.TOKEN_EXPIRY_MS,
    },
    createdAt: now.toString(),
    lastLoginAt: now.toString(),
    apiKey: FIREBASE_CONFIG.API_KEY,
    appName: FIREBASE_CONFIG.APP_NAME,
  }
}

/**
 * Injects Firebase auth state into browser localStorage
 */
async function injectAuthState(
  page: Page,
  email: string,
  uid: string,
  token: string,
): Promise<void> {
  const authData = buildFirebaseAuthData(email, uid, token)
  const storageKey = `${FIREBASE_CONFIG.AUTH_STORAGE_KEY_PREFIX}${FIREBASE_CONFIG.API_KEY}:${FIREBASE_CONFIG.APP_NAME}`

  await page.evaluate(
    ({ data, key }) => {
      localStorage.setItem(key, JSON.stringify(data))
    },
    { data: authData, key: storageKey },
  )
}

/**
 * Authenticates user and navigates to specified route
 * Uses localStorage injection for reliable auth state
 */
export async function authenticateAndNavigate(
  page: Page,
  user: AuthenticatedUser,
  targetRoute: string = ROUTES.DASHBOARD,
): Promise<void> {
  const idToken = await signInTestUser(user.email, user.password)

  await page.goto(ROUTES.HOME)
  await injectAuthState(page, user.email, user.uid, idToken)
  await page.goto(targetRoute, { waitUntil: 'domcontentloaded' })
}

// =============================================================================
// Page State Helpers
// =============================================================================

/**
 * Waits for page to fully load by checking loading spinner visibility
 * Uses Guard Clause pattern - throws if spinner doesn't disappear
 */
export async function waitForPageLoad(page: Page): Promise<void> {
  const spinner = page.locator(SELECTORS.LOADING_SPINNER)

  // Wait for spinner to disappear (long timeout to handle emulator latency)
  await expect(spinner).not.toBeVisible({ timeout: 60000 })
  await page.waitForTimeout(TIMEOUTS.RENDER_DELAY_MS)
}

/**
 * Ensures page is on team route, throws descriptive error if not
 * Guard Clause pattern for cleaner test flow
 */
export async function ensureOnTeamPage(page: Page): Promise<void> {
  const currentUrl = page.url()

  if (!currentUrl.includes('/team')) {
    throw new Error(`Expected to be on team page, but current URL is: ${currentUrl}`)
  }

  await waitForPageLoad(page)
}

/**
 * Navigates to team page as authenticated user and waits for load
 * Combines authentication + navigation + page load into single helper
 */
export async function navigateToTeamPageAs(page: Page, user: AuthenticatedUser): Promise<void> {
  await authenticateAndNavigate(page, user, ROUTES.TEAM_PAGE)
  await ensureOnTeamPage(page)
}
