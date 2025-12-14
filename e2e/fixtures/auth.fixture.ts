import { test as base, expect, type Page } from '@playwright/test'

import {
  clearAuthEmulator,
  clearFirestoreEmulator,
  createDefaultTestUser,
  createTestUser,
  signInTestUser,
  type TestUser,
} from '../utils/firebase-emulator'

/**
 * Extended test fixtures for authentication testing
 */
export const test = base.extend<{
  testUser: TestUser & { uid: string }
  authenticatedPage: Page
}>({
  /**
   * Creates a fresh test user for each test
   */
  testUser: async ({}, use) => {
    const user = createDefaultTestUser()
    const createdUser = await createTestUser(user)
    await use(createdUser)
  },

  /**
   * Provides a page with an authenticated user session
   */
  authenticatedPage: async ({ page, testUser }, use) => {
    // Sign in via API to get token
    const idToken = await signInTestUser(testUser.email, testUser.password)

    // Navigate to app and inject auth state
    await page.goto('/')

    // Set auth token in localStorage (Firebase Auth persists here)
    await page.evaluate(
      ({ email, uid, token }) => {
        const authKey = `firebase:authUser:demo-api-key:[DEFAULT]`
        const authData = {
          uid,
          email,
          emailVerified: false,
          displayName: 'Test User',
          isAnonymous: false,
          providerData: [],
          stsTokenManager: {
            refreshToken: token,
            accessToken: token,
            expirationTime: Date.now() + 3600000,
          },
          createdAt: Date.now().toString(),
          lastLoginAt: Date.now().toString(),
          apiKey: 'demo-api-key',
          appName: '[DEFAULT]',
        }
        localStorage.setItem(authKey, JSON.stringify(authData))
      },
      { email: testUser.email, uid: testUser.uid, token: idToken },
    )

    // Reload to pick up auth state
    await page.reload()

    await use(page)
  },
})

/**
 * Hook to clean up emulator data before each test
 */
test.beforeEach(async () => {
  await clearAuthEmulator()
  await clearFirestoreEmulator()
})

export { expect }
