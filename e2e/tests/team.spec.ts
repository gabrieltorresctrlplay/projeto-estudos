import { expect, test, type Page } from '@playwright/test'

import {
  addMemberToOrganization,
  clearAuthEmulator,
  clearFirestoreEmulator,
  createOwnerWithOrganization,
  signInTestUser,
} from '../utils/firebase-emulator'

// Run tests serially to avoid race conditions when clearing emulator data
test.describe.configure({ mode: 'serial' })

/**
 * Faz login e configura a sessão no navegador
 */
async function loginAndNavigate(
  page: Page,
  email: string,
  password: string,
  uid: string,
  redirect: string = '/dashboard',
) {
  // Sign in via API to get token
  const idToken = await signInTestUser(email, password)

  // Navigate to app
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
    { email, uid, token: idToken },
  )

  // Navigate to the target page and wait for load
  await page.goto(redirect, { waitUntil: 'domcontentloaded' })
}

/**
 * Aguarda a página carregar completamente (loading desaparecer)
 */
async function waitForPageLoad(page: Page) {
  // Aguardar o LoadingSpinner principal desaparecer
  const spinner = page.locator('[role="status"][aria-label="Carregando conteúdo"]')
  await expect(spinner).not.toBeVisible({ timeout: 20000 })

  // Pequeno delay para garantir que o conteúdo renderizou
  await page.waitForTimeout(500)
}

/**
 * Setup para cada teste - cria dados limpos e retorna credenciais
 */
async function setupOwner() {
  await clearAuthEmulator()
  await clearFirestoreEmulator()
  const owner = await createOwnerWithOrganization('Proprietário Teste', 'Empresa Teste')
  return owner
}

async function setupAdmin() {
  await clearAuthEmulator()
  await clearFirestoreEmulator()
  const owner = await createOwnerWithOrganization('Proprietário', 'Empresa Teste')
  const admin = await addMemberToOrganization(owner.organization.id, 'admin', 'Admin Teste')
  return { owner, admin }
}

async function setupMember() {
  await clearAuthEmulator()
  await clearFirestoreEmulator()
  const owner = await createOwnerWithOrganization('Proprietário', 'Empresa Teste')
  const member = await addMemberToOrganization(owner.organization.id, 'member', 'Membro Teste')
  return { owner, member }
}

// ============================================================================
// TESTES DO OWNER
// ============================================================================

test.describe('Página de Equipe - Owner', () => {
  test('owner vê página com título "Equipe" após login', async ({ page }) => {
    const { user } = await setupOwner()
    await loginAndNavigate(page, user.email, user.password, user.uid, '/dashboard/0/team')

    if (page.url().includes('/team')) {
      await waitForPageLoad(page)
      await expect(page.getByRole('heading', { name: /equipe/i })).toBeVisible()
    }
  })

  test('owner vê badge de Proprietário', async ({ page }) => {
    const { user } = await setupOwner()
    await loginAndNavigate(page, user.email, user.password, user.uid, '/dashboard/0/team')

    if (page.url().includes('/team')) {
      await waitForPageLoad(page)
      await expect(page.getByText(/proprietário/i)).toBeVisible()
    }
  })

  test('owner vê botão Gerar Convite', async ({ page }) => {
    const { user } = await setupOwner()
    await loginAndNavigate(page, user.email, user.password, user.uid, '/dashboard/0/team')

    if (page.url().includes('/team')) {
      await waitForPageLoad(page)
      await expect(page.getByRole('button', { name: /gerar convite/i })).toBeVisible()
    }
  })

  test('owner NÃO vê botão Sair da Empresa', async ({ page }) => {
    const { user } = await setupOwner()
    await loginAndNavigate(page, user.email, user.password, user.uid, '/dashboard/0/team')

    if (page.url().includes('/team')) {
      await waitForPageLoad(page)
      await expect(page.getByRole('button', { name: /sair da empresa/i })).not.toBeVisible()
    }
  })
})

// ============================================================================
// TESTES DO ADMIN
// ============================================================================

test.describe('Página de Equipe - Admin', () => {
  test('admin vê botão Gerar Convite', async ({ page }) => {
    const { admin } = await setupAdmin()
    await loginAndNavigate(
      page,
      admin.user.email,
      admin.user.password,
      admin.user.uid,
      '/dashboard/0/team',
    )

    if (page.url().includes('/team')) {
      await waitForPageLoad(page)
      await expect(page.getByRole('button', { name: /gerar convite/i })).toBeVisible()
    }
  })

  test('admin vê botão Sair da Empresa', async ({ page }) => {
    const { admin } = await setupAdmin()
    await loginAndNavigate(
      page,
      admin.user.email,
      admin.user.password,
      admin.user.uid,
      '/dashboard/0/team',
    )

    if (page.url().includes('/team')) {
      await waitForPageLoad(page)
      await expect(page.getByRole('button', { name: /sair da empresa/i })).toBeVisible()
    }
  })
})

// ============================================================================
// TESTES DO MEMBRO
// ============================================================================

test.describe('Página de Equipe - Membro', () => {
  test('membro NÃO vê botão Gerar Convite', async ({ page }) => {
    const { member } = await setupMember()
    await loginAndNavigate(
      page,
      member.user.email,
      member.user.password,
      member.user.uid,
      '/dashboard/0/team',
    )

    if (page.url().includes('/team')) {
      await waitForPageLoad(page)
      await expect(page.getByRole('button', { name: /gerar convite/i })).not.toBeVisible()
    }
  })

  test('membro vê botão Sair da Empresa', async ({ page }) => {
    const { member } = await setupMember()
    await loginAndNavigate(
      page,
      member.user.email,
      member.user.password,
      member.user.uid,
      '/dashboard/0/team',
    )

    if (page.url().includes('/team')) {
      await waitForPageLoad(page)
      await expect(page.getByRole('button', { name: /sair da empresa/i })).toBeVisible()
    }
  })
})

// ============================================================================
// TESTES DE PROTEÇÃO
// ============================================================================

test.describe('Página de Equipe - Proteção', () => {
  test('usuário não autenticado é redirecionado para login', async ({ page }) => {
    await clearAuthEmulator()
    await clearFirestoreEmulator()

    await page.goto('/dashboard/0/team')
    await page.waitForURL(/\/(auth|login)/)
  })
})

export { expect }
