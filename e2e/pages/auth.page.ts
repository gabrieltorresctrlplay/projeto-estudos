import type { Page } from '@playwright/test'

/**
 * Page Object Model for the Authentication page
 */
export class AuthPage {
  readonly page: Page

  constructor(page: Page) {
    this.page = page
  }

  /**
   * Navigate to the auth page
   */
  async goto() {
    await this.page.goto('/auth')
  }

  /**
   * Get the Google sign-in button
   */
  get googleSignInButton() {
    return this.page.getByRole('button', { name: /continuar com google/i })
  }

  /**
   * Get the page title
   */
  get title() {
    return this.page.getByRole('heading', { name: /bem-vindo/i })
  }

  /**
   * Check if auth page is loaded
   */
  async isLoaded() {
    await this.page.waitForURL('/auth')
    return this.googleSignInButton.isVisible()
  }

  /**
   * Wait for redirect after successful auth
   */
  async waitForAuthRedirect() {
    await this.page.waitForURL(/\/(dashboard|onboarding)/)
  }
}
