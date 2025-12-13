import type { NavLink } from '@/types'

/**
 * Navigation links for the top bar
 */
export const NAV_LINKS: NavLink[] = []

/**
 * Company information
 */
export const COMPANY = {
  name: 'NerfasInc',
  year: new Date().getFullYear(),
  url: 'https://projeto-estudos-b4fcf.web.app/',
} as const
