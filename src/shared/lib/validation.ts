/**
 * Validation utilities following Single Responsibility Principle
 * Each validator is a pure function that returns an error message or empty string
 */

export type ValidationRule = (value: string) => string

/**
 * Email validation
 */
export const validateEmail = (email: string): string => {
  if (!email.trim()) {
    return 'Email é obrigatório'
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return 'Email inválido'
  }

  return ''
}

/**
 * Password validation
 */
export const validatePassword = (password: string): string => {
  if (!password) {
    return 'Senha é obrigatória'
  }

  if (password.length < 6) {
    return 'Senha deve ter pelo menos 6 caracteres'
  }

  return ''
}

/**
 * Password confirmation validation
 */
export const validatePasswordConfirm = (password: string, confirmPassword: string): string => {
  if (!confirmPassword) {
    return 'Confirme sua senha'
  }

  if (password !== confirmPassword) {
    return 'As senhas não coincidem'
  }

  return ''
}

/**
 * Generic required field validation
 */
export const validateRequired = (value: string, fieldName: string): string => {
  if (!value.trim()) {
    return `${fieldName} é obrigatório`
  }
  return ''
}
