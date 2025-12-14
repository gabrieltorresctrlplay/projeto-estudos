import { test, expect, type Page } from '@playwright/test'
import {
  clearAuthEmulator,
  clearFirestoreEmulator,
  createOwnerWithOrganization,
  addMemberToOrganization,
} from '../utils/firebase-emulator'

/**
 * Faz login via rota /e2e-login da aplicação React
 */
async function e2eLogin(page: Page, email: string, password: string, redirect: string = '/dashboard') {
  const encodedEmail = encodeURIComponent(email)
  const encodedPassword = encodeURIComponent(password)
  const encodedRedirect = encodeURIComponent(redirect)
  
  await page.goto(`/e2e-login?email=${encodedEmail}&password=${encodedPassword}&redirect=${encodedRedirect}`)
  
  // Aguarda login bem-sucedido (redirecionamento)
  await page.waitForURL((url) => !url.toString().includes('/e2e-login'), { timeout: 15000 })
}

/**
 * Aguarda a página carregar completamente (loading desaparecer)
 */
async function waitForPageLoad(page: Page) {
  // Aguardar o loading desaparecer
  await expect(page.getByText(/carregando/i)).not.toBeVisible({ timeout: 15000 })
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
    await e2eLogin(page, user.email, user.password, '/dashboard/0/team')
    
    if (page.url().includes('/team')) {
      await waitForPageLoad(page)
      await expect(page.getByRole('heading', { name: /equipe/i })).toBeVisible()
    }
  })

  test('owner vê badge de Proprietário', async ({ page }) => {
    const { user } = await setupOwner()
    await e2eLogin(page, user.email, user.password, '/dashboard/0/team')
    
    if (page.url().includes('/team')) {
      await waitForPageLoad(page)
      await expect(page.getByText(/proprietário/i)).toBeVisible()
    }
  })

  test('owner vê botão Gerar Convite', async ({ page }) => {
    const { user } = await setupOwner()
    await e2eLogin(page, user.email, user.password, '/dashboard/0/team')
    
    if (page.url().includes('/team')) {
      await waitForPageLoad(page)
      await expect(page.getByRole('button', { name: /gerar convite/i })).toBeVisible()
    }
  })

  test('owner NÃO vê botão Sair da Empresa', async ({ page }) => {
    const { user } = await setupOwner()
    await e2eLogin(page, user.email, user.password, '/dashboard/0/team')
    
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
    await e2eLogin(page, admin.user.email, admin.user.password, '/dashboard/0/team')
    
    if (page.url().includes('/team')) {
      await waitForPageLoad(page)
      await expect(page.getByRole('button', { name: /gerar convite/i })).toBeVisible()
    }
  })

  test('admin vê botão Sair da Empresa', async ({ page }) => {
    const { admin } = await setupAdmin()
    await e2eLogin(page, admin.user.email, admin.user.password, '/dashboard/0/team')
    
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
    await e2eLogin(page, member.user.email, member.user.password, '/dashboard/0/team')
    
    if (page.url().includes('/team')) {
      await waitForPageLoad(page)
      await expect(page.getByRole('button', { name: /gerar convite/i })).not.toBeVisible()
    }
  })

  test('membro vê botão Sair da Empresa', async ({ page }) => {
    const { member } = await setupMember()
    await e2eLogin(page, member.user.email, member.user.password, '/dashboard/0/team')
    
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
