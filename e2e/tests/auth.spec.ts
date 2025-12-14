import { expect, test } from '../fixtures/auth.fixture'
import { AuthPage } from '../pages/auth.page'

test.describe('Fluxo de Autenticação', () => {
  test('usuário não autenticado deve ver página de login ao acessar rota protegida', async ({
    page,
  }) => {
    // Tentar acessar rota protegida do dashboard
    await page.goto('/dashboard')

    // Deve ser redirecionado para login
    await page.waitForURL(/\/(auth|login)/)

    // Verificar se elementos da página de auth estão visíveis
    const authPage = new AuthPage(page)
    await expect(authPage.googleSignInButton).toBeVisible()
  })

  test('página inicial deve ser acessível sem autenticação', async ({ page }) => {
    await page.goto('/')

    // Página inicial deve carregar sem redirect
    await expect(page).toHaveURL('/')

    // Deve ver a seção hero
    await expect(page.locator('section[aria-labelledby="hero-title"]')).toBeVisible()
  })

  // TODO: Este teste requer integração mais profunda com Firebase Auth Emulator
  // A injeção via localStorage não sincroniza corretamente com onAuthStateChanged no PublicOnlyRoute
  // Para corrigir, considerar usar Firebase Admin SDK para criar tokens de auth
  test.skip('página de auth deve redirecionar usuário autenticado para dashboard', async ({
    authenticatedPage,
  }) => {
    const page = authenticatedPage

    // Tentar acessar página de auth enquanto logado
    await page.goto('/auth')

    // Aguardar possível redirect ou permanência na página
    await page.waitForLoadState('networkidle')

    // Deve redirecionar ou mostrar loading, não permanecer no formulário de auth
    const currentUrl = page.url()
    const isOnAuth = currentUrl.includes('/auth')

    if (isOnAuth) {
      await page.waitForTimeout(2000)
      const newUrl = page.url()
      expect(newUrl).not.toContain('/auth')
    }
  })

  test('usuário autenticado deve acessar dashboard', async ({ authenticatedPage }) => {
    const page = authenticatedPage

    // Navegar para dashboard
    await page.goto('/dashboard')

    // Deve permanecer no dashboard (pode ver onboarding se for primeira vez)
    await page.waitForURL(/\/(dashboard|onboarding)/)
  })

  test('logout deve redirecionar para home', async ({ authenticatedPage }) => {
    const page = authenticatedPage

    // Navegar para dashboard primeiro
    await page.goto('/dashboard')
    await page.waitForURL(/\/(dashboard|onboarding)/)

    // Limpar estado de auth (simulando logout)
    await page.evaluate(() => {
      localStorage.clear()
      sessionStorage.clear()
    })

    // Recarregar e tentar acessar rota protegida
    await page.goto('/dashboard')

    // Deve ser redirecionado para login
    await page.waitForURL(/\/(auth|login)/)
  })
})

test.describe('Proteção de Rotas', () => {
  test('rota de onboarding deve requerer autenticação', async ({ page }) => {
    await page.goto('/onboarding')

    // Deve redirecionar para login
    await page.waitForURL(/\/(auth|login)/)
  })

  test('rota de equipe deve requerer autenticação', async ({ page }) => {
    await page.goto('/dashboard/0/team')

    // Deve redirecionar para login
    await page.waitForURL(/\/(auth|login)/)
  })

  test('rota de fila deve requerer autenticação', async ({ page }) => {
    await page.goto('/dashboard/0/fila')

    // Deve redirecionar para login
    await page.waitForURL(/\/(auth|login)/)
  })

  test('rota de perfil deve requerer autenticação', async ({ page }) => {
    await page.goto('/dashboard/perfil')

    // Deve redirecionar para login
    await page.waitForURL(/\/(auth|login)/)
  })
})
