import LogoSvg from '@/assets/logo.svg?react'
import { useOrganizationContext } from '@/contexts/OrganizationContext'
import {
  BarChart3,
  ChevronsUpDown,
  Laptop,
  LayoutDashboard,
  List,
  LogOut,
  MessageSquare,
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
  useSidebar()
  const { memberships, currentOrganization } = useOrganizationContext()

  // Check if user is a visitor (no memberships)
  const isVisitor = memberships.length === 0

  // Calculate dashboard URL based on current organization
  const currentOrgIndex = currentOrganization
    ? memberships.findIndex((m) => m.organizationId === currentOrganization.id)
    : 0
  const dashboardUrl = currentOrgIndex !== -1 ? `/dashboard/${currentOrgIndex}` : '/dashboard'

  const handleLogout = async () => {
    await authService.signOut()
    navigate('/auth')
  }

  // Full menu items for members
  const memberMenuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: dashboardUrl, tooltip: 'Dashboard' },
    { icon: Users, label: 'Equipe', path: `${dashboardUrl}/team`, tooltip: 'Equipe' },
    { icon: List, label: 'Fila', path: `${dashboardUrl}/fila`, tooltip: 'Fila' },
    { icon: Package, label: 'Estoque', path: `${dashboardUrl}/estoque`, tooltip: 'Estoque' },
    { icon: ShoppingCart, label: 'Pedidos', path: `${dashboardUrl}/pedidos`, tooltip: 'Pedidos' },
    {
      icon: BarChart3,
      label: 'Estatísticas',
      path: `${dashboardUrl}/estatisticas`,
      tooltip: 'Estatísticas',
    },
    { icon: MessageSquare, label: 'Chat Lab', path: '/dashboard/chat-lab', tooltip: 'Chat Lab' },
    { icon: UserIcon, label: 'Perfil', path: `${dashboardUrl}/perfil`, tooltip: 'Perfil' },
  ]

  // Minimal menu items for visitors
  const visitorMenuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard', tooltip: 'Dashboard' },
    { icon: UserIcon, label: 'Perfil', path: '/dashboard/perfil', tooltip: 'Perfil' },
  ]

  const menuItems = isVisitor ? visitorMenuItems : memberMenuItems

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
                  <span className="truncate text-xs">{isVisitor ? 'Visitante' : 'Enterprise'}</span>
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
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton
                    asChild
                    tooltip={item.tooltip}
                    isActive={
                      window.location.pathname === item.path ||
                      window.location.pathname.includes(item.path.split('/').pop() || '')
                    }
                  >
                    <Link to={item.path}>
                      <item.icon />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
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
                  side="right"
                  align="end"
                  sideOffset={12}
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
                  <DropdownMenuItem
                    onClick={() =>
                      navigate(isVisitor ? '/dashboard/perfil' : `${dashboardUrl}/perfil`)
                    }
                  >
                    <UserIcon className="mr-2 h-4 w-4" />
                    Ver Perfil
                  </DropdownMenuItem>
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                      <Sun className="mr-2 h-4 w-4 dark:hidden" />
                      <Moon className="mr-2 hidden h-4 w-4 dark:block" />
                      Tema
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent alignOffset={-37}>
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
