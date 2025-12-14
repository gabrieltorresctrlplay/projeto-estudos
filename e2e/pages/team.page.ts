import type { Page } from '@playwright/test'

/**
 * Page Object Model para a página de Equipe (Team Members)
 */
export class TeamPage {
  readonly page: Page

  constructor(page: Page) {
    this.page = page
  }

  /**
   * Navegar para página de equipe
   */
  async goto(companyIndex: number = 0) {
    await this.page.goto(`/dashboard/${companyIndex}/team`)
  }

  /**
   * Título da página
   */
  get title() {
    return this.page.getByRole('heading', { name: /equipe/i })
  }

  /**
   * Botão de gerar convite
   */
  get inviteButton() {
    return this.page.getByRole('button', { name: /gerar convite/i })
  }

  /**
   * Botão de sair da empresa
   */
  get leaveButton() {
    return this.page.getByRole('button', { name: /sair da empresa/i })
  }

  /**
   * Card de membros ativos
   */
  get membersCard() {
    return this.page.getByText(/membros ativos/i)
  }

  /**
   * Card de convites pendentes
   */
  get pendingInvitesCard() {
    return this.page.getByText(/convites pendentes/i)
  }

  /**
   * Contador de membros
   */
  get memberCount() {
    return this.page.getByText(/\d+ membro\(s\)/)
  }

  /**
   * Badge de Proprietário
   */
  get ownerBadge() {
    return this.page.getByText(/proprietário/i)
  }

  /**
   * Badge de Admin
   */
  get adminBadge() {
    return this.page.getByText(/admin/i).first()
  }

  /**
   * Badge de Membro
   */
  get memberBadge() {
    return this.page.getByText(/^membro$/i)
  }

  /**
   * Dialog de convite
   */
  get inviteDialog() {
    return this.page.getByRole('dialog')
  }

  /**
   * Verificar se página carregou
   */
  async isLoaded() {
    await this.page.waitForLoadState('networkidle')
    return this.title.isVisible()
  }

  /**
   * Abrir dialog de convite
   */
  async openInviteDialog() {
    await this.inviteButton.click()
    await this.inviteDialog.waitFor({ state: 'visible' })
  }

  /**
   * Verificar se é owner (tem acesso a convites mas não pode sair)
   */
  async isOwner(): Promise<boolean> {
    const canInvite = await this.inviteButton.isVisible().catch(() => false)
    const canLeave = await this.leaveButton.isVisible().catch(() => false)
    return canInvite && !canLeave
  }

  /**
   * Verificar se é admin (pode convidar e pode sair)
   */
  async isAdmin(): Promise<boolean> {
    const canInvite = await this.inviteButton.isVisible().catch(() => false)
    const canLeave = await this.leaveButton.isVisible().catch(() => false)
    return canInvite && canLeave
  }

  /**
   * Verificar se é membro comum (não pode convidar mas pode sair)
   */
  async isMember(): Promise<boolean> {
    const canInvite = await this.inviteButton.isVisible().catch(() => false)
    const canLeave = await this.leaveButton.isVisible().catch(() => false)
    return !canInvite && canLeave
  }
}
