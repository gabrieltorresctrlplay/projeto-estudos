import { Badge } from '@/shared/components/ui/badge'
import type { MemberRole } from '@/shared/types'
import { Crown, Shield, User } from 'lucide-react'

interface RoleBadgeProps {
  role: MemberRole | string
  showIcon?: boolean
  className?: string
}

const roleConfig = {
  owner: {
    label: 'Proprietário',
    variant: 'default' as const,
    Icon: Crown,
  },
  admin: {
    label: 'Admin',
    variant: 'secondary' as const,
    Icon: Shield,
  },
  member: {
    label: 'Membro',
    variant: 'outline' as const,
    Icon: User,
  },
} as const

/**
 * Badge reutilizável para exibir o cargo/role de um membro
 */
export function RoleBadge({ role, showIcon = true, className }: RoleBadgeProps) {
  const config = roleConfig[role as keyof typeof roleConfig] || roleConfig.member
  const { label, variant, Icon } = config

  return (
    <Badge
      variant={variant}
      className={className}
    >
      {showIcon && <Icon className="mr-1 h-3 w-3" />}
      {label}
    </Badge>
  )
}
