/**
 * Firebase Emulator utilities for E2E testing
 * Creates and manages test users via Firebase Auth Emulator REST API
 */

const EMULATOR_AUTH_URL = 'http://localhost:9099'
const FIRESTORE_URL = 'http://localhost:8080'
const PROJECT_ID = 'demo-projeto-estudos'

export interface TestUser {
  email: string
  password: string
  displayName: string
  uid?: string
}

export interface TestOrganization {
  id: string
  name: string
  ownerId: string
}

export interface TestMember {
  id: string
  organizationId: string
  userId: string
  role: 'owner' | 'admin' | 'member'
}

/**
 * Creates a user in the Firebase Auth Emulator
 */
export async function createTestUser(user: TestUser): Promise<TestUser & { uid: string }> {
  const response = await fetch(
    `${EMULATOR_AUTH_URL}/identitytoolkit.googleapis.com/v1/accounts:signUp?key=fake-api-key`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: user.email,
        password: user.password,
        displayName: user.displayName,
        returnSecureToken: true,
      }),
    },
  )

  if (!response.ok) {
    const error = await response.json()
    throw new Error(`Failed to create test user: ${JSON.stringify(error)}`)
  }

  const data = await response.json()
  return {
    ...user,
    uid: data.localId,
  }
}

/**
 * Signs in a user via Firebase Auth Emulator and returns the ID token
 */
export async function signInTestUser(email: string, password: string): Promise<string> {
  const response = await fetch(
    `${EMULATOR_AUTH_URL}/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=fake-api-key`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        password,
        returnSecureToken: true,
      }),
    },
  )

  if (!response.ok) {
    const error = await response.json()
    throw new Error(`Failed to sign in test user: ${JSON.stringify(error)}`)
  }

  const data = await response.json()
  return data.idToken
}

/**
 * Clears all users from the Firebase Auth Emulator
 */
export async function clearAuthEmulator(): Promise<void> {
  await fetch(`${EMULATOR_AUTH_URL}/emulator/v1/projects/${PROJECT_ID}/accounts`, {
    method: 'DELETE',
  })
}

/**
 * Clears all data from Firebase Firestore Emulator
 */
export async function clearFirestoreEmulator(): Promise<void> {
  await fetch(
    `${FIRESTORE_URL}/emulator/v1/projects/${PROJECT_ID}/databases/(default)/documents`,
    {
      method: 'DELETE',
    },
  )
}

/**
 * Generates a unique test email
 */
export function generateTestEmail(): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(7)
  return `test-${timestamp}-${random}@example.com`
}

/**
 * Default test user factory
 */
export function createDefaultTestUser(): TestUser {
  return {
    email: generateTestEmail(),
    password: 'Test@123456',
    displayName: 'Test User',
  }
}

/**
 * Creates a user profile in Firestore (like the app does after login)
 */
export async function createUserProfile(
  uid: string,
  email: string,
  displayName: string,
  hasCompletedOnboarding: boolean = true
): Promise<void> {
  const now = new Date().toISOString()
  
  await fetch(
    `${FIRESTORE_URL}/v1/projects/${PROJECT_ID}/databases/(default)/documents/users?documentId=${uid}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fields: {
          email: { stringValue: email },
          displayName: { stringValue: displayName },
          photoURL: { nullValue: null },
          hasCompletedOnboarding: { booleanValue: hasCompletedOnboarding },
          createdAt: { timestampValue: now },
          updatedAt: { timestampValue: now },
        },
      }),
    },
  )
}

/**
 * Creates an organization in Firestore
 */
export async function createOrganization(
  name: string,
  ownerId: string
): Promise<TestOrganization> {
  const now = new Date().toISOString()
  const orgId = `org-${Date.now()}-${Math.random().toString(36).substring(7)}`
  
  await fetch(
    `${FIRESTORE_URL}/v1/projects/${PROJECT_ID}/databases/(default)/documents/organizations?documentId=${orgId}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fields: {
          name: { stringValue: name },
          ownerId: { stringValue: ownerId },
          createdAt: { timestampValue: now },
          updatedAt: { timestampValue: now },
        },
      }),
    },
  )

  return { id: orgId, name, ownerId }
}

/**
 * Creates a membership in Firestore
 */
export async function createMembership(
  organizationId: string,
  userId: string,
  role: 'owner' | 'admin' | 'member'
): Promise<TestMember> {
  const now = new Date().toISOString()
  const memberId = `${userId}_${organizationId}`
  
  await fetch(
    `${FIRESTORE_URL}/v1/projects/${PROJECT_ID}/databases/(default)/documents/organization_members?documentId=${memberId}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fields: {
          organizationId: { stringValue: organizationId },
          userId: { stringValue: userId },
          role: { stringValue: role },
          joinedAt: { timestampValue: now },
        },
      }),
    },
  )

  return { id: memberId, organizationId, userId, role }
}

/**
 * Creates a complete test setup: user + profile + organization + owner membership
 */
export async function createOwnerWithOrganization(
  userName: string = 'Owner User',
  orgName: string = 'Test Organization'
): Promise<{
  user: TestUser & { uid: string }
  organization: TestOrganization
  membership: TestMember
}> {
  // 1. Create auth user
  const user = await createTestUser({
    email: generateTestEmail(),
    password: 'Test@123456',
    displayName: userName,
  })

  // 2. Create user profile
  await createUserProfile(user.uid, user.email, user.displayName, true)

  // 3. Create organization
  const organization = await createOrganization(orgName, user.uid)

  // 4. Create owner membership
  const membership = await createMembership(organization.id, user.uid, 'owner')

  return { user, organization, membership }
}

/**
 * Adds a member to an existing organization
 */
export async function addMemberToOrganization(
  organizationId: string,
  role: 'admin' | 'member',
  userName: string = 'Team Member'
): Promise<{
  user: TestUser & { uid: string }
  membership: TestMember
}> {
  // 1. Create auth user
  const user = await createTestUser({
    email: generateTestEmail(),
    password: 'Test@123456',
    displayName: userName,
  })

  // 2. Create user profile
  await createUserProfile(user.uid, user.email, user.displayName, true)

  // 3. Create membership
  const membership = await createMembership(organizationId, user.uid, role)

  return { user, membership }
}

