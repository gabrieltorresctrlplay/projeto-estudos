/**
 * E2E Tests for Team Page
 *
 * Tests role-based access control for Owner, Admin, and Member roles.
 * Validates visibility of invite generation and leave organization buttons.
 */

import { expect, test, type Page } from '@playwright/test'

import { ROUTES, TIMEOUTS, UI_PATTERNS } from '../constants/test-constants'
import { addMemberToOrganization, createOwnerWithOrganization } from '../utils/firebase-emulator'
import {
  navigateToTeamPageAs,
  resetEmulatorState,
  type AuthenticatedUser,
} from '../utils/test-helpers'

// =============================================================================
// Test Configuration
// =============================================================================

// Run tests serially to avoid race conditions with shared emulator state
test.describe.configure({ mode: 'serial' })

// =============================================================================
// Test Data Setup Functions
// =============================================================================

interface OwnerSetupResult {
  user: AuthenticatedUser
  organizationId: string
}

interface AdminSetupResult {
  owner: OwnerSetupResult
  admin: { user: AuthenticatedUser }
}

interface MemberSetupResult {
  owner: OwnerSetupResult
  member: { user: AuthenticatedUser }
}

async function createOwnerTestData(): Promise<OwnerSetupResult> {
  await resetEmulatorState()

  const { user, organization } = await createOwnerWithOrganization(
    'Test Owner',
    'Test Organization',
  )

  return {
    user,
    organizationId: organization.id,
  }
}

async function createAdminTestData(): Promise<AdminSetupResult> {
  await resetEmulatorState()

  const { user, organization } = await createOwnerWithOrganization(
    'Test Owner',
    'Test Organization',
  )

  const admin = await addMemberToOrganization(organization.id, 'admin', 'Test Admin')

  return {
    owner: { user, organizationId: organization.id },
    admin: { user: admin.user as AuthenticatedUser },
  }
}

async function createMemberTestData(): Promise<MemberSetupResult> {
  await resetEmulatorState()

  const { user, organization } = await createOwnerWithOrganization(
    'Test Owner',
    'Test Organization',
  )

  const member = await addMemberToOrganization(organization.id, 'member', 'Test Member')

  return {
    owner: { user, organizationId: organization.id },
    member: { user: member.user as AuthenticatedUser },
  }
}

// =============================================================================
// Assertion Helpers
// =============================================================================

async function expectHeadingVisible(page: Page): Promise<void> {
  await expect(page.getByRole('heading', { name: UI_PATTERNS.TEAM_HEADING })).toBeVisible({
    timeout: TIMEOUTS.PAGE_LOAD_MS,
  })
}

async function expectOwnerBadgeVisible(page: Page): Promise<void> {
  await expect(page.getByText(UI_PATTERNS.OWNER_BADGE)).toBeVisible({
    timeout: TIMEOUTS.PAGE_LOAD_MS,
  })
}

async function expectInviteButtonVisible(page: Page): Promise<void> {
  await expect(page.getByRole('button', { name: UI_PATTERNS.INVITE_BUTTON })).toBeVisible({
    timeout: TIMEOUTS.PAGE_LOAD_MS,
  })
}

async function expectInviteButtonHidden(page: Page): Promise<void> {
  await expect(page.getByRole('button', { name: UI_PATTERNS.INVITE_BUTTON })).not.toBeVisible({
    timeout: TIMEOUTS.PAGE_LOAD_MS,
  })
}

async function expectLeaveButtonVisible(page: Page): Promise<void> {
  await expect(page.getByRole('button', { name: UI_PATTERNS.LEAVE_BUTTON })).toBeVisible({
    timeout: TIMEOUTS.PAGE_LOAD_MS,
  })
}

async function expectLeaveButtonHidden(page: Page): Promise<void> {
  await expect(page.getByRole('button', { name: UI_PATTERNS.LEAVE_BUTTON })).not.toBeVisible({
    timeout: TIMEOUTS.PAGE_LOAD_MS,
  })
}

// =============================================================================
// Owner Tests
// =============================================================================

test.describe('Team Page - Owner Role', () => {
  test('should display team heading after login', async ({ page }) => {
    const { user } = await createOwnerTestData()
    await navigateToTeamPageAs(page, user)

    await expectHeadingVisible(page)
  })

  test('should display owner badge', async ({ page }) => {
    const { user } = await createOwnerTestData()
    await navigateToTeamPageAs(page, user)

    await expectOwnerBadgeVisible(page)
  })

  test('should display invite generation button', async ({ page }) => {
    const { user } = await createOwnerTestData()
    await navigateToTeamPageAs(page, user)

    await expectInviteButtonVisible(page)
  })

  test('should NOT display leave organization button', async ({ page }) => {
    const { user } = await createOwnerTestData()
    await navigateToTeamPageAs(page, user)

    await expectLeaveButtonHidden(page)
  })
})

// =============================================================================
// Admin Tests
// =============================================================================

test.describe('Team Page - Admin Role', () => {
  test('should display invite generation button', async ({ page }) => {
    const { admin } = await createAdminTestData()
    await navigateToTeamPageAs(page, admin.user)

    await expectInviteButtonVisible(page)
  })

  test('should display leave organization button', async ({ page }) => {
    const { admin } = await createAdminTestData()
    await navigateToTeamPageAs(page, admin.user)

    await expectLeaveButtonVisible(page)
  })
})

// =============================================================================
// Member Tests
// =============================================================================

test.describe('Team Page - Member Role', () => {
  test('should NOT display invite generation button', async ({ page }) => {
    const { member } = await createMemberTestData()
    await navigateToTeamPageAs(page, member.user)

    await expectInviteButtonHidden(page)
  })

  test('should display leave organization button', async ({ page }) => {
    const { member } = await createMemberTestData()
    await navigateToTeamPageAs(page, member.user)

    await expectLeaveButtonVisible(page)
  })
})

// =============================================================================
// Route Protection Tests
// =============================================================================

test.describe('Team Page - Route Protection', () => {
  test('should redirect unauthenticated user to login', async ({ page }) => {
    await resetEmulatorState()

    await page.goto(ROUTES.TEAM_PAGE)
    await page.waitForURL(ROUTES.AUTH_PATTERN)
  })
})

export { expect }
