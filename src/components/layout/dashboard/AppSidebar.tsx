import LogoSvg from '@/assets/logo.svg?react'
import { useOrganizationContext } from '@/contexts/OrganizationContext'
import {
  BarChart3,
  ChevronsUpDown,
  Laptop,
  LayoutDashboard,
  List,
  LogOut,
  Moon,
  Package,
  ShoppingCart,
  Sun,
  User as UserIcon,
  Users,
} from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'

import { authService } from '@/lib/auth'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'
import { useTheme } from '@/components/theme/theme-provider'

export function AppSidebar() {
  const user = authService.getCurrentUser()
  const navigate = useNavigate()
  const { setTheme } = useTheme()
  const { state } = useSidebar()
  const { memberships, currentOrganization } = useOrganizationContext()

  // Calculate dashboard URL based on current organization
  const currentOrgIndex = currentOrganization
    ? memberships.findIndex((m) => m.organizationId === currentOrganization.id)
    : 0
  const dashboardUrl = currentOrgIndex !== -1 ? `/dashboard/${currentOrgIndex}` : '/dashboard/0'

  const handleLogout = async () => {
    await authService.signOut()
    navigate('/login')
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              asChild
            >
              <Link to={dashboardUrl}>
                <div className="bg-primary text-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <LogoSvg className="h-5 w-5 fill-current" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">NerfasInc</span>
                  <span className="truncate text-xs">Enterprise</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  tooltip="Dashboard"
                  isActive={
                    window.location.pathname === dashboardUrl ||
                    window.location.pathname === '/dashboard'
                  }
                >
                  <Link to={dashboardUrl}>
                    <LayoutDashboard />
                    <span>Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  tooltip="Equipe"
                  isActive={window.location.pathname.includes('/team')}
                >
                  <Link to={`${dashboardUrl}/team`}>
                    <Users />
                    <span>Equipe</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  tooltip="Fila"
                  isActive={window.location.pathname.includes('/fila')}
                >
                  <Link to={`${dashboardUrl}/fila`}>
                    <List />
                    <span>Fila</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  tooltip="Estoque"
                  isActive={window.location.pathname.includes('/estoque')}
                >
                  <Link to={`${dashboardUrl}/estoque`}>
                    <Package />
                    <span>Estoque</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  tooltip="Pedidos"
                  isActive={window.location.pathname.includes('/pedidos')}
                >
                  <Link to={`${dashboardUrl}/pedidos`}>
                    <ShoppingCart />
                    <span>Pedidos</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  tooltip="Estatísticas"
                  isActive={window.location.pathname.includes('/estatisticas')}
                >
                  <Link to={`${dashboardUrl}/estatisticas`}>
                    <BarChart3 />
                    <span>Estatísticas</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  tooltip="Perfil"
                  isActive={window.location.pathname.includes('/perfil')}
                >
                  <Link to={`${dashboardUrl}/perfil`}>
                    <UserIcon />
                    <span>Perfil</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <Dialog>
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton
                    size="lg"
                    className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                  >
                    <Avatar className="h-8 w-8 rounded-lg">
                      <AvatarImage
                        src={user?.photoURL || undefined}
                        alt={user?.displayName || 'User'}
                      />
                      <AvatarFallback className="rounded-lg">
                        {user?.email?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">
                        {user?.displayName || 'Usuário'}
                      </span>
                      <span className="truncate text-xs">{user?.email}</span>
                    </div>
                    <ChevronsUpDown className="ml-auto size-4" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                  side={state === 'collapsed' ? 'right' : 'bottom'}
                  align="end"
                  sideOffset={4}
                >
                  <DropdownMenuLabel className="p-0 font-normal">
                    <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                      <Avatar className="h-8 w-8 rounded-lg">
                        <AvatarImage
                          src={user?.photoURL || undefined}
                          alt={user?.displayName || 'User'}
                        />
                        <AvatarFallback className="rounded-lg">
                          {user?.email?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="grid flex-1 text-left text-sm leading-tight">
                        <span className="truncate font-semibold">
                          {user?.displayName || 'Usuário'}
                        </span>
                        <span className="truncate text-xs">{user?.email}</span>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <UserIcon className="mr-2 h-4 w-4" />
                    Ver Perfil
                  </DropdownMenuItem>
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                      <Sun className="mr-2 h-4 w-4 dark:hidden" />
                      <Moon className="mr-2 hidden h-4 w-4 dark:block" />
                      Tema
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent>
                      <DropdownMenuItem
                        onSelect={(e) => {
                          e.preventDefault()
                          setTheme('light')
                        }}
                      >
                        <Sun className="mr-2 h-4 w-4" />
                        Claro
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onSelect={(e) => {
                          e.preventDefault()
                          setTheme('dark')
                        }}
                      >
                        <Moon className="mr-2 h-4 w-4" />
                        Escuro
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onSelect={(e) => {
                          e.preventDefault()
                          setTheme('system')
                        }}
                      >
                        <Laptop className="mr-2 h-4 w-4" />
                        Sistema
                      </DropdownMenuItem>
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                  <DropdownMenuSeparator />
                  <DialogTrigger asChild>
                    <DropdownMenuItem className="text-destructive focus:text-destructive">
                      <LogOut className="mr-2 h-4 w-4" />
                      Sair
                    </DropdownMenuItem>
                  </DialogTrigger>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>

          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Deseja sair?</DialogTitle>
              <DialogDescription>
                Você precisará fazer login novamente para acessar sua conta.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2 sm:justify-end">
              <DialogClose asChild>
                <Button
                  type="button"
                  variant="ghost"
                >
                  Cancelar
                </Button>
              </DialogClose>
              <Button
                type="button"
                variant="destructive"
                onClick={handleLogout}
              >
                Sair
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </SidebarFooter>
    </Sidebar>
  )
}
