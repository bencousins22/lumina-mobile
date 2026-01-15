/**
 * Password Validation Utility
 * 
 * Validates passwords against security requirements and provides
 * strength feedback for user experience.
 */

export interface PasswordStrength {
  score: number // 0-4 (0=very weak, 4=very strong)
  feedback: string[]
  isValid: boolean
  strength: 'very weak' | 'weak' | 'fair' | 'good' | 'strong'
}

export interface PasswordRequirements {
  minLength: number
  requireUppercase: boolean
  requireLowercase: boolean
  requireNumbers: boolean
  requireSpecialChars: boolean
}

const DEFAULT_REQUIREMENTS: PasswordRequirements = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
}

/**
 * Validates a password against security requirements
 */
export function validatePassword(
  password: string,
  requirements: PasswordRequirements = DEFAULT_REQUIREMENTS
): PasswordStrength {
  const feedback: string[] = []
  let score = 0

  // Check length
  if (password.length >= requirements.minLength) {
    score++
  } else {
    feedback.push(`Must be at least ${requirements.minLength} characters`)
  }

  // Check for extra length
  if (password.length >= 12) {
    score += 0.5
  }

  // Check uppercase
  if (requirements.requireUppercase) {
    if (/[A-Z]/.test(password)) {
      score++
    } else {
      feedback.push('Must contain at least one uppercase letter (A-Z)')
    }
  }

  // Check lowercase
  if (requirements.requireLowercase) {
    if (/[a-z]/.test(password)) {
      score++
    } else {
      feedback.push('Must contain at least one lowercase letter (a-z)')
    }
  }

  // Check numbers
  if (requirements.requireNumbers) {
    if (/[0-9]/.test(password)) {
      score++
    } else {
      feedback.push('Must contain at least one number (0-9)')
    }
  }

  // Check special characters
  if (requirements.requireSpecialChars) {
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      score++
    } else {
      feedback.push('Must contain at least one special character')
    }
  }

  // Determine strength level
  let strength: PasswordStrength['strength']
  if (password.length < requirements.minLength) {
    strength = 'very weak'
  } else if (score <= 2) {
    strength = 'weak'
  } else if (score === 3) {
    strength = 'fair'
  } else if (score === 4) {
    strength = 'good'
  } else {
    strength = 'strong'
  }

  // Normalize score to 0-4 for progress bar and consistency
  const normalizedScore = Math.min(Math.floor(score), 4)

  // Password is valid if it meets all requirements (score >= 5 including length)
  const isValid = score >= 5 && feedback.length === 0

  return {
    score: normalizedScore,
    feedback,
    isValid,
    strength,
  }
}

/**
 * Check if password contains common patterns that should be avoided
 */
export function checkCommonPatterns(password: string): string[] {
  const warnings: string[] = []

  // Check for sequential characters
  if (/(?:abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz)/i.test(password)) {
    warnings.push('Avoid sequential characters (abc, 123, etc.)')
  }

  // Check for repeated characters
  if (/(.)\1{2,}/.test(password)) {
    warnings.push('Avoid repeated characters (aaa, 111, etc.)')
  }

  // Check for common words
  const commonWords = ['password', 'admin', 'user', 'lumina', '123456', 'qwerty']
  const lowerPassword = password.toLowerCase()
  for (const word of commonWords) {
    if (lowerPassword.includes(word)) {
      warnings.push(`Avoid common words like "${word}"`)
      break
    }
  }

  return warnings
}

/**
 * Get password strength color for UI display
 */
export function getStrengthColor(strength: PasswordStrength['strength']): string {
  switch (strength) {
    case 'very weak':
      return 'text-destructive'
    case 'weak':
      return 'text-orange-500'
    case 'fair':
      return 'text-yellow-500'
    case 'good':
      return 'text-blue-500'
    case 'strong':
      return 'text-green-500'
    default:
      return 'text-muted-foreground'
  }
}

/**
 * Get password strength progress percentage
 */
export function getStrengthProgress(score: number): number {
  return Math.round((score / 4) * 100)
}
