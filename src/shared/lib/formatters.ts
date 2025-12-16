/**
 * Formatters - Funções de formatação centralizadas
 */

/**
 * Formata um valor numérico como moeda brasileira (BRL)
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

/**
 * Formata uma data como tempo relativo (ex: "há 5 minutos", "amanhã")
 */
export function formatRelativeTime(date: Date): string {
  const rtf = new Intl.RelativeTimeFormat('pt-BR', { numeric: 'auto' })
  const now = new Date()
  const diffInSeconds = (date.getTime() - now.getTime()) / 1000

  if (Math.abs(diffInSeconds) < 60) return rtf.format(Math.round(diffInSeconds), 'second')
  if (Math.abs(diffInSeconds) < 3600) return rtf.format(Math.round(diffInSeconds / 60), 'minute')
  if (Math.abs(diffInSeconds) < 86400) return rtf.format(Math.round(diffInSeconds / 3600), 'hour')
  return rtf.format(Math.round(diffInSeconds / 86400), 'day')
}

/**
 * Copia texto para a área de transferência
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}
