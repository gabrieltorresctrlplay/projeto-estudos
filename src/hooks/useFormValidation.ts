import { useCallback, useState } from 'react'

export interface FieldErrors {
  [key: string]: string
}

export interface UseFormValidationReturn {
  errors: FieldErrors
  validateField: (field: string, value: string, validator: (value: string) => string) => void
  validateAllFields: (validations: { [key: string]: () => string }) => boolean
  clearError: (field: string) => void
  clearAllErrors: () => void
  hasErrors: () => boolean
}

/**
 * Custom hook for form validation
 * Manages validation state and provides utilities
 */
export function useFormValidation(): UseFormValidationReturn {
  const [errors, setErrors] = useState<FieldErrors>({})

  /**
   * Validate a single field (useful for onBlur)
   */
  const validateField = useCallback(
    (field: string, value: string, validator: (value: string) => string) => {
      const error = validator(value)
      setErrors((prev) => ({
        ...prev,
        [field]: error,
      }))
    },
    [],
  )

  /**
   * Validate all fields at once (useful for onSubmit)
   * Returns true if valid, false if has errors
   */
  const validateAllFields = useCallback((validations: { [key: string]: () => string }): boolean => {
    const newErrors: FieldErrors = {}
    let isValid = true

    Object.entries(validations).forEach(([field, validator]) => {
      const error = validator()
      newErrors[field] = error
      if (error) isValid = false
    })

    setErrors(newErrors)
    return isValid
  }, [])

  /**
   * Clear error for a specific field
   */
  const clearError = useCallback((field: string) => {
    setErrors((prev) => ({
      ...prev,
      [field]: '',
    }))
  }, [])

  /**
   * Clear all errors
   */
  const clearAllErrors = useCallback(() => {
    setErrors({})
  }, [])

  /**
   * Check if there are any errors
   */
  const hasErrors = useCallback((): boolean => {
    return Object.values(errors).some((error) => error !== '')
  }, [errors])

  return {
    errors,
    validateField,
    validateAllFields,
    clearError,
    clearAllErrors,
    hasErrors,
  }
}
