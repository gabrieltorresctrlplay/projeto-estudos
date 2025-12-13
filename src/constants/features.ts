import type { Feature } from '@/types'
import { BarChart3, ShieldCheck, Zap } from 'lucide-react'

/**
 * Features displayed on the home page
 */
export const FEATURES: Feature[] = [
  {
    icon: BarChart3,
    title: 'Analytics em Tempo Real',
    description: 'Tome decisões baseadas em dados com dashboards intuitivos e precisos.',
  },
  {
    icon: ShieldCheck,
    title: 'Segurança Corporativa',
    description: 'Proteção de dados nível enterprise e conformidade total com LGPD.',
  },
  {
    icon: Zap,
    title: 'Automação Inteligente',
    description: 'Fluxos de trabalho automatizados para eliminar tarefas repetitivas.',
  },
]
